/** @fileoverview Original document10.cxx delayed formula-group ownership and regroup routing. */
import type { CopyFromClipContext } from "../../../inc/clipcontext";
import type { ScMarkData } from "../../../inc/markdata";
import type { ColumnSpanSet } from "../../../inc/columnspanset";
import type { ScTable } from "../../../inc/table";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScFormulaCell } from "../../../inc/formulacell";
/** Original range/coordinate regroup overloads operate on the same document's actual sheets. @param this - Actual document. @param args - Native range or sheet/column. @returns Nothing. */
export function RegroupFormulaCells(this: ScDocument, ...args: [ScRange] | [number, number]): void {
  if (args[0] instanceof ScRange) {
    const range = args[0];
    for (let tab = range.aStart.Tab(); tab <= range.aEnd.Tab(); tab++)
      for (let col = range.aStart.Col(); col <= range.aEnd.Col(); col++)
        this.RegroupFormulaCells(tab, col);
  } else this.FetchTable(args[0])?.RegroupFormulaCells(args[1] as number);
}
/** Original nullable range owns delayed grouping without a replacement queue. @param this - Actual document. @param delay - Delay flag. @returns Nothing. */
export function DelayFormulaGrouping(this: ScDocument, delay: boolean): void {
  if (delay) this["pDelayedFormulaGrouping"] ??= new ScRange(ScAddress.INITIALIZE_INVALID);
  else {
    const range = this["pDelayedFormulaGrouping"];
    if (range?.IsValid()) this.RegroupFormulaCells(range);
    this["pDelayedFormulaGrouping"] = null;
  }
}
/** Original delayed range grows only when a member lies outside its current bounds. @param this - Actual document with active delay. @param cell - Formula cell. @returns Nothing. */
export function AddDelayedFormulaGroupingCell(this: ScDocument, cell: ScFormulaCell): void {
  const range = this["pDelayedFormulaGrouping"] as ScRange;
  if (!range.Contains(cell.aPos)) range.ExtendTo(new ScRange(cell.aPos));
}

/** Original document10 pooled-resource sharing uses genuine owners and initializes the source helper first. @param this - Destination document. @param source - Source document. @returns Nothing. */
export function SharePooledResources(this: ScDocument, source: ScDocument): void {
  this["mxPoolHelper"] = source["mxPoolHelper"];
  this["mpCellStringPool"] = source["mpCellStringPool"];
  source.getCellAttributeHelper();
  this["mpCellAttributeHelper"] = source["mpCellAttributeHelper"];
}

/** Original document10 pre-paste deletion cycles actual sparse clipboard tabs only for selected existing destinations. @param this - Destination document. @param context - Paste context. @param marks - Native selected tabs. @param broadcasts - Deferred changed spans. @returns Nothing. */
export function DeleteBeforeCopyFromClip(
  this: ScDocument,
  context: CopyFromClipContext,
  marks: ScMarkData,
  broadcasts: ColumnSpanSet,
): void {
  let clipTab = 0;
  const clip = context.getClipDoc(),
    count = clip.GetTableCount();
  for (let tab = context.getTabStart(); tab <= context.getTabEnd(); ++tab) {
    const table = this.FetchTable(tab);
    if (!table || !marks.GetTableSelect(tab)) continue;
    // A populated clipboard is the original caller precondition.
    while (!clip.FetchTable(clipTab)) clipTab = (clipTab + 1) % count;
    table.DeleteBeforeCopyFromClip(context, clip.FetchTable(clipTab) as ScTable, broadcasts);
    clipTab = (clipTab + 1) % count;
  }
}
