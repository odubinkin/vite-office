/** @fileoverview Original strikeout/emphasis values and shared Any2Bool with real Writer consumers. */
import { expect, it } from "vitest";
import { SvxCrossedOutItem as Cross } from "../../inc/crossedoutitem";
import { SvxEmphasisMarkItem as Emphasis } from "../../inc/emphasismarkitem";
import { FontStrikeout as S, FontEmphasisMark as M } from "../../../tools/inc/fontenum";
import { FontEmphasis as F } from "../../../offapi/com/sun/star/text/FontEmphasis";
import {
  MID_CROSSED_OUT as BOOL,
  MID_CROSS_OUT as ENUM,
  MID_EMPHASIS as EMP,
} from "../../inc/memberids";
import { Any2Bool } from "../../../svl/inc/poolitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SvxLRSpaceItem, SvxFirstLineIndentItem } from "../../inc/lrspitem";
it("uses original bool then signed32 Any2Bool fallback and real Writer auto-first-line consumers", /** Actual Any and explicit scalar family. @returns Nothing. */ () => {
  for (const [input, result] of [
    [true, true],
    [false, false],
    [-1, true],
    [1, true],
    [0, false],
    [-0, false],
    [-2147483648, true],
    [2147483647, true],
    [2147483648, false],
    [-2147483649, false],
    [1.5, false],
    [NaN, false],
    [Infinity, false],
    [null, false],
    [undefined, false],
    ["true", false],
    [{}, false],
    [[], false],
    [1n, false],
  ] as const)
    expect(Any2Bool(input)).toBe(result);
  for (const [input, result] of [
    [new Any(true), true],
    [new Any(false), false],
    [new Any([-1], "sal_Int32"), true],
    [new Any([0], "sal_Int32"), false],
    [new Any([1.5], "double"), false],
  ] as const) {
    expect(Any2Bool(input)).toBe(result);
    const lr = new SvxLRSpaceItem(156),
      first = new SvxFirstLineIndentItem(157);
    expect(lr.PutValue(input, 10)).toBe(true);
    expect(lr.IsAutoFirst()).toBe(result);
    expect(first.PutValue(input, 10)).toBe(true);
    expect(first.IsAutoFirst()).toBe(result);
    input.dispose();
  }
});
it("retains strikeout enum factories copies and native bool SINGLE/NONE setters", /** Original copy/Clone retain Which and stored enum. @returns Nothing. */ () => {
  expect([
    S.STRIKEOUT_NONE,
    S.STRIKEOUT_SINGLE,
    S.STRIKEOUT_DOUBLE,
    S.STRIKEOUT_DONTKNOW,
    S.STRIKEOUT_BOLD,
    S.STRIKEOUT_SLASH,
    S.STRIKEOUT_X,
    S.FontStrikeout_FORCE_EQUAL_SIZE,
    BOOL,
    ENUM,
    EMP,
  ]).toEqual([0, 1, 2, 3, 4, 5, 6, 2147483647, 0, 1, 0]);
  const factory = Cross.CreateDefault(),
    item = new Cross(S.STRIKEOUT_DOUBLE, 106),
    copy = new Cross(item),
    clone = item.Clone(new SfxItemPool());
  expect([
    factory.Which(),
    factory.GetValue(),
    copy.Which(),
    clone.Which(),
    clone.GetStrikeout(),
  ]).toEqual([0, 0, 106, 106, 2]);
  expect(clone).not.toBe(item);
  expect(item.equals(copy)).toBe(true);
  copy.SetWhich(99);
  expect(item.equals(copy)).toBe(true);
  expect(item.HasBoolValue()).toBe(true);
  expect(item.PutValue(true)).toBe(true);
  expect(item.GetBoolValue()).toBe(true);
  item.SetBoolValue(false);
  expect(item.GetStrikeout()).toBe(S.STRIKEOUT_NONE);
  expect(item.GetBoolValue()).toBe(false);
  item.SetBoolValue(true);
  expect(item.GetStrikeout()).toBe(S.STRIKEOUT_SINGLE);
  expect(copy.GetStrikeout()).toBe(S.STRIKEOUT_DOUBLE);
  expect(item.QueryValue()).toBe(1);
  expect(item.hashCode()).toBe(106 ^ 1);
  expect(item.supportsHashCode()).toBe(true);
  expect(item.equals(copy)).toBe(false);
});
it("keeps original strikeout typed members unknown success and invalid bool reset behavior", /** Member0always uses Any2Bool, member1requires signed32. @returns Nothing. */ () => {
  const item = new Cross(S.STRIKEOUT_DOUBLE, 106),
    out = new Any();
  expect(item.QueryValue(out)).toBe(true);
  expect(out.getValueTypeClass()).toBe(TypeClass.BOOLEAN);
  const flag: [boolean] = [false];
  expect(out.extract(flag, "bool")).toBe(true);
  expect(flag[0]).toBe(true);
  expect(item.QueryValue(out, ENUM | 128)).toBe(true);
  expect(out.getValueTypeClass()).toBe(TypeClass.SHORT);
  const short: [number] = [0];
  expect(out.extract(short, "sal_Int16")).toBe(true);
  expect(short[0]).toBe(2);
  expect(item.QueryValue(out, 2)).toBe(true);
  expect(out.extract(short, "sal_Int16")).toBe(true);
  expect(short[0]).toBe(2);
  expect(item.PutValue(undefined, 2)).toBe(true);
  expect(item.GetValue()).toBe(S.STRIKEOUT_DOUBLE);
  expect(item.PutValue(true, BOOL)).toBe(true);
  expect(item.GetValue()).toBe(1);
  expect(item.PutValue({}, BOOL)).toBe(true);
  expect(item.GetValue()).toBe(0);
  expect(item.PutValue(40000, 257)).toBe(true);
  expect(item.GetValue()).toBe(40000);
  expect(item.QueryValue(out, 1)).toBe(true);
  expect(out.extract(short, "sal_Int16")).toBe(true);
  expect(short[0]).toBe(-25536);
  const numeric = new Any([6], "sal_Int32");
  expect(item.PutValue(numeric, 129)).toBe(true);
  numeric.dispose();
  expect(item.GetStrikeout()).toBe(S.STRIKEOUT_X);
  for (const wrong of [
    true,
    "1",
    null,
    undefined,
    {},
    [],
    1.5,
    NaN,
    Infinity,
    -2147483649,
    2147483648,
  ]) {
    expect(item.PutValue(wrong, ENUM)).toBe(false);
    expect(item.GetValue()).toBe(6);
  }
  const wrong = new Any(true);
  expect(item.PutValue(wrong, ENUM)).toBe(false);
  wrong.dispose();
  expect(item.GetValue()).toBe(6);
  out.dispose();
});
/** Independent native flag/wire cases. */
const marks = [
  [F.NONE, M.NONE],
  [F.DOT_ABOVE, M.Dot | M.PosAbove],
  [F.CIRCLE_ABOVE, M.Circle | M.PosAbove],
  [F.DISK_ABOVE, M.Disc | M.PosAbove],
  [F.ACCENT_ABOVE, M.Accent | M.PosAbove],
  [F.DOT_BELOW, M.Dot | M.PosBelow],
  [F.CIRCLE_BELOW, M.Circle | M.PosBelow],
  [F.DISK_BELOW, M.Disc | M.PosBelow],
  [F.ACCENT_BELOW, M.Accent | M.PosBelow],
] as const;
it("maps all9emphasis wire values using actual signed short outputs and signed long inputs", /** Original native mapping, not raw bit passthrough. @returns Nothing. */ () => {
  expect([M.Style, M.PosAbove, M.PosBelow, F.NONE, F.ACCENT_BELOW]).toEqual([
    15, 4096, 8192, 0, 14,
  ]);
  const item = new Emphasis(M.NONE, 121),
    out = new Any();
  for (const [wire, flags] of marks) {
    expect(item.PutValue(wire)).toBe(true);
    expect(item.GetEmphasisMark()).toBe(flags);
    expect(item.QueryValue()).toBe(flags);
    expect(item.QueryValue(out, 128)).toBe(true);
    expect(out.getValueTypeClass()).toBe(TypeClass.SHORT);
    const value: [number] = [-1];
    expect(out.extract(value, "sal_Int16")).toBe(true);
    expect(value[0]).toBe(wire);
    item.SetValue(0);
    const input = new Any([wire], "sal_Int32");
    expect(item.PutValue(input, 256)).toBe(true);
    expect(item.GetValue()).toBe(flags);
    input.dispose();
  }
  out.dispose();
});
it("retains emphasis copy identity unknown style and below precedence with native unknown-member success", /** No localized presentation or invalid native memory experiment. @returns Nothing. */ () => {
  const factory = Emphasis.CreateDefault(),
    item = new Emphasis(M.Circle | M.PosAbove | M.PosBelow, 121),
    copy = new Emphasis(item),
    clone = item.Clone(new SfxItemPool());
  expect([factory.Which(), factory.GetValue(), copy.Which(), clone.Which()]).toEqual([
    0, 0, 121, 121,
  ]);
  expect(item.equals(copy)).toBe(true);
  copy.SetWhich(5);
  expect(item.equals(copy)).toBe(true);
  expect(clone).not.toBe(item);
  expect(typeof item.hashCode()).toBe("bigint");
  expect(item.supportsHashCode()).toBe(true);
  const out = new Any();
  expect(item.QueryValue(out)).toBe(true);
  const value: [number] = [0];
  expect(out.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(F.CIRCLE_BELOW);
  item.SetValue(5 | M.PosBelow);
  expect(item.QueryValue(out)).toBe(true);
  expect(out.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(F.NONE);
  expect(copy.GetValue()).toBe(M.Circle | M.PosAbove | M.PosBelow);
  expect(item.equals(copy)).toBe(false);
  expect(item.equals(new Cross(S.STRIKEOUT_NONE, 121))).toBe(false);
  expect(item.QueryValue(out, 1)).toBe(true);
  expect(out.extract(value, "sal_Int16")).toBe(true);
  expect(value[0]).toBe(0);
  expect(item.PutValue(undefined, 129)).toBe(true);
  expect(item.GetValue()).toBe(5 | M.PosBelow);
  out.dispose();
});
it("preserves emphasis state on wrong actual Any and failed scalar mappings", /** Original ignored extraction leaves invalid sentinel. @returns Nothing. */ () => {
  const item = new Emphasis(M.Accent | M.PosAbove, 121);
  for (const wrong of [
    true,
    "1",
    null,
    undefined,
    {},
    [],
    1.5,
    NaN,
    Infinity,
    -2147483649,
    2147483648,
    -1,
    5,
    10,
    15,
  ]) {
    expect(item.PutValue(wrong)).toBe(false);
    expect(item.GetEmphasisMark()).toBe(M.Accent | M.PosAbove);
  }
  const wrong = new Any(true);
  expect(item.PutValue(wrong, 128)).toBe(false);
  wrong.dispose();
  expect(item.GetValue()).toBe(M.Accent | M.PosAbove);
});
