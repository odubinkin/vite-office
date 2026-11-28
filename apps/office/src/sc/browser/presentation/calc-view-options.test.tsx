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
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
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
      cell = screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ });
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
    const cell = screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ }),
      empty = screen.getByRole("gridcell", { name: /^D4(?:\s|$)/ });
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
it("uses the native display-zero option without changing zero cells or formula text", /** Exercises the rendered result, formula mode and the model independently. @returns Nothing. */ () => {
  const s = setup();
  const c = s.controller;
  const doc = c.shell.GetDocument();
  try {
    act(
      /** Writes numeric, formula and text forms of zero. @returns Nothing. */
      () => {
        c.viewData.GetOptions().SetOption(ViewOption.NULLVALS, false);
        c.EnterString("0");
        c.Select(1, 0);
        c.EnterString("=1-1");
        c.Select(2, 0);
        c.EnterString("'0");
      },
    );
    expect(screen.getByRole("gridcell", { name: /^A1(?:\s|$)/u })).toHaveTextContent(/^$/u);
    expect(screen.getByRole("gridcell", { name: /^B1(?:\s|$)/u })).toHaveTextContent(/^$/u);
    expect(screen.getByRole("gridcell", { name: /^C1(?:\s|$)/u })).toHaveTextContent(/^0$/u);
    expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(0);
    expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(0);
    toggle("Show Formulas");
    expect(screen.getByRole("gridcell", { name: /^B1(?:\s|$)/u })).toHaveTextContent(/^=1-1$/u);
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
    expect(screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toHaveTextContent("3");
    expect(screen.getByRole("gridcell", { name: /^B1(?:\s|$)/ })).toHaveTextContent("#DIV/0!");
    toggle("Show Formulas");
    expect(screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toHaveTextContent("=1+2");
    expect(screen.getByRole("gridcell", { name: /^B1(?:\s|$)/ })).toHaveTextContent("=1/0");
    expect(screen.getByRole("gridcell", { name: /^C1(?:\s|$)/ })).toHaveTextContent("7");
    expect(screen.getByRole("gridcell", { name: /^D1(?:\s|$)/ })).toHaveTextContent("text");
    expect(cellPresentation(c.shell.GetDocument(), new ScAddress(3, 0, 0), true).text).toBe("text");
    toggle("Show Formulas");
    expect(screen.getByRole("gridcell", { name: /^B1(?:\s|$)/ })).toHaveTextContent("#DIV/0!");
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
    const cell = screen.getByRole("gridcell", { name: /^B2(?:\s|$)/ });
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

it("applies persisted outline and tab visibility without removing groups or keyboard navigation", /** Loads the actual ODS state into the mounted browser session. @returns Completion. */ async () => {
  const s = setup();
  try {
    const { controller } = s;
    const doc = controller.shell.GetDocument();
    act(
      /** Creates a second sheet through Calc history. @returns Nothing. */ () => {
        controller.InsertSheet();
        controller.SelectTab(0);
      },
    );
    doc.FetchTable(0)?.StartOutlineTable().GetRowArray().Insert(1, 5);
    doc.GetViewOptions().SetOption(ViewOption.OUTLINER, false);
    doc.GetViewOptions().SetOption(ViewOption.TABCONTROLS, false);
    const incoming = await readOdsDocument(await controller.shell.SerializeOds());
    expect(screen.getByRole("tablist", { name: "Sheets" })).toBeVisible();
    act(
      /** Reattaches the imported document and native view. @returns Nothing. */ () => {
        controller.shell.ReplaceDocument(
          incoming,
          createDocument({ id: "hidden-controls", suiteId: "calc", title: "Hidden controls" }),
          { kind: "untitled", name: "Hidden controls" },
        );
      },
    );
    expect(screen.queryByRole("tablist", { name: "Sheets" })).toBeNull();
    expect(screen.queryByRole("group", { name: "Row outline" })).toBeNull();
    expect(incoming.FetchTable(0)?.GetOutlineTable()?.GetRowArray().GetDepth()).toBe(1);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown", ctrlKey: true });
    expect(controller.viewData.GetTabNumber()).toBe(1);
  } finally {
    s.Close();
  }
});

it("paints native value, text and formula syntax colors without modifying the workbook", /** Checks the rendered grid and native view state. @returns Nothing. */ () => {
  const s = setup();
  const { controller } = s;
  const doc = controller.shell.GetDocument();
  try {
    act(
      /** Enters cell values through the view. @returns Nothing. */ () => {
        controller.EnterString("7");
        controller.Select(1, 0);
        controller.EnterString("text");
        controller.Select(2, 0);
        controller.EnterString('="text"');
      },
    );
    const numeric = screen.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
    const plain = screen.getByRole("gridcell", { name: /^B1(?:\s|$)/u });
    const formula = screen.getByRole("gridcell", { name: /^C1(?:\s|$)/u });
    const colors = [numeric.style.color, plain.style.color, formula.style.color];
    toggle("Value Highlighting");
    expect(numeric.style.color).toBe("rgb(0, 0, 255)");
    expect(plain.style.color).toBe("rgb(0, 0, 0)");
    expect(formula.style.color).toBe("rgb(0, 128, 0)");
    expect(formula).toHaveTextContent(/^text$/u);
    expect(doc.GetViewOptions().GetOption(ViewOption.SYNTAX)).toBe(false);
    toggle("Value Highlighting");
    expect([numeric.style.color, plain.style.color, formula.style.color]).toEqual(colors);
  } finally {
    s.Close();
  }
});
