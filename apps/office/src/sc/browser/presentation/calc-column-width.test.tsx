/** @fileoverview Shared Writer menu/dialog styling with actual native column width and visibility workflows. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScMetricInputDlg } from "./ScMetricInputDlg";
import { ScMetricInputDlg as NativeDialog } from "../../source/ui/miscdlgs/mtrindlg";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import type { CommandDispatchResult } from "../../../sfx2/source/control/dispatch";
import {
  setConfiguredSystemLanguage,
  getConfiguredSystemLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";
import { ScInputMode } from "../../inc/global";
afterEach(cleanup);
/** Awaits the actual browser command boundary. @param result - Real dispatch. @returns Completion. */
async function completed(result: CommandDispatchResult<unknown>): Promise<void> {
  if (result.status !== "executed") throw new Error(result.status);
  await result.value;
}
/** Opens the native Format/Columns submenu. @returns Nothing. */
function columns(): void {
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Columns" }));
}
it("uses shared menus,actual width history and source hide/show without losing widths", /** Complete user flow. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller,
    doc = c.shell.GetDocument();
  try {
    render(
      <CalcWorkbench
        controller={c}
        frame={session.frame}
        fileWorkflows={session.fileWorkflows}
        sheetWorkflows={session.sheetWorkflows}
      />,
    );
    columns();
    fireEvent.click(screen.getByRole("menuitem", { name: "Column Width…" }));
    const input = screen.getByRole("spinbutton", { name: "Width" });
    expect(input).toHaveFocus();
    expect(screen.getByRole("grid").closest("[inert]")).toHaveAttribute("inert");
    fireEvent.change(input, { target: { value: "1in" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(
      /** Awaits actual native application. @returns Assertion. */ () =>
        expect(doc.GetColWidth(0, 0)).toBe(1440),
    );
    expect(screen.getByRole("gridcell", { name: "A1" })).toHaveStyle({
      width: "96px",
    });
    act(
      /** Real history. @returns Nothing. */ () => {
        c.Undo();
      },
    );
    expect(doc.GetColWidth(0, 0)).toBe(1280);
    act(
      /** Real redo. @returns Nothing. */ () => {
        c.Redo();
      },
    );
    expect(doc.GetColWidth(0, 0)).toBe(1440);
    columns();
    fireEvent.click(screen.getByRole("menuitem", { name: "Hide Columns" }));
    expect(doc.ColHidden(0, 0)).toBe(true);
    expect(screen.getByRole("textbox", { name: "Name Box" })).toHaveValue("B1");
    expect(doc.GetColWidth(0, 0, false)).toBe(1440);
    expect(screen.queryByRole("gridcell", { name: "A1" })).not.toBeInTheDocument();
    act(
      /** Selects the actual hidden column by address. @returns Nothing. */ () => {
        c.Select(0, 0);
      },
    );
    columns();
    fireEvent.click(screen.getByRole("menuitem", { name: "Show Columns" }));
    expect(doc.GetColWidth(0, 0)).toBe(1440);
    columns();
    fireEvent.click(screen.getByRole("menuitem", { name: "Column Width…" }));
    fireEvent.keyDown(screen.getByRole("spinbutton", { name: "Width" }), { key: "Escape" });
    await waitFor(
      /** Cancels original async request. @returns Assertion. */ () =>
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(doc.GetColWidth(0, 0)).toBe(1440);
  } finally {
    session.Close();
  }
});
it("presents native centimetre precision,default restoration and decimal spin increments", /** Real metric control in shared styled presentation. @returns Nothing. */ () => {
  const model = new NativeDialog("ColWidthDialog", 1440, 1280, FieldUnit.CM, 2, 56693, 2),
    values: number[] = [];
  render(
    <ScMetricInputDlg
      model={model}
      onCancel={
        /** Cancellation is observed by the separate request test. @returns Nothing. */ () =>
          undefined
      }
      onSubmit={
        /** Captures actual accepted twips. @param twips - Native result. @returns Nothing. */ (
          twips,
        ) => {
          values.push(twips);
        }
      }
    />,
  );
  const input = screen.getByRole("spinbutton", { name: "Width" }),
    checkbox = screen.getByRole("checkbox", { name: "Default value" });
  expect(input).toHaveValue("2.54 cm");
  const increase = screen.getByRole("button", { name: "Increase width" }),
    decrease = screen.getByRole("button", { name: "Decrease width" });
  fireEvent.mouseDown(increase);
  fireEvent.click(increase);
  expect(input).toHaveValue("2.64 cm");
  fireEvent.mouseDown(decrease);
  fireEvent.click(decrease);
  expect(input).toHaveValue("2.54 cm");

  expect(checkbox).not.toBeChecked();
  fireEvent.click(checkbox);
  expect(input).toHaveValue("2.26 cm");
  fireEvent.click(checkbox);
  expect(input).toHaveValue("2.54 cm");
  fireEvent.change(input, { target: { value: "invalid" } });
  fireEvent.blur(input);
  expect(input).toHaveValue("2.54 cm");
  for (const key of ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "x"])
    fireEvent.keyDown(input, { key });
  expect(input).toHaveValue("2.54 cm");
  fireEvent.keyDown(input, { key: "Enter" });
  fireEvent.submit(input.closest("form") as HTMLFormElement);
  expect(values).toEqual([1440]);
});
it("routes typed width commands,blocked input,duplicate dialogs and cancellation at session close", /** Actual shared slot lifecycle. @returns Completion. */ async () => {
  const session = createCalcSession(),
    c = session.controller,
    d = session.frame.GetDispatcher();
  await completed(d.ExecuteRequest(new SfxRequest(26290, [new SfxUInt16Item(26290, 2540)])));
  expect(c.shell.GetDocument().GetColWidth(0, 0)).toBe(1440);
  c.StartInput(ScInputMode.SC_INPUT_TOP, "=UNPORTED(A1)");
  c.ShowColumns(false);
  expect(c.shell.GetDocument().ColHidden(0, 0)).toBe(false);
  await completed(d.Execute(".uno:ColumnWidth"));
  expect(session.sheetWorkflows.metricDialogs.GetSnapshot()).toBeUndefined();
  c.Cancel();
  const pending = d.Execute(".uno:ColumnWidth");
  expect(d.QueryState(".uno:ColumnWidth").enabled).toBe(false);
  expect(d.Execute(".uno:ColumnWidth").status).toBe("disabled");
  session.Close();
  await completed(pending);
  expect(session.sheetWorkflows.metricDialogs.GetSnapshot()).toBeUndefined();
});

