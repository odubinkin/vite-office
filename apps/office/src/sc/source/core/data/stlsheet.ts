/** @fileoverview Calc cell and page styles own their native Which ranges. */
import { SfxStyleSheet } from "../../../../svl/source/items/style-sheet";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxStyleSheetBasePool } from "../../../../svl/source/items/style-model";
import { SfxStyleFamily, type SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  ATTR_USERDEF,
  ATTR_WRITINGDIR,
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_SHADOW,
  ATTR_LRSPACE,
  ATTR_ULSPACE,
  ATTR_PAGE_SIZE,
  ATTR_PAGE_SCALETO,
  ATTR_PAGE_SCALETOPAGES,
  ATTR_PAGE_SCALE,
  ATTR_PATTERN_END,
  ATTR_PATTERN_START,
} from "../../../inc/scitems";
import { SvxPaperInfo } from "../../../../editeng/inc/paperinf";
import { SvxSizeItem } from "../../../../editeng/inc/sizeitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SfxUInt16Item } from "../../../../svl/inc/intitem";
import { ScPageScaleToItem } from "../../../inc/attrib";

/** Native Calc style specialization of the shared style owner. */
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

  /** Sets the Calc parent and associates the inherited item set. @param name - Requested parent name. @returns Whether a parent was assigned. */
  override SetParent(name: OUStringConstReference): boolean {
    const pool = this.GetPool() as SfxStyleSheetBasePool;
    const family = this.GetFamily();
    const parent = pool.Find(name, family) ?? pool.CreateIterator(family).First();
    if (!(parent instanceof ScStyleSheet) || parent === this || !super.SetParent(parent.GetName()))
      return false;
    this.GetItemSet().SetParent(parent.GetItemSet());
    return true;
  }

  /** Lazily allocates the family Which ranges on the original pool. @returns Owned style item set. */
  override GetItemSet(): SfxItemSet {
    if (!this.pSet) {
      const pool = this.GetPool() as SfxStyleSheetBasePool;
      const page = this.GetFamily() === SfxStyleFamily.Page;
      this.pSet = new SfxItemSet(
        pool.GetPool(),
        page
          ? [
              [ATTR_USERDEF, ATTR_USERDEF],
              [ATTR_WRITINGDIR, ATTR_WRITINGDIR],
              [ATTR_BACKGROUND, ATTR_BACKGROUND],
              [ATTR_BORDER, ATTR_SHADOW],
              [ATTR_LRSPACE, ATTR_PAGE_SCALETO],
            ]
          : [[ATTR_PATTERN_START, ATTR_PATTERN_END]],
      );
      if (page) {
        this.pSet.Put(new SvxSizeItem(ATTR_PAGE_SIZE, SvxPaperInfo.GetDefaultPaperSize()));
        const margin = SvxIndentValue.twips(1134);
        this.pSet.Put(new SvxLRSpaceItem(margin, margin, SvxIndentValue.zero(), ATTR_LRSPACE));
        this.pSet.Put(new SvxULSpaceItem(1134, 1134, ATTR_ULSPACE));
        this.pSet.Put(new SfxUInt16Item(ATTR_PAGE_SCALETOPAGES, 0));
      }
      this.bMySet = true;
    }
    return this.pSet;
  }
}

/** Sets the mutually exclusive native page scale properties. @param items - Actual page style. @param scale - Percent when neither fitting mode is used. @param pages - Total pages. @param width - Page count along columns. @param height - Page count along rows. @returns Nothing. */
export function SetPageScale(
  items: SfxItemSet,
  scale: number,
  pages: number,
  width: number,
  height: number,
): void {
  items.Put(new SfxUInt16Item(ATTR_PAGE_SCALE, pages || width || height ? 0 : scale));
  items.Put(new SfxUInt16Item(ATTR_PAGE_SCALETOPAGES, pages));
  items.Put(new ScPageScaleToItem(width, height));
}
