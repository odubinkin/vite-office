/** @fileoverview Cloneable transport of loaded native Calc change actions. */
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { Date } from "../../../../tools/source/datetime/tdate";
import { Time } from "../../../../tools/source/datetime/ttime";
import { ScAddress } from "../../../inc/address";
import { ScBigRange } from "../../../inc/bigrange";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { CellType } from "../../../inc/global";
import { ScMatrixMode } from "../../../source/core/data/formulacell";
import {
  ScChangeActionContent,
  ScChangeActionIns,
  ScChangeActionDel,
  ScChangeActionMove,
  ScChangeActionState,
  ScChangeActionType,
  ScChangeTrack,
  type ScChangeActionInfo,
  type ScChangeActionDeletionType,
  type ScChangeActionInsertionType,
} from "../../../source/core/tool/chgtrack";
import {
  createPreviousCell,
  createPreviousFormulaCell,
  ScMyCellInfo,
} from "../../../source/filter/xml/XMLChangeTrackingImportHelper";
import type { ScXMLImport } from "../../../source/filter/xml/xmlimprt";
import type {
  CellTextParagraph,
  CellTextStylePool,
} from "../../../source/filter/xml/xmlexprt.celltext";

/** Cloneable historical change cell, with null for an empty cell. */
type ChangeCell =
  | number
  | string
  | null
  | { readonly kind: "edit"; readonly paragraphs: CellTextParagraph[] }
  | {
      readonly kind: "formula";
      readonly position: readonly [number, number, number];
      readonly source: string;
      readonly matrix: ScMatrixMode;
      readonly columns: number;
      readonly rows: number;
      readonly cache?: number | string;
    };

/** Common loaded action attributes before connecting links. */
interface ActionRecord {
  readonly id: number;
  readonly rejecting: number;
  readonly state: ScChangeActionState;
  readonly range: ReturnType<ScBigRange["GetVars"]>;
  readonly user: string;
  readonly date: number;
  readonly time: bigint;
  readonly comment: string;
  readonly dependencies: readonly number[];
  readonly deleted?: readonly number[];
}

/** Loaded cell content and its historical snapshots. */
interface ContentActionRecord extends ActionRecord {
  readonly type?: ScChangeActionType.SC_CAT_CONTENT;
  readonly oldCell: ChangeCell;
  readonly oldValue: string;
  readonly newCell?: ChangeCell;
  readonly newValue?: string;
  readonly previous: number;
}

/** Loaded insertion with the original whole-axis range. */
interface InsertActionRecord extends ActionRecord {
  readonly type: ScChangeActionInsertionType;
  readonly endOfList?: boolean;
}

/** Loaded movement with its separate source range. */
interface MoveActionRecord extends ActionRecord {
  readonly type: ScChangeActionType.SC_CAT_MOVE;
  readonly from: ReturnType<ScBigRange["GetVars"]>;
}

/** Loaded deletion with original multi-deletion and cutoff data. */
interface DeleteActionRecord extends ActionRecord {
  readonly type: ScChangeActionDeletionType;
  readonly offset: number;
  readonly insertCutOff?: readonly [id: number, count: number];
  readonly moveCutOffs?: readonly (readonly [id: number, from: number, to: number])[];
}

/** Represented native action records accepted by the Worker transport. */
type ChangeActionRecord =
  ContentActionRecord | InsertActionRecord | MoveActionRecord | DeleteActionRecord;

/** Includes older content records without an explicit type. @param record - Loaded wire action. @returns Whether the action carries cell snapshots. */
function isContentRecord(record: ChangeActionRecord): record is ContentActionRecord {
  return record.type === undefined || record.type === ScChangeActionType.SC_CAT_CONTENT;
}

/** Native generated cell stored independently of ordinary actions. */
interface GeneratedRecord {
  readonly id: number;
  readonly range: ReturnType<ScBigRange["GetVars"]>;
  readonly value: ChangeCell;
  readonly input: string;
}

