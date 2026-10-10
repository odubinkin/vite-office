/** @fileoverview Verifies five original UL fields, unsigned scaling, native UNO contracts and literal pinned aggregate quirks without executing reference code. */
import { expect, it } from "vitest";
import { SvxULSpaceItem } from "../../inc/ulspitem";
import { SvxULSpaceItem as ReexportedUL } from "./frmitems";

it("native header/default/value construction and raw setters preserve all five fields independently", /** Checks original defaults, unsigned measures and proportions. @returns Nothing. */ () => {
  expect(ReexportedUL).toBe(SvxULSpaceItem);
  const item = new SvxULSpaceItem(101);
  expect([
    item.GetUpper(),
    item.GetLower(),
    item.GetContext(),
    item.GetPropUpper(),
    item.GetPropLower(),
  ]).toEqual([0, 0, false, 100, 100]);
  expect(item.QueryValue()).toEqual({ Upper: 0, Lower: 100, ScaleUpper: 100, ScaleLower: 100 });
  item.SetUpper(15, 50);
  item.SetLower(15, 125);
  expect([item.GetUpper(), item.GetLower(), item.GetPropUpper(), item.GetPropLower()]).toEqual([
    7, 18, 50, 125,
  ]);
  item.SetUpperValue(-1);
  item.SetLowerValue(65536);
  item.SetPropUpper(65536);
  item.SetPropLower(-1);
  item.SetContextValue(true);
  expect([
    item.GetUpper(),
    item.GetLower(),
    item.GetPropUpper(),
    item.GetPropLower(),
    item.GetContext(),
  ]).toEqual([65535, 0, 0, 65535, true]);
  const clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.equals(item)).toBe(true);
  clone.SetLowerValue(3);
  expect(item.GetLower()).toBe(0);
  expect(new SvxULSpaceItem(-1, 65536, 101).QueryValue(3)).toBe(65535);
  expect(new SvxULSpaceItem(12, 34, 101, true).GetContext()).toBe(true);
  item.SetUpper(65535, 65535);
  item.SetLower(65535, 65535);
  expect([item.GetUpper(), item.GetLower()]).toEqual([22282, 22282]);
  expect(item.equals(new SvxULSpaceItem(102))).toBe(false);
});

it.each(["upper", "lower", "context", "propUpper", "propLower"])(
  "complete native equality observes independent%s",
  /** Changes exactly one original field. @param field - Native field. @returns Nothing. */ (
    field,
  ) => {
    const item = new SvxULSpaceItem(101),
      copy = item.Clone();
    if (field === "upper") copy.SetUpperValue(1);
    else if (field === "lower") copy.SetLowerValue(1);
    else if (field === "context") copy.SetContextValue(true);
    else if (field === "propUpper") copy.SetPropUpper(50);
    else copy.SetPropLower(50);
    expect(item.equals(copy)).toBe(false);
    expect(item.equals(item.Clone())).toBe(true);
  },
);

it.each([
  [80, 125, 125],
  [80, 1, 80],
  [1, 125, 125],
  [1, -1, 100],
])(
  "aggregate scales upper%s lower%s retain source upper result%s and lower100",
  /** Locks the actual pinned aggregate write behavior. @param upperScale - Upper scale. @param lowerScale - Lower scale. @param expected - Final upper scale. @returns Nothing. */ (
    upperScale,
    lowerScale,
    expected,
  ) => {
    const item = new SvxULSpaceItem(12, 34, 101, true);
    item.SetPropLower(75);
    expect(
      item.PutValue({ Upper: 120, Lower: 60, ScaleUpper: upperScale, ScaleLower: lowerScale }),
    ).toBe(true);
    expect([
      item.GetUpper(),
      item.GetLower(),
      item.GetPropUpper(),
      item.GetPropLower(),
      item.GetContext(),
    ]).toEqual([120, 60, expected, 100, true]);
    expect(item.QueryValue()).toEqual({
      Upper: 120,
      Lower: expected,
      ScaleUpper: expected,
      ScaleLower: 100,
    });
    expect(item.QueryValue(0x80)).toEqual({
      Upper: 212,
      Lower: 106,
      ScaleUpper: expected,
      ScaleLower: 100,
    });
    expect(item.PutValue({ Upper: 127, Lower: -127, ScaleUpper: 1, ScaleLower: 1 }, 0x80)).toBe(
      true,
    );
    expect([item.GetUpper(), item.GetLower()]).toEqual([72, 65464]);
  },
);

