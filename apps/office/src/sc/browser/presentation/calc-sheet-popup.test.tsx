/** @fileoverview Native sheet-tab context resource,admission and shared Writer popup integration. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScInputMode } from "../../inc/global";
import {
  getCalcCommandResource,
  getCalcPopupCommandResource,
} from "../../uiconfig/scalc/menubar/menubar";
afterEach(/** Releases popup ownership and document clients. @returns Nothing. */ () => cleanup());
/** Mounts actual source sheets,bindings and shared controls. @returns Session. */
function fixture() {
  const s = createCalcSession();
  s.controller.InsertSheet();
  s.controller.InsertSheet();
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
it("opens the exact native popup and executes real group commands without changing document history", /** Unsupported native operations remain disabled through actual missing slots. @returns Nothing. */ () => {
  const s = fixture(),
    c = s.controller;
  act(
    /** Establishes a native selected group. @returns Nothing. */ () => {
      c.SelectAllTables();
    },
  );
  const generation = c.shell.GetContentGeneration(),
    count = c.shell.GetUndoManager().GetUndoActionCount(),
    tab = screen.getByRole("tab", { name: "Sheet1" });
  fireEvent.contextMenu(tab, { clientX: 20, clientY: 30 });
  const menu = screen.getByRole("menu", { name: "Calc sheet context menu" });
  expect(menu).toHaveFocus();
  expect(c.viewData.GetTabNumber()).toBe(2);
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1, 2]);
  expect(
    Array.from(menu.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"]')).map(
      /** Reads source order without presentation overrides. @param entry - Actual item. @returns Label. */ (
        entry,
      ) => entry.textContent,
    ),
  ).toEqual([
    "Insert Sheet…",
    "Delete Sheet…",
    "Rename Sheet…",
    "Duplicate Sheet",
    "Move or Copy Sheet…",
    "Select All Sheets",
    "Deselect All Sheets",
    "Protect Sheet…",
    "Hide Sheet",
    "Show Sheet…",
    "✓View Grid Lines",
    "Tab Color…",
    "Sheet Right-To-Left",
    "Sheet Events…",
  ]);
  expect(within(menu).getByRole("menuitemcheckbox", { name: "View Grid Lines" })).toBeChecked();
  expect(menu.querySelectorAll(":scope > [aria-hidden='true']")).toHaveLength(3);
  expect(within(menu).getByRole("menuitem", { name: "Insert Sheet…" })).toBeDisabled();
  expect(within(menu).getByRole("menuitem", { name: "Deselect All Sheets" })).toBeEnabled();
  fireEvent.click(within(menu).getByRole("menuitem", { name: "Deselect All Sheets" }));
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  expect(tab).toHaveFocus();
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([2]);
  fireEvent.contextMenu(screen.getByRole("tab", { name: "Sheet1" }));
  expect(c.viewData.GetTabNumber()).toBe(0);
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0]);
  expect(screen.getByRole("menuitem", { name: "Deselect All Sheets" })).toBeDisabled();
  fireEvent.click(screen.getByRole("menuitem", { name: "Select All Sheets" }));
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1, 2]);
  expect(c.shell.GetContentGeneration()).toBe(generation);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  expect(getCalcCommandResource(".uno:SetTabBgColor").label).toBe("Sheet Tab Color");
  expect(getCalcPopupCommandResource(".uno:SetTabBgColor").label).toBe("Tab Color");
  expect(getCalcPopupCommandResource(".uno:TableSelectAll").label).toBe("Select All Sheets");
  s.Close();
});
it("supports native keyboard invocation,Escape,outside focus and blank-strip context", /** Shared popup geometry and lifetime retain the actual focused sheet owner. @returns Nothing. */ () => {
  const s = fixture(),
    tab = screen.getByRole("tab", { name: "Sheet3" });
  tab.focus();
  fireEvent.keyDown(tab, { key: "ContextMenu" });
  expect(screen.getByRole("menu", { name: "Calc sheet context menu" })).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("menu", { name: "Calc sheet context menu" }), {
    key: "Escape",
  });
  expect(tab).toHaveFocus();
  fireEvent.keyDown(tab, { key: "F10", shiftKey: true });
  expect(screen.getByRole("menu", { name: "Calc sheet context menu" })).toBeInTheDocument();
  fireEvent.focus(screen.getByRole("textbox", { name: "Input line" }));
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  for (const event of [
    { key: "x" },
    { key: "ContextMenu", shiftKey: true },
    { key: "F10" },
    { key: "ContextMenu", ctrlKey: true },
    { key: "ContextMenu", metaKey: true },
    { key: "ContextMenu", altKey: true },
    { key: "ContextMenu", isComposing: true },
  ])
    fireEvent.keyDown(tab, event);
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  fireEvent.contextMenu(screen.getByRole("group", { name: "Sheet controls" }), {
    clientX: 50,
    clientY: 60,
  });
  expect(screen.getByRole("menu", { name: "Calc sheet context menu" })).toBeInTheDocument();
  fireEvent.mouseDown(screen.getByRole("grid"));
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  s.Close();
});
it("keeps formula and modal requests out of the popup and retains rejected unselected input", /** Admission follows original formula state and real current-core parsing failures. @returns Completion. */ async () => {
  const s = fixture(),
    c = s.controller,
    tab = screen.getByRole("tab", { name: "Sheet1" });
  act(
    /** Starts actual formula input. @returns Nothing. */ () =>
      c.StartInput(ScInputMode.SC_INPUT_TYPE, "=A1"),
  );
  fireEvent.contextMenu(tab);
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  expect(c.viewData.GetTabNumber()).toBe(2);
  act(
    /** Retains new negative-input formula mode. @returns Nothing. */ () => {
      c.Cancel();
      c.StartInput(ScInputMode.SC_INPUT_TYPE, "-2");
    },
  );
  fireEvent.contextMenu(tab);
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  act(
    /** Establishes unsupported nonformula text for unselected-sheet commit refusal. @returns Nothing. */ () => {
      c.Cancel();
      c.StartInput(ScInputMode.SC_INPUT_TABLE, "a\nb");
    },
  );
  fireEvent.contextMenu(tab);
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  expect(c.viewData.GetTabNumber()).toBe(2);
  expect(c.Input()).toBe("a\nb");
  expect(c.PrepareSheetContextMenu(99)).toBe(false);
  act(
    /** Commits plain input before a native unselected context switch. @returns Nothing. */ () => {
      c.Cancel();
      c.StartInput(ScInputMode.SC_INPUT_TYPE, "42");
    },
  );
  fireEvent.contextMenu(tab);
  expect(c.viewData.GetTabNumber()).toBe(0);
  expect(screen.getByRole("menu", { name: "Calc sheet context menu" })).toBeInTheDocument();
  await act(
    /** Opens the actual shared file dialog while the popup owns focus. @returns Completion. */ async () => {
      s.frame.GetDispatcher().Execute(".uno:OpenFromCalc");
      await Promise.resolve();
    },
  );
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  fireEvent.contextMenu(tab);
  expect(screen.queryByRole("menu", { name: "Calc sheet context menu" })).not.toBeInTheDocument();
  s.Close();
});
