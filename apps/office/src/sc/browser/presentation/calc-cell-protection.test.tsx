/** @fileoverview Mounted Calc cell protection commands, unlocked marks, and source sheet visibility. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { ScAddress } from "../../inc/address";
import { ScPatternAttr } from "../../inc/patattr";
import { ScProtectionAttr } from "../../inc/attrib";
import { ATTR_PROTECTION } from "../../inc/scitems";
import { ScTableProtection } from "../../source/core/data/tabprotection";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Releases the mount and real session. @returns Nothing. */ () => {
    cleanup();
    active?.Close();
    active = undefined;
  },
);

/** Mounts the actual Calc application. @returns Session. */
function mount() {
  active = createCalcSession();
  render(<CalcWorkbench {...active} />);
  return active;
}

/** Selects cells via the browser name box. @param address - Source range notation. @returns Nothing. */
function select(address: string): void {
  const name = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(name, { target: { value: address } });
  fireEvent.keyDown(name, { key: "Enter" });
}

/** Reads the current native check menu item. @returns Original toggle. */
function openProtectionToggle(): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  return screen.getByRole("menuitemcheckbox", { name: "Cell Protection" });
}

it("toggles the native protection item and retains the three visibility flags and attribute history", /** Runs the actual Edit menu command and request. @returns Nothing. */ () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const address = new ScAddress();
  const dispatcher = frame.GetDispatcher();

  act(
    /** Seeds the original independent hide flags. @returns Nothing. */ () => {
      doc.ApplyAttr(0, 0, 0, new ScProtectionAttr(true, true, true, true));
      controller.SyncSheetView();
    },
  );
  const command = openProtectionToggle();
  expect(command).toBeChecked();
  fireEvent.click(command);
  const unlocked = doc.GetPattern(address)?.GetItem(ATTR_PROTECTION) as ScProtectionAttr;
  expect(unlocked.GetProtection()).toBe(false);
  expect(unlocked.GetHideFormula()).toBe(true);
  expect(unlocked.GetHideCell()).toBe(true);
  expect(unlocked.GetHidePrint()).toBe(true);
  expect(dispatcher.QueryState(".uno:CellProtection").checked).toBe(false);

  act(
    /** Reverses and reapplies native attribute history. @returns Nothing. */ () => {
      expect(controller.Undo()).toBe(true);
      expect(dispatcher.QueryState(".uno:CellProtection").checked).toBe(true);
      expect(controller.Redo()).toBe(true);
    },
  );
  const request = new SfxRequest(26676, [new SfxBoolItem(26676, true)]);
  act(
    /** Sends an explicit argument to the source toggle-only case. @returns Nothing. */ () => {
      dispatcher.ExecuteRequest(request);
    },
  );
  expect(request.IsIgnored()).toBe(true);
  expect(dispatcher.QueryState(".uno:CellProtection").checked).toBe(false);
  const toggle = new SfxRequest(26676);
  act(
    /** Captures the native dual-item completion. @returns Nothing. */ () => {
      dispatcher.ExecuteRequest(toggle);
    },
  );
  expect(toggle.IsDone()).toBe(true);
  expect(toggle.GetArgs()).toEqual([
    new ScProtectionAttr(true, true, true, true),
    new SfxBoolItem(26676, true),
  ]);
});

it("selects unlocked source runs and keeps the existing sheet selection after an empty result", /** Checks the native command and tdf152327 empty-selection case. @returns Nothing. */ () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const marks = controller.viewData.GetMarkData();
  const cmd = frame.GetDispatcher();
  const baseline = controller.shell.GetUndoManager().GetUndoActionCount();
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Select Unprotected Cells" }));
  expect(marks.IsMarked()).toBe(false);
  expect([...marks]).toEqual([0]);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(baseline);
  act(
    /** Exercises real input after native empty selection. @returns Nothing. */ () => {
      expect(controller.EnterString("1")).toBe(true);
    },
  );
  expect(doc.GetValue(new ScAddress())).toBe(1);

  act(
    /** Creates two unlocked runs and sets the shared default column separately. @returns Nothing. */ () => {
      for (const [col, row] of [
        [0, 0],
        [0, 1],
      ] as const)
        doc.ApplyAttr(col, row, 0, new ScProtectionAttr(false, false, false, false));
      doc.ApplyAttr(1, 3, 0, new ScProtectionAttr(false, false, true, false));

      const delta = new ScPatternAttr(doc.getCellAttributeHelper());
      try {
        delta.ItemSetPut(new ScProtectionAttr(false, false, false, false));
        doc.FetchTable(0)?.GetDefaultColumnData().ApplyPatternArea(4, 4, delta);
      } finally {
        delta.Dispose();
      }
      const protection = new ScTableProtection();
      protection.setProtected(true);
      controller.GetViewShell().ProtectSheet(protection);
      cmd.Execute(".uno:SelectUnprotectedCells");
    },
  );
  expect(marks.IsCellMarked(0, 0)).toBe(true);
  expect(marks.IsCellMarked(0, 1)).toBe(true);
  expect(marks.IsCellMarked(0, 2)).toBe(false);
  expect(marks.IsCellMarked(1, 3)).toBe(true);
  const implicit = doc
    .GetPattern(new ScAddress(100, 4))
    ?.GetItem(ATTR_PROTECTION) as ScProtectionAttr;
  expect(implicit.GetProtection()).toBe(false);
  expect(marks.IsCellMarked(100, 4)).toBe(false);
  act(
    /** Keeps the selected hidden cell protected against input. @returns Nothing. */ () => {
      expect(controller.Select(1, 3)).toBe(true);
      expect(controller.EnterString("blocked")).toBe(false);
    },
  );
});

it("shows formula results but hides protected formula source and hidden cells in their original views", /** Exercises actual formula, input line and grid visibility. @returns Nothing. */ () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const input = screen.getByRole("textbox", { name: "Input line" });
  act(
    /** Captures native source values and protection flags. @returns Nothing. */ () => {
      controller.Select(0, 0);
      controller.EnterString("hidden cell");
      controller.Select(1, 0);
      controller.EnterString("=20+22");
      doc.ApplyAttr(0, 0, 0, new ScProtectionAttr(true, false, true, false));
      doc.ApplyAttr(1, 0, 0, new ScProtectionAttr(true, true, false, false));
      controller.SyncSheetView();
    },
  );
  expect(screen.getByRole("gridcell", { name: "A1 hidden cell" })).toBeVisible();
  select("B1");
  expect(input).toHaveValue("=20+22");
  act(
    /** Enables the original sheet protection. @returns Nothing. */ () => {
      const protection = new ScTableProtection();
      protection.setProtected(true);
      controller.GetViewShell().ProtectSheet(protection);
      controller.SyncSheetView();
    },
  );
  expect(screen.getByRole("gridcell", { name: "A1" })).toBeVisible();
  expect(screen.getByRole("gridcell", { name: "B1 42" })).toBeVisible();
  expect(input).toHaveValue("");
  act(
    /** Enables the native formula display mode. @returns Nothing. */ () => {
      frame.GetDispatcher().Execute(".uno:ToggleFormula");
    },
  );
  expect(screen.getByRole("gridcell", { name: "B1" })).toBeVisible();
  expect(doc.GetValue(new ScAddress(1, 0))).toBe(42);
});
