/** @fileoverview Original converter.cxx UTF16 date/time parsers and OUStringBuffer formatters, including source timezone arithmetic and date-versus-datetime outputs. Byte/OStringBuffer and native machine ABI remain unqualified. */
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import type { Date } from "../../../offapi/com/sun/star/util/Date";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { getDaysInMonth } from "../../../comphelper/source/misc/date";
import {
  Result,
  readUnsignedNumber,
  readUnsignedNumberMaxDigits,
  trimmedView,
  type StringSource,
} from "./converter.number";
/** Original lcl_ConvertToUTC arithmetic, including its minute adjustment order.  @param value - Value. @param offset - Offset. @returns Nothing. */
function lcl_ConvertToUTC(value: DateTime, offset: number): void {
  let offsetHours = Math.trunc(Math.abs(offset) / 60);
  const offsetMinutes = Math.abs(offset) % 60;
  value.Minutes += offsetMinutes;
  if (offset < 0) {
    value.Minutes += offsetMinutes;
    if (value.Minutes >= 60) {
      value.Minutes -= 60;
      offsetHours++;
    }
    value.Hours += offsetHours;
    if (value.Hours < 24) return;
    let days = 0;
    while (value.Hours >= 24) {
      value.Hours -= 24;
      days++;
    }
    if (!value.Day) return;
    value.Day += days;
    const last = getDaysInMonth(value.Month, value.Year);
    if (value.Day <= last) return;
    value.Day -= last;
    value.Month++;
    if (value.Month <= 12) return;
    value.Month = 1;
    value.Year++;
  } else if (offset > 0) {
    if (value.Minutes < offsetMinutes) {
      value.Minutes += 60;
      offsetHours++;
    }
    value.Minutes -= offsetMinutes;
    let days = 0;
    while (value.Hours < offsetHours) {
      value.Hours += 24;
      days++;
    }
    value.Hours -= offsetHours;
    if (!value.Day) return;
    if (days < value.Day) {
      value.Day -= days;
      return;
    }
    const previousMonth = value.Month === 1 ? 12 : value.Month - 1;
    const daysInPreviousMonth = getDaysInMonth(previousMonth, value.Year);
    value.Day += daysInPreviousMonth;
    value.Month--;
    if (!value.Month) {
      value.Month = 12;
      value.Year--;
    }
    value.Day -= days;
  }
}

