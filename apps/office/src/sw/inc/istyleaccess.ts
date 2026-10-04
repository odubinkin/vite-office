/** @fileoverview Defines the implemented character branch of pinned sw/inc/istyleaccess.hxx. */
import type { SfxItemSet } from "../../svl/source/items/itemset";

/** Native family identity for the currently implemented automatic character pool. */
export enum SwAutoStyleFamily {
  AUTO_STYLE_CHAR = 0,
}

/** Document automatic-style access; other native families and cache/iteration methods remain unimplemented. */
export interface IStyleAccess {
  /** Gets a shared automatic character style. @param set - Concrete character items. @param family - Character family. @returns Document-owned handle. */
  getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet;
}
