/** @fileoverview Original represented format-code,language,table,General formatter and engine owners over genuine UNO/SAL/Date values;remaining builtin/pattern/UNO-registry services stay explicit unported boundaries. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
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
import * as Type from "../../../offapi/com/sun/star/i18n/KNumberFormatType";
import {
  cppu_detail_getUnoType_NumberFormatCode,
  NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { Color } from "../../../tools/inc/color";
import type { DateConstReference } from "../../../tools/source/datetime/tdate";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { CalendarWrapper } from "../../../unotools/source/i18n/calendarwrapper";
import { CharClass } from "../../../unotools/source/i18n/charclass";
import {
  createNumberFormatCodeMapper,
  getDateSep,
  getLoadedLocale,
  getNumDecimalSep,
  getNumDecimalSepAlt,
  getNumThousandSep,
  LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import type { TransliterationWrapper } from "../../../unotools/source/i18n/transliterationwrapper";
import { OnDemandCharClass, OnDemandTransliterationWrapper } from "../../inc/ondemand";
import {
  NfEvalDateFormat,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  NfIndexTableOffset as Offset,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SV_MAX_COUNT_STANDARD_FORMATS,
  SvNumFormatType,
} from "../../inc/zforlist";
import { ImpSvNumberInputScan } from "./zforfind";
import { INPUTSTRING_PRECISION } from "./zforlist.defaults";
import { SvNumberformat, type SvNumberformatConstReference } from "./zformat";
import { ImpSvNumberformatScan, prepareGeneralKeywords } from "./zforscan";

import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { CURRENCY, FIXED_NUMBER } from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import type { NumberFormatCodeConstReference } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
import type { LocaleCurrency } from "../../../unotools/source/i18n/localedatawrapper";

/** Original language/country currency value used by SvNumberFormatter's ordered currency tables. */
export class NfCurrencyEntry {
  private readonly symbol: OUString;
  private readonly bankSymbol: OUString;
  private language: number;
  private readonly positiveFormat: number;
  private readonly negativeFormat: number;
  private readonly digits: number;
  /** Initializes the source wrapper fallback or Currency2 row, preserving the row's own digits. @param first - Wrapper or currency row. @param second - Language or wrapper. @param third - Row language.  @returns Constructed instance. */
  constructor(wrapper: LocaleDataWrapper, language: number);
  /** Computes the currency result. @param currency - Currency. @param wrapper - Wrapper. @param language - Language. @returns Constructed instance. */ constructor(
    currency: LocaleCurrency,
    wrapper: LocaleDataWrapper,
    language: number,
  );
  /** Computes the first result. @param first - First. @param second - Second. @param third - Third. @returns Constructed instance. */ constructor(
    first: LocaleDataWrapper | LocaleCurrency,
    second: number | LocaleDataWrapper,
    third?: number,
  ) {
    const wrapper = typeof second === "number" ? (first as LocaleDataWrapper) : second;
    const currency = typeof second === "number" ? null : (first as LocaleCurrency);
    this.symbol = currency ? unicode(currency.symbol) : new OUString(wrapper.getCurrSymbol());
    this.bankSymbol = currency
      ? unicode(currency.bankSymbol)
      : new OUString(wrapper.getCurrBankSymbol());
    this.language = typeof second === "number" ? second : (third as number);
    this.positiveFormat = wrapper.getCurrPositiveFormat();
    this.negativeFormat = wrapper.getCurrNegativeFormat();
    this.digits = currency ? currency.decimalPlaces : wrapper.getCurrDigits();
  }
  /** Source identity compares only the symbol, bank symbol and language. @param other - Currency entry. @returns Identity. */
  equals(other: NfCurrencyEntry): boolean {
    return (
      this.symbol.equals(other.symbol) &&
      this.bankSymbol.equals(other.bankSymbol) &&
      this.language === other.language
    );
  }
  /** Original borrowed symbol. @returns Symbol. */
  GetSymbol(): OUString {
    return this.symbol;
  }
  /** Original borrowed bank symbol. @returns Bank symbol. */
  GetBankSymbol(): OUString {
    return this.bankSymbol;
  }
  /** Original language. @returns Native language ID. */
  GetLanguage(): number {
    return this.language;
  }
  /** Original positive placement. @returns Format ID. */
  GetPositiveFormat(): number {
    return this.positiveFormat;
  }
  /** Original negative placement. @returns Format ID. */
  GetNegativeFormat(): number {
    return this.negativeFormat;
  }
  /** Original currency precision. @returns Digits. */
  GetDigits(): number {
    return this.digits;
  }
  /** Source system-currency list language adjustment. @param language - Native language ID. @returns Nothing. */
  SetLanguage(language: number): void {
    this.language = language;
  }
  /** Original [$symbol-language] or [$bank] syntax, quoting symbols containing hyphen or closing bracket. @param bank - Use ISO bank symbol. @param withoutExtension - Omit language suffix. @returns Owned code. */
  BuildSymbolString(bank: boolean, withoutExtension = false): OUString {
    let value = "[$";
    if (bank) value += text(this.bankSymbol);
    else {
      const symbol = text(this.symbol);
      value += symbol.includes("-") || symbol.includes("]") ? `"${symbol}"` : symbol;
      if (
        !withoutExtension &&
        this.language !== LANGUAGE_DONTKNOW &&
        this.language !== LANGUAGE_SYSTEM
      )
        value += `-${(this.language & 0xffff).toString(16).toUpperCase()}`;
    }
    return unicode(value + "]");
  }
  /** Releases owned source string values. @returns Nothing. */
  dispose(): void {
    this.symbol.dispose();
    this.bankSymbol.dispose();
  }
}

