/** @fileoverview Mounted formula-line and inline pointer reference entry over the production Calc owners. */
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalcModuleFactory } from "../composition/calc-module";
afterEach(/** Releases document and VCL tracking lifetime. @returns Nothing. */ () => cleanup());
it("retains the input line while clicking and dragging actual grid references", /** Actual React controls keep caret,draft and source cursor owners synchronized. @returns Nothing. */ () => {
  render(createCalcModuleFactory().createWorkspace());
  const grid = screen.getByRole("grid");
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "D5" }), { button: 0 });
  fireEvent.pointerUp(screen.getByRole("gridcell", { name: "D5" }));
  fireEvent.click(screen.getByRole("button", { name: "Formula" }));
  const line = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  fireEvent.change(line, { target: { value: "=SUM(" } });
  const first = screen.getByRole("gridcell", { name: "A1" }),
    last = screen.getByRole("gridcell", { name: "B3" });
  fireEvent.pointerDown(first, { button: 0, pointerId: 1 });
  fireEvent.pointerMove(last, { pointerId: 1, clientX: 100, clientY: 80 });
  fireEvent.pointerUp(last, { pointerId: 1, clientX: 100, clientY: 80 });
  expect(line).toHaveValue("=SUM(A1:B3");
  expect(line).toHaveFocus();
  expect([line.selectionStart, line.selectionEnd]).toEqual([5, 10]);
  expect(grid.querySelectorAll('[data-calc-reference="true"]').length).toBe(6);
  fireEvent.keyDown(line, { key: ")" });
  expect([line.selectionStart, line.selectionEnd]).toEqual([10, 10]);
  fireEvent.change(line, { target: { value: "=SUM(A1:B3)" } });
  fireEvent.click(screen.getByRole("button", { name: "Accept input" }));
  expect(screen.getByRole("gridcell", { name: "D5" })).toHaveTextContent("0");
});
it("points whole columns and replaces inline references without leaving the edited cell", /** Full-axis reference formatting uses native OOO endpoint notation. @returns Nothing. */ () => {
  render(createCalcModuleFactory().createWorkspace());
  const grid = screen.getByRole("grid");
  fireEvent.keyDown(grid, { key: "=" });
  const editor = screen.getByRole("textbox", { name: "Edit cell A1" });
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "B2" }), { button: 0, pointerId: 2 });
  fireEvent.pointerUp(screen.getByRole("gridcell", { name: "B2" }), { pointerId: 2 });
  expect(editor).toHaveValue("=B2");
  fireEvent.click(screen.getByRole("button", { name: "Column C" }));
  expect(editor).toHaveValue("=C1:C1048576");
  fireEvent.keyDown(editor, { key: "Escape" });
  expect(screen.queryByRole("textbox", { name: "Edit cell A1" })).toBe(null);
});
