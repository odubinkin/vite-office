/** @fileoverview Original LibreOffice Calendar_hijri temporal mapping and Meeus new-moon calculation. This is the source's Gregorian-backed service, distinct from ICU Islamic calendars. */
import { Calendar_gregorian } from "./calendar_gregorian";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
/** Original mean synodic period. */
const SynPeriod = 29.53058868;
/** Original 1900 reference Julian day. */
const jd1900 = 2415020.75933;
/** Original reference synodic month. */
const SynRef = 1252;
/** Original reference Hijri year. */
const GregRef = 1422;
/** Original submission mask. */
const FIELDS = (1 << C.ERA) | (1 << C.YEAR) | (1 << C.MONTH) | (1 << C.DAY_OF_MONTH);
/** Original basegfx degree conversion. @param value - Degrees. @returns Radians. */
function deg2rad(value: number): number {
  return (value / 90) * (Math.PI / 2);
}
/** Original source calendar service. */
export class Calendar_hijri extends Calendar_gregorian {
  /** Original service constructor. @returns Owner. */
  constructor() {
    super();
    this.cCalendar = "com.sun.star.i18n.Calendar_hijri";
  }
  /** Original pending-field conversion. @returns Nothing. */
  protected override mapToGregorian(): void {
    if (!(this.fieldSet & FIELDS)) return;
    const date: [number, number, number] = [
      this.fieldSetValue[C.DAY_OF_MONTH] as number,
      (this.fieldSetValue[C.MONTH] as number) + 1,
      this.fieldSetValue[C.YEAR] as number,
    ];
    if (this.fieldSetValue[C.ERA] === 0) date[2] *= -1;
    this.ToGregorian(date);
    this.fieldSetValue[C.ERA] = date[2] <= 0 ? 0 : 1;
    this.fieldSetValue[C.MONTH] = date[1] - 1;
    this.fieldSetValue[C.DAY_OF_MONTH] = date[0];
    this.fieldSetValue[C.YEAR] = Math.abs(date[2]);
    this.fieldSet |= FIELDS;
  }
  /** Original completed-field conversion. @returns Nothing. */
  protected override mapFromGregorian(): void {
    const date: [number, number, number] = [
      this.fieldValue[C.DAY_OF_MONTH] as number,
      (this.fieldValue[C.MONTH] as number) + 1,
      this.fieldValue[C.YEAR] as number,
    ];
    if (this.fieldValue[C.ERA] === 0) date[2] *= -1;
    this.getHijri(date);
    this.fieldValue[C.DAY_OF_MONTH] = date[0];
    this.fieldValue[C.MONTH] = date[1] - 1;
    this.fieldValue[C.YEAR] = Math.abs(date[2]);
    this.fieldValue[C.ERA] = (date[2] << 16) >> 16 < 1 ? 0 : 1;
  }
  /** Original Nth new moon since January1900; operation grouping and approximate ET-to-UT correction are retained. @param n - Synodic month. @returns Julian time. */
  NewMoon(n: number): number {
    const k = n,
      t = k / 1236.85,
      t2 = t * t,
      t3 = t2 * t;
    let jd =
      jd1900 +
      SynPeriod * k -
      0.0001178 * t2 -
      0.000000155 * t3 +
      0.00033 * Math.sin(deg2rad(166.56 + 132.87 * t - 0.009173 * t2));
    const sa = deg2rad(359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3),
      ma = deg2rad(306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3),
      tf = 2 * deg2rad(21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3);
    const xtra =
      (0.1734 - 0.000393 * t) * Math.sin(sa) +
      0.0021 * Math.sin(sa * 2) -
      0.4068 * Math.sin(ma) +
      0.0161 * Math.sin(2 * ma) -
      0.0004 * Math.sin(3 * ma) +
      0.0104 * Math.sin(tf) -
      0.0051 * Math.sin(sa + ma) -
      0.0074 * Math.sin(sa - ma) +
      0.0004 * Math.sin(tf + sa) -
      0.0004 * Math.sin(tf - sa) -
      0.0006 * Math.sin(tf + ma) +
      0.001 * Math.sin(tf - ma) +
      0.0005 * Math.sin(sa + 2 * ma);
    jd += xtra - (0.41 + 1.2053 * t + 0.4992 * t2) / 1440;
    return jd;
  }
  /** Original Gregorian-to-Hijri search, including signed remainder behavior. @param date - In/out day,month,year. @returns Nothing. */
  getHijri(date: [number, number, number]): void {
    const julday = this.getJulianDay(...date),
      synmonth = Math.trunc(0.5 + (julday - jd1900) / SynPeriod);
    let newsyn = synmonth,
      newjd: number;
    const prevday = julday - 0.5;
    do {
      newjd = this.NewMoon(newsyn);
      --newsyn;
    } while (newjd > prevday);
    ++newsyn;
    const syndiff = newsyn - SynRef;
    date[0] = Math.trunc(julday - newjd + 0.5);
    date[1] = (syndiff % 12) + 1;
    date[2] = GregRef + Math.trunc(syndiff / 12);
    if (syndiff !== 0 && date[1] <= 0) {
      date[1] += 12;
      --date[2];
    }
    if (date[2] <= 0) --date[2];
  }
  /** Original Hijri-to-Gregorian conversion and negative-year rejection values. @param date - In/out day,month,year. @returns Nothing. */
  ToGregorian(date: [number, number, number]): void {
    if (date[2] < 0) ++date[2];
    const nmonth = date[1] + date[2] * 12 - (GregRef * 12 + 1) + SynRef,
      jday = Math.trunc(this.NewMoon(nmonth) + date[0] + 0.5);
    this.getGregorianDay(jday | 0, date);
    if (date[2] <= 0) {
      date[0] = -1;
      date[1] = -1;
      date[2] = -1;
    }
  }
  /** Original Numerical Recipes conversion, retaining explicit float32 intermediate casts. @param julian - Signed32 Julian day. @param date - Output day,month,year. @returns Nothing. */
  getGregorianDay(julian: number, date: [number, number, number]): void {
    let a: number;
    if (julian >= 2299161) {
      const adjust = Math.trunc((Math.fround(julian - 1867216) - 0.25) / 36524.25);
      a = julian + 1 + adjust - Math.trunc(0.25 * adjust);
    } else a = julian;
    const b = a + 1524,
      c = Math.trunc(6680 + (Math.fround(b - 2439870) - 122.1) / 365.25),
      d = Math.trunc(365 * c + 0.25 * c),
      e = Math.trunc((b - d) / 30.6);
    date[0] = b - d - Math.trunc(30.6 * e);
    date[1] = e - 1;
    if (date[1] > 12) date[1] -= 12;
    date[2] = c - 4715;
    if (date[1] > 2) --date[2];
    if (date[2] <= 0) --date[2];
  }
  /** Original Julian conversion, including the Gregorian crossover gap and truncation. @param day - Day. @param month - Month. @param year - Year. @returns Signed32 Julian day. */
  getJulianDay(day: number, month: number, year: number): number {
    if (year === 0) return -1;
    if (year === 1582 && month === 10 && day > 4 && day < 15) return -1;
    const jy = month > 2 ? year : year - 1,
      jm = month > 2 ? month + 1 : month + 13;
    let result = (Math.trunc(365.25 * jy) + Math.trunc(30.6 * jm) + day + 1720995) | 0;
    if (day + 31 * (month + 12 * year) >= 15 + 31 * (10 + 12 * 1582)) {
      const ja = Math.trunc(0.01 * jy);
      result = (result + Math.trunc(2 - ja + Math.trunc(0.25 * ja))) | 0;
    }
    return result;
  }
}
