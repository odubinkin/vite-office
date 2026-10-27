/** @fileoverview Defines the implemented character branch of pinned sw/inc/istyleaccess.hxx. */
import type { SfxItemSet } from "../../svl/source/items/itemset";

/** Native family identity for the currently implemented automatic character pool. */
export enum SwAutoStyleFamily {
  AUTO_STYLE_CHAR = 0,
}

/** Document automatic-style access; the paragraph automatic pool remains outside the represented slice. */
export interface IStyleAccess {
  /** Appends owning copies of used automatic character styles. @param output - Native result vector. @param family - Character family. @returns Nothing. */
  getAllStyles(output: SfxItemSet[], family: SwAutoStyleFamily.AUTO_STYLE_CHAR): void;
  /** Original cache clear releases cache-owned shared pointers. @returns Nothing. */
  clearCaches(): void;
  /** Logical native style-access destructor. @returns Nothing. */
  Dispose(): void;
  /** Caches the native style by handle identity. @param set - Concrete items. @param family - Character family. @returns Shared handle. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet;
  /** Resolves a cached native handle. @param name - Opaque identity. @param family - Character family. @returns Handle when registered. */
  getByName(name: string, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet | undefined;
  /** Gets an owning automatic-style shared pointer. @param set - Concrete items. @param family - Character family. @param parentName - Optional native parent name. @returns Owned shared pointee. */
  getAutomaticStyle(
    set: SfxItemSet,
    family: SwAutoStyleFamily.AUTO_STYLE_CHAR,
    parentName?: string,
  ): SfxItemSet;
}
