/** @fileoverview Native grid ShiftBackspace ownership and Escape/editor/menu isolation through actual Sfx dispatch. */
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { ScInputMode } from "../../inc/global";
import { CalcWorkbench } from "./calc-workbench";
afterEach(cleanup);
/** Mounts an actual simple marked region with its current cursor at E8. @returns Session. */
function setup() {
  const s = createCalcSession();
  s.controller.Select(1, 1);
  s.controller.Select(4, 7, true);
  render(
    <CalcWorkbench
      controller={s.controller}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  return s;
}
for (const [fields, deselect] of [
  [{ shiftKey: true }, true],
  [{}, false],
  [{ shiftKey: true, ctrlKey: true }, false],
  [{ shiftKey: true, metaKey: true }, false],
  [{ shiftKey: true, altKey: true }, false],
  [{ shiftKey: true, isComposing: true }, false],
] as const) {
  it(`routes exact native grid ShiftBackspace ${JSON.stringify(fields)}`, /** Preserves modifier and composition ownership. @returns Nothing. */ () => {
    const s = setup();
    try {
      const grid = screen.getByRole("grid");
      grid.focus();
      fireEvent.keyDown(grid, { key: "Backspace", ...fields });
      expect(s.controller.viewData.GetMarkData().IsMarked()).toBe(!deselect);
      expect(s.controller.Address()).toBe("E8");
      expect(grid).toHaveFocus();
    } finally {
      s.Close();
    }
  });
}
it("leaves consumed events,nested editor/name-box keys and grid Escape with their original owners", /** Deselect is not the native Escape operation. @returns Nothing. */ () => {
  const s = setup(),
    marks = s.controller.viewData.GetMarkData();
  try {
    const grid = screen.getByRole("grid");
    grid.focus();
    const consumed = createEvent.keyDown(grid, {
      key: "Backspace",
      shiftKey: true,
      cancelable: true,
    });
    consumed.preventDefault();
    fireEvent(grid, consumed);
    expect(marks.IsMarked()).toBe(true);
    fireEvent.keyDown(grid, { key: "Escape" });
    expect(marks.IsMarked()).toBe(true);
    for (const name of ["Name Box", "Input line"]) {
      fireEvent.keyDown(screen.getByRole("textbox", { name }), {
        key: "Backspace",
        shiftKey: true,
      });
      expect(marks.IsMarked()).toBe(true);
    }
    fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Select All" }), { key: "Escape" });
    expect(marks.IsMarked()).toBe(true);
  } finally {
    s.Close();
  }
});
it("keeps inline input selection and Escape cancellation independent from the grid command", /** Actual double-click creates the existing input owner;ShiftBackspace does not dispatch Deselect. @returns Nothing. */ () => {
  const s = setup(),
    c = s.controller;
  try {
    fireEvent.doubleClick(screen.getByRole("gridcell", { name: "E8" }));
    const input = screen.getByRole("textbox", { name: "Edit cell E8" });
    fireEvent.change(input, { target: { value: "alpha beta" } });
    input.focus();
    (input as HTMLInputElement).setSelectionRange(0, 5);
    fireEvent.keyDown(input, { key: "Backspace", shiftKey: true });
    expect(c.mode).not.toBe(ScInputMode.SC_INPUT_NONE);
    expect((input as HTMLInputElement).selectionEnd).toBe(5);
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("textbox", { name: "Edit cell E8" })).not.toBeInTheDocument();
    expect(screen.getByRole("grid")).toHaveFocus();
  } finally {
    s.Close();
  }
});
