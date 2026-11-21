/** @fileoverview Native paragraph line-number item and signed UNO member conversion. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS } from "../../svl/inc/poolitem";
import { SwFormatLineNumber } from "./fmtline";
import { MID_LINENUMBER_COUNT, MID_LINENUMBER_STARTVALUE } from "./unomid";

it("clones the two native members and narrows signed start values to 24 bits", /** Tests member-specific conversion without mutating the source item. @returns Nothing. */ () => {
  const original = new SwFormatLineNumber();
  const copy = original.Clone();
  expect(copy.equals(original)).toBe(true);
  const initial = new Any([-1], "sal_Int32");
  const disabled = new Any([false], "bool");
  const result = new Any();
  try {
    expect(copy.PutValue(initial, CONVERT_TWIPS | MID_LINENUMBER_STARTVALUE)).toBe(true);
    expect(copy.PutValue(disabled, MID_LINENUMBER_COUNT)).toBe(true);
    expect(copy.PutValue(disabled, MID_LINENUMBER_STARTVALUE)).toBe(false);
    expect(copy.QueryValue(result, MID_LINENUMBER_STARTVALUE)).toBe(true);
    const start: [number] = [0];
    expect(result.extract(start, "sal_Int32")).toBe(true);
    expect(start[0]).toBe(0xffffff);
    expect(copy.IsCount()).toBe(false);
    expect(copy.equals(original)).toBe(false);
    expect(original.GetStartValue()).toBe(0);
    expect(original.IsCount()).toBe(true);
  } finally {
    initial.dispose();
    disabled.dispose();
    result.dispose();
  }
});