/** Original process-wide source currency tables: ordinary entries start with SYSTEM, legacy-only entries are separate. */
let currencyTable: NfCurrencyEntry[] | null = null;
let legacyOnlyCurrencyTable: NfCurrencyEntry[] = [];
let systemCurrencyPosition = 0;

/** Original declared initializer-list/sequence specialization. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);

/** Original exact index/default/currency fallback order,including creation of one default-initialized struct for an empty sequence. Decimal is the actual GetNumDecimalSep field;the diagnostic-only LocaleData checks do not change selection. @param sequence - Original mutable sequence reference. @param offset - Requested built-in index. @param decimal - Borrowed current-language decimal separator. @returns Original sequence index,zero on final fallback. */
export function ImpGetFormatCodeIndex(
  sequence: Sequence<NumberFormatCodeAddress>,
  offset: number,
  decimal: OUStringConstReference,
): number {
  for (let index = 0; index < sequence.getLength(); ++index)
    if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Index === offset) return index;
  if (sequence.hasElements()) {
    for (let index = 0; index < sequence.getLength(); ++index)
      if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Default) return index;
    if (Offset.NF_CURRENCY_START <= offset && offset <= Offset.NF_CURRENCY_END) {
      for (const fallback of [Offset.NF_CURRENCY_1000DEC2, Offset.NF_CURRENCY_1000INT])
        for (let index = 0; index < sequence.getLength(); ++index)
          if (NumberFormatCode.borrowed(sequence.operatorIndex(index)).Index === fallback)
            return index;
    }
  } else {
    const value = new NumberFormatCode(),
      temporary = new Codes(new Map([[0, value]]), 1);
    try {
      sequence.assign(temporary);
    } finally {
      temporary.dispose();
      value.dispose();
    }
    const units = new Uint16Array(decimal.getLength() + 13);
    units[0] = 48;
    units.set(decimal.getStr().subarray(0, decimal.getLength()), 1);
    units.fill(35, 1 + decimal.getLength());
    const code = new OUString(units, units.length);
    try {
      NumberFormatCode.borrowed(
        (sequence.getArray() as SequenceElements).get(0) as NumberFormatCodeAddress,
      ).Code = code;
    } finally {
      code.dispose();
    }
  }
  return 0;
}

