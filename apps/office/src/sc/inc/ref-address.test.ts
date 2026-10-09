/** @fileoverview Native initialized ScRefAddress value and flag contracts from sc/inc/address.hxx. */
import { describe, expect, it } from "vitest";
import { ScAddress, ScRefAddress } from "./address";

/** Reads all relative flags in native column/row/sheet order. @param reference - Reference owner. @returns Flag tuple. */
function flags(reference: ScRefAddress): [boolean, boolean, boolean] {
  return [reference.IsRelCol(), reference.IsRelRow(), reference.IsRelTab()];
}
/** Converts a test mask to the three independent native flags. @param mask - Three-bit mask. @returns Flag tuple. */
function maskFlags(mask: number): [boolean, boolean, boolean] {
  return [(mask & 1) !== 0, (mask & 2) !== 0, (mask & 4) !== 0];
}

describe("Calc native reference address", /** Verifies source-owned reference behavior. @returns Nothing. */ () => {
  it("retains zero defaults and native signed coordinate widths", /** Checks native construction. @returns Nothing. */ () => {
    const zero = new ScRefAddress();
    expect([zero.Col(), zero.Row(), zero.Tab()]).toEqual([0, 0, 0]);
    expect(flags(zero)).toEqual([false, false, false]);
    const explicit = new ScRefAddress(65535, 0x80000000, 65536);
    expect([explicit.Col(), explicit.Row(), explicit.Tab()]).toEqual([-1, -2147483648, 0]);
    expect(flags(explicit)).toEqual([false, false, false]);
    expect(zero.GetAddress()).toBe(zero.GetAddress());
  });

  it("copies values independently while assignment retains the recipient address", /** Checks both native value operations and self-assignment. @returns Nothing. */ () => {
    const original = new ScRefAddress(2, 3, 4);
    original.SetRelCol(true);
    original.SetRelTab(true);
    const copy = new ScRefAddress(original);
    expect(copy.equals(original)).toBe(true);
    expect(copy.GetAddress()).not.toBe(original.GetAddress());
    const destination = new ScRefAddress();
    const owned = destination.GetAddress();
    expect(destination.assign(original)).toBe(destination);
    expect(destination.GetAddress()).toBe(owned);
    expect(destination.equals(original)).toBe(true);
    expect(destination.assign(destination)).toBe(destination);
    expect(destination.equals(original)).toBe(true);
    original.Set(7, 8, 9, false, true, false);
    expect([copy.Col(), copy.Row(), copy.Tab()]).toEqual([2, 3, 4]);
    expect(flags(copy)).toEqual([true, false, true]);
    expect([destination.Col(), destination.Row(), destination.Tab()]).toEqual([2, 3, 4]);
    expect(flags(destination)).toEqual([true, false, true]);
  });

  it("preserves every flag combination through both Set overloads and compares each flag", /** Verifies literal independent flag combinations. @returns Nothing. */ () => {
    const source = new ScAddress(5, 6, 7);
    for (let mask = 0; mask < 8; mask++) {
      const ref = new ScRefAddress();
      const owner = ref.GetAddress();
      ref.Set(source, ...maskFlags(mask));
      expect(ref.GetAddress()).toBe(owner);
      expect(ref.GetAddress()).not.toBe(source);
      expect([ref.Col(), ref.Row(), ref.Tab()]).toEqual([5, 6, 7]);
      expect(flags(ref)).toEqual(maskFlags(mask));
      const copy = new ScRefAddress(ref);
      expect(copy.equals(ref)).toBe(true);
      const assigned = new ScRefAddress().assign(ref);
      expect(assigned.equals(ref)).toBe(true);
      for (let otherMask = 0; otherMask < 8; otherMask++) {
        const other = new ScRefAddress();
        other.Set(5, 6, 7, ...maskFlags(otherMask));
        expect(ref.equals(other)).toBe(mask === otherMask);
      }
      const different = new ScRefAddress(5, 6, 8);
      different.SetRelCol(maskFlags(mask)[0]);
      different.SetRelRow(maskFlags(mask)[1]);
      different.SetRelTab(maskFlags(mask)[2]);
      expect(ref.equals(different)).toBe(false);
      ref.Set(65535, 0x80000000, 65536, ...maskFlags(7 - mask));
      expect(ref.GetAddress()).toBe(owner);
      expect([ref.Col(), ref.Row(), ref.Tab()]).toEqual([-1, -2147483648, 0]);
      expect(flags(ref)).toEqual(maskFlags(7 - mask));
    }
  });

  it("changes relativity without changing address coordinates or other flags", /** Checks individual flag setters and address copying. @returns Nothing. */ () => {
    const reference = new ScRefAddress(2, 3, 4);
    reference.SetRelCol(true);
    expect(flags(reference)).toEqual([true, false, false]);
    reference.SetRelRow(true);
    expect(flags(reference)).toEqual([true, true, false]);
    reference.SetRelTab(true);
    expect(flags(reference)).toEqual([true, true, true]);
    reference.SetRelCol(false);
    expect(flags(reference)).toEqual([false, true, true]);
    reference.SetRelRow(false);
    expect(flags(reference)).toEqual([false, false, true]);
    reference.SetRelTab(false);
    expect(flags(reference)).toEqual([false, false, false]);
    expect([reference.Col(), reference.Row(), reference.Tab()]).toEqual([2, 3, 4]);
    const source = new ScAddress(7, 8, 9);
    reference.Set(source, true, false, true);
    source.SetInvalid();
    expect([reference.Col(), reference.Row(), reference.Tab()]).toEqual([7, 8, 9]);
    expect(flags(reference)).toEqual([true, false, true]);
  });
});
