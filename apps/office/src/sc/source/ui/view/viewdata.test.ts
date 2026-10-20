/** @fileoverview Native cursor ownership and selection independence on real Calc document/sheet/mark owners. */
import { expect, it } from "vitest";
import { ScViewData, ScSplitPos } from "../inc/viewdata";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange, MAXTAB } from "../../../inc/address";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
it("retains native per-sheet cursor state and the actual document/selection owners", /** Uses source inline accessors, lazy tab data and old-cursor transitions. @returns Nothing. */ () => {
  const document = new ScDocument();
  document.InsertTab(0, unicode("Sheet1"));
  document.InsertTab(1, unicode("Sheet2"));
  document.InsertTab(2, unicode("Sheet3"));
  const view = new ScViewData(document),
    marks = view.GetMarkData();
  expect(view.GetDocument()).toBe(document);
  expect(view.GetMarkData()).toBe(marks);
  expect(view.GetTabNumber()).toBe(0);
  expect(view.GetActivePart()).toBe(ScSplitPos.SC_SPLIT_BOTTOMLEFT);
  expect(view.GetCurX()).toBe(0);
  expect(view.GetCurY()).toBe(0);
  expect(marks.GetSelectedTabs()).toEqual(new Set([0]));
  view.SetCurX(3);
  view.SetCurY(7);
  expect(view.GetOldCurX()).toBe(3);
  expect(view.GetOldCurY()).toBe(7);
  view.SetOldCursor(1, 2);
  view.SetCurX(4);
  view.SetCurY(8);
  expect(view.GetOldCurX()).toBe(1);
  expect(view.GetOldCurY()).toBe(2);
  marks.SetMarkArea(new ScRange(1, 2, 0, 4, 8, 0));
  view.SetTabNo(2);
  expect(view.GetCurX()).toBe(0);
  expect(view.GetCurY()).toBe(0);
  expect(marks.GetSelectedTabs()).toEqual(new Set([0]));
  expect(marks.GetMarkArea().aEnd.Row()).toBe(8);
  view.SetCurX(12);
  view.SetCurY(15);
  view.SetCurXForTab(5, 0);
  view.SetCurYForTab(9, 0);
  expect(view.GetCurXForTab(0)).toBe(5);
  expect(view.GetCurYForTab(0)).toBe(9);
  view.SetTabNo(0);
  expect(view.GetCurX()).toBe(5);
  expect(view.GetCurY()).toBe(9);
  expect(view.GetOldCurX()).toBe(1);
  expect(view.GetOldCurY()).toBe(2);
  view.ResetOldCursor();
  expect(view.GetOldCurX()).toBe(5);
  expect(view.GetOldCurY()).toBe(9);
  view.SetTabNo(2);
  expect(view.GetCurX()).toBe(12);
  expect(view.GetCurY()).toBe(15);
  view.SetTabNo(2);
  expect(view.GetCurX()).toBe(12);
  for (const absent of [-1, 1, 3, MAXTAB + 1]) {
    expect(view.GetCurXForTab(absent)).toBe(-1);
    expect(view.GetCurYForTab(absent)).toBe(-1);
    view.SetCurXForTab(10, absent);
    view.SetCurYForTab(20, absent);
    expect(view.GetCurXForTab(absent)).toBe(-1);
    expect(view.GetCurYForTab(absent)).toBe(-1);
  }
  for (const invalid of [-1, MAXTAB + 1]) {
    view.SetTabNo(invalid);
    expect(view.GetTabNumber()).toBe(2);
  }
  view.SetTabNo(1);
  expect(view.GetCurX()).toBe(0);
  marks.SelectOneTable(1);
  expect(view.GetTabNumber()).toBe(1);
  document.SetValue(new ScAddress(0, 0, 1), 42);
  expect(view.GetDocument().GetValue(new ScAddress(0, 0, 1))).toBe(42);
  const independent = new ScViewData(document);
  expect(independent.GetMarkData()).not.toBe(marks);
  expect(independent.GetTabNumber()).toBe(0);
  expect(independent.GetCurX()).toBe(0);
});