it.each([
  [3, 127, 72],
  [3, -127, 65464],
  [4, 127, 72],
  [3, 1, 1],
  [3, -1, 65535],
  [4, 1, 1],
])(
  "native absolute member%s converts input%s to unsigned twips%s",
  /** Checks signed conversion before native uint16 casting. @param member - Native member. @param input - mm100 value. @param expected - Unsigned result. @returns Nothing. */ (
    member,
    input,
    expected,
  ) => {
    const item = new SvxULSpaceItem(101);
    expect(item.PutValue(input, member | 0x80)).toBe(true);
    expect(item.QueryValue(member)).toBe(expected);
    expect(item.PutValue(input, member)).toBe(true);
    expect(item.QueryValue(member)).toBe(input & 65535);
    expect(typeof item.QueryValue(member | 0x80)).toBe("number");
  },
);

it.each([5, 6])(
  "relative member%s accepts above1 with native uint16 wrap and no metric rescaling",
  /** Checks native relative admission and geometry independence. @param member - Relative member. @returns Nothing. */ (
    member,
  ) => {
    const item = new SvxULSpaceItem(120, 60, 101);
    expect(item.PutValue(65536, member | 0x80)).toBe(true);
    expect(item.QueryValue(member)).toBe(0);
    expect(item.PutValue(2147483647, member)).toBe(true);
    expect(item.QueryValue(member | 0x80)).toBe(-1);
    expect([item.GetUpper(), item.GetLower()]).toEqual([120, 60]);
    for (const value of [1, 0, -1]) {
      const before = item.Clone();
      expect(item.PutValue(value, member)).toBe(false);
      expect(item.equals(before)).toBe(true);
    }
  },
);

it("context member is strict native bool and lower scalar rejects negatives unlike aggregate", /** Locks distinct source admission routes. @returns Nothing. */ () => {
  const item = new SvxULSpaceItem(101);
  expect(item.PutValue(true, 7)).toBe(true);
  expect(item.QueryValue(7 | 0x80)).toBe(true);
  expect(item.PutValue(1, 7)).toBe(false);
  expect(item.GetContext()).toBe(true);
  expect(item.PutValue(false, 7 | 0x80)).toBe(true);
  expect(item.QueryValue(7)).toBe(false);
  expect(item.PutValue(-1, 4)).toBe(false);
  expect(item.GetLower()).toBe(0);
  expect(item.PutValue(-2147483648, 3)).toBe(true);
  expect(item.GetUpper()).toBe(0);
  expect(item.PutValue(2147483647, 4)).toBe(true);
  expect(item.GetLower()).toBe(65535);
  expect(item.QueryValue(99)).toBeUndefined();
  expect(item.PutValue(1, 99)).toBe(false);
});

it.each([
  null,
  [],
  false,
  "UNO",
  undefined,
  {},
  { Upper: "1", Lower: 0, ScaleUpper: 100, ScaleLower: 100 },
  { Upper: NaN, Lower: 0, ScaleUpper: 100, ScaleLower: 100 },
  { Upper: 1.5, Lower: 0, ScaleUpper: 100, ScaleLower: 100 },
  { Upper: 2147483648, Lower: 0, ScaleUpper: 100, ScaleLower: 100 },
  { Upper: 0, Lower: -2147483649, ScaleUpper: 100, ScaleLower: 100 },
  { Upper: 0, Lower: 0, ScaleUpper: -32769, ScaleLower: 100 },
  { Upper: 0, Lower: 0, ScaleUpper: 100, ScaleLower: 32768 },
  { Upper: 0, Lower: 0, ScaleUpper: false, ScaleLower: 100 },
])(
  "malformed aggregate%j does not partially mutate",
  /** Verifies typed source extraction before setters. @param value - Invalid Any. @returns Nothing. */ (
    value,
  ) => {
    const item = new SvxULSpaceItem(12, 34, 101, true),
      before = item.Clone();
    expect(item.PutValue(value)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);

it.each(["1", 0.5, NaN, Infinity, -2147483649, 2147483648])(
  "invalid signed32 scalar%s is rejected",
  /** Verifies source numeric extraction. @param value - Invalid Any. @returns Nothing. */ (
    value,
  ) => {
    const item = new SvxULSpaceItem(101);
    expect(item.PutValue(value, 3)).toBe(false);
  },
);

it.each([
  [NaN, 0],
  [0, 0.5],
])(
  "noninteger represented constructor%s/%s stays rejected",
  /** Verifies the represented typed-input boundary. @param upper - Upper candidate. @param lower - Lower candidate. @returns Nothing. */ (
    upper,
    lower,
  ) => {
    expect(
      /** Constructs invalid native numeric input. @returns Candidate item. */ () =>
        new SvxULSpaceItem(upper, lower, 101),
    ).toThrow("value is invalid");
  },
);
