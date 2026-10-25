/** @fileoverview Availability follows the represented native AutoSum and clipboard services without changing marks or document history. */
import { expect, it } from "vitest";
import { CalcViewController } from "./calc-view-controller";
import { ScAddress, ScRange } from "../../inc/address";
it("admits empty ordinary marks and preserves native no-data no-op", /** Availability is read-only;the source command decides whether an inferred range exists. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  marks.SetMarkArea(new ScRange(0, 0, 0, 1, 1, 0));
  expect(c.CanAutoSum()).toBe(true);
  expect(c.AutoSum()).toBeUndefined();
  expect(doc.GetFormulaCell(new ScAddress())).toBeNull();
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(c.shell.IsModified()).toBe(false);
  doc.SetValue(new ScAddress(), 3);
  c.viewData.SetCurY(1);
  marks.SetMarkArea(new ScRange(0, 1, 0, 0, 2, 0));
  const before = c.GetSnapshot();
  expect(c.CanAutoSum()).toBe(true);
  expect(c.GetSnapshot()).toBe(before);
  expect(marks.GetMarkArea().aEnd.Row()).toBe(2);
  expect(marks.IsMultiMarked()).toBe(false);
  c.Close();
});
it("keeps unavailable filtered paste and SUBTOTAL disabled while admitting native disjoint-mark fallback", /** Actual compressed filter runs and copied native marks drive the service boundary. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  doc.SetValue(new ScAddress(), 3);
  c.viewData.SetCurY(1);
  marks.SetMarkArea(new ScRange(0, 1, 0, 0, 2, 0));
  doc.SetRowFiltered(1, 1, 0, true);
  expect(c.CanAutoSum()).toBe(false);
  doc.SetRowFiltered(1, 1, 0, false);
  doc.SetRowFiltered(0, 0, 0, true);
  expect(c.CanAutoSum()).toBe(false);
  doc.SetRowFiltered(0, 0, 0, false);
  marks.ResetMark();
  marks.SetMultiMarkArea(new ScRange(0, 1, 0, 0, 1, 0), true);
  marks.SetMultiMarkArea(new ScRange(2, 1, 0, 2, 1, 0), true);
  expect(c.CanAutoSum()).toBe(true);
  expect(marks.IsMultiMarked()).toBe(true);
  expect(c.AutoSum()).toBeUndefined();
  expect(c.error).toBe("Insert into multiple selection not possible");
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(3);
  expect(doc.GetFormulaCell(new ScAddress(2, 1, 0))).toBeNull();
  c.Close();
});
