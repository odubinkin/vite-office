/** @fileoverview Source-contract checks for the SAL UTF-8 decoder. */
import { expect, it } from "vitest";
import { BadInputConversionAction, handleBadInputUnicodeToTextConversion } from "./converter";
import * as cvt from "../inc/rtl/textcvt.h";
import {
  ImplConvertUtf8ToUnicode,
  ImplConvertUnicodeToUtf8,
  ImplCreateUnicodeToUtf8Context,
  ImplResetUnicodeToUtf8Context,
  type ImplUnicodeToUtf8Context,
  ImplCreateUtf8ToUnicodeContext,
  ImplResetUtf8ToUnicodeContext,
} from "./tcvtutf8";

it("resets an incomplete UTF-8 sequence before accepting a fresh signed stream", /** Checks streaming reset through conversion of an actual unfinished source prefix and subsequent BOM. @returns Nothing. */ () => {
  const context = ImplCreateUtf8ToUnicodeContext();
  const output = new Uint16Array(4);
  const info: [number] = [0];
  const consumed: [number] = [0];
  expect(
    ImplConvertUtf8ToUnicode(
      null,
      context,
      Uint8Array.of(0xe2, 0x82),
      2,
      output,
      4,
      0,
      info,
      consumed,
    ),
  ).toBe(0);
  expect(info[0]).toBe(cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL);
  ImplResetUtf8ToUnicodeContext(context);
  const written = ImplConvertUtf8ToUnicode(
    null,
    context,
    Uint8Array.of(0xef, 0xbb, 0xbf, 0x41),
    4,
    output,
    4,
    cvt.RTL_TEXTTOUNICODE_FLAGS_GLOBAL_SIGNATURE,
    info,
    consumed,
  );
  expect([...output.subarray(0, written)]).toEqual([0x41]);
  expect(info[0]).toBe(0);
  expect(consumed[0]).toBe(4);
});

/** Converts one source chunk with the original destination and status outputs.
 * @param source - Encoded bytes.
 * @param flags - Native conversion flags.
 * @param capacity - Destination UTF-16 capacity.
 * @returns Converted units and native status outputs.
 */
function convert(source: readonly number[], flags = 0, capacity = source.length) {
  const destination = new Uint16Array(capacity);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const written = ImplConvertUtf8ToUnicode(
    null,
    null,
    Uint8Array.from(source),
    source.length,
    destination,
    capacity,
    flags,
    info,
    consumed,
  );
  return { units: [...destination.subarray(0, written)], info: info[0], consumed: consumed[0] };
}

it("preserves the pinned signature, malformed-sequence, and supplementary-character rules", /** Checks the decoder outputs. @returns Nothing. */ () => {
  expect(convert([0xef, 0xbb, 0xbf, 0x41]).units).toEqual([0xfeff, 0x41]);
  expect(
    convert([0xef, 0xbb, 0xbf, 0x41], cvt.RTL_TEXTTOUNICODE_FLAGS_GLOBAL_SIGNATURE).units,
  ).toEqual([0x41]);
  expect(convert([0xf0, 0x9f, 0x98, 0x80]).units).toEqual([0xd83d, 0xde00]);
  expect(convert([0xe0, 0x80, 0x80, 0x41]).units).toEqual([0xfffd, 0x41]);
  expect(convert([0xe2, 0x41]).units).toEqual([0xfffd, 0x41]);
  expect(convert([0xf8, 0x88, 0x80, 0x80, 0x80]).units).toEqual([0xfffd]);
});

it("retains the source's FLUSH, context, and destination accounting", /** Checks streaming outputs. @returns Nothing. */ () => {
  expect(convert([0xe2]).info).toBe(cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL);
  expect(convert([0xe2], cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH)).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 1,
  });
  expect(convert([0xf0, 0x9f, 0x98, 0x80], 0, 1)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 3,
  });
  const context = ImplCreateUtf8ToUnicodeContext();
  const firstDestination = new Uint16Array(2);
  const firstInfo: [number] = [0];
  const firstConsumed: [number] = [0];
  expect(
    ImplConvertUtf8ToUnicode(
      null,
      context,
      Uint8Array.of(0xe2, 0x82),
      2,
      firstDestination,
      2,
      0,
      firstInfo,
      firstConsumed,
    ),
  ).toBe(0);
  expect(firstInfo[0]).toBe(cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL);
  const lastDestination = new Uint16Array(2);
  expect(
    ImplConvertUtf8ToUnicode(
      null,
      context,
      Uint8Array.of(0xac),
      1,
      lastDestination,
      2,
      0,
      [0],
      [0],
    ),
  ).toBe(1);
  expect(lastDestination[0]).toBe(0x20ac);
});

