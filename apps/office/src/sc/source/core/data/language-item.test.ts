/** @fileoverview Actual Calc Latin/CJK/CTL language default witnesses from ScDocumentPool. */
import { expect, it } from "vitest";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LANGUAGE_DONTKNOW, LANGUAGE_GERMAN } from "../../../../i18nlangtag/inc/lang";
import {
  ATTR_FONT_LANGUAGE,
  ATTR_CJK_FONT_LANGUAGE,
  ATTR_CTL_FONT_LANGUAGE,
} from "../../../inc/scitems";
it("uses original unknown defaults for all three scripts, distinct from the German factory", /** No ScDocumentPool facade or locale fallback is fabricated. @returns Nothing. */ () => {
  expect([ATTR_FONT_LANGUAGE, ATTR_CJK_FONT_LANGUAGE, ATTR_CTL_FONT_LANGUAGE]).toEqual([
    110, 115, 120,
  ]);
  for (const which of [ATTR_FONT_LANGUAGE, ATTR_CJK_FONT_LANGUAGE, ATTR_CTL_FONT_LANGUAGE]) {
    const item = new SvxLanguageItem(LANGUAGE_DONTKNOW, which),
      copy = item.Clone();
    expect(item.Which()).toBe(which);
    expect(item.GetLanguage()).toBe(1023);
    copy.SetValue(LANGUAGE_GERMAN);
    expect(item.GetLanguage()).toBe(LANGUAGE_DONTKNOW);
  }
  expect(SvxLanguageItem.CreateDefault().GetLanguage()).toBe(1031);
});
