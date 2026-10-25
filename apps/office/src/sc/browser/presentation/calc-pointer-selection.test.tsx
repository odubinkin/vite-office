/** @fileoverview Production pointer lifetime,reference editor and native viewport integration. */
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScInputMode } from "../../inc/global";
afterEach(
  /** Releases capture,timers and browser geometry. @returns Nothing. */ () => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
  },
);
/** Mounts actual document/frame/controller owners. @returns Actual controller. */ function fixture() {
  const s = createCalcSession();
  render(
    <CalcWorkbench
      controller={s.controller}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  return s.controller;
}
/** Resolves a real projected cell. @param name - Address. @returns Actual element. */ function cell(
  name: string,
) {
  return screen.getByRole("gridcell", { name });
}
it("tracks actual header drags and negative mark painting while keeping active cursor distinct", /** Pointer and cancellation events reach real native mark owners. @returns Nothing. */ () => {
  const c = fixture(),
    grid = screen.getByRole("grid");
  fireEvent.pointerDown(screen.getByRole("button", { name: "Column B" }), {
    button: 0,
    pointerId: 3,
  });
  fireEvent.pointerMove(cell("D2"), { pointerId: 3, clientX: 200, clientY: 80 });
  fireEvent.pointerUp(cell("D2"), { pointerId: 3, clientX: 200, clientY: 80 });
  expect(c.viewData.GetMarkData().IsColumnMarked(3)).toBe(true);
  fireEvent.pointerDown(screen.getByRole("button", { name: "Row 2" }), { button: 0, pointerId: 4 });
  fireEvent.pointerMove(cell("A4"), { pointerId: 4, clientX: 60, clientY: 100 });
  fireEvent.pointerUp(cell("A4"), { pointerId: 4, clientX: 60, clientY: 100 });
  expect(c.viewData.GetMarkData().IsRowMarked(3)).toBe(true);
  fireEvent.pointerDown(cell("B3"), { button: 0, ctrlKey: true, pointerId: 5 });
  expect(cell("B3")).toHaveAttribute("aria-selected", "false");
  fireEvent.pointerCancel(grid, { pointerId: 5 });
  expect(c.viewData.GetMarkData().IsCellMarked(1, 2)).toBe(false);
  fireEvent.pointerDown(cell("A1"), { button: 2 });
  fireEvent.pointerDown(cell("A1"), { button: 0, altKey: true });
  fireEvent.pointerDown(screen.getByRole("button", { name: "Column A" }), {
    button: 0,
    altKey: true,
  });
  fireEvent.click(screen.getByRole("button", { name: "Column A" }), { detail: 1 });
  fireEvent.click(screen.getByRole("button", { name: `Row ${c.viewport.firstRow + 1}` }), {
    detail: 1,
  });
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 6 });
  fireEvent.blur(window);
  expect(c.Position().GetVars()).toEqual([1, 1, 0]);
});
it("preserves native reference endpoints through row,column,corner and keyboard pointing", /** Controlled editors preserve their actual UTF16 selection and draft. @returns Nothing. */ () => {
  const c = fixture(),
    grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "=" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" }) as HTMLInputElement;
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(input).toHaveValue("=B1");
  fireEvent.keyDown(input, { key: "ArrowDown", shiftKey: true });
  expect(input).toHaveValue("=B1:B2");
  fireEvent.keyDown(input, { key: "ArrowLeft" });
  fireEvent.keyDown(input, { key: "ArrowUp" });
  expect(input).toHaveValue("=A1");
  fireEvent.pointerDown(screen.getByRole("button", { name: "Row 2" }), { button: 0, pointerId: 1 });
  fireEvent.pointerUp(window, { pointerId: 1 });
  expect(input).toHaveValue("=A2:XFD2");
  fireEvent.click(screen.getByRole("button", { name: "Select all cells" }));
  expect(input).toHaveValue("=A1:XFD1048576");
  fireEvent.focus(input);
  fireEvent.doubleClick(cell("B2"));
  input.setSelectionRange(1, 3);
  fireEvent.select(input);
  expect(c.inputSelection).toEqual([1, 3]);
  fireEvent.pointerDown(input, { button: 0 });
  fireEvent.change(input, { target: { value: "=1" } });
  fireEvent.keyDown(input, { key: "Escape" });
  act(
    /** Starts a genuine existing-cell edit using the source input mode. @returns Nothing. */ () => {
      c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(");
    },
  );
  const line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  line.setSelectionRange(1, 4);
  fireEvent.select(line);
  fireEvent.keyDown(line, { key: "Home" });
  expect(c.inputSelection).toEqual([1, 4]);
  fireEvent.change(line, { target: { value: "=SUM(" } });
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 2 });
  fireEvent.pointerUp(window, { pointerId: 2 });
  fireEvent.keyDown(line, { key: "ArrowLeft" });
  expect(c.inputHandler.IsReferenceSelection()).toBe(false);
  fireEvent.keyDown(line, { key: "Escape" });
});
it("repeats out-of-client pointing with actual native geometry and stops on pointer release", /** Browser geometry is supplied at its DOM boundary;all selection and scroll state remains real. @returns Nothing. */ () => {
  vi.useFakeTimers();
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  const c = fixture(),
    grid = screen.getByRole("grid");
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 400, 240));
  fireEvent.pointerDown(cell("A1"), { button: 0, pointerId: 7, clientX: 70, clientY: 35 });
  fireEvent.pointerMove(document.body, { pointerId: 7, clientX: 440, clientY: 270 });
  const first = c.viewport.firstRow;
  expect(first).toBeGreaterThan(0);
  act(
    /** Advances one native selection-engine repeat interval. @returns Nothing. */ () =>
      vi.advanceTimersByTime(300),
  );
  expect(c.viewport.firstRow).toBeGreaterThan(first);
  fireEvent.pointerMove(window, { pointerId: 7, clientX: 80, clientY: 40 });
  fireEvent.pointerMove(window, { pointerId: 7, clientX: -5, clientY: -5 });
  fireEvent.pointerUp(window, { pointerId: 7, clientX: -5, clientY: -5 });
  const stopped = c.viewport.firstRow;
  act(
    /** Confirms released gestures cannot continue scrolling. @returns Nothing. */ () =>
      vi.advanceTimersByTime(600),
  );
  expect(c.viewport.firstRow).toBe(stopped);
  fireEvent.pointerDown(screen.getByRole("button", { name: "Column A" }), {
    button: 0,
    pointerId: 8,
  });
  fireEvent.pointerMove(window, { pointerId: 8, clientX: 450, clientY: 10 });
  fireEvent.pointerCancel(window, { pointerId: 8 });
  fireEvent.pointerDown(screen.getByRole("button", { name: `Row ${c.viewport.firstRow + 1}` }), {
    button: 0,
    pointerId: 9,
  });
  fireEvent.pointerMove(window, { pointerId: 9, clientX: 10, clientY: 260 });
  fireEvent.keyDown(window, { key: "Escape" });
  fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
  fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "View Headers" }));
  fireEvent.pointerDown(screen.getAllByRole("gridcell")[0] as HTMLElement, {
    button: 0,
    pointerId: 10,
  });
  fireEvent.pointerMove(document.body, { pointerId: 10, clientX: 450, clientY: 270 });
  fireEvent.pointerUp(document.body, { pointerId: 10, clientX: 450, clientY: 270 });
});

