/** @fileoverview Verifies pinned original horizontal orientation defaults, independent ownership and strict UNO member contracts. */
import { expect, it } from "vitest";
import { SwFormatHoriOrient, SwFormatVertOrient } from "./fmtornt";
import { HoriOrientation } from "../../offapi/com/sun/star/text/HoriOrientation";
import { RelOrientation } from "../../offapi/com/sun/star/text/RelOrientation";
import { RES_HORI_ORIENT } from "./hintids";
it("native horizontal defaults and four independent cloned fields", /** Checks original fields and mutation ownership. @returns Nothing. */ () => {
  const item = new SwFormatHoriOrient();
  expect([
    item.Which(),
    item.GetPos(),
    item.GetHoriOrient(),
    item.GetRelationOrient(),
    item.IsPosToggle(),
  ]).toEqual([RES_HORI_ORIENT, 0, HoriOrientation.NONE, RelOrientation.PRINT_AREA, false]);
  item.SetPos(41);
  item.SetHoriOrient(HoriOrientation.RIGHT);
  item.SetRelationOrient(RelOrientation.PAGE_FRAME);
  item.SetPosToggle(true);
  const clone = item.Clone();
  expect(clone).not.toBe(item);
  expect(clone.equals(item)).toBe(true);
  expect(clone.equals(new SwFormatVertOrient())).toBe(false);
  for (const other of [
    new SwFormatHoriOrient(42, 1, 7, true),
    new SwFormatHoriOrient(41, 2, 7, true),
    new SwFormatHoriOrient(41, 1, 8, true),
    new SwFormatHoriOrient(41, 1, 7, false),
  ])
    expect(clone.equals(other)).toBe(false);
  clone.SetWhich(111);
  expect(item.equals(clone)).toBe(false);
  expect(item.GetPos()).toBe(41);
});
it.each([
  [-72, -127],
  [-1, -2],
  [0, 0],
  [1, 2],
  [72, 127],
])(
  "native horizontal query always converts position %i",
  /** Checks both conversion flag states. @param twips - Original position. @param mm100 - Native rounded value. @returns Nothing. */ (
    twips,
    mm100,
  ) => {
    const item = new SwFormatHoriOrient(twips, 3, 7, true);
    expect([
      item.QueryValue(),
      item.QueryValue(1),
      item.QueryValue(2),
      item.QueryValue(0x82),
      item.QueryValue(3),
      item.QueryValue(4),
    ]).toEqual([3, 7, mm100, mm100, true, undefined]);
  },
);
it.each([-32768, 32767, 65535, -32769, 1.5, "3", false, NaN])(
  "native horizontal int16 extraction %s",
  /** Checks signed orientation/relation extraction defaults. @param value - UNO input. @returns Nothing. */ (
    value,
  ) => {
    const item = new SwFormatHoriOrient();
    const valid =
      typeof value === "number" && Number.isInteger(value) && value >= -32768 && value <= 32767;
    expect(item.PutValue(value, 0)).toBe(true);
    expect(item.GetHoriOrient()).toBe(valid ? value : HoriOrientation.NONE);
    expect(item.PutValue(value, 1)).toBe(true);
    expect(item.GetRelationOrient()).toBe(valid ? value : RelOrientation.FRAME);
  },
);
it.each([
  [-127, -72],
  [0, 0],
  [127, 72],
])(
  "native converted horizontal position %i",
  /** Checks authoring conversion and unconverted position. @param mm100 - UNO position. @param twips - Native position. @returns Nothing. */ (
    mm100,
    twips,
  ) => {
    const item = new SwFormatHoriOrient();
    expect(item.PutValue(mm100, 0x82)).toBe(true);
    expect(item.GetPos()).toBe(twips);
    expect(item.PutValue(mm100, 2)).toBe(true);
    expect(item.GetPos()).toBe(mm100);
  },
);
it.each(["1", 1.5, 2147483648, -2147483649])(
  "native invalid position reports failure and resets %s",
  /** Checks failed native int32 extraction. @param value - Invalid UNO position. @returns Nothing. */ (
    value,
  ) => {
    const item = new SwFormatHoriOrient(41);
    expect(item.PutValue(value, 0x82)).toBe(false);
    expect(item.GetPos()).toBe(0);
  },
);
it("native page toggle and unsupported members", /** Checks original boolean member and support rejection. @returns Nothing. */ () => {
  const item = new SwFormatHoriOrient();
  expect(item.PutValue(true, 3)).toBe(true);
  expect(item.IsPosToggle()).toBe(true);
  expect(item.PutValue(false, 0x83)).toBe(true);
  expect(item.IsPosToggle()).toBe(false);
  expect(
    /** Rejects a non-boolean native toggle. @returns Extraction attempt. */ () =>
      item.PutValue(1, 3),
  ).toThrow(TypeError);
  expect(item.PutValue(1, 4)).toBe(false);
});
