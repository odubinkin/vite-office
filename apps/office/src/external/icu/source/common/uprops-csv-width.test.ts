/** @fileoverview Original ICU78.3 property vectors consumed by Calc fixed-width CSV import. */
import { expect, it } from "vitest";
import { u_getIntPropertyValue } from "./uprops";
import { UEastAsianWidth, UProperty } from "./unicode/uchar";

it("matches the original ICU East Asian Width sample cases", () => {
  const cases: readonly [number, UEastAsianWidth][] = [
    [0x0009, UEastAsianWidth.U_EA_NEUTRAL],
    [0x0020, UEastAsianWidth.U_EA_NARROW],
    [0x00b1, UEastAsianWidth.U_EA_AMBIGUOUS],
    [0x20a9, UEastAsianWidth.U_EA_HALFWIDTH],
    [0x3000, UEastAsianWidth.U_EA_FULLWIDTH],
    [0x35bb, UEastAsianWidth.U_EA_WIDE],
    [0x20000, UEastAsianWidth.U_EA_WIDE],
  ];
  for (const [codePoint, expected] of cases)
    expect(u_getIntPropertyValue(codePoint, UProperty.UCHAR_EAST_ASIAN_WIDTH)).toBe(expected);
});

it("matches the original ICU default-ignorable sample cases", () => {
  expect(u_getIntPropertyValue(0x180c, UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT)).toBe(1);
  expect(u_getIntPropertyValue(0xfe02, UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT)).toBe(1);
  expect(u_getIntPropertyValue(0x1801, UProperty.UCHAR_DEFAULT_IGNORABLE_CODE_POINT)).toBe(0);
});
