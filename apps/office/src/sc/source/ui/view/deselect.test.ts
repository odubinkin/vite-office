/** @fileoverview Original normal-grid Unmark/Deselect state effects over actual cursor,mark and shell owners. */
import { expect, it } from "vitest";
import { createCalcSession } from "../../../browser/composition/calc-module";
import { ScAddress, ScRange } from "../../../inc/address";
import { ScInputMode } from "../../../inc/global";
import { getCalcCommandResource } from "../../../uiconfig/scalc/menubar/menubar";
for (const selection of ["none", "simple", "multi"] as const) {
  it(`retains original cursor,sheets and document state while unmarking ${selection}`, /** Original Unmark invalidates old cursor only with actual marks;normal GetMoveCursor uses current cursor. @returns Nothing. */ () => {
    const s = createCalcSession(),
      c = s.controller,
      d = s.frame.GetDispatcher(),
      data = c.viewData,
      marks = data.GetMarkData();
    try {
      c.InsertSheet();
      c.SelectTab(0);
      c.SelectAllTables();
      c.Select(4, 7);
      data.SetOldCursor(1, 2);
      if (selection === "simple") marks.SetMarkArea(new ScRange(0, 0, 0, 4, 7, 0));
      if (selection === "multi") {
        marks.SetMultiMarkArea(new ScRange(0, 0, 0, 1, 1, 0), true);
        marks.SetMultiMarkArea(new ScRange(4, 6, 0, 4, 7, 0), true);
      }
      const before = [
        c.shell.GetContentGeneration(),
        c.shell.IsModified(),
        c.shell.GetUndoManager().GetUndoActionCount(),
      ];
      expect(d.QueryDispatch(".uno:Deselect")?.slot.slotId).toBe(26549);
      expect(d.QueryState(".uno:Deselect").enabled).toBe(true);
      expect(d.Execute(".uno:Deselect")).toMatchObject({ status: "executed", value: true });
      expect(marks.IsMarked()).toBe(false);
      expect(marks.IsMultiMarked()).toBe(false);
      expect([data.GetCurX(), data.GetCurY()]).toEqual([4, 7]);
      expect([data.GetOldCurX(), data.GetOldCurY()]).toEqual(
        selection === "none" ? [1, 2] : [4, 7],
      );
      expect([...marks]).toEqual([0, 1]);
      expect([
        c.shell.GetContentGeneration(),
        c.shell.IsModified(),
        c.shell.GetUndoManager().GetUndoActionCount(),
      ]).toEqual(before);
      d.Execute(".uno:Deselect");
      expect(c.Address()).toBe("E8");
    } finally {
      s.Close();
    }
  });
}
it("starts the next Shift selection from the original current-cell block anchor", /** Original InitOwnBlockMode resets the movement anchor after canceling marks. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    c.Select(1, 1);
    c.Select(4, 7, true);
    s.frame.GetDispatcher().Execute(".uno:Deselect");
    c.Select(5, 9, true);
    expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(4, 7, 0, 5, 9, 0));
    expect(getCalcCommandResource(".uno:Deselect")).toMatchObject({
      label: "Undo Selection",
      semantics: "action",
      shortcuts: ["Shift+BACKSPACE"],
    });
  } finally {
    s.Close();
  }
});
it("retains failed input and admits successful input before the normal-grid command", /** Existing browser input admission keeps source marks atomic. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    c.Select(0, 0);
    c.Select(2, 2, true);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
    expect(d.Execute(".uno:Deselect")).toMatchObject({ status: "executed", value: false });
    expect(c.viewData.GetMarkData().IsMarked()).toBe(true);
    c.Cancel();
    c.StartInput(ScInputMode.SC_INPUT_TOP, "42");
    expect(d.Execute(".uno:Deselect")).toMatchObject({ status: "executed", value: true });
    expect(c.shell.GetDocument().GetValue(new ScAddress(2, 2, 0))).toBe(42);
    expect(c.viewData.GetMarkData().IsMarked()).toBe(false);
  } finally {
    s.Close();
  }
});
