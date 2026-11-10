/** @fileoverview Original represented format-code,language,table,General formatter and engine owners over genuine UNO/SAL/Date values;remaining builtin/pattern/UNO-registry services stay explicit unported boundaries. */
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import * as Type from "../../../offapi/com/sun/star/i18n/KNumberFormatType";
import {
  cppu_detail_getUnoType_NumberFormatCode,
  NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { DateConstReference } from "../../../tools/source/datetime/tdate";
import type { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import * as Policy from "./zforlist.policy";
import * as Edit from "./zforlist.edit";
import * as Standard from "./zforlist.standard";
import { IsNumberFormat } from "./zforlist.recognition";
import { GetLangDecimalSep } from "./zforlist.language";
import {
  ImpGenerateCL,
  PutEntry,
  ImpGetDefaultCurrencyFormat,
  ImpGetDefaultSystemCurrencyFormat,
} from "./zforlist.table-entry";
import { GetCurrencyFormatStrings } from "./zforlist.currency-patterns";
import { ImpGenerateFormats } from "./zforlist.generate-formats";
export { generateStandardNumberFormat } from "./zforlist.generate";
import {
  FindCachedDefaultFormat,
  ImpGetDefaultFormat,
  CacheFormatRW,
  FindFormatRW,
  CacheFormatRO,
  FindFormatRO,
} from "./zforlist.index";
import { CalendarWrapper } from "../../../unotools/source/i18n/calendarwrapper";
import { CharClass } from "../../../unotools/source/i18n/charclass";
import {
  getDateSep,
  getLoadedLocale,
  getNumDecimalSep,
  getNumDecimalSepAlt,
  getNumThousandSep,
  LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import type { TransliterationWrapper } from "../../../unotools/source/i18n/transliterationwrapper";
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { OnDemandCharClass, OnDemandTransliterationWrapper } from "../../inc/ondemand";
import {
  NfEvalDateFormat,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  NfIndexTableOffset as Offset,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SvNumFormatType,
} from "../../inc/zforlist";
import { ImpSvNumberInputScan } from "./zforfind";
import { GetOutputString, GetInputLineString } from "./zforlist.output";
import { SvNumberformat } from "./zformat";
import { ImpSvNumberformatScan } from "./zforscan";

import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { CURRENCY } from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import type { NumberFormatCodeConstReference } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import type { NfCurrencyEntry } from "./zforlist.currency-entry";
export { NfCurrencyEntry } from "./zforlist.currency-entry";

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
    pFormatScanner: ImpSvNumberformatScan | null;
    aDecimalSep: OUString;
    aDecimalSepAlt: OUString;
    aThousandSep: OUString;
    aDateSep: OUString;
    eEvalDateFormat: number;
  };
  /** Original input scanner owned by this current-language state. */
  readonly pStringScanner: ImpSvNumberInputScan;
  /** Original constructor's represented language/cache/scanner path;the actual provider must outlive this borrowed service-field binding. @param mapper - Actual prepared XNumberFormatCode service field. @param language - Native initial language. @param colorCallback - Original actual formatter reference. @returns Owned language/scanner state. */
  constructor(mapper: XNumberFormatCode, language: number, colorCallback: SvNumberFormatter) {
    language &= 65535;
    const locale = convertLanguageToLocale(language, false),
      loadedLocale = getLoadedLocale(locale),
      localeData = new LocaleDataWrapper(locale),
      decimal = getNumDecimalSep(locale),
      alternate = getNumDecimalSepAlt(locale),
      thousand = getNumThousandSep(locale),
      date = getDateSep(locale);
    {
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
        pFormatScanner: null,
        aDecimalSep: decimal,
        aDecimalSepAlt: alternate,
        aThousandSep: thousand,
        aDateSep: date,
        eEvalDateFormat: NfEvalDateFormat.International,
      };
      this.pStringScanner = new ImpSvNumberInputScan(this);
      this.fields.pFormatScanner = new ImpSvNumberformatScan(this, colorCallback, mapper);
    }
  }
  /** Original compatibility currency selection, preferring UsedInCompatibleFormatCodes and retaining the native current-currency fallback. @param symbol - Existing output string. @param abbreviation - Existing output string. @returns Nothing. */
  GetCompatibilityCurrency(symbol: OUString, abbreviation: OUString): void {
    const data = this.GetLocaleData(),
      currency = data
        .getAllCurrencies()
        .find(
          /** Source compatibility flag predicate. @param row - Currency. @returns Whether selected. */ (
            row,
          ) => row.usedInCompatibleFormatCodes,
        );
    if (currency) {
      const s = unicode(currency.symbol),
        a = unicode(currency.bankSymbol);
      try {
        symbol.assign(s);
        abbreviation.assign(a);
      } finally {
        a.dispose();
        s.dispose();
      }
    } else {
      symbol.assign(data.getCurrSymbol());
      abbreviation.assign(data.getCurrBankSymbol());
    }
  }
  /** Original current scanner TRUE keyword. @returns Borrowed keyword. */
  GetTrueString(): OUStringConstReference {
    return this.GetFormatScanner().GetTrueString();
  }
  /** Original current scanner FALSE keyword. @returns Borrowed keyword. */
  GetFalseString(): OUStringConstReference {
    return this.GetFormatScanner().GetFalseString();
  }
  /** Original current scanner keyword table. @returns Borrowed keyword table. */
  GetKeywords(): readonly OUStringConstReference[] {
    return this.GetFormatScanner().GetKeywords();
  }
  /** Original current scanner compatibility abbreviation. @returns Borrowed abbreviation. */
  GetCurAbbrev(): OUStringConstReference {
    return this.GetFormatScanner().GetCurAbbrev();
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
    return this.fields.pFormatScanner as ImpSvNumberformatScan;
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
    return this.GetFormatScanner().GetNullDate();
  }
  /** Original precision forwarding preserves scanner state and uint16 conversion. @param precision - Native short argument. @returns Nothing. */
  ChangeStandardPrec(precision: number): void {
    this.GetFormatScanner().ChangeStandardPrec(precision);
  }
  /** Original precision query. @returns Current scanner precision. */
  GetStandardPrec(): number {
    return this.GetFormatScanner().GetStandardPrec();
  }
  /** Original language-owned year expansion delegates only short years to the formatter's static boundary rule. @param year - Input year. @returns Expanded year. */
  ExpandTwoDigitYear(year: number): number {
    year &= 0xffff;
    return year < 100
      ? SvNumberFormatter.ExpandTwoDigitYear(year, this.pStringScanner.GetYear2000())
      : year;
  }
  /** Original locale-data decimal query. @param language - Native language ID. @returns Owned separator. */
  GetLangDecimalSep(language: number): OUString {
    return GetLangDecimalSep.call(this, language);
  }
  /** Original unknown-language resolution. @param language - Requested language. @returns Initial language for UNKNOWN only. */
  ImpResolveLanguage(language: number): number {
    return (language & 65535) === LANGUAGE_DONTKNOW ? this.fields.IniLnge : language & 65535;
  }
  /** Original currency-format vector generation. @param formats - Actual owned vector. @param currency - Actual currency value. @param bank - Bank mode. @returns Default index. */
  GetCurrencyFormatStrings(formats: OUString[], currency: NfCurrencyEntry, bank: boolean): number {
    return GetCurrencyFormatStrings(this, formats, currency, bank);
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
      date = getDateSep(locale);
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
      this.GetFormatScanner().ChangeIntl();
      this.pStringScanner.ChangeIntl();
    } finally {
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
    fields.pCalendar.dispose();
    fields.pLocaleData.dispose();
    fields.xCharClass.dispose();
    fields.xTransliteration.dispose();
    fields.pFormatScanner?.dispose();
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
    nDefaultSystemCurrencyFormat: [NUMBERFORMAT_ENTRY_NOT_FOUND] as [number],
    bNoZero: false,
  };
  /** Original complete builtin generation dispatch. @param current - Actual language owner. @param native - Actual native-number provider. @param offset - Locale block. @param noAdditional - Source changing-system flag. @returns Nothing. */
  ImpGenerateFormats(
    current: SvNFLanguageData,
    native: NativeNumberWrapper,
    offset: number,
    noAdditional: boolean,
  ): void {
    ImpGenerateFormats(this, current, native, offset, noAdditional);
  }
  /** Original locale-block creation dispatch. @param current - Language owner. @param native - Native-number service. @param language - Requested language. @returns Locale block. */
  ImpGenerateCL(current: SvNFLanguageData, native: NativeNumberWrapper, language: number): number {
    return ImpGenerateCL(this, current, native, language);
  }
  /** Original compiled entry insertion. @param current - Language owner. @param native - Native-number service. @param code - Mutable code. @param check - Error position. @param type - Output type. @param key - Output key. @param language - Requested language. @param replaceBoolean - Boolean replacement. @returns New insertion flag. */
  PutEntry(
    current: SvNFLanguageData,
    native: NativeNumberWrapper,
    code: OUString,
    check: [number],
    type: [number],
    key: [number],
    language: number,
    replaceBoolean = true,
  ): boolean {
    return PutEntry(this, current, native, code, check, type, key, language, replaceBoolean);
  }
  /** Original system currency default. @param current - Language owner. @param native - Native-number service. @returns Actual format key. */
  ImpGetDefaultSystemCurrencyFormat(
    current: SvNFLanguageData,
    native: NativeNumberWrapper,
  ): number {
    return ImpGetDefaultSystemCurrencyFormat(this, current, native);
  }
  /** Original currency default. @param current - Language owner. @param native - Native-number service. @param offset - Locale block. @param language - Currency language. @returns Actual format key. */
  ImpGetDefaultCurrencyFormat(
    current: SvNFLanguageData,
    native: NativeNumberWrapper,
    offset: number,
    language: number,
  ): number {
    return ImpGetDefaultCurrencyFormat(this, current, native, offset, language);
  }
  /** Original owner-cache query. @param search - Native uint32 search key. @returns Cached key or missing sentinel. */
  FindCachedDefaultFormat(search: number): number {
    return FindCachedDefaultFormat(this.fields.aDefaultFormatKeys, search);
  }
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
  /** Original ImpInsertFormat automatic-currency stripping, normal compilation and additional-code duplicate checks over actual owners. Prepared scanner/ActLnge fields bind the original language-data access; diagnostics remain unrepresented. @param scanner - Actual scanner. @param language - Original ActLnge in/out field. @param code - Borrowed generated struct. @param position - Original uint32 map key. @param native - Actual native-number provider. @returns Borrowed inserted entry or null. */
  ImpInsertFormat(
    scanner: ImpSvNumberformatScan,
    language: [number],
    code: NumberFormatCodeConstReference,
    position: number,
    native: NativeNumberWrapper = scanner.getColorCallback().GetNatNum(),
  ): SvNumberformat | null {
    position >>>= 0;
    if (
      Offset.NF_INDEX_TABLE_RESERVED_START <= code.Index &&
      code.Index < Offset.NF_INDEX_TABLE_ENTRIES
    )
      throw new Error("reserved formatIndex assertion");
    const codeString = new OUString(code.Code),
      check: [number] = [0];
    let format: SvNumberformat;
    try {
      if (
        code.Index < Offset.NF_INDEX_TABLE_RESERVED_START &&
        code.Usage === CURRENCY &&
        code.Index !== Offset.NF_CURRENCY_1000DEC2_CCC &&
        codeString.indexOf(Uint16Array.of(91, 36)) >= 0
      ) {
        const stripped = SvNumberformat.StripNewCurrencyDelimiters(codeString);
        try {
          codeString.assign(stripped);
        } finally {
          stripped.dispose();
        }
      }
      format = new SvNumberformat(
        codeString,
        scanner,
        scanner.GetCurrentLanguageData().pStringScanner,
        native,
        check,
        language,
      );
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

/** Original static-only engine namespace after erasing C++ class syntax,with no instance state. General, Boolean and Text standard formatting is represented. Date/time substitution, other pattern output and full read/write policies remain unported. */
export const SvNFEngine = {
  ...Policy,
  ...Standard,
  ...Edit,
  IsNumberFormat,
  ImpGetDefaultFormat,
  CacheFormatRW,
  FindFormatRW,
  CacheFormatRO,
  FindFormatRO,
  /** Original null-date update order:format scanner normalizes/validates,then input scanner receives the original raw Date value. Only the actual input date field is projected;no input-scanner service is fabricated. @param current - Real current language state. @param day - Native day. @param month - Native month. @param year - Native year. @returns Nothing. */
  ChangeNullDate(current: SvNFLanguageData, day: number, month: number, year: number): void {
    current.GetFormatScanner().ChangeNullDate(day, month, year);
    current.pStringScanner.ChangeNullDate(day, month, year);
  },
  GetOutputString,
  GetInputLineString,
};

import { SvNumberFormatter } from "./zforlist.formatter";
export { SvNumberFormatter } from "./zforlist.formatter";
