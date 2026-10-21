/** @fileoverview Actual Writer shared Edit Select menus over native Calc hidden-axis selection. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
afterEach(cleanup);
for (const rows of [true, false]) {
  it(`connects shared visible-${rows ? "rows" : "columns"} menu to real marks and preserves grid focus`, /** Uses real hide commands before selecting only visible cells. @returns Nothing. */ () => {
    const s = createCalcSession(),
      c = s.controller,
      doc = c.shell.GetDocument();
    try {
      c.Select(rows ? 0 : 1, rows ? 1 : 0);
      c.Select(rows ? 0 : 2, rows ? 2 : 0, true);
      if (rows) c.ShowRows(false);
      else c.ShowColumns(false);
      c.Select(0, 0);
      c.Select(5, 5, true);
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
      fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select" }));
      const command = screen.getByRole("menuitem", {
        name: rows ? "Select Visible Rows Only" : "Select Visible Columns Only",
      });
      expect(command).toBeEnabled();
      fireEvent.click(command);
      const marks = c.viewData.GetMarkData();
      expect(marks.IsCellMarked(0, 0)).toBe(true);
      expect(marks.IsCellMarked(rows ? 0 : 1, rows ? 1 : 0)).toBe(false);
      expect(marks.IsCellMarked(5, 5)).toBe(true);
      expect(rows ? doc.RowHidden(1, 0) : doc.ColHidden(1, 0)).toBe(true);
      expect(grid).toHaveFocus();
      expect(c.Address()).toBe("F6");
    } finally {
      s.Close();
    }
  });
}
