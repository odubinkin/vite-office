/** @fileoverview Data menu Text to Columns over the native workbook and Undo owners. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType } from "../../../svl/inc/zforlist";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { ScAddress } from "../../inc/address";
import { CellType } from "../../inc/global";
import { readOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let active: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Unmounts the Calc workbench and closes the test session. @returns Nothing. */ () => {
    cleanup();
    active?.Close();
    active = undefined;
  },
);

/** Mounts the real Calc workspace and returns its native owner. @returns View controller. */
function mount() {
  active = createCalcSession();
  render(<CalcWorkbench {...active} />);
  return active.controller;
}

/** Selects a source address from the name box. @param address - Calc range or column. @returns Nothing. */
function select(address: string): void {
  const box = screen.getByRole("textbox", { name: "Name Box" });
  fireEvent.change(box, { target: { value: address } });
  fireEvent.keyDown(box, { key: "Enter" });
}

/** Opens the source slot's location. @returns Menu item. */
function command(): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: /^Data$/ }));
  return screen.getByRole("menuitem", { name: /^Text to Columns/ });
}

/** Executes the visible command and waits for its dialog. @returns Completion. */
async function openTextToColumns(): Promise<void> {
  const item = command();
  await act(
    /** Clicks the selected control. @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(item),
  );
}

/** Fills one single-column row in the real sheet. @param row - Zero-based row. @param input - Source text. @returns Nothing. */
function put(row: number, input: string): void {
  const value = unicode(input);
  try {
    active?.controller.shell.GetDocument().SetString(new ScAddress(0, row, 0), value);
  } finally {
    value.dispose();
  }
}

it("ports tdf51700 whole-column selection and restores the entire transformation in one Undo", /** Ports tdf51700 whole-column selection and restores the entire transformation in one Undo. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  expect(command()).toBeDisabled();
  fireEvent.keyDown(screen.getByRole("menu", { name: "Data menu" }), { key: "Escape" });
  act(
    /** Writes the comma-delimited input rows. @returns Nothing. */ () => {
      put(1, "3242,43242,3242,2342");
      put(2, "fdsfa,afsdfa,adfdas,fsad");
      put(3, "21312,1111,1111,111");
    },
  );
  select("A1");
  fireEvent.click(screen.getByRole("button", { name: /^Column A$/ }));
  await openTextToColumns();
  const dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  expect(dialog.queryByRole("group", { name: "Import" })).toBeNull();
  expect(dialog.getByRole("checkbox", { name: "Skip empty cells" })).not.toBeChecked();
  expect(dialog.getByRole("checkbox", { name: "Detect special numbers" })).toBeDisabled();
  fireEvent.click(dialog.getByRole("radio", { name: "Separated by" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Comma" }));
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  expect(doc.GetCellType(new ScAddress())).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(43242);
  expect(text(doc.GetSharedString(new ScAddress(3, 2, 0)).getString())).toBe("fsad");
  expect(doc.GetValue(new ScAddress(3, 3, 0))).toBe(111);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  act(
    /** Undoes the last Calc command and asserts success. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe(
    "3242,43242,3242,2342",
  );
  expect(doc.GetCellType(new ScAddress(3, 3, 0))).toBe(CellType.CELLTYPE_NONE);
  act(
    /** Reapplies the last undone Calc command and asserts success. @returns Nothing. */ () =>
      expect(controller.Redo()).toBe(true),
  );
  expect(doc.GetValue(new ScAddress(3, 3, 0))).toBe(111);
});

it("warns about occupied columns to the right and leaves a declined conversion intact", /** Warns about occupied columns to the right and leaves a declined conversion intact. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  const target = new ScAddress(1, 1, 0);
  act(
    /** Sets the native value. @returns Nothing. */ () => {
      put(1, "1;2");
      put(2, "3;4");
      doc.SetValue(target, 88);
    },
  );
  select("A2:A3");
  await openTextToColumns();
  const dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  expect(dialog.getByRole("radio", { name: "Detected (;)" })).toBeChecked();
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  let warning = within(screen.getByRole("alertdialog", { name: "Paste" }));
  await act(
    /** Clicks the button named "No". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(warning.getByRole("button", { name: "No" })),
  );
  expect(doc.GetValue(target)).toBe(88);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);

  await openTextToColumns();
  const reopened = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(reopened.getByRole("button", { name: "OK" })),
  );
  warning = within(screen.getByRole("alertdialog", { name: "Paste" }));
  await act(
    /** Clicks the button named "Yes". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(warning.getByRole("button", { name: "Yes" })),
  );
  expect(doc.GetValue(target)).toBe(2);
  expect(doc.GetValue(new ScAddress(0, 1, 0))).toBe(1);
  expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(4);
  act(
    /** Undoes the last Calc command and asserts success. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect(doc.GetValue(target)).toBe(88);
});

it("ports the original tdf69981 workbook and preserves explicit empty and trailing fields", /** Ports the original tdf69981 workbook and preserves explicit empty and trailing fields. @returns Completion. */ async () => {
  const data = await readFile("../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf69981.ods");
  const doc = await readOdsDocument(new Uint8Array(data));
  const controller = mount();
  act(
    /** Installs the pasted delimiter fixture in the active session. @returns Replacement result. */ () =>
      controller.shell.ReplaceDocument(
        doc,
        createDocument({ id: "tdf69981", suiteId: "calc", title: "tdf69981" }),
        { kind: "input", name: "tdf69981.ods", source: { kind: "external", reference: {} } },
      ),
  );
  select("A2:A7");
  await openTextToColumns();
  const dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  fireEvent.click(dialog.getByRole("radio", { name: "Separated by" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Tab" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Comma" }));
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  const warning = within(screen.getByRole("alertdialog", { name: "Paste" }));
  await act(
    /** Clicks the button named "Yes". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(warning.getByRole("button", { name: "Yes" })),
  );
  const expected = [
    ["Original", "Copy", ""],
    ["a", "b", "c"],
    ["", "b", "c"],
    ["", "", "c"],
    ["a", "", ""],
    ["a", "b", ""],
    ["a", "", "c"],
  ];
  expected.forEach(
    /** Verifies each cell in a split output row without moving the selection. @param row - Expected columns for the row. @param y - Destination row. @returns Nothing. */ (
      row,
      y,
    ) =>
      row.forEach(
        /** Compares one split cell against the expected string. @param value - Expected cell contents. @param x - Destination column. @returns Assertion result. */ (
          value,
          x,
        ) => expect(text(doc.GetSharedString(new ScAddress(x, y, 0)).getString())).toBe(value),
      ),
  );
});

it("ports tdf92423 and applies Text to Columns to the selection created by paste", /** Ports tdf92423 and applies Text to Columns to the selection created by paste. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  act(
    /** Writes the semicolon-delimited input rows. @returns Nothing. */ () => {
      put(0, "1;2");
      put(1, "2;3");
      put(2, "3;4");
    },
  );
  const values = new Map<string, string>();
  const clipboard = {
    /** Mirrors the types emitted by the browser transfer. @returns Available types. */
    get types() {
      return [...values.keys()];
    },
    setData:
      /** Captures the text-to-columns fixture's recorded clipboard payload. @param type - MIME type. @param value - Payload string. @returns Updated clipboard contents map. */ (
        type: string,
        value: string,
      ) => values.set(type, value),
    getData:
      /** Copies the clipboard data for the requested format into the test consumer. @param type - MIME type. @returns Recorded payload or an empty string. */ (
        type: string,
      ) => values.get(type) ?? "",
  };
  const grid = screen.getByRole("grid", { name: "Spreadsheet" });
  select("A1:A3");
  fireEvent.copy(grid, { clipboardData: clipboard });
  select("A7");
  await act(
    /** Pastes into the test control. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid, { clipboardData: clipboard }),
  );
  expect(controller.viewData.GetMarkData().GetMarkArea().GetVars()).toEqual([0, 6, 0, 0, 8, 0]);
  await openTextToColumns();
  const dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  fireEvent.click(dialog.getByRole("radio", { name: "Separated by" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Semicolon" }));
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("1;2");
  for (let row = 6; row <= 8; row++) {
    expect(doc.GetValue(new ScAddress(0, row, 0))).toBe(row - 5);
    expect(doc.GetValue(new ScAddress(1, row, 0))).toBe(row - 4);
  }
});

it("ports tdf82398 custom separators on a date-formatted input range", /** Ports tdf82398 custom separators on a date-formatted input range. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  act(
    /** Writes the period-delimited and comma-delimited fixture rows. @returns Nothing. */ () => {
      put(0, "afasdfs.fdfasd.fsadf.fasd");
      put(1, "3242.43242.3242.2342");
      put(2, "fdsfa.afsdfa.adfdas.fsad");
      put(3, "21312.1111.1111.111");
    },
  );
  select("A1:A4");
  const toolbar = within(screen.getByRole("toolbar", { name: "Calc formatting toolbar" }));
  fireEvent.click(toolbar.getByRole("button", { name: "Date" }));
  const formatter = doc.GetFormatTable();
  for (let row = 0; row < 4; row++)
    expect(formatter.GetType(doc.GetNumberFormat(0, row, 0))).toBe(SvNumFormatType.DATE);
  await openTextToColumns();
  const dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  fireEvent.click(dialog.getByRole("radio", { name: "Separated by" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: /^Other$/ }));
  fireEvent.change(dialog.getByRole("textbox", { name: "Other separators" }), {
    target: { value: "." },
  });
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  const rows = [
    ["afasdfs", "fdfasd", "fsadf", "fasd"],
    [3242, 43242, 3242, 2342],
    ["fdsfa", "afsdfa", "adfdas", "fsad"],
    [21312, 1111, 1111, 111],
  ];
  for (const [row, cells] of rows.entries())
    for (const [col, expected] of cells.entries()) {
      const address = new ScAddress(col, row, 0);
      if (typeof expected === "number") expect(doc.GetValue(address)).toBe(expected);
      else {
        const value = doc.GetSharedString(address);
        try {
          expect(text(value.getString())).toBe(expected);
        } finally {
          value.dispose();
        }
      }
    }
});

it("leaves the workbook intact on dialog cancellation or when the command target changes", /** Leaves the workbook intact on dialog cancellation or when the command target changes. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  act(/** Writes the protected-sheet input row. @returns Nothing. */ () => put(0, "1;2"));
  select("A1");
  await openTextToColumns();
  let dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  await act(
    /** Clicks the button named "Cancel". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "Cancel" })),
  );
  await openTextToColumns();
  dialog = within(screen.getByRole("dialog", { name: "Text to Columns" }));
  act(
    /** Moves the Calc selection to the requested cell. @returns Whether Calc accepted the selection. */ () =>
      controller.Select(3, 3),
  );
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("1;2");
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_NONE);
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
});
