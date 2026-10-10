/** @fileoverview Verifies pinned native LR UNO twip members, aggregate ordering, integer admission and proportion metadata without reference execution. */
import { expect, it } from "vitest";
import { SvxLRSpaceItem } from "./frmitems";

/** Supplies the native signed margin scale structure. @returns Independent complete struct. */
function scale() {
  return {
    Left: 910,
    TextLeft: 720,
    Right: -240,
    ScaleLeft: 80,
    ScaleRight: 125,
    FirstLine: -120,
    ScaleFirstLine: 75,
    AutoFirstLine: true,
  };
}

it("aggregate applies source order to existing hanging margin and retains metadata without scaling twice", /** Observes all original fields and aggregate readback. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(98);
  item.SetTextLeft(400);
  item.SetTextFirstLineOffset(-60);
  item.SetGutterMargin(41);
  item.SetRightGutterMargin(73);
  expect(item.PutValue(scale())).toBe(true);
  expect(item.QueryValue()).toEqual({ ...scale(), Left: 600 });
  expect([
    item.GetLeft(),
    item.GetTextLeft(),
    item.GetRight(),
    item.GetTextFirstLineOffset(),
    item.GetPropLeft(),
    item.GetPropRight(),
    item.GetPropTextFirstLineOffset(),
    item.GetGutterMargin(),
    item.GetRightGutterMargin(),
  ]).toEqual([600, 720, -240, -120, 80, 125, 75, 41, 73]);
  const before = item.Clone();
  expect(item.PutValue(0, 6)).toBe(true);
  expect(item.PutValue(65534, 7)).toBe(true);
  expect([
    item.GetLeft(),
    item.GetRight(),
    item.GetPropLeft(),
    item.GetPropRight(),
    item.QueryValue(7),
  ]).toEqual([600, -240, 0, 65534, -2]);
  expect(before.QueryValue(6)).toBe(80);
  expect(before.QueryValue(7)).toBe(125);
  expect(item.PutValue(-1, 9)).toBe(true);
  expect(item.GetPropTextFirstLineOffset()).toBe(65535);
  expect(item.QueryValue(9)).toBe(-1);
  expect(item.PutValue(65536, 9)).toBe(true);
  expect(item.QueryValue(9)).toBe(0);
});

it("aggregate signed16 scales wrap into native unsigned storage and explicit zeros stay sticky", /** Observes zero flags and integer aggregate conversion. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(98);
  expect(
    item.PutValue({
      ...scale(),
      Left: 0,
      TextLeft: 0,
      Right: 0,
      FirstLine: 0,
      ScaleLeft: -1,
      ScaleRight: -32768,
      ScaleFirstLine: -2,
      AutoFirstLine: false,
    }),
  ).toBe(true);
  expect([
    item.GetPropLeft(),
    item.GetPropRight(),
    item.GetPropTextFirstLineOffset(),
    item.IsExplicitZeroMarginValLeft(),
    item.IsExplicitZeroMarginValRight(),
  ]).toEqual([65535, 32768, 65534, true, true]);
  expect(item.QueryValue()).toEqual({
    Left: 0,
    TextLeft: 0,
    Right: 0,
    FirstLine: 0,
    ScaleLeft: -1,
    ScaleRight: -32768,
    ScaleFirstLine: -2,
    AutoFirstLine: false,
  });
  expect(item.PutValue(scale())).toBe(true);
  expect([item.IsExplicitZeroMarginValLeft(), item.IsExplicitZeroMarginValRight()]).toEqual([
    true,
    true,
  ]);
  expect(
    item.PutValue({ ...scale(), Left: 127, TextLeft: 1270, Right: -127, FirstLine: -127 }, 0x80),
  ).toBe(true);
  expect(item.QueryValue(0x80)).toEqual({
    ...scale(),
    Left: 1143,
    TextLeft: 1270,
    Right: -127,
    FirstLine: -127,
  });
});

it.each([
  [4, 127, 72],
  [4, -127, -72],
  [5, 127, 72],
  [5, -127, -72],
  [8, 127, 72],
  [8, -127, -72],
  [11, 127, 72],
  [11, -127, -72],
  [12, 127, 72],
  [12, -127, -72],
  [12, 1, 1],
  [12, -1, -1],
])(
  "member %s converts signed mm100 %s into twips %s",
  /** Checks native member roundtrip. @param member - Native member. @param input - mm100 measure. @param expected - Twip measure. @returns Nothing. */ (
    member,
    input,
    expected,
  ) => {
    const item = new SvxLRSpaceItem(98);
    expect(item.PutValue(input, member | 0x80)).toBe(true);
    expect(item.QueryValue(member)).toBe(expected);
    expect(item.QueryValue(member | 0x80)).toBe(Math.abs(input) === 1 ? input * 2 : input);
    expect(item.PutValue(input, member)).toBe(true);
    expect(item.QueryValue(member)).toBe(input);
  },
);

