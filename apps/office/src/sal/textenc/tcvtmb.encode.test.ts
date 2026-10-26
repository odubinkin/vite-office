/** @fileoverview Original reverse DBCS/EUC-JP byte values, native EUDC ownership, buffer boundaries, private bytes and undefined/surrogate policy. */
import { assert, expect, it } from "vitest";
import native from "./tcvtmb.encode.native.json";
import { ImplUnicodeToDBCS, ImplUnicodeToEUCJP, ImplDBCSToUnicode } from "./tcvtmb";
import { aImplMS932DBCSCvtData } from "./tcvtjp6.ms932";
import { aImplEUCJPCvtData } from "./tcvtjp6.eucjp";
import { getTextToUnicodeData } from "./tables";
import type { ImplUniToDBCSHighTab, ImplDBCSConvertData } from "./tenchelp";
import { RTL_TEXTENCODING_MS_949, RTL_TEXTENCODING_EUC_KR } from "../inc/rtl/textenc";
import * as F from "../inc/rtl/textcvt.h";
/** Invokes the original converter with observable output/status/consumption. @param units - Source units. @param flags - Original flags. @param capacity - Native output capacity. @param data - Actual data. @returns Native result. */
function dbcs(
  units: readonly number[],
  flags = 0,
  capacity = units.length * 3,
  data: ImplDBCSConvertData = aImplMS932DBCSCvtData,
) {
  const output = new Uint8Array(Math.max(capacity, units.length * 3)),
    info: [number] = [0],
    consumed: [number] = [0];
  const written = ImplUnicodeToDBCS(
    data,
    null,
    Uint16Array.from(units),
    units.length,
    output,
    capacity,
    flags,
    info,
    consumed,
  );
  return { bytes: [...output.subarray(0, written)], written, info: info[0], consumed: consumed[0] };
}
/** Executes the actual two-plane EUC-JP source owner. @param units - Logical input. @param capacity - Native capacity. @param flags - Native policy. @returns Native result. */
function euc(units: readonly number[], capacity = units.length * 3, flags = 0) {
  const output = new Uint8Array(Math.max(capacity, units.length * 3)),
    info: [number] = [0],
    consumed: [number] = [0];
  const written = ImplUnicodeToEUCJP(
    aImplEUCJPCvtData,
    null,
    Uint16Array.from(units),
    units.length,
    output,
    capacity,
    flags,
    info,
    consumed,
  );
  return { bytes: [...output.subarray(0, written)], written, info: info[0], consumed: consumed[0] };
}
it("uses exact original MS932 reverse mappings, including canonical currency forms", /** These byte fixtures pin native data independently of forward lookup. @returns Nothing. */ () => {
  expect(dbcs([0, 0x41, 0x3000, 0xffe0, 0x6f22, 0xff76])).toEqual({
    bytes: [0, 65, 0x81, 0x40, 0x81, 0x91, 0x8a, 0xbf, 0xb6],
    written: 9,
    info: 0,
    consumed: 6,
  });
});
it("maps all original MS932 EUDC endpoints and trail discontinuities", /** Actual private range belongs to the native descriptor, not a generated inverse map. @returns Nothing. */ () => {
  expect(dbcs([0xe000, 0xe03e, 0xe03f, 0xe0bb, 0xe0bc, 0xe757]).bytes).toEqual([
    0xf0, 0x40, 0xf0, 0x7e, 0xf0, 0x80, 0xf0, 0xfc, 0xf1, 0x40, 0xf9, 0xfc,
  ]);
});
it.each([0, 1, 2, 3])(
  "does not partially emit a mapped double byte with capacity %s",
  /** Checks pointer order rather than accepting a truncated host encoder result. @param capacity - Native output size. @returns Nothing. */ (
    capacity,
  ) => {
    const value = dbcs([0x41, 0x3000], 0, capacity);
    expect(value).toEqual(
      capacity === 0
        ? { bytes: [], written: 0, info: 5, consumed: 0 }
        : capacity < 3
          ? { bytes: [65], written: 1, info: 5, consumed: 1 }
          : { bytes: [65, 0x81, 0x40], written: 3, info: 0, consumed: 2 },
    );
  },
);
it("retains original private-byte signed-char narrowing and zero-byte fallthrough", /** Original source flags preserve its low-zero FIXME and signed plain-char conversion profile. @returns Nothing. */ () => {
  const flags = F.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0;
  expect(dbcs([0xf100, 0xf17f, 0xf180, 0xf1ff], flags).bytes).toEqual(native.privateBytes);
  const zero = dbcs([0xf100], flags, 0);
  expect(zero.written).toBe(1);
  expect(zero.consumed).toBe(1);
  expect(zero.info).toBe(0);
});
it("keeps undefined replacement flags inert in the DBCS owner and honors the actual error selector", /** Native replacement flags have empty source branches; undefined handling stays on its real shared owner. @returns Nothing. */ () => {
  const replace =
    F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACE | F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACESTR;
  expect(dbcs([0x100, 65], replace)).toMatchObject({
    bytes: [63, 65],
    consumed: 2,
    info: F.RTL_UNICODETOTEXT_INFO_UNDEFINED,
  });
  expect(dbcs([0x100, 65], replace | F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR)).toMatchObject({
    bytes: [],
    consumed: 0,
    info: F.RTL_UNICODETOTEXT_INFO_ERROR | F.RTL_UNICODETOTEXT_INFO_UNDEFINED,
  });
  expect(dbcs([0x100, 65], F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE)).toMatchObject({
    bytes: [65],
    consumed: 2,
  });
});
it("preserves actual surrogate consumption and original no-context trailing input status", /** The original common helper decides malformed and incomplete input separately from mapping. @returns Nothing. */ () => {
  expect(dbcs([0xd800])).toMatchObject({
    bytes: [],
    consumed: 0,
    info: F.RTL_UNICODETOTEXT_INFO_ERROR | F.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL,
  });
  expect(dbcs([0xd800], F.RTL_UNICODETOTEXT_FLAGS_FLUSH)).toMatchObject({
    bytes: [],
    consumed: 0,
    info: F.RTL_UNICODETOTEXT_INFO_ERROR | F.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL,
  });
  expect(dbcs([0xd800, 65], F.RTL_UNICODETOTEXT_FLAGS_FLUSH)).toMatchObject({
    bytes: [63, 65],
    consumed: 2,
    info: F.RTL_UNICODETOTEXT_INFO_INVALID,
  });
});
it("produces original EUC-JP ASCII, halfwidth, JIS0208 and JIS0212 bytes", /** Source plane priority has independent fixed examples. @returns Nothing. */ () => {
  expect(euc([65, 0xff76, 0x6f22, 0x2d8])).toEqual({
    bytes: [65, 0x8e, 0xb6, 0xb4, 0xc1, 0x8f, 0xa2, 0xaf],
    written: 8,
    consumed: 4,
    info: 0,
  });
});
it.each([0, 1, 2, 3])(
  "retains the whole EUC-JP SS3 unit with capacity %s",
  /** Source three-byte output must be atomic. @param capacity - Native byte capacity. @returns Nothing. */ (
    capacity,
  ) => {
    expect(euc([0x2d8], capacity)).toEqual(
      capacity < 3
        ? { bytes: [], written: 0, consumed: 0, info: 5 }
        : { bytes: [0x8f, 0xa2, 0xaf], written: 3, consumed: 1, info: 0 },
    );
  },
);
it("enforces the actual EUC-KR subset independently of the MS949 aggregate", /** Native range filtering excludes UHC-only pairs despite shared reverse tables. @returns Nothing. */ () => {
  const full = getTextToUnicodeData(RTL_TEXTENCODING_MS_949),
    subset = getTextToUnicodeData(RTL_TEXTENCODING_EUC_KR);
  assert(full?.kind === "dbcs");
  assert(subset?.kind === "dbcs");
  expect(dbcs([0xac02], 0, 3, full.data).bytes).toEqual([0x81, 0x41]);
  expect(dbcs([0xac02], 0, 3, subset.data).bytes).toEqual([63]);
});
it("retains compiled original forward/reverse convergence and its exact native exceptions", /** Exhausts real forward entries across original descriptors, preserving the independent decoder as the oracle. @returns Nothing. */ () => {
  const divergences: Record<string, number> = {};
  let checked = 0;
  for (let encoding = 0; encoding < 100; ++encoding) {
    const descriptor = getTextToUnicodeData(encoding);
    if (descriptor?.kind !== "dbcs") continue;
    for (let lead = 0; lead < 256; ++lead) {
      const entry = descriptor.data.mpToUniLeadTab[lead];
      assert(entry);
      const payloads: number[][] = [];
      if (
        entry.mpToUniTrailTab === null ||
        lead < descriptor.data.mnLeadStart ||
        lead > descriptor.data.mnLeadEnd
      )
        payloads.push([lead]);
      else
        for (let trail = entry.mnTrailStart; trail <= entry.mnTrailEnd; ++trail)
          payloads.push([lead, trail]);
      for (const payload of payloads) {
        const text = new Uint16Array(2),
          status: [number] = [0],
          consumed: [number] = [0];
        const count = ImplDBCSToUnicode(
          descriptor.data,
          null,
          Uint8Array.from(payload),
          payload.length,
          text,
          2,
          F.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR |
            F.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR |
            F.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,
          status,
          consumed,
        );
        if (status[0] || count !== 1) continue;
        const output = dbcs(
          [text[0] as number],
          F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,
          3,
          descriptor.data,
        );
        const restored = new Uint16Array(2),
          info: [number] = [0];
        const length = ImplDBCSToUnicode(
          descriptor.data,
          null,
          Uint8Array.from(output.bytes),
          output.bytes.length,
          restored,
          2,
          0,
          info,
          [0],
        );
        if (output.info || info[0] || length !== 1 || restored[0] !== text[0]) {
          const key = `${encoding}:${output.info ? "unmappable" : "alias"}`;
          divergences[key] = (divergences[key] ?? 0) + 1;
        }
        ++checked;
      }
    }
  }
  expect(checked).toBe(native.roundTrip.checked);
  expect(divergences).toEqual(native.roundTrip.divergences);
});

