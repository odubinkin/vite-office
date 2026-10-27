/** @fileoverview Original Calendar UTC-field conversion, clock-field precedence and validation fragments, operating directly on the single native owner. */
import { UErrorCode, U_FAILURE, U_MILLIS_PER_DAY } from "../common/unicode/utypes";
import { ClockMath, Grego, kEpochStartAsJulianDay } from "./gregoimp";
import {
  UCalendarDateFields as F,
  UCalendarWallTimeOption as W,
  UTimeZoneLocalOption as O,
} from "./unicode/ucal";
import { TimeZoneTransition } from "./tztrans";
import type { Calendar } from "./calendar";

/** Original UTC-to-fields path, preserving source stamp mask and write order. @param this - Actual Calendar owner. @param status - ICU status. @returns Nothing. */
export function computeFields(this: Calendar, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  let localMillis = this["internalGetTime"]();
  const raw: [number] = [0],
    dst: [number] = [0];
  this.getTimeZone().getOffset(localMillis, false, raw, dst, status);
  if (U_FAILURE(status[0])) return;
  localMillis += raw[0] + dst[0];
  let mask =
    (1 << F.UCAL_ERA) |
    (1 << F.UCAL_YEAR) |
    (1 << F.UCAL_MONTH) |
    (1 << F.UCAL_DAY_OF_MONTH) |
    (1 << F.UCAL_DAY_OF_YEAR) |
    (1 << F.UCAL_EXTENDED_YEAR) |
    (1 << F.UCAL_ORDINAL_MONTH);
  for (let i = 0; i < F.UCAL_FIELD_COUNT; i++) {
    this["fStamp"][i] = (mask & 1) === 0 ? 1 : 0;
    mask >>= 1;
  }
  const millis: [number] = [0],
    days =
      ClockMath.floorDivideDoubleInt32(localMillis, U_MILLIS_PER_DAY, millis) +
      kEpochStartAsJulianDay;
  if (days > 2147483647 || days < -2147483648) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  this["internalSet"](F.UCAL_JULIAN_DAY, days | 0);
  this["computeGregorianFields"](this["fFields"][F.UCAL_JULIAN_DAY] as number, status);
  this["handleComputeFields"](this["fFields"][F.UCAL_JULIAN_DAY] as number, status);
  this["computeWeekFields"](status);
  if (U_FAILURE(status[0])) return;
  const fields = this["fFields"];
  fields[F.UCAL_MILLISECONDS_IN_DAY] = millis[0];
  fields[F.UCAL_MILLISECOND] = millis[0] % 1000;
  millis[0] = Math.trunc(millis[0] / 1000);
  fields[F.UCAL_SECOND] = millis[0] % 60;
  millis[0] = Math.trunc(millis[0] / 60);
  fields[F.UCAL_MINUTE] = millis[0] % 60;
  millis[0] = Math.trunc(millis[0] / 60);
  fields[F.UCAL_HOUR_OF_DAY] = millis[0];
  fields[F.UCAL_AM_PM] = Math.trunc(millis[0] / 12);
  fields[F.UCAL_HOUR] = millis[0] % 12;
  fields[F.UCAL_ZONE_OFFSET] = raw[0];
  fields[F.UCAL_DST_OFFSET] = dst[0];
}

/** Original clock-field stamp resolution and non-normalizing scalar arithmetic. @param this - Actual Calendar owner. @returns Local wall milliseconds-in-day, possibly outside one day. */
export function computeMillisInDay(this: Calendar): number {
  const stamps = this["fStamp"],
    hourOfDayStamp = stamps[F.UCAL_HOUR_OF_DAY] as number,
    hourStamp = Math.max(stamps[F.UCAL_HOUR] as number, stamps[F.UCAL_AM_PM] as number),
    bestStamp = Math.max(hourStamp, hourOfDayStamp);
  let millis = 0;
  if (bestStamp !== 0) {
    if (bestStamp === hourOfDayStamp) millis += this["internalGet"](F.UCAL_HOUR_OF_DAY);
    else {
      millis += this["internalGet"](F.UCAL_HOUR);
      millis += this["internalGet"](F.UCAL_AM_PM) % 2 === 0 ? 0 : 12;
    }
  }
  millis *= 60;
  millis += this["internalGet"](F.UCAL_MINUTE);
  millis *= 60;
  millis += this["internalGet"](F.UCAL_SECOND);
  millis *= 1000;
  millis += this["internalGet"](F.UCAL_MILLISECOND);
  return millis;
}

/** Original validation loop checks only user-stamped fields, in enum order. @param this - Actual Calendar owner. @param status - ICU status. @returns Nothing. */
export function validateFields(this: Calendar, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  for (let field = 0; !U_FAILURE(status[0]) && field < F.UCAL_FIELD_COUNT; field++)
    if ((this["fStamp"][field] as number) >= 2) this["validateField"](field, status);
}
/** Original generic single-field validation. @param this - Actual Calendar owner. @param field - Calendar field. @param status - ICU status. @returns Nothing. */
export function validateField(this: Calendar, field: F, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  if (field < 0 || field >= F.UCAL_FIELD_COUNT) {
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return;
  }
  switch (field) {
    case F.UCAL_DAY_OF_MONTH: {
      const year = this["handleGetExtendedYear"](status);
      if (U_FAILURE(status[0])) return;
      this["validateFieldRange"](
        field,
        1,
        this["handleGetMonthLength"](year, this["internalGetMonth"](status), status),
        status,
      );
      break;
    }
    case F.UCAL_DAY_OF_YEAR: {
      const year = this["handleGetExtendedYear"](status);
      if (U_FAILURE(status[0])) return;
      this["validateFieldRange"](field, 1, this["handleGetYearLength"](year, status), status);
      break;
    }
    case F.UCAL_DAY_OF_WEEK_IN_MONTH:
      if (this["internalGet"](field) === 0) {
        status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        return;
      }
      this["validateFieldRange"](field, this.getMinimum(field), this.getMaximum(field), status);
      break;
    default:
      this["validateFieldRange"](field, this.getMinimum(field), this.getMaximum(field), status);
      break;
  }
}

