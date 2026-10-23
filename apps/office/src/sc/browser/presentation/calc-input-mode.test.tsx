/** @fileoverview Actual Calc F2 slot,draft ownership and TYPE/TABLE keyboard behavior. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScInputMode } from "../../inc/global";
import { ScAddress } from "../../inc/address";
afterEach(/** Releases rendered owners. @returns Nothing. */ () => cleanup());
/** Mounts the actual session and all real input/model owners. @returns Active session. */
function fixture() {
  const s = createCalcSession();
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
it("dispatches native F2 and shared Cell Edit Mode without committing TABLE TYPE drafts", /** Checks source slot identity,focus and single history action. @returns Nothing. */ () => {
  const s = fixture(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  expect(d.QueryDispatch(".uno:SetInputMode")?.slot.slotId).toBe(26552);
  const grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "7" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" }) as HTMLInputElement;
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TYPE);
  fireEvent.change(input, { target: { value: "72" } });
  input.setSelectionRange(0, 0);
  fireEvent.keyDown(input, { key: "F2", isComposing: true });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TYPE);
  fireEvent.keyDown(input, { key: "F2" });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TABLE);
  expect(input.selectionStart).toBe(2);
  expect(input).toHaveFocus();
  fireEvent.keyDown(input, { key: "ArrowLeft" });
  expect(c.Address()).toBe("A1");
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Cell Edit Mode" }));
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TYPE);
  expect(input).toHaveFocus();
  expect(input).toHaveValue("72");
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(0);
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(c.Address()).toBe("B1");
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(72);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  fireEvent.keyDown(grid, { key: "F2" });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TABLE);
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell B1" }), { key: "Escape" });
  s.Close();
});
it("commits TOP before F2 and retains rejected drafts instead of entering TABLE", /** Exercises original ExecuteMove mode guard on real model and compiler. @returns Nothing. */ () => {
  const s = fixture(),
    c = s.controller;
  const line = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "42" } });
  fireEvent.keyDown(line, { key: "ArrowLeft" });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TOP);
  fireEvent.keyDown(line, { key: "F2" });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TABLE);
  expect(c.shell.GetDocument().GetValue(c.Position())).toBe(42);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(screen.getByRole("textbox", { name: "Edit cell A1" })).toHaveFocus();
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "=UNPORTED(A1)" } });
  fireEvent.keyDown(line, { key: "F2" });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TOP);
  expect(line).toHaveValue("=UNPORTED(A1)");
  expect(screen.getByRole("alert")).toBeInTheDocument();
  s.Close();
});
it("routes scalar TYPE arrows to cell movement while modifiers and TABLE retain editing", /** Covers directional,selection,invalid-input and accelerator boundaries. @returns Nothing. */ () => {
  const s = fixture(),
    c = s.controller;
  for (const [key, col, row] of [
    ["ArrowLeft", 1, 2],
    ["ArrowRight", 3, 2],
    ["ArrowUp", 2, 1],
    ["ArrowDown", 2, 3],
  ] as const) {
    act(
      /** Starts a fresh real-cell draft for directional input. @returns Nothing. */ () => {
        c.Select(2, 2);
        c.StartInput(ScInputMode.SC_INPUT_TYPE, "13");
      },
    );
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell C3" }), {
      key,
      shiftKey: true,
    });
    expect([c.viewData.GetCurX(), c.viewData.GetCurY()]).toEqual([col, row]);
  }
  act(
    /** Keeps unsupported input pending in the active real cell. @returns Nothing. */ () => {
      c.Select(2, 2);
      c.StartInput(ScInputMode.SC_INPUT_TYPE, "=UNPORTED(A1)");
    },
  );
  const input = screen.getByRole("textbox", { name: "Edit cell C3" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(c.Address()).toBe("C3");
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TYPE);
  expect(c.Input()).toBe("=UNPORTED(A1)C4");
  for (const modifier of ["ctrlKey", "metaKey", "altKey"] as const) {
    fireEvent.keyDown(input, { key: "ArrowLeft", [modifier]: true });
    fireEvent.keyDown(input, { key: "F2", [modifier]: true });
    expect(c.mode).toBe(ScInputMode.SC_INPUT_TYPE);
  }
  fireEvent.keyDown(input, { key: "F2", shiftKey: true });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TYPE);
  s.Close();
});

it("keeps inspection out of Undo and records changed-and-reverted input through production controls", /** Actual events distinguish unmodified F2 inspection from an edited draft with the same final value. @returns Nothing. */ () => {
  const s = fixture(),
    c = s.controller;
  const grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "4" });
  let input = screen.getByRole("textbox", { name: "Edit cell A1" });
  fireEvent.change(input, { target: { value: "42" } });
  fireEvent.keyDown(input, { key: "Enter" });
  const generation = c.shell.GetContentGeneration();
  fireEvent.doubleClick(screen.getByRole("gridcell", { name: "A1" }));
  input = screen.getByRole("textbox", { name: "Edit cell A1" });
  fireEvent.keyDown(input, { key: "F2" });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(c.shell.GetContentGeneration()).toBe(generation);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  fireEvent.doubleClick(screen.getByRole("gridcell", { name: "A1" }));
  input = screen.getByRole("textbox", { name: "Edit cell A1" });
  fireEvent.change(input, { target: { value: "43" } });
  fireEvent.change(input, { target: { value: "42" } });
  fireEvent.keyDown(input, { key: "Enter" });
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(2);
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveTextContent("42");
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByRole("gridcell", { name: "A1" })).toHaveTextContent("");
  expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  expect(c.inputHandler.IsModified()).toBe(false);
  s.Close();
});
