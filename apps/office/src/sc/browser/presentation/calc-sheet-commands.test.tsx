/** @fileoverview Real Sfx sheet commands,source grouping rules and shared Calc menu/keyboard integration. */
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScAddress } from "../../inc/address";
afterEach(/** Releases mounted presenters. @returns Nothing. */ () => cleanup());
it("uses source slots for native wrap,group extension and deselection without document history changes", /** Executes real dispatch against the actual mark and view owners. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  c.InsertSheet();
  c.InsertSheet();
  c.SelectTab(0);
  c.Select(4, 7);
  const generation = c.shell.GetContentGeneration(),
    history = c.shell.GetUndoManager().GetUndoActionCount(),
    dirty = c.shell.IsModified();
  expect(d.QueryDispatch(".uno:JumpToNextTable")?.slot.slotId).toBe(26543);
  expect(d.QueryDispatch(".uno:JumpToPrevTable")?.slot.slotId).toBe(26544);
  expect(d.QueryDispatch(".uno:JumpToNextTableSel")?.slot.slotId).toBe(26561);
  expect(d.QueryDispatch(".uno:JumpToPrevTableSel")?.slot.slotId).toBe(26562);
  expect(d.QueryDispatch(".uno:TableSelectAll")?.slot.slotId).toBe(26361);
  expect(d.QueryDispatch(".uno:TableDeselectAll")?.slot.slotId).toBe(26365);
  expect(d.QueryState(".uno:TableDeselectAll").enabled).toBe(false);
  d.Execute(".uno:JumpToPrevTable");
  expect(c.viewData.GetTabNumber()).toBe(2);
  d.Execute(".uno:JumpToNextTable");
  expect(c.Address()).toBe("E8");
  d.Execute(".uno:JumpToNextTableSel");
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1]);
  expect(d.QueryState(".uno:TableDeselectAll").enabled).toBe(true);
  d.Execute(".uno:JumpToPrevTableSel");
  expect(c.viewData.GetTabNumber()).toBe(0);
  d.Execute(".uno:TableSelectAll");
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 1, 2]);
  d.Execute(".uno:TableDeselectAll");
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0]);
  expect(c.shell.GetContentGeneration()).toBe(generation);
  expect(c.shell.GetUndoManager().GetUndoActionCount()).toBe(history);
  expect(c.shell.IsModified()).toBe(dirty);
  c.StartInput("top", "42");
  d.Execute(".uno:JumpToNextTable");
  expect(c.shell.GetDocument().GetValue(new ScAddress(4, 7, 0))).toBe(42);
  expect(c.viewData.GetTabNumber()).toBe(1);
  c.StartInput("top", "=SUM(A1)");
  d.Execute(".uno:JumpToNextTable");
  expect(c.viewData.GetTabNumber()).toBe(1);
  expect(c.mode).toBe("top");
  expect(c.error).not.toBe("");
  c.Cancel();
  c.SelectNextTab(0);
  s.Close();
});
it("executes native menu actions and document accelerators from grid and formula input", /** Shared menus consume the same real registered slots as keyboard actions. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  c.InsertSheet();
  c.InsertSheet();
  c.SelectTab(0);
  render(<CalcWorkbench controller={c} frame={s.frame} fileWorkflows={s.fileWorkflows} />);
  fireEvent.click(screen.getByRole("button", { name: "Sheet" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Navigate" }));
  expect(screen.getByRole("menuitem", { name: "To Next Sheet" })).toHaveAttribute(
    "aria-keyshortcuts",
    "Ctrl+PAGEDOWN",
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "To Next Sheet" }));
  expect(screen.getByRole("tab", { name: "Sheet2" })).toHaveAttribute("aria-current", "page");
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select to Previous Sheet" }));
  expect(screen.getByRole("tab", { name: "Sheet2" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("tab", { name: "Sheet1" })).toHaveAttribute("aria-selected", "true");
  fireEvent.click(screen.getByRole("button", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select All Sheets" }));
  expect(screen.getAllByRole("tab", { selected: true })).toHaveLength(3);
  fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown", ctrlKey: true });
  expect(c.viewData.GetTabNumber()).toBe(1);
  expect(screen.getAllByRole("tab", { selected: true })).toHaveLength(1);
  const line = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.focus(line);
  fireEvent.change(line, { target: { value: "9" } });
  fireEvent.keyDown(line, { key: "PageUp", metaKey: true });
  expect(c.viewData.GetTabNumber()).toBe(0);
  expect(c.shell.GetDocument().GetValue(new ScAddress(0, 0, 1))).toBe(9);
  fireEvent.keyDown(screen.getByRole("grid"), { key: "PageUp", ctrlKey: true });
  expect(c.viewData.GetTabNumber()).toBe(2);
  fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown", ctrlKey: true, shiftKey: true });
  expect(c.viewData.GetTabNumber()).toBe(2);
  fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown", ctrlKey: true, altKey: true });
  expect(c.viewData.GetTabNumber()).toBe(2);
  cleanup();
  s.Close();
});
