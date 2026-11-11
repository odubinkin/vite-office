/** @fileoverview Original OSL TimeValue/oslDateTime fields and consumed UTC C functions. Native chrono constructors and other time APIs remain unported. */
/** Native internal TimeValue; default primitive fields are indeterminate until initialized by caller or C output. */
export class TimeValue {
  Seconds!: number;
  Nanosec!: number;
  /** Original default and seconds/nanoseconds constructors. @param args - Original scalar arguments. @returns Native value. */
  constructor(...args: [] | [seconds: number, nanoseconds: number]) {
    if (args.length !== 0) {
      this.Seconds = args[0] >>> 0;
      this.Nanosec = args[1] >>> 0;
    }
  }
}
/** Original aggregate; no invented zero defaults or automatic normalization. */
export class oslDateTime {
  NanoSeconds!: number;
  Seconds!: number;
  Minutes!: number;
  Hours!: number;
  Day!: number;
  DayOfWeek!: number;
  Month!: number;
  Year!: number;
}
export { osl_getSystemTime, osl_getDateTimeFromTimeValue } from "../../osl/unx/time";
