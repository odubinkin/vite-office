/** @fileoverview Source-backed shared boolean values over real pool and Writer item owners. */
import { expect, it } from "vitest";
import { SfxBoolItem } from "./cenumitm";
import { SfxItemPool } from "./itempool";
import { SfxStringItem } from "./stritem";
import { SwFormatRowSplit } from "../../../sw/inc/fmtrowsplt";
import { SwFormatLayoutSplit } from "../../../sw/inc/fmtlsplt";
it("retains native defaults copies Clone identity and independent mutation", /** Real public item histories. @returns Nothing. */ () => {
  const empty = new SfxBoolItem(),
    factory = SfxBoolItem.CreateDefault();
  expect([empty.Which(), empty.GetValue(), factory.Which(), factory.GetValue()]).toEqual([
    0,
    false,
    0,
    false,
  ]);
  const source = new SfxBoolItem(42, true),
    copy = new SfxBoolItem(source),
    clone = source.Clone(new SfxItemPool());
  expect(copy).not.toBe(source);
  expect(clone).not.toBe(source);
  expect([copy.Which(), copy.GetValue(), clone.Which(), clone.QueryValue()]).toEqual([
    42,
    true,
    42,
    true,
  ]);
  source.SetValue(true);
  source.SetValue(false);
  expect(source.QueryValue()).toBe(false);
  expect(copy.GetValue()).toBe(true);
  expect(clone.GetValue()).toBe(true);
  source.SetValue(false);
});
it("compares same native item types by payload independently of Which", /** Native valid comparisons plus explicit host cross-type rejection. @returns Nothing. */ () => {
  const a = new SfxBoolItem(1, true),
    b = new SfxBoolItem(2, true);
  expect(a.equals(b)).toBe(true);
  b.SetValue(false);
  expect(a.equals(b)).toBe(false);
  expect(a.equals(new SfxStringItem(1, "x"))).toBe(false);
  expect(a.equals(new SwFormatRowSplit(true))).toBe(false);
  const row = new SwFormatRowSplit(true),
    other = new SwFormatRowSplit(true);
  other.SetWhich(99);
  expect(row.equals(other)).toBe(true);
  expect(row.equals(new SwFormatLayoutSplit(true))).toBe(false);
});
it("accepts only bool transport values and preserves failed update state", /** Native extraction behavior through existing browser scalar transport. @returns Nothing. */ () => {
  const value = new SfxBoolItem(7, false);
  expect(value.PutValue(false, 0)).toBe(true);
  expect(value.PutValue(true, 255)).toBe(true);
  expect(value.PutValue(true, 0)).toBe(true);
  for (const wrong of [undefined, null, 0, 1, "false", {}, []]) {
    expect(value.PutValue(wrong, 0)).toBe(false);
    expect(value.GetValue()).toBe(true);
  }
  expect(value.PutValue(false, 0)).toBe(true);
  expect(value.QueryValue()).toBe(false);
});
it("returns actual parameter-driven uppercase OUString values", /** Native value text is not localized presentation. @returns Nothing. */ () => {
  const item = new SfxBoolItem(1, false),
    yes = item.GetValueTextByVal(true),
    no = item.GetValueTextByVal(false);
  let a = "",
    b = "";
  for (let i = 0; i < yes.getLength(); i++) a += String.fromCharCode(yes.getStr()[i] as number);
  for (let i = 0; i < no.getLength(); i++) b += String.fromCharCode(no.getStr()[i] as number);
  expect([a, b, item.GetValue()]).toEqual(["TRUE", "FALSE", false]);
  expect(item.GetValueTextByVal(true)).not.toBe(yes);
});
