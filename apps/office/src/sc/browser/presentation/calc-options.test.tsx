/** @fileoverview Calc native calculation options through the actual menu, document and formula pipeline. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { FormulaError } from "../../../formula/inc/errorcodes";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScInterpreter } from "../../source/core/tool/interpr4";
import { ViewOption } from "../../inc/viewopti";
import { ScAddress } from "../../inc/address";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(() => {
  cleanup();
  session?.Close();
  session = undefined;
});

/** Mounts the actual Calc application session. @returns Source view. */
function mount() {
  session = createCalcSession();
  render(<CalcWorkbench {...session} />);
  return session.controller;
}

/** Opens the Options dialog from its native menu placement. @returns Scoped queries. */
function options() {
  fireEvent.click(screen.getByRole("menuitem", { name: "Tools" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Options/ }));
  return within(screen.getByRole("dialog", { name: "Options" }));
}

it("validates Calculate before leaving the page, resets controls and applies document options", /** Validates Calculate before leaving the page, resets controls and applies document options. @returns Completion. */ async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const target = new ScAddress(1, 0, 0);
  act(() => {
    controller.Select(1, 0);
    expect(controller.EnterString('="Calc"="calc"')).toBe(true);
  });
  expect(doc.GetValue(target)).toBe(0);
  let dialog = options();
  fireEvent.click(dialog.getByRole("checkbox", { name: "Iterations" }));
  fireEvent.change(dialog.getByLabelText("Minimum change"), { target: { value: "0" } });
  fireEvent.click(dialog.getByRole("treeitem", { name: "Formula" }));
  expect(dialog.getByRole("alert")).toHaveTextContent("Invalid increment");
  expect(dialog.getByRole("treeitem", { name: "Calculate" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  fireEvent.click(dialog.getByRole("button", { name: "Reset" }));
  expect(dialog.getByRole("checkbox", { name: "Iterations" })).not.toBeChecked();
  expect(dialog.queryByRole("alert")).toBeNull();
  fireEvent.click(dialog.getByRole("checkbox", { name: "Case sensitive" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "Cancel" })));
  expect(doc.GetDocOptions().IsIgnoreCase()).toBe(false);

  dialog = options();
  fireEvent.click(dialog.getByRole("checkbox", { name: "Case sensitive" }));
  fireEvent.click(
    dialog.getByRole("checkbox", { name: "Limit decimals for general number format" }),
  );
  fireEvent.change(dialog.getByLabelText("Decimal places"), { target: { value: "2" } });
  fireEvent.click(dialog.getByRole("radio", { name: "1904-01-01" }));
  fireEvent.click(dialog.getByRole("radio", { name: "Enable regular expressions in formulas" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));

  expect(doc.GetValue(target)).toBe(1);
  expect(doc.GetDocOptions().IsFormulaRegexEnabled()).toBe(true);
  expect(doc.GetFormatTable().GetStandardPrec()).toBe(2);
  expect(doc.GetFormatTable().GetNullDate().GetYear()).toBe(1904);
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect(reopened.GetDocOptions().IsIgnoreCase()).toBe(true);
    expect(reopened.GetDocOptions().IsFormulaRegexEnabled()).toBe(true);
    expect(reopened.GetFormatTable().GetNullDate().GetYear()).toBe(1904);
  } finally {
    reopened.Dispose();
  }
});

it("uses the automatic label switch for formula admission and the connected data range", /** Uses the automatic label switch for formula admission and the connected data range. @returns Completion. */ async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  act(() => {
    controller.Select(0, 0);
    expect(controller.EnterString("Net Sales")).toBe(true);
    doc.SetValue(new ScAddress(0, 1, 0), 4);
    doc.SetValue(new ScAddress(0, 2, 0), 9);
    doc.SetValue(new ScAddress(0, 5, 0), 20);
    controller.Select(4, 0);
    expect(controller.EnterString("Q1")).toBe(true);
    controller.Select(4, 1);
    expect(controller.EnterString("North Region")).toBe(true);
    doc.SetValue(new ScAddress(5, 1, 0), 2);
    doc.SetValue(new ScAddress(6, 1, 0), 5);
  });
  let dialog = options();
  const lookup = dialog.getByRole("checkbox", { name: "Automatically find column and row labels" });
  if (!lookup.matches(":checked")) fireEvent.click(lookup);
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));
  act(() => {
    controller.Select(2, 1);
    expect(controller.EnterString("=SUM('Net Sales')")).toBe(true);
    controller.Select(4, 3);
    expect(controller.EnterString("=SUM('North Region')")).toBe(true);
  });
  expect(doc.GetValue(new ScAddress(2, 1, 0))).toBe(13);
  expect(doc.GetValue(new ScAddress(4, 3, 0))).toBe(7);
  doc.SetValue(new ScAddress(0, 3, 0), 6);
  expect(doc.GetValue(new ScAddress(2, 1, 0))).toBe(19);
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect(reopened.GetValue(new ScAddress(2, 1, 0))).toBe(19);
  } finally {
    reopened.Dispose();
  }
  dialog = options();
  fireEvent.click(
    dialog.getByRole("checkbox", { name: "Automatically find column and row labels" }),
  );
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));
  act(() => {
    controller.Select(2, 2);
    expect(controller.EnterString("=SUM('Net Sales')")).toBe(false);
  });
  expect(doc.GetErrCode(new ScAddress(2, 2, 0))).toBe(FormulaError.NoName);
});

