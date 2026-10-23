/** @fileoverview Original table2.cxx default-content clipboard dispatch over real contiguous columns. */
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { SfxHintId } from "../../../../svl/inc/hint";
import type { ScTable } from "../../../inc/table";
import type { ScColumn } from "../../../inc/column";
import type { CopyFromClipContext } from "../../../inc/clipcontext";
/** Original validated general clipboard rectangle;CONTENTS preserves destination attributes and row/column geometry. @param this - Actual destination sheet. @param context - Native paste context. @param col1 - First destination column. @param row1 - First destination row. @param col2 - Last destination column. @param row2 - Last destination row. @param dx - Source-to-destination column displacement. @param dy - Source-to-destination row displacement. @param source - Actual clipboard sheet. @returns Nothing. */
export function CopyFromClip(
  this: ScTable,
  context: CopyFromClipContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  dx: number,
  dy: number,
  source: ScTable,
): void {
  col2 = Math.min(col2, this["rDocument"].MaxCol());
  row2 = Math.min(row2, this["rDocument"].MaxRow());
  if (!this["rDocument"].ValidColRow(col1, row1) || !this["rDocument"].ValidColRow(col2, row2))
    return;
  this.CreateColumnIfNotExists(col2);
  for (let col = col1; col <= col2; ++col) {
    const sourceColumn = source.CreateColumnIfNotExists(col - dx);
    (this["aCol"][col] as ScColumn).CopyFromClip(context, row1, row2, dy, sourceColumn);
  }
}

/** Original allocated-column clipping for deferred clipboard dirty processing. @param this - Actual sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param spans - Deferred changes. @returns Nothing. */
export function SetDirtyFromClip(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  spans: ColumnSpanSet,
): void {
  col2 = Math.min(col2, this["aCol"].length - 1, this["rDocument"].MaxCol());
  row2 = Math.min(row2, this["rDocument"].MaxRow());
  if (this["rDocument"].ValidColRow(col1, row1) && this["rDocument"].ValidColRow(col2, row2))
    for (let col = col1; col <= col2; ++col)
      (this["aCol"][col] as ScColumn).SetDirtyFromClip(row1, row2, spans);
}
/** Original per-table sparse broadcaster delivery suppresses auto calc for the whole column walk. @param this - Actual sheet. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @param id - Hint ID. @returns Whether delivered. */
export function BroadcastBroadcasters(
  this: ScTable,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  id: SfxHintId,
): boolean {
  const old = this["rDocument"].GetAutoCalc();
  this["rDocument"].SetAutoCalc(false);
  let delivered = false;
  try {
    col2 = this.ClampToAllocatedColumns(col2);
    for (let col = col1; col <= col2; ++col)
      delivered =
        (this["aCol"][col] as ScColumn).BroadcastBroadcasters(row1, row2, id) || delivered;
    return delivered;
  } finally {
    this["rDocument"].SetAutoCalc(old);
  }
}