/** Original mutable pointer/count algorithm prefers medium,then long,and preserves upstream duplicate-medium flags (CALC-272). The caller obtains this actual pointer through Sequence.getArray,retaining native COW before mutation. Diagnostic-only locale-data validation is not represented. @param formats - Actual compound storage pointer. @param count - Original element count. @returns Nothing. */
export function ImpAdjustFormatCodeDefault(formats: SequenceElements, count: number): void {
  if (!count) return;
  let selected = -1,
    medium = -1;
  for (let index = 0; index < count; ++index) {
    const code = NumberFormatCode.borrowed(formats.get(index * 40) as NumberFormatCodeAddress);
    if (code.Default) {
      if (code.Type === Type.MEDIUM) selected = medium = index;
      else {
        if (code.Type === Type.LONG && medium === -1) selected = index;
        // The original LONG arm falls through to this default-arm body.
        if (selected === -1) selected = index;
        code.Default = false;
      }
    }
  }
  if (selected === -1) selected = 0;
  NumberFormatCode.borrowed(formats.get(selected * 40) as NumberFormatCodeAddress).Default = true;
}

/** Original SvNFLanguageData consumed locale/scanner/cached-field ownership. Real Locale values project LanguageTag/LocaleData fields;the actual mapper interface projects the component-context service lookup. Full LanguageTag,calendar,transliteration,color callback and UNO service ABI remain separate. */
export class SvNFLanguageData {
  /** Original friend-visible state grouped after erasing C++ friend access;only native format-table/engine/formatter callers consume it. locale/loadedLocale are explicit real Locale projections,not replacement LanguageTag objects. */
  readonly fields: {
    readonly IniLnge: number;
    ActLnge: [number];
    locale: Locale;
    loadedLocale: Locale;
    xCharClass: OnDemandCharClass;
    xTransliteration: OnDemandTransliterationWrapper;
    pLocaleData: LocaleDataWrapper;
    pCalendar: CalendarWrapper;
    pFormatScanner: ImpSvNumberformatScan;
    aDecimalSep: OUString;
    aDecimalSepAlt: OUString;
    aThousandSep: OUString;
    aDateSep: OUString;
    eEvalDateFormat: number;
  };
  /** Original input scanner owned by this current-language state. */
  readonly pStringScanner: ImpSvNumberInputScan;
  /** Original constructor's represented language/cache/scanner path;the actual provider must outlive this borrowed service-field binding. @param mapper - Actual prepared XNumberFormatCode service field. @param language - Native initial language. @returns Owned language/scanner state. */
  constructor(
    private readonly mapper: XNumberFormatCode,
    language: number,
  ) {
    language &= 65535;
    const locale = convertLanguageToLocale(language, false),
      loadedLocale = getLoadedLocale(locale),
      localeData = new LocaleDataWrapper(locale),
      decimal = getNumDecimalSep(locale),
      alternate = getNumDecimalSepAlt(locale),
      thousand = getNumThousandSep(locale),
      date = getDateSep(locale),
      prepared = prepareGeneralKeywords(mapper, loadedLocale);
    try {
      const charClass = new OnDemandCharClass();
      charClass.changeLocale(locale);
      const transliteration = new OnDemandTransliterationWrapper();
      transliteration.init(language);
      const calendar = new CalendarWrapper();
      calendar.loadDefaultCalendar(locale);
      this.fields = {
        IniLnge: language,
        ActLnge: [language],
        locale,
        loadedLocale,
        xCharClass: charClass,
        xTransliteration: transliteration,
        pLocaleData: localeData,
        pCalendar: calendar,
        pFormatScanner: new ImpSvNumberformatScan(
          locale,
          prepared.standardName,
          prepared.localization,
          localeData,
        ),
        aDecimalSep: decimal,
        aDecimalSepAlt: alternate,
        aThousandSep: thousand,
        aDateSep: date,
        eEvalDateFormat: NfEvalDateFormat.International,
      };
      this.pStringScanner = new ImpSvNumberInputScan(this);
    } finally {
      prepared.standardName.dispose();
    }
  }
  /** Original initial language remains unchanged after ChangeIntl. @returns Original uint16 language. */
  GetIniLanguage(): number {
    return this.fields.IniLnge;
  }
  /** Original borrowed cached decimal field. @returns Actual owned member. */
  GetNumDecimalSep(): OUStringConstReference {
    return this.fields.aDecimalSep;
  }
  /** Original borrowed cached alternate decimal field. @returns Actual owned member. */
  GetNumDecimalSepAlt(): OUStringConstReference {
    return this.fields.aDecimalSepAlt;
  }
  /** Source current/alternate decimal-separator equality. @param value - Input fragment. @returns Whether it is a locale decimal separator. */
  IsDecimalSep(value: OUStringConstReference): boolean {
    if (value.equals(this.fields.aDecimalSep)) return true;
    return !this.fields.aDecimalSepAlt.isEmpty() && value.equals(this.fields.aDecimalSepAlt);
  }
  /** Original borrowed cached grouping field. @returns Actual owned member. */
  GetNumThousandSep(): OUStringConstReference {
    return this.fields.aThousandSep;
  }
  /** Borrows the source LocaleDataWrapper owned by this language state. @returns Current locale data. */
  GetLocaleData(): LocaleDataWrapper {
    return this.fields.pLocaleData;
  }
  /** Original stable CalendarWrapper owner for number input scanning. @returns Current calendar. */
  GetCalendar(): CalendarWrapper {
    return this.fields.pCalendar;
  }
  /** Original stable current-language CharClass owner. @returns Actual classifier. */
  GetCharClass(): CharClass {
    return this.fields.xCharClass.get();
  }
  /** Source lazy current-language transliteration owner.  @returns The TransliterationWrapper result. */
  GetTransliteration(): TransliterationWrapper {
    return this.fields.xTransliteration.get();
  }
  /** Original borrowed cached date separator. @returns Actual owned member. */
  GetDateSep(): OUStringConstReference {
    return this.fields.aDateSep;
  }
  /** Original current format-scanner reference retains object identity across language changes. @returns Actual scanner. */
  GetFormatScanner(): ImpSvNumberformatScan {
    return this.fields.pFormatScanner;
  }
  /** Original date evaluation setter. @param order - Original enum. @returns Nothing. */
  SetEvalDateFormat(order: number): void {
    this.fields.eEvalDateFormat = order;
  }
  /** Original date evaluation field. @returns Original enum. */
  GetEvalDateFormat(): number {
    return this.fields.eEvalDateFormat;
  }
  /** Original GetNullDate borrows the format scanner's date; the input scanner owns its separate null date. @returns Actual format null date. */
  GetNullDate(): DateConstReference {
    return this.fields.pFormatScanner.GetNullDate();
  }
  /** Original precision forwarding preserves scanner state and uint16 conversion. @param precision - Native short argument. @returns Nothing. */
  ChangeStandardPrec(precision: number): void {
    this.fields.pFormatScanner.ChangeStandardPrec(precision);
  }
  /** Original precision query. @returns Current scanner precision. */
  GetStandardPrec(): number {
    return this.fields.pFormatScanner.GetStandardPrec();
  }
  /** Original language-owned year expansion delegates only short years to the formatter's static boundary rule. @param year - Input year. @returns Expanded year. */
  ExpandTwoDigitYear(year: number): number {
    year &= 0xffff;
    return year < 100
      ? SvNumberFormatter.ExpandTwoDigitYear(year, this.pStringScanner.GetYear2000())
      : year;
  }
  /** Original no-op for the current language,otherwise locale/cache updates precede scanner ChangeIntl. Unrepresented language/service wrappers are explicit projections,not substitute providers. @param language - Native uint16 current language. @returns Nothing. */
  ChangeIntl(language: number): void {
    language &= 65535;
    const fields = this.fields;
    if (fields.ActLnge[0] === language) return;
    fields.ActLnge[0] = language;
    const locale = convertLanguageToLocale(language, false),
      loadedLocale = getLoadedLocale(locale),
      oldLocale = fields.locale,
      oldLoaded = fields.loadedLocale,
      decimal = getNumDecimalSep(locale),
      alternate = getNumDecimalSepAlt(locale),
      thousand = getNumThousandSep(locale),
      date = getDateSep(locale),
      prepared = prepareGeneralKeywords(this.mapper, loadedLocale);
    try {
      fields.locale = locale;
      fields.loadedLocale = loadedLocale;
      fields.xCharClass.changeLocale(locale);
      fields.xTransliteration.changeLocale(language);
      fields.pLocaleData.changeLocale(locale);
      fields.pCalendar.loadDefaultCalendar(locale);
      fields.aDecimalSep.assign(decimal);
      fields.aDecimalSepAlt.assign(alternate);
      fields.aThousandSep.assign(thousand);
      fields.aDateSep.assign(date);
      fields.pFormatScanner.ChangeIntl(locale, prepared.standardName, prepared.localization);
      this.pStringScanner.ChangeIntl();
    } finally {
      prepared.standardName.dispose();
      date.dispose();
      thousand.dispose();
      alternate.dispose();
      decimal.dispose();
      oldLoaded.dispose();
      oldLocale.dispose();
    }
  }
  /** Original cached string/scanner/locale member destruction for represented owners;the prepared mapper remains borrowed. @returns Nothing. */
  dispose(): void {
    const fields = this.fields;
    this.pStringScanner.dispose();
    fields.aDateSep.dispose();
    fields.aThousandSep.dispose();
    fields.aDecimalSepAlt.dispose();
    fields.aDecimalSep.dispose();
    fields.pLocaleData.dispose();
    fields.xCharClass.dispose();
    fields.xTransliteration.dispose();
    fields.pFormatScanner.dispose();
    fields.loadedLocale.dispose();
    fields.locale.dispose();
  }
}

