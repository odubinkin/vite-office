/** @fileoverview Reconstructs native Calc content change actions from the ODF loading pass. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Converter } from "../../../../sax/source/tools/converter";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScAddress } from "../../../inc/address";
import { ScBigRange } from "../../../inc/bigrange";
import { ScCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { ScFormulaCell, ScMatrixMode } from "../../core/data/formulacell";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import {
  ScChangeActionContent,
  ScChangeActionDel,
  ScChangeActionIns,
  ScChangeActionMove,
  ScChangeActionType,
  ScChangeTrack,
  type ScChangeAction,
  type ScChangeActionInfo,
  type ScChangeActionDeletionType,
  type ScChangeActionInsertionType,
} from "../../core/tool/chgtrack";
import { createCellEditText } from "./xmlcelli.edit";
import type { ScXMLFormula, ScXMLImport } from "./xmlimprt";
import type { CellTextParagraph } from "./xmlexprt.celltext";

/** Native deferred formula attributes from a tracked change cell. */
export interface ScMyFormulaInfo extends ScXMLFormula {
  readonly address: string;
  readonly matrix: ScMatrixMode;
  readonly columns: number;
  readonly rows: number;
}

/** Original native loader state for a previous cell and its optional input spelling. */
export class ScMyCellInfo {
  /** Stores parsed data until the original document and formula references are ready. @param value - Parsed previous snapshot. @param inputString - Original input spelling. */
  public constructor(
    private readonly value?:
      number | string | ScMyFormulaInfo | { paragraphs: CellTextParagraph[] },
    public readonly inputString = "",
  ) {}

  /** Builds the original cell after the workbook is populated. @param importer - Style and document owner. @returns Owned cell. */
  public CreateCell(importer: ScXMLImport): ScCellValue {
    const document = importer.GetDocument();
    const value = this.value;
    if (typeof value !== "object") return createPreviousCell(document, value);
    if ("paragraphs" in value) {
      const edit = createCellEditText(importer, value.paragraphs);
      try {
        return new ScCellValue(edit);
      } finally {
        edit.dispose();
      }
    }
    if (!value.source || !value.address) return new ScCellValue();
    const address = new ScAddress();
    ScRangeStringConverter.GetAddressFromString(
      address,
      value.address,
      document,
      FormulaGrammar.AddressConvention.CONV_OOO,
      [0],
    );
    return createPreviousFormulaCell(document, address, value);
  }
}

/** Original shared deferred action data. */
interface ScMyBaseAction extends ScChangeActionInfo {
  readonly dependencies: readonly number[];
  readonly deleted: readonly ScMyDeleted[];
}

/** Original parsed deleted cell or action reference. */
export interface ScMyDeleted {
  readonly id: number;
  readonly cell?: ScMyCellInfo;
  readonly range?: ScBigRange;
}

/** Loaded content change before linking its dependencies. */
export interface ScMyContentAction extends ScMyBaseAction {
  readonly type: ScChangeActionType.SC_CAT_CONTENT;
  readonly oldCell: ScMyCellInfo;
  readonly previousAction: number;
}

/** Loaded insertion after the original whole-axis range conversion. */
export interface ScMyInsAction extends ScMyBaseAction {
  readonly type: ScChangeActionInsertionType;
}

/** Original deferred movement. A rejection enters the same branch without a source range. */
interface ScMyMoveAction extends ScMyBaseAction {
  readonly type: ScChangeActionType.SC_CAT_MOVE;
  readonly from?: ScBigRange;
}

/** Deferred deletion, including native multi-deletion and cutoff metadata. */
interface ScMyDelAction extends ScMyBaseAction {
  readonly type: ScChangeActionDeletionType;
  readonly offset: number;
  readonly insertCutOff?: Readonly<{ id: number; count: number }>;
  readonly moveCutOffs: readonly Readonly<{ id: number; from: number; to: number }>[];
}

/** Original deferred action before the native loading pass. */
type ScMyAction = ScMyContentAction | ScMyInsAction | ScMyMoveAction | ScMyDelAction;

/** Owns the parsed actions until the real document cells are ready. */
export class ScXMLChangeTrackingImportHelper {
  private readonly actions: ScMyAction[] = [];
  private protection = new Uint8Array();
  private multiSpanned = 0;
  private multiSpannedSlaveCount = 0;

  /** Parses the original ct identifier and signed-32 range. @param value - Authored identifier. @returns Action number or zero. */
  public static GetIDFromString(value: string | null): number {
    const number: [number] = [0];
    if (value?.startsWith("ct")) Converter.convertNumber(number, value.slice(2), 0);
    return number[0];
  }

  /** Retains protection after the tracked-changes wrapper is read. @param value - Imported bytes. */
  public SetProtection(value: Uint8Array): void {
    this.protection = new Uint8Array(value);
  }

  /** Records the completed native action if its identity is valid. @param action - Loaded action. */
  public EndChangeAction(action: ScMyAction): void {
    if (action.actionNumber > 0) this.actions.push(action);
  }

