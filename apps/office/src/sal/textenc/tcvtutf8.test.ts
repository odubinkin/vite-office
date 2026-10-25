/** @fileoverview Source-contract checks for the SAL UTF-8 decoder. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplConvertUtf8ToUnicode, ImplCreateUtf8ToUnicodeContext } from "./tcvtutf8";

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