/** Original format-table owner;native fields are grouped solely to erase C++ friend access without inventing individual accessor APIs. Actual Map entries own actual parsed formats. Language generation,engine accessors and formatter services remain separate unported responsibilities. */
export class SvNFFormatData {
  private readonly fields = {
    aFTable: new Map<number, SvNumberformat>(),
    aDefaultFormatKeys: new Map<number, number>(),
    MaxCLOffset: 0,
    nDefaultSystemCurrencyFormat: NUMBERFORMAT_ENTRY_NOT_FOUND,
    bNoZero: false,
  };
  /** Original exact-key lookup;native unsigned32 argument conversion is explicit. @param key - Format key. @returns Actual borrowed entry or null. */
  GetEntry(key: number): SvNumberformat | null {
    return this.fields.aFTable.get(key >>> 0) ?? null;
  }
  /** Original public const format lookup shares the same actual entry. @param key - Format key. @returns Borrowed entry or null. */
  GetFormatEntry(key: number): SvNumberformat | null {
    return this.GetEntry(key);
  }
  /** Original ImpGenerateFormats direct standard-entry emplacement;duplicate entries retain the first owner. @param key - Native locale-block key. @param format - Newly compiled standard owner. @returns Whether inserted. */
  InsertStandardFormat(key: number, format: SvNumberformat): boolean {
    key >>>= 0;
    if (this.fields.aFTable.has(key)) {
      format.dispose();
      return false;
    }
    this.fields.aFTable.set(key, format);
    return true;
  }
  /** Original category query with missing UNDEFINED and masked ALL-to-DEFINED conversion. @param key - Native format key. @returns Native category. */
  GetType(key: number): number {
    const format = this.GetFormatEntry(key);
    if (!format) return SvNumFormatType.UNDEFINED;
    const type = format.GetMaskedType();
    return type === SvNumFormatType.ALL ? SvNumFormatType.DEFINED : type;
  }
  /** Original zero suppression field read. @returns Actual flag. */
  GetNoZero(): boolean {
    return this.fields.bNoZero;
  }
  /** Original zero suppression field write. @param suppress - Native boolean. @returns Nothing. */
  SetNoZero(suppress: boolean): void {
    this.fields.bNoZero = suppress;
  }
  /** Original locale-block search,including returning one block beyond MaxCLOffset on a miss. @param language - Native uint16 language. @returns Existing or next block offset. */
  ImpGetCLOffset(language: number): number {
    language &= 65535;
    let offset = 0;
    while (offset <= this.fields.MaxCLOffset) {
      const format = this.GetFormatEntry(offset);
      if (format && format.GetLanguage() === language) return offset;
      offset += SV_COUNTRY_LANGUAGE_OFFSET;
    }
    return offset;
  }
  /** Original find-at-CLOffset then same-language ordered-map traversal. Sorting primitive keys preserves std::map ordering without replacing entry owners;an absent exact start key does not lower_bound to a later entry. @param code - Native exact case-sensitive string view. @param offset - Exact first key. @param language - Native uint16 language. @returns Matching key or native missing sentinel. */
  ImpIsEntry(code: OUStringConstReference, offset: number, language: number): number {
    offset >>>= 0;
    language &= 65535;
    const keys = [...this.fields.aFTable.keys()].sort(
      /** Original sal_uInt32 map order. @param left - First key. @param right - Second key. @returns Numeric ordering. */ (
        left,
        right,
      ) => left - right,
    );
    let index = keys.indexOf(offset);
    while (index >= 0 && index < keys.length) {
      const key = keys[index] as number,
        format = this.fields.aFTable.get(key) as SvNumberformat;
      if (format.GetLanguage() !== language) break;
      if (format.GetFormatstring().equals(code)) return key;
      ++index;
    }
    return NUMBERFORMAT_ENTRY_NOT_FOUND;
  }
  /** Original ImpInsertFormat General/NatNum0 path and additional-code duplicate check over actual compiled entries. Prepared scanner/ActLnge fields replace only their original language-data member access. Currency delimiter stripping,other pattern families and diagnostic-only checks are not admitted here. Native-number/input-number services are unconsumed on this path. @param scanner - Actual scanner. @param language - Original ActLnge in/out field. @param code - Borrowed generated struct. @param position - Original uint32 map key. @returns Borrowed inserted entry or null. */
  ImpInsertFormat(
    scanner: ImpSvNumberformatScan,
    language: [number],
    code: NumberFormatCodeConstReference,
    position: number,
  ): SvNumberformat | null {
    position >>>= 0;
    if (
      Offset.NF_INDEX_TABLE_RESERVED_START <= code.Index &&
      code.Index < Offset.NF_INDEX_TABLE_ENTRIES
    )
      throw new Error("reserved formatIndex assertion");
    if (
      code.Index < Offset.NF_INDEX_TABLE_RESERVED_START &&
      code.Usage === CURRENCY &&
      code.Index !== Offset.NF_CURRENCY_1000DEC2_CCC
    )
      throw new Error("Automatic currency format insertion is not implemented");
    const codeString = new OUString(code.Code),
      check: [number] = [0];
    let format: SvNumberformat;
    try {
      format = new SvNumberformat(codeString, scanner, check, language);
    } finally {
      codeString.dispose();
    }
    if (check[0] !== 0) {
      format.dispose();
      return null;
    }
    if (code.Index >= Offset.NF_INDEX_TABLE_RESERVED_START) {
      const offset = position - (position % SV_COUNTRY_LANGUAGE_OFFSET);
      if (
        this.ImpIsEntry(format.GetFormatstring(), offset, language[0]) !==
        NUMBERFORMAT_ENTRY_NOT_FOUND
      ) {
        format.dispose();
        return null;
      }
      // Native position-offset >=10000 guard is unreachable:offset is position-(position%10000),so the difference is in [0,9999] for every uint32 position.
    }
    if (this.fields.aFTable.has(position)) {
      format.dispose();
      return null;
    }
    this.fields.aFTable.set(position, format);
    if (code.Default) format.SetStandard();
    if (!code.DefaultName.isEmpty()) format.SetComment(code.DefaultName);
    return format;
  }
  /** Original map member destruction releases every actual owned entry. Physical STL tree destruction order is not represented;the admitted entries have no destructor callbacks. @returns Nothing. */
  dispose(): void {
    for (const format of this.fields.aFTable.values()) format.dispose();
    this.fields.aFTable.clear();
  }
}