  /** Maps a loaded insertion or deletion to the native whole-axis range. @param type - Affected axis. @param position - First affected index. @param count - Affected count. @param table - Sheet for row or column changes. @returns Original raw endpoints. */
  public SetPosition(
    type: ScChangeActionInsertionType | ScChangeActionDeletionType,
    position: number,
    count: number,
    table: number,
  ): ScBigRange {
    const min = ScBigRange.nRangeMin;
    const max = ScBigRange.nRangeMax;
    const start = BigInt(position);
    const end = BigInt.asIntN(32, start + BigInt(count) - 1n);
    const sheet = BigInt(table);
    switch (type) {
      case ScChangeActionType.SC_CAT_INSERT_COLS:
      case ScChangeActionType.SC_CAT_DELETE_COLS:
        return new ScBigRange(start, min, sheet, end, max, sheet);
      case ScChangeActionType.SC_CAT_INSERT_ROWS:
      case ScChangeActionType.SC_CAT_DELETE_ROWS:
        return new ScBigRange(min, start, sheet, max, end, sheet);
      case ScChangeActionType.SC_CAT_INSERT_TABS:
      case ScChangeActionType.SC_CAT_DELETE_TABS:
        return new ScBigRange(min, min, start, max, max, end);
    }
  }

  /** Advances the native offset after reading one member of a multi-deletion. @param type - Deleted axis. @param count - Authored span count. @returns Original slave offset. */
  public GetMultiSpannedRange(type: ScChangeActionDeletionType, count: number): number {
    const span = (count << 16) >> 16;
    if (span) {
      this.multiSpanned = span;
      this.multiSpannedSlaveCount = 0;
    }
    if (type === ScChangeActionType.SC_CAT_DELETE_TABS) return 0;
    const offset = this.multiSpannedSlaveCount++;
    if (this.multiSpannedSlaveCount >= this.multiSpanned) {
      this.multiSpanned = 0;
      this.multiSpannedSlaveCount = 0;
    }
    return offset;
  }

  /** Reconstructs the native actions in their original three import passes. @param importer - Importer for the fully populated workbook. */
  public CreateChangeTrack(importer: ScXMLImport): void {
    const document = importer.GetDocument();
    const track = new ScChangeTrack(document);
    const loaded: ScMyAction[] = [];
    const generated = new Map<ScMyAction, readonly ScChangeActionContent[]>();
    try {
      for (const action of this.actions) {
        const loadedAction = this.CreateAction(action, importer);
        if (
          action.type === ScChangeActionType.SC_CAT_DELETE_COLS ||
          action.type === ScChangeActionType.SC_CAT_DELETE_ROWS ||
          action.type === ScChangeActionType.SC_CAT_MOVE
        )
          generated.set(action, this.CreateGeneratedActions(action.deleted, importer, track));
        if (loadedAction && track.AppendLoaded(loadedAction)) loaded.push(action);
      }
      const last = track.GetLast()?.GetActionNumber() ?? 0;
      track.SetActionMax(last);
      for (const action of loaded) {
        const current = track.GetAction(action.actionNumber);
        if (!current) continue;
        for (let index = action.dependencies.length - 1; index >= 0; index--) {
          const dependent = track.GetActionOrGenerated(action.dependencies[index] as number);
          if (dependent) current.AddDependent(dependent);
        }
        this.SetDeletedActions(current, action.deleted, importer, track);
        for (const cell of generated.get(action) ?? []) current.SetDeletedInThis(cell);
        if (
          current instanceof ScChangeActionDel &&
          current.GetType() !== ScChangeActionType.SC_CAT_DELETE_TABS &&
          "moveCutOffs" in action
        )
          this.SetDeletionDependencies(current, action, track);
        if (
          action.type !== ScChangeActionType.SC_CAT_CONTENT ||
          !(current instanceof ScChangeActionContent)
        )
          continue;
        const previous = track.GetAction(action.previousAction);
        if (previous instanceof ScChangeActionContent) {
          current.SetPrevContent(previous);
          const old = current.GetOldCell();
          if (!old.isEmpty()) previous.SetNewCell(old);
        }
      }
      for (const content of track.entries()) {
        if (
          !(content instanceof ScChangeActionContent) ||
          !content.IsTopContent() ||
          content.IsDeletedIn()
        )
          continue;
        const [column, row, tab] = content.GetBigRange().aStart.GetVars().map(Number) as [
          number,
          number,
          number,
        ];
        if (!document.ValidColRow(column, row) || !document.FetchTable(tab)) continue;
        const address = new ScAddress(column, row, tab);
        const cell = new ScCellValue(document.GetRefCellValue(address));
        try {
          if (!cell.isEmpty()) {
            const format =
              document.GetPattern(address)?.GetNumberFormat(document.GetFormatTable()) ?? 0;
            content.SetNewCell(cell, "", format);
          }
        } finally {
          cell.clear();
        }
      }
      if (this.protection.length) track.SetProtection(this.protection);
      else {
        const previous = document.GetChangeTrack();
        if (previous) track.SetProtection(previous.GetProtection());
      }
      track.SetLastSavedActionNumber(last);
      document.SetChangeTrack(track);
    } catch (error) {
      track.Dispose();
      throw error;
    } finally {
      this.actions.length = 0;
    }
  }

