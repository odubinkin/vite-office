/** @fileoverview Generic native DBCS table contracts not exercised by the fully mapped MS-932 single-byte table. */
import { expect, it } from "vitest";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplDBCSToUnicode, ImplEUCJPToUnicode } from "./tcvtmb";
import { aImplEUCJPCvtData } from "./tcvtjp6.eucjp";
import { aImplMS932DBCSCvtData } from "./tcvtjp6.ms932";
import type { ImplDBCSConvertData } from "./tenchelp";

/** Runs the actual native converter with a caller-supplied table aggregate. @param data - Native table pointers and ranges. @param bytes - Input bytes. @param flags - Conversion policy. @returns Units, status and consumed bytes. */
function decode(data: ImplDBCSConvertData, bytes: number[], flags = 0) {
  const destination = new Uint16Array(bytes.length);
  const info: [number] = [0],
    consumed: [number] = [0];
  const count = ImplDBCSToUnicode(
    data,
    null,
    Uint8Array.from(bytes),
    bytes.length,
    destination,
    destination.length,
    flags,
    info,
    consumed,
  );
  return { units: [...destination.subarray(0, count)], info: info[0], consumed: consumed[0] };
}

it("applies undefined single-byte policy while keeping the zero byte mapped", /** Checks the generic native aggregate contract using one deliberately unmapped single-byte slot. @returns Nothing. */ () => {
  const leads = [...aImplMS932DBCSCvtData.mpToUniLeadTab];
  leads[0x80] = { mnUniChar: 0, mnTrailStart: 0, mnTrailEnd: 0, mpToUniTrailTab: null };
  const data = { ...aImplMS932DBCSCvtData, mpToUniLeadTab: leads };
  expect(decode(data, [0, 0x80], cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE)).toEqual({
    units: [0, 0xf180],
    info: cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED,
    consumed: 2,
  });
  expect(decode(data, [0x80])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED,
    consumed: 1,
  });
  for (const flush of [0, cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH]) {
    expect(decode(data, [0x80], cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR | flush)).toEqual({
      units: [],
      info: cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
      consumed: flush ? 0 : 1,
    });
    expect(
      decode(data, [0x80, 0x41], cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_IGNORE | flush),
    ).toEqual({ units: [0x41], info: cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED, consumed: 2 });
  }
});

it("keeps EUC-JP undefined SS2 error and ignore byte counters in native source order", /** Checks the pinned converter's distinct FLUSH ordering rather than normalizing consumed counters. @returns Nothing. */ () => {
  for (const [flags, consumed, status] of [
    [
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR,
      2,
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    ],
    [
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
      0,
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_ERROR,
    ],
    [cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE, 3, cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED],
    [
      cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE | cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH,
      1,
      cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED | cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL,
    ],
  ] as const) {
    const destination = new Uint16Array([0x5555]);
    const info: [number] = [0],
      count: [number] = [0];
    expect(
      ImplEUCJPToUnicode(
        aImplEUCJPCvtData,
        null,
        Uint8Array.of(0x8e, 0xe0),
        2,
        destination,
        1,
        flags,
        info,
        count,
      ),
    ).toBe(0);
    expect([...destination]).toEqual([0x5555]);
    expect(count[0]).toBe(consumed);
    expect(info[0]).toBe(status);
  }
  expect(
    /** Rejects an absent source lead entry. @returns No conversion. */ () =>
      ImplEUCJPToUnicode(
        { ...aImplEUCJPCvtData, mpJIS0208ToUniLeadTab: [] },
        null,
        Uint8Array.of(0xa1, 0xa1),
        2,
        new Uint16Array(1),
        1,
        0,
        [0],
        [0],
      ),
  ).toThrow("EUC-JP lead table has fewer than 128 entries");
});

it("preserves the pinned third EUDC trail-range offset arithmetic", /** Protects source tcvtmb.cxx's second-range width assignment before its third-range branch. @returns Nothing. */ () => {
  const data: ImplDBCSConvertData = {
    ...aImplMS932DBCSCvtData,
    mnEUDCCount: 1,
    mpEUDCTab: [
      {
        mnLeadStart: 0xf0,
        mnLeadEnd: 0xf0,
        mnTrail1Start: 0x40,
        mnTrail1End: 0x41,
        mnTrail2Start: 0x50,
        mnTrail2End: 0x51,
        mnTrail3Start: 0x60,
        mnTrail3End: 0x61,
        mnTrailCount: 3,
        mnTrailRangeCount: 6,
        mnUniStart: 0xe000,
        mnUniEnd: 0xe005,
      },
    ],
  };
  // These literal offsets follow the pinned source, including its non-cumulative third-range offset.
  expect(decode(data, [0xf0, 0x40, 0xf0, 0x50, 0xf0, 0x60])).toEqual({
    units: [0xe000, 0xe002, 0xe002],
    info: 0,
    consumed: 6,
  });
  expect(decode(data, [0xf0, 0x61])).toEqual({ units: [0xe003], info: 0, consumed: 2 });
  expect(decode(data, [0xf0, 0x70])).toEqual({
    units: [0xfffd],
    info: cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED,
    consumed: 2,
  });
});

it("rejects incomplete native table aggregates before an out-of-bounds read", /** Checks explicit local admission guards for malformed pointer arrays. @returns Nothing. */ () => {
  expect(
    /** Supplies a missing lead table. @returns No conversion. */ () =>
      decode({ ...aImplMS932DBCSCvtData, mpToUniLeadTab: [] }, [0x41]),
  ).toThrow("DBCS lead table has fewer than 256 entries");
  expect(
    /** Supplies an absent EUDC range promised by the count. @returns No conversion. */ () =>
      decode({ ...aImplMS932DBCSCvtData, mpEUDCTab: [] }, [0xf0, 0x40]),
  ).toThrow("DBCS EUDC table is incomplete");
});

it("treats missing EUC-JP trail mappings as unmapped input", /** Checks both nullable table pointers and absent entries in a declared trail range. @returns Nothing. */ () => {
  for (const table of [null, []] as const) {
    const leads = [...aImplEUCJPCvtData.mpJIS0208ToUniLeadTab];
    leads[0x21] = { mnUniChar: 0, mnTrailStart: 0x21, mnTrailEnd: 0x21, mpToUniTrailTab: table };
    const output = new Uint16Array(1);
    const info: [number] = [0],
      consumed: [number] = [0];
    expect(
      ImplEUCJPToUnicode(
        { ...aImplEUCJPCvtData, mpJIS0208ToUniLeadTab: leads },
        null,
        Uint8Array.of(0xa1, 0xa1),
        2,
        output,
        1,
        0,
        info,
        consumed,
      ),
    ).toBe(1);
    expect([...output]).toEqual([0xfffd]);
    expect(info[0]).toBe(cvt.RTL_TEXTTOUNICODE_INFO_INVALID);
    expect(consumed[0]).toBe(2);
  }
});
