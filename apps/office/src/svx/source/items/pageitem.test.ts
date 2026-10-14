/** @fileoverview Source-faithful native page values, descriptor-copy omission and actual Any member contracts. */
import { expect, it } from "vitest";
import { SvxPageItem as Page, SvxPageUsage as Use } from "../../inc/pageitem";
import { SvxPageItem as Owner } from "./pageitem";
import { SvxNumType as Num } from "../../../editeng/inc/svxenum";
import {
  MID_PAGE_NUMTYPE as NUMBER,
  MID_PAGE_ORIENTATION as ORIENTATION,
  MID_PAGE_LAYOUT as LAYOUT,
} from "../../inc/unomid";
import {
  PageStyleLayout as Layout,
  cppu_detail_getUnoType_PageStyleLayout as layoutType,
} from "../../../offapi/com/sun/star/style/PageStyleLayout";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxInt16Item } from "../../../svl/source/items/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
/** Uses the actual shared Any input and releases its value. @param page - Actual item. @param data - Native input cell. @param type - Declared native type. @param member - Native member. @returns Native result. */
function put(
  page: Page,
  data: unknown,
  type: Exclude<UnoTypeArgument, "Any">,
  member: number,
): boolean {
  const any = new Any(data, type);
  try {
    return page.PutValue(any, member);
  } finally {
    any.dispose();
  }
}
/** Reads an actual native scalar through real Any. @param page - Actual page. @param member - Member ID. @param type - Native type. @returns Scalar value. */
function query(
  page: Page,
  member: number,
  type: Exclude<UnoTypeArgument, "Any">,
): number | boolean {
  const any = new Any(),
    out: [number | boolean] = [0];
  try {
    expect(page.QueryValue(any, member)).toBe(true);
    expect(any.extract(out, type)).toBe(true);
    return out[0];
  } finally {
    any.dispose();
  }
}
it("retains original Arabic portrait All defaults, three-field copies and descriptor omission", /** Existing browser state projection observes actual fields without inventing a native name getter. @returns Nothing. */ () => {
  expect(Page).toBe(Owner);
  const page = new Page(158),
    zero = Page.CreateDefault();
  expect(zero.Which()).toBe(0);
  expect(page.QueryValue()).toEqual({ descName: "", numType: 4, landscape: false, pageUsage: 3 });
  expect(page.equals(zero)).toBe(true);
  page.SetDescName("😀 Name");
  expect(page.QueryValue().descName).toBe("😀 Name");
  expect(page.equals(zero)).toBe(true);
  page.SetDescName("");
  expect(page.QueryValue().descName).toBe("");
  page.SetDescName("Template");
  page.SetNumType(Num.SVX_NUM_ROMAN_UPPER);
  page.SetLandscape(true);
  page.SetPageUsage(Use.Mirror);
  const copy = new Page(page),
    clone = page.Clone(new SfxItemPool());
  expect(copy.QueryValue()).toEqual({ descName: "", numType: 2, landscape: true, pageUsage: 7 });
  expect(clone.equals(page)).toBe(true);
  expect(copy.equals(page)).toBe(true);
  expect(clone).not.toBe(page);
  clone.SetWhich(10);
  expect(clone.equals(page)).toBe(true);
  clone.SetNumType(Num.SVX_NUM_ARABIC);
  expect(clone.equals(page)).toBe(false);
  clone.SetNumType(Num.SVX_NUM_ROMAN_UPPER);
  clone.SetLandscape(false);
  expect(clone.equals(page)).toBe(false);
  clone.SetLandscape(true);
  clone.SetPageUsage(Use.Left);
  expect(clone.equals(page)).toBe(false);
  expect(page.equals(new SfxInt16Item(158, 4))).toBe(false);
  page.SetNumType(65535 as Num);
  expect(page.GetNumType()).toBe(-1);
  expect([page.IsLandscape(), page.GetPageUsage()]).toEqual([true, 7]);
  expect([Use.NONE, Use.Left, Use.Right, Use.All, Use.Mirror]).toEqual([0, 1, 2, 3, 7]);
});
it("queries all native members, ignores conversion and preserves output on unknown/invalid layout", /** Query0 is the native short numbering member; the no-argument browser record is separate. @returns Nothing. */ () => {
  const page = new Page(1),
    any = new Any([42], "sal_Int32"),
    out: [number] = [0];
  try {
    expect(query(page, NUMBER, "sal_Int16")).toBe(4);
    expect(query(page, NUMBER | 0x80, "sal_Int16")).toBe(4);
    expect(query(page, 256, "sal_Int16")).toBe(4);
    expect(query(page, ORIENTATION, "bool")).toBe(false);
    page.SetLandscape(true);
    expect(query(page, ORIENTATION | 0x80, "bool")).toBe(true);
    for (const [use, layout] of [
      [Use.Left, Layout.LEFT],
      [Use.Right, Layout.RIGHT],
      [Use.All, Layout.ALL],
      [Use.Mirror, Layout.MIRRORED],
    ] as const) {
      page.SetPageUsage(use);
      expect(query(page, LAYOUT, layoutType)).toBe(layout);
    }
    any.insert([42], "sal_Int32");
    expect(page.QueryValue(any, 99)).toBe(true);
    expect(any.extract(out, "sal_Int32")).toBe(true);
    expect(out[0]).toBe(42);
    page.SetPageUsage(Use.NONE);
    expect(page.QueryValue(any, LAYOUT | 0x80)).toBe(false);
    expect(any.extract(out, "sal_Int32")).toBe(true);
    expect(out[0]).toBe(42);
    page.SetNumType(-1 as Num);
    expect(page.QueryValue(any)).toBe(true);
    expect(any.extract(out, "sal_Int16")).toBe(true);
    expect(out[0]).toBe(-1);
  } finally {
    any.dispose();
  }
});
it("puts original numeric, bool and enum paths with source no-op/failure semantics", /** Actual Any2Bool and CPPU extraction are used; no fallback-success provider. @returns Nothing. */ () => {
  const page = new Page(1);
  expect(put(page, [65540], "sal_Int32", NUMBER)).toBe(true);
  expect(page.GetNumType()).toBe(4);
  expect(put(page, [-1], "sal_Int16", NUMBER | 0x80)).toBe(true);
  expect(page.GetNumType()).toBe(-1);
  expect(put(page, [true], "bool", NUMBER)).toBe(false);
  expect(page.GetNumType()).toBe(-1);
  expect(put(page, [true], "bool", ORIENTATION)).toBe(true);
  expect(page.IsLandscape()).toBe(true);
  expect(put(page, [-3], "sal_Int32", ORIENTATION | 0x80)).toBe(true);
  expect(page.IsLandscape()).toBe(true);
  expect(put(page, [0], "sal_Int32", ORIENTATION)).toBe(true);
  expect(page.IsLandscape()).toBe(false);
  page.SetLandscape(true);
  expect(put(page, [1.5], "double", ORIENTATION)).toBe(true);
  expect(page.IsLandscape()).toBe(false);
  for (const [layout, use] of [
    [Layout.ALL, Use.All],
    [Layout.LEFT, Use.Left],
    [Layout.RIGHT, Use.Right],
    [Layout.MIRRORED, Use.Mirror],
  ] as const) {
    expect(put(page, [layout], layoutType, LAYOUT)).toBe(true);
    expect(page.GetPageUsage()).toBe(use);
    expect(put(page, [layout], "sal_Int32", LAYOUT | 0x80)).toBe(true);
    expect(page.GetPageUsage()).toBe(use);
  }
  expect(put(page, [99], "sal_Int32", LAYOUT)).toBe(true);
  expect(page.GetPageUsage()).toBe(Use.Mirror);
  expect(put(page, [Layout.MAKE_FIXED_SIZE], layoutType, LAYOUT)).toBe(true);
  expect(page.GetPageUsage()).toBe(Use.Mirror);
  expect(put(page, [true], "bool", LAYOUT)).toBe(false);
  expect(page.GetPageUsage()).toBe(Use.Mirror);
  const before = page.QueryValue();
  expect(put(page, [true], "bool", 99)).toBe(true);
  expect(page.QueryValue()).toEqual(before);
  expect(put(page, [4], "sal_Int32", 256)).toBe(true);
  expect(page.GetNumType()).toBe(4);
});
