/** @fileoverview ImpSvNumberInputScan scan-date implementation, called with the original native owner as this. */
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { StringToDouble } from "./zforfind.scan-value";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import { toInt32 } from "../../../o3tl/inc/string_view";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { DigitGroupingIterator } from "../../../unotools/inc/digitgroupingiterator";
import {
  DateOrder,
  LongDateOrder,
  type LocaleDataWrapper,
} from "../../../unotools/source/i18n/localedatawrapper";
import { NfEvalDateFormat, SvNumFormatType, SvNumInputOptions } from "../../inc/zforlist";
import {
  lcl_IsSignedYearSep,
  lcl_getPatternSeparatorLength,
  type ImpSvNumberInputScanContext,
} from "./zforfind.context";
import { SvNumberFormatter } from "./zforlist";
import { type SvNumberformatConstReference } from "./zformat";

/** Original weekday-name lookup checks full then abbreviated name in calendar order. @param value - Uppercase input. @param position - Mutable cursor. @returns One-based day, negative when abbreviated, or zero.  @param this - Original native owner shared by its implementation fragments. */
export function GetDayOfWeek(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): number {
  if (value.getLength() <= position[0]) return 0;
  const state = this["fields"];
  if (!state.bTextInitialized) this["InitText"]();
  const count = this["language"].GetCalendar().getNumberOfDaysInWeek();
  for (let index = 0; index < count; index++) {
    const full = state.pUpperDayText[index],
      abbreviated = state.pUpperAbbrevDayText[index];
    if (full && this["StringContainsWord"](full, value, position[0])) {
      position[0] += full.getLength();
      return index + 1;
    }
    if (abbreviated && this["StringContainsWord"](abbreviated, value, position[0])) {
      position[0] += abbreviated.getLength();
      return -(index + 1);
    }
  }
  return 0;
}

/** Source single-character skip. @param code - Expected UTF-16 code unit. @param value - Input. @param position - Mutable cursor. @returns Match.  @param this - Original native owner shared by its implementation fragments. */
export function SkipChar(
  this: ImpSvNumberInputScanContext,
  code: number,
  value: OUString,
  position: [number],
): boolean {
  if (position[0] < value.getLength() && value.getStr()[position[0]] === code) {
    position[0]++;
    return true;
  }
  return false;
}

