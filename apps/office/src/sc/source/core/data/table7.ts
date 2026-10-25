/** @fileoverview Original table7.cxx pre-paste deletion over actual allocated columns and source columns. */
import { EndListeningIntersectedGroups as endColumnGroups } from "./column4";
import type { EndListeningContext } from "../../../inc/listenercontext";
import type { ScAddress } from "../../../inc/address";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { ScTable } from "../../../inc/table";
import { CRFlags } from "../../../inc/global";
import type { ScColumn } from "../../../inc/column";
/** Original allocated-column merge query does not allocate a column for a read. @param this - Actual sheet. @param col - Queried column. @param row - Queried row. @returns Whether the cell is a merged anchor. */
export function IsMerged(this: ScTable, col: number, row: number): boolean {
  if (!this.GetDoc().ValidCol(col) || col >= this.GetAllocatedColumnsCount()) return false;
  return (this["aCol"][col] as ScColumn).IsMerged(row);
}
/** Original table7 pre-paste deletion visits allocated destination columns and repeats source columns. Protected/conditional formats are not part of CONTENTS. @param this - Actual table. @param context - Paste context. @param clipTable - Actual source sheet. @param broadcasts - Deferred broadcasts. @returns Nothing. */
export function DeleteBeforeCopyFromClip(
  this: ScTable,
  context: CopyFromClipContext,
  clipTable: ScTable,
  broadcasts: ColumnSpanSet,
): void {
  const range = context.getDestRange();
  if (!this["rDocument"].ValidCol(range.mnCol1) || !this["rDocument"].ValidCol(range.mnCol2))
    return;
  const source = context.getClipDoc().GetClipParam().getWholeRange();
  let clipCol = source.aStart.Col();
  const last = Math.min(range.mnCol2, this["aCol"].length - 1);
  for (let col = range.mnCol1; col <= last; ++col, ++clipCol) {
    if (clipCol > source.aEnd.Col()) clipCol = source.aStart.Col();
    const sourceCol = clipTable.CreateColumnIfNotExists(clipCol);
    (this["aCol"][col] as ScColumn).DeleteBeforeCopyFromClip(context, sourceCol, broadcasts);
  }
}

/** Original table7 column repetition for the admitted CONTENTS context. Whole-row height propagation retains the original first-row-only manual flag update. Attribute/conditional/drawing services remain unrepresented. @param this - Actual destination. @param context - Prepared native single-row context. @param col1 - First destination column. @param row1 - First destination row. @param col2 - Last destination column. @param row2 - Last destination row. @param sourceRow - Source row. @param source - Borrowed actual source table. @returns Nothing. */
export function CopyOneCellFromClip(
  this: ScTable,
  context: CopyFromClipContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  sourceRow: number,
  source: ScTable,
): void {
  const area = context.getClipDoc().GetClipParam().getWholeRange(),
    width = area.aEnd.Col() - area.aStart.Col() + 1;
  for (let col = col1; col <= col2; ++col)
    this.CreateColumnIfNotExists(col).CopyOneCellFromClip(
      context,
      row1,
      row2,
      (col - col1) % width,
    );
  const heights = this["mpRowHeights"],
    flags = this["pRowFlags"],
    sourceFlags = source["pRowFlags"];
  if (col1 === 0 && col2 === this.GetDoc().MaxCol() && heights) {
    heights.setValue(row1, row2, source.GetOriginalHeight(sourceRow));
    if (flags && sourceFlags) {
      if (sourceFlags.GetValue(sourceRow) & CRFlags.ManualSize)
        flags.OrValue(row1, CRFlags.ManualSize);
      else flags.AndValue(row1, CRFlags.All & ~CRFlags.ManualSize);
    }
  }
}

/** Original table7 allocated-column boundary teardown. @param this - Actual table. @param context - Shared end context. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param groups - Optional native output. @returns Nothing. */
export function EndListeningIntersectedGroups(
  this: ScTable,
  context: EndListeningContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  groups: ScAddress[] | null,
): void {
  if (
    col2 < col1 ||
    col1 < 0 ||
    col1 >= this.GetAllocatedColumnsCount() ||
    !this.GetDoc().ValidCol(col2)
  )
    return;
  for (let col = col1; col <= this.ClampToAllocatedColumns(col2); ++col)
    endColumnGroups.call(this.FetchColumn(col) as ScColumn, context, row1, row2, groups);
}