/** Detached workbook change track. */
export interface CalcChangeTrackRecord {
  readonly actions: readonly ChangeActionRecord[];
  readonly generated?: readonly GeneratedRecord[];
  readonly protection: Uint8Array;
  readonly max: number;
  readonly lastSaved: number;
}

/** Copies the actual cell snapshot into the Worker document. @param cell - Native cell. @param textStyles - Workbook styles. @returns Change cell record. */
function encodeCell(cell: ScCellValue, textStyles: CellTextStylePool): ChangeCell {
  switch (cell.getType()) {
    case CellType.CELLTYPE_NONE:
      return null;
    case CellType.CELLTYPE_VALUE:
      return cell.getDouble();
    case CellType.CELLTYPE_STRING: {
      const shared = cell.getSharedString();
      return shared ? text(shared.getString()) : "";
    }
    case CellType.CELLTYPE_EDIT: {
      const edit = cell.getEditText();
      return edit ? { kind: "edit", paragraphs: textStyles.collect(edit) } : null;
    }
    case CellType.CELLTYPE_FORMULA: {
      const formula = cell.getFormula();
      if (!formula) return null;
      const lexical = formula.GetFormula(FormulaGrammar.Grammar.GRAM_ODFF);
      try {
        const matrix = formula.GetMatrixFlag();
        const [columns, rows] = formula.GetMatColsRows() ?? [0, 0];
        const source = text(lexical);
        const cache =
          !formula.GetDirty() && formula.GetErrCode() === FormulaError.NONE && !formula.IsEmpty()
            ? formula.IsValue()
              ? formula.GetValue()
              : text(formula.GetString().getString())
            : undefined;
        return {
          kind: "formula",
          position: [formula.aPos.Col(), formula.aPos.Row(), formula.aPos.Tab()],
          source: matrix === ScMatrixMode.NONE ? source : source.slice(1, -1),
          matrix,
          columns,
          rows,
          ...(cache === undefined ? {} : { cache }),
        };
      } finally {
        lexical.dispose();
      }
    }
  }
}

/** Encodes the native writable graph without assigning new action IDs. @param document - Workbook. @param textStyles - Shared cell text styles. @returns Detached change track, if present. */
export function encodeCalcChangeTrack(
  document: ScDocument,
  textStyles: CellTextStylePool,
): CalcChangeTrackRecord | undefined {
  const track = document.GetChangeTrack();
  if (!track) return undefined;
  const actions = Array.from(
    track.entries(),
    /** Copies an actual action and its link identities. @param action - Source action. @returns Transfer record. */
    (action): ChangeActionRecord => {
      const timestamp = action.GetDateTimeUTC();
      const deleted = action.GetDeleted();
      const info: ActionRecord = {
        id: action.GetActionNumber(),
        rejecting: action.GetRejectingNumber(),
        state: action.GetState(),
        range: action.GetBigRange().GetVars(),
        user: action.GetUser(),
        date: timestamp.GetDate(),
        time: timestamp.GetTime(),
        comment: action.GetComment(),
        dependencies: action.GetDependents().map(
          /** Reads native action identity. @param dependent - Native linked action. @returns Identity. */
          (dependent) => dependent.GetActionNumber(),
        ),
        ...(deleted.length ? { deleted: deleted.map((link) => link.GetActionNumber()) } : {}),
      };
      if (action instanceof ScChangeActionContent)
        return {
          ...info,
          oldCell: encodeCell(action.GetOldCell(), textStyles),
          oldValue: action.GetOldValue(),
          newCell: encodeCell(action.GetNewCell(), textStyles),
          ...(action.GetNewValue() ? { newValue: action.GetNewValue() } : {}),
          previous: action.GetPrevContent()?.GetActionNumber() ?? 0,
        };
      if (action instanceof ScChangeActionIns)
        return {
          ...info,
          type: action.GetType(),
          ...(action.IsEndOfList() ? { endOfList: true } : {}),
        };
      if (action instanceof ScChangeActionMove)
        return { ...info, type: action.GetType(), from: action.GetFromRange().GetVars() };
      if (action instanceof ScChangeActionDel) {
        const insertion = action.GetCutOffInsert();
        const moves = action.GetMoveCutOffs();
        return {
          ...info,
          type: action.GetType(),
          offset: action.GetDx() || action.GetDy(),
          ...(insertion
            ? { insertCutOff: [insertion.action.GetActionNumber(), insertion.count] as const }
            : {}),
          ...(moves.length
            ? {
                moveCutOffs: moves.map(
                  ({ action, from, to }) => [action.GetActionNumber(), from, to] as const,
                ),
              }
            : {}),
        };
      }
      throw new Error("Calc worker change action type is unsupported");
    },
  );
  const generated = Array.from(track.generatedEntries(), (action): GeneratedRecord => ({
    id: action.GetActionNumber(),
    range: action.GetBigRange().GetVars(),
    value: encodeCell(action.GetNewCell(), textStyles),
    input: action.GetNewValue(),
  }));
  return {
    actions,
    ...(generated.length ? { generated } : {}),
    protection: track.GetProtection(),
    max: track.GetActionMax(),
    lastSaved: track.GetLastSavedActionNumber(),
  };
}

