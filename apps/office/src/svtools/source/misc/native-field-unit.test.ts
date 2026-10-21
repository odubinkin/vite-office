/** @fileoverview Independent literal source contract for SetFieldUnit and normalized metric increments. */
import { expect, it } from "vitest";
import { SetFieldUnit } from "./unitconv";
import { FieldUnit as F } from "../../../tools/inc/fldunit";
import { MetricSpinButton } from "../../../vcl/source/weld/MetricSpinButton";
it("preserves twip range/value while applying every source unit mapping and increment branch", /** Checks literal source choices and actual numeric storage/conversion. @returns Nothing. */ () => {
  for (const [requested, unit, digits, step, page] of [
    [F.CM, F.CM, 2, 10n, 100n],
    [F.M, F.CM, 2, 10n, 100n],
    [F.KM, F.CM, 2, 10n, 100n],
    [F.FOOT, F.INCH, 2, 2n, 20n],
    [F.MILE, F.INCH, 2, 2n, 20n],
    [F.INCH, F.INCH, 2, 2n, 20n],
    [F.MM, F.MM, 2, 50n, 500n],
    [F.CHAR, F.CHAR, 2, 50n, 500n],
    [F.LINE, F.LINE, 2, 50n, 500n],
    [F.POINT, F.POINT, 1, 10n, 100n],
    [F.PICA, F.PICA, 2, 10n, 100n],
  ] as const) {
    const field = new MetricSpinButton();
    field.set_digits(2);
    field.set_range(-144000n, 288000n, F.TWIP);
    field.set_value(144000n, F.TWIP);
    SetFieldUnit(field, requested);
    expect(field.get_unit()).toBe(unit);
    expect(field.get_digits()).toBe(digits);
    expect(field.get_increments(F.NONE)).toEqual([step, page]);
    expect(Number(field.denormalize(field.get_value(F.TWIP)))).toBe(
      requested === F.CHAR || requested === F.LINE ? 1441 : 1440,
    );
    expect(field.get_increments(unit)).toEqual([step, page]);
  }
});
it("retains point precision at zero/one and unrestricted native unit/range behavior", /** Checks original bAll and low-digit branches without a fake widget. @returns Nothing. */ () => {
  for (const digits of [0, 1]) {
    const field = new MetricSpinButton();
    field.set_digits(digits);
    SetFieldUnit(field, F.POINT);
    expect(field.get_digits()).toBe(digits);
  }
  const field = new MetricSpinButton();
  field.set_digits(2);
  field.set_range(0n, 10000n, F.NONE);
  field.set_value(100n, F.NONE);
  SetFieldUnit(field, F.M, true);
  expect(field.get_unit()).toBe(F.M);
  expect(field.get_range(F.NONE)).toEqual([0n, 10000n]);
  expect(field.get_value(F.NONE)).toBe(1n);
  const converted = new MetricSpinButton();
  converted.set_unit(F.INCH);
  converted.set_digits(2);
  converted.set_increments(254n, 2540n, F.CM);
  expect(converted.get_increments(F.INCH)).toEqual([100n, 1000n]);
  expect(converted.get_increments(F.CM)).toEqual([254n, 2540n]);
});
