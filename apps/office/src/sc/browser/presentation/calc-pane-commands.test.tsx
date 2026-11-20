/** @fileoverview Native Calc window freeze and split command regressions. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxInt32Item } from "../../../svl/source/items/intitem";
import { SheetPane, SheetSplitMode } from "../../source/core/data/document.sheet-visibility";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(/** Releases the mounted workbench. @returns Nothing. */ () => cleanup());

it("opens Freeze First Row from View and keeps the lower origin when row one was above the viewport", /** Exercises the upstream off-screen first-row case and scoped view state. @returns Nothing. */ () => {
  const session = createCalcSession();
  const { controller: c, frame, fileWorkflows, sheetWorkflows } = session;
  c.viewData.SetUnsplitOrigin(0, 30);
  c.Select(0, 36);
  render(<CalcWorkbench controller={c} {...{ frame, fileWorkflows, sheetWorkflows }} />);
  const history = c.shell.GetUndoManager().GetUndoActionCount();
  fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Freeze Cells" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Freeze First Row" }));
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    horizontalMode: SheetSplitMode.NONE,
    verticalMode: SheetSplitMode.FIX,
    verticalPosition: 1,
    first: [0, 0],
    second: [0, 30],
    activePane: SheetPane.BOTTOMLEFT,
  });
  expect(c.Address()).toBe("A37");
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(history);
  expect(c.shell.IsModified()).toBe(true);
  fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
  const freeze = screen.getByRole("menuitemcheckbox", { name: "Freeze Panes" });
  expect(freeze).toBeChecked();
  fireEvent.click(freeze);
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    verticalMode: SheetSplitMode.NONE,
    first: [0, 0],
    second: [0, 0],
  });
  session.Close();
});

it("accepts the native row index and keeps the independent fixed column", /** Verifies typed row counts, source clamping, and view state isolation. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  expect(d.QueryDispatch(".uno:FreezePanesRow")?.slot.slotId).toBe(26184);
  d.ExecuteRequest(new SfxRequest(26184, [new SfxInt32Item(21160, 4)]));
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    verticalMode: SheetSplitMode.FIX,
    verticalPosition: 4,
    second: [0, 4],
  });
  d.Execute(".uno:FreezePanesColumn");
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    horizontalMode: SheetSplitMode.FIX,
    horizontalPosition: 1,
    verticalMode: SheetSplitMode.FIX,
    verticalPosition: 4,
  });
  d.ExecuteRequest(new SfxRequest(26184, [new SfxInt32Item(21160, -1)]));
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    horizontalMode: SheetSplitMode.FIX,
    verticalMode: SheetSplitMode.NONE,
  });
  c.InsertSheet();
  expect(c.viewData.GetPaneLayout()).toBeUndefined();
  c.SelectTab(0);
  expect(c.viewData.GetPaneLayout()?.horizontalPosition).toBe(1);
  session.Close();
});

it("ports tdf107994 GoToStart and converts normal and frozen split modes", /** Verifies source cursor and window transitions using a measured grid. @returns Nothing. */ () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  c.MeasureViewport(0, 0, 820, 690);
  c.Select(3, 4);
  d.Execute(".uno:GoToStart");
  expect(c.Address()).toBe("A1");
  c.Select(2, 2);
  d.Execute(".uno:FreezePanes");
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    horizontalMode: SheetSplitMode.FIX,
    horizontalPosition: 2,
    verticalMode: SheetSplitMode.FIX,
    verticalPosition: 2,
    activePane: SheetPane.BOTTOMRIGHT,
  });
  c.Select(3, 4);
  d.Execute(".uno:GoToStart");
  expect(c.Address()).toBe("C3");
  d.Execute(".uno:FreezePanes");
  d.Execute(".uno:GoToStart");
  expect(c.Address()).toBe("A1");
  c.Select(2, 2);
  d.Execute(".uno:SplitWindow");
  expect(d.QueryState(".uno:SplitWindow").checked).toBe(true);
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    horizontalMode: SheetSplitMode.NORMAL,
    verticalMode: SheetSplitMode.NORMAL,
    second: [2, 2],
  });
  d.Execute(".uno:FreezePanes");
  expect(c.viewData.GetPaneLayout()).toMatchObject({
    horizontalMode: SheetSplitMode.FIX,
    horizontalPosition: 2,
    verticalMode: SheetSplitMode.FIX,
    verticalPosition: 2,
  });
  d.Execute(".uno:SplitWindow");
  expect(d.QueryState(".uno:SplitWindow").checked).toBe(true);
  d.Execute(".uno:SplitWindow");
  expect(d.QueryState(".uno:SplitWindow").checked).toBe(false);
  expect(c.viewData.GetActivePart()).toBe(SheetPane.BOTTOMLEFT);
  session.Close();
});
