/** @fileoverview Verifies original typed SvxRightMarginItem ownership, resolution, percentage/scaling and represented native UNO contracts. */
import { expect, it } from "vitest";
import { SvxRightMarginItem, SvxIndentValue, SvxFontUnitMetrics } from "../../inc/lrspitem";
import { SvxRightMarginItem as OriginalExport } from "./frmitems";
import { MeasureUnit as U } from "../../../offapi/com/sun/star/util/MeasureUnit";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
const which = 999;
it("original right defaults/export identity and initialized native status fields", /** Checks original defaults. @returns Nothing. */ () => {
  const item = new SvxRightMarginItem(which);
  expect(OriginalExport).toBe(SvxRightMarginItem);
  expect(item.Which()).toBe(which);
  expect(item.GetRight()).toEqual(SvxIndentValue.zero());
  expect(item.GetPropRight()).toBe(100);
  expect(item.HasMetrics()).toBe(true);
  expect(item.QueryValue()).toEqual({
    TextLeft: 0,
    Left: 0,
    Right: 0,
    FirstLine: 0,
    ScaleLeft: 0,
    ScaleRight: 100,
    ScaleFirstLine: 0,
    AutoFirstLine: false,
  });
  expect(item.QueryValue(14)).toBeUndefined();
  expect(item.QueryValue(1)).toBeUndefined();
  expect(item.PutValue({}, 0)).toBe(false);
  expect(item.PutValue(0, 0)).toBe(false);
});
it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE, U.MM])(
  "native right unit%s retains double/context/fixed/variable and borrowed ownership",
  /** Resolves native measure. @param unit - Original unit. @returns Nothing. */ (unit) => {
    const input = new SvxIndentValue(-1.25, unit),
      item = new SvxRightMarginItem(input, which),
      metrics = new SvxFontUnitMetrics(120, 180),
      member = item.GetRight(),
      resolved =
        unit === U.TWIP ? -1 : unit === U.FONT_EM ? -150 : unit === U.FONT_CJK_ADVANCE ? -225 : 0;
    input.ScaleMetrics(2);
    expect(member).toEqual(new SvxIndentValue(-1.25, unit));
    expect(item.ResolveRight(metrics)).toBe(resolved);
    expect(item.ResolveRight()).toBe(unit === U.TWIP ? -1 : 0);
    expect(item.ResolveRightFixedPart()).toBe(unit === U.TWIP ? -1 : 0);
    expect(item.ResolveRightVariablePart(metrics)).toBe(unit === U.TWIP ? 0 : resolved);
    item.ScaleMetrics(2);
    expect(item.GetRight()).toBe(member);
    expect(member.m_dValue).toBe(-2.5);
    expect(member.m_nUnit).toBe(unit);
    expect(item.GetPropRight()).toBe(100);
    item.SetRight(member, 50);
    expect(item.GetRight()).toBe(member);
    expect(member.m_dValue).toBe(-1.25);
    expect(item.GetPropRight()).toBe(50);
  },
);
it.each([0, 100, 50, 65535, -1, 65536])(
  "native unsigned right proportion%s preserves copy and scaling state",
  /** Applies native cast/scaling. @param prop - Native input. @returns Nothing. */ (prop) => {
    const item = new SvxRightMarginItem(which);
    item.SetRight(new SvxIndentValue(1.25, U.FONT_EM), prop);
    expect(item.GetPropRight()).toBe(prop & 0xffff);
    expect(item.GetRight().m_dValue).toBe((1.25 * (prop & 0xffff)) / 100);
    const copy = new SvxRightMarginItem(item),
      clone = item.Clone();
    expect(copy.equals(item)).toBe(true);
    expect(clone.equals(item)).toBe(true);
    expect(copy.GetRight()).not.toBe(item.GetRight());
    expect(clone.GetRight()).not.toBe(item.GetRight());
    clone.ScaleMetrics(2);
    expect(clone.GetPropRight()).toBe(prop & 0xffff);
    expect(item.GetRight().m_dValue).toBe((1.25 * (prop & 0xffff)) / 100);
    expect(item.equals(new SfxInt16Item(which, 0))).toBe(false);
    expect(item.equals(new SvxRightMarginItem(SvxIndentValue.twips(0), which + 1))).toBe(false);
    const differentValue = item.Clone();
    differentValue.SetRight(new SvxIndentValue(99, U.FONT_EM));
    expect(item.equals(differentValue)).toBe(false);
    const differentProp = item.Clone();
    differentProp.PutValue(item.GetPropRight() === 51 ? 52 : 51, 7);
    expect(item.equals(differentProp)).toBe(false);
  },
);
it("native default100 setter avoids multiplication overflow", /** Preserves original double. @returns Nothing. */ () => {
  const item = new SvxRightMarginItem(SvxIndentValue.twips(Number.MAX_VALUE), which);
  expect(item.GetRight().m_dValue).toBe(Number.MAX_VALUE);
});
it.each([0, 0x80])(
  "native conversion%s preserves exact absolute/status/proportion/unit member semantics",
  /** Applies native UNO contracts. @param convert - Flag. @returns Nothing. */ (convert) => {
    const item = new SvxRightMarginItem(SvxIndentValue.twips(-1.5), which);
    expect(item.QueryValue(5 | convert)).toBe(convert ? -3 : -2);
    expect((item.QueryValue(convert) as { Right: number }).Right).toBe(convert ? -4 : -2);
    expect(item.PutValue(convert ? -127 : -72, 5 | convert)).toBe(true);
    expect(item.GetRight()).toEqual(SvxIndentValue.twips(-72));
    expect(item.PutValue(32768, 7 | convert)).toBe(true);
    expect(item.GetPropRight()).toBe(32768);
    expect(item.QueryValue(7 | convert)).toBe(-32768);
    expect((item.QueryValue(convert) as { ScaleRight: number }).ScaleRight).toBe(-32768);
    expect(item.ResolveRight()).toBe(-72);
    expect(item.PutValue({ First: 1.75, Second: U.FONT_EM }, 14 | convert)).toBe(true);
    expect(item.QueryValue(14 | convert)).toEqual({ First: 1.75, Second: U.FONT_EM });
    expect(item.GetRight()).toEqual(new SvxIndentValue(1.75, U.FONT_EM));
    expect(item.GetPropRight()).toBe(100);
    expect(item.QueryValue(5 | convert)).toBeUndefined();
    expect((item.QueryValue(convert) as { Right: number }).Right).toBe(0);
    expect(item.PutValue({ First: 2.5, Second: U.TWIP }, 14 | convert)).toBe(true);
    expect(item.QueryValue(14 | convert)).toBeUndefined();
    expect(item.QueryValue(5)).toBe(3);
    expect(item.PutValue(convert ? 127 : 72, 5 | convert)).toBe(true);
    expect(item.ResolveRight()).toBe(72);
    expect(item.QueryValue(convert)).toMatchObject({ Right: convert ? 127 : 72 });
  },
);
it.each([
  null,
  [],
  {},
  false,
  "5",
  1.5,
  -2147483649,
  2147483648,
  { First: "1", Second: U.FONT_EM },
  { First: 1, Second: 19.5 },
  { First: 1, Second: -32769 },
  { First: 1, Second: 32768 },
])(
  "invalid native Any%s preserves original measure/proportion/reference",
  /** Rejects malformed native values. @param input - Payload. @returns Nothing. */ (input) => {
    for (const member of [0, 5, 7, 14, 127]) {
      const item = new SvxRightMarginItem(new SvxIndentValue(1.25, U.FONT_CJK_ADVANCE), which);
      item.PutValue(41, 7);
      const before = item.Clone(),
        reference = item.GetRight();
      expect(item.PutValue(input, member | 0x80)).toBe(false);
      expect(item.equals(before)).toBe(true);
      expect(item.GetRight()).toBe(reference);
    }
  },
);
it.each([-1, 65535])(
  "native UNO percentage%s rejects original exclusive upper bound",
  /** Keeps source percentage admission. @param value - Payload. @returns Nothing. */ (value) => {
    const item = new SvxRightMarginItem(SvxIndentValue.twips(50), which),
      before = item.Clone();
    expect(item.PutValue(value, 7)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);
