/** @fileoverview Native source comparison for the three CJK converters selected by CSV detection. */
import { expect, it } from "vitest";
import * as F from "../inc/rtl/textcvt.h";
import {
  RTL_TEXTENCODING_BIG5,
  RTL_TEXTENCODING_GB_18030,
  RTL_TEXTENCODING_ISO_2022_CN,
} from "../inc/rtl/textenc";
import native from "./cjk.native.json";
import * as sal from "./textcvt";

/** Matches the native probe's digest over values, output length, flags and consumption. @param hash - Current digest. @param value - Next native integer. @returns Updated unsigned digest. */
function mix(hash: number, value: number): number {
  for (let i = 0; i < 4; i++) hash = Math.imul(hash ^ ((value >>> (8 * i)) & 255), 16777619);
  return hash >>> 0;
}

const decodeFlags =
  F.RTL_TEXTTOUNICODE_FLAGS_FLUSH |
  F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT |
  F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT |
  F.RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT;
const encodeFlags =
  F.RTL_UNICODETOTEXT_FLAGS_FLUSH |
  F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT |
  F.RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT;
const encodings = [
  [RTL_TEXTENCODING_BIG5, native.big5Decode, native.big5Encode],
  [RTL_TEXTENCODING_GB_18030, native.gb18030Decode, native.gb18030Encode],
  [RTL_TEXTENCODING_ISO_2022_CN, native.iso2022cnDecode, native.iso2022cnEncode],
] as const;

it.each(encodings)(
  "matches native decoding across the pinned byte corpus for encoding %i",
  /** Checks actual native SAL results through the dispatcher's descriptor. @param encoding - Native encoding ID. @param expected - Original digest. @returns Nothing. */ (
    encoding,
    expected,
  ) => {
    const converter = sal.rtl_createTextToUnicodeConverter(encoding);
    expect(converter).not.toBeNull();
    const input = new Uint8Array(8);
    const output = new Uint16Array(16);
    const info: [number] = [0];
    const used: [number] = [0];
    let hash = 2166136261;
    /** Feeds the current native byte sample. @param count - Input length. @returns Nothing. */
    function sample(count: number): void {
      const written = sal.rtl_convertTextToUnicode(
        converter,
        null,
        input,
        count,
        output,
        output.length,
        decodeFlags,
        info,
        used,
      );
      hash = mix(mix(mix(hash, written), info[0]), used[0]);
      for (let i = 0; i < written; i++) hash = mix(hash, output[i] as number);
    }
    for (let first = 0; first < 256; first++) {
      input[0] = first;
      sample(1);
      for (let second = 0; second < 256; second++) {
        input[1] = second;
        sample(2);
      }
    }
    if (encoding === RTL_TEXTENCODING_GB_18030) {
      for (let a = 0x81; a <= 0xfe; a++) {
        input[0] = a;
        for (let b = 0x30; b <= 0x39; b++) {
          input[1] = b;
          for (let c = 0x81; c <= 0xfe; c++) {
            input[2] = c;
            for (let d = 0x30; d <= 0x39; d++) {
              input[3] = d;
              sample(4);
            }
          }
        }
      }
    }
    if (encoding === RTL_TEXTENCODING_ISO_2022_CN) {
      for (let row = 0x21; row <= 0x7e; row++)
        for (let column = 0x21; column <= 0x7e; column++) {
          input.set([0x1b, 0x24, 0x29, 0x41, 0x0e, row, column, 0x0f]);
          sample(8);
          input[3] = 0x47;
          sample(8);
          input.set([0x1b, 0x24, 0x2a, 0x48, 0x1b, 0x4e, row, column]);
          sample(8);
        }
    }
    expect(hash).toBe(expected);
  },
);

