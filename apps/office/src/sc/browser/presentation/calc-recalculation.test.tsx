/** @fileoverview Native Calculate submenu, formula quick help and conversion regressions. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, assert, expect, it } from "vitest";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ScAddress } from "../../inc/address";
import { CellType } from "../../inc/global";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let running: ReturnType<typeof createCalcSession> | undefined;
afterEach(() => {
  cleanup();
  running?.Close();
  running = undefined;
});

/** Renders the actual wired workspace. @returns Live Calc session. */
function mount() {
  running = createCalcSession();
  render(<CalcWorkbench {...running} />);
  return running;
}

/** Opens the native submenu within Data. @returns Nothing. */
function openCalculate(): void {
  fireEvent.click(screen.getByRole("menuitem", { name: "Data" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Calculate$/ }));
}

/** Borrows a workbook cell's visible input line through the name box. @param value - Sheet selection. @returns Nothing. */
function selectRange(value: string): void {
  const box = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(box, { target: { value } });
  fireEvent.keyDown(box, { key: "Enter" });
}

it("checks AutoCalculate against the live document and recalculates manual dependencies with F9", () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const a1 = new ScAddress(),
    b1 = new ScAddress(1, 0, 0);
  act(() => {
    controller.EnterString("2");
    controller.Select(1, 0);
    expect(controller.EnterString("=A1*3")).toBe(true);
  });
  expect(doc.GetValue(b1)).toBe(6);
  openCalculate();
  const automatic = screen.getByRole("menuitemcheckbox", { name: "AutoCalculate" });
  expect(automatic).toBeChecked();
  fireEvent.click(automatic);
  expect(doc.GetAutoCalc()).toBe(false);
  act(() => {
    controller.Select(0, 0);
    controller.EnterString("4");
  });
  expect(doc.GetValue(a1)).toBe(4);
  expect(doc.GetValue(b1)).toBe(6);
  fireEvent.keyDown(screen.getByRole("grid", { name: "Spreadsheet" }), { key: "F9" });
  expect(doc.GetValue(b1)).toBe(12);
  expect(doc.GetAutoCalc()).toBe(false);

  const dispatcher = frame.GetDispatcher();
  const request = new SfxRequest(26411, [new SfxBoolItem(26411, true)]);
  act(() => dispatcher.ExecuteRequest(request));
  expect(request.IsDone()).toBe(true);
  expect(dispatcher.QueryState(".uno:AutomaticCalculation").checked).toBe(true);
  expect(doc.GetAutoCalc()).toBe(true);
});

it("forces the cursor cell as in tdf97897 and hard-recalculates clean formulas on other sheets", () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  act(() => {
    controller.EnterString("=1+2");
    controller.InsertSheet();
    controller.EnterString("=3+4");
    controller.SelectTab(0);
  });
  const first = doc.GetFormulaCell(new ScAddress());
  const other = doc.GetFormulaCell(new ScAddress(0, 0, 1));
  assert(first && other);
  expect(first.GetValue()).toBe(3);
  expect(other.GetValue()).toBe(7);
  first.SetResultDouble(130);
  other.SetResultDouble(170);
  doc.FetchTable(1)?.SetStreamValid(true);
  openCalculate();
  fireEvent.click(screen.getByRole("menuitem", { name: "Recalculate" }));
  expect(first.GetValue()).toBe(3);
  expect(other.GetValue()).toBe(170);

  act(() => doc.SetAutoCalc(false));
  fireEvent.keyDown(screen.getByRole("grid", { name: "Spreadsheet" }), {
    key: "F9",
    ctrlKey: true,
    shiftKey: true,
  });
  expect(other.GetValue()).toBe(7);
  expect(doc.FetchTable(1)?.IsStreamValid()).toBe(false);
  expect(doc.GetAutoCalc()).toBe(false);
});

it("recalculates clean volatile formulas with ordinary F9 in manual mode", () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  act(() => {
    expect(controller.EnterString("=TODAY()")).toBe(true);
    controller.Select(1, 0);
  });
  const cell = doc.GetFormulaCell(new ScAddress());
  assert(cell);
  const date = cell.GetValue();
  act(() => doc.SetAutoCalc(false));
  expect(date).toBeGreaterThan(0);
  cell.SetResultDouble(date - 1);
  expect(cell.GetDirty()).toBe(false);
  fireEvent.keyDown(screen.getByRole("grid", { name: "Spreadsheet" }), { key: "F9" });
  expect(cell.GetValue()).toBe(date);
  expect(doc.GetAutoCalc()).toBe(false);
});

it("previews the selected formula fragment and accepts it into the edit before committing", () => {
  const { controller } = mount();
  const input = screen.getByRole("textbox", { name: "Input line" }) as HTMLInputElement;
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "=2+3*4" } });
  input.setSelectionRange(3, 6);
  fireEvent.select(input);
  fireEvent.keyDown(input, { key: "F9" });
  expect(screen.getByRole("tooltip")).toHaveTextContent("12");
  expect(input).toHaveValue("=2+3*4");
  expect(controller.shell.GetDocument().GetFormulaCell(new ScAddress())).toBeNull();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(input).toHaveValue("=2+12");
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(controller.shell.GetDocument().GetFormulaCell(new ScAddress())).toBeNull();
  fireEvent.keyDown(input, { key: "Enter" });
  expect(controller.shell.GetDocument().GetValue(new ScAddress())).toBe(14);
});

