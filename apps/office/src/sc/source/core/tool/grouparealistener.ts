/** @fileoverview Original formula-group selective area notification over borrowed real column blocks and segmented bulk spans. */
import {
  SvtListener,
  type SvtDyingHint,
  type SvtQueryBase,
} from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScHint } from "../../../inc/brdcst";
import type { ScDocument } from "../../../inc/document";
import type { ScColumn } from "../../../inc/column";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ColumnAction } from "../../../inc/columnspanset";
import { BulkDataHint } from "../../../inc/bulkdatahint";
import { QueryRange } from "../../../inc/listenerquery";
import { SC_LISTENER_QUERY_FORMULA_GROUP_RANGE } from "../../../inc/listenerqueryids";

/** Original CollectCellAction stores borrowed formula identities and orders/deduplicates them before notification. */
class CollectCellAction implements ColumnAction {
  private readonly maPos = new ScAddress();
  private maCells: ScFormulaCell[] = [];
  /** Borrows the actual group listener. @param mrAreaListener - Listener. @returns Action. */
  constructor(private readonly mrAreaListener: FormulaGroupAreaListener) {}
  /** Original column coordinate capture. @param column - Actual column. @returns Nothing. */
  startColumn(column: ScColumn): void {
    this.maPos.SetTab(column.GetTab());
    this.maPos.SetCol(column.GetCol());
  }
  /** Original false spans do not collect cells. @param first - First row. @param last - Last row. @param value - Span flag. @returns Nothing. */
  execute(first: number, last: number, value: boolean): void {
    if (!value) return;
    this.mrAreaListener.collectFormulaCells(
      this.maPos.Tab(),
      this.maPos.Col(),
      first,
      last,
      this.maCells,
    );
  }
  /** Original position-then-pointer order and unique followed by buffer-content swap. Existing allocationIdentity binds native pointer order under GC. @param cells - Receiving actual pointer vector. @returns Nothing. */
  swapCells(cells: ScFormulaCell[]): void {
    this.maCells.sort(
      /** Original deterministic formula position then pointer ordering. @param left - First cell. @param right - Second cell. @returns Order. */ (
        left,
        right,
      ) => left.aPos.compare(right.aPos) || left.allocationIdentity - right.allocationIdentity,
    );
    const unique = this.maCells.filter(
      /** Original adjacent unique after sorting. @param cell - Current cell. @param index - Current offset. @param all - Sorted pointer values. @returns First occurrence. */ (
        cell,
        index,
        all,
      ) => !index || cell !== all[index - 1],
    );
    this.maCells = cells.splice(0, cells.length, ...unique);
  }
}