/** Original General-number phase of ImpGenerateFormats,not a replacement for the remaining builtin/table generator. The admitted scanner is in native non-conversion mode;actual prepared locale/scanner/language/decimal fields are supplied explicitly,without a fake SvNFLanguageData service. @param table - Actual owning format table. @param mapper - Actual source-code mapper. @param locale - Original locale. @param scanner - Actual prepared scanner. @param language - Original ActLnge field. @param decimal - Original decimal separator field. @param offset - Native locale block offset. @returns Nothing. */
export function generateStandardNumberFormat(
  table: SvNFFormatData,
  mapper: XNumberFormatCode,
  locale: LocaleConstReference,
  scanner: ImpSvNumberformatScan,
  language: [number],
  decimal: OUStringConstReference,
  offset: number,
): void {
  offset >>>= 0;
  const formats = mapper.getAllFormatCode(FIXED_NUMBER, locale);
  try {
    ImpAdjustFormatCodeDefault(formats.getArray() as SequenceElements, formats.getLength());
    const index = ImpGetFormatCodeIndex(formats, Offset.NF_NUMBER_STANDARD, decimal);
    const standard = table.ImpInsertFormat(
      scanner,
      language,
      NumberFormatCode.borrowed(formats.operatorIndex(index)),
      (offset + Offset.NF_NUMBER_STANDARD) >>> 0,
    );
    if (standard) {
      standard.SetType(SvNumFormatType.NUMBER);
      standard.SetStandard();
      standard.SetLastInsertKey(SV_MAX_COUNT_STANDARD_FORMATS);
    }
    for (const [key, type] of [
      [Offset.NF_BOOLEAN, SvNumFormatType.LOGICAL],
      [Offset.NF_TEXT, SvNumFormatType.TEXT],
    ] as const) {
      const code = key === Offset.NF_TEXT ? unicode("@") : new OUString(scanner.GetBooleanString()),
        check: [number] = [0];
      try {
        const format = new SvNumberformat(code, scanner, check, language);
        if (check[0] !== 0) {
          format.dispose();
          throw new Error("Built-in format scan failed");
        }
        format.SetType(type);
        format.SetStandard();
        table.InsertStandardFormat((offset + key) >>> 0, format);
      } finally {
        code.dispose();
      }
    }
  } finally {
    formats.dispose();
  }
}

