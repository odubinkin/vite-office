/** @fileoverview Defines the implemented character branch of pinned sw/inc/istyleaccess.hxx. */
import type { SfxItemSet } from "../../svl/source/items/itemset";

/** Native family identity for the currently implemented automatic character pool. */
export enum SwAutoStyleFamily {
  AUTO_STYLE_CHAR = 0,
}

/** Document automatic-style access; other native families and cache/iteration methods remain unimplemented. */
export interface IStyleAccess {
  /** Gets a shared automatic character style. @param set - Concrete character items. @param family - Character family. @returns Document-owned handle. */
  /** Caches the native style by handle identity. @param set - Concrete items. @param family - Character family. @returns Shared handle. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet;
  /** Resolves a cached native handle. @param name - Opaque identity. @param family - Character family. @returns Handle when registered. */
  getByName(name: string, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet | undefined;
  getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet;
}
