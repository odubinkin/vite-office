/** @fileoverview Native RTF font charset selection through actual checked SAL conversion. */
import { expect, it } from "vitest";
import { rtl_TextEncodingToWinCharsetRTF } from "./writerwordglue";
import * as enc from "../../../../sal/inc/rtl/textenc";

it("retains the initial charset when both native names can be encoded", /** Verifies retains the initial charset when both native names can be encoded. @returns Nothing. */ () => {
  expect(rtl_TextEncodingToWinCharsetRTF("Café", "Arial", enc.RTL_TEXTENCODING_MS_1252)).toBe(0);
  expect(rtl_TextEncodingToWinCharsetRTF("Arial", "", enc.RTL_TEXTENCODING_UTF8)).toBe(0);
  expect(rtl_TextEncodingToWinCharsetRTF("굴림", "Gulim", enc.RTL_TEXTENCODING_MS_949)).toBe(0x81);
});

it("uses the exact source fallback order and validates the alternate name", /** Verifies uses the exact source fallback order and validates the alternate name. @returns Nothing. */ () => {
  expect(rtl_TextEncodingToWinCharsetRTF("日本語", "", enc.RTL_TEXTENCODING_MS_1252)).toBe(0x80);
  expect(rtl_TextEncodingToWinCharsetRTF("汉", "", enc.RTL_TEXTENCODING_MS_1252)).toBe(0x86);
  expect(rtl_TextEncodingToWinCharsetRTF("굴림", "", enc.RTL_TEXTENCODING_MS_1252)).toBe(0x81);
  expect(rtl_TextEncodingToWinCharsetRTF("Arial", "굴림", enc.RTL_TEXTENCODING_MS_1252)).toBe(0x81);
  expect(rtl_TextEncodingToWinCharsetRTF("Arial", "😀", enc.RTL_TEXTENCODING_MS_1252)).toBe(1);
});

it("preserves unknown-charset fallback and rejects unencodable native names", /** Verifies preserves unknown-charset fallback and rejects unencodable native names. @returns Nothing. */ () => {
  expect(rtl_TextEncodingToWinCharsetRTF("Arial", "", enc.RTL_TEXTENCODING_DONTKNOW)).toBe(0x80);
  // The original INVALID_ERROR argument is from the opposite flag family (0x100).
  expect(rtl_TextEncodingToWinCharsetRTF("\udc00", "", enc.RTL_TEXTENCODING_MS_1252)).toBe(1);
  expect(rtl_TextEncodingToWinCharsetRTF("😀", "", enc.RTL_TEXTENCODING_MS_1252)).toBe(1);
});
