/** @fileoverview Original paragraph control item identity, concrete copies, byte semantics and signed16 alignment Any admission. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  SvxFormatSplitItem,
  SvxWidowsItem,
  SvxOrphansItem,
  SvxParaGridItem,
  SvxParaVertAlignItem,
} from "./paraitem.controls";
it("retains source concrete constructors, copy Which and distinct factory/pool defaults", /** No generic scalar item substitutes for native concrete identity. @returns Nothing. */ () => {
  const split = new SvxFormatSplitItem(true, 123),
    grid = new SvxParaGridItem(false, 124),
    widow = new SvxWidowsItem(200, 125),
    orphan = new SvxOrphansItem(257, 126),
    alignment = new SvxParaVertAlignItem(SvxParaVertAlignItem.Align.Bottom, 127);
  for (const item of [split, grid, widow, orphan, alignment]) {
    const copy = item.Clone();
    try {
      expect(copy.constructor).toBe(item.constructor);
      expect(copy.Which()).toBe(item.Which());
      expect(copy.GetValue()).toBe(item.GetValue());
      expect(copy).not.toBe(item);
    } finally {
      copy.Dispose();
      item.Dispose();
    }
  }
  for (const item of [
    SvxFormatSplitItem.CreateDefault(),
    SvxWidowsItem.CreateDefault(),
    SvxOrphansItem.CreateDefault(),
    SvxParaVertAlignItem.CreateDefault(),
  ]) {
    try {
      expect(item.Which()).toBe(0);
      expect(Number(item.GetValue())).toBe(0);
    } finally {
      item.Dispose();
    }
  }
});
it("inherits actual unsigned byte storage and original signed8 UNO projection", /** Includes narrowing and failed typed extraction with no mutation. @returns Nothing. */ () => {
  for (const Item of [SvxWidowsItem, SvxOrphansItem]) {
    const item = new Item(200, 55),
      output = new Any(),
      input = new Any([-1], "sal_Int8"),
      wrong = new Any([12], "sal_Int16");
    try {
      expect(item.GetValue()).toBe(200);
      expect(item.QueryValue(output)).toBe(true);
      const signed: [number] = [0];
      expect(output.extract(signed, "sal_Int8")).toBe(true);
      expect(signed[0]).toBe(-56);
      expect(item.PutValue(input)).toBe(true);
      expect(item.GetValue()).toBe(255);
      expect(item.PutValue(wrong)).toBe(false);
      expect(item.GetValue()).toBe(255);
    } finally {
      wrong.dispose();
      input.dispose();
      output.dispose();
      item.Dispose();
    }
  }
});
it("accepts exactly signed16 alignment values0..4 while ignoring member selectors", /** Direct ushort construction remains broader than checked PutValue, as in source. @returns Nothing. */ () => {
  const item = SvxParaVertAlignItem.CreateDefault(),
    output = new Any();
  try {
    for (const value of [0, 1, 2, 3, 4]) {
      const input = new Any([value], "sal_Int16");
      try {
        expect(item.PutValue(input, 255)).toBe(true);
        expect(item.GetValue()).toBe(value);
        expect(item.QueryValue()).toBe(value);
        expect(item.QueryValue(output, 255)).toBe(true);
        const actual: [number] = [0];
        expect(output.extract(actual, "sal_Int16")).toBe(true);
        expect(actual[0]).toBe(value);
      } finally {
        input.dispose();
      }
    }
    for (const [value, type] of [
      [-1, "sal_Int16"],
      [5, "sal_Int16"],
      [2, "sal_Int32"],
    ] as const) {
      const input = new Any([value], type);
      try {
        expect(item.PutValue(input, 0)).toBe(false);
        expect(item.GetValue()).toBe(4);
      } finally {
        input.dispose();
      }
    }
    expect(item.PutValue(2, 0)).toBe(false);
    item.SetValue(65535);
    item.QueryValue(output);
    const actual: [number] = [0];
    output.extract(actual, "sal_Int16");
    expect(actual[0]).toBe(-1);
  } finally {
    output.dispose();
    item.Dispose();
  }
});
