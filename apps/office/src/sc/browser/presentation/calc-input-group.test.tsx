/** @fileoverview Grouped Calc input,source child traversal and real per-sheet formula owners. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { CalcViewController } from "../controller/calc-view-controller";
import { ScAddress } from "../../inc/address";
import { CellType, ScInputMode } from "../../inc/global";
import { SfxListUndoAction } from "../../../svl/source/undo/undo";
import { ScUndoSetCell } from "../../source/ui/inc/undocell";
afterEach(/** Releases mounted clients. @returns Nothing. */ () => cleanup());
it("applies source selected-mark input to independent sheet positions under one shared list action", /** Actual dependencies and distinct prior values survive grouped Undo and Redo. @returns Nothing. */ () => {
  const c = new CalcViewController(),
    doc = c.shell.GetDocument();
  c.InsertSheet();
  c.InsertSheet();
  c.shell.GetUndoManager().Clear();
  for (let tab = 0; tab < 3; tab++) {
    doc.SetValue(new ScAddress(0, 1, tab), 2 * (tab + 1));
    doc.SetValue(new ScAddress(1, 1, tab), 10 * (tab + 1));
  }
  c.Select(1, 1);
  c.SelectAllTables();
  const generation = c.shell.GetContentGeneration();
  expect(c.EnterString("=A2*3")).toBe(true);
  expect(c.shell.GetContentGeneration()).toBe(generation + 1);
  const action = c.shell.GetUndoManager().GetUndoAction() as SfxListUndoAction<typeof c.shell>;
  expect(action).toBeInstanceOf(SfxListUndoAction);
  expect(action.GetActionCount()).toBe(3);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  for (let tab = 0; tab < 3; tab++) {
    expect(doc.GetValue(new ScAddress(1, 1, tab))).toBe(6 * (tab + 1));
    expect(doc.GetFormulaCell(new ScAddress(1, 1, tab))?.aPos.Tab()).toBe(tab);
    expect(action.GetUndoAction(tab)).toBeInstanceOf(ScUndoSetCell);
  }
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1, 2]);
  c.Undo();
  expect(c.viewData.GetTabNumber()).toBe(0);
  expect(c.Address()).toBe("B2");
  for (let tab = 0; tab < 3; tab++)
    expect(doc.GetValue(new ScAddress(1, 1, tab))).toBe(10 * (tab + 1));
  c.Redo();
  expect(c.viewData.GetTabNumber()).toBe(2);
  expect(c.Address()).toBe("B2");
  doc.SetValue(new ScAddress(0, 1, 1), 8);
  expect(doc.GetValue(new ScAddress(1, 1, 1))).toBe(24);
  c.SelectTab(0);
  c.SelectTab(2, true);
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 2]);
  c.EnterString("'007");
  expect(doc.GetCellType(new ScAddress(1, 1, 0))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetCellType(new ScAddress(1, 1, 2))).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetValue(new ScAddress(1, 1, 1))).toBe(24);
  c.Undo();
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(6);
  expect(doc.GetValue(new ScAddress(1, 1, 2))).toBe(18);
  c.SelectAllTables();
  const history = c.shell.GetUndoManager().GetUndoActionCount();
  c.StartInput(ScInputMode.SC_INPUT_TYPE, "=SUM(A1)");
  expect(c.Commit()).toBe(false);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(history);
  expect(c.shell.GetUndoManager().IsInListAction()).toBe(false);
  expect(doc.GetValue(new ScAddress(1, 1, 1))).toBe(24);
  c.Close();
});
it("shows grouped selection and executes one Undo/Redo from actual Writer-style controls", /** Shared menu and toolbar consume the same real native child actions. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  c.InsertSheet();
  c.InsertSheet();
  render(
    <CalcWorkbench
      controller={c}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select All Sheets" }));
  for (const name of ["Sheet1", "Sheet2", "Sheet3"]) {
    expect(screen.getByRole("tab", { name })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name })).toHaveClass("bg-indigo-50");
  }
  expect(screen.getByRole("tab", { name: "Sheet3" })).toHaveAttribute("aria-current", "page");
  expect(screen.getByRole("tab", { name: "Sheet1" })).not.toHaveClass("font-semibold");
  fireEvent.keyDown(screen.getByRole("grid"), { key: "9" });
  fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell A1" }), { key: "Enter" });
  for (let tab = 0; tab < 3; tab++)
    expect(c.shell.GetDocument().GetValue(new ScAddress(0, 0, tab))).toBe(9);
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  for (let tab = 0; tab < 3; tab++)
    expect(c.shell.GetDocument().GetCellType(new ScAddress(0, 0, tab))).toBe(
      CellType.CELLTYPE_NONE,
    );
  expect(screen.getByRole("tab", { name: "Sheet1" })).toHaveAttribute("aria-current", "page");
  fireEvent.click(screen.getByRole("button", { name: "Redo" }));
  for (let tab = 0; tab < 3; tab++)
    expect(c.shell.GetDocument().GetValue(new ScAddress(0, 0, tab))).toBe(9);
  expect(screen.getByRole("tab", { name: "Sheet3" })).toHaveAttribute("aria-current", "page");
  s.Close();
});
