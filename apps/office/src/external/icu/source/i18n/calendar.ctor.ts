/** @fileoverview Original Calendar base assignment and const-TimeZone-reference constructor representation. The ephemeral reference tag preserves native pointer-versus-const-reference overloads without duplicating Calendar state or cloning before base initialization. */
import type { Calendar } from "./calendar";
import type { TimeZoneConstReference } from "./timezone";
/** Internal constructor-only reference discriminant, never stored as the owned zone. */
export class CalendarZoneReference {
  /** Borrows the original const zone for base-constructor clone timing. @param zone - Actual const reference. @returns Reference tag. */
  constructor(readonly zone: TimeZoneConstReference) {}
}
/** Original Calendar::operator= updates the one actual owner and clones its source zone. @param this - Actual destination. @param source - Actual source. @returns Destination. */
export function assignCalendar(this: Calendar, source: Calendar): Calendar {
  if (this === source) return this;
  this["fFields"].set(source["fFields"]);
  this["fStamp"].set(source["fStamp"]);
  this["fTime"] = source["fTime"];
  this["fIsTimeSet"] = source["fIsTimeSet"];
  this["fAreAllFieldsSet"] = source["fAreAllFieldsSet"];
  this["fAreFieldsSet"] = source["fAreFieldsSet"];
  this["fAreFieldsVirtuallySet"] = source["fAreFieldsVirtuallySet"];
  this["fLenient"] = source["fLenient"];
  this["fRepeatedWallTime"] = source["fRepeatedWallTime"];
  this["fSkippedWallTime"] = source["fSkippedWallTime"];
  this["fZone"] = null;
  if (source["fZone"] !== null) this["fZone"] = source["fZone"].clone();
  this["fFirstDayOfWeek"] = source["fFirstDayOfWeek"];
  this["fMinimalDaysInFirstWeek"] = source["fMinimalDaysInFirstWeek"];
  this["fWeekendOnset"] = source["fWeekendOnset"];
  this["fWeekendOnsetMillis"] = source["fWeekendOnsetMillis"];
  this["fWeekendCease"] = source["fWeekendCease"];
  this["fWeekendCeaseMillis"] = source["fWeekendCeaseMillis"];
  this["fNextStamp"] = source["fNextStamp"];
  this["validLocale"].assign(source["validLocale"]);
  this["actualLocale"].assign(source["actualLocale"]);
  return this;
}
