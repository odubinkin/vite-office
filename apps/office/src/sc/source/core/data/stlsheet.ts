/** @fileoverview Calc cell styles own native pattern-range item sets. */
import { SfxStyleSheet } from "../../../../svl/source/items/style-sheet";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxStyleSheetBasePool } from "../../../../svl/source/items/style-model";
import type { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { ATTR_PATTERN_END, ATTR_PATTERN_START } from "../../../inc/scitems";

/** Native cell-style specialization of the shared style owner. */
export class ScStyleSheet extends SfxStyleSheet {
  /** Preserves original construction and copied item-set ownership. @param args - Style fields or actual style copy. @returns Style. */
  constructor(
    ...args:
      | [ScStyleSheet]
      | [
          name: OUStringConstReference,
          pool: SfxStyleSheetBasePool,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent?: OUStringConstReference | undefined,
        ]
  ) {
    if (args.length === 1) super(args[0]);
    else super(...args);
  }

  /** Lazily allocates the table-cell style Which range on the original pool. @returns Owned style item set. */
  override GetItemSet(): SfxItemSet {
    if (!this.pSet) {
      const pool = this.GetPool() as SfxStyleSheetBasePool;
      this.pSet = new SfxItemSet(pool.GetPool(), [[ATTR_PATTERN_START, ATTR_PATTERN_END]]);
      this.bMySet = true;
    }
    return this.pSet;
  }
}