it("renders the source inch suffix and cancels through the shared dialog close button", /** Real native inch initialization. @returns Nothing. */ () => {
  const model = new NativeDialog("ColWidthDialog", 1440, 1280, FieldUnit.INCH, 2, 56693, 2),
    cancelled: boolean[] = [];
  render(
    <ScMetricInputDlg
      model={model}
      onCancel={
        /** Records actual close completion. @returns Nothing. */ () => {
          cancelled.push(true);
        }
      }
      onSubmit={
        /** Acceptance is exercised by the shared command flow. @returns Nothing. */ () => undefined
      }
    />,
  );
  expect(screen.getByRole("spinbutton", { name: "Width" })).toHaveValue("1.00″");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(cancelled).toEqual([true]);
});

it("uses the actual configured metric locale for the native no-argument width dialog", /** Real common locale configuration,not an injected measurement service. @returns Completion. */ async () => {
  const previous = getConfiguredSystemLanguage();
  setConfiguredSystemLanguage(0x0407);
  const session = createCalcSession();
  try {
    const pending = session.frame.GetDispatcher().Execute(".uno:ColumnWidth"),
      request = session.sheetWorkflows.metricDialogs.GetSnapshot();
    expect(request?.request.unit).toBe(FieldUnit.CM);
    session.Close();
    await completed(pending);
  } finally {
    session.Close();
    setConfiguredSystemLanguage(previous);
  }
});