/** Original static-only engine namespace after erasing C++ class syntax,with no instance state. General, Boolean and Text standard formatting is represented. Date/time substitution, other pattern output and full read/write policies remain unported. */
export const SvNFEngine = {
  /** Original null-date update order:format scanner normalizes/validates,then input scanner receives the original raw Date value. Only the actual input date field is projected;no input-scanner service is fabricated. @param current - Real current language state. @param day - Native day. @param month - Native month. @param year - Native year. @returns Nothing. */
  ChangeNullDate(current: SvNFLanguageData, day: number, month: number, year: number): void {
    current.GetFormatScanner().ChangeNullDate(day, month, year);
    current.pStringScanner.ChangeNullDate(day, month, year);
  },
  /** Original numeric/string engine dispatch: missing numeric keys use General and missing string keys use Text; entries with text sections receive string input. @param current - Actual language/cache/scanner owner. @param table - Actual owned format table. @param value - Native numeric/string overload. @param key - Native unsigned32 format key. @param output - Actual mutable output. @param color - Actual color pointer output. @returns Nothing. */
  GetOutputString(
    current: SvNFLanguageData,
    table: SvNFFormatData,
    value: number | OUStringConstReference,
    key: number,
    output: OUString,
    color: [Color | null],
  ): void {
    if (typeof value === "number" && table.GetNoZero() && value === 0) {
      output.clear();
      return;
    }
    if (typeof value === "number") {
      const format = table.GetFormatEntry(key) ?? table.GetFormatEntry(0);
      if (!format) throw new Error("Required native standard format0 is absent");
      current.ChangeIntl(format.GetLanguage());
      format.GetOutputString(
        value,
        output,
        color,
        current.GetStandardPrec(),
        current.GetNumDecimalSep().getStr()[0] as number,
        current.GetFormatScanner(),
      );
    } else {
      const format = table.GetFormatEntry(key) ?? table.GetFormatEntry(Offset.NF_TEXT);
      if (!format) throw new Error("Required native standard text format is absent");
      if (!format.IsTextFormat() && !format.HasTextFormat()) {
        color[0] = null;
        output.assign(value);
      } else {
        current.ChangeIntl(format.GetLanguage());
        format.GetOutputString(value, output, color);
      }
    }
  },
  /** Original GetInputLineString General branch changes the formatter's standard precision for input text and restores it after formatting. @param current - Actual language state. @param table - Actual format table. @param value - Cell number. @param key - Format key. @param _filtering - Source filter flag. @param _forceSystemLocale - Source locale flag. @returns Owned input string. */
  GetInputLineString(
    current: SvNFLanguageData,
    table: SvNFFormatData,
    value: number,
    key: number,
    _filtering = false,
    _forceSystemLocale = false,
  ): OUString {
    void _filtering;
    void _forceSystemLocale;
    const format = table.GetFormatEntry(key) ?? table.GetFormatEntry(0);
    if (!format) throw new Error("Required native standard format0 is absent");
    current.ChangeIntl(format.GetLanguage());
    const oldPrecision = current.GetStandardPrec();
    if (format.GetMaskedType() === SvNumFormatType.NUMBER)
      current.ChangeStandardPrec(INPUTSTRING_PRECISION);
    const result = new OUString(),
      color: [Color | null] = [null];
    try {
      format.GetOutputString(
        value,
        result,
        color,
        current.GetStandardPrec(),
        current.GetNumDecimalSep().getStr()[0] as number,
        current.GetFormatScanner(),
      );
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      if (format.GetMaskedType() === SvNumFormatType.NUMBER)
        current.ChangeStandardPrec(oldPrecision);
    }
  },
};

