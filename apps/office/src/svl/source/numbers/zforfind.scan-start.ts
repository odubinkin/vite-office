/** @fileoverview ImpSvNumberInputScan scan-start implementation, called with the original native owner as this. */
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import * as KCharacterType from "../../../offapi/com/sun/star/i18n/KCharacterType";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { CalendarItem2Names } from "../../../unotools/source/i18n/calendarwrapper";
import { SvNumFormatType } from "../../inc/zforlist";
import { SV_MAX_COUNT_INPUT_STRINGS, type ImpSvNumberInputScanContext } from "./zforfind.context";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";

/** Original alternating ASCII-digit/non-digit scanner over the NUL-terminated UTF-16 buffer. @param input - Input string. @param position - Mutable source cursor. @param symbol - Output fragment. @returns Whether the fragment starts with a digit.  @param this - Original native owner shared by its implementation fragments. */
export function NextNumberStringSymbol(
  this: ImpSvNumberInputScanContext,
  input: OUString,
  position: [number],
  symbol: OUString,
): boolean {
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

/** Original near-capacity grouping relief; consumes only complete three-digit groups after the locale separator. @param input - Input string. @param position - Mutable source cursor. @param symbol - Current numeric fragment. @returns Whether a complete group was found.  @param this - Original native owner shared by its implementation fragments. */
export function SkipThousands(
  this: ImpSvNumberInputScanContext,
  input: OUString,
  position: [number],
  symbol: OUString,
): boolean {
  const units = input.getStr();
  const separator = this["language"].GetNumThousandSep();
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
      const match = this["StringPtrContains"](separator, units, here - 1);
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

/** Original twenty-slot number/string division, including source pointer behavior at embedded NUL. @param input - Uppercase/native-number-transformed input. @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function NumberStringDivision(this: ImpSvNumberInputScanContext, input: OUString): void {
  const position: [number] = [0];
  const state = this["fields"];
  while (position[0] < input.getLength() && state.nStringsCnt < SV_MAX_COUNT_INPUT_STRINGS) {
    const slot = state.nStringsCnt;
    if (this["NextNumberStringSymbol"](input, position, state.sStrArray[slot] as OUString)) {
      state.IsNum[slot] = true;
      state.nNums[state.nNumericsCnt] = slot;
      state.nNumericsCnt++;
      if (slot >= SV_MAX_COUNT_INPUT_STRINGS - 7 && state.nPosThousandString === 0)
        if (this["SkipThousands"](input, position, state.sStrArray[slot] as OUString))
          state.nPosThousandString = slot;
    } else state.IsNum[slot] = false;
    state.nStringsCnt++;
  }
}

/** Source one-character fast path before bounded substring comparison. @param what - Needle. @param value - Haystack. @param position - UTF-16 offset. @returns Match.  @param this - Original native owner shared by its implementation fragments. */
export function StringContains(
  this: ImpSvNumberInputScanContext,
  what: OUStringConstReference,
  value: OUString,
  position: number,
): boolean {
  if (what.isEmpty() || value.getLength() <= position) return false;
  if (what.getStr()[0] !== value.getStr()[position]) return false;
  return this["StringContainsImpl"](what, value, position);
}

/** Source pointer fast path; caller supplies a valid starting offset. @param what - Needle. @param units - NUL-terminated haystack. @param position - UTF-16 offset. @returns Match.  @param this - Original native owner shared by its implementation fragments. */
export function StringPtrContains(
  this: ImpSvNumberInputScanContext,
  what: OUStringConstReference,
  units: Uint16Array,
  position: number,
): boolean {
  if (what.getStr()[0] !== units[position]) return false;
  return this["StringPtrContainsImpl"](what, units, position);
}

/** Source bounded OUString substring comparison. @param what - Needle. @param value - Haystack. @param position - UTF-16 offset. @returns Match.  @param this - Original native owner shared by its implementation fragments. */
export function StringContainsImpl(
  this: ImpSvNumberInputScanContext,
  what: OUStringConstReference,
  value: OUString,
  position: number,
): boolean {
  return (
    position + what.getLength() <= value.getLength() &&
    this["StringPtrContainsImpl"](what, value.getStr(), position)
  );
}

/** Source pointer comparison returns false for an empty needle. @param what - Needle. @param units - Haystack. @param position - UTF-16 offset. @returns Match.  @param this - Original native owner shared by its implementation fragments. */
export function StringPtrContainsImpl(
  this: ImpSvNumberInputScanContext,
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

/** Source date-word boundary: ASCII separators, then surrogate and KCharacterType handling. @param what - Word. @param value - Input. @param position - UTF-16 offset. @returns Whether the complete word matches.  @param this - Original native owner shared by its implementation fragments. */
export function StringContainsWord(
  this: ImpSvNumberInputScanContext,
  what: OUString,
  value: OUString,
  position: number,
): boolean {
  if (what.isEmpty() || value.getLength() < position + what.getLength()) return false;
  if (!this["StringPtrContainsImpl"](what, value.getStr(), position)) return false;
  position += what.getLength();
  if (position === value.getLength()) return true;
  const code = value.getStr()[position] as number;
  if (code === 32 || code === 45 || code === 46 || code === 47) return true;
  if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122))
    return false;
  const next: [number] = [position];
  value.iterateCodePoints(next);
  if (position + 1 < next[0]) return true;
  const type = this["language"].GetCharClass().getCharacterType(value, position);
  if (type & (KCharacterType.UPPER | KCharacterType.LOWER | KCharacterType.DIGIT)) return false;
  return true;
}

/** Original InitText replaces cached uppercase calendar names in the source's section order. @returns Nothing.  @param this - Original native owner shared by its implementation fragments. */
export function InitText(this: ImpSvNumberInputScanContext): void {
  const state = this["fields"],
    calendar = this["language"].GetCalendar(),
    character = this["language"].GetCharClass();
  /** Replaces source paired unique_ptr arrays from one calendar service response. @param names - Calendar values. @param fullTarget - Old full names. @param abbreviatedTarget - Old abbreviations. @returns Uppercase paired arrays. */
  const upper =
    /** Implements upper. @param names - Names. @param fullTarget - Full Target. @param abbreviatedTarget - Abbreviated Target. @returns The [OUString[], OUString[]] result. */ (
      names: CalendarItem2Names[],
      fullTarget: OUString[],
      abbreviatedTarget: OUString[],
    ): [OUString[], OUString[]] => {
      for (const old of fullTarget) old.dispose();
      for (const old of abbreviatedTarget) old.dispose();
      try {
        return [
          names.map(
            /** Computes the item result. @param item - Item. @returns The computed result. */ (
              item,
            ) => character.uppercase(item.FullName),
          ),
          names.map(
            /** Computes the item result. @param item - Item. @returns The computed result. */ (
              item,
            ) => character.uppercase(item.AbbrevName),
          ),
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

/** Original calendar-name lookup: full names precede abbreviated names, including source German and September alternatives. @param value - Uppercase input. @param position - Mutable cursor. @returns One-based month, negative when abbreviated, or zero.  @param this - Original native owner shared by its implementation fragments. */
export function GetMonth(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): number {
  if (value.getLength() <= position[0]) return 0;
  const state = this["fields"];
  if (!state.bTextInitialized) this["InitText"]();
  const locale = this["language"].fields.locale,
    language = text(locale.Language),
    country = text(locale.Country);
  /** Tests one literal through the source date-word boundary. @param literal - Uppercase literal. @returns Match. */
  const word = /** Implements word. @param literal - Literal. @returns The boolean result. */ (
    literal: string,
  ): boolean => {
    const candidate = unicode(literal);
    try {
      return this["StringContainsWord"](candidate, value, position[0]);
    } finally {
      candidate.dispose();
    }
  };
  /** Compares a native uppercase abbreviation without retaining a temporary OUString. @param name - Cached name. @param literal - Source literal. @returns Equality. */
  const equals =
    /** Implements equals. @param name - Name. @param literal - Literal. @returns The boolean result. */ (
      name: OUString | undefined,
      literal: string,
    ): boolean => {
      if (!name) return false;
      const candidate = unicode(literal);
      try {
        return name.equals(candidate);
      } finally {
        candidate.dispose();
      }
    };
  const count = this["language"].GetCalendar().getNumberOfMonthsInYear();
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
      if (enabled && name && this["StringContainsWord"](name, value, position[0])) {
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

/** Original active-locale currency match followed by explicit format-symbol match, caching only the uppercased locale symbol. @param value - Already uppercased input. @param position - Mutable UTF-16 offset. @returns Symbol matched.  @param this - Original native owner shared by its implementation fragments. */
export function GetCurrency(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): boolean {
  const state = this["fields"];
  if (value.getLength() <= position[0]) return false;
  const charClass = this["language"].GetCharClass();
  if (state.aUpperCurrSymbol.isEmpty()) {
    const language = state.mpFormat?.GetLanguage() ?? this["language"].fields.ActLnge[0],
      symbol = SvNumberFormatter.GetCurrencyEntry(language).GetSymbol(),
      upper = charClass.uppercase(symbol);
    try {
      state.aUpperCurrSymbol.assign(upper);
    } finally {
      upper.dispose();
    }
  }
  if (this["StringContains"](state.aUpperCurrSymbol, value, position[0])) {
    position[0] += state.aUpperCurrSymbol.getLength();
    return true;
  }
  if (state.mpFormat) {
    const symbol = new OUString(),
      extension = new OUString();
    try {
      if (
        state.mpFormat.GetNewCurrencySymbol(symbol, extension) &&
        symbol.getLength() <= value.getLength() - position[0]
      ) {
        const upper = charClass.uppercase(symbol);
        try {
          symbol.assign(upper);
        } finally {
          upper.dispose();
        }
        if (this["StringContains"](symbol, value, position[0])) {
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

/** Source literal-token comparison across numeric subformats and a remaining input suffix. @param input - Already prepared input. @param position - Consumed prefix width. @param token - Token offset or 0xffff for last. @param dontDetectNegation - Suppress sign detection. @returns Whether a format literal matched.  @param this - Original native owner shared by its implementation fragments. */
export function ScanStringNumFor(
  this: ImpSvNumberInputScanContext,
  input: OUString,
  position: number,
  token: number,
  dontDetectNegation = false,
): boolean {
  const state = this["fields"],
    format = state.mpFormat;
  if (!format) return false;
  const transliteration = this["language"].GetTransliteration();
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
      if (
        !dontDetectNegation &&
        token === 0 &&
        !first &&
        state.nSign < 0 &&
        format.IsSecondSubformatRealNegative()
      ) {
        const withoutSpaces = Array.from(value.getStr().subarray(0, value.getLength())).filter(
          /** Computes the unit result. @param unit - Unit. @returns The computed result. */ (
            unit,
          ) => unit !== 32,
        );
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
    } else if (!dontDetectNegation && subformat === 1 && format.IsSecondSubformatRealNegative()) {
      if (state.nStringScanSign < 0) {
        if (state.nSign < 0 && state.nStringScanNumFor !== 1) state.nStringScanSign = 1;
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

/** Source leading fragment classification: sign, decimal, currency, month/day names and compiled-format literal. @param value - Already uppercased start fragment. @returns Whether accepted.  @param this - Original native owner shared by its implementation fragments. */
export function ScanStartString(this: ImpSvNumberInputScanContext, value: OUString): boolean {
  const state = this["fields"],
    position: [number] = [0];
  this["SkipBlanks"](value, position);
  state.nSign = this["GetSign"](value, position);
  if (state.nSign) this["SkipBlanks"](value, position);
  if (state.nMatchedAllStrings && !(state.nSign && value.getLength() === 1)) {
    if (this["ScanStringNumFor"](value, position[0], 0, true)) state.nMatchedAllStrings |= 0x04;
    else state.nMatchedAllStrings = 0;
  }
  if (state.nSign && position[0] === value.getLength()) return true;
  const startBlanks = position[0];
  if (this["GetDecSep"](value, position)) {
    if (this["SkipBlanks"](value, position)) position[0] = startBlanks;
    else state.nDecPos = 1;
  } else if (this["GetCurrency"](value, position)) {
    state.eScannedType = SvNumFormatType.CURRENCY;
    this["SkipBlanks"](value, position);
    if (state.nSign === 0) {
      state.nSign = this["GetSign"](value, position);
      if (state.nSign) this["SkipBlanks"](value, position);
    }
    if (this["GetDecSep"](value, position)) {
      if (this["SkipBlanks"](value, position)) {
        position[0] = startBlanks;
        state.eScannedType = SvNumFormatType.UNDEFINED;
      } else state.nDecPos = 1;
    }
  } else {
    const monthStart = position[0];
    let month = this["GetMonth"](value, position);
    if (month < 0) {
      const possibleDay: [number] = [monthStart];
      state.nDayOfWeek = this["GetDayOfWeek"](value, possibleDay);
      if (state.nDayOfWeek < 0) {
        this["SkipChar"](46, value, possibleDay);
        this["SkipString"](
          this["language"].GetLocaleData().getLongDateDayOfWeekSep(),
          value,
          possibleDay,
        );
        this["SkipBlanks"](value, possibleDay);
        if (this["GetMonth"](value, possibleDay)) {
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
        if (state.nMonth < 0) this["SkipChar"](46, value, position);
        this["SkipBlanks"](value, position);
      } else position[0] = monthStart;
    } else {
      const day = this["GetDayOfWeek"](value, position);
      if (day) {
        state.eScannedType = SvNumFormatType.DATE;
        if (position[0] < value.getLength()) {
          if (day < 0) this["SkipChar"](46, value, position);
          else {
            this["SkipBlanks"](value, position);
            this["SkipString"](
              this["language"].GetLocaleData().getLongDateDayOfWeekSep(),
              value,
              position,
            );
          }
          this["SkipBlanks"](value, position);
          month = this["GetMonth"](value, position);
          if (month) {
            if (
              position[0] < value.getLength() ||
              (state.nStringsCnt >= 4 && state.nNumericsCnt >= 2)
            ) {
              state.nMonth = month;
              state.nMonthPos = 1;
              if (state.nMonth < 0) this["SkipChar"](46, value, position);
              this["SkipBlanks"](value, position);
            } else position[0] = monthStart;
          }
        }
        if (!state.nMonth) this["IsAcceptedDatePattern"](1);
      }
    }
    if (
      state.nMonth &&
      position[0] + 1 === value.getLength() &&
      !this["SkipChar"](45, value, position)
    )
      this["SkipChar"](47, value, position);
  }
  if (position[0] < value.getLength() && !this["ScanStringNumFor"](value, position[0], 0))
    return this["MatchedReturn"]();
  return true;
}
