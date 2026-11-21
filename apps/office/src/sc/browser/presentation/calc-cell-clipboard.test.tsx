/** @fileoverview Native Calc cell clipboard through the mounted workspace and browser data transfer. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, assert, expect, it, vi } from "vitest";
import { FormulaError } from "../../../formula/inc/errorcodes";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType } from "../../../svl/inc/zforlist";
import { SvxFontHeightItem } from "../../../editeng/inc/fhgtitem";
import { ScAddress } from "../../inc/address";
import { ScPatternAttr } from "../../inc/patattr";
import { CellType } from "../../inc/global";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
let restoreClipboard: (() => void) | undefined;
afterEach(() => {
  cleanup();
  active?.Close();
  active = undefined;
  restoreClipboard?.();
  restoreClipboard = undefined;
});

/** Mounts the actual Calc command frame and workbench. @returns Active view. */
function mount() {
  active = createCalcSession();
  render(<CalcWorkbench {...active} />);
  return active.controller;
}

/** Provides native-shaped synchronous browser clipboard data without OS permissions. @param initial - Optional external plain text. @returns Transfer fixture. */
function transfer(initial?: string) {
  const values = new Map<string, string>();
  if (initial !== undefined) values.set("text/plain", initial);
  return {
    /** Exposes the MIME types carried by the transfer. @returns Types. */
    get types() {
      return [...values.keys()];
    },
    getData: (type: string) => values.get(type) ?? "",
    setData: vi.fn((type: string, value: string) => {
      values.set(type, value);
    }),
  };
}

/** Returns the keyboard-focusable native grid. @returns Grid. */
function grid(): HTMLElement {
  return screen.getByRole("grid", { name: "Spreadsheet" });
}

/** Selects a source range using the real position box. @param range - Native address string. @returns Nothing. */
function select(range: string): void {
  const box = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(box, { target: { value: range } });
  fireEvent.keyDown(box, { key: "Enter" });
}

/** Installs a test clipboard at the native browser API boundary. @param native - Optional native grid transfer. @returns Clipboard fixture. */
function browserClipboard(native?: ReturnType<typeof transfer>) {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  let plain = "";
  const clipboard = {
    writeText: vi.fn(async (value: string) => {
      plain = value;
    }),
    readText: vi.fn(async () => plain),
    read: vi.fn(async () =>
      native
        ? [
            {
              types: native.types.map((type) => (type === "text/plain" ? type : "web " + type)),
              getType: async (type: string) => ({
                text: async () => native.getData(type.replace(/^web /, "")),
              }),
            },
          ]
        : [],
    ),
  };
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: clipboard });
  restoreClipboard = () => {
    if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
    else Reflect.deleteProperty(navigator, "clipboard");
  };
  return clipboard;
}

/** Executes the typed command from the native Paste Special submenu. @param name - Original menu caption suffix. @returns Completion. */
async function pasteOnly(name: "Text" | "Numbers" | "Formula"): Promise<void> {
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Paste Special" }));
  const item = screen.getByRole("menuitem", { name: "Paste Only " + name });
  await act(async () => fireEvent.click(item));
}

it("copies cells and their formats, then pastes relative formulas through one native Undo action", async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const a1 = new ScAddress(),
    c3 = new ScAddress(2, 2, 0),
    d3 = new ScAddress(3, 2, 0);
  act(() => {
    controller.EnterString("7");
    controller.Select(1, 0);
    expect(controller.EnterString("=A1+$A$1")).toBe(true);
    const pattern = new ScPatternAttr(doc.getCellAttributeHelper());
    pattern.ItemSetPut(new SvxFontHeightItem(320, 100, 101));
    doc.ApplyPatternAreaTab(0, 0, 0, 0, 0, pattern);
    pattern.Dispose();
  });
  select("A1:B1");
  const clipboard = transfer();
  fireEvent.copy(grid(), { clipboardData: clipboard });
  expect(clipboard.getData("text/plain")).toBe("7\t14");
  select("C3");
  const count = controller.shell.GetUndoManager().GetUndoActionCount();
  await act(async () => fireEvent.paste(grid(), { clipboardData: clipboard }));
  expect(doc.GetValue(c3)).toBe(7);
  expect(doc.GetValue(d3)).toBe(14);
  const formula = doc.GetFormulaCell(d3)?.GetFormula(doc.GetGrammar());
  expect(formula && text(formula)).toBe("=C3+$A$1");
  formula?.dispose();
  expect((doc.GetPattern(c3)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(320);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.GetFormulaCell(d3)).toBeNull();
  expect(doc.GetValue(a1)).toBe(7);
  act(() => expect(controller.Redo()).toBe(true));
  expect(doc.GetValue(d3)).toBe(14);
  expect((doc.GetPattern(c3)?.GetItem(101) as SvxFontHeightItem).GetHeight()).toBe(320);
});

