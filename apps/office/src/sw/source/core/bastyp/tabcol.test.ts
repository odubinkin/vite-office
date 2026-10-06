/** @fileoverview Verifies literal SwTabCols defaults, copied entries and native mutation without upstream execution. */
import { it, expect } from "vitest";
import { SwTabCols } from "./tabcol";
it("preserves native edge defaults, reserve semantics and independent copy/assignment", /** Checks native mutable carrier ownership. @returns Nothing. */ () => {
  const value = new SwTabCols(),
    reserved = new SwTabCols(12);
  expect([
    value.Count(),
    value.GetLeftMin(),
    value.GetLeft(),
    value.GetRight(),
    value.GetRightMax(),
  ]).toEqual([0, 0, 0, 0, 0]);
  expect(reserved.Count()).toBe(0);
  expect(value.IsLastRowAllowedToChange()).toBe(true);
  value.SetLeftMin(70);
  value.SetLeft(100);
  value.SetRight(700);
  value.SetRightMax(900);
  value.SetLastRowAllowedToChange(false);
  value.Insert(300, true, 0);
  value.Insert(500, 400, 600, false, 1);
  expect(value.GetEntry(0)).toEqual({
    nPos: 300,
    nMin: 0,
    nMax: Number(0x7fffffffffffffffn),
    bHidden: true,
  });
  expect(value.GetEntry(1)).toEqual({ nPos: 500, nMin: 400, nMax: 600, bHidden: false });
  const copied = new SwTabCols(value),
    assigned = new SwTabCols();
  expect(assigned.Assign(value)).toBe(assigned);
  value.SetHidden(0, false);
  value.GetEntry(1).nPos = 550;
  for (const result of [copied, assigned]) {
    expect([
      result.GetLeftMin(),
      result.GetLeft(),
      result.GetRight(),
      result.GetRightMax(),
      result.IsLastRowAllowedToChange(),
    ]).toEqual([70, 100, 700, 900, false]);
    expect(result.IsHidden(0)).toBe(true);
    expect(result.GetEntry(1).nPos).toBe(500);
    result.Remove(0);
    expect(result.Count()).toBe(1);
    result.Insert(450, false, 0);
    result.Remove(0, 2);
    expect(result.Count()).toBe(0);
  }
  expect(value.Count()).toBe(2);
  value.Assign(value);
  expect(value.Count()).toBe(2);
  expect(value.IsHidden(0)).toBe(false);
});
