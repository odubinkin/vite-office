/** @fileoverview Currency chooser list ordering and native currency case preservation. */
import { expect, it } from "vitest";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ApplyLreOrRleEmbedding } from "../../../svtools/source/misc/langtab";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { LookupCurrencyEntry } from "../../../svl/source/numbers/zforlist.picture";
import { GetCurrencyFormatKey, GetCurrencySymbols } from "./tbcontrl.currency";

it("retains the system row, prioritizes document currencies and appends unique ISO codes", /** Retains the system row, prioritizes document currencies and appends unique ISO codes. @returns Nothing. */ () => {
  const found = LookupCurrencyEntry("€", "-424", 0x0424);
  if (!found) throw new Error("Missing source Slovenian locale currency");
  const entries = GetCurrencySymbols(new Set([found.entry]), 0x0409);
  expect(entries[0]?.entry.GetLanguage()).toBe(LANGUAGE_SYSTEM);
  expect(entries[1]?.entry).toBe(found.entry);
  const sign = entries.findIndex(
    /** Locates the source boundary to bank rows. @param row - Currency row. @returns ISO mode. */
    (row) => row.bank,
  );
  expect(sign).toBeGreaterThan(2);
  const bank = entries.slice(sign).map(
    /** Reads the label that represents a unique ISO bank code. @param row - Source row. @returns ISO label. */
    (row) => row.label,
  );
  expect(new Set(bank).size).toBe(bank.length);
  expect(bank).toContain(ApplyLreOrRleEmbedding("EUR"));
});

it("copies the native system currency row before resolving the explicit locale and reuses the compiled key", /** Copies the native system currency row before resolving the explicit locale and reuses the compiled key. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(LANGUAGE_SYSTEM);
  try {
    const [system] = GetCurrencySymbols(new Set());
    if (!system) throw new Error("Missing source system row");
    const key = GetCurrencyFormatKey(formatter, system);
    expect(key).toBe(GetCurrencyFormatKey(formatter, system));
    const entry = formatter.GetEntry(key);
    expect(entry && text(entry.GetFormatstring())).toMatch(/\[\$[^-]+-[0-9A-F]+\]/);
    expect(system.entry.GetLanguage()).toBe(LANGUAGE_SYSTEM);
  } finally {
    formatter.dispose();
  }
});
