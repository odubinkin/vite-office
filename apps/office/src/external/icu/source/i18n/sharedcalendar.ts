/** @fileoverview Original ICU78.3 SharedCalendar retained immutable Calendar owner from sharedcalendar.h. Native deletion releases the adopted JS owner; the UnifiedCache owns the shared wrapper through original hard/soft references. */
import { SharedObject } from "../common/sharedobject";
import type { Calendar } from "./calendar";
/** Borrowed native const Calendar view for the currently consumed APIs. */
export type CalendarConstReference = Readonly<
  Omit<
    Calendar,
    | "assign"
    | "set"
    | "clear"
    | "setTime"
    | "setTimeZone"
    | "adoptTimeZone"
    | "orphanTimeZone"
    | "setLenient"
    | "setFirstDayOfWeek"
    | "setMinimalDaysInFirstWeek"
    | "setRepeatedWallTimeOption"
    | "setSkippedWallTimeOption"
  >
>;
/** Original shared immutable wrapper; ptr is the one actual adopted Calendar. */
export class SharedCalendar extends SharedObject {
  private ptr: Calendar | null;
  /** Original pointer adoption. @param calendar - Actual created owner. @returns Wrapper. */
  constructor(calendar: Calendar) {
    super();
    this.ptr = calendar;
  }
  /** Original borrowed const pointer query. @returns Actual Calendar. */
  get(): CalendarConstReference {
    return this.ptr as Calendar;
  }
  /** Original destructor deletes the adopted Calendar; physical allocation and ABI are not simulated. @returns Nothing. */
  override dispose(): void {
    this.ptr = null;
  }
}
