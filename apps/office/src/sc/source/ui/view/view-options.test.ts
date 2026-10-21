/** @fileoverview Original View request cases,checked states,dirty and draft boundaries through genuine shell/frame owners. */
import { expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScTabViewShell } from "../inc/tabvwsh";
import { ViewOption } from "../../../inc/viewopti";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { ScInputMode } from "../../../inc/global";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScRange } from "../../../inc/address";
for (const [id, slot, option] of [
  [".uno:ViewRowColumnHeaders", 26242, "headers"],
  [".uno:ToggleFormula", 26250, "formulas"],
] as const) {
  it(`uses original typed explicit/toggle bool requests for ${id}`, /** Checks states and recorded native arguments. @returns Nothing. */ () => {
    const s = createCalcSession(),
      c = s.controller,
      d = s.frame.GetDispatcher();
    try {
      expect(d.QueryDispatch(id)?.slot.slotId).toBe(slot);
      const initial = option === "headers";
      expect(d.QueryState(id).checked).toBe(initial);
      const before = [
        c.shell.IsModified(),
        c.shell.GetUndoManager().GetUndoActionCount(),
        c.shell.GetContentGeneration(),
      ];
      for (const value of [true, true, false, false]) {
        const req = new SfxRequest(slot, [new SfxBoolItem(slot, value)]);
        c.ExecuteViewOption(option, req);
        expect(req.IsDone()).toBe(true);
        expect(
          (
            req
              .GetArgs()
              .find(
                /** Reads the actual bool. @param item - Native argument. @returns Match. */ (
                  item,
                ) => item.Which() === slot,
              ) as SfxBoolItem
          ).GetValue(),
        ).toBe(value);
        expect(d.QueryState(id).checked).toBe(value);
      }
      d.Execute(id);
      expect(d.QueryState(id).checked).toBe(true);
      const req = new SfxRequest(slot, [new SfxBoolItem(slot + 1, false)]);
      c.ExecuteViewOption(option, req);
      expect(d.QueryState(id).checked).toBe(false);
      expect([
        c.shell.IsModified(),
        c.shell.GetUndoManager().GetUndoActionCount(),
        c.shell.GetContentGeneration(),
      ]).toEqual(before);
    } finally {
      s.Close();
    }
  });
}
it("retains editing draft,marks and cursor;formula copies all view flags into document while headers remain initially local", /** Replays the complete represented source option copy. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument();
  try {
    c.Select(2, 3);
    c.Select(4, 5, true);
    const range = new ScRange(c.viewData.GetMarkData().GetMarkArea());
    c.StartInput(ScInputMode.SC_INPUT_TOP, "uncommitted");
    d.Execute(".uno:ViewRowColumnHeaders");
    expect(doc.GetViewOptions().GetOption(ViewOption.HEADER)).toBe(true);
    d.Execute(".uno:ToggleFormula");
    expect(c.Input()).toBe("uncommitted");
    expect(c.mode).toBe(ScInputMode.SC_INPUT_TOP);
    expect(c.viewData.GetMarkData().GetMarkArea().equals(range)).toBe(true);
    expect(c.Address()).toBe("E6");
    const second = new ScTabViewShell(c.shell);
    expect(second.GetViewData().IsHeaderMode()).toBe(false);
    expect(second.GetViewData().GetOptions().GetOption(ViewOption.FORMULAS)).toBe(true);
    expect(c.shell.IsModified()).toBe(false);
  } finally {
    s.Close();
  }
});
it("ignores grid arguments,toggles only current sheet and marks modified without input commit/history", /** Checks native per-sheet and dirty exception. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    const name = unicode("Second");
    try {
      c.shell.GetDocument().InsertTab(1, name);
    } finally {
      name.dispose();
    }
    c.SelectAllTables();
    c.StartInput(ScInputMode.SC_INPUT_TOP, "draft");
    const count = c.shell.GetUndoManager().GetUndoActionCount(),
      req = new SfxRequest(25018, [new SfxBoolItem(25018, true)]);
    c.ExecuteViewOption("grid", req);
    expect(req.IsDone()).toBe(true);
    expect(req.GetArgs()).toHaveLength(1);
    expect(c.viewData.GetShowGrid()).toBe(false);
    expect(c.shell.IsModified()).toBe(true);
    expect(c.Input()).toBe("draft");
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
    c.Cancel();
    c.SelectTab(1);
    expect(d.QueryState(".uno:ToggleSheetGrid").checked).toBe(true);
    c.SelectTab(0);
    expect(d.QueryState(".uno:ToggleSheetGrid").checked).toBe(false);
    d.Execute(".uno:ToggleSheetGrid");
    expect(c.viewData.GetShowGrid()).toBe(true);
  } finally {
    s.Close();
  }
});

it("uses the entire client viewport when headers are hidden for scrolling in both axes", /** Verifies measured view navigation no longer reserves hidden header strips. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    c.Scroll(0, 0, 200, 100);
    const before = { ...c.viewport },
      left = c.ScrollLeftForColumn(100, 200),
      top = c.ScrollTopForRow(100, 100);
    s.frame.GetDispatcher().Execute(".uno:ViewRowColumnHeaders");
    expect(c.viewport.rows).toBeGreaterThan(before.rows);
    expect(c.viewport.columns).toBeGreaterThanOrEqual(before.columns);
    expect(c.ScrollLeftForColumn(100, 200)).toBeGreaterThan(left);
    expect(c.ScrollTopForRow(100, 100)).toBeGreaterThan(top);
  } finally {
    s.Close();
  }
});
