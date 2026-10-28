/** @fileoverview Replays unchanged ICU78.3 RuleBasedTimeZone completion, real historic/final rule ownership and gap/fold transitions. */
import { expect, it } from "vitest";
import observations from "./rbtz.native-observations.json";
import { RuleBasedTimeZone } from "./rbtz";
import { InitialTimeZoneRule, AnnualTimeZoneRule, TimeArrayTimeZoneRule } from "./tzrule";
import { DateTimeRule } from "./dtrule";
import { TimeZoneTransition } from "./tztrans";
import { UnicodeString } from "../common/unistr";
/** Builds the original witness's explicit rule graph using actual owners. @param mode - Independent input scenario. @returns Zone and adoption status. */
function make(mode: number): [RuleBasedTimeZone, number] {
  const z = new RuleBasedTimeZone(
      new UnicodeString("Z"),
      new InitialTimeZoneRule(new UnicodeString("I"), -18000000, 0),
    ),
    s: [number] = [0];
  if ([1, 3, 6].includes(mode))
    z.addTransitionRule(
      new TimeArrayTimeZoneRule(
        new UnicodeString("H"),
        -14400000,
        0,
        [-100000000, 0, 100000000],
        3,
        DateTimeRule.UTC_TIME,
      ),
      s,
    );
  if ([2, 3, 4, 5].includes(mode)) {
    const dst = new DateTimeRule(2, 2, 1, 7200000, DateTimeRule.WALL_TIME),
      std = new DateTimeRule(10, 1, 1, 7200000, DateTimeRule.WALL_TIME);
    z.addTransitionRule(
      new AnnualTimeZoneRule(
        new UnicodeString("D"),
        -18000000,
        3600000,
        dst,
        2000,
        AnnualTimeZoneRule.MAX_YEAR,
      ),
      s,
    );
    if (mode !== 4)
      z.addTransitionRule(
        new AnnualTimeZoneRule(
          new UnicodeString("S"),
          -18000000,
          0,
          std,
          2000,
          AnnualTimeZoneRule.MAX_YEAR,
        ),
        s,
      );
    if (mode === 5)
      z.addTransitionRule(
        new AnnualTimeZoneRule(
          new UnicodeString("X"),
          0,
          0,
          std,
          2000,
          AnnualTimeZoneRule.MAX_YEAR,
        ),
        s,
      );
  }
  const status = s[0];
  if (mode === 6) {
    s[0] = 0;
    z.complete(s);
    z.addTransitionRule(
      new TimeArrayTimeZoneRule(
        new UnicodeString("L"),
        -18000000,
        0,
        [200000000],
        1,
        DateTimeRule.UTC_TIME,
      ),
      s,
    );
  }
  return [z, status];
}

/** Observes actual API results; expectations are compiled original outputs, not port-derived rule calculations. @param query - Native input row. @returns Original serialized results. */
function replay(query: string): string {
  const [mode, completion, copy, time, local, missing, duplicate, incoming] = query
    .split(" ")
    .map(Number);
  const [original, adoption] = make(mode as number);
  let zone = original;
  const status: [number] = [0];
  if (completion) zone.complete(status);
  const out: (number | string)[] = [adoption, status[0]];
  if (copy) zone = zone.clone();
  const raw: [number] = [91],
    dst: [number] = [92];
  status[0] = incoming as number;
  if (local === 2)
    zone.getOffsetFromLocal(
      time as number,
      missing as number,
      duplicate as number,
      raw,
      dst,
      status,
    );
  else zone.getOffset(time as number, Boolean(local), raw, dst, status);
  out.push(status[0], raw[0], dst[0]);
  status[0] = incoming as number;
  out.push(zone.countTransitionRules(status), status[0]);
  const initial = new InitialTimeZoneRule(new UnicodeString("O"), 7, 8);
  for (const next of [true, false])
    for (const inclusive of [false, true]) {
      const transition = new TimeZoneTransition(17, initial, initial);
      const found = next
        ? zone.getNextTransition(time as number, inclusive, transition)
        : zone.getPreviousTransition(time as number, inclusive, transition);
      out.push(Number(found), transition.getTime());
      for (const rule of [transition.getFrom(), transition.getTo()]) {
        expect(rule).not.toBeNull();
        if (rule === null) throw new Error("Native transition rule is missing");
        out.push(
          rule.getName(new UnicodeString()).getBuffer() as string,
          rule.getRawOffset(),
          rule.getDSTSavings(),
        );
      }
    }
  return out.join(" ");
}
it.each([0, 1, 2, 3, 4, 5, 6])(
  "matches original rule-based transition scenario %i",
  /** Exercises real complete/dirty/cloned zones, historic rules, permanent annual rules, invalid incomplete final pairs and UTC/local offsets. @param mode - Native graph scenario. @returns Nothing. */ (
    mode,
  ) => {
    const rows = observations.cases.filter(
      /** Groups independent native inputs. @param row - Native query/output. @returns Whether selected. */ (
        row,
      ) => Number((row[0] as string).split(" ")[0]) === mode,
    );
    expect(rows.length).toBe(mode === 2 || mode === 3 ? 1216 : 576);
    for (const [query, output] of rows) expect(replay(query as string), query).toBe(output);
  },
);
