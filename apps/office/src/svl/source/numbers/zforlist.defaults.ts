/** @fileoverview Formatter static default responsibility over the shipped normal-mode Office Common schema field;no formatter/service facade. */
import dateFormat from "./data/common-date-format.json" with { type: "json" };
/** Original unsigned16 unlimited precision sentinel. */
export const UNLIMITED_PRECISION = 65535;
/** Original input-line precision sentinel immediately below unlimited precision. */
export const INPUTSTRING_PRECISION = 65534;
/** Current browser configuration field binding uses the shipped normal-mode TwoDigitYear default. Fuzzing is not a browser mode;full user configuration service remains separate. @returns First two-digit year. */
export function getYear2000Default(): number {
  return dateFormat.TwoDigitYear & 65535;
}
