/** @fileoverview Original ImpSvNumberInputScan state, locale invalidation and input-date ownership from zforfind.cxx; public input recognition, calendar date conversion and result dispatch operate on the original owner. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Date as ToolsDate } from "../../../tools/source/datetime/tdate";
import {
  DateOrder,
  LongDateOrder,
  type LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { TransformInput } from "./zforfind.context";
import { CheckScannedNumber, ConvertScannedNumber } from "./zforfind.scan-value";
import { SvNumFormatType } from "../../inc/zforlist";
import { SV_MAX_COUNT_INPUT_STRINGS } from "./zforfind.context";
import {
  CanForceToIso8601,
  GetDateOrder,
  GetDatePatternNumbers,
  GetDatePatternOrder,
  GetDayOfWeek,
  GetDecSep,
  GetESign,
  GetLogical,
  GetMiddleMonthLongDateOrder,
  GetNextNumber,
  GetSign,
  GetThousandSep,
  GetTime100SecSep,
  GetTimeAmPm,
  GetTimeRef,
  ImplGetDay,
  ImplGetMonth,
  ImplGetYear,
  IsAcceptableIso8601,
  IsAcceptedDatePattern,
  IsDatePatternNumberOfType,
  MatchedReturn,
  MayBeIso8601,
  MayBeMonthDate,
  SkipBlanks,
  SkipChar,
  SkipDatePatternSeparator,
  SkipString,
} from "./zforfind.scan-date";
import { GetDateRef } from "./zforfind.scan-date-value";
import { IsNumberFormatMain, ScanEndString, ScanMidString } from "./zforfind.scan-numeric";
import {
  GetCurrency,
  GetMonth,
  InitText,
  NextNumberStringSymbol,
  NumberStringDivision,
  ScanStartString,
  ScanStringNumFor,
  SkipThousands,
  StringContains,
  StringContainsImpl,
  StringContainsWord,
  StringPtrContains,
  StringPtrContainsImpl,
} from "./zforfind.scan-start";
import type { SvNFLanguageData } from "./zforlist";
import { getYear2000Default } from "./zforlist.defaults";
import { type SvNumberformatConstReference } from "./zformat";

/** Native input scanner owned by the current-language state. Its format recognition stages remain in this source owner. */
export class ImpSvNumberInputScan {
  /** Native friend-visible state grouped without creating a second locale or date service. */
  readonly fields = {
    mpFormat: null as SvNumberformatConstReference | null,
    maNullDate: new ToolsDate(30, 12, 1899),
    bTextInitialized: false,
    bScanGenitiveMonths: false,
    bScanPartitiveMonths: false,
    pUpperMonthText: [] as OUString[],
    pUpperAbbrevMonthText: [] as OUString[],
    pUpperGenitiveMonthText: [] as OUString[],
    pUpperGenitiveAbbrevMonthText: [] as OUString[],
    pUpperPartitiveMonthText: [] as OUString[],
    pUpperPartitiveAbbrevMonthText: [] as OUString[],
    pUpperDayText: [] as OUString[],
    pUpperAbbrevDayText: [] as OUString[],
    sStrArray: Array.from(
      { length: SV_MAX_COUNT_INPUT_STRINGS },
      /** Computes the callback result. @returns The computed result. */ () => new OUString(),
    ),
    IsNum: Array.from(
      { length: SV_MAX_COUNT_INPUT_STRINGS },
      /** Computes the callback result. @returns The computed result. */ () => false,
    ),
    nNums: Array.from(
      { length: SV_MAX_COUNT_INPUT_STRINGS },
      /** Computes the callback result. @returns The computed result. */ () => 0,
    ),
    bDecSepInDateSeps: false,
    nMatchedAllStrings: 0,
    nSign: 0,
    nMonth: 0,
    nMonthPos: 0,
    nDayOfWeek: 0,
    nTimePos: 0,
    nDecPos: 0,
    bNegCheck: false,
    nESign: 0,
    nAmPm: 0,
    nLogical: 0,
    mbEraCE: true,
    nThousand: 0,
    nPosThousandString: 0,
    eScannedType: SvNumFormatType.UNDEFINED as number,
    eSetType: SvNumFormatType.UNDEFINED as number,
    nStringScanNumFor: 0,
    nStringScanSign: 0,
    nYear2000: getYear2000Default(),
    nMayBeIso8601: 0,
    bIso8601Tsep: false,
    nMayBeMonthDate: 0,
    nAcceptedDatePattern: -2,
    nDatePatternStart: 0,
    nDatePatternNumbers: 0,
    nStringsCnt: 0,
    nNumericsCnt: 0,
    aUpperCurrSymbol: new OUString(),
    sDateAcceptancePatterns: [] as OUString[],
  };
  /** Original constructor stores language identity, then resets parse state and locale-dependent caches. @param language - Borrowed current-language owner.  @returns Constructed instance. */
  constructor(protected readonly language: SvNFLanguageData) {
    this.Reset();
    this.ChangeIntl();
  }
  /** Original provisional-result reset keeps the language, null date and year threshold. @returns Nothing. */
  protected Reset(): void {
    const state = this.fields;
    state.mpFormat = null;
    state.nMonth = 0;
    state.nMonthPos = 0;
    state.nDayOfWeek = 0;
    state.nTimePos = 0;
    state.nSign = 0;
    state.nESign = 0;
    state.nDecPos = 0;
    state.bNegCheck = false;
    state.nStringsCnt = 0;
    state.nNumericsCnt = 0;
    state.nThousand = 0;
    state.eScannedType = SvNumFormatType.UNDEFINED;
    state.nAmPm = 0;
    state.nPosThousandString = 0;
    state.nLogical = 0;
    state.mbEraCE = true;
    state.nStringScanNumFor = 0;
    state.nStringScanSign = 0;
    state.nMatchedAllStrings = 0x08;
    state.nMayBeIso8601 = 0;
    state.bIso8601Tsep = false;
    state.nMayBeMonthDate = 0;
    state.nAcceptedDatePattern = -2;
    state.nDatePatternStart = 0;
    state.nDatePatternNumbers = 0;
    state.IsNum.fill(false);
    state.nNums.fill(0);
  }
  /** Original alternating ASCII-digit/non-digit scanner over the NUL-terminated UTF-16 buffer. @param input - Input string. @param position - Mutable source cursor. @param symbol - Output fragment. @returns Whether the fragment starts with a digit. */
  protected NextNumberStringSymbol(input: OUString, position: [number], symbol: OUString): boolean {
    return NextNumberStringSymbol.call(this, input, position, symbol);
  }
  /** Original near-capacity grouping relief; consumes only complete three-digit groups after the locale separator. @param input - Input string. @param position - Mutable source cursor. @param symbol - Current numeric fragment. @returns Whether a complete group was found. */
  protected SkipThousands(input: OUString, position: [number], symbol: OUString): boolean {
    return SkipThousands.call(this, input, position, symbol);
  }
  /** Original twenty-slot number/string division, including source pointer behavior at embedded NUL. @param input - Uppercase/native-number-transformed input. @returns Nothing. */
  protected NumberStringDivision(input: OUString): void {
    return NumberStringDivision.call(this, input);
  }
  /** Source one-character fast path before bounded substring comparison. @param what - Needle. @param value - Haystack. @param position - UTF-16 offset. @returns Match. */
  protected StringContains(
    what: OUStringConstReference,
    value: OUString,
    position: number,
  ): boolean {
    return StringContains.call(this, what, value, position);
  }
  /** Source pointer fast path; caller supplies a valid starting offset. @param what - Needle. @param units - NUL-terminated haystack. @param position - UTF-16 offset. @returns Match. */
  protected StringPtrContains(
    what: OUStringConstReference,
    units: Uint16Array,
    position: number,
  ): boolean {
    return StringPtrContains.call(this, what, units, position);
  }
  /** Source bounded OUString substring comparison. @param what - Needle. @param value - Haystack. @param position - UTF-16 offset. @returns Match. */
  protected StringContainsImpl(
    what: OUStringConstReference,
    value: OUString,
    position: number,
  ): boolean {
    return StringContainsImpl.call(this, what, value, position);
  }
  /** Source pointer comparison returns false for an empty needle. @param what - Needle. @param units - Haystack. @param position - UTF-16 offset. @returns Match. */
  protected StringPtrContainsImpl(
    what: OUStringConstReference,
    units: Uint16Array,
    position: number,
  ): boolean {
    return StringPtrContainsImpl.call(this, what, units, position);
  }
  /** Source date-word boundary: ASCII separators, then surrogate and KCharacterType handling. @param what - Word. @param value - Input. @param position - UTF-16 offset. @returns Whether the complete word matches. */
  protected StringContainsWord(what: OUString, value: OUString, position: number): boolean {
    return StringContainsWord.call(this, what, value, position);
  }
  /** Original InitText replaces cached uppercase calendar names in the source's section order. @returns Nothing. */
  protected InitText(): void {
    return InitText.call(this);
  }
  /** Original calendar-name lookup: full names precede abbreviated names, including source German and September alternatives. @param value - Uppercase input. @param position - Mutable cursor. @returns One-based month, negative when abbreviated, or zero. */
  protected GetMonth(value: OUString, position: [number]): number {
    return GetMonth.call(this, value, position);
  }
  /** Original active-locale currency match followed by explicit format-symbol match, caching only the uppercased locale symbol. @param value - Already uppercased input. @param position - Mutable UTF-16 offset. @returns Symbol matched. */
  protected GetCurrency(value: OUString, position: [number]): boolean {
    return GetCurrency.call(this, value, position);
  }
  /** Source literal-token comparison across numeric subformats and a remaining input suffix. @param input - Already prepared input. @param position - Consumed prefix width. @param token - Token offset or 0xffff for last. @param dontDetectNegation - Suppress sign detection. @returns Whether a format literal matched. */
  protected ScanStringNumFor(
    input: OUString,
    position: number,
    token: number,
    dontDetectNegation = false,
  ): boolean {
    return ScanStringNumFor.call(this, input, position, token, dontDetectNegation);
  }
  /** Source leading fragment classification: sign, decimal, currency, month/day names and compiled-format literal. @param value - Already uppercased start fragment. @returns Whether accepted. */
  protected ScanStartString(value: OUString): boolean {
    return ScanStartString.call(this, value);
  }
  /** Source middle-fragment classification across decimals, fraction/grouping, date/time and compiled-format literals. @param value - Already uppercased fragment. @param stringPosition - Fragment index. @param numericCount - Numbers seen through this fragment. @returns Whether accepted. */
  protected ScanMidString(value: OUString, stringPosition: number, numericCount: number): boolean {
    return ScanMidString.call(this, value, stringPosition, numericCount);
  }
  /** Source trailing fragment classification, including postfixed signs, date/time separators and format-token fallback. @param value - Already uppercased end fragment. @returns Whether all source characters were consumed. */
  protected ScanEndString(value: OUString): boolean {
    return ScanEndString.call(this, value);
  }
  /** Source fragment dispatch and final compiled-format reconciliation before numeric conversion. @param value - Already uppercased input. @param format - Optional compiled format to match. @returns Whether the input has a numeric or logical shape. */
  protected IsNumberFormatMain(
    value: OUString,
    format: SvNumberformatConstReference | null,
  ): boolean {
    return IsNumberFormatMain.call(this, value, format);
  }
  /** Original weekday-name lookup checks full then abbreviated name in calendar order. @param value - Uppercase input. @param position - Mutable cursor. @returns One-based day, negative when abbreviated, or zero. */
  protected GetDayOfWeek(value: OUString, position: [number]): number {
    return GetDayOfWeek.call(this, value, position);
  }
  /** Source single-character skip. @param code - Expected UTF-16 code unit. @param value - Input. @param position - Mutable cursor. @returns Match. */
  protected SkipChar(code: number, value: OUString, position: [number]): boolean {
    return SkipChar.call(this, code, value, position);
  }
  /** Source ASCII, no-break and narrow-no-break blank skip. @param value - Input. @param position - Mutable cursor. @returns Whether any blank was consumed. */
  protected SkipBlanks(value: OUString, position: [number]): boolean {
    return SkipBlanks.call(this, value, position);
  }
  /** Source substring skip through StringContains. @param what - Expected text. @param value - Input. @param position - Mutable cursor. @returns Match. */
  protected SkipString(what: OUStringConstReference, value: OUString, position: [number]): boolean {
    return SkipString.call(this, what, value, position);
  }
  /** Original decimal-separator lookup tries the current locale separator before its nonempty alternate. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Whether a separator was consumed. */
  protected GetDecSep(value: OUString, position: [number]): boolean {
    return GetDecSep.call(this, value, position);
  }
  /** Original AM/PM recognition compares uppercase locale tokens against the already-uppercase scan input. @param value - Uppercase input. @param position - Mutable UTF-16 cursor. @returns Whether a marker was consumed. */
  protected GetTimeAmPm(value: OUString, position: [number]): boolean {
    return GetTimeAmPm.call(this, value, position);
  }
  /** Original fractional-second separator accepts ISO dot/comma first, then the loaded locale item. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Whether a separator was consumed. */
  protected GetTime100SecSep(value: OUString, position: [number]): boolean {
    return GetTime100SecSep.call(this, value, position);
  }
  /** Original time-part conversion: HH:MM:SS.fraction, MM:SS when the compiled format says so, duration and leap-second validation. The output is assigned even when validation fails. @param output - Mutable serial-day fraction. @param firstIndex - First numeric part. @param count - Number of parts. @param inputOptions - Native SvNumInputOptions flags. @returns Whether the time fields are accepted. */
  protected GetTimeRef(
    output: [number],
    firstIndex: number,
    count: number,
    inputOptions: number,
  ): boolean {
    return GetTimeRef.call(this, output, firstIndex, count, inputOptions);
  }
  /** Original IsNumberFormat public orchestration, input-length boundary, uppercase/native-number conversion and final failure outputs. @param value - Source input. @param type - Old/new category. @param output - Numeric result. @param format - Optional compiled format. @param nativeNumber - Original native-number wrapper. @param inputOptions - Source flags. @returns Whether the input converts. */
  IsNumberFormat(
    value: OUStringConstReference,
    type: [number],
    output: [number],
    format: SvNumberformatConstReference | null,
    nativeNumber: NativeNumberWrapper,
    inputOptions = 0,
  ): boolean {
    this.fields.eSetType = type[0];
    let result = false;
    if (value.getLength() !== 0 && value.getLength() <= 308) {
      const upper = this.language.GetCharClass().uppercase(value);
      try {
        TransformInput(nativeNumber, this.language, upper);
        result = this.IsNumberFormatMain(upper, format);
      } finally {
        upper.dispose();
      }
    }
    if (result) result = CheckScannedNumber.call(this);
    if (result) return ConvertScannedNumber.call(this, type, output, inputOptions);
    this.fields.eScannedType = SvNumFormatType.TEXT;
    output[0] = 0;
    type[0] = this.fields.eScannedType;
    return false;
  }
  /** Original date conversion through the calendar service. @param output - Serial days. @param count - Consumed numeric parts. @returns Whether the source date is valid. */
  protected GetDateRef(output: [number], count: [number]): boolean {
    return GetDateRef.call(this, output, count);
  }
  /** Original leading-sign scan accepts plus, ASCII and Unicode minus, and an opening negative parenthesis. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Signed source indicator. */
  protected GetSign(value: OUString, position: [number]): number {
    return GetSign.call(this, value, position);
  }
  /** Original exponent-sign scan accepts only ASCII plus and minus. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Signed source indicator. */
  protected GetESign(value: OUString, position: [number]): number {
    return GetESign.call(this, value, position);
  }
  /** Original numeric-fragment step advances both counters only when the current slot is numeric. @param index - Mutable fragment slot. @param count - Mutable numeric count. @returns Whether a numeric slot was consumed. */
  protected GetNextNumber(index: [number], count: [number]): boolean {
    return GetNextNumber.call(this, index, count);
  }
  /** Source grouping separator accepts the current or following group width, including the near-capacity merged slot. @param value - Nonnumeric fragment. @param position - Mutable UTF-16 cursor. @param fragment - Fragment index. @returns Whether the grouping separator was consumed. */
  protected GetThousandSep(value: OUString, position: [number], fragment: number): boolean {
    return GetThousandSep.call(this, value, position, fragment);
  }
  /** Original logical scanner compares the whole uppercase input against the format scanner's localized TRUE/FALSE keywords. @param value - Uppercase input. @returns 1 for true, -1 for false, zero otherwise. */
  protected GetLogical(value: OUString): number {
    return GetLogical.call(this, value);
  }
  /** Original day fragment accepts up to two digits and values through 31, including zero. @param numberIndex - Numeric-fragment index. @returns Day or zero. */
  protected ImplGetDay(numberIndex: number): number {
    return ImplGetDay.call(this, numberIndex);
  }
  /** Original numeric month conversion returns the calendar's month count as its invalid sentinel. @param numberIndex - Numeric-fragment index. @returns Zero-based month or invalid sentinel. */
  protected ImplGetMonth(numberIndex: number): number {
    return ImplGetMonth.call(this, numberIndex);
  }
  /** Original year fragment limits width, truncates to uint16 and expands short CE years through the scanner threshold. @param numberIndex - Numeric-fragment index. @returns Year or zero. */
  protected ImplGetYear(numberIndex: number): number {
    return ImplGetYear.call(this, numberIndex);
  }
  /** Original cached shape check for three numeric ISO year-month-day fragments. @returns Whether the shape may be ISO 8601. */
  protected MayBeIso8601(): boolean {
    return MayBeIso8601.call(this);
  }
  /** Original cached day-month-year versus year-month-day shape decision for a named month. @returns Whether either source order is possible. */
  protected MayBeMonthDate(): boolean {
    return MayBeMonthDate.call(this);
  }
  /** Original ordered date-pattern matching, including generated locale patterns, signed years, decimal ambiguity and trailing blanks. @param startPatternAt - First input particle. @returns Whether a native acceptance pattern matched. */
  protected IsAcceptedDatePattern(startPatternAt: number): boolean {
    return IsAcceptedDatePattern.call(this, startPatternAt);
  }
  /** Original pattern-separator query, including signed years and the source's set-not-add cursor result. @param particle - Input fragment index. @param position - Mutable fragment cursor. @param signedYear - Mutable signed-year flag. @returns Whether this separator belongs to the accepted pattern. */
  protected SkipDatePatternSeparator(
    particle: number,
    position: [number],
    signedYear: [boolean],
  ): boolean {
    return SkipDatePatternSeparator.call(this, particle, position, signedYear);
  }
  /** Original accepted-pattern numeric count; initializes the pattern cache on first query. @returns Number of D/M/Y particles. */
  protected GetDatePatternNumbers(): number {
    return GetDatePatternNumbers.call(this);
  }
  /** Original ordinal D/M/Y type lookup in the matched pattern. @param number - Zero-based numeric particle. @param type - Source D, M or Y. @returns Type match. */
  protected IsDatePatternNumberOfType(number: number, type: string): boolean {
    return IsDatePatternNumberOfType.call(this, number, type);
  }
  /** Original packed first-three D/M/Y order bytes of the accepted pattern. @returns Packed order, or zero. */
  protected GetDatePatternOrder(): number {
    return GetDatePatternOrder.call(this);
  }
  /** Original accepted-pattern order selection, with format and locale fallbacks. @param fromFormatIfNoPattern - Prefer a compiled format without a pattern. @returns DateOrder. */
  protected GetDateOrder(fromFormatIfNoPattern = false): DateOrder {
    return GetDateOrder.call(this, fromFormatIfNoPattern);
  }
  /** Original middle-month ordering prefers the named-month shape, then exact format or locale order, with day-validity switches. @param formatTurn - Whether the compiled format's exact order applies. @param locale - Current locale data. @param dateOrder - Evaluated short order. @returns Long date order. */
  protected GetMiddleMonthLongDateOrder(
    formatTurn: boolean,
    locale: LocaleDataWrapper,
    dateOrder: DateOrder,
  ): LongDateOrder {
    return GetMiddleMonthLongDateOrder.call(this, formatTurn, locale, dateOrder);
  }
  /** Original ISO override decision for the cached three-part numeric date shape. @param order - Evaluated date order or Invalid. @returns Whether ISO order is forced. */
  CanForceToIso8601(order: DateOrder): boolean {
    return CanForceToIso8601.call(this, order);
  }
  /** Original format/date-evaluation policy for an ISO candidate. @returns Whether the ISO candidate is acceptable. */
  protected IsAcceptableIso8601(): boolean {
    return IsAcceptableIso8601.call(this);
  }
  /** Original matched-string return marker clears only the virgin bit from its acceptance check. @returns Whether any substantive match was recorded. */
  protected MatchedReturn(): boolean {
    return MatchedReturn.call(this);
  }
  /** Original locale-change invalidation after the language owner's cached separators have changed. @returns Nothing. */
  ChangeIntl(): void {
    const decimal = this.language.GetNumDecimalSep().getStr()[0],
      alternate = this.language.GetNumDecimalSepAlt(),
      date = this.language.GetDateSep().getStr()[0],
      altChar = alternate.getLength() === 1 ? alternate.getStr()[0] : 0;
    this.fields.bDecSepInDateSeps = decimal === 45 || decimal === date;
    if (!this.fields.bDecSepInDateSeps)
      this.fields.bDecSepInDateSeps = Boolean(altChar && (altChar === 45 || altChar === date));
    this.fields.bTextInitialized = false;
    this.fields.aUpperCurrSymbol.clear();
    this.InvalidateDateAcceptancePatterns();
  }
  /** Original date-pattern cache invalidation leaves an already-empty cache untouched. @returns Nothing. */
  InvalidateDateAcceptancePatterns(): void {
    for (const value of this.fields.sDateAcceptancePatterns) value.dispose();
    this.fields.sDateAcceptancePatterns = [];
  }
  /** Original input-scanner null date retains raw DMY packing independently from the format scanner's normalized date. @param day - Day. @param month - Month. @param year - Year. @returns Nothing. */
  ChangeNullDate(day: number, month: number, year: number): void {
    this.fields.maNullDate.assign(new ToolsDate(day, month, year));
  }
  /** Original two-digit-year threshold assignment. @param year - Native unsigned16 value. @returns Nothing. */
  SetYear2000(year: number): void {
    this.fields.nYear2000 = year & 65535;
  }
  /** Original two-digit-year threshold query. @returns Year threshold. */
  GetYear2000(): number {
    return this.fields.nYear2000;
  }
  /** Original ISO8601 literal T-separator flag. @returns Actual recognition flag. */
  HasIso8601Tsep(): boolean {
    return this.fields.bIso8601Tsep;
  }
  /** Original public provisional decimal-fragment position query. @returns One-based position. */
  GetDecPos(): number {
    return this.fields.nDecPos;
  }
  /** Original public provisional numeric-fragment count query. @returns Count. */
  GetNumericsCount(): number {
    return this.fields.nNumericsCnt;
  }
  /** Releases scanner-owned strings after the language owner stops using the scanner. @returns Nothing. */
  dispose(): void {
    this.InvalidateDateAcceptancePatterns();
    this.fields.aUpperCurrSymbol.dispose();
    for (const names of [
      this.fields.pUpperMonthText,
      this.fields.pUpperAbbrevMonthText,
      this.fields.pUpperGenitiveMonthText,
      this.fields.pUpperGenitiveAbbrevMonthText,
      this.fields.pUpperPartitiveMonthText,
      this.fields.pUpperPartitiveAbbrevMonthText,
      this.fields.pUpperDayText,
      this.fields.pUpperAbbrevDayText,
    ])
      for (const name of names) name.dispose();
    for (const value of this.fields.sStrArray) value.dispose();
  }
}

export { SV_MAX_COUNT_INPUT_STRINGS, TransformInput } from "./zforfind.context";