it("retains rejected scalar drafts and ignores stale DOM caret notifications", /** Actual platform event ordering cannot rewrite a newer controller draft selection. @returns Nothing. */ () => {
  const c = fixture();
  act(
    /** Supplies actual unsupported pasted multiline draft to the existing guarded input API. @returns Nothing. */ () =>
      c.StartInput(ScInputMode.SC_INPUT_TYPE, "bad\ntext"),
  );
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell A1" }), { key: "ArrowRight" });
  expect(c.error).toMatch(/Multiline/);
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell A1" }), { key: "Escape" });
  const line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "=SUM(" } });
  const selection = c.inputSelection;
  line.value = "old DOM text";
  line.setSelectionRange(1, 2);
  fireEvent.select(line);
  expect(c.inputSelection).toEqual(selection);
  fireEvent.keyDown(line, { key: "Escape" });
});

it("hit-tests references through actual hidden and resized native rows and columns", /** Sparse native geometry determines pointer coordinates and visible reference painting. @returns Nothing. */ () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  const c = fixture(),
    doc = c.shell.GetDocument(),
    grid = screen.getByRole("grid");
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 400, 240));
  act(
    /** Changes actual source table geometry and admits a formula-line edit. @returns Nothing. */ () => {
      const table = doc.FetchTable(0) as NonNullable<ReturnType<typeof doc.FetchTable>>;
      table.SetColWidthOnly(0, 1500);
      table.SetRowHeightOnly(0, 0, 600);
      doc.SetColHidden(1, 1, 0, true);
      doc.SetRowHidden(1, 1, 0, true);
      c.Scroll(0, 0, 400, 240);
      c.StartInput(ScInputMode.SC_INPUT_TOP, "=");
    },
  );
  expect(screen.queryByRole("gridcell", { name: "B2" })).toBe(null);
  fireEvent.pointerDown(cell("A1"), { button: 0, pointerId: 12, clientX: 60, clientY: 30 });
  fireEvent.pointerMove(document.body, { pointerId: 12, clientX: 190, clientY: 70 });
  fireEvent.pointerUp(document.body, { pointerId: 12, clientX: 190, clientY: 70 });
  expect(c.Input()).toBe("=A1:C3");
  expect(grid.querySelectorAll('[data-calc-reference="true"]').length).toBe(4);
});
it("collapses a pointed reference before native DOM composition and paste commands", /** Edit commands append after the selected reference while preserving browser IME/clipboard ownership. @returns Nothing. */ () => {
  const c = fixture(),
    grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "=" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" }) as HTMLInputElement;
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 31 });
  fireEvent.pointerUp(window, { pointerId: 31 });
  expect(input).toHaveValue("=B2");
  fireEvent.compositionStart(input, { data: "" });
  expect([input.selectionStart, input.selectionEnd]).toEqual([3, 3]);
  expect(c.inputHandler.IsReferenceSelection()).toBe(false);
  fireEvent.change(input, { target: { value: "=B2+" } });
  fireEvent.compositionEnd(input, { data: "+" });
  fireEvent.keyDown(input, { key: "Escape" });
  const line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "=SUM(" } });
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 32 });
  fireEvent.pointerUp(window, { pointerId: 32 });
  fireEvent.paste(line);
  expect([line.selectionStart, line.selectionEnd]).toEqual([7, 7]);
  expect(c.Input()).toBe("=SUM(B2");
  fireEvent.paste(line);
  fireEvent.keyDown(line, { key: "Escape" });
});

