/** @fileoverview Original table2.cxx default-content clipboard dispatch over real contiguous columns. */
import type { CopyToDocContext } from "../../../inc/clipcontext";
import { InsertDeleteFlags } from "../../../inc/global";
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

/** Original conditional-format attribute traversal allocates only the actual covered columns. @param this - Destination sheet. @param ranges - Native ranges. @param index - Format key. @returns Nothing. */
export function AddCondFormatData(
  this: ScTable,
  ranges: import("../../../inc/rangelst").ScRangeList,
  index: number,
): void {
  for (const range of ranges)
    for (let col = range.aStart.Col(); col <= range.aEnd.Col(); ++col)
      this.CreateColumnIfNotExists(col).AddCondFormat(range.aStart.Row(), range.aEnd.Row(), index);
}

/** Original conditional-index removal clamps to allocated columns without creating storage. @param this - Destination sheet. @param ranges - Native ranges. @param index - Key,or zero for all. @returns Nothing. */
export function RemoveCondFormatData(
  this: ScTable,
  ranges: import("../../../inc/rangelst").ScRangeList,
  index: number,
): void {
  for (const range of ranges) {
    const last = this.ClampToAllocatedColumns(range.aEnd.Col());
    for (let col = range.aStart.Col(); col <= last; ++col)
      (this["aCol"][col] as ScColumn).RemoveCondFormat(range.aStart.Row(), range.aEnd.Row(), index);
  }
}

/** Original table2 Undo traverses all allocated columns and restores full-axis geometry. Sheet-local names are outside the represented kernel. @param this - Actual Undo sheet. @param context - Destination copy context. @param col1 - First edited column. @param row1 - First edited row. @param col2 - Last edited column. @param row2 - Last edited row. @param flags - Original copy flags. @param marked - Original mark argument. @param target - Actual destination. @returns Nothing. */
export function UndoToTable(
  this: ScTable,
  context: CopyToDocContext,
  col1: number,
  row1: number,
  col2: number,
  row2: number,
  flags: InsertDeleteFlags,
  marked: boolean,
  target: ScTable,
): void {
  const doc = this["rDocument"];
  if (!(doc.ValidColRow(col1, row1) && doc.ValidColRow(col2, row2))) return;
  const width =
    row1 === 0 &&
    row2 === doc.MaxRow() &&
    this["mpColWidth"] !== null &&
    target["mpColWidth"] !== null;
  const height =
    col1 === 0 &&
    col2 === doc.MaxCol() &&
    this["mpRowHeights"] !== null &&
    target["mpRowHeights"] !== null;
  for (let col = 0; col < this["aCol"].length; ++col) {
    const destination = target.CreateColumnIfNotExists(col),
      source = this["aCol"][col] as ScColumn;
    if (col >= col1 && col <= col2)
      source.UndoToColumn(context, row1, row2, flags, marked, destination);
    else
      source.CopyToColumn(context, 0, doc.MaxRow(), InsertDeleteFlags.FORMULA, false, destination);
  }
  if (flags & InsertDeleteFlags.ATTRIB)
    target.SetCondFormList(
      (this["mpCondFormatList"] as NonNullable<ScTable["mpCondFormatList"]>).Clone(
        target["rDocument"],
      ),
    );
  if (!(width || height)) return;
  if (width) {
    const destination = target["mpColWidth"] as NonNullable<ScTable["mpColWidth"]>;
    destination.CopyFrom(this["mpColWidth"] as NonNullable<ScTable["mpColWidth"]>, col1, col2);
    target.SetColManualBreaks(new Set(this["maColManualBreaks"]));
  }
  if (height) {
    target.CopyRowHeight(this, row1, row2, 0);
    target.SetRowManualBreaks(new Set(this["maRowManualBreaks"]));
  }
}
