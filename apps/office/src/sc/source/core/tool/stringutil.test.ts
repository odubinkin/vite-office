/** @fileoverview Original testCSV numeric detection cases plus Unicode scanner boundaries against real RTL conversion. */
import { expect, it } from "vitest";
import { ScSetStringParam, ScStringUtil } from "../../../inc/stringutil";
import { SingleCellListening } from "../../../inc/types";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("retains ScSetStringParam defaults and the source text/numeric policy switches", () => {
  const param = new ScSetStringParam();
  expect(param.mpNumFormatter).toBeNull();
  expect(param.mbDetectNumberFormat).toBe(true);
  expect(param.mbDetectScientificNumberFormat).toBe(true);
  expect(param.meSetTextNumFormat).toBe(ScSetStringParam.Never);
  expect(param.mbHandleApostrophe).toBe(true);
  expect(param.meStartListening).toBe(SingleCellListening);
  expect(param.mbCheckLinkFormula).toBe(false);
  param.mbCheckLinkFormula = true;
  param.setTextInput();
  expect(param.mbDetectNumberFormat).toBe(false);
  expect(param.mbDetectScientificNumberFormat).toBe(false);
  expect(param.mbHandleApostrophe).toBe(false);
  expect(param.meSetTextNumFormat).toBe(ScSetStringParam.Always);
  param.setNumericInput();
  expect(param.mbDetectNumberFormat).toBe(true);
  expect(param.mbDetectScientificNumberFormat).toBe(true);
  expect(param.mbHandleApostrophe).toBe(true);
  expect(param.meSetTextNumFormat).toBe(ScSetStringParam.Never);
  expect(param.mbCheckLinkFormula).toBe(true);
});
it("detects either native multiline separator without treating other control characters as breaks", () => {
  for (const [value, multiline] of [
    ["A\rB", true],
    ["A\nB", true],
    ["A\tB", false],
  ] as const)
    expect(ScStringUtil.isMultiline(unicode(value))).toBe(multiline);
});
it("preserves pinned CSV numeric detection and output references", /** Runs all original Unicode CSV cases without Number coercion. @returns Nothing. */ () => {
  const cases: readonly [string, boolean, boolean, number][] = [
    ["foo", false, false, 0],
    ["1.0", false, true, 1],
    ["1,0", false, false, 0],
    ["1.0", true, false, 0],
    ["1.000", true, true, 1000],
    ["1,000", true, true, 1],
    ["1.000", false, true, 1],
    ["1,000", false, true, 1000],
    [" 1.0", false, true, 1],
    [" 1.0  ", false, true, 1],
    ["1.0 ", true, false, 0],
    ["1.000", true, true, 1000],
    ["1137.999", false, true, 1137.999],
    ["1.000.00", true, false, 0],
    ["+,123", false, false, 0],
    ["-,123", false, false, 0],
  ];
  for (const [source, european, expected, number] of cases) {
    const value: [number] = [0];
    expect(
      ScStringUtil.parseSimpleNumber(
        unicode(source),
        european ? 44 : 46,
        european ? 46 : 44,
        0,
        value,
      ),
      source,
    ).toBe(expected);
    expect(value[0], source).toBe(number);
  }
});
it("preserves Unicode grouping, alternate decimals, scientific policy and RTL failure assignment", /** Source prechecks leave output untouched; converter failures assign its real result. @returns Nothing. */ () => {
  for (const [source, decimal, group, alternate, expected] of [
    ["\u00a0-1 234,5\u00a0", 44, 160, 46, -1234.5],
    ["1\u00a0234.5", 44, 160, 46, 1234.5],
    ["+1,234,567.5", 46, 44, 0, 1234567.5],
    ["12345,678", 46, 44, 0, 12345678],
    ["-.5", 46, 44, 0, -0.5],
    ["1,234E-2", 46, 44, 0, 12.34],
    ["1E+2", 46, 44, 0, 100],
    [".5e1", 46, 44, 0, 5],
  ] as const) {
    const value: [number] = [42];
    expect(
      ScStringUtil.parseSimpleNumber(unicode(source), decimal, group, alternate, value),
      source,
    ).toBe(true);
    expect(value[0], source).toBe(expected);
  }
  for (const source of [
    "",
    " \u00a0 ",
    "\t1",
    "1\n",
    "1.2.3",
    "1,23.4",
    ",123",
    "1.2,345",
    "1,23,456",
    "1e1,234",
    "1+2",
    "1e1e2",
    "1,23e2",
    "1,23",
    "NaN",
    "INF",
    "0x1",
    "1\0",
    "😀",
    "1e--2",
  ]) {
    const value: [number] = [42];
    expect(ScStringUtil.parseSimpleNumber(unicode(source), 46, 44, 0, value), source).toBe(false);
    expect(value[0], source).toBe(42);
  }
  const scientific: [number] = [42];
  expect(ScStringUtil.parseSimpleNumber(unicode("1e2"), 46, 44, 0, scientific, false)).toBe(false);
  expect(scientific[0]).toBe(42);
  for (const source of ["+", "-", ".", "1e", "1e+", "1e.2", "e1", "1e999", "1e-999"]) {
    const value: [number] = [42];
    expect(ScStringUtil.parseSimpleNumber(unicode(source), 46, 44, 0, value), source).toBe(false);
    expect(value[0], source).not.toBe(42);
  }
});
