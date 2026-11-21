/** @fileoverview Native Calc range-name definition, navigation and filter round trips. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, assert, expect, it } from "vitest";
import { ScAddress } from "../../inc/address";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { ExcelFilter } from "../../source/filter/oox/excelfilter";
import { exportXlsx } from "../../source/filter/excel/xetable";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
afterEach(() => {
  cleanup();
  active?.Close();
  active = undefined;
});

/** Mounts the real dispatcher and document owner. @returns Live Calc session. */
function mount(): ReturnType<typeof createCalcSession> {
  const session = createCalcSession();
  active = session;
  render(<CalcWorkbench {...session} />);
  return session;
}

/** Changes the browser position box and invokes its Enter command. @param value - Text selection or new name. @returns Nothing. */
function enterNameBox(value: string): void {
  const input = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: "Enter" });
}

it("ports create_range_name.py by naming a selection in the position box and using it in a formula", () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  for (let column = 0; column < 3; column++) doc.SetValue(new ScAddress(column, 0, 0), 1);
  enterNameBox("A1:C1");
  expect(screen.getByRole("textbox", { name: "Name Box" })).toHaveValue("A1:C1");
  expect(controller.viewData.GetMarkData().IsCellMarked(2, 0)).toBe(true);
  enterNameBox("QuarterTotal");
  expect(screen.getByRole("textbox", { name: "Name Box" })).toHaveValue("QuarterTotal");
  act(() => {
    controller.Select(0, 1);
    expect(controller.EnterString("=SUM(QuarterTotal)")).toBe(true);
  });
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(3);
  enterNameBox("QuarterTotal");
  expect(controller.Address()).toBe("A1");
  expect(controller.viewData.GetMarkData().IsCellMarked(2, 0)).toBe(true);
});

it("ports tdf86214 validation and saves a sheet-local name after choosing its range from the grid", async () => {
  const { controller } = mount();
  const document = controller.shell.GetDocument();
  fireEvent.click(screen.getByRole("menuitem", { name: "Sheet" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Named Ranges and Expressions" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Define Name/ }));
  const dialog = screen.getByRole("dialog", { name: "Define Name" });
  const name = within(dialog).getByRole("textbox", { name: "Name" });
  const add = within(dialog).getByRole("button", { name: "Add" });
  for (const value of ["A1", "12", "1.2", "A1:B2", "test.a", "test+", "test;z", "test!abc"]) {
    fireEvent.change(name, { target: { value } });
    expect(add).toBeDisabled();
  }
  fireEvent.change(name, { target: { value: "valid_name" } });
  expect(add).toBeEnabled();
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Scope" }), {
    target: { value: "0" },
  });
  const expression = within(dialog).getByRole("textbox", { name: "Range or formula expression" });
  fireEvent.change(expression, { target: { value: "" } });
  expect(add).toBeDisabled();
  fireEvent.change(expression, { target: { value: "1+" } });
  fireEvent.click(add);
  expect(within(dialog).getByRole("alert")).toHaveTextContent(
    "Invalid range or formula expression.",
  );
  fireEvent.focus(expression);
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "B3" }), {
    button: 0,
    pointerId: 1,
  });
  fireEvent.pointerUp(window, { button: 0, pointerId: 1 });
  expect(expression).toHaveValue("$Sheet1.$B$3");
  await act(async () => fireEvent.click(add));
  expect(screen.queryByRole("dialog", { name: "Define Name" })).toBeNull();
  const nameList = document.GetRangeName(0);
  const entry = nameList?.findByUpperName("VALID_NAME");
  assert(entry);
  expect(document.GetRangeName()?.findByUpperName("VALID_NAME")).toBeUndefined();
  const index = entry.GetIndex();
  act(() => expect(controller.Undo()).toBe(true));
  expect(nameList?.findByIndex(index)).toBeUndefined();
  act(() => expect(controller.Redo()).toBe(true));
  expect(nameList?.findByIndex(index)?.name).toBe("valid_name");
  enterNameBox("valid_name (Sheet1)");
  expect(controller.Address()).toBe("B3");

  for (const reopened of [
    await readOdsDocument(await writeOdsDocument(document)),
    await ExcelFilter.importDocument(await exportXlsx(document)),
  ]) {
    try {
      const name = reopened.GetRangeName(0)?.findByUpperName("VALID_NAME");
      assert(name);
      expect(name.GetSymbol(reopened.GetGrammar())).toBe("$Sheet1.$B$3");
    } finally {
      reopened.Dispose();
    }
  }
});
