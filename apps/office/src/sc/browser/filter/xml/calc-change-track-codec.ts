/** @fileoverview Cloneable transport of loaded native Calc content change actions. */
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
  ScChangeActionState,
  ScChangeTrack,
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

/** Loaded action before connecting its original links. */
interface ContentActionRecord {
  readonly id: number;
  readonly rejecting: number;
  readonly state: ScChangeActionState;
  readonly range: ReturnType<ScBigRange["GetVars"]>;
  readonly user: string;
  readonly date: number;
  readonly time: bigint;
  readonly comment: string;
  readonly oldCell: ChangeCell;
  readonly oldValue: string;
  readonly newCell?: ChangeCell;
  readonly previous: number;
  readonly dependencies: readonly number[];
}

/** Detached workbook change track. */
export interface CalcChangeTrackRecord {
  readonly actions: readonly ContentActionRecord[];
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
    (action): ContentActionRecord => {
      const timestamp = action.GetDateTimeUTC();
      return {
        id: action.GetActionNumber(),
        rejecting: action.GetRejectingNumber(),
        state: action.GetState(),
        range: action.GetBigRange().GetVars(),
        user: action.GetUser(),
        date: timestamp.GetDate(),
        time: timestamp.GetTime(),
        comment: action.GetComment(),
        oldCell: encodeCell(action.GetOldCell(), textStyles),
        oldValue: action.GetOldValue(),
        newCell: encodeCell(action.GetNewCell(), textStyles),
        previous: action.GetPrevContent()?.GetActionNumber() ?? 0,
        dependencies: action.GetDependents().map(
          /** Reads native action identity. @param dependent - Native linked action. @returns Identity. */
          (dependent) => dependent.GetActionNumber(),
        ),
      };
    },
  );
  return {
    actions,
    protection: track.GetProtection(),
    max: track.GetActionMax(),
    lastSaved: track.GetLastSavedActionNumber(),
  };
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
    !ArrayBuffer.isView(record.protection) ||
    Object.prototype.toString.call(record.protection) !== "[object Uint8Array]" ||
    !validId(record.max) ||
    !validId(record.lastSaved)
  )
    throw new Error("Calc worker change track is invalid");
  const track = new ScChangeTrack(document);
  try {
    for (const data of record.actions as readonly ContentActionRecord[]) {
      if (
        !data ||
        !validId(data.id) ||
        data.id === 0 ||
        !validId(data.rejecting) ||
        !validId(data.previous) ||
        !Number.isInteger(data.state) ||
        data.state < ScChangeActionState.SC_CAS_VIRGIN ||
        data.state > ScChangeActionState.SC_CAS_REJECTED ||
        !Array.isArray(data.range) ||
        data.range.length !== 6 ||
        !data.range.every(
          /** Tests one raw BigRange coordinate. @param value - Wire coordinate. @returns Whether it fits in signed64. */
          (value) => typeof value === "bigint" && BigInt.asIntN(64, value) === value,
        ) ||
        !Array.isArray(data.dependencies) ||
        !data.dependencies.every(validId) ||
        typeof data.user !== "string" ||
        typeof data.comment !== "string" ||
        typeof data.oldValue !== "string" ||
        !Number.isInteger(data.date) ||
        (data.date | 0) !== data.date ||
        typeof data.time !== "bigint" ||
        BigInt.asIntN(64, data.time) !== data.time
      )
        throw new Error("Calc worker change action is invalid");
      const oldCell = decodeCell(importer, data.oldCell);
      let action: ScChangeActionContent;
      try {
        action = new ScChangeActionContent(
          {
            actionNumber: data.id,
            rejectingNumber: data.rejecting,
            state: data.state,
            range: new ScBigRange(...data.range),
            user: data.user,
            comment: data.comment,
            dateTimeUTC: new DateTime(new Date(data.date), Time.fromEncodedTime(data.time)),
          },
          oldCell,
          document,
          data.oldValue,
        );
      } finally {
        oldCell.clear();
      }
      if (!track.AppendLoaded(action))
        throw new Error("Calc worker change action ID is duplicated");
      if (data.newCell !== undefined) {
        const value = decodeCell(importer, data.newCell);
        try {
          action.SetNewCell(value);
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
      const previous = track.GetAction(data.previous);
      if (previous) action.SetPrevContent(previous);
      for (const id of [...data.dependencies].reverse()) {
        const dependent = track.GetAction(id);
        if (dependent) action.AddDependent(dependent);
      }
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
