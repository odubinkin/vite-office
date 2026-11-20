/** @fileoverview Calc production outline windows and native sheet geometry. */
import { strict as assert } from "node:assert";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ViewOption } from "../../inc/viewopti";
import { applyOutlineControl } from "../../source/ui/docshell/olinefun";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { calcGridInsets } from "./calc-grid-axis";

afterEach(/** Detaches the production workbench. @returns Nothing. */ () => cleanup());

it("expands an outer group while retaining a collapsed child and undo history", /** Exercises real browser controls for nested rows and their native model. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = session;
  const doc = controller.shell.GetDocument();
  const sheet = doc.FetchTable(0);
  assert(sheet);
  const outline = sheet.StartOutlineTable().GetRowArray();
  outline.Insert(1, 8);
  outline.Insert(3, 5);
  render(<CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />);
  const gutter = screen.getByRole("group", { name: "Row outline" });
  const button = within(gutter).getByRole("button", { name: "Collapse rows 4–6" });
  fireEvent.keyDown(button, { key: "-" });
  expect(sheet.RowHidden(3)).toBe(true);
  fireEvent.click(within(gutter).getByRole("button", { name: "Collapse rows 2–9" }));
  expect(sheet.RowHidden(1)).toBe(true);
  expect(within(gutter).queryByRole("button", { name: "Expand rows 4–6" })).toBeNull();
  fireEvent.click(within(gutter).getByRole("button", { name: "Expand rows 2–9" }));
  expect(sheet.RowHidden(1)).toBe(false);
  expect(sheet.RowHidden(3)).toBe(true);
  expect(within(gutter).getByRole("button", { name: "Expand rows 4–6" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );

  fireEvent.click(within(gutter).getByRole("button", { name: "Row outline level 3" }));
  expect(sheet.RowHidden(3)).toBe(false);
  act(
    /** Restores the previous level flags and hidden row runs. @returns Nothing. */ () => {
      controller.Undo();
    },
  );
  expect(sheet.RowHidden(3)).toBe(true);
  act(
    /** Restores the outer group's closed state. @returns Nothing. */ () => {
      controller.Undo();
    },
  );
  expect(sheet.RowHidden(1)).toBe(true);
  act(
    /** Reopens only the previous parent. @returns Nothing. */ () => {
      controller.Redo();
    },
  );
  expect(sheet.RowHidden(1)).toBe(false);
  expect(sheet.RowHidden(3)).toBe(true);
  session.Close();
});

it("places group controls in both fixed and movable panes and reserves header space", /** Uses the same measured body for pane controls, the grid, and collapsing entries. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = session;
  const sheet = controller.shell.GetDocument().FetchTable(0);
  assert(sheet);
  const outline = sheet.StartOutlineTable();
  outline.GetRowArray().Insert(0, 1);
  outline.GetRowArray().Insert(5, 7);
  outline.GetColArray().Insert(2, 3);
  controller.MeasureViewport(0, 0, 820, 690);
  controller.Select(2, 4);
  frame.GetDispatcher().Execute(".uno:FreezePanes");
  render(<CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />);
  const grid = screen.getByRole("grid");
  const corner = within(grid).getByRole("columnheader", { name: "Select all cells" });
  expect(corner.style.left).toBe("29px");
  expect((corner.parentElement as HTMLElement).style.top).toBe("29px");
  const row = screen.getByRole("group", { name: "Row outline" });
  const first = within(row).getByRole("button", { name: "Collapse rows 1–2" });
  const trailing = within(row).getByRole("button", { name: "Collapse rows 6–8" });
  expect(first.parentElement).not.toBe(trailing.parentElement);
  expect((first.parentElement as HTMLElement).style.height).toBe(
    `${controller.viewport.frozenRows?.pixels}px`,
  );
  const column = screen.getByRole("group", { name: "Column outline" });
  fireEvent.click(within(column).getByRole("button", { name: "Collapse columns C–D" }));
  expect(sheet.ColHidden(2)).toBe(true);
  fireEvent.click(within(column).getByRole("button", { name: "Column outline level 2" }));
  expect(sheet.ColHidden(2)).toBe(false);
  expect(controller.viewData.GetPaneLayout()?.verticalPosition).toBe(4);
  session.Close();
});

it("uses the view's outline option and leaves filtered rows hidden on expansion", /** Covers the source view default and outline visibility over filtered runs. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller } = session;
  const doc = controller.shell.GetDocument();
  const table = doc.FetchTable(0);
  assert(table);
  table.StartOutlineTable().GetRowArray().Insert(1, 4);
  doc.SetRowFiltered(2, 2, 0, true);
  doc.ShowRows(2, 2, 0, false);
  expect(applyOutlineControl(controller.shell, 0, { columns: false, level: 0, entry: 0 }, 3)).toBe(
    false,
  );
  expect(table.RowHidden(3)).toBe(false);
  expect(applyOutlineControl(controller.shell, 0, { columns: false, level: 0, entry: 0 })).toBe(
    true,
  );
  expect(applyOutlineControl(controller.shell, 0, { columns: false, level: 1 })).toBe(true);
  expect(table.RowHidden(2)).toBe(true);
  expect(table.RowHidden(3)).toBe(false);
  expect(calcGridInsets(controller.viewData, 22).rowGutter).toBe(29);
  controller.viewData.GetOptions().SetOption(ViewOption.OUTLINER, false);
  expect(calcGridInsets(controller.viewData, 22).rowGutter).toBe(0);
  session.Close();
});
