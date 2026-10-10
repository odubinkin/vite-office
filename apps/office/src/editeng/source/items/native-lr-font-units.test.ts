/** @fileoverview Locks native typed LR indent values, font context/defaults, copy, unsigned proportions and unit UNO contracts to the pinned source behavior. */
import { expect, it } from "vitest";
import { SvxFontUnitMetrics, SvxIndentValue, SvxLRSpaceItem } from "../../inc/lrspitem";
import { MeasureUnit as U } from "../../../offapi/com/sun/star/util/MeasureUnit";
const which = 999;
it("published MeasureUnit identifiers retain all native IDL constants", /** Checks published contract. @returns Nothing. */ () => {
  expect(Object.values(U)).toEqual(
    Array.from(
      { length: 21 },
      /** Creates expected native ordinal. @param _ignored - Unused. @param index - ID. @returns Native ID. */ (
        _ignored,
        index,
      ) => index,
    ),
  );
  expect([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE]).toEqual([9, 19, 20]);
});
it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE, U.MM])(
  "native indentation unit%s resolves fixed/variable/default context and scales its stored value",
  /** Resolves native measures. @param unit - Source unit. @returns Nothing. */ (unit) => {
    const metrics = new SvxFontUnitMetrics(120, 180),
      empty = new SvxFontUnitMetrics();
    expect(empty).toEqual({ m_dEmTwips: 0, m_dIcTwips: 0, m_bInitialized: false });
    expect(metrics.m_bInitialized).toBe(true);
    const indent = new SvxIndentValue(-1.25, unit),
      resolved =
        unit === U.TWIP
          ? -1.25
          : unit === U.FONT_EM
            ? -150
            : unit === U.FONT_CJK_ADVANCE
              ? -225
              : 0;
    expect(indent.ResolveDouble(metrics)).toBe(resolved);
    expect(indent.Resolve(metrics)).toBe(unit === U.TWIP ? -1 : resolved);
    expect(indent.ResolveFixedPart()).toBe(unit === U.TWIP ? -1 : 0);
    expect(indent.ResolveVariablePart(metrics)).toBe(unit === U.TWIP ? 0 : resolved);
    expect(indent.ResolveDouble(empty)).toBe(
      unit === U.TWIP ? -1.25 : unit === U.FONT_EM || unit === U.FONT_CJK_ADVANCE ? -0 : 0,
    );
    expect(indent.equals(new SvxIndentValue(-1.25, unit))).toBe(true);
    expect(indent.equals(new SvxIndentValue(0, unit))).toBe(false);
    expect(indent.equals(new SvxIndentValue(-1.25, unit === U.TWIP ? U.FONT_EM : U.TWIP))).toBe(
      false,
    );
    indent.ScaleMetrics(2);
    expect(indent.m_dValue).toBe(-2.5);
    expect(indent.m_nUnit).toBe(unit);
    expect(SvxIndentValue.zero()).toEqual(SvxIndentValue.twips(0));
  },
);
it.each([0.5, -0.5, 1.5, -1.5])(
  "native indent signed half rounding%s",
  /** Resolves source half away from zero. @param value - Input. @returns Nothing. */ (value) => {
    expect(SvxIndentValue.twips(value).Resolve(new SvxFontUnitMetrics())).toBe(
      value < 0 ? -Math.ceil(-value) : Math.ceil(value),
    );
  },
);
it("native value/copy constructors preserve units and independent owned measures", /** Checks original constructor setter ordering and copied values. @returns Nothing. */ () => {
  const left = SvxIndentValue.twips(120),
    right = new SvxIndentValue(2, U.FONT_EM),
    first = new SvxIndentValue(0.5, U.FONT_CJK_ADVANCE),
    item = new SvxLRSpaceItem(left, right, first, which),
    metrics = new SvxFontUnitMetrics(100, 200);
  expect(item.GetLeft()).toEqual(left);
  expect(item.GetRight()).toEqual(right);
  expect(item.GetTextFirstLineOffset()).toEqual(first);
  expect([
    item.ResolveLeft(),
    item.ResolveRight(metrics),
    item.ResolveTextFirstLineOffset(metrics),
    item.ResolveTextLeft(metrics),
  ]).toEqual([120, 200, 100, 120]);
  item.SetAutoFirst(true);
  item.SetExplicitZeroMarginValLeft(true);
  item.SetExplicitZeroMarginValRight(true);
  item.SetGutterMargin(31);
  item.SetRightGutterMargin(29);
  item.PutValue(23, 6);
  item.PutValue(42, 7);
  item.SetPropTextFirstLineOffset(125);
  const copy = new SvxLRSpaceItem(item),
    clone = item.Clone();
  expect(copy.equals(item)).toBe(true);
  expect(clone.equals(item)).toBe(true);
  expect(copy.GetLeft()).not.toBe(item.GetLeft());
  expect(copy.GetRight()).not.toBe(item.GetRight());
  expect(copy.GetTextFirstLineOffset()).not.toBe(item.GetTextFirstLineOffset());
  left.ScaleMetrics(2);
  right.ScaleMetrics(3);
  first.ScaleMetrics(4);
  expect(item.GetLeft().m_dValue).toBe(120);
  expect(item.GetRight().m_dValue).toBe(2);
  expect(item.GetTextFirstLineOffset().m_dValue).toBe(0.5);
  const text = item.GetTextLeft();
  text.ScaleMetrics(2);
  expect(item.GetLeft().m_dValue).toBe(120);
  clone.ScaleMetrics(2);
  expect(clone.HasMetrics()).toBe(true);
  expect([
    clone.GetLeft().m_dValue,
    clone.GetRight().m_dValue,
    clone.GetTextFirstLineOffset().m_dValue,
  ]).toEqual([240, 4, 1]);
  expect([
    clone.GetPropLeft(),
    clone.GetPropRight(),
    clone.GetPropTextFirstLineOffset(),
    clone.GetGutterMargin(),
    clone.GetRightGutterMargin(),
    clone.IsAutoFirst(),
  ]).toEqual([23, 42, 125, 31, 29, true]);
  expect(item.GetRight().m_dValue).toBe(2);
});
it.each([13, 14, 15])(
  "native pair member%s preserves double/unit and switches absolute queries",
  /** Applies native UNO pair and exact query routing. @param member - Member ID. @returns Nothing. */ (
    member,
  ) => {
    const item = new SvxLRSpaceItem(which),
      absolute = member === 13 ? 8 : member === 14 ? 11 : 5;
    expect(item.QueryValue(member)).toBeUndefined();
    expect(item.PutValue({ First: 1.25, Second: U.FONT_EM }, member | 0x80)).toBe(true);
    expect(item.QueryValue(member | 0x80)).toEqual({ First: 1.25, Second: U.FONT_EM });
    expect(item.QueryValue(absolute)).toBeUndefined();
    expect(item.QueryValue(absolute | 0x80)).toBeUndefined();
    expect(item.PutValue({ First: -1.5, Second: U.TWIP }, member)).toBe(true);
    expect(item.QueryValue(member)).toBeUndefined();
    expect(item.QueryValue(absolute)).toBe(-2);
  },
);
it("negative relative first line retains native empty-context conversion while explicit metrics resolve it", /** Locks pinned negative first-line unit loss/order. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(which),
    metrics = new SvxFontUnitMetrics(100, 200);
  item.SetTextLeft(new SvxIndentValue(2, U.FONT_EM));
  item.SetTextFirstLineOffset(new SvxIndentValue(-1, U.FONT_CJK_ADVANCE));
  expect(item.GetLeft()).toEqual(SvxIndentValue.twips(0));
  expect(item.GetTextLeft()).toEqual(SvxIndentValue.twips(0));
  expect(item.ResolveTextLeft(metrics)).toBe(200);
  expect(item.ResolveTextFirstLineOffset(metrics)).toBe(-200);
  expect(item.QueryValue(14)).toBeUndefined();
  expect(item.QueryValue(13)).toEqual({ First: -1, Second: U.FONT_CJK_ADVANCE });
  item.SetTextLeft(SvxIndentValue.twips(120));
  expect(item.GetLeft()).toEqual(SvxIndentValue.twips(120));
  item.SetTextFirstLineOffset(SvxIndentValue.twips(20));
  expect(item.GetLeft()).toEqual(SvxIndentValue.twips(120));
  expect(item.QueryValue(8)).toBe(20);
});
it.each([-1, 65536, 65636])(
  "native unsigned proportion cast%s retains source scaling",
  /** Verifies native cast before applying original typed setters. @param input - Source cast input. @returns Nothing. */ (
    input,
  ) => {
    const prop = input & 0xffff,
      item = new SvxLRSpaceItem(which);
    item.SetLeft(SvxIndentValue.twips(1.25), input);
    item.SetRight(SvxIndentValue.twips(2.5), input);
    item.SetTextFirstLineOffset(SvxIndentValue.twips(1.25), input);
    item.SetPropTextFirstLineOffset(input);
    expect([item.GetPropLeft(), item.GetPropRight(), item.GetPropTextFirstLineOffset()]).toEqual([
      prop,
      prop,
      prop,
    ]);
    expect(item.GetLeft().m_dValue).toBe((1.25 * prop) / 100);
    expect(item.GetRight().m_dValue).toBe((2.5 * prop) / 100);
  },
);
it("native default100 setters retain exact original doubles without multiply overflow", /** Checks source no-op scaling branch. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(which);
  item.SetLeft(SvxIndentValue.twips(Number.MAX_VALUE));
  item.SetRight(SvxIndentValue.twips(Number.MAX_VALUE));
  item.SetTextFirstLineOffset(SvxIndentValue.twips(Number.MAX_VALUE));
  expect([
    item.GetLeft().m_dValue,
    item.GetRight().m_dValue,
    item.GetTextFirstLineOffset().m_dValue,
  ]).toEqual([Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE]);
});
it.each([
  { value: null },
  { value: [] },
  { value: false },
  { value: 0 },
  { value: {} },
  { value: { First: "1", Second: 19 } },
  { value: { First: 1, Second: 19.5 } },
  { value: { First: 1, Second: -32769 } },
  { value: { First: 1, Second: 32768 } },
])(
  "malformed native pair $value rejects atomically",
  /** Keeps native double/signed16 UNO admission. @param row - Invalid pair. @returns Nothing. */ ({
    value,
  }) => {
    for (const member of [13, 14, 15]) {
      const item = new SvxLRSpaceItem(which),
        before = item.Clone();
      expect(item.PutValue(value, member)).toBe(false);
      expect(item.equals(before)).toBe(true);
    }
  },
);
it.each([-32769, 65535, 65536])(
  "native unit constructor casts signed16%s",
  /** Preserves native short parameter conversion. @param unit - Wide input. @returns Nothing. */ (
    unit,
  ) => {
    expect(new SvxIndentValue(1, unit).m_nUnit).toBe((unit << 16) >> 16);
  },
);
it.each([
  [0.25, 0],
  [-0.25, 0],
  [2147483647.5, -2147483648],
  [-2147483648.5, 2147483647],
] as const)(
  "native sal_Int32 resolution casts%s to%s",
  /** Normalizes integer zero and source cast boundaries. @param value - Native double. @param resolved - Expected signed32. @returns Nothing. */ (
    value,
    resolved,
  ) => {
    expect(SvxIndentValue.twips(value).Resolve(new SvxFontUnitMetrics())).toBe(resolved);
    const item = new SvxLRSpaceItem(999);
    item.SetRight(SvxIndentValue.twips(value));
    expect(item.QueryValue(5)).toBe(resolved);
    expect((item.QueryValue(0) as { Right: number }).Right).toBe(resolved);
  },
);
it("native const member references remain stable across setters, hanging correction and scaling", /** Preserves original member-reference lifetime and pass-by-value alias semantics. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(999),
    left = item.GetLeft(),
    right = item.GetRight(),
    first = item.GetTextFirstLineOffset();
  item.SetLeft(SvxIndentValue.twips(100), 50);
  expect(item.GetLeft()).toBe(left);
  expect(left.m_dValue).toBe(50);
  item.SetRight(new SvxIndentValue(2, U.FONT_EM), 125);
  expect(item.GetRight()).toBe(right);
  expect(right).toEqual(new SvxIndentValue(2.5, U.FONT_EM));
  item.SetTextFirstLineOffset(SvxIndentValue.twips(-20));
  expect(item.GetLeft()).toBe(left);
  expect(item.GetTextFirstLineOffset()).toBe(first);
  expect(left.m_dValue).toBe(30);
  expect(first.m_dValue).toBe(-20);
  item.SetTextFirstLineOffset(item.GetLeft());
  expect(first.m_dValue).toBe(30);
  expect(left.m_dValue).toBe(50);
  item.SetTextLeft(SvxIndentValue.twips(100));
  const copy = item.GetTextLeft();
  expect(copy).not.toBe(left);
  item.ScaleMetrics(2);
  expect([left.m_dValue, right.m_dValue, first.m_dValue]).toEqual([200, 5, 60]);
  expect(copy.m_dValue).toBe(100);
});
