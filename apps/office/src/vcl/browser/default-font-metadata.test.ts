/** @fileoverview Source-role metadata over actual shared Font and configured browser family matching. */
import { expect, it } from "vitest";
import { getBrowserDefaultFontMetadata } from "./default-font-metadata";
import { createBrowserDefaultFontDevice, createDefaultFontLocale } from "./default-font-device";
import { DefaultFontType as D } from "../../unotools/inc/fontdefs";
import { FontFamily as F, FontPitch as P } from "../../tools/inc/fontenum";
import { Font } from "../source/font/font";
import { getConfiguredDefaultFont } from "../../unotools/source/config/fontcfg";
import {
  RTL_TEXTENCODING_MS_1251,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UTF8,
} from "../../sal/inc/rtl/textenc";
/** Actual browser boundary face fixture with observable loaded state. @param family - Browser family. @param status - Initial status. @returns Browser face. */
function face(family: string, status: FontFaceLoadStatus = "loaded"): FontFace {
  const result = {
    family,
    status,
    /** Loads the registered browser face fixture. @returns Loaded face. */
    async load() {
      result.status = "loaded";
      return result as unknown as FontFace;
    },
  };
  return result as unknown as FontFace;
}
/** Uses the existing browser device over the real platform collection boundary. @param faces - Platform faces. @returns Native-role device. */
function device(faces: FontFace[]) {
  return createBrowserDefaultFontDevice({ fonts: new Set(faces) } as unknown as Document);
}
const roles = [
  [D.SANS_UNICODE, F.FAMILY_SWISS, P.PITCH_VARIABLE],
  [D.UI_SANS, F.FAMILY_SWISS, P.PITCH_VARIABLE],
  [D.SANS, F.FAMILY_SWISS, P.PITCH_VARIABLE],
  [D.LATIN_HEADING, F.FAMILY_SWISS, P.PITCH_VARIABLE],
  [D.LATIN_SPREADSHEET, F.FAMILY_SWISS, P.PITCH_VARIABLE],
  [D.LATIN_DISPLAY, F.FAMILY_SWISS, P.PITCH_VARIABLE],
  [D.SERIF, F.FAMILY_ROMAN, P.PITCH_VARIABLE],
  [D.LATIN_TEXT, F.FAMILY_ROMAN, P.PITCH_VARIABLE],
  [D.LATIN_PRESENTATION, F.FAMILY_ROMAN, P.PITCH_VARIABLE],
  [D.FIXED, F.FAMILY_MODERN, P.PITCH_FIXED],
  [D.LATIN_FIXED, F.FAMILY_MODERN, P.PITCH_FIXED],
  [D.UI_FIXED, F.FAMILY_MODERN, P.PITCH_FIXED],
  [D.SYMBOL, F.FAMILY_DONTKNOW, P.PITCH_VARIABLE],
  [D.CJK_TEXT, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CJK_PRESENTATION, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CJK_SPREADSHEET, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CJK_HEADING, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CJK_DISPLAY, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CTL_TEXT, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CTL_PRESENTATION, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CTL_SPREADSHEET, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CTL_HEADING, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
  [D.CTL_DISPLAY, F.FAMILY_SYSTEM, P.PITCH_VARIABLE],
] as const;
it.each(roles)(
  "preserves source family/pitch/encoding defaults for role %s",
  /** Verifies independent native metadata expectations with actual configured family selection. @param role - Original role. @param family - Source family. @param pitch - Source pitch. @returns Nothing. */ (
    role,
    family,
    pitch,
  ) => {
    const locale = createDefaultFontLocale(
        role >= D.CTL_TEXT ? "hi-IN" : role >= D.CJK_TEXT ? "zh-CN" : "en-US",
      ),
      configured = getConfiguredDefaultFont(locale, role);
    const name = String.fromCharCode(
      ...configured.getStr().subarray(0, configured.getLength()),
    ).split(";")[0] as string;
    expect(name.length).toBeGreaterThan(0);
    const native = getBrowserDefaultFontMetadata(
      device([face(name)]),
      role,
      locale,
      RTL_TEXTENCODING_MS_1251,
    ) as Font;
    expect(native).toBeInstanceOf(Font);
    expect(native.GetFamilyName()).toBe(name);
    expect(native.GetStyleName()).toBe("");
    expect(native.GetFamilyType()).toBe(family);
    expect(native.GetPitch()).toBe(pitch);
    expect(native.GetCharSet()).toBe(
      role === D.SYMBOL ? RTL_TEXTENCODING_SYMBOL : RTL_TEXTENCODING_MS_1251,
    );
    expect(native.GetFontSize().Width()).toBe(0);
    expect(native.GetFontHeight()).toBe(12);
    configured.dispose();
    locale.dispose();
  },
);
it("retains absence until actual registered faces are prepared and returns independent Font values", /** Verifies native owner identity and existing real device availability. @returns Completion. */ async () => {
  const locale = createDefaultFontLocale("en-US"),
    registered = face("Liberation Sans", "unloaded"),
    actual = device([registered]);
  expect(
    getBrowserDefaultFontMetadata(actual, D.LATIN_SPREADSHEET, locale, RTL_TEXTENCODING_UTF8),
  ).toBeUndefined();
  expect(
    getBrowserDefaultFontMetadata(device([]), D.LATIN_SPREADSHEET, locale, RTL_TEXTENCODING_UTF8),
  ).toBeUndefined();
  await actual.prepareDefaultFont(D.LATIN_SPREADSHEET, locale);
  const first = getBrowserDefaultFontMetadata(
    actual,
    D.LATIN_SPREADSHEET,
    locale,
    RTL_TEXTENCODING_UTF8,
  ) as Font;
  expect(first.GetCharSet()).toBe(RTL_TEXTENCODING_UTF8);
  const copy = new Font(first);
  first.SetFamilyName("Changed");
  first.SetFontHeight(99);
  expect(copy.GetFamilyName()).toBe("Liberation Sans");
  expect(copy.GetFontHeight()).toBe(12);
  expect(
    getBrowserDefaultFontMetadata(
      actual,
      D.LATIN_SPREADSHEET,
      locale,
      RTL_TEXTENCODING_UTF8,
    )?.GetFamilyName(),
  ).toBe("Liberation Sans");
  expect(
    getBrowserDefaultFontMetadata(actual, 999 as D, locale, RTL_TEXTENCODING_UTF8),
  ).toBeUndefined();
  locale.dispose();
});
