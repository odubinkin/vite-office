/** @fileoverview Source currency toolbox list generation and formatter-key resolution from tbcontrl.cxx. */
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
import { LanguageTag } from "../../../i18nlangtag/inc/languagetag";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import {
  getConfiguredSystemLanguage,
  getSystemUILanguage,
  getRealLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { ApplyLreOrRleEmbedding, getLanguageName } from "../../../svtools/source/misc/langtab";
import { NUMBERFORMAT_ENTRY_NOT_FOUND, SvNumFormatType } from "../../../svl/inc/zforlist";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { NfCurrencyEntry } from "../../../svl/source/numbers/zforlist.currency-entry";

/** One actual currency entry and its source label or ISO-bank projection. */
export interface CurrencyListEntry {
  readonly label: string;
  readonly entry: NfCurrencyEntry;
  readonly bank: boolean;
}

/** Resolves the source language label. @param language - Language ID. @returns Display label. */
function languageName(language: number): string {
  return getLanguageName(language) ?? "";
}

/** Builds the source currency symbol group and ordered ISO code group, moving document currencies above unused entries.
 * @param currencies - Actual currency table entries resolved by the document adapter.
 * @param uiLanguage - Source application language.
 * @returns Currency selection rows.
 */
export function GetCurrencySymbols(
  currencies: ReadonlySet<NfCurrencyEntry>,
  uiLanguage = getSystemUILanguage(),
): CurrencyListEntry[] {
  const table = SvNumberFormatter.GetTheCurrencyTable();
  const [system, ...remaining] = table;
  if (!system) return [];
  const tag = new LanguageTag(uiLanguage);
  let collator: Intl.Collator;
  try {
    const locale = text(tag.getBcp47());
    collator = new Intl.Collator(locale || "en-US");
  } finally {
    tag.dispose();
  }
  const active: CurrencyListEntry[] = [];
  const other: CurrencyListEntry[] = [];
  const bank = new Map<string, CurrencyListEntry>();

  /** Builds the localized label from independent native directional fields. @param entry - Currency table entry. @param locales - Source display language labels. @returns Localized symbol row. */
  function symbol(entry: NfCurrencyEntry, ...locales: string[]): CurrencyListEntry {
    const label = [text(entry.GetBankSymbol()), text(entry.GetSymbol()), ...locales]
      .map(ApplyLreOrRleEmbedding)
      .join("  ");
    return { label, entry, bank: false };
  }
  for (const entry of remaining) {
    const row = symbol(entry, languageName(entry.GetLanguage()));
    (currencies.has(entry) ? active : other).push(row);
    const label = ApplyLreOrRleEmbedding(text(entry.GetBankSymbol()));
    if (!bank.has(label)) bank.set(label, { entry, label, bank: true });
  }
  /** Uses the application's active collation of the displayed strings. @param a - Currency row. @param b - Currency row. @returns Sort order. */
  function compare(a: CurrencyListEntry, b: CurrencyListEntry): number {
    return collator.compare(a.label, b.label);
  }
  return [
    symbol(system, languageName(uiLanguage), languageName(system.GetLanguage())),
    ...active,
    ...other.sort(compare),
    ...[...bank.values()].sort(compare),
  ];
}

/** Compiles the picked currency through the document's format table under the native system formatting locale.
 * @param formatter - Target document formatter.
 * @param choice - Selected local symbol or ISO row.
 * @returns Document key or native not-found sentinel.
 */
export function GetCurrencyFormatKey(
  formatter: SvNumberFormatter,
  choice: CurrencyListEntry,
): number {
  const temporary = new SvNumberFormatter(LANGUAGE_SYSTEM);
  const formats: OUString[] = [];
  const actual =
    choice.entry.GetLanguage() === LANGUAGE_SYSTEM
      ? new NfCurrencyEntry(choice.entry)
      : choice.entry;
  try {
    if (actual !== choice.entry) actual.SetLanguage(getConfiguredSystemLanguage());
    const index = temporary.GetCurrencyFormatStrings(formats, actual, choice.bank);
    const code = formats[index];
    if (!code) return NUMBERFORMAT_ENTRY_NOT_FOUND;
    const language = getRealLanguage(temporary.GetLanguage());
    const previous = formatter.GetEntryKey(code, language);
    if (previous !== NUMBERFORMAT_ENTRY_NOT_FOUND) return previous;
    const error: [number] = [0];
    const key: [number] = [NUMBERFORMAT_ENTRY_NOT_FOUND];
    formatter.PutEntry(code, error, [SvNumFormatType.ALL], key, language);
    return error[0] === 0 ? key[0] : NUMBERFORMAT_ENTRY_NOT_FOUND;
  } finally {
    for (const code of formats) code.dispose();
    if (actual !== choice.entry) actual.dispose();
    temporary.dispose();
  }
}