/** Original date/clock/zone fields-to-UTC algorithm with strict and next-valid skipped-time handling. @param this - Actual calendar owner. @param status - ICU status. @returns Nothing. */
export function computeTime(this: Calendar, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  if (!this.isLenient()) {
    this["validateFields"](status);
    if (U_FAILURE(status[0])) return;
  }
  const day = this["computeJulianDay"](status);
  if (U_FAILURE(status[0])) return;
  const millis = Grego.julianDayToMillis(day),
    stamps = this["fStamp"];
  const inDay =
    (stamps[F.UCAL_MILLISECONDS_IN_DAY] as number) >= 2 &&
    this["newestStamp"](F.UCAL_AM_PM, F.UCAL_MILLISECOND, 0) <=
      (stamps[F.UCAL_MILLISECONDS_IN_DAY] as number)
      ? this["internalGet"](F.UCAL_MILLISECONDS_IN_DAY)
      : this["computeMillisInDay"]();
  let time = 0;
  if ((stamps[F.UCAL_ZONE_OFFSET] as number) >= 2 || (stamps[F.UCAL_DST_OFFSET] as number) >= 2)
    time =
      millis +
      inDay -
      this["internalGet"](F.UCAL_ZONE_OFFSET) -
      this["internalGet"](F.UCAL_DST_OFFSET);
  else if (!this.isLenient() || this["fSkippedWallTime"] === W.UCAL_WALLTIME_NEXT_VALID) {
    const offset = this["computeZoneOffset"](millis, inDay, status),
      temporary = millis + inDay - offset,
      raw: [number] = [0],
      dst: [number] = [0];
    this.getTimeZone().getOffset(temporary, false, raw, dst, status);
    if (!U_FAILURE(status[0])) {
      if (offset !== raw[0] + dst[0]) {
        if (!this.isLenient()) status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
        else {
          const previous: [number] = [0],
            found = this["getImmediatePreviousZoneTransition"](temporary, previous, status);
          if (!U_FAILURE(status[0]) && found) time = previous[0];
        }
      } else time = temporary;
    }
  } else time = millis + inDay - this["computeZoneOffset"](millis, inDay, status);
  if (!U_FAILURE(status[0])) this["internalSetTime"](time);
}
/** Original local-wall zone-offset resolution, including the generic non-Basic fallback. Native debug assertions and undefined uninitialized outputs are not a browser release contract. @param this - Actual calendar. @param millis - Date milliseconds. @param inDay - Clock milliseconds. @param status - ICU status. @returns Offset. */
export function computeZoneOffset(
  this: Calendar,
  millis: number,
  inDay: number,
  status: [number],
): number {
  if (U_FAILURE(status[0])) return 0;
  const raw: [number] = [0],
    dst: [number] = [0],
    wall = millis + inDay,
    basic = this["getBasicTimeZone"]();
  if (basic) {
    const duplicated =
        this["fRepeatedWallTime"] === W.UCAL_WALLTIME_FIRST
          ? O.UCAL_TZ_LOCAL_FORMER
          : O.UCAL_TZ_LOCAL_LATTER,
      missing =
        this["fSkippedWallTime"] === W.UCAL_WALLTIME_FIRST
          ? O.UCAL_TZ_LOCAL_LATTER
          : O.UCAL_TZ_LOCAL_FORMER;
    basic.getOffsetFromLocal(wall, missing, duplicated, raw, dst, status);
  } else {
    const zone = this.getTimeZone();
    zone.getOffset(wall, true, raw, dst, status);
    let sawNegative = false;
    if (this["fRepeatedWallTime"] === W.UCAL_WALLTIME_FIRST) {
      const utc = wall - (raw[0] + dst[0]),
        previousRaw: [number] = [0],
        previousDst: [number] = [0];
      zone.getOffset(utc - 21600000, false, previousRaw, previousDst, status);
      const delta = raw[0] + dst[0] - (previousRaw[0] + previousDst[0]);
      if (delta < 0) {
        sawNegative = true;
        zone.getOffset(wall + delta, true, raw, dst, status);
      }
    }
    if (!sawNegative && this["fSkippedWallTime"] === W.UCAL_WALLTIME_FIRST) {
      const utc = wall - (raw[0] + dst[0]);
      zone.getOffset(utc, false, raw, dst, status);
    }
  }
  return raw[0] + dst[0];
}
/** Original recognized-Basic previous-transition lookup and source failure codes. @param this - Actual calendar. @param base - UTC base. @param output - UTC transition output. @param status - ICU status. @returns Found. */
export function getImmediatePreviousZoneTransition(
  this: Calendar,
  base: number,
  output: [number],
  status: [number],
): boolean {
  if (U_FAILURE(status[0])) return false;
  const basic = this["getBasicTimeZone"]();
  if (basic) {
    const transition = new TimeZoneTransition();
    if (basic.getPreviousTransition(base, true, transition)) {
      output[0] = transition.getTime();
      return true;
    }
    status[0] = UErrorCode.U_INTERNAL_PROGRAM_ERROR;
  } else status[0] = UErrorCode.U_UNSUPPORTED_ERROR;
  return false;
}
