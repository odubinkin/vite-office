/** @fileoverview Original SvNumberFormatter owner and process currency state split from zforlist.cxx under authored source-size limits; the canonical zforlist module reexports this same class identity. */

import {
  LANGUAGE_DONTKNOW,
  LANGUAGE_ENGLISH_US,
  LANGUAGE_SYSTEM,
} from "../../../i18nlangtag/inc/lang";
import {
  convertLanguageToLocale,
  convertLocaleToLanguage,
  getConfiguredSystemLanguage,
  getRealLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";

import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Color } from "../../../tools/inc/color";
import type { DateConstReference } from "../../../tools/source/datetime/tdate";

import * as Policy from "./zforlist.policy";

import type { LocaleCurrency } from "../../../unotools/source/i18n/localedatawrapper";

import { GetIndexTableOffset } from "./zforlist.index";

import {
  createNumberFormatCodeMapper,
  LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";

import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { OnDemandNativeNumberWrapper } from "../../inc/ondemand";
import { SvNumFormatType, NUMBERFORMAT_ENTRY_NOT_FOUND } from "../../inc/zforlist";

import { type SvNumberformatConstReference } from "./zformat";

import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";

import { GetFormatterOutputString } from "./zforlist.output";
import { NfCurrencyEntry } from "./zforlist.currency-entry";
import { SvNFLanguageData, SvNFFormatData, SvNFEngine } from "./zforlist";
/** Original process-wide source currency tables: ordinary entries start with SYSTEM, legacy-only entries are separate. */
let currencyTable: NfCurrencyEntry[] | null = null;
let legacyOnlyCurrencyTable: NfCurrencyEntry[] = [];
let systemCurrencyPosition = 0;
const theInstalledLocales = new Set<number>();

/** Original formatter owns the actual generated format table, locale/scanner/services and process currency operations. Component lookup is bound to real providers; whole UNO ABI, global registry and mutex scheduling are not claimed. */
export class SvNumberFormatter {
  /** Original installed-locale set is initialized by currency table creation. @param language - Native uint16 ID. @returns Whether locale data is installed. */
  static IsLocaleInstalled(language: number): boolean {
    this.GetTheCurrencyTable();
    return theInstalledLocales.has(language & 65535);
  }
  /** Original reset invalidates both currency tables and the selected system entry. @returns Nothing. */
  static resetTheCurrencyTable(): void {
    for (const entry of currencyTable ?? []) entry.dispose();
    for (const entry of legacyOnlyCurrencyTable) entry.dispose();
    currencyTable = null;
    legacyOnlyCurrencyTable = [];
    systemCurrencyPosition = 0;
  }
  /** Source insertion order, default-first selection, legacy split and symbol/bank/language deduplication. The current Setup.xcs ooSetupCurrency default is empty. @returns Nothing. */
  private static ImpInitCurrencyTable(): void {
    if (currencyTable) return;
    const entries: NfCurrencyEntry[] = [];
    const legacy: NfCurrencyEntry[] = [];
    let matching = 0;
    const systemLanguage = getConfiguredSystemLanguage();
    const systemLocale = convertLanguageToLocale(systemLanguage, false);
    try {
      const wrapper = new LocaleDataWrapper(systemLocale);
      try {
        entries.push(new NfCurrencyEntry(wrapper, LANGUAGE_SYSTEM));
      } finally {
        wrapper.dispose();
      }
    } finally {
      systemLocale.dispose();
    }
    const installed = LocaleDataWrapper.getInstalledLocaleNames();
    try {
      for (const locale of installed) {
        const language = convertLocaleToLanguage(locale),
          wrapper = new LocaleDataWrapper(locale);
        theInstalledLocales.add(language);
        try {
          const currencies = wrapper.getAllCurrencies(),
            defaultIndex = currencies.findIndex(
              /** Computes the currency result. @param currency - Currency. @returns The computed result. */ (
                currency,
              ) => currency.default,
            ),
            defaultEntry =
              defaultIndex >= 0
                ? new NfCurrencyEntry(currencies[defaultIndex] as LocaleCurrency, wrapper, language)
                : new NfCurrencyEntry(wrapper, language);
          if (!matching && defaultEntry.GetLanguage() === systemLanguage) matching = entries.length;
          entries.push(defaultEntry);
          if (currencies.length > 1) {
            for (let index = 0; index < currencies.length; index++) {
              const currency = currencies[index] as LocaleCurrency;
              if (currency.legacyOnly) {
                legacy.push(new NfCurrencyEntry(currency, wrapper, language));
              } else if (index !== defaultIndex) {
                const entry = new NfCurrencyEntry(currency, wrapper, language);
                if (
                  entries
                    .slice(1)
                    .some(
                      /** Computes the previous result. @param previous - Previous. @returns The computed result. */ (
                        previous,
                      ) => previous.equals(entry),
                    )
                ) {
                  entry.dispose();
                  continue;
                }
                // Every row shares this locale's language; its default entry handled the system match above.
                // The represented empty ooSetupCurrency setting has no secondary currency override.
                entries.push(entry);
              }
            }
          }
        } finally {
          wrapper.dispose();
        }
      }
      legacyOnlyCurrencyTable = legacy;
      systemCurrencyPosition = matching;
      currencyTable = entries;
    } catch (error) {
      for (const entry of entries) entry.dispose();
      for (const entry of legacy) entry.dispose();
      throw error;
    } finally {
      for (const locale of installed) locale.dispose();
    }
  }
  /** Original lazy main currency table getter. @returns Table in native order. */
  static GetTheCurrencyTable(): readonly NfCurrencyEntry[] {
    if (!currencyTable) this.ImpInitCurrencyTable();
    return currencyTable as NfCurrencyEntry[];
  }
  /** Original system entry lookup is null when no installed locale matches. @returns Selected system entry or null. */
  static MatchSystemCurrency(): NfCurrencyEntry | null {
    const table = this.GetTheCurrencyTable();
    return systemCurrencyPosition ? (table[systemCurrencyPosition] as NfCurrencyEntry) : null;
  }
  /** Original language or bank-abbreviation currency lookup over the same ordered table. @param languageOrAbbrev - Native language or bank abbreviation. @param language - Language for bank lookup. @returns Currency entry. */
  static GetCurrencyEntry(language: number): NfCurrencyEntry;
  /** Implements Get Currency Entry. @param abbrev - Abbrev. @param language - Language. @returns The NfCurrencyEntry | null result. */ static GetCurrencyEntry(
    abbrev: string,
    language: number,
  ): NfCurrencyEntry | null;
  /** Implements Get Currency Entry. @param languageOrAbbrev - Language Or Abbrev. @param language - Language. @returns The NfCurrencyEntry | null result. */ static GetCurrencyEntry(
    languageOrAbbrev: number | string,
    language?: number,
  ): NfCurrencyEntry | null {
    const table = this.GetTheCurrencyTable();
    if (typeof languageOrAbbrev === "string") {
      const target = getRealLanguage(language as number);
      return (
        table.find(
          /** Computes the entry result. @param entry - Entry. @returns The computed result. */ (
            entry,
          ) => entry.GetLanguage() === target && text(entry.GetBankSymbol()) === languageOrAbbrev,
        ) ?? null
      );
    }
    if (languageOrAbbrev === LANGUAGE_SYSTEM)
      return this.MatchSystemCurrency() ?? (table[0] as NfCurrencyEntry);
    const target = getRealLanguage(languageOrAbbrev);
    return (
      table.find(
        /** Computes the entry result. @param entry - Entry. @returns The computed result. */ (
          entry,
        ) => entry.GetLanguage() === target,
      ) ?? (table[0] as NfCurrencyEntry)
    );
  }
  /** Original separate legacy-only currency lookup by symbol and bank abbreviation. @param symbol - Display symbol. @param abbrev - Bank symbol. @returns Legacy entry or null. */
  static GetLegacyOnlyCurrencyEntry(symbol: string, abbrev: string): NfCurrencyEntry | null {
    this.GetTheCurrencyTable();
    return (
      legacyOnlyCurrencyTable.find(
        /** Computes the entry result. @param entry - Entry. @returns The computed result. */ (
          entry,
        ) => text(entry.GetSymbol()) === symbol && text(entry.GetBankSymbol()) === abbrev,
      ) ?? null
    );
  }
  /** Source static two-digit-year expansion at the configured century boundary. @param year - Input year. @param start - First year of the hundred-year window. @returns Expanded year. */
  static ExpandTwoDigitYear(year: number, start: number): number {
    year &= 0xffff;
    start &= 0xffff;
    if (year < 100) return year + (Math.trunc(start / 100) + (year < start % 100 ? 1 : 0)) * 100;
    return year;
  }
  /** Original pure format-category compatibility used by block input. @param oldType - Existing native category. @param newType - Inserted native category. @returns Whether the old format can be retained. */
  static IsCompatible(oldType: number, newType: number): boolean {
    if (oldType === newType) return true;
    if (oldType === SvNumFormatType.DEFINED) return true;
    switch (newType) {
      case SvNumFormatType.NUMBER:
        switch (oldType) {
          case SvNumFormatType.PERCENT:
          case SvNumFormatType.CURRENCY:
          case SvNumFormatType.SCIENTIFIC:
          case SvNumFormatType.FRACTION:
            return true;
          default:
            return false;
        }
      case SvNumFormatType.DATE:
      case SvNumFormatType.TIME:
        return oldType === SvNumFormatType.DATETIME;
      case SvNumFormatType.DATETIME:
        return oldType === SvNumFormatType.TIME || oldType === SvNumFormatType.DATE;
      case SvNumFormatType.DURATION:
      default:
        return false;
    }
  }
  private aColorLink: ((index: number) => Color | null) | null = null;
  /** Original Link assignment; a nullable bound function adapts the consumed Link thunk/instance pair. @param callback - Actual user color-table callback. @returns Nothing. */
  SetColorLink(callback: ((index: number) => Color | null) | null): void {
    this.aColorLink = callback;
  }
  /** Original unset-Link null result and uint16 callback argument. @param index - Zero-based user color. @returns Borrowed callback color or null. */
  GetUserDefColor(index: number): Color | null {
    const callback = this.aColorLink;
    return callback ? callback(index & 65535) : null;
  }
  private readonly m_xNatNum = new OnDemandNativeNumberWrapper();
  /** Original actual native-number wrapper borrow. @returns On-demand service owner. */
  GetNatNum(): NativeNumberWrapper {
    return this.m_xNatNum.get();
  }
  private readonly IniLnge: number;
  private readonly mapper = createNumberFormatCodeMapper();
  private readonly m_aFormatData = new SvNFFormatData();
  private readonly m_aRWPolicy = Policy.GetRWPolicy(this.m_aFormatData);
  private readonly m_aCurrentLanguage: SvNFLanguageData;
  /** Original constructor path creates actual language/table owners and invokes the complete builtin-generation sequence. Separate real provider lifetimes retain native scanner-service versus generation-service roles. @param language - Original native language;UNKNOWN substitutes US as in source. @returns Formatter owner with compiled builtin entries. */
  constructor(language: number) {
    language &= 65535;
    this.IniLnge = language !== LANGUAGE_DONTKNOW ? language : LANGUAGE_ENGLISH_US;
    this.m_aCurrentLanguage = new SvNFLanguageData(this.mapper, this.IniLnge, this);
    const current = this.m_aCurrentLanguage;
    try {
      this.m_aFormatData.ImpGenerateFormats(current, this.GetNatNum(), 0, false);
    } catch (error) {
      this.m_aFormatData.dispose();
      current.dispose();
      this.mapper.dispose();
      this.m_xNatNum.dispose();
      throw error;
    }
  }

  /** Original public entry insertion forwards to the same actual compiled table. @param code - In/out format code. @param check - Error position. @param type - Output category. @param key - Output key. @param language - Source locale. @param replaceBoolean - Native defaulttrue replacement. @returns New-entry insertion flag. */
  PutEntry(
    code: OUString,
    check: [number],
    type: [number],
    key: [number],
    language = LANGUAGE_DONTKNOW,
    replaceBoolean = true,
  ): boolean {
    language &= 65535;
    return this.m_aFormatData.PutEntry(
      this.m_aCurrentLanguage,
      this.GetNatNum(),
      code,
      check,
      type,
      key,
      language,
      replaceBoolean,
    );
  }
  /** Original locale conversion uses the same parser/scanner and retains the source Boolean retry/rollback behavior. Conversion mode is reset at the original normal return point, not through an invented exception guard. @param code - In/out format code. @param check - Error position. @param type - Output category. @param key - Output key. @param language - Source locale. @param target - Destination locale. @param dateOrder - Convert date order. @param replaceBoolean - Native defaulttrue replacement. @returns Native insertion flag. */
  PutandConvertEntry(
    code: OUString,
    check: [number],
    type: [number],
    key: [number],
    language: number,
    target: number,
    dateOrder: boolean,
    replaceBoolean = true,
  ): boolean {
    language &= 65535;
    target &= 65535;
    if (target === LANGUAGE_DONTKNOW) target = this.IniLnge;
    const scanner = this.m_aCurrentLanguage.GetFormatScanner();
    scanner.SetConvertMode(language, target, false, dateOrder);
    let result = this.PutEntry(code, check, type, key, language, replaceBoolean);
    scanner.SetConvertMode(false);
    if (
      replaceBoolean &&
      check[0] === 0 &&
      type[0] === SvNumFormatType.DEFINED &&
      key[0] !== NUMBERFORMAT_ENTRY_NOT_FOUND
    ) {
      const entry = this.m_aFormatData.GetFormatEntry(key[0]);
      if (entry?.GetType() === SvNumFormatType.DEFINED) {
        const saved = new OUString(code);
        try {
          this.m_aCurrentLanguage.ChangeIntl(target);
          if (scanner.ReplaceBooleanEquivalent(code)) {
            const savedCheck = check[0],
              savedType = type[0],
              savedKey = key[0];
            const targetResult = this.PutEntry(code, check, type, key, target, false);
            if (
              check[0] === 0 &&
              type.at(0) === SvNumFormatType.LOGICAL &&
              key[0] !== NUMBERFORMAT_ENTRY_NOT_FOUND
            )
              result = targetResult;
            else {
              code.assign(saved);
              check[0] = savedCheck;
              type[0] = savedType;
              key[0] = savedKey;
            }
          }
        } finally {
          saved.dispose();
        }
      }
    }
    return result;
  }
  /** Original builtin-format selection. @param index - Source index. @param language - Requested language. @returns Actual format key. */
  GetFormatIndex(index: number, language = LANGUAGE_DONTKNOW): number {
    return SvNFEngine.GetFormatIndex(
      this.m_aCurrentLanguage,
      this.m_aRWPolicy,
      this.GetNatNum(),
      index,
      language,
    );
  }
  /** Original General standard key. @param language - Requested language. @returns Actual General key. */
  GetStandardIndex(language = LANGUAGE_DONTKNOW): number {
    return SvNFEngine.GetStandardIndex(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      this.GetNatNum(),
      this.m_aRWPolicy,
      language,
    );
  }
  /** Original standard-selection overloads. @param args - Type/language, key/type/language or value/key/type/language. @returns Actual selected key. */
  GetStandardFormat(
    ...args:
      | [type: number, language?: number | undefined]
      | [key: number, type: number, language: number]
      | [value: number, key: number, type: number, language: number]
  ): number {
    const actual =
      args.length <= 2
        ? ([args[0], args[1] === undefined ? LANGUAGE_DONTKNOW : args[1]] as [number, number])
        : (args as [number, number] | [number, number, number] | [number, number, number, number]);
    return SvNFEngine.GetStandardFormat(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      this.GetNatNum(),
      this.m_aRWPolicy,
      ...actual,
    );
  }
  /** Original public number recognition. @param value - Cell input. @param key - In/out format key. @param output - Numeric output. @param options - Original scanner flags. @returns Recognition result. */
  IsNumberFormat(
    value: OUStringConstReference,
    key: [number],
    output: [number],
    options = 0,
  ): boolean {
    return SvNFEngine.IsNumberFormat(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      this.GetNatNum(),
      this.m_aRWPolicy,
      value,
      key,
      output,
      options,
    );
  }
  /** Original edit-format dispatch. @param number - Numeric cell value. @param key - Display key. @param type - Display category. @param format - Actual entry. @param locale - Requested edit locale. @returns Edit key. */
  GetEditFormat(
    number: number,
    key: number,
    type: number,
    format: SvNumberformatConstReference | null,
    locale = LANGUAGE_DONTKNOW,
  ): number {
    return SvNFEngine.GetEditFormat(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      this.GetNatNum(),
      this.m_aRWPolicy,
      number,
      key,
      type,
      format,
      locale,
    );
  }
  /** Original builtin-language remapping. @param key - Input key. @param language - Target language. @returns Actual remapped key. */
  GetFormatForLanguageIfBuiltIn(key: number, language: number): number {
    return SvNFEngine.GetFormatForLanguageIfBuiltIn(
      this.m_aCurrentLanguage,
      this.GetNatNum(),
      this.m_aRWPolicy,
      key,
      language,
    );
  }
  /** Original current date-evaluation policy. @returns Native policy. */
  GetEvalDateFormat(): number {
    return this.m_aCurrentLanguage.GetEvalDateFormat();
  }
  /** Original static runtime-key to builtin-index conversion. @param format - Native uint32 format key. @returns Source index or entries sentinel. */
  static GetIndexTableOffset(format: number): number {
    return GetIndexTableOffset(format);
  }
  /** Original borrowed exact-entry lookup; absent ungenerated entries return null. @param key - Native key. @returns Actual parsed entry or null. */
  GetEntry(key: number): SvNumberformatConstReference | null {
    return this.m_aFormatData.GetFormatEntry(key);
  }
  /** Original actual category query. @param key - Native key. @returns Native type. */
  GetType(key: number): number {
    return this.m_aFormatData.GetType(key);
  }
  /** Borrows the actual numeric locale data owned by this formatter. @returns Current locale fields. */
  GetLocaleData(): LocaleDataWrapper {
    return this.m_aCurrentLanguage.GetLocaleData();
  }
  /** Reads the actual format entry's text category. @param key - Native format key. @returns Text format. */
  IsTextFormat(key: number): boolean {
    return this.GetEntry(key)?.IsTextFormat() ?? false;
  }
  /** Original standard precision assignment. @param precision - Native short precision. @returns Nothing. */
  ChangeStandardPrec(precision: number): void {
    this.m_aCurrentLanguage.ChangeStandardPrec(precision);
  }
  /** Original standard precision read. @returns Current precision. */
  GetStandardPrec(): number {
    return this.m_aCurrentLanguage.GetStandardPrec();
  }
  /** Original date evaluation field forwarding. @param order - Native enum. @returns Nothing. */
  SetEvalDateFormat(order: number): void {
    this.m_aCurrentLanguage.SetEvalDateFormat(order);
  }
  /** Original null-date update dispatch. @param day - Native day. @param month - Native month. @param year - Native year. @returns Nothing. */
  ChangeNullDate(day: number, month: number, year: number): void {
    SvNFEngine.ChangeNullDate(this.m_aCurrentLanguage, day, month, year);
  }
  /** Original borrowed format-scanner null date. @returns Actual Date value. */
  GetNullDate(): DateConstReference {
    return this.m_aCurrentLanguage.GetNullDate();
  }
  /** Original input-scanner two-digit-year field assignment. @param year - Native uint16 threshold. @returns Nothing. */
  SetYear2000(year: number): void {
    this.m_aCurrentLanguage.pStringScanner.SetYear2000(year);
  }
  /** Original actual two-digit-year field. @returns Native threshold. */
  GetYear2000(): number {
    return this.m_aCurrentLanguage.pStringScanner.GetYear2000();
  }
  /** Original formatter instance delegates year expansion to its active language. @param year - Input year. @returns Expanded year. */
  ExpandTwoDigitYear(year: number): number {
    return this.m_aCurrentLanguage.ExpandTwoDigitYear(year);
  }
  /** Original zero-suppression write. @param suppress - Native flag. @returns Nothing. */
  SetNoZero(suppress: boolean): void {
    this.m_aFormatData.SetNoZero(suppress);
  }
  /** Original zero-suppression read. @returns Actual flag. */
  GetNoZero(): boolean {
    return this.m_aFormatData.GetNoZero();
  }
  /** Original numeric/string output forwarding with actual language/native owners and writable policy. @param args - Original value, key, output, color and default-false fill flag. @returns Nothing. */
  GetOutputString(...args: Parameters<typeof GetFormatterOutputString>): void {
    GetFormatterOutputString.call(this, ...args);
  }
  /** Original public input-line forwarding with the actual native-number owner and writable accessor. @param args - Value, display format key and original filtering/system-locale flags. @returns Owned input string. */
  GetInputLineString(
    ...args: [value: number, key: number, filtering?: boolean, forceSystemLocale?: boolean]
  ): OUString {
    return SvNFEngine.GetInputLineString(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      this.GetNatNum(),
      this.m_aRWPolicy,
      ...args,
    );
  }
  /** Original owned table entries are destroyed before language/scanner/provider owners. Unrepresented global registry/mutex services have no fake lifetime hooks. @returns Nothing. */
  dispose(): void {
    this.m_aFormatData.dispose();
    this.m_aCurrentLanguage.dispose();
    this.mapper.dispose();
    this.m_xNatNum.dispose();
  }
}
