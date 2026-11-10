/** @fileoverview Native DateTimeToOUString field serializer from datetimeutils.cxx, retaining the original unconverted local fields and trailing Z. */
import type { DateTimeConstReference } from "./datetime";
/** Original two-digit append including its out-of-range 00 result. @param value - Native component. @returns Original text. */
function twoDigits(value: number): string {
  return value < 0 || value > 99 ? "00" : (value < 10 ? "0" : "") + String(value);
}
/** Serializes native fields without timezone conversion or fractional seconds, as in the pinned source. @param value - Actual native date/time. @returns Original date/time text. */
export function DateTimeToOUString(value: DateTimeConstReference): string {
  return (
    String(value.GetYear()) +
    "-" +
    twoDigits(value.GetMonth()) +
    "-" +
    twoDigits(value.GetDay()) +
    "T" +
    twoDigits(value.GetHour()) +
    ":" +
    twoDigits(value.GetMin()) +
    ":" +
    twoDigits(value.GetSec()) +
    "Z"
  );
}