/** Checks the native signed64 representation. @param range - Possible range endpoints. @returns Whether all six coordinates are retained. */
function validRange(range: unknown): range is ReturnType<ScBigRange["GetVars"]> {
  return (
    Array.isArray(range) &&
    range.length === 6 &&
    range.every((value: unknown) => typeof value === "bigint" && BigInt.asIntN(64, value) === value)
  );
}

/** Checks a serialized action number in the supported model. @param id - Target ID. @returns Whether valid. */
function validId(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id <= 0xffffffff;
}

/** Restores an independently owned worksheet cell snapshot. @param importer - Worksheet style and document owner. @param value - Cloneable record. @returns Owned cell. */
function decodeCell(importer: ScXMLImport, value: ChangeCell): ScCellValue {
  const document = importer.GetDocument();
  if (value === null || typeof value === "string" || typeof value === "number")
    return createPreviousCell(document, value ?? undefined);
  if (
    value?.kind === "edit" &&
    Array.isArray(value.paragraphs) &&
    value.paragraphs.every(
      (paragraph) =>
        Array.isArray(paragraph) &&
        paragraph.every(
          (span) =>
            Array.isArray(span) && typeof span[0] === "string" && typeof span[1] === "string",
        ),
    )
  )
    return new ScMyCellInfo({ paragraphs: value.paragraphs }).CreateCell(importer);
  if (
    value?.kind === "formula" &&
    Array.isArray(value.position) &&
    value.position.length === 3 &&
    value.position.every(Number.isInteger) &&
    document.ValidColRow(value.position[0], value.position[1]) &&
    document.FetchTable(value.position[2]) &&
    typeof value.source === "string" &&
    (value.matrix === ScMatrixMode.NONE ||
      value.matrix === ScMatrixMode.Formula ||
      value.matrix === ScMatrixMode.Reference) &&
    Number.isInteger(value.columns) &&
    Number.isInteger(value.rows) &&
    (value.cache === undefined || typeof value.cache === "string" || Number.isFinite(value.cache))
  ) {
    const cell = createPreviousFormulaCell(document, new ScAddress(...value.position), {
      ...value,
      grammar: FormulaGrammar.Grammar.GRAM_ODFF,
    });
    try {
      if (value.cache !== undefined) cell.getFormula()?.SetMatrixCachedResult(value.cache);
      return cell;
    } catch (error) {
      cell.clear();
      throw error;
    }
  }
  throw new Error("Calc worker change cell is invalid");
}

