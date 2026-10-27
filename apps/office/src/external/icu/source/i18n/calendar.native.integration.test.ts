/** @fileoverview Replays independently initialized Calendar time/stamp observations from unchanged ICU78.3 over real SimpleTimeZone owners. */
import { describe, expect, it } from "vitest";
import observations from "./calendar.native-observations.json";
import { GregorianCalendar } from "./gregocal";
import { SimpleTimeZone } from "./simpletz";
import { UnicodeString } from "../common/unistr";
import { Locale } from "../common/locid";
import { UCalendarDateFields as F } from "./unicode/ucal";

/** Exposes original protected native operations solely for differential observations. */
class TimeWitness extends GregorianCalendar {
  /** Initializes an independently owned zero-offset calendar baseline. @returns Calendar. */
  constructor() {
    super(new SimpleTimeZone(0, new UnicodeString("fixture")), Locale.getRoot(), [0]);
    this.setTime(0, [0]);
    this.clear();
  }
  /** Observes original clock/stamp state without completing fields into UTC. @returns Clock and stamps. */
  snapshot(): number[] {
    const stamps = [];
    for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) stamps.push(this.newestStamp(f, f, 0));
    return [...this.fFields, ...stamps, 0];
  }
  /** Exposes the original clock resolution operation. @returns Milliseconds. */
  clock(): number {
    return this.computeMillisInDay();
  }
  /** Exposes the original single-field validator. @param field - Field identity. @param status - Native status. @returns Nothing. */
  validateOne(field: F, status: [number]): void {
    this.validateField(field, status);
  }
}
/** Replays one original native operation from an independent time-zero baseline. @param query - Native input row. @returns Output row. */
function replay(query: string): number[] {
  const [kind, ...tokens] = query.trim().split(/\s+/),
    values = tokens.map(Number);
  let at = 0;
  /** Consumes one native scalar operand. @returns Scalar. */
  function take(): number {
    return values[at++] as number;
  }
  const time = take(),
    raw = take(),
    first = take(),
    min = take(),
    strict = take(),
    status: [number] = [take()],
    value = new TimeWitness();
  value.adoptTimeZone(new SimpleTimeZone(raw, new UnicodeString("fixture")));
  value.setFirstDayOfWeek(first);
  value.setMinimalDaysInFirstWeek(min);
  value.setLenient(!strict);
  if (kind === "Z") {
    const configured: [number] = [0],
      zone = new SimpleTimeZone(
        raw,
        new UnicodeString("fixture"),
        take(),
        take(),
        take(),
        take(),
        take(),
        take(),
        take(),
        take(),
        take(),
        take(),
        take(),
        configured,
      );
    zone.setStartYear(take());
    expect(configured[0]).toBe(0);
    value.adoptTimeZone(zone);
  }
  let result: number;
  if (kind === "T" || kind === "Z") {
    value.setTime(time, status);
    result = value.getTime(status);
    for (let f = 0; f < F.UCAL_FIELD_COUNT; f++) value.get(f, status);
  } else if (kind === "Q") {
    const field = take(),
      operand = take();
    value.setTime(time, status);
    value.set(field, operand);
    result = value.clock();
  } else {
    const count = take(),
      field = take();
    for (let i = 0; i < count; i++) value.set(take(), take());
    result = value.clock();
    if (kind === "V") value.validateOne(field, status);
  }
  return [result, status[0], ...value.snapshot()];
}

describe("original ICU Calendar time and stamp observations", /** Uses checked native outputs rather than implementation-derived expectations. @returns Nothing. */ () => {
  it.each(observations.cases)(
    "matches original clock query %s",
    /** Checks all native state fields and stamp values. @param query - Native input. @param expected - Native output. @returns Nothing. */ (
      query,
      expected,
    ) => {
      expect(replay(query)).toEqual(expected.trim().split(/\s+/).map(Number));
    },
  );
});
