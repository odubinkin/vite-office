/** @fileoverview Verifies original typed SvxTextLeftMarginItem ownership, resolution, percentage/scaling and represented native UNO contracts. */
import { expect, it } from "vitest";
import {
  SvxTextLeftMarginItem,
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxFontUnitMetrics,
} from "../../inc/lrspitem";
import { SvxTextLeftMarginItem as OriginalExport } from "./frmitems";
import { MeasureUnit as U } from "../../../offapi/com/sun/star/util/MeasureUnit";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
const which = 999;
it("original text-left defaults/export identity and initialized native status fields", /** Checks original defaults. @returns Nothing. */ () => {
  const item = new SvxTextLeftMarginItem(which);
  expect(OriginalExport).toBe(SvxTextLeftMarginItem);
  expect(item.Which()).toBe(which);
  expect(item.GetTextLeft()).toEqual(SvxIndentValue.zero());
  expect(item.GetPropLeft()).toBe(100);
  expect(item.HasMetrics()).toBe(true);
  expect(item.QueryValue()).toEqual({
    TextLeft: 0,
    Left: 0,
    Right: 0,
    FirstLine: 0,
    ScaleLeft: 100,
    ScaleRight: 0,
    ScaleFirstLine: 0,
    AutoFirstLine: false,
  });
  expect(item.QueryValue(15)).toBeUndefined();
  expect(item.QueryValue(1)).toBeUndefined();
  expect(item.PutValue({}, 0)).toBe(false);
  expect(item.PutValue(0, 0)).toBe(false);
});
it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE, U.MM])(
  "native text-left unit%s retains double/context/fixed/variable and borrowed ownership",
  /** Resolves native measure. @param unit - Original unit. @returns Nothing. */ (unit) => {
    const input = new SvxIndentValue(-1.25, unit),
      item = new SvxTextLeftMarginItem(input, which),
      metrics = new SvxFontUnitMetrics(120, 180),
      member = item.GetTextLeft(),
      resolved =
        unit === U.TWIP ? -1 : unit === U.FONT_EM ? -150 : unit === U.FONT_CJK_ADVANCE ? -225 : 0;
    input.ScaleMetrics(2);
    expect(member).toEqual(new SvxIndentValue(-1.25, unit));
    expect(item.ResolveTextLeft(metrics)).toBe(resolved);
    expect(item.ResolveTextLeft()).toBe(unit === U.TWIP ? -1 : 0);
    expect(item.ResolveLeftFixedPart(new SvxFirstLineIndentItem(998))).toBe(
      unit === U.TWIP ? -1 : 0,
    );
    expect(item.ResolveLeftVariablePart(new SvxFirstLineIndentItem(998), metrics)).toBe(
      unit === U.TWIP ? 0 : resolved,
    );
    item.ScaleMetrics(2);
    expect(item.GetTextLeft()).toBe(member);
    expect(member.m_dValue).toBe(-2.5);
    expect(member.m_nUnit).toBe(unit);
    expect(item.GetPropLeft()).toBe(100);
    item.SetTextLeft(member, 50);
    expect(item.GetTextLeft()).toBe(member);
    expect(member.m_dValue).toBe(-1.25);
    expect(item.GetPropLeft()).toBe(50);
  },
);
it.each([0, 100, 50, 65535, -1, 65536])(
  "native unsigned text-left proportion%s preserves copy and scaling state",
  /** Applies native cast/scaling. @param prop - Native input. @returns Nothing. */ (prop) => {
    const item = new SvxTextLeftMarginItem(which);
    item.SetTextLeft(new SvxIndentValue(1.25, U.FONT_EM), prop);
    expect(item.GetPropLeft()).toBe(prop & 0xffff);
    expect(item.GetTextLeft().m_dValue).toBe((1.25 * (prop & 0xffff)) / 100);
    const copy = new SvxTextLeftMarginItem(item),
      clone = item.Clone();
    expect(copy.equals(item)).toBe(true);
    expect(clone.equals(item)).toBe(true);
    expect(copy.GetTextLeft()).not.toBe(item.GetTextLeft());
    expect(clone.GetTextLeft()).not.toBe(item.GetTextLeft());
    clone.ScaleMetrics(2);
    expect(clone.GetPropLeft()).toBe(prop & 0xffff);
    expect(item.GetTextLeft().m_dValue).toBe((1.25 * (prop & 0xffff)) / 100);
    expect(item.equals(new SfxInt16Item(which, 0))).toBe(false);
    expect(item.equals(new SvxTextLeftMarginItem(SvxIndentValue.twips(0), which + 1))).toBe(false);
    const differentValue = item.Clone();
    differentValue.SetTextLeft(new SvxIndentValue(99, U.FONT_EM));
    expect(item.equals(differentValue)).toBe(false);
    const differentProp = item.Clone();
    differentProp.PutValue(item.GetPropLeft() === 51 ? 52 : 51, 6);
    expect(item.equals(differentProp)).toBe(false);
  },
);
it("native default100 setter avoids multiplication overflow", /** Preserves original double. @returns Nothing. */ () => {
  const item = new SvxTextLeftMarginItem(SvxIndentValue.twips(Number.MAX_VALUE), which);
  expect(item.GetTextLeft().m_dValue).toBe(Number.MAX_VALUE);
});
it.each([0, 0x80])(
  "native conversion%s preserves exact absolute/status/proportion/unit member semantics",
  /** Applies native UNO contracts. @param convert - Flag. @returns Nothing. */ (convert) => {
    const item = new SvxTextLeftMarginItem(SvxIndentValue.twips(-1.5), which);
    expect(item.QueryValue(11 | convert)).toBe(convert ? -3 : -2);
    expect((item.QueryValue(convert) as { TextLeft: number }).TextLeft).toBe(convert ? -4 : -2);
    expect(item.PutValue(convert ? -127 : -72, 11 | convert)).toBe(true);
    expect(item.GetTextLeft()).toEqual(SvxIndentValue.twips(-72));
    expect(item.PutValue(32768, 6 | convert)).toBe(true);
    expect(item.GetPropLeft()).toBe(32768);
    expect(item.QueryValue(6 | convert)).toBe(-32768);
    expect((item.QueryValue(convert) as { ScaleLeft: number }).ScaleLeft).toBe(-32768);
    expect(item.ResolveTextLeft()).toBe(-72);
    expect(item.PutValue({ First: 1.75, Second: U.FONT_EM }, 15 | convert)).toBe(true);
    expect(item.QueryValue(15 | convert)).toEqual({ First: 1.75, Second: U.FONT_EM });
    expect(item.GetTextLeft()).toEqual(new SvxIndentValue(1.75, U.FONT_EM));
    expect(item.GetPropLeft()).toBe(100);
    expect(item.QueryValue(11 | convert)).toBeUndefined();
    expect((item.QueryValue(convert) as { TextLeft: number }).TextLeft).toBe(0);
    expect(item.PutValue({ First: 2.5, Second: U.TWIP }, 15 | convert)).toBe(true);
    expect(item.QueryValue(15 | convert)).toBeUndefined();
    expect(item.QueryValue(11)).toBe(3);
    expect(item.PutValue(convert ? 127 : 72, 11 | convert)).toBe(true);
    expect(item.ResolveTextLeft()).toBe(72);
    expect(item.QueryValue(convert)).toMatchObject({ TextLeft: convert ? 127 : 72 });
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
    for (const member of [0, 11, 6, 15, 127]) {
      const item = new SvxTextLeftMarginItem(new SvxIndentValue(1.25, U.FONT_CJK_ADVANCE), which);
      item.PutValue(41, 6);
      const before = item.Clone(),
        reference = item.GetTextLeft();
      expect(item.PutValue(input, member | 0x80)).toBe(false);
      expect(item.equals(before)).toBe(true);
      expect(item.GetTextLeft()).toBe(reference);
    }
  },
);
it.each([-1, 65535])(
  "native UNO percentage%s rejects original exclusive upper bound",
  /** Keeps source percentage admission. @param value - Payload. @returns Nothing. */ (value) => {
    const item = new SvxTextLeftMarginItem(SvxIndentValue.twips(50), which),
      before = item.Clone();
    expect(item.PutValue(value, 6)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);

it.each([
  [2.5, U.TWIP, -1.5, U.TWIP, 1, 1, 0],
  [2.5, U.FONT_EM, -1.25, U.FONT_CJK_ADVANCE, 75, 0, 75],
  [200, U.TWIP, -1.25, U.FONT_EM, 50, 200, -150],
  [2.5, U.FONT_EM, -1.5, U.TWIP, 298, -2, 300],
  [2.5, U.FONT_EM, 1.5, U.TWIP, 300, 0, 300],
  [2.5, U.TWIP, 1.25, U.FONT_EM, 3, 3, 0],
  [2.5, U.FONT_EM, -0.004, U.TWIP, 300, 0, 300],
  [2.5, U.TWIP, -0.004, U.FONT_EM, 3, 3, 0],
  [2.5, U.MM, -1.5, U.TWIP, -2, -2, 0],
  [2.5, U.FONT_EM, -1.5, U.MM, 300, 0, 300],
  [2.5, U.TWIP, -1.5, U.FONT_CJK_ADVANCE, -267, 3, -270],
  [2.5, U.FONT_CJK_ADVANCE, -1.5, U.FONT_EM, 270, 0, 270],
  [0.5, U.TWIP, -0.4, U.TWIP, 1, 1, 0],
] as const)(
  "native hanging components left%s/unit%s first%s/unit%s resolve%s fixed%s variable%s",
  /** Retains separately rounded original fixed and font-relative components. @param left - Text-left value. @param leftUnit - Text-left unit. @param first - First-line value. @param firstUnit - First-line unit. @param resolved - Complete layout result. @param fixed - Absolute result. @param variable - Relative result. @returns Nothing. */
  (left, leftUnit, first, firstUnit, resolved, fixed, variable) => {
    const item = new SvxTextLeftMarginItem(new SvxIndentValue(left, leftUnit), which),
      indent = new SvxFirstLineIndentItem(new SvxIndentValue(first, firstUnit), 998),
      metrics = new SvxFontUnitMetrics(120, 180),
      before = item.Clone();
    expect(item.ResolveLeft(indent, metrics)).toBe(resolved);
    expect(item.ResolveLeftFixedPart(indent)).toBe(fixed);
    expect(item.ResolveLeftVariablePart(indent, metrics)).toBe(variable);
    expect(item.equals(before)).toBe(true);
    expect(indent.GetTextFirstLineOffset()).toEqual(new SvxIndentValue(first, firstUnit));
  },
);
