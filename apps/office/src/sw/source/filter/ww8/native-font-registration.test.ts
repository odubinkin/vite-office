/** @fileoverview Native Writer font registration, configured substitutions and original FFN map identity. */
import { expect, it } from "vitest";
import { FontMapExport, rtl_TextEncodingToWinCharset } from "./writerwordglue";
import { wwFont, wwFontHelper, wwFontLess } from "./wrtw8sty";
import { FontFamily as F, FontPitch as P } from "../../../../tools/inc/fontenum";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
it("maps native family tokens, MS configuration, symbol overrides and secondary fallback", /** Source-defined token handling. @returns Nothing. */ () => {
  expect(new FontMapExport("Liberation Sans;Fallback")).toEqual({
    msPrimary: "Liberation Sans",
    msSecondary: "Arial",
  });
  expect(new FontMapExport("Arial;Fallback;Ignored")).toEqual({
    msPrimary: "Arial",
    msSecondary: "Fallback",
  });
  expect(new FontMapExport("OpenSymbol;Fallback").msSecondary).toBe("Arial Unicode MS");
  expect(new FontMapExport("STARSYMBOL").msSecondary).toBe("Arial Unicode MS");
  expect(new FontMapExport("NoSuchFont").msSecondary).toBe("");
  expect(new FontMapExport(" Arial, Fallback")).toEqual({
    msPrimary: " Arial",
    msSecondary: " Fallback",
  });
  expect(new FontMapExport("")).toEqual({ msPrimary: "", msSecondary: "" });
});
it("retains charset query metadata and native Unicode/default wrapper overrides", /** All wrapper cases remain distinct from the metadata defaults. @returns Nothing. */ () => {
  for (const encoding of [0, 65535, 75, 76, 90])
    expect(rtl_TextEncodingToWinCharset(encoding)).toBe(1);
  expect(rtl_TextEncodingToWinCharset(1)).toBe(0);
  expect(rtl_TextEncodingToWinCharset(10)).toBe(2);
  expect(rtl_TextEncodingToWinCharset(65536 + 76)).toBe(1);
});
it("constructs exact original FFN bytes, alternate-name limits and copied map keys", /** Original byte narrowing and identity are observable. @returns Nothing. */ () => {
  const font = new wwFont("Arial", P.PITCH_VARIABLE, F.FAMILY_SWISS, 1);
  expect([...font.maWW8_FFN]).toEqual([51, 38, 144, 1, 0, 0]);
  const mapped = new wwFont("Liberation Sans", P.PITCH_FIXED, F.FAMILY_ROMAN, 1);
  expect(mapped.msAltNm).toBe("Arial");
  expect(mapped.mbAlt).toBe(true);
  expect(mapped.maWW8_FFN[5]).toBe(16);
  const same = new wwFont("Arial;Arial", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0);
  expect(same.mbAlt).toBe(false);
  const long = new wwFont(
    "A".repeat(40) + ";" + "B".repeat(30),
    P.PITCH_DONTKNOW,
    F.FAMILY_SYSTEM,
    0,
  );
  expect(long.mbAlt).toBe(false);
  const boundary = new wwFont(
    "A".repeat(32) + ";" + "B".repeat(31),
    P.PITCH_DONTKNOW,
    F.FAMILY_DONTKNOW,
    0,
  );
  expect(boundary.mbAlt).toBe(true);
  const narrow = new wwFont("A".repeat(300), P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0);
  expect(narrow.maWW8_FFN[0]).toBe((39 + 602) & 255);
  for (const family of [F.FAMILY_MODERN, F.FAMILY_SCRIPT, F.FAMILY_DECORATIVE] as const)
    expect(new wwFont("font", P.PITCH_DONTKNOW, family, 0).maWW8_FFN[1]).toBe(
      4 +
        ({ [F.FAMILY_MODERN]: 48, [F.FAMILY_SCRIPT]: 64, [F.FAMILY_DECORATIVE]: 80 }[
          family
        ] as number),
    );
  const helper = new wwFontHelper();
  expect(helper.GetId(font)).toBe(0);
  expect(helper.GetId(font)).toBe(0);
  font.maWW8_FFN[0] = 0;
  expect(helper.AsVector()[0]?.maWW8_FFN[0]).toBe(51);
  const original = new SvxFontItem(F.FAMILY_SWISS, "Arial", "", P.PITCH_VARIABLE, 1, 7);
  expect(helper.GetId(original)).toBe(0);
  expect(helper.GetId(mapped)).toBe(1);
  expect(helper.GetId(same)).toBe(2);
  expect(
    helper
      .AsVector()
      .map(
        /** Original ID order. @param value - Registered font. @returns Family. */ (value) =>
          value?.msFamilyNm,
      ),
  ).toEqual(["Arial", "Liberation Sans", "Arial"]);
  expect(wwFontLess(mapped, mapped)).toBe(false);
  const left = new wwFont("same;A", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0),
    right = new wwFont("same;B", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0);
  expect(wwFontLess(left, right)).toBe(true);
  expect(wwFontLess(right, left)).toBe(false);
  const shorter = new wwFont("AAAA", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0),
    later = new wwFont("ZZZZ", P.PITCH_DONTKNOW, F.FAMILY_DONTKNOW, 0);
  expect(wwFontLess(shorter, later)).toBe(true);
  expect(wwFontLess(later, shorter)).toBe(false);
});
