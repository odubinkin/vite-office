/** @fileoverview Original SvxColorItem value ownership from textitem.cxx; native Any, presentation and dump APIs remain unported. */
import { SfxPoolItem } from "../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { Color, COL_BLACK } from "../../../tools/inc/color";
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
}
