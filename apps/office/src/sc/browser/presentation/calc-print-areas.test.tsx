/** @fileoverview Source Calc printRange.py workflow and native print range request regressions. */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, assert, expect, it } from "vitest";
import { ScAddress, ScRange } from "../../inc/address";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SID_DEFINE_PRINTAREA } from "../../sdi/tabvwsh";
import { RangeDataType, ScRangeData } from "../../source/core/tool/rangenam";
import { FormatRepeatRange, ParseRepeatRange } from "../../source/ui/pagedlg/areasdlg";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

afterEach(cleanup);

/** Mounts the production workspace with actual Sfx slot bindings. @returns Session. */
function mountPrintAreas(): ReturnType<typeof createCalcSession> {
  const session = createCalcSession();
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      sheetWorkflows={session.sheetWorkflows}
      fileWorkflows={session.fileWorkflows}
    />,
  );
  return session;
}

/** Opens the native Format submenu and returns its command by accessible caption. @param name - Menu label. @returns Original command button. */
function printCommand(name: string): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Print Ranges" }));
  return within(screen.getByRole("menu", { name: "Print Ranges menu" })).getByRole("menuitem", {
    name,
  });
}

/** Returns the selected visible label of the print-range preset. @returns Preset label. */
function areaPreset(): string | null | undefined {
  return (screen.getByRole("combobox", { name: "Print Range preset" }) as HTMLSelectElement)
    .selectedOptions[0]?.textContent;
}

