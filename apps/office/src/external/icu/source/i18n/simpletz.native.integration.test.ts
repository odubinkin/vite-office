/** @fileoverview Replays unchanged ICU78.3 SimpleTimeZone invalid-rule and offset observations over actual owned rules. */
import { describe, expect, it } from "vitest";
import observations from "./simpletz.native-observations.json";
import { SimpleTimeZone } from "./simpletz";
import { BasicTimeZone } from "./basictz";
import { UnicodeString } from "../common/unistr";

/** Replays the recorded original constructor/query/mutation protocol. @param query - Original scalar operands. @returns Original numeric output row. */
function replay(query: string): number[] {
  const tokens = query.trim().split(/\s+/);
  let at = 0;
  /** Consumes one original numeric operand. @returns Operand. */
  function take(): number {
    return Number(tokens[at++]);
  }
  const raw = take(),
    sm = take(),
    sd = take(),
    sw = take(),
    st = take(),
    stm = take(),
    em = take(),
    ed = take(),
    ew = take(),
    et = take(),
    etm = take(),
    savings = take(),
    year = take(),
    kind = tokens[at++],
    time = take(),
    local = take(),
    missing = take(),
    duplicate = take(),
    status: [number] = [take()],
    init: [number] = [0];
  const value =
    kind === "A"
      ? new SimpleTimeZone(raw, new UnicodeString("fixture"), sm, sd, sw, st, em, ed, ew, et, init)
      : kind === "H"
        ? new SimpleTimeZone(
            raw,
            new UnicodeString("fixture"),
            sm,
            sd,
            sw,
            st,
            em,
            ed,
            ew,
            et,
            savings,
            init,
          )
        : kind === "K"
          ? new SimpleTimeZone(raw, new UnicodeString("fixture"))
          : new SimpleTimeZone(
              raw,
              new UnicodeString("fixture"),
              sm,
              sd,
              sw,
              st,
              stm,
              em,
              ed,
              ew,
              et,
              etm,
              savings,
              init,
            );
  value.setStartYear(year);
  const r: [number] = [99],
    d: [number] = [88],
    extra = [];
  let total = 0;
  if (kind === "D" || kind === "A" || kind === "H" || kind === "K")
    value.getOffset(time, Boolean(local), r, d, status);
  else if (kind === "B")
    BasicTimeZone.prototype.getOffsetFromLocal.call(value, time, missing, duplicate, r, d, status);
  else if (kind === "L") value.getOffsetFromLocal(time, missing, duplicate, r, d, status);
  else if (kind === "F") {
    const era = take(),
      y = take(),
      m = take(),
      dom = take(),
      dow = take(),
      ms = take(),
      length = take(),
      previous = take();
    total =
      local === 7
        ? value.getOffsetForFieldsWithoutMonthLength(era, y, m, dom, dow, ms, status)
        : local === 8
          ? value.getOffsetForFields(era, y, m, dom, dow, ms, length, status)
          : value.getOffsetForFieldsWithPreviousMonthLength(
              era,
              y,
              m,
              dom,
              dow,
              ms,
              length,
              previous,
              status,
            );
  } else if (kind === "I") {
    const count = take(),
      bogus = take(),
      length = take(),
      isNull = take(),
      units = [];
    for (let i = 0; i < count; i++) units.push(take());
    const id = new UnicodeString(isNull ? null : String.fromCharCode(...units), length);
    if (bogus) id.setToBogus();
    const before = new UnicodeString(id),
      output = new UnicodeString();
    value.setID(id);
    const copy = value.clone();
    extra.push(
      Number(id.isBogus()),
      id.length(),
      Number(value.equals(copy)),
      Number(value.hasSameRules(copy)),
      Number(value.getID(output) === output),
      Number(output.isBogus()),
      output.length(),
      output.charAt(-1),
      output.charAt(count),
    );
    for (let i = 0; i < count; i++) extra.push(output.charAt(i));
    id.setToBogus();
    value.getID(output);
    extra.push(Number(output.equals(before)));
    copy.setID(new UnicodeString("other"));
    extra.push(Number(value.equals(copy)), Number(value.hasSameRules(copy)));
  } else {
    const operation = take(),
      a = take(),
      b = take(),
      c = take(),
      ms = take(),
      mode = take();
    if (operation === 0) value.setStartRule(a, b, c, ms, mode, status);
    else if (operation === 1) value.setEndRule(a, b, c, ms, mode, status);
    else if (operation === 2) value.setDSTSavings(a, status);
    else if (operation === 3) value.setRawOffset(a);
    else value.setStartYear(a);
    const observed: [number] = [0];
    value.getOffset(time, false, r, d, observed);
    total = observed[0];
  }
  return [
    init[0],
    value.getRawOffset(),
    value.getDSTSavings(),
    Number(value.useDaylightTime()),
    r[0],
    d[0],
    total,
    status[0],
    ...extra,
  ];
}

describe("original SimpleTimeZone observations", /** Uses checked native results including partial failure writes. @returns Nothing. */ () => {
  it.each(observations.cases)(
    "preserves original rule query %s",
    /** Checks every independent native scalar result. @param query - Native input. @param expected - Native output. @returns Nothing. */ (
      query,
      expected,
    ) => {
      expect(replay(query)).toEqual(expected.trim().split(/\s+/).map(Number));
    },
  );
});
