/** @fileoverview Original comphelper::date year/day counting, validity, leap, month and normalization responsibilities from date.hxx/date.cxx. Native sal widths and assert-enabled preconditions are explicit. */
/** Original signed16 conversion after integer promotion/assignment. @param value - Native arithmetic result. @returns Original short. */
function short(value: number): number {
  return (value << 16) >> 16;
}
/** Original YearToDays uses C++ integer division toward zero and excludes civil year zero. @param year - Native signed16 year. @returns Days before the first day of the year. */
export function yearToDays(year: number): number {
  year = short(year);
  if (year === 0) throw new Error("year != 0 assertion");
  const value = (offset: number, target: number): number =>
    offset +
    target * 365 +
    Math.trunc(target / 4) -
    Math.trunc(target / 100) +
    Math.trunc(target / 400);
  return year < 0 ? value(-366, year + 1) : value(0, year - 1);
}
/** Original convertDateToDays adds source-order whole months to YearToDays without normalizing. @param day - Native uint16 day. @param month - Native uint16 month. @param year - Native signed16 year. @returns Day number from zero. */
export function convertDateToDays(day: number, month: number, year: number): number {
  day &= 65535;
  month &= 65535;
  year = short(year);
  let days = yearToDays(year);
  for (let i = 1; i < month; i++) days += getDaysInMonth(i, year);
  return days + day;
}
/** Original convertDateToDaysNormalizing preserves the common Calc null-date fast path. @param day - Native uint16 day. @param month - Native uint16 month. @param year - Native signed16 year. @returns Normalized day number. */
export function convertDateToDaysNormalizing(day: number, month: number, year: number): number {
  day &= 65535;
  month &= 65535;
  year = short(year);
  if (year === 1899 && month === 12 && day === 30) return 693594;
  const fields: DateFields = [day, month, year];
  normalize(fields);
  return convertDateToDays(...fields);
}
/** Original convertDaysToDate clamps to signed16 year bounds, then searches the proleptic Gregorian year and month. @param days - Signed32 day number. @returns Native day/month/year fields. */
export function convertDaysToDate(days: number): DateFields {
  days |= 0;
  if (days <= -11968265) return [1, 1, -32768];
  if (days >= 11967900) return [31, 12, 32767];
  const sign = days <= 0 ? -1 : 1;
  let tempDays: number,
    i = 0,
    year: number,
    recalculate: boolean;
  do {
    year = short(Math.trunc(days / 365) - i * sign);
    if (year === 0) year = sign;
    tempDays = days - yearToDays(year);
    recalculate = false;
    if (tempDays < 1) {
      i += sign;
      recalculate = true;
    } else if (tempDays > 365 && (tempDays !== 366 || !isLeapYear(year))) {
      i -= sign;
      recalculate = true;
    }
  } while (recalculate);
  let month = 1;
  while (tempDays > getDaysInMonth(month, year)) {
    tempDays -= getDaysInMonth(month, year);
    month++;
  }
  return [tempDays & 65535, month, year];
}
/** Original proleptic Gregorian leap test,including BCE years -1,-5,etc and the year-zero assertion. @param year - Native signed16 year. @returns Leap status. */
export function isLeapYear(year: number): boolean {
  year = short(year);
  if (year === 0) throw new Error("year != 0 assertion");
  if (year < 0) year = -year - 1;
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
/** Original month table and leap adjustment. With the native assertion enabled,the following release-mode invalid-month return is unreachable. @param month - Native uint16 month. @param year - Native signed16 year. @returns Days in month. */
export function getDaysInMonth(month: number, year: number): number {
  month &= 65535;
  if (!(1 <= month && month <= 12)) throw new Error("month range assertion");
  const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] as number;
  return month === 2 && isLeapYear(year) ? days + 1 : days;
}
/** Original validity checks in source order. @param day - Native uint16 day. @param month - Native uint16 month. @param year - Native signed16 year. @returns Validity. */
export function isValidDate(day: number, month: number, year: number): boolean {
  day &= 65535;
  month &= 65535;
  year = short(year);
  if (year === 0) return false;
  if (month < 1 || 12 < month) return false;
  if (day < 1 || day > getDaysInMonth(month, year)) return false;
  return true;
}
/** Original three mutable reference fields after erasing C++ address syntax. */
export type DateFields = [day: number, month: number, year: number];
/** Original normalization,including BCE backward month traversal,year-zero skipping,short-width month-overflow arithmetic and day-overflow limit clamps. @param fields - Original mutable uint16,uint16,int16 fields. @returns Whether normalization ran. */
export function normalize(fields: DateFields): boolean {
  fields[0] &= 65535;
  fields[1] &= 65535;
  fields[2] = short(fields[2]);
  if (isValidDate(...fields)) return false;
  if (fields[0] === 0 && fields[1] === 0 && fields[2] === 0) return false;
  if (fields[0] === 0 && fields[1] !== 0) --fields[1];
  if (fields[1] > 12) {
    fields[2] = short(fields[2] + Math.trunc(fields[1] / 12));
    fields[1] %= 12;
    if (fields[2] === 0) fields[2] = 1;
  }
  if (fields[1] === 0) {
    fields[2] = short(fields[2] - 1);
    if (fields[2] === 0) fields[2] = -1;
    fields[1] = 12;
  }
  if (fields[2] < 0) {
    let days: number;
    while (fields[0] > (days = getDaysInMonth(fields[1], fields[2]))) {
      fields[0] -= days;
      if (fields[1] > 1) --fields[1];
      else {
        if (fields[2] === -32768) {
          fields[0] = 1;
          fields[1] = 1;
          return true;
        }
        fields[2] = short(fields[2] - 1);
        fields[1] = 12;
      }
    }
  } else {
    let days: number;
    while (fields[0] > (days = getDaysInMonth(fields[1], fields[2]))) {
      fields[0] -= days;
      if (fields[1] < 12) ++fields[1];
      else {
        if (fields[2] === 32767) {
          fields[0] = 31;
          fields[1] = 12;
          return true;
        }
        fields[2] = short(fields[2] + 1);
        fields[1] = 1;
      }
    }
  }
  if (fields[0] === 0) fields[0] = getDaysInMonth(fields[1], fields[2]);
  return true;
}
