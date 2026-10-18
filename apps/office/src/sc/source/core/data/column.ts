/** @fileoverview Scalar/local-reference column storage and native single-cell broadcasters. Rich text,notes,area/group services remain unsupported. */
import {
  CellStoreType,
  CellTextAttrStoreType,
  string_element_callbacks,
  string_value_type,
  formula_element_callbacks,
  element_type_formula,
  CellStoreEvent,
} from "../../../inc/mtvelements";
import { double_element_callbacks } from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks.ts";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { SvtBroadcaster } from "../../../../svl/source/notify/broadcast";
import type { SvtListener } from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScHint } from "../../../inc/brdcst";
import {
  BroadcasterStoreType,
  broadcaster_element_callbacks,
  element_type_broadcaster,
  toRefCell,
} from "../../../inc/mtvelements";
import { ProcessFormula } from "../../../inc/mtvcellfunc";
import { ScFormulaCell } from "../../../inc/formulacell";
import { ScAddress } from "../../../inc/address";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { CellType } from "../../../inc/global";
import {
  element_type_numeric,
  element_type_string,
  celltextattr_element_callbacks,
} from "../../../inc/mtvelements";
import { CellTextAttr } from "../../../inc/celltextattr";
import type { ScDocument } from "../../../inc/document";

