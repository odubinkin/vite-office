/** @fileoverview Defines consumed automatic-style access branches of pinned sw/inc/istyleaccess.hxx. */
import type { SfxItemSet } from "../../svl/source/items/itemset";

/** Original ordered automatic-style families; all non-character families share the native paragraph pool. */
export enum SwAutoStyleFamily {
  AUTO_STYLE_CHAR = 0,
  AUTO_STYLE_RUBY = 1,
  AUTO_STYLE_PARA = 2,
  AUTO_STYLE_NOTXT = 3,
}

/** Document automatic-style access; native usage traversal and the typed/parent-name overloads remain unimplemented. */
export interface IStyleAccess {
  /** Original generic automatic-style lookup. @param set - Borrowed concrete items. @param family - Original family. @returns Shared style handle. */
  getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily): SfxItemSet;
  /** Caches the native style by handle identity. @param set - Concrete items. @param family - Original family. @returns Shared handle. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily): SfxItemSet;
  /** Resolves a cached native handle. @param name - Opaque identity. @param family - Original family. @returns Handle when registered. */
  getByName(name: string, family: SwAutoStyleFamily): SfxItemSet | undefined;
  /** Original releases both name caches while retaining pools. @returns Nothing. */
  clearCaches(): void;
}