it("applies the source invalid-input flags and Java UTF-8 variant", /** Checks malformed input actions. @returns Nothing. */ () => {
  expect(convert([0xe2, 0x41], cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE)).toEqual({
    units: [0x41],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 2,
  });
  expect(convert([0xe2, 0x41], cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 1,
  });
  const destination = new Uint16Array(2);
  expect(
    ImplConvertUtf8ToUnicode({}, null, Uint8Array.of(0xc0, 0x80), 2, destination, 2, 0, [0], [0]),
  ).toBe(1);
  expect(destination[0]).toBe(0);
});

it("retains native consumption at malformed-byte, flush and replacement-capacity boundaries", /** Checks obsolete five/six-byte leads, invalid standalone bytes and flushed partial sequences. @returns Nothing. */ () => {
  for (const source of [[0x80], [0xfe], [0xfc, 0x80, 0x80, 0x80, 0x80, 0x80]]) {
    expect(convert(source)).toEqual({
      units: [0xfffd],
      info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
      consumed: source.length,
    });
  }
  expect(
    convert(
      [0xe2, 0x41],
      cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
    ),
  ).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 0,
  });
  expect(convert([0xff], cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 1,
  });
  expect(
    convert([0xe2], cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH),
  ).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    consumed: 0,
  });
  expect(convert([0xff], 0, 0)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(convert([0xe2], cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH, 0)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    consumed: 1,
  });
  const output = new Uint16Array(1);
  const info: [number] = [0];
  expect(ImplConvertUtf8ToUnicode({}, null, Uint8Array.of(0), 1, output, 1, 0, info, [0])).toBe(1);
  expect(output[0]).toBe(0xfffd);
  expect(info[0]).toBe(cvt.RTL_TEXTTOUNICODE_INFO_INVALID);
});

/** Executes the source encoder with observable pointer/status/context outputs.
 * @param input - UTF-16 units.
 * @param flags - Source conversion flags.
 * @param capacity - Byte capacity.
 * @param context - Optional streaming context.
 * @param java - Whether to select Java UTF-8.
 * @returns Bytes, source consumption and status.
 */