/** Numeric/string/formula column owner;cells are not stored in an application-side grid. */
export class ScColumn {
  /** Native friend-visible logical counters used by CellStoreEvent; no lifetime accounting. */
  mnBlkCountFormula = 0;
  mnBlkCountCellNotes = 0;
  private nCol = 0;
  private nTab = 0;
  private readonly maBroadcasters: BroadcasterStoreType;
  private readonly maCells: CellStoreType;
  private readonly maCellTextAttrs: CellTextAttrStoreType;
  /** Creates empty stores spanning the document's actual row domain. @param rDocument - Owning document. @returns Column. */
  constructor(private readonly rDocument: ScDocument) {
    this.maBroadcasters = new BroadcasterStoreType(rDocument.GetMaxRowCount());
    this.maCells = new CellStoreType(new CellStoreEvent(this));
    this.maCells.resize(rDocument.GetMaxRowCount());
    this.maCellTextAttrs = new CellTextAttrStoreType(rDocument.GetMaxRowCount());
  }
  /** Initializes position in the owning sheet;full attribute-array services are not claimed. @param col - Column. @param tab - Sheet. @returns Nothing. */
  Init(col: number, tab: number): void {
    this.nCol = col;
    this.nTab = tab;
  }
  /** Updates native sheet identity in every real formula cell after sheet insertion. Formatting attributes remain a declared gap. @param tab - Sheet. @returns Nothing. */
  SetTabNo(tab: number): void {
    this.nTab = tab;
    ProcessFormula(
      this.maCells,
      /** Updates the actual formula position. @param row - Row. @param cell - Cell. @returns Nothing. */ (
        row,
        cell,
      ) => {
        void row;
        cell.aPos.SetTab(tab);
      },
    );
  }
  /** Borrows the actual native typed store; callers preserve the iterator invalidation contract. @returns Cell store. */
  GetCellStore(): CellStoreType {
    return this.maCells;
  }
  /** Reads the native column coordinate. @returns Column. */
  GetCol(): number {
    return this.nCol;
  }
  /** Reads the native sheet coordinate. @returns Sheet. */
  GetTab(): number {
    return this.nTab;
  }
  /** Borrows the actual owning document. @returns Document. */
  GetDoc(): ScDocument {
    return this.rDocument;
  }
  /** Writes numeric cell content and invalidates its text measurement metadata. @param row - Row. @param value - Number. @returns Nothing. */
  SetValue(row: number, value: number): void {
    if (!this.rDocument.ValidRow(row)) return;
    this.DetachFormulaCell(row);
    this.maCells.set(row, value, double_element_callbacks);
    this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
    this.BroadcastNewCell(row);
  }
  /** Stores literal text using the document's shared pool,without number or formula recognition. @param row - Row. @param value - Unicode text or already interned string. @returns Nothing. */
  SetRawString(row: number, value: OUStringConstReference | SharedStringConstReference): void {
    if (!this.rDocument.ValidRow(row)) return;
    const shared =
      "getData" in value
        ? new SharedString(value)
        : this.rDocument.GetSharedStringPool().intern(value);
    try {
      this.DetachFormulaCell(row);
      this.maCells.set(row, shared, string_element_callbacks);
      this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
    } finally {
      shared.dispose();
    }
    this.BroadcastNewCell(row);
  }
  /** Compiles and stores a supported formula in the actual typed block store. @param row - Row. @param formula - Source. @param grammar - ODFF grammar. @returns Nothing. */
  SetFormula(row: number, formula: OUStringConstReference, grammar: Grammar): void {
    if (!this.rDocument.ValidRow(row)) return;
    const cell = new ScFormulaCell(
      this.rDocument,
      new ScAddress(this.nCol, row, this.nTab),
      formula,
      grammar,
    );
    this.SetFormulaCell(row, cell);
  }
  /** Adopts an already compiled native formula owner without reparsing its input text. The cell position/document must match this column and row. @param row - Target row. @param cell - Compiled owner. @returns Adopted cell or null for invalid row. */
  SetFormulaCell(row: number, cell: ScFormulaCell): ScFormulaCell | null {
    if (!this.rDocument.ValidRow(row)) return null;
    this.DetachFormulaCell(row);
    this.maCells.set<ScFormulaCell | null>(row, cell, formula_element_callbacks);
    this.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
    cell.StartListeningTo(this.rDocument);
    cell.SetDirty();
    return cell;
  }
  /** Borrows an actual formula-cell identity. @param row - Valid row. @returns Formula cell or null. */
  GetFormulaCell(row: number): ScFormulaCell | null {
    if (this.maCells.get_type(row) !== element_type_formula) return null;
    const output: [ScFormulaCell | null] = [null];
    this.maCells.get(row, formula_element_callbacks, output);
    return output[0];
  }
  /** Reads a real formula error, with native nonformula NONE. @param row - Valid row. @returns Error. */
  GetErrCode(row: number): FormulaError {
    return this.GetFormulaCell(row)?.GetErrCode() ?? FormulaError.NONE;
  }
  /** Performs native default-context dirty marking and tree membership without tracking broadcasts. @param context - Dirty context. @returns Nothing. */
  SetAllFormulasDirty(context: SetFormulaDirtyContext): void {
    if (context.mbClearTabDeletedFlag)
      throw new Error("Deleted-sheet flag clearing is not implemented");
    ProcessFormula(
      this.maCells,
      /** Marks the actual cell. @param row - Row. @param cell - Formula. @returns Nothing. */ (
        row,
        cell,
      ) => {
        void row;
        cell.SetDirtyVar();
        if (!this.rDocument.IsInFormulaTree(cell)) this.rDocument.PutInFormulaTree(cell);
      },
    );
  }
  /** Borrows actual numeric/string/formula cell content without a second model. @param row - Valid row. @returns Cell view. */
  GetCellValue(row: number): ScRefCellValue {
    const position = this.maCells.cposition(row);
    return toRefCell(position.first, position.second);
  }
  /** Borrows an existing source broadcaster without allocating. @param row - Valid row. @returns Broadcaster or null. */
  GetBroadcaster(row: number): SvtBroadcaster<SfxHint> | null {
    if (this.maBroadcasters.get_type(row) !== element_type_broadcaster) return null;
    const value: [SvtBroadcaster<SfxHint> | null] = [null];
    this.maBroadcasters.get(row, broadcaster_element_callbacks, value);
    return value[0];
  }
  /** Registers with the actual row broadcaster, allocating it only when required. @param listener - Listener. @param row - Valid row. @returns Nothing. */
  StartListening(listener: SvtListener<SfxHint>, row: number): void {
    let broadcaster = this.GetBroadcaster(row);
    if (!broadcaster) {
      broadcaster = new SvtBroadcaster<SfxHint>();
      listener.StartListening(broadcaster);
      this.maBroadcasters.set<SvtBroadcaster<SfxHint> | null>(
        row,
        broadcaster,
        broadcaster_element_callbacks,
      );
    } else listener.StartListening(broadcaster);
  }
  /** Ends reciprocal registration and removes an empty broadcaster. @param listener - Listener. @param row - Valid row. @returns Nothing. */
  EndListening(listener: SvtListener<SfxHint>, row: number): void {
    const broadcaster = this.GetBroadcaster(row);
    if (!broadcaster) return;
    listener.EndListening(broadcaster);
    if (!broadcaster.HasListeners()) this.maBroadcasters.set_empty(row, row);
  }
  /** Removes formula subscriptions and logical queue/tree membership before content replacement. @param row - Valid row. @returns Nothing. */
  private DetachFormulaCell(row: number): void {
    const formula = this.GetFormulaCell(row);
    if (!formula) return;
    formula.EndListeningTo(this.rDocument);
    this.rDocument.RemoveFromFormulaTrack(formula);
    this.rDocument.RemoveFromFormulaTree(formula);
  }
  /** Broadcasts the represented normal-document source write. Import/clipboard modes remain unsupported. @param row - Valid row. @returns Nothing. */
  private BroadcastNewCell(row: number): void {
    this.Broadcast(row);
  }
  /** Dispatches actual native cell-change hints. @param row - Valid row. @returns Nothing. */
  private Broadcast(row: number): void {
    this.rDocument.Broadcast(
      new ScHint(SfxHintId.ScDataChanged, new ScAddress(this.nCol, row, this.nTab)),
    );
  }
  /** Reads the scalar discriminator;unsupported cell alternatives cannot be inserted in this store. @param row - Valid row. @returns Cell type. */
  GetCellType(row: number): CellType {
    const kind = this.maCells.get_type(row);
    return kind === element_type_numeric
      ? CellType.CELLTYPE_VALUE
      : kind === element_type_string
        ? CellType.CELLTYPE_STRING
        : kind === element_type_formula
          ? CellType.CELLTYPE_FORMULA
          : CellType.CELLTYPE_NONE;
  }
  /** Reads numeric or numeric-formula values with the native zero fallback. @param row - Valid row. @returns Value. */
  GetValue(row: number): number {
    return this.maCells.get_type(row) === element_type_numeric
      ? this.maCells.get(row, double_element_callbacks)
      : (this.GetFormulaCell(row)?.GetValue() ?? 0);
  }
  /** Returns an independent shared string value,or its native empty default. @param row - Valid row. @returns Shared text. */
  GetSharedString(row: number): SharedString {
    return this.maCells.get_type(row) === element_type_string
      ? this.maCells.get(row, string_element_callbacks, string_value_type)
      : new SharedString();
  }
  /** Clears content and its text metadata in the represented scalar stores. @param row - Valid row. @returns Nothing. */
  Delete(row: number): void {
    this.DetachFormulaCell(row);
    this.maCells.set_empty(row, row);
    this.maCellTextAttrs.set_empty(row, row);
    this.Broadcast(row);
  }
}
