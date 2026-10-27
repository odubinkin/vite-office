/** @fileoverview Original OlsonTimeZone resource construction, field validation and historical gap/fold offset fragments, sharing the actual owner. */
import * as R from "../common/uresbund";
import { UnicodeString } from "../common/unistr";
import { UErrorCode as E, U_FAILURE } from "../common/unicode/utypes";
import { Grego } from "./gregoimp";
import { SimpleTimeZone, type TimeMode } from "./simpletz";
import { loadRule } from "./timezone.resources";
import { ZoneMeta } from "./zonemeta";
import type { OlsonTimeZone } from "./olsontz";
import { BasicTimeZone } from "./basictz";
const kStandard = BasicTimeZone["kStandard"],
  kDaylight = BasicTimeZone["kDaylight"],
  kFormer = BasicTimeZone["kFormer"],
  kLatter = BasicTimeZone["kLatter"],
  kStdDstMask = BasicTimeZone["kStdDstMask"],
  kFormerLatterMask = BasicTimeZone["kFormerLatterMask"];
/** Original resource constructor with optional-transition resets and sticky required-field errors. @param this - Actual owner. @param top - Root. @param res - Resolved zone. @param id - ID. @param status - Status. @returns Nothing. */
export function construct(
  this: OlsonTimeZone,
  top: R.UResourceBundle | null,
  res: R.UResourceBundle | null,
  id: UnicodeString,
  status: [number],
): void {
  this["clearTransitionRules"]();
  if ((top === null || res === null) && !U_FAILURE(status[0]))
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
  if (!U_FAILURE(status[0])) {
    const len: [number] = [0],
      r = new R.UResourceBundle();
    R.ures_getByKey(res, "transPre32", r, status);
    this["transitionTimesPre32"] = R.ures_getIntVector(r, len, status);
    this["transitionCountPre32"] = ((len[0] >> 1) << 16) >> 16;
    if (status[0] === E.U_MISSING_RESOURCE_ERROR) {
      this["transitionTimesPre32"] = null;
      this["transitionCountPre32"] = 0;
      status[0] = 0;
    } else if (!U_FAILURE(status[0]) && (len[0] < 0 || len[0] > 0x7fff || (len[0] & 1) !== 0))
      status[0] = E.U_INVALID_FORMAT_ERROR;
    R.ures_getByKey(res, "trans", r, status);
    this["transitionTimes32"] = R.ures_getIntVector(r, len, status);
    this["transitionCount32"] = (len[0] << 16) >> 16;
    if (status[0] === E.U_MISSING_RESOURCE_ERROR) {
      this["transitionTimes32"] = null;
      this["transitionCount32"] = 0;
      status[0] = 0;
    } else if (!U_FAILURE(status[0]) && (len[0] < 0 || len[0] > 0x7fff))
      status[0] = E.U_INVALID_FORMAT_ERROR;
    R.ures_getByKey(res, "transPost32", r, status);
    this["transitionTimesPost32"] = R.ures_getIntVector(r, len, status);
    this["transitionCountPost32"] = ((len[0] >> 1) << 16) >> 16;
    if (status[0] === E.U_MISSING_RESOURCE_ERROR) {
      this["transitionTimesPost32"] = null;
      this["transitionCountPost32"] = 0;
      status[0] = 0;
    } else if (!U_FAILURE(status[0]) && (len[0] < 0 || len[0] > 0x7fff || (len[0] & 1) !== 0))
      status[0] = E.U_INVALID_FORMAT_ERROR;
    R.ures_getByKey(res, "typeOffsets", r, status);
    this["typeOffsets"] = R.ures_getIntVector(r, len, status) as readonly number[];
    if (!U_FAILURE(status[0]) && (len[0] < 2 || len[0] > 0x7ffe || (len[0] & 1) !== 0))
      status[0] = E.U_INVALID_FORMAT_ERROR;
    this["typeCount"] = ((len[0] << 16) >> 16) >> 1;
    this["typeMapData"] = null;
    if (this["transitionCount"]() > 0) {
      R.ures_getByKey(res, "typeMap", r, status);
      this["typeMapData"] = R.ures_getBinary(r, len, status);
      if (status[0] === E.U_MISSING_RESOURCE_ERROR) status[0] = E.U_INVALID_FORMAT_ERROR;
      else if (!U_FAILURE(status[0]) && len[0] !== this["transitionCount"]())
        status[0] = E.U_INVALID_FORMAT_ERROR;
    }
    if (!U_FAILURE(status[0])) {
      const ruleId = R.ures_getStringByKey(res, "finalRule", len, status),
        ruleLength = len[0];
      R.ures_getByKey(res, "finalRaw", r, status);
      const raw = R.ures_getInt(r, status);
      R.ures_getByKey(res, "finalYear", r, status);
      const year = R.ures_getInt(r, status);
      if (!U_FAILURE(status[0])) {
        const rule = loadRule(top, new UnicodeString(ruleId, ruleLength), null, status),
          data = R.ures_getIntVector(rule, len, status);
        if (!U_FAILURE(status[0]) && len[0] === 11) {
          const v = data as readonly number[];
          this["finalZone"] = new SimpleTimeZone(
            (raw * 1000) | 0,
            new UnicodeString(),
            v[0] as number,
            v[1] as number,
            v[2] as number,
            ((v[3] as number) * 1000) | 0,
            v[4] as TimeMode,
            v[5] as number,
            v[6] as number,
            v[7] as number,
            ((v[8] as number) * 1000) | 0,
            v[9] as TimeMode,
            ((v[10] as number) * 1000) | 0,
            status,
          );
          this["finalStartYear"] = year;
          // Source deliberately does not setStartYear here; rule extraction uses a separate clone.
          this["finalStartMillis"] = Number(Grego.fieldsToDay(year, 0, 1)) * 86400000;
        } else status[0] = E.U_INVALID_FORMAT_ERROR;
        R.ures_close(rule);
      } else if (status[0] === E.U_MISSING_RESOURCE_ERROR) status[0] = 0;
    }
    this["canonicalID"] = ZoneMeta.getCanonicalCLDRID(id, status);
    R.ures_close(r);
  }
  if (U_FAILURE(status[0])) this["constructEmpty"]();
}
/** Original field overload uses negated BCE year (not one-minus-year) and daylight/standard historical preferences. @param this - Owner. @param era - uint8 era. @param year - Signed32 year. @param month - Month. @param day - Day. @param weekday - uint8 weekday. @param millis - In-day milliseconds. @param monthLength - Caller month length. @param status - Status. @returns Total offset. */
export function getOffsetForFields(
  this: OlsonTimeZone,
  era: number,
  year: number,
  month: number,
  day: number,
  weekday: number,
  millis: number,
  monthLength: number,
  status: [number],
): number {
  if (U_FAILURE(status[0])) return 0;
  era &= 255;
  weekday &= 255;
  year |= 0;
  month |= 0;
  day |= 0;
  millis |= 0;
  monthLength |= 0;
  // GregorianCalendar::AD=1 and BC=0 come from the source enum, avoiding a concrete-calendar/base-zone import cycle.
  if (
    (era !== 1 && era !== 0) ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > monthLength ||
    weekday < 1 ||
    weekday > 7 ||
    millis < 0 ||
    millis >= 86400000 ||
    monthLength < 28 ||
    monthLength > 31
  ) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return 0;
  }
  if (era === 0) year = -year | 0;
  const final = this["finalZone"];
  if (final !== null && year >= this["finalStartYear"])
    return final.getOffsetForFields(era, year, month, day, weekday, millis, monthLength, status);
  // The native intermediate is signed64; overflow/undefined native inputs are outside the witness scope.
  const date = Number(
      BigInt.asIntN(64, Grego.fieldsToDay(year, month, day) * 86400000n + BigInt(millis)),
    ),
    raw: [number] = [0],
    dst: [number] = [0];
  getHistoricalOffset.call(this, date, true, kDaylight, kStandard, raw, dst);
  return (raw[0] + dst[0]) | 0;
}
/** Original historical search and complete local interpretation masks. @param this - Owner. @param date - UTC/local milliseconds. @param local - Local flag. @param nonExisting - Gap mask. @param duplicated - Overlap mask. @param raw - Raw output. @param dst - Savings output. @returns Nothing. */
export function getHistoricalOffset(
  this: OlsonTimeZone,
  date: number,
  local: boolean,
  nonExisting: number,
  duplicated: number,
  raw: [number],
  dst: [number],
): void {
  const count = this["transitionCount"]();
  if (count > 0) {
    const sec = Math.floor(date / 1000);
    if (!local && sec < Number(this["transitionTimeInSeconds"](0))) {
      raw[0] = (this["initialRawOffset"]() * 1000) | 0;
      dst[0] = (this["initialDstOffset"]() * 1000) | 0;
    } else {
      let index = count - 1;
      for (; index >= 0; --index) {
        let transition = this["transitionTimeInSeconds"](index);
        if (local && sec >= Number(transition - 86400n)) {
          const before = this["zoneOffsetAt"](index - 1),
            after = this["zoneOffsetAt"](index),
            dstBefore = this["dstOffsetAt"](index - 1) !== 0,
            dstAfter = this["dstOffsetAt"](index) !== 0,
            dstToStd = dstBefore && !dstAfter,
            stdToDst = !dstBefore && dstAfter;
          if (((after - before) | 0) >= 0) {
            if (
              ((nonExisting & kStdDstMask) === kStandard && dstToStd) ||
              ((nonExisting & kStdDstMask) === kDaylight && stdToDst)
            )
              transition += BigInt(before);
            else if (
              ((nonExisting & kStdDstMask) === kStandard && stdToDst) ||
              ((nonExisting & kStdDstMask) === kDaylight && dstToStd)
            )
              transition += BigInt(after);
            else if ((nonExisting & kFormerLatterMask) === kLatter) transition += BigInt(before);
            else transition += BigInt(after);
          } else {
            if (
              ((duplicated & kStdDstMask) === kStandard && dstToStd) ||
              ((duplicated & kStdDstMask) === kDaylight && stdToDst)
            )
              transition += BigInt(after);
            else if (
              ((duplicated & kStdDstMask) === kStandard && stdToDst) ||
              ((duplicated & kStdDstMask) === kDaylight && dstToStd)
            )
              transition += BigInt(before);
            else if ((duplicated & kFormerLatterMask) === kFormer) transition += BigInt(before);
            else transition += BigInt(after);
          }
        }
        if (sec >= Number(transition)) break;
      }
      raw[0] = (this["rawOffsetAt"](index) * 1000) | 0;
      dst[0] = (this["dstOffsetAt"](index) * 1000) | 0;
    }
  } else {
    raw[0] = (this["initialRawOffset"]() * 1000) | 0;
    dst[0] = (this["initialDstOffset"]() * 1000) | 0;
  }
}
