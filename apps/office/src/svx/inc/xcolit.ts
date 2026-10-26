/** @fileoverview Native XColorItem constructors, value and palette/complex-color ownership from xattr.cxx. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { MID_COMPLEX_COLOR } from "../../editeng/inc/memberids";
import { NameOrIndex } from "./xit";
import { Color, insertColor, extractColor } from "../../tools/inc/color";
import { ComplexColor } from "../../docmodel/inc/color/ComplexColor";
import type { SfxPoolItem } from "../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
/** Native drawing color owns resolved and complex values independently. */
export class XColorItem extends NameOrIndex {
  private readonly m_aColor = new Color();
  private readonly maComplexColor = new ComplexColor();
  /** Original default, color, named/indexed and copy forms. @param args - Source constructor overload. @returns Item. */
  public constructor(
    ...args:
      | []
      | [which: number, color: Readonly<Color>]
      | [which: number, nameOrIndex: string | number, color: Readonly<Color>]
      | [source: XColorItem]
  ) {
    const source = args[0];
    if (source instanceof XColorItem) super(source);
    else if (args.length === 0) super();
    else super(source as number, args.length === 2 ? "" : (args[1] as string | number));
    if (source instanceof XColorItem) {
      this.m_aColor.assign(source.m_aColor);
      this.maComplexColor.assign(source.maComplexColor);
    } else if (args.length !== 0) this.m_aColor.assign(args[args.length - 1] as Readonly<Color>);
  }
  /** Original independent color copy. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): XColorItem {
    void pool;
    return new XColorItem(this);
  }
  /** Original name/index, resolved-color and complex-color equality. @param other - Same native item kind. @returns Equality. */
  public override equals(other: SfxPoolItem): boolean {
    return (
      other instanceof XColorItem &&
      super.equals(other) &&
      this.m_aColor.equals(other.m_aColor) &&
      this.maComplexColor.equals(other.maComplexColor)
    );
  }
  /** Original borrowed resolved color, with its native non-indexed precondition. @returns Owned const color. */
  public GetColorValue(): Readonly<Color> {
    if (this.IsIndex()) throw new Error("assert(!IsIndex())");
    return this.m_aColor;
  }
  /** Original resolved-color assignment detaches the palette index, retaining name and complex state. @param color - Actual new value. @returns Nothing. */
  public SetColorValue(color: Readonly<Color>): void {
    this.m_aColor.assign(color);
    this.Detach();
  }
  /** Original actual complex-color reference. @returns Mutable owned value. */
  public getComplexColor(): ComplexColor {
    return this.maComplexColor;
  }
  /** Original independent complex-color assignment. @param color - Borrowed source. @returns Nothing. */
  public setComplexColor(color: Readonly<ComplexColor>): void {
    this.maComplexColor.assign(color);
  }
  /** Existing unsupported parameterless browser query; native properties use the Any form. @returns No payload. */
  public override QueryValue(): undefined;
  /** Original RGB Any query for XColorItem. @param output - Native Any. @param member - Original member ID. @returns Whether represented. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original RGB query; the separate complex-color UNO service remains unrepresented. @param output - Optional Any. @param member - Native unsigned8 member. @returns Success or absent browser payload. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    if ((member & 255 & ~128) === MID_COMPLEX_COLOR) return false;
    insertColor(output, this.GetColorValue().GetRGBColor());
    return true;
  }
  /** Original RGB assignment detaches palette state. @param input - Actual Any. @param member - Native unsigned8 member. @returns Extraction success. */
  public override PutValue(input: unknown, member: number): boolean {
    if (!(input instanceof Any) || (member & 255 & ~128) === MID_COMPLEX_COLOR) return false;
    const color = new Color();
    if (!extractColor(input, color)) return false;
    this.SetColorValue(color);
    return true;
  }
}
