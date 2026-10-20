/** @fileoverview Real Wrap Text toolbar/slot, pending input, native selection/history and manual row geometry. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress, ScRange } from "../../inc/address";
import { ScLineBreakCell } from "../../inc/attrib";
import type { ScPatternAttr } from "../../inc/patattr";
import { ScInputMode } from "../../inc/global";
import { ScMarkData } from "../../inc/markdata";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxCallMode } from "../../../sfx2/source/control/bindings";
import { SfxStringItem } from "../../../svl/source/items/stritem";
afterEach(cleanup);
/** Reads the actual native cell attribute. @param s - Production session. @param col - Column. @param row - Row. @param tab - Sheet. @returns Actual wrap flag. */
function wrapped(s: ReturnType<typeof createCalcSession>, col = 0, row = 0, tab = 0): boolean {
  return (
    (
      s.controller.shell.GetDocument().GetPattern(new ScAddress(col, row, tab)) as ScPatternAttr
    ).GetItem(139) as ScLineBreakCell
  ).GetValue();
}
it("uses the existing Writer toolbar button and actual cell attribute, preserving manual row geometry through history", /** Exercises real shared controls and model. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    c.EnterString("First long word Second long word");
    c.CompleteRowHeight(1440);
    render(
      <CalcWorkbench
        controller={c}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    const button = screen.getByRole("button", { name: "Wrap Text" }),
      cell = screen.getByRole("gridcell", { name: "A1" });
    expect(button).toHaveClass("size-8", "rounded-md", "bg-white");
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(cell).toHaveStyle({ whiteSpace: "nowrap" });
    fireEvent.click(button);
    expect(wrapped(s)).toBe(true);
    expect(button).toHaveAttribute("aria-pressed", "true");
    expect(cell).toHaveStyle({ whiteSpace: "pre-wrap" });
    expect(c.shell.GetDocument().GetRowHeight(0, 0, false)).toBe(1440);
    act(
      /** Performs real history. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(wrapped(s)).toBe(false);
    expect(cell).toHaveStyle({ whiteSpace: "nowrap" });
    act(
      /** Performs real redo. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(wrapped(s)).toBe(true);
    expect(c.shell.GetDocument().GetRowHeight(0, 0, false)).toBe(1440);
    fireEvent.click(button);
    expect(wrapped(s)).toBe(false);
  } finally {
    s.Close();
  }
});
it("retains mixed-selection defaults, complete typed bools, native reset and rejected arguments", /** Exercises actual Sfx transport and history owners. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  try {
    expect(d.QueryState(".uno:WrapText")).toMatchObject({ enabled: true, checked: false });
    d.Execute(".uno:WrapText", true);
    c.Select(1, 0, true);
    expect(d.QueryState(".uno:WrapText").mixed).toBe(true);
    d.Execute(".uno:WrapText");
    expect([wrapped(s), wrapped(s, 1)]).toEqual([true, true]);
    d.Execute(".uno:WrapText", [new ScLineBreakCell(false)]);
    expect([wrapped(s), wrapped(s, 1)]).toEqual([false, false]);
    c.Undo();
    expect([wrapped(s), wrapped(s, 1)]).toEqual([true, true]);
    c.ResetAttributes();
    expect([wrapped(s), wrapped(s, 1)]).toEqual([false, false]);
    c.Undo();
    expect(wrapped(s)).toBe(true);
    expect(
      /** Supplies invalid native type at the browser boundary. @returns Dispatch. */ () =>
        d.Execute(".uno:WrapText", [new SfxStringItem(10230, "false")]),
    ).toThrow("native boolean");
    expect(wrapped(s)).toBe(true);
    expect(
      /** Rejects an unrelated typed item. @returns Dispatch. */ () =>
        d.Execute(".uno:WrapText", [new SfxStringItem(123, "bad")]),
    ).toThrow("native boolean");
  } finally {
    s.Close();
  }
});
it("keeps disjoint and grouped native marks while subtracting filtered rows", /** Uses original mark and operation owners. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    doc = c.shell.GetDocument(),
    marks = c.viewData.GetMarkData(),
    name = unicode("Second");
  try {
    doc.InsertTab(1, name);
    marks.SelectTable(1, true);
    marks.SetMultiMarkArea(new ScRange(0, 0, 0, 0, 2, 0));
    marks.SetMultiMarkArea(new ScRange(2, 4, 0, 2, 4, 0));
    doc.SetRowFiltered(1, 1, 0, true);
    const before = new ScMarkData(marks);
    s.frame.GetDispatcher().Execute(".uno:WrapText");
    expect([
      wrapped(s),
      wrapped(s, 0, 1),
      wrapped(s, 0, 2),
      wrapped(s, 2, 4),
      wrapped(s, 1, 4),
    ]).toEqual([true, false, true, true, false]);
    expect(wrapped(s, 0, 2, 1)).toBe(true);
    expect(marks.GetMultiMarkArea()).toEqual(before.GetMultiMarkArea());
    c.Undo();
    expect(wrapped(s, 2, 4)).toBe(false);
    c.Redo();
    expect(wrapped(s, 2, 4)).toBe(true);
  } finally {
    name.dispose();
    s.Close();
  }
});
it("commits genuine pending input, refuses unsupported input and retains original request completion", /** Checks actual source argument/no-argument API cases. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  try {
    c.StartInput(ScInputMode.SC_INPUT_TOP, "Plain pending input");
    const toggle = new SfxRequest(10230, [], SfxCallMode.API);
    expect(c.ExecuteWrapText(toggle)).toBe(true);
    expect(toggle.IsDone()).toBe(true);
    expect(toggle.GetArgs()[0]).toBeInstanceOf(ScLineBreakCell);
    expect(text(c.shell.GetDocument().GetSharedString(new ScAddress()).getString())).toBe(
      "Plain pending input",
    );
    const api = new SfxRequest(10230, [new ScLineBreakCell(false)], SfxCallMode.API);
    expect(c.ExecuteWrapText(api)).toBe(true);
    expect(api.IsDone()).toBe(false);
    const ordinary = new SfxRequest(10230, [
      new SfxStringItem(123, "unrelated"),
      new ScLineBreakCell(true),
    ]);
    ordinary.Done();
    expect(c.ExecuteWrapText(ordinary)).toBe(true);
    const record = new SfxRequest(10230, [new ScLineBreakCell(false)]);
    expect(c.ExecuteWrapText(record)).toBe(true);
    expect(record.IsDone()).toBe(true);
    c.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(A1)");
    const rejected = new SfxRequest(10230);
    expect(c.ExecuteWrapText(rejected)).toBe(false);
    expect(rejected.IsDone()).toBe(false);
    expect(wrapped(s)).toBe(false);
    c.Cancel();
  } finally {
    s.Close();
  }
});
