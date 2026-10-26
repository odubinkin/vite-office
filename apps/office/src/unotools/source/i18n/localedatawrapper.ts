/** @fileoverview Source LocaleDataWrapper measurement,numeric/date and loaded-Locale field projections over actual locale resources;no complete wrapper service is fabricated. */
import {
  getLocaleMeasurementSystem,
  getLocaleDecimalSeparator,
  getLocaleDecimalSeparatorAlternate,
  getLocaleThousandSeparator,
  getLocaleDateSeparator,
  getLocaleLanguageCountryInfo,
  getLocaleTime100SecSeparator,
  getLocaleTimeSeparator,
  getLocaleTimeAM,
  getLocaleTimePM,
  getLocaleTrueWord,
  getLocaleFalseWord,
  getLocaleDateAcceptancePatterns,
  getLocaleFormatElements,
  getLocaleCurrencies,
  getAllInstalledLocaleNames,
  getLocaleLongDateSeparators,
  type LocaleCurrency,
} from "../../../i18npool/source/localedata/localedata";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";
export type { LocaleCurrency } from "../../../i18npool/source/localedata/localedata";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Original loadDigitGrouping country selection over the loaded LC_INFO country field. @param locale - Current locale. @returns Owned native grouping sequence. */
function loadDigitGrouping(locale: LocaleConstReference): Sequence<[number]> {
  const country = getLocaleLanguageCountryInfo(locale).Country.toUpperCase();
  const widths = country === "IN" || country === "BT" ? [3, 2, 0] : [3, 0, 0];
  return new Integers(
    new Map(widths.map((width, index) => [index * 4, [width] as [number]])),
    widths.length,
  );
}
/** Original localedatawrapper.hxx enumeration. */
export enum MeasurementSystem {
  Metric = 0,
  US = 1,
}
/** Original localedatawrapper.hxx short date ordering. */
export enum DateOrder {
  Invalid = -1,
  MDY = 0,
  DMY = 1,
  YMD = 2,
}
/** Original localedatawrapper.hxx long date ordering. */
export enum LongDateOrder {
  Invalid = -1,
  MDY = 0,
  DMY = 1,
  YMD = 2,
  YDM = 3,
}
/** Original scanCurrFormatImpl output positions in the full format code. */
interface CurrencyFormatPositions {
  sign: number;
  parenthesis: number;
  number: number;
  blank: number;
  symbol: number;
}
/** Original currency-code scan stops at an unbracketed section separator, observing escaped quotes and symbol blanks. @param code - Source format code. @param start - Full-code start offset. @param currencySymbol - Loaded default currency symbol. @returns Source positions. */
function scanCurrFormatImpl(code: string, start: number, currencySymbol: string): CurrencyFormatPositions {
  const result: CurrencyFormatPositions = { sign: -1, parenthesis: -1, number: -1, blank: -1, symbol: -1 };
  let section = 0,
    quote = false;
  for (let p = start; p < code.length; p++) {
    const char = code[p];
    if (quote) {
      if (char === '"' && code[p - 1] !== "\\") quote = false;
      continue;
    }
    switch (char) {
      case '"':
        if (p === 0 || code[p - 1] !== "\\") quote = true;
        break;
      case "-":
        if (!section && result.sign === -1) result.sign = p;
        break;
      case "(":
        if (!section && result.parenthesis === -1) result.parenthesis = p;
        break;
      case "0":
      case "#":
        if (!section && result.number === -1) result.number = p;
        break;
      case "[":
        section++;
        break;
      case "]":
        if (section) {
          section--;
          if (!section && result.blank === -1 && result.symbol !== -1 && p < code.length - 1 && code[p + 1] === " ")
            result.blank = p + 1;
        }
        break;
      case "$":
        if (result.symbol === -1 && section && code[p - 1] === "[") {
          result.symbol = p + 1;
          if (result.number !== -1 && code[p - 2] === " ") result.blank = p - 2;
        }
        break;
      case ";":
        if (!section) return result;
        break;
      default:
        if (!section && result.symbol === -1 && code.startsWith(currencySymbol, p)) {
          result.symbol = p;
          if (result.blank === -1 && p > 0 && code[p - 1] === " ") result.blank = p - 1;
          p += currencySymbol.length - 1;
          if (result.blank === -1 && p < code.length - 2 && code[p + 2] === " ")
            result.blank = p + 2;
        }
    }
  }
  return result;
}
/** Original loadCurrencyFormats medium/default selection and 0..15 symbol/sign placement classification. @param locale - Current native locale. @param symbol - Loaded default currency symbol. @returns Positive/negative layout indices. */
function loadCurrencyFormats(locale: LocaleConstReference, symbol: string): [number, number] {
  const formats = getLocaleFormatElements(locale).filter((row) => row.formatUsage === "CURRENCY");
  if (!formats.length) return [0, 0];
  let defaultIndex = -1,
    negativeIndex = -1,
    mediumIndex = -1;
  for (let index = 0; index < formats.length; index++) {
    const format = formats[index] as (typeof formats)[number];
    if (format.formatType === "medium") {
      if (format.isDefault) {
        defaultIndex = mediumIndex = index;
        if (format.formatCode.includes(";")) negativeIndex = index;
      } else {
        if ((negativeIndex === -1 || mediumIndex === -1) && format.formatCode.includes(";"))
          negativeIndex = index;
        if (mediumIndex === -1) mediumIndex = index;
      }
    } else {
      if (defaultIndex === -1 && format.isDefault) defaultIndex = index;
      if (negativeIndex === -1 && format.formatCode.includes(";")) negativeIndex = index;
    }
  }
  const positiveCode = (formats[defaultIndex >= 0 ? defaultIndex : negativeIndex >= 0 ? negativeIndex : 0] as (typeof formats)[number]).formatCode,
    positive = scanCurrFormatImpl(positiveCode, 0, symbol),
    positiveFormat = positive.blank === -1
      ? positive.symbol < positive.number ? 0 : 1
      : positive.symbol < positive.number ? 2 : 3;
  if (negativeIndex < 0) return [positiveFormat, 0];
  const negativeCode = (formats[negativeIndex] as (typeof formats)[number]).formatCode,
    negative = scanCurrFormatImpl(negativeCode, negativeCode.indexOf(";") + 1, symbol),
    { sign, parenthesis, number, blank, symbol: symbolPos } = negative;
  let negativeFormat: number;
  if (blank === -1) {
    if (symbolPos < number) {
      if (parenthesis > -1 && parenthesis < symbolPos) negativeFormat = 0;
      else if (sign > -1 && sign < symbolPos) negativeFormat = 1;
      else if (number < sign) negativeFormat = 3;
      else negativeFormat = 2;
    } else if (parenthesis > -1 && parenthesis < number) negativeFormat = 4;
    else if (sign > -1 && sign < number) negativeFormat = 5;
    else if (symbolPos < sign) negativeFormat = 7;
    else negativeFormat = 6;
  } else if (symbolPos < number) {
    if (parenthesis > -1 && parenthesis < symbolPos) negativeFormat = 14;
    else if (sign > -1 && sign < symbolPos) negativeFormat = 9;
    else if (number < sign) negativeFormat = 12;
    else negativeFormat = 11;
  } else if (parenthesis > -1 && parenthesis < number) negativeFormat = 15;
  else if (sign > -1 && sign < number) negativeFormat = 8;
  else if (symbolPos < sign) negativeFormat = 10;
  else negativeFormat = 13;
  return [positiveFormat, negativeFormat];
}
/** Source scanDateOrderImpl, including localized legacy date letters and equal missing-field positions. @param code - Native format code. @returns Long ordering. */
function scanDateOrderImpl(code: string): LongDateOrder {
  const find = (char: string): number => {
    const position = code.indexOf(char);
    return position < 0 ? Number.POSITIVE_INFINITY : position;
  };
  let day = find("D"),
    month = find("M"),
    year = find("Y");
  if (!Number.isFinite(day) || !Number.isFinite(month) || !Number.isFinite(year)) {
    if (!Number.isFinite(month)) {
      month = find("K");
      if (Number.isFinite(month)) {
        day = find("P");
        year = find("V");
      }
    } else if (!Number.isFinite(day)) {
      day = find("T");
      if (Number.isFinite(day)) year = find("J");
      else {
        year = find("A");
        if (Number.isFinite(year)) {
          day = find("J");
          if (!Number.isFinite(day)) day = find("G");
        }
      }
    } else {
      year = find("A");
      if (!Number.isFinite(year)) year = find("J");
    }
    if (!Number.isFinite(day)) day = code.length;
    if (!Number.isFinite(month)) month = code.length;
    if (!Number.isFinite(year)) year = code.length;
  }
  if (day <= month && month <= year) return LongDateOrder.DMY;
  if (month <= day && day <= year) return LongDateOrder.MDY;
  if (year <= month && month <= day) return LongDateOrder.YMD;
  if (year <= day && day <= month) return LongDateOrder.YDM;
  return LongDateOrder.DMY;
}
/** Source YDM fallback emits DMY when reducing to a short DateOrder. @param order - Long order. @returns Short order. */
function getDateOrderFromLongDateOrder(order: LongDateOrder): DateOrder {
  switch (order) {
    case LongDateOrder.YMD:
      return DateOrder.YMD;
    case LongDateOrder.MDY:
      return DateOrder.MDY;
    case LongDateOrder.DMY:
    case LongDateOrder.YDM:
    default:
      return DateOrder.DMY;
  }
}
/** Original loadDateOrders over the mapper's source-ordered DATE format sequence. @param locale - Prepared locale. @returns Short and long date orders. */
function loadDateOrders(locale: LocaleConstReference): [DateOrder, LongDateOrder] {
  const formats = getLocaleFormatElements(locale).filter((row) => row.formatUsage === "DATE");
  if (!formats.length) return [DateOrder.DMY, LongDateOrder.DMY];
  let edit = -1,
    defaultFormat = -1,
    medium = -1,
    long = -1;
  for (let index = 0; index < formats.length; index++) {
    const row = formats[index] as (typeof formats)[number];
    if (edit === -1 && row.formatIndex === 21) edit = index;
    if (defaultFormat === -1 && row.isDefault) defaultFormat = index;
    if (row.formatType === "medium") {
      if (row.isDefault) {
        defaultFormat = index;
        medium = index;
      } else if (medium === -1) medium = index;
    } else if (row.formatType === "long") {
      if (row.isDefault) long = index;
      else if (long === -1) long = index;
    }
  }
  if (edit === -1) {
    if (defaultFormat === -1) defaultFormat = medium !== -1 ? medium : long !== -1 ? long : 0;
    edit = defaultFormat;
  }
  const selected = formats[edit] as (typeof formats)[number],
    order = scanDateOrderImpl(selected.formatCode);
  if (selected.formatType === "long") return [getDateOrderFromLongDateOrder(order), order];
  return [
    getDateOrderFromLongDateOrder(order),
    long === -1 ? order : scanDateOrderImpl((formats[long] as (typeof formats)[number]).formatCode),
  ];
}
/** Original ASCII-insensitive mapping;all other field strings mean US. @param value - Measurement field. @returns Native measurement mode. */
export function mapMeasurementStringToEnum(value: string): MeasurementSystem {
  return value.length === 6 && /^[mM][eE][tT][rR][iI][cC]$/u.test(value)
    ? MeasurementSystem.Metric
    : MeasurementSystem.US;
}
/** Source field binding for the represented measurement query. @param locale - Actual prepared locale. @returns Native mode. */
export function getMeasurementSystemEnum(locale: LocaleConstReference): MeasurementSystem {
  return mapMeasurementStringToEnum(getLocaleMeasurementSystem(locale));
}

