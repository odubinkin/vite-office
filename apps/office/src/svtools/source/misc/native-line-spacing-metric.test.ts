/** @fileoverview Independent rational/native map and normalized precision tests for line-spacing fields. */
import { expect, it } from "vitest";
import { MetricSpinButton } from "../../../vcl/source/weld/MetricSpinButton";
import { LogicToLogic } from "../../../vcl/source/outdev/map";
import { FieldUnit as F } from "../../../tools/inc/fldunit";
import { MapUnit as M } from "../../../tools/inc/mapunit";
import { GetCoreValue, SetMetricValue } from "../../inc/unitconv";
it("retains static map72PPI pixel semantics and original signed rounding/overflow fallback", /** Uses literal exact native ratios. @returns Nothing. */ () => {
  expect(LogicToLogic(1n, M.MapPixel, M.MapTwip)).toBe(20n);
  expect(LogicToLogic(10n, M.MapTwip, M.MapPoint)).toBe(1n);
  expect(LogicToLogic(-10n, M.MapTwip, M.MapPoint)).toBe(-1n);
  expect(LogicToLogic(99n, M.MapAppFont, M.MapAppFont)).toBe(99n);
  expect(LogicToLogic(10n, M.MapAppFont, M.MapTwip)).toBe(0n);
  expect(LogicToLogic(10n, M.MapTwip, M.MapRelative)).toBe(0n);
  expect(LogicToLogic(0n, M.MapTwip, M.MapPoint)).toBe(0n);
  expect(LogicToLogic(9223372036854775807n, M.MapTwip, M.MapPoint)).toBe(461168601842738790n);
  expect(LogicToLogic(9223372036854775807n, M.MapPoint, M.MapTwip)).toBe(0n);
});
it("normalizes through hundredth millimetres and preserves original large-value denormalization order", /** Expected values use independent literal635/360 conversion. @returns Nothing. */ () => {
  const field = new MetricSpinButton();
  field.set_digits(2);
  field.set_unit(F.CM);
  SetMetricValue(field, 283n, M.MapTwip);
  expect(field.get_value(F.NONE)).toBe(50n);
  expect(GetCoreValue(field, M.MapTwip)).toBe(283n);
  field.set_unit(F.MM_100TH);
  field.set_range(-2147483648n, 2147483647n, F.NONE);
  for (const value of [16777215n, 16777216n, -16777215n, -16777216n]) {
    field.set_value(value, F.NONE);
    const roundBefore = (value < 0n ? -value : value) >= 16777216n;
    const first = roundBefore ? (value < 0n ? value - 50n : value + 50n) / 100n : value,
      product = first * 360n,
      converted = (product < 0n ? product - 317n : product + 317n) / 635n,
      expected = roundBefore
        ? converted
        : (converted < 0n ? converted - 50n : converted + 50n) / 100n;
    expect(GetCoreValue(field, M.MapTwip)).toBe(expected);
  }
});

it("retains the original set_min conversion of the opposite range bound and clamps through the same field", /** Checks original requested-unit range delegation. @returns Nothing. */ () => {
  const field = new MetricSpinButton();
  field.set_digits(2);
  field.set_unit(F.CM);
  field.set_range(0n, 999900n, F.NONE);
  field.set_value(0n, F.NONE);
  const maximum = field.get_range(F.TWIP)[1];
  field.set_min(field.normalize(28n), F.TWIP);
  expect(field.get_value(F.NONE)).toBe(5n);
  expect(field.get_range(F.TWIP)[1]).toBe(maximum);
  field.set_min(0n, F.NONE);
  expect(field.get_range(F.NONE)[0]).toBe(0n);
});
