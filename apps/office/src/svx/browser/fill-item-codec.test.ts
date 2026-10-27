/** @fileoverview Verifies browser transport preserves native fill type, index/color and complex ownership. */
import { expect, it } from "vitest";
import { XFillColorItem } from "../inc/xflclit";
import { XFillStyleItem } from "../inc/xfillit0";
import { XFillTransparenceItem } from "../inc/xfltrit";
import { XFillUseSlideBackgroundItem } from "../inc/xfilluseslidebackgrounditem";
import { Color } from "../../tools/inc/color";
import { ComplexColor, SystemColorType } from "../../docmodel/inc/color/ComplexColor";
import { encodeFillItem, decodeFillItem } from "./fill-item-codec";
it("preserves indexed color payload without invoking the non-indexed getter or detaching", /** Checks actual constructors/cloneable state and independent restored owners. @returns Nothing. */ () => {
  const item = new XFillColorItem(7, new Color(0x123456)),
    complex = new ComplexColor();
  complex.setSystemColor(SystemColorType.WindowText, 0xabcdef);
  item.setComplexColor(complex);
  item.SetName("Named");
  const record = encodeFillItem(item);
  expect(record).not.toBeNull();
  if (record === null) throw new Error("Missing fill record");
  const copy = decodeFillItem(structuredClone(record));
  expect(copy).toBeInstanceOf(XFillColorItem);
  if (!(copy instanceof XFillColorItem)) throw new Error("Missing native fill color");
  expect(copy.GetPalIndex()).toBe(7);
  expect(item.GetPalIndex()).toBe(7);
  expect(copy.GetName()).toBe("Named");
  expect(copy.equals(item)).toBe(true);
  expect(encodeFillItem(copy)).toEqual(record);
  copy.getComplexColor().setFinalColor(new Color(0));
  expect(encodeFillItem(item)).toEqual(record);
});
it("restores concrete native style, transparency and slide-background classes", /** Checks source values and exact native item types. @returns Nothing. */ () => {
  for (const item of [
    new XFillStyleItem(),
    new XFillTransparenceItem(47),
    new XFillUseSlideBackgroundItem(true),
  ]) {
    const record = encodeFillItem(item);
    if (record === null) throw new Error("Missing fill record");
    const restored = decodeFillItem(structuredClone(record));
    expect(restored?.constructor).toBe(item.constructor);
    expect(restored?.equals(item)).toBe(true);
  }
});
