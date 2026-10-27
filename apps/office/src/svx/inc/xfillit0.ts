/** @fileoverview Native XFillStyleItem constructor and typed Any contracts from xattr.cxx. */
import { SfxEnumItem } from "../../svl/inc/eitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  FillStyle,
  cppu_detail_getUnoType_FillStyle,
} from "../../offapi/com/sun/star/drawing/FillStyle";
import { XATTR_FILLSTYLE } from "./xdef";
/** Native drawing fill-style enum item. */
export class XFillStyleItem extends SfxEnumItem<FillStyle> {
  /** Original SOLID default and implicit copy form. @param source - Enum or native copy. @returns Item. */
  public constructor(source: FillStyle | XFillStyleItem = FillStyle.SOLID) {
    if (source instanceof XFillStyleItem) super(source);
    else super(XATTR_FILLSTYLE, source);
  }
  /** Original default factory. @returns SOLID fill-style item. */
  public static CreateDefault(): XFillStyleItem {
    return new XFillStyleItem();
  }
  /** Original independent enum clone. @param pool - Unused native pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): XFillStyleItem {
    void pool;
    return new XFillStyleItem(this);
  }
  /** Existing scalar browser query. @returns Full enum value. */
  public override QueryValue(): number;
  /** Original typed FillStyle query. @param output - Native Any. @param member - Ignored member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original typed enum insertion, retaining browser scalar transport. @param output - Optional Any. @param member - Ignored native member. @returns Scalar or success. */
  public override QueryValue(output?: Any, member = 0): number | boolean {
    void member;
    if (output === undefined) return this.GetValue();
    output.insert([this.GetValue()], cppu_detail_getUnoType_FillStyle);
    return true;
  }
  /** Original FillStyle extraction and signed32 Basic fallback, without range validation. @param input - Actual native Any. @param member - Ignored member. @returns Extraction success. */
  public override PutValue(input: unknown, member: number): boolean {
    void member;
    if (!(input instanceof Any)) return false;
    const value: [number] = [0];
    if (
      !input.extract(value, cppu_detail_getUnoType_FillStyle) &&
      !input.extract(value, "sal_Int32")
    )
      return false;
    this.SetValue(value[0] as FillStyle);
    return true;
  }
}
