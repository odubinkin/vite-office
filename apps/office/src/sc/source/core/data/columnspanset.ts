/** @fileoverview Original RowSpan and ColRowSpan value constructors from columnspanset.cxx. */
import { ScRange, ValidTab } from "../../../inc/address";
import type { SCROW, SCCOLROW } from "../../../inc/types";
import { flat_segment_tree } from "../../../../external/mdds/include/mdds/flat_segment_tree";
import type { const_iterator } from "../../../../external/mdds/include/mdds/flat_segment_tree_itr";
import type { ScDocument } from "../../../inc/document";

/** Original inclusive row endpoint value. */
export class RowSpan {
  /** Initializes both original signed32 fields. @param row1 - First row. @param row2 - Last row. @returns Value. */
  public constructor(
    public mnRow1: SCROW,
    public mnRow2: SCROW,
  ) {
    this.mnRow1 |= 0;
    this.mnRow2 |= 0;
  }
}
/** Original inclusive column-or-row endpoint value. */
export class ColRowSpan {
  /** Initializes both original signed32 fields. @param start - First position. @param end - Last position. @returns Value. */
  public constructor(
    public mnStart: SCCOLROW,
    public mnEnd: SCCOLROW,
  ) {
    this.mnStart |= 0;
    this.mnEnd |= 0;
  }
}

/** Consumed original ColumnSpanSet::ColumnAction contract. */
export interface ColumnAction {
  /** Starts one actual allocated native column. @param column - Column owner. @returns Nothing. */
  startColumn(column: import("../../../inc/column").ScColumn): void;
  /** Executes the original inclusive row span. @param first - First row. @param last - Last row. @param value - Native span flag. @returns Nothing. */
  execute(first: number, last: number, value: boolean): void;
}
/** Original optional per-column segmented owner and insertion hint. */
class ColumnType {
  readonly maSpans: flat_segment_tree<boolean>;
  miPos: const_iterator<boolean>;
  /** Original inclusive end becomes the tree's exclusive end plus one. @param first - First row. @param last - Inclusive last row. @param initial - Initial flag. @returns Column spans. */
  constructor(first: number, last: number, initial: boolean) {
    this.maSpans = new flat_segment_tree(first, last + 1, initial);
    this.miPos = this.maSpans.begin();
  }
}
/** Original sparse optional-column tables for bulk notifications;scan and SingleColumnSpanSet consumers remain separate. */
export class ColumnSpanSet {
  private readonly maTables: (ColumnType | undefined)[][] = [];
  /** Original lazy table/vector growth and initialized column. Range overload callers provide valid ordered ranges as upstream. @param doc - Limits owner. @param tab - Sheet. @param col - Column. @returns Actual segmented owner. */
  private getColumn(doc: ScDocument, tab: number, col: number): ColumnType {
    while (this.maTables.length <= tab) this.maTables.push([]);
    const table = this.maTables[tab] as (ColumnType | undefined)[];
    if (table.length <= col) table.length = col + 1;
    return (table[col] ??= new ColumnType(0, doc.MaxRow(), false));
  }
  /** Original range overload consumes its valid ordered range precondition. @param doc - Limits owner. @param range - Inclusive range. @param value - Flag. @returns Nothing. */
  set(doc: ScDocument, range: ScRange, value: boolean): void;
  /** Original one-row overload validates coordinates. @param doc - Limits owner. @param tab - Sheet. @param col - Column. @param row - Row. @param value - Flag. @returns Nothing. */
  set(doc: ScDocument, tab: number, col: number, row: number, value: boolean): void;
  /** Original inclusive row-span overload validates endpoints. @param doc - Limits owner. @param tab - Sheet. @param col - Column. @param first - First row. @param last - Last row. @param value - Flag. @returns Nothing. */
  set(doc: ScDocument, tab: number, col: number, first: number, last: number, value: boolean): void;
  /** Selects native range and coordinate overloads without flattening spans into rows. @param doc - Limits owner. @param args - Original overload arguments. @returns Nothing. */
  set(
    doc: ScDocument,
    ...args:
      | [ScRange, boolean]
      | [number, number, number, boolean]
      | [number, number, number, number, boolean]
  ): void {
    if (args[0] instanceof ScRange) {
      const [range, value] = args as [ScRange, boolean];
      for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); tab++)
        for (let col = range.aStart.Col(); col <= range.aEnd.Col(); col++) {
          const owner = this.getColumn(doc, tab, col);
          owner.miPos = owner.maSpans.insert(
            owner.miPos,
            range.aStart.Row(),
            range.aEnd.Row() + 1,
            value,
          )[0];
        }
      return;
    }
    const [tab, col, first] = args as [number, number, number, boolean],
      last = args.length === 4 ? first : (args[3] as number),
      value = args[args.length - 1] as boolean;
    if (!ValidTab(tab) || !doc.ValidCol(col) || !doc.ValidRow(first) || !doc.ValidRow(last)) return;
    const owner = this.getColumn(doc, tab, col);
    owner.miPos = owner.maSpans.insert(owner.miPos, first, last + 1, value)[0];
  }
  /** Original table/column/leaf order emits both false and true spans and never allocates document columns. @param doc - Actual document. @param action - Native column action. @returns Nothing. */
  executeColumnAction(doc: ScDocument, action: ColumnAction): void {
    for (let tab = 0; tab < this.maTables.length; tab++) {
      const columns = this.maTables[tab] as (ColumnType | undefined)[];
      if (!columns.length) continue;
      const table = doc.FetchTable(tab);
      if (!table) continue;
      for (let col = 0; col < columns.length; col++) {
        const owner = columns[col];
        if (!owner) continue;
        if (col >= table.GetAllocatedColumnsCount()) break;
        action.startColumn(table.FetchColumn(col) as import("../../../inc/column").ScColumn);
        const iterator = owner.maSpans.begin(),
          end = owner.maSpans.end();
        let first = iterator.value().first,
          value = iterator.value().second;
        for (iterator.increment(); !iterator.equals(end); iterator.increment()) {
          const last = iterator.value().first - 1;
          action.execute(first, last, value);
          first = last + 1;
          value = iterator.value().second;
        }
      }
    }
  }
}
/** Original optimized single-range column span owner. */
export class RangeColumnSpanSet {
  private readonly range: import("../../../inc/address").ScRange;
  /** Copies the actual range value. @param range - Source range. @returns Span owner. */
  constructor(range: import("../../../inc/address").ScRange) {
    this.range = new ScRange(range);
  }
  /** Executes original sheet/allocated-column order without expanding sparse rows. @param doc - Document. @param action - Native column action. @returns Nothing. */
  executeColumnAction(doc: import("../../../inc/document").ScDocument, action: ColumnAction): void {
    for (let tab = this.range.aStart.Tab(); tab <= this.range.aEnd.Tab(); tab++) {
      const table = doc.FetchTable(tab);
      if (!table) continue;
      const end = table.ClampToAllocatedColumns(this.range.aEnd.Col());
      for (let col = this.range.aStart.Col(); col <= end; col++) {
        if (!doc.ValidCol(col)) break;
        action.startColumn(table.CreateColumnIfNotExists(col));
        action.execute(this.range.aStart.Row(), this.range.aEnd.Row(), true);
      }
    }
  }
}
