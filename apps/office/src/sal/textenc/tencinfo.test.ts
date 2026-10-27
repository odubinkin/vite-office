/** @fileoverview Source text-encoding metadata used by CSV byte escaping. */
import { expect, it } from "vitest";
import descriptors from "./native-singlebyte-descriptors.json";
import sourceInfo from "./native-text-encoding-info.json";
import * as enc from "../inc/rtl/textenc";
import {
  RTL_TEXTENCODING_INFO_ASCII,
  RTL_TEXTENCODING_INFO_CONTEXT,
  RTL_TEXTENCODING_INFO_MULTIBYTE,
  rtl_getTextEncodingFromWindowsCharset,
  rtl_isOctetTextEncoding,
  rtl_getTextEncodingInfo,
  type rtl_TextEncodingInfo,
} from "./tencinfo";

/** Constructs the source-sized output structure. @param size - Claimed struct size. @returns Mutable fields. */
function info(size = 12): rtl_TextEncodingInfo {
  return {
    StructSize: size,
    MinimumCharSize: 0,
    MaximumCharSize: 0,
    AverageCharSize: 0,
    Flags: -1,
  };
}

it("covers all represented converters and full-locale metadata with pinned source flags", /** Checks covers all represented converters and full-locale metadata with pinned source flags. @returns Test completion or assertion result. */ () => {
  expect(Object.keys(sourceInfo).length).toBe(88);
  for (const key of [...Object.keys(descriptors), "76"]) {
    const value = info();
    expect(rtl_getTextEncodingInfo(Number(key), value)).toBe(true);
    expect(value.Flags).toBe(sourceInfo[key as keyof typeof sourceInfo].Flags);
  }
  const western = info(),
    jis = info(),
    utf8 = info(),
    vietnamese = info();
  rtl_getTextEncodingInfo(1, western);
  rtl_getTextEncodingInfo(81, jis);
  rtl_getTextEncodingInfo(76, utf8);
  rtl_getTextEncodingInfo(40, vietnamese);
  expect(western.Flags & RTL_TEXTENCODING_INFO_ASCII).toBeTruthy();
  expect(jis.Flags & (RTL_TEXTENCODING_INFO_CONTEXT | RTL_TEXTENCODING_INFO_ASCII)).toBe(0);
  expect(utf8.MaximumCharSize).toBe(6);
  expect(vietnamese.MaximumCharSize).toBe(2);
});

it("retains the native missing-encoding and short-structure return order", /** Checks retains the native missing-encoding and short-structure return order. @returns Test completion or assertion result. */ () => {
  const full = info(),
    short = info(7),
    tiny = info(4);
  expect(rtl_getTextEncodingInfo(9999, full)).toBe(false);
  expect(full).toMatchObject({
    MinimumCharSize: 1,
    MaximumCharSize: 1,
    AverageCharSize: 1,
    Flags: 0,
  });
  expect(rtl_getTextEncodingInfo(9999, short)).toBe(true);
  expect(short.Flags).toBe(-1);
  expect(rtl_getTextEncodingInfo(1, tiny)).toBe(false);
  expect(tiny.MinimumCharSize).toBe(0);
});

it("writes only fields present in the caller's native structure", /** Checks the ABI field boundaries for known and missing encodings. @returns Nothing. */ () => {
  for (const encoding of [1, 9999]) {
    const minimum = info(5),
      maximum = info(6);
    expect(rtl_getTextEncodingInfo(encoding, minimum)).toBe(true);
    expect(minimum).toMatchObject({
      MinimumCharSize: 1,
      MaximumCharSize: 0,
      AverageCharSize: 0,
      Flags: -1,
    });
    expect(rtl_getTextEncodingInfo(encoding, maximum)).toBe(true);
    expect(maximum).toMatchObject({
      MinimumCharSize: 1,
      MaximumCharSize: 1,
      AverageCharSize: 0,
      Flags: -1,
    });
  }
});

