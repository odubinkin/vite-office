/** @fileoverview Replays original ICU78.3 Gregorian, field precedence and Julian-day witness cases against the single actual calendar owner. */
import { describe, expect, it } from "vitest";
import observations from "./calendar.scalar.native-observations.json";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import { UCalendarDateFields as F } from "./unicode/ucal";

/** Exposes protected original scalar hooks without changing their state or algorithms. */
class ScalarWitness extends GregorianCalendar {
  /** Uses an actual owned UTC zone and a controlled cleared baseline. @returns Owner. */
  constructor() {
    super(new SimpleTimeZone(0, new UnicodeString("UTC")), Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
  }
  /** Observes original protected storage and stamp range queries. @returns State. */
  snapshot(): number[] {
    const stamps = [];
    for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) stamps.push(this.newestStamp(f, f, 0));
    return [...this.fFields, ...stamps];
  }
  /** Replays one unchanged native hook protocol. @param query - Source input row. @returns Observed native scalars. */
  observe(query: string): (number | string)[] {
    const [kind, ...tokens] = query.trim().split(/\s+/),
      values = tokens.map(Number);
    let at = 0;
    /** Consumes one native scalar. @returns Scalar. */
    function take(): number {
      return values[at++] as number;
    }
    const a = take(),
      b = take(),
      c = take(),
      status: [number] = [c];
    if (kind === "M")
      return [this.handleComputeMonthStart(a, b, true, status).toString(), status[0]];
    if (kind === "L") return [this.handleGetMonthLength(a, b, status), status[0]];
    if (kind === "G" || kind === "W") {
      if (kind === "W") {
        status[0] = 0;
        this.setFirstDayOfWeek(b);
        this.setMinimalDaysInFirstWeek(c);
      }
      this.computeGregorianFields(a, status);
      this.handleComputeFields(a, status);
      if (kind === "G") return [...this.snapshot(), status[0]];
      this.computeWeekFields(status);
      return [
        ...[
          F.UCAL_ERA,
          F.UCAL_YEAR,
          F.UCAL_MONTH,
          F.UCAL_DATE,
          F.UCAL_DAY_OF_YEAR,
          F.UCAL_EXTENDED_YEAR,
          F.UCAL_DAY_OF_WEEK,
          F.UCAL_DOW_LOCAL,
          F.UCAL_WEEK_OF_YEAR,
          F.UCAL_YEAR_WOY,
          F.UCAL_WEEK_OF_MONTH,
          F.UCAL_DAY_OF_WEEK_IN_MONTH,
        ].map(
          /** Reads original stored scalar without forcing time completion. @param field - Field identity. @returns Stored value. */ (
            field,
          ) => this.internalGet(field),
        ),
        status[0],
      ];
    }
    if (kind === "J") {
      status[0] = take();
      this.setFirstDayOfWeek(b);
      this.setMinimalDaysInFirstWeek(c);
    }
    for (let i = 0; i < a; i++) {
      const action = take(),
        field = take(),
        value = take();
      if (action === 0) this.set(field, value);
      else if (action === 1) this.clear(field);
      else this.internalSet(field, value);
    }
    if (kind === "J") return [this.computeJulianDay(status), status[0], ...this.snapshot(), 0];
    return [
      ...this.snapshot(),
      this.resolveFields(ScalarWitness.kDatePrecedence),
      this.resolveFields(ScalarWitness.kMonthPrecedence),
      this.newerField(F.UCAL_EXTENDED_YEAR, F.UCAL_YEAR),
      this.newestStamp(F.UCAL_ERA, F.UCAL_ORDINAL_MONTH, 0),
      this.internalGetMonth([0]),
    ];
  }
}

describe("original Gregorian scalar observations", /** Replays independently verified native rows. @returns Nothing. */ () => {
  it.each(observations.cases)(
    "preserves original scalar query %s",
    /** Checks full numeric state with exact decimal int64 month-start values. @param query - Native input. @param expected - Native observation. @returns Nothing. */ (
      query,
      expected,
    ) => {
      expect(new ScalarWitness().observe(query).join(" ")).toBe(expected);
    },
  );
});
