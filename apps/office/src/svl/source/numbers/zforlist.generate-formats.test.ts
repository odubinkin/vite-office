/** @fileoverview Connected builtin initialization needed by CSV standard-format recognition, including additional locale entries. */
import { expect, it } from "vitest";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumberFormatter, SvNFFormatData } from "./zforlist";
import { SvNumberformat } from "./zformat";
import { NfIndexTableOffset as N, SvNumFormatType as T } from "../../inc/zforlist";
import { ImpGetFormatIndex } from "./zforlist.index";
it.each([0x409, 0x407, 0x411, 0x412, 0x401, 0x429, 0x41e, 0x455])(
  "initializes every source builtin and the locale's additional entries for %i",
  /** Actual locale code provider, scanner and constructor generate real formats; no keys or parsed states are injected. @param language - Requested locale. @returns Nothing. */ (
    language,
  ) => {
    const formatter = new SvNumberFormatter(language);
    try {
      for (let index = 0; index < N.NF_INDEX_TABLE_ENTRIES; ++index) {
        const key = ImpGetFormatIndex(index, 0),
          entry = formatter.GetEntry(key);
        expect(entry, `builtin ${index} at ${key}`).not.toBeNull();
        expect(entry?.IsAdditionalBuiltin()).toBe(false);
      }
      expect(formatter.GetType(49)).toBe(T.DATE);
      expect(formatter.GetType(61)).toBe(T.TIME);
      expect(formatter.GetType(75)).toBe(T.DATETIME);
      expect(text((formatter.GetEntry(75) as SvNumberformat).GetComment())).toBe("ISO 8601");
      expect(text((formatter.GetEntry(76) as SvNumberformat).GetComment())).toBe("ISO 8601");
      for (let key = 20; key <= 25; ++key)
        expect(formatter.GetEntry(key)?.IsStandard()).toBe(false);
      const standard = formatter.GetEntry(0) as SvNumberformat;
      expect(standard.GetLastInsertKey()).toBeGreaterThan(100);
      for (let key = 101; key <= standard.GetLastInsertKey(); ++key) {
        const entry = formatter.GetEntry(key) as SvNumberformat;
        expect(entry).not.toBeNull();
        expect(entry.IsAdditionalBuiltin()).toBe(true);
        const copy = new SvNumberformat(entry);
        try {
          expect(copy.IsAdditionalBuiltin()).toBe(true);
        } finally {
          copy.dispose();
        }
      }
    } finally {
      formatter.dispose();
    }
  },
);
it("retains the source no-additional flag and restores an existing conversion mode", /** Generates a separate actual table through the original initializer owner contract. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    table = new SvNFFormatData(),
    current = formatter["m_aCurrentLanguage"],
    scanner = current.GetFormatScanner();
  try {
    scanner.SetConvertMode(0x409, 0x407, true, false);
    table.ImpGenerateFormats(current, formatter.GetNatNum(), 10000, true);
    expect(scanner.GetConvertMode()).toBe(true);
    expect(table.GetEntry(10000)?.GetLastInsertKey()).toBe(100);
    expect(table.GetEntry(10100)?.IsTextFormat()).toBe(true);
    expect(table.GetEntry(10101)).toBeNull();
    expect(table.GetEntry(10049)?.GetMaskedType()).toBe(T.DATE);
  } finally {
    table.dispose();
    formatter.dispose();
  }
});