it("ports the upstream Define, edit repeat titles and clear scenario", /** Ports the upstream Define, edit repeat titles and clear scenario. @returns Completion. */ async () => {
  const session = mountPrintAreas();
  const controller = session.controller;
  const sheet = controller.shell.GetDocument().FetchTable(0);
  assert(sheet);
  const dispatcher = session.frame.GetDispatcher();
  const selection = new ScRange(0, 0, 0, 5, 19, 0);
  expect(printCommand("Clear")).toBeDisabled();
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  controller.viewData.GetMarkData().SetMarkArea(selection);
  fireEvent.click(printCommand("Define"));
  expect(sheet.GetPrintRange(0)).toEqual(selection);
  fireEvent.click(printCommand("Edit…"));
  expect(screen.getByRole("dialog", { name: "Edit Print Ranges" })).toBeVisible();
  expect(areaPreset()).toBe("- selection -");
  expect(screen.getByRole("textbox", { name: "Print Range" })).toHaveValue("$A$1:$F$20");
  fireEvent.change(screen.getByRole("textbox", { name: "Rows to Repeat" }), {
    target: { value: "$1" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Columns to Repeat" }), {
    target: { value: "$A" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  await waitFor(() => expect(sheet.GetRepeatRowRange()).toEqual(new ScRange(0, 0, 0)));

  act(() => {
    dispatcher.Execute(".uno:EditPrintArea");
  });
  expect(screen.getByRole("textbox", { name: "Print Range" })).toHaveValue("$A$1:$F$20");
  expect(screen.getByRole("textbox", { name: "Rows to Repeat" })).toHaveValue("$1");
  expect(screen.getByRole("textbox", { name: "Columns to Repeat" })).toHaveValue("$A");
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  });

  fireEvent.click(printCommand("Clear"));
  expect(sheet.IsPrintEntireSheet()).toBe(true);
  fireEvent.click(printCommand("Edit…"));
  expect(screen.getByRole("textbox", { name: "Print Range" })).toHaveValue("");
  expect(areaPreset()).toBe("- entire sheet -");
  expect(screen.getByRole("textbox", { name: "Rows to Repeat" })).toHaveValue("$1");
  expect(screen.getByRole("textbox", { name: "Columns to Repeat" })).toHaveValue("$A");
  const actions = controller.shell.GetUndoManager().GetUndoActionCount();
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(actions);
  cleanup();
  session.Close();
});

it("applies typed areas to marked sheets and restores workbook print history", /** Applies typed areas to marked sheets and restores workbook print history. @returns Nothing. */ () => {
  const session = createCalcSession();
  const controller = session.controller;
  const doc = controller.shell.GetDocument();
  const dispatcher = session.frame.GetDispatcher();
  controller.InsertSheet();
  controller.InsertSheet();
  controller.SelectTab(0);
  controller.SelectTab(1, true);
  const apply = (id: string, value: string) => {
    const command = dispatcher.QueryDispatch(id);
    assert(command);
    return dispatcher.ExecuteRequest(
      new SfxRequest(command.slot.slotId, [new SfxStringItem(SID_DEFINE_PRINTAREA, value)]),
    );
  };
  const first = new ScRange(1, 1, 0, 2, 2, 0);
  const second = new ScRange(4, 4, 0);
  const sheet0 = doc.FetchTable(0);
  assert(sheet0);
  const sheet1 = doc.FetchTable(1);
  assert(sheet1);
  const sheet2 = doc.FetchTable(2);
  assert(sheet2);
  const areaName = new ScRangeData(
    doc,
    "LocalPrintArea",
    new ScAddress(0, 0, 0),
    RangeDataType.PrintArea,
  );
  expect(sheet0.GetRangeName().insert(areaName)).toBe(true);
  apply(".uno:DefinePrintArea", "$B$2:$C$3;bad");
  expect(sheet0.GetRangeName().findByUpperName("LOCALPRINTAREA")).toBeUndefined();
  expect(sheet0.GetPrintRange(0)).toEqual(first);
  expect(sheet1.GetPrintRange(0)).toEqual(new ScRange(1, 1, 1, 2, 2, 1));
  expect(sheet2.IsPrintEntireSheet()).toBe(true);
  apply(".uno:AddPrintArea", "$E$5");
  expect(sheet0.GetPrintRange(1)).toEqual(second);
  expect(sheet1.GetPrintRangeCount()).toBe(2);
  const originatingTab = controller.viewData.GetTabNumber();
  controller.SelectTab(2);
  expect(controller.Undo()).toBe(true);
  expect(controller.viewData.GetTabNumber()).toBe(originatingTab);
  expect(sheet0.GetPrintRangeCount()).toBe(1);
  expect(sheet1.GetPrintRangeCount()).toBe(1);
  expect(controller.Undo()).toBe(true);
  expect(sheet0.IsPrintEntireSheet()).toBe(true);
  expect(sheet1.IsPrintEntireSheet()).toBe(true);
  expect(sheet0.GetRangeName().findByUpperName("LOCALPRINTAREA")).toBeUndefined();
  expect(controller.Redo()).toBe(true);
  expect(controller.Redo()).toBe(true);
  expect(sheet0.GetPrintRange(1)).toEqual(second);
  expect(sheet1.GetPrintRangeCount()).toBe(2);
  session.Close();
});

it("captures a grid reference without moving the cell cursor and validates the first invalid field", async () => {
  const session = mountPrintAreas();
  fireEvent.click(printCommand("Edit…"));
  const panel = screen.getByRole("dialog");
  const area = within(panel).getByRole("textbox", { name: "Print Range" });
  const rows = within(panel).getByRole("textbox", { name: "Rows to Repeat" });
  expect(area).toHaveFocus();
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "C4" }), { button: 0, pointerId: 1 });
  fireEvent.pointerUp(window, { button: 0, pointerId: 1 });
  expect(area).toHaveValue("$C$4");
  expect(session.controller.Address()).toBe("A1");
  fireEvent.click(within(panel).getByRole("button", { name: "Select Rows to Repeat" }));
  expect(within(panel).queryByRole("combobox")).toBeNull();
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "D5" }), { button: 0, pointerId: 2 });
  fireEvent.pointerUp(window, { button: 0, pointerId: 2 });
  expect(rows).toHaveValue("$5");
  fireEvent.click(within(panel).getByRole("button", { name: "Expand Edit Print Ranges" }));
  fireEvent.change(rows, { target: { value: "$0" } });
  fireEvent.click(within(panel).getByRole("button", { name: "OK" }));
  expect(within(panel).getByRole("alert")).toHaveTextContent("Invalid sheet reference.");
  expect(rows).toHaveFocus();
  expect(rows).toHaveAttribute("aria-invalid", "true");
  fireEvent.keyDown(rows, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(screen.getByRole("grid")).toHaveFocus();
  expect(session.controller.shell.GetDocument().FetchTable(0)?.IsPrintEntireSheet()).toBe(true);
  cleanup();
  session.Close();
});

it("retains the native A1 repeat separator and length rules and R1C1 bounds", /** Retains the native A1 repeat separator and length rules and R1C1 bounds. @returns Nothing. */ () => {
  const session = createCalcSession();
  const document = session.controller.shell.GetDocument();
  const range = ParseRepeatRange("12345:", document, "rows");
  expect(range).toEqual(new ScRange(0, 12344, 0));
  expect(FormatRepeatRange(range, document, "rows")).toBe("$12345");
  expect(ParseRepeatRange("$12345", document, "rows")).toBeUndefined();
  expect(ParseRepeatRange(":1", document, "rows")).toBeUndefined();
  expect(ParseRepeatRange("1::", document, "rows")).toBeUndefined();
  document.SetGrammar(FormulaGrammar.Grammar.GRAM_ENGLISH_XL_R1C1);
  expect(
    FormatRepeatRange(ParseRepeatRange("r1:R1048576", document, "rows"), document, "rows"),
  ).toBe("R1:R1048576");
  expect(ParseRepeatRange("R1048577", document, "rows")).toBeUndefined();
  expect(ParseRepeatRange("c1:C2", document, "columns")).toEqual(new ScRange(0, 0, 0, 1, 0, 0));
  session.Close();
});
