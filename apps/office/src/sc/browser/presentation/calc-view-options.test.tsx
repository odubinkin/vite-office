/** @fileoverview Original View commands use shared Writer menu checkmarks and actual Calc geometry,frames,formula cells and editing owners. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ViewOption } from "../../inc/viewopti";
import { ScAddress } from "../../inc/address";
import { ScInputMode } from "../../inc/global";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import { cellPresentation } from "../editor/cell-input";
afterEach(cleanup);
/** Mounts the actual production view. @returns Session. */
function setup() {
  const s = createCalcSession();
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
/** Executes one shared View menu command. @param label - Native label. @returns Nothing. */
function toggle(label: string) {
  fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
  fireEvent.click(screen.getByRole("menuitemcheckbox", { name: label }));
}
it("toggles header visibility and all actual cell offsets/accessibility indices through the shared View menu", /** Checks real geometry rather than a duplicate view state. @returns Nothing. */ () => {
  const s = setup();
  try {
    const grid = screen.getByRole("grid"),
      cell = screen.getByRole("gridcell", { name: "A1" });
    grid.focus();
    expect(cell.style.left).toBe("48px");
    expect(cell.parentElement?.style.top).toBe("22px");
    toggle("View Headers");
    expect(screen.queryByRole("rowheader")).toBeNull();
    expect(screen.queryByRole("columnheader")).toBeNull();
    expect(cell.style.left).toBe("0px");
    expect(cell.parentElement?.style.top).toBe("0px");
    expect(cell).toHaveAttribute("aria-colindex", "1");
    expect(cell.parentElement).toHaveAttribute("aria-rowindex", "1");
    expect(grid).toHaveFocus();
    fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "View Headers" })).not.toBeChecked();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "View Headers" }));
    expect(screen.getByRole("rowheader", { name: "Row 1" })).toBeInTheDocument();
    expect(cell.style.left).toBe("48px");
    expect(cell.parentElement?.style.top).toBe("22px");
    expect(grid).toHaveAttribute("aria-rowcount", "1048577");
  } finally {
    s.Close();
  }
});
it("hides only implicit grid lines while retaining actual explicit native cell borders", /** Exercises the existing shared border toolbox and real CSS frame projection. @returns Nothing. */ () => {
  const s = setup();
  try {
    fireEvent.click(
      screen.getByRole("button", { name: getCalcCommandResource(".uno:SetBorderStyle").label }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Outer Border" }));
    const cell = screen.getByRole("gridcell", { name: "A1" }),
      empty = screen.getByRole("gridcell", { name: "D4" });
    toggle("View Grid Lines");
    expect(empty.style.borderRightColor).toBe("transparent");
    expect(empty.style.borderBottomColor).toBe("transparent");
    expect(cell).toHaveStyle({ borderTopWidth: "0.75pt", borderLeftWidth: "0.75pt" });
    toggle("View Grid Lines");
    expect(empty.style.borderRightColor).toBe("");
  } finally {
    s.Close();
  }
});
it("shows actual formula source before errors and keeps scalar/string display unchanged", /** Verifies the actual compiler/document output owner. @returns Nothing. */ () => {
  const s = setup(),
    c = s.controller;
  try {
    act(
      /** Enters actual supported formulas and scalar values. @returns Nothing. */ () => {
        c.EnterString("=1+2");
        c.Select(1, 0);
        c.EnterString("=1/0");
        c.Select(2, 0);
        c.EnterString("7");
        c.Select(3, 0);
        c.EnterString("text");
      },
    );
    expect(screen.getByRole("gridcell", { name: "A1" })).toHaveTextContent("3");
    expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("#DIV/0!");
    toggle("Show Formulas");
    expect(screen.getByRole("gridcell", { name: "A1" })).toHaveTextContent("=1+2");
    expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("=1/0");
    expect(screen.getByRole("gridcell", { name: "C1" })).toHaveTextContent("7");
    expect(screen.getByRole("gridcell", { name: "D1" })).toHaveTextContent("text");
    expect(cellPresentation(c.shell.GetDocument(), new ScAddress(3, 0, 0), true).text).toBe("text");
    toggle("Show Formulas");
    expect(screen.getByRole("gridcell", { name: "B1" })).toHaveTextContent("#DIV/0!");
  } finally {
    s.Close();
  }
});
for (const modifier of ["ctrlKey", "metaKey"] as const) {
  it(`routes native formula shortcut ${modifier} through shared canonical key mapping without replacing the editing draft`, /** Checks live command dispatch and key ownership. @returns Nothing. */ () => {
    const s = setup(),
      c = s.controller;
    try {
      const grid = screen.getByRole("grid");
      fireEvent.keyDown(grid, { key: "`", [modifier]: true });
      expect(c.GetViewOptionState("formulas")).toBe(true);
      act(
        /** Opens the genuine input line. @returns Nothing. */ () =>
          c.StartInput(ScInputMode.SC_INPUT_TOP, "draft"),
      );
      const input = screen.getByRole("textbox", { name: "Input line" });
      fireEvent.keyDown(input, { key: "`", [modifier]: true });
      expect(c.GetViewOptionState("formulas")).toBe(false);
      expect(c.Input()).toBe("draft");
      expect(c.mode).toBe(ScInputMode.SC_INPUT_TOP);
    } finally {
      s.Close();
    }
  });
}

it("keeps global grid visibility distinct from the current-sheet grid flag", /** Replays gridwin4 conjunction using the actual option owner and native sheet command. @returns Nothing. */ () => {
  const s = createCalcSession(),
    c = s.controller;
  c.viewData.GetOptions().SetOption(ViewOption.GRID, false);
  render(
    <CalcWorkbench
      controller={c}
      frame={s.frame}
      fileWorkflows={s.fileWorkflows}
      sheetWorkflows={s.sheetWorkflows}
    />,
  );
  try {
    const cell = screen.getByRole("gridcell", { name: "B2" });
    expect(cell.style.borderRightColor).toBe("transparent");
    toggle("View Grid Lines");
    expect(c.viewData.GetShowGrid()).toBe(false);
    toggle("View Grid Lines");
    expect(c.viewData.GetShowGrid()).toBe(true);
    expect(cell.style.borderRightColor).toBe("transparent");
    expect(c.viewData.GetOptions().GetOption(ViewOption.GRID)).toBe(false);
  } finally {
    s.Close();
  }
});
