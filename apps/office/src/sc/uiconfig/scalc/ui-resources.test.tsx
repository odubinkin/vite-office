/** @fileoverview Production Calc resource hierarchy and shared Writer menu/toolbar contracts. */
import { FontList } from "../../../svtools/browser/font-list";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createCalcSession } from "../../browser/composition/calc-module";
import { CalcWorkbench } from "../../browser/presentation/calc-workbench";
import { getCalcCommandResource } from "./menubar/menubar";
import { calcStandardBarItems } from "./toolbar/standardbar";
afterEach(
  /** Releases mounted chrome and platform spies. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);
it("opens connected top menus with shared shortcut captions", /** Uses real production Sfx bindings and shared presenters. @returns Nothing. */ () => {
  const session = createCalcSession();
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  const labels = ["File", "Edit", "View", "Insert", "Format", "Sheet", "Data", "Tools"];
  const menubar = screen.getByRole("menubar", { name: "Calc menu" });
  expect(
    within(menubar)
      .getAllByRole("menuitem")
      .map(
        /** Reads the projected source label. @param item - Top menu entry. @returns Menu label. */ (
          item,
        ) => item.textContent,
      ),
  ).toEqual(labels);
  for (const label of labels) {
    fireEvent.click(screen.getByRole("menuitem", { name: label }));
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
    if (label === "Edit") {
      expect(screen.queryByRole("menuitem", { name: /^Cut/ })).toBeNull();
      expect(screen.getByRole("menuitem", { name: /^Copy/ })).toBeEnabled();
      expect(screen.getByRole("menuitem", { name: /^Paste Special/ })).toBeVisible();
    }
    if (label === "Insert")
      expect(screen.getByRole("menuitem", { name: /^Headers and Footers/ })).toBeEnabled();
    fireEvent.keyDown(screen.getAllByRole("menu")[0] as HTMLElement, { key: "Escape" });
  }
  expect(getCalcCommandResource(".uno:About").label).toContain("Vite Office");
  expect(getCalcCommandResource(".uno:Bold").semantics).toBe("check");
  cleanup();
  session.Close();
});

