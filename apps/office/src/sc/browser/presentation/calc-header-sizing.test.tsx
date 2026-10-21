/** @fileoverview Mounted native header resizing, actual grid geometry, source selection/history and genuine ODS reload. */
import { expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScInputMode } from "../../inc/global";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";

it("resizes actual columns and rows through shared tracking,retains marks,and replays native history and ODS geometry", /** The production UI has no independent dimension model. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.Header("column", 1);
    render(
      <CalcWorkbench
        controller={c}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    let boundary = screen.getByRole("button", { name: "Resize column B" });
    vi.spyOn(boundary.parentElement as HTMLElement, "getBoundingClientRect").mockReturnValue(
      new DOMRect(133, 22, 85, 22),
    );
    fireEvent.pointerDown(boundary, { pointerId: 1, button: 0, clientX: 217 });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 237 });
    expect(doc.GetColWidth(1, 0)).toBe(1280);
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 237 });
    expect(doc.GetColWidth(1, 0)).toBe(1590);
    expect(screen.getByRole("gridcell", { name: "B1" })).toHaveStyle({ width: "106px" });
    expect(c.viewData.GetMarkData().GetMarkArea().aStart.Col()).toBe(1);
    expect(c.viewData.GetMarkData().GetMarkArea().aEnd.Row()).toBe(doc.MaxRow());
    act(
      /** Replays actual source geometry history. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(doc.GetColWidth(1, 0)).toBe(1280);
    act(
      /** Reapplies actual source geometry history. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(doc.GetColWidth(1, 0)).toBe(1590);
    boundary = screen.getByRole("button", { name: "Resize row 1" });
    vi.spyOn(boundary.parentElement as HTMLElement, "getBoundingClientRect").mockReturnValue(
      new DOMRect(0, 100, 48, 17),
    );
    fireEvent.pointerDown(boundary, { pointerId: 2, button: 0, clientY: 116 });
    fireEvent.pointerMove(window, { pointerId: 2, clientY: 137 });
    expect(doc.GetRowHeight(0, 0, false)).toBe(256);
    fireEvent.pointerUp(window, { pointerId: 2, clientY: 138 });
    expect(doc.GetRowHeight(0, 0, false)).toBe(600);
    expect(screen.getByRole("gridcell", { name: "B1" })).toHaveStyle({ height: "40px" });
    const copy = await readOdsDocument(c.shell.SerializeOds());
    expect(copy.GetColWidth(1, 0)).toBe(1590);
    expect(copy.GetRowHeight(0, 0, false)).toBe(600);
    boundary = screen.getByRole("button", { name: "Resize column B" });
    fireEvent.pointerDown(boundary, { pointerId: 3, button: 0, clientX: 237 });
    fireEvent.pointerMove(window, { pointerId: 3, clientX: 120 });
    fireEvent.pointerUp(window, { pointerId: 3, clientX: 120 });
    expect(doc.ColHidden(1, 0)).toBe(true);
    expect(doc.GetColWidth(1, 0, false)).toBe(1590);
    expect(screen.queryByRole("button", { name: "Resize column B" })).not.toBeInTheDocument();
    act(
      /** Restores the hidden header through native undo. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(doc.ColHidden(1, 0)).toBe(false);
    expect(screen.getByRole("button", { name: "Resize column B" })).toBeInTheDocument();
  } finally {
    session.Close();
  }
});

it("prohibits sizing while an edit view owns a draft and restores tracking admission after cancellation", /** Matches native ResizeAllowed without silently committing user input. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    render(
      <CalcWorkbench
        controller={c}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    act(
      /** Starts the real edit view. @returns Nothing. */ () => {
        c.StartInput(ScInputMode.SC_INPUT_TABLE, "pending");
      },
    );
    expect(screen.getByRole("button", { name: "Resize column A" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Resize row 1" })).toBeDisabled();
    c.SetHeaderEntrySize(true, 0, 100);
    c.HideHeaderEntries(false, 0, 0);
    expect(doc.GetColWidth(0, 0)).toBe(1280);
    expect(doc.RowHidden(0, 0)).toBe(false);
    expect(c.inputText).toBe("pending");
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
    act(
      /** Cancels the real edit view. @returns Nothing. */ () => {
        c.Cancel();
      },
    );
    expect(screen.getByRole("button", { name: "Resize column A" })).toBeEnabled();
  } finally {
    session.Close();
  }
});
