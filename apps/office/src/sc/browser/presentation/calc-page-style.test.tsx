/** @fileoverview Original Calc Page Style scenarios through real Format slots, style history and ODF. */
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, assert, expect, it } from "vitest";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import type { SfxItemSet } from "../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { SvxBoxItem } from "../../../editeng/source/items/frmitems";
import { SvxPageUsage, SvxSetItem } from "../../../svx/inc/pageitem";
import { ScPageScaleToItem } from "../../inc/attrib";
import {
  ATTR_BACKGROUND,
  ATTR_BORDER,
  ATTR_PAGE_FOOTERSET,
  ATTR_PAGE_HEADERSET,
  ATTR_PAGE_ON,
  ATTR_PAGE_SCALETO,
  ATTR_PAGE_SHARED_FIRST,
} from "../../inc/scitems";
import { createCalcSession } from "../composition/calc-module";
import { CalcWorkbench } from "./calc-workbench";
import { readOdsDocument, writeOdsDocument } from "../../source/filter/xml/xmlwrap";
import { GetPageStyleGeometry } from "../../source/ui/styleui/styledlg";
import type { ScDocument } from "../../inc/document";
import { ScTablePage } from "../../source/ui/pagedlg/tptable";

afterEach(cleanup);

/** Mounts the native Calc workbench with an optional loaded workbook. @param workbook - Actual model to attach. @returns Browser session. */
function mount(workbook?: ScDocument): ReturnType<typeof createCalcSession> {
  const session = createCalcSession();
  if (workbook) {
    session.controller.shell.ReplaceDocument(
      workbook,
      createDocument({
        id: "calc-page-style-fixture",
        suiteId: "calc",
        title: "Page style fixture",
      }),
      { kind: "untitled", name: "Page style fixture" },
    );
  }
  render(
    <CalcWorkbench
      controller={session.controller}
      frame={session.frame}
      fileWorkflows={session.fileWorkflows}
      sheetWorkflows={session.sheetWorkflows}
    />,
  );
  return session;
}

/** Runs the original menu command from the mounted workbench. @returns Current dialog. */
function open(): HTMLElement {
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  fireEvent.click(screen.getByRole("menuitem", { name: "Page Style…" }));
  return screen.getByRole("dialog", { name: "Page Style" });
}

/** Retrieves the style assigned to one sheet. @param workbook - Actual document. @param tab - Sheet index. @returns Page style item set. */
function items(workbook: ScDocument, tab = 0): SfxItemSet {
  const style = workbook.GetStyleSheetPool()?.GetPageStyle(workbook.GetPageStyle(tab));
  assert(style);
  return style.GetItemSet();
}

it("ports tdf123508 dimension fitting and reloads the accepted Sheet controls", /** Ports tdf123508 dimension fitting and reloads the accepted Sheet controls. @returns Completion. */ async () => {
  const workbook = await readOdsDocument(
    new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sc/qa/uitest/data/tdf123508.ods"),
    ),
  );
  const session = mount(workbook);
  const dialog = open();
  expect(
    within(dialog)
      .getAllByRole("tab")
      .map(
        /** Reads the entry's `textContent` field. @param node - Collection entry. @returns The field value. */ (
          node,
        ) => node.textContent,
      ),
  ).toEqual(["General", "Page", "Borders", "Background", "Header", "Footer", "Sheet"]);
  fireEvent.click(within(dialog).getByRole("tab", { name: "Sheet" }));
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Scaling mode" }), {
    target: { value: "1" },
  });
  fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Width in pages value" }), {
    target: { value: "2" },
  });
  fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Height in pages value" }), {
    target: { value: "2" },
  });
  await act(
    /** Clicks the button named "OK". @returns Completion. */ async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    },
  );
  expect(items(workbook).Get(ATTR_PAGE_SCALETO)).toEqual(new ScPageScaleToItem(2, 2));
  const again = open();
  fireEvent.click(within(again).getByRole("tab", { name: "Sheet" }));
  expect(within(again).getByRole("combobox", { name: "Scaling mode" })).toHaveValue("1");
  expect(within(again).getByRole("spinbutton", { name: "Width in pages value" })).toHaveValue(2);
  expect(within(again).getByRole("spinbutton", { name: "Height in pages value" })).toHaveValue(2);
  fireEvent.click(within(again).getByRole("button", { name: "Cancel" }));
  cleanup();
  session.Close();
});

