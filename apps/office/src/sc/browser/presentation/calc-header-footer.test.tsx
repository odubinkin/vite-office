/** @fileoverview LibreOffice header/footer editor regressions through the real Calc browser workbench. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, assert, expect, it } from "vitest";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { EECharAttrib } from "../../../editeng/inc/editdata";
import { EE_CHAR_WEIGHT } from "../../../editeng/inc/eeitem";
import { SvxPageField } from "../../../editeng/inc/flditem";
import type { ScPageHFItem } from "../../inc/attrib";
import {
  ATTR_PAGE_HEADERFIRST,
  ATTR_PAGE_FOOTERFIRST,
  ATTR_PAGE_HEADERRIGHT,
} from "../../inc/scitems";
import type { ScDocument } from "../../inc/document";
import { exportXlsx } from "../../source/filter/excel/xetable";
import { ExcelFilter } from "../../source/filter/oox/excelfilter";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";

let session: ReturnType<typeof createCalcSession> | undefined;
afterEach(() => {
  cleanup();
  session?.Close();
  session = undefined;
});

/** Attaches the actual browser workbench and optional native workbook. @param workbook - Imported fixture. @returns Live workbook. */
function mount(workbook?: ScDocument): ScDocument {
  session = createCalcSession();
  if (workbook)
    session.controller.shell.ReplaceDocument(
      workbook,
      createDocument({ id: "tdf166756", suiteId: "calc", title: "tdf166756_[1]" }),
      {
        kind: "input",
        name: "file:///tmp/tdf166756_%5B1%5D.ods",
        source: { kind: "external", reference: {} },
      },
    );
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  return session.controller.shell.GetDocument();
}

/** Opens a real native page style tab. @param name - Page style tab. @returns Parent dialog. */
function openPage(name: "Header" | "Footer"): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Page Style…" }));
  const dialog = screen.getByRole("dialog", { name: "Page Style" });
  fireEvent.click(within(dialog).getByRole("tab", { name }));
  return dialog;
}

