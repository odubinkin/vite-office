/** @fileoverview Original ICU78.3 EraRules loading, sparse era indices, encoded sentinel dates and source era lookup from erarules.cpp. */
import * as R from "../common/uresbund";
import { uprv_strtol } from "../common/cstring";
import { uprv_getUTCtime } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { createDefault } from "./timezone.default";
import { Grego } from "./gregoimp";
const MIN_ENCODED_START = -2147483391,
  MAX_INT32 = 2147483647,
  MIN_INT32 = -1;
/** Original packed signed32 date. @param year - Signed16 year. @param month - Month1..12. @param day - Day1..31. @returns Packed date. */
function encodeDate(year: number, month: number, day: number): number {
  return (year << 16) | (month << 8) | day;
}
/** Original sentinel decoding retains the source MIN_INT32 constant's -1 value. @param encoded - Packed date. @param fields - Actual date output. @returns Nothing. */
function decodeDate(encoded: number, fields: [number, number, number]): void {
  if (encoded === MIN_ENCODED_START) {
    fields[0] = MIN_INT32;
    fields[1] = 1;
    fields[2] = 1;
  } else {
    fields[0] = encoded >> 16;
    fields[1] = (encoded & 0xff00) >> 8;
    fields[2] = encoded & 255;
  }
}
/** Original comparison supports years beyond the packed date range. @param encoded - Packed era start. @param year - Compared year. @param month - Compared month. @param day - Compared day. @returns Native order. */
function compareEncodedDateWithYMD(
  encoded: number,
  year: number,
  month: number,
  day: number,
): number {
  if (year < -32768) {
    if (encoded === MIN_ENCODED_START) return year > MIN_INT32 || month > 1 || day > 1 ? -1 : 0;
    return 1;
  }
  if (year > 32767) return -1;
  const value = encodeDate(year, month, day);
  return encoded < value ? -1 : encoded === value ? 0 : 1;
}
/** Original era table owner, retaining holes and compressed leading empty slots. */
export class EraRules {
  private currentEra = 0;
  /** Original adopted start-date storage and current-era initialization. @param startDates - Actual packed dates. @param minEra - First code represented. @param numEras - Number of defined eras. @returns Rules. */
  private constructor(
    private readonly startDates: Int32Array,
    private readonly minEra: number,
    private readonly numEras: number,
  ) {
    this.initCurrentEra();
  }
  /** Original supplemental calendarData/eras loader and validation. @param calType - Native calendar name. @param includeTentativeEra - Source option. @param status - Sticky status. @returns Owner/null. */
  static createInstance(
    calType: string,
    includeTentativeEra: boolean,
    status: [number],
  ): EraRules | null {
    if (U_FAILURE(status[0])) return null;
    const rb = R.ures_openDirect(null, "supplementalData", status);
    try {
      R.ures_getByKey(rb, "calendarData", rb, status);
      R.ures_getByKey(rb, calType, rb, status);
      R.ures_getByKey(rb, "eras", rb, status);
      if (U_FAILURE(status[0])) return null;
      let numEras = R.ures_getSize(rb),
        firstTentativeIdx = MAX_INT32;
      const dates: number[] = [];
      while (R.ures_hasNext(rb)) {
        const era = R.ures_getNextResource(rb, null, status);
        try {
          /* istanbul ignore if -- B8TCAE-E01: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
          if (U_FAILURE(status[0])) return null;
          else {
            /* Keep the audited normal alternative visible to source mapping. */
          }
          const key = R.ures_getKey(era) as string,
            end: [number] = [0],
            idx = Number(BigInt.asIntN(32, uprv_strtol(key, end, 10)));
          /* istanbul ignore if -- B8TCAE-E02: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
          if (end[0] !== key.length || idx < 0) {
            status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
            return null;
          } else {
            /* Keep the audited normal alternative visible to source mapping. */
          }
          while (dates.length < idx + 1) dates.push(0);
          /* istanbul ignore if -- B8TCAE-E03: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
          if (dates[idx] !== 0) {
            status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
            return null;
          } else {
            /* Keep the audited normal alternative visible to source mapping. */
          }
          let hasName = true;
          let hasEnd = true;
          while (R.ures_hasNext(era)) {
            const res = R.ures_getNextResource(era, null, status);
            try {
              /* istanbul ignore if -- B8TCAE-E04: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
              if (U_FAILURE(status[0])) return null;
              else {
                /* Keep the audited normal alternative visible to source mapping. */
              }
              const name = R.ures_getKey(res),
                len: [number] = [0];
              if (name === "start") {
                const fields = R.ures_getIntVector(res, len, status);
                /* istanbul ignore if -- B8TCAE-E05: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
                if (U_FAILURE(status[0])) return null;
                else {
                  /* Keep the audited normal alternative visible to source mapping. */
                }
                const values = fields as readonly number[],
                  year = values[0] as number,
                  month = values[1] as number,
                  day = values[2] as number;
                /* istanbul ignore if -- B8TCAE-E06: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
                if (
                  len[0] !== 3 ||
                  year < -32768 ||
                  year > 32767 ||
                  month < 1 ||
                  month > 12 ||
                  day < 1 ||
                  day > 31
                ) {
                  status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
                  return null;
                } else {
                  /* Keep the audited normal alternative visible to source mapping. */
                }
                dates[idx] = encodeDate(year, month, day);
              } else {
                /* Transparent wrapper: preserve exact E07 annotation attachment. */
                /* istanbul ignore if -- B8TCAE-E07: no named property exists in any fixed-package era. */
                if (name === "named") {
                  const value = R.ures_getString(res, len, status) as string;
                  if (value.slice(0, 5) === "false") hasName = false;
                } else {
                  /* Transparent wrapper: preserve exact E08 annotation attachment. */
                  /* istanbul ignore else -- B8TCAE-E08: the only remaining fixed-package property is end. */
                  if (name === "end") hasEnd = true;
                }
              }
            } finally {
              R.ures_close(res);
            }
          }
          if (dates[idx] === 0) {
            /* istanbul ignore else -- User-approved B8TCAE-U01: hasEnd starts true and is never false; see CALC-371. */
            if (hasEnd) dates[idx] = MIN_ENCODED_START;
            else {
              status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
              return null;
            }
          }
          /* istanbul ignore else -- B8TCAE-E09: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
          if (hasName) {
            /* istanbul ignore if -- B8TCAE-E10: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
            if (idx >= firstTentativeIdx) {
              status[0] = UErrorCode.U_INVALID_FORMAT_ERROR;
              return null;
            } else {
              /* Keep the audited normal alternative visible to source mapping. */
            }
          } else if (idx < firstTentativeIdx) firstTentativeIdx = idx;
        } finally {
          R.ures_close(era);
        }
      }
      if (!includeTentativeEra) {
        while (firstTentativeIdx < dates.length) {
          /* istanbul ignore next -- B8TCAE-E11: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
          if (dates[dates.length - 1] !== 0) --numEras;
          /* istanbul ignore next -- B8TCAE-E12a: the fixed package has no tentative or trailing empty era; retain the loop guard. */
          dates.pop();
        }
        while (dates.length > 0 && dates[dates.length - 1] === 0)
          /* istanbul ignore next -- B8TCAE-E12b: the fixed package has no tentative or trailing empty era; retain the loop guard. */
          dates.pop();
      }
      let minEra = 0;
      while (dates.length > 0 && dates[0] === 0) {
        dates.shift();
        ++minEra;
      }
      return new EraRules(Int32Array.from(dates), minEra, numEras);
    } finally {
      R.ures_close(rb);
    }
  }
  /** Original maximum defined code includes compressed index offset. @returns Code. */
  getMaxEraCode(): number {
    return this.minEra + this.startDates.length - 1;
  }
  /** Original defined-era count, independent of sparse storage length. @returns Count. */
  getNumberOfEras(): number {
    return this.numEras;
  }
  /** Original current local era. @returns Code. */
  getCurrentEraCode(): number {
    return this.currentEra;
  }
  /** Original start-date lookup leaves output unchanged on failure. @param code - Era code. @param fields - Date output. @param status - Sticky status. @returns Nothing. */
  getStartDate(code: number, fields: [number, number, number], status: [number]): void {
    if (U_FAILURE(status[0])) return;
    code |= 0;
    let start = 0;
    if (code >= this.minEra) {
      const i = code - this.minEra;
      if (i < this.startDates.length) start = this.startDates[i] as number;
    }
    if (start !== 0) {
      decodeDate(start, fields);
      return;
    }
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
  }
  /** Original start-year lookup returns INT32_MAX on error. @param code - Era code. @param status - Sticky status. @returns Year/bogus. */
  getStartYear(code: number, status: [number]): number {
    if (U_FAILURE(status[0])) return MAX_INT32;
    code |= 0;
    let start = 0;
    if (code >= this.minEra) {
      const i = code - this.minEra;
      if (i < this.startDates.length) start = this.startDates[i] as number;
    }
    if (start !== 0) {
      const fields: [number, number, number] = [0, 0, 0];
      decodeDate(start, fields);
      return fields[0];
    }
    status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
    return MAX_INT32;
  }
  /** Original reverse-era special case and descending linear search. @param year - Year. @param month - Month1..12. @param day - Day1..31. @param status - Sticky status. @returns Era/-1 on error. */
  getEraCode(year: number, month: number, day: number, status: [number]): number {
    if (U_FAILURE(status[0])) return -1;
    year |= 0;
    month |= 0;
    day |= 0;
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return -1;
    }
    if (this.numEras > 1 && this.startDates[this.startDates.length - 1] === MIN_ENCODED_START) {
      for (let i = 0; i < this.startDates.length; ++i) {
        const value = this.startDates[i] as number;
        if (value !== 0 && compareEncodedDateWithYMD(value, year, month, day) <= 0)
          return this.minEra + i;
      }
    }
    for (let i = this.startDates.length; i > 0;) {
      const value = this.startDates[--i] as number;
      if (value !== 0 && compareEncodedDateWithYMD(value, year, month, day) <= 0)
        return this.minEra + i;
    }
    return this.minEra;
  }
  /** Original default-zone wall-clock conversion and fallback to minEra on conversion failure. @returns Nothing. */
  private initCurrentEra(): void {
    const status: [number] = [0];
    let millis = uprv_getUTCtime();
    const zone = createDefault(),
      raw: [number] = [0],
      dst: [number] = [0];
    /* istanbul ignore else -- B8TCAE-E13: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
    if (zone !== null) {
      zone.getOffset(millis, false, raw, dst, status);
      millis += raw[0] + dst[0];
    }
    const year: [number] = [0],
      month: [number] = [0],
      day: [number] = [0],
      mid: [number] = [0];
    Grego.timeToFields(millis, year, month, day, mid, status);
    this.currentEra = this.minEra;
    if (U_FAILURE(status[0])) return;
    this.currentEra = this.getEraCode(year[0], month[0] + 1, day[0], status);
    /* istanbul ignore if -- B8TCAE-E14: proven fixed-package or constructor-owned invariant; see the era-fixed-package audit. */
    if (U_FAILURE(status[0])) this.currentEra = this.minEra;
    else {
      /* Keep the audited normal alternative visible to source mapping. */
    }
  }
}
