/** @fileoverview Native slide-background bool item from xfilluseslidebackgrounditem.hxx and xattr2.cxx. */
import { SfxBoolItem } from "../../svl/inc/eitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { XATTR_FILLUSESLIDEBACKGROUND } from "./xdef";
/** Original false default and typed bool ownership. */
export class XFillUseSlideBackgroundItem extends SfxBoolItem {
  /** Original value and implicit-copy construction. @param source - Bool or native copy. @returns Item. */
  public constructor(source: boolean | XFillUseSlideBackgroundItem = false) {
    if (source instanceof XFillUseSlideBackgroundItem) super(source);
    else super(XATTR_FILLUSESLIDEBACKGROUND, source);
  }
  /** Original independent copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): XFillUseSlideBackgroundItem {
    void pool;
    return new XFillUseSlideBackgroundItem(this);
  }
}
