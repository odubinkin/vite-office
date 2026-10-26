/** @fileoverview Original ImpSvNumberInputScan state, locale invalidation and input-date ownership from zforfind.cxx; number classification remains an unported source boundary. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Date as ToolsDate } from "../../../tools/source/datetime/tdate";
import { NfEvalDateFormat, SvNumFormatType, SvNumInputOptions } from "../../inc/zforlist";
import { getYear2000Default } from "./zforlist.defaults";
import type { SvNFLanguageData } from "./zforlist";
import * as KCharacterType from "../../../offapi/com/sun/star/i18n/KCharacterType";
import { DigitGroupingIterator } from "../../../unotools/inc/digitgroupingiterator";
import { toInt32 } from "../../../o3tl/inc/string_view";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat, type SvNumberformatConstReference } from "./zformat";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { CalendarItem2Names } from "../../../unotools/source/i18n/calendarwrapper";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import { DateOrder, LongDateOrder, type LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";

/** Source TransformInput scans UTF-16 units and calls NATNUM0 only after the first non-ASCII digit. */
export function TransformInput(
  nativeNumber: NativeNumberWrapper,
  language: SvNFLanguageData,
  value: OUString,
): void {
  let position = 0;
  for (; position < value.getLength(); position++) {
    if ((value.getStr()[position] as number) >= 256 && language.GetCharClass().isDigit(value, position))
      break;
  }
  if (position < value.getLength()) {
    const result = nativeNumber.getNativeNumberString(value, language.fields.locale, 0);
    try { value.assign(result); }
    finally { result.dispose(); }
  }
}

/** Source lcl_IsSignedYearSep: only a trailing minus immediately before pattern Y is accepted. @param fragment - Input separator. @param pattern - Acceptance pattern. @param position - Pattern offset. @returns Signed-year separator match. */
function lcl_IsSignedYearSep(fragment: string, pattern: string, position: number): boolean {
  const length = fragment.length - 1;
  return (
    fragment.length > 1 &&
    fragment[fragment.length - 1] === "-" &&
    position + length < pattern.length &&
    pattern[position + length] === "Y" &&
    pattern.indexOf(fragment.slice(0, length), position) === position
  );
}

/** Source lcl_getPatternSeparatorLength counts all non-D/M/Y code units. @param pattern - Acceptance pattern. @param position - Pattern offset. @returns Separator width. */
function lcl_getPatternSeparatorLength(pattern: string, position: number): number {
  let end = position;
  while (end < pattern.length && !"DMY".includes(pattern[end] as string)) end++;
  return end - position;
}

/** Source lcl_isBlanks accepts only nonempty strings of ASCII spaces. @param value - Fragment. @returns Source blank status. */
function lcl_isBlanks(value: OUStringConstReference): boolean {
  if (value.isEmpty()) return false;
  const units = value.getStr();
  for (let index = value.getLength(); index-- > 0;)
    if (units[index] !== 32) return false;
  return true;
}

