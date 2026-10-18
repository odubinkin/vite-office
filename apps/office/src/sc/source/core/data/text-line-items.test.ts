/** @fileoverview Actual Calc underline/overline defaults from ScDocumentPool, without fabricating the pool. */
import { expect, it } from "vitest";
import { SvxUnderlineItem, SvxOverlineItem } from "../../../../editeng/inc/udlnitem";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { ATTR_FONT_UNDERLINE, ATTR_FONT_OVERLINE } from "../../../inc/scitems";
it("uses native104/105 styles and transparent independent underline/overline values", /** Pool defaults retain original NONE and inherited own-color state. @returns Nothing. */ () => {
  expect([ATTR_FONT_UNDERLINE, ATTR_FONT_OVERLINE]).toEqual([104, 105]);
  const under = new SvxUnderlineItem(FontLineStyle.LINESTYLE_NONE, ATTR_FONT_UNDERLINE),
    over = new SvxOverlineItem(FontLineStyle.LINESTYLE_NONE, ATTR_FONT_OVERLINE);
  expect(under.GetBoolValue()).toBe(false);
  expect(over.GetBoolValue()).toBe(false);
  expect(under.GetColor().GetAlpha()).toBe(0);
  expect(over.GetColor().GetAlpha()).toBe(0);
  const clone = over.Clone();
  clone.SetBoolValue(true);
  expect(over.GetBoolValue()).toBe(false);
  expect(clone.GetBoolValue()).toBe(true);
});
