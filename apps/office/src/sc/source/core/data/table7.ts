/** @fileoverview Original table7.cxx pre-paste deletion over actual allocated columns and source columns. */
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { ScTable } from "../../../inc/table";
import type { ScColumn } from "../../../inc/column";
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
