/** @fileoverview Genuine configured no-device OnlyOne defaults alongside existing registered-face matching. */
import { expect, it } from "vitest";
import { createDefaultFontMetadata, getDefaultFontWithoutDevice } from "./font";
import { DefaultFontType as D } from "../../../unotools/inc/fontdefs";
import { createDefaultFontLocale } from "../../browser/default-font-device";
import { getConfiguredDefaultFont } from "../../../unotools/source/config/fontcfg";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { RTL_TEXTENCODING_UTF8, RTL_TEXTENCODING_SYMBOL } from "../../../sal/inc/rtl/textenc";
import { FontFamily as F, FontPitch as P } from "../../../tools/inc/fontenum";
it("uses actual configured first-family tokens without claiming a physical face", /** Covers source logical-only spreadsheet defaults. @returns Nothing. */ () => {
  for (const role of [D.LATIN_SPREADSHEET, D.CJK_SPREADSHEET, D.CTL_SPREADSHEET]) {
    const locale = createDefaultFontLocale(
        role === D.CTL_SPREADSHEET ? "hi-IN" : role === D.CJK_SPREADSHEET ? "zh-CN" : "en-US",
      ),
      configured = getConfiguredDefaultFont(locale, role);
    const font = getDefaultFontWithoutDevice(role, locale, RTL_TEXTENCODING_UTF8);
    expect(font.GetFamilyName()).toBe(text(configured).split(";")[0]);
    expect(font.GetStyleName()).toBe("");
    expect(font.GetFontHeight()).toBe(12);
    configured.dispose();
  }
  expect(
    /** Rejects an unknown native default-font role with no configured family. @returns Never. */ () =>
      getDefaultFontWithoutDevice(
        999 as D,
        createDefaultFontLocale("en-US"),
        RTL_TEXTENCODING_UTF8,
      ),
  ).toThrow(/configured family/);
});
it("projects represented role metadata independently of browser face installation", /** All native type families use existing Font values. @returns Nothing. */ () => {
  for (const role of Object.values(D).filter(
    /** Selects numeric native enum members. @param value - Enum member. @returns Numeric. */ (
      value,
    ): value is D => typeof value === "number",
  )) {
    const font = createDefaultFontMetadata("Configured", role, RTL_TEXTENCODING_UTF8);
    expect(font.GetFamilyName()).toBe("Configured");
    expect(font.GetFontHeight()).toBe(12);
    expect(font.GetCharSet()).toBe(
      role === D.SYMBOL ? RTL_TEXTENCODING_SYMBOL : RTL_TEXTENCODING_UTF8,
    );
  }
  expect(createDefaultFontMetadata("Mono", D.FIXED, RTL_TEXTENCODING_UTF8).GetPitch()).toBe(
    P.PITCH_FIXED,
  );
  expect(createDefaultFontMetadata("Serif", D.SERIF, RTL_TEXTENCODING_UTF8).GetFamilyType()).toBe(
    F.FAMILY_ROMAN,
  );
  expect(createDefaultFontMetadata("Sans", D.SANS, RTL_TEXTENCODING_UTF8).GetFamilyType()).toBe(
    F.FAMILY_SWISS,
  );
  expect(
    createDefaultFontMetadata("Unknown", 999 as D, RTL_TEXTENCODING_UTF8).GetFamilyType(),
  ).toBe(F.FAMILY_DONTKNOW);
});