it("ports tdf144940 first-page sharing and keeps common geometry, printing and header state through ODS", /** Ports tdf144940 first-page sharing and keeps common geometry, printing and header state through ODS. @returns Completion. */ async () => {
  const session = mount();
  const controller = session.controller;
  const doc = controller.shell.GetDocument();
  act(
    /** Activates the selected sheet. @returns Nothing. */ () => {
      controller.InsertSheet();
      controller.SelectTab(0);
    },
  );
  const dialog = open();
  fireEvent.click(within(dialog).getByRole("tab", { name: "Header" }));
  expect(within(dialog).getByRole("checkbox", { name: "Header on" })).toBeChecked();
  expect(
    within(dialog).getByRole("checkbox", { name: "Same content on left and right pages" }),
  ).toBeChecked();
  const first = within(dialog).getByRole("checkbox", { name: "Same content on first page" });
  expect(first).toBeChecked();
  fireEvent.click(first);
  expect(first).not.toBeChecked();
  fireEvent.click(within(dialog).getByRole("tab", { name: "Page" }));
  fireEvent.click(within(dialog).getByRole("radio", { name: "Landscape" }));
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Page layout" }), {
    target: { value: String(SvxPageUsage.Mirror) },
  });
  fireEvent.click(within(dialog).getByRole("tab", { name: "Sheet" }));
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Formulas" }));
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Zero values" }));
  fireEvent.click(within(dialog).getByRole("checkbox", { name: "Drawing objects" }));
  await act(
    /** Clicks the button named "OK". @returns Completion. */ async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    },
  );
  expect(doc.GetPageStyle(0)).toBe(doc.GetPageStyle(1));
  expect(GetPageStyleGeometry(items(doc, 1))).toMatchObject({
    landscape: true,
    usage: SvxPageUsage.Mirror,
  });
  act(
    /** Undoes the latest command. @returns Nothing. */ () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect(GetPageStyleGeometry(items(doc, 1)).landscape).toBe(false);
  act(
    /** Reapplies the latest command. @returns Nothing. */ () => {
      expect(controller.Redo()).toBe(true);
    },
  );
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    const stored = items(reopened);
    expect(GetPageStyleGeometry(stored)).toMatchObject({
      landscape: true,
      usage: SvxPageUsage.Mirror,
    });
    const sheet = new ScTablePage(stored).initial;
    expect(sheet.flags).toMatchObject({ formulas: true, zeroes: false, drawings: false });
    for (const which of [ATTR_PAGE_HEADERSET, ATTR_PAGE_FOOTERSET]) {
      const headerFooter = (stored.Get(which) as SvxSetItem).GetItemSet();
      expect((headerFooter.Get(ATTR_PAGE_ON) as SfxBoolItem).GetValue()).toBe(true);
      expect((headerFooter.Get(ATTR_PAGE_SHARED_FIRST) as SfxBoolItem).GetValue()).toBe(
        which === ATTR_PAGE_FOOTERSET,
      );
    }
  } finally {
    reopened.Dispose();
    cleanup();
    session.Close();
  }
});