it("restores formula-line focus without treating it as another text change", /** Returning from a different focused control retains the native selected-reference lifecycle. @returns Nothing. */ () => {
  const c = fixture(),
    grid = screen.getByRole("grid"),
    line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "=SUM(" } });
  grid.focus();
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 41 });
  fireEvent.pointerUp(window, { pointerId: 41 });
  expect(line).toHaveFocus();
  expect(c.inputHandler.IsReferenceSelection()).toBe(true);
  fireEvent.keyDown(line, { key: ")" });
  expect([line.selectionStart, line.selectionEnd]).toEqual([7, 7]);
  expect(c.Input()).toBe("=SUM(B2");
  fireEvent.keyDown(line, { key: "Escape" });
});
it("retains the same inline editor and keyboard owner when a reference scrolls its cell out of the paint window", /** Actual input lifetime follows the edit session instead of the virtualized cells. @returns Nothing. */ () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(400);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  const c = fixture(),
    grid = screen.getByRole("grid");
  vi.spyOn(grid, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 400, 240));
  fireEvent.keyDown(grid, { key: "=" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" }) as HTMLInputElement;
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 51, clientX: 160, clientY: 50 });
  fireEvent.pointerMove(document.body, { pointerId: 51, clientX: 450, clientY: 280 });
  fireEvent.pointerUp(document.body, { pointerId: 51, clientX: 450, clientY: 280 });
  expect(c.viewport.firstRow).toBeGreaterThan(0);
  expect(screen.queryByRole("gridcell", { name: "A1" })).toBe(null);
  expect(screen.getByRole("textbox", { name: "Edit cell A1" })).toBe(input);
  expect(input).toHaveFocus();
  const draft = c.Input();
  fireEvent.keyDown(input, { key: "+" });
  expect([input.selectionStart, input.selectionEnd]).toEqual([draft.length, draft.length]);
  fireEvent.change(input, { target: { value: draft + "+1" } });
  expect(c.Input()).toBe(draft + "+1");
  expect(c.Position().GetVars()).toEqual([0, 0, 0]);
  fireEvent.keyDown(input, { key: "Escape" });
});

it("switches inline mouse caret input to TABLE without committing the formula", /** Original edit-view mouse admission gives cursor keys back to the text editor. @returns Nothing. */ () => {
  const c = fixture(),
    grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "=" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" }) as HTMLInputElement;
  fireEvent.change(input, { target: { value: "=SUM(B2)" } });
  fireEvent.pointerDown(input, { button: 0 });
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TABLE);
  input.setSelectionRange(5, 5);
  fireEvent.focus(input);
  fireEvent.select(input);
  fireEvent.keyDown(input, { key: "ArrowRight" });
  expect(c.Input()).toBe("=SUM(B2)");
  expect(c.Position().GetVars()).toEqual([0, 0, 0]);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.doubleClick(input);
  fireEvent.keyDown(input, { key: "Escape" });
});

it("treats a manually selected reference word as ordinary text rather than pointer-selected input", /** Explicit edit-view mouse intent ends selected-reference semantics even if its UTF16 endpoints are unchanged. @returns Nothing. */ () => {
  const c = fixture(),
    grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "=" });
  const input = screen.getByRole("textbox", { name: "Edit cell A1" }) as HTMLInputElement;
  fireEvent.pointerDown(cell("B2"), { button: 0, pointerId: 61 });
  fireEvent.pointerUp(window, { pointerId: 61 });
  expect(c.inputHandler.IsReferenceSelection()).toBe(true);
  fireEvent.pointerDown(input, { button: 0 });
  expect(c.inputHandler.IsReferenceSelection()).toBe(false);
  input.setSelectionRange(1, 3);
  fireEvent.select(input);
  fireEvent.keyDown(input, { key: "7" });
  expect([input.selectionStart, input.selectionEnd]).toEqual([1, 3]);
  fireEvent.change(input, { target: { value: "=7" } });
  expect(c.Input()).toBe("=7");
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.keyDown(input, { key: "Escape" });
});
