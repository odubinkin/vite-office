/** @fileoverview Original SdrAngleItem values and represented SdrItemPool defaults/composition from sdangitm.hxx/svdattr.cxx; broader drawing services remain pending. */
import { SfxInt32Item } from "../../../svl/inc/intitem";

import type { Degree100 } from "../../../tools/inc/degree";
import {
  SfxItemPool,
  SFX_ITEMINFOFLAG_SUPPORT_SURROGATE,
} from "../../../svl/source/items/itempool";
import {
  SID_ATTR_FILL_USE_SLIDE_BACKGROUND,
  SID_ATTR_FILL_STYLE,
  SID_ATTR_FILL_COLOR,
  SID_ATTR_FILL_TRANSPARENCE,
} from "../../inc/svxids";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XFillStyleItem } from "../../inc/xfillit0";
import { XFillColorItem } from "../../inc/xflclit";
import { XFillTransparenceItem } from "../../inc/xfltrit";
import { XFillUseSlideBackgroundItem } from "../../inc/xfilluseslidebackgrounditem";
import { COL_DEFAULT_SHAPE_FILLING } from "../../inc/xdef";

/** Original signed hundredths-of-degree item; values are stored without angle normalization. */
export class SdrAngleItem extends SfxInt32Item {
  /** Original explicit Which/value or implicit copy forms. @param args - Native constructor selection. @returns Item. */
  constructor(...args: [which: number, angle: Degree100] | [source: Readonly<SdrAngleItem>]) {
    if (args.length === 2) super(args[0], args[1]);
    else super(args[0]);
  }
  /** Original Degree100 wrapper read erased into the primitive unit value. @returns Signed hundredths. */
  public override GetValue(): Degree100 {
    return super.GetValue();
  }
  /** Original Degree100 wrapper write erased into the primitive unit value. @param value - Signed hundredths. @returns Nothing. */
  public override SetValue(value: Degree100): void {
    super.SetValue(value);
  }
  /** Original explicit Which/value Clone retains identity. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SdrAngleItem {
    void pool;
    return new SdrAngleItem(this.Which(), this.GetValue());
  }
}

/** Native secondary drawing pool, retaining actual master/copy ownership and original defaults. */
export class SdrItemPool extends SfxItemPool {
  /** Original optional-master and implicit-copy forms. @param source - Master pool, source copy, or null. @returns Pool. */
  public constructor(source: SfxItemPool | null = null) {
    if (source instanceof SdrItemPool) super(source);
    else {
      super(new OUString(Uint8Array.of(83, 100, 114, 73, 116, 101, 109, 80, 111, 111, 108, 0)));
      // Sparse registration follows the existing portable pool's consumed-item registry.
      this.RegisterDefaultItem(new XFillStyleItem(), undefined, SID_ATTR_FILL_STYLE);
      this.RegisterDefaultItem(
        new XFillColorItem("", COL_DEFAULT_SHAPE_FILLING),
        undefined,
        SID_ATTR_FILL_COLOR,
        SFX_ITEMINFOFLAG_SUPPORT_SURROGATE,
      );
      this.RegisterDefaultItem(new XFillTransparenceItem(), undefined, SID_ATTR_FILL_TRANSPARENCE);
      this.RegisterDefaultItem(
        new XFillUseSlideBackgroundItem(),
        undefined,
        SID_ATTR_FILL_USE_SLIDE_BACKGROUND,
      );
      if (source !== null) source.GetLastPoolInChain().SetSecondaryPool(this);
    }
  }
  /** Original native derived copy factory. @returns Independent drawing pool. */
  public override Clone(): SdrItemPool {
    return new SdrItemPool(this);
  }
}
