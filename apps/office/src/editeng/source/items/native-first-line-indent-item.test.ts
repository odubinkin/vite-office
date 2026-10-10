/** @fileoverview Verifies original first-line typed ownership, font metrics, automatic mode and native UNO contracts. */
import { expect, it } from "vitest";
import { SvxFirstLineIndentItem, SvxIndentValue, SvxFontUnitMetrics } from "../../inc/lrspitem";
import { SvxFirstLineIndentItem as OriginalExport } from "./frmitems";
import {
  MID_FIRST_LINE_INDENT as ABS,
  MID_FIRST_LINE_REL_INDENT as REL,
  MID_FIRST_AUTO as AUTO,
  MID_FIRST_LINE_UNIT_INDENT as UNIT,
} from "../../inc/memberids";
import { MeasureUnit as U } from "../../../offapi/com/sun/star/util/MeasureUnit";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
const which = 999;
it("original first-line defaults and declaration/export identity", /** Checks original defaults. @returns Nothing. */ () => {
  const item = new SvxFirstLineIndentItem(which);
  expect(OriginalExport).toBe(SvxFirstLineIndentItem);
  expect([ABS, REL, AUTO, UNIT]).toEqual([8, 9, 10, 13]);
  expect(item.Which()).toBe(which);
  expect(item.GetTextFirstLineOffset()).toEqual(SvxIndentValue.zero());
  expect(item.GetPropTextFirstLineOffset()).toBe(100);
  expect(item.IsAutoFirst()).toBe(false);
  expect(item.HasMetrics()).toBe(true);
  expect(item.QueryValue()).toBeUndefined();
  expect(item.QueryValue(UNIT)).toBeUndefined();
  expect(item.QueryValue(1)).toBeUndefined();
  expect(item.PutValue({}, 0)).toBe(false);
  expect(item.PutValue(0, 0)).toBe(false);
});
it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE, U.MM])(
  "first-line unit%s retains double/context and constant member ownership",
  /** Resolves native measure. @param unit - Original unit. @returns Nothing. */ (unit) => {
    const input = new SvxIndentValue(-1.25, unit),
      item = new SvxFirstLineIndentItem(input, which),
      member = item.GetTextFirstLineOffset(),
      metrics = new SvxFontUnitMetrics(120, 180);
    input.ScaleMetrics(2);
    expect(member).toEqual(new SvxIndentValue(-1.25, unit));
    expect(item.ResolveTextFirstLineOffset(metrics)).toBe(
      unit === U.TWIP ? -1 : unit === U.FONT_EM ? -150 : unit === U.FONT_CJK_ADVANCE ? -225 : 0,
    );
    expect(item.ResolveTextFirstLineOffset()).toBe(unit === U.TWIP ? -1 : 0);
    item.SetAutoFirst(true);
    item.ScaleMetrics(2);
    expect(item.GetTextFirstLineOffset()).toBe(member);
    expect(member.m_dValue).toBe(-2.5);
    item.SetTextFirstLineOffset(member, 50);
    expect(item.GetTextFirstLineOffset()).toBe(member);
    expect(member).toEqual(new SvxIndentValue(-1.25, unit));
    expect(item.IsAutoFirst()).toBe(true);
    expect(item.GetPropTextFirstLineOffset()).toBe(50);
  },
);
it.each([0, 100, 50, 65535, -1, 65536])(
  "first-line unsigned percentage%s and independent native copy",
  /** Applies original casts and copying. @param prop - Native input. @returns Nothing. */ (
    prop,
  ) => {
    const item = new SvxFirstLineIndentItem(which);
    item.SetTextFirstLineOffset(new SvxIndentValue(1.25, U.FONT_EM), prop);
    item.SetAutoFirst(true);
    expect(item.GetPropTextFirstLineOffset()).toBe(prop & 0xffff);
    expect(item.GetTextFirstLineOffset().m_dValue).toBe((1.25 * (prop & 0xffff)) / 100);
    const copy = new SvxFirstLineIndentItem(item),
      clone = item.Clone();
    expect(copy.equals(item)).toBe(true);
    expect(clone.equals(item)).toBe(true);
    expect(copy.GetTextFirstLineOffset()).not.toBe(item.GetTextFirstLineOffset());
    expect(clone.GetTextFirstLineOffset()).not.toBe(item.GetTextFirstLineOffset());
    copy.SetAutoFirst(false);
    expect(item.equals(copy)).toBe(false);
    clone.ScaleMetrics(2);
    expect(clone.GetPropTextFirstLineOffset()).toBe(prop & 0xffff);
    expect(item.IsAutoFirst()).toBe(true);
    expect(item.GetTextFirstLineOffset().m_dValue).toBe((1.25 * (prop & 0xffff)) / 100);
    expect(item.equals(new SfxInt16Item(which, 0))).toBe(false);
    expect(item.equals(new SvxFirstLineIndentItem(which + 1))).toBe(false);
    const other = item.Clone();
    other.SetTextFirstLineOffset(SvxIndentValue.twips(99));
    expect(item.equals(other)).toBe(false);
    const otherProp = item.Clone();
    otherProp.SetPropTextFirstLineOffset(51);
    expect(item.equals(otherProp)).toBe(false);
  },
);
it("first-line metadata percentage setter retains unscaled measure and default100 avoids overflow", /** Keeps source setter distinction. @returns Nothing. */ () => {
  const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(Number.MAX_VALUE), which);
  expect(item.GetTextFirstLineOffset().m_dValue).toBe(Number.MAX_VALUE);
  item.SetPropTextFirstLineOffset(65535);
  expect(item.GetPropTextFirstLineOffset()).toBe(65535);
  expect(item.QueryValue(REL)).toBe(-1);
  expect(item.GetTextFirstLineOffset().m_dValue).toBe(Number.MAX_VALUE);
  item.SetPropTextFirstLineOffset(65536);
  expect(item.GetPropTextFirstLineOffset()).toBe(0);
});
it.each([0, 0x80])(
  "first-line UNO conversion%s and independent auto/percentage changes",
  /** Applies original UNO semantics. @param convert - Conversion flag. @returns Nothing. */ (
    convert,
  ) => {
    const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(-1.5), which);
    item.SetAutoFirst(true);
    expect(item.QueryValue(ABS | convert)).toBe(convert ? -3 : -2);
    expect(item.PutValue(convert ? -127 : -72, ABS | convert)).toBe(true);
    expect(item.GetTextFirstLineOffset()).toEqual(SvxIndentValue.twips(-72));
    expect(item.PutValue(32768, REL | convert)).toBe(true);
    expect(item.QueryValue(REL | convert)).toBe(-32768);
    expect(item.GetPropTextFirstLineOffset()).toBe(32768);
    expect(item.ResolveTextFirstLineOffset()).toBe(-72);
    expect(item.PutValue({ First: 1.75, Second: U.FONT_EM }, UNIT | convert)).toBe(true);
    expect(item.QueryValue(UNIT | convert)).toEqual({ First: 1.75, Second: U.FONT_EM });
    expect(item.GetPropTextFirstLineOffset()).toBe(100);
    expect(item.QueryValue(ABS | convert)).toBeUndefined();
    expect(item.QueryValue(AUTO | convert)).toBe(true);
    expect(item.PutValue({ First: 2.5, Second: U.TWIP }, UNIT | convert)).toBe(true);
    expect(item.QueryValue(UNIT | convert)).toBeUndefined();
    expect(item.QueryValue(ABS)).toBe(3);
    expect(item.PutValue(convert ? 127 : 72, ABS | convert)).toBe(true);
    expect(item.ResolveTextFirstLineOffset()).toBe(72);
    expect(item.IsAutoFirst()).toBe(true);
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
  "invalid first-line Any%s preserves all native fields",
  /** Rejects malformed value atomically. @param input - Payload. @returns Nothing. */ (input) => {
    for (const member of [0, ABS, REL, UNIT, 127]) {
      const item = new SvxFirstLineIndentItem(new SvxIndentValue(1.25, U.FONT_CJK_ADVANCE), which);
      item.SetAutoFirst(true);
      item.SetPropTextFirstLineOffset(41);
      const before = item.Clone(),
        reference = item.GetTextFirstLineOffset();
      expect(item.PutValue(input, member | 0x80)).toBe(false);
      expect(item.equals(before)).toBe(true);
      expect(item.GetTextFirstLineOffset()).toBe(reference);
    }
  },
);
it.each([-1, 65535])(
  "first-line UNO percentage%s rejects exclusive bound",
  /** Keeps original admission. @param value - Payload. @returns Nothing. */ (value) => {
    const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(50), which),
      before = item.Clone();
    expect(item.PutValue(value, REL)).toBe(false);
    expect(item.equals(before)).toBe(true);
  },
);
it.each([
  true,
  false,
  0,
  1,
  -1,
  -2147483648,
  2147483647,
  "1",
  null,
  {},
  [],
  1.5,
  NaN,
  Infinity,
  -2147483649,
  2147483648,
])(
  "first-line automatic Any%s retains original Any2Bool admission",
  /** Keeps native boolean/signed32 conversion and malformed false success. @param value - Payload. @returns Nothing. */ (
    value,
  ) => {
    const item = new SvxFirstLineIndentItem(new SvxIndentValue(1.25, U.FONT_EM), which);
    item.SetAutoFirst(true);
    item.SetPropTextFirstLineOffset(65535);
    const member = item.GetTextFirstLineOffset();
    expect(item.PutValue(value, AUTO | 0x80)).toBe(true);
    expect(item.QueryValue(AUTO)).toBe(
      typeof value === "boolean"
        ? value
        : typeof value === "number" &&
            Number.isInteger(value) &&
            value >= -2147483648 &&
            value <= 2147483647 &&
            value !== 0,
    );
    expect(item.GetTextFirstLineOffset()).toBe(member);
    expect(member).toEqual(new SvxIndentValue(1.25, U.FONT_EM));
    expect(item.GetPropTextFirstLineOffset()).toBe(65535);
  },
);