/** Source ASCII, no-break and narrow-no-break blank skip. @param value - Input. @param position - Mutable cursor. @returns Whether any blank was consumed.  @param this - Original native owner shared by its implementation fragments. */
export function SkipBlanks(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): boolean {
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

/** Source substring skip through StringContains. @param what - Expected text. @param value - Input. @param position - Mutable cursor. @returns Match.  @param this - Original native owner shared by its implementation fragments. */
export function SkipString(
  this: ImpSvNumberInputScanContext,
  what: OUStringConstReference,
  value: OUString,
  position: [number],
): boolean {
  if (!this["StringContains"](what, value, position[0])) return false;
  position[0] += what.getLength();
  return true;
}

/** Original decimal-separator lookup tries the current locale separator before its nonempty alternate. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Whether a separator was consumed.  @param this - Original native owner shared by its implementation fragments. */
export function GetDecSep(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): boolean {
  if (position[0] >= value.getLength()) return false;
  const separator = this["language"].GetNumDecimalSep();
  if (this["StringContains"](separator, value, position[0])) {
    position[0] += separator.getLength();
    return true;
  }
  const alternate = this["language"].GetNumDecimalSepAlt();
  if (!alternate.isEmpty() && this["StringContains"](alternate, value, position[0])) {
    position[0] += alternate.getLength();
    return true;
  }
  return false;
}

/** Original AM/PM recognition compares uppercase locale tokens against the already-uppercase scan input. @param value - Uppercase input. @param position - Mutable UTF-16 cursor. @returns Whether a marker was consumed.  @param this - Original native owner shared by its implementation fragments. */
export function GetTimeAmPm(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): boolean {
  if (position[0] >= value.getLength()) return false;
  const locale = this["language"].GetLocaleData(),
    character = this["language"].GetCharClass(),
    am = character.uppercase(locale.getTimeAM()),
    pm = character.uppercase(locale.getTimePM());
  try {
    if (this["StringContains"](am, value, position[0])) {
      this["fields"].nAmPm = 1;
      position[0] += locale.getTimeAM().getLength();
      return true;
    }
    if (this["StringContains"](pm, value, position[0])) {
      this["fields"].nAmPm = -1;
      position[0] += locale.getTimePM().getLength();
      return true;
    }
    return false;
  } finally {
    pm.dispose();
    am.dispose();
  }
}

/** Original fractional-second separator accepts ISO dot/comma first, then the loaded locale item. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Whether a separator was consumed.  @param this - Original native owner shared by its implementation fragments. */
export function GetTime100SecSep(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): boolean {
  if (position[0] >= value.getLength()) return false;
  const code = value.getStr()[position[0]];
  if (this["fields"].bIso8601Tsep && (code === 0x2e || code === 0x2c)) {
    position[0]++;
    return true;
  }
  const separator = this["language"].GetLocaleData().getTime100SecSep();
  if (this["StringContains"](separator, value, position[0])) {
    position[0] += separator.getLength();
    return true;
  }
  return false;
}

/** Original time-part conversion: HH:MM:SS.fraction, MM:SS when the compiled format says so, duration and leap-second validation. The output is assigned even when validation fails. @param output - Mutable serial-day fraction. @param firstIndex - First numeric part. @param count - Number of parts. @param inputOptions - Native SvNumInputOptions flags. @returns Whether the time fields are accepted.  @param this - Original native owner shared by its implementation fragments. */
export function GetTimeRef(
  this: ImpSvNumberInputScanContext,
  output: [number],
  firstIndex: number,
  count: number,
  inputOptions: number,
): boolean {
  const state = this["fields"],
    start = firstIndex;
  let index = firstIndex,
    valid = true,
    hour = 0,
    minute = 0,
    second = 0,
    second100 = 0;
  /** The source's numeric parts are ASCII-digit fragments; OUString::toInt32 returns zero on signed32 overflow. @param part - Fragment index. @returns Native signed32 value. */
  const integer = /** Implements integer. @param part - Part. @returns The number result. */ (
    part: number,
  ): number => {
    const value = state.sStrArray[state.nNums[part] as number] as OUString,
      parsed = value.toInt64();
    return parsed > 2147483647n || parsed < -2147483648n ? 0 : Number(parsed);
  };
  /** Source flags a converted zero unless the exact fragment was "0" or "00". @param part - Fragment index. @param value - Converted integer. @returns Overflow status. */
  const overflow =
    /** Implements overflow. @param part - Part. @param value - Value. @returns The boolean result. */ (
      part: number,
      value: number,
    ): boolean => {
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
    second100 = StringToDouble(`.${digits}`);
  }
  output[0] = (hour * 3600 + minute * 60 + second + second100) / 86400;
  return valid;
}

/** Original leading-sign scan accepts plus, ASCII and Unicode minus, and an opening negative parenthesis. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Signed source indicator.  @param this - Original native owner shared by its implementation fragments. */
export function GetSign(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): number {
  if (position[0] >= value.getLength()) return 0;
  switch (value.getStr()[position[0]]) {
    case 0x2b:
      position[0]++;
      return 1;
    case 0x28:
      this["fields"].bNegCheck = true;
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

/** Original exponent-sign scan accepts only ASCII plus and minus. @param value - Input text. @param position - Mutable UTF-16 cursor. @returns Signed source indicator.  @param this - Original native owner shared by its implementation fragments. */
export function GetESign(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
): number {
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

/** Original numeric-fragment step advances both counters only when the current slot is numeric. @param index - Mutable fragment slot. @param count - Mutable numeric count. @returns Whether a numeric slot was consumed.  @param this - Original native owner shared by its implementation fragments. */
export function GetNextNumber(
  this: ImpSvNumberInputScanContext,
  index: [number],
  count: [number],
): boolean {
  if (index[0] < this["fields"].nStringsCnt && this["fields"].IsNum[index[0]]) {
    count[0]++;
    index[0]++;
    return true;
  }
  return false;
}

/** Source grouping separator accepts the current or following group width, including the near-capacity merged slot. @param value - Nonnumeric fragment. @param position - Mutable UTF-16 cursor. @param fragment - Fragment index. @returns Whether the grouping separator was consumed.  @param this - Original native owner shared by its implementation fragments. */
export function GetThousandSep(
  this: ImpSvNumberInputScanContext,
  value: OUString,
  position: [number],
  fragment: number,
): boolean {
  const separator = this["language"].GetNumThousandSep(),
    state = this["fields"],
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
  const grouping = new DigitGroupingIterator(this["language"].GetLocaleData().getDigitGrouping());
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

/** Original logical scanner compares the whole uppercase input against the format scanner's localized TRUE/FALSE keywords. @param value - Uppercase input. @returns 1 for true, -1 for false, zero otherwise.  @param this - Original native owner shared by its implementation fragments. */
export function GetLogical(this: ImpSvNumberInputScanContext, value: OUString): number {
  const scanner = this["language"].GetFormatScanner();
  if (value.equals(scanner.GetTrueString())) return 1;
  if (value.equals(scanner.GetFalseString())) return -1;
  return 0;
}

/** Original day fragment accepts up to two digits and values through 31, including zero. @param numberIndex - Numeric-fragment index. @returns Day or zero.  @param this - Original native owner shared by its implementation fragments. */
export function ImplGetDay(this: ImpSvNumberInputScanContext, numberIndex: number): number {
  const state = this["fields"],
    fragment = state.sStrArray[state.nNums[numberIndex] as number] as OUString;
  if (fragment.getLength() <= 2) {
    const day = toInt32(fragment.getStr().subarray(0, fragment.getLength())) & 0xffff;
    if (day <= 31) return day;
  }
  return 0;
}

/** Original numeric month conversion returns the calendar's month count as its invalid sentinel. @param numberIndex - Numeric-fragment index. @returns Zero-based month or invalid sentinel.  @param this - Original native owner shared by its implementation fragments. */
export function ImplGetMonth(this: ImpSvNumberInputScanContext, numberIndex: number): number {
  let month = this["language"].GetCalendar().getNumberOfMonthsInYear();
  const state = this["fields"],
    fragment = state.sStrArray[state.nNums[numberIndex] as number] as OUString;
  if (fragment.getLength() <= 2) {
    const number = toInt32(fragment.getStr().subarray(0, fragment.getLength())) & 0xffff;
    if (number > 0 && number <= month) month = number - 1;
  }
  return month;
}

/** Original year fragment limits width, truncates to uint16 and expands short CE years through the scanner threshold. @param numberIndex - Numeric-fragment index. @returns Year or zero.  @param this - Original native owner shared by its implementation fragments. */
export function ImplGetYear(this: ImpSvNumberInputScanContext, numberIndex: number): number {
  const state = this["fields"],
    fragment = state.sStrArray[state.nNums[numberIndex] as number] as OUString,
    length = fragment.getLength();
  if (length > 6) return 0;
  let year = toInt32(fragment.getStr().subarray(0, length)) & 0xffff;
  if (state.mbEraCE && year < 100 && length < 3)
    year = SvNumberFormatter.ExpandTwoDigitYear(year, state.nYear2000);
  return year;
}

/** Original cached shape check for three numeric ISO year-month-day fragments. @returns Whether the shape may be ISO 8601.  @param this - Original native owner shared by its implementation fragments. */
export function MayBeIso8601(this: ImpSvNumberInputScanContext): boolean {
  const state = this["fields"];
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

/** Original cached day-month-year versus year-month-day shape decision for a named month. @returns Whether either source order is possible.  @param this - Original native owner shared by its implementation fragments. */
export function MayBeMonthDate(this: ImpSvNumberInputScanContext): boolean {
  const state = this["fields"];
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
          secondNumber = secondYear ? 0 : toInt32(second.getStr().subarray(0, second.getLength())),
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

/** Original ordered date-pattern matching, including generated locale patterns, signed years, decimal ambiguity and trailing blanks. @param startPatternAt - First input particle. @returns Whether a native acceptance pattern matched.  @param this - Original native owner shared by its implementation fragments. */
export function IsAcceptedDatePattern(
  this: ImpSvNumberInputScanContext,
  startPatternAt: number,
): boolean {
  const state = this["fields"];
  if (state.nAcceptedDatePattern >= -1) return state.nAcceptedDatePattern >= 0;
  if (!state.nNumericsCnt) state.nAcceptedDatePattern = -1;
  else if (!state.sDateAcceptancePatterns.length) {
    const evaluation = this["language"].GetEvalDateFormat(),
      format = state.mpFormat,
      localeData = this["language"].GetLocaleData(),
      currentPatterns = localeData.getDateAcceptancePatterns();
    let patterns: readonly OUString[] = currentPatterns;
    let initialPatterns: OUString[] | null = null;
    if (
      format &&
      evaluation !== NfEvalDateFormat.Format &&
      format.GetLanguage() !== this["language"].GetIniLanguage()
    ) {
      const initialLocale = convertLanguageToLocale(this["language"].GetIniLanguage(), false);
      try {
        localeData.changeLocale(initialLocale);
        initialPatterns = localeData
          .getDateAcceptancePatterns()
          .map(
            /** Computes the pattern result. @param pattern - Pattern. @returns The computed result. */ (
              pattern,
            ) => new OUString(pattern),
          );
      } finally {
        localeData.changeLocale(this["language"].fields.locale);
        initialLocale.dispose();
      }
      if (evaluation === NfEvalDateFormat.International) patterns = initialPatterns;
      else if (evaluation === NfEvalDateFormat.InternationalThenFormat)
        patterns = [...initialPatterns, ...currentPatterns];
      else patterns = [...currentPatterns, ...initialPatterns];
    }
    try {
      state.sDateAcceptancePatterns = patterns.map(
        /** Computes the pattern result. @param pattern - Pattern. @returns The computed result. */ (
          pattern,
        ) => new OUString(pattern),
      );
    } finally {
      if (initialPatterns) for (const pattern of initialPatterns) pattern.dispose();
    }
    state.nAcceptedDatePattern = state.sDateAcceptancePatterns.length ? -2 : -1;
  }
  if (state.nAcceptedDatePattern === -1) return false;
  state.nDatePatternStart = startPatternAt;
  const monthsInYear = this["language"].GetCalendar().getNumberOfMonthsInYear(),
    localeData = this["language"].GetLocaleData(),
    decimal = localeData.getNumDecimalSep(),
    alternate = localeData.getNumDecimalSepAlt(),
    decimalCharacter = decimal.getLength() === 1 ? decimal.getStr()[0] : -1,
    alternateCharacter = alternate.getLength() === 1 ? alternate.getStr()[0] : -1;
  for (let patternIndex = 0; patternIndex < state.sDateAcceptancePatterns.length; patternIndex++) {
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
          blanks = this["SkipBlanks"](fragment, cursor);
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

/** Original pattern-separator query, including signed years and the source's set-not-add cursor result. @param particle - Input fragment index. @param position - Mutable fragment cursor. @param signedYear - Mutable signed-year flag. @returns Whether this separator belongs to the accepted pattern.  @param this - Original native owner shared by its implementation fragments. */
export function SkipDatePatternSeparator(
  this: ImpSvNumberInputScanContext,
  particle: number,
  position: [number],
  signedYear: [boolean],
): boolean {
  const state = this["fields"];
  if (!this["IsAcceptedDatePattern"](state.nNumericsCnt ? (state.nNums[0] as number) : 0))
    return false;
  if (particle < state.nDatePatternStart || particle >= state.nStringsCnt || state.IsNum[particle])
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

/** Original accepted-pattern numeric count; initializes the pattern cache on first query. @returns Number of D/M/Y particles.  @param this - Original native owner shared by its implementation fragments. */
export function GetDatePatternNumbers(this: ImpSvNumberInputScanContext): number {
  const state = this["fields"];
  if (!this["IsAcceptedDatePattern"](state.nNumericsCnt ? (state.nNums[0] as number) : 0)) return 0;
  return state.nDatePatternNumbers;
}

/** Original ordinal D/M/Y type lookup in the matched pattern. @param number - Zero-based numeric particle. @param type - Source D, M or Y. @returns Type match.  @param this - Original native owner shared by its implementation fragments. */
export function IsDatePatternNumberOfType(
  this: ImpSvNumberInputScanContext,
  number: number,
  type: string,
): boolean {
  if (this["GetDatePatternNumbers"]() <= number) return false;
  const pattern = text(
    this["fields"].sDateAcceptancePatterns[this["fields"].nAcceptedDatePattern] as OUString,
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

/** Original packed first-three D/M/Y order bytes of the accepted pattern. @returns Packed order, or zero.  @param this - Original native owner shared by its implementation fragments. */
export function GetDatePatternOrder(this: ImpSvNumberInputScanContext): number {
  const state = this["fields"];
  if (!this["IsAcceptedDatePattern"](state.nNumericsCnt ? (state.nNums[0] as number) : 0)) return 0;
  const pattern = text(state.sDateAcceptancePatterns[state.nAcceptedDatePattern] as OUString);
  let order = 0;
  for (const char of pattern) {
    if (order & 0xff0000) break;
    if (char === "Y" || char === "M" || char === "D") order = (order << 8) | char.charCodeAt(0);
  }
  return order;
}

/** Original accepted-pattern order selection, with format and locale fallbacks. @param fromFormatIfNoPattern - Prefer a compiled format without a pattern. @returns DateOrder.  @param this - Original native owner shared by its implementation fragments. */
export function GetDateOrder(
  this: ImpSvNumberInputScanContext,
  fromFormatIfNoPattern = false,
): DateOrder {
  const order = this["GetDatePatternOrder"](),
    localeOrder = /** Implements locale Order. @returns The DateOrder result. */ (): DateOrder =>
      this["language"].GetLocaleData().getDateOrder();
  if (!order)
    return fromFormatIfNoPattern && this["fields"].mpFormat
      ? this["fields"].mpFormat.GetDateOrder()
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

/** Original middle-month ordering prefers the named-month shape, then exact format or locale order, with day-validity switches. @param formatTurn - Whether the compiled format's exact order applies. @param locale - Current locale data. @param dateOrder - Evaluated short order. @returns Long date order.  @param this - Original native owner shared by its implementation fragments. */
export function GetMiddleMonthLongDateOrder(
  this: ImpSvNumberInputScanContext,
  formatTurn: boolean,
  locale: LocaleDataWrapper,
  dateOrder: DateOrder,
): LongDateOrder {
  if (this["MayBeMonthDate"]())
    return this["fields"].nMayBeMonthDate === 2 ? LongDateOrder.DMY : LongDateOrder.YMD;
  const exact = formatTurn
    ? (this["fields"].mpFormat as SvNumberformatConstReference).GetExactDateOrder()
    : 0;
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
    if (!this["ImplGetDay"](0) && this["ImplGetDay"](1)) order = LongDateOrder.YMD;
  } else if (order === LongDateOrder.YMD && dateOrder === DateOrder.DMY) {
    if (!this["ImplGetDay"](1) && this["ImplGetDay"](0)) order = LongDateOrder.DMY;
  }
  return order;
}

/** Original ISO override decision for the cached three-part numeric date shape. @param order - Evaluated date order or Invalid. @returns Whether ISO order is forced.  @param this - Original native owner shared by its implementation fragments. */
export function CanForceToIso8601(this: ImpSvNumberInputScanContext, order: DateOrder): boolean {
  const state = this["fields"];
  if (!this["MayBeIso8601"]()) return false;
  if (state.nMayBeIso8601 >= 3) return true;
  if (order === DateOrder.Invalid) {
    if (
      this["GetDatePatternNumbers"]() === state.nNumericsCnt &&
      this["IsDatePatternNumberOfType"](0, "Y")
    )
      return false;
    order = this["GetDateOrder"]();
  }
  if (this["GetDatePatternNumbers"]() === 0) return true;
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

/** Original format/date-evaluation policy for an ISO candidate. @returns Whether the ISO candidate is acceptable.  @param this - Original native owner shared by its implementation fragments. */
export function IsAcceptableIso8601(this: ImpSvNumberInputScanContext): boolean {
  const format = this["fields"].mpFormat;
  if (format && format.GetType() & SvNumFormatType.DATE) {
    switch (this["language"].GetEvalDateFormat()) {
      case NfEvalDateFormat.International:
        return this["CanForceToIso8601"](this["GetDateOrder"]());
      case NfEvalDateFormat.Format:
        return this["CanForceToIso8601"](format.GetDateOrder());
      default:
        return (
          this["CanForceToIso8601"](this["GetDateOrder"]()) ||
          this["CanForceToIso8601"](format.GetDateOrder())
        );
    }
  }
  return this["CanForceToIso8601"](this["GetDateOrder"]());
}

/** Original matched-string return marker clears only the virgin bit from its acceptance check. @returns Whether any substantive match was recorded.  @param this - Original native owner shared by its implementation fragments. */
export function MatchedReturn(this: ImpSvNumberInputScanContext): boolean {
  if (this["fields"].nMatchedAllStrings & ~0x08) {
    this["fields"].nMatchedAllStrings |= 0x10;
    return true;
  }
  return false;
}