it("ports tdf119343 by recalculating the pasted reference against the next row", async () => {
  const controller = mount();
  act(() => {
    for (const [row, value] of [
      [293, "Q108420"],
      [294, "Q1099565"],
      [295, "Q11005355"],
    ] as const) {
      controller.Select(9, row);
      expect(controller.EnterString(value)).toBe(true);
    }
    for (const row of [293, 294]) {
      controller.Select(12, row);
      expect(controller.EnterString("=+J" + (row + 1))).toBe(true);
    }
  });
  select("M295");
  const clipboard = transfer();
  fireEvent.copy(grid(), { clipboardData: clipboard });
  fireEvent.keyDown(grid(), { key: "ArrowDown" });
  await act(async () => fireEvent.paste(grid(), { clipboardData: clipboard }));
  const doc = controller.shell.GetDocument();
  for (const [row, expected] of [
    [293, "Q108420"],
    [294, "Q1099565"],
    [295, "Q11005355"],
  ] as const) {
    const cell = doc.GetFormulaCell(new ScAddress(12, row, 0));
    assert(cell);
    expect(text(cell.GetString().getString())).toBe(expected);
  }
});

it("ports CalcPasteOnly through the Text, Number and Formula menu commands", async () => {
  const clipboard = transfer();
  browserClipboard(clipboard);
  const controller = mount(),
    doc = controller.shell.GetDocument();
  act(() => expect(controller.EnterString("=SUM(A2:A3)")).toBe(true));
  select("A1");
  fireEvent.copy(grid(), { clipboardData: clipboard });

  select("C1");
  await pasteOnly("Text");
  expect(doc.GetCellType(new ScAddress(2, 0, 0))).toBe(CellType.CELLTYPE_NONE);
  select("D1");
  await pasteOnly("Numbers");
  expect(doc.GetCellType(new ScAddress(3, 0, 0))).toBe(CellType.CELLTYPE_VALUE);
  expect(doc.GetValue(new ScAddress(3, 0, 0))).toBe(0);
  select("E1");
  await pasteOnly("Formula");
  const cell = doc.GetFormulaCell(new ScAddress(4, 0, 0));
  assert(cell);
  expect(cell.GetValue()).toBe(0);
  const formula = cell.GetFormula(doc.GetGrammar());
  expect(text(formula)).toBe("=SUM(E2:E3)");
  formula.dispose();
});

it("pastes numbers without dates, keeps result errors and restores overwritten cell types on Undo", async () => {
  const clipboard = transfer();
  browserClipboard(clipboard);
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const dateFormat = doc.GetFormatTable().GetStandardFormat(SvNumFormatType.DATE);
  act(() => {
    controller.EnterString("=1+2");
    controller.Select(0, 1);
    controller.EnterString("=1/0");
    doc.SetValue(new ScAddress(0, 3, 0), 45001);
    doc.SetNumberFormat(new ScAddress(0, 3, 0), dateFormat);
    controller.Select(2, 0);
    controller.EnterString("old text");
    controller.Select(2, 1);
    controller.EnterString("=9");
    doc.SetValue(new ScAddress(2, 2, 0), 45002);
    doc.SetNumberFormat(new ScAddress(2, 2, 0), dateFormat);
    doc.SetValue(new ScAddress(2, 3, 0), 42);
  });
  select("A1:A4");
  fireEvent.copy(grid(), { clipboardData: clipboard });
  select("C1");
  await pasteOnly("Numbers");
  const dialog = within(screen.getByRole("alertdialog", { name: "Paste" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "Yes" })));
  const c1 = new ScAddress(2, 0, 0),
    c2 = new ScAddress(2, 1, 0);
  expect(doc.GetCellType(c1)).toBe(CellType.CELLTYPE_VALUE);
  expect(doc.GetValue(c1)).toBe(3);
  const error = doc.GetFormulaCell(c2);
  expect(error?.GetErrCode()).toBe(FormulaError.DivisionByZero);
  expect(error?.GetCode().GetLen()).toBe(0);
  expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(45002);
  expect(doc.GetCellType(new ScAddress(2, 3, 0))).toBe(CellType.CELLTYPE_NONE);
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.GetCellType(c1)).toBe(CellType.CELLTYPE_STRING);
  expect(doc.GetFormulaCell(c2)?.GetValue()).toBe(9);
  expect(doc.GetValue(new ScAddress(2, 3, 0))).toBe(42);
  act(() => expect(controller.Redo()).toBe(true));
  expect(doc.GetFormulaCell(c2)?.GetErrCode()).toBe(FormulaError.DivisionByZero);
});