/** zforfind.hxx fixed capacity for the input scanner's alternating fragments. */
export const SV_MAX_COUNT_INPUT_STRINGS = 20;

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
    sStrArray: Array.from({ length: SV_MAX_COUNT_INPUT_STRINGS }, () => new OUString()),
    IsNum: Array.from({ length: SV_MAX_COUNT_INPUT_STRINGS }, () => false),
    nNums: Array.from({ length: SV_MAX_COUNT_INPUT_STRINGS }, () => 0),
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
  /** Original constructor stores language identity, then resets parse state and locale-dependent caches. @param language - Borrowed current-language owner. */
  constructor(private readonly language: SvNFLanguageData) {
    this.Reset();
    this.ChangeIntl();
  }
  /** Original provisional-result reset keeps the language, null date and year threshold. @returns Nothing. */
  private Reset(): void {
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
  private NextNumberStringSymbol(input: OUString, position: [number], symbol: OUString): boolean {
    const units = input.getStr();
    const start = position[0];
    let here = start;
    let count = 0;
    let state = 1; // SsStart
    let number = false;
    while (true) {
      const token = units[here] ?? 0;
      if (token === 0 || state === 0) break;
      here++;
      const digit = token >= 48 && token <= 57;
      if (state === 1) {
        state = digit ? 2 : 3;
        number = digit;
        count++;
      } else if ((state === 2 && digit) || (state === 3 && !digit)) {
        count++;
      } else {
        state = 0;
        here--;
      }
    }
    if (count) {
      const fragment = new OUString(units.subarray(start, start + count), count);
      try {
        symbol.assign(fragment);
      } finally {
        fragment.dispose();
      }
    } else symbol.clear();
    position[0] = here;
    return number;
  }
  /** Original near-capacity grouping relief; consumes only complete three-digit groups after the locale separator. @param input - Input string. @param position - Mutable source cursor. @param symbol - Current numeric fragment. @returns Whether a complete group was found. */
  private SkipThousands(input: OUString, position: [number], symbol: OUString): boolean {
    const units = input.getStr();
    const separator = this.language.GetNumThousandSep();
    const sepLength = separator.getLength();
    const buffer = Array.from(symbol.getStr().subarray(0, symbol.getLength()));
    let here = position[0];
    let state = 1; // SsStart
    let counter = 0;
    let found = false;
    while (true) {
      const token = units[here] ?? 0;
      if (token === 0 || state === 0) break;
      here++;
      if (state === 1) {
        const match = this.StringPtrContains(separator, units, here - 1);
        if (match) {
          counter = 0;
          state = 2; // SsGetValue
          here += sepLength - 1;
        } else {
          state = 0;
          here--;
        }
      } else if (token >= 48 && token <= 57) {
        buffer.push(token);
        counter++;
        if (counter === 3) {
          state = 1;
          found = true;
        }
      } else {
        state = 0;
        here--;
      }
    }
    if (state === 2) {
      if (counter) buffer.length -= counter;
      here -= counter + sepLength;
    }
    const fragment = new OUString(Uint16Array.from(buffer), buffer.length);
    try {
      symbol.assign(fragment);
    } finally {
      fragment.dispose();
    }
    position[0] = here;
    return found;
  }
  /** Original twenty-slot number/string division, including source pointer behavior at embedded NUL. @param input - Uppercase/native-number-transformed input. @returns Nothing. */
  protected NumberStringDivision(input: OUString): void {
    const position: [number] = [0];
    const state = this.fields;
    while (position[0] < input.getLength() && state.nStringsCnt < SV_MAX_COUNT_INPUT_STRINGS) {
      const slot = state.nStringsCnt;
      if (this.NextNumberStringSymbol(input, position, state.sStrArray[slot] as OUString)) {
        state.IsNum[slot] = true;
        state.nNums[state.nNumericsCnt] = slot;
        state.nNumericsCnt++;
        if (slot >= SV_MAX_COUNT_INPUT_STRINGS - 7 && state.nPosThousandString === 0)
          if (this.SkipThousands(input, position, state.sStrArray[slot] as OUString))
            state.nPosThousandString = slot;
      } else state.IsNum[slot] = false;
      state.nStringsCnt++;
    }
  }
  /** Source one-character fast path before bounded substring comparison. @param what - Needle. @param value - Haystack. @param position - UTF-16 offset. @returns Match. */
  protected StringContains(
    what: OUStringConstReference,
    value: OUString,
    position: number,
  ): boolean {
    if (what.isEmpty() || value.getLength() <= position) return false;
    if (what.getStr()[0] !== value.getStr()[position]) return false;
    return this.StringContainsImpl(what, value, position);
  }
  /** Source pointer fast path; caller supplies a valid starting offset. @param what - Needle. @param units - NUL-terminated haystack. @param position - UTF-16 offset. @returns Match. */
  private StringPtrContains(
    what: OUStringConstReference,
    units: Uint16Array,
    position: number,
  ): boolean {
    if (what.getStr()[0] !== units[position]) return false;
    return this.StringPtrContainsImpl(what, units, position);
  }
  /** Source bounded OUString substring comparison. @param what - Needle. @param value - Haystack. @param position - UTF-16 offset. @returns Match. */
  private StringContainsImpl(
    what: OUStringConstReference,
    value: OUString,
    position: number,
  ): boolean {
    return (
      position + what.getLength() <= value.getLength() &&
      this.StringPtrContainsImpl(what, value.getStr(), position)
    );
  }
  /** Source pointer comparison returns false for an empty needle. @param what - Needle. @param units - Haystack. @param position - UTF-16 offset. @returns Match. */
  private StringPtrContainsImpl(
    what: OUStringConstReference,
    units: Uint16Array,
    position: number,
  ): boolean {
    if (what.isEmpty()) return false;
    const needle = what.getStr();
    for (let index = 0; index < what.getLength(); index++)
      if (needle[index] !== units[position + index]) return false;
    return true;
  }
  /** Source date-word boundary: ASCII separators, then surrogate and KCharacterType handling. @param what - Word. @param value - Input. @param position - UTF-16 offset. @returns Whether the complete word matches. */
  protected StringContainsWord(what: OUString, value: OUString, position: number): boolean {
    if (what.isEmpty() || value.getLength() < position + what.getLength()) return false;
    if (!this.StringPtrContainsImpl(what, value.getStr(), position)) return false;
    position += what.getLength();
    if (position === value.getLength()) return true;
    const code = value.getStr()[position] as number;
    if (code === 32 || code === 45 || code === 46 || code === 47) return true;
    if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122))
      return false;
    const next: [number] = [position];
    value.iterateCodePoints(next);
    if (position + 1 < next[0]) return true;
    const type = this.language.GetCharClass().getCharacterType(value, position);
    if (type & (KCharacterType.UPPER | KCharacterType.LOWER | KCharacterType.DIGIT)) return false;
    return true;
  }
  /** Original InitText replaces cached uppercase calendar names in the source's section order. @returns Nothing. */
  private InitText(): void {
    const state = this.fields,
      calendar = this.language.GetCalendar(),
      character = this.language.GetCharClass();
    /** Replaces source paired unique_ptr arrays from one calendar service response. @param names - Calendar values. @param fullTarget - Old full names. @param abbreviatedTarget - Old abbreviations. @returns Uppercase paired arrays. */
    const upper = (
      names: CalendarItem2Names[],
      fullTarget: OUString[],
      abbreviatedTarget: OUString[],
    ): [OUString[], OUString[]] => {
      for (const old of fullTarget) old.dispose();
      for (const old of abbreviatedTarget) old.dispose();
      try {
        return [
          names.map((item) => character.uppercase(item.FullName)),
          names.map((item) => character.uppercase(item.AbbrevName)),
        ];
      } finally {
        for (const item of names) {
          item.FullName.dispose();
          item.AbbrevName.dispose();
        }
      }
    };
    const months = calendar.getMonths();
    [state.pUpperMonthText, state.pUpperAbbrevMonthText] = upper(
      months,
      state.pUpperMonthText,
      state.pUpperAbbrevMonthText,
    );
    const genitive = calendar.getGenitiveMonths();
    state.bScanGenitiveMonths = months.length !== genitive.length;
    [state.pUpperGenitiveMonthText, state.pUpperGenitiveAbbrevMonthText] = upper(
      genitive,
      state.pUpperGenitiveMonthText,
      state.pUpperGenitiveAbbrevMonthText,
    );
    for (let index = 0; index < state.pUpperGenitiveMonthText.length; index++) {
      if (
        !state.bScanGenitiveMonths &&
        (!state.pUpperGenitiveMonthText[index]?.equals(state.pUpperMonthText[index] as OUString) ||
          !state.pUpperGenitiveAbbrevMonthText[index]?.equals(
            state.pUpperAbbrevMonthText[index] as OUString,
          ))
      )
        state.bScanGenitiveMonths = true;
    }
    const partitive = calendar.getPartitiveMonths();
    state.bScanPartitiveMonths = partitive.length !== state.pUpperGenitiveMonthText.length;
    [state.pUpperPartitiveMonthText, state.pUpperPartitiveAbbrevMonthText] = upper(
      partitive,
      state.pUpperPartitiveMonthText,
      state.pUpperPartitiveAbbrevMonthText,
    );
    for (let index = 0; index < state.pUpperPartitiveMonthText.length; index++) {
      if (
        !state.bScanPartitiveMonths &&
        (!state.pUpperPartitiveMonthText[index]?.equals(
          state.pUpperGenitiveMonthText[index] as OUString,
        ) ||
          !state.pUpperPartitiveAbbrevMonthText[index]?.equals(
            state.pUpperGenitiveAbbrevMonthText[index] as OUString,
          ))
      )
        state.bScanPartitiveMonths = true;
    }
    [state.pUpperDayText, state.pUpperAbbrevDayText] = upper(
      calendar.getDays(),
      state.pUpperDayText,
      state.pUpperAbbrevDayText,
    );
    state.bTextInitialized = true;
  }
  /** Original calendar-name lookup: full names precede abbreviated names, including source German and September alternatives. @param value - Uppercase input. @param position - Mutable cursor. @returns One-based month, negative when abbreviated, or zero. */
  protected GetMonth(value: OUString, position: [number]): number {
    if (value.getLength() <= position[0]) return 0;
    const state = this.fields;
    if (!state.bTextInitialized) this.InitText();
    const locale = this.language.fields.locale,
      language = text(locale.Language),
      country = text(locale.Country);
    /** Tests one literal through the source date-word boundary. @param literal - Uppercase literal. @returns Match. */
    const word = (literal: string): boolean => {
      const candidate = unicode(literal);
      try {
        return this.StringContainsWord(candidate, value, position[0]);
      } finally {
        candidate.dispose();
      }
    };
    /** Compares a native uppercase abbreviation without retaining a temporary OUString. @param name - Cached name. @param literal - Source literal. @returns Equality. */
    const equals = (name: OUString | undefined, literal: string): boolean => {
      if (!name) return false;
      const candidate = unicode(literal);
      try {
        return name.equals(candidate);
      } finally {
        candidate.dispose();
      }
    };
    const count = this.language.GetCalendar().getNumberOfMonthsInYear();
    for (let index = 0; index < count; index++) {
      for (const [enabled, names, abbreviated] of [
        [state.bScanGenitiveMonths, state.pUpperGenitiveMonthText, false],
        [state.bScanGenitiveMonths, state.pUpperGenitiveAbbrevMonthText, true],
        [state.bScanPartitiveMonths, state.pUpperPartitiveMonthText, false],
        [state.bScanPartitiveMonths, state.pUpperPartitiveAbbrevMonthText, true],
        [true, state.pUpperMonthText, false],
        [true, state.pUpperAbbrevMonthText, true],
      ] as const) {
        const name = names[index];
        if (enabled && name && this.StringContainsWord(name, value, position[0])) {
          position[0] += name.getLength();
          return abbreviated ? -(index + 1) : index + 1;
        }
      }
      if (index === 2 && language === "de") {
        const abbreviation = state.pUpperAbbrevMonthText[index];
        if (
          (equals(abbreviation, "MÄR") && word("MRZ")) ||
          (equals(abbreviation, "MRZ") && word("MÄR"))
        ) {
          position[0] += 3;
          return -(index + 1);
        }
      } else if (index === 8) {
        const abbreviation = state.pUpperAbbrevMonthText[index];
        if (
          (equals(abbreviation, "SEPT") && word("SEP")) ||
          (equals(abbreviation, "SEP") && word("SEPT"))
        ) {
          position[0] += equals(abbreviation, "SEPT") ? 3 : 4;
          return -(index + 1);
        }
      }
    }
    if (language === "de") {
      if (country === "AT") {
        if (word("JANUAR")) {
          position[0] += 6;
          return 1;
        }
        if (word("JAN")) {
          position[0] += 3;
          return -1;
        }
      } else {
        if (word("JÄNNER")) {
          position[0] += 6;
          return 1;
        }
        if (word("JÄN")) {
          position[0] += 3;
          return -1;
        }
      }
    }
    return 0;
  }
  /** Original active-locale currency match followed by explicit format-symbol match, caching only the uppercased locale symbol. @param value - Already uppercased input. @param position - Mutable UTF-16 offset. @returns Symbol matched. */
  protected GetCurrency(value: OUString, position: [number]): boolean {
    const state = this.fields;
    if (value.getLength() <= position[0]) return false;
    const charClass = this.language.GetCharClass();
    if (state.aUpperCurrSymbol.isEmpty()) {
      const language = state.mpFormat?.GetLanguage() ?? this.language.fields.ActLnge[0],
        symbol = SvNumberFormatter.GetCurrencyEntry(language).GetSymbol(),
        upper = charClass.uppercase(symbol);
      try { state.aUpperCurrSymbol.assign(upper); }
      finally { upper.dispose(); }
    }
    if (this.StringContains(state.aUpperCurrSymbol, value, position[0])) {
      position[0] += state.aUpperCurrSymbol.getLength();
      return true;
    }
    if (state.mpFormat) {
      const symbol = new OUString(), extension = new OUString();
      try {
        if (state.mpFormat.GetNewCurrencySymbol(symbol, extension) &&
            symbol.getLength() <= value.getLength() - position[0]) {
          const upper = charClass.uppercase(symbol);
          try { symbol.assign(upper); }
          finally { upper.dispose(); }
          if (this.StringContains(symbol, value, position[0])) {
            position[0] += symbol.getLength();
            return true;
          }
        }
      } finally {
        extension.dispose();
        symbol.dispose();
      }
    }
    return false;
  }
  /** Source literal-token comparison across numeric subformats and a remaining input suffix. @param input - Already prepared input. @param position - Consumed prefix width. @param token - Token offset or 0xffff for last. @param dontDetectNegation - Suppress sign detection. @returns Whether a format literal matched. */
  protected ScanStringNumFor(
    input: OUString, position: number, token: number, dontDetectNegation = false,
  ): boolean {
    const state = this.fields,
      format = state.mpFormat;
    if (!format) return false;
    const transliteration = this.language.GetTransliteration();
    let value = new OUString(input),
      found = false,
      first = true,
      continuing = true;
    let subformat: number;
    try {
      do {
        subformat = state.nStringScanNumFor;
        do {
          const literal = format.GetNumForString(subformat, token, true);
          if (literal && transliteration.isEqual(value, literal)) {
            found = true;
            continuing = false;
          } else if (subformat < 2) subformat++;
          else continuing = false;
        } while (continuing);
        if (!found && first && position) {
          first = false;
          const remainder = value.copy(position);
          value.dispose();
          value = remainder;
          continuing = true;
        }
      } while (continuing);
      if (!found) {
        if (!dontDetectNegation && token === 0 && !first && state.nSign < 0 &&
          format.IsSecondSubformatRealNegative()) {
          const withoutSpaces = Array.from(value.getStr().subarray(0, value.getLength()))
            .filter(unit => unit !== 32);
          const compact = new OUString(Uint16Array.from(withoutSpaces), withoutSpaces.length);
          value.dispose();
          value = compact;
          if (value.getLength() === 1 && value.getStr()[0] === 45) {
            found = true;
            state.nStringScanSign = -1;
            subformat = 0;
          }
        }
        if (!found) return false;
      } else if (!dontDetectNegation && subformat === 1 &&
        format.IsSecondSubformatRealNegative()) {
        if (state.nStringScanSign < 0) {
          if (state.nSign < 0 && state.nStringScanNumFor !== 1)
            state.nStringScanSign = 1;
        } else if (state.nStringScanSign === 0) {
          if (state.nSign < 0) {
            if (token === 0 && !first && SvNumberformat.HasStringNegativeSign(value))
              state.nStringScanSign = -1;
            else if (format.IsNegativeWithoutSign()) state.nStringScanSign = -1;
          } else state.nStringScanSign = -1;
        } else state.nStringScanSign = -1;
      }
      state.nStringScanNumFor = subformat;
      return true;
    } finally {
      value.dispose();
    }
  }
  /** Source leading fragment classification: sign, decimal, currency, month/day names and compiled-format literal. @param value - Already uppercased start fragment. @returns Whether accepted. */
  protected ScanStartString(value: OUString): boolean {
    const state = this.fields,
      position: [number] = [0];
    this.SkipBlanks(value, position);
    state.nSign = this.GetSign(value, position);
    if (state.nSign) this.SkipBlanks(value, position);
    if (state.nMatchedAllStrings && !(state.nSign && value.getLength() === 1)) {
      if (this.ScanStringNumFor(value, position[0], 0, true))
        state.nMatchedAllStrings |= 0x04;
      else state.nMatchedAllStrings = 0;
    }
    if (state.nSign && position[0] === value.getLength()) return true;
    const startBlanks = position[0];
    if (this.GetDecSep(value, position)) {
      if (this.SkipBlanks(value, position)) position[0] = startBlanks;
      else state.nDecPos = 1;
    } else if (this.GetCurrency(value, position)) {
      state.eScannedType = SvNumFormatType.CURRENCY;
      this.SkipBlanks(value, position);
      if (state.nSign === 0) {
        state.nSign = this.GetSign(value, position);
        if (state.nSign) this.SkipBlanks(value, position);
      }
      if (this.GetDecSep(value, position)) {
        if (this.SkipBlanks(value, position)) {
          position[0] = startBlanks;
          state.eScannedType = SvNumFormatType.UNDEFINED;
        } else state.nDecPos = 1;
      }
    } else {
      const monthStart = position[0];
      let month = this.GetMonth(value, position);
      if (month < 0) {
        const possibleDay: [number] = [monthStart];
        state.nDayOfWeek = this.GetDayOfWeek(value, possibleDay);
        if (state.nDayOfWeek < 0) {
          this.SkipChar(46, value, possibleDay);
          this.SkipString(this.language.GetLocaleData().getLongDateDayOfWeekSep(), value, possibleDay);
          this.SkipBlanks(value, possibleDay);
          if (this.GetMonth(value, possibleDay)) {
            month = 0;
            position[0] = monthStart;
            state.nDayOfWeek = 0;
          }
        }
      }
      if (month) {
        if (position[0] < value.getLength() || (state.nStringsCnt >= 4 && state.nNumericsCnt >= 2)) {
          state.eScannedType = SvNumFormatType.DATE;
          state.nMonth = month;
          state.nMonthPos = 1;
          if (state.nMonth < 0) this.SkipChar(46, value, position);
          this.SkipBlanks(value, position);
        } else position[0] = monthStart;
      } else {
        const day = this.GetDayOfWeek(value, position);
        if (day) {
          state.eScannedType = SvNumFormatType.DATE;
          if (position[0] < value.getLength()) {
            if (day < 0) this.SkipChar(46, value, position);
            else {
              this.SkipBlanks(value, position);
              this.SkipString(this.language.GetLocaleData().getLongDateDayOfWeekSep(), value, position);
            }
            this.SkipBlanks(value, position);
            month = this.GetMonth(value, position);
            if (month) {
              if (position[0] < value.getLength() || (state.nStringsCnt >= 4 && state.nNumericsCnt >= 2)) {
                state.nMonth = month;
                state.nMonthPos = 1;
                if (state.nMonth < 0) this.SkipChar(46, value, position);
                this.SkipBlanks(value, position);
              } else position[0] = monthStart;
            }
          }
          if (!state.nMonth) this.IsAcceptedDatePattern(1);
        }
      }
      if (state.nMonth && position[0] + 1 === value.getLength() &&
          !this.SkipChar(45, value, position))
        this.SkipChar(47, value, position);
    }
    if (position[0] < value.getLength() && !this.ScanStringNumFor(value, position[0], 0))
      return this.MatchedReturn();
    return true;
  }
  /** Source middle-fragment classification across decimals, fraction/grouping, date/time and compiled-format literals. @param value - Already uppercased fragment. @param stringPosition - Fragment index. @param numericCount - Numbers seen through this fragment. @returns Whether accepted. */
  protected ScanMidString(value: OUString, stringPosition: number, numericCount: number): boolean {
    const state = this.fields,
      position: [number] = [0],
      oldType = state.eScannedType;
    if (state.nMatchedAllStrings) {
      if (this.ScanStringNumFor(value, 0, stringPosition)) state.nMatchedAllStrings |= 0x02;
      else state.nMatchedAllStrings = 0;
    }
    const startBlanks = position[0],
      blanks = this.SkipBlanks(value, position);
    if (this.GetDecSep(value, position)) {
      if (state.nDecPos === 1 || state.nDecPos === 3) return this.MatchedReturn();
      if (state.nDecPos === 2) {
        const signedYear: [boolean] = [false];
        if (state.bDecSepInDateSeps ||
            this.SkipDatePatternSeparator(stringPosition, position, signedYear)) {
          if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
              state.eScannedType !== SvNumFormatType.DATE &&
              state.eScannedType !== SvNumFormatType.DATETIME) return this.MatchedReturn();
          if (state.eScannedType === SvNumFormatType.UNDEFINED)
            state.eScannedType = SvNumFormatType.DATE;
          this.SkipBlanks(value, position);
        } else return this.MatchedReturn();
      } else if (blanks || this.SkipBlanks(value, position)) position[0] = startBlanks;
      else state.nDecPos = 2;
    } else if ((state.eScannedType & SvNumFormatType.TIME) &&
               this.GetTime100SecSep(value, position)) {
      if (state.nDecPos) return this.MatchedReturn();
      state.nDecPos = 2;
      if (state.bIso8601Tsep && position[0] === value.getLength() &&
          state.eScannedType === SvNumFormatType.DATETIME &&
          (text(value) === "." || text(value) === ",")) return true;
      this.SkipBlanks(value, position);
    }
    if (this.SkipChar(47, value, position)) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.DATE) return this.MatchedReturn();
      if (state.eScannedType !== SvNumFormatType.DATE &&
          (state.eSetType === SvNumFormatType.FRACTION ||
           (state.nNumericsCnt === 3 &&
            (stringPosition === 3 || (stringPosition === 4 && state.nSign)) &&
            lcl_isBlanks(state.sStrArray[stringPosition - 2] as OUString)))) {
        this.SkipBlanks(value, position);
        if (position[0] === value.getLength()) {
          state.eScannedType = SvNumFormatType.FRACTION;
          if (state.eSetType === SvNumFormatType.FRACTION && state.nNumericsCnt === 2 &&
              (stringPosition === 1 || (stringPosition === 2 && state.nSign))) return true;
        }
      } else position[0]--;
    }
    if (this.GetThousandSep(value, position, stringPosition)) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.CURRENCY) return this.MatchedReturn();
      state.nThousand++;
    }
    const locale = this.language.GetLocaleData(),
      signedYear: [boolean] = [false];
    let date = this.SkipDatePatternSeparator(stringPosition, position, signedYear);
    if (!date) {
      this.SkipBlanks(value, position);
      date = this.SkipString(this.language.GetDateSep(), value, position);
    }
    if (!date && stringPosition === 1 && state.mpFormat &&
        (state.mpFormat.GetType() & SvNumFormatType.DATE)) {
      const order = state.mpFormat.GetExactDateOrder();
      if ((order & 255) === 89 && ((order >> 8) & 255) === 77 &&
          ((order >> 16) & 255) === 68) {
        const previous = position[0];
        if (this.SkipChar(46, value, position) && this.SkipBlanks(value, position) &&
            position[0] + 2 < value.getLength() &&
            (text(value).endsWith(" ") ||
             text(value).endsWith(text(locale.getLongDateMonthSep())))) date = true;
        else position[0] = previous;
      }
    }
    if (date || ((this.MayBeIso8601() || this.MayBeMonthDate()) &&
                 this.SkipChar(45, value, position))) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.DATE) return this.MatchedReturn();
      this.SkipBlanks(value, position);
      state.eScannedType = SvNumFormatType.DATE;
      const month = this.GetMonth(value, position);
      if (state.nMonth && month) return this.MatchedReturn();
      if (month) {
        state.nMonth = month;
        state.nMonthPos = 2;
        if (!(state.nMonth < 0 && this.SkipChar(46, value, position)) &&
            !this.SkipChar(45, value, position))
          this.SkipString(locale.getLongDateMonthSep(), value, position);
        this.SkipBlanks(value, position);
      }
      if (signedYear[0]) {
        if (!state.mbEraCE) return this.MatchedReturn();
        state.mbEraCE = false;
      }
    }
    const monthStart = position[0],
      month = this.GetMonth(value, position);
    if (month) {
      if (state.nMonth || (state.eScannedType !== SvNumFormatType.UNDEFINED &&
                           state.eScannedType !== SvNumFormatType.DATE)) return this.MatchedReturn();
      if (monthStart > 0 && position[0] < value.getLength()) {
        state.eScannedType = SvNumFormatType.DATE;
        state.nMonth = month;
        state.nMonthPos = numericCount <= 1 ? 2 : 3;
        if (state.nMonth < 0) this.SkipChar(46, value, position);
        this.SkipString(locale.getLongDateMonthSep(), value, position);
        this.SkipBlanks(value, position);
      } else position[0] = monthStart;
    }
    if (this.SkipChar(69, value, position) || this.SkipChar(101, value, position)) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED) return this.MatchedReturn();
      this.SkipBlanks(value, position);
      state.eScannedType = SvNumFormatType.SCIENTIFIC;
      if (state.nThousand + 2 === state.nNumericsCnt && state.nDecPos === 2)
        state.nDecPos = 3;
      state.nESign = this.GetESign(value, position);
      this.SkipBlanks(value, position);
    }
    if (this.SkipString(locale.getTimeSep(), value, position)) {
      if (state.nDecPos) {
        if (state.bDecSepInDateSeps) {
          if (state.eScannedType !== SvNumFormatType.DATE &&
              state.eScannedType !== SvNumFormatType.DATETIME) return this.MatchedReturn();
          if (state.eScannedType === SvNumFormatType.DATE) state.nDecPos = 0;
        } else return this.MatchedReturn();
      }
      if ((state.eScannedType === SvNumFormatType.DATE ||
           state.eScannedType === SvNumFormatType.DATETIME) && state.nNumericsCnt > 3) {
        this.SkipBlanks(value, position);
        state.eScannedType = SvNumFormatType.DATETIME;
      } else if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
                 state.eScannedType !== SvNumFormatType.TIME) return this.MatchedReturn();
      else {
        this.SkipBlanks(value, position);
        state.eScannedType = SvNumFormatType.TIME;
      }
      if (!state.nTimePos) state.nTimePos = stringPosition + 1;
    }
    if (position[0] < value.getLength()) {
      if (state.eScannedType === SvNumFormatType.DATE) {
        if (state.nMonthPos === 1 && locale.getLongDateOrder() === LongDateOrder.MDY) {
          if (this.SkipString(locale.getLongDateDaySep(), value, position))
            this.SkipBlanks(value, position);
        } else if (position[0] === 0 && value.getLength() === 1 && this.MayBeIso8601()) {
          const code = value.getStr()[0];
          if ((stringPosition === 5 && code === 84) ||
              (stringPosition === 6 && code === 84 && text(state.sStrArray[0] as OUString) === "-")) {
            position[0]++;
            state.bIso8601Tsep = true;
          } else if (stringPosition === 7 && code === 58) {
            if (state.nNumericsCnt >= 5) state.eScannedType = SvNumFormatType.DATETIME;
            position[0]++;
          }
        }
      } else if (state.eScannedType === SvNumFormatType.DATETIME && position[0] === 0 &&
                 value.getLength() === 1 && this.MayBeIso8601() &&
                 stringPosition === 9 && value.getStr()[0] === 58) position[0]++;
    }
    if (position[0] < value.getLength()) {
      if (state.nMatchedAllStrings & ~0x08) state.eScannedType = oldType;
      else return false;
    }
    return true;
  }
  /** Source trailing fragment classification, including postfixed signs, date/time separators and format-token fallback. @param value - Already uppercased end fragment. @returns Whether all source characters were consumed. */
  protected ScanEndString(value: OUString): boolean {
    const state = this.fields,
      position: [number] = [0];
    if (state.nMatchedAllStrings) {
      if (this.ScanStringNumFor(value, 0, 0xffff)) state.nMatchedAllStrings |= 0x01;
      else state.nMatchedAllStrings = 0;
    }
    const startBlanks = position[0],
      blanks = this.SkipBlanks(value, position);
    if (this.GetDecSep(value, position)) {
      if (state.nDecPos === 1 || state.nDecPos === 3) return this.MatchedReturn();
      if (state.nDecPos === 2) {
        const signedYear: [boolean] = [false];
        if (state.bDecSepInDateSeps ||
            this.SkipDatePatternSeparator(state.nStringsCnt - 1, position, signedYear)) {
          if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
              state.eScannedType !== SvNumFormatType.DATE &&
              state.eScannedType !== SvNumFormatType.DATETIME) return this.MatchedReturn();
          if (state.eScannedType === SvNumFormatType.UNDEFINED)
            state.eScannedType = SvNumFormatType.DATE;
          this.SkipBlanks(value, position);
        } else return this.MatchedReturn();
      } else if (blanks) position[0] = startBlanks;
      else {
        state.nDecPos = 3;
        this.SkipBlanks(value, position);
      }
    }
    let signHere = false;
    if (state.nSign === 0 && state.eScannedType !== SvNumFormatType.DATE) {
      state.nSign = this.GetSign(value, position);
      if (state.bNegCheck) return this.MatchedReturn();
      if (state.nSign) signHere = true;
    }
    this.SkipBlanks(value, position);
    if (state.bNegCheck && this.SkipChar(41, value, position)) {
      state.bNegCheck = false;
      this.SkipBlanks(value, position);
    }
    if (this.GetCurrency(value, position)) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED) return this.MatchedReturn();
      this.SkipBlanks(value, position);
      state.eScannedType = SvNumFormatType.CURRENCY;
      if (state.nSign === 0) {
        state.nSign = this.GetSign(value, position);
        this.SkipBlanks(value, position);
        if (state.bNegCheck) return this.MatchedReturn();
      }
      if (state.bNegCheck && state.eScannedType === SvNumFormatType.CURRENCY &&
          this.SkipChar(41, value, position)) {
        state.bNegCheck = false;
        this.SkipBlanks(value, position);
      }
    }
    if (this.SkipChar(37, value, position)) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED) return this.MatchedReturn();
      this.SkipBlanks(value, position);
      state.eScannedType = SvNumFormatType.PERCENT;
    }
    const locale = this.language.GetLocaleData();
    if (this.SkipString(locale.getTimeSep(), value, position)) {
      if (state.nDecPos) return this.MatchedReturn();
      if (state.eScannedType === SvNumFormatType.DATE && state.nNumericsCnt > 2) {
        this.SkipBlanks(value, position);
        state.eScannedType = SvNumFormatType.DATETIME;
      } else if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
                 state.eScannedType !== SvNumFormatType.TIME) return this.MatchedReturn();
      else {
        this.SkipBlanks(value, position);
        state.eScannedType = SvNumFormatType.TIME;
      }
      if (!state.nTimePos) state.nTimePos = state.nStringsCnt;
    }
    const signedYear: [boolean] = [false];
    let date = this.SkipDatePatternSeparator(state.nStringsCnt - 1, position, signedYear);
    if (!date) date = this.SkipString(this.language.GetDateSep(), value, position);
    if (date && signHere) state.nSign = 0;
    if (date || ((this.MayBeIso8601() || this.MayBeMonthDate()) &&
                 this.SkipChar(45, value, position))) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.DATE) return this.MatchedReturn();
      this.SkipBlanks(value, position);
      state.eScannedType = SvNumFormatType.DATE;
      const month = this.GetMonth(value, position);
      if (state.nMonth && month) return this.MatchedReturn();
      if (month) {
        state.nMonth = month;
        state.nMonthPos = 3;
        if (state.nMonth < 0) this.SkipChar(46, value, position);
        this.SkipBlanks(value, position);
      }
    }
    const monthStart = position[0],
      month = this.GetMonth(value, position);
    if (month) {
      if (state.nMonth || (state.eScannedType !== SvNumFormatType.UNDEFINED &&
                           state.eScannedType !== SvNumFormatType.DATE)) return this.MatchedReturn();
      if (monthStart > 0) {
        state.eScannedType = SvNumFormatType.DATE;
        state.nMonth = month;
        state.nMonthPos = 3;
        if (state.nMonth < 0) this.SkipChar(46, value, position);
        this.SkipBlanks(value, position);
      } else position[0] = monthStart;
    }
    const originalPosition = position[0];
    if (this.GetTimeAmPm(value, position)) {
      if (state.eScannedType !== SvNumFormatType.UNDEFINED &&
          state.eScannedType !== SvNumFormatType.TIME &&
          state.eScannedType !== SvNumFormatType.DATETIME) return this.MatchedReturn();
      if (state.eScannedType !== SvNumFormatType.TIME && state.nDecPos === 2 &&
          state.nNumericsCnt === 2) position[0] = originalPosition;
      else {
        this.SkipBlanks(value, position);
        if (state.eScannedType !== SvNumFormatType.DATETIME)
          state.eScannedType = SvNumFormatType.TIME;
      }
    }
    if (state.bNegCheck && this.SkipChar(41, value, position)) {
      if (state.eScannedType === SvNumFormatType.CURRENCY) {
        state.bNegCheck = false;
        this.SkipBlanks(value, position);
      } else return this.MatchedReturn();
    }
    if (position[0] < value.getLength() &&
        (state.eScannedType === SvNumFormatType.DATE ||
         state.eScannedType === SvNumFormatType.DATETIME)) {
      const oldPosition = position[0],
        separator = locale.getLongDateDayOfWeekSep();
      if (this.StringContains(separator, value, position[0])) {
        position[0] += separator.getLength();
        this.SkipBlanks(value, position);
      }
      const day = this.GetDayOfWeek(value, position);
      if (day) {
        if (position[0] < value.getLength()) {
          if (day < 0) this.SkipChar(46, value, position);
          this.SkipBlanks(value, position);
        }
      } else position[0] = oldPosition;
    }
    if (position[0] < value.getLength() &&
        !this.ScanStringNumFor(value, position[0], 0xffff)) return false;
    return true;
  }
  /** Source fragment dispatch and final compiled-format reconciliation before numeric conversion. @param value - Already uppercased input. @param format - Optional compiled format to match. @returns Whether the input has a numeric or logical shape. */
  protected IsNumberFormatMain(value: OUString, format: SvNumberformatConstReference | null): boolean {
    this.Reset();
    const state = this.fields;
    state.mpFormat = format;
    this.NumberStringDivision(value);
    if (state.nStringsCnt >= SV_MAX_COUNT_INPUT_STRINGS) return false;
    if (state.nNumericsCnt === 0) {
      if (!state.nStringsCnt) return false;
      const fragment = state.sStrArray[0] as OUString,
        units = fragment.getStr();
      let begin = 0,
        end = fragment.getLength();
      while (begin < end && units[begin] === 32) begin++;
      while (end > begin && units[end - 1] === 32) end--;
      const stripped = new OUString(units.subarray(begin, end), end - begin);
      try { fragment.assign(stripped); }
      finally { stripped.dispose(); }
      state.nLogical = this.GetLogical(fragment);
      if (!state.nLogical) return false;
      state.eScannedType = SvNumFormatType.LOGICAL;
      state.nMatchedAllStrings &= ~0x08;
      return true;
    }
    const index: [number] = [0],
      numberCount: [number] = [0];
    switch (state.nNumericsCnt) {
      case 1:
        if (this.GetNextNumber(index, numberCount)) {
          if (state.eSetType === SvNumFormatType.FRACTION &&
              (index[0] >= state.nStringsCnt ||
               this.language.IsDecimalSep(state.sStrArray[index[0]] as OUString))) {
            state.eScannedType = SvNumFormatType.FRACTION;
            state.nMatchedAllStrings &= ~0x08;
            return true;
          }
        } else {
          if (!this.ScanStartString(state.sStrArray[index[0]] as OUString)) return false;
          index[0]++;
        }
        this.GetNextNumber(index, numberCount);
        if (state.eSetType === SvNumFormatType.FRACTION && state.nSign && !state.bNegCheck &&
            state.eScannedType === SvNumFormatType.UNDEFINED && state.nDecPos === 0 &&
            (index[0] >= state.nStringsCnt ||
             this.language.IsDecimalSep(state.sStrArray[index[0]] as OUString))) {
          state.eScannedType = SvNumFormatType.FRACTION;
          state.nMatchedAllStrings &= ~0x08;
          return true;
        }
        if (index[0] < state.nStringsCnt &&
            !this.ScanEndString(state.sStrArray[index[0]] as OUString)) return false;
        break;
      case 2:
        if (!this.GetNextNumber(index, numberCount)) {
          if (!this.ScanStartString(state.sStrArray[index[0]] as OUString)) return false;
          index[0]++;
        }
        this.GetNextNumber(index, numberCount);
        if (!this.ScanMidString(state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
          return false;
        index[0]++;
        this.GetNextNumber(index, numberCount);
        if (index[0] < state.nStringsCnt &&
            !this.ScanEndString(state.sStrArray[index[0]] as OUString)) return false;
        if (state.eSetType === SvNumFormatType.FRACTION && !state.bNegCheck &&
            state.eScannedType === SvNumFormatType.UNDEFINED &&
            (state.nDecPos === 0 || state.nDecPos === 3)) {
          state.eScannedType = SvNumFormatType.FRACTION;
          state.nMatchedAllStrings &= ~0x08;
          return true;
        }
        break;
      case 3:
        if (!this.GetNextNumber(index, numberCount)) {
          if (!this.ScanStartString(state.sStrArray[index[0]] as OUString)) return false;
          index[0]++;
          if (state.nDecPos === 1) return false;
        }
        this.GetNextNumber(index, numberCount);
        if (!this.ScanMidString(state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
          return false;
        index[0]++;
        if (state.eScannedType === SvNumFormatType.SCIENTIFIC) return false;
        this.GetNextNumber(index, numberCount);
        if (!this.ScanMidString(state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
          return false;
        index[0]++;
        this.GetNextNumber(index, numberCount);
        if (index[0] < state.nStringsCnt &&
            !this.ScanEndString(state.sStrArray[index[0]] as OUString)) return false;
        if (state.eSetType === SvNumFormatType.FRACTION && !state.bNegCheck &&
            state.eScannedType === SvNumFormatType.UNDEFINED &&
            (state.nDecPos === 0 || state.nDecPos === 3)) {
          state.eScannedType = SvNumFormatType.FRACTION;
          state.nMatchedAllStrings &= ~0x08;
          return true;
        }
        if (state.eScannedType === SvNumFormatType.FRACTION && state.nDecPos) return false;
        break;
      default:
        if (!this.GetNextNumber(index, numberCount)) {
          if (!this.ScanStartString(state.sStrArray[index[0]] as OUString)) return false;
          index[0]++;
          if (state.nDecPos === 1) return false;
        }
        this.GetNextNumber(index, numberCount);
        if (!this.ScanMidString(state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
          return false;
        index[0]++;
        {
          let oldThousands = 10;
          while (oldThousands !== state.nThousand && numberCount[0] < state.nNumericsCnt - 1) {
            oldThousands = state.nThousand;
            if (state.eScannedType === SvNumFormatType.SCIENTIFIC) return false;
            this.GetNextNumber(index, numberCount);
            if (index[0] < state.nStringsCnt &&
                !this.ScanMidString(state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
              return false;
            index[0]++;
          }
        }
        if (state.eScannedType === SvNumFormatType.DATE ||
            state.eScannedType === SvNumFormatType.TIME ||
            state.eScannedType === SvNumFormatType.UNDEFINED) {
          for (let slot = numberCount[0]; slot < state.nNumericsCnt - 1; slot++) {
            if (Number(state.eScannedType) === SvNumFormatType.SCIENTIFIC) return false;
            this.GetNextNumber(index, numberCount);
            if (index[0] < state.nStringsCnt &&
                !this.ScanMidString(state.sStrArray[index[0]] as OUString, index[0], numberCount[0]))
              return false;
            index[0]++;
          }
        }
        this.GetNextNumber(index, numberCount);
        if (index[0] < state.nStringsCnt &&
            !this.ScanEndString(state.sStrArray[index[0]] as OUString)) return false;
        if (state.eSetType === SvNumFormatType.FRACTION && !state.bNegCheck &&
            state.eScannedType === SvNumFormatType.UNDEFINED &&
            (state.nDecPos === 0 || state.nDecPos === 3)) {
          state.eScannedType = SvNumFormatType.FRACTION;
          state.nMatchedAllStrings &= ~0x08;
          return true;
        }
        if (state.eScannedType === SvNumFormatType.FRACTION && state.nDecPos) return false;
    }
    if (state.eScannedType === SvNumFormatType.UNDEFINED) {
      state.nMatchedAllStrings &= ~0x08;
      const didMatch = state.nMatchedAllStrings !== 0;
      if (state.nMatchedAllStrings &&
          !format?.IsNumForStringElementCountEqual(
            state.nStringScanNumFor, state.nStringsCnt, state.nNumericsCnt))
        state.nMatchedAllStrings = 0;
      if (state.nMatchedAllStrings) {
        let type = state.eSetType;
        if ((type === SvNumFormatType.UNDEFINED || type === SvNumFormatType.DEFINED) && format)
          type = format.GetNumForInfoScannedType(state.nStringScanNumFor);
        state.eScannedType = type !== SvNumFormatType.UNDEFINED && type !== SvNumFormatType.DEFINED
          ? type : SvNumFormatType.NUMBER;
      } else if (didMatch) {
        if (state.nDecPos !== 2 || state.nNumericsCnt !== 2) return false;
        state.eScannedType = SvNumFormatType.NUMBER;
      } else state.eScannedType = SvNumFormatType.NUMBER;
    } else if (state.eScannedType === SvNumFormatType.DATE) {
      state.nMatchedAllStrings &= ~0x08;
      const wasReturn = (state.nMatchedAllStrings & 0x10) !== 0;
      if (state.nMatchedAllStrings &&
          !format?.IsNumForStringElementCountEqual(
            state.nStringScanNumFor, state.nStringsCnt, state.nNumericsCnt))
        state.nMatchedAllStrings = 0;
      if (state.nMatchedAllStrings) {
        let type = state.eSetType;
        if ((type === SvNumFormatType.UNDEFINED || type === SvNumFormatType.DEFINED) && format)
          type = format.GetNumForInfoScannedType(state.nStringScanNumFor);
        if (type !== SvNumFormatType.UNDEFINED && type !== SvNumFormatType.DEFINED)
          state.eScannedType = type;
      } else if (wasReturn) return false;
    } else state.nMatchedAllStrings = 0;
    return true;
  }
  /** Original weekday-name lookup checks full then abbreviated name in calendar order. @param value - Uppercase input. @param position - Mutable cursor. @returns One-based day, negative when abbreviated, or zero. */
  protected GetDayOfWeek(value: OUString, position: [number]): number {
    if (value.getLength() <= position[0]) return 0;
    const state = this.fields;
    if (!state.bTextInitialized) this.InitText();
    const count = this.language.GetCalendar().getNumberOfDaysInWeek();
    for (let index = 0; index < count; index++) {
      const full = state.pUpperDayText[index],
        abbreviated = state.pUpperAbbrevDayText[index];
      if (full && this.StringContainsWord(full, value, position[0])) {
        position[0] += full.getLength();
        return index + 1;
      }
      if (abbreviated && this.StringContainsWord(abbreviated, value, position[0])) {
        position[0] += abbreviated.getLength();
        return -(index + 1);
      }
    }
    return 0;
  }
  /** Source single-character skip. @param code - Expected UTF-16 code unit. @param value - Input. @param position - Mutable cursor. @returns Match. */
  protected SkipChar(code: number, value: OUString, position: [number]): boolean {
    if (position[0] < value.getLength() && value.getStr()[position[0]] === code) {
      position[0]++;
      return true;
    }
    return false;
  }
  /** Source ASCII, no-break and narrow-no-break blank skip. @param value - Input. @param position - Mutable cursor. @returns Whether any blank was consumed. */
  protected SkipBlanks(value: OUString, position: [number]): boolean {
    const start = position[0];
    if (position[0] < value.getLength()) {
      const units = value.getStr();
      while (
        units[position[0]] === 32 ||
        units[position[0]] === 0xa0 ||
        units[position[0]] === 0x202f
      )
        position[0]++;
    }
    return start < position[0];
  }
  /** Source substring skip through StringContains. @param what - Expected text. @param value - Input. @param position - Mutable cursor. @returns Match. */
  protected SkipString(what: OUStringConstReference, value: OUString, position: [number]): boolean {
    if (!this.StringContains(what, value, position[0])) return false;
    position[0] += what.getLength();
    return true;
  }
  /** Original decimal-separator lookup tries the current locale separator before its nonempty alternate. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Whether a separator was consumed. */
  protected GetDecSep(value: OUString, position: [number]): boolean {
    if (position[0] >= value.getLength()) return false;
    const separator = this.language.GetNumDecimalSep();
    if (this.StringContains(separator, value, position[0])) {
      position[0] += separator.getLength();
      return true;
    }
    const alternate = this.language.GetNumDecimalSepAlt();
    if (!alternate.isEmpty() && this.StringContains(alternate, value, position[0])) {
      position[0] += alternate.getLength();
      return true;
    }
    return false;
  }
  /** Original AM/PM recognition compares uppercase locale tokens against the already-uppercase scan input. @param value - Uppercase input. @param position - Mutable UTF-16 cursor. @returns Whether a marker was consumed. */
  protected GetTimeAmPm(value: OUString, position: [number]): boolean {
    if (position[0] >= value.getLength()) return false;
    const locale = this.language.GetLocaleData(),
      character = this.language.GetCharClass(),
      am = character.uppercase(locale.getTimeAM()),
      pm = character.uppercase(locale.getTimePM());
    try {
      if (this.StringContains(am, value, position[0])) {
        this.fields.nAmPm = 1;
        position[0] += locale.getTimeAM().getLength();
        return true;
      }
      if (this.StringContains(pm, value, position[0])) {
        this.fields.nAmPm = -1;
        position[0] += locale.getTimePM().getLength();
        return true;
      }
      return false;
    } finally {
      pm.dispose();
      am.dispose();
    }
  }
  /** Original fractional-second separator accepts ISO dot/comma first, then the loaded locale item. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Whether a separator was consumed. */
  protected GetTime100SecSep(value: OUString, position: [number]): boolean {
    if (position[0] >= value.getLength()) return false;
    const code = value.getStr()[position[0]];
    if (this.fields.bIso8601Tsep && (code === 0x2e || code === 0x2c)) {
      position[0]++;
      return true;
    }
    const separator = this.language.GetLocaleData().getTime100SecSep();
    if (this.StringContains(separator, value, position[0])) {
      position[0] += separator.getLength();
      return true;
    }
    return false;
  }
  /** Original time-part conversion: HH:MM:SS.fraction, MM:SS when the compiled format says so, duration and leap-second validation. The output is assigned even when validation fails. @param output - Mutable serial-day fraction. @param firstIndex - First numeric part. @param count - Number of parts. @param inputOptions - Native SvNumInputOptions flags. @returns Whether the time fields are accepted. */
  protected GetTimeRef(
    output: [number],
    firstIndex: number,
    count: number,
    inputOptions: number,
  ): boolean {
    const state = this.fields,
      start = firstIndex;
    let index = firstIndex,
      valid = true,
      hour = 0,
      minute = 0,
      second = 0,
      second100 = 0;
    /** The source's numeric parts are ASCII-digit fragments; OUString::toInt32 returns zero on signed32 overflow. @param part - Fragment index. @returns Native signed32 value. */
    const integer = (part: number): number => {
      const value = state.sStrArray[state.nNums[part] as number] as OUString,
        parsed = value.toInt64();
      return parsed > 2147483647n || parsed < -2147483648n ? 0 : Number(parsed);
    };
    /** Source flags a converted zero unless the exact fragment was "0" or "00". @param part - Fragment index. @param value - Converted integer. @returns Overflow status. */
    const overflow = (part: number, value: number): boolean => {
      if (value !== 0) return false;
      const fragment = state.sStrArray[state.nNums[part] as number] as OUString,
        units = fragment.getStr();
      return !(
        (fragment.getLength() === 1 && units[0] === 48) ||
        (fragment.getLength() === 2 && units[0] === 48 && units[1] === 48)
      );
    };
    if (state.nDecPos === 2 && (count === 3 || count === 2)) hour = 0;
    else if (
      state.mpFormat &&
      state.nDecPos === 0 &&
      count === 2 &&
      state.mpFormat.IsMinuteSecondFormat()
    )
      hour = 0;
    else if (index - start < count) {
      hour = integer(index);
      if (overflow(index, hour)) valid = false;
      index++;
    } else valid = false;

    let allowDuration = hour === 0 && state.nAmPm === 0;
    if (state.nAmPm !== 0 && hour > 12) valid = false;
    else if (state.nAmPm === -1 && hour !== 12) hour += 12;
    else if (state.nAmPm === 1 && hour === 12) hour = 0;

    if (state.nDecPos === 2 && count === 2) minute = 0;
    else if (index - start < count) {
      minute = integer(index);
      if (overflow(index, minute)) valid = false;
      index++;
      if (
        (inputOptions & SvNumInputOptions.LAX_TIME) === 0 &&
        !allowDuration &&
        index > 1 &&
        minute > 59
      )
        valid = false;
      if (allowDuration) allowDuration = minute === 0;
    }
    if (index - start < count) {
      second = integer(index);
      if (overflow(index, second)) valid = false;
      index++;
      if (
        (inputOptions & SvNumInputOptions.LAX_TIME) === 0 &&
        !allowDuration &&
        index > 1 &&
        second > 59 &&
        !(hour === 23 && minute === 59 && second === 60)
      )
        valid = false;
    }
    if (index - start < count) {
      const fraction = state.sStrArray[state.nNums[index] as number] as OUString,
        units = fraction.getStr();
      let digits = "";
      for (let position = 0; position < fraction.getLength(); ++position)
        digits += String.fromCharCode(units[position] as number);
      second100 = Number(`0.${digits}`);
    }
    output[0] = (hour * 3600 + minute * 60 + second + second100) / 86400;
    return valid;
  }
  /** Original leading-sign scan accepts plus, ASCII and Unicode minus, and an opening negative parenthesis. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Signed source indicator. */
  protected GetSign(value: OUString, position: [number]): number {
    if (position[0] >= value.getLength()) return 0;
    switch (value.getStr()[position[0]]) {
      case 0x2b:
        position[0]++;
        return 1;
      case 0x28:
        this.fields.bNegCheck = true;
        position[0]++;
        return -1;
      case 0x2d:
      case 0x2212:
        position[0]++;
        return -1;
      default:
        return 0;
    }
  }
  /** Original exponent-sign scan accepts only ASCII plus and minus. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Signed source indicator. */
  protected GetESign(value: OUString, position: [number]): number {
    if (position[0] >= value.getLength()) return 0;
    switch (value.getStr()[position[0]]) {
      case 0x2b:
        position[0]++;
        return 1;
      case 0x2d:
        position[0]++;
        return -1;
      default:
        return 0;
    }
  }
  /** Original numeric-fragment step advances both counters only when the current slot is numeric. @param index - Mutable fragment slot. @param count - Mutable numeric count. @returns Whether a numeric slot was consumed. */
  protected GetNextNumber(index: [number], count: [number]): boolean {
    if (index[0] < this.fields.nStringsCnt && this.fields.IsNum[index[0]]) {
      count[0]++;
      index[0]++;
      return true;
    }
    return false;
  }
  /** Source grouping separator accepts the current or following group width, including the near-capacity merged slot. @param value - Nonnumeric fragment. @param position - Mutable UTF-16 cursor. @param fragment - Fragment index. @returns Whether the grouping separator was consumed. */
  protected GetThousandSep(value: OUString, position: [number], fragment: number): boolean {
    const separator = this.language.GetNumThousandSep(),
      state = this.fields,
      ordinarySpace =
        (separator.getStr()[0] === 0xa0 || separator.getStr()[0] === 0x202f) &&
        value.getLength() === 1 &&
        value.getStr()[0] === 0x20 &&
        separator.getLength() === 1;
    if (
      !(value.equals(separator) || ordinarySpace) ||
      fragment >= state.nStringsCnt - 1 ||
      !state.IsNum[fragment + 1]
    )
      return false;
    const grouping = new DigitGroupingIterator(this.language.GetLocaleData().getDigitGrouping());
    try {
      const width = state.sStrArray[fragment + 1]?.getLength() ?? 0;
      if (
        width === grouping.get() ||
        width === grouping.advance().get() ||
        state.nPosThousandString === fragment + 1
      ) {
        position[0] += separator.getLength();
        return true;
      }
      return false;
    } finally {
      grouping.dispose();
    }
  }
  /** Original logical scanner compares the whole uppercase input against the format scanner's localized TRUE/FALSE keywords. @param value - Uppercase input. @returns 1 for true, -1 for false, zero otherwise. */
  protected GetLogical(value: OUString): number {
    const scanner = this.language.GetFormatScanner();
    if (value.equals(scanner.GetTrueString())) return 1;
    if (value.equals(scanner.GetFalseString())) return -1;
    return 0;
  }
  /** Original day fragment accepts up to two digits and values through 31, including zero. @param numberIndex - Numeric-fragment index. @returns Day or zero. */
  protected ImplGetDay(numberIndex: number): number {
    const state = this.fields,
      fragment = state.sStrArray[state.nNums[numberIndex] as number] as OUString;
    if (fragment.getLength() <= 2) {
      const day = toInt32(fragment.getStr().subarray(0, fragment.getLength())) & 0xffff;
      if (day <= 31) return day;
    }
    return 0;
  }
  /** Original numeric month conversion returns the calendar's month count as its invalid sentinel. @param numberIndex - Numeric-fragment index. @returns Zero-based month or invalid sentinel. */
  protected ImplGetMonth(numberIndex: number): number {
    let month = this.language.GetCalendar().getNumberOfMonthsInYear();
    const state = this.fields,
      fragment = state.sStrArray[state.nNums[numberIndex] as number] as OUString;
    if (fragment.getLength() <= 2) {
      const number = toInt32(fragment.getStr().subarray(0, fragment.getLength())) & 0xffff;
      if (number > 0 && number <= month) month = number - 1;
    }
    return month;
  }
  /** Original year fragment limits width, truncates to uint16 and expands short CE years through the scanner threshold. @param numberIndex - Numeric-fragment index. @returns Year or zero. */
  protected ImplGetYear(numberIndex: number): number {
    const state = this.fields,
      fragment = state.sStrArray[state.nNums[numberIndex] as number] as OUString,
      length = fragment.getLength();
    if (length > 6) return 0;
    let year = toInt32(fragment.getStr().subarray(0, length)) & 0xffff;
    if (state.mbEraCE && year < 100 && length < 3)
      year = SvNumberFormatter.ExpandTwoDigitYear(year, state.nYear2000);
    return year;
  }
  /** Original cached shape check for three numeric ISO year-month-day fragments. @returns Whether the shape may be ISO 8601. */
  protected MayBeIso8601(): boolean {
    const state = this.fields;
    if (state.nMayBeIso8601 === 0) {
      state.nMayBeIso8601 = 1;
      const year =
        state.nNumericsCnt >= 1 && (state.nNums[0] as number) < state.nStringsCnt
          ? (state.sStrArray[state.nNums[0] as number] as OUString)
          : null;
      if (
        year?.getLength() &&
        state.nNumericsCnt >= 3 &&
        (state.nNums[2] as number) < state.nStringsCnt
      ) {
        const firstSeparator = state.sStrArray[(state.nNums[0] as number) + 1] as OUString,
          month = state.sStrArray[state.nNums[1] as number] as OUString,
          secondSeparator = state.sStrArray[(state.nNums[1] as number) + 1] as OUString,
          day = state.sStrArray[state.nNums[2] as number] as OUString;
        if (firstSeparator.getLength() === 1 && firstSeparator.getStr()[0] === 45) {
          const monthNumber = toInt32(month.getStr().subarray(0, month.getLength()));
          if (
            monthNumber >= 1 &&
            monthNumber <= 12 &&
            secondSeparator.getLength() === 1 &&
            secondSeparator.getStr()[0] === 45
          ) {
            const dayNumber = toInt32(day.getStr().subarray(0, day.getLength()));
            if (dayNumber >= 1 && dayNumber <= 31) {
              const length = year.getLength();
              state.nMayBeIso8601 = length >= 4 ? 4 : length === 3 ? 3 : length > 0 ? 2 : 1;
            }
          }
        }
      }
    }
    return state.nMayBeIso8601 > 1;
  }
  /** Original cached day-month-year versus year-month-day shape decision for a named month. @returns Whether either source order is possible. */
  protected MayBeMonthDate(): boolean {
    const state = this.fields;
    if (state.nMayBeMonthDate === 0) {
      state.nMayBeMonthDate = 1;
      if (state.nNumericsCnt >= 2 && (state.nNums[1] as number) < state.nStringsCnt) {
        const month = state.sStrArray[(state.nNums[0] as number) + 1] as OUString,
          units = month.getStr();
        if (month.getLength() >= 3 && units[0] === 45 && units[month.getLength() - 1] === 45) {
          const first = state.sStrArray[state.nNums[0] as number] as OUString,
            second = state.sStrArray[state.nNums[1] as number] as OUString,
            firstYear = first.getLength() >= 3,
            secondYear = second.getLength() >= 3,
            firstNumber = firstYear ? 0 : toInt32(first.getStr().subarray(0, first.getLength())),
            secondNumber = secondYear
              ? 0
              : toInt32(second.getStr().subarray(0, second.getLength())),
            firstDay = !firstYear && firstNumber >= 1 && firstNumber <= 31,
            secondDay = !secondYear && secondNumber >= 1 && secondNumber <= 31;
          if (firstDay && !secondDay) state.nMayBeMonthDate = 2;
          else if (!firstDay && secondDay) state.nMayBeMonthDate = 3;
          else if (firstDay && secondDay) state.nMayBeMonthDate = 2;
        }
      }
    }
    return state.nMayBeMonthDate > 1;
  }
  /** Original ordered date-pattern matching, including generated locale patterns, signed years, decimal ambiguity and trailing blanks. @param startPatternAt - First input particle. @returns Whether a native acceptance pattern matched. */
  protected IsAcceptedDatePattern(startPatternAt: number): boolean {
    const state = this.fields;
    if (state.nAcceptedDatePattern >= -1) return state.nAcceptedDatePattern >= 0;
    if (!state.nNumericsCnt) state.nAcceptedDatePattern = -1;
    else if (!state.sDateAcceptancePatterns.length) {
      const evaluation = this.language.GetEvalDateFormat(),
        format = state.mpFormat,
        localeData = this.language.GetLocaleData(),
        currentPatterns = localeData.getDateAcceptancePatterns();
      let patterns: readonly OUString[] = currentPatterns;
      let initialPatterns: OUString[] | null = null;
      if (
        format &&
        evaluation !== NfEvalDateFormat.Format &&
        format.GetLanguage() !== this.language.GetIniLanguage()
      ) {
        const initialLocale = convertLanguageToLocale(this.language.GetIniLanguage(), false);
        try {
          localeData.changeLocale(initialLocale);
          initialPatterns = localeData
            .getDateAcceptancePatterns()
            .map((pattern) => new OUString(pattern));
        } finally {
          localeData.changeLocale(this.language.fields.locale);
          initialLocale.dispose();
        }
        if (evaluation === NfEvalDateFormat.International) patterns = initialPatterns;
        else if (evaluation === NfEvalDateFormat.InternationalThenFormat)
          patterns = [...initialPatterns, ...currentPatterns];
        else patterns = [...currentPatterns, ...initialPatterns];
      }
      try {
        state.sDateAcceptancePatterns = patterns.map((pattern) => new OUString(pattern));
      } finally {
        if (initialPatterns) for (const pattern of initialPatterns) pattern.dispose();
      }
      state.nAcceptedDatePattern = state.sDateAcceptancePatterns.length ? -2 : -1;
    }
    if (state.nAcceptedDatePattern === -1) return false;
    state.nDatePatternStart = startPatternAt;
    const monthsInYear = this.language.GetCalendar().getNumberOfMonthsInYear(),
      localeData = this.language.GetLocaleData(),
      decimal = localeData.getNumDecimalSep(),
      alternate = localeData.getNumDecimalSepAlt(),
      decimalCharacter = decimal.getLength() === 1 ? decimal.getStr()[0] : -1,
      alternateCharacter = alternate.getLength() === 1 ? alternate.getStr()[0] : -1;
    for (
      let patternIndex = 0;
      patternIndex < state.sDateAcceptancePatterns.length;
      patternIndex++
    ) {
      const pattern = text(state.sDateAcceptancePatterns[patternIndex] as OUString);
      if (
        pattern.length === 3 &&
        (pattern.charCodeAt(1) === decimalCharacter || pattern.charCodeAt(1) === alternateCharacter)
      )
        continue;
      let next = state.nDatePatternStart,
        patternPosition = 0,
        okay = true;
      state.nDatePatternNumbers = 0;
      for (
        ;
        patternPosition < pattern.length && okay && next < state.nStringsCnt;
        patternPosition++, next++
      ) {
        const token = pattern[patternPosition];
        if (token === "Y" || token === "M" || token === "D") {
          okay = Boolean(state.IsNum[next]);
          if (okay && (token === "M" || token === "D")) {
            const fragment = state.sStrArray[next] as OUString;
            okay = fragment.getLength() <= 2;
            if (okay) {
              const number = toInt32(fragment.getStr().subarray(0, fragment.getLength()));
              okay = number >= 1 && number <= (token === "M" ? monthsInYear : 31);
            }
          }
          if (okay) state.nDatePatternNumbers++;
        } else {
          okay = !state.IsNum[next];
          if (okay) {
            const fragment = text(state.sStrArray[next] as OUString),
              separatorLength = lcl_getPatternSeparatorLength(pattern, patternPosition);
            okay =
              fragment.length === separatorLength &&
              pattern.indexOf(fragment, patternPosition) === patternPosition;
            if (okay) patternPosition += fragment.length - 1;
            else if ((okay = lcl_IsSignedYearSep(fragment, pattern, patternPosition)))
              patternPosition += fragment.length - 2;
            else if (
              patternPosition + fragment.length > pattern.length &&
              fragment[fragment.length - 1] === " "
            ) {
              const padded = fragment
                .replace(/ +$/u, "")
                .padEnd(pattern.length - patternPosition, " ");
              okay = pattern.indexOf(padded, patternPosition) === patternPosition;
              if (okay) patternPosition += padded.length - 1;
            }
          }
        }
      }
      if (!okay) continue;
      if (next < state.nStringsCnt) {
        let position = 0,
          check = next;
        if (patternPosition > 0 && next > 0) {
          let patternCheck = patternPosition - 1;
          if (!"YMD".includes(pattern[patternCheck] as string)) {
            check = next - 1;
            do {
              position++;
              patternCheck--;
            } while (patternCheck > 0 && !"YMD".includes(pattern[patternCheck] as string));
          }
        }
        if (!state.IsNum[check]) {
          const fragment = state.sStrArray[check] as OUString,
            cursor: [number] = [position],
            blanks = this.SkipBlanks(fragment, cursor);
          if (cursor[0] === fragment.getLength() && (blanks || !state.IsNum[next])) {
            state.nAcceptedDatePattern = patternIndex;
            return true;
          }
        }
      } else if (patternPosition === pattern.length) {
        state.nAcceptedDatePattern = patternIndex;
        return true;
      }
    }
    state.nAcceptedDatePattern = -1;
    return false;
  }
  /** Original pattern-separator query, including signed years and the source's set-not-add cursor result. @param particle - Input fragment index. @param position - Mutable fragment cursor. @param signedYear - Mutable signed-year flag. @returns Whether this separator belongs to the accepted pattern. */
  protected SkipDatePatternSeparator(
    particle: number,
    position: [number],
    signedYear: [boolean],
  ): boolean {
    const state = this.fields;
    if (!this.IsAcceptedDatePattern(state.nNumericsCnt ? (state.nNums[0] as number) : 0))
      return false;
    if (
      particle < state.nDatePatternStart ||
      particle >= state.nStringsCnt ||
      state.IsNum[particle]
    )
      return false;
    let next = state.nDatePatternStart;
    const pattern = text(state.sDateAcceptancePatterns[state.nAcceptedDatePattern] as OUString);
    for (
      let patternPosition = 0;
      patternPosition < pattern.length && next < state.nStringsCnt;
      patternPosition++, next++
    ) {
      if ("YMD".includes(pattern[patternPosition] as string)) continue;
      if (next === particle) {
        const fragment = text(state.sStrArray[next] as OUString),
          separatorLength = lcl_getPatternSeparatorLength(pattern, patternPosition);
        let okay =
          fragment.length === separatorLength &&
          pattern.indexOf(fragment, patternPosition) === patternPosition;
        if (!okay) {
          okay = lcl_IsSignedYearSep(fragment, pattern, patternPosition);
          if (okay) signedYear[0] = true;
        }
        if (!okay && patternPosition + fragment.length > pattern.length && fragment.endsWith(" ")) {
          const padded = fragment.replace(/ +$/u, "").padEnd(pattern.length - patternPosition, " ");
          okay = pattern.indexOf(padded, patternPosition) === patternPosition;
        }
        if (okay) {
          position[0] = fragment.length;
          return true;
        }
        return false;
      }
      patternPosition += (state.sStrArray[next] as OUString).getLength() - 1;
    }
    return false;
  }
  /** Original accepted-pattern numeric count; initializes the pattern cache on first query. @returns Number of D/M/Y particles. */
  protected GetDatePatternNumbers(): number {
    const state = this.fields;
    if (!this.IsAcceptedDatePattern(state.nNumericsCnt ? (state.nNums[0] as number) : 0)) return 0;
    return state.nDatePatternNumbers;
  }
  /** Original ordinal D/M/Y type lookup in the matched pattern. @param number - Zero-based numeric particle. @param type - Source D, M or Y. @returns Type match. */
  protected IsDatePatternNumberOfType(number: number, type: string): boolean {
    if (this.GetDatePatternNumbers() <= number) return false;
    const pattern = text(
      this.fields.sDateAcceptancePatterns[this.fields.nAcceptedDatePattern] as OUString,
    );
    let numeric = 0;
    for (const char of pattern) {
      if (char === "Y" || char === "M" || char === "D") {
        if (numeric === number) return char === type;
        numeric++;
      }
    }
    return false;
  }
  /** Original packed first-three D/M/Y order bytes of the accepted pattern. @returns Packed order, or zero. */
  protected GetDatePatternOrder(): number {
    const state = this.fields;
    if (!this.IsAcceptedDatePattern(state.nNumericsCnt ? (state.nNums[0] as number) : 0)) return 0;
    const pattern = text(state.sDateAcceptancePatterns[state.nAcceptedDatePattern] as OUString);
    let order = 0;
    for (const char of pattern) {
      if (order & 0xff0000) break;
      if (char === "Y" || char === "M" || char === "D") order = (order << 8) | char.charCodeAt(0);
    }
    return order;
  }
  /** Original accepted-pattern order selection, with format and locale fallbacks. @param fromFormatIfNoPattern - Prefer a compiled format without a pattern. @returns DateOrder. */
  protected GetDateOrder(fromFormatIfNoPattern = false): DateOrder {
    const order = this.GetDatePatternOrder(),
      localeOrder = (): DateOrder => this.language.GetLocaleData().getDateOrder();
    if (!order)
      return fromFormatIfNoPattern && this.fields.mpFormat
        ? this.fields.mpFormat.GetDateOrder()
        : localeOrder();
    const first = (order >> 16) & 0xff,
      second = (order >> 8) & 0xff,
      third = order & 0xff;
    switch (first) {
      case 89:
        if (second === 77 && third === 68) return DateOrder.YMD;
        break;
      case 77:
        if (second === 68 && third === 89) return DateOrder.MDY;
        break;
      case 68:
        if (second === 77 && third === 89) return DateOrder.DMY;
        break;
      case 0:
        switch (second) {
          case 89:
            if (third === 77) return DateOrder.YMD;
            break;
          case 77:
            if (third === 89) return DateOrder.DMY;
            if (third === 68) return DateOrder.MDY;
            break;
          case 68:
            if (third === 89) return DateOrder.MDY;
            if (third === 77) return DateOrder.DMY;
            break;
          case 0:
            if (third === 89) return DateOrder.YMD;
            if (third === 77) return DateOrder.MDY;
            if (third === 68) return DateOrder.DMY;
            break;
        }
        break;
    }
    return localeOrder();
  }
  /** Original middle-month ordering prefers the named-month shape, then exact format or locale order, with day-validity switches. @param formatTurn - Whether the compiled format's exact order applies. @param locale - Current locale data. @param dateOrder - Evaluated short order. @returns Long date order. */
  protected GetMiddleMonthLongDateOrder(
    formatTurn: boolean,
    locale: LocaleDataWrapper,
    dateOrder: DateOrder,
  ): LongDateOrder {
    if (this.MayBeMonthDate())
      return this.fields.nMayBeMonthDate === 2 ? LongDateOrder.DMY : LongDateOrder.YMD;
    const exact = formatTurn ? (this.fields.mpFormat as SvNumberformatConstReference).GetExactDateOrder() : 0;
    let order: LongDateOrder;
    if (!exact) order = locale.getLongDateOrder();
    else if (((exact >> 16) & 0xff) === 89 && (exact & 0xff) === 68) order = LongDateOrder.YMD;
    else if (((exact >> 16) & 0xff) === 68 && (exact & 0xff) === 89) order = LongDateOrder.DMY;
    else order = locale.getLongDateOrder();
    if (order !== LongDateOrder.YMD && order !== LongDateOrder.DMY) {
      switch (dateOrder) {
        case DateOrder.YMD:
          order = LongDateOrder.YMD;
          break;
        case DateOrder.DMY:
          order = LongDateOrder.DMY;
          break;
        default:
          break;
      }
    } else if (order === LongDateOrder.DMY && dateOrder === DateOrder.YMD) {
      if (!this.ImplGetDay(0) && this.ImplGetDay(1)) order = LongDateOrder.YMD;
    } else if (order === LongDateOrder.YMD && dateOrder === DateOrder.DMY) {
      if (!this.ImplGetDay(1) && this.ImplGetDay(0)) order = LongDateOrder.DMY;
    }
    return order;
  }
  /** Original ISO override decision for the cached three-part numeric date shape. @param order - Evaluated date order or Invalid. @returns Whether ISO order is forced. */
  protected CanForceToIso8601(order: DateOrder): boolean {
    const state = this.fields;
    if (!this.MayBeIso8601()) return false;
    if (state.nMayBeIso8601 >= 3) return true;
    if (order === DateOrder.Invalid) {
      if (
        this.GetDatePatternNumbers() === state.nNumericsCnt &&
        this.IsDatePatternNumberOfType(0, "Y")
      )
        return false;
      order = this.GetDateOrder();
    }
    if (this.GetDatePatternNumbers() === 0) return true;
    const first = state.sStrArray[state.nNums[0] as number] as OUString,
      number = toInt32(first.getStr().subarray(0, first.getLength()));
    switch (order) {
      case DateOrder.DMY:
        return number < 1 || number > 31;
      case DateOrder.MDY:
        return number < 1 || number > 12;
      case DateOrder.YMD:
        return true;
      default:
        return false;
    }
  }
  /** Original format/date-evaluation policy for an ISO candidate. @returns Whether the ISO candidate is acceptable. */
  protected IsAcceptableIso8601(): boolean {
    const format = this.fields.mpFormat;
    if (format && format.GetType() & SvNumFormatType.DATE) {
      switch (this.language.GetEvalDateFormat()) {
        case NfEvalDateFormat.International:
          return this.CanForceToIso8601(this.GetDateOrder());
        case NfEvalDateFormat.Format:
          return this.CanForceToIso8601(format.GetDateOrder());
        default:
          return (
            this.CanForceToIso8601(this.GetDateOrder()) ||
            this.CanForceToIso8601(format.GetDateOrder())
          );
      }
    }
    return this.CanForceToIso8601(this.GetDateOrder());
  }
  /** Original matched-string return marker clears only the virgin bit from its acceptance check. @returns Whether any substantive match was recorded. */
  protected MatchedReturn(): boolean {
    if (this.fields.nMatchedAllStrings & ~0x08) {
      this.fields.nMatchedAllStrings |= 0x10;
      return true;
    }
    return false;
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