/** Restores owned change actions and then resolves original dependency links. @param importer - Workbook and style owner. @param record - Detached track. */
export function decodeCalcChangeTrack(importer: ScXMLImport, record: CalcChangeTrackRecord): void {
  const document = importer.GetDocument();
  if (
    !record ||
    !Array.isArray(record.actions) ||
    (record.generated !== undefined && !Array.isArray(record.generated)) ||
    !ArrayBuffer.isView(record.protection) ||
    Object.prototype.toString.call(record.protection) !== "[object Uint8Array]" ||
    !validId(record.max) ||
    !validId(record.lastSaved)
  )
    throw new Error("Calc worker change track is invalid");
  const track = new ScChangeTrack(document);
  try {
    for (const entry of record.generated ?? []) {
      if (
        !entry ||
        !validId(entry.id) ||
        !validRange(entry.range) ||
        typeof entry.input !== "string"
      )
        throw new Error("Calc worker generated action is invalid");
      const cell = decodeCell(importer, entry.value);
      try {
        if (
          cell.isEmpty() ||
          track
            .AddLoadedGenerated(cell, new ScBigRange(...entry.range), entry.input)
            .GetActionNumber() !== entry.id
        )
          throw new Error("Calc worker generated action ID is invalid");
      } finally {
        cell.clear();
      }
    }
    for (const data of record.actions as readonly ChangeActionRecord[]) {
      if (
        !data ||
        !validId(data.id) ||
        data.id === 0 ||
        !validId(data.rejecting) ||
        !Number.isInteger(data.state) ||
        data.state < ScChangeActionState.SC_CAS_VIRGIN ||
        data.state > ScChangeActionState.SC_CAS_REJECTED ||
        !validRange(data.range) ||
        !Array.isArray(data.dependencies) ||
        !data.dependencies.every(validId) ||
        (data.deleted !== undefined &&
          (!Array.isArray(data.deleted) || !data.deleted.every(validId))) ||
        typeof data.user !== "string" ||
        typeof data.comment !== "string" ||
        !Number.isInteger(data.date) ||
        (data.date | 0) !== data.date ||
        typeof data.time !== "bigint" ||
        BigInt.asIntN(64, data.time) !== data.time
      )
        throw new Error("Calc worker change action is invalid");
      const info: ScChangeActionInfo = {
        actionNumber: data.id,
        rejectingNumber: data.rejecting,
        state: data.state,
        range: new ScBigRange(...data.range),
        user: data.user,
        comment: data.comment,
        dateTimeUTC: new DateTime(new Date(data.date), Time.fromEncodedTime(data.time)),
      };
      if (!isContentRecord(data)) {
        if (!track.AppendLoaded(decodeStructuralAction(data, info)))
          throw new Error("Calc worker change action ID is duplicated");
        continue;
      }
      if (
        !validId(data.previous) ||
        typeof data.oldValue !== "string" ||
        (data.newValue !== undefined && typeof data.newValue !== "string")
      )
        throw new Error("Calc worker content action is invalid");
      const oldCell = decodeCell(importer, data.oldCell);
      let action: ScChangeActionContent;
      try {
        action = new ScChangeActionContent(info, oldCell, document, data.oldValue);
      } finally {
        oldCell.clear();
      }
      if (!track.AppendLoaded(action))
        throw new Error("Calc worker change action ID is duplicated");
      if (data.newCell !== undefined) {
        const value = decodeCell(importer, data.newCell);
        try {
          action.SetNewCell(value, data.newValue);
        } finally {
          value.clear();
        }
      } else {
        const [column, row, tab] = action.GetBigRange().aStart.GetVars().map(Number) as [
          number,
          number,
          number,
        ];
        if (document.ValidColRow(column, row) && document.FetchTable(tab)) {
          const value = new ScCellValue(document.GetRefCellValue(new ScAddress(column, row, tab)));
          try {
            action.SetNewCell(value);
          } finally {
            value.clear();
          }
        }
      }
    }
    for (const data of record.actions) {
      const action = track.GetAction(data.id);
      if (!action) continue;
      if (action instanceof ScChangeActionContent && isContentRecord(data)) {
        const previous = track.GetAction(data.previous);
        if (previous instanceof ScChangeActionContent) action.SetPrevContent(previous);
      }
      for (const id of [...data.dependencies].reverse()) {
        const dependent = track.GetActionOrGenerated(id);
        if (dependent) action.AddDependent(dependent);
      }
      for (const id of [...(data.deleted ?? [])].reverse()) {
        const deleted = track.GetActionOrGenerated(id);
        if (deleted) action.SetDeletedInThis(deleted);
      }
      if (action instanceof ScChangeActionDel && "offset" in data)
        decodeCutOffs(action, data, track);
    }
    track.SetActionMax(record.max);
    track.SetLastSavedActionNumber(record.lastSaved);
    track.SetProtection(record.protection);
    document.SetChangeTrack(track);
  } catch (error) {
    track.Dispose();
    throw error;
  }
}