it("pastes a multiline formula result as rich text and refuses a later external identity", async () => {
  const clipboard = transfer();
  browserClipboard(clipboard);
  const controller = mount(),
    doc = controller.shell.GetDocument();
  act(() => {
    const string = unicode("alpha\nbeta");
    const engine = doc.GetEditEngine();
    engine.SetTextCurrentDefaults(string);
    string.dispose();
    doc.SetEditText(new ScAddress(0, 1, 0), engine.CreateTextObject());
    expect(controller.EnterString("=A2")).toBe(true);
  });
  select("A1");
  fireEvent.copy(grid(), { clipboardData: clipboard });
  select("B1");
  await pasteOnly("Text");
  const b1 = new ScAddress(1, 0, 0);
  expect(doc.GetCellType(b1)).toBe(CellType.CELLTYPE_EDIT);
  const value = doc.GetRefCellValue(b1).getEditText()?.GetText();
  assert(value);
  expect(text(value)).toBe("alpha\nbeta");
  value.dispose();
  clipboard.setData("application/x-vite-office-calc-clipboard", "another source");
  select("C1");
  await pasteOnly("Text");
  expect(doc.GetCellType(new ScAddress(2, 0, 0))).toBe(CellType.CELLTYPE_NONE);
});

it("asks for Text Import settings, preserves leading zeroes and skips empty cells on confirmation", async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const b2 = new ScAddress(1, 1, 0),
    b3 = new ScAddress(1, 2, 0);
  act(() => {
    controller.Select(1, 2);
    controller.EnterString("keep");
    controller.Select(1, 1);
  });
  const data = transfer("id\tamount\n001\t2\n\t3");
  const count = controller.shell.GetUndoManager().GetUndoActionCount();
  await act(async () => fireEvent.paste(grid(), { clipboardData: data }));
  let dialog = screen.getByRole("dialog", { name: "Text Import" });
  expect(within(dialog).getByRole("table", { name: "Import preview" })).toHaveTextContent("amount");
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" })));
  expect(doc.GetCellType(b2)).toBe(CellType.CELLTYPE_NONE);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  await act(async () => fireEvent.paste(grid(), { clipboardData: data }));
  dialog = screen.getByRole("dialog", { name: "Text Import" });
  expect(within(dialog).getByRole("checkbox", { name: "Skip empty cells" })).toBeChecked();
  fireEvent.change(within(dialog).getByRole("spinbutton", { name: "From row" }), {
    target: { value: "2" },
  });
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Column type" }), {
    target: { value: "2" },
  });
  await act(async () => fireEvent.click(within(dialog).getByRole("button", { name: "OK" })));
  expect(doc.GetCellType(b2)).toBe(CellType.CELLTYPE_STRING);
  const imported = doc.GetRefCellValue(b2).getSharedString(),
    preserved = doc.GetRefCellValue(b3).getSharedString();
  assert(imported && preserved);
  expect(text(imported.getString())).toBe("001");
  expect(text(preserved.getString())).toBe("keep");
  expect(doc.GetValue(new ScAddress(2, 1, 0))).toBe(2);
  expect(doc.GetValue(new ScAddress(2, 2, 0))).toBe(3);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.GetCellType(b2)).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetCellType(b3)).toBe(CellType.CELLTYPE_STRING);
});

it("asks to extend a short selection and then to replace existing cells before creating Undo", async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const first = new ScAddress(0, 0, 0),
    last = new ScAddress(0, 2, 0),
    existing = new ScAddress(2, 2, 0);
  act(() => {
    doc.SetValue(first, 17);
    doc.SetValue(last, 29);
    doc.SetValue(existing, 41);
  });
  select("A1:A3");
  const clipboard = transfer();
  fireEvent.copy(grid(), { clipboardData: clipboard });
  select("C1:C2");
  const count = controller.shell.GetUndoManager().GetUndoActionCount();
  await act(async () => fireEvent.paste(grid(), { clipboardData: clipboard }));
  let dialog = within(screen.getByRole("alertdialog", { name: "Paste" }));
  expect(dialog.getByText(/bigger than the range/)).toBeVisible();
  expect(dialog.getByRole("button", { name: "No" })).toHaveFocus();
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "No" })));
  expect(doc.GetValue(existing)).toBe(41);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count);

  await act(async () => fireEvent.paste(grid(), { clipboardData: clipboard }));
  dialog = within(screen.getByRole("alertdialog", { name: "Paste" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "Yes" })));
  dialog = within(screen.getByRole("alertdialog", { name: "Paste" }));
  expect(dialog.getByRole("button", { name: "Yes" })).toHaveFocus();
  const warn = dialog.getByRole("checkbox", { name: /Warn me/ });
  expect(warn).toBeChecked();
  fireEvent.click(warn);
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "No" })));
  expect(doc.GetValue(existing)).toBe(41);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count);

  await act(async () => fireEvent.paste(grid(), { clipboardData: clipboard }));
  dialog = within(screen.getByRole("alertdialog", { name: "Paste" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "Yes" })));
  expect(screen.queryByRole("alertdialog", { name: "Paste" })).toBeNull();
  expect(doc.GetValue(existing)).toBe(29);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.GetValue(existing)).toBe(41);
});

