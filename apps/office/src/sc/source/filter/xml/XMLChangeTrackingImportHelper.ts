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
  ScChangeActionIns,
  ScChangeActionType,
  ScChangeTrack,
  type ScChangeAction,
  type ScChangeActionInfo,
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

/** Original rejection import enters the move branch without its source or target ranges. */
interface ScMyRejectionAction extends ScMyBaseAction {
  readonly type: ScChangeActionType.SC_CAT_MOVE;
}

/** Original deferred action before the native loading pass. */
type ScMyAction = ScMyContentAction | ScMyInsAction | ScMyRejectionAction;

/** Owns the parsed actions until the real document cells are ready. */
export class ScXMLChangeTrackingImportHelper {
  private readonly actions: ScMyAction[] = [];
  private protection = new Uint8Array();

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

  /** Maps a loaded insertion to the native whole-axis range. @param type - Inserted axis. @param position - First inserted index. @param count - Inserted count. @param table - Sheet for row or column insertions. @returns Original raw endpoints. */
  public SetPosition(
    type: ScChangeActionInsertionType,
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
        return new ScBigRange(start, min, sheet, end, max, sheet);
      case ScChangeActionType.SC_CAT_INSERT_ROWS:
        return new ScBigRange(min, start, sheet, max, end, sheet);
      case ScChangeActionType.SC_CAT_INSERT_TABS:
        return new ScBigRange(min, min, start, max, max, end);
    }
  }

  /** Reconstructs the native actions in their original three import passes. @param importer - Importer for the fully populated workbook. */
  public CreateChangeTrack(importer: ScXMLImport): void {
    const document = importer.GetDocument();
    const track = new ScChangeTrack(document);
    const loaded: ScMyAction[] = [];
    try {
      for (const action of this.actions) {
        const loadedAction = this.CreateAction(action, importer);
        if (loadedAction && track.AppendLoaded(loadedAction)) loaded.push(action);
      }
      const last = track.GetLast()?.GetActionNumber() ?? 0;
      track.SetActionMax(last);
      for (const action of loaded) {
        const current = track.GetAction(action.actionNumber);
        if (!current) continue;
        for (let index = action.dependencies.length - 1; index >= 0; index--) {
          const dependent = track.GetAction(action.dependencies[index] as number);
          if (dependent) current.AddDependent(dependent);
        }
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
        if (!(content instanceof ScChangeActionContent) || !content.IsTopContent()) continue;
        const [column, row, tab] = content.GetBigRange().aStart.GetVars().map(Number) as [
          number,
          number,
          number,
        ];
        if (!document.ValidColRow(column, row) || !document.FetchTable(tab)) continue;
        const cell = new ScCellValue(document.GetRefCellValue(new ScAddress(column, row, tab)));
        try {
          if (!cell.isEmpty()) content.SetNewCell(cell);
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

  /** Materializes a deferred action in native insertion order. @param action - Parsed action. @param importer - Document and styles. @returns Owned action when the loader admits it. */
  private CreateAction(action: ScMyAction, importer: ScXMLImport): ScChangeAction | undefined {
    if (action.type === ScChangeActionType.SC_CAT_MOVE) return undefined;
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
