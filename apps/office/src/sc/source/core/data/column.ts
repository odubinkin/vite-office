/** @fileoverview Scalar/local-reference column storage and native single-cell broadcasters. Rich text,notes,area/group services remain unsupported. */
import {
  CellStoreType,
  element_type_empty,
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
import { CellType, InsertDeleteFlags } from "../../../inc/global";
import {
  element_type_numeric,
  element_type_string,
  celltextattr_element_callbacks,
} from "../../../inc/mtvelements";
import { CellTextAttr } from "../../../inc/celltextattr";
import type { ScDocument } from "../../../inc/document";
import type { ScMergePatternState } from "../../../inc/attarray";
import type { ScMarkData } from "../../../inc/markdata";
import { ScMultiSelIter } from "../../../inc/markmulti";

import { ScAttrArray } from "./attarray";
import { ScPatternAttr, CellAttributeHolder } from "../../../inc/patattr";
/** Attribute portion of native ScColumnData, also used for the real default column. */
export class ScColumnData {
  /** Original column.hxx forwarding to the actual attribute array. @param state - Selection accumulator. @param first - First row. @param last - Last row. @param deep - Include inherited items. @returns Nothing. */
  MergePatternArea(state: ScMergePatternState, first: number, last: number, deep: boolean): void {
    this.pAttrArray.MergePatternArea(first, last, state, deep);
  }
  protected nCol = 0;
  protected nTab = 0;
  protected pAttrArray: ScAttrArray;
  /** Creates an uninitialized-position attribute owner. @param rDocument - Document. @returns Owner. */
  constructor(protected readonly rDocument: ScDocument) {
    this.pAttrArray = new ScAttrArray(0, 0, rDocument);
  }
  /** Initializes native position and default-column inheritance. @param col - Column or sentinel. @param tab - Sheet. @param defaults - Real default column. @returns Nothing. */
  Init(col: number, tab: number, defaults?: ScColumnData): void {
    this.nCol = col;
    this.nTab = tab;
    this.pAttrArray.Dispose();
    this.pAttrArray = new ScAttrArray(col, tab, this.rDocument, defaults?.pAttrArray);
  }
  /** Updates source sheet position. @param tab - Sheet. @returns Nothing. */
  SetTabNo(tab: number): void {
    this.nTab = tab;
  }
  /** Releases real canonical registrations. @returns Nothing. */
  DisposeAttributes(): void {
    this.pAttrArray.Dispose();
  }
  /** Borrows a canonical pattern. @param row - Row. @returns Pattern or null. */
  GetPattern(row: number): ScPatternAttr | null {
    return this.pAttrArray.GetPattern(row);
  }
  /** Borrows a complete attribute run. @param start - First output. @param end - Last output. @param row - Query row. @returns Pattern or null. */
  GetPatternRange(start: [number], end: [number], row: number): ScPatternAttr | null {
    return this.pAttrArray.GetPatternRange(start, end, row);
  }
  /** Replaces actual run attributes. @param start - Ordered first row. @param end - Ordered last row. @param pattern - Canonical holder. @returns Nothing. */
  SetPatternArea(start: number, end: number, pattern: CellAttributeHolder): void {
    this.pAttrArray.SetPatternArea(start, end, pattern);
  }
  /** Applies the source itemset delta while retaining each existing pattern's other attributes. The native pool-cache search is an omitted optimization. @param start - First row. @param end - Last row. @param delta - Attribute delta without unported borders. @returns Whether changed. */
  ApplyPatternArea(start: number, end: number, delta: ScPatternAttr): boolean {
    if (!this.rDocument.ValidRow(start) || !this.rDocument.ValidRow(end)) return false;
    let changed = false;
    const first: [number] = [0],
      last: [number] = [0];
    for (let row = start; row <= end;) {
      const old = this.GetPatternRange(first, last, row) as ScPatternAttr;
      const next = new ScPatternAttr(old);
      next.GetItemSetWritable().PutSet(delta.GetItemSet());
      const holder = new CellAttributeHolder(next, true);
      try {
        const stop = Math.min(end, last[0]);
        if (!ScPatternAttr.areSame(old, holder.getScPatternAttr())) {
          this.SetPatternArea(row, stop, holder);
          changed = true;
        }
        row = stop + 1;
      } finally {
        holder.Dispose();
      }
    }
    return changed;
  }
}
/** Numeric/string/formula column owner;cells are not stored in an application-side grid. */
export class ScColumn extends ScColumnData {
  /** Consumed unmarked CopyToColumn STRING/CopyByCloneHandler string-block path;native typed-store writes and text metadata avoid introducing setter broadcasts. Attribute copying remains with the existing document run-copy owner. @param first - First row. @param last - Last row. @param target - Actual target column. @returns Nothing. */
  CopyToColumn(first: number, last: number, target: ScColumn): void {
    const end = this.maCells.cend();
    for (
      const position = this.maCells.cposition(first).first;
      !position.equals(end);
      position.increment()
    ) {
      const block = position.get();
      if (block.position > last) break;
      if (block.type !== element_type_string) continue;
      for (
        let row = Math.max(first, block.position);
        row <= Math.min(last, block.position + block.size - 1);
        row++
      ) {
        const string = this.GetSharedString(row);
        try {
          target.DetachFormulaCell(row);
          if (string.isEmpty()) {
            target.maCells.set_empty(row, row);
            target.maCellTextAttrs.set_empty(row, row);
          } else {
            const copy =
              this.rDocument.GetPool() === target.rDocument.GetPool()
                ? new SharedString(string)
                : target.rDocument.GetSharedStringPool().intern(string.getString());
            try {
              target.maCells.set(row, copy, string_element_callbacks);
              target.maCellTextAttrs.set(row, new CellTextAttr(), celltextattr_element_callbacks);
            } finally {
              copy.dispose();
            }
          }
        } finally {
          string.dispose();
        }
      }
    }
  }
  /** Consumed native column3.cxx attribute-only deletion;unrepresented content/style deletion is rejected before mutation. Plain cells have no EditEngine attributes to strip. @param first - First row. @param last - Last row. @param flags - HARDATTR/EDITATTR and optional internal NOCAPTIONS. @returns Nothing. */
  DeleteArea(first: number, last: number, flags: InsertDeleteFlags): void {
    if (
      flags &
      ~(InsertDeleteFlags.HARDATTR | InsertDeleteFlags.EDITATTR | InsertDeleteFlags.NOCAPTIONS)
    )
      throw new Error("Only native hard-attribute deletion is implemented");
    if (flags & InsertDeleteFlags.HARDATTR) this.pAttrArray.DeleteHardAttr(first, last);
  }
  /** Original DeleteSelection visits only actual multi-mark row spans for this allocated column. @param flags - Consumed deletion flags. @param marks - Native marks. @returns Nothing. */
  DeleteSelection(flags: InsertDeleteFlags, marks: ScMarkData): void {
    if (marks.IsMultiMarked()) {
      const iterator = new ScMultiSelIter(marks.GetMultiSelData(), this.nCol);
      for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0))
        this.DeleteArea(result[1], result[2], flags);
    }
  }
  /** Original disjoint row-span traversal over native multi-selection data. @param state - Selection accumulator. @param marks - Actual marks. @param deep - Include inherited values. @returns Nothing. */
  MergeSelectionPattern(state: ScMergePatternState, marks: ScMarkData, deep: boolean): void {
    if (marks.IsMultiMarked()) {
      const multi = marks.GetMultiSelData();
      if (multi.HasMarks(this.nCol)) {
        const iterator = new ScMultiSelIter(multi, this.nCol);
        for (let result = iterator.Next(0, 0); result[0]; result = iterator.Next(0, 0))
          this.pAttrArray.MergePatternArea(result[1], result[2], state, deep);
      }
    }
  }
  /** Reads actual typed-block emptiness, excluding formatting. @returns Whether no cell payload exists. */
  IsEmptyData(): boolean {
    return (
      this.maCells.block_size() === 1 && this.maCells.cbegin().get().type === element_type_empty
    );
  }
  /** Reads the first payload row from the leading native block. @returns Row or native empty zero. */
  GetFirstDataPos(): number {
    if (this.IsEmptyData()) return 0;
    const first = this.maCells.cbegin().get();
    return first.type !== element_type_empty ? 0 : first.size;
  }
  /** Reads the last payload row from the trailing native block. @returns Row or native empty zero. */
  GetLastDataPos(): number {
    if (this.IsEmptyData()) return 0;
    const last = this.maCells.crbegin().get();
    return last.type !== element_type_empty
      ? this.rDocument.MaxRow()
      : this.rDocument.MaxRow() - last.size;
  }
  /** Native friend-visible logical counters used by CellStoreEvent; no lifetime accounting. */
  mnBlkCountFormula = 0;
  mnBlkCountCellNotes = 0;
  private readonly maBroadcasters: BroadcasterStoreType;
  private readonly maCells: CellStoreType;
  private readonly maCellTextAttrs: CellTextAttrStoreType;
  /** Creates empty stores spanning the document's actual row domain. @param rDocument - Owning document. @returns Column. */
  constructor(rDocument: ScDocument) {
    super(rDocument);
    this.maBroadcasters = new BroadcasterStoreType(rDocument.GetMaxRowCount());
    this.maCells = new CellStoreType(new CellStoreEvent(this));
    this.maCells.resize(rDocument.GetMaxRowCount());
    this.maCellTextAttrs = new CellTextAttrStoreType(rDocument.GetMaxRowCount());
  }
  /** Updates native sheet identity in every real formula cell after sheet insertion. Formatting attributes remain a declared gap. @param tab - Sheet. @returns Nothing. */
  override SetTabNo(tab: number): void {
    super.SetTabNo(tab);
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
