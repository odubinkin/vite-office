/** @fileoverview Modal cancellation must return focus after the actual grid background leaves inert state. */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
afterEach(cleanup);
for (const finish of ["Escape", "Cancel", "OK"] as const) {
  it(`restores actual grid focus after inert removal on Go to Sheet ${finish}`, /** Records real DOM focus events rather than stubbing native focus behavior. @returns Completion. */ async () => {
    const s = createCalcSession(),
      c = s.controller;
    try {
      c.Select(0, 0);
      c.Select(2, 2, true);
      render(
        <CalcWorkbench
          controller={c}
          frame={s.frame}
          fileWorkflows={s.fileWorkflows}
          sheetWorkflows={s.sheetWorkflows}
        />,
      );
      const grid = screen.getByRole("grid");
      grid.focus();
      fireEvent.click(screen.getByRole("menuitem", { name: "Sheet" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Navigate" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Go to Sheet…" }));
      const dialog = screen.getByRole("dialog", { name: "Go to Sheet" }),
        mask = screen.getByRole("textbox", { name: "Type a Sheet Name" });
      expect(mask).toHaveFocus();
      expect(grid.closest("[inert]")).not.toBeNull();
      const inertAtFocus: boolean[] = [];
      /** Observes the actual DOM ownership at focus time. @returns Nothing. */
      function focused() {
        inertAtFocus.push(grid.closest("[inert]") !== null);
      }
      grid.addEventListener("focus", focused);
      if (finish === "Escape") fireEvent.keyDown(mask, { key: "Escape" });
      else fireEvent.click(screen.getByRole("button", { name: finish }));
      await waitFor(
        /** Waits for actual modal destruction. @returns Nothing. */ () =>
          expect(dialog).not.toBeInTheDocument(),
      );
      expect(grid).toHaveFocus();
      expect(inertAtFocus).toEqual([false]);
      grid.removeEventListener("focus", focused);
      if (finish !== "OK") expect(c.viewData.GetMarkData().IsMarked()).toBe(true);
    } finally {
      s.Close();
    }
  });
}
