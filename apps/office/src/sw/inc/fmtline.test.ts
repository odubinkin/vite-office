/** @fileoverview Native line-number members and compatibility with older boolean Worker items. */
import { expect, it } from "vitest";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { CONVERT_TWIPS } from "../../svl/inc/poolitem";
import { decodeSfxPoolItem, encodeSfxPoolItem } from "../browser/filter/xml/item-codec";
import { SwDoc } from "../source/core/doc/doc";
import { SwFormatLineNumber } from "./fmtline";
import { RES_LINENUMBER } from "./hintids";
import { MID_LINENUMBER_COUNT, MID_LINENUMBER_STARTVALUE } from "./unomid";

it("uses independent native Any members and a 24-bit start", /** Matches the original line-number item contract. @returns Nothing. */ () => {
  const item = new SwFormatLineNumber();
  const start = new Any([-1], "sal_Int32");
  const count = new Any([false], "bool");
  const output = new Any();
  try {
    expect(item.QueryValue()).toEqual({ count: true, startValue: 0 });
    expect(item.PutValue(start, MID_LINENUMBER_STARTVALUE | CONVERT_TWIPS)).toBe(true);
    expect(item.PutValue(count, MID_LINENUMBER_COUNT)).toBe(true);
    expect(item.QueryValue(output, MID_LINENUMBER_STARTVALUE)).toBe(true);
    const result: [number] = [0];
    expect(output.extract(result, "sal_Int32")).toBe(true);
    expect(result[0]).toBe(0xffffff);
    expect(item.IsCount()).toBe(false);
    const clone = item.Clone();
    expect(clone.equals(item)).toBe(true);
    clone.SetStartValue(0);
    expect(clone.equals(item)).toBe(false);
    expect(item.PutValue(count, MID_LINENUMBER_STARTVALUE)).toBe(false);
  } finally {
    start.dispose();
    count.dispose();
    output.dispose();
  }
});

it("restores legacy boolean snapshots with continuation and roundtrips the new compound value", /** Exercises the real Writer Worker item factory and codec. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const pool = doc.GetAttrPool();
    expect(decodeSfxPoolItem(pool, { which: RES_LINENUMBER, value: false }).QueryValue()).toEqual({
      count: false,
      startValue: 0,
    });
    const snapshot = encodeSfxPoolItem(new SwFormatLineNumber(false, 20));
    expect(decodeSfxPoolItem(pool, snapshot).QueryValue()).toEqual({
      count: false,
      startValue: 20,
    });
  } finally {
    doc.Dispose();
  }
});
