/** @fileoverview Source Calc sheet visibility, selection and color command acceptance. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxIntegerListItem } from "../../../svl/source/items/ilstitem";
import { COL_AUTO, COL_BLUE, COL_YELLOW } from "../../../tools/inc/color";
import { FID_TAB_SET_TAB_BG_COLOR, calcSheetCommands } from "../../sdi/scalc";
import { ScTableProtection } from "../../source/core/data/tabprotection";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(/** Releases mounted dialogs. @returns Nothing. */ () => cleanup());

/** Opens a real workbench with three sheets. @returns Calc session. */
function fixture() {
  const session = createCalcSession();
  const { controller, frame, fileWorkflows, sheetWorkflows } = session;
  controller.InsertSheet();
  controller.InsertSheet();
  controller.SelectTab(0);
  render(<CalcWorkbench {...{ controller, frame, fileWorkflows, sheetWorkflows }} />);
  return session;
}

/** Opens a source popup command on a visible sheet. @param tab - Sheet name. @param command - Popup label. @returns Nothing. */
function choose(tab: string, command: string): void {
  fireEvent.contextMenu(screen.getByRole("tab", { name: tab }));
  const menu = screen.getByRole("menu", { name: "Calc sheet context menu" });
  fireEvent.click(within(menu).getByRole("menuitem", { name: command }));
}

/** Responds to a pending source dialog. @param dialog - Current dialog. @param button - Response. @returns Completion. */
async function respond(dialog: HTMLElement, button: string): Promise<void> {
  await act(
    /** Drains the native async response. @returns Completion. */ async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: button }));
    },
  );
}

