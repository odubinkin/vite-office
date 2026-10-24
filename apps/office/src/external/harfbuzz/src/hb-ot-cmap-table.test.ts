/** @fileoverview Source cmap preferences, sanitizer boundaries, collection formats and preserved malformed/edge semantics. */
import { expect, it } from "vitest";
import {
  collectCmapUnicodes,
  findBestCmapSubtable,
  findBestCmapSubtableDetails,
} from "./hb-ot-cmap-table";
import { readHeadIndexToLocFormat } from "./hb-ot-head-table";
import { readFaceGlyphCount } from "./hb-static";
import { readMaxpGlyphCount } from "./hb-ot-maxp-table";

/** Creates a detached big-endian table and its writer. @param size - Byte size. @param format - Format word. @returns Bytes and view. */
function bytes(size: number, format: number): [Uint8Array, DataView] {
  const result = new Uint8Array(size),
    data = new DataView(result.buffer);
  if (size >= 2) data.setUint16(0, format);
  return [result, data];
}
/** Wraps sorted or deliberately unsorted source encoding records without repairing them. @param records - Platform,encoding,subtable tuples. @returns Complete cmap. */
function cmap(records: readonly (readonly [number, number, Uint8Array])[]): Uint8Array {
  let offset = 4 + records.length * 8;
  const result = new Uint8Array(
      offset +
        records.reduce(
          /** Sums actual encoded byte lengths. @param sum - Accumulated bytes. @param record - Encoding tuple. @returns Total. */ (
            sum,
            record,
          ) => sum + record[2].length,
          0,
        ),
    ),
    data = new DataView(result.buffer);
  data.setUint16(2, records.length);
  records.forEach(
    /** Writes an encoding record and its unrepaired source bytes. @param record - Platform,encoding,subtable. @param i - Record position. @returns Nothing. */ (
      [platform, encoding, table],
      i,
    ) => {
      data.setUint16(4 + 8 * i, platform);
      data.setUint16(6 + 8 * i, encoding);
      data.setUint32(8 + 8 * i, offset);
      result.set(table, offset);
      offset += table.length;
    },
  );
  return result;
}
/** Creates a source format0 fixture. @param code - Encoded character. @returns Subtable. */
function format0(code: number): Uint8Array {
  const [result] = bytes(262, 0);
  result[6 + code] = 1;
  return result;
}
/** Collects sorted unicode numbers from a single selected table. @param table - Subtable. @param glyphs - Native glyph population. @returns Codepoints. */
function collect(table: Uint8Array, glyphs = 100): number[] {
  return [...collectCmapUnicodes(cmap([[3, 1, table]]), glyphs)].sort(
    /** Orders collected scalar values. @param a - First scalar. @param b - Second scalar. @returns Ordering. */ (
      a,
      b,
    ) => a - b,
  );
}

it("uses source encoding preference and binary-search duplicates without sorting or symbol/Mac recoding", /** Checks all source preferences and binary-search identity. @returns Nothing. */ () => {
  const priorities = [
    [3, 0],
    [3, 10],
    [0, 6],
    [0, 4],
    [3, 1],
    [0, 3],
    [0, 2],
    [0, 1],
    [0, 0],
    [1, 0],
    [1, 7],
  ] as const;
  for (let i = 0; i < priorities.length; ++i) {
    const records = priorities
      .slice(i)
      .map(
        /** Assigns distinct character evidence to each encoding candidate. @param pair - Platform and encoding. @param j - Candidate offset. @returns Encoding fixture. */ (
          [p, e],
          j,
        ) => [p, e, format0(20 + i + j)] as const,
      )
      .sort(
        /** Sorts this valid fixture by the original record key. @param a - First record. @param b - Second record. @returns Ordering. */ (
          a,
          b,
        ) => a[0] - b[0] || a[1] - b[1],
      );
    expect([...collectCmapUnicodes(cmap(records), 0)]).toEqual([20 + i]);
  }
  expect([
    ...collectCmapUnicodes(
      cmap([
        [3, 1, format0(5)],
        [3, 1, format0(6)],
        [3, 1, format0(7)],
      ]),
      0,
    ),
  ]).toEqual([6]);
  expect(
    findBestCmapSubtable(
      cmap([
        [4, 0, format0(5)],
        [3, 1, format0(6)],
      ]),
    ),
  ).toBeUndefined();
  expect(findBestCmapSubtable(cmap([[2, 0, format0(5)]]))).toBeUndefined();
});

