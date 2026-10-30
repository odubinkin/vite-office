/** @fileoverview Original finite DATE/DATETIME output with native mode0: calendar switching, Gregorian range checks, month case and actual token/name owners. Complete native-number conversion/spellout remains unported. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Date } from "../../../tools/source/datetime/tdate";
import { DateTime } from "../../../tools/source/datetime/datetime";
import { Time } from "../../../tools/source/datetime/ttime";
import { round } from "../../../sal/inc/rtl/math";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
import * as Display from "../../../offapi/com/sun/star/i18n/CalendarDisplayCode";
import * as D from "../../../offapi/com/sun/star/i18n/CalendarDisplayIndex";
import * as A from "../../../offapi/com/sun/star/i18n/AmPmValue";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { INPUTSTRING_PRECISION } from "./zforlist.defaults";
import { ImpSvNumberformatScan } from "./zforscan";
import type { ImpSvNumFor } from "./zformat";
import type { SvNFLanguageData } from "./zforlist";
import { ImpGetNatNumString, ImpGetFractionOfSecondString } from "./zformat.time";
import { InsertBlanks } from "./zformat.output";
import type { CalendarWrapper } from "../../../unotools/source/i18n/calendarwrapper";
/** Original current-calendar literal equality over its independently returned name. @param calendar - Actual owner. @returns Whether Gregorian. */
function gregorian(calendar: CalendarWrapper): boolean {
  const id = calendar.getUniqueID();
  try {
    return text(id) === "gregorian";
  } finally {
    id.dispose();
  }
}
/** Source state passed by reference to the original calendar-switch helpers. */
interface CalendarState {
  original: OUString;
  dateTime: number;
  other: boolean;
  monthCase: [number];
}
/** Original ImpIsOtherCalendar predicate preserves token order and explicit-calendar early exit. @param section - Actual tokens. @param calendar - Actual owner. @returns Original flag. */
function isOtherCalendar(section: ImpSvNumFor, calendar: CalendarWrapper): boolean {
  if (!gregorian(calendar)) return false;
  for (let index = 0; index < section.GetCount(); ++index)
    switch (section.Info().nTypeArray[index]) {
      case S.CALENDAR:
        return false;
      case K.EC:
      case K.EEC:
      case K.R:
      case K.RR:
      case K.AAA:
      case K.AAAA:
      case K.G:
      case K.GG:
      case K.GGG:
        return true;
    }
  return false;
}
/** Original source calendar-ID save and UTC instant capture occur only for the first switch. @param calendar - Owner. @param state - Original references. @returns Nothing. */
function saveCalendar(calendar: CalendarWrapper, state: CalendarState): void {
  if (!state.original.getLength()) {
    const id = calendar.getUniqueID();
    try {
      state.original.assign(id);
    } finally {
      id.dispose();
    }
    state.dateTime = calendar.getDateTime();
  }
}
/** Original SwitchToOtherCalendar selects the first actual non-Gregorian locale calendar. @param current - Language. @param state - Original references. @returns Nothing. */
function switchToOther(current: SvNFLanguageData, state: CalendarState): void {
  const calendar = current.GetCalendar();
  if (!gregorian(calendar)) return;
  const calendars = calendar.getAllCalendars(current.GetLocaleData().getMyLocale());
  try {
    if (calendars.length <= 1) return;
    const selected = calendars.find(
      /** Original non-Gregorian predicate. @param id - Name. @returns Selected. */ (id) =>
        text(id) !== "gregorian",
    );
    if (!selected) return;
    saveCalendar(calendar, state);
    calendar.loadCalendar(selected, current.GetLocaleData().getMyLocale());
    calendar.setDateTime(state.dateTime);
  } finally {
    for (const id of calendars) id.dispose();
  }
}
/** Original SwitchToGregorianCalendar keeps the saved UTC instant. @param current - Language. @param state - Original references. @returns Nothing. */
function switchToGregorian(current: SvNFLanguageData, state: CalendarState): void {
  const calendar = current.GetCalendar();
  if (state.original.getLength() && !gregorian(calendar)) {
    const id = unicode("gregorian");
    try {
      calendar.loadCalendar(id, current.GetLocaleData().getMyLocale());
    } finally {
      id.dispose();
    }
    calendar.setDateTime(state.dateTime);
  }
}
/** Original Dummy-era fallback retains saved-calendar clear/save ordering. @param current - Language. @param state - Original references. @returns Whether fallback happened. */
function fallbackGregorian(current: SvNFLanguageData, state: CalendarState): boolean {
  const calendar = current.GetCalendar();
  if (!gregorian(calendar)) {
    const era = calendar.getValue(C.ERA);
    if (era === 0) {
      const loaded = calendar.getLoadedCalendar();
      if (!loaded.eras.length) throw new Error("Sequence index assertion");
      if ((loaded.eras[0] as { id: string }).id === "Dummy") {
        if (!state.original.getLength()) saveCalendar(calendar, state);
        else if (text(state.original) === "gregorian") state.original.clear();
        const id = unicode("gregorian");
        try {
          calendar.loadCalendar(id, current.GetLocaleData().getMyLocale());
        } finally {
          id.dispose();
        }
        calendar.setDateTime(state.dateTime);
        return true;
      }
    }
  }
  return false;
}
/** Original ImpUseMonthCase determines nominative/genitive/partitive case from compiled token adjacency/order. @param state - In/out cached state. @param section - Actual section. @param keyword - Month keyword. @returns Calendar display code. */
function monthCase(state: [number], section: ImpSvNumFor, keyword: number): number {
  if (!state[0]) {
    let monthSeen = false,
      daySeen = false;
    const info = section.Info(),
      count = section.GetCount();
    for (let index = 0; index < count && state[0] === 0; ++index) {
      const type = info.nTypeArray[index];
      if (type === K.D || type === K.DD) {
        if (monthSeen) state[0] = 2;
        else daySeen = true;
      } else if (type === K.MMM || type === K.MMMM || type === K.MMMMM) {
        const next = index < count - 1 ? (info.sStrArray[index + 1] as OUString) : null,
          previous = index > 0 ? (info.sStrArray[index - 1] as OUString) : null;
        if (
          (next &&
            info.nTypeArray[index + 1] === S.STRING &&
            !next.isEmpty() &&
            next.getStr()[0] !== 32 &&
            next.getStr()[0] !== 44) ||
          (previous &&
            info.nTypeArray[index - 1] === S.STRING &&
            previous.getLength() > 0 &&
            previous.getStr()[previous.getLength() - 1] !== 32)
        )
          state[0] = 1;
        else if (daySeen) state[0] = 3;
        else monthSeen = true;
      }
    }
    if (!state[0]) state[0] = 1;
  }
  switch (state[0]) {
    case 1:
      if (keyword === K.MMM) return Display.SHORT_MONTH_NAME;
      if (keyword === K.MMMM) return Display.LONG_MONTH_NAME;
      if (keyword === K.MMMMM) return Display.NARROW_MONTH_NAME;
      break;
    case 2:
      if (keyword === K.MMM) return Display.SHORT_GENITIVE_MONTH_NAME;
      if (keyword === K.MMMM) return Display.LONG_GENITIVE_MONTH_NAME;
      if (keyword === K.MMMMM) return Display.NARROW_GENITIVE_MONTH_NAME;
      break;
    case 3:
      if (keyword === K.MMM) return Display.SHORT_PARTITIVE_MONTH_NAME;
      if (keyword === K.MMMM) return Display.LONG_PARTITIVE_MONTH_NAME;
      if (keyword === K.MMMMM) return Display.NARROW_PARTITIVE_MONTH_NAME;
      break;
  }
  return Display.LONG_MONTH_NAME;
}
/** Original lcl_hasEra scans only the four era-rendering tokens. @param section - Actual tokens. @returns Era present. */
function hasEra(section: ImpSvNumFor): boolean {
  for (let index = 0; index < section.GetCount(); ++index)
    switch (section.Info().nTypeArray[index]) {
      case K.RR:
      case K.G:
      case K.GG:
      case K.GGG:
        return true;
    }
  return false;
}
let dateBounds: readonly [number, number] | undefined;
/** Original lcl_getValidDate mutates epoch offset even when rejecting the tools::Date range. @param current - Language. @param value - Serial in/out. @returns Within source range. */
function validDate(current: SvNFLanguageData, value: [number]): boolean {
  const ce = new DateTime(new Date(1, 1, 1));
  if (!dateBounds) {
    const min = new DateTime(new Date(1, 1, -32768)),
      max = new DateTime(new Date(31, 12, 32767), new Time(23, 59, 59, Time.nanoSecPerSec - 1n));
    dateBounds = [DateTime.Sub(min, ce), DateTime.Sub(max, ce)];
  }
  const nullDate = new DateTime(current.GetNullDate()),
    offset = DateTime.Sub(nullDate, ce) + value[0],
    difference = DateTime.Sub(nullDate, current.GetCalendar().getEpochStart());
  value[0] += difference;
  return dateBounds[0] <= offset && offset <= dateBounds[1];
}
/** Original initial switch/fallback sequence after setting the calendar's local date. @param current - Language. @param section - Actual section. @returns Original state owner. */
function calendarState(current: SvNFLanguageData, section: ImpSvNumFor): CalendarState {
  const state: CalendarState = {
    original: new OUString(),
    dateTime: 0,
    other: isOtherCalendar(section, current.GetCalendar()),
    monthCase: [0],
  };
  try {
    if (state.other) switchToOther(current, state);
    if (fallbackGregorian(current, state)) state.other = false;
    return state;
  } catch (error) {
    state.original.dispose();
    throw error;
  }
}
/** Original common calendar/date token cases; native-mode0 makes DATE-only spellout branches dormant. @param type - Token kind. @param token - Actual string. @param section - Actual section. @param current - Language. @param state - Switch/month references. @param buffer - Output. @param star - Source fill flag. @param result - In/out latest star result. @returns Nothing. */
function dateToken(
  type: number,
  token: OUStringConstReference,
  section: ImpSvNumFor,
  current: SvNFLanguageData,
  state: CalendarState,
  buffer: OUStringBuffer,
  star: boolean,
  result: [boolean],
): void {
  const calendar = current.GetCalendar();
  let code: number;
  switch (type) {
    case S.CALENDAR:
      saveCalendar(calendar, state);
      calendar.loadCalendar(token, current.GetLocaleData().getMyLocale());
      calendar.setDateTime(state.dateTime);
      fallbackGregorian(current, state);
      return;
    case S.STAR:
      if (star) {
        result[0] = token.getLength() > 1;
        if (result[0]) buffer.append(Uint16Array.of(27, token.getStr()[1] as number));
      }
      return;
    case S.BLANK:
      if (token.getLength() >= 2)
        InsertBlanks(buffer, buffer.getLength(), token.getStr()[1] as number);
      return;
    case S.STRING:
    case S.CURRENCY:
    case S.DATESEP:
    case S.TIMESEP:
    case S.TIME100SECSEP:
      buffer.append(token);
      return;
    case K.M:
      code = Display.SHORT_MONTH;
      break;
    case K.MM:
      code = Display.LONG_MONTH;
      break;
    case K.MMM:
    case K.MMMM:
    case K.MMMMM:
      code = monthCase(state.monthCase, section, type);
      break;
    case K.Q:
      code = Display.SHORT_QUARTER;
      break;
    case K.QQ:
      code = Display.LONG_QUARTER;
      break;
    case K.D:
      code = Display.SHORT_DAY;
      break;
    case K.DD:
      code = Display.LONG_DAY;
      break;
    case K.DDD:
      code = Display.SHORT_DAY_NAME;
      break;
    case K.DDDD:
      code = Display.LONG_DAY_NAME;
      break;
    case K.YY:
      code = Display.SHORT_YEAR;
      break;
    case K.YYYY:
      code = Display.LONG_YEAR;
      break;
    case K.EC:
      code = Display.SHORT_YEAR;
      break;
    case K.EEC:
    case K.R:
      code = Display.LONG_YEAR;
      break;
    case K.NN:
    case K.AAA:
      code = Display.SHORT_DAY_NAME;
      break;
    case K.NNN:
    case K.AAAA:
    case K.NNNN:
      code = Display.LONG_DAY_NAME;
      break;
    case K.WW: {
      const value = ImpGetNatNumString(calendar.getValue(C.WEEK_OF_YEAR));
      try {
        buffer.append(value);
      } finally {
        value.dispose();
      }
      return;
    }
    case K.G: {
      const id = calendar.getUniqueID();
      try {
        if (text(id) === "gengou") {
          const era = calendar.getValue(C.ERA);
          buffer.append(
            Uint16Array.of(
              era === 1
                ? 77
                : era === 2
                  ? 84
                  : era === 3
                    ? 83
                    : era === 4
                      ? 72
                      : era === 5
                        ? 82
                        : 63,
            ),
          );
          return;
        }
      } finally {
        id.dispose();
      }
      code = Display.SHORT_ERA;
      break;
    }
    case K.GG:
      code = Display.SHORT_ERA;
      break;
    case K.GGG:
      code = Display.LONG_ERA;
      break;
    case K.RR:
      code = Display.LONG_YEAR_AND_ERA;
      break;
    default:
      return;
  }
  const gregorianToken = type === K.DDD || type === K.DDDD || type === K.YY || type === K.YYYY;
  if (state.other && gregorianToken) switchToGregorian(current, state);
  if (
    (type === K.YY || type === K.YYYY) &&
    calendar.getValue(C.ERA) === 0 &&
    gregorian(calendar) &&
    !hasEra(section)
  )
    buffer.append(Uint16Array.of(45));
  const value = calendar.getDisplayString(code, 0);
  try {
    if (type === K.YYYY && value.getLength() < 4 && !hasEra(section))
      for (let digit = 0; digit < 4 - value.getLength(); ++digit) buffer.append(Uint16Array.of(48));
    buffer.append(value);
  } finally {
    value.dispose();
  }
  if (state.other && gregorianToken) switchToOther(current, state);
  if (type === K.NNNN) buffer.append(current.GetLocaleData().getLongDateDayOfWeekSep());
}
/** Assigns a real buffer result with compiler-generated temporary ownership. @param buffer - Buffer. @param output - Result owner. @returns Nothing. */
function assignOutput(buffer: OUStringBuffer, output: OUString): void {
  const value = buffer.makeStringAndClear();
  try {
    output.assign(value);
  } finally {
    value.dispose();
  }
}
/** Original ImpGetDateOutput mode0 path. Caller retains source section/sign/color selection. @param input - Serial value. @param section - Actual section. @param current - Language/calendar owner. @param output - Mutable result. @param star - Fill flag. @returns Latest star result. */
export function GetDateOutput(
  input: number,
  section: ImpSvNumFor,
  current: SvNFLanguageData,
  output: OUString,
  star: boolean,
): boolean {
  const value: [number] = [input];
  if (!validDate(current, value)) {
    output.assign(ImpSvNumberformatScan.sErrStr);
    return false;
  }
  current.GetCalendar().setLocalDateTime(value[0]);
  const state = calendarState(current, section),
    result: [boolean] = [false],
    info = section.Info();
  let buffer: OUStringBuffer | undefined;
  try {
    buffer = new OUStringBuffer();
    for (let index = 0; index < section.GetCount(); ++index)
      dateToken(
        info.nTypeArray[index] as number,
        info.sStrArray[index] as OUString,
        section,
        current,
        state,
        buffer,
        star,
        result,
      );
    if (state.original.getLength())
      current.GetCalendar().loadCalendar(state.original, current.GetLocaleData().getMyLocale());
    assignOutput(buffer, output);
    return result[0];
  } finally {
    buffer?.dispose();
    state.original.dispose();
  }
}
/** Original ImpGetDateTimeOutput mode0 path retains its separate date-rounding and bracketed-clock behavior. @param input - Serial value. @param section - Actual section. @param current - Language/calendar owner. @param output - Mutable result. @param star - Fill flag. @returns Latest star result. */
export function GetDateTimeOutput(
  input: number,
  section: ImpSvNumFor,
  current: SvNFLanguageData,
  output: OUString,
  star: boolean,
): boolean {
  const value: [number] = [input];
  if (!validDate(current, value)) {
    output.assign(ImpSvNumberformatScan.sErrStr);
    return false;
  }
  const info = section.Info(),
    inputLine =
      current.GetStandardPrec() === INPUTSTRING_PRECISION && info.nCntPost > 0 && info.nCntPost < 7;
  let decimals = inputLine ? 7 : info.nCntPost;
  const firstRounding = inputLine ? 7 : info.bThousand ? decimals : 7;
  let time = round((value[0] - Math.floor(value[0])) * 86400, firstRounding);
  if (time >= 86400) {
    time -= 86400;
    value[0] = Math.floor(value[0] + 0.5) + time;
  }
  const calendar = current.GetCalendar();
  calendar.setLocalDateTime(value[0]);
  const state = calendarState(current, section),
    result: [boolean] = [false];
  let secondsText: OUStringBuffer | undefined, buffer: OUStringBuffer | undefined;
  let hour = 0,
    minute = 0,
    second = 0,
    secondPosition = 0;
  try {
    secondsText = new OUStringBuffer();
    buffer = new OUStringBuffer();
    if (!info.bThousand) {
      const hours: [number] = [0],
        minutes: [number] = [0],
        seconds: [number] = [0],
        fraction: [number] = [0];
      Time.GetClock(value[0], hours, minutes, seconds, fraction, decimals);
      hour = hours[0];
      minute = minutes[0];
      second = seconds[0];
      decimals = ImpGetFractionOfSecondString(
        secondsText,
        fraction[0],
        decimals,
        true,
        inputLine ? info.nCntPost : 0,
      );
    } else {
      const seconds = Math.floor(time) >>> 0;
      decimals = ImpGetFractionOfSecondString(
        secondsText,
        time - seconds,
        decimals,
        false,
        inputLine ? info.nCntPost : 0,
      );
      if (info.nThousand === 3) second = seconds;
      else if (info.nThousand === 2) {
        minute = Math.trunc(seconds / 60);
        second = seconds % 60;
      } else if (info.nThousand === 1) {
        hour = Math.trunc(seconds / 3600);
        minute = Math.trunc((seconds % 3600) / 60);
        second = seconds % 60;
      }
    }
    let ampm = 32;
    if (info.nCntExp) {
      if (hour === 0) {
        hour = 12;
        ampm = 97;
      } else if (hour < 12) ampm = 97;
      else {
        ampm = 112;
        if (hour > 12) hour -= 12;
      }
    }
    for (let index = 0; index < section.GetCount(); ++index) {
      const type = info.nTypeArray[index] as number,
        token = info.sStrArray[index] as OUString;
      switch (type) {
        case S.DIGIT: {
          const length =
            inputLine &&
            index > 0 &&
            (info.nTypeArray[index - 1] === S.STRING ||
              info.nTypeArray[index - 1] === S.TIME100SECSEP)
              ? decimals
              : token.getLength();
          for (
            let digit = 0;
            digit < length && secondPosition < decimals && secondPosition < secondsText.getLength();
            ++digit
          )
            buffer.append(Uint16Array.of(secondsText.getStr()[secondPosition++] as number));
          break;
        }
        case K.AMPM: {
          const name = calendar.getDisplayName(D.AM_PM, ampm === 97 ? A.AM : A.PM, 0);
          try {
            buffer.append(name);
          } finally {
            name.dispose();
          }
          break;
        }
        case K.AP:
          buffer.append(Uint16Array.of(ampm === 97 ? 97 : 112));
          break;
        case K.MI:
        case K.MMI:
        case K.H:
        case K.HH:
        case K.S:
        case K.SS: {
          const field =
              type === K.MI || type === K.MMI
                ? minute
                : type === K.H || type === K.HH
                  ? hour
                  : second,
            value = ImpGetNatNumString(
              field,
              type === K.MMI || type === K.HH || type === K.SS ? 2 : 0,
            );
          try {
            buffer.append(value);
          } finally {
            value.dispose();
          }
          break;
        }
        default:
          dateToken(type, token, section, current, state, buffer, star, result);
      }
    }
    if (state.original.getLength())
      calendar.loadCalendar(state.original, current.GetLocaleData().getMyLocale());
    assignOutput(buffer, output);
    return result[0];
  } finally {
    buffer?.dispose();
    secondsText?.dispose();
    state.original.dispose();
  }
}
