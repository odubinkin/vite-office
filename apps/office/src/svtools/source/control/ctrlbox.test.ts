/** @fileoverview Verifies native component rounding and fixed/variable width inference independently. */
import { expect, it } from "vitest";
import { BorderWidthImpl, BorderWidthImplFlags } from "./ctrlbox";

it("keeps source fixed components, tiny-line minimum and two-twip double gap", /** Checks literal native arithmetic. @returns Nothing. */ () => {
  const empty = new BorderWidthImpl();
  expect(empty.IsEmpty()).toBe(true);
  expect(empty.IsDouble()).toBe(false);
  expect([empty.GetLine1(90), empty.GetLine2(90), empty.GetGap(90)]).toEqual([0, 0, 0]);
  const fixed = new BorderWidthImpl(BorderWidthImplFlags.FIXED, 1.7, 2.7, 3.7);
  expect([fixed.GetLine1(90), fixed.GetLine2(90), fixed.GetGap(90)]).toEqual([1, 2, 3]);
  const double = new BorderWidthImpl(7, 1 / 3, 1 / 3, 1 / 3);
  expect([double.GetLine1(1), double.GetLine2(1), double.GetGap(1)]).toEqual([1, 0, 2]);
  expect([double.GetLine1(0), double.GetLine2(0), double.GetGap(0)]).toEqual([0, 0, 2]);
  const asymmetric = new BorderWidthImpl(1, 1, 15, 15);
  expect([asymmetric.GetLine1(90), asymmetric.GetLine2(90), asymmetric.GetGap(90)]).toEqual([
    60, 15, 15,
  ]);
  expect(asymmetric.GetLine1(10)).toBe(1);
  expect(new BorderWidthImpl(2, 15, 1, 15).GetLine2(10)).toBe(0);
  expect(new BorderWidthImpl(4, 10, 10, 1).GetGap(10)).toBe(2);
});
it("infers only matching native variable ratios and fixed widths", /** Checks independently chosen success and failure triples. @returns Nothing. */ () => {
  expect(new BorderWidthImpl(7, 1 / 3, 1 / 3, 1 / 3).GuessWidth(20, 20, 20)).toBe(60);
  expect(new BorderWidthImpl(7, 1 / 3, 1 / 3, 1 / 3).GuessWidth(20, 21, 20)).toBe(0);
  expect(new BorderWidthImpl(1, 1, 15, 15).GuessWidth(60, 15, 15)).toBe(90);
  expect(new BorderWidthImpl(1, 1, 15, 15).GuessWidth(60, 14, 15)).toBe(0);
  expect(new BorderWidthImpl(1, 1, 15, 15).GuessWidth(60, 15, 14)).toBe(0);
  expect(new BorderWidthImpl(4, 10, 10, 1).GuessWidth(9, 10, 20)).toBe(0);
  expect(new BorderWidthImpl(0, 10, 10, 2).GuessWidth(10, 10, 2)).toBe(0);
  expect(new BorderWidthImpl(1, 1, 0, 0).GuessWidth(20, 0, 0)).toBe(20);
  expect(new BorderWidthImpl(7, 0.5, 0.5, 0).GuessWidth(1, 1, 1)).toBe(3);
});
it("copies and compares all native width parameters", /** Checks complete value ownership. @returns Nothing. */ () => {
  const item = new BorderWidthImpl(7, 0.2, 0.3, 0.5),
    copy = item.Clone();
  expect(copy).not.toBe(item);
  expect(copy.equals(item)).toBe(true);
  expect(copy.toJSON()).toEqual([7, 0.2, 0.3, 0.5]);
  for (const other of [
    new BorderWidthImpl(1, 0.2, 0.3, 0.5),
    new BorderWidthImpl(7, 0.1, 0.3, 0.5),
    new BorderWidthImpl(7, 0.2, 0.4, 0.5),
    new BorderWidthImpl(7, 0.2, 0.3, 0.6),
  ])
    expect(copy.equals(other)).toBe(false);
});
