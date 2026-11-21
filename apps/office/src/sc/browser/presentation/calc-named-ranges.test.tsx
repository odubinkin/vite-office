/** @fileoverview Native Calc range-name definition, navigation and filter round trips. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, assert, expect, it } from "vitest";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScRefCellValue } from "../../inc/cellvalue";
import { ScInputMode } from "../../inc/global";
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

/** Opens a native range-name command through the actual Sheet menu. @param name - Menu label. @returns Nothing. */
function openNameMenu(name: RegExp): void {
  fireEvent.click(screen.getByRole("menuitem", { name: "Sheet" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Named Ranges and Expressions" }));
  const popup = screen.getByRole("menu", { name: "Named Ranges and Expressions menu" });
  fireEvent.click(within(popup).getByRole("menuitem", { name }));
}

it("ports tdf87474 with manager rename, formula updates, cancellation and atomic undo", async () => {
  const { controller } = mount();
  const document = controller.shell.GetDocument(),
    position = new ScAddress(0, 1, 0),
    groupMember = new ScAddress(0, 2, 0);
  document.SetValue(new ScAddress(), 3);
  document.SetValue(new ScAddress(1, 0, 0), 7);
  enterNameBox("SourceTotal");
  act(() => {
    controller.Select(0, 1);
    expect(controller.EnterString("=SUM(SourceTotal)")).toBe(true);
    controller.Select(0, 2);
    expect(controller.EnterString("=SUM(SourceTotal)")).toBe(true);
  });
  document.FetchTable(0)?.RegroupFormulaCells(0);
  const group = document.GetFormulaCell(position)?.GetCellGroup();
  expect(group).toBeTruthy();
  expect(document.GetFormulaCell(groupMember)?.GetCellGroup()).toBe(group);
  expect(document.GetValue(position)).toBe(3);
  openNameMenu(/^Manage Names/);
  let manager = screen.getByRole("dialog", { name: "Manage Names" });
  fireEvent.change(within(manager).getByRole("textbox", { name: "Name" }), {
    target: { value: "UnusedTotal" },
  });
  await act(async () => {
    fireEvent.click(within(manager).getByRole("button", { name: "Cancel" }));
  });
  expect(document.GetRangeName()?.findByUpperName("UNUSEDTOTAL")).toBeUndefined();
  openNameMenu(/^Manage Names/);
  manager = screen.getByRole("dialog", { name: "Manage Names" });
  fireEvent.change(within(manager).getByRole("textbox", { name: "Name" }), {
    target: { value: "UpdatedTotal" },
  });
  fireEvent.change(within(manager).getByRole("textbox", { name: "Range or formula expression" }), {
    target: { value: "$Sheet1.$B$1" },
  });
  await act(async () => {
    fireEvent.click(within(manager).getByRole("button", { name: "OK" }));
  });
  expect(document.GetRangeName()?.findByUpperName("SOURCETOTAL")).toBeUndefined();
  const formula = () => {
    const value = document.GetFormulaCell(position)?.GetFormula(document.GetGrammar());
    try {
      return value && text(value);
    } finally {
      value?.dispose();
    }
  };
  expect(formula()).toBe("=SUM(UpdatedTotal)");
  expect(document.GetValue(position)).toBe(7);
  expect(document.GetValue(groupMember)).toBe(7);
  expect(document.GetFormulaCell(groupMember)?.GetCellGroup()).toBe(group);
  act(() => expect(controller.Undo()).toBe(true));
  expect(formula()).toBe("=SUM(SourceTotal)");
  expect(document.GetValue(position)).toBe(3);
  expect(document.GetValue(groupMember)).toBe(3);
  act(() => expect(controller.Redo()).toBe(true));
  expect(formula()).toBe("=SUM(UpdatedTotal)");
  expect(document.GetValue(position)).toBe(7);
});

it("pastes a selected name into input and writes an undoable name list from the source menu alias", async () => {
  const { controller } = mount();
  const document = controller.shell.GetDocument();
  document.SetValue(new ScAddress(), 6);
  enterNameBox("Revenue");
  const bounds = [new ScAddress(1, 2, 0), new ScAddress(2, 2, 0)] as const;
  document.SetValue(bounds[1], 25);
  act(() => controller.Select(1, 2));
  openNameMenu(/^Insert…$/);
  let dialog = screen.getByRole("dialog", { name: "Paste Names" });
  await act(async () => {
    fireEvent.click(within(dialog).getByRole("button", { name: /^Paste$/ }));
  });
  expect(controller.Input()).toBe("=Revenue ");
  act(() => controller.Cancel());
  act(() => {
    controller.StartInput(ScInputMode.SC_INPUT_TOP, "=SUM(Placeholder)");
    controller.SetInputSelection(5, 16);
  });
  openNameMenu(/^Insert…$/);
  dialog = screen.getByRole("dialog", { name: "Paste Names" });
  await act(async () => {
    fireEvent.click(within(dialog).getByRole("button", { name: /^Paste$/ }));
  });
  expect(controller.Input()).toBe("=SUM(Revenue )");
  act(() => controller.Cancel());
  openNameMenu(/^Insert…$/);
  dialog = screen.getByRole("dialog", { name: "Paste Names" });
  await act(async () => {
    fireEvent.click(within(dialog).getByRole("button", { name: "Paste All" }));
  });
  /** Reads source list text at one cell. @param at - Cell location. @returns Text or absence. */
  function readText(at: ScAddress) {
    const stored = new ScRefCellValue(document, at).getSharedString();
    return stored ? text(stored.getString()) : undefined;
  }
  expect(bounds.map((at) => readText(at))).toEqual(["Revenue", "=$Sheet1.$A$1"]);
  act(() => expect(controller.Undo()).toBe(true));
  expect(readText(bounds[0])).toBeUndefined();
  expect(document.GetValue(bounds[1])).toBe(25);
  act(() => expect(controller.Redo()).toBe(true));
  expect(bounds.map((at) => readText(at))).toEqual(["Revenue", "=$Sheet1.$A$1"]);
});

it("keeps nested Add and Delete staged and restores all scopes with one Undo", async () => {
  const { controller } = mount();
  const document = controller.shell.GetDocument();
  enterNameBox("OriginalName");
  openNameMenu(/^Manage Names/);
  let manager = screen.getByRole("dialog", { name: "Manage Names" });
  await act(async () => {
    fireEvent.click(within(manager).getByRole("button", { name: "Add" }));
  });
  const add = screen.getByRole("dialog", { name: "Define Name" });
  fireEvent.change(within(add).getByRole("textbox", { name: "Name" }), {
    target: { value: "NestedName" },
  });
  fireEvent.change(within(add).getByRole("combobox", { name: "Scope" }), {
    target: { value: "0" },
  });
  await act(async () => {
    fireEvent.click(within(add).getByRole("button", { name: "Add" }));
  });
  manager = screen.getByRole("dialog", { name: "Manage Names" });
  expect(within(manager).getByRole("textbox", { name: "Name" })).toHaveValue("NestedName");
  fireEvent.click(within(manager).getByRole("button", { name: "OriginalName" }));
  fireEvent.click(within(manager).getByRole("button", { name: "Delete" }));
  expect(document.GetRangeName()?.findByUpperName("ORIGINALNAME")).toBeDefined();
  expect(document.GetRangeName(0)?.findByUpperName("NESTEDNAME")).toBeUndefined();
  await act(async () => {
    fireEvent.click(within(manager).getByRole("button", { name: "OK" }));
  });
  expect(document.GetRangeName()?.findByUpperName("ORIGINALNAME")).toBeUndefined();
  expect(document.GetRangeName(0)?.findByUpperName("NESTEDNAME")).toBeDefined();
  act(() => expect(controller.Undo()).toBe(true));
  expect(document.GetRangeName()?.findByUpperName("ORIGINALNAME")).toBeDefined();
  expect(document.GetRangeName(0)?.findByUpperName("NESTEDNAME")).toBeUndefined();
});
