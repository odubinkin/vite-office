/** @fileoverview Original attarray.hxx merge-state value and attribute-array boundary. */
import { CellAttributeHolder } from "./patattr";
import type { SfxItemSet } from "../../svl/inc/itemset";
export { ScAttrArray } from "../source/core/data/attarray";

/** Native selection merge accumulator retains two canonical pattern holders and optional merged items. */
export class ScMergePatternState {
  pItemSet: SfxItemSet | undefined;
  readonly aOld1 = new CellAttributeHolder();
  readonly aOld2 = new CellAttributeHolder();
  mbValidPatternId = true;
  mnPatternId = 0n;
  /** Releases the native automatic holder members at the end of the represented stack lifetime. @returns Nothing. */
  Dispose(): void {
    this.aOld2.Dispose();
    this.aOld1.Dispose();
  }
}
