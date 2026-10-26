/** @fileoverview ICU78.3 TimeZone identity, generic offset algorithm, virtual daylight query and base savings method. Internal IANA construction is supplied by timezone.create; public custom/default factory dispatch remains unported. */
import { UnicodeString } from "../common/unistr";
import { U_FAILURE, type UDate } from "../common/unicode/utypes";
import { Grego } from "./gregoimp";

/** Borrowed native const TimeZone surface; mutable owners are obtained through clone. */
export type TimeZoneConstReference = Readonly<Omit<TimeZone, "setID" | "assignBase">>;

/** Original abstract TimeZone identity/numeric/clone contract for consumed calendar paths. */
export abstract class TimeZone {
  private readonly fID: UnicodeString;
  /** Original empty, ID and base-copy constructors. @param source - Copied identity or base owner. @returns Initialized owner. */
  protected constructor(source?: UnicodeString | TimeZone) {
    this.fID = new UnicodeString(source instanceof TimeZone ? source.fID : source);
  }
  /** Original explicitly-qualified TimeZone::operator= projection; derived assignment remains separate. @param other - Base owner. @returns This owner. */
  protected assignBase(other: TimeZone): this {
    if (this !== other) this.fID.assign(other.fID);
    return this;
  }
  /** Original virtual base equality compares dynamic type and ID. @param other - Compared owner. @returns Equality. */
  equals(other: TimeZone): boolean {
    return this.constructor === other.constructor && this.fID.equals(other.fID);
  }
  /** Original copied ID output, returned by reference. @param output - Caller-owned UnicodeString. @returns Output owner. */
  getID(output: UnicodeString): UnicodeString {
    return output.assign(this.fID);
  }
  /** Original ID replacement does not change numeric rules. @param id - Copied ID. @returns Nothing. */
  setID(id: UnicodeString): void {
    this.fID.assign(id);
  }
  /** Original abstract polymorphic value clone. @returns Independent zone owner. */
  abstract clone(): TimeZone;
  /** Source raw-offset subclass hook. @returns Signed32 milliseconds. */
  abstract getRawOffset(): number;
  /** Original pure virtual current-year DST query consumed by the base savings method. @returns Any observed daylight time. */
  abstract useDaylightTime(): boolean;
  /** Original base savings default delegates to the virtual daylight-time query. @returns One hour when DST is used, otherwise zero. */
  getDSTSavings(): number {
    return this.useDaylightTime() ? 3600000 : 0;
  }
  /** Native eight-argument numeric overload; explicitly named because TS cannot distinguish it from the UDate overload. @param era - Gregorian era. @param year - Extended year passed by source generic offset logic. @param month - Zero-based month. @param day - Day of month. @param weekday - Sunday1..Saturday7. @param millis - Standard millis-in-day. @param monthLength - Month length. @param status - ICU status. @returns Total signed32 offset milliseconds. */
  abstract getOffsetForFields(
    era: number,
    year: number,
    month: number,
    day: number,
    weekday: number,
    millis: number,
    monthLength: number,
    status: [number],
  ): number;
  /** Original default UTC/local offset algorithm, including its second local-standard-time pass and partial error writes. @param date - UTC or local wall milliseconds. @param local - Local interpretation flag. @param rawOffset - Raw milliseconds output. @param dstOffset - DST milliseconds output. @param status - ICU status. @returns Nothing. */
  getOffset(
    date: UDate,
    local: boolean,
    rawOffset: [number],
    dstOffset: [number],
    status: [number],
  ): void {
    if (U_FAILURE(status[0])) return;
    rawOffset[0] = this.getRawOffset();
    if (!local) date += rawOffset[0];
    for (let pass = 0; ; pass++) {
      const year: [number] = [0],
        month: [number] = [0],
        dom: [number] = [0],
        dow: [number] = [0],
        millis: [number] = [0];
      Grego.timeToFields(date, year, month, dom, dow, millis, status);
      if (U_FAILURE(status[0])) return;
      dstOffset[0] =
        (this.getOffsetForFields(
          1,
          year[0],
          month[0],
          dom[0],
          dow[0],
          millis[0],
          Grego.monthLength(year[0], month[0]),
          status,
        ) -
          rawOffset[0]) |
        0;
      if (pass !== 0 || !local || dstOffset[0] === 0) break;
      date -= dstOffset[0];
    }
  }
}
