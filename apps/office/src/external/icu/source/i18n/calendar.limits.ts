/** @fileoverview Consumed Calendar::getActualMaximum(UCAL_DATE) branch from ICU78.3 calendar.cpp, including its original clone and prepareGetActual writes. Other limit-helper branches are not exposed by this fragment. */
import type { Calendar } from "./calendar";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { UCalendarDateFields as F } from "./unicode/ucal";
/** Original DATE branch over the actual calendar owner; prepareGetActual(DATE,false) has only midnight and greatest-minimum date writes. @param this - Actual owner. @param status - Sticky status. @returns Actual month length. */
export function getActualMaximumDate(this: Calendar, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  const cal = this.clone();
  if (cal === null) {
    status[0] = UErrorCode.U_MEMORY_ALLOCATION_ERROR;
    return 0;
  }
  cal.setLenient(true);
  if (!U_FAILURE(status[0])) {
    cal.set(F.UCAL_MILLISECONDS_IN_DAY, 0);
    cal.set(F.UCAL_DATE, cal.getGreatestMinimum(F.UCAL_DATE));
  }
  return this["handleGetMonthLength"](
    cal.get(F.UCAL_EXTENDED_YEAR, status),
    cal.get(F.UCAL_MONTH, status),
    status,
  );
}
