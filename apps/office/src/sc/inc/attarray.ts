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

/** Original frame-line accumulation states. */
export const SC_LINE_EMPTY = 0;
/** Original observed uniform line state. */
export const SC_LINE_SET = 1;
/** Original mixed-line state. */
export const SC_LINE_DONTCARE = 2;
/** Original six independently accumulated outer/inner line flags. */
export class ScLineFlags {
  nLeft = SC_LINE_EMPTY;
  nRight = SC_LINE_EMPTY;
  nTop = SC_LINE_EMPTY;
  nBottom = SC_LINE_EMPTY;
  nHori = SC_LINE_EMPTY;
  nVert = SC_LINE_EMPTY;
}