it("hides the marked sheets, preserves a visible sheet, and shows multiple sheets in list order", /** Checks popup dispatch, first selection, cancellation and visibility undo/redo. @returns Completion. */ async () => {
  const session = fixture(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  const doc = c.shell.GetDocument();
  act(/** Groups the first two sheets. @returns Nothing. */ () => c.SelectTab(1, true));
  choose("Sheet1", "Hide Sheet");
  expect(screen.getAllByRole("tab")).toHaveLength(1);
  expect(c.viewData.GetTabNumber()).toBe(2);
  expect(d.QueryState(".uno:Hide").enabled).toBe(false);
  expect(d.QueryState(".uno:Show").enabled).toBe(true);
  const generation = c.shell.GetContentGeneration();
  choose("Sheet3", "Show Sheet…");
  let dialog = screen.getByRole("dialog", { name: "Show Sheet" });
  let list = within(dialog).getByRole<HTMLSelectElement>("listbox", { name: "Hidden Sheets" });
  expect(list).toHaveFocus();
  expect(
    [...list.selectedOptions].map(
      /** Reads the sheet label. @param option - Sheet option. @returns Tab name. */ (option) =>
        option.text,
    ),
  ).toEqual(["Sheet1"]);
  await respond(dialog, "Cancel");
  expect(screen.getByRole("grid")).toHaveFocus();
  expect(c.shell.GetContentGeneration()).toBe(generation);
  choose("Sheet3", "Show Sheet…");
  dialog = screen.getByRole("dialog", { name: "Show Sheet" });
  list = within(dialog).getByRole<HTMLSelectElement>("listbox");
  within(list).getByRole<HTMLOptionElement>("option", { name: "Sheet2" }).selected = true;
  await respond(dialog, "OK");
  expect(screen.getAllByRole("tab")).toHaveLength(3);
  expect(c.viewData.GetTabNumber()).toBe(1);
  act(/** Reverses the show command. @returns Changed. */ () => c.Undo());
  expect(doc.IsVisible(0)).toBe(false);
  expect(doc.IsVisible(1)).toBe(false);
  expect(c.viewData.GetTabNumber()).toBe(2);
  act(/** Reapplies the show command. @returns Changed. */ () => c.Redo());
  expect(screen.getAllByRole("tab")).toHaveLength(3);
  expect(c.viewData.GetTabNumber()).toBe(1);
  session.Close();
});

it("selects sheets from the native Edit submenu without adding history", /** Checks admission of hidden marks and the visible fallback. @returns Completion. */ async () => {
  const session = fixture(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  choose("Sheet1", "Hide Sheet");
  const generation = c.shell.GetContentGeneration();
  await act(
    /** Executes the original selection slot with only a hidden sheet. @returns Completion. */ async () => {
      const result = d.ExecuteRequest(
        new SfxRequest(calcSheetCommands.select.slotId, [
          new SfxIntegerListItem(calcSheetCommands.select.slotId, [0]),
        ]),
      );
      if (result.status !== "executed") throw new Error("Select Sheets did not execute.");
      await result.value;
    },
  );
  expect(c.viewData.GetTabNumber()).toBe(1);
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([1]);
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  const selectSheets = screen.getByRole("menuitem", { name: "Select Sheets…" });
  expect(selectSheets).toBeEnabled();
  fireEvent.click(selectSheets);
  const dialog = screen.getByRole("dialog", { name: "Select Sheets" });
  const list = within(dialog).getByRole<HTMLSelectElement>("listbox", { name: "Selected sheets" });
  expect(
    [...list.options].map(
      /** Reads the sheet label. @param option - Sheet option. @returns Tab name. */ (option) =>
        option.text,
    ),
  ).toEqual(["Sheet1", "Sheet2", "Sheet3"]);
  const first = within(list).getByRole<HTMLOptionElement>("option", { name: "Sheet1" });
  const second = within(list).getByRole<HTMLOptionElement>("option", { name: "Sheet2" });
  const third = within(list).getByRole<HTMLOptionElement>("option", { name: "Sheet3" });
  expect(second.selected).toBe(true);
  first.selected = true;
  second.selected = false;
  third.selected = true;
  await respond(dialog, "OK");
  expect(c.viewData.GetTabNumber()).toBe(2);
  expect([...c.viewData.GetMarkData().GetSelectedTabs()]).toEqual([0, 2]);
  expect(d.QueryState(".uno:Show").enabled).toBe(false);
  expect(d.QueryState(".uno:Hide").enabled).toBe(false);
  expect(c.shell.GetContentGeneration()).toBe(generation);
  session.Close();
});

it("ports testSetBackgroundColor and restores per-sheet tab colors for a group", /** Uses actual typed slots, undo, palette selection and protection. @returns Completion. */ async () => {
  const session = fixture(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  const doc = c.shell.GetDocument();
  for (const color of [COL_YELLOW, COL_BLUE]) {
    await act(
      /** Applies the native typed color argument. @returns Completion. */ async () => {
        d.ExecuteRequest(
          new SfxRequest(calcSheetCommands.color.slotId, [
            new SvxColorItem(color, FID_TAB_SET_TAB_BG_COLOR),
          ]),
        );
      },
    );
    expect(doc.GetTabBgColor(0).equals(color)).toBe(true);
  }
  act(/** Restores first color. @returns Changed. */ () => c.Undo());
  expect(doc.GetTabBgColor(0).equals(COL_YELLOW)).toBe(true);
  act(/** Reapplies second color. @returns Changed. */ () => c.Redo());
  expect(doc.GetTabBgColor(0).equals(COL_BLUE)).toBe(true);
  const protection = new ScTableProtection();
  protection.setProtected(true);
  act(
    /** Protects Sheet2 while grouping all sheets from Sheet1. @returns Nothing. */ () => {
      doc.SetTabProtection(1, protection);
      c.SelectAllTables();
    },
  );
  const generation = c.shell.GetContentGeneration();
  choose("Sheet1", "Tab Color…");
  let dialog = screen.getByRole("dialog", { name: "Tab Color" });
  await respond(dialog, "Cancel");
  expect(c.shell.GetContentGeneration()).toBe(generation);
  choose("Sheet1", "Tab Color…");
  dialog = screen.getByRole("dialog", { name: "Tab Color" });
  expect(within(dialog).getByRole("button", { name: "Default" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(within(dialog).getByRole("radio", { name: "#ff0000" }));
  await respond(dialog, "OK");
  expect(doc.GetTabBgColor(0).toUInt32()).toBe(0xff0000);
  expect(doc.GetTabBgColor(1).equals(COL_AUTO)).toBe(true);
  expect(doc.GetTabBgColor(2).toUInt32()).toBe(0xff0000);
  act(/** Restores both original values. @returns Changed. */ () => c.Undo());
  expect(doc.GetTabBgColor(0).equals(COL_BLUE)).toBe(true);
  expect(doc.GetTabBgColor(2).equals(COL_AUTO)).toBe(true);
  act(/** Sets protected sheet as active. @returns Nothing. */ () => c.SelectTab(1));
  expect(d.QueryState(".uno:SetTabBgColor").enabled).toBe(false);
  session.Close();
});