/** Original cached LocaleDataWrapper decimal field projected as an owned OUString for the consuming language-state owner. @param locale - Prepared original locale. @returns Owned field value. */
export function getNumDecimalSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleDecimalSeparator(locale));
}
/** Original cached alternate decimal field projection. @param locale - Prepared original locale. @returns Owned field value. */
export function getNumDecimalSepAlt(locale: LocaleConstReference): OUString {
  return unicode(getLocaleDecimalSeparatorAlternate(locale));
}
/** Original cached grouping separator field projection. @param locale - Prepared original locale. @returns Owned field value. */
export function getNumThousandSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleThousandSeparator(locale));
}
/** Original cached date separator field projection. @param locale - Prepared original locale. @returns Owned field value. */
export function getDateSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleDateSeparator(locale));
}
/** Original cached hundredth-second separator from the loaded locale item. @param locale - Prepared locale. @returns Owned field. */
export function getTime100SecSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleTime100SecSeparator(locale));
}
/** Original time separator from the loaded locale item. @param locale - Prepared locale. @returns Owned field. */
export function getTimeSep(locale: LocaleConstReference): OUString {
  return unicode(getLocaleTimeSeparator(locale));
}
/** Original cached AM token from the loaded locale item. @param locale - Prepared locale. @returns Owned field. */
export function getTimeAM(locale: LocaleConstReference): OUString {
  return unicode(getLocaleTimeAM(locale));
}
/** Original cached PM token from the loaded locale item. @param locale - Prepared locale. @returns Owned field. */
export function getTimePM(locale: LocaleConstReference): OUString {
  return unicode(getLocaleTimePM(locale));
}
/** Original TRUE_WORD reserved-word field. @param locale - Prepared locale. @returns Owned word. */
export function getTrueWord(locale: LocaleConstReference): OUString {
  return unicode(getLocaleTrueWord(locale));
}
/** Original FALSE_WORD reserved-word field. @param locale - Prepared locale. @returns Owned word. */
export function getFalseWord(locale: LocaleConstReference): OUString {
  return unicode(getLocaleFalseWord(locale));
}

