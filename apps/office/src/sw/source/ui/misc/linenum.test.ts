/** @fileoverview Pins represented native line-number dialog bounds,sensitivity,retained drafts and acceptance. */
import { expect, it } from "vitest";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { SwLineNumberingDlg } from "./linenum";
it("mirrors source sensitivity and preserves disabled entry values", /** Whitespace is a nonempty source separator. @returns Nothing. */ () => {
  const page = new SwLineNumberingDlg(new SwLineNumberInfo().QueryValue());
  expect(page.LineOnOffHdl()).toBe(false);
  expect(page.ModifyHdl()).toBe(false);
  page.SetValue({ paintLineNumbers: true });
  expect(page.LineOnOffHdl()).toBe(true);
  expect(page.ModifyHdl()).toBe(false);
  page.SetValue({ divider: " ", dividerCountBy: 0 });
  expect(page.ModifyHdl()).toBe(true);
  page.SetValue({ paintLineNumbers: false });
  expect(page.ModifyHdl()).toBe(false);
  expect(page.QueryValue().dividerCountBy).toBe(0);
  page.SetValue({ paintLineNumbers: true });
  expect(page.ModifyHdl()).toBe(true);
  const copy = page.QueryValue();
  expect(copy).not.toBe(page.QueryValue());
  expect(page.OKHdl()).toMatchObject({ divider: " ", dividerCountBy: 0 });
});
it("loads sentinel offset,clamps native controls and narrows accepted physical values", /** Native core imported values can exceed widget limits. @returns Nothing. */ () => {
  const page = new SwLineNumberingDlg({
    ...new SwLineNumberInfo().QueryValue(),
    posFromLeft: 65535,
    countBy: 0,
    dividerCountBy: 65535,
  });
  expect(page.QueryValue()).toMatchObject({ posFromLeft: 0, countBy: 1, dividerCountBy: 1000 });
  page.SetValue({ countBy: 2000, dividerCountBy: -1, posFromLeft: 65537 });
  expect(page.OKHdl()).toMatchObject({ countBy: 1000, dividerCountBy: 0, posFromLeft: 1 });
  page.SetValue({ countBy: 2.6, dividerCountBy: 3.6, posFromLeft: -1 });
  expect(page.OKHdl()).toMatchObject({ countBy: 3, dividerCountBy: 4, posFromLeft: 0 });
});