it("preserves the suspicious unsupported default query on an initialized original item", /** Retains original member-zero behavior. @returns Nothing. */ () => {
  const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(-72), which);
  item.SetAutoFirst(true);
  item.SetPropTextFirstLineOffset(32768);
  const before = item.Clone();
  expect(item.QueryValue(8)).toBe(-72);
  expect(item.QueryValue(9)).toBe(-32768);
  expect(item.QueryValue(10)).toBe(true);
  expect(item.QueryValue()).toBeUndefined();
  expect(item.QueryValue(0x80)).toBeUndefined();
  expect(item.equals(before)).toBe(true);
});

it.each([0, 0x80])(
  "absolute first-line write%s resets percentage while preserving auto and borrowed member",
  /** Keeps original direct-field absolute assignment contracts. @param convert - Flag. @returns Nothing. */ (
    convert,
  ) => {
    const item = new SvxFirstLineIndentItem(new SvxIndentValue(1.25, U.FONT_EM), which);
    item.SetAutoFirst(true);
    item.SetPropTextFirstLineOffset(32768);
    const borrowed = item.GetTextFirstLineOffset();
    expect(item.PutValue(convert ? 127 : 72, ABS | convert)).toBe(true);
    expect(item.GetTextFirstLineOffset()).toBe(borrowed);
    expect(borrowed).toEqual(SvxIndentValue.twips(72));
    expect(item.GetPropTextFirstLineOffset()).toBe(100);
    expect(item.IsAutoFirst()).toBe(true);
  },
);
