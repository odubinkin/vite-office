/** @fileoverview Original automatic-style family routing, character/paragraph pools and name caches over the actual StylePool owner. Native usage iteration and parent-name/typed overloads remain unported. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { StylePool } from "../../../../svl/source/items/stylepool";
import { SwAttrSet } from "../attr/swatrset";
import { SwAutoStyleFamily as F, type IStyleAccess } from "../../../inc/istyleaccess";
/** Original internal cache; operator[] lookup publishes an empty slot on a miss. */
class SwStyleCache {
  private readonly mMap = new Map<string, SfxItemSet | undefined>();
  /** Original addStyleName retains the actual handle under its native logical identity. @param style - Borrowed style handle. @returns Nothing. */
  addStyleName(style: SfxItemSet): void {
    this.mMap.set(StylePool.nameOf(style), style);
  }
  /** Existing insertion-owner enumeration supplies the cache. Native usage-aware leaf selection remains unverified. @param pool - Actual pool. @returns Nothing. */
  addCompletePool(pool: StylePool): void {
    for (const handle of pool.getAllStyles()) this.addStyleName(handle);
  }
  /** Original operator[] lookup. @param name - Logical pointer name. @returns Retained handle or empty slot. */
  getByName(name: string): SfxItemSet | undefined {
    if (!this.mMap.has(name)) this.mMap.set(name, undefined);
    return this.mMap.get(name);
  }
  /** Original clear releases cache handles. @returns Nothing. */
  clear(): void {
    this.mMap.clear();
  }
}
/** Original manager uses exactly two pools and caches; RUBY/PARA/NOTXT all select the paragraph side. */
class SwStyleManager implements IStyleAccess {
  private readonly m_aAutoCharPool = new StylePool();
  private readonly m_aAutoParaPool: StylePool;
  private readonly maCharCache = new SwStyleCache();
  private readonly maParaCache = new SwStyleCache();
  /** Original paragraph pool receives an empty ignorable range template; character pool has none. @param ignorableParagraphItems - Original optional range template. @returns Manager. */
  constructor(ignorableParagraphItems?: SfxItemSet) {
    this.m_aAutoParaPool = new StylePool(ignorableParagraphItems);
  }
  /** Original generic SfxItemSet overload asserts the paragraph subtype, then selects the original pool. @param set - Borrowed items. @param family - Original family. @returns Shared style handle. */
  getAutomaticStyle(set: SfxItemSet, family: F): SfxItemSet {
    if (family === F.AUTO_STYLE_PARA && !(set instanceof SwAttrSet))
      throw new Error("assert paragraph automatic style requires SwAttrSet");
    const pool = family === F.AUTO_STYLE_CHAR ? this.m_aAutoCharPool : this.m_aAutoParaPool;
    return pool.insertItemSet(set);
  }
  /** Original cache insertion retains family separation and native paragraph assertion. @param set - Borrowed items. @param family - Original family. @returns Shared style. */
  cacheAutomaticStyle(set: SfxItemSet, family: F): SfxItemSet {
    if (family === F.AUTO_STYLE_PARA && !(set instanceof SwAttrSet))
      throw new Error("assert paragraph automatic style requires SwAttrSet");
    const pool = family === F.AUTO_STYLE_CHAR ? this.m_aAutoCharPool : this.m_aAutoParaPool,
      handle = pool.insertItemSet(set);
    const cache = family === F.AUTO_STYLE_CHAR ? this.maCharCache : this.maParaCache;
    cache.addStyleName(handle);
    return handle;
  }
  /** Original family lookup fills the relevant cache on a miss and asserts a found paragraph handle's subtype. @param name - Logical pointer name. @param family - Original family. @returns Retained handle or absent. */
  getByName(name: string, family: F): SfxItemSet | undefined {
    const pool = family === F.AUTO_STYLE_CHAR ? this.m_aAutoCharPool : this.m_aAutoParaPool,
      cache = family === F.AUTO_STYLE_CHAR ? this.maCharCache : this.maParaCache;
    let style = cache.getByName(name);
    if (style === undefined) {
      cache.addCompletePool(pool);
      style = cache.getByName(name);
    }
    if (style !== undefined && family === F.AUTO_STYLE_PARA && !(style instanceof SwAttrSet))
      throw new Error("assert paragraph cached style requires SwAttrSet");
    return style;
  }
  /** Original clears both caches without resetting pools. @returns Nothing. */
  clearCaches(): void {
    this.maCharCache.clear();
    this.maParaCache.clear();
  }
}
/** Original creates a document-owned manager with the supplied paragraph ignorable range. @param ignorableParagraphItems - Original optional empty range template. @returns Actual style-access owner. */
export function createStyleManager(ignorableParagraphItems?: SfxItemSet): IStyleAccess {
  return new SwStyleManager(ignorableParagraphItems);
}
