/** @fileoverview Pinned MS-932 lead, trail, and EUDC conversion contracts. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplDBCSToUnicode } from "./tcvtmb";
import { aImplMS932DBCSCvtData } from "./tcvtjp6.ms932";

/** Converts one MS-932 source chunk and returns SAL output/status.
 * @param source - Encoded bytes.
 * @param flags - Native conversion flags.
 * @returns UTF-16 units and conversion status.
 */
function convert(source: readonly number[], flags = 0) {
  const destination = new Uint16Array(source.length);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const written = ImplDBCSToUnicode(
    aImplMS932DBCSCvtData,
    null,
    Uint8Array.from(source),
    source.length,
    destination,
    destination.length,
    flags,
    info,
    consumed,
  );
  return { units: [...destination.subarray(0, written)], info: info[0], consumed: consumed[0] };
}

it("maps MS-932 single bytes, vendor overrides, and EUDC through pinned tables", /** Checks actual table outputs. @returns Nothing. */ () => {
  expect(convert([0x5c, 0x81, 0x40, 0x81, 0x91, 0xf0, 0x40])).toEqual({
    units: [0x005c, 0x3000, 0xffe0, 0xe000],
    info: 0,
    consumed: 7,
  });
});

it("distinguishes undefined, invalid, and incomplete MS-932 sequences", /** Checks native status flags and FLUSH. @returns Nothing. */ () => {
  expect(convert([0x81, 0xad])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
    consumed: 2,
  });
  expect(convert([0x85, 0x20])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 2,
  });
  expect(convert([0x85])).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(convert([0x85], cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH)).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
    consumed: 1,
  });
});