it.each(encodings)(
  "matches native encoding across its tested UTF-16 corpus for encoding %i",
  /** Checks actual native bytes, status and consumption. @param encoding - Native ID. @param _decode - Decode digest. @param expected - Encode digest. @returns Nothing. */ (
    encoding,
    _decode,
    expected,
  ) => {
    const converter = sal.rtl_createUnicodeToTextConverter(encoding);
    expect(converter).not.toBeNull();
    const input = new Uint16Array(2);
    const output = new Uint8Array(16);
    const info: [number] = [0];
    const used: [number] = [0];
    const unsafe = new Set(
      encoding === RTL_TEXTENCODING_BIG5
        ? native.big5Unsafe
        : encoding === RTL_TEXTENCODING_ISO_2022_CN
          ? native.iso2022cnUnsafe
          : [],
    );
    let hash = 2166136261;
    const max = encoding === RTL_TEXTENCODING_BIG5 ? 0xffff : 0x10ffff;
    for (let value = 0; value <= max; value++) {
      if (unsafe.has(value)) {
        hash = mix(hash, value);
        continue;
      }
      let units = 1;
      if (value < 0x10000) input[0] = value;
      else {
        const adjusted = value - 0x10000;
        input[0] = 0xd800 + (adjusted >> 10);
        input[1] = 0xdc00 + (adjusted & 0x3ff);
        units = 2;
      }
      const written = sal.rtl_convertUnicodeToText(
        converter,
        null,
        input,
        units,
        output,
        output.length,
        encodeFlags,
        info,
        used,
      );
      hash = mix(mix(mix(hash, written), info[0]), used[0]);
      for (let i = 0; i < written; i++) hash = mix(hash, output[i] as number);
    }
    expect(hash).toBe(expected);
  },
);

it("retains GB18030 pending supplementary input across conversions and resets", /** Verifies actual context dispatch and FLUSH behavior. @returns Nothing. */ () => {
  const converter = sal.rtl_createTextToUnicodeConverter(RTL_TEXTENCODING_GB_18030);
  const context = sal.rtl_createTextToUnicodeContext(converter);
  const output = new Uint16Array(2);
  const info: [number] = [0];
  const used: [number] = [0];
  const start = Uint8Array.of(0x90, 0x30, 0x81);
  expect(sal.rtl_convertTextToUnicode(converter, context, start, 3, output, 2, 0, info, used)).toBe(
    0,
  );
  expect([info[0], used[0]]).toEqual([F.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL, 3]);
  const end = Uint8Array.of(0x30);
  expect(
    sal.rtl_convertTextToUnicode(converter, context, end, 1, output, 2, decodeFlags, info, used),
  ).toBe(2);
  expect([...output]).toEqual([0xd800, 0xdc00]);
  sal.rtl_resetTextToUnicodeContext(converter, context);
  expect(
    sal.rtl_convertTextToUnicode(converter, context, end, 1, output, 2, decodeFlags, info, used),
  ).toBe(1);
  expect([output[0], info[0], used[0]]).toEqual([0x30, 0, 1]);
});

it("retains the advanced GB18030 index when a supplementary character exhausts the buffer", /** Compares both calls in the original retry sequence. @returns Nothing. */ () => {
  const converter = sal.rtl_createTextToUnicodeConverter(RTL_TEXTENCODING_GB_18030);
  const context = sal.rtl_createTextToUnicodeContext(converter) as { m_nCode: number };
  const output = new Uint16Array(2);
  const info: [number] = [0];
  const used: [number] = [0];
  const input = Uint8Array.of(0x90, 0x30, 0x81, 0x30);
  const first = sal.rtl_convertTextToUnicode(
    converter,
    context,
    input,
    4,
    output,
    1,
    decodeFlags,
    info,
    used,
  );
  const initial = [first, info[0], used[0], context.m_nCode];
  const second = sal.rtl_convertTextToUnicode(
    converter,
    context,
    input.subarray(3),
    1,
    output,
    2,
    decodeFlags,
    info,
    used,
  );
  expect([...initial, second, info[0], used[0], output[0]]).toEqual(native.gb18030Retry);
});

it("retains ISO-2022-CN designation and shift when a two-byte pair needs four available bytes", /** Compares original partial output and subsequent continuation with the same context. @returns Nothing. */ () => {
  const converter = sal.rtl_createUnicodeToTextConverter(RTL_TEXTENCODING_ISO_2022_CN);
  const context = sal.rtl_createUnicodeToTextContext(converter);
  const source = Uint16Array.of(0x4e2d);
  const output = new Uint8Array(9);
  const info: [number] = [0];
  const used: [number] = [0];
  const first = sal.rtl_convertUnicodeToText(
    converter,
    context,
    source,
    1,
    output,
    8,
    encodeFlags,
    info,
    used,
  );
  const initial = [first, info[0], used[0], ...output.subarray(0, first)];
  const second = sal.rtl_convertUnicodeToText(
    converter,
    context,
    source,
    1,
    output,
    4,
    encodeFlags,
    info,
    used,
  );
  expect([...initial, second, info[0], used[0], ...output.subarray(0, second)]).toEqual(
    native.iso2022cnRetry,
  );
});