/** Opens the source nested edit dialog. @param parent - Visible Page Style dialog. @returns Content dialog. */
function edit(parent: HTMLElement): HTMLElement {
  fireEvent.click(within(parent).getByRole("button", { name: "Edit…" }));
  return screen.getByRole("dialog", { name: /\(Page Style:/ });
}

/** Issues a native browser input event to the editable region. @param region - Editable box. @param value - Entered text. @param inputType - InputEvent operation. @returns Nothing. */
function input(region: HTMLElement, value: string | null, inputType = "insertText"): void {
  act(() => {
    region.focus();
  });
  fireEvent(
    region,
    new InputEvent("beforeinput", { bubbles: true, cancelable: true, inputType, data: value }),
  );
}

/** Borrows one page-style header/footer item. @param workbook - Actual workbook. @param which - Native Which identity. @returns Current style content. */
function content(workbook: ScDocument, which: number): ScPageHFItem | undefined {
  return workbook
    .GetStyleSheetPool()
    ?.GetPageStyle(workbook.GetPageStyle(0))
    ?.GetItemSet()
    .GetItemIfSet(which) as ScPageHFItem | undefined;
}

/** Closes the dialog via its normal response and waits for Sfx dispatch. @param dialog - Source dialog. @param name - Response button. @returns Completion. */
async function response(dialog: HTMLElement, name: "OK" | "Cancel"): Promise<void> {
  await act(
    /** Clicks the selected control. @returns Whether the event's default action is allowed, after dispatch. */ async () =>
      fireEvent.click(within(dialog).getByRole("button", { name })),
  );
}

it.each([
  ["Header", ATTR_PAGE_HEADERFIRST],
  ["Footer", ATTR_PAGE_FOOTERFIRST],
] as const)(
  "ports tdf142763 and edits independent first-page %s regions through Page Style",
  async (name, which) => {
    const workbook = mount();
    const parent = openPage(name);
    fireEvent.click(within(parent).getByRole("checkbox", { name: "Same content on first page" }));
    const dialog = edit(parent);
    expect(
      within(dialog)
        .getAllByRole("tab")
        .map(
          /** Reads the entry's `textContent` field. @param tab - Collection entry. @returns The field value. */ (
            tab,
          ) => tab.textContent,
        ),
    ).toEqual([name + " (first)", name + " (right)"]);
    const left = within(dialog).getByRole("textbox", { name: "Left area" });
    const center = within(dialog).getByRole("textbox", { name: "Center area" });
    const right = within(dialog).getByRole("textbox", { name: "Right area" });
    input(left, "first");
    input(center, "page | ");
    fireEvent.click(within(dialog).getByRole("button", { name: "Sheet Name" }));
    input(right, name.toLowerCase());
    fireEvent.click(within(dialog).getByRole("button", { name: "Reset" }));
    expect(left).toHaveTextContent("first");
    expect(center).toHaveTextContent("page | Sheet1");
    expect(right).toHaveTextContent(name.toLowerCase());
    await response(dialog, "OK");
    expect(content(workbook, which)).toBeUndefined();
    await response(parent, "OK");
    expect(content(workbook, which)?.GetCenterArea()?.HasField()).toBe(true);
    act(() => {
      expect(session?.controller.Undo()).toBe(true);
    });
    expect(content(workbook, which)).toBeUndefined();
    act(() => {
      expect(session?.controller.Redo()).toBe(true);
    });
    expect(content(workbook, which)?.GetCenterArea()?.HasField()).toBe(true);
  },
);

it("ports tdf166756 and expands the title and decoded file fields in both imported regions", /** Ports tdf166756 and expands the title and decoded file fields in both imported regions. @returns Completion. */ async () => {
  mount(
    await readOdsDocument(
      new Uint8Array(
        readFileSync("../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf166756_[1].ods"),
      ),
    ),
  );
  for (const name of ["Header", "Footer"] as const) {
    const parent = openPage(name);
    const dialog = edit(parent);
    const lines = within(dialog).getByRole("textbox", { name: "Left area" }).children;
    expect(
      [...lines].map(
        /** Reads the entry's `textContent` field. @param line - Collection entry. @returns The field value. */ (
          line,
        ) => line.textContent,
      ),
    ).toEqual([
      "Title: tdf166756_[1]",
      "FileName: tdf166756_[1].ods",
      "Path Name: file:///tmp/tdf166756_[1].ods",
    ]);
    await response(dialog, "Cancel");
    await response(parent, "Cancel");
  }
});

it("opens the standalone source dialog and persists field edits through ODS and XLSX", /** Opens the standalone source dialog and persists field edits through ODS and XLSX. @returns Completion. */ async () => {
  const workbook = mount();
  fireEvent.click(screen.getByRole("menuitem", { name: "Insert" }));
  fireEvent.click(screen.getByRole("menuitem", { name: /^Headers and Footers/ }));
  const dialog = screen.getByRole("dialog", { name: /^Headers\/Footers \(/ });
  expect(
    within(dialog)
      .getAllByRole("tab")
      .map(
        /** Reads the entry's `textContent` field. @param tab - Collection entry. @returns The field value. */ (
          tab,
        ) => tab.textContent,
      ),
  ).toEqual(["Header", "Footer"]);
  expect(within(dialog).getByRole("textbox", { name: "Center area" })).toHaveTextContent("Sheet1");
  expect(within(dialog).getByRole("combobox", { name: "Preset" })).toHaveValue("3");
  await response(dialog, "Cancel");
  const toolbar = screen.getByRole("toolbar", { name: "Calc standard toolbar" });
  fireEvent.click(within(toolbar).getByRole("button", { name: "Headers and Footers" }));
  const reopened = screen.getByRole("dialog", { name: /^Headers\/Footers \(/ });
  const left = within(reopened).getByRole("textbox", { name: "Left area" });
  input(left, "before");
  input(left, null, "insertParagraph");
  input(left, "after");
  const selection = left.ownerDocument.getSelection();
  assert(selection);
  selection.selectAllChildren(left);
  input(left, "Printed page ");
  fireEvent.click(within(reopened).getByRole("button", { name: "Page Number" }));
  expect(left).toHaveTextContent("Printed page 1");
  selection.selectAllChildren(left);
  fireEvent.keyUp(left, { key: "a" });
  fireEvent.click(within(reopened).getByRole("button", { name: "Bold" }));
  expect(left.querySelector("span")?.style.fontWeight).toBe("bold");
  expect(content(workbook, ATTR_PAGE_HEADERRIGHT)?.GetLeftArea()?.HasField()).toBe(false);
  await response(reopened, "OK");
  expect(session?.controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  for (const copy of [
    await readOdsDocument(await writeOdsDocument(workbook)),
    await ExcelFilter.importDocument(await exportXlsx(workbook)),
  ]) {
    try {
      const area = content(copy, ATTR_PAGE_HEADERRIGHT)?.GetLeftArea();
      assert(area);
      const prefix = area.GetText(0);
      try {
        expect(text(prefix)).toMatch(/^Printed page /);
      } finally {
        prefix.dispose();
      }
      expect(area.HasField(new SvxPageField().GetClassId())).toBe(true);
      const attributes: EECharAttrib[] = [];
      area.GetCharAttribs(0, attributes);
      expect(attributes.some(({ pAttr }) => pAttr?.Which() === EE_CHAR_WEIGHT)).toBe(true);
    } finally {
      copy.Dispose();
    }
  }
});
