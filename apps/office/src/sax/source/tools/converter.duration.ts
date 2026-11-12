/** @fileoverview Original util::Duration UTF16 parse and OUStringBuffer export overloads from converter.cxx, retaining component order, widths, fractional truncation and untouched failure output. Floating-duration/byte/iostream physical implementations remain unqualified. */
import { Duration } from "../../../offapi/com/sun/star/util/Duration";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import {
  Result,
  readUnsignedNumber,
  readUnsignedNumberMaxDigits,
  trimmedView,
  type StringSource,
} from "./converter.number";
/** Original readDurationT. @param input - View. @param position - Cursor. @returns Separator consumed. */
function readDurationT(input: Uint16Array, position: [number]): boolean {
  if (position[0] < input.length && (input[position[0]] === 84 || input[position[0]] === 116)) {
    ++position[0];
    return true;
  }
  return false;
}
/** Original optional ordered component reader. @param input - View. @param position - Cursor. @param temporary - Last read number. @param time - Time section flag. @param output - Component destination. @param lower - Lowercase marker. @param upper - Uppercase marker. @returns Original success. */
function readDurationComponent(
  input: Uint16Array,
  position: [number],
  temporary: [number],
  time: [boolean],
  output: [number],
  lower: number,
  upper: number,
): boolean {
  if (
    position[0] < input.length &&
    (input[position[0]] === lower || input[position[0]] === upper)
  ) {
    ++position[0];
    if (temporary[0] !== -1) {
      output[0] = temporary[0];
      temporary[0] = -1;
      if (!time[0]) time[0] = readDurationT(input, position);
      return readUnsignedNumber(input, position, temporary) !== Result.R_OVERFLOW;
    }
    return false;
  }
  return true;
}
/** Original structure-duration parser. @param output - Actual generated destination. @param source - UTF16 view. @returns Success; failure retains all fields. */
function parseDuration(output: Duration, source: StringSource): boolean {
  const input = trimmedView(source),
    position: [number] = [0];
  let negative = false;
  if (input.length && input[0] === 45) {
    negative = true;
    ++position[0];
  }
  if (position[0] < input.length && input[position[0]] !== 80 && input[position[0]] !== 112)
    return false;
  ++position[0];
  const temporary: [number] = [-1],
    time: [boolean] = [readDurationT(input, position)],
    years: [number] = [0],
    months: [number] = [0],
    days: [number] = [0],
    hours: [number] = [0],
    minutes: [number] = [0];
  let seconds = 0,
    nanoseconds = 0,
    success = readUnsignedNumber(input, position, temporary) === Result.R_SUCCESS;
  if (!time[0] && success)
    success = readDurationComponent(input, position, temporary, time, years, 121, 89);
  if (!time[0] && success)
    success = readDurationComponent(input, position, temporary, time, months, 109, 77);
  if (!time[0] && success)
    success = readDurationComponent(input, position, temporary, time, days, 100, 68);
  if (time[0]) {
    if (temporary[0] === -1) success = false;
    if (success) success = readDurationComponent(input, position, temporary, time, hours, 104, 72);
    if (success)
      success = readDurationComponent(input, position, temporary, time, minutes, 109, 77);
    if (position[0] < input.length && success) {
      const c = input[position[0]];
      if (c === 46 || c === 44) {
        ++position[0];
        if (temporary[0] !== -1) {
          seconds = temporary[0];
          temporary[0] = -1;
          const start = position[0];
          success = readUnsignedNumberMaxDigits(9, input, position, temporary) === Result.R_SUCCESS;
          if (position[0] < input.length && success) {
            if (temporary[0] !== -1) {
              nanoseconds = temporary[0];
              for (let digits = position[0] - start; digits < 9; ++digits) nanoseconds *= 10;
              temporary[0] = -1;
              if (input[position[0]] === 83 || input[position[0]] === 115) ++position[0];
              else success = false;
            } else success = false;
          }
        } else success = false;
      } else if (c === 83 || c === 115) {
        ++position[0];
        if (temporary[0] !== -1) {
          seconds = temporary[0];
          temporary[0] = -1;
        } else success = false;
      }
    }
  }
  if (position[0] !== input.length) success = false;
  if (temporary[0] !== -1) success = false;
  if (success) {
    output.Negative = negative;
    output.Years = years[0];
    output.Months = months[0];
    output.Days = days[0];
    output.Hours = hours[0];
    output.Minutes = minutes[0];
    output.Seconds = seconds;
    output.NanoSeconds = nanoseconds;
  }
  return success;
}
/** Original single ASCII character append. @param buffer - Output. @param code - Source character. @returns Nothing. */
function character(buffer: OUStringBuffer, code: number): void {
  buffer.append(new Uint8Array([code, 0]));
}
/** Original duration formatter with zero-day fallback and nine fractional positions. @param buffer - Actual output buffer. @param value - Generated duration. @returns Nothing. */
function formatDuration(buffer: OUStringBuffer, value: Readonly<Duration>): void {
  if (value.Negative) character(buffer, 45);
  character(buffer, 80);
  const haveDate = value.Years !== 0 || value.Months !== 0 || value.Days !== 0;
  if (value.Years) {
    buffer.append(OUString.number(value.Years));
    character(buffer, 89);
  }
  if (value.Months) {
    buffer.append(OUString.number(value.Months));
    character(buffer, 77);
  }
  if (value.Days) {
    buffer.append(OUString.number(value.Days));
    character(buffer, 68);
  }
  if (value.Hours !== 0 || value.Minutes !== 0 || value.Seconds !== 0 || value.NanoSeconds !== 0) {
    character(buffer, 84);
    if (value.Hours) {
      buffer.append(OUString.number(value.Hours));
      character(buffer, 72);
    }
    if (value.Minutes) {
      buffer.append(OUString.number(value.Minutes));
      character(buffer, 77);
    }
    if (value.Seconds !== 0 || value.NanoSeconds !== 0) {
      buffer.append(OUString.number(value.Seconds));
      if (value.NanoSeconds) {
        character(buffer, 46);
        const nano = new OUString(OUString.number(value.NanoSeconds));
        try {
          for (let i = nano.getLength(); i < 9; ++i) character(buffer, 48);
          buffer.append(nano);
        } finally {
          nano.dispose();
        }
      }
      character(buffer, 83);
    }
  } else if (!haveDate) {
    character(buffer, 48);
    character(buffer, 68);
  }
}
/** Original structure-duration import overload. @param output - Generated destination. @param source - View. @returns Success. */
export function convertDuration(output: Duration, source: StringSource): boolean;
/** Original structure-duration export overload. @param output - Native buffer. @param source - Duration. @returns Nothing. */
export function convertDuration(output: OUStringBuffer, source: Readonly<Duration>): void;
/** Caller-declared overload erasure; no guessed value/default/type provider. @param output - Actual declared output. @param source - Selected input. @returns Native success or nothing. */
export function convertDuration(
  output: Duration | OUStringBuffer,
  source: StringSource | Readonly<Duration>,
): boolean | void {
  if (output instanceof OUStringBuffer) return formatDuration(output, source as Readonly<Duration>);
  return parseDuration(output, source as StringSource);
}
