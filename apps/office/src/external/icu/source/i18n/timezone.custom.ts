/** @fileoverview Original ICU78.3 custom GMT ID parser/formatter/zone creation from timezone.cpp, using actual Unicode parseNumber and full-fold comparison. */
import { UnicodeString } from "../common/unistr";
import { ICU_Utility } from "../common/util_props";
import { u_strncasecmp } from "../common/ustrcase";
import { UErrorCode as E, U_FAILURE } from "../common/unicode/utypes";
import { SimpleTimeZone } from "./simpletz";
/** Original parser leaves caller outputs unchanged on prefix failure and retains partial parsed outputs on later failure. @param id - UTF16 ID. @param sign - Sign output. @param hour - Hour output. @param minute - Minute output. @param second - Second output. @returns Recognized source custom format. */
export function parseCustomID(
  id: UnicodeString,
  sign: [number],
  hour: [number],
  minute: [number],
  second: [number],
): boolean {
  if (id.length() < 3 || u_strncasecmp(id.getBuffer() as string, "GMT", 3, 0) !== 0) return false;
  sign[0] = 1;
  hour[0] = minute[0] = second[0] = 0;
  if (id.charAt(3) === 45) sign[0] = -1;
  else if (id.charAt(3) !== 43) return false;
  let start = 4;
  const pos: [number] = [start];
  hour[0] = ICU_Utility.parseNumber(id, pos, 10);
  if (pos[0] === id.length()) {
    switch (pos[0] - start) {
      case 1:
      case 2:
        break;
      case 3:
      case 4:
        minute[0] = hour[0] % 100;
        hour[0] = Math.trunc(hour[0] / 100);
        break;
      case 5:
      case 6:
        second[0] = hour[0] % 100;
        minute[0] = Math.trunc(hour[0] / 100) % 100;
        hour[0] = Math.trunc(hour[0] / 10000);
        break;
      default:
        return false;
    }
  } else {
    if (pos[0] - start < 1 || pos[0] - start > 2 || id.charAt(pos[0]) !== 58) return false;
    ++pos[0];
    if (id.length() === pos[0]) return false;
    start = pos[0];
    minute[0] = ICU_Utility.parseNumber(id, pos, 10);
    if (pos[0] - start !== 2) return false;
    if (id.length() > pos[0]) {
      if (id.charAt(pos[0]) !== 58) return false;
      ++pos[0];
      start = pos[0];
      second[0] = ICU_Utility.parseNumber(id, pos, 10);
      if (pos[0] - start !== 2 || id.length() > pos[0]) return false;
    }
  }
  return !(hour[0] > 23 || minute[0] > 59 || second[0] > 59);
}
/** Original normalized custom ID code-unit construction. @param hour - Parsed hour. @param minute - Parsed minute. @param second - Parsed second. @param negative - Negative sign. @param id - Reused output. @returns Output. */
export function formatCustomID(
  hour: number,
  minute: number,
  second: number,
  negative: boolean,
  id: UnicodeString,
): UnicodeString {
  id.assign(new UnicodeString("GMT"));
  if ((hour | minute | second) !== 0) {
    const units = [
      negative ? 45 : 43,
      hour < 10 ? 48 : 48 + Math.trunc(hour / 10),
      48 + (hour % 10),
      58,
      minute < 10 ? 48 : 48 + Math.trunc(minute / 10),
      48 + (minute % 10),
    ];
    if (second !== 0)
      units.push(58, second < 10 ? 48 : 48 + Math.trunc(second / 10), 48 + (second % 10));
    id.append(new UnicodeString(String.fromCharCode(...units), units.length));
  }
  return id;
}
/** Original custom zone creation. @param id - Input. @returns Owned fixed zone or null. */
export function createCustomTimeZone(id: UnicodeString): SimpleTimeZone | null {
  const sign: [number] = [0],
    hour: [number] = [0],
    minute: [number] = [0],
    second: [number] = [0];
  if (!parseCustomID(id, sign, hour, minute, second)) return null;
  const normalized = formatCustomID(
      hour[0],
      minute[0],
      second[0],
      sign[0] < 0,
      new UnicodeString(),
    ),
    offset = sign[0] * ((hour[0] * 60 + minute[0]) * 60 + second[0]) * 1000;
  return new SimpleTimeZone(offset, normalized);
}
/** Original internal normalization called by the public canonical-ID API; output clears even on an incoming failure. @param id - Input. @param normalized - Output. @param status - ICU status. @returns Output. */
export function getCustomID(
  id: UnicodeString,
  normalized: UnicodeString,
  status: [number],
): UnicodeString {
  normalized.remove();
  if (U_FAILURE(status[0])) return normalized;
  const sign: [number] = [0],
    hour: [number] = [0],
    minute: [number] = [0],
    second: [number] = [0];
  if (parseCustomID(id, sign, hour, minute, second))
    formatCustomID(hour[0], minute[0], second[0], sign[0] < 0, normalized);
  else status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
  return normalized;
}
