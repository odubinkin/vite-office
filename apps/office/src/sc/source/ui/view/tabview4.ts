/** @fileoverview Original ordinary formula reference Init/Update/Done orchestration;VCL overlays,merged,embedded and fill services remain unported. */
import { ScRange } from "../../../inc/address";
import type { ScTabView } from "../inc/tabview";
import { ScRefType } from "../inc/viewdata";
/** Original formula reference initialization does not alter the editing cursor or ordinary marks. @param this - Actual view. @param col - Pointed column. @param row - Pointed row. @param tab - Pointed sheet. @param type - Reference kind. @returns Nothing. */
export function InitRefMode(
  this: ScTabView,
  col: number,
  row: number,
  tab: number,
  type: ScRefType,
): void {
  const data = this.GetViewData();
  if (data.IsRefMode()) return;
  if (type !== ScRefType.SC_REFTYPE_REF)
    throw new Error("Non-formula reference modes are not implemented");
  data.SetRefMode(true, type);
  data.SetRefStart(col, row, tab);
  data.SetRefEnd(col, row, tab);
  if (tab === data.GetTabNumber())
    this["referenceModule"]?.SetReference(new ScRange(col, row, tab), data.GetDocument());
}
/** Original reference update creates continuation when no active drag exists and inserts the ordered native range. @param this - Actual view. @param col - Pointed column. @param row - Pointed row. @param tab - Pointed sheet. @returns Nothing. */
export function UpdateRef(this: ScTabView, col: number, row: number, tab: number): void {
  const data = this.GetViewData(),
    module = this["referenceModule"];
  if (!data.IsRefMode()) {
    if (module?.IsFormulaMode()) module.AddRefEntry();
    this.InitRefMode(col, row, tab, ScRefType.SC_REFTYPE_REF);
  }
  if (col === data.GetRefEndX() && row === data.GetRefEndY() && tab === data.GetRefEndZ()) return;
  data.SetRefEnd(col, row, tab);
  module?.SetReference(
    new ScRange(data.GetRefStartX(), data.GetRefStartY(), data.GetRefStartZ(), col, row, tab),
    data.GetDocument(),
  );
}
/** Original completion optionally starts another native argument before clearing the drag lifetime. @param this - Actual view. @param continued - Add another reference argument. @returns Nothing. */
export function DoneRefMode(this: ScTabView, continued: boolean): void {
  const data = this.GetViewData();
  if (data.GetRefType() === ScRefType.SC_REFTYPE_REF && continued)
    this["referenceModule"]?.AddRefEntry();
  data.SetRefMode(false, ScRefType.SC_REFTYPE_NONE);
}
