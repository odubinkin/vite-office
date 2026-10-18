/** @fileoverview Original SdrAngleItem units, copy/mutation and Clone through actual shared signed32 owners. */
import { expect, it } from "vitest";
import { SdrAngleItem, type Degree100 } from "../../inc/sdangitm";
import { SfxInt32Item } from "../../../svl/inc/intitem";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
it("retains signed hundredths and multiple turns without normalization", /** Exercises actual shared angle constructor/copy/accessors/Clone. @returns Nothing. */ () => {
  const hundredths: Degree100 = -4500;
  const item = new SdrAngleItem(80, hundredths);
  expect(item).toBeInstanceOf(SfxInt32Item);
  expect(item.GetValue()).toBe(-4500);
  item.SetValue(72500);
  item.SetWhich(81);
  const copy = new SdrAngleItem(item);
  const clone = item.Clone();
  expect([copy.Which(), clone.Which()]).toEqual([81, 81]);
  expect(copy.GetValue()).toBe(72500);
  expect(clone.GetValue()).toBe(72500);
  expect(copy.equals(item)).toBe(true);
  item.SetValue(-1);
  expect(copy.GetValue()).toBe(72500);
  expect(clone.GetValue()).toBe(72500);
  const input = new Any([-2147483648], "sal_Int32");
  expect(copy.PutValue(input, 0)).toBe(true);
  expect(copy.GetValue()).toBe(-2147483648);
  input.dispose();
});
