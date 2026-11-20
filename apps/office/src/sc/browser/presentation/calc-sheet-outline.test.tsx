/** @fileoverview Production Calc manual outline commands and model history. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ScRange } from "../../inc/address";
import { changeOutlineDetail } from "../../source/ui/docshell/olinefun";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(/** Releases the UI after each test. @returns Nothing. */ () => cleanup());

/** Opens the source outline submenu. @param label - Exact command label. @returns Native menu button. */
function command(label: string): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Data" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Group and Outline" }));
  return screen.getByRole("menuitem", { name: label });
}

/** Replaces the marked block while retaining the actual Calc view. @param session - Existing document session. @param from - Lower coordinate. @param to - Upper coordinate. @returns Nothing. */
function mark(
  session: ReturnType<typeof createCalcSession>,
  from: [number, number],
  to: [number, number],
): void {
  const view = session.controller.viewData,
    marks = view.GetMarkData();
  marks.ResetMark();
  marks.SetMarkArea(new ScRange(...from, view.GetTabNumber(), ...to, view.GetTabNumber()));
}

it("groups rows through the native radio dialog and shows, hides and clears details with undo", /** Verifies actual menu placements, modal focus, geometry, and history. @returns Completion. */ async () => {
  const s = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = s;
  mark(s, [0, 1], [2, 3]);
  const doc = controller.shell.GetDocument();
  const sheet = doc.FetchTable(0);
  render(<CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />);
  fireEvent.click(command("Group…"));
  const group = screen.getByRole("dialog", { name: "Group" });
  expect(within(group).getByRole("group", { name: "Include" })).toBeInTheDocument();
  expect(within(group).getByRole("radio", { name: "Rows" })).toBeChecked();
  expect(within(group).getByRole("radio", { name: "Rows" })).toHaveFocus();
  await act(
    /** Groups rows from the selected range. @returns Completion. */ async () => {
      fireEvent.click(within(group).getByRole("button", { name: "OK" }));
    },
  );
  expect(sheet?.GetOutlineTable()?.GetRowArray().GetEntryByPos(0, 2)).toMatchObject({
    start: 1,
    end: 3,
  });
  expect(screen.getByRole("grid")).toHaveFocus();
  fireEvent.click(command("Hide Details"));
  expect(sheet?.RowHidden(2)).toBe(true);
  expect(sheet?.RowHidden(4)).toBe(false);
  fireEvent.click(command("Show Details"));
  expect(sheet?.RowHidden(2)).toBe(false);
  act(
    /** Restores the collapsed visibility. @returns Nothing. */ () => {
      controller.Undo();
    },
  );
  expect(sheet?.RowHidden(2)).toBe(true);
  fireEvent.click(command("Remove Outline"));
  expect(sheet?.GetOutlineTable()).toBeUndefined();
  expect(sheet?.RowHidden(2)).toBe(false);
  act(
    /** Restores groups and their hidden rows. @returns Nothing. */ () => {
      controller.Undo();
    },
  );
  expect(sheet?.GetOutlineTable()?.GetRowArray().GetEntryByPos(0, 2)?.hidden).toBe(true);
  expect(sheet?.RowHidden(2)).toBe(true);
  s.Close();
});

it("ungroups the touched level and promotes its nested groups on the chosen axis", /** Covers the native RowOrCol item and nested undo history. @returns Completion. */ async () => {
  const s = createCalcSession(),
    d = s.frame.GetDispatcher();
  const sheet = s.controller.shell.GetDocument().FetchTable(0);
  mark(s, [1, 0], [7, 2]);
  const outer = d.Execute(".uno:Group", "C");
  if (outer.status !== "executed") throw new Error("Outer Group disabled");
  await outer.value;
  mark(s, [3, 0], [5, 2]);
  const inner = d.Execute(".uno:Group", "C");
  if (inner.status !== "executed") throw new Error("Inner Group disabled");
  await inner.value;
  expect(sheet?.GetOutlineTable()?.GetColArray().GetDepth()).toBe(2);
  mark(s, [1, 0], [7, 2]);
  const remove = d.Execute(".uno:Ungroup", "C");
  if (remove.status !== "executed") throw new Error("Ungroup disabled");
  await remove.value;
  expect(sheet?.GetOutlineTable()?.GetColArray().GetEntries(0)).toMatchObject([
    { start: 3, end: 5 },
  ]);
  expect(sheet?.GetOutlineTable()?.GetColArray().GetDepth()).toBe(1);
  s.controller.Undo();
  expect(sheet?.GetOutlineTable()?.GetColArray().GetDepth()).toBe(2);
  s.controller.Redo();
  expect(sheet?.GetOutlineTable()?.GetColArray().GetDepth()).toBe(1);
  s.Close();
});

it("preserves filtered rows on outline expansion and uses the native outer hull of matching groups", /** Checks source visibility semantics and undo over segmented rows. @returns Nothing. */ () => {
  const s = createCalcSession(),
    shell = s.controller.shell;
  const doc = shell.GetDocument(),
    sheet = doc.FetchTable(0);
  sheet?.StartOutlineTable().GetRowArray().Insert(1, 2, true);
  sheet?.StartOutlineTable().GetRowArray().Insert(5, 6, true);
  doc.ShowRows(1, 6, 0, false);
  doc.SetRowFiltered(2, 2, 0, true);
  expect(changeOutlineDetail(shell, new ScRange(0, 1, 0, 0, 6, 0), "show")).toBe(true);
  expect(doc.RowHidden(1, 0)).toBe(false);
  expect(doc.RowFiltered(2, 0)).toBe(true);
  expect(doc.RowHidden(2, 0)).toBe(true);
  expect(doc.RowHidden(3, 0)).toBe(false);
  expect(doc.RowHidden(6, 0)).toBe(false);
  s.controller.Undo();
  expect(doc.RowHidden(3, 0)).toBe(true);
  expect(doc.RowFiltered(2, 0)).toBe(true);
  s.Close();
});