it("cancels an edited page style without changing the workbook or its history", /** Cancels an edited page style without changing the workbook or its history. @returns Completion. */ async () => {
  const session = mount();
  const dialog = open();
  fireEvent.click(within(dialog).getByRole("tab", { name: "Page" }));
  fireEvent.click(within(dialog).getByRole("radio", { name: "Landscape" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Reset" }));
  expect(within(dialog).getByRole("radio", { name: "Portrait" })).toBeChecked();
  fireEvent.click(within(dialog).getByRole("radio", { name: "Landscape" }));
  fireEvent.keyDown(within(dialog).getByRole("radio", { name: "Landscape" }), { key: "Escape" });
  await waitFor(
    /** Waits for the accepted page-style dialog to close. @returns Assertion result. */ () =>
      expect(screen.queryByRole("dialog")).toBeNull(),
  );
  expect(GetPageStyleGeometry(items(session.controller.shell.GetDocument())).landscape).toBe(false);
  expect(session.controller.shell.GetUndoManager().GetUndoActionCount()).toBe(0);
  cleanup();
  session.Close();
});

it("renames a shared custom page style and persists its border and fill", /** Renames a shared custom page style and persists its border and fill. @returns Completion. */ async () => {
  const session = mount();
  const controller = session.controller;
  const doc = controller.shell.GetDocument();
  act(
    /** Activates the selected sheet. @returns Nothing. */ () => {
      controller.InsertSheet();
      controller.SelectTab(0);
    },
  );
  assert(doc.GetStyleSheetPool()?.GetPageStyle("Invoice", true));
  doc.SetPageStyle(0, "Invoice");
  doc.SetPageStyle(1, "Invoice");
  const dialog = open();
  fireEvent.change(within(dialog).getByRole("textbox", { name: "Name" }), {
    target: { value: "Invoice print" },
  });
  fireEvent.click(within(dialog).getByRole("tab", { name: "Borders" }));
  fireEvent.click(within(dialog).getByRole("button", { name: "Outer Border Only" }));
  fireEvent.click(within(dialog).getByRole("tab", { name: "Background" }));
  fireEvent.change(within(dialog).getByRole("combobox", { name: "Fill" }), {
    target: { value: "color" },
  });
  fireEvent.change(within(dialog).getByLabelText("Color"), { target: { value: "#946833" } });
  await act(
    /** Clicks the button named "OK". @returns Completion. */ async () => {
      fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    },
  );
  expect([doc.GetPageStyle(0), doc.GetPageStyle(1)]).toEqual(["Invoice print", "Invoice print"]);
  expect((items(doc).Get(ATTR_BORDER) as SvxBoxItem).GetTop()?.GetWidth()).toBeGreaterThan(0);
  act(
    /** Undoes the latest command. @returns Nothing. */ () => {
      expect(controller.Undo()).toBe(true);
    },
  );
  expect([doc.GetPageStyle(0), doc.GetPageStyle(1)]).toEqual(["Invoice", "Invoice"]);
  act(
    /** Reapplies the latest command. @returns Nothing. */ () => {
      expect(controller.Redo()).toBe(true);
    },
  );
  const reopened = await readOdsDocument(await writeOdsDocument(doc));
  try {
    expect(reopened.GetPageStyle(1)).toBe("Invoice print");
    const stored = items(reopened, 1);
    expect((stored.Get(ATTR_BORDER) as SvxBoxItem).GetTop()?.GetWidth()).toBe(
      (items(doc).Get(ATTR_BORDER) as SvxBoxItem).GetTop()?.GetWidth(),
    );
    expect((stored.Get(ATTR_BACKGROUND) as SvxBrushItem).GetColor().toUInt32() & 0xffffff).toBe(
      0x946833,
    );
  } finally {
    reopened.Dispose();
    cleanup();
    session.Close();
  }
});

it("preserves the native default-backed fit comparison against both saved dimensions", /** Preserves the native default-backed fit comparison against both saved dimensions. @returns Nothing. */ () => {
  const session = createCalcSession();
  const doc = session.controller.shell.GetDocument();
  assert(doc.GetStyleSheetPool()?.GetPageStyle(doc.GetPageStyle(0), true));
  const input = items(doc);
  input.GetPool().SetUserDefaultItem(new ScPageScaleToItem(1, 1));
  const page = new ScTablePage(input);
  const output = input.Clone(false);
  try {
    expect(page.initial.scaleMode).toBe(1);
    page.FillItemSet({ ...page.initial, height: 2 }, output);
    expect(output.GetItemIfSet(ATTR_PAGE_SCALETO)).toBeUndefined();
  } finally {
    output.Dispose();
    session.Close();
  }
});
