/** @fileoverview Public formatter recognition and standard-key selection used by CSV, over actual document-format owners. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  SvNumFormatType as T,
  NfIndexTableOffset as N,
  NUMBERFORMAT_ENTRY_NOT_FOUND as NONE,
} from "../../inc/zforlist";
import { SvNumberFormatter, SvNFEngine } from "./zforlist";
it.each([
  ["12.5", 12.5, T.NUMBER, 0],
  ["12.5%", 0.125, T.PERCENT, 11],
  ["TRUE", 1, T.LOGICAL, 99],
  ["2024-12-31", 45657, T.DATE, 49],
  ["25:00:00", 25 / 24, T.TIME, 64],
  ["2024-12-31T12:34:56", 45657 + 45296 / 86400, T.DATETIME, 75],
  ["2024-12-31 12:34:56.125", 45657 + 45296.125 / 86400, T.DATETIME, 74],
])(
  "recognizes %s and selects its actual source builtin",
  /** Native recognition assigns both value and an actual compiled format. @param input - Cell text. @param number - Expected serial value. @param type - Expected category. @param expectedKey - Source builtin key. @returns Nothing. */ (
    input,
    number,
    type,
    expectedKey,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      value = unicode(input as string),
      key: [number] = [0],
      output: [number] = [-999];
    try {
      expect(formatter.IsNumberFormat(value, key, output)).toBe(true);
      expect(output[0]).toBeCloseTo(number as number, 10);
      expect(key[0]).toBe(expectedKey);
      expect(formatter.GetEntry(key[0])).not.toBeNull();
      expect(formatter.GetType(key[0])).toBe(type);
    } finally {
      value.dispose();
      formatter.dispose();
    }
  },
);
it("keeps a preset Text format and leaves its numeric output untouched", /** Source refuses conversion before invoking the input scanner. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    value = unicode("12.5"),
    key: [number] = [formatter.GetStandardFormat(T.TEXT)],
    output: [number] = [987];
  try {
    expect(formatter.IsNumberFormat(value, key, output)).toBe(false);
    expect(key[0]).toBe(100);
    expect(output[0]).toBe(987);
  } finally {
    value.dispose();
    formatter.dispose();
  }
});
it("creates and reuses actual locale blocks, resolving UNKNOWN only to the initial language", /** English recognition is independent from the initial German formatter. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x407),
    value = unicode("12.5"),
    output: [number] = [0];
  try {
    const key: [number] = [formatter.GetStandardIndex(0x409)];
    expect(key[0]).toBe(10000);
    expect(
      text((formatter.GetEntry(key[0]) as import("./zformat").SvNumberformat).GetFormatstring()),
    ).toBe("General");
    expect(formatter.IsNumberFormat(value, key, output)).toBe(true);
    expect(output[0]).toBe(12.5);
    expect(key[0]).toBe(10000);
    expect(formatter.GetFormatIndex(N.NF_DATE_DIN_YYYYMMDD, 0x409)).toBe(10049);
    expect(formatter.GetStandardIndex()).toBe(0);
    expect(formatter.GetStandardFormat(T.TEXT, undefined)).toBe(100);
    expect(formatter.GetStandardIndex(0x409)).toBe(10000);
  } finally {
    value.dispose();
    formatter.dispose();
  }
});
it("generates and caches a real standard currency entry for recognized money", /** Source may reuse an existing additional code or insert a compiled new code; both yield an actual standard entry. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    value = unicode("$12.50"),
    key: [number] = [0],
    output: [number] = [0];
  try {
    expect(formatter.IsNumberFormat(value, key, output)).toBe(true);
    expect(output[0]).toBe(12.5);
    expect(formatter.GetType(key[0])).toBe(T.CURRENCY);
    expect(formatter.GetEntry(key[0])?.IsStandard()).toBe(true);
    expect(key[0]).toBe(formatter.GetStandardFormat(T.CURRENCY));
  } finally {
    value.dispose();
    formatter.dispose();
  }
});
it("preserves special time keys and readonly policy preconditions", /** Source RO policy does not manufacture a missing locale or currency default. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    current = formatter["m_aCurrentLanguage"],
    table = formatter["m_aFormatData"],
    cache = new Map<number, number>(),
    readonly = SvNFEngine.GetROPolicy(table, cache);
  try {
    expect(formatter.GetStandardFormat(65, T.TIME, 0x409)).toBe(65);
    expect(formatter.GetStandardFormat(2.5, 66, T.TIME, 0x409)).toBe(66);
    expect(formatter.GetStandardFormat(2.5, 0, T.TIME, 0x409)).toBe(64);
    expect(
      /** Original readonly missing-language assertion. @returns Locale block or guard. */ () =>
        readonly.mGetCLOffset(current, formatter.GetNatNum(), 0x407),
    ).toThrow(/already been encountered/);
    expect(
      /** Original readonly uncached-currency assertion. @returns Currency key or guard. */ () =>
        readonly.mGetDefaultCurrency(current, formatter.GetNatNum(), 0, 0x409),
    ).toThrow(/already been encountered/);
    expect(table.FindCachedDefaultFormat(20)).toBe(NONE);
    const currency = formatter.GetStandardFormat(T.CURRENCY);
    expect(readonly.mGetDefaultCurrency(current, formatter.GetNatNum(), 0, 0x409)).toBe(currency);
    readonly.mCacheFormat(30, 49);
    expect(cache.get(30)).toBe(49);
    expect(readonly.mFindFormat(30)).toBe(NONE); // Original lookup lambda captured the pre-write cache.
    expect(table.FindCachedDefaultFormat(30)).toBe(NONE);
  } finally {
    formatter.dispose();
  }
});
it.each([0x409, 0x407, 0x411, 0x412, 0x401, 0x429, 0x41e, 0x455])(
  "selects a real cached currency and deduplicates its generated list for locale %i",
  /** Native mixed/bank list branches include zero-decimal and non-ASCII locale entries. @param language - Locale ID. @returns Nothing. */ (
    language,
  ) => {
    const formatter = new SvNumberFormatter(language),
      current = formatter["m_aCurrentLanguage"],
      formats: import("../../../sal/inc/rtl/ustring").OUString[] = [];
    try {
      const entry = SvNumberFormatter.GetCurrencyEntry(language),
        first = current.GetCurrencyFormatStrings(formats, entry, false),
        count = formats.length;
      expect(count).toBe(entry.GetDigits() ? 5 : 2);
      expect(current.GetCurrencyFormatStrings(formats, entry, false)).toBe(first);
      expect(formats.length).toBe(count);
      current.GetCurrencyFormatStrings(formats, entry, true);
      const bankCount = formats.length;
      current.GetCurrencyFormatStrings(formats, entry, true);
      expect(formats.length).toBe(bankCount);
      const key = formatter.GetStandardFormat(T.CURRENCY, language);
      expect(formatter.GetEntry(key)).not.toBeNull();
      expect(formatter.GetType(key)).toBe(T.CURRENCY);
      expect(formatter.GetEntry(key)?.IsStandard()).toBe(true);
      expect(formatter.GetStandardFormat(T.CURRENCY, language)).toBe(key);
    } finally {
      for (const format of formats) format.dispose();
      formatter.dispose();
    }
  },
);
it("retains original empty, duplicate and newly inserted PutEntry outputs", /** Uses real compiled entries and the source last-insert owner field. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    current = formatter["m_aCurrentLanguage"],
    table = formatter["m_aFormatData"],
    key: [number] = [999],
    check: [number] = [77],
    type: [number] = [888],
    empty = unicode(""),
    duplicate = unicode("0"),
    code = unicode("0.0000000");
  try {
    expect(table.PutEntry(current, formatter.GetNatNum(), empty, check, type, key, 0x409)).toBe(
      false,
    );
    expect([check[0], type[0], key[0]]).toEqual([1, 888, 0]);
    expect(table.PutEntry(current, formatter.GetNatNum(), duplicate, check, type, key, 0x409)).toBe(
      false,
    );
    expect([check[0], type[0], key[0]]).toEqual([0, T.NUMBER, 1]);
    const standard = table.GetEntry(0) as import("./zformat").SvNumberformat,
      last = standard.GetLastInsertKey();
    expect(table.PutEntry(current, formatter.GetNatNum(), code, check, type, key, 0x409)).toBe(
      true,
    );
    expect([check[0], type[0], key[0]]).toEqual([0, T.NUMBER, last + 1]);
    expect(table.GetEntry(key[0])?.GetType()).toBe(T.DEFINED | T.NUMBER);
    expect(standard.GetLastInsertKey()).toBe(last + 1);
  } finally {
    empty.dispose();
    duplicate.dispose();
    code.dispose();
    formatter.dispose();
  }
});
