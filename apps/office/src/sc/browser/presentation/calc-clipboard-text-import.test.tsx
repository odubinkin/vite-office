/** @fileoverview Native Calc clipboard text import through the mounted workbench. */
import { act, fireEvent, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { LANGUAGE_GERMAN } from "../../../i18nlangtag/inc/lang";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType } from "../../../svl/inc/zforlist";
import { ScAddress } from "../../inc/address";
import { CellType } from "../../inc/global";
import { createCalcClipboardFixture } from "../../../test/calc-clipboard-fixture";

const { mount, transfer, grid, select, browserClipboard, openPasteSpecial } =
  createCalcClipboardFixture();

it("uses the available external text format and then opens the existing import controls", /** Uses the available external text format and then opens the existing import controls. @returns Completion. */ async () => {
  browserClipboard(transfer("1\t2\n3\t4"));
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const dialog = await openPasteSpecial();
  expect(dialog.getByRole("option", { name: "Unformatted text" })).toBeVisible();
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  const textImport = within(screen.getByRole("dialog", { name: "Text Import" }));
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(textImport.getByRole("button", { name: "OK" })),
  );
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(4);
});

it("dispatches the explicit text import command for a single clipboard line and keeps it undoable", /** Dispatches the explicit text import command for a single clipboard line and keeps it undoable. @returns Completion. */ async () => {
  const clipboard = browserClipboard(transfer("14\t28"));
  const controller = mount(),
    doc = controller.shell.GetDocument();
  const start = new ScAddress(1, 1, 0);
  const end = new ScAddress(2, 1, 0);
  select("B2");
  const dialog = await openPasteSpecial();
  fireEvent.change(dialog.getByRole("listbox", { name: "Selection" }), {
    target: { value: ".uno:PasteTextImportDialog" },
  });
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  const textImport = within(screen.getByRole("dialog", { name: "Text Import" }));
  expect(clipboard.read).toHaveBeenCalledTimes(2);
  expect(doc.GetCellType(start)).toBe(CellType.CELLTYPE_NONE);
  await act(
    /** Clicks the button named "Cancel". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(textImport.getByRole("button", { name: "Cancel" })),
  );
  expect(doc.GetCellType(start)).toBe(CellType.CELLTYPE_NONE);

  const reopened = await openPasteSpecial();
  fireEvent.change(reopened.getByRole("listbox", { name: "Selection" }), {
    target: { value: ".uno:PasteTextImportDialog" },
  });
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(reopened.getByRole("button", { name: "OK" })),
  );
  const confirmed = within(screen.getByRole("dialog", { name: "Text Import" }));
  act(
    /** Sets the viewport dimensions used by the worksheet. @returns Nothing. */ () =>
      controller.MeasureViewport(0, 0, 390, 600),
  );
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(confirmed.getByRole("button", { name: "OK" })),
  );
  expect(doc.GetValue(start)).toBe(14);
  expect(doc.GetValue(end)).toBe(28);
  act(
    /** Undoes the last Calc command and asserts success. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect(doc.GetCellType(start)).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetCellType(end)).toBe(CellType.CELLTYPE_NONE);
});

it("rejects a text import if its active cell changes while options are open", /** Rejects a text import if its active cell changes while options are open. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: transfer("10\t20\n30\t40") }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  act(
    /** Moves the Calc selection to the requested cell. @returns Whether Calc accepted the selection. */ () =>
      controller.Select(2, 2),
  );
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  expect(doc.GetCellType(new ScAddress(0, 0, 0))).toBe(CellType.CELLTYPE_NONE);
  expect(doc.GetCellType(new ScAddress(2, 2, 0))).toBe(CellType.CELLTYPE_NONE);
});

it("ports tdf117868 pipe detection to the clipboard text import dialog", /** Ports tdf117868 pipe detection to the clipboard text import dialog. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  const source = 'sep=|\n"LETTER"|"ANIMAL"\n"a"|"aardvark"\n"b"|"bear"\n"c"|"cow"\n';
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: transfer(source) }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  expect(dialog.getByRole("radio", { name: "Detected (|)" })).toBeChecked();
  expect(dialog.getByRole("checkbox", { name: "Tab" })).toBeDisabled();
  expect(dialog.getByRole("spinbutton", { name: "From row" })).toHaveValue(1);
  fireEvent.click(dialog.getByRole("radio", { name: "Separated by" }));
  expect(dialog.getByRole("checkbox", { name: "Tab" })).toBeChecked();
  expect(dialog.getByRole("checkbox", { name: "Tab" })).toBeEnabled();
  fireEvent.click(dialog.getByRole("radio", { name: "Detected (|)" }));
  const preview = within(dialog.getByRole("table", { name: "Import preview" }));
  expect(preview.getByRole("cell", { name: "LETTER" })).toBeVisible();
  expect(preview.getByRole("cell", { name: "aardvark" })).toBeVisible();
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  [
    ["LETTER", "ANIMAL"],
    ["a", "aardvark"],
    ["b", "bear"],
    ["c", "cow"],
  ].forEach(
    /** Verifies all cells in the imported text row. @param row - Expected cell values. @param index - Row index relative to the paste anchor. @returns Nothing. */ (
      row,
      index,
    ) =>
      row.forEach(
        /** Verifies that the imported text matches the expected cell contents. @param value - Expected cell text. @param column - Destination column. @returns Assertion result. */ (
          value,
          column,
        ) =>
          expect(text(doc.GetSharedString(new ScAddress(column, index + 1, 0)).getString())).toBe(
            value,
          ),
      ),
  );
});

