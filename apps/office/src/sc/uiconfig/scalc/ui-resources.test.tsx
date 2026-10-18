/** @fileoverview Production Calc resource hierarchy and shared Writer menu/toolbar contracts. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../../browser/composition/calc-module";
import { CalcWorkbench } from "../../browser/presentation/calc-workbench";
import { getCalcCommandResource } from "./menubar/menubar";
import { calcStandardBarItems } from "./toolbar/standardbar";
afterEach(/** Releases mounted chrome. @returns Nothing. */ () => cleanup());
it("opens every source top menu with unavailable operations disabled and shared shortcut captions", /** Uses real production Sfx bindings and shared presenters. @returns Nothing. */ () => {
  const session = createCalcSession();
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  const labels = [
    "File",
    "Edit",
    "View",
    "Insert",
    "Format",
    "Styles",
    "Sheet",
    "Data",
    "Tools",
    "Window",
    "Help",
  ];
  for (const label of labels) {
    fireEvent.click(screen.getByRole("button", { name: label }));
    expect(screen.getAllByRole("menu").length).toBeGreaterThan(0);
    if (label === "File") {
      expect(screen.getByRole("menuitem", { name: "Open…" })).toBeEnabled();
      expect(screen.getByRole("menuitem", { name: "Open…" })).toHaveAttribute(
        "aria-keyshortcuts",
        "Ctrl+O",
      );
      expect(screen.getByRole("menuitem", { name: "Save As…" })).toHaveAttribute(
        "aria-keyshortcuts",
        "Ctrl+Shift+S",
      );
    }
    if (label === "Edit") expect(screen.getByRole("menuitem", { name: /^Cut/ })).toBeDisabled();
    fireEvent.keyDown(screen.getAllByRole("menu")[0] as HTMLElement, { key: "Escape" });
  }
  expect(getCalcCommandResource(".uno:About").label).toContain("Vite Office");
  expect(getCalcCommandResource(".uno:Bold").semantics).toBe("check");
  expect(calcStandardBarItems).toEqual([
    { kind: "command", commandId: ".uno:OpenFromCalc" },
    { kind: "separator" },
    { kind: "command", commandId: ".uno:Undo" },
    { kind: "command", commandId: ".uno:Redo" },
  ]);
  cleanup();
  session.Close();
});
