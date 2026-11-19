/** @fileoverview Original SvxColorItem value and consumed UNO color members from textitem.cxx. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XComplexColor } from "../../../offapi/com/sun/star/util/XComplexColor";
import {
  createXComplexColor,
  getFromXComplexColor,
} from "../../../docmodel/inc/uno/UnoComplexColor";
import { MID_COLOR_ALPHA, MID_COMPLEX_COLOR } from "../../inc/memberids";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Color, COL_BLACK, extractColor, insertColor } from "../../../tools/inc/color";
import { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
/** Original font-color item owns independent resolved and complex values. */
export class SvxColorItem extends SfxPoolItem {
  private readonly maColor = new Color(COL_BLACK);
  private readonly maComplexColor = new ComplexColor();
  /** Original Which-only, Color, Color/ComplexColor and implicit-copy forms. @param args - Native selected arguments. @returns Item. */
  constructor(
    ...args:
      | [which: number]
      | [color: Readonly<Color>, which: number]
      | [color: Readonly<Color>, complex: Readonly<ComplexColor>, which: number]
      | [source: Readonly<SvxColorItem>]
  ) {
    const first = args[0];
    super(
      typeof first === "number"
        ? first
        : first instanceof SvxColorItem
          ? first.Which()
          : (args[args.length - 1] as number),
    );
    if (first instanceof SvxColorItem) {
      this.maColor.assign(first.GetValue());
      this.maComplexColor.assign(first.getComplexColor());
    } else if (typeof first !== "number") {
      this.maColor.assign(first as Readonly<Color>);
      if (args.length === 3) this.maComplexColor.assign(args[1] as Readonly<ComplexColor>);
    }
  }
  /** Original black color with Which0. @returns Native default item. */
  public static CreateDefault(): SvxColorItem {
    return new SvxColorItem(0);
  }
  /** Original implicit-copy clone retaining every owned value and Which. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxColorItem {
    void pool;
    return new SvxColorItem(this);
  }
  /** Original same-type value comparison omits Which; malformed host types return false instead of a native debug assertion. @param other - Candidate. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxColorItem &&
      this.maColor.equals(other.maColor) &&
      this.maComplexColor.equals(other.maComplexColor)
    );
  }
  /** Original hash availability. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original Color signed32 and ComplexColor field fold with existing browser logical hash bindings, not persisted binary data. @returns Logical unsigned64 hash. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.maColor.toInt32());
    hash_combine(seed, this.maComplexColor.getHash());
    return seed[0];
  }
  /** Original borrowed const Color. @returns Stable owned Color. */
  public GetValue(): Readonly<Color> {
    return this.maColor;
  }
  /** Original Color assignment leaves ComplexColor untouched. @param color - Actual value. @returns Nothing. */
  public SetValue(color: Readonly<Color>): void {
    this.maColor.assign(color);
  }
  /** Original alternate borrowed const Color accessor. @returns Stable owned Color. */
  public getColor(): Readonly<Color> {
    return this.maColor;
  }
  /** Original alternate Color setter. @param color - Actual value. @returns Nothing. */
  public setColor(color: Readonly<Color>): void {
    this.maColor.assign(color);
  }
  /** Original borrowed const ComplexColor. @returns Stable owned value. */
  public getComplexColor(): Readonly<ComplexColor> {
    return this.maComplexColor;
  }
  /** Original independent complete ComplexColor assignment. @param color - Actual value. @returns Nothing. */
  public setComplexColor(color: Readonly<ComplexColor>): void {
    this.maComplexColor.assign(color);
  }

  /** Retains the no-output binding. @returns No value. */
  override QueryValue(): undefined;
  /** Copies the consumed RGB or complex-color member into its original UNO value. @param value - Native output. @param member - Item member. @returns Success. */
  override QueryValue(value: Any, member?: number): boolean;
  /** Reads the original color when the caller supplies its UNO output. @param value - Native output. @param member - Item member. @returns Success or absence. */
  override QueryValue(value?: Any, member = 0): boolean | undefined {
    if (!value) return undefined;
    const id = member & 0x7f;
    if (id === MID_COLOR_ALPHA)
      value.insert([Math.round(((255 - this.maColor.GetAlpha()) * 100) / 255)], "sal_Int16");
    else if (id !== MID_COMPLEX_COLOR) insertColor(value, this.maColor);
    else {
      const reference = createXComplexColor(this.maComplexColor);
      try {
        value.insert([reference.get()], XComplexColor.static_type);
      } finally {
        reference.dispose();
      }
    }
    return true;
  }

  /** Applies RGB or a non-null native complex color independently. @param value - UNO input. @param member - Item member. @returns Accepted type. */
  override PutValue(value: unknown, member = 0): boolean {
    if (!(value instanceof Any)) return false;
    const id = member & 0x7f;
    if (id === MID_COLOR_ALPHA) {
      const transparency: [number] = [0];
      if (!value.extract(transparency, "sal_Int16")) return false;
      const scaled = (transparency[0] * 255) / 100;
      const rounded = Math.sign(scaled) * Math.round(Math.abs(scaled));
      this.maColor.SetAlpha(255 - (rounded & 0xff));
      return true;
    }
    if (id !== MID_COMPLEX_COLOR) return extractColor(value, this.maColor);
    const reference = new Reference<XComplexColor>();
    try {
      if (!value.extract(reference.getAddress(), XComplexColor.static_type)) return false;
      if (reference.is()) this.setComplexColor(getFromXComplexColor(reference));
      return true;
    } finally {
      reference.dispose();
    }
  }
}
