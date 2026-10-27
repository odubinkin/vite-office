/** @fileoverview Original ICU78.3 UCalendarDaysOfWeek from ucal.h. */
export enum UCalendarDaysOfWeek {
  UCAL_SUNDAY = 1,
  UCAL_MONDAY,
  UCAL_TUESDAY,
  UCAL_WEDNESDAY,
  UCAL_THURSDAY,
  UCAL_FRIDAY,
  UCAL_SATURDAY,
}

/** Original ICU78.3 field numbering, including the DAY_OF_MONTH alias. */
export enum UCalendarDateFields {
  UCAL_ERA,
  UCAL_YEAR,
  UCAL_MONTH,
  UCAL_WEEK_OF_YEAR,
  UCAL_WEEK_OF_MONTH,
  UCAL_DATE,
  UCAL_DAY_OF_YEAR,
  UCAL_DAY_OF_WEEK,
  UCAL_DAY_OF_WEEK_IN_MONTH,
  UCAL_AM_PM,
  UCAL_HOUR,
  UCAL_HOUR_OF_DAY,
  UCAL_MINUTE,
  UCAL_SECOND,
  UCAL_MILLISECOND,
  UCAL_ZONE_OFFSET,
  UCAL_DST_OFFSET,
  UCAL_YEAR_WOY,
  UCAL_DOW_LOCAL,
  UCAL_EXTENDED_YEAR,
  UCAL_JULIAN_DAY,
  UCAL_MILLISECONDS_IN_DAY,
  UCAL_IS_LEAP_MONTH,
  UCAL_ORDINAL_MONTH,
  UCAL_FIELD_COUNT,
  UCAL_DAY_OF_MONTH = 5, // Original UCAL_DATE alias.
}

/** Original ICU local-time interpretation options; bit combinations retain their native values. */
export enum UTimeZoneLocalOption {
  UCAL_TZ_LOCAL_FORMER = 0x04,
  UCAL_TZ_LOCAL_LATTER = 0x0c,
  UCAL_TZ_LOCAL_STANDARD_FORMER = 0x05,
  UCAL_TZ_LOCAL_STANDARD_LATTER = 0x0d,
  UCAL_TZ_LOCAL_DAYLIGHT_FORMER = 0x07,
  UCAL_TZ_LOCAL_DAYLIGHT_LATTER = 0x0f,
}
/** Original repeated/skipped wall-clock interpretation options. */
export enum UCalendarWallTimeOption {
  UCAL_WALLTIME_LAST = 0,
  UCAL_WALLTIME_FIRST = 1,
  UCAL_WALLTIME_NEXT_VALID = 2,
}

/** Original weekend classification enum from ucal.h. */
export enum UCalendarWeekdayType {
  UCAL_WEEKDAY,
  UCAL_WEEKEND,
  UCAL_WEEKEND_ONSET,
  UCAL_WEEKEND_CEASE,
}
