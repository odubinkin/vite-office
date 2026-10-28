/** @fileoverview Original MIME lookup VIP equality, ordered aliases, ASCII filtering and thirty-byte prefix limit. */
import { expect, it } from "vitest";
import { rtl_getTextEncodingFromMimeCharset as lookup } from "./tencinfo";
import * as E from "../inc/rtl/textenc";
/** Actual terminated caller bytes. @param text - ASCII spelling. @returns C string bytes. */
function cString(text: string): Uint8Array {
  return Uint8Array.from(
    [...text]
      .map(
        /** Native ASCII caller units. @param c - Character. @returns Byte. */ (c) =>
          c.charCodeAt(0),
      )
      .concat(0),
  );
}
it("uses exact VIP matches before source-ordered permissive aliases", /** These prefix collisions retain original native encoding choices. @returns Nothing. */ () => {
  expect(lookup(cString("UTF-8"))).toBe(E.RTL_TEXTENCODING_UTF8);
  expect(lookup(cString("utf-8-suffix"))).toBe(E.RTL_TEXTENCODING_DONTKNOW);
  expect(lookup(cString("ISO-8859-15"))).toBe(E.RTL_TEXTENCODING_ISO_8859_15);
  expect(lookup(cString("ISO-8859-15-junk"))).toBe(E.RTL_TEXTENCODING_ISO_8859_15);
  expect(lookup(cString("ISO-8859-14-junk"))).toBe(E.RTL_TEXTENCODING_ISO_8859_14);
  expect(lookup(cString("ISO-8859-1-WINDOWS-3.0"))).toBe(E.RTL_TEXTENCODING_ISO_8859_1);
  expect(lookup(cString("ISO-8859-1-win"))).toBe(E.RTL_TEXTENCODING_MS_1252);
  expect(lookup(cString("WINDOWS-1251"))).toBe(E.RTL_TEXTENCODING_MS_1251);
  expect(lookup(cString("Shift_JIS"))).toBe(E.RTL_TEXTENCODING_SHIFT_JIS);
  expect(lookup(cString("MS-Kanji"))).toBe(E.RTL_TEXTENCODING_MS_932);
  expect(lookup(cString("KS_C_5601-1987"))).toBe(E.RTL_TEXTENCODING_MS_949);
  expect(lookup(cString("X-ISCII-DE"))).toBe(E.RTL_TEXTENCODING_ISCII_DEVANAGARI);
});
it("normalizes only ASCII alphanumerics, stops at NUL and bounds normalized length to30", /** Unsupported UTF16/UCS4 names remain DONTKNOW for downstream parser handling. @returns Nothing. */ () => {
  expect(lookup(cString(" U!t.F_8 "))).toBe(E.RTL_TEXTENCODING_UTF8);
  expect(lookup(Uint8Array.of(255, 85, 84, 70, 45, 56, 0, 65))).toBe(E.RTL_TEXTENCODING_UTF8);
  expect(lookup(cString("UTF-8\0ignored"))).toBe(E.RTL_TEXTENCODING_UTF8);
  expect(lookup(cString(""))).toBe(E.RTL_TEXTENCODING_DONTKNOW);
  expect(lookup(cString("????"))).toBe(E.RTL_TEXTENCODING_DONTKNOW);
  expect(lookup(cString("utf-16"))).toBe(E.RTL_TEXTENCODING_DONTKNOW);
  expect(lookup(cString("ucs-4"))).toBe(E.RTL_TEXTENCODING_DONTKNOW);
  expect(lookup(cString("z".repeat(30) + "utf8"))).toBe(E.RTL_TEXTENCODING_DONTKNOW);
  expect(lookup(cString("ISO-8859-15" + "x".repeat(100)))).toBe(E.RTL_TEXTENCODING_ISO_8859_15);
});
