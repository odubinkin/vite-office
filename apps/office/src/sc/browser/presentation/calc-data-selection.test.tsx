/** @fileoverview Production data-area and whole-sheet selection with actual shared menus and dispatch. */
import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
import type { ScTabViewShell } from "../../source/ui/inc/tabvwsh";
import { ScCellShell } from "../../source/ui/view/cellsh3";
import { SfxRequest } from "../../../sfx2/source/control/request";
afterEach(cleanup);
/** Creates real owners with B2:C3 diagonal data and distant F6. @returns Session. */
function setup() {
  const s = createCalcSession(),
    c = s.controller;
  for (const [col, row] of [
    [1, 1],
    [2, 2],
    [5, 5],
  ])
    c.shell.GetDocument().SetValue(new ScAddress(col as number, row as number, 0), 7);
  c.Select(1, 1);
  return s;
}
it("uses native first-range then whole-sheet behavior and preserves cursor,content and history", /** Checks actual source slots and configuration. @returns Nothing. */ () => {
  const s = setup(),
    c = s.controller,
    d = s.frame.GetDispatcher(),
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData();
  try {
    const before = [
      c.shell.GetContentGeneration(),
      c.shell.IsModified(),
      c.shell.GetUndoManager().GetUndoActionCount(),
    ];
    expect(d.QueryDispatch(".uno:SelectAll")?.slot.slotId).toBe(5723);
    expect(d.QueryDispatch(".uno:SelectData")?.slot.slotId).toBe(26551);
    d.Execute(".uno:SelectAll");
    expect(marks.GetMarkArea()).toEqual(new ScRange(1, 1, 0, 2, 2, 0));
    d.Execute(".uno:SelectAll");
    d.Execute(".uno:SelectAll");
    expect(marks.GetMarkArea()).toEqual(new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0));
    d.Execute(".uno:SelectData");
    expect(marks.GetMarkArea()).toEqual(new ScRange(1, 1, 0, 2, 2, 0));
    expect(c.Address()).toBe("B2");
    expect([
      c.shell.GetContentGeneration(),
      c.shell.IsModified(),
      c.shell.GetUndoManager().GetUndoActionCount(),
    ]).toEqual(before);
    c.Select(5, 5);
    d.Execute(".uno:SelectAll");
    expect(marks.GetMarkArea().aEnd.Col()).toBe(doc.MaxCol());
    c.Select(1, 1);
    const request = new SfxRequest(5723);
    new ScCellShell(c.viewData.GetViewShell() as ScTabViewShell).ExecuteSelectAll(
      request,
      c.viewData,
      false,
    );
    expect(request.IsDone()).toBe(true);
    expect(marks.GetMarkArea().aEnd.Col()).toBe(doc.MaxCol());
  } finally {
    s.Close();
  }
});
it("connects shared Edit menu,Ctrl/Meta+A,keypad multiply and corner while retaining text-input selection", /** Checks actual UI routing and focus. @returns Nothing. */ () => {
  const s = setup(),
    c = s.controller;
  try {
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    const grid = screen.getByRole("grid");
    grid.focus();
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Select All/ }));
    expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(1, 1, 0, 2, 2, 0));
    expect(grid).toHaveFocus();
    fireEvent.keyDown(grid, { key: "a", ctrlKey: true });
    expect(c.viewData.GetMarkData().GetMarkArea().aEnd.Col()).toBe(c.shell.GetDocument().MaxCol());
    c.Select(1, 1);
    fireEvent.keyDown(grid, { key: "a", metaKey: true });
    expect(c.viewData.GetMarkData().GetMarkArea().aEnd.Col()).toBe(2);
    c.Select(1, 1);
    fireEvent.keyDown(grid, { key: "*", code: "NumpadMultiply", ctrlKey: true });
    expect(c.viewData.GetMarkData().GetMarkArea().aEnd.Col()).toBe(2);
    c.Select(1, 1);
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Input line" }), {
      key: "a",
      ctrlKey: true,
    });
    expect(c.viewData.GetMarkData().IsMarked()).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Select all cells" }));
    expect(c.Address()).toBe("B2");
    expect(c.viewData.GetMarkData().GetMarkArea().aEnd.Col()).toBe(c.shell.GetDocument().MaxCol());
  } finally {
    s.Close();
  }
});
it("rejects unsupported drafts and commits admitted input before either selection command", /** Validates actual input transaction boundaries. @returns Nothing. */ () => {
  const s = setup(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    for (const command of [".uno:SelectAll", ".uno:SelectData"]) {
      c.Select(1, 1);
      c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
      expect(d.Execute(command)).toMatchObject({ status: "executed", value: false });
      c.Header("column", 1);
      c.Header("row", 1);
      c.Header("all", 0);
      expect(c.viewData.GetMarkData().IsMarked()).toBe(false);
      c.Cancel();
      c.StartInput(ScInputMode.SC_INPUT_TOP, "42");
      expect(d.Execute(command)).toMatchObject({ status: "executed", value: true });
      expect(c.shell.GetDocument().GetValue(new ScAddress(1, 1, 0))).toBe(42);
    }
  } finally {
    s.Close();
  }
});
