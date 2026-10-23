/** @fileoverview Original document10.cxx delayed formula-group ownership and regroup routing. */
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