it("rejects truncated headers/arrays, neuters invalid offsets and preserves selected unknown formats", /** Checks sanitizer rejection and independent offset neutering. @returns Nothing. */ () => {
  for (const size of [0, 1, 2, 3])
    expect(findBestCmapSubtable(new Uint8Array(size))).toBeUndefined();
  const valid = cmap([[3, 1, format0(3)]]),
    data = new DataView(valid.buffer);
  data.setUint16(0, 1);
  expect(findBestCmapSubtable(valid)).toBeUndefined();
  data.setUint16(0, 0);
  data.setUint16(2, 40);
  expect(findBestCmapSubtable(valid)).toBeUndefined();
  data.setUint16(2, 1);
  for (const offset of [0, valid.length + 1, valid.length, valid.length - 1]) {
    data.setUint32(8, offset);
    expect(findBestCmapSubtable(valid)).toBeUndefined();
  }
  for (const [format, size, countOffset] of [
    [0, 261, 0],
    [4, 13, 0],
    [4, 16, 6],
    [6, 9, 0],
    [6, 10, 8],
    [10, 19, 0],
    [10, 20, 16],
    [12, 15, 0],
    [12, 16, 12],
    [13, 16, 12],
    [14, 9, 0],
    [14, 10, 6],
  ] as const) {
    const [bad, view] = bytes(size, format);
    if (countOffset) {
      if (format === 4 || format === 6) view.setUint16(countOffset, 2);
      else view.setUint32(countOffset, 2);
    }
    expect(collect(bad)).toEqual([]);
  }
  const [unknown] = bytes(2, 2);
  expect(collect(unknown)).toEqual([]);
  const [variation] = bytes(21, 14);
  new DataView(variation.buffer).setUint32(6, 1);
  expect(collect(variation)).toEqual([]);
  expect([
    ...collectCmapUnicodes(
      cmap([
        [3, 0, new Uint8Array()],
        [3, 1, format0(9)],
      ]),
      0,
    ),
  ]).toEqual([9]);
});

it("collects trimmed formats, source uint32 wrapping and missing glyphs independently of maxp", /** Checks trimmed array glyph-zero and unsigned wrap semantics. @returns Nothing. */ () => {
  for (const format of [6, 10]) {
    const [table, data] = bytes(format === 6 ? 16 : 26, format);
    if (format === 6) {
      data.setUint16(6, 60);
      data.setUint16(8, 3);
    } else {
      data.setUint32(12, 60);
      data.setUint32(16, 3);
    }
    const base = format === 6 ? 10 : 20;
    data.setUint16(base, 2);
    data.setUint16(base + 4, 4);
    expect(collect(table, 0)).toEqual([60, 62]);
  }
  const [table, data] = bytes(26, 10);
  data.setUint32(12, 0xfffffffe);
  data.setUint32(16, 3);
  for (let i = 0; i < 3; ++i) data.setUint16(20 + 2 * i, 1);
  expect(collect(table)).toEqual([0, 0xfffffffe]);
});

/** Encodes format4 segments with optional raw glyph words; declared length deliberately differs from actual byte bounds. @param segments - Start,end,delta,offset tuples. @param glyphs - Actual remaining glyph words. @returns Subtable. */
function format4(
  segments: readonly (readonly [number, number, number, number])[],
  glyphs: readonly number[] = [],
): Uint8Array {
  const count = segments.length,
    [table, data] = bytes(16 + 8 * count + 2 * glyphs.length, 4);
  data.setUint16(2, 16);
  data.setUint16(6, 2 * count);
  segments.forEach(
    /** Writes original format4 parallel arrays. @param segment - Segment fields. @param i - Segment position. @returns Nothing. */ (
      [start, end, delta, offset],
      i,
    ) => {
      data.setUint16(14 + 2 * i, end);
      data.setUint16(16 + 2 * count + 2 * i, start);
      data.setUint16(16 + 4 * count + 2 * i, delta & 0xffff);
      data.setUint16(16 + 6 * count + 2 * i, offset);
    },
  );
  glyphs.forEach(
    /** Writes an actual glyph-array word. @param glyph - Raw glyph. @param i - Array position. @returns Nothing. */ (
      glyph,
      i,
    ) => data.setUint16(16 + 8 * count + 2 * i, glyph),
  );
  return table;
}

it("preserves format4 sentinel, range mutations, odd offsets and raw-glyph delta discrepancy WRITER081", /** Checks format4 source mutations and the documented delta discrepancy. @returns Nothing. */ () => {
  expect(collect(format4([]))).toEqual([]);
  expect(
    collect(
      format4([
        [65, 67, -66, 0],
        [0xffff, 0xffff, 0, 0],
      ]),
    ),
  ).toEqual([65, 67]);
  expect(collect(format4([[65, 66, 0, 3]], [1, 0]))).toEqual([65]);
  expect(collect(format4([[65, 66, 0, 2]]))).toEqual([]);
  expect(collect(format4([[65, 67, 0, 2]], [1]))).toEqual([65]);
  expect(collect(format4([[65, 65, -1, 2]], [1]))).toEqual([65]);
  expect(
    collect(
      format4([
        [65, 65, -65, 0],
        [65, 65, 0, 0],
      ]),
    ),
  ).toEqual([65]);
  expect(collect(format4([[67, 65, 0, 0]]))).toEqual([]);
  expect(collect(format4([[65, 65, 0, 0]]))).toEqual([65]);
  const odd = format4([[65, 65, 0, 0]], [0, 0]);
  new DataView(odd.buffer).setUint16(6, 3);
  expect(collect(odd)).toEqual([65]);
});

