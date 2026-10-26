/** @fileoverview Source text-encoding metadata used by CSV byte escaping. */
import { expect, it } from "vitest";
import descriptors from "./native-singlebyte-descriptors.json";
import sourceInfo from "./native-text-encoding-info.json";
import {
  RTL_TEXTENCODING_INFO_ASCII,
  RTL_TEXTENCODING_INFO_CONTEXT,
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

it("covers all represented single-byte converters and UTF-8 with pinned source flags", () => {
  expect(Object.keys(sourceInfo).length).toBe(Object.keys(descriptors).length + 1);
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

it("retains the native missing-encoding and short-structure return order", () => {
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
