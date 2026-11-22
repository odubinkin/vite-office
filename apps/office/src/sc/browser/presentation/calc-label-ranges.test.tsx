/** @fileoverview Upstream label range cases through the real Calc view and document. */
import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../package/source/zippackage/document-archive";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { OpCode } from "../../../formula/inc/opcode";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaError } from "../../../formula/inc/errorcodes";
import { ScAddress } from "../../inc/address";
import type { ScDocument } from "../../inc/document";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(() => {
  cleanup();
  session?.Close();
  session = undefined;
});

/** Mounts the real Calc client. @param workbook - Optional source fixture. @returns Controller. */
function mount(workbook?: ScDocument) {
  const active = createCalcSession();
  session = active;
  if (workbook)
    active.controller.shell.ReplaceDocument(
      workbook,
      createDocument({ id: "calc-label-ranges", suiteId: "calc", title: "Label ranges" }),
      { kind: "input", name: "Label ranges.ods", source: { kind: "external", reference: {} } },
    );
  render(<CalcWorkbench {...active} />);
  return active.controller;
}

/** Opens from the source Sheet menu. @returns Dialog. */
function open() {
  fireEvent.click(screen.getByRole("menuitem", { name: "Sheet" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Named Ranges and Expressions" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Define Labels/ }));
  return screen.getByRole("dialog", { name: "Define Label Range" });
}

it("ports tdf131170 deletion from the pinned ODS fixture and keeps Cancel transactional", async () => {
  const bytes = readFileSync("../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf131170.ods");
  const fixture = await DocumentArchive.open(new Uint8Array(bytes));
  const archive = new DocumentArchiveWriter();
  for (const part of fixture.getEntryNames()) {
    // Keep the labelled formulas and cached values. SUMPRODUCT is outside the scalar kernel.
    archive.putNextEntry(
      part,
      part === "content.xml"
        ? new TextEncoder().encode(
            (await fixture.readTextEntry(part)).replace(
              / table:formula="of:=SUMPRODUCT[^"]*"/u,
              "",
            ),
          )
        : await fixture.readEntry(part),
    );
  }
  const doc = await readOdsDocument(await archive.finish());
  mount(doc);
  let dialog = open();
  const options = () =>
    within(dialog)
      .getAllByRole("option")
      .map((option) => option.textContent);
  expect(options()).toEqual([
    "--- Column ---",
    "$Sheet1.$I$6:$K$6 [AA, BB, CC]",
    "--- Row ---",
    "$Sheet1.$H$7:$H$9 [X, Y, Z]",
  ]);

  /** Confirms deletion of the selected source row. @param value - List entry index. @returns Nothing. */
  function remove(value: string): void {
    fireEvent.change(within(dialog).getByRole("listbox", { name: "Label ranges" }), {
      target: { value },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    fireEvent.click(
      within(screen.getByRole("alertdialog", { name: "Delete label range" })).getByRole("button", {
        name: "Yes",
      }),
    );
  }
  remove("0");
  expect(options()).toEqual(["--- Column ---", "--- Row ---", "$Sheet1.$H$7:$H$9 [X, Y, Z]"]);
  remove("0");
  expect(options()).toEqual(["--- Column ---", "--- Row ---"]);
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" })));
  expect(doc.GetColNameRanges().size()).toBe(1);
  expect(doc.GetRowNameRanges().size()).toBe(1);

  dialog = open();
  remove("1");
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "OK" })));
  expect(doc.GetColNameRanges().size()).toBe(1);
  expect(doc.GetRowNameRanges().size()).toBe(0);
});