  /** Adopts original generated cell snapshots in track allocation order. @param deleted - Parsed deleted cells. @param importer - Document and styles. @param track - Actual change tracker. @returns Generated actions. */
  private CreateGeneratedActions(
    deleted: readonly ScMyDeleted[],
    importer: ScXMLImport,
    track: ScChangeTrack,
  ): ScChangeActionContent[] {
    const generated: ScChangeActionContent[] = [];
    for (const entry of deleted) {
      if (entry.id || !entry.cell || !entry.range) continue;
      const cell = entry.cell.CreateCell(importer);
      try {
        if (!cell.isEmpty())
          generated.push(track.AddLoadedGenerated(cell, entry.range, entry.cell.inputString));
      } finally {
        cell.clear();
      }
    }
    return generated;
  }

  /** Resolves original action deletions and restores a deleted cell's newer content. @param action - Native deleting action. @param deleted - Deferred references. @param importer - Workbook importer. @param track - Track lookup. */
  private SetDeletedActions(
    action: ScChangeAction,
    deleted: readonly ScMyDeleted[],
    importer: ScXMLImport,
    track: ScChangeTrack,
  ): void {
    for (const entry of [...deleted].reverse()) {
      if (!entry.id) continue;
      const referenced = track.GetActionOrGenerated(entry.id);
      if (!referenced) continue;
      action.SetDeletedInThis(referenced);
      if (referenced instanceof ScChangeActionContent && entry.cell) {
        const value = entry.cell.CreateCell(importer);
        try {
          if (!value.equalsWithoutFormat(referenced.GetNewCell()))
            referenced.SetNewCell(value, entry.cell.inputString);
        } finally {
          value.clear();
        }
      }
    }
  }

  /** Resolves cutoff action types after the original load pass. @param deletion - Native deletion. @param info - Parsed cutoff references. @param track - Track lookup. */
  private SetDeletionDependencies(
    deletion: ScChangeActionDel,
    info: ScMyDelAction,
    track: ScChangeTrack,
  ): void {
    if (info.insertCutOff) {
      const insertion = track.GetAction(info.insertCutOff.id);
      if (insertion instanceof ScChangeActionIns)
        deletion.SetCutOffInsert(insertion, (info.insertCutOff.count << 16) >> 16);
    }
    for (const cutOff of [...info.moveCutOffs].reverse()) {
      const movement = track.GetAction(cutOff.id);
      if (movement instanceof ScChangeActionMove)
        deletion.AddCutOffMove(movement, (cutOff.from << 16) >> 16, (cutOff.to << 16) >> 16);
    }
  }

  /** Materializes a deferred action in native insertion order. @param action - Parsed action. @param importer - Document and styles. @returns Owned action when the loader admits it. */
  private CreateAction(action: ScMyAction, importer: ScXMLImport): ScChangeAction | undefined {
    if (action.type === ScChangeActionType.SC_CAT_MOVE)
      return action.from ? new ScChangeActionMove(action, action.from) : undefined;
    if ("offset" in action) return new ScChangeActionDel(action.type, action, action.offset);
    if (action.type !== ScChangeActionType.SC_CAT_CONTENT)
      return new ScChangeActionIns(action.type, action);
    const cell = action.oldCell.CreateCell(importer);
    try {
      return new ScChangeActionContent(
        action,
        cell,
        importer.GetDocument(),
        action.oldCell.inputString,
      );
    } finally {
      cell.clear();
    }
  }
}

/** Creates an owned historical formula at the original cell position and matrix geometry. @param document - Workbook. @param address - Original position. @param value - Deferred historical formula. @returns Owned cell. */
export function createPreviousFormulaCell(
  document: ScDocument,
  address: ScAddress,
  value: Omit<ScMyFormulaInfo, "address">,
): ScCellValue {
  const source = unicode(value.source);
  try {
    const formula = new ScFormulaCell(document, address, source, value.grammar, value.matrix);
    const cell = new ScCellValue();
    cell.set(formula);
    try {
      if (value.columns || value.rows) formula.SetMatColsRows(value.columns, value.rows);
      return cell;
    } catch (error) {
      cell.clear();
      throw error;
    }
  } finally {
    source.dispose();
  }
}

/** Creates the actual previous cell using the document's native string pool. @param document - Workbook. @param value - Imported scalar. @returns Owned previous cell. */
export function createPreviousCell(
  document: ScDocument,
  value: number | string | undefined,
): ScCellValue {
  if (typeof value !== "string") return new ScCellValue(value);
  const authored = unicode(value);
  try {
    const shared = document.GetSharedStringPool().intern(authored);
    try {
      return new ScCellValue(shared);
    } finally {
      shared.dispose();
    }
  } finally {
    authored.dispose();
  }
}
