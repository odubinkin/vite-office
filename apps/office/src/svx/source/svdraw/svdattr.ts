/** @fileoverview Original SdrAngleItem value and Clone responsibility from sdangitm.hxx/svdattr.cxx; localized presentation remains pending. */
import { SfxInt32Item } from "../../../svl/inc/intitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { Degree100 } from "../../../tools/inc/degree";
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
