/** @fileoverview Native XFillColorItem constructor and clone family from xattr.cxx. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import {
  MID_COLOR_THEME_INDEX,
  MID_COLOR_LUM_MOD,
  MID_COLOR_LUM_OFF,
} from "../../editeng/inc/memberids";
import { convertToThemeColorType } from "../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../docmodel/inc/color/Transformation";
import { XColorItem } from "./xcolit";
import type { Color } from "../../tools/inc/color";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { XATTR_FILLCOLOR } from "./xdef";
/** Drawing fill color retains the native default Which0 and explicit constructor Which1015. */
export class XFillColorItem extends XColorItem {
  /** Original default, named/indexed and implicit-copy forms. @param args - Source overload. @returns Item. */
  public constructor(
    ...args: [] | [nameOrIndex: string | number, color: Readonly<Color>] | [source: XFillColorItem]
  ) {
    if (args[0] instanceof XFillColorItem) super(args[0]);
    else if (args.length === 0) super();
    else super(XATTR_FILLCOLOR, args[0] as string | number, args[1] as Readonly<Color>);
  }
  /** Original default factory deliberately returns the zero-Which default form. @returns Item. */
  public static CreateDefault(): XFillColorItem {
    return new XFillColorItem();
  }
  /** Original copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): XFillColorItem {
    void pool;
    return new XFillColorItem(this);
  }
  /** Existing unsupported browser query. @returns No payload. */
  public override QueryValue(): undefined;
  /** Original fill color property query. @param output - Native Any. @param member - Native member ID. @returns Whether represented. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original RGB and theme/luminance queries; repeated transformations use the last matching value. @param output - Optional Any. @param member - Unsigned8 source selector. @returns Success or absent browser payload. */
  public override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    const id = member & 255 & ~128;
    if (id === MID_COLOR_THEME_INDEX) {
      output.insert([this.getComplexColor().getThemeColorType()], "sal_Int16");
      return true;
    }
    if (id === MID_COLOR_LUM_MOD || id === MID_COLOR_LUM_OFF) {
      let value = id === MID_COLOR_LUM_MOD ? 10000 : 0;
      const type = id === MID_COLOR_LUM_MOD ? TransformationType.LumMod : TransformationType.LumOff;
      for (const transformation of this.getComplexColor().getTransformations())
        if (transformation.meType === type) value = transformation.mnValue;
      output.insert([value], "sal_Int16");
      return true;
    }
    return super.QueryValue(output, member);
  }
  /** Original theme/luminance mutation retains unrelated transformations and color fields. @param input - Actual Any. @param member - Unsigned8 source selector. @returns Extraction success. */
  public override PutValue(input: unknown, member: number): boolean {
    const id = member & 255 & ~128;
    if (id !== MID_COLOR_THEME_INDEX && id !== MID_COLOR_LUM_MOD && id !== MID_COLOR_LUM_OFF)
      return super.PutValue(input, member);
    if (!(input instanceof Any)) return false;
    const value: [number] = [id === MID_COLOR_LUM_MOD ? 10000 : id === MID_COLOR_LUM_OFF ? 0 : -1];
    if (!input.extract(value, "sal_Int16")) return false;
    if (id === MID_COLOR_THEME_INDEX)
      this.getComplexColor().setThemeColor(convertToThemeColorType(value[0]));
    else {
      const type = id === MID_COLOR_LUM_MOD ? TransformationType.LumMod : TransformationType.LumOff;
      this.getComplexColor().removeTransformations(type);
      this.getComplexColor().addTransformation(new Transformation(type, value[0]));
    }
    return true;
  }
}