/** Classifies the original table's missing physical storage without inventing values for C++ undefined behavior. This is a test-only boundary audit, not an encoder fallback. @param entry - Original reverse pointer/range. @param low - Native low unit. @returns Whether original pointer arithmetic exceeds its source array. */
function undefinedEntry(entry: ImplUniToDBCSHighTab, low: number): boolean {
  return (
    low >= entry.mnLowStart &&
    low <= entry.mnLowEnd &&
    low - entry.mnLowStart >= (entry.mpToUniTrailTab?.length ?? 0)
  );
}
/** Audits the actual two-plane source lookup path before native execution. @param unit - Native input. @returns Whether the selected original lookup has undefined storage. */
function undefinedEUCJP(unit: number): boolean {
  if (unit <= 127 || (unit >= 0xff61 && unit <= 0xff9f)) return false;
  const first = aImplEUCJPCvtData.mpUniToJIS0208HighTab[unit >>> 8],
    second = aImplEUCJPCvtData.mpUniToJIS0212HighTab[unit >>> 8],
    low = unit & 255;
  assert(first);
  assert(second);
  if (undefinedEntry(first, low)) return true;
  const mapped =
    low >= first.mnLowStart && low <= first.mnLowEnd
      ? first.mpToUniTrailTab?.[low - first.mnLowStart]
      : 0;
  return !mapped && undefinedEntry(second, low);
}
/** Native fixture checksum over every output/status/consumption tuple; this is independent of the TypeScript mapping implementation. @param hash - Accumulated original unsigned32 hash. @param value - Original integer. @returns FNV-1a over its four little-endian bytes. */
function mix(hash: number, value: number): number {
  for (let shift = 0; shift < 32; shift += 8)
    hash = Math.imul(hash ^ ((value >>> shift) & 255), 16777619) >>> 0;
  return hash;
}
it.each(native.digests)(
  "matches compiled original reverse conversion for encoding $encoding on all BMP units",
  /** Verifies actual native tables and converter decisions against compiled original source, including unmapped/invalid units. @param fixture - Original compiled digest. @returns Nothing. */ (
    fixture,
  ) => {
    const data = getTextToUnicodeData(fixture.encoding);
    assert(data?.kind === "dbcs");
    let hash = 2166136261;
    const undefinedUnits: number[] = [],
      nativeUndefined = new Set(fixture.undefinedUnits);
    for (let unit = 0; unit < 65536; ++unit) {
      const entry = data.data.mpToDBCSHighTab[unit >>> 8];
      assert(entry);
      if (undefinedEntry(entry, unit & 255)) undefinedUnits.push(unit);
      if (nativeUndefined.has(unit)) continue;
      const value = dbcs([unit], F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR, 4, data.data);
      for (const field of [unit, value.written, value.info, value.consumed, ...value.bytes])
        hash = mix(hash, field);
    }
    expect(undefinedUnits).toEqual(fixture.undefinedUnits);
    expect(hash).toBe(fixture.hash);
  },
);
it("matches compiled original EUC-JP reverse conversion on all BMP units", /** Covers ASCII, SS2, both JIS planes and undefined/surrogate statuses without a host encoder. @returns Nothing. */ () => {
  let hash = 2166136261;
  const undefinedUnits: number[] = [],
    nativeUndefined = new Set(native.eucjpUndefinedUnits);
  for (let unit = 0; unit < 65536; ++unit) {
    if (undefinedEUCJP(unit)) undefinedUnits.push(unit);
    if (nativeUndefined.has(unit)) continue;
    const value = euc([unit], 4, F.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR);
    for (const field of [unit, value.written, value.info, value.consumed, ...value.bytes])
      hash = mix(hash, field);
  }
  expect(undefinedUnits).toEqual(native.eucjpUndefinedUnits);
  expect(hash).toBe(native.eucjpHash);
});
