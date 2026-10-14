/** @fileoverview Native Calc font/background color values before their real pooled item owners are available. */
import { expect, it } from "vitest";
import {
  Color,
  COL_AUTO,
  COL_TRANSPARENT,
  ColorToAny,
  extractColor,
} from "../../../../tools/inc/color";
it("retains original automatic font and transparent background values through independent copies and actual Any", /** No fake coloritem, DocPool or document provider. @returns Nothing. */ () => {
  const font = new Color(COL_AUTO),
    background = new Color(COL_TRANSPARENT);
  expect([font.toUInt32(), background.toUInt32()]).toEqual([0xffffffff, 0xffffffff]);
  expect(font.GetAlpha()).toBe(0);
  const any = ColorToAny(font);
  try {
    const restored = new Color();
    expect(extractColor(any, restored)).toBe(true);
    expect(restored.equals(font)).toBe(true);
    restored.SetAlpha(255);
    expect(restored.toUInt32()).toBe(0xffffff);
    expect(font.toUInt32()).toBe(0xffffffff);
  } finally {
    any.dispose();
  }
});
