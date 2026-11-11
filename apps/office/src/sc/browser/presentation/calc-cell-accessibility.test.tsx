/** @fileoverview Preserves native Calc address/text ownership through the browser's composed accessible name. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(cleanup);

it("announces the address and displayed value across commit, history and inline editing", /** Uses real input and history owners without replacing the cell value. @returns Nothing. */ () => {
  const session = createCalcSession();
  try {
    render(
      <CalcWorkbench
        controller={session.controller}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    const cell = screen.getByRole("gridcell", { name: "A1" });
    expect(cell).toHaveTextContent("");
    const line = screen.getByRole("textbox", { name: "Input line" });
    fireEvent.focus(line);
    fireEvent.change(line, {
      target: { value: "7" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Accept input" }));
    expect(cell).toHaveAccessibleName("A1 7");
    expect(cell).toHaveTextContent(/^7$/);
    expect(cell).toHaveAttribute("aria-label", "A1");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(cell).toHaveAccessibleName("A1");
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(cell).toHaveAccessibleName("A1 7");
    fireEvent.doubleClick(cell);
    expect(cell).toHaveAccessibleName("A1");
    expect(screen.getByRole("textbox", { name: "Edit cell A1" })).toHaveValue("7");
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Edit cell A1" }), {
      key: "Escape",
    });
    expect(cell).toHaveAccessibleName("A1 7");
    expect(screen.getByRole("grid")).toHaveAttribute("aria-activedescendant", cell.id);
  } finally {
    session.Close();
  }
});

it("uses actual displayed formula results, errors and formula text independently of visible headers", /** Reads the existing native presentation when source display changes. @returns Nothing. */ () => {
  const session = createCalcSession();
  try {
    const controller = session.controller;
    controller.EnterString("=1+2");
    controller.Select(1, 0);
    controller.EnterString("=1/0");
    controller.Select(2, 0);
    controller.EnterString("A1 example");
    controller.Select(0, 0);
    render(
      <CalcWorkbench
        controller={controller}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    const first = screen.getByRole("gridcell", { name: "A1 3" });
    expect(screen.getByRole("gridcell", { name: "B1 #DIV/0!" })).toHaveTextContent("#DIV/0!");
    expect(screen.getByRole("gridcell", { name: "C1 A1 example" })).toHaveTextContent("A1 example");
    expect(screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toBe(first);
    fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Show Formulas" }));
    expect(first).toHaveAccessibleName("A1 =1+2");
    expect(screen.getByRole("gridcell", { name: "B1 =1/0" })).toHaveTextContent("=1/0");
    fireEvent.click(screen.getByRole("menuitem", { name: "View" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "View Headers" }));
    expect(first).toHaveAccessibleName("A1 =1+2");
    expect(screen.queryByRole("columnheader")).toBeNull();
    act(
      /** Moves through the real view owner to check address boundaries. @returns Nothing. */ () =>
        controller.Select(0, 9),
    );
    expect(screen.getByRole("gridcell", { name: "A10" })).not.toBe(first);
    expect(screen.getByRole("gridcell", { name: /^A1(?:\s|$)/ })).toBe(first);
  } finally {
    session.Close();
  }
});
