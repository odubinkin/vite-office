/** @fileoverview Real Calc row/column UI slots,shared menus and platform accelerators over the current native mark owner. */
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScRange, ScAddress } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
/** Mounts the real production owners at E8. @returns Session. */
function mountSelection() {
  const session = createCalcSession();
  session.controller.Select(4, 7);
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  return session;
}
it("executes real axis slots without altering cells,cursor,history or selected sheets", /** Validates source numeric IDs and actual range semantics through Sfx. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    dispatcher = s.frame.GetDispatcher();
  c.InsertSheet();
  c.SelectTab(0);
  c.Select(4, 7);
  c.SelectAllTables();
  const doc = c.shell.GetDocument(),
    generation = c.shell.GetContentGeneration(),
    dirty = c.shell.IsModified(),
    undo = c.shell.GetUndoManager().GetUndoActionCount();
  expect(dispatcher.QueryDispatch(".uno:SelectColumn")?.slot.slotId).toBe(26547);
  expect(dispatcher.QueryDispatch(".uno:SelectRow")?.slot.slotId).toBe(26548);
  expect(dispatcher.QueryState(".uno:SelectRow").enabled).toBe(true);
  expect(dispatcher.QueryState(".uno:SelectColumn").enabled).toBe(true);
  dispatcher.Execute(".uno:SelectRow");
  expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(0, 7, 0, doc.MaxCol(), 7, 0));
  c.Select(4, 7);
  dispatcher.Execute(".uno:SelectColumn");
  expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(4, 0, 0, 4, doc.MaxRow(), 0));
  expect(c.Address()).toBe("E8");
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1]);
  expect([
    c.shell.GetContentGeneration(),
    c.shell.IsModified(),
    c.shell.GetUndoManager().GetUndoActionCount(),
  ]).toEqual([generation, dirty, undo]);
  for (const action of [".uno:SelectRow", ".uno:SelectColumn"]) {
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    const current = c.viewData.GetMarkData().GetMarkArea();
    const before = new ScRange(
      current.aStart.Col(),
      current.aStart.Row(),
      current.aStart.Tab(),
      current.aEnd.Col(),
      current.aEnd.Row(),
      current.aEnd.Tab(),
    );
    expect(dispatcher.Execute(action)).toMatchObject({ status: "executed", value: false });
    expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(before);
    c.Cancel();
    c.StartInput(ScInputMode.SC_INPUT_TOP, "42");
    expect(dispatcher.Execute(action)).toMatchObject({ status: "executed", value: true });
    expect(doc.GetValue(new ScAddress(4, 7, 0))).toBe(42);
  }
  s.Close();
});
it("connects Edit Select row and column to the actual shared menu and visible grid marks", /** Uses the same real dispatcher as shortcuts and preserves saved grid focus. @returns Nothing. */ () => {
  const s = mountSelection(),
    grid = screen.getByRole("grid");
  grid.focus();
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  const row = screen.getByRole("menuitem", { name: "Select Row" });
  expect(row).toBeEnabled();
  fireEvent.click(row);
  expect(screen.getByRole("gridcell", { name: "A8" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("gridcell", { name: "A7" })).toHaveAttribute("aria-selected", "false");
  expect(grid).toHaveFocus();
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "E8" }), { button: 0 });
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select Column" }));
  expect(screen.getByRole("gridcell", { name: "E1" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("gridcell", { name: "D1" })).toHaveAttribute("aria-selected", "false");
  expect(s.controller.Address()).toBe("E8");
  s.Close();
});
for (const [platform, modifiers, axis] of [
  ["Linux", { shiftKey: true }, "row"],
  ["Linux", { ctrlKey: true }, "column"],
  ["MacIntel", { altKey: true }, "column"],
  ["MacIntel", { altKey: true, key: "\u00a0", code: "Space" }, "column"],
  ["MacIntel", { ctrlKey: true }, "none"],
  ["MacIntel", { altKey: true, ctrlKey: true }, "none"],
  ["Linux", { altKey: true }, "none"],
  ["Linux", { ctrlKey: true, shiftKey: true }, "all"],
  ["Linux", { altKey: true, shiftKey: true }, "none"],
  ["MacIntel", { altKey: true, shiftKey: true }, "all"],
  ["Linux", { metaKey: true }, "none"],
  ["Linux", { shiftKey: true, isComposing: true }, "none"],
] as const) {
  it(`routes only native grid space modifiers ${platform} ${JSON.stringify(modifiers)}`, /** Checks platform-specific keys without changing nested editor or unrelated ownership. @returns Nothing. */ () => {
    const platformValue = vi.spyOn(navigator, "platform", "get").mockReturnValue(platform);
    const s = mountSelection();
    try {
      fireEvent.keyDown(screen.getByRole("grid"), { key: " ", ...modifiers });
      const marks = s.controller.viewData.GetMarkData(),
        doc = s.controller.shell.GetDocument();
      if (axis === "none") expect(marks.IsMarked()).toBe(false);
      else
        expect(marks.GetMarkArea()).toEqual(
          axis === "all"
            ? new ScRange(0, 0, 0, doc.MaxCol(), doc.MaxRow(), 0)
            : axis === "row"
              ? new ScRange(0, 7, 0, doc.MaxCol(), 7, 0)
              : new ScRange(4, 0, 0, 4, doc.MaxRow(), 0),
        );
      expect(s.controller.Address()).toBe("E8");
    } finally {
      platformValue.mockRestore();
      s.Close();
    }
  });
}

it("retains the original block start for subsequent shift extension after an axis menu action", /** Native InitBlockMode keeps its anchor independently of the active cursor. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  c.Select(4, 7);
  c.MarkRows();
  c.Select(6, 9, true);
  expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(0, 7, 0, 6, 9, 0));
  c.Select(4, 7);
  c.MarkColumns();
  c.Select(6, 9, true);
  expect(c.viewData.GetMarkData().GetMarkArea()).toEqual(new ScRange(4, 0, 0, 6, 9, 0));
  s.Close();
});

it("keeps platform Space keys in nested text inputs outside grid selection ownership", /** A generic shortcut cannot select rows or columns while typing. @returns Nothing. */ () => {
  const s = mountSelection();
  const input = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.keyDown(input, { key: "\u00a0", code: "Space", ctrlKey: true });
  expect(s.controller.viewData.GetMarkData().IsMarked()).toBe(false);
  s.Close();
});
