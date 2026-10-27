/** @fileoverview Native automatic-character StylePool/cache ownership from pinned swstylemanager.cxx; the paragraph pool remains outside the represented slice. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  StylePool,
  acquireStyleHandle,
  releaseStyleHandle,
} from "../../../../svl/source/items/stylepool";
import type { IStyleAccess, SwAutoStyleFamily } from "../../../inc/istyleaccess";

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
  /** Original insertion through the represented native character pool. @param set - Concrete items. @param family - Character family. @param parentName - Optional native parent name. @returns Owned shared pointee. */
  getAutomaticStyle(
    set: SfxItemSet,
    family: SwAutoStyleFamily.AUTO_STYLE_CHAR,
    parentName?: string,
  ): SfxItemSet {
    void family;
    return this.autoCharPool.insertItemSet(set, parentName);
  }
  /** Original insert/cache/return sequence. @param set - Concrete items. @param family - Character family. @returns Owned shared pointee. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet {
    const style = this.getAutomaticStyle(set, family);
    this.charCache.addStyleName(style);
    return style;
  }
  /** Original uncached-name fallback populates the complete pool without replacing its representative-selection policy. @param name - Opaque identity. @param family - Character family. @returns Owned shared pointee or empty. */
  getByName(name: string, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet | undefined {
    void family;
    let style = this.charCache.getByName(name);
    if (style === undefined) {
      this.charCache.addCompletePool(this.autoCharPool);
      style = this.charCache.getByName(name);
    }
    return style;
  }
  /** Original used-style delegation. @param output - Owning shared-pointer vector. @param family - Character family. @returns Nothing. */
  getAllStyles(output: SfxItemSet[], family: SwAutoStyleFamily.AUTO_STYLE_CHAR): void {
    void family;
    this.autoCharPool.getAllStyles(output);
  }
  /** Original cache clear. @returns Nothing. */
  clearCaches(): void {
    this.charCache.clear();
  }
  /** Logical native manager destruction releases cache before its pool. @returns Nothing. */
  Dispose(): void {
    this.charCache.clear();
    this.autoCharPool.Dispose();
  }
}
/** Creates a document's represented automatic-style owner. @returns Style-access manager. */
export function createStyleManager(): IStyleAccess {
  return new SwStyleManager();
}
