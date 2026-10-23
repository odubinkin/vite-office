/** @fileoverview Ports document-owned character style insertion from pinned sw/source/core/doc/swstylemanager.cxx. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { StylePool } from "../../../../svl/source/items/stylepool";
import type { IStyleAccess, SwAutoStyleFamily } from "../../../inc/istyleaccess";

/** Internal native style-access owner, distinct from named paragraph style management. */
class SwStyleManager implements IStyleAccess {
  private readonly charCache = new Map<string, SfxItemSet>();
  private readonly autoCharPool = new StylePool();

  /** Inserts into the document's automatic character pool. @param set - Concrete character items. @param family - Implemented character family. @returns Shared style handle. */
  public getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet {
    void family;
    return this.autoCharPool.insertItemSet(set);
  }
  /** Interns and caches by native handle identity. @param set - Character items. @param family - Character family. @returns Shared native handle. */
  cacheAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet {
    const handle = this.getAutomaticStyle(set, family);
    this.charCache.set(StylePool.nameOf(handle), handle);
    return handle;
  }
  /** Looks up a registered native identity. @param name - Opaque style name. @param family - Character family. @returns Native handle. */
  getByName(name: string, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet | undefined {
    void family;
    const cached = this.charCache.get(name);
    if (cached) return cached;
    for (const handle of this.autoCharPool.getAllStyles())
      this.charCache.set(StylePool.nameOf(handle), handle);
    return this.charCache.get(name);
  }
}

/** Creates a document's bounded native automatic-style owner. @returns Style-access manager. */
export function createStyleManager(): IStyleAccess {
  return new SwStyleManager();
}
