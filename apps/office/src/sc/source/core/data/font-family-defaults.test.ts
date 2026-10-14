/** @fileoverview Native Calc font-family slot identities and real shared attribute ownership, without a fake default-font device or ScDocPool. */
import { expect, it } from "vitest";
import { ATTR_FONT, ATTR_CJK_FONT, ATTR_CTL_FONT } from "../../../inc/scitems";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
it("retains native100111116 font slots and independent full font fields in real item sets", /** Caller-selected actual font value is not a substitute for unported OutputDevice defaults. @returns Nothing. */ () => {
  expect([ATTR_FONT, ATTR_CJK_FONT, ATTR_CTL_FONT]).toEqual([100, 111, 116]);
  const set = new SfxItemSet(new SfxItemPool(), [[100, 116]]);
  for (const which of [ATTR_FONT, ATTR_CJK_FONT, ATTR_CTL_FONT]) {
    const source = new SvxFontItem(
      FontFamily.FAMILY_SWISS,
      "Selected Face",
      "Regular",
      FontPitch.PITCH_VARIABLE,
      RTL_TEXTENCODING_DONTKNOW,
      which,
    );
    set.Put(source);
    source.SetFamilyName("Changed");
    source.SetStyleName("Bold");
    const stored = set.Get(which) as SvxFontItem;
    expect([
      stored.GetFamilyName(),
      stored.GetStyleName(),
      stored.GetFamily(),
      stored.GetPitch(),
      stored.GetCharSet(),
    ]).toEqual([
      "Selected Face",
      "Regular",
      FontFamily.FAMILY_SWISS,
      FontPitch.PITCH_VARIABLE,
      RTL_TEXTENCODING_DONTKNOW,
    ]);
    const copy = stored.Clone();
    copy.SetCharSet(10);
    expect(stored.GetCharSet()).toBe(0);
  }
});
