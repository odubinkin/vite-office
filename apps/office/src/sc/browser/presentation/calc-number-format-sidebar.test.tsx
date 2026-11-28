/** @fileoverview Native Calc Number Format panel, formatter colors and typed currency selection. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SvNumFormatType as T } from "../../../svl/inc/zforlist";
import { ScAddress, ScRange } from "../../inc/address";
import { NUMBER_FORMAT, NUMBER_FORMAT_TYPE, SID_NUMBER_FORMAT } from "../../sdi/formatsh.numformat";
import { ScFormatShell } from "../../source/ui/view/formatsh";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Unmounts the Calc workbench and closes the test session. @returns Nothing. */ () => {
    cleanup();
    session?.Close();
    session = undefined;
  },
);

/** Mounts the real session with its original focus and document owners. @returns Active Calc session. */
function mount() {
  session = createCalcSession();
  render(<CalcWorkbench {...session} />);
  return session;
}

/** Opens the source Properties deck. @returns Sidebar query scope. */
function properties() {
  const sidebar = within(screen.getByRole("complementary", { name: "Calc properties sidebar" }));
  fireEvent.click(sidebar.getByRole("button", { name: /^Properties$/ }));
  return sidebar;
}

it("projects category and native option controls, formatting color and undo across the active cell", /** Projects category and native option controls, formatting color and undo across the active cell. @returns Nothing. */ () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  act(
    /** Enters the fixture value through the normal Calc input path. @returns Native operation result. */ () =>
      controller.EnterString("-1234.5"),
  );
  const sidebar = properties();
  const category = sidebar.getByRole("combobox", { name: "Category" });
  const decimal = sidebar.getByRole("spinbutton", { name: "Decimal places" });
  expect(category).toHaveValue("0");
  expect(decimal).toHaveValue(null);
  fireEvent.change(category, { target: { value: "1" } });
  expect(doc.GetNumberFormat(0, 0, 0)).toBe(2);
  expect(decimal).toHaveValue(2);
  fireEvent.change(decimal, { target: { value: "3" } });
  const grouped = sidebar.getByRole("checkbox", { name: "Thousands separator" });
  fireEvent.click(grouped);
  fireEvent.click(sidebar.getByRole("checkbox", { name: "Negative numbers in red" }));
  const cell = screen.getByRole("gridcell", { name: "A1 -1,234.500" });
  expect(cell).toHaveStyle({ color: "rgb(255, 0, 0)" });
  const key = doc.GetNumberFormat(0, 0, 0);
  expect(doc.GetFormatTable().GetFormatSpecialInfo(key)).toEqual({
    grouped: true,
    precision: 3,
    leadingZeros: 1,
    red: true,
  });
  const dispatch = frame.GetDispatcher();
  expect(dispatch.QueryState(NUMBER_FORMAT).value).toBe("1,1,3,1,0,");
  act(
    /** Undoes the last Calc command and asserts success. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect(sidebar.getByRole("checkbox", { name: "Negative numbers in red" })).not.toBeChecked();
  expect(cell).not.toHaveStyle({ color: "rgb(255, 0, 0)" });
  expect(doc.GetValue(new ScAddress())).toBe(-1234.5);
});

it("uses the source scientific, fraction, time, date and mixed selection control states", /** Uses the source scientific, fraction, time, date and mixed selection control states. @returns Nothing. */ () => {
  const { controller, frame } = mount();
  const sidebar = properties();
  const category = sidebar.getByRole("combobox", { name: "Category" });
  const set =
    /** Selects a different number format category through the sidebar. @param category - Native format category identifier. @returns Change-event dispatch result. */ (
      category: number,
    ) =>
      fireEvent.change(sidebar.getByRole("combobox", { name: "Category" }), {
        target: { value: String(category) },
      });
  set(6);
  expect(sidebar.queryByRole("checkbox", { name: "Thousands separator" })).toBeNull();
  const engineering = sidebar.getByRole("checkbox", { name: "Engineering notation" });
  fireEvent.click(engineering);
  expect(engineering).toBeChecked();
  set(7);
  const denominator = sidebar.getByRole("spinbutton", { name: "Denominator places" });
  expect(denominator).toHaveAttribute("max", "8");
  fireEvent.change(denominator, { target: { value: "4" } });
  expect(denominator).toHaveValue(4);
  set(5);
  expect(sidebar.getByRole("checkbox", { name: "Thousands separator" })).toBeDisabled();
  expect(sidebar.getByRole("spinbutton", { name: "Leading zeroes" })).toBeDisabled();
  expect(sidebar.getByRole("spinbutton", { name: "Decimal places" })).toBeEnabled();
  set(4);
  expect(sidebar.getByRole("spinbutton", { name: "Decimal places" })).toBeDisabled();
  const dispatch = frame.GetDispatcher();
  act(
    /** Marks the test cell range and invalidates its toolbar state. @returns Nothing. */ () => {
      controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 0, 1, 0));
      dispatch.Invalidate("calc-view");
    },
  );
  expect(dispatch.QueryState(NUMBER_FORMAT_TYPE).mixed).toBe(true);
  expect(category).toHaveValue("-1");
  const count = controller.shell.GetUndoManager().GetUndoActionCount();
  set(0);
  expect(category).toHaveValue("0");
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(count);
  set(9);
  expect(category).toHaveValue("9");
  expect(
    controller.shell
      .GetDocument()
      .GetFormatTable()
      .GetType(controller.shell.GetDocument().GetNumberFormat(0, 1, 0)),
  ).toBe(T.TEXT);
});

