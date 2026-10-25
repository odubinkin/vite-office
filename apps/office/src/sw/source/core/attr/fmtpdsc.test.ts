/** @fileoverview Pins represented native SwFormatPageDesc Any contracts independently of browser snapshots. */
import { expect, it } from "vitest";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import {
  MID_PAGEDESC_PAGEDESCNAME as NAME,
  MID_PAGEDESC_PAGENUMOFFSET as OFFSET,
} from "../../../inc/unomid";
import { SwFormatPageDesc } from "./fmtpdsc";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
it("projects optional unsigned16 offsets through original signed16 Any and conversion-bit mask", /** Void and explicit zero are different native values. @returns Nothing. */ () => {
  const item = new SwFormatPageDesc("Standard"),
    output = new Any();
  expect(item.QueryValue()).toBeUndefined();
  expect(item.QueryValue(output, OFFSET)).toBe(true);
  expect(output.hasValue()).toBe(false);
  for (const offset of [0, 32767, 32768, 55535, 65535]) {
    item.SetNumOffset(offset);
    expect(item.QueryValue(output, OFFSET | CONVERT_TWIPS)).toBe(true);
    const signed: [number] = [0];
    expect(output.extract(signed, "sal_Int16")).toBe(true);
    expect(signed[0]).toBe((offset << 16) >> 16);
    const copy = new SwFormatPageDesc("Standard");
    expect(copy.PutValue(output, OFFSET | CONVERT_TWIPS)).toBe(true);
    expect(copy.equals(item)).toBe(true);
    expect(copy.Clone().equals(item)).toBe(true);
  }
  expect(item.QueryValue(output, NAME)).toBe(true);
  const name = new OUString();
  expect(output.extract(name, "OUString")).toBe(true);
  expect(String.fromCharCode(...name.getStr().slice(0, name.getLength()))).toBe("Standard");
  name.dispose();
  expect(item.QueryValue(output)).toBe(true);
  expect(item.QueryValue(output, 7)).toBe(false);
  expect(output.hasValue()).toBe(true);
  expect(new SwFormatPageDesc().QueryValue(output, NAME)).toBe(true);
  expect(output.hasValue()).toBe(false);
  expect(item.PutValue(output, OFFSET)).toBe(true);
  expect(item.GetNumOffset()).toBeUndefined();
  expect(item.PutValue(new Any([false], "bool"), OFFSET)).toBe(false);
  expect(item.PutValue(new Any(), NAME)).toBe(false);
  expect(item.PutValue(new Any(), 7)).toBe(false);
  expect(item.GetPageDescName()).toBe("Standard");
  expect(item.equals(new SwFormatPageDesc())).toBe(false);
  expect(item.equals(new SfxBoolItem(item.Which(), false))).toBe(false);
});
it("retains unsigned16 constructor admission independently of a dialog widget", /** Invalid transport values cannot enter native items. @returns Nothing. */ () => {
  for (const value of [-1, 65536, 1.2, NaN])
    expect(
      /** Supplies an invalid boundary value. @returns Rejected value. */ () =>
        new SwFormatPageDesc("Standard", value),
    ).toThrow("page-number offset");
  expect(new SwFormatPageDesc("Standard", 0).GetNumOffset()).toBe(0);
});