/** Original SvNumberFormatter owner for the admitted General, Boolean and Text standard slice. Real provider, language, scanner and parsed table owners are composed through the source initialization phase. Remaining builtin generation is pending; missing keys retain source lookup/output fallback contracts. Context lookup is bound to actual providers; UNO ABI, global registry and mutex scheduling are not claimed. */
export class SvNumberFormatter {
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
  private readonly IniLnge: number;
  private readonly mapper = createNumberFormatCodeMapper();
  private readonly m_aFormatData = new SvNFFormatData();
  private readonly m_aCurrentLanguage: SvNFLanguageData;
  /** Original represented constructor path creates actual language/table owners and General entry. Separate real provider lifetimes retain native scanner-service versus local generation-service roles. @param language - Original native language;UNKNOWN substitutes US as in source. @returns Formatter owner for admitted General entries. */
  constructor(language: number) {
    language &= 65535;
    this.IniLnge = language !== LANGUAGE_DONTKNOW ? language : LANGUAGE_ENGLISH_US;
    this.m_aCurrentLanguage = new SvNFLanguageData(this.mapper, this.IniLnge);
    const generator = createNumberFormatCodeMapper(),
      current = this.m_aCurrentLanguage;
    try {
      generateStandardNumberFormat(
        this.m_aFormatData,
        generator,
        current.fields.locale,
        current.GetFormatScanner(),
        current.fields.ActLnge,
        current.GetNumDecimalSep(),
        0,
      );
    } catch (error) {
      this.m_aFormatData.dispose();
      current.dispose();
      this.mapper.dispose();
      throw error;
    } finally {
      generator.dispose();
    }
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
  /** Original numeric/string output forwarding for admitted standard entries. Star formatting is unconsumed because these entries contain no STAR token. @param value - Actual numeric/string overload. @param key - Native format key. @param output - Actual mutable string. @param color - Actual output pointer. @param _useStarFormat - Original defaultfalse flag. @returns Nothing. */
  GetOutputString(
    value: number | OUStringConstReference,
    key: number,
    output: OUString,
    color: [Color | null],
    _useStarFormat = false,
  ): void {
    // The admitted standard streams have no STAR token; explicitly erase this unconsumed source flag.
    void _useStarFormat;
    SvNFEngine.GetOutputString(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      value,
      key,
      output,
      color,
    );
  }
  /** Original GetInputLineString for the admitted General format: temporarily select input-line precision, format through the actual entry, then restore scanner precision. The source's edit-format and locale-switch branches are identity operations for this entry. @param value - Numeric cell value. @param key - Actual format key. @param _filtering - Source filtering flag. @param _forceSystemLocale - Source locale flag. @returns Owned input string. */
  GetInputLineString(
    value: number,
    key: number,
    _filtering = false,
    _forceSystemLocale = false,
  ): OUString {
    return SvNFEngine.GetInputLineString(
      this.m_aCurrentLanguage,
      this.m_aFormatData,
      value,
      key,
      _filtering,
      _forceSystemLocale,
    );
  }
  /** Original owned table entries are destroyed before language/scanner/provider owners. Unrepresented global registry/mutex services have no fake lifetime hooks. @returns Nothing. */
  dispose(): void {
    this.m_aFormatData.dispose();
    this.m_aCurrentLanguage.dispose();
    this.mapper.dispose();
  }
}