it("keeps dock visibility and collapse separate and cancels popup focus to the existing owner", /** Keeps dock visibility and collapse separate and cancels popup focus to the existing owner. @returns Nothing. */ () => {
  const { frame } = mount();
  const sidebar = properties();
  sidebar.getByRole("combobox", { name: "Category" }).focus();
  fireEvent.keyDown(sidebar.getByRole("combobox", { name: "Category" }), { key: "Escape" });
  expect(sidebar.getByRole("button", { name: /^Number Format$/ })).toHaveFocus();
  act(
    /** Reopens the sidebar after its fixture state update. @returns Nothing. */ () => {
      frame.GetDispatcher().Execute(".uno:Sidebar");
    },
  );
  expect(screen.queryByRole("complementary", { name: "Calc properties sidebar" })).toBeNull();
  act(
    /** Reopens the sidebar before checking category-dependent formats. @returns Nothing. */ () => {
      frame.GetDispatcher().Execute(".uno:Sidebar");
    },
  );
  expect(sidebar.getByRole("combobox", { name: "Category" })).toBeVisible();
  fireEvent.click(sidebar.getByRole("button", { name: "Close Sidebar Deck" }));
  expect(sidebar.queryByRole("combobox", { name: "Category" })).toBeNull();
  expect(frame.GetDispatcher().QueryState(".uno:Sidebar").checked).toBe(true);
});

it("activates formatter-owned currency rows and repeats the chosen typed key on the main button", /** Activates formatter-owned currency rows and repeats the chosen typed key on the main button. @returns Nothing. */ () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  act(
    /** Enters the fixture value through the normal Calc input path. @returns Native operation result. */ () =>
      controller.EnterString("3.25"),
  );
  const toolbar = within(screen.getByRole("toolbar", { name: "Calc formatting toolbar" }));
  const open = toolbar.getByLabelText("Currency formats");
  fireEvent.click(open);
  const list = toolbar.getByRole("listbox", { name: "Currency formats" });
  const euro = [...list.querySelectorAll("option")].find(
    /** Finds the native ISO row rather than a locale symbol label. @param option - Currency option. @returns Whether the option is the ISO EUR row. */
    (option) => option.textContent?.replace(/[\u202a-\u202c]/gu, "") === "EUR",
  );
  expect(euro).toBeDefined();
  fireEvent.change(list, { target: { value: euro?.value } });
  fireEvent.keyDown(list, { key: "Enter" });
  expect(toolbar.queryByRole("listbox")).toBeNull();
  const key = doc.GetNumberFormat(0, 0, 0);
  const entry = doc.GetFormatTable().GetEntry(key);
  expect(entry && text(entry.GetFormatstring())).toContain("[$EUR]");
  act(
    /** Moves the Calc selection to the requested cell. @returns Whether Calc accepted the selection. */ () =>
      controller.Select(1, 0),
  );
  fireEvent.click(toolbar.getByRole("button", { name: "Currency" }));
  expect(doc.GetNumberFormat(1, 0, 0)).toBe(key);
  fireEvent.click(toolbar.getByRole("button", { name: "Currency" }));
  expect(doc.GetFormatTable().GetType(doc.GetNumberFormat(1, 0, 0))).toBe(T.NUMBER);
});

it("retains the native options request's comma termination and incomplete completion record", /** Retains the native options request's comma termination and incomplete completion record. @returns Nothing. */ () => {
  const { controller } = mount();
  const format = new ScFormatShell(controller.viewData, controller.shell);
  const request = new SfxRequest(SID_NUMBER_FORMAT, [
    new SfxStringItem(SID_NUMBER_FORMAT, "0,0,2,3"),
  ]);
  expect(format.ExecuteNumFormat(request)).toBe(true);
  expect(request.IsDone()).toBe(false);
  const doc = controller.shell.GetDocument();
  expect(doc.GetFormatTable().GetFormatSpecialInfo(doc.GetNumberFormat(0, 0, 0))).toMatchObject({
    precision: 2,
    leadingZeros: 0,
  });
});

it("ports testDocumentModelAccessor_getDocumentCurrencies and deduplicates the actual assigned format", /** Ports testDocumentModelAccessor_getDocumentCurrencies and deduplicates the actual assigned format. @returns Nothing. */ () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const accessor = controller.shell.GetDocumentModelAccessor();
  expect(accessor.getDocumentCurrencies()).toEqual([]);
  const formatter = doc.GetFormatTable();
  const code = unicode("#.##0,00[$€-424]");
  try {
    const key: [number] = [0];
    const type: [number] = [T.ALL];
    expect(formatter.PutEntry(code, [0], type, key, 0x0424)).toBe(true);
    expect(type[0] & T.CURRENCY).toBeTruthy();
    for (const [index, value] of [2, 5, 7].entries()) {
      const pos = new ScAddress(index, index, 0);
      doc.SetValue(pos, value);
      doc.SetNumberFormat(pos, key[0]);
      act(
        /** Moves the Calc selection to the requested cell. @returns Whether Calc accepted the selection. */ () =>
          controller.Select(index, index),
      );
      expect(screen.getByRole("gridcell", { name: new RegExp(value + ",00€$") })).toBeVisible();
      expect(accessor.getDocumentCurrencies()).toEqual([
        { aSymbol: "€", aExtension: "-424", eLanguage: 0x0424 },
      ]);
    }
  } finally {
    code.dispose();
  }
});
