/** @fileoverview Defines automatic-style families and shared ownership contracts of pinned sw/inc/istyleaccess.hxx. */
import type { SfxItemSet } from "../../svl/source/items/itemset";

/** Native family identities routed to character and paragraph pools. */
export enum SwAutoStyleFamily {
  AUTO_STYLE_CHAR = 0,
  AUTO_STYLE_RUBY = 1,
  AUTO_STYLE_PARA = 2,
  AUTO_STYLE_NOTXT = 3,
}

/** Document automatic-style access with owning shared-pointer handles. */
export interface IStyleAccess {
  /** Appends owning copies of used automatic styles. @param output - Native result vector. @param family - Automatic-style family. @returns Nothing. */
  getAllStyles(output: SfxItemSet[], family: SwAutoStyleFamily): void;
  /** Original cache clear releases cache-owned shared pointers. @returns Nothing. */
  clearCaches(): void;
  /** Logical native style-access destructor. @returns Nothing. */
  Dispose(): void;
  /** Caches the native style by handle identity. @param set - Concrete items. @param family - Automatic-style family. @returns Shared handle. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily): SfxItemSet;
  /** Resolves a cached native handle. @param name - Opaque identity. @param family - Automatic-style family. @returns Handle when registered. */
  getByName(name: string, family: SwAutoStyleFamily): SfxItemSet | undefined;
  /** Gets an owning automatic-style shared pointer. @param set - Concrete items. @param family - Automatic-style family. @param parentName - Optional native parent name. @returns Owned shared pointee. */
  getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily, parentName?: string): SfxItemSet;
}