/** Encodes segmented format12/13 groups without sorting/repair. @param format - Source format. @param groups - Start,end,gid tuples. @returns Subtable. */
function groups(
  format: number,
  groups: readonly (readonly [number, number, number])[],
): Uint8Array {
  const [table, data] = bytes(16 + 12 * groups.length, format);
  data.setUint32(12, groups.length);
  groups.forEach(
    /** Writes one long segmented mapping. @param group - Start,end,glyph. @param i - Group position. @returns Nothing. */ (
      group,
      i,
    ) =>
      group.forEach(
        /** Writes a group uint32 field. @param value - Field value. @param j - Field offset. @returns Nothing. */ (
          value,
          j,
        ) => data.setUint32(16 + 12 * i + 4 * j, value),
      ),
  );
  return table;
}

it("retains long-group glyph bounds, malformed ranges, Unicode clamp and inclusive source limit WRITER082", /** Checks original long-group boundaries and unsigned arithmetic. @returns Nothing. */ () => {
  for (const format of [12, 13]) {
    expect(collect(groups(format, [[65, 67, 2]]), 4)).toEqual([65, 66, 67]);
    expect(collect(groups(format, [[65, 67, 4]]), 4)).toEqual([]);
    expect(collect(groups(format, [[0x10ffff, 0xffffffff, 1]]), 4)).toEqual([0x10ffff]);
    expect(collect(groups(format, [[0xffffffff, 0xffffffff, 0]]), 4)).toEqual(
      format === 12 ? [0, 1, 2, 3] : [],
    );
    expect(collect(groups(format, [[67, 65, 1]]), 4)).toEqual([67, 68, 69, 70]);
  }
  expect(collect(groups(12, [[65, 67, 1]]), -1)).toEqual([65, 66, 67]);
  expect(collect(groups(12, [[65, 67, 0]]), 4)).toEqual([66, 67]);
  expect(collect(groups(12, [[65, 65, 0]]), 4)).toEqual([]);
  expect(collect(groups(13, [[65, 67, 0]]), 4)).toEqual([]);
  expect(collect(groups(12, [[0x110000, 0xffffffff, 1]]), 4)).toEqual([]);
});

it("reads maxp source versions and rejects missing/truncated or unsupported tables", /** Checks both accepted maxp versions and invalid table bounds. @returns Nothing. */ () => {
  expect(readMaxpGlyphCount(undefined)).toBe(0);
  expect(readMaxpGlyphCount(new Uint8Array(5))).toBe(0);
  for (const [major, minor, size, expected] of [
    [0, 0x5000, 6, 9],
    [0, 0, 6, 0],
    [2, 0x5000, 32, 0],
    [1, 0, 31, 0],
    [1, 42, 32, 9],
  ] as const) {
    const [table, data] = bytes(size, major);
    data.setUint16(2, minor);
    data.setUint16(4, 9);
    expect(readMaxpGlyphCount(table)).toBe(expected);
  }
});

it("uses sanitized head and actual loca length alongside maxp, including the default beyond-64K path", /** Checks the original head sanitizer and beyond-64K population. @returns Nothing. */ () => {
  expect(readHeadIndexToLocFormat(undefined)).toBe(0);
  expect(readHeadIndexToLocFormat(new Uint8Array(53))).toBe(0);
  const [head, data] = bytes(54, 1);
  data.setUint32(12, 0x5f0f3cf5);
  data.setUint16(50, 1);
  expect(readHeadIndexToLocFormat(head)).toBe(1);
  expect(readFaceGlyphCount(undefined, head, new Uint8Array(19))).toBe(3);
  data.setUint16(50, 2);
  expect(readFaceGlyphCount(undefined, head, new Uint8Array(19))).toBe(0);
  data.setUint16(0, 0);
  expect(readHeadIndexToLocFormat(head)).toBe(0);
  data.setUint16(0, 1);
  data.setUint32(12, 0);
  expect(readHeadIndexToLocFormat(head)).toBe(0);
  expect(readFaceGlyphCount(undefined, undefined, undefined)).toBe(0);
  expect(readFaceGlyphCount(undefined, undefined, new Uint8Array(131076))).toBe(65537);
  const [maxp, view] = bytes(6, 0);
  view.setUint16(2, 0x5000);
  view.setUint16(4, 8);
  expect(readFaceGlyphCount(maxp, undefined, new Uint8Array(4))).toBe(8);
});

it("returns the original symbol-selection output independently of Unicode collection", /** Marks only a valid selected platform3/encoding0 subtable. @returns Nothing. */ () => {
  const symbol = findBestCmapSubtableDetails(
    cmap([
      [3, 0, format0(5)],
      [3, 1, format0(6)],
    ]),
  );
  expect(symbol?.symbol).toBe(true);
  expect(symbol?.subtable.getUint16(0)).toBe(0);
  expect(findBestCmapSubtableDetails(cmap([[3, 1, format0(6)]]))?.symbol).toBe(false);
  expect(findBestCmapSubtableDetails(new Uint8Array())).toBeUndefined();
});
