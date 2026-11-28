/** @fileoverview Source conditional-format rule and manager scenarios through the real Calc view. */
import { readFileSync } from "node:fs";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, assert, expect, it } from "vitest";
import { BrowserSfxDispatcher } from "../../../framework/browser/dispatch/browser-dispatcher";
import {
  DocumentArchive,
  DocumentArchiveWriter,
} from "../../../package/source/zippackage/document-archive";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { COL_BLACK, COL_RED, Color } from "../../../tools/inc/color";
import { ScAddress } from "../../inc/address";
import { ScColorScaleEntryType, ScDataBarFormat, ScIconSetFormat } from "../../inc/colorscale";
import { ATTR_BACKGROUND } from "../../inc/scitems";
import { ScCondFormatEntry, ScConditionMode, ScFormatEntryType } from "../../inc/conditio";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import type { ScDocument } from "../../inc/document";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { exportXlsx } from "../../source/filter/excel/xetable";
import { ExcelFilter } from "../../source/filter/oox/excelfilter";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { ScCellDataBar } from "./ScCellDataBar";

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(
  /** Unmounts Calc and releases the current document after each rule test. @returns Nothing. */ () => {
    cleanup();
    session?.Close();
    session = undefined;
  },
);

it("paints a solid negative data bar to the left of an interior zero axis", /** Checks the rendered color and geometry of the solid fill. @returns Nothing. */ () => {
  const { container } = render(
    <ScCellDataBar
      info={{
        maAxisColor: new Color(COL_BLACK),
        maColor: new Color(COL_RED),
        mbGradient: false,
        mbShowValue: true,
        mnLength: -50,
        mnZero: 50,
      }}
      width={100}
      height={20}
    />,
  );
  expect(container.querySelector("[data-calc-data-bar]")).toHaveStyle({
    backgroundColor: "rgb(128, 0, 0)",
    left: "26px",
    width: "24px",
  });
  expect(container.querySelector("[data-calc-data-bar-axis]")).toHaveStyle({ left: "49px" });
});

/** Mounts the original controller and Sfx frame. @param workbook - Optional native fixture. @returns Live document. */
function mount(workbook?: ScDocument): ScDocument {
  const active = createCalcSession();
  session = active;
  if (workbook)
    active.controller.shell.ReplaceDocument(
      workbook,
      createDocument({ id: "calc-conditional-rules", suiteId: "calc", title: "Conditional rules" }),
      { kind: "input", name: "Conditional rules.ods", source: { kind: "external", reference: {} } },
    );
  render(<CalcWorkbench {...active} />);
  return active.controller.shell.GetDocument();
}

/** Sends a source command through its real dispatcher. @param command - UNO command. @returns Nothing. */
function open(command: string): void {
  act(
    /** Updates the mounted frame after dispatch. @returns Nothing. */ () => {
      session?.frame.GetDispatcher().Execute(command);
    },
  );
}

/** Responds to a source dialog and lets its Sfx callback complete. @param dialog - Dialog wrapper. @param caption - Actual response label. @returns Completion. */
async function respond(dialog: HTMLElement, caption: string): Promise<void> {
  await act(
    /** Waits for the dialog response to reach the controller. @returns Completion. */ async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: caption }));
    },
  );
  const dispatcher = session?.frame.GetDispatcher();
  if (dispatcher instanceof BrowserSfxDispatcher)
    expect(dispatcher.GetLastCommandError()).toBeUndefined();
}

/** Finds the conditional-format manager for the active sheet. @returns The open manager dialog. */
function manager(): HTMLElement {
  return screen.getByRole("dialog", { name: "Manage Conditional Formatting" });
}

