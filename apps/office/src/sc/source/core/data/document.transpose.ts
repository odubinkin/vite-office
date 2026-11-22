/** @fileoverview Native temporary Calc clipboard transposition. */
import type { ScDocument } from "../../../inc/document";
import { HasAttrFlags, type InsertDeleteFlags } from "../../../inc/global";
import { TransposeTableClip } from "./table2.transpose";

/** Copies an admitted source clipboard into another native clip with the requested orientation. @param this - Original clipboard document. @param target - Transposed clipboard document. @param flags - Original insertion flags. @param asLink - Original link policy. @param includeFiltered - Whether filtered rows are included. @returns Nothing. */
export function TransposeClip(
  this: ScDocument,
  target: ScDocument,
  flags: InsertDeleteFlags,
  asLink: boolean,
  includeFiltered: boolean,
): void {
  const source = this.GetClipParam();
  if (!this.IsClipboard() || !target.IsClipboard())
    throw Error("TransposeClip requires native clipboard documents");
  if (source.mbCutMode || source.isMultiRange() || asLink || this.HasClipFilteredRows())
    throw Error("Nondefault native clipboard transposition is not implemented");
  const range = source.getWholeRange();
  if (this.HasAttrib(range, HasAttrFlags.Merged))
    throw Error("Transposition of merged source areas is not implemented");

  target.ResetClip(this, null);
  target.SetGrammar(this.GetGrammar());
  const names = this.GetRangeName();
  if (names) target.GetRangeName()?.Assign(names);
  for (let index = 0; index < this.GetTableCount(); ++index) {
    const sourceTable = this.FetchTable(index);
    const targetTable = target.FetchTable(index);
    if (sourceTable && targetTable) TransposeTableClip(sourceTable, targetTable, range, flags);
  }
  target.SetClipParam(source);
  target.GetClipParam().transpose(this, includeFiltered, false);
}
