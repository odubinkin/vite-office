/** @fileoverview Source numeric-field conversion,locale decimals,fraction quirks and real metric-control witnesses. */
import { expect, it } from "vitest";
import {
  ConvertDoubleValue,
  ConvertValue,
  GetTextMetricUnit,
  TextToValue,
  ToScaledWholeAndDec,
} from "./field";
import { FieldUnit as F } from "../../../tools/inc/fldunit";
import { MetricSpinButton } from "../weld/MetricSpinButton";
import { Power10, normalize, denormalize } from "../weld/SpinButton";
it("retains native conversion direction,invalid units,percentage offset and signed64 clipping", /** Concrete native numeric domains. @returns Nothing. */ () => {
  expect(ConvertValue(100n, 0n, 2, F.INCH, F.TWIP)).toBe(144000n);
  expect(ConvertValue(-5n, 0n, 0, F.TWIP, F.MM_100TH)).toBe(-9n);
  expect(ConvertValue(9223372036854775807n, 0n, 0, F.KM, F.MM)).toBe(9223372036854775807n);
  expect(ConvertValue(-9223372036854775808n, 0n, 0, F.KM, F.MM)).toBe(-9223372036854775808n);
  expect(ConvertDoubleValue(2500, 200n, 2, F.PERCENT, F.CM)).toBe(50.5);
  expect(ConvertDoubleValue(2500, 1n, 2, F.PERCENT, F.CM)).toBe(0.75);
  expect(ConvertDoubleValue(-2500, 200n, 2, F.PERCENT, F.CM)).toBe(-2500);
  expect(ConvertDoubleValue(2500, 0n, 2, F.PERCENT, F.CM)).toBe(2500);
  expect(ConvertDoubleValue(10, 0n, 0, F.NONE, F.CM)).toBe(10);
  expect(ConvertDoubleValue(10, 0n, 0, F.CM, F.NONE)).toBe(10);
  expect(ConvertDoubleValue(10, 0n, 0, F.CM, F.CM)).toBe(10);
});
it("uses original suffix scanning,ASCII normalization and English unit resources", /** Actual unit aliases. @returns Nothing. */ () => {
  expect(GetTextMetricUnit("2.5 IN")).toBe(F.INCH);
  expect(GetTextMetricUnit("2\u2033")).toBe(F.INCH);
  expect(GetTextMetricUnit("2\u2032")).toBe(F.FOOT);
  expect(GetTextMetricUnit("2 cm 3")).toBe(F.CM);
  expect(GetTextMetricUnit("2 mystery")).toBe(F.NONE);
  expect(GetTextMetricUnit("2")).toBe(F.NONE);
  expect(GetTextMetricUnit("2 c\u0001m")).toBe(F.NONE);
  expect(GetTextMetricUnit("5%")).toBe(F.NONE);
  expect(GetTextMetricUnit('2"')).toBe(F.INCH);
  expect(GetTextMetricUnit("2'")).toBe(F.FOOT);
  expect(GetTextMetricUnit("1in\u200d")).toBe(F.NONE);
  expect(GetTextMetricUnit("1in\u2028")).toBe(F.NONE);
});
it("parses native decimal and mixed-fraction strings including their original sign quirks", /** Distinct parser alternatives. @returns Nothing. */ () => {
  expect(ToScaledWholeAndDec("  ", 2, ".", "")).toEqual(["", ""]);
  expect(ToScaledWholeAndDec("abc", 2, ".", "")).toEqual(["", ""]);
  expect(ToScaledWholeAndDec("1,234.56 cm", 2, ".", "")).toEqual(["123456", ""]);
  expect(ToScaledWholeAndDec("1.234,567 cm", 2, ",", ".")).toEqual(["123456", "7"]);
  expect(ToScaledWholeAndDec("1.25 cm", 2, ",", ".")).toEqual(["125", ""]);
  expect(ToScaledWholeAndDec(".5", 2, ".", "")).toEqual(["050", ""]);
  expect(ToScaledWholeAndDec("-0.25", 0, ".", "")).toEqual(["-0", "25"]);
  expect(ToScaledWholeAndDec("2", 2, ".", "")).toEqual(["200", ""]);
  expect(ToScaledWholeAndDec("-1/2", 2, ".", "")).toEqual(["050", ""]);
  expect(ToScaledWholeAndDec("-1 1/2", 2, ".", "")).toEqual(["-050", ""]);
  expect(ToScaledWholeAndDec("2/1", 2, ".", "")).toEqual(["200", ""]);
  expect(ToScaledWholeAndDec("x/y", 2, ".", "")).toEqual(["", ""]);
  expect(ToScaledWholeAndDec("2 1/", 2, ".", "")).toEqual(["", ""]);
  expect(ToScaledWholeAndDec("2 /2", 2, ".", "")).toEqual(["200", ""]);
  expect(ToScaledWholeAndDec("1/0", 2, ".", "")).toEqual(["", ""]);
  expect(ToScaledWholeAndDec("1/999999999999999999999999", 2, ".", "")).toEqual(["", ""]);
  expect(ToScaledWholeAndDec("\u200b-1", 2, ".", "")).toEqual(["-100", ""]);
  expect(TextToValue("1/1000000000000", 0n, 2, ".", "", F.CM)).toBe(1e-10);
  expect(TextToValue("invalid", 0n, 2, ".", "", F.CM)).toBeUndefined();
  expect(TextToValue("1 inch", 0n, 2, ".", "", F.CM)).toBe(254);
});
it("uses shared native normalization,range clamping and signed32 text-parser boundaries", /** Real numeric owner. @returns Nothing. */ () => {
  expect(Power10(0)).toBe(1n);
  expect(Power10(2)).toBe(100n);
  expect(normalize(12n, 2)).toBe(1200n);
  expect(denormalize(1250n, 2)).toBe(13n);
  expect(denormalize(-1250n, 2)).toBe(-13n);
  expect(denormalize(9223372036854775807n, 2)).toBe(92233720368547758n);
  expect(denormalize(-9223372036854775808n, 2)).toBe(-92233720368547758n);
  const metric = new MetricSpinButton();
  metric.set_unit(F.CM);
  metric.set_digits(2);
  metric.set_range(-1000n, 1000n, F.NONE);
  expect(metric.get_range(F.NONE)).toEqual([-1000n, 1000n]);
  expect(metric.normalize(3n)).toBe(300n);
  expect(metric.denormalize(350n)).toBe(4n);
  expect(metric.set_text("nonsense", ".", "")).toBe(false);
  expect(metric.set_text("1.255 cm", ".", "")).toBe(true);
  expect(metric.get_value(F.NONE)).toBe(126n);
  metric.set_text("-1.255 cm", ".", "");
  expect(metric.get_value(F.NONE)).toBe(-126n);
  metric.set_text("999999999999 cm", ".", "");
  expect(metric.get_value(F.NONE)).toBe(1000n);
  metric.set_text("-999999999999 cm", ".", "");
  expect(metric.get_value(F.NONE)).toBe(-1000n);
  metric.set_value(100n, F.NONE);
  expect(metric.get_value(F.MM)).toBe(1000n);
  metric.set_unit(F.INCH);
  expect(metric.get_value(F.NONE)).toBe(100n);
  metric.set_digits(0);
  expect(metric.get_value(F.NONE)).toBe(100n);
});