/** Restores a loaded non-content action with native ownership. @param data - Structural record. @param info - Common trusted action properties. @returns New native action. */
function decodeStructuralAction(
  data: InsertActionRecord | MoveActionRecord | DeleteActionRecord,
  info: ScChangeActionInfo,
): ScChangeActionIns | ScChangeActionMove | ScChangeActionDel {
  switch (data.type) {
    case ScChangeActionType.SC_CAT_INSERT_COLS:
    case ScChangeActionType.SC_CAT_INSERT_ROWS:
    case ScChangeActionType.SC_CAT_INSERT_TABS:
      if (data.endOfList === undefined || typeof data.endOfList === "boolean")
        return new ScChangeActionIns(data.type, info, data.endOfList);
      break;
    case ScChangeActionType.SC_CAT_DELETE_COLS:
    case ScChangeActionType.SC_CAT_DELETE_ROWS:
    case ScChangeActionType.SC_CAT_DELETE_TABS:
      if (Number.isInteger(data.offset)) return new ScChangeActionDel(data.type, info, data.offset);
      break;
    case ScChangeActionType.SC_CAT_MOVE:
      if (validRange(data.from)) return new ScChangeActionMove(info, new ScBigRange(...data.from));
      break;
  }
  throw new Error("Calc worker structural change action is invalid");
}

/** Restores cutoff links after all action identifiers exist. @param action - Native deletion. @param data - Original cutoff record. @param track - Existing action lookup. */
function decodeCutOffs(
  action: ScChangeActionDel,
  data: DeleteActionRecord,
  track: ScChangeTrack,
): void {
  if (data.insertCutOff !== undefined) {
    if (
      !Array.isArray(data.insertCutOff) ||
      data.insertCutOff.length !== 2 ||
      !validId(data.insertCutOff[0]) ||
      !Number.isInteger(data.insertCutOff[1])
    )
      throw new Error("Calc worker insertion cutoff is invalid");
    const insertion = track.GetAction(data.insertCutOff[0]);
    if (insertion instanceof ScChangeActionIns)
      action.SetCutOffInsert(insertion, data.insertCutOff[1]);
  }
  if (data.moveCutOffs !== undefined && !Array.isArray(data.moveCutOffs))
    throw new Error("Calc worker movement cutoffs are invalid");
  for (const cutOff of [...(data.moveCutOffs ?? [])].reverse()) {
    if (
      !Array.isArray(cutOff) ||
      cutOff.length !== 3 ||
      !validId(cutOff[0]) ||
      !Number.isInteger(cutOff[1]) ||
      !Number.isInteger(cutOff[2])
    )
      throw new Error("Calc worker movement cutoff is invalid");
    const movement = track.GetAction(cutOff[0]);
    if (movement instanceof ScChangeActionMove)
      action.AddCutOffMove(movement, cutOff[1], cutOff[2]);
  }
}
