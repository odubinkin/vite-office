/** @fileoverview Original font-height value state and metric methods from textitem.cxx; native Any and presentation methods remain unported. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { MapUnit } from "../../../tools/inc/mapunit";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { ItemToControl, ControlToItem } from "../../../svtools/inc/unitconv";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
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
  public ScaleMetrics(scale: number): void {
    const scaled = this.nHeight * scale;
    this.nHeight = Number(
      BigInt.asUintN(32, BigInt(scaled < 0 ? -Math.round(-scaled) : Math.round(scaled))),
    );
  }
  /** Original metric support. @returns True. */
  public HasMetrics(): boolean {
    return true;
  }
  /** Existing browser state boundary now retains all native fields. Native typed Any query is not implemented by this projection. @returns Complete logical item state. */
  public override QueryValue(): Readonly<{ height: number; prop: number; propUnit: MapUnit }> {
    return { height: this.nHeight, prop: this.nProp, propUnit: this.ePropUnit };
  }
}
