/** @fileoverview Verifies actual published protection value fields, generated value defaults and independent scalar copying. */
import { expect, it } from "vitest";
import { CellProtection } from "./CellProtection";

/** Reads actual IDL fields in declaration order. @param value - Actual value. @returns Four scalar flags. */
function observe(value: CellProtection): boolean[] {
  return [value.IsLocked, value.IsFormulaHidden, value.IsHidden, value.IsPrintHidden];
}

it("retains IDL boolean defaults and independent field-value copies" /** Checks defaults, field construction, copies and assignments. @returns Nothing. */, function (): void {
  expect(observe(new CellProtection())).toEqual([false, false, false, false]);
  const source = new CellProtection(true, false, true, false),
    copy = new CellProtection(source);
  expect(observe(copy)).toEqual([true, false, true, false]);
  expect(copy).not.toBe(source);
  source.IsLocked = false;
  source.IsFormulaHidden = true;
  source.IsHidden = false;
  source.IsPrintHidden = true;
  expect(observe(copy)).toEqual([true, false, true, false]);
  expect(copy.assign(source)).toBe(copy);
  expect(observe(copy)).toEqual([false, true, false, true]);
  expect(copy.assign(copy)).toBe(copy);
  expect(copy.equals(source)).toBe(true);
  expect(copy.notEquals(source)).toBe(false);
});

it("compares every protection field rather than object identity" /** Checks short-circuit field differences in IDL order. @returns Nothing. */, function (): void {
  const empty = new CellProtection();
  for (const value of [
    new CellProtection(true, false, false, false),
    new CellProtection(false, true, false, false),
    new CellProtection(false, false, true, false),
    new CellProtection(false, false, false, true),
  ]) {
    expect(empty.equals(value)).toBe(false);
    expect(empty.notEquals(value)).toBe(true);
  }
});