it("applies Excel A1 references and confirmed details without changing global conversion", /** Applies Excel A1 references and confirmed details without changing global conversion. @returns Completion. */ async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const name = unicode("Source Data");
  doc.InsertTab(1, name);
  name.dispose();
  doc.SetValue(new ScAddress(0, 0, 1), 4);
  doc.SetValue(new ScAddress(0, 1, 1), 9);
  const dialog = options();
  fireEvent.click(dialog.getByRole("treeitem", { name: "Formula" }));
  fireEvent.change(dialog.getByRole("combobox", { name: /Formula syntax/ }), {
    target: { value: "1" },
  });
  fireEvent.click(dialog.getByRole("checkbox", { name: "Use English function names" }));
  fireEvent.click(dialog.getByRole("radio", { name: /^Custom/ }));
  const button = dialog.getByRole("button", { name: "Details…" });
  fireEvent.click(button);
  let details = within(screen.getByRole("dialog", { name: "Detailed Calculation Settings" }));
  fireEvent.change(details.getByLabelText("Conversion from text to number"), {
    target: { value: "0" },
  });
  fireEvent.click(details.getByRole("button", { name: "Cancel" }));
  fireEvent.click(button);
  details = within(screen.getByRole("dialog", { name: "Detailed Calculation Settings" }));
  expect(details.getByLabelText("Conversion from text to number")).toHaveValue("3");
  fireEvent.change(details.getByLabelText("Conversion from text to number"), {
    target: { value: "1" },
  });
  expect(details.getByRole("checkbox", { name: "Treat empty string as zero" })).toBeChecked();
  expect(details.getByRole("checkbox", { name: "Treat empty string as zero" })).toBeDisabled();
  fireEvent.click(
    details.getByRole("checkbox", { name: "Apply those settings to current document only" }),
  );
  fireEvent.click(details.getByRole("button", { name: "OK" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));

  expect(doc.GetGrammar()).toBe(FormulaGrammar.Grammar.GRAM_ENGLISH_XL_A1);
  expect(doc.GetDocOptions().IsWriteCalcConfig()).toBe(false);
  expect(ScInterpreter.GetGlobalConfig().meStringConversion).toBe(3);
  act(() => {
    controller.Select(2, 0);
    expect(controller.EnterString("=SUM('Source Data'!A1:A2)")).toBe(true);
    controller.Select(2, 1);
    expect(controller.EnterString('="arbitrary"+3')).toBe(true);
  });
  expect(doc.GetValue(new ScAddress(2, 0, 0))).toBe(13);
  expect(doc.GetValue(new ScAddress(2, 1, 0))).toBe(3);
});

it("applies the View display item and restores persisted formula markers and colors from ODS", /** Checks the rendered grid and native view state. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  act(
    /** Enters cell values through the view. @returns Nothing. */ () => {
      controller.EnterString("=1+2");
      controller.Select(1, 0);
      controller.EnterString("0");
    },
  );
  const formula = screen.getByRole("gridcell", { name: /^A1(?:\s|$)/u });
  const scalar = screen.getByRole("gridcell", { name: /^B1(?:\s|$)/u });
  const mark = /** Finds the displayed formula marker. @returns Marker element. */ () =>
    formula.querySelector("[data-calc-formula-mark]");
  expect(mark()).toBeNull();
  expect(formula).not.toHaveAttribute("title");

  let dialog = options();
  fireEvent.click(dialog.getByRole("treeitem", { name: "View" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Formula indicator and hint" }));
  fireEvent.click(dialog.getByRole("button", { name: "Reset" }));
  expect(dialog.getByRole("checkbox", { name: "Formula indicator and hint" })).not.toBeChecked();
  fireEvent.click(dialog.getByRole("checkbox", { name: "Formula indicator and hint" }));
  await act(
    /** Closes the options dialog and waits for its response. @returns Completion. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "Cancel" })),
  );
  expect(mark()).toBeNull();

  dialog = options();
  fireEvent.click(dialog.getByRole("treeitem", { name: "View" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Formula indicator and hint" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Value highlighting" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Zero values" }));
  await act(
    /** Closes the options dialog and waits for its response. @returns Completion. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  expect(mark()).toBeInTheDocument();
  expect(formula).toHaveAttribute("title", "=1+2");
  expect(formula).toHaveTextContent(/^3$/u);
  expect(formula.style.color).toBe("rgb(0, 128, 0)");
  expect(scalar).not.toHaveAttribute("title");
  expect(scalar).toHaveTextContent(/^$/u);
  expect(controller.viewData.GetOptions().GetOption(ViewOption.FORMULAS_MARKS)).toBe(true);
  expect(doc.GetViewOptions().GetOption(ViewOption.SYNTAX)).toBe(true);
  const reopened = await readOdsDocument(await controller.shell.SerializeOds());
  try {
    expect(reopened.GetViewOptions().GetOption(ViewOption.FORMULAS_MARKS)).toBe(true);
    expect(reopened.GetViewOptions().GetOption(ViewOption.SYNTAX)).toBe(true);
    expect(reopened.GetViewOptions().GetOption(ViewOption.NULLVALS)).toBe(false);
  } finally {
    reopened.Dispose();
  }
});