it("ports tdf92503 fixed-width DMY timestamps through the clipboard column type", /** Ports tdf92503 fixed-width DMY timestamps through the clipboard column type. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  const source = [
    "31 Mar 2013, 01:00",
    "31 Mar 2013, 02:00",
    "31 Mar 2013, 03:00",
    "30 Mar 2014, 01:00",
    "30 Mar 2014, 02:00",
    "30 Mar 2014, 03:00",
    "29 Mar 2015, 01:00",
    "29 Mar 2015, 02:00",
    "29 Mar 2015, 03:00",
  ].join("\n");
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: transfer(source) }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  const fixed = dialog.getByRole("radio", { name: "Fixed width" });
  fireEvent.click(fixed);
  expect(fixed).toBeChecked();
  expect(dialog.getByRole("textbox", { name: "String delimiter" })).toBeDisabled();
  fireEvent.change(dialog.getByRole("combobox", { name: "Column type" }), {
    target: { value: "4" },
  });
  expect(dialog.getByRole("combobox", { name: "Column type" })).toHaveDisplayValue("Date (DMY)");
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  const begin = Date.UTC(1899, 11, 30);
  for (let row = 0; row < 9; row++) {
    const year = Math.floor(row / 3);
    const serial = (Date.UTC(2013 + year, 2, 31 - year, (row % 3) + 1) - begin) / 86_400_000;
    const address = new ScAddress(0, row, 0);
    expect(doc.GetValue(address)).toBeCloseTo(serial, 10);
    const format = doc.GetPattern(address)?.GetNumberFormat(doc.GetNonThreadedContext()) ?? 0;
    expect(
      doc.GetFormatTable().GetType(format) & (SvNumFormatType.DATE | SvNumFormatType.TIME),
    ).toBe(SvNumFormatType.DATE | SvNumFormatType.TIME);
  }
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_NONE);
});

it("uses the selected clipboard locale and remembers the manual separator only after acceptance", /** Uses the selected clipboard locale and remembers the manual separator only after acceptance. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  const clipboard = transfer("1,5;2,5\n3,5;4,5");
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: clipboard }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  fireEvent.click(dialog.getByRole("radio", { name: "Separated by" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Tab" }));
  fireEvent.click(dialog.getByRole("checkbox", { name: "Semicolon" }));
  fireEvent.change(dialog.getByRole("combobox", { name: "Locale" }), {
    target: { value: String(LANGUAGE_GERMAN) },
  });
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  expect(doc.GetValue(new ScAddress(0, 0, 0))).toBe(1.5);
  expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(4.5);
  select("D4");
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: clipboard }),
  );
  const reopened = within(screen.getByRole("dialog", { name: "Text Import" }));
  expect(reopened.getByRole("radio", { name: "Separated by" })).toBeChecked();
  expect(reopened.getByRole("checkbox", { name: "Semicolon" })).toBeChecked();
  expect(reopened.getByRole("combobox", { name: "Locale" })).toHaveValue(String(LANGUAGE_GERMAN));
  fireEvent.click(reopened.getByRole("radio", { name: "Fixed width" }));
  await act(
    /** Clicks the button named "Cancel". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(reopened.getByRole("button", { name: "Cancel" })),
  );
  expect(doc.GetCellType(new ScAddress(3, 3, 0))).toBe(CellType.CELLTYPE_NONE);
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: clipboard }),
  );
  const afterCancel = within(screen.getByRole("dialog", { name: "Text Import" }));
  expect(afterCancel.getByRole("radio", { name: "Separated by" })).toBeChecked();
});

it("keeps Unicode fixed-width preview and pasted columns on the same ruler positions", /** Keeps Unicode fixed-width preview and pasted columns on the same ruler positions. @returns Completion. */ async () => {
  const controller = mount();
  const doc = controller.shell.GetDocument();
  const source = transfer("A漢B\nC字D");
  await act(
    /** Pastes into the worksheet grid. @returns Whether the default action is allowed, after dispatch. */ async () =>
      fireEvent.paste(grid(), { clipboardData: source }),
  );
  const dialog = within(screen.getByRole("dialog", { name: "Text Import" }));
  fireEvent.click(dialog.getByRole("radio", { name: "Fixed width" }));
  const ruler = dialog.getByRole("button", { name: "Fixed width ruler" });
  fireEvent.keyDown(ruler, { key: "Insert" });
  fireEvent.keyDown(ruler, { key: "ArrowRight" });
  fireEvent.keyDown(ruler, { key: "ArrowRight" });
  fireEvent.keyDown(ruler, { key: "Insert" });
  const preview = within(dialog.getByRole("table", { name: "Import preview" }));
  const firstRow = within(preview.getAllByRole("row")[1] as HTMLElement);
  expect(
    firstRow
      .getAllByRole("cell")
      .map(
        /** Reads the entry's `textContent` field. @param cell - Collection entry. @returns The field value. */ (
          cell,
        ) => cell.textContent,
      ),
  ).toEqual(["A", "漢", "B"]);
  await act(
    /** Clicks the button named "OK". @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(dialog.getByRole("button", { name: "OK" })),
  );
  ["A", "漢", "B"].forEach(
    /** Verifies each column produced by the explicit text import. @param value - Expected cell text. @param column - Destination column. @returns Assertion result. */ (
      value,
      column,
    ) => expect(text(doc.GetSharedString(new ScAddress(column, 0, 0)).getString())).toBe(value),
  );
  act(
    /** Undoes the last Calc command and asserts success. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect(doc.GetCellType(new ScAddress(1, 0, 0))).toBe(CellType.CELLTYPE_NONE);
});
