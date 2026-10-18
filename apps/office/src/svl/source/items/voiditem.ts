/** @fileoverview Original empty SfxVoidItem value for actual text tab/line-break features; no lifetime/move manager or fabricated payload. */
import { SfxPoolItem } from "./poolitem";
import type { SfxItemPool } from "./itempool";
import type { SfxItemPresentation } from "../../inc/poolitem";
import type { MapUnit } from "../../../tools/inc/mapunit";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original empty pooled item, distinct from invalid and disabled state markers. */
export class SfxVoidItem extends SfxPoolItem {
  /** Original Which/copy forms; native named-rvalue base initialization also copies without resetting source. @param source - Which or copied item. @returns Item. */
  public constructor(source: number | Readonly<SfxVoidItem>) {
    super(typeof source === "number" ? source : source.Which());
  }
  /** Original zero-Which factory. @returns Item. */
  public static CreateDefault(): SfxVoidItem {
    return new SfxVoidItem(0);
  }
  /** Original same-type empty payload equality, excluding Which. @param other - Candidate. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return other instanceof SfxVoidItem && other.constructor === this.constructor;
  }
  /** Original independent object clone. @param pool - Unused pool. @returns Copied item. */
  public override Clone(pool?: SfxItemPool): SfxVoidItem {
    void pool;
    return new SfxVoidItem(this);
  }
  /** Original literal nonlocalized diagnostic presentation. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param text - Actual output string. @param intl - Unused provider parameter. @returns True. */
  public GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    text: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void intl;
    text.assign(new OUString(new Uint8Array([86, 111, 105, 100, 0])));
    return true;
  }
}
