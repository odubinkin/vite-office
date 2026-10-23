/** @fileoverview Original documen9.cxx Clear releases actual sheets and selection attributes;drawing services are unported. */
import type { ScDocument } from "../../../inc/document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";
/** Clears actual sheet content and its observable native formula/attribute ownership before releasing sheets. @param this - Document. @returns Nothing. */
export function Clear(this: ScDocument): void {
  for (let tab = 0; tab < this.GetTableCount(); ++tab) {
    if (!this.FetchTable(tab)) continue;
    const iterator = new ScHorizontalCellIterator(this, tab, 0, 0, this.MaxCol(), this.MaxRow()),
      col: [number] = [0],
      row: [number] = [0];
    let cell;
    while ((cell = iterator.GetNext(col, row))) cell.getFormula()?.Dispose();
    this.FetchTable(tab)?.DisposeAttributes();
  }
  this["maTabs"].length = 0;
  this["pSelectionAttr"]?.Dispose();
  this["pSelectionAttr"] = undefined;
}
