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
import * as Policy from "./zforlist.policy";
import * as Edit from "./zforlist.edit";
import * as Standard from "./zforlist.standard";
import { IsNumberFormat } from "./zforlist.recognition";
import type { LocaleCurrency } from "../../../unotools/source/i18n/localedatawrapper";
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
  GetIndexTableOffset,
  CacheFormatRW,
  FindFormatRW,
  CacheFormatRO,
  FindFormatRO,
} from "./zforlist.index";
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
import type { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import {
  OnDemandNativeNumberWrapper,
  OnDemandCharClass,
  OnDemandTransliterationWrapper,
} from "../../inc/ondemand";
import {
  NfEvalDateFormat,
  NUMBERFORMAT_ENTRY_NOT_FOUND,
  NfIndexTableOffset as Offset,
  SV_COUNTRY_LANGUAGE_OFFSET,
  SvNumFormatType,
} from "../../inc/zforlist";
import { ImpSvNumberInputScan } from "./zforfind";
import { GetOutputString, GetInputLineString } from "./zforlist.output";
import { SvNumberformat, type SvNumberformatConstReference } from "./zformat";
import { ImpSvNumberformatScan } from "./zforscan";

import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { CURRENCY } from "../../../offapi/com/sun/star/i18n/KNumberFormatUsage";
import type { NumberFormatCodeConstReference } from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import type { XNumberFormatCode } from "../../../offapi/com/sun/star/i18n/XNumberFormatCode";
import { NfCurrencyEntry } from "./zforlist.currency-entry";
export { NfCurrencyEntry } from "./zforlist.currency-entry";

/** Original process-wide source currency tables: ordinary entries start with SYSTEM, legacy-only entries are separate. */
let currencyTable: NfCurrencyEntry[] | null = null;
let legacyOnlyCurrencyTable: NfCurrencyEntry[] = [];
let systemCurrencyPosition = 0;
const theInstalledLocales = new Set<number>();

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

/** Original SvNumberFormatter owner for the admitted General, Boolean and Text standard slice. Real provider, language, scanner and parsed table owners are composed through the source initialization phase. Remaining builtin generation is pending; missing keys retain source lookup/output fallback contracts. Context lookup is bound to actual providers; UNO ABI, global registry and mutex scheduling are not claimed. */
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
      throw error;
    }
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
