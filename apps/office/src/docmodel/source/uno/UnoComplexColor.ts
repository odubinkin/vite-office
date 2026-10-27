/** @fileoverview Original UnoComplexColor component and factories over actual ComplexColor, WeakImplHelper and UNO Reference owners; resolveColor intentionally returns stored final color regardless of theme. */
import { ComplexColor } from "../../inc/color/ComplexColor";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XComplexColor } from "../../../offapi/com/sun/star/util/XComplexColor";
import type { XTheme } from "../../../offapi/com/sun/star/util/XTheme";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { Color } from "../../../offapi/com/sun/star/util/Color";

/** Original final component owns a value copy, with weak/type provider lifetime in the original shared helper. */
export class UnoComplexColor
  extends WeakImplHelper.specialize(XComplexColor)
  implements XComplexColor
{
  private readonly maColor: ComplexColor;
  /** Original constructor copies the complete source color value. @param color - Borrowed value. @returns Component. */
  constructor(color: Readonly<ComplexColor>) {
    super();
    this.maColor = new ComplexColor(color);
  }
  /** Original inline const member access. @returns Borrowed value. */
  getComplexColor(): Readonly<ComplexColor> {
    return this.maColor;
  }
  /** Original signed32 representation conversion. @returns Representation identifier. */
  getType(): number {
    return this.maColor.getType() | 0;
  }
  /** Original signed32 theme conversion. @returns Theme identifier. */
  getThemeColorType(): number {
    return this.maColor.getThemeColorType() | 0;
  }
  /** Original ignores the theme reference and returns the full signed32 final color, including transparency. @param theme - Ignored actual theme reference. @returns Stored final color. */
  resolveColor(theme: Reference<XTheme>): Color {
    void theme;
    return this.maColor.getFinalColor().toInt32();
  }
}
/** Original factory returns an acquired XComplexColor reference. @param color - Borrowed value. @returns Acquired component. */
export function createXComplexColor(color: Readonly<ComplexColor>): Reference<XComplexColor> {
  return new Reference(new UnoComplexColor(color));
}
/** Original unchecked static downcast: supplied nonnull references must be UnoComplexColor, with no alternative provider/query/default fallback. @param color - Borrowed original component reference. @returns Independent copied color, or default for null. */
export function getFromXComplexColor(color: Reference<XComplexColor>): ComplexColor {
  const result = new ComplexColor(),
    component = color.get() as UnoComplexColor | null;
  if (component) result.assign(component.getComplexColor());
  return result;
}
