/** @fileoverview Original SimpleTimeZone lazy transition-rule construction/query fragments, using the actual single owner. Native allocation and mutex/ABI contracts remain outside the browser value projection. */
import { UnicodeString } from "../common/unistr";
import { U_FAILURE } from "../common/unicode/utypes";
import { DateTimeRule, TimeRuleType } from "./dtrule";
import {
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  type InitialTimeZoneRuleConstReference,
  type TimeZoneRuleConstReference,
} from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import type { SimpleTimeZone } from "./simpletz";

/** Original lazy initialization and rule/name ownership, excluding unavailable native allocation-failure channels. @param this - Actual zone owner. @param status - ICU status. @returns Nothing. */
export function initTransitionRules(this: SimpleTimeZone, status: [number]): void {
  if (U_FAILURE(status[0]) || this["transitionRulesInitialized"]) return;
  this["deleteTransitionRules"]();
  const id = new UnicodeString();
  this.getID(id);
  if (this["useDaylight"]) {
    let dateRule!: DateTimeRule;
    const startType =
      this["startTimeMode"] === 1
        ? TimeRuleType.STANDARD_TIME
        : this["startTimeMode"] === 2
          ? TimeRuleType.UTC_TIME
          : TimeRuleType.WALL_TIME;
    // Private modes are initialized to DOM and only assigned the four EMode values by
    // decode/copy; even failed decodes retain one of these modes. This switch is exhaustive.
    switch (this["startMode"]) {
      case 1:
        dateRule = new DateTimeRule(
          this["startMonth"],
          this["startDay"],
          this["startTime"],
          startType,
        );
        break;
      case 2:
        dateRule = new DateTimeRule(
          this["startMonth"],
          this["startDay"],
          this["startDayOfWeek"],
          this["startTime"],
          startType,
        );
        break;
      case 3:
        dateRule = new DateTimeRule(
          this["startMonth"],
          this["startDay"],
          this["startDayOfWeek"],
          true,
          this["startTime"],
          startType,
        );
        break;
      case 4:
        dateRule = new DateTimeRule(
          this["startMonth"],
          this["startDay"],
          this["startDayOfWeek"],
          false,
          this["startTime"],
          startType,
        );
        break;
    }
    const dst = (this["dstRule"] = new AnnualTimeZoneRule(
      id.concat(new UnicodeString("(DST)")),
      this.getRawOffset(),
      this.getDSTSavings(),
      dateRule,
      this["startYear"],
      AnnualTimeZoneRule.MAX_YEAR,
      "adopt",
    ));
    const firstDst: [number] = [0];
    dst.getFirstStart(this.getRawOffset(), 0, firstDst);
    const endType =
      this["endTimeMode"] === 1
        ? TimeRuleType.STANDARD_TIME
        : this["endTimeMode"] === 2
          ? TimeRuleType.UTC_TIME
          : TimeRuleType.WALL_TIME;
    switch (this["endMode"]) {
      case 1:
        dateRule = new DateTimeRule(this["endMonth"], this["endDay"], this["endTime"], endType);
        break;
      case 2:
        dateRule = new DateTimeRule(
          this["endMonth"],
          this["endDay"],
          this["endDayOfWeek"],
          this["endTime"],
          endType,
        );
        break;
      case 3:
        dateRule = new DateTimeRule(
          this["endMonth"],
          this["endDay"],
          this["endDayOfWeek"],
          true,
          this["endTime"],
          endType,
        );
        break;
      case 4:
        dateRule = new DateTimeRule(
          this["endMonth"],
          this["endDay"],
          this["endDayOfWeek"],
          false,
          this["endTime"],
          endType,
        );
        break;
    }
    const std = (this["stdRule"] = new AnnualTimeZoneRule(
      id.concat(new UnicodeString("(STD)")),
      this.getRawOffset(),
      0,
      dateRule,
      this["startYear"],
      AnnualTimeZoneRule.MAX_YEAR,
      "adopt",
    ));
    const firstStd: [number] = [0];
    std.getFirstStart(this.getRawOffset(), dst.getDSTSavings(), firstStd);
    const initial = (this["initialRule"] =
      firstStd[0] < firstDst[0]
        ? new InitialTimeZoneRule(
            id.concat(new UnicodeString("(DST)")),
            this.getRawOffset(),
            dst.getDSTSavings(),
          )
        : new InitialTimeZoneRule(id.concat(new UnicodeString("(STD)")), this.getRawOffset(), 0));
    this["firstTransition"] =
      firstStd[0] < firstDst[0]
        ? new TimeZoneTransition(firstStd[0], initial, std)
        : new TimeZoneTransition(firstDst[0], initial, dst);
  } else this["initialRule"] = new InitialTimeZoneRule(id, this.getRawOffset(), 0);
  this["transitionRulesInitialized"] = true;
}
/** Original next-transition query, retaining first-result assignment without an early return and strict tie comparisons. @param this - Actual zone. @param base - UTC base. @param inclusive - Include base. @param result - Caller-owned transition. @returns Found. */
export function getNextTransition(
  this: SimpleTimeZone,
  base: number,
  inclusive: boolean,
  result: TimeZoneTransition,
): boolean {
  if (!this["useDaylight"]) return false;
  const status: [number] = [0];
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return false;
  const first = this["firstTransition"] as TimeZoneTransition,
    time = first.getTime();
  if (base < time || (inclusive && base === time)) result.assign(first);
  const std = this["stdRule"] as AnnualTimeZoneRule,
    dst = this["dstRule"] as AnnualTimeZoneRule,
    stdDate: [number] = [0],
    dstDate: [number] = [0];
  const stdAvail = std.getNextStart(
      base,
      dst.getRawOffset(),
      dst.getDSTSavings(),
      inclusive,
      stdDate,
    ),
    dstAvail = dst.getNextStart(base, std.getRawOffset(), std.getDSTSavings(), inclusive, dstDate);
  if (stdAvail && (!dstAvail || stdDate[0] < dstDate[0])) {
    result.setTime(stdDate[0]);
    result.setFrom(dst);
    result.setTo(std);
    return true;
  }
  if (dstAvail && (!stdAvail || dstDate[0] < stdDate[0])) {
    result.setTime(dstDate[0]);
    result.setFrom(std);
    result.setTo(dst);
    return true;
  }
  return false;
}
/** Original previous-transition query. @param this - Actual zone. @param base - UTC base. @param inclusive - Include base. @param result - Caller-owned transition. @returns Found. */
export function getPreviousTransition(
  this: SimpleTimeZone,
  base: number,
  inclusive: boolean,
  result: TimeZoneTransition,
): boolean {
  if (!this["useDaylight"]) return false;
  const status: [number] = [0];
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return false;
  const first = (this["firstTransition"] as TimeZoneTransition).getTime();
  if (base < first || (!inclusive && base === first)) return false;
  const std = this["stdRule"] as AnnualTimeZoneRule,
    dst = this["dstRule"] as AnnualTimeZoneRule,
    stdDate: [number] = [0],
    dstDate: [number] = [0];
  const stdAvail = std.getPreviousStart(
      base,
      dst.getRawOffset(),
      dst.getDSTSavings(),
      inclusive,
      stdDate,
    ),
    dstAvail = dst.getPreviousStart(
      base,
      std.getRawOffset(),
      std.getDSTSavings(),
      inclusive,
      dstDate,
    );
  if (stdAvail && (!dstAvail || stdDate[0] > dstDate[0])) {
    result.setTime(stdDate[0]);
    result.setFrom(dst);
    result.setTo(std);
    return true;
  }
  if (dstAvail && (!stdAvail || dstDate[0] > stdDate[0])) {
    result.setTime(dstDate[0]);
    result.setFrom(std);
    result.setTo(dst);
    return true;
  }
  return false;
}
/** Original borrowed-rule output order and capacity handling. @param this - Actual zone. @param initial - Borrowed initial output. @param rules - Borrowed rule slots. @param count - Capacity/input and written count/output. @param status - ICU status. @returns Nothing. */
export function getTimeZoneRules(
  this: SimpleTimeZone,
  initial: [InitialTimeZoneRuleConstReference | null],
  rules: (TimeZoneRuleConstReference | null)[],
  count: [number],
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return;
  initial[0] = this["initialRule"];
  let written = 0;
  if (this["stdRule"] !== null) {
    if (written < count[0]) rules[written++] = this["stdRule"];
    if (written < count[0]) rules[written++] = this["dstRule"];
  }
  count[0] = written;
}
