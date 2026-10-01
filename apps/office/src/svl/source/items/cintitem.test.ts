/** @fileoverview Verifies unsigned item defaults, source-owned subclass cloning and the explicit immutable browser value boundary. */
import { expect, it } from "vitest";
import { CntUInt16Item } from "./cintitem";
import { SfxInt16Item, SfxUInt16Item } from "./intitem";

it("owns unsigned values and preserves concrete item type through independent clones", /** Verifies native widths, constructor defaults and typed equality. @returns Nothing. */ () => {
  expect(new SfxUInt16Item().Which()).toBe(0);
  expect(new SfxUInt16Item().GetValue()).toBe(0);
  for (const value of [0, 1, 32768, 65535]) {
    const base = new CntUInt16Item(80, value),
      item = new SfxUInt16Item(80, value);
    expect(base.QueryValue()).toBe(value);
    expect(item.QueryValue()).toBe(value);
    expect(item.GetValue()).toBe(value);
    expect(base.Clone()).not.toBe(base);
    expect(base.Clone()).toBeInstanceOf(CntUInt16Item);
    expect(base.equals(base.Clone())).toBe(true);
    expect(item.Clone()).not.toBe(item);
    expect(item.Clone()).toBeInstanceOf(SfxUInt16Item);
    expect(item.equals(item.Clone())).toBe(true);
    expect(item.equals(new SfxUInt16Item(81, value))).toBe(false);
    expect(item.equals(new SfxUInt16Item(80, value === 0 ? 1 : 0))).toBe(false);
    expect(item.equals(base)).toBe(false);
    expect(base.equals(item)).toBe(false);
    expect(item.equals(new SfxInt16Item())).toBe(false);
  }
  for (const value of [-1, 65536, 0.5, NaN])
    expect(
      /** Constructs a value outside the native unsigned width. @returns Item if validation unexpectedly succeeds. */ () =>
        new SfxUInt16Item(80, value),
    ).toThrow("unsigned 16-bit");
});
