/** @fileoverview Ports document-owned character style insertion from pinned sw/source/core/doc/swstylemanager.cxx. */
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { StylePool } from "../../../../svl/source/items/stylepool";
import type { IStyleAccess, SwAutoStyleFamily } from "../../../inc/istyleaccess";

/** Internal native style-access owner, distinct from named paragraph style management. */
class SwStyleManager implements IStyleAccess {
  private readonly autoCharPool = new StylePool();

  /** Inserts into the document's automatic character pool. @param set - Concrete character items. @param family - Implemented character family. @returns Shared style handle. */
  public getAutomaticStyle(set: SfxItemSet, family: SwAutoStyleFamily.AUTO_STYLE_CHAR): SfxItemSet {
    void family;
    return this.autoCharPool.insertItemSet(set);
  }
}

/** Creates a document's bounded native automatic-style owner. @returns Style-access manager. */
export function createStyleManager(): IStyleAccess {
  return new SwStyleManager();
}