it("applies a quick rule to the edited range, paints the native style, and round-trips both formats", /** Applies a quick rule to the edited range, paints the native style, and round-trips both formats. @returns Completion. */ async () => {
  const doc = mount();
  const point = new ScAddress(1, 0, 0);
  doc.SetValue(point, 9);
  open(".uno:ConditionalFormatEasy?FormatRule:short=2");
  const dialog = screen.getByRole("dialog", { name: "Highlight cells…" });
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Value 1" }), {
    target: { value: "5" },
  });
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Range" }), {
    target: { value: "B1:B2" },
  });
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Apply Style" }), {
    target: { value: "Good" },
  });
  await respond(dialog, "OK");

  const current = doc.FetchTable(0)?.GetCondFormList();
  assert(current);
  const rule = [...current][0]?.GetEntry(0);
  assert(rule instanceof ScCondFormatEntry);
  expect(rule.GetOperation()).toBe(ScConditionMode.Greater);
  expect(doc.GetCondResult(point)?.Get(ATTR_BACKGROUND)).toBeInstanceOf(SvxBrushItem);
  expect(doc.GetCondResult(new ScAddress(0, 0, 0))).toBeUndefined();
  act(
    /** Removes the committed rule through undo. @returns Nothing. */ () => {
      expect(session?.controller.Undo()).toBe(true);
    },
  );
  expect(doc.GetCondResult(point)).toBeUndefined();
  act(
    /** Restores the committed rule through redo. @returns Nothing. */ () => {
      expect(session?.controller.Redo()).toBe(true);
    },
  );
  expect(doc.GetCondResult(point)).toBeDefined();

  for (const reopened of [
    await readOdsDocument(await writeOdsDocument(doc)),
    await ExcelFilter.importDocument(await exportXlsx(doc)),
  ]) {
    try {
      expect(reopened.GetCondResult(point)?.Get(ATTR_BACKGROUND)).toBeInstanceOf(SvxBrushItem);
    } finally {
      reopened.Dispose();
    }
  }
});

it("ports tdf163897 by retaining staged deletions across the editor and undoing the committed manager change", /** Ports tdf163897 by retaining staged deletions across the editor and undoing the committed manager change. @returns Completion. */ async () => {
  const bytes = readFileSync("../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf105544.ods");
  const fixture = await DocumentArchive.open(new Uint8Array(bytes));
  const archive = new DocumentArchiveWriter();
  for (const part of fixture.getEntryNames()) {
    // The source workbook also contains unrelated database ranges, outside this Calc importer slice.
    const data =
      part === "content.xml"
        ? new TextEncoder().encode(
            (await fixture.readTextEntry(part)).replace(
              /<table:database-ranges>[^]*?<\/table:database-ranges>/u,
              "",
            ),
          )
        : await fixture.readEntry(part);
    archive.putNextEntry(part, data);
  }
  const doc = mount(await readOdsDocument(await archive.finish()));
  /** Borrows the sheet's current conditional-format list. @returns The active rule list. */
  function list() {
    return doc.FetchTable(0)?.GetCondFormList();
  }
  expect(list()?.size()).toBe(4);
  open(".uno:ConditionalFormatManagerDialog");
  for (let count = 4; count > 0; count--) {
    expect(within(manager()).getAllByRole("row")).toHaveLength(count + 1);
    fireEvent.click(within(manager()).getByRole("button", { name: "Remove" }));
  }
  await respond(manager(), "Add");
  await respond(screen.getByRole("dialog", { name: /^Conditional Formatting for/ }), "Cancel");
  expect(within(manager()).getAllByRole("row")).toHaveLength(1);
  expect(list()?.size()).toBe(4);
  await respond(manager(), "OK");
  expect(list()?.size()).toBe(0);
  act(
    /** Restores the rules removed by the manager. @returns Nothing. */ () => {
      expect(session?.controller.Undo()).toBe(true);
    },
  );
  expect(list()?.size()).toBe(4);
  act(
    /** Replays the removal of the rules. @returns Nothing. */ () => {
      expect(session?.controller.Redo()).toBe(true);
    },
  );
  expect(list()?.size()).toBe(0);
});

