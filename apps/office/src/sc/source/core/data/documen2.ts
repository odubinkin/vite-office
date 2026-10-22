/** @fileoverview Consumed native ScDocument observable destructor from documen2.cxx,running on its original instance before GC reclaims physical stores. */
import type { ScDocument } from "./document";
import { ScHorizontalCellIterator } from "../../../inc/dociter";

/** Releases consumed native document observer lifetime,starting with area destruction before formula-cell destruction as in documen2. GC owns physical stores. @param this - Actual document instance. @returns Nothing. */
export function Dispose(this: ScDocument): void {
  const machine = this["pBASM"];
  this["pBASM"] = null;
  machine?.Dispose();
  this.DisposeAttributes();
  for (let tab = 0; tab < this.GetTableCount(); tab++) {
    const iterator = new ScHorizontalCellIterator(this, tab, 0, 0, this.MaxCol(), this.MaxRow()),
      col: [number] = [0],
      row: [number] = [0];
    let cell;
    while ((cell = iterator.GetNext(col, row))) cell.getFormula()?.Dispose();
  }
}

/** Releases actual attribute registrations at document closure. @param this - Actual document instance. @returns Nothing. */
export function DisposeAttributes(this: ScDocument): void {
  this["pSelectionAttr"]?.Dispose();
  this["pSelectionAttr"] = undefined;
  for (const table of this["maTabs"]) table.DisposeAttributes();
}
