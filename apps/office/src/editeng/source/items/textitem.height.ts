/** @fileoverview Original font-height value state and metric methods from textitem.cxx; native Any transport reuses actual shared CPPU; presentation remains unported. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { MapUnit } from "../../../tools/inc/mapunit";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { ItemToControl, ControlToItem } from "../../../svtools/inc/unitconv";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  FontHeight,
  cppu_detail_getUnoType_FontHeight as fontHeightType,
} from "../../../offapi/com/sun/star/frame/status/FontHeight";
import { MID_FONTHEIGHT, MID_FONTHEIGHT_PROP, MID_FONTHEIGHT_DIFF } from "../../inc/memberids";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
/** Original three-field height value; native3argument and implicit copy constructor only. */
export class SvxFontHeightItem extends SfxPoolItem {
  private nHeight = 0;
  private nProp = 100;
  private ePropUnit = MapUnit.MapRelative;
  /** Original value/prop/Which or actual copy form. @param args - Selected original form. @returns Item. */
  constructor(
    ...args: [height: number, prop: number, which: number] | [source: Readonly<SvxFontHeightItem>]
  ) {
    const source = args[0];
    super(typeof source === "number" ? (args[2] as number) : source.Which());
    if (typeof source === "number") this.SetHeight(source, args[1] as number);
    else {
      this.nHeight = source.GetHeight();
      this.nProp = source.GetProp();
      this.ePropUnit = source.GetPropUnit();
    }
  }
  /** Original default240twips100percent zeroWhich. @returns Default. */
  public static CreateDefault(): SvxFontHeightItem {
    return new SvxFontHeightItem(240, 100, 0);
  }
  /** Original stored absolute height. @returns Unsigned32 height. */
  public GetHeight(): number {
    return this.nHeight;
  }
  /** Original stored unsigned16 proportion or signed-delta bits. @returns Property. */
  public GetProp(): number {
    return this.nProp;
  }
  /** Original relative or absolute property unit. @returns Map unit. */
  public GetPropUnit(): MapUnit {
    return this.ePropUnit;
  }
  /** Original property-only assignment does not recalculate height. @param prop - Native unsigned16 property. @param unit - Native property unit. @returns Nothing. */
  public SetProp(prop: number, unit: MapUnit): void {
    this.nProp = prop & 0xffff;
    this.ePropUnit = unit;
  }
  /** Original3and4argument forms; nativeunsigned32 multiplication precedes division. Checked JS height inputs retain range errors but permit original0. @param height - Unsigned32 original height. @param prop - Unsigned16 property. @param unit - Relative or absolute property unit. @param coreUnit - Present only for original four-argument form. @returns Nothing. */
  public SetHeight(
    height: number,
    prop = 100,
    unit = MapUnit.MapRelative,
    coreUnit?: MapUnit,
  ): void {
    if (!Number.isInteger(height) || height < 0 || height > 0xffffffff)
      throw new Error("SvxFontHeightItem value is invalid.");
    prop &= 0xffff;
    if (unit !== MapUnit.MapRelative) {
      let delta = ItemToControl(BigInt((prop << 16) >> 16), unit, FieldUnit.TWIP);
      if (coreUnit !== undefined) delta = ControlToItem(delta, FieldUnit.TWIP, coreUnit);
      this.nHeight = Number(BigInt.asUintN(32, BigInt(height) + delta));
    } else if (prop !== 100)
      this.nHeight = Number(BigInt.asUintN(32, BigInt(height) * BigInt(prop)) / 100n);
    else this.nHeight = height;
    this.nProp = prop;
    this.ePropUnit = unit;
  }
  /** Original implicit copy Clone, including stored property/unit without recalculation. @param pool - Unused pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): SvxFontHeightItem {
    void pool;
    return new SvxFontHeightItem(this);
  }
  /** Original same-type payload comparison ignores Which. @param other - Candidate. @returns Equal height/property/unit. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFontHeightItem &&
      other.nHeight === this.nHeight &&
      other.nProp === this.nProp &&
      other.ePropUnit === this.ePropUnit
    );
  }
  /** Original Which/height/property/unit fold through shared hash owner; no binary ABI certificate. @returns Unsigned64 logical hash. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    for (const value of [this.Which(), this.nHeight, this.nProp, this.ePropUnit])
      hash_combine(seed, value);
    return seed[0];
  }
  /** Original BigInt::Scale delegates to llround(height*scale); JS math preserves defined finite signed64 cases and unsigned32 assignment. @param scale - Native double factor. @returns Nothing. */
  public override ScaleMetrics(scale: number): void {
    const scaled = this.nHeight * scale;
    this.nHeight = Number(
      BigInt.asUintN(32, BigInt(scaled < 0 ? -Math.round(-scaled) : Math.round(scaled))),
    );
  }
  /** Original metric support. @returns True. */
  public override HasMetrics(): boolean {
    return true;
  }
  /** Browser complete-state projection retained from126. @returns Logical state. */
  public override QueryValue(): Readonly<{ height: number; prop: number; propUnit: MapUnit }>;
  /** Original typed Any query. @param output - Actual output. @param member - Native member. @returns True. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original full query switch plus existing no-argument browser state. @param output - Optional Any. @param member - Native unsigned8 member and convert bit. @returns Native success or browser state. */
  public override QueryValue(
    output?: Any,
    member = 0,
  ): boolean | Readonly<{ height: number; prop: number; propUnit: MapUnit }> {
    if (output === undefined)
      return { height: this.nHeight, prop: this.nProp, propUnit: this.ePropUnit };
    const convertTwips = (member & 0x80) !== 0;
    switch (member & 0xff & ~0x80) {
      case 0:
        output.insert(
          new FontHeight(
            queryHeightPoints(this.nHeight, convertTwips),
            this.ePropUnit === MapUnit.MapRelative ? this.nProp : 100,
            queryHeightDiff(this.nProp, this.ePropUnit),
          ),
          fontHeightType,
        );
        break;
      case MID_FONTHEIGHT:
        output.insert([queryHeightPoints(this.nHeight, convertTwips)], "float");
        break;
      case MID_FONTHEIGHT_PROP:
        output.insert(
          [((this.ePropUnit === MapUnit.MapRelative ? this.nProp : 100) << 16) >> 16],
          "sal_Int16",
        );
        break;
      case MID_FONTHEIGHT_DIFF:
        output.insert([queryHeightDiff(this.nProp, this.ePropUnit)], "float");
        break;
    }
    return true;
  }
  /** Original native Any update in normal non-fuzz browser configuration; native undefined NaN/out-of-range signed-cast cases are outside certification. @param input - Actual source Any. @param member - Required native member. @returns Original success including partial mutation on failure. */
  public override PutValue(input: Any, member: number): boolean {
    const convertTwips = (member & 0x80) !== 0;
    switch (member & 0xff & ~0x80) {
      case 0: {
        const value = new FontHeight();
        if (!input.extract(value, fontHeightType)) return false;
        this.ePropUnit = MapUnit.MapRelative;
        this.nProp = 100;
        if (value.Height < 0 || value.Height > 10000) return false;
        const twips = BigInt(Math.trunc(value.Height * 20 + 0.5));
        this.nHeight = Number(convertTwips ? twips : convertTwipToMm100(twips));
        this.nProp = value.Prop & 0xffff;
        break;
      }
      case MID_FONTHEIGHT: {
        this.ePropUnit = MapUnit.MapRelative;
        this.nProp = 100;
        const point: [number] = [0];
        if (!input.extract(point, "double") && !input.extract(point, "sal_Int32")) return false;
        if (point[0] < 0 || point[0] > 10000) return false;
        const twips = BigInt(Math.trunc(point[0] * 20 + 0.5));
        this.nHeight = Number(convertTwips ? twips : convertTwipToMm100(twips));
        break;
      }
      case MID_FONTHEIGHT_PROP: {
        const value: [number] = [0];
        if (!input.extract(value, "sal_Int16")) return true;
        this.nHeight = lcl_GetRealHeight_Impl(
          this.nHeight,
          this.nProp,
          this.ePropUnit,
          convertTwips,
        );
        this.nHeight = Number(BigInt.asUintN(32, BigInt(this.nHeight) * BigInt(value[0])) / 100n);
        this.nProp = value[0] & 0xffff;
        this.ePropUnit = MapUnit.MapRelative;
        break;
      }
      case MID_FONTHEIGHT_DIFF: {
        this.nHeight = lcl_GetRealHeight_Impl(
          this.nHeight,
          this.nProp,
          this.ePropUnit,
          convertTwips,
        );
        const value: [number] = [0];
        if (!input.extract(value, "float")) {
          if (!input.extract(value, "sal_Int32")) return false;
          value[0] = Math.fround(value[0]);
        }
        const diff = (Math.trunc(value[0] * 20) << 16) >> 16;
        this.nHeight = Number(
          BigInt.asUintN(
            32,
            BigInt(this.nHeight) + (convertTwips ? BigInt(diff) : convertTwipToMm100(BigInt(diff))),
          ),
        );
        this.nProp = Math.trunc(value[0]) & 0xffff;
        this.ePropUnit = MapUnit.MapPoint;
        break;
      }
    }
    return true;
  }
}
/** Original unsigned32 real-height reconstruction and clamp. @param height - Stored height. @param prop - Unsigned property. @param unit - Original unit. @param coreInTwips - Convert bit. @returns Original reconstructed value. */
function lcl_GetRealHeight_Impl(
  height: number,
  prop: number,
  unit: MapUnit,
  coreInTwips: boolean,
): number {
  let result = height,
    diff = 0;
  switch (unit) {
    case MapUnit.MapRelative:
      if (prop !== 0) result = Number(BigInt.asUintN(32, BigInt(result) * 100n) / BigInt(prop));
      break;
    case MapUnit.MapPoint:
      diff = ((((prop << 16) >> 16) * 20) << 16) >> 16;
      if (!coreInTwips) diff = (Number(convertTwipToMm100(BigInt(diff))) << 16) >> 16;
      break;
    case MapUnit.Map100thMM:
    case MapUnit.MapTwip:
      diff = (prop << 16) >> 16;
      break;
  }
  return diff < 0 || result >= diff ? (result - diff) >>> 0 : 0;
}
/** Bounded UInt32 height to points. Native one-decimal corrected rounding has no half-boundary ambiguity for this denominator127 domain; ordinary JS rounding suffices. @param height - Unsigned32 height. @param twips - Stored twips rather thanmm100. @returns Native float32 points. */
function queryHeightPoints(height: number, twips: boolean): number {
  const points = convert(height, twips ? Length.twip : Length.mm100, Length.pt);
  return Math.fround(twips ? points : Math.round(points * 10) / 10);
}
/** Original unsigned property difference query, including unsupported-unit unchanged default. @param prop - Unsigned property. @param unit - Original unit. @returns Float32 difference. */
function queryHeightDiff(prop: number, unit: MapUnit): number {
  switch (unit) {
    case MapUnit.MapRelative:
      return 0;
    case MapUnit.Map100thMM:
      return Math.fround(convert(prop, Length.mm100, Length.pt));
    case MapUnit.MapTwip:
      return Math.fround(convert(prop, Length.twip, Length.pt));
    case MapUnit.MapPoint:
      return prop;
    default:
      return prop;
  }
}