it("keeps rule order and supports changing the active source rule to a date", /** Keeps rule order and supports changing the active source rule to a date. @returns Completion. */ async () => {
  const doc = mount();
  open(".uno:ColorScaleFormatDialog");
  const editor = screen.getByRole("dialog", { name: /^Conditional Formatting for/ });
  expect(within(editor).getByLabelText("Middle type")).toBeInTheDocument();
  await respond(editor, "Add");
  fireEvent.change(within(editor).getByRole("combobox", { name: "Rule type" }), {
    target: { value: "date" },
  });
  fireEvent.change(within(editor).getByRole("combobox", { name: "Date" }), {
    target: { value: "1" },
  });
  await respond(editor, "Up");
  await respond(editor, "OK");
  const sheet = doc.FetchTable(0);
  assert(sheet);
  const [format] = sheet.GetCondFormList();
  expect(format?.GetEntry(0)?.GetType()).toBe(ScFormatEntryType.Date);
  expect(format?.GetEntry(1)?.GetType()).toBe(ScFormatEntryType.Colorscale);
});

it("edits an imported ODS data-bar limit through the manager and preserves the rest of the rule", /** Edits an imported ODS data-bar limit through the manager and preserves the rest of the rule. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sc/qa/unit/data/ods/databar.ods",
  );
  const doc = mount(await readOdsDocument(new Uint8Array(fixture)));
  const address = new ScAddress(1, 2, 0);
  /** Reads the B3 rule in its current document. @param document - Native workbook. @returns Data bar. */
  function dataBar(document: ScDocument): ScDataBarFormat {
    const list = document.FetchTable(0)?.GetCondFormList();
    assert(list);
    const rule = [...list]
      .find(
        /** Finds the rule's B3 range. @param format - Conditional-format group. @returns Match. */
        (format) => format.GetRange().Combine().Contains(address),
      )
      ?.GetEntry(0);
    assert(rule instanceof ScDataBarFormat);
    return rule;
  }
  const original = dataBar(doc).GetDataBarData();
  const positive = original.maPositiveColor.toUInt32();
  const negative = original.mxNegativeColor?.toUInt32();
  const originalAxis = original.meAxisPosition;

  open(".uno:ConditionalFormatManagerDialog");
  expect(within(manager()).getAllByText("Data Bar")).toHaveLength(5);
  fireEvent.click(within(manager()).getByRole("button", { name: "B3:B6" }));
  await respond(manager(), "Edit");
  const editor = screen.getByRole("dialog", { name: /^Conditional Formatting for/ });
  expect(within(editor).getByLabelText("Color format")).toHaveValue("databar");
  expect(within(editor).getByLabelText("Minimum type")).toHaveValue(
    String(ScColorScaleEntryType.AUTO),
  );
  fireEvent.change(within(editor).getByLabelText("Minimum type"), {
    target: { value: String(ScColorScaleEntryType.VALUE) },
  });
  fireEvent.change(within(editor).getByLabelText("Minimum value"), {
    target: { value: "2" },
  });
  await respond(editor, "OK");
  await respond(manager(), "OK");

  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    const saved = dataBar(reopened).GetDataBarData();
    expect(saved.mpLowerLimit.GetType()).toBe(ScColorScaleEntryType.VALUE);
    expect(saved.mpLowerLimit.GetValue()).toBe(2);
    expect(saved.mpUpperLimit.GetType()).toBe(ScColorScaleEntryType.AUTO);
    expect(saved.maPositiveColor.toUInt32()).toBe(positive);
    expect(saved.mxNegativeColor?.toUInt32()).toBe(negative);
    expect(saved.meAxisPosition).toBe(originalAxis);
  } finally {
    reopened.Dispose();
  }
});