it("keeps the numeric F9 preview for an expression with an Excel A1 sheet qualifier", () => {
  const { controller } = mount(),
    doc = controller.shell.GetDocument();
  const sheetName = unicode("Source Data");
  try {
    act(() => {
      doc.InsertTab(1, sheetName);
      doc.SetValue(new ScAddress(0, 0, 1), 4);
      doc.SetValue(new ScAddress(0, 1, 1), 5);
      doc.SetGrammar(FormulaGrammar.Grammar.GRAM_NATIVE_XL_A1);
    });
  } finally {
    sheetName.dispose();
  }
  const input = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "=SUM('Source Data'!A1:A2)" } });
  fireEvent.keyDown(input, { key: "F9" });
  expect(screen.getByRole("tooltip")).toHaveTextContent(/^9$/);
  expect(doc.GetFormulaCell(new ScAddress())).toBeNull();
});

it("ports tdf131326 and the source Formula to Value dependency, result and undo scenarios", () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const a1 = new ScAddress(),
    a2 = new ScAddress(0, 1, 0),
    a3 = new ScAddress(0, 2, 0);
  const b1 = new ScAddress(1, 0, 0);
  act(() => {
    expect(controller.EnterString("=1")).toBe(true);
    controller.Select(0, 1);
    expect(controller.EnterString('="=literal"')).toBe(true);
    controller.Select(0, 2);
    expect(controller.EnterString("=1/0")).toBe(true);
    controller.Select(1, 0);
    expect(controller.EnterString("=ISFORMULA(A1)"), controller.error).toBe(true);
  });
  expect(doc.GetValue(b1)).toBe(1);
  selectRange("A1:A3");
  const undo = controller.shell.GetUndoManager().GetUndoActionCount();
  openCalculate();
  fireEvent.click(screen.getByRole("menuitem", { name: "Formula to Value" }));
  expect(screen.getByRole("textbox", { name: "Input line" })).toHaveValue("1");
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_VALUE);
  expect(doc.GetCellType(a2)).toBe(CellType.CELLTYPE_STRING);
  const string = doc.GetRefCellValue(a2).getSharedString();
  assert(string);
  expect(text(string.getString())).toBe("=literal");
  expect(doc.GetCellType(a3)).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetRefCellValue(a3).getSharedString()?.getString().getLength()).toBe(0);
  expect(doc.GetValue(b1)).toBe(0);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(undo + 1);

  selectRange("D4");
  act(() => expect(controller.Undo()).toBe(true));
  expect(controller.viewData.GetMarkData().IsCellMarked(0, 2)).toBe(true);
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_FORMULA);
  expect(doc.GetCellType(a2)).toBe(CellType.CELLTYPE_FORMULA);
  expect(doc.GetCellType(a3)).toBe(CellType.CELLTYPE_FORMULA);
  expect(doc.GetGrammar()).toBe(FormulaGrammar.Grammar.GRAM_NATIVE);
  expect(doc.GetValue(b1)).toBe(1);
  act(() => expect(controller.Redo()).toBe(true));
  expect(doc.GetCellType(a1)).toBe(CellType.CELLTYPE_VALUE);
  expect(doc.GetValue(b1)).toBe(0);
});

it("ports the middle-of-group conversion from ucalc and restores dependent formulas on undo", () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const grammar = FormulaGrammar.Grammar.GRAM_ENGLISH_XL_R1C1;
  act(() => {
    doc.SetGrammar(grammar);
    for (let row = 2; row <= 7; ++row) {
      [`=${row - 1}`, "=RC[-1]*2", "=ISFORMULA(RC[-1])"].forEach((source, index) => {
        const input = unicode(source);
        try {
          doc.SetFormula(new ScAddress(index + 1, row, 0), input, grammar);
        } finally {
          input.dispose();
        }
      });
    }
  });
  const inspect = (column: number, read: (address: ScAddress) => number): number[] =>
    Array.from({ length: 6 }, (_, row) => read(new ScAddress(column, row + 2, 0)));
  expect(inspect(3, (position) => doc.GetValue(position))).toEqual([1, 1, 1, 1, 1, 1]);
  selectRange("R5C2:R6C3");
  openCalculate();
  fireEvent.click(screen.getByRole("menuitem", { name: "Formula to Value" }));
  expect(inspect(2, (position) => doc.GetValue(position))).toEqual([2, 4, 6, 8, 10, 12]);
  expect(inspect(3, (position) => doc.GetValue(position))).toEqual([1, 1, 0, 0, 1, 1]);
  expect(inspect(1, (position) => doc.GetCellType(position))).toEqual([
    CellType.CELLTYPE_FORMULA,
    CellType.CELLTYPE_FORMULA,
    CellType.CELLTYPE_VALUE,
    CellType.CELLTYPE_VALUE,
    CellType.CELLTYPE_FORMULA,
    CellType.CELLTYPE_FORMULA,
  ]);
  act(() => expect(controller.Undo()).toBe(true));
  expect(inspect(3, (position) => doc.GetValue(position))).toEqual([1, 1, 1, 1, 1, 1]);
});