it("uses the native menu for browser text Copy and Paste Unformatted without reusing a matching formula clip", async () => {
  const clipboard = browserClipboard();
  const controller = mount(),
    doc = controller.shell.GetDocument();
  act(() => expect(controller.EnterString("=2+3")).toBe(true));
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  await act(async () => fireEvent.click(screen.getByRole("menuitem", { name: "Copy" })));
  expect(clipboard.writeText).toHaveBeenCalledWith("5");
  select("B2");
  fireEvent.click(screen.getByRole("menuitem", { name: "Edit" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Paste Special" }));
  await act(async () =>
    fireEvent.click(screen.getByRole("menuitem", { name: /Unformatted Text/ })),
  );
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(5);
  expect(doc.GetFormulaCell(new ScAddress(1, 1, 0))).toBeNull();
});

it("keeps editable input clipboard events native and imports external formula addresses at the actual destination", async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const input = screen.getByRole("textbox", { name: "Input line" });
  fireEvent.focus(input);
  const editTransfer = transfer("1\t2");
  fireEvent.copy(input, { clipboardData: editTransfer });
  fireEvent.paste(input, { clipboardData: editTransfer });
  expect(editTransfer.setData).not.toHaveBeenCalled();
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
  fireEvent.keyDown(input, { key: "Escape" });
  act(() => doc.SetValue(new ScAddress(), 11));
  select("C4");
  await act(async () => fireEvent.paste(grid(), { clipboardData: transfer("=A1+1") }));
  const position = new ScAddress(2, 3, 0);
  expect(doc.GetValue(position)).toBe(12);
  const expected = unicode("=A1+1"),
    formula = doc.GetFormulaCell(position)?.GetFormula(doc.GetGrammar());
  expect(formula?.equals(expected)).toBe(true);
  formula?.dispose();
  expected.dispose();
});

it("imports quoted multiline cells and detected dates with number-format undo", async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  select("B2");
  await act(async () =>
    fireEvent.paste(grid(), {
      clipboardData: transfer('"first\nsecond"\t2024-02-03\nplain\t2024-02-04'),
    }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));
  const rich = new ScAddress(1, 1, 0),
    date = new ScAddress(2, 1, 0);
  expect(doc.GetCellType(rich)).toBe(CellType.CELLTYPE_EDIT);
  /** Reads the rich cell's default paragraph separator. @returns Cell text. */
  const readRich = (): string => {
    const value = doc.GetRefCellValue(rich).getEditText()?.GetText();
    assert(value);
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  };
  /** Reads the number format from the actual stored pattern. @returns Format index. */
  const format = (): number =>
    doc.GetPattern(date)?.GetNumberFormat(doc.GetNonThreadedContext()) ?? 0;
  expect(readRich()).toBe("first\nsecond");
  expect(doc.GetFormatTable().GetType(format()) & SvNumFormatType.DATE).not.toBe(0);
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.GetCellType(rich)).toBe(CellType.CELLTYPE_NONE);
  expect(format()).toBe(0);
  act(() => expect(controller.Redo()).toBe(true));
  expect(readRich()).toBe("first\nsecond");
  expect(doc.GetFormatTable().GetType(format()) & SvNumFormatType.DATE).not.toBe(0);
});

it("reports clipboard overflow at the sheet boundary and can undo the imported portion", async () => {
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const bottom = new ScAddress(0, doc.MaxRow(), 0);
  act(() => controller.Select(bottom.Col(), bottom.Row()));
  const count = controller.shell.GetUndoManager().GetUndoActionCount();
  await act(async () => fireEvent.paste(grid(), { clipboardData: transfer("4\n5") }));
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  await act(async () => fireEvent.click(dialog.getByRole("button", { name: "OK" })));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "The contents of the clipboard could not be pasted.",
  );
  expect(doc.GetValue(bottom)).toBe(4);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count + 1);
  act(() => expect(controller.Undo()).toBe(true));
  expect(doc.GetCellType(bottom)).toBe(CellType.CELLTYPE_NONE);
});
