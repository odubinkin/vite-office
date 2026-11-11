/** @fileoverview Original consumed OSL system-time/UTC conversion assignments. Date supplies the explicit browser CLOCK_REALTIME/gmtime platform binding; OS failures and submillisecond precision are unverified. */
import type { TimeValue, oslDateTime } from "../../inc/osl/time";
/** Original successful realtime scalar assignments; browser milliseconds lower the platform clock without an application clock provider. @param value - Actual output value. @returns Successful platform query. */
export function osl_getSystemTime(value: TimeValue): boolean {
  const milliseconds = Date.now(),
    seconds = Math.floor(milliseconds / 1000);
  value.Seconds = seconds >>> 0;
  value.Nanosec = ((milliseconds - seconds * 1000) * 1000000) >>> 0;
  return true;
}
/** Original GMT conversion copies nanoseconds unchanged and assigns calendar fields in source order. Every initialized uint32 seconds value is representable by the browser platform. @param value - Original counted seconds/nanoseconds. @param result - Actual output aggregate. @returns Successful UTC conversion. */
export function osl_getDateTimeFromTimeValue(value: TimeValue, result: oslDateTime): boolean {
  const system = new Date((value.Seconds >>> 0) * 1000);
  result.NanoSeconds = value.Nanosec;
  result.Seconds = system.getUTCSeconds();
  result.Minutes = system.getUTCMinutes();
  result.Hours = system.getUTCHours();
  result.Day = system.getUTCDate();
  result.DayOfWeek = system.getUTCDay();
  result.Month = system.getUTCMonth() + 1;
  result.Year = system.getUTCFullYear();
  return true;
}