it("retains the complete standardbar resource and projects connected controls with icons", /** Verifies the actual production resource,bindings and shared buttons. @returns Nothing. */ () => {
  const session = createCalcSession();
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  const toolbar = within(screen.getByRole("toolbar", { name: "Calc standard toolbar" }));
  const ids = [
    "OpenFromCalc",
    "ExportDirectToPDF",
    "Print",
    "PrintPreview",
    "Cut",
    "Copy",
    "Paste",
    "FormatPaintbrush",
    "ResetAttributes",
    "Undo",
    "Redo",
    "SearchDialog",
    "SpellDialog",
    "RowOperations",
    "ColumnOperations",
    "DataSort",
    "SortAscending",
    "SortDescending",
    "DataFilterAutoFilter",
    "InsertGraphic",
    "InsertObjectChart",
    "DataDataPilotRun",
    "CharmapControl",
    "HyperlinkDialog",
    "InsertAnnotation",
    "EditHeaderAndFooter",
    "DefinePrintArea",
    "FreezePanes",
    "SplitWindow",
    "InsertDraw",
  ].map(
    /** Restores original UNO identity. @param id - Source name. @returns Command URL. */ (id) =>
      `.uno:${id}`,
  );
  expect(
    calcStandardBarItems
      .filter(
        /** Selects real command placements. @param item - Placement. @returns Whether command. */ (
          item,
        ) => item.kind === "command",
      )
      .map(
        /** Reads original command identity. @param item - Placement. @returns Command URL. */ (
          item,
        ) => item.commandId,
      ),
  ).toEqual(ids);
  const connectedIds = [
    ".uno:OpenFromCalc",
    ".uno:Copy",
    ".uno:Paste",
    ".uno:ResetAttributes",
    ".uno:Undo",
    ".uno:Redo",
    ".uno:EditHeaderAndFooter",
    ".uno:DefinePrintArea",
    ".uno:FreezePanes",
    ".uno:SplitWindow",
  ];
  const buttons = toolbar.getAllByRole("button");
  expect(
    buttons.map(
      /** Reads actual accessible label. @param button - Shared control. @returns Label. */ (
        button,
      ) => button.getAttribute("aria-label"),
    ),
  ).toEqual(
    connectedIds.map(
      /** Reads source English label. @param id - Source command. @returns Label. */ (id) =>
        getCalcCommandResource(id).label,
    ),
  );
  buttons.forEach(
    /** Requires an actual icon and live availability. @param button - Shared control. @param index - Source position. @returns Nothing. */ (
      button,
      index,
    ) => {
      expect(button.querySelector("svg")).not.toBeNull();
      expect(button).toHaveClass("size-7", "shrink-0");
      const id = connectedIds[index];
      if (id === ".uno:Undo" || id === ".uno:Redo" || id === ".uno:Paste")
        expect(button).toBeDisabled();
      else expect(button).toBeEnabled();
    },
  );
  expect(toolbar.queryByRole("button", { name: "Cut" })).toBeNull();
  expect(session.controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.click(toolbar.getByRole("button", { name: "Open" }));
  expect(screen.getByRole("dialog")).toBeVisible();
  cleanup();
  session.Close();
});

it("renders connected formatting placements with the bound shared font-size control", /** Verifies source placement order and production Sfx ownership. @returns Nothing. */ () => {
  const session = createCalcSession();
  const fontsRequested = vi.spyOn(FontList, "FromBrowser");
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  const bar = screen.getByRole("toolbar", { name: "Calc formatting toolbar" }),
    controls = [
      ...bar.querySelectorAll(
        'button,input[role="combobox"],select,summary[aria-label="Border Style"]',
      ),
    ].filter(
      /** Palette contents belong to the dropdown rather than the toolbar placement order. @param control - Rendered control. @returns Whether a top-level toolbar control. */ (
        control,
      ) =>
        !control.closest("[data-office-palette]") &&
        !control.hasAttribute("data-office-combobox-toggle"),
    );
  const labels = [
    "Font Name",
    "Font Size",
    "Bold",
    "Italic",
    "Underline",
    "Font Color",
    "Background Color",
    "Align Left",
    "Align Center",
    "Align Right",
    "Align Top",
    "Center Vertically",
    "Align Bottom",
    "Wrap Text",
    "Increase",
    "Decrease",
    "Borders (Shift to overwrite)",
    "Border Style",
    "Border Color",
    "Conditional",
  ];
  expect(
    [...controls].map(
      /** Reads actual label. @param control - Shared control. @returns Source label. */ (
        control,
      ) => control.getAttribute("aria-label"),
    ),
  ).toEqual(labels);
  const fonts = controls.filter(
    /** Selects font placements outside palette dropdowns. @param control - Top-level control. @returns Whether a selector. */ (
      control,
    ) => control.tagName === "SELECT" || control.getAttribute("role") === "combobox",
  );
  expect(fonts).toHaveLength(2);
  expect(fontsRequested).toHaveBeenCalled();
  expect(fonts[0]).toBeEnabled();
  expect(fonts[0]).toHaveValue(session.controller.GetFontFamily());
  expect(fonts[1]).toBeEnabled();
  expect(fonts[1]).toHaveValue("10 pt");
  expect(within(bar).getByRole("button", { name: "Show Font Size" })).toBeEnabled();
  for (const button of controls.filter(
    /** Selects actual toolbar buttons rather than palette choices. @param control - Top-level control. @returns Whether a button. */ (
      control,
    ) => control.tagName === "BUTTON",
  )) {
    const color = ["Font Color", "Background Color", "Border Color"].includes(
      button.getAttribute("aria-label") as string,
    );
    expect(button).toBeEnabled();
    if (color) expect(button).toHaveClass("size-7", "rounded-l", "bg-white");
    else expect(button).toHaveClass("size-7", "rounded-md", "bg-white");
    if (["Bold", "Italic", "Underline"].includes(button.getAttribute("aria-label") as string))
      expect(button).toHaveTextContent(/B|I|U/);
    else if (color && button.getAttribute("aria-label") !== "Border Color")
      expect(button).toHaveTextContent(/A|▨/);
    else expect(button.querySelector("svg")).not.toBeNull();
  }
  expect(session.controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  cleanup();
  session.Close();
});
