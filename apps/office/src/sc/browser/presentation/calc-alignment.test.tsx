/** @fileoverview Actual shared Writer command widgets over Calc alignment items,selection and history. */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { calcAlignmentCommands } from "../../sdi/scalc";
import { ScInputMode } from "../../inc/global";
import { ScAddress } from "../../inc/address";
import { ScPatternAttr } from "../../inc/patattr";
import type { ScTable } from "../../inc/table";
import { SvxHorJustifyItem, SvxVerJustifyItem } from "../../../editeng/inc/justifyitem";
import { SvxCellHorJustify as H, SvxCellVerJustify as V } from "../../../editeng/inc/svxenum";
/** Reads original native alignment attributes. @param session - Genuine session. @param col - Column. @param row - Row. @param tab - Sheet. @returns Alignment pair. */
function alignment(
  session: ReturnType<typeof createCalcSession>,
  col = 0,
  row = 0,
  tab = 0,
): readonly number[] {
  const pattern = session.controller.shell
    .GetDocument()
    .GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr;
  return [
    (pattern.GetItem(129) as SvxHorJustifyItem).GetValue(),
    (pattern.GetItem(132) as SvxVerJustifyItem).GetValue(),
  ];
}
it("reuses shared buttons and Format menu with original toggle/explicit behavior,numeric defaults and native history", /** Exercises real UI and geometry styles. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller;
  try {
    c.EnterString("17");
    render(
      <CalcWorkbench
        controller={c}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    const a1 = screen.getByRole("gridcell", { name: "A1" }),
      left = screen.getByRole("button", { name: "Align Left" });
    expect(a1).toHaveStyle({ textAlign: "right" });
    expect(left).toHaveClass("size-8", "rounded-md", "bg-white");
    fireEvent.click(left);
    expect(alignment(session)).toEqual([H.Left, V.Standard]);
    expect(left).toHaveAttribute("aria-pressed", "true");
    expect(a1).toHaveStyle({ textAlign: "left" });
    fireEvent.click(left);
    expect(alignment(session)).toEqual([H.Standard, V.Standard]);
    expect(left).toHaveAttribute("aria-pressed", "false");
    expect(a1).toHaveStyle({ textAlign: "right" });
    fireEvent.click(screen.getByRole("button", { name: "Align Center" }));
    expect(a1).toHaveStyle({ textAlign: "center" });
    fireEvent.click(screen.getByRole("button", { name: "Align Top" }));
    expect(a1).toHaveStyle({ justifyContent: "flex-start" });
    fireEvent.click(screen.getByRole("button", { name: "Center Vertically" }));
    expect(a1).toHaveStyle({ justifyContent: "center" });
    fireEvent.click(screen.getByRole("button", { name: "Align Bottom" }));
    expect(a1).toHaveStyle({ justifyContent: "flex-end" });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(alignment(session)).toEqual([H.Center, V.Center]);
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(alignment(session)).toEqual([H.Center, V.Bottom]);
    for (let count = 0; count < 2; count++) {
      fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Align Text" }));
      fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Right" }));
      expect(alignment(session)).toEqual([H.Right, V.Bottom]);
    }
    expect(a1).toHaveStyle({ textAlign: "right" });
    act(
      /** Selects a real mixed pattern range. @returns Nothing. */ () => {
        c.Select(1, 0, true);
      },
    );
    const right = screen.getByRole("button", { name: "Align Right" });
    expect(right).toHaveAttribute("aria-pressed", "mixed");
    fireEvent.click(right);
    expect(right).toHaveAttribute("aria-pressed", "true");
  } finally {
    session.Close();
  }
});
it("preserves native slots,mixed/default state,no-op explicit items and failed-input admission", /** Exercises every consumed original toolbar and menu operation. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  try {
    for (const resource of calcAlignmentCommands) {
      expect(d.QueryDispatch(resource.id)?.slot.slotId).toBe(resource.slotId);
      d.Execute(resource.id);
      expect(c.GetAlignment(resource.axis)).toBe(resource.value);
      const before = c.shell.GetUndoManager().GetUndoActionCount();
      d.Execute(resource.id);
      expect(c.GetAlignment(resource.axis)).toBe(resource.toggle ? 0 : resource.value);
      if (!resource.toggle)
        expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(
          Math.min(before + 1, c.shell.GetUndoManager().GetMaxUndoActionCount()),
        );
    }
    c.Select(0, 0);
    c.SetAlignment("horizontal", H.Left, false);
    c.SetAlignment("vertical", V.Top, false);
    c.Select(1, 1, true);
    expect(c.GetAlignment("horizontal")).toBeUndefined();
    expect(c.GetAlignment("vertical")).toBeUndefined();
    expect(d.QueryState(".uno:AlignLeft").mixed).toBe(true);
    expect(d.QueryState(".uno:CommonAlignLeft").mixed).toBe(false);
    expect(d.QueryState(".uno:CommonAlignLeft").checked).toBe(false);
    d.Execute(".uno:AlignLeft");
    expect(c.GetAlignment("horizontal")).toBe(H.Left);
    d.Execute(".uno:AlignLeft");
    expect(c.GetAlignment("horizontal")).toBe(H.Standard);
    c.Undo();
    expect(c.GetAlignment("horizontal")).toBe(H.Left);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
    const count = c.shell.GetUndoManager().GetUndoActionCount();
    expect(c.SetAlignment("vertical", V.Center, true)).toBe(false);
    expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
    expect(c.GetAlignment("vertical")).toBeUndefined();
  } finally {
    session.Close();
  }
});
it("formats actual grouped full-axis sparse patterns and retains unrelated items and undo selection", /** Uses canonical native mark/attribute storage. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    c.SetFontSize(14);
    c.InsertSheet();
    c.SelectAllTables();
    c.Select(2, 7);
    c.MarkRows();
    expect(c.SetAlignment("horizontal", H.Right, false)).toBe(true);
    for (const tab of [0, 1]) {
      expect((doc.FetchTable(tab) as ScTable).GetAllocatedColumnsCount()).toBe(1);
      expect(alignment(session, doc.MaxCol(), 7, tab)[0]).toBe(H.Right);
      expect(alignment(session, 0, 6, tab)[0]).toBe(H.Standard);
    }
    c.Undo();
    expect(alignment(session, doc.MaxCol(), 7, 0)[0]).toBe(H.Standard);
    c.Redo();
    c.Select(3, 4);
    c.MarkColumns();
    c.SetAlignment("vertical", V.Center, false);
    expect(alignment(session, 3, doc.MaxRow(), 0)).toEqual([H.Standard, V.Center]);
    expect(alignment(session, 3, 7, 1)).toEqual([H.Right, V.Center]);
    c.Undo();
    expect(alignment(session, 3, 7, 1)).toEqual([H.Right, V.Standard]);
    c.Select(0, 0);
    expect(c.GetFontSize()).toBeUndefined();
    c.DeselectAllTables();
    c.SelectTab(0);
    expect(c.GetFontSize()).toBe(14);
    c.SetAlignment("horizontal", H.Center, false);
    expect(c.GetFontSize()).toBe(14);
    expect(doc.GetValue(new ScAddress())).toBe(0);
  } finally {
    session.Close();
  }
});
