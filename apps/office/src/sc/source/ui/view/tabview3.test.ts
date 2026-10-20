/** @fileoverview Source ScTabView sheet grouping,per-sheet cursors and native wrap default on actual Calc owners. */
import { expect, it } from "vitest";
import { ScTabView } from "../inc/tabview";
import { ScViewData } from "../inc/viewdata";
import { ScDocument } from "../../../inc/document";
import { ScRange, MAXTAB } from "../../../inc/address";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Builds real visible sheets and the shared view/mark owners. @param count - Sheet count. @returns Owners. */
function fixture(count = 3) {
  const doc = new ScDocument();
  for (let i = 0; i < count; i++) {
    const name = unicode(`Sheet${i + 1}`);
    doc.InsertTab(i, name);
    name.dispose();
  }
  const data = new ScViewData(doc),
    view = new ScTabView(data);
  return { doc, data, view, marks: data.GetMarkData() };
}
it("uses Calc.xcs wrap=true and preserves independent sheet cursors", /** Source SelectNextTab,SetTabNo and old cursor rules. @returns Nothing. */ () => {
  const { data, view, marks } = fixture();
  data.SetCurX(4);
  data.SetCurY(7);
  marks.SetMarkArea(new ScRange(1, 2, 0, 3, 4, 0));
  view.SelectNextTab(-1);
  expect(data.GetTabNumber()).toBe(2);
  expect(marks.IsMarked()).toBe(false);
  expect(data.GetCurX()).toBe(0);
  data.SetCurX(6);
  data.SetCurY(8);
  data.SetOldCursor(1, 2);
  view.SelectNextTab(1);
  expect(data.GetTabNumber()).toBe(0);
  expect([data.GetCurX(), data.GetCurY()]).toEqual([4, 7]);
  view.SelectNextTab(1);
  expect(data.GetTabNumber()).toBe(1);
  view.SelectNextTab(1);
  expect([data.GetCurX(), data.GetCurY()]).toEqual([6, 8]);
  expect(data.GetOldCurX()).toBe(6);
  view.SelectNextTab(0);
  expect(data.GetTabNumber()).toBe(2);
  new ScTabView(data, false).SelectNextTab(1);
  expect(data.GetTabNumber()).toBe(2);
  view.SetTabNo(0);
  new ScTabView(data, false).SelectNextTab(-1);
  expect(data.GetTabNumber()).toBe(0);
  for (const tab of [-1, MAXTAB + 1, 3]) view.SetTabNo(tab);
  expect(data.GetTabNumber()).toBe(0);
  view.SetTabNo(0);
  expect(data.GetTabNumber()).toBe(0);
  const single = fixture(1);
  single.view.SelectNextTab(1);
  single.view.SelectNextTab(-1);
  single.view.SelectAllTables();
  expect([...single.marks.GetSelectedTabs()]).toEqual([0]);
});
it("retains a partial group when entering a selected sheet and collapses an all-sheet group", /** Mirrors native SetTabNo loop and bNew override. @returns Nothing. */ () => {
  const { data, view, marks } = fixture();
  view.SelectNextTab(1, true);
  expect([...marks.GetSelectedTabs()]).toEqual([0, 1]);
  view.SetTabNo(0);
  expect([...marks.GetSelectedTabs()]).toEqual([0, 1]);
  view.SelectNextTab(-1, true);
  expect([...marks.GetSelectedTabs()]).toEqual([0, 1, 2]);
  expect(data.GetTabNumber()).toBe(2);
  view.SetTabNo(1);
  expect([...marks.GetSelectedTabs()]).toEqual([1]);
  view.SelectAllTables();
  marks.SetMarkArea(new ScRange(2, 3, 1, 4, 5, 1));
  view.SetTabNo(1);
  expect(marks.IsMarked()).toBe(true);
  view.SetTabNo(1, true);
  expect([...marks.GetSelectedTabs()]).toEqual([0, 1, 2]);
  expect(marks.IsMarked()).toBe(false);
  view.DeselectAllTables();
  expect([...marks.GetSelectedTabs()]).toEqual([1]);
  view.SetTabNo(2);
  expect([...marks.GetSelectedTabs()]).toEqual([2]);
});
it("expands normal simple marks to full rows and columns without moving the cursor or changing sheet membership", /** Source no-argument MarkRows/MarkColumns preserve current axis endpoints and selected sheet owners. @returns Nothing. */ () => {
  const { doc, data, view, marks } = fixture();
  data.SetCurX(4);
  data.SetCurY(7);
  marks.SelectTable(1, true);
  view.MarkRows();
  expect(marks.GetMarkArea()).toEqual(new ScRange(0, 7, 0, doc.MaxCol(), 7, 0));
  marks.ResetMark();
  view.MarkColumns();
  expect(marks.GetMarkArea()).toEqual(new ScRange(4, 0, 0, 4, doc.MaxRow(), 0));
  marks.SetMarkArea(new ScRange(2, 3, 0, 6, 9, 0));
  view.MarkRows();
  expect(marks.GetMarkArea()).toEqual(new ScRange(0, 3, 0, doc.MaxCol(), 9, 0));
  marks.SetMarkArea(new ScRange(2, 3, 0, 6, 9, 0));
  view.MarkColumns();
  expect(marks.GetMarkArea()).toEqual(new ScRange(2, 0, 0, 6, doc.MaxRow(), 0));
  expect([data.GetCurX(), data.GetCurY()]).toEqual([4, 7]);
  expect([...marks.GetSelectedTabs()]).toEqual([0, 1]);
});
it("reverses vertical hidden cursor movement at both boundaries and retains old cursor for an entirely hidden sheet", /** reverses vertical hidden cursor movement at both boundaries and retains old cursor for an entirely hidden sheet. @returns Observed test result. */ () => {
  const { doc, view } = fixture(1);
  doc.SetRowHidden(0, 0, 0, true);
  expect(view.SkipCursorVertical(0, 2, -1)).toBe(1);
  doc.SetRowHidden(doc.MaxRow(), doc.MaxRow(), 0, true);
  expect(view.SkipCursorVertical(doc.MaxRow(), 2, 1)).toBe(doc.MaxRow() - 1);
  // A small actual document domain exercises both boundary reversals without a million-row traversal.
  const maximum = doc.MaxRow();
  doc.SetRowHidden(0, maximum, 0, true);
  expect(view.SkipCursorVertical(0, 7, -1)).toBe(7);
  doc.DisposeAttributes();
  doc.GetSharedStringPool().dispose();
});
