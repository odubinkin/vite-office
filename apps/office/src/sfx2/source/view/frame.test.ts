/** @fileoverview Verifies consumed frame target order and existing request item responsibilities independently of native window services. */
import { expect, it } from "vitest";
import { SfxFrame, SfxUnoAnyItem } from "./frame";
it("appends original defaults to the caller list and does not retain caller mutations", /** Empty No Target is a real original first entry. @returns Nothing. */ () => {
  const targets = ["custom"];
  SfxFrame.GetDefaultTargetList(targets);
  expect(targets).toEqual(["custom", "", "_top", "_parent", "_blank", "_self"]);
  targets.pop();
  const next: string[] = [];
  SfxFrame.GetDefaultTargetList(next);
  expect(next).toEqual(["", "_top", "_parent", "_blank", "_self"]);
});
it("retains the existing Any wrapper and always-unequal contract", /** New static frame responsibility does not replace request-item behavior. @returns Nothing. */ () => {
  const value = { native: 1 },
    item = new SfxUnoAnyItem(123, value),
    clone = item.Clone();
  expect(item.GetValue()).toBe(value);
  expect(item.QueryValue()).toBe(value);
  expect(clone).not.toBe(item);
  expect(clone.Which()).toBe(123);
  expect(clone.GetValue()).toBe(value);
  expect(item.equals(item)).toBe(false);
});