/** Original area listener retains fixed/relative endpoint policy and borrows the actual owning column. */
export class FormulaGroupAreaListener extends SvtListener<SfxHint> {
  private readonly maRange: ScRange;
  private readonly mpColumn: ScColumn;
  private mnTopCellRow: number;
  private mnGroupLen: number;
  /** Original source invariants require an existing sheet and allocated column at the top position. @param range - Top cell's referenced range. @param mrDocument - Actual document. @param topPosition - Top formula position. @param length - Group length. @param mbStartFixed - Absolute start row. @param mbEndFixed - Absolute end row. @returns Listener. */
  constructor(
    range: ScRange,
    private readonly mrDocument: ScDocument,
    topPosition: ScAddress,
    length: number,
    private readonly mbStartFixed: boolean,
    private readonly mbEndFixed: boolean,
  ) {
    super();
    this.maRange = new ScRange(range);
    this.mnTopCellRow = topPosition.Row();
    this.mnGroupLen = length;
    const table = this.mrDocument.FetchTable(topPosition.Tab());
    if (!table) throw new Error("Assertion failed: group listener sheet exists");
    const column = table.FetchColumn(topPosition.Col());
    if (!column) throw new Error("Assertion failed: group listener column exists");
    this.mpColumn = column;
  }
  /** Original relative end extends by group length minus one. @returns Independent listening range. */
  getListeningRange(): ScRange {
    const range = new ScRange(this.maRange);
    if (!this.mbEndFixed) range.aEnd.IncRow(this.mnGroupLen - 1);
    return range;
  }
  /** Original hint dispatch ignores unrelated and browser lifecycle-only notifications. @param hint - Actual hint. @returns Nothing. */
  override Notify(hint: SfxHint | SvtDyingHint): void {
    if (!(hint instanceof SfxHint)) return;
    if (hint.GetId() === SfxHintId.ScBulkData) this.notifyBulkChange(hint as BulkDataHint);
    else if (
      hint.GetId() === SfxHintId.ScDataChanged ||
      hint.GetId() === SfxHintId.ScTableOpDirty
    ) {
      const data = hint as ScHint;
      this.notifyCellChange(hint, data.GetStartAddress(), data.GetRowCount());
    }
  }
  /** Original query assumes a live top-cell block and adds the group's formula range. @param query - Native query. @returns Nothing. */
  override Query(query: SvtQueryBase): void {
    switch (query.getId()) {
      case SC_LISTENER_QUERY_FORMULA_GROUP_RANGE: {
        const top = this.getTopCell() as ScFormulaCell,
          range = new ScRange(top.aPos);
        range.aEnd.IncRow(this.mnGroupLen - 1);
        (query as QueryRange).add(range);
        break;
      }
      default:
        break;
    }
  }
  /** Original bulk path collects by real spans,sorts and deduplicates before issuing one data-change hint per formula. @param hint - Actual bulk hint. @returns Nothing. */
  private notifyBulkChange(hint: BulkDataHint): void {
    const spans = hint.getSpans();
    if (!spans) return;
    const action = new CollectCellAction(this);
    spans.executeColumnAction(hint.getDoc(), action);
    const cells: ScFormulaCell[] = [];
    action.swapCells(cells);
    const change = new ScHint(SfxHintId.ScDataChanged, new ScAddress());
    for (const cell of cells) cell.Notify(change);
  }
  /** Original sheet/column-filtered overload orders changed row bounds. @param tab - Changed sheet. @param col - Changed column. @param first - First row. @param last - Last row. @param cells - Actual output pointer vector. @returns Nothing. */
  collectFormulaCells(
    tab: number,
    col: number,
    first: number,
    last: number,
    cells: ScFormulaCell[],
  ): void;
  /** Original row-only overload assumes ordered endpoints. @param first - First row. @param last - Last row. @param cells - Actual output pointer vector. @returns Nothing. */
  collectFormulaCells(first: number, last: number, cells: ScFormulaCell[]): void;
  /** Selects the original overload without replacing the borrowed formula block with a copied cell index. @param args - Original overload arguments. @returns Nothing. */
  collectFormulaCells(
    ...args: [number, number, number, number, ScFormulaCell[]] | [number, number, ScFormulaCell[]]
  ): void {
    if (args.length === 5) {
      const [tab, col, first, last, cells] = args;
      if (tab < this.maRange.aStart.Tab() || this.maRange.aEnd.Tab() < tab) return;
      if (col < this.maRange.aStart.Col() || this.maRange.aEnd.Col() < col) return;
      this.collectRows(Math.min(first, last), Math.max(first, last), cells);
    } else this.collectRows(...args);
  }
  /** Original block repair and four fixed/relative endpoint branches retain source selection behavior. @param first - First changed row. @param last - Last changed row. @param cells - Actual output pointer vector. @returns Nothing. */
  private collectRows(first: number, last: number, cells: ScFormulaCell[]): void {
    const size: [number] = [0];
    let pointer = this.mpColumn.GetFormulaCellBlockAddress(this.mnTopCellRow, size);
    if (!pointer) return;
    if (!(pointer.get() as ScFormulaCell).IsSharedTop()) {
      const row = (pointer.get() as ScFormulaCell).GetSharedTopRow();
      if (row >= 0) {
        this.mnTopCellRow = row;
        pointer = this.mpColumn.GetFormulaCellBlockAddress(this.mnTopCellRow, size);
        if (!pointer) return;
      }
    }
    const length = (pointer.get() as ScFormulaCell).GetSharedLength();
    if (length !== this.mnGroupLen) this.mnGroupLen = length;
    if (size[0] < this.mnGroupLen >>> 0) {
      this.mnGroupLen = size[0];
      throw new Error("Assertion failed: formula group length exceeds formula block");
    }
    const end = pointer.copy().advance(this.mnGroupLen);
    let refFirst = this.maRange.aStart.Row(),
      refLast = this.maRange.aEnd.Row();
    if (this.mbStartFixed) {
      if (this.mbEndFixed) {
        if (last < refFirst || refLast < first) return;
        for (; !pointer.equals(end); pointer.advance(1)) cells.push(pointer.get() as ScFormulaCell);
      } else {
        const maxRef = refLast + this.mnGroupLen - 1;
        if (last < refFirst || maxRef < first) return;
        if (refLast < first) pointer.advance(first - refLast);
        for (; !pointer.equals(end); pointer.advance(1)) cells.push(pointer.get() as ScFormulaCell);
      }
    } else if (this.mbEndFixed) {
      if (last < refFirst || refLast < first) return;
      for (; !pointer.equals(end) && refFirst <= refLast; pointer.advance(1), refFirst++)
        cells.push(pointer.get() as ScFormulaCell);
    } else {
      const maxRef = refLast + this.mnGroupLen - 1;
      if (maxRef < first) return;
      if (refLast < first) {
        const skip = first - refLast;
        pointer.advance(skip);
        refFirst += skip;
        refLast += skip;
      }
      for (; !pointer.equals(end) && refFirst <= last; pointer.advance(1), refFirst++, refLast++)
        cells.push(pointer.get() as ScFormulaCell);
    }
  }
  /** Original current top lookup borrows the actual block each time. @returns Cell or null. */
  getTopCell(): ScFormulaCell | null {
    return this.mpColumn.GetFormulaCellBlockAddress(this.mnTopCellRow, [0])?.get() ?? null;
  }
  /** Original changed-span selection forwards the original hint to the selected formulas. @param hint - Actual hint. @param position - Changed position. @param count - Changed row count. @returns Nothing. */
  private notifyCellChange(hint: SfxHint, position: ScAddress, count: number): void {
    const cells: ScFormulaCell[] = [];
    this.collectFormulaCells(
      position.Tab(),
      position.Col(),
      position.Row(),
      position.Row() + count - 1,
      cells,
    );
    for (const cell of cells) cell.Notify(hint);
  }
}
