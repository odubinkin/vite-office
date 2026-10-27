/** @fileoverview Original OlsonTimeZone historical/final rule ownership and transition queries over the single zone owner. Native allocation/mutex/lifetime failure channels remain unported. */
import { U_FAILURE } from "../common/unicode/utypes";
import { UnicodeString } from "../common/unistr";
import { DateTimeRule } from "./dtrule";
import {
  InitialTimeZoneRule,
  TimeArrayTimeZoneRule,
  type InitialTimeZoneRuleConstReference,
  type TimeZoneRuleConstReference,
  type TimeZoneRule,
} from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import type { OlsonTimeZone } from "./olsontz";

/** Original complete lazy rule initialization, including source historical cutoff and final-zone clone with a separate start year. @param this - Actual owner. @param status - Status. @returns Nothing. */
export function initTransitionRules(this: OlsonTimeZone, status: [number]): void {
  if (U_FAILURE(status[0])) return;
  this["deleteTransitionRules"]();
  const id = new UnicodeString();
  this.getID(id);
  const stdName = id.concat(new UnicodeString("(STD)")),
    dstName = id.concat(new UnicodeString("(DST)"));
  let raw = (this["initialRawOffset"]() * 1000) | 0,
    dst = (this["initialDstOffset"]() * 1000) | 0;
  this["initialRule"] = new InitialTimeZoneRule(dst === 0 ? stdName : dstName, raw, dst);
  const count = this["transitionCount"]();
  if (count > 0) {
    let index = 0;
    this["firstTZTransitionIdx"] = 0;
    const map = this["typeMapData"] as readonly number[];
    for (; index < count; ++index) {
      if (map[index] !== 0) break;
      ++this["firstTZTransitionIdx"];
    }
    if (index !== count) {
      for (let type = 0; type < this["typeCount"]; ++type) {
        const times: number[] = [];
        for (index = this["firstTZTransitionIdx"]; index < count; ++index)
          if (type === map[index]) {
            const time = this["transitionTime"](index);
            if (this["finalZone"] === null || time <= this["finalStartMillis"]) times.push(time);
          }
        if (times.length > 0) {
          raw = ((this["typeOffsets"][type << 1] as number) * 1000) | 0;
          dst = ((this["typeOffsets"][(type << 1) + 1] as number) * 1000) | 0;
          if (this["historicRules"] === null) {
            this["historicRuleCount"] = this["typeCount"];
            this["historicRules"] = Array.from(
              { length: this["historicRuleCount"] },
              /** Original null-pointer initialization. @returns Null. */ () => null,
            );
          }
          this["historicRules"][type] = new TimeArrayTimeZoneRule(
            dst === 0 ? stdName : dstName,
            raw,
            dst,
            times,
            times.length,
            DateTimeRule.UTC_TIME,
          );
        }
      }
      const type = map[this["firstTZTransitionIdx"]] as number;
      this["firstTZTransition"] = new TimeZoneTransition(
        this["transitionTime"](this["firstTZTransitionIdx"]),
        this["initialRule"],
        (this["historicRules"] as (TimeArrayTimeZoneRule | null)[])[type] as TimeArrayTimeZoneRule,
      );
    }
  }
  const final = this["finalZone"];
  if (final !== null) {
    let start = this["finalStartMillis"],
      first: TimeZoneRule;
    if (final.useDaylightTime()) {
      this["finalZoneWithStartYear"] = final.clone();
      this["finalZoneWithStartYear"].setStartYear(this["finalStartYear"]);
      const transition = new TimeZoneTransition();
      this["finalZoneWithStartYear"].getNextTransition(start, false, transition);
      first = (transition.getTo() as TimeZoneRuleConstReference).clone();
      start = transition.getTime();
    } else {
      this["finalZoneWithStartYear"] = final.clone();
      final.getID(id);
      first = new TimeArrayTimeZoneRule(
        id,
        final.getRawOffset(),
        0,
        [start],
        1,
        DateTimeRule.UTC_TIME,
      );
    }
    let previous: TimeZoneRuleConstReference | null = null;
    if (count > 0)
      previous = (this["historicRules"] as (TimeArrayTimeZoneRule | null)[])[
        (this["typeMapData"] as readonly number[])[count - 1] as number
      ] as TimeArrayTimeZoneRule | null;
    if (previous === null) previous = this["initialRule"];
    const transition = (this["firstFinalTZTransition"] = new TimeZoneTransition());
    transition.setTime(start);
    transition.adoptFrom((previous as TimeZoneRuleConstReference).clone());
    transition.adoptTo(first);
  }
}
/** Original next-transition selection, with recursive suppression of same-name/same-offset non-transitions. @param this - Owner. @param base - UTC base. @param inclusive - Include base. @param result - Output. @returns Found. */
export function getNextTransition(
  this: OlsonTimeZone,
  base: number,
  inclusive: boolean,
  result: TimeZoneTransition,
): boolean {
  const status: [number] = [0];
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return false;
  if (this["finalZone"] !== null) {
    const first = this["firstFinalTZTransition"] as TimeZoneTransition;
    if (inclusive && base === first.getTime()) {
      result.assign(first);
      return true;
    }
    if (base >= first.getTime())
      return this["finalZone"].useDaylightTime()
        ? (
            this["finalZoneWithStartYear"] as NonNullable<OlsonTimeZone["finalZoneWithStartYear"]>
          ).getNextTransition(base, inclusive, result)
        : false;
  }
  const rules = this["historicRules"];
  if (rules !== null) {
    const count = this["transitionCount"](),
      map = this["typeMapData"] as readonly number[];
    let index = count - 1;
    for (; index >= this["firstTZTransitionIdx"]; --index) {
      const time = this["transitionTime"](index);
      if (base > time || (!inclusive && base === time)) break;
    }
    if (index === count - 1) {
      if (this["firstFinalTZTransition"] !== null) {
        result.assign(this["firstFinalTZTransition"]);
        return true;
      }
      return false;
    }
    if (index < this["firstTZTransitionIdx"]) {
      result.assign(this["firstTZTransition"] as TimeZoneTransition);
      return true;
    }
    const to = rules[map[index + 1] as number] as TimeArrayTimeZoneRule,
      from = rules[map[index] as number] as TimeArrayTimeZoneRule,
      start = this["transitionTime"](index + 1);
    if (sameRule(from, to)) return getNextTransition.call(this, start, false, result);
    result.setTime(start);
    result.adoptFrom(from.clone());
    result.adoptTo(to.clone());
    return true;
  }
  return false;
}
/** Original previous-transition selection and suppression. @param this - Owner. @param base - UTC base. @param inclusive - Include base. @param result - Output. @returns Found. */
export function getPreviousTransition(
  this: OlsonTimeZone,
  base: number,
  inclusive: boolean,
  result: TimeZoneTransition,
): boolean {
  const status: [number] = [0];
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return false;
  if (this["finalZone"] !== null) {
    const first = this["firstFinalTZTransition"] as TimeZoneTransition;
    if (inclusive && base === first.getTime()) {
      result.assign(first);
      return true;
    }
    if (base > first.getTime()) {
      if (this["finalZone"].useDaylightTime())
        return (
          this["finalZoneWithStartYear"] as NonNullable<OlsonTimeZone["finalZoneWithStartYear"]>
        ).getPreviousTransition(base, inclusive, result);
      result.assign(first);
      return true;
    }
  }
  const rules = this["historicRules"];
  if (rules !== null) {
    const map = this["typeMapData"] as readonly number[];
    let index = this["transitionCount"]() - 1;
    for (; index >= this["firstTZTransitionIdx"]; --index) {
      const time = this["transitionTime"](index);
      if (base > time || (inclusive && base === time)) break;
    }
    if (index < this["firstTZTransitionIdx"]) return false;
    if (index === this["firstTZTransitionIdx"]) {
      result.assign(this["firstTZTransition"] as TimeZoneTransition);
      return true;
    }
    const to = rules[map[index] as number] as TimeArrayTimeZoneRule,
      from = rules[map[index - 1] as number] as TimeArrayTimeZoneRule,
      start = this["transitionTime"](index);
    if (sameRule(from, to)) return getPreviousTransition.call(this, start, false, result);
    result.setTime(start);
    result.adoptFrom(from.clone());
    result.adoptTo(to.clone());
    return true;
  }
  return false;
}
/** Original rule count includes non-null historical slots plus final recurring/fixed rules. @param this - Owner. @param status - Status. @returns Count. */
export function countTransitionRules(this: OlsonTimeZone, status: [number]): number {
  if (U_FAILURE(status[0])) return 0;
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return 0;
  let count = 0;
  if (this["historicRules"] !== null)
    for (let i = 0; i < this["historicRuleCount"]; ++i)
      if (this["historicRules"][i] !== null) ++count;
  if (this["finalZone"] !== null) count += this["finalZone"].useDaylightTime() ? 2 : 1;
  return count;
}
/** Original borrowed-rule extraction with capacity and source write order. @param this - Owner. @param initial - Initial rule output. @param rules - Borrowed slots. @param count - Capacity and output count. @param status - Status. @returns Nothing. */
export function getTimeZoneRules(
  this: OlsonTimeZone,
  initial: [InitialTimeZoneRuleConstReference | null],
  rules: (TimeZoneRuleConstReference | null)[],
  count: [number],
  status: [number],
): void {
  if (U_FAILURE(status[0])) return;
  this["checkTransitionRules"](status);
  if (U_FAILURE(status[0])) return;
  initial[0] = this["initialRule"];
  let cnt = 0;
  if (this["historicRules"] !== null && count[0] > cnt)
    for (let i = 0; i < this["historicRuleCount"]; ++i) {
      const rule = this["historicRules"][i] as TimeArrayTimeZoneRule | null;
      if (rule !== null) {
        rules[cnt++] = rule;
        if (cnt >= count[0]) break;
      }
    }
  if (this["finalZoneWithStartYear"] !== null && count[0] > cnt) {
    const tempInitial: [InitialTimeZoneRuleConstReference | null] = [null],
      tempCount: [number] = [count[0] - cnt],
      tail = rules.slice(cnt);
    this["finalZoneWithStartYear"].getTimeZoneRules(tempInitial, tail, tempCount, status);
    for (let i = 0; i < tail.length; ++i)
      rules[cnt + i] = tail[i] as TimeZoneRuleConstReference | null;
    if (U_FAILURE(status[0])) return;
    cnt += tempCount[0];
  }
  count[0] = cnt;
}
/** Original non-transition test uses name and numeric offsets, not virtual annual equality. @param from - Previous rule. @param to - Next rule. @returns Same visible state. */
function sameRule(from: TimeZoneRuleConstReference, to: TimeZoneRuleConstReference): boolean {
  const left = new UnicodeString(),
    right = new UnicodeString();
  from.getName(left);
  to.getName(right);
  return (
    left.equals(right) &&
    from.getRawOffset() === to.getRawOffset() &&
    from.getDSTSavings() === to.getDSTSavings()
  );
}
