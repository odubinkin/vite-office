/** @fileoverview Original comphelper::date validity/leap/month/normalize responsibilities from date.hxx/date.cxx;day-number conversions are separate unported responsibilities. Native sal widths and assert-enabled preconditions are explicit. */
/** Original signed16 conversion after integer promotion/assignment. @param value - Native arithmetic result. @returns Original short. */
function short(value: number): number {
  return (value << 16) >> 16;
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