/** Original cached numeric locale fields consumed by the number formatter's input path. */
export class LocaleDataWrapper {
  private readonly myLocale: Locale;
  /** Original installed locale service enumeration in native table order. @returns Caller-owned locales. */
  static getInstalledLocaleNames(): Locale[] {
    return getAllInstalledLocaleNames();
  }
  private readonly dateAcceptancePatterns: OUString[];
  private dateOrder: DateOrder;
  private longDateOrder: LongDateOrder;
  private readonly decimal: OUString;
  private readonly alternate: OUString;
  private readonly thousand: OUString;
  private readonly time100Sec: OUString;
  private readonly timeSep: OUString;
  private readonly timeAM: OUString;
  private readonly timePM: OUString;
  private readonly trueWord: OUString;
  private readonly falseWord: OUString;
  private readonly currSymbol: OUString;
  private readonly currBankSymbol: OUString;
  private readonly longDateDayOfWeekSep: OUString;
  private readonly longDateDaySep: OUString;
  private readonly longDateMonthSep: OUString;
  private currDigits: number;
  private currPositiveFormat: number;
  private currNegativeFormat: number;
  private readonly grouping: Sequence<[number]>;
  /** Loads the source LC_CTYPE numeric fields for the prepared locale. @param locale - Borrowed locale. */
  constructor(locale: LocaleConstReference) {
    this.myLocale = new Locale(locale);
    this.dateAcceptancePatterns = getLocaleDateAcceptancePatterns(locale).map(unicode);
    [this.dateOrder, this.longDateOrder] = loadDateOrders(locale);
    this.decimal = getNumDecimalSep(locale);
    this.alternate = getNumDecimalSepAlt(locale);
    this.thousand = getNumThousandSep(locale);
    this.time100Sec = getTime100SecSep(locale);
    this.timeSep = getTimeSep(locale);
    this.timeAM = getTimeAM(locale);
    this.timePM = getTimePM(locale);
    this.trueWord = getTrueWord(locale);
    this.falseWord = getFalseWord(locale);
    const longDate = getLocaleLongDateSeparators(locale);
    this.longDateDayOfWeekSep = unicode(longDate.dayOfWeek);
    this.longDateDaySep = unicode(longDate.day);
    this.longDateMonthSep = unicode(longDate.month);
    const currencies = getLocaleCurrencies(locale),
      currency = currencies.find((item) => item.default) ?? currencies[0];
    this.currSymbol = unicode(currency?.symbol ?? "ShellsAndPebbles");
    this.currBankSymbol = unicode(currency?.bankSymbol ?? "ShellsAndPebbles");
    this.currDigits = currency?.decimalPlaces ?? 2;
    [this.currPositiveFormat, this.currNegativeFormat] = loadCurrencyFormats(locale, currency?.symbol ?? "ShellsAndPebbles");
    this.grouping = loadDigitGrouping(locale);
  }
  /** Borrows the source decimal separator. @returns Decimal separator. */
  getNumDecimalSep(): OUString {
    return this.decimal;
  }
  /** Borrows the source alternate decimal separator. @returns Alternate separator. */
  getNumDecimalSepAlt(): OUString {
    return this.alternate;
  }
  /** Borrows the source grouping separator. @returns Grouping separator. */
  getNumThousandSep(): OUString {
    return this.thousand;
  }
  /** Borrows the original loaded country-specific digit-grouping sequence. @returns Grouping values. */
  getDigitGrouping(): Sequence<[number]> {
    return this.grouping;
  }
  /** Borrows the original hundredth-second separator. @returns Locale field. */
  getTime100SecSep(): OUString {
    return this.time100Sec;
  }
  /** Borrows the original time separator. @returns Current locale field. */
  getTimeSep(): OUString {
    return this.timeSep;
  }
  /** Borrows the original AM marker. @returns Locale field. */
  getTimeAM(): OUString {
    return this.timeAM;
  }
  /** Borrows the original PM marker. @returns Locale field. */
  getTimePM(): OUString {
    return this.timePM;
  }
  /** Borrows the locale's reserved TRUE_WORD. @returns Current word. */
  getTrueWord(): OUString {
    return this.trueWord;
  }
  /** Borrows the locale's reserved FALSE_WORD. @returns Current word. */
  getFalseWord(): OUString {
    return this.falseWord;
  }
  /** Original loaded default currency symbol, or ShellsAndPebbles for an empty locale section. @returns Borrowed symbol. */
  getCurrSymbol(): OUString {
    return this.currSymbol;
  }
  /** Original borrowed long-date day-of-week separator. @returns Current locale separator. */
  getLongDateDayOfWeekSep(): OUString { return this.longDateDayOfWeekSep; }
  /** Original borrowed long-date day separator. @returns Current locale separator. */
  getLongDateDaySep(): OUString { return this.longDateDaySep; }
  /** Original borrowed long-date month separator. @returns Current locale separator. */
  getLongDateMonthSep(): OUString { return this.longDateMonthSep; }
  /** Original getAllCurrencies delegation for this wrapper's current locale. @returns Independent Currency2 rows. */
  getAllCurrencies(): LocaleCurrency[] {
    return getLocaleCurrencies(this.myLocale);
  }
  /** Original loaded default bank currency symbol. @returns Borrowed bank symbol. */
  getCurrBankSymbol(): OUString {
    return this.currBankSymbol;
  }
  /** Original default currency decimal places. @returns Decimal digits. */
  getCurrDigits(): number {
    return this.currDigits;
  }
  /** Original default currency positive layout index. @returns Layout index 0..3. */
  getCurrPositiveFormat(): number {
    return this.currPositiveFormat;
  }
  /** Original default currency negative layout index. @returns Layout index 0..15. */
  getCurrNegativeFormat(): number {
    return this.currNegativeFormat;
  }
  /** Original unimplemented zero-character override. @returns ASCII zero. */
  getCurrZeroChar(): number {
    return 48;
  }
  /** Original borrowed cached date acceptance sequence, including generated edit-date patterns. @returns Wrapper-owned patterns. */
  getDateAcceptancePatterns(): readonly OUString[] {
    return this.dateAcceptancePatterns;
  }
  /** Original cached short date order. @returns DateOrder. */
  getDateOrder(): DateOrder {
    return this.dateOrder;
  }
  /** Original cached long date order. @returns LongDateOrder. */
  getLongDateOrder(): LongDateOrder {
    return this.longDateOrder;
  }
  /** Refreshes the original cached numeric fields when the language owner changes locale. @param locale - New prepared locale. @returns Nothing. */
  changeLocale(locale: LocaleConstReference): void {
    this.myLocale.assign(locale);
    const longDate = getLocaleLongDateSeparators(locale);
    const dayOfWeek = unicode(longDate.dayOfWeek), day = unicode(longDate.day), month = unicode(longDate.month);
    try {
      this.longDateDayOfWeekSep.assign(dayOfWeek);
      this.longDateDaySep.assign(day);
      this.longDateMonthSep.assign(month);
    } finally { month.dispose(); day.dispose(); dayOfWeek.dispose(); }
    const patterns = getLocaleDateAcceptancePatterns(locale).map(unicode);
    for (const pattern of this.dateAcceptancePatterns) pattern.dispose();
    this.dateAcceptancePatterns.splice(0, this.dateAcceptancePatterns.length, ...patterns);
    [this.dateOrder, this.longDateOrder] = loadDateOrders(locale);
    const currencies = getLocaleCurrencies(locale),
      currency = currencies.find((item) => item.default) ?? currencies[0];
    this.currDigits = currency?.decimalPlaces ?? 2;
    [this.currPositiveFormat, this.currNegativeFormat] = loadCurrencyFormats(locale, currency?.symbol ?? "ShellsAndPebbles");
    const decimal = getNumDecimalSep(locale),
      alternate = getNumDecimalSepAlt(locale),
      thousand = getNumThousandSep(locale),
      time100Sec = getTime100SecSep(locale),
      timeSep = getTimeSep(locale),
      timeAM = getTimeAM(locale),
      timePM = getTimePM(locale),
      trueWord = getTrueWord(locale),
      falseWord = getFalseWord(locale);
    const symbol = unicode(currency?.symbol ?? "ShellsAndPebbles"),
      bankSymbol = unicode(currency?.bankSymbol ?? "ShellsAndPebbles");
    try {
      this.decimal.assign(decimal);
      this.alternate.assign(alternate);
      this.thousand.assign(thousand);
      this.time100Sec.assign(time100Sec);
      this.timeSep.assign(timeSep);
      this.timeAM.assign(timeAM);
      this.timePM.assign(timePM);
      this.trueWord.assign(trueWord);
      this.falseWord.assign(falseWord);
      this.currSymbol.assign(symbol);
      this.currBankSymbol.assign(bankSymbol);
      const grouping = loadDigitGrouping(locale);
      try {
        this.grouping.assign(grouping);
      } finally {
        grouping.dispose();
      }
    } finally {
      bankSymbol.dispose();
      symbol.dispose();
      falseWord.dispose();
      trueWord.dispose();
      timePM.dispose();
      timeAM.dispose();
      time100Sec.dispose();
      timeSep.dispose();
      thousand.dispose();
      alternate.dispose();
      decimal.dispose();
    }
  }
  /** Releases the owned source locale fields. @returns Nothing. */
  dispose(): void {
    this.myLocale.dispose();
    this.longDateMonthSep.dispose();
    this.longDateDaySep.dispose();
    this.longDateDayOfWeekSep.dispose();
    for (const pattern of this.dateAcceptancePatterns) pattern.dispose();
    this.thousand.dispose();
    this.timePM.dispose();
    this.falseWord.dispose();
    this.currBankSymbol.dispose();
    this.currSymbol.dispose();
    this.trueWord.dispose();
    this.timeAM.dispose();
    this.time100Sec.dispose();
    this.timeSep.dispose();
    this.grouping.dispose();
    this.alternate.dispose();
    this.decimal.dispose();
  }
}
/** Original getLoadedLanguageTag consumes this actual LC_INFO Locale before LanguageTag construction. This binding projects only those consumed Locale fields;no LanguageTag service or canonicalization is fabricated. @param locale - Requested original locale. @returns Owned actual loaded Locale. */
export function getLoadedLocale(locale: LocaleConstReference): Locale {
  const info = getLocaleLanguageCountryInfo(locale),
    language = unicode(info.Language),
    country = unicode(info.Country),
    variant = unicode(info.Variant);
  try {
    return new Locale(language, country, variant);
  } finally {
    variant.dispose();
    country.dispose();
    language.dispose();
  }
}

/** Field-specific binding of the original NumberFormatMapper::create component-context lookup to its actual native provider. It creates an owned real mapper,not a fake context/service manager or alternate format data. Native UNO interface/reference ABI remains unrepresented. @returns Owned provider;the consumer destroys it after its actual borrowed clients. */
export function createNumberFormatCodeMapper(): NumberFormatCodeMapper {
  return new NumberFormatCodeMapper();
}
