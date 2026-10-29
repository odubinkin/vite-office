/** @fileoverview Converter reset ownership through real stateful SAL encoding descriptors. */
import { expect, it } from "vitest";
import * as E from "../inc/rtl/textenc";
import * as F from "../inc/rtl/textcvt.h";
import * as C from "./textcvt";

it.each([
  [E.RTL_TEXTENCODING_UTF7, [43, 65, 69], 0x416],
  [E.RTL_TEXTENCODING_ISCII_DEVANAGARI, [0xef, 0x42], 0x915],
  [E.RTL_TEXTENCODING_ISO_2022_JP, [27, 36, 66], 0x3042],
  [E.RTL_TEXTENCODING_ISO_2022_KR, [27, 36, 41, 67, 14], 0xac00],
] as const)(
  "resets streaming owners for encoding %i",
  /** Ensures reset discards pending shift state in both directions. @param encoding - Native encoding. @param prefix - Partial or shifted byte input. @param scalar - Representable non-ASCII input. @returns Nothing. */ (
    encoding,
    prefix,
    scalar,
  ) => {
    const decoder = C.rtl_createTextToUnicodeConverter(encoding),
      context = C.rtl_createTextToUnicodeContext(decoder);
    const units = new Uint16Array(32),
      info: [number] = [0],
      consumed: [number] = [0];
    const bytes = Uint8Array.from(prefix);
    C.rtl_convertTextToUnicode(
      decoder,
      context,
      bytes,
      bytes.length,
      units,
      units.length,
      0,
      info,
      consumed,
    );
    C.rtl_resetTextToUnicodeContext(decoder, context);
    expect(
      C.rtl_convertTextToUnicode(
        decoder,
        context,
        Uint8Array.of(65),
        1,
        units,
        units.length,
        F.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
        info,
        consumed,
      ),
    ).toBe(1);
    expect(units[0]).toBe(65);
    expect(info[0]).toBe(0);
    expect(consumed[0]).toBe(1);
    C.rtl_destroyTextToUnicodeContext(decoder, context);
    C.rtl_destroyTextToUnicodeConverter(decoder);
    const encoder = C.rtl_createUnicodeToTextConverter(encoding),
      reverse = C.rtl_createUnicodeToTextContext(encoder),
      out = new Uint8Array(32);
    C.rtl_convertUnicodeToText(
      encoder,
      reverse,
      Uint16Array.of(scalar),
      1,
      out,
      out.length,
      0,
      info,
      consumed,
    );
    C.rtl_resetUnicodeToTextContext(encoder, reverse);
    const written = C.rtl_convertUnicodeToText(
      encoder,
      reverse,
      Uint16Array.of(65),
      1,
      out,
      out.length,
      F.RTL_UNICODETOTEXT_FLAGS_FLUSH,
      info,
      consumed,
    );
    // RFC1557 requires the Korean G1 designation even for an ASCII-only fresh stream.
    expect([...out.subarray(0, written)]).toEqual(
      encoding === E.RTL_TEXTENCODING_ISO_2022_KR ? [27, 36, 41, 67, 65] : [65],
    );
    expect(info[0]).toBe(0);
    expect(consumed[0]).toBe(1);
    C.rtl_destroyUnicodeToTextContext(encoder, reverse);
    C.rtl_destroyUnicodeToTextConverter(encoder);
  },
);

it.each([7, 0x70, 0x700, 0x40000000])(
  "rejects unsupported native conversion flags %i",
  /** Checks independent validation masks before touching source or destination. @param flags - Invalid mask. @returns Nothing. */ (
    flags,
  ) => {
    const units = new Uint16Array([17]);
    expect(
      /** Exercises the rejected public call. @returns Original return value or diagnostic. */ () =>
        C.rtl_convertTextToUnicode(null, null, Uint8Array.of(65), 1, units, 1, flags, null, null),
    ).toThrow("Invalid native text-to-Unicode conversion flags.");
    expect([...units]).toEqual([17]);
  },
);

it("resets ISCII virama lookbehind in both streaming directions", /** Makes reset observable through ISCII joining controls rather than ASCII-only output. @returns Nothing. */ () => {
  const decoder = C.rtl_createTextToUnicodeConverter(E.RTL_TEXTENCODING_ISCII_DEVANAGARI),
    context = C.rtl_createTextToUnicodeContext(decoder),
    out = new Uint16Array(4),
    info: [number] = [0],
    consumed: [number] = [0];
  expect(
    C.rtl_convertTextToUnicode(decoder, context, Uint8Array.of(0xe8), 1, out, 4, 0, info, consumed),
  ).toBe(1);
  expect(out[0]).toBe(0x094d);
  C.rtl_resetTextToUnicodeContext(decoder, context);
  expect(
    C.rtl_convertTextToUnicode(decoder, context, Uint8Array.of(0xe8), 1, out, 4, 0, info, consumed),
  ).toBe(1);
  expect(out[0]).toBe(0x094d);
  C.rtl_destroyTextToUnicodeContext(decoder, context);
  const encoder = C.rtl_createUnicodeToTextConverter(E.RTL_TEXTENCODING_ISCII_DEVANAGARI),
    reverse = C.rtl_createUnicodeToTextContext(encoder),
    bytes = new Uint8Array(4);
  expect(
    C.rtl_convertUnicodeToText(
      encoder,
      reverse,
      Uint16Array.of(0x094d),
      1,
      bytes,
      4,
      0,
      info,
      consumed,
    ),
  ).toBe(1);
  expect(bytes[0]).toBe(0xe8);
  C.rtl_resetUnicodeToTextContext(encoder, reverse);
  expect(
    C.rtl_convertUnicodeToText(
      encoder,
      reverse,
      Uint16Array.of(0x200c),
      1,
      bytes,
      4,
      F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,
      info,
      consumed,
    ),
  ).toBe(0);
  expect(info[0] & F.RTL_UNICODETOTEXT_INFO_ERROR).not.toBe(0);
  C.rtl_destroyUnicodeToTextContext(encoder, reverse);
});

it("accepts reset of absent descriptor/context before a real UTF8 conversion", /** The source reset guard is a no-op for either absent resource; subsequent public decoding remains usable. @returns Nothing. */ () => {
  const converter = C.rtl_createTextToUnicodeConverter(E.RTL_TEXTENCODING_UTF8),
    context = C.rtl_createTextToUnicodeContext(converter),
    output = new Uint16Array(2),
    info: [number] = [0],
    consumed: [number] = [0];
  try {
    C.rtl_resetTextToUnicodeContext(null, null);
    C.rtl_resetTextToUnicodeContext(converter, null);
    expect(
      C.rtl_convertTextToUnicode(
        converter,
        context,
        Uint8Array.of(0xc3, 0xa9),
        2,
        output,
        2,
        F.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
        info,
        consumed,
      ),
    ).toBe(1);
    expect([output[0], info[0], consumed[0]]).toEqual([0xe9, 0, 2]);
  } finally {
    C.rtl_destroyTextToUnicodeContext(converter, context);
    C.rtl_destroyTextToUnicodeConverter(converter);
  }
});