it("individual queries convert original double metrics before rounding while the aggregate resolves twips first", /** Distinguishes source double and resolved contracts. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(98);
  item.SetLeft(-3, 50);
  item.SetRight(3, 50);
  item.SetTextFirstLineOffset(3, 50);
  expect([item.QueryValue(4), item.QueryValue(5), item.QueryValue(8), item.QueryValue(11)]).toEqual(
    [-2, 2, 2, -2],
  );
  expect([
    item.QueryValue(4 | 0x80),
    item.QueryValue(5 | 0x80),
    item.QueryValue(8 | 0x80),
    item.QueryValue(11 | 0x80),
  ]).toEqual([-3, 3, 3, -3]);
  expect(item.QueryValue(0x80)).toMatchObject({ Left: -4, TextLeft: -4, Right: 4, FirstLine: 4 });
  item.SetTextFirstLineOffset(-3, 50);
  expect(item.QueryValue(11)).toBe(-2);
  expect(item.QueryValue(8 | 0x80)).toBe(-3);
});

it.each([true, false, 1, -1, 0, 2147483647, "true", 0.5, null, undefined, NaN, 2147483648])(
  "automatic first line admits native Any2Bool payload %s",
  /** Matches native bool/signed32 extraction and invalid fallback. @param value - Any payload. @returns Nothing. */ (
    value,
  ) => {
    const item = new SvxLRSpaceItem(98);
    item.SetAutoFirst(true);
    expect(item.PutValue(value, 10 | 0x80)).toBe(true);
    expect(item.QueryValue(10)).toBe(
      value === true || value === 1 || value === -1 || value === 2147483647,
    );
    expect(item.QueryValue(10 | 0x80)).toBe(item.IsAutoFirst());
  },
);

it.each([6, 7])(
  "relative member%s has exclusive uint16 maximum and never rescales values",
  /** Checks native relative bound and unchanged geometry. @param member - Relative member. @returns Nothing. */ (
    member,
  ) => {
    const item = new SvxLRSpaceItem(98);
    item.SetLeft(51, 50);
    item.SetRight(-51, 50);
    expect(item.PutValue(32768, member | 0x80)).toBe(true);
    expect(item.QueryValue(member | 0x80)).toBe(-32768);
    expect([item.GetLeft(), item.GetRight()]).toEqual([25.5, -25.5]);
    for (const value of [-1, 65535, 65536]) {
      const before = item.Clone();
      expect(item.PutValue(value, member)).toBe(false);
      expect(item.equals(before)).toBe(true);
    }
  },
);

it.each([
  null,
  undefined,
  false,
  "bad",
  [],
  {},
  { ...scale(), Left: "1" },
  { ...scale(), Right: NaN },
  { ...scale(), TextLeft: 0.5 },
  { ...scale(), FirstLine: -2147483649 },
  { ...scale(), Left: 2147483648 },
  { ...scale(), ScaleLeft: -32769 },
  { ...scale(), ScaleRight: 32768 },
  { ...scale(), ScaleFirstLine: "75" },
  { ...scale(), AutoFirstLine: 1 },
])(
  "rejects malformed aggregate without partial mutation %s",
  /** Checks atomic native extraction before any setters. @param value - Struct candidate. @returns Nothing. */ (
    value,
  ) => {
    const item = new SvxLRSpaceItem(98);
    item.PutValue(scale());
    const before = item.Clone();
    expect(item.PutValue(value)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);

it.each(["1", 1.5, NaN, Infinity, -2147483649, 2147483648])(
  "rejects non-signed32 scalar %s without mutation",
  /** Checks native numeric extraction. @param value - Any payload. @returns Nothing. */ (
    value,
  ) => {
    const item = new SvxLRSpaceItem(98);
    item.PutValue(scale());
    const before = item.Clone();
    expect(item.PutValue(value, 4)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);

it.each([1, 13, 14, 15, 127])(
  "unsupported/font-unit member%s remains explicit and does not mutate",
  /** Rejects omitted native font-unit scope. @param member - Member identity. @returns Nothing. */ (
    member,
  ) => {
    const item = new SvxLRSpaceItem(98),
      before = item.Clone();
    expect(item.QueryValue(member)).toBeUndefined();
    expect(item.PutValue(1, member)).toBe(false);
    expect(item.PutValue({ First: 1, Second: 17 }, member)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);

it("signed32 margin boundaries are admitted without proportion scaling and unknown query preserves state", /** Checks native extrema and complete cloning. @returns Nothing. */ () => {
  const item = new SvxLRSpaceItem(98);
  expect(item.PutValue(-2147483648, 4)).toBe(true);
  expect(item.PutValue(2147483647, 5)).toBe(true);
  expect([item.QueryValue(4), item.QueryValue(5)]).toEqual([-2147483648, 2147483647]);
  expect(item.Clone().equals(item)).toBe(true);
});