/** Original readDateTimeComponent retains destination on reader/length failure. @param input - Native view. @param position - Cursor. @param output - Component destination. @param minimum - Minimum width. @param exact - Exact width. @returns Success. */
function readDateTimeComponent(
  input: Uint16Array,
  position: [number],
  output: [number],
  minimum: number,
  exact: boolean,
): boolean {
  const before = position[0],
    temporary: [number] = [0];
  if (readUnsignedNumber(input, position, temporary) !== Result.R_SUCCESS) return false;
  const length = position[0] - before;
  if (length < minimum || (exact && length > minimum)) return false;
  output[0] = temporary[0];
  return true;
}
/** Original date portion parser, preserving local references and invalid/missing-date flag. @param negative - Year sign. @param year - Year. @param month - Month. @param day - Day. @param haveTime - Time separator seen. @param position - Cursor. @param input - View. @param ignoreInvalidDate - Original lenient mode. @returns Success. */
function lcl_parseDate(
  negative: [boolean],
  year: [number],
  month: [number],
  day: [number],
  haveTime: [boolean],
  position: [number],
  input: Uint16Array,
  ignoreInvalidDate: boolean,
): boolean {
  // eslint-disable-next-line no-useless-assignment -- Retain the source local initialization before the sign scan.
  let success = true;
  if (input.length > position[0] && input[position[0]] === 45) {
    negative[0] = true;
    ++position[0];
  }
  success = readDateTimeComponent(input, position, year, 1, false);
  if (!ignoreInvalidDate) success = success && year[0] > 0;
  success = success && year[0] <= (negative[0] ? 32768 : 32767);
  success = success && position[0] < input.length;
  if (success && input[position[0]] !== 45) success = false;
  if (success) {
    ++position[0];
    success = readDateTimeComponent(input, position, month, 2, true);
    if (!ignoreInvalidDate) success = success && month[0] > 0;
    success = success && month[0] <= 12;
    success = success && position[0] < input.length;
  }
  if (success && input[position[0]] !== 45) success = false;
  if (success) {
    ++position[0];
    success = readDateTimeComponent(input, position, day, 2, true);
    if (!ignoreInvalidDate) success = success && day[0] > 0;
    if (month[0] > 0) {
      const maximum = getDaysInMonth(month[0], negative[0] ? -year[0] : year[0]);
      success = success && day[0] <= maximum;
    }
  }
  if (
    success &&
    position[0] < input.length &&
    (input[position[0]] === 84 || input[position[0]] === 116)
  ) {
    haveTime[0] = true;
    ++position[0];
  }
  return success;
}
/** Original common parser with Date destination and optional raw timezone; absent timezone resets only on success. @param date - Optional Date output. @param datetime - Actual DateTime output. @param isDateTime - Selected result kind. @param timezone - Optional original optional<short> output. @param source - UTF16 input. @param ignoreInvalidDate - Source lenient flag. @returns Success. */
function lcl_parseDateTime(
  date: Date | null,
  datetime: DateTime,
  isDateTime: [boolean],
  timezone: [number | undefined] | null,
  source: StringSource,
  ignoreInvalidDate: boolean,
): boolean {
  const input = trimmedView(source),
    negative: [boolean] = [false],
    year: [number] = [0],
    month: [number] = [0],
    day: [number] = [0],
    position: [number] = [0],
    haveTime: [boolean] = [false];
  let success = true;
  const colon = input.indexOf(58),
    dash = input.indexOf(45);
  if (!ignoreInvalidDate || colon === -1 || (dash !== -1 && dash < colon))
    success = lcl_parseDate(
      negative,
      year,
      month,
      day,
      haveTime,
      position,
      input,
      ignoreInvalidDate,
    );
  else haveTime[0] = true;
  const hours: [number] = [0],
    minutes: [number] = [0],
    seconds: [number] = [0];
  let nanoseconds = 0;
  if (success && haveTime[0]) {
    success = readDateTimeComponent(input, position, hours, 2, true);
    success = success && hours[0] >= 0 && hours[0] <= 24;
    success = success && position[0] < input.length;
    if (success && input[position[0]] !== 58) success = false;
    if (success) {
      ++position[0];
      success = readDateTimeComponent(input, position, minutes, 2, true);
      success = success && minutes[0] >= 0 && minutes[0] < 60;
      success = success && position[0] < input.length;
    }
    if (success && input[position[0]] !== 58) success = false;
    if (success) {
      ++position[0];
      success = readDateTimeComponent(input, position, seconds, 2, true);
      success = success && seconds[0] >= 0 && seconds[0] < 60;
    }
    if (
      success &&
      position[0] < input.length &&
      (input[position[0]] === 46 || input[position[0]] === 44)
    ) {
      ++position[0];
      const start = position[0],
        temporary: [number] = [0];
      if (readUnsignedNumberMaxDigits(9, input, position, temporary) === Result.R_NOTHING)
        success = false;
      if (success) {
        for (let digits = Math.min(position[0] - start, 9); digits < 9; ++digits)
          temporary[0] *= 10;
        nanoseconds = temporary[0];
      }
    }
    if (success && hours[0] === 24 && !(minutes[0] === 0 && seconds[0] === 0 && nanoseconds === 0))
      success = false;
  }
  let haveTimezone = false,
    plus = false,
    minus = false;
  if (success && position[0] < input.length) {
    const code = input[position[0]];
    if (code === 43) {
      haveTimezone = true;
      plus = true;
      ++position[0];
    } else if (code === 45) {
      haveTimezone = true;
      minus = true;
      ++position[0];
    } else if (code === 90 || code === 122) {
      haveTimezone = true;
      ++position[0];
    } else success = false;
  }
  const timezoneHours: [number] = [0],
    timezoneMinutes: [number] = [0];
  if (success && (plus || minus)) {
    success = readDateTimeComponent(input, position, timezoneHours, 2, true);
    success = success && timezoneHours[0] >= 0 && timezoneHours[0] <= 14;
    success = success && position[0] < input.length;
    if (success && input[position[0]] !== 58) success = false;
    if (success) {
      ++position[0];
      success = readDateTimeComponent(input, position, timezoneMinutes, 2, true);
      success = success && timezoneMinutes[0] >= 0 && timezoneMinutes[0] < 60;
    }
    if (success && timezoneHours[0] === 14 && timezoneMinutes[0] !== 0) success = false;
  }
  success = success && position[0] === input.length;
  if (success) {
    const offset = (minus ? -1 : 1) * (timezoneHours[0] * 60 + timezoneMinutes[0]);
    if (!date || haveTime[0]) {
      datetime.Year = (negative[0] ? -1 : 1) * year[0];
      datetime.Month = month[0];
      datetime.Day = day[0];
      datetime.Hours = hours[0];
      datetime.Minutes = minutes[0];
      datetime.Seconds = seconds[0];
      datetime.NanoSeconds = nanoseconds;
      if (haveTimezone) {
        if (timezone) {
          timezone[0] = offset;
          datetime.IsUTC = offset === 0;
        } else {
          lcl_ConvertToUTC(datetime, offset);
          datetime.IsUTC = true;
        }
      } else {
        if (timezone) timezone[0] = undefined;
        datetime.IsUTC = false;
      }
      isDateTime[0] = haveTime[0];
    } else {
      date.Year = (negative[0] ? -1 : 1) * year[0];
      date.Month = month[0];
      date.Day = day[0];
      if (timezone) timezone[0] = haveTimezone ? offset : undefined;
      isDateTime[0] = false;
    }
  }
  return success;
}
/** Original strict DateTime overload passes no Date or timezone destination. @param output - Actual destination. @param source - UTF16 view. @returns Success. */
export function parseDateTime(output: DateTime, source: StringSource): boolean {
  const isDateTime: [boolean] = [] as unknown as [boolean];
  return parseDateOrDateTime(null, output, isDateTime, null, source);
}
/** Original strict two-result overload. @param date - Optional Date output. @param datetime - DateTime output. @param isDateTime - Selected kind. @param timezone - Optional raw offset output. @param source - UTF16 view. @returns Success. */
export function parseDateOrDateTime(
  date: Date | null,
  datetime: DateTime,
  isDateTime: [boolean],
  timezone: [number | undefined] | null,
  source: StringSource,
): boolean {
  return lcl_parseDateTime(date, datetime, isDateTime, timezone, source, false);
}
/** Original lenient time/dateTime overload. @param output - Actual destination. @param source - UTF16 view. @returns Success. */
export function parseTimeOrDateTime(output: DateTime, source: StringSource): boolean {
  const dummy: [boolean] = [] as unknown as [boolean];
  return lcl_parseDateTime(null, output, dummy, null, source, true);
}
/** Original ASCII character append overload. @param buffer - Actual output. @param code - Source character. @returns Nothing. */
function character(buffer: OUStringBuffer, code: number): void {
  buffer.append(new Uint8Array([code, 0]));
}
/** Original timezone formatting diagnoses offsets beyond14 hours but still emits them. @param buffer - Actual output. @param offset - Signed minutes. @returns Nothing. */
function lcl_AppendTimezone(buffer: OUStringBuffer, offset: number): void {
  if (offset === 0) character(buffer, 90);
  else {
    character(buffer, offset > 0 ? 43 : 45);
    const hours = Math.trunc(Math.abs(offset) / 60),
      minutes = Math.abs(offset) % 60;
    if (hours < 10) character(buffer, 48);
    buffer.append(OUString.number(hours));
    character(buffer, 58);
    if (minutes < 10) character(buffer, 48);
    buffer.append(OUString.number(minutes));
  }
}
/** Original time fields and nine-position nanosecond suffix. @param buffer - Output. @param value - Actual fields. @returns Nothing. */
function convertTime(buffer: OUStringBuffer, value: Readonly<DateTime>): void {
  if (value.Hours < 10) character(buffer, 48);
  buffer.append(OUString.number(value.Hours));
  character(buffer, 58);
  if (value.Minutes < 10) character(buffer, 48);
  buffer.append(OUString.number(value.Minutes));
  character(buffer, 58);
  if (value.Seconds < 10) character(buffer, 48);
  buffer.append(OUString.number(value.Seconds));
  if (value.NanoSeconds > 0) {
    character(buffer, 46);
    const nano = new OUString(OUString.number(value.NanoSeconds));
    try {
      for (let i = 0; i < 9 - nano.getLength(); ++i) character(buffer, 48);
      buffer.append(nano);
    } finally {
      nano.dispose();
    }
  }
}
/** Original explicit offset wins over IsUTC. @param buffer - Output. @param value - Fields. @param timezone - Optional offset pointer. @returns Nothing. */
function convertTimeZone(
  buffer: OUStringBuffer,
  value: Readonly<DateTime>,
  timezone: readonly [number] | null,
): void {
  if (timezone) lcl_AppendTimezone(buffer, timezone[0]);
  else if (value.IsUTC) lcl_AppendTimezone(buffer, 0);
}
/** Original date/dateTime formatting; nanoseconds alone do not select a time suffix. @param buffer - Actual output. @param value - Actual generated value. @param timezone - Optional offset pointer. @param addTimeIf0AM - Source default false. @returns Nothing. */
export function convertDateTime(
  buffer: OUStringBuffer,
  value: Readonly<DateTime>,
  timezone: readonly [number] | null,
  addTimeIf0AM = false,
): void {
  const year = Math.abs(value.Year);
  if (value.Year < 0) character(buffer, 45);
  if (year < 1000) character(buffer, 48);
  if (year < 100) character(buffer, 48);
  if (year < 10) character(buffer, 48);
  buffer.append(OUString.number(year));
  character(buffer, 45);
  if (value.Month < 10) character(buffer, 48);
  buffer.append(OUString.number(value.Month));
  character(buffer, 45);
  if (value.Day < 10) character(buffer, 48);
  buffer.append(OUString.number(value.Day));
  if (value.Seconds !== 0 || value.Minutes !== 0 || value.Hours !== 0 || addTimeIf0AM) {
    character(buffer, 84);
    convertTime(buffer, value);
  }
  convertTimeZone(buffer, value, timezone);
}
/** Original Date-to-DateTime value constructor then common formatter. @param buffer - Actual output. @param value - Date. @param timezone - Optional offset pointer. @returns Nothing. */
export function convertDate(
  buffer: OUStringBuffer,
  value: Readonly<Date>,
  timezone: readonly [number] | null,
): void {
  const datetime = new DateTime(0, 0, 0, 0, value.Day, value.Month, value.Year, false);
  convertDateTime(buffer, datetime, timezone);
}
/** Original time-only choice checks coarse field ranges, not complete calendar validity. @param buffer - Output. @param value - Actual value. @returns Nothing. */
export function convertTimeOrDateTime(buffer: OUStringBuffer, value: Readonly<DateTime>): void {
  if (value.Year === 0 || value.Month < 1 || value.Month > 12 || value.Day < 1 || value.Day > 31) {
    convertTime(buffer, value);
    convertTimeZone(buffer, value, null);
  } else convertDateTime(buffer, value, null, true);
}