function encode(
  input: number[],
  flags = 0,
  capacity = 32,
  context: ImplUnicodeToUtf8Context | null = null,
  java = false,
) {
  const output = new Uint8Array(capacity),
    info: [number] = [0],
    consumed: [number] = [0];
  const written = ImplConvertUnicodeToUtf8(
    java ? true : null,
    context,
    Uint16Array.from(input),
    input.length,
    output,
    capacity,
    flags,
    info,
    consumed,
  );
  return { bytes: [...output.subarray(0, written)], info: info[0], consumed: consumed[0] };
}
it("encodes native UTF-8 scalar boundaries", /** Checks explicit bytes across every encoding width. @returns Nothing. */ () => {
  expect(
    encode([0, 0x7f, 0x80, 0x7ff, 0x800, 0xd7ff, 0xe000, 0xffff, 0xd800, 0xdc00, 0xdbff, 0xdfff]),
  ).toEqual({
    bytes: [
      0, 0x7f, 0xc2, 0x80, 0xdf, 0xbf, 0xe0, 0xa0, 0x80, 0xed, 0x9f, 0xbf, 0xee, 0x80, 0x80, 0xef,
      0xbf, 0xbf, 0xf0, 0x90, 0x80, 0x80, 0xf4, 0x8f, 0xbf, 0xbf,
    ],
    info: 0,
    consumed: 12,
  });
});
it("retains native signature state across output exhaustion and reset", /** Checks that an unwritten signature remains pending and a written signature occurs once. @returns Nothing. */ () => {
  const context = ImplCreateUnicodeToUtf8Context(),
    flags = cvt.RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE;
  expect(encode([65], flags, 2, context)).toEqual({ bytes: [], info: 4, consumed: 0 });
  expect(context.nHighSurrogate).toBe(0xffff);
  expect(encode([65], flags, 3, context)).toEqual({
    bytes: [0xef, 0xbb, 0xbf],
    info: 4,
    consumed: 0,
  });
  expect(encode([65], flags, 1, context)).toEqual({ bytes: [65], info: 0, consumed: 1 });
  ImplResetUnicodeToUtf8Context(context);
  expect(encode([], flags, 3, context).bytes).toEqual([0xef, 0xbb, 0xbf]);
});
it("keeps the source FLUSH polarity and rewinds only the current low surrogate", /** Checks the pending UTF-16 state rather than host replacement behavior. @returns Nothing. */ () => {
  const context = ImplCreateUnicodeToUtf8Context(),
    flush = cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH;
  expect(encode([0xd83d], flush, 4, context)).toEqual({ bytes: [], info: 2, consumed: 1 });
  expect(encode([0xde00], flush, 3, context)).toEqual({ bytes: [], info: 4, consumed: 0 });
  expect(context.nHighSurrogate).toBe(0xd83d);
  expect(encode([0xde00], flush, 4, context)).toEqual({
    bytes: [0xf0, 0x9f, 0x98, 0x80],
    info: 0,
    consumed: 1,
  });
  expect(encode([0xd800], 0)).toEqual({ bytes: [63], info: 16, consumed: 1 });
  expect(encode([0xd800], 0, 0)).toEqual({ bytes: [], info: 20, consumed: 1 });
});
it.each([
  [cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT, [63], 16, 2],
  [cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_IGNORE, [], 16, 2],
  [cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_0, [0], 16, 2],
  [cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_UNDERLINE, [95], 16, 2],
  [cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR, [], 17, 2],
])(
  "preserves malformed-surrogate grouping with flags %s",
  /** Checks the following non-low unit is consumed by the original bad-input branch. @param flags - Policy. @param bytes - Output. @param info - Status. @param consumed - Pointer. @returns Nothing. */ (
    flags,
    bytes,
    info,
    consumed,
  ) => {
    expect(encode([0xd800, 65], flags as number)).toEqual({ bytes, info, consumed });
  },
);
it("encodes Java UTF-8 NUL and individual surrogate units", /** Checks the distinct Java variant bypasses scalar combining. @returns Nothing. */ () => {
  expect(
    encode([0, 0xd83d, 0xde00], cvt.RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE, 16, null, true),
  ).toEqual({ bytes: [0xc0, 0x80, 0xed, 0xa0, 0xbd, 0xed, 0xb8, 0x80], info: 0, consumed: 3 });
});

it("applies native Unicode replacement prefixes and undefined-character flag overrides", /** Checks shared converter cases consumed by UTF-8 and future native encoders. @returns Nothing. */ () => {
  const bytes = new Uint8Array(3),
    offset: [number] = [0],
    info: [number] = [0],
    written: [boolean] = [true];
  const call = (undefinedInput: boolean, scalar: number, flags: number, capacity: number) => {
    offset[0] = 0;
    info[0] = 0;
    written[0] = true;
    const action = handleBadInputUnicodeToTextConversion(
      undefinedInput,
      scalar,
      flags,
      bytes,
      offset,
      capacity,
      info,
      Uint8Array.of(27, 65),
      2,
      written,
    );
    return { action, bytes: [...bytes.subarray(0, offset[0])], info: info[0], written: written[0] };
  };
  expect(call(false, 0, 0, 2)).toEqual({
    action: BadInputConversionAction.NO_OUTPUT,
    bytes: [],
    info: 16,
    written: true,
  });
  expect(call(false, 0, cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_UNDERLINE, 3)).toEqual({
    action: BadInputConversionAction.CONTINUE,
    bytes: [27, 65, 95],
    info: 16,
    written: true,
  });
  expect(call(true, 0xe000, cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0, 3)).toEqual({
    action: BadInputConversionAction.CONTINUE,
    bytes: [27, 65, 0],
    info: 8,
    written: true,
  });
  expect(
    call(
      true,
      0xe000,
      cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_IGNORE | cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0,
      0,
    ),
  ).toEqual({ action: BadInputConversionAction.CONTINUE, bytes: [], info: 8, written: false });
  expect(
    call(
      true,
      0,
      cvt.RTL_UNICODETOTEXT_FLAGS_CONTROL_IGNORE | cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,
      0,
    ),
  ).toEqual({ action: BadInputConversionAction.CONTINUE, bytes: [], info: 8, written: false });
  expect(call(true, 65, cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR, 0)).toEqual({
    action: BadInputConversionAction.STOP,
    bytes: [],
    info: 9,
    written: true,
  });
});
