/** @fileoverview Original ICU78.3 RuleBasedTimeZone ownership, transition completion and offset/transition queries from rbtz.cpp. Native UVector ownership is represented by owned rule arrays; cached transitions borrow those same rule owners. */
import { UnicodeString } from "../common/unistr";
import { uprv_getUTCtime } from "../common/putil";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { BasicTimeZone } from "./basictz";
import { TimeZone } from "./timezone";
import {
  AnnualTimeZoneRule,
  InitialTimeZoneRule,
  TimeZoneRule,
  type InitialTimeZoneRuleConstReference,
  type TimeZoneRuleConstReference,
} from "./tzrule";
import { TimeZoneTransition } from "./tztrans";
import { Grego, MIN_MILLIS, MAX_MILLIS } from "./gregoimp";
import type { UTimeZoneLocalOption } from "./unicode/ucal";
/** Original private transition borrows actual rules rather than cloning rule values. */
interface Transition {
  time: number;
  from: TimeZoneRule;
  to: TimeZoneRule;
}
/** Original null-sensitive ordered rule comparison. @param a - First vector/null. @param b - Second vector/null. @returns Equality. */
function compareRules(a: TimeZoneRule[] | null, b: TimeZoneRule[] | null): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null || a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i)
    if (!(a[i] as TimeZoneRule).equals(b[i] as TimeZoneRule)) return false;
  return true;
}
/** Original independently owned cloned rule vector. @param rules - Source/null. @returns Copy/null. */
function copyRules(rules: TimeZoneRule[] | null): TimeZoneRule[] | null {
  if (rules === null) return null;
  const out: TimeZoneRule[] = [];
  for (const rule of rules) out.push(rule.clone());
  return out;
}
/** Original rule-based zone owner and lazy transition state. */
export class RuleBasedTimeZone extends BasicTimeZone {
  private fInitialRule: InitialTimeZoneRule;
  private fHistoricRules: TimeZoneRule[] | null = null;
  private fFinalRules: TimeZoneRule[] | null = null;
  private fHistoricTransitions: Transition[] | null = null;
  private fUpToDate = false;
  /** Original adopted initial rule or copy constructor. Copy recomputes transitions only if the source was complete. @param source - ID/source. @param initial - Adopted initial rule. @returns Owner. */
  constructor(source: UnicodeString | RuleBasedTimeZone, initial?: InitialTimeZoneRule) {
    super(source);
    if (source instanceof RuleBasedTimeZone) {
      this.fInitialRule = source.fInitialRule.clone();
      this.fHistoricRules = copyRules(source.fHistoricRules);
      this.fFinalRules = copyRules(source.fFinalRules);
      if (source.fUpToDate) this.complete([0]);
    } else this.fInitialRule = initial as InitialTimeZoneRule;
  }
  /** Original assignment tests semantic inequality rather than pointer inequality. @param source - Source owner. @returns This owner. */
  assign(source: RuleBasedTimeZone): this {
    if (!this.equals(source)) {
      this.assignBase(source);
      this.fInitialRule = source.fInitialRule.clone();
      this.fHistoricRules = copyRules(source.fHistoricRules);
      this.fFinalRules = copyRules(source.fFinalRules);
      this.fHistoricTransitions = null;
      this.fUpToDate = false;
    }
    return this;
  }
  /** Original identity and ordered rule equality. @param other - Zone. @returns Equality. */
  override equals(other: TimeZone): boolean {
    return (
      this === other ||
      (other instanceof RuleBasedTimeZone &&
        super.equals(other) &&
        this.fInitialRule.equals(other.fInitialRule) &&
        compareRules(this.fHistoricRules, other.fHistoricRules) &&
        compareRules(this.fFinalRules, other.fFinalRules))
    );
  }
  /** Original rule equality ignores zone ID but includes rule names and order. @param other - Zone. @returns Same rules. */
  hasSameRules(other: TimeZone): boolean {
    return (
      this === other ||
      (other instanceof RuleBasedTimeZone &&
        this.constructor === other.constructor &&
        this.fInitialRule.equals(other.fInitialRule) &&
        compareRules(this.fHistoricRules, other.fHistoricRules) &&
        compareRules(this.fFinalRules, other.fFinalRules))
    );
  }
  /** Original polymorphic clone. @returns Copy. */
  clone(): RuleBasedTimeZone {
    return new RuleBasedTimeZone(this);
  }
  /** Original rule adoption accepts at most two permanent annual rules. @param rule - Adopted rule. @param status - Sticky status. @returns Nothing. */
  addTransitionRule(rule: TimeZoneRule, status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (rule instanceof AnnualTimeZoneRule && rule.getEndYear() === AnnualTimeZoneRule.MAX_YEAR) {
      if (this.fFinalRules === null) this.fFinalRules = [];
      else if (this.fFinalRules.length >= 2) {
        status[0] = UErrorCode.U_INVALID_STATE_ERROR;
        return;
      }
      this.fFinalRules.push(rule);
    } else {
      if (this.fHistoricRules === null) this.fHistoricRules = [];
      this.fHistoricRules.push(rule);
    }
    this.fUpToDate = false;
  }
  /** Original completeConst's single-realm lock boundary. @param status - Sticky status. @returns Nothing. */
  private completeConst(status: [number]): void {
    if (U_FAILURE(status[0])) return;
    if (!this.fUpToDate) this.complete(status);
  }
  /** Original transition construction retains source append behavior when already cached state is marked dirty. @param status - Sticky status. @returns Nothing. */
  complete(status: [number]): void {
    if (U_FAILURE(status[0]) || this.fUpToDate) return;
    if (this.fFinalRules !== null && this.fFinalRules.length !== 2) {
      status[0] = UErrorCode.U_INVALID_STATE_ERROR;
      return;
    }
    if (this.fHistoricRules !== null || this.fFinalRules !== null) {
      let current: TimeZoneRule = this.fInitialRule,
        last = MIN_MILLIS;
      if (this.fHistoricRules !== null && this.fHistoricRules.length > 0) {
        const rules = this.fHistoricRules,
          done = Array<boolean>(rules.length).fill(false);
        while (true) {
          const raw = current.getRawOffset(),
            dst = current.getDSTSavings(),
            curName = new UnicodeString(),
            name = new UnicodeString();
          current.getName(curName);
          let nextTime = MAX_MILLIS,
            nextRule: TimeZoneRule | null = null;
          for (let i = 0; i < rules.length; ++i) {
            if (done[i]) continue;
            const rule = rules[i] as TimeZoneRule,
              tt: [number] = [0];
            if (!rule.getNextStart(last, raw, dst, false, tt)) done[i] = true;
            else {
              rule.getName(name);
              if (
                rule.equals(current) ||
                (name.equals(curName) &&
                  rule.getRawOffset() === current.getRawOffset() &&
                  rule.getDSTSavings() === current.getDSTSavings())
              )
                continue;
              if (tt[0] < nextTime) {
                nextTime = tt[0];
                nextRule = rule;
              }
            }
          }
          if (nextRule === null) {
            let all = true;
            for (const value of done)
              if (!value) {
                all = false;
                break;
              }
            if (all) break;
          }
          if (this.fFinalRules !== null) {
            for (let i = 0; i < 2; ++i) {
              const rule = this.fFinalRules[i] as TimeZoneRule;
              if (rule.equals(current)) continue;
              const tt: [number] = [0];
              if (rule.getNextStart(last, raw, dst, false, tt) && tt[0] < nextTime) {
                nextTime = tt[0];
                nextRule = rule;
              }
            }
          }
          if (nextRule === null) break;
          if (this.fHistoricTransitions === null) this.fHistoricTransitions = [];
          this.fHistoricTransitions.push({ time: nextTime, from: current, to: nextRule });
          last = nextTime;
          current = nextRule;
        }
      }
      if (this.fFinalRules !== null) {
        if (this.fHistoricTransitions === null) this.fHistoricTransitions = [];
        const r0 = this.fFinalRules[0] as TimeZoneRule,
          r1 = this.fFinalRules[1] as TimeZoneRule,
          t0: [number] = [0],
          t1: [number] = [0];
        const a0 = r0.getNextStart(
            last,
            current.getRawOffset(),
            current.getDSTSavings(),
            false,
            t0,
          ),
          a1 = r1.getNextStart(last, current.getRawOffset(), current.getDSTSavings(), false, t1);
        if (!a0 || !a1) {
          status[0] = UErrorCode.U_INVALID_STATE_ERROR;
          this.fHistoricTransitions = null;
          this.fUpToDate = false;
          return;
        }
        let first: Transition, second: Transition;
        const time: [number] = [0];
        if (t0[0] < t1[0]) {
          first = { time: t0[0], from: current, to: r0 };
          r1.getNextStart(t0[0], r0.getRawOffset(), r0.getDSTSavings(), false, time);
          second = { time: time[0], from: r0, to: r1 };
        } else {
          first = { time: t1[0], from: current, to: r1 };
          r0.getNextStart(t1[0], r1.getRawOffset(), r1.getDSTSavings(), false, time);
          second = { time: time[0], from: r1, to: r0 };
        }
        this.fHistoricTransitions.push(first, second);
      }
    }
    this.fUpToDate = true;
  }
  /** Original numeric overload without explicit month length. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param weekday - Weekday. @param millis - Milliseconds in day. @param status - Sticky status. @returns Total offset. */
  getOffsetForFieldsWithoutMonthLength(
    era: number,
    year: number,
    month: number,
    day: number,
    weekday: number,
    millis: number,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    month |= 0;
    if (month < 0 || month > 11) {
      status[0] = UErrorCode.U_ILLEGAL_ARGUMENT_ERROR;
      return 0;
    }
    return this.getOffsetForFields(
      era,
      year,
      month,
      day,
      weekday,
      millis,
      Grego.monthLength(year | 0, month),
      status,
    );
  }
  /** Original numeric overload intentionally ignores weekday and supplied month length. @param era - Era. @param year - Year. @param month - Month. @param day - Day. @param _weekday - Ignored source weekday. @param millis - Milliseconds in day. @param _length - Ignored source length. @param status - Sticky status. @returns Total offset. */
  getOffsetForFields(
    era: number,
    year: number,
    month: number,
    day: number,
    _weekday: number,
    millis: number,
    _length: number,
    status: [number],
  ): number {
    if (U_FAILURE(status[0])) return 0;
    era &= 255;
    year |= 0;
    if (era === 0) year = (1 - year) | 0;
    const time = Number(Grego.fieldsToDay(year, month | 0, day | 0)) * 86400000 + (millis | 0),
      raw: [number] = [0],
      dst: [number] = [0];
    this.getOffsetInternal(time, true, 3, 1, raw, dst, status);
    return U_FAILURE(status[0]) ? 0 : (raw[0] + dst[0]) | 0;
  }
  /** Original offset lookup uses former gap/latter fold defaults. @param date - UTC/local millis. @param local - Local interpretation. @param raw - Raw output. @param dst - DST output. @param status - Sticky status. @returns Nothing. */
  override getOffset(
    date: number,
    local: boolean,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    this.getOffsetInternal(date, local, 4, 12, raw, dst, status);
  }
  /** Original explicit local gap/fold dispatch. @param date - Wall time. @param missing - Gap option. @param duplicated - Fold option. @param raw - Raw output. @param dst - DST output. @param status - Sticky status. @returns Nothing. */
  override getOffsetFromLocal(
    date: number,
    missing: UTimeZoneLocalOption,
    duplicated: UTimeZoneLocalOption,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    this.getOffsetInternal(date, true, missing, duplicated, raw, dst, status);
  }
  /** Original offset lookup zeros both outputs before status/dirty guards. @param date - Time. @param local - Local interpretation. @param missing - Gap option. @param duplicated - Fold option. @param raw - Raw output. @param dst - DST output. @param status - Sticky status. @returns Nothing. */
  private getOffsetInternal(
    date: number,
    local: boolean,
    missing: number,
    duplicated: number,
    raw: [number],
    dst: [number],
    status: [number],
  ): void {
    raw[0] = dst[0] = 0;
    if (U_FAILURE(status[0])) return;
    if (!this.fUpToDate) {
      status[0] = UErrorCode.U_INVALID_STATE_ERROR;
      return;
    }
    let rule: TimeZoneRule | null = null;
    const list = this.fHistoricTransitions;
    if (list === null) rule = this.fInitialRule;
    else {
      const start = this.getTransitionTime(list[0] as Transition, local, missing, duplicated);
      if (date < start) rule = this.fInitialRule;
      else {
        let i = list.length - 1;
        const end = this.getTransitionTime(list[i] as Transition, local, missing, duplicated);
        if (date > end) {
          if (this.fFinalRules !== null)
            rule = this.findRuleInFinal(date, local, missing, duplicated);
          if (rule === null) rule = (list[i] as Transition).to;
        } else {
          while (i >= 0) {
            if (date >= this.getTransitionTime(list[i] as Transition, local, missing, duplicated))
              break;
            --i;
          }
          rule = (list[i] as Transition).to;
        }
      }
    }
    if (rule !== null) {
      raw[0] = rule.getRawOffset();
      dst[0] = rule.getDSTSavings();
    }
  }
  /** Original unsupported raw-offset mutation is a no-op, without setting an error. @param _offset - Ignored source value. @returns Nothing. */
  setRawOffset(_offset: number): void {
    void _offset;
  }
  /** Original current raw offset ignores the lookup status. @returns Raw milliseconds. */
  getRawOffset(): number {
    const raw: [number] = [0],
      dst: [number] = [0];
    this.getOffset(uprv_getUTCtime(), false, raw, dst, [0]);
    return raw[0];
  }
  /** Original current or next-transition daylight query. @returns DST is current or next. */
  useDaylightTime(): boolean {
    const now = uprv_getUTCtime(),
      raw: [number] = [0],
      dst: [number] = [0];
    this.getOffset(now, false, raw, dst, [0]);
    if (dst[0] !== 0) return true;
    const next = this.findNext(now, false);
    return next !== null && next.to.getDSTSavings() !== 0;
  }
  /** Original date daylight query ignores new lookup failure after its initial status guard. @param date - UTC. @param status - Sticky status. @returns DST flag. */
  inDaylightTime(date: number, status: [number]): boolean {
    if (U_FAILURE(status[0])) return false;
    const raw: [number] = [0],
      dst: [number] = [0];
    this.getOffset(date, false, raw, dst, status);
    return dst[0] !== 0;
  }
  /** Original borrowed rule count ignores status. @param _status - Ignored status. @returns Count. */
  countTransitionRules(_status: [number]): number {
    void _status;
    return (this.fHistoricRules?.length ?? 0) + (this.fFinalRules?.length ?? 0);
  }
  /** Original capacity-limited borrowed rules, initial first, historic then final. @param initial - Initial output. @param rules - Output slots. @param count - Input capacity/output count. @param status - Sticky status. @returns Nothing. */
  getTimeZoneRules(
    initial: [InitialTimeZoneRuleConstReference | null],
    rules: (TimeZoneRuleConstReference | null)[],
    count: [number],
    status: [number],
  ): void {
    if (U_FAILURE(status[0])) return;
    initial[0] = this.fInitialRule;
    let n = 0;
    for (const vector of [this.fHistoricRules, this.fFinalRules])
      if (vector !== null && n < count[0]) {
        let i = 0;
        while (n < count[0] && i < vector.length) rules[n++] = vector[i++] as TimeZoneRule;
      }
    count[0] = n;
  }
  /** Original next-transition public wrapper completes lazily and copies result rules only on success. @param base - Base UTC. @param inclusive - Inclusive flag. @param result - Output. @returns Found. */
  getNextTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean {
    const status: [number] = [0];
    this.completeConst(status);
    if (U_FAILURE(status[0])) return false;
    const found = this.findNext(base, inclusive);
    if (found === null) return false;
    result.setTime(found.time);
    result.setFrom(found.from);
    result.setTo(found.to);
    return true;
  }
  /** Original previous-transition public wrapper. @param base - Base UTC. @param inclusive - Inclusive flag. @param result - Output. @returns Found. */
  getPreviousTransition(base: number, inclusive: boolean, result: TimeZoneTransition): boolean {
    const status: [number] = [0];
    this.completeConst(status);
    if (U_FAILURE(status[0])) return false;
    const found = this.findPrev(base, inclusive);
    if (found === null) return false;
    result.setTime(found.time);
    result.setFrom(found.from);
    result.setTo(found.to);
    return true;
  }
  /** Original permanent-rule lookup compares previous starts with local-option adjustments. @param date - Time. @param local - Local interpretation. @param missing - Gap option. @param duplicated - Fold option. @returns Borrowed rule/null. */
  private findRuleInFinal(
    date: number,
    local: boolean,
    missing: number,
    duplicated: number,
  ): TimeZoneRule | null {
    if (this.fFinalRules === null) return null;
    const r0 = this.fFinalRules[0] as AnnualTimeZoneRule,
      r1 = this.fFinalRules[1] as AnnualTimeZoneRule;
    if (r0 === null || r1 === null) return null;
    let base = date;
    if (local)
      base -= this.getLocalDelta(
        r1.getRawOffset(),
        r1.getDSTSavings(),
        r0.getRawOffset(),
        r0.getDSTSavings(),
        missing,
        duplicated,
      );
    const t0: [number] = [0],
      t1: [number] = [0],
      a0 = r0.getPreviousStart(base, r1.getRawOffset(), r1.getDSTSavings(), true, t0);
    base = date;
    if (local)
      base -= this.getLocalDelta(
        r0.getRawOffset(),
        r0.getDSTSavings(),
        r1.getRawOffset(),
        r1.getDSTSavings(),
        missing,
        duplicated,
      );
    const a1 = r1.getPreviousStart(base, r0.getRawOffset(), r0.getDSTSavings(), true, t1);
    if (!a0 || !a1) return a0 ? r0 : a1 ? r1 : null;
    return t0[0] > t1[0] ? r0 : r1;
  }
  /** Original next search and recursive name-only suppression. @param base - UTC. @param inclusive - Include base. @returns Borrowed transition/null. */
  private findNext(base: number, inclusive: boolean): Transition | null {
    const list = this.fHistoricTransitions;
    if (list === null) return null;
    let result: Transition | null = null,
      isFinal = false,
      t = list[0] as Transition,
      tt = t.time;
    if (tt > base || (inclusive && tt === base)) result = t;
    else {
      let i = list.length - 1;
      t = list[i] as Transition;
      tt = t.time;
      if (inclusive && tt === base) result = t;
      else if (tt <= base) {
        if (this.fFinalRules !== null) {
          const r0 = this.fFinalRules[0] as TimeZoneRule,
            r1 = this.fFinalRules[1] as TimeZoneRule,
            t0: [number] = [0],
            t1: [number] = [0],
            a0 = r0.getNextStart(base, r1.getRawOffset(), r1.getDSTSavings(), inclusive, t0),
            a1 = r1.getNextStart(base, r0.getRawOffset(), r0.getDSTSavings(), inclusive, t1);
          if (!a0 && !a1) return null;
          result =
            !a1 || t0[0] < t1[0]
              ? { time: t0[0], from: r1, to: r0 }
              : { time: t1[0], from: r0, to: r1 };
          isFinal = true;
        }
      } else {
        --i;
        let prev = t;
        while (i > 0) {
          t = list[i] as Transition;
          tt = t.time;
          if (tt < base || (!inclusive && tt === base)) break;
          --i;
          prev = t;
        }
        result = prev;
      }
    }
    if (
      result !== null &&
      result.from.getRawOffset() === result.to.getRawOffset() &&
      result.from.getDSTSavings() === result.to.getDSTSavings()
    )
      return isFinal ? null : this.findNext(result.time, false);
    return result;
  }
  /** Original previous search and recursive name-only suppression. @param base - UTC. @param inclusive - Include base. @returns Borrowed transition/null. */
  private findPrev(base: number, inclusive: boolean): Transition | null {
    const list = this.fHistoricTransitions;
    if (list === null) return null;
    let result: Transition | null = null,
      t = list[0] as Transition,
      tt = t.time;
    if (inclusive && tt === base) result = t;
    else if (tt < base) {
      let i = list.length - 1;
      t = list[i] as Transition;
      tt = t.time;
      if (inclusive && tt === base) result = t;
      else if (tt < base) {
        if (this.fFinalRules !== null) {
          const r0 = this.fFinalRules[0] as TimeZoneRule,
            r1 = this.fFinalRules[1] as TimeZoneRule,
            t0: [number] = [0],
            t1: [number] = [0],
            a0 = r0.getPreviousStart(base, r1.getRawOffset(), r1.getDSTSavings(), inclusive, t0),
            a1 = r1.getPreviousStart(base, r0.getRawOffset(), r0.getDSTSavings(), inclusive, t1);
          if (!a0 && !a1) return null;
          result =
            !a1 || t0[0] > t1[0]
              ? { time: t0[0], from: r1, to: r0 }
              : { time: t1[0], from: r0, to: r1 };
        } else result = t;
      } else {
        --i;
        while (i >= 0) {
          t = list[i] as Transition;
          tt = t.time;
          if (tt < base || (inclusive && tt === base)) break;
          --i;
        }
        result = t;
      }
    }
    if (
      result !== null &&
      result.from.getRawOffset() === result.to.getRawOffset() &&
      result.from.getDSTSavings() === result.to.getDSTSavings()
    )
      return this.findPrev(result.time, false);
    return result;
  }
  /** Original local transition time adjustment. @param transition - Cached transition. @param local - Local interpretation. @param missing - Gap option. @param duplicated - Fold option. @returns Adjusted time. */
  private getTransitionTime(
    transition: Transition,
    local: boolean,
    missing: number,
    duplicated: number,
  ): number {
    return (
      transition.time +
      (local
        ? this.getLocalDelta(
            transition.from.getRawOffset(),
            transition.from.getDSTSavings(),
            transition.to.getRawOffset(),
            transition.to.getDSTSavings(),
            missing,
            duplicated,
          )
        : 0)
    );
  }
  /** Original gap/fold offset mask precedence; identical total offsets take the positive branch. @param rawBefore - Prior raw. @param dstBefore - Prior DST. @param rawAfter - Next raw. @param dstAfter - Next DST. @param missing - Gap option. @param duplicated - Fold option. @returns Local adjustment. */
  private getLocalDelta(
    rawBefore: number,
    dstBefore: number,
    rawAfter: number,
    dstAfter: number,
    missing: number,
    duplicated: number,
  ): number {
    const before = (rawBefore + dstBefore) | 0,
      after = (rawAfter + dstAfter) | 0,
      dstToStd = dstBefore !== 0 && dstAfter === 0,
      stdToDst = dstBefore === 0 && dstAfter !== 0;
    if (((after - before) | 0) >= 0) {
      if (((missing & 3) === 1 && dstToStd) || ((missing & 3) === 3 && stdToDst)) return before;
      if (((missing & 3) === 1 && stdToDst) || ((missing & 3) === 3 && dstToStd)) return after;
      return (missing & 12) === 12 ? before : after;
    }
    if (((duplicated & 3) === 1 && dstToStd) || ((duplicated & 3) === 3 && stdToDst)) return after;
    if (((duplicated & 3) === 1 && stdToDst) || ((duplicated & 3) === 3 && dstToStd)) return before;
    return (duplicated & 12) === 4 ? before : after;
  }
}