it("edits an imported ODS icon threshold through the native rule manager", /** Opens the original ODS fixture and replaces one formula threshold. @returns Completion. */ async () => {
  const fixture = new Uint8Array(
    readFileSync("../../vendor/libreoffice-reference/sc/qa/unit/data/ods/tdf64401.ods"),
  );
  const document = mount(await readOdsDocument(fixture));
  open(".uno:ConditionalFormatManagerDialog");
  expect(within(manager()).getByText("Icon Set")).toBeInTheDocument();
  fireEvent.click(within(manager()).getByRole("button", { name: "A1:A10" }));
  await respond(manager(), "Edit");
  const editor = screen.getByRole("dialog", { name: /^Conditional Formatting for/ });
  expect(within(editor).getByLabelText("Color format")).toHaveValue("iconset");
  expect(within(editor).getByLabelText("Icon 2 type")).toHaveValue(
    String(ScColorScaleEntryType.FORMULA),
  );
  fireEvent.change(within(editor).getByLabelText("Icon 2 type"), {
    target: { value: String(ScColorScaleEntryType.VALUE) },
  });
  fireEvent.change(within(editor).getByLabelText("Icon 2 value"), { target: { value: "2" } });
  await respond(editor, "OK");
  await respond(manager(), "OK");
  const owner = document.FetchTable(0)?.GetCondFormList();
  assert(owner);
  const format = [...owner][0]?.GetEntry(0);
  assert(format instanceof ScIconSetFormat);
  expect(format.GetIconSetData().m_Entries[1]?.GetValue()).toBe(2);
  expect(format.GetIconSetInfo(new ScAddress(0, 1, 0))?.nIconIndex).toBe(1);
});

it("projects the original conditional commands into the formatting toolbar menu", /** Verifies that the toolbar exposes the native dialog commands. @returns Completion. */ async () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Conditional" }));
  const popup = screen.getByRole("menu", { name: "Conditional" });
  fireEvent.click(within(popup).getByRole("menuitem", { name: /^Manage/ }));
  await respond(screen.getByRole("dialog", { name: "Manage Conditional Formatting" }), "Cancel");
});

it("ports tdf119178 by compiling a new formula at the final range selected in the grid", /** Ports tdf119178 by compiling a new formula at the final range selected in the grid. @returns Completion. */ async () => {
  const doc = mount();
  const value = unicode("test");
  try {
    doc.SetString(new ScAddress(0, 3, 0), value);
  } finally {
    value.dispose();
  }
  open(".uno:ConditionalFormatDialog");
  const editor = screen.getByRole("dialog", { name: /^Conditional Formatting for/ });
  const range = within(editor).getByRole("textbox", { name: "Range" });
  fireEvent.pointerDown(screen.getByRole("gridcell", { name: "B4" }), { button: 0, pointerId: 1 });
  fireEvent.pointerUp(window, { button: 0, pointerId: 1 });
  expect(range).toHaveValue("$B$4");
  expect(session?.controller.Address()).toBe("A1");
  fireEvent.change(within(editor).getByRole("combobox", { name: "Rule type" }), {
    target: { value: "formula" },
  });
  fireEvent.change(within(editor).getByRole("textbox", { name: "Formula" }), {
    target: { value: '$A4 = "test"' },
  });
  fireEvent.change(within(editor).getByRole("combobox", { name: "Apply Style" }), {
    target: { value: "Error" },
  });
  await respond(editor, "OK");
  expect(doc.GetCondResult(new ScAddress(1, 3, 0))).toBeDefined();
  open(".uno:ConditionalFormatManagerDialog");
  const manager = screen.getByRole("dialog", { name: "Manage Conditional Formatting" });
  expect(within(manager).getByRole("cell", { name: /^Formula is/ })).toHaveTextContent(
    /\$A4\s*=\s*"test"/u,
  );
  await respond(manager, "Edit");
  const edited = screen.getByRole("dialog", { name: /^Conditional Formatting for/ });
  expect(within(edited).getByRole("textbox", { name: "Range" })).toHaveValue("B4");
  await respond(edited, "Cancel");
  await respond(screen.getByRole("dialog", { name: "Manage Conditional Formatting" }), "Cancel");
});
