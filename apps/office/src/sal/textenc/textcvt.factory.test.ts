/** @fileoverview Native reverse descriptor/context routing and actual byte-output integration. */
import { expect, it } from "vitest";
import * as enc from "../inc/rtl/textenc";
import * as flags from "../inc/rtl/textcvt.h";
import descriptors from "./native-singlebyte-descriptors.json";
import * as cvt from "./textcvt";
import type { ImplUnicodeToIso2022JpContext } from "./convertiso2022jp";
import type { ImplUnicodeToUtf8Context } from "./tcvtutf8";

/** Converts via the actual generic factory with the native reverse context. @param encoding - Encoding ID. @param units - Input units. @returns Bytes and native result fields. */
function encode(encoding: number, units: readonly number[]) {
  const converter = cvt.rtl_createUnicodeToTextConverter(encoding);
  expect(converter).not.toBeNull();
  const context = cvt.rtl_createUnicodeToTextContext(converter);
  const output = new Uint8Array(64),
    info: [number] = [99],
    consumed: [number] = [99];
  const written = cvt.rtl_convertUnicodeToText(
    converter,
    context,
    Uint16Array.from(units),
    units.length,
    output,
    64,
    flags.RTL_UNICODETOTEXT_FLAGS_FLUSH,
    info,
    consumed,
  );
  cvt.rtl_destroyUnicodeToTextContext(converter, context);
  cvt.rtl_destroyUnicodeToTextConverter(converter);
  return { bytes: [...output.subarray(0, written)], info: info[0], consumed: consumed[0] };
}

it.each([
  [enc.RTL_TEXTENCODING_MS_1252, [0x20ac], [0x80]],
  [enc.RTL_TEXTENCODING_MS_932, [0x6f22], [0x8a, 0xbf]],
  [enc.RTL_TEXTENCODING_MS_936, [0x6c49], [0xba, 0xba]],
  [enc.RTL_TEXTENCODING_MS_949, [0xd55c], [0xc7, 0xd1]],
  [enc.RTL_TEXTENCODING_MS_950, [0x6f22], [0xba, 0x7e]],
  [enc.RTL_TEXTENCODING_EUC_JP, [0x6f22], [0xb4, 0xc1]],
  [enc.RTL_TEXTENCODING_EUC_KR, [0xd55c], [0xc7, 0xd1]],
  [enc.RTL_TEXTENCODING_SYMBOL, [0xf041], [0x41]],
  [enc.RTL_TEXTENCODING_UTF8, [0xd83d, 0xde00], [0xf0, 0x9f, 0x98, 0x80]],
  [enc.RTL_TEXTENCODING_UTF7, [0xe9], [0x2b, 0x41, 0x4f, 0x6b, 0x2d]],
  [enc.RTL_TEXTENCODING_ISCII_DEVANAGARI, [0x950], [0xa1, 0xe9]],
  [enc.RTL_TEXTENCODING_ISO_2022_JP, [0x65e5], [0x1b, 0x24, 0x42, 0x46, 0x7c, 0x1b, 0x28, 0x42]],
  [enc.RTL_TEXTENCODING_ISO_2022_KR, [0xac00], [0x1b, 0x24, 0x29, 0x43, 0x0e, 0x30, 0x21, 0xf]],
] as const)("dispatches native reverse bytes for encoding %i", (encoding, units, bytes) => {
  expect(encode(encoding, units)).toEqual({ bytes: [...bytes], info: 0, consumed: units.length });
});

it("binds every represented single-byte descriptor instead of a smaller handwritten switch", () => {
  expect(Object.keys(descriptors)).toHaveLength(55);
  for (const key of Object.keys(descriptors))
    expect(encode(Number(key), [0x41])).toEqual({ bytes: [0x41], info: 0, consumed: 1 });
});

it("returns the same static descriptor in both directions with unsigned ID binding", () => {
  const native = cvt.rtl_createTextToUnicodeConverter(enc.RTL_TEXTENCODING_MS_932);
  expect(cvt.rtl_createUnicodeToTextConverter(enc.RTL_TEXTENCODING_MS_932)).toBe(native);
  expect(cvt.rtl_createUnicodeToTextConverter(65536 + enc.RTL_TEXTENCODING_MS_932)).toBe(native);
  expect(cvt.rtl_createUnicodeToTextContext(native)).toBe(1);
  expect(cvt.rtl_createUnicodeToTextContext(null)).toBeNull();
  cvt.rtl_resetUnicodeToTextContext(native, 1);
  cvt.rtl_resetUnicodeToTextContext(null, null);
  cvt.rtl_destroyUnicodeToTextContext(null, null);
});

