/** @fileoverview Native Calc font/background color values before their real pooled item owners are available. */
import { ComplexColor, ColorType } from "../../../../docmodel/inc/color/ComplexColor";
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

it("retains native Calc font auto and transparent fill colors in actual complex value copies", /** Checks real shared owners without fabricating font/brush item defaults. @returns Nothing. */ () => {
  const font = ComplexColor.createRGB(COL_AUTO),
    fill = ComplexColor.createRGB(COL_TRANSPARENT),
    copy = new ComplexColor(font);
  expect(font.getType()).toBe(ColorType.RGB);
  expect(font.getFinalColor().toUInt32()).toBe(0xffffffff);
  expect(font.getRGBColor().toUInt32()).toBe(0xffffff);
  expect(fill.getFinalColor().toUInt32()).toBe(0xffffffff);
  expect(font.isTransparent()).toBe(false);
  copy.setFinalColor(new Color(0));
  expect(font.getFinalColor().toUInt32()).toBe(0xffffffff);
});

import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { ATTR_FONT_COLOR } from "../../../inc/scitems";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
it("retains actual Calc font-color109 Auto and defaultUnused complex state through real itemset copies", /** Uses the native item and shared itemset, without a substitute ScDocumentPool or resolver. @returns Nothing. */ () => {
  expect(ATTR_FONT_COLOR).toBe(109);
  const item = new SvxColorItem(COL_AUTO, ATTR_FONT_COLOR),
    set = new SfxItemSet(new SfxItemPool(), [[ATTR_FONT_COLOR, ATTR_FONT_COLOR]]);
  set.Put(item);
  item.setColor(new Color(0x123456));
  item.setComplexColor(ComplexColor.createRGB(new Color(0xabcdef)));
  const stored = set.Get(ATTR_FONT_COLOR) as SvxColorItem;
  expect(stored.GetValue().toUInt32()).toBe(0xffffffff);
  expect(stored.getComplexColor().getType()).toBe(ColorType.Unused);
  expect(stored.getComplexColor().getFinalColor().toUInt32()).toBe(0);
  const clone = stored.Clone();
  clone.setColor(new Color(0));
  expect(stored.GetValue().toUInt32()).toBe(0xffffffff);
});
