/** @fileoverview Pinned MS-932 lead, trail, and EUDC conversion contracts. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplDBCSToUnicode, ImplEUCJPToUnicode } from "./tcvtmb";
import { aImplEUCJPCvtData } from "./tcvtjp6.eucjp";
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

/** Converts one EUC-JP source chunk and returns SAL output/status.
 * @param source - Encoded bytes.
 * @param flags - Native conversion flags.
 * @returns UTF-16 units and conversion status.
 */
function convertEUCJP(source: readonly number[], flags = 0) {
  const destination = new Uint16Array(source.length);
  const info: [number] = [0];
  const consumed: [number] = [0];
  const written = ImplEUCJPToUnicode(
    aImplEUCJPCvtData,
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

it("decodes pinned EUC-JP ASCII, SS2, JIS-0208 and SS3/JIS-0212", /** Checks each native EUC-JP source family. @returns Nothing. */ () => {
  expect(convertEUCJP([0x41, 0x8e, 0xa1, 0xa1, 0xa1, 0x8f, 0xa2, 0xaf])).toEqual({
    units: [0x0041, 0xff61, 0x3000, 0x02d8],
    info: 0,
    consumed: 8,
  });
});

it("keeps the pinned EUC-JP incomplete, invalid and SS2 undefined status ordering", /** Checks native status and byte consumption. @returns Nothing. */ () => {
  expect(convertEUCJP([0xa1, 0x80])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 2,
  });
  expect(convertEUCJP([0x8e], cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH)).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(convertEUCJP([0xa1, 0x20])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 2,
  });
  expect(convertEUCJP([0xa2, 0xaf])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
    consumed: 2,
  });
  expect(convertEUCJP([0x8e, 0xe0], cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH)).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 1,
  });
});

it("preserves DBCS error and ignore consumption with and without FLUSH", /** Checks native status policy before destination writes. @returns Nothing. */ () => {
  for (const [source, status, errorFlag, ignoreFlag] of [
    [
      [0x85, 0x20],
      cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
      cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,
      cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE,
    ],
    [
      [0x81, 0xad],
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR,
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE,
    ],
  ] as const) {
    for (const flush of [0, cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH]) {
      expect(convert(source, errorFlag | flush)).toEqual({
        units: [],
        info: status | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
        consumed: flush ? 0 : 2,
      });
      expect(convert(source, ignoreFlag | flush)).toEqual({ units: [], info: status, consumed: 2 });
    }
  }
  expect(convert([0xf0, 0x80])).toEqual({ units: [0xe03f], info: 0, consumed: 2 });
});

it("stops before writing past either multibyte destination buffer", /** Checks the actual lead/trail cursor positions retained when the caller retries with more output space. @returns Nothing. */ () => {
  for (const [convertFunction, data, input] of [
    [ImplDBCSToUnicode, aImplMS932DBCSCvtData, [0x81, 0x40]],
    [ImplEUCJPToUnicode, aImplEUCJPCvtData, [0xa1, 0xa1]],
  ] as const) {
    const destination = new Uint16Array([0x5555]);
    const info: [number] = [0],
      consumed: [number] = [0];
    // Both source aggregates use the same SAL buffer ABI; bind each concrete data owner explicitly.
    const written =
      convertFunction === ImplDBCSToUnicode
        ? ImplDBCSToUnicode(
            aImplMS932DBCSCvtData,
            null,
            Uint8Array.from(input),
            2,
            destination,
            0,
            0,
            info,
            consumed,
          )
        : ImplEUCJPToUnicode(
            aImplEUCJPCvtData,
            null,
            Uint8Array.from(input),
            2,
            destination,
            0,
            0,
            info,
            consumed,
          );
    void data;
    expect(written).toBe(0);
    expect([...destination]).toEqual([0x5555]);
    expect(info[0]).toBe(
      cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL,
    );
    expect(consumed[0]).toBe(1);
  }
});

it("retains EUC-JP error and ignore policy on invalid sequences", /** Checks both invalid SS2 and invalid JIS-0208 input against the source byte-count ordering. @returns Nothing. */ () => {
  for (const source of [
    [0x8e, 0x20],
    [0xa1, 0x20],
  ]) {
    for (const flush of [0, cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH]) {
      expect(convertEUCJP(source, cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR | flush)).toEqual({
        units: [],
        info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
        consumed: flush ? 0 : 2,
      });
      expect(convertEUCJP(source, cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE | flush)).toEqual({
        units: [],
        info: cvt.RTL_TEXTTOUNICODE_INFO_INVALID,
        consumed: 2,
      });
    }
  }
  expect(convertEUCJP([0x8f])).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(convertEUCJP([0x8f, 0xa1])).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 0,
  });
  expect(convertEUCJP([0xa1])).toEqual({
    units: [],
    info: cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    consumed: 0,
  });
});
