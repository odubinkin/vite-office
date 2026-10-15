/** @fileoverview Original five-field SvxLineSpacingItem from paraitem.cxx; translated presentation is deferred. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../inc/svxenum";
import {
  LineSpacing,
  cppu_detail_getUnoType_LineSpacing,
} from "../../../offapi/com/sun/star/style/LineSpacing";
import * as LineSpacingMode from "../../../offapi/com/sun/star/style/LineSpacingMode";
import { MID_LINESPACE } from "../../inc/memberids";
import { MID_HEIGHT } from "../../../svl/inc/memberid";
import { CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../../o3tl/inc/unit_conversion";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
/** Original Writer default absolute height, independent of proportional percentage. */
export const LINE_SPACE_DEFAULT_HEIGHT = 200;
/** Original independent height, proportional and additive state with both rule selectors. */
export class SvxLineSpacingItem extends SfxPoolItem {
  private nInterLineSpace = 0;
  private nLineHeight: number;
  private nPropLineSpace = 100;
  private eLineSpaceRule = SvxLineSpaceRule.Auto;
  private eInterLineSpaceRule = SvxInterLineSpaceRule.Off;
  /** Original height/Which and copy forms. @param args - Original arguments. @returns Item. */
  constructor(...args: [height: number, which: number] | [source: Readonly<SvxLineSpacingItem>]) {
    super(args.length === 1 ? args[0].Which() : args[1]);
    if (args.length === 1) {
      const source = args[0];
      this.nInterLineSpace = source.GetInterLineSpace();
      this.nLineHeight = source.GetLineHeight();
      this.nPropLineSpace = source.GetPropLineSpace();
      this.eLineSpaceRule = source.GetLineSpaceRule();
      this.eInterLineSpaceRule = source.GetInterLineSpaceRule();
    } else this.nLineHeight = args[0] & 0xffff;
  }
  /** Original height200/Which0 factory. @returns Default. */
  static CreateDefault(): SvxLineSpacingItem {
    return new SvxLineSpacingItem(LINE_SPACE_DEFAULT_HEIGHT, 0);
  }
  /** Original copied concrete value. @param pool - Unused pool. @returns Independent item. */
  override Clone(pool?: SfxItemPool): SvxLineSpacingItem {
    void pool;
    return new SvxLineSpacingItem(this);
  }
  /** Original additive distance. @returns Signed16 twips. */
  GetInterLineSpace(): number {
    return this.nInterLineSpace;
  }
  /** Original signed16 assignment selects additive spacing. @param value - Distance. @returns Nothing. */
  SetInterLineSpace(value: number): void {
    this.nInterLineSpace = (value << 16) >> 16;
    this.eInterLineSpaceRule = SvxInterLineSpaceRule.Fix;
  }
  /** Original absolute height. @returns Unsigned16 twips. */
  GetLineHeight(): number {
    return this.nLineHeight;
  }
  /** Original unsigned16 assignment selects minimum height. @param value - Height. @returns Nothing. */
  SetLineHeight(value: number): void {
    this.nLineHeight = value & 0xffff;
    this.eLineSpaceRule = SvxLineSpaceRule.Min;
  }
  /** Original stored percentage even while inactive. @returns Unsigned16 percentage. */
  GetPropLineSpace(): number {
    return this.nPropLineSpace;
  }
  /** Original unsigned16 assignment selects proportional spacing. @param value - Percent. @returns Nothing. */
  SetPropLineSpace(value: number): void {
    this.nPropLineSpace = value & 0xffff;
    this.eInterLineSpaceRule = SvxInterLineSpaceRule.Prop;
  }
  /** Original absolute rule. @returns Rule. */
  GetLineSpaceRule(): SvxLineSpaceRule {
    return this.eLineSpaceRule;
  }
  /** Original absolute rule assignment. @param value - Rule. @returns Nothing. */
  SetLineSpaceRule(value: SvxLineSpaceRule): void {
    this.eLineSpaceRule = value;
  }
  /** Original additive rule. @returns Rule. */
  GetInterLineSpaceRule(): SvxInterLineSpaceRule {
    return this.eInterLineSpaceRule;
  }
  /** Original additive rule assignment. @param value - Rule. @returns Nothing. */
  SetInterLineSpaceRule(value: SvxInterLineSpaceRule): void {
    this.eInterLineSpaceRule = value;
  }
  /** Original equality ignores inactive fields and Which. @param other - Candidate. @returns Active field equality. */
  override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLineSpacingItem &&
      this.eLineSpaceRule === other.eLineSpaceRule &&
      (this.eLineSpaceRule === SvxLineSpaceRule.Auto || this.nLineHeight === other.nLineHeight) &&
      this.eInterLineSpaceRule === other.eInterLineSpaceRule &&
      (this.eInterLineSpaceRule === SvxInterLineSpaceRule.Off ||
        (this.eInterLineSpaceRule === SvxInterLineSpaceRule.Prop &&
          this.nPropLineSpace === other.nPropLineSpace) ||
        (this.eInterLineSpaceRule === SvxInterLineSpaceRule.Fix &&
          this.nInterLineSpace === other.nInterLineSpace))
    );
  }
  /** Original hash availability. @returns True. */
  supportsHashCode(): boolean {
    return true;
  }
  /** Original all-field logical unsigned64 hash, including inactive values. @returns Hash. */
  hashCode(): bigint {
    const seed: [bigint] = [0n];
    for (const value of [
      this.eLineSpaceRule,
      this.nLineHeight,
      this.eInterLineSpaceRule,
      this.nPropLineSpace,
      this.nInterLineSpace,
    ])
      hash_combine(seed, value);
    return seed[0];
  }
  /** Same native two-field value returned to host callers without an output argument. @returns Detached native descriptor. */
  override QueryValue(): LineSpacing;
  /** Original typed Any query. @param output - Actual Any. @param member - Selector. @returns True even for unsupported selectors. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Original descriptor projection and output selection. @param output - Optional Any. @param member - Unsigned8 selector. @returns Native descriptor or success. */
  override QueryValue(output?: Any, member = 0): LineSpacing | boolean {
    const descriptor = this.descriptor((member & 0xff & CONVERT_TWIPS) !== 0);
    if (output === undefined) return descriptor;
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case 0:
        output.insert(descriptor, cppu_detail_getUnoType_LineSpacing);
        break;
      case MID_LINESPACE:
        output.insert([descriptor.Mode], "sal_Int16");
        break;
      case MID_HEIGHT:
        output.insert([descriptor.Height], "sal_Int16");
        break;
    }
    return true;
  }
  /** Original struct/short extraction, cast order and normalization. @param input - Actual Any. @param member - Unsigned8 selector. @returns Successful extraction; unknown members retain native success and normalize current state. */
  override PutValue(input: unknown, member: number): boolean {
    const convert = (member & 0xff & CONVERT_TWIPS) !== 0;
    const descriptor = this.descriptor(convert);
    switch (member & 0xff & ~CONVERT_TWIPS) {
      case 0:
        if (
          !(input instanceof Any) ||
          !input.extract(descriptor, cppu_detail_getUnoType_LineSpacing)
        )
          return false;
        break;
      case MID_LINESPACE:
      case MID_HEIGHT: {
        const value: [number] = [0];
        if (!(input instanceof Any) || !input.extract(value, "sal_Int16")) return false;
        if ((member & 0xff & ~CONVERT_TWIPS) === MID_LINESPACE) descriptor.Mode = value[0];
        else descriptor.Height = value[0];
        break;
      }
    }
    this.nLineHeight = descriptor.Height & 0xffff;
    switch (descriptor.Mode) {
      case LineSpacingMode.LEADING:
        this.eInterLineSpaceRule = SvxInterLineSpaceRule.Fix;
        this.eLineSpaceRule = SvxLineSpaceRule.Auto;
        this.nInterLineSpace = convert
          ? Number(BigInt.asIntN(16, toTwips(BigInt(descriptor.Height), Length.mm100)))
          : descriptor.Height;
        break;
      case LineSpacingMode.PROP:
        this.eLineSpaceRule = SvxLineSpaceRule.Auto;
        this.nPropLineSpace = descriptor.Height & 0xffff;
        this.eInterLineSpaceRule =
          descriptor.Height === 100 ? SvxInterLineSpaceRule.Off : SvxInterLineSpaceRule.Prop;
        break;
      case LineSpacingMode.FIX:
      case LineSpacingMode.MINIMUM:
        this.eInterLineSpaceRule = SvxInterLineSpaceRule.Off;
        this.eLineSpaceRule =
          descriptor.Mode === LineSpacingMode.FIX ? SvxLineSpaceRule.Fix : SvxLineSpaceRule.Min;
        if (convert)
          this.nLineHeight = Number(
            BigInt.asUintN(16, toTwips(BigInt(this.nLineHeight), Length.mm100)),
          );
        break;
    }
    return true;
  }
  /** Original descriptor construction shared by Query and the guaranteed successful internal Query/extract roundtrip in Put. @param convert - Convert twips to hundredth millimeters. @returns Native struct. */
  private descriptor(convert: boolean): LineSpacing {
    const value = new LineSpacing();
    switch (this.eLineSpaceRule) {
      case SvxLineSpaceRule.Auto:
        if (this.eInterLineSpaceRule === SvxInterLineSpaceRule.Fix) {
          value.Mode = LineSpacingMode.LEADING;
          value.Height = convert
            ? Number(convertTwipToMm100(BigInt(this.nInterLineSpace)))
            : this.nInterLineSpace;
        } else {
          value.Mode = LineSpacingMode.PROP;
          value.Height =
            this.eInterLineSpaceRule === SvxInterLineSpaceRule.Off ? 100 : this.nPropLineSpace;
        }
        break;
      case SvxLineSpaceRule.Fix:
      case SvxLineSpaceRule.Min:
        value.Mode =
          this.eLineSpaceRule === SvxLineSpaceRule.Fix
            ? LineSpacingMode.FIX
            : LineSpacingMode.MINIMUM;
        value.Height = convert
          ? Number(convertTwipToMm100(BigInt(this.nLineHeight)))
          : this.nLineHeight;
        break;
    }
    return value;
  }
}
