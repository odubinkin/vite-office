/** @fileoverview ICU78.3 TimeZoneTransition value/owned-rule copying, adoption and equality. Native lifetime/undefined-null operations are not certified. */
import type { TimeZoneRule, TimeZoneRuleConstReference } from "./tzrule";

/** Original time plus independently owned from/to rule values. */
export class TimeZoneTransition {
  private fTime = 0;
  private fFrom: TimeZoneRule | null = null;
  private fTo: TimeZoneRule | null = null;
  /** Original empty/copy construction. @param source - Optional copied transition. @returns Owner. */
  constructor(source?: TimeZoneTransition);
  /** Original time/rule construction clones both rules. @param time - UTC millis. @param from - Prior rule. @param to - New rule. @returns Owner. */
  constructor(time: number, from: TimeZoneRuleConstReference, to: TimeZoneRuleConstReference);
  /** Original constructor families, including nullable fields only for copy construction. @param source - Transition or time. @param from - Prior rule. @param to - New rule. @returns Owner. */
  constructor(
    source?: TimeZoneTransition | number,
    from?: TimeZoneRuleConstReference,
    to?: TimeZoneRuleConstReference,
  ) {
    if (typeof source === "number") {
      this.fTime = source;
      this.fFrom = (from as TimeZoneRuleConstReference).clone();
      this.fTo = (to as TimeZoneRuleConstReference).clone();
    } else if (source) {
      this.fTime = source.fTime;
      this.fFrom = source.fFrom?.clone() ?? null;
      this.fTo = source.fTo?.clone() ?? null;
    }
  }
  /** Original independent value clone. @returns Owner. */
  clone(): TimeZoneTransition {
    return new TimeZoneTransition(this);
  }
  /** Original assignment requires initialized source from/to rules, unlike copy construction. @param source - Copied transition. @returns This owner. */
  assign(source: TimeZoneTransition): this {
    if (this !== source) {
      this.fTime = source.fTime;
      this.setFrom(source.fFrom as TimeZoneRule);
      this.setTo(source.fTo as TimeZoneRule);
    }
    return this;
  }
  /** Original dynamic-type, time and virtual-rule equality with nullable empty state. @param other - Compared value. @returns Equality. */
  equals(other: TimeZoneTransition): boolean {
    return (
      this === other ||
      (this.constructor === other.constructor &&
        this.fTime === other.fTime &&
        ((this.fFrom === null && other.fFrom === null) ||
          (this.fFrom !== null && other.fFrom !== null && this.fFrom.equals(other.fFrom))) &&
        ((this.fTo === null && other.fTo === null) ||
          (this.fTo !== null && other.fTo !== null && this.fTo.equals(other.fTo))))
    );
  }
  /** Original time update. @param time - UTC millis. @returns Nothing. */
  setTime(time: number): void {
    this.fTime = time;
  }
  /** Original owned rule replacement by clone. @param from - Prior rule. @returns Nothing. */
  setFrom(from: TimeZoneRuleConstReference): void {
    this.fFrom = from.clone();
  }
  /** Original pointer adoption. @param from - Transferred owner/null. @returns Nothing. */
  adoptFrom(from: TimeZoneRule | null): void {
    this.fFrom = from;
  }
  /** Original owned rule replacement by clone. @param to - New rule. @returns Nothing. */
  setTo(to: TimeZoneRuleConstReference): void {
    this.fTo = to.clone();
  }
  /** Original pointer adoption. @param to - Transferred owner/null. @returns Nothing. */
  adoptTo(to: TimeZoneRule | null): void {
    this.fTo = to;
  }
  /** Original time query. @returns UTC millis. */
  getTime(): number {
    return this.fTime;
  }
  /** Original borrowed const rule. @returns Prior rule/null. */
  getFrom(): TimeZoneRuleConstReference | null {
    return this.fFrom;
  }
  /** Original borrowed const rule. @returns New rule/null. */
  getTo(): TimeZoneRuleConstReference | null {
    return this.fTo;
  }
}