it("uses the original multibyte buffer sizes and flags instead of missing-data defaults", /** Verifies uses the original multibyte buffer sizes and flags instead of missing-data defaults. @returns Nothing. */ () => {
  const cases = [
    [enc.RTL_TEXTENCODING_MS_932, 2, 2, 8],
    [enc.RTL_TEXTENCODING_MS_936, 2, 2, 8],
    [enc.RTL_TEXTENCODING_MS_949, 2, 2, 8],
    [enc.RTL_TEXTENCODING_MS_950, 2, 2, 8],
    [enc.RTL_TEXTENCODING_EUC_JP, 3, 2, 138],
    [enc.RTL_TEXTENCODING_UTF7, 6, 1, 173],
  ] as const;
  for (const [encoding, maximum, average, flags] of cases) {
    const value = info();
    expect(rtl_getTextEncodingInfo(encoding, value)).toBe(true);
    expect(value).toEqual({
      StructSize: 12,
      MinimumCharSize: 1,
      MaximumCharSize: maximum,
      AverageCharSize: average,
      Flags: flags,
    });
    expect(value.Flags & RTL_TEXTENCODING_INFO_MULTIBYTE).toBeTruthy();
  }
  const short = info(6);
  expect(rtl_getTextEncodingInfo(enc.RTL_TEXTENCODING_EUC_JP, short)).toBe(true);
  expect(short).toMatchObject({
    MinimumCharSize: 1,
    MaximumCharSize: 3,
    AverageCharSize: 0,
    Flags: -1,
  });
});

it("keeps native byte charset lookup, unknown fallback and unsigned argument binding", /** Verifies keeps native byte charset lookup, unknown fallback and unsigned argument binding. @returns Nothing. */ () => {
  const bindings = new Map([
    [0, enc.RTL_TEXTENCODING_MS_1252],
    [2, enc.RTL_TEXTENCODING_SYMBOL],
    [77, enc.RTL_TEXTENCODING_APPLE_ROMAN],
    [128, enc.RTL_TEXTENCODING_MS_932],
    [129, enc.RTL_TEXTENCODING_MS_949],
    [130, enc.RTL_TEXTENCODING_MS_1361],
    [134, enc.RTL_TEXTENCODING_MS_936],
    [136, enc.RTL_TEXTENCODING_MS_950],
    [161, enc.RTL_TEXTENCODING_MS_1253],
    [162, enc.RTL_TEXTENCODING_MS_1254],
    [163, enc.RTL_TEXTENCODING_MS_1258],
    [177, enc.RTL_TEXTENCODING_MS_1255],
    [178, enc.RTL_TEXTENCODING_MS_1256],
    [186, enc.RTL_TEXTENCODING_MS_1257],
    [204, enc.RTL_TEXTENCODING_MS_1251],
    [222, enc.RTL_TEXTENCODING_MS_874],
    [238, enc.RTL_TEXTENCODING_MS_1250],
    [255, enc.RTL_TEXTENCODING_IBM_850],
  ]);
  for (let byte = 0; byte < 256; byte++) {
    const encoding = bindings.get(byte) ?? enc.RTL_TEXTENCODING_DONTKNOW;
    expect(rtl_getTextEncodingFromWindowsCharset(byte)).toBe(encoding);
    expect(rtl_getTextEncodingFromWindowsCharset(byte + 256)).toBe(encoding);
  }
  expect(rtl_getTextEncodingFromWindowsCharset(-1)).toBe(enc.RTL_TEXTENCODING_IBM_850);
  expect(rtl_isOctetTextEncoding(enc.RTL_TEXTENCODING_DONTKNOW)).toBe(false);
  expect(rtl_isOctetTextEncoding(9)).toBe(false);
  expect(rtl_isOctetTextEncoding(enc.RTL_TEXTENCODING_MAZOVIA)).toBe(true);
  expect(rtl_isOctetTextEncoding(enc.RTL_TEXTENCODING_MAZOVIA + 1)).toBe(false);
  expect(rtl_isOctetTextEncoding(enc.RTL_TEXTENCODING_UNICODE)).toBe(false);
  expect(rtl_isOctetTextEncoding(65537)).toBe(true);
  const wrapped = info();
  expect(rtl_getTextEncodingInfo(65536 + enc.RTL_TEXTENCODING_EUC_JP, wrapped)).toBe(true);
  expect(wrapped.MaximumCharSize).toBe(3);
});
