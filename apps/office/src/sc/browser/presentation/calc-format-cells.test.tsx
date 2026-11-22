/** @fileoverview Format Cells tests over the real Calc frame, imported formatting and undo owners. */
import { afterEach, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { implementations } from "../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../desktop/source/app/appinit";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { SvNumFormatType as T } from "../../../svl/inc/zforlist";
import type { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { ScAddress, ScRange } from "../../inc/address";
import { ScProtectionAttr, ScLineBreakCell } from "../../inc/attrib";
import { ATTR_BACKGROUND, ATTR_LINEBREAK, ATTR_PROTECTION } from "../../inc/scitems";
import { FID_CELL_FORMAT } from "../../source/ui/attrdlg/attrdlg";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

InitApplicationServiceManager(implementations);

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Releases the mounted Calc test session. @returns Nothing. */ () => {
    cleanup();
    session?.Close();
    session = undefined;
  },
);

/** Mounts the actual Calc session. @returns Live session. */
function mount() {
  session = createCalcSession();
  render(<CalcWorkbench {...session} />);
  return session;
}

/** Gets the current async dialog. @returns Native modal queries. */
function dialog() {
  return within(screen.getByRole("dialog", { name: "Format Cells" }));
}

/** Submits the current dialog and permits the actual async request to complete. @returns Completion. */
async function accept(): Promise<void> {
  await act(
    /** Accepts the pending modal response. @returns Completion. */ async () =>
      fireEvent.click(dialog().getByRole("button", { name: "OK" })),
  );
}

/** Dispatches the original no-argument cell command. @returns Nothing. */
function open(): void {
  act(
    /** Requests the dialog from the active native frame. @returns Nothing. */ () => {
      session?.frame.GetDispatcher().Execute(".uno:FormatCellDialog");
    },
  );
}

it("ports the original Numbers options result, locale and stored picture through reopen", /** Verifies native number options and locale after reopening. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Format Cells/ }));
  let modal = dialog();
  fireEvent.change(modal.getByLabelText("Locale"), { target: { value: "1033" } });
  fireEvent.change(modal.getByRole("spinbutton", { name: "Decimal places" }), {
    target: { value: "1" },
  });
  fireEvent.change(modal.getByRole("spinbutton", { name: "Leading zeroes" }), {
    target: { value: "2" },
  });
  fireEvent.click(modal.getByRole("checkbox", { name: "Negative numbers red" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Thousands separator" }));
  expect(modal.getByLabelText("Format Code")).toHaveValue("#,#00.0;[RED]-#,#00.0");
  await accept();
  const key = doc.GetNumberFormat(0, 0, 0);
  expect(doc.GetFormatTable().GetFormatSpecialInfo(key)).toEqual({
    grouped: true,
    red: true,
    precision: 1,
    leadingZeros: 2,
  });
  open();
  modal = dialog();
  expect(modal.getByLabelText("Locale")).toHaveValue("1033");
  expect(modal.getByLabelText("Format Code")).toHaveValue("#,#00.0;[RED]-#,#00.0");
});

it("ports the original spell-out gallery pictures and formatted names" /** Verifies the source native-number examples are gallery labels over real format codes. @returns Nothing. */, () => {
  mount();
  open();
  const modal = dialog();
  const gallery = modal.getByRole("listbox", { name: "Format" });
  const list = within(gallery);
  for (const [label, modifier] of [
    ["one hundred", ""],
    ["One hundred", "capitalize "],
    ["One Hundred", "title "],
    ["ONE HUNDRED", "upper "],
  ] as const) {
    const row = list.getByRole("option", { name: label });
    const code = "[NatNum12 " + modifier + "cardinal]0";
    expect(row).toHaveAttribute("value", code);
    fireEvent.change(gallery, { target: { value: code } });
    expect(modal.getByLabelText("Format Code")).toHaveValue(code);
  }
});

it("ports the scientific options regression and keeps cancellation outside the document format table", /** Verifies automatic recognition through the native document and cancels a scientific draft. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const source = unicode("1e-2");
  try {
    expect(doc.SetString(new ScAddress(), source)).toBe(true);
  } finally {
    source.dispose();
  }
  const table = doc.GetFormatTable();
  const count = table.GetROFormatData().GetFormatEntryMap().size;
  open();
  const modal = dialog();
  expect(modal.getByLabelText("Category")).toHaveValue(String(T.SCIENTIFIC));
  expect(modal.getByRole("spinbutton", { name: "Decimal places" })).toHaveValue(2);
  expect(modal.getByRole("spinbutton", { name: "Decimal places" })).toBeEnabled();
  expect(modal.getByRole("spinbutton", { name: "Leading zeroes" })).toHaveValue(1);
  expect(modal.getByLabelText("Format Code")).toHaveValue("0.00E+00");
  fireEvent.change(modal.getByLabelText("Format Code"), { target: { value: "0.0000E+00" } });
  fireEvent.click(modal.getByRole("button", { name: "Cancel" }));
  expect(table.GetROFormatData().GetFormatEntryMap().size).toBe(count);
  expect(table.GetFormatSpecialInfo(doc.GetNumberFormat(0, 0, 0)).precision).toBe(2);
});

it("applies alignment, fill and protection as one attribute transaction and preserves ODS values", /** Verifies the source alignment and protection pages, ODS and history. @returns Completion. */ async () => {
  const { controller } = mount();
  const doc = controller.shell.GetDocument();
  const pos = new ScAddress(0, 0, 0);
  doc.SetValue(pos, 45.125);
  open();
  const modal = dialog();
  fireEvent.click(modal.getByRole("tab", { name: "Alignment" }));
  const angle = modal.getByRole("spinbutton", { name: "Degrees" });
  expect(angle).toHaveValue(0);
  fireEvent.keyDown(angle, { key: "ArrowDown" });
  expect(angle).toHaveValue(355);
  fireEvent.keyDown(angle, { key: "ArrowUp" });
  expect(angle).toHaveValue(0);
  fireEvent.change(modal.getByLabelText("Vertical"), { target: { value: "1" } });
  fireEvent.change(modal.getByLabelText("Horizontal"), { target: { value: "1" } });
  fireEvent.change(modal.getByLabelText("Indent"), { target: { value: "2" } });
  fireEvent.click(modal.getByRole("checkbox", { name: "Vertically stacked" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Wrap text automatically" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hyphenation active" }));
  fireEvent.change(modal.getByLabelText("Text direction"), { target: { value: "0" } });
  fireEvent.click(modal.getByRole("tab", { name: "Background" }));
  fireEvent.change(modal.getByLabelText("Fill"), { target: { value: "color" } });
  fireEvent.change(modal.getByLabelText("Color"), { target: { value: "#1c8843" } });
  fireEvent.click(modal.getByRole("tab", { name: "Cell Protection" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Protected" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hide formula" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hide when printing" }));
  await accept();

  const checkItems =
    /** Checks stored attributes on live and imported documents. @param value - New control value. @returns Nothing. */ (
      value: typeof doc,
    ) => {
      const pattern = value.GetPattern(pos);
      expect((pattern?.GetItem(ATTR_LINEBREAK) as ScLineBreakCell).GetValue()).toBe(true);
      expect((pattern?.GetItem(ATTR_BACKGROUND) as SvxBrushItem).GetColor().GetGreen()).toBe(136);
      const protection = pattern?.GetItem(ATTR_PROTECTION) as ScProtectionAttr;
      expect([
        protection.GetProtection(),
        protection.GetHideFormula(),
        protection.GetHidePrint(),
      ]).toEqual([false, true, true]);
      expect(value.GetValue(pos)).toBe(45.125);
    };
  checkItems(doc);
  open();
  const saved = dialog();
  fireEvent.click(saved.getByRole("tab", { name: "Alignment" }));
  expect(saved.getByLabelText("Horizontal")).toHaveDisplayValue("Left");
  expect(saved.getByLabelText("Vertical")).toHaveDisplayValue("Top");
  expect(saved.getByLabelText("Indent")).toHaveValue(2);
  expect(saved.getByLabelText("Vertically stacked")).toBeChecked();
  expect(saved.getByLabelText("Wrap text automatically")).toBeChecked();
  expect(saved.getByLabelText("Hyphenation active")).toBeChecked();
  expect(saved.getByLabelText("Text direction")).toHaveValue("0");
  fireEvent.click(saved.getByRole("button", { name: "Cancel" }));
  expect(controller.shell.GetUndoManager().GetUndoActionCount()).toBe(1);
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    checkItems(reopened);
  } finally {
    reopened.Dispose();
  }
  act(
    /** Verifies undo through the native view. @returns Nothing. */ () =>
      expect(controller.Undo()).toBe(true),
  );
  expect((doc.GetPattern(pos)?.GetItem(ATTR_PROTECTION) as ScProtectionAttr).GetProtection()).toBe(
    true,
  );
  act(
    /** Verifies redo through the native view. @returns Nothing. */ () =>
      expect(controller.Redo()).toBe(true),
  );
  checkItems(doc);
});

it("uses context and keyboard entry points, preserves mixed untouched formats and accepts native typed attributes", /** Verifies alternate entry points, mixed attributes and typed requests. @returns Completion. */ async () => {
  const { controller, frame } = mount();
  const doc = controller.shell.GetDocument();
  const second = new ScAddress(1, 0, 0);
  const key = doc.GetFormatTable().GetStandardFormat(T.PERCENT);
  doc.SetNumberFormat(second, key);
  controller.viewData.GetMarkData().SetMarkArea(new ScRange(0, 0, 0, 1, 0, 0));
  fireEvent.contextMenu(screen.getByRole("gridcell", { name: "A1" }), {
    clientX: 300,
    clientY: 200,
  });
  const context = within(screen.getByRole("menu", { name: "Calc cell context menu" }));
  fireEvent.click(context.getByRole("menuitem", { name: /^Format Cells/ }));
  const modal = dialog();
  expect(modal.getByLabelText("Format Code")).toHaveValue("");
  fireEvent.click(modal.getByRole("tab", { name: "Cell Protection" }));
  fireEvent.click(modal.getByRole("checkbox", { name: "Hide formula" }));
  await accept();
  expect(doc.GetNumberFormat(0, 0, 0)).toBe(0);
  expect(doc.GetNumberFormat(1, 0, 0)).toBe(key);
  controller.viewData.GetMarkData().ResetMark();
  fireEvent.keyDown(screen.getByRole("grid", { name: "Spreadsheet" }), {
    key: "1",
    code: "Digit1",
    ctrlKey: true,
  });
  expect(dialog().getByRole("tab", { name: "Numbers" })).toHaveFocus();
  fireEvent.keyDown(dialog().getByRole("tab", { name: "Numbers" }), { key: "Escape" });
  const request = new SfxRequest(FID_CELL_FORMAT, [new ScLineBreakCell(true)]);
  await act(
    /** Waits for the typed request and verifies its dispatcher outcome. @returns Completion. */ async () => {
      const outcome = frame.GetDispatcher().ExecuteRequest(request);
      expect(outcome.status).toBe("executed");
      if (outcome.status === "executed") await outcome.value;
    },
  );
  expect(request.IsDone()).toBe(true);
  expect(
    (doc.GetPattern(new ScAddress())?.GetItem(ATTR_LINEBREAK) as ScLineBreakCell).GetValue(),
  ).toBe(true);
  const entry = doc.GetFormatTable().GetEntry(key);
  expect(entry && text(entry.GetFormatstring())).toContain("%");
});
