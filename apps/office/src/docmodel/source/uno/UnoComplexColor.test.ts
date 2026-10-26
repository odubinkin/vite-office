/** @fileoverview Actual UnoComplexColor component copies, signed color conversion, weak lifetime and shared type-provider integration. */
import { expect, it } from "vitest";
import {
  UnoComplexColor,
  createXComplexColor,
  getFromXComplexColor,
} from "../../inc/uno/UnoComplexColor";
import { ComplexColor, ColorType } from "../../inc/color/ComplexColor";
import { ThemeColorType } from "../../inc/theme/ThemeColorType";
import { Color, ColorTransparency } from "../../../tools/inc/color";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { XComplexColor } from "../../../offapi/com/sun/star/util/XComplexColor";
import { XTheme } from "../../../offapi/com/sun/star/util/XTheme";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import type { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { UnoType } from "../../../cppu/inc/unotype";

it("returns a copied native color and stored final color while ignoring the supplied theme", /** Checks complete actual component/factory contracts and signed32 alpha transport. @returns Nothing. */ () => {
  /** Concrete caller theme has actual weak/type-provider lifetime; neither virtual method may be consulted by the original resolver. */
  class Theme extends WeakImplHelper.specialize(XTheme) implements XTheme {
    /** Detects unexpected theme-name access. @returns No value. */
    getName(): OUString {
      throw new Error("unexpected theme name lookup");
    }
    /** Detects unexpected palette resolution. @returns No value. */
    getColorSet(): Sequence<number> {
      throw new Error("unexpected theme palette lookup");
    }
  }
  const source = new ComplexColor();
  source.setType(ColorType.Theme);
  source.setThemeColor(ThemeColorType.Accent3);
  source.setFinalColor(new Color(ColorTransparency, 0x81234567, "ColorTransparencyTag"));
  const reference = createXComplexColor(source),
    object = reference.get() as UnoComplexColor,
    weak = new WeakReferenceHelper(reference),
    theme = new Reference<XTheme>(new Theme());
  source.setType(ColorType.RGB);
  source.setFinalColor(new Color(0xaabbcc));
  expect(object.getType()).toBe(ColorType.Theme);
  expect(object.getThemeColorType()).toBe(ThemeColorType.Accent3);
  expect(object.resolveColor(theme)).toBe(0x81234567 | 0);
  const first = getFromXComplexColor(reference);
  expect(first.equals(object.getComplexColor())).toBe(true);
  first.setType(ColorType.HSL);
  expect(object.getType()).toBe(ColorType.Theme);
  for (const type of [
    XComplexColor.static_type(),
    XTypeProvider.static_type(),
    UnoType.get("XInterface"),
  ]) {
    const result = object.queryInterface(type);
    expect(result.pReserved).toBe(object);
    result.dispose();
  }
  const types = object.getTypes();
  expect(types.getLength()).toBe(3);
  expect(types.operatorIndex(0).operatorEqual(XComplexColor.static_type())).toBe(true);
  types.dispose();
  reference.dispose();
  const dead = weak.get();
  expect(dead.is()).toBe(false);
  dead.dispose();
  weak.dispose();
  theme.dispose();
  const nil = new Reference<XComplexColor>();
  expect(getFromXComplexColor(nil).equals(new ComplexColor())).toBe(true);
  nil.dispose();
});
