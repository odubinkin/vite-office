/** @fileoverview Native automatic-character StylePool/cache ownership from pinned swstylemanager.cxx; the paragraph pool remains outside the represented slice. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  StylePool,
  acquireStyleHandle,
  releaseStyleHandle,
} from "../../../../svl/source/items/stylepool";
import { SwAutoStyleFamily, type IStyleAccess } from "../../../inc/istyleaccess";

import { SwAttrSet } from "../attr/swatrset";

/** Original native style-name cache; values own their shared pointer, including empty entries created by operator[]. */
class SwStyleCache {
  private readonly mMap = new Map<string, SfxItemSet | undefined>();
  /** Original shared-pointer map assignment. @param style - Borrowed shared pointee. @returns Nothing. */
  addStyleName(style: SfxItemSet): void {
    const name = StylePool.nameOf(style),
      previous = this.mMap.get(name);
    this.mMap.set(name, acquireStyleHandle(style));
    if (previous !== undefined) releaseStyleHandle(previous);
  }
  /** Original complete native pool population. @param pool - Actual pool. @returns Nothing. */
  addCompletePool(pool: StylePool): void {
    pool.populateCacheMap(this.mMap);
  }
  /** Original map operator[] creates an empty entry on a miss and returns an owning pointer copy. @param name - Opaque native identity. @returns Owned shared pointee or empty. */
  getByName(name: string): SfxItemSet | undefined {
    if (!this.mMap.has(name)) this.mMap.set(name, undefined);
    const style = this.mMap.get(name);
    return style === undefined ? undefined : acquireStyleHandle(style);
  }
  /** Original cache clear destroys each map-owned shared pointer. @returns Nothing. */
  clear(): void {
    for (const style of this.mMap.values()) if (style !== undefined) releaseStyleHandle(style);
    this.mMap.clear();
  }
}
/** Internal native style-access owner, distinct from named paragraph-style management. */
class SwStyleManager implements IStyleAccess {
  private readonly autoCharPool = new StylePool();
  private readonly charCache = new SwStyleCache();
  private readonly autoParaPool: StylePool;
  private readonly paraCache = new SwStyleCache();
  /** Creates separate character and paragraph pools. @param ignorableParagraphItems - Paragraph ignorable ranges. @returns Manager. */
  constructor(ignorableParagraphItems?: SfxItemSet) {
    this.autoParaPool = new StylePool(ignorableParagraphItems);
  }
  /** Original insertion through the represented native character pool. @param set - Concrete items. @param family - Character family. @param parentName - Optional native parent name. @returns Owned shared pointee. */
  getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily, parentName?: string): SfxItemSet {
    if (family === SwAutoStyleFamily.AUTO_STYLE_PARA && !(set instanceof SwAttrSet))
      throw new Error("assert paragraph automatic style requires SwAttrSet");
    const pool =
      family === SwAutoStyleFamily.AUTO_STYLE_CHAR ? this.autoCharPool : this.autoParaPool;
    return pool.insertItemSet(set, parentName);
  }
  /** Original insert/cache/return sequence. @param set - Concrete items. @param family - Character family. @returns Owned shared pointee. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily): SfxItemSet {
    const style = this.getAutomaticStyle(set, family);
    const cache = family === SwAutoStyleFamily.AUTO_STYLE_CHAR ? this.charCache : this.paraCache;
    cache.addStyleName(style);
    return style;
  }
  /** Original uncached-name fallback populates the complete pool without replacing its representative-selection policy. @param name - Opaque identity. @param family - Character family. @returns Owned shared pointee or empty. */
  getByName(name: string, family: SwAutoStyleFamily): SfxItemSet | undefined {
    const pool =
        family === SwAutoStyleFamily.AUTO_STYLE_CHAR ? this.autoCharPool : this.autoParaPool,
      cache = family === SwAutoStyleFamily.AUTO_STYLE_CHAR ? this.charCache : this.paraCache;
    let style = cache.getByName(name);
    if (style === undefined) {
      cache.addCompletePool(pool);
      style = cache.getByName(name);
    }
    if (
      style !== undefined &&
      family === SwAutoStyleFamily.AUTO_STYLE_PARA &&
      !(style instanceof SwAttrSet)
    ) {
      releaseStyleHandle(style);
      throw new Error("assert paragraph cached style requires SwAttrSet");
    }
    return style;
  }
  /** Original used-style delegation. @param output - Owning shared-pointer vector. @param family - Character family. @returns Nothing. */
  getAllStyles(output: SfxItemSet[], family: SwAutoStyleFamily): void {
    const pool =
      family === SwAutoStyleFamily.AUTO_STYLE_CHAR ? this.autoCharPool : this.autoParaPool;
    pool.getAllStyles(output);
  }
  /** Original cache clear. @returns Nothing. */
  clearCaches(): void {
    this.charCache.clear();
    this.paraCache.clear();
  }
  /** Logical native manager destruction releases cache before its pool. @returns Nothing. */
  Dispose(): void {
    this.charCache.clear();
    this.paraCache.clear();
    this.autoCharPool.Dispose();
    this.autoParaPool.Dispose();
  }
}
/** Creates a document's automatic-style owner. @param ignorableParagraphItems - Paragraph ignorable ranges. @returns Style-access manager. */
export function createStyleManager(ignorableParagraphItems?: SfxItemSet): IStyleAccess {
  return new SwStyleManager(ignorableParagraphItems);
}
