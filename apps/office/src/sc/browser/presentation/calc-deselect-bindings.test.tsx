/** @fileoverview Actual Sfx accelerator reconfiguration owns the grid ShiftBackspace route. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { createCalcInterface } from "../../sdi/scalc";
import { createSfxShell } from "../../../sfx2/source/control/shell";
afterEach(cleanup);
for (const replacement of [undefined, ".uno:SelectRow", "original"] as const) {
  it(`honors actual unbound or reassigned ShiftBackspace ${replacement}`, /** Uses real frame/shell/interface owners rather than a mocked keyboard callback. @returns Nothing. */ () => {
    const s = createCalcSession(),
      c = s.controller;
    try {
      c.Select(1, 1);
      c.Select(4, 7, true);
      const iface =
        replacement === "original"
          ? createCalcInterface()
          : createCalcInterface(
              /** Original active binding projection. @param command - Native identity. @returns Configured shortcuts or original defaults. */
              (command) =>
                command === ".uno:Deselect"
                  ? []
                  : command === replacement
                    ? ["Shift+BACKSPACE"]
                    : undefined,
            );
      s.frame.SetActiveView(c, [createSfxShell(c, iface)]);
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
      fireEvent.keyDown(grid, { key: "Backspace", shiftKey: true });
      const marks = c.viewData.GetMarkData();
      expect(marks.IsMarked()).toBe(replacement !== "original");
      if (replacement === "original") {
        expect(c.Address()).toBe("E8");
        return;
      }
      expect(marks.GetMarkArea().aStart.Col()).toBe(replacement === undefined ? 1 : 0);
      expect(marks.GetMarkArea().aEnd.Col()).toBe(
        replacement === undefined ? 4 : c.shell.GetDocument().MaxCol(),
      );
    } finally {
      s.Close();
    }
  });
}
