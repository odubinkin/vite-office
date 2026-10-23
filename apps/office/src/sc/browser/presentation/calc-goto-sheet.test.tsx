/** @fileoverview Source Go to Sheet UI and asynchronous Sfx contract on real Calc document/view owners. */
import { ScInputMode } from "../../inc/global";
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import type { CommandDispatchResult } from "../../../sfx2/source/control/dispatch";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { ScAddress } from "../../inc/address";
import { ScGoToTabDlg } from "./ScGoToTabDlg";
afterEach(/** Releases mounted dialogs. @returns Nothing. */ () => cleanup());
/** Requires actual Sfx execution and waits for its asynchronous boundary. @param result - Real dispatch result. @returns Completion. */
async function completed(result: CommandDispatchResult<unknown>): Promise<void> {
  if (result.status !== "executed") throw new Error(`Expected execution,got ${result.status}`);
  await result.value;
}
/** Opens the actual source menu placement. @returns Nothing. */
function open() {
  fireEvent.click(screen.getByRole("menuitem", { name: "Sheet" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Navigate" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Go to Sheet…" }));
}
it("opens the native dialog through the shared menu,filters case-sensitively,and applies a real selected sheet", /** Exercises source mask/list/result semantics and modal guards. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller;
  c.InsertSheet();
  c.InsertSheet();
  c.SelectTab(0);
  c.Select(4, 7);
  render(
    <CalcWorkbench
      controller={c}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  open();
  const mask = screen.getByRole("textbox", { name: "Type a Sheet Name" });
  expect(mask).toHaveFocus();
  expect(screen.getByRole("option", { name: "Sheet1" })).toHaveAttribute("aria-selected", "true");
  expect(screen.getByRole("grid").closest("[inert]")).toHaveAttribute("inert");
  expect(within(screen.getByRole("dialog")).getByRole("button", { name: "Help" })).toBeDisabled();
  fireEvent.keyDown(mask, { key: "PageDown", ctrlKey: true });
  expect(c.viewData.GetTabNumber()).toBe(0);
  fireEvent.change(mask, { target: { value: "sheet" } });
  expect(within(screen.getByRole("listbox")).queryAllByRole("option")).toHaveLength(0);
  fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" });
  fireEvent.change(mask, { target: { value: "Sheet" } });
  expect(within(screen.getByRole("listbox")).getAllByRole("option")).toHaveLength(3);
  expect(
    within(screen.getByRole("listbox"))
      .getAllByRole("option")
      .every(
        /** Checks native rebuilt rows have no selection. @param row - Source row. @returns Deselected. */ (
          row,
        ) => row.getAttribute("aria-selected") === "false",
      ),
  ).toBe(true);
  const list = screen.getByRole("listbox");
  for (const key of ["ArrowUp", "ArrowDown", "End", "Home", "x"]) fireEvent.keyDown(list, { key });
  fireEvent.change(mask, { target: { value: "3" } });
  fireEvent.click(screen.getByRole("option", { name: "Sheet3" }));
  expect(list).toHaveFocus();
  fireEvent.keyDown(list, { key: "Enter" });
  await waitFor(
    /** Waits for original async command completion. @returns Assertion. */ () =>
      expect(c.viewData.GetTabNumber()).toBe(2),
  );
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByRole("grid")).toHaveFocus();
  open();
  fireEvent.doubleClick(screen.getByRole("option", { name: "Sheet1" }));
  await waitFor(
    /** Waits for actual per-sheet cursor restoration. @returns Assertion. */ () =>
      expect(c.Address()).toBe("E8"),
  );
  open();
  fireEvent.change(screen.getByRole("textbox", { name: "Type a Sheet Name" }), {
    target: { value: "absent" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  await waitFor(
    /** Empty acceptance has no native target. @returns Assertion. */ () =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(c.viewData.GetTabNumber()).toBe(0);
  for (const control of ["Cancel", "Close", "Escape"]) {
    open();
    if (control === "Escape") fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    else fireEvent.click(screen.getByRole("button", { name: control }));
    await waitFor(
      /** Waits for source cancellation. @returns Assertion. */ () =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
  }
  cleanup();
  s.Close();
});
it("retains one-based Nr requests,typed UInt16 items,invalid-argument errors and cancellation on close", /** Uses actual dispatcher and async dialog owner. @returns Completion. */ async () => {
  const s = createCalcSession(),
    c = s.controller,
    d = s.frame.GetDispatcher();
  c.InsertSheet();
  c.SelectTab(0);
  expect(d.QueryDispatch(".uno:JumpToTable")?.slot.slotId).toBe(26042);
  await completed(d.Execute(".uno:JumpToTable", { Nr: 2 }));
  expect(c.viewData.GetTabNumber()).toBe(1);
  await completed(
    d.ExecuteRequest(
      new SfxRequest(26042, [new SfxUInt16Item(26041, 2), new SfxUInt16Item(26042, 1)]),
    ),
  );
  expect(c.viewData.GetTabNumber()).toBe(0);
  for (const Nr of [0, 9]) {
    await completed(d.Execute(".uno:JumpToTable", { Nr }));
    expect(c.viewData.GetTabNumber()).toBe(0);
  }
  for (const value of [null, {}, "1", { Nr: "2" }, { Nr: -1 }, { Nr: 1.5 }, { Nr: 65536 }]) {
    await completed(d.Execute(".uno:JumpToTable", value));
    expect(d.GetLastCommandError()?.error).toContain("unsigned16 Nr");
  }
  await completed(d.ExecuteRequest(new SfxRequest(26042, [new SfxStringItem(26042, "2")])));
  expect(d.GetLastCommandError()?.error).toContain("unsigned16 Nr");
  await completed(d.ExecuteRequest(new SfxRequest(26042, [new SfxUInt16Item(26041, 2)])));
  expect(d.GetLastCommandError()?.error).toContain("unsigned16 Nr");
  c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
  await completed(d.Execute(".uno:JumpToTable"));
  expect(s.sheetWorkflows.dialogs.GetSnapshot()).toBeUndefined();
  expect(c.mode).toBe(ScInputMode.SC_INPUT_TOP);
  c.Cancel();
  c.StartInput(ScInputMode.SC_INPUT_TOP, "42");
  const pending = d.Execute(".uno:JumpToTable");
  expect(c.shell.GetDocument().GetValue(new ScAddress())).toBe(42);
  expect(d.QueryState(".uno:JumpToTable").enabled).toBe(false);
  expect(d.Execute(".uno:JumpToTable").status).toBe("disabled");
  s.Close();
  await completed(pending);
  expect(s.sheetWorkflows.dialogs.GetSnapshot()).toBeUndefined();
});
it("returns source single-list rows to keyboard selection without fabricating document state", /** Exercises native single-list boundaries independently of the source document. @returns Nothing. */ () => {
  render(
    <ScGoToTabDlg
      names={["A", "B"]}
      selectedName="A"
      onCancel={/** Retains test-only cancellation. @returns Nothing. */ () => undefined}
      onSubmit={/** Retains test-only acceptance. @returns Nothing. */ () => undefined}
    />,
  );
  const list = screen.getByRole("listbox");
  for (const key of ["End", "ArrowDown", "Home", "ArrowUp"]) fireEvent.keyDown(list, { key });
  expect(screen.getByRole("option", { name: "A" })).toHaveAttribute("aria-selected", "true");
  act(
    /** Releases the renderer before the isolated modal ends. @returns Nothing. */ () => cleanup(),
  );
});
