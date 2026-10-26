/** @fileoverview Native MS font substitution configuration and raw token inclusion rules. */
import { expect, it } from "vitest";
import { FontSubstConfiguration } from "./fontcfg";
import { GetSubsFontName, SubsFontFlags as S } from "../../inc/fontdefs";
import { rtl_getBestWindowsCharsetFromTextEncoding } from "../../../sal/textenc/tencinfo";
import charsets from "../../../sal/textenc/windows-charsets.json" with { type: "json" };
/** Original logical UTF16 view. @param value - Unicode input. @returns Native units. */
function units(value: string): Uint16Array {
  const result = new Uint16Array(value.length);
  for (let index = 0; index < value.length; ++index) result[index] = value.charCodeAt(index);
  return result;
}
/** Call the genuine shared string owner and release it after inspection. @param value - Family list. @param flags - Original bits. @returns Unicode text. */
function substitute(value: string, flags: S): string {
  const result = GetSubsFontName(units(value), flags);
  try {
    let text = "";
    for (let index = 0; index < result.getLength(); ++index)
      text += String.fromCharCode(result.getStr()[index] as number);
    return text;
  } finally {
    result.dispose();
  }
}
it("looks up exact lower-bound matches without inventing prefix fallback", /** Native search and fixed language defaults. @returns Nothing. */ () => {
  const config = FontSubstConfiguration.get();
  expect(config).toBe(FontSubstConfiguration.get());
  expect(config.getSubstInfo("LIBERATIONSANS")?.MSSubstitutions).toEqual(["Arial"]);
  expect(config.getSubstInfo("")).toBeNull();
  expect(config.getSubstInfo("zzzzzzzz")).toBeNull();
  expect(config.getSubstInfo("liberationsansblack")).toBeNull();
  expect(config.getSubstInfo("liberation")).toBeNull();
  expect(substitute("Liberation Sans", S.MS | S.ONLYONE)).toBe("Arial");
  expect(substitute("Liberation Sans;Arial", S.MS | S.ONLYONE)).toBe("");
  expect(substitute("Liberation Sans;arial", S.MS)).toBe("Arial");
  expect(substitute("OpenSymbol", S.MS | S.ONLYONE)).toBe("");
  expect(substitute("StarSymbol", S.MS | S.ONLYONE)).toBe("");
  expect(substitute("OpenSymbol", S.MS)).toBe("Arial Unicode MS");
  expect(substitute("missing", S.MS)).toBe("");
  expect(substitute("Liberation Sans", S.ONLYONE)).toBe("");
});
it("queries all bound native charset metadata and preserves undefined defaults", /** Every extracted metadata record is queried. @returns Nothing. */ () => {
  for (const [encoding, charset] of Object.entries(charsets))
    expect(rtl_getBestWindowsCharsetFromTextEncoding(Number(encoding))).toBe(charset);
  for (const encoding of [0, 9, 97, 65535, -1])
    expect(rtl_getBestWindowsCharsetFromTextEncoding(encoding)).toBe(1);
  expect(rtl_getBestWindowsCharsetFromTextEncoding(65537)).toBe(0);
});
