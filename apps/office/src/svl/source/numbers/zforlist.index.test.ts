/** @fileoverview Source index/default/cache contracts over actual formatter and compiled-entry owners. */
import { expect, it } from "vitest";
import { SvNFFormatData, SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";
import {
  NfIndexTableOffset as N,
  NUMBERFORMAT_ENTRY_NOT_FOUND as NONE,
  SvNumFormatType as T,
} from "../../inc/zforlist";
import {
  ImpGetFormatIndex,
  GetIndexTableOffset,
  ImpGetDefaultFormat,
  ImpGetSearchOffset,
  CacheFormatRW,
  FindFormatRW,
  CacheFormatRO,
  FindFormatRO,
  ZF_STANDARD_LOGICAL,
  ZF_STANDARD_TEXT,
} from "./zforlist.index";
it("maps source enum ordinals to distinct runtime keys and preserves inverse and out-of-table results", /** Checks source table values rather than using enum ordinals as keys. @returns Nothing. */ () => {
  expect([N.NF_BOOLEAN, N.NF_TEXT]).toEqual([48, 49]);
  expect([ZF_STANDARD_LOGICAL, ZF_STANDARD_TEXT]).toEqual([99, 100]);
  expect(ImpGetFormatIndex(N.NF_BOOLEAN, 10000)).toBe(10099);
  expect(ImpGetFormatIndex(N.NF_TEXT, 10000)).toBe(10100);
  expect(ImpGetFormatIndex(N.NF_DATE_DIN_YYYYMMDD, 20000)).toBe(20049);
  expect(GetIndexTableOffset(10049)).toBe(N.NF_DATE_DIN_YYYYMMDD);
  expect(GetIndexTableOffset(10100)).toBe(N.NF_TEXT);
  expect(SvNumberFormatter.GetIndexTableOffset(10100)).toBe(N.NF_TEXT);
  expect(GetIndexTableOffset(10099)).toBe(N.NF_BOOLEAN);
  expect(GetIndexTableOffset(10101)).toBe(N.NF_INDEX_TABLE_ENTRIES);
  expect(ImpGetFormatIndex(N.NF_INDEX_TABLE_ENTRIES, 0)).toBe(NONE);
});
it("searches from an exact locale-block entry and then uses source category fallbacks", /** Uses real copied compiled entries with native SetType/SetStandard metadata mutations. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x0409),
    table = new SvNFFormatData();
  try {
    const original = formatter.GetEntry(0) as SvNumberformat,
      late = new SvNumberformat(original),
      first = new SvNumberformat(original),
      nextBlock = new SvNumberformat(original);
    late.SetType(T.DATE);
    late.SetStandard();
    table.InsertStandardFormat(37, late);
    expect(ImpGetDefaultFormat(table, T.DATE, 0)).toBe(30); // Source find(0) misses, even though37 exists.
    first.SetType(T.NUMBER);
    first.SetStandard();
    table.InsertStandardFormat(0, first);
    expect(ImpGetDefaultFormat(table, T.DATE, 0)).toBe(37);
    nextBlock.SetType(T.DATE);
    nextBlock.SetStandard();
    table.InsertStandardFormat(10000, nextBlock);
    expect(ImpGetDefaultFormat(table, T.DATE, 10000)).toBe(10000);
    for (const [type, key] of [
      [T.TIME, 61],
      [T.DATETIME, 70],
      [T.DURATION, 64],
      [T.PERCENT, 11],
      [T.SCIENTIFIC, 80],
      [T.FRACTION, 0],
      [T.CURRENCY, 0],
    ] as const)
      expect(ImpGetDefaultFormat(table, type, 0)).toBe(key);
    expect(ImpGetSearchOffset(T.TIME, 10000)).toBe(10060);
    expect(ImpGetSearchOffset(T.DURATION, 10000)).toBe(10064);
    expect(ImpGetSearchOffset(T.PERCENT, 10000)).toBe(10010);
  } finally {
    table.dispose();
    formatter.dispose();
  }
});
it("keeps cached zero distinct from a miss and prefers the actual owner cache in read-only queries", /** Checks the original owner and separate readonly-policy map responsibilities. @returns Nothing. */ () => {
  const table = new SvNFFormatData(),
    temporary = new Map<number, number>();
  try {
    expect(FindFormatRW(table, 30)).toBe(NONE);
    CacheFormatRO(temporary, 30, 37);
    expect(FindFormatRO(table, temporary, 30)).toBe(37);
    expect(FindFormatRW(table, 30)).toBe(NONE);
    CacheFormatRW(table, 30, 0);
    expect(table.FindCachedDefaultFormat(30)).toBe(0);
    expect(FindFormatRO(table, temporary, 30)).toBe(0);
    expect(temporary.get(30)).toBe(37);
  } finally {
    table.dispose();
  }
});