it("connects both sheet reference edits to label formulas and persists their lexical tokens in ODS", async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  const header = new ScAddress(0, 0, 0),
    formula = new ScAddress(2, 1, 0);
  act(() => {
    controller.EnterString("Net Sales");
    doc.SetValue(new ScAddress(0, 1, 0), 4);
    doc.SetValue(new ScAddress(0, 2, 0), 9);
    controller.Select(1, 0);
  });
  let dialog = open();
  const label = within(dialog).getByRole("textbox", { name: "Range" });
  const data = within(dialog).getByRole("textbox", { name: "For data range" });
  fireEvent.focus(label);
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: /^A1(?: |$)/u }), {
    button: 0,
    pointerId: 1,
  });
  fireEvent.pointerUp(window, { button: 0, pointerId: 1 });
  expect(label).toHaveValue("$Sheet1.$A$1");
  expect(within(dialog).getByRole("radio", { name: "Contains column labels" })).toBeChecked();
  fireEvent.focus(data);
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: /^A2(?: |$)/u }), {
    button: 0,
    pointerId: 2,
  });
  fireEvent.pointerUp(window, { button: 0, pointerId: 2 });
  expect(data).toHaveValue("$Sheet1.$A$2");
  fireEvent.change(data, { target: { value: "$Sheet1.$A$2:$A$3" } });
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "OK" })));
  expect(doc.GetColNameRanges().Find(header)?.GetRange(1).aEnd.Row()).toBe(2);

  act(() => {
    controller.Select(2, 1);
    expect(controller.EnterString("=SUM('Net Sales')")).toBe(true);
    controller.Select(3, 1);
    expect(controller.EnterString("='Net Sales'+1")).toBe(true);
  });
  const cell = doc.GetFormulaCell(formula);
  expect(cell?.GetCode().HasOpCode(OpCode.ocColRowName)).toBe(true);
  expect(doc.GetValue(formula)).toBe(13);
  expect(doc.GetValue(new ScAddress(3, 1, 0))).toBe(5);

  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect(reopened.GetColNameRanges().Find(header)?.GetRange(1).aEnd.Row()).toBe(2);
    expect(reopened.GetFormulaCell(formula)?.GetCode().HasOpCode(OpCode.ocColRowName)).toBe(true);
    expect(reopened.GetValue(formula)).toBe(13);
  } finally {
    reopened.Dispose();
  }

  fireEvent.click(screen.getByRole("menuitem", { name: "Tools" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Options/ }));
  const options = within(screen.getByRole("dialog", { name: "Options" }));
  fireEvent.click(
    options.getByRole("checkbox", { name: "Automatically find column and row labels" }),
  );
  await act(async () => fireEvent.click(options.getByRole("button", { name: "OK" })));

  dialog = open();
  fireEvent.change(within(dialog).getByRole("listbox", { name: "Label ranges" }), {
    target: { value: "0" },
  });
  fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
  fireEvent.click(
    within(screen.getByRole("alertdialog", { name: "Delete label range" })).getByRole("button", {
      name: "Yes",
    }),
  );
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "OK" })));
  expect(doc.GetFormulaCell(formula)?.GetCode().GetCodeError()).toBe(FormulaError.NoName);
  const removed = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect(removed.GetColNameRanges().size()).toBe(0);
    expect(removed.GetFormulaCell(formula)?.GetCode().GetCodeError()).toBe(FormulaError.NoName);
    await writeOdsDocument(removed);
  } finally {
    removed.Dispose();
  }
});

it("resolves a row label and relocates the document pair when preceding sheets change", async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  act(() => {
    controller.EnterString("Net Total");
    doc.SetValue(new ScAddress(1, 0, 0), 11);
    doc.SetValue(new ScAddress(2, 0, 0), 13);
  });
  const dialog = open();
  fireEvent.click(within(dialog).getByRole("radio", { name: "Contains row labels" }));
  fireEvent.change(within(dialog).getByRole("textbox", { name: "For data range" }), {
    target: { value: "$Sheet1.$B$1:$C$1" },
  });
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "OK" })));
  expect(doc.GetRowNameRanges().size()).toBe(1);
  act(() => {
    controller.Select(1, 1);
    expect(controller.EnterString("=SUM('Net Total')")).toBe(true);
  });
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(24);
  const name = unicode("Before");
  try {
    expect(doc.InsertTab(0, name)).toBe(true);
  } finally {
    name.dispose();
  }
  expect(doc.GetRowNameRanges().at(0).GetRange(0).aStart.Tab()).toBe(1);
  expect(doc.GetRowNameRanges().at(0).GetRange(1).aStart.Tab()).toBe(1);
  expect(doc.DeleteTab(0)).toBe(true);
  expect(doc.GetRowNameRanges().at(0).GetRange(0).aStart.Tab()).toBe(0);
  expect(doc.GetRowNameRanges().at(0).GetRange(1).aStart.Tab()).toBe(0);
});