it("retains actual streaming state across a partial JIS designation and reset", () => {
  const converter = cvt.rtl_createUnicodeToTextConverter(enc.RTL_TEXTENCODING_ISO_2022_JP);
  const context = cvt.rtl_createUnicodeToTextContext(converter) as ImplUnicodeToIso2022JpContext;
  const bytes = new Uint8Array(8),
    info: [number] = [0],
    consumed: [number] = [0];
  expect(
    cvt.rtl_convertUnicodeToText(
      converter,
      context,
      Uint16Array.of(0x65e5),
      1,
      bytes,
      3,
      0,
      info,
      consumed,
    ),
  ).toBe(3);
  expect([info[0], consumed[0], context.m_b0208]).toEqual([
    flags.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL,
    0,
    true,
  ]);
  expect(
    cvt.rtl_convertUnicodeToText(
      converter,
      context,
      Uint16Array.of(0x65e5),
      1,
      bytes,
      8,
      flags.RTL_UNICODETOTEXT_FLAGS_FLUSH,
      info,
      consumed,
    ),
  ).toBe(5);
  expect([...bytes.subarray(0, 5)]).toEqual([0x46, 0x7c, 0x1b, 0x28, 0x42]);
  context.m_b0208 = true;
  context.m_nHighSurrogate = 0xd800;
  cvt.rtl_resetUnicodeToTextContext(converter, context);
  expect(context).toEqual({ m_nHighSurrogate: 0, m_b0208: false });
});

it("keeps UTF8 signature lifecycle and source missing-converter fallback", () => {
  const converter = cvt.rtl_createUnicodeToTextConverter(enc.RTL_TEXTENCODING_UTF8);
  const context = cvt.rtl_createUnicodeToTextContext(converter) as ImplUnicodeToUtf8Context;
  const bytes = new Uint8Array(8);
  expect(
    cvt.rtl_convertUnicodeToText(
      converter,
      context,
      Uint16Array.of(0x41),
      1,
      bytes,
      8,
      flags.RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE,
      null,
      null,
    ),
  ).toBe(4);
  expect([...bytes.subarray(0, 4)]).toEqual([0xef, 0xbb, 0xbf, 0x41]);
  expect(
    cvt.rtl_convertUnicodeToText(
      converter,
      context,
      Uint16Array.of(0x42),
      1,
      bytes,
      8,
      flags.RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE,
      null,
      null,
    ),
  ).toBe(1);
  cvt.rtl_resetUnicodeToTextContext(converter, context);
  expect(context.nHighSurrogate).toBe(0xffff);
  expect(cvt.rtl_createUnicodeToTextConverter(enc.RTL_TEXTENCODING_DONTKNOW)).toBeNull();
  expect(
    cvt.rtl_convertUnicodeToText(null, null, Uint16Array.of(0x1234), 1, bytes, 8, 0, null, null),
  ).toBe(1);
  expect(bytes[0]).toBe(0x34);
});

it("preserves the original JIS X0201 null forward callback and kana table", () => {
  const converter = cvt.rtl_createUnicodeToTextConverter(enc.RTL_TEXTENCODING_JIS_X_0201);
  expect(converter).toMatchObject({ kind: "single-byte", textToUnicode: null });
  expect(encode(enc.RTL_TEXTENCODING_JIS_X_0201, [0xff61, 0xff65, 0xff9f])).toEqual({
    bytes: [0xa1, 0x5a, 0xdf],
    info: 0,
    consumed: 3,
  });
  expect(encode(enc.RTL_TEXTENCODING_JIS_X_0201, [0xa5, 0x203e])).toEqual({
    bytes: [0x3f, 0x3f],
    info: flags.RTL_UNICODETOTEXT_INFO_UNDEFINED,
    consumed: 2,
  });
  expect(() =>
    cvt.rtl_convertTextToUnicode(
      converter,
      1,
      Uint8Array.of(0x41),
      1,
      new Uint16Array(1),
      1,
      0,
      null,
      null,
    ),
  ).toThrow("callback is null");
});

it("admits only the original reverse assertion flag domain", () => {
  const bytes = new Uint8Array(1);
  for (const invalid of [0xf, 0xf0, 0x20000])
    expect(() =>
      cvt.rtl_convertUnicodeToText(
        null,
        null,
        Uint16Array.of(0x41),
        1,
        bytes,
        1,
        invalid,
        null,
        null,
      ),
    ).toThrow("conversion flags");
});
