/** @fileoverview Checks native ruler item literal contracts without loading upstream. */
import { expect, it } from "vitest";
import { INVALID_POOL_ITEM } from "../../../svl/source/items/poolitem";
import { SvxColumnDescription, SvxColumnItem } from "./rulritem";

it("native descriptions preserve signed width and cap only upper end limits", /** Checks literal native constructors. @returns Nothing. */ () => {
  const simple = new SvxColumnDescription(10, 5, false),
    constrained = new SvxColumnDescription(10, 30, -100, 100000, true);
  expect(simple).toEqual({ nStart: 10, nEnd: 5, bVisible: false, nEndMin: 0, nEndMax: 0 });
  expect(simple.GetWidth()).toBe(-5);
  expect(constrained).toEqual({
    nStart: 10,
    nEnd: 30,
    bVisible: true,
    nEndMin: -100,
    nEndMax: 65535,
  });
  expect(new SvxColumnDescription(0, 10, 100000, 100001, true).nEndMin).toBe(65535);
  for (const [field, value] of [
    ["nStart", 1],
    ["nEnd", 2],
    ["bVisible", true],
    ["nEndMin", 3],
    ["nEndMax", 4],
  ] as const) {
    const changed = Object.assign(new SvxColumnDescription(10, 5, false), { [field]: value });
    expect(simple.equals(changed)).toBe(false);
  }
  expect(simple.equals(new SvxColumnDescription(10, 5, false))).toBe(true);
});
it("native item defaults and active consistency are independent of geometry", /** Checks source defaults and active arithmetic. @returns Nothing. */ () => {
  const empty = new SvxColumnItem(),
    table = new SvxColumnItem(1, 20, 30);
  expect(empty.Which()).toBe(10080);
  expect(empty.GetLeft()).toBe(0);
  expect(empty.GetRight()).toBe(0);
  expect(empty.GetActColumn()).toBe(0);
  expect(empty.IsTable()).toBe(false);
  expect(empty.QueryValue()).toBeUndefined();
  expect(empty.IsFirstAct()).toBe(true);
  expect(empty.IsLastAct()).toBe(false);
  expect(empty.IsConsistent()).toBe(false);
  expect(empty.CalcOrtho()).toBe(false);
  table.Append(new SvxColumnDescription(200, 100, false));
  expect(table.CalcOrtho()).toBe(false);
  expect(table.IsConsistent()).toBe(false);
  table.Append(new SvxColumnDescription(400, 300, true));
  expect(table.IsConsistent()).toBe(true);
  expect(table.IsFirstAct()).toBe(false);
  expect(table.IsLastAct()).toBe(true);
  expect(table.GetActiveColumnDescription()).toBe(table.At(1));
  expect(table.CalcOrtho()).toBe(true);
  table.At(1).nEnd++;
  expect(table.CalcOrtho()).toBe(false);
  table.Append(new SvxColumnDescription(10, 10, true));
  expect(table.IsLastAct()).toBe(false);
  expect(table.GetLeft()).toBe(20);
  expect(table.GetRight()).toBe(30);
});
it("native Append and Clone own descriptions and equality ignores ortho", /** Checks independent values, exact copy and equality fields. @returns Nothing. */ () => {
  const item = new SvxColumnItem(0, 0, 0),
    description = new SvxColumnDescription(0, 10, true);
  item.Append(description);
  description.nEnd = 50;
  expect(item.At(0).nEnd).toBe(10);
  item.At(0).nEndMax = 100000;
  item.SetWhich(10948);
  item.SetOrtho(false);
  const copy = item.Clone();
  expect(copy).not.toBe(item);
  expect(copy.At(0)).not.toBe(item.At(0));
  expect(copy.At(0).nEndMax).toBe(100000);
  expect(item.equals(copy)).toBe(true);
  copy.SetOrtho(true);
  expect(item.equals(copy)).toBe(true);
  for (const change of [
    /** Changes item identity. @param value - Independent item. @returns Nothing. */ (
      value: SvxColumnItem,
    ) => value.SetWhich(10080),
    /** Changes left distance. @param value - Independent item. @returns Nothing. */ (
      value: SvxColumnItem,
    ) => value.SetLeft(10),
    /** Changes right distance. @param value - Independent item. @returns Nothing. */ (
      value: SvxColumnItem,
    ) => value.SetRight(20),
    /** Changes column count. @param value - Independent item. @returns Nothing. */ (
      value: SvxColumnItem,
    ) => value.Append(description),
    /** Changes owned description. @param value - Independent item. @returns Nothing. */ (
      value: SvxColumnItem,
    ) => {
      value.At(0).bVisible = false;
    },
  ]) {
    const different = item.Clone();
    change(different);
    expect(item.equals(different)).toBe(false);
    expect(item.At(0).bVisible).toBe(true);
  }
  const defaultItem = new SvxColumnItem();
  expect(defaultItem.equals(defaultItem.Clone())).toBe(true);
  expect(defaultItem.equals(INVALID_POOL_ITEM)).toBe(false);
  expect(defaultItem.equals(new SvxColumnItem(1))).toBe(false);
  expect(defaultItem.equals(new SvxColumnItem(0, 0, 0))).toBe(false);
  defaultItem.SetLeft(12);
  defaultItem.SetRight(13);
  expect(defaultItem.equals(defaultItem.Clone())).toBe(true);
});
it("native uint16 construction and count retain raw vector ownership across wrap", /** Checks literal native casts without truncating actual owned descriptions. @returns Nothing. */ () => {
  const table = new SvxColumnItem(-1, -1, 65538);
  expect(table.GetActColumn()).toBe(65535);
  expect(table.GetLeft()).toBe(65535);
  expect(table.GetRight()).toBe(2);
  const item = new SvxColumnItem(),
    description = new SvxColumnDescription(0, 1, true);
  for (let i = 0; i < 65536; i++) item.Append(description);
  expect(item.Count()).toBe(0);
  expect(item.IsConsistent()).toBe(true);
  expect(item.IsLastAct()).toBe(false);
  expect(item.CalcOrtho()).toBe(false);
  item.At(65535).nEnd = 7;
  item.SetLeft(100000);
  const clone = item.Clone();
  expect(clone.GetLeft()).toBe(100000);
  expect(clone.Count()).toBe(0);
  expect(clone.At(65535).nEnd).toBe(7);
  expect(clone.At(65535)).not.toBe(item.At(65535));
  expect(new SvxColumnItem(65537).GetActColumn()).toBe(1);
});
it("native column indexing converts the argument to uint16 before accessing ownership", /** Checks the source At parameter conversion over mutable owned entries. @returns Nothing. */ () => {
  const item = new SvxColumnItem();
  item.Append(new SvxColumnDescription(0, 10, true));
  item.Append(new SvxColumnDescription(10, 20, false));
  expect(item.At(65536)).toBe(item.At(0));
  expect(item.At(65537)).toBe(item.At(1));
  expect(item.At(-65535)).toBe(item.At(1));
  item.At(65537).nEnd = 30;
  expect(item.At(1).nEnd).toBe(30);
  expect(item.At(0).nEnd).toBe(10);
});
it.each([-1, 32768, 1.5, NaN])(
  "owned item identity rejects invalid local WhichId %s",
  /** Checks the existing bounded item identity domain. @param invalid - Invalid identity. @returns Nothing. */ (
    invalid,
  ) => {
    const item = new SvxColumnItem();
    expect(
      /** Attempts invalid identity mutation. @returns Nothing. */ () => item.SetWhich(invalid),
    ).toThrow("WhichId is invalid");
    expect(item.Which()).toBe(10080);
    item.SetWhich(0);
    expect(item.Which()).toBe(0);
  },
);
