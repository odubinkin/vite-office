/** @fileoverview Original LibreOffice Calendar_jewish temporal conversion from Calendrical Calculations. Source absolute-day searches and integer division are retained; ICU Hebrew is a separate implementation. */
import { Calendar_gregorian } from "./calendar_gregorian";
import * as C from "../../../offapi/com/sun/star/i18n/CalendarFieldIndex";
/** Original absolute Hebrew epoch. */
const HebrewEpoch = -1373429;
/** Original source date-field mask. */
const FIELDS = (1 << C.ERA) | (1 << C.YEAR) | (1 << C.MONTH) | (1 << C.DAY_OF_MONTH);
/** Original Hebrew leap predicate, including signed remainder. @param year - Year. @returns Leap flag. */
function HebrewLeapYear(year: number): boolean {
  return (7 * year + 1) % 19 < 7;
}
/** Original final month number. @param year - Year. @returns Month. */
function LastMonthOfHebrewYear(year: number): number {
  return HebrewLeapYear(year) ? 13 : 12;
}
/** Original mean conjunction and postponement rules. @param year - Year. @returns Elapsed days. */
function HebrewCalendarElapsedDays(year: number): number {
  const months =
      235 * Math.trunc((year - 1) / 19) +
      12 * ((year - 1) % 19) +
      Math.trunc((7 * ((year - 1) % 19) + 1) / 19),
    parts = 204 + 793 * (months % 1080),
    hours = 5 + 12 * months + 793 * Math.trunc(months / 1080) + Math.trunc(parts / 1080),
    day = 1 + 29 * months + Math.trunc(hours / 24),
    conjunction = 1080 * (hours % 24) + (parts % 1080);
  let alternative =
    conjunction >= 19440 ||
    (day % 7 === 2 && conjunction >= 9924 && !HebrewLeapYear(year)) ||
    (day % 7 === 1 && conjunction >= 16789 && HebrewLeapYear(year - 1))
      ? day + 1
      : day;
  if (alternative % 7 === 0 || alternative % 7 === 3 || alternative % 7 === 5) alternative++;
  return alternative;
}
/** Original Hebrew year length. @param year - Year. @returns Days. */
function DaysInHebrewYear(year: number): number {
  return HebrewCalendarElapsedDays(year + 1) - HebrewCalendarElapsedDays(year);
}
/** Original long-Heshvan predicate. @param year - Year. @returns Flag. */
function LongHeshvan(year: number): boolean {
  return DaysInHebrewYear(year) % 10 === 5;
}
/** Original short-Kislev predicate. @param year - Year. @returns Flag. */
function ShortKislev(year: number): boolean {
  return DaysInHebrewYear(year) % 10 === 3;
}
/** Original Hebrew month length. @param month - Month. @param year - Year. @returns Days. */
function LastDayOfHebrewMonth(month: number, year: number): number {
  return month === 2 ||
    month === 4 ||
    month === 6 ||
    (month === 8 && !LongHeshvan(year)) ||
    (month === 9 && ShortKislev(year)) ||
    month === 10 ||
    (month === 12 && !HebrewLeapYear(year)) ||
    month === 13
    ? 29
    : 30;
}
/** Original source-owned Hebrew date value. */
class HebrewDate {
  private year: number;
  private month: number;
  private day: number;
  /** Original absolute-day or explicit month/day/year construction. @param args - Native overload arguments. @returns Value. */
  constructor(...args: [absolute: number] | [month: number, day: number, year: number]) {
    if (args.length === 3) {
      [this.month, this.day, this.year] = args;
      return;
    }
    const d = args[0];
    if (d === 730119) {
      this.year = 5760;
      this.month = 10;
      this.day = 22;
      return;
    }
    this.year = Math.trunc((d + HebrewEpoch) / 366);
    while (d >= new HebrewDate(7, 1, this.year + 1).GetAbsoluteDate()) ++this.year;
    this.month = d < new HebrewDate(1, 1, this.year).GetAbsoluteDate() ? 7 : 1;
    while (
      d >
      new HebrewDate(
        this.month,
        LastDayOfHebrewMonth(this.month, this.year),
        this.year,
      ).GetAbsoluteDate()
    )
      ++this.month;
    this.day = d - new HebrewDate(this.month, 1, this.year).GetAbsoluteDate() + 1;
  }
  /** Original absolute-day conversion. @returns Absolute day. */
  GetAbsoluteDate(): number {
    let day = this.day;
    if (this.month < 7) {
      let m = 7;
      while (m <= LastMonthOfHebrewYear(this.year)) {
        day += LastDayOfHebrewMonth(m, this.year);
        m++;
      }
      m = 1;
      while (m < this.month) {
        day += LastDayOfHebrewMonth(m, this.year);
        m++;
      }
    } else {
      let m = 7;
      while (m < this.month) {
        day += LastDayOfHebrewMonth(m, this.year);
        m++;
      }
    }
    return day + (HebrewCalendarElapsedDays(this.year) + HebrewEpoch);
  }
  /** Original month accessor. @returns Month. */
  GetMonth(): number {
    return this.month;
  }
  /** Original day accessor. @returns Day. */
  GetDay(): number {
    return this.day;
  }
  /** Original year accessor. @returns Year. */
  GetYear(): number {
    return this.year;
  }
}
/** Original Gregorian month length, including its default branch for out-of-range input months. @param month - Month. @param year - Year. @returns Days. */
function LastDayOfGregorianMonth(month: number, year: number): number {
  switch (month) {
    case 2:
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
    default:
      return 31;
  }
}
/** Original Gregorian absolute-day value used by this calendar service. */
class GregorianDate {
  private year: number;
  private month: number;
  private day: number;
  /** Original source overloads. @param args - Absolute day or month/day/year. @returns Value. */
  constructor(...args: [absolute: number] | [month: number, day: number, year: number]) {
    if (args.length === 3) {
      [this.month, this.day, this.year] = args;
      return;
    }
    const d = args[0];
    this.year = Math.trunc(d / 366);
    while (d >= new GregorianDate(1, 1, this.year + 1).GetAbsoluteDate()) ++this.year;
    this.month = 1;
    while (
      d >
      new GregorianDate(
        this.month,
        LastDayOfGregorianMonth(this.month, this.year),
        this.year,
      ).GetAbsoluteDate()
    )
      ++this.month;
    this.day = d - new GregorianDate(this.month, 1, this.year).GetAbsoluteDate() + 1;
  }
  /** Original signed integer divisions. @returns Absolute day. */
  GetAbsoluteDate(): number {
    let n = this.day;
    for (let m = this.month - 1; m > 0; --m) n += LastDayOfGregorianMonth(m, this.year);
    return (
      n +
      365 * (this.year - 1) +
      Math.trunc((this.year - 1) / 4) -
      Math.trunc((this.year - 1) / 100) +
      Math.trunc((this.year - 1) / 400)
    );
  }
  /** Original month accessor. @returns Month. */
  GetMonth(): number {
    return this.month;
  }
  /** Original day accessor. @returns Day. */
  GetDay(): number {
    return this.day;
  }
  /** Original year accessor. @returns Year. */
  GetYear(): number {
    return this.year;
  }
}
/** Original Jewish calendar temporal service. */
export class Calendar_jewish extends Calendar_gregorian {
  /** Original service construction. @returns Owner. */
  constructor() {
    super();
    this.cCalendar = "com.sun.star.i18n.Calendar_jewish";
  }
  /** Original completed Gregorian-to-Hebrew mapping. @returns Nothing. */
  protected override mapFromGregorian(): void {
    let y = this.fieldValue[C.YEAR] as number;
    if (this.fieldValue[C.ERA] === 0) y = 1 - y;
    const temp = new GregorianDate(
        (this.fieldValue[C.MONTH] as number) + 1,
        this.fieldValue[C.DAY_OF_MONTH] as number,
        y,
      ),
      hd = new HebrewDate(temp.GetAbsoluteDate());
    this.fieldValue[C.ERA] = hd.GetYear() <= 0 ? 0 : 1;
    this.fieldValue[C.MONTH] = hd.GetMonth() - 1;
    this.fieldValue[C.DAY_OF_MONTH] = hd.GetDay();
    this.fieldValue[C.YEAR] = hd.GetYear() <= 0 ? 1 - hd.GetYear() : hd.GetYear();
  }
  /** Original pending Hebrew-to-Gregorian mapping; local y remains signed16. @returns Nothing. */
  protected override mapToGregorian(): void {
    if (!(this.fieldSet & FIELDS)) return;
    let y = this.fieldSetValue[C.YEAR] as number;
    if (this.fieldSetValue[C.ERA] === 0) y = ((1 - y) << 16) >> 16;
    const temp = new HebrewDate(
        (this.fieldSetValue[C.MONTH] as number) + 1,
        this.fieldSetValue[C.DAY_OF_MONTH] as number,
        y,
      ),
      gd = new GregorianDate(temp.GetAbsoluteDate());
    this.fieldSetValue[C.ERA] = gd.GetYear() <= 0 ? 0 : 1;
    this.fieldSetValue[C.MONTH] = gd.GetMonth() - 1;
    this.fieldSetValue[C.DAY_OF_MONTH] = gd.GetDay();
    this.fieldSetValue[C.YEAR] = gd.GetYear() <= 0 ? 1 - gd.GetYear() : gd.GetYear();
    this.fieldSet |= FIELDS;
  }
}
