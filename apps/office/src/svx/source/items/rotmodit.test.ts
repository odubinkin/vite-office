/** @fileoverview Verifies actual rotate-mode values and original reset-on-failed-extraction success. */
import { expect, it } from "vitest";
import { SvxRotateMode as M, SvxRotateModeItem as Item } from "../../inc/rotmodit";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
it("preserves default/copy/Clone and all native int32 output mappings", /** Uses real shared enum/Any owners. @returns Nothing. */ () => {
  const d = Item.CreateDefault();
  expect([d.Which(), d.GetValue()]).toEqual([0, M.SVX_ROTATE_MODE_STANDARD]);
  const out = new Any(true);
  for (const mode of [
    M.SVX_ROTATE_MODE_STANDARD,
    M.SVX_ROTATE_MODE_TOP,
    M.SVX_ROTATE_MODE_CENTER,
    M.SVX_ROTATE_MODE_BOTTOM,
  ]) {
    const item = new Item(mode, 136);
    const copy = new Item(item);
    const clone = item.Clone();
    expect([copy.Which(), clone.Which(), copy.GetValue(), clone.GetValue()]).toEqual([
      136,
      136,
      mode,
      mode,
    ]);
    expect(item.QueryValue()).toBe(mode);
    expect(item.QueryValue(out)).toBe(true);
    expect(item.QueryValue(out, 255)).toBe(true);
    const result: [number] = [9];
    expect(out.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(mode);
    item.SetValue(M.SVX_ROTATE_MODE_STANDARD);
    expect(copy.GetValue()).toBe(mode);
  }
  out.dispose();
});
it("returns true and resets Standard on invalid input or unknown mapping", /** Preserves the native failure quirk without adding rejection. @returns Nothing. */ () => {
  const item = new Item(M.SVX_ROTATE_MODE_BOTTOM, 136);
  for (const input of [0, 1, 2, 3, 99]) {
    const a = new Any([input], "sal_Int32");
    expect(item.PutValue(a)).toBe(true);
    expect(item.GetValue()).toBe(input < 4 ? input : 0);
    a.dispose();
    expect(item.PutValue(input, 255)).toBe(true);
    expect(item.GetValue()).toBe(input < 4 ? input : 0);
  }
  const bad = new Any(true);
  item.SetValue(M.SVX_ROTATE_MODE_BOTTOM);
  expect(item.PutValue(bad)).toBe(true);
  expect(item.GetValue()).toBe(0);
  bad.dispose();
  for (const input of [null, true, "1", NaN, 1.5, -2147483649, 2147483648]) {
    item.SetValue(M.SVX_ROTATE_MODE_BOTTOM);
    expect(item.PutValue(input)).toBe(true);
    expect(item.GetValue()).toBe(0);
  }
});
