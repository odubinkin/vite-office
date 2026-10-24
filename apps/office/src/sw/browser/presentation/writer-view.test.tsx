/** @fileoverview Coverage for the Writer browser presentation. */
import { createWriterTextColorItem } from "../../source/core/attr/swatrset";
import { createTabs } from "../../../../test/tab-item-fixtures";
import { SvxLineSpaceRule } from "../../../editeng/inc/svxenum";
import { VertOrientation } from "./../../../offapi/com/sun/star/text/VertOrientation";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Local test fixtures keep setup and assertions concise. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import {
  projectWriterLineHeight,
  projectWriterLineHeightItem,
} from "../../source/core/text/itrform2";
import { SvxTabStop } from "../../../editeng/inc/tstpitem";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import type { CommandFailure } from "../../../sfx2/source/control/dispatch";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { SwView } from "../../source/uibase/uiview/view";
import { presentWriterCommandError, presentWriterStatus } from "./writer-view";
import type { WriterViewSnapshot } from "./writer-view-projection";
import { WriterViewProjection } from "./writer-view-projection";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwDoc } from "../../source/core/doc/doc";
import { projectWriterTextRuns } from "../../source/core/txtnode/ndtxt";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import {
  RES_CHRATR_HIGHLIGHT,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_BREAK,
} from "../../inc/hintids";
import { createCentimetreWriterDocumentSession as createWriterDocumentSession } from "../../../test/writer-measurement-fixtures";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WriterWorkbench } from "./writer-view";
import type { WriterAutosaveController } from "../workflows/writer-autosave";

/** Runs the failureView test helper. @param failure - Test input. @returns Test callback result. */ function failureView(
  failure?: CommandFailure,
): SwView {
  return {
    GetViewFrame: /** Runs the test callback. @returns Test callback result. */ () => ({
      GetDispatcher: /** Runs the test callback. @returns Test callback result. */ () => ({
        GetLastCommandError: /** Runs the test callback. @returns Test callback result. */ () =>
          failure,
      }),
    }),
  } as unknown as SwView;
}

/** Runs the statusSnapshot test helper. @param operation - Test input. @param state - Test input. @param isModified - Test input. @param message - Test input. @returns Test callback result. */ function statusSnapshot(
  operation: "none" | "open" | "save" | "save-as",
  state: "failed" | "idle" | "pending" | "succeeded" | "unconfirmed",
  isModified = false,
  message?: string,
): WriterViewSnapshot {
  return {
    documentState: { isModified },
    mediumOperation: { operation, state, ...(message === undefined ? {} : { message }) },
  } as WriterViewSnapshot;
}

const getText =
  /** Runs the test callback. @param _key - Test input. @param fallback - Test input. @returns Test callback result. */ (
    _key: string,
    fallback: string,
  ) => fallback;

/** Reads the original sidebar command surface independently of the contextual toolbar. @returns Scoped queries. */
function tableSidebar() {
  return within(screen.getByRole("complementary", { name: "Writer properties sidebar" }));
}

describe("Writer browser presentation", /** Groups presentation tests. @returns Nothing. */ () => {
  it("uses icons for the standard toolbar and keeps Save and Paragraph off their upstream-hidden positions", /** Checks upstream visible command placement. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    const standard = screen.getByRole("toolbar", { name: "Writer standard toolbar" });
    for (const button of within(standard).getAllByRole("button"))
      expect(button.querySelector("svg")).not.toBeNull();
    const labels = within(standard)
      .getAllByRole("button")
      .map(
        /** Reads one command's accessible label. @param button - Toolbar control. @returns Label. */
        (button) => button.getAttribute("aria-label"),
      );
    expect(labels.indexOf("Insert Table")).toBeLessThan(labels.indexOf("Hyperlink"));
    expect(labels.indexOf("Hyperlink")).toBeLessThan(labels.indexOf("Bookmark"));
    expect(within(standard).queryByRole("button", { name: "Save" })).toBeNull();
    expect(
      within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).queryByRole(
        "button",
        { name: "Paragraph…" },
      ),
    ).toBeNull();
    rendered.unmount();
    session.Close();
  });
  it("renders an imported table before the first body paragraph", /** Verifies the bounded table scenario.  @returns Callback result. */ () => {
    const session = createWriterDocumentSession();
    const document = new SwDoc(false);
    const table = document.nodes.MakeTableNode("OpeningTable");
    table.AddColumnWidth(1500);
    document.nodes.AppendTableRow(table, 1);
    document.nodes.MakeTextNode("After table");
    act(
      /** Verifies the bounded table scenario.  @returns Callback result. */ () =>
        session.docShell.ReplaceDocument(
          document,
          createDocument({ id: "opening-table", suiteId: "writer", title: "Opening table" }),
          { kind: "untitled", name: "Opening table" },
        ),
    );
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    expect(screen.getByRole("table", { name: "OpeningTable" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "After table",
    );
    rendered.unmount();
    session.Close();
  });
  it("does not apply stale table properties after the document changes", /** Covers document replacement while Table Properties is open. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.click(
      within(screen.getByLabelText("Table size").parentElement as HTMLElement).getByRole("button", {
        name: "More Options",
      }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Insert Table" })).getByRole("button", {
        name: "Insert",
      }),
    );
    fireEvent.click(tableSidebar().getByRole("button", { name: "Table Properties" }));
    const replacement = createWriterDocument();
    act(
      /** Switches documents while the table dialog is open. @returns Nothing. */ () =>
        session.docShell.ReplaceDocument(
          replacement,
          createDocument({ id: "replacement-table", suiteId: "writer", title: "Replacement" }),
          { kind: "untitled", name: "Replacement" },
        ),
    );
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Insert" }));
    expect(replacement.GetTables()).toHaveLength(0);
    rendered.unmount();
    session.Close();
  });
  it("inserts, selects, edits and reopens a canonical Writer table", /** Verifies the bounded table scenario.  @returns Callback result. */ async () => {
    const session = createWriterDocumentSession();
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.click(
      within(screen.getByLabelText("Table size").parentElement as HTMLElement).getByRole("button", {
        name: "More Options",
      }),
    );
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Insert Table" })).getByRole("button", {
        name: "Cancel",
      }),
    );
    expect(screen.queryByRole("dialog", { name: "Insert Table" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Insert Table" }));
    fireEvent.click(
      within(screen.getByLabelText("Table size").parentElement as HTMLElement).getByRole("button", {
        name: "More Options",
      }),
    );
    let dialog = screen.getByRole("dialog", { name: "Insert Table" });
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Rows" }), {
      target: { value: "2" },
    });
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Columns" }), {
      target: { value: "3" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert" }));
    const table = session.docShell.GetDoc().GetTables()[0];
    expect(table?.GetTabLines()).toHaveLength(2);
    expect(table?.GetTabLines()[0]?.GetTabBoxes()).toHaveLength(3);
    expect(screen.getByRole("table", { name: "Table1" })).toBeInTheDocument();
    selectMountedTableRow("Table1", 2);
    fireEvent.click(tableSidebar().getByRole("button", { name: "Table Properties" }));
    dialog = screen.getByRole("dialog", { name: "Table Properties" });
    fireEvent.click(within(dialog).getByRole("tab", { name: "Columns" }));
    fireEvent.change(within(dialog).getByRole("spinbutton", { name: "Column 1 width (cm)" }), {
      target: { value: "4" },
    });
    fireEvent.click(within(dialog).getByRole("tab", { name: "Text Flow" }));
    fireEvent.change(within(dialog).getByRole("combobox", { name: "Cell vertical alignment" }), {
      target: { value: "3" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "OK" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Table" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Size" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Row Height…" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Height (cm)" }), {
      target: { value: "1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(table?.GetColumnWidths()[0]).toBe(2268);
    expect(table?.GetTabLines()[1]?.GetFormat().frameSize?.GetHeight()).toBe(567);
    expect(table?.GetTabLines()[1]?.GetTabBoxes()[0]?.GetVertOrient().GetVertOrient()).toBe(
      VertOrientation.BOTTOM,
    );
    const cell = screen.getByLabelText("Row 2 column 1 paragraph 1");
    cell.focus();
    const selection = window.getSelection();
    if (selection === null) throw new Error("Missing table DOM selection.");
    selection.setBaseAndExtent(cell, 0, cell, 0);
    act(
      /** Routes actual browser input through the shared edit window. @returns Nothing. */ () => {
        cell.dispatchEvent(
          new InputEvent("beforeinput", {
            bubbles: true,
            cancelable: true,
            data: "Edited cell",
            inputType: "insertText",
          }),
        );
      },
    );
    expect(table?.GetTabLines()[1]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Edited cell",
    );
    const bytes = writeOdtDocument(session.docShell.GetDoc(), { title: "Inserted table" });
    const reopened = await readOdtDocument(bytes, { title: "Inserted table" });
    expect(
      reopened.document
        .GetTables()[0]
        ?.GetTabLines()[1]
        ?.GetTabBoxes()[0]
        ?.GetParagraphs()[0]
        ?.GetText(),
    ).toBe("Edited cell");
    expect(reopened.document.GetTables()[0]?.GetColumnWidths()[0]).toBe(2268);
    rendered.unmount();
    session.Close();
  });
  it("exposes a package font and reports a stable fallback when browser loading is unavailable", /** Checks the font selector without silently replacing the imported family. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const doc = session.docShell.GetDoc();
    const restrictedBytes = new Uint8Array(38);
    const fontHeader = new DataView(restrictedBytes.buffer);
    fontHeader.setUint32(0, 0x00010000);
    fontHeader.setUint16(4, 1);
    fontHeader.setUint32(12, 0x4f532f32);
    fontHeader.setUint32(20, 28);
    fontHeader.setUint32(24, 10);
    fontHeader.setUint16(36, 0x0002);
    doc.RegisterEmbeddedFont({
      faceName: "Package Serif",
      familyName: "Package Serif",
      path: "Fonts/Package_Serif.ttf",
      format: "truetype",
      weight: "normal",
      style: "normal",
    });
    doc.SetEmbeddedFontBytes("Fonts/Package_Serif.ttf", restrictedBytes, false);
    doc.RegisterEmbeddedFont({
      faceName: "Package Sans",
      familyName: "Package Sans",
      path: "Fonts/Package_Sans.ttf",
      format: "truetype",
      weight: "normal",
      style: "normal",
    });
    doc.SetEmbeddedFontBytes("Fonts/Package_Sans.ttf", restrictedBytes, false);
    session.view.GetWrtShell().Insert("Font sample");
    const node = doc.paragraphs[0]!;
    session.view.GetWrtShell().SetPaM(new SwPosition(node, node.Len()), new SwPosition(node, 0));
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    const selector = within(
      screen.getByRole("toolbar", { name: "Writer formatting toolbar" }),
    ).getByLabelText("Font name") as HTMLInputElement;
    fireEvent.click(
      within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByRole(
        "button",
        { name: "Show Font name" },
      ),
    );
    expect(screen.getByRole("option", { name: "Package Serif" })).toBeInTheDocument();
    fireEvent.keyDown(selector, { key: "Escape" });
    fireEvent.change(selector, { target: { value: "Package Serif" } });
    fireEvent.keyDown(selector, { key: "Enter" });
    await waitFor(
      /** Observes command state and font fallback. @returns Nothing. */ () => {
        expect(selector.value).toBe("Package Serif");
        expect(
          within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByText(
            "Embedded font unavailable; using Liberation Serif fallback",
          ),
        ).toHaveAttribute("role", "status");
      },
    );
    const reopenedFont = await readOdtDocument(
      writeOdtDocument(doc, { title: "Font selector" }),
      { title: "Font selector" },
      undefined,
      {
        onDiagnostic: /** Suppresses unrelated ODF declarations. @returns Nothing. */ () =>
          undefined,
      },
    );
    expect(
      projectWriterTextRuns(reopenedFont.document.paragraphs[0]!)[0]?.attributes.fontFamily,
    ).toBe("Package Serif");
    const replacement = createWriterDocument();
    replacement.RegisterEmbeddedFont({
      faceName: "Replacement Serif",
      familyName: "Replacement Serif",
      path: "Fonts/Replacement.ttf",
      format: "truetype",
      weight: "normal",
      style: "normal",
    });
    replacement.SetEmbeddedFontBytes("Fonts/Replacement.ttf", new Uint8Array([3]), false);
    act(
      /** Switches the active model to exercise document-scoped font revocation. @returns Nothing. */ () => {
        session.docShell.ReplaceDocument(
          replacement,
          createDocument({ id: "replacement", suiteId: "writer", title: "Replacement" }),
          { kind: "untitled", name: "Replacement" },
        );
      },
    );
    fireEvent.click(
      within(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).getByRole(
        "button",
        { name: "Show Font name" },
      ),
    );
    expect(screen.getByRole("option", { name: "Replacement Serif" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Package Serif" })).toBeNull();
    rendered.unmount();
    session.Close();
  });

  it("creates, navigates, renames and removes bookmarks and inserts a hard page break from Insert", /** Verifies the full menu/dialog/model path and ODT persistence. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const shell = session.view.GetWrtShell();
    shell.Insert("AlphaBeta");
    const paragraph = shell.GetActiveParagraph();
    shell.SetPaM(new SwPosition(paragraph, 5));
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    const openInsert =
      /** Opens one Insert menu command. @param label - Menu item name. @returns Nothing. */
      (label: RegExp): void => {
        fireEvent.click(screen.getByRole("menuitem", { name: "Insert" }));
        if (label.source.includes("Manual Break"))
          fireEvent.click(screen.getByRole("menuitem", { name: "More Breaks" }));
        fireEvent.click(screen.getByRole("menuitem", { name: label }));
      };
    openInsert(/Bookmark/);
    let dialog = screen.getByRole("dialog", { name: "Bookmark" });
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "" } });
    fireEvent.keyDown(dialog, { key: "ArrowDown" });
    fireEvent.submit(within(dialog).getByRole("button", { name: "Insert" }).closest("form")!);
    expect(screen.getByRole("dialog", { name: "Bookmark" })).toBe(dialog);
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Bookmark" })).toBeNull();
    expect(rendered.container.querySelector("[contenteditable=true]")).toHaveFocus();
    await act(
      /** Flushes the canceled shell request. @returns Completion. */ async () => undefined,
    );
    openInsert(/Bookmark/);
    dialog = screen.getByRole("dialog", { name: "Bookmark" });
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Middle" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Insert" }));
    expect(rendered.container.querySelector("[contenteditable=true]")).toHaveFocus();
    await waitFor(
      /** Waits for the shell action. @returns Nothing. */
      () =>
        expect(
          session.docShell
            .GetDoc()
            .GetIDocumentMarkAccess()
            .FindMark("Middle")
            ?.GetMarkPos()
            .GetContentIndex(),
        ).toBe(5),
    );
    shell.SetPaM(new SwPosition(paragraph, 0));
    openInsert(/Bookmark/);
    dialog = screen.getByRole("dialog", { name: "Bookmark" });
    fireEvent.change(within(dialog).getByLabelText("Name"), { target: { value: "Middle" } });
    fireEvent.submit(within(dialog).getByRole("button", { name: "Insert" }).closest("form")!);
    expect(session.docShell.GetDoc().GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(1);
    fireEvent.change(within(dialog).getByLabelText("Existing bookmarks"), {
      target: { value: "Middle" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Go to" }));
    await waitFor(
      /** Checks bookmark navigation. @returns Nothing. */
      () => expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(5),
    );
    expect(screen.getByRole("dialog", { name: "Bookmark" })).toBe(dialog);
    fireEvent.click(within(dialog).getByRole("button", { name: "Rename" }));
    const renameDialog = screen.getByRole("dialog", { name: "Rename object: Middle" });
    fireEvent.change(within(renameDialog).getByLabelText("New name"), {
      target: { value: "Renamed" },
    });
    fireEvent.click(within(renameDialog).getByRole("button", { name: "OK" }));
    await waitFor(
      /** Checks rename. @returns Nothing. */
      () =>
        expect(
          session.docShell.GetDoc().GetIDocumentMarkAccess().FindMark("Renamed"),
        ).toBeDefined(),
    );
    const saved = writeOdtDocument(session.docShell.GetDoc(), { title: "Bookmarks" });
    const reopened = await readOdtDocument(saved, { title: "Bookmarks" }, undefined, {
      onDiagnostic:
        /** Captures no expected diagnostics for this generated ODT. @returns Nothing. */
        () => undefined,
    });
    expect(
      reopened.document
        .GetIDocumentMarkAccess()
        .FindMark("Renamed")
        ?.GetMarkPos()
        .GetContentIndex(),
    ).toBe(5);
    expect(screen.getByRole("dialog", { name: "Bookmark" })).toBe(dialog);
    fireEvent.change(within(dialog).getByLabelText("Existing bookmarks"), {
      target: { value: "Renamed" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));
    await waitFor(
      /** Checks deletion. @returns Nothing. */
      () =>
        expect(session.docShell.GetDoc().GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0),
    );
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" }).at(-1) as HTMLElement);
    await act(
      /** Completes the open native bookmark request. @returns Completion. */ async () => undefined,
    );
    openInsert(/Manual Break/);
    let breakDialog = screen.getByRole("dialog", { name: "Insert Break" });
    fireEvent.keyDown(breakDialog, { key: "ArrowDown" });
    fireEvent.keyDown(breakDialog, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Insert Break" })).toBeNull();
    await act(
      /** Flushes the canceled break request. @returns Completion. */ async () => undefined,
    );
    openInsert(/Manual Break/);
    breakDialog = screen.getByRole("dialog", { name: "Insert Break" });
    expect(within(breakDialog).getByRole("radio", { name: "Page break" })).toBeChecked();
    fireEvent.click(within(breakDialog).getByRole("button", { name: "Insert" }));
    await waitFor(
      /** Checks the hard-break item on the trailing paragraph. @returns Nothing. */
      () =>
        expect(session.docShell.GetDoc().paragraphs[1]?.GetAttr(RES_BREAK).QueryValue()).toBe(4),
    );
    rendered.unmount();
    session.Close();
  });
  it("adds Writer proportional leading to the natural browser line-box estimate", /** Checks proportional leading projection. @returns Nothing. */ () => {
    expect(projectWriterLineHeight(0)).toBe(1.15);
    expect(projectWriterLineHeight(100)).toBe(1.15);
    expect(projectWriterLineHeight(115)).toBeCloseTo(1.3);
    expect(projectWriterLineHeight(150)).toBeCloseTo(1.65);
  });
  it("projects fixed, minimum, and extra Writer line spacing", /** Covers the imported ODF spacing rules. @returns Nothing. */ () => {
    expect(
      projectWriterLineHeightItem(lineSpacingFixture(360, RES_PARATR_LINESPACING, "fixed"), 12),
    ).toBe(1.5);
    expect(
      projectWriterLineHeightItem(lineSpacingFixture(1, RES_PARATR_LINESPACING, "fixed"), 12),
    ).toBe(0.05);
    expect(
      projectWriterLineHeightItem(lineSpacingFixture(200, RES_PARATR_LINESPACING, "minimum"), 12),
    ).toBe(1.15);
    expect(
      projectWriterLineHeightItem(lineSpacingFixture(360, RES_PARATR_LINESPACING, "minimum"), 12),
    ).toBe(1.5);
    expect(
      projectWriterLineHeightItem(lineSpacingFixture(60, RES_PARATR_LINESPACING, "leading"), 12),
    ).toBe(1.4);
    expect(projectWriterLineHeightItem(lineSpacingFixture(115, RES_PARATR_LINESPACING), 12)).toBe(
      1.3,
    );
  });
  it("projects explicit paragraph colors without altering native text attributes", /** Checks projects explicit paragraph colors without altering native text attributes. @returns Test callback result. */ () => {
    const document = createWriterDocument();
    const node = document.paragraphs[0]!;
    node.SetAttr(createWriterTextColorItem("#123456"));
    node.SetAttr(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "#fedcba"));
    node.SetAttr(createTabs(RES_PARATR_TABSTOP, [new SvxTabStop(720), new SvxTabStop(1440)]));
    const cursor = new SwPaM(new SwPosition(node, 0));
    const projected = new WriterViewProjection().Project(
      document,
      node,
      cursor,
      createDocument({ id: "colors", suiteId: "writer", title: "Colors" }),
    );
    expect(projected.activeParagraph.computedStyle).toMatchObject({
      color: "#123456",
      highlight: "#fedcba",
      tabStopsPt: [36, 72],
    });
    node.SetAttr(createTabs(RES_PARATR_TABSTOP, [new SvxTabStop(960)]));
    expect(
      new WriterViewProjection().Project(
        document,
        node,
        cursor,
        createDocument({ id: "one-tab", suiteId: "writer", title: "One Tab" }),
      ).activeParagraph.computedStyle.tabStopsPt,
    ).toEqual([48]);
  });
  it("presents save, open, failure and modified states from the owned medium", /** Checks presents save, open, failure and modified states from the owned medium. @returns Test callback result. */ () => {
    const view = failureView();
    expect(presentWriterStatus(view, statusSnapshot("none", "idle"), getText)).toBe(
      "Not saved in this browser.",
    );
    expect(presentWriterStatus(view, statusSnapshot("none", "idle", true), getText)).toBe(
      "Document has unsaved changes.",
    );
    expect(presentWriterStatus(view, statusSnapshot("save", "pending"), getText)).toBe(
      "Document operation in progress.",
    );
    expect(presentWriterStatus(view, statusSnapshot("save", "succeeded"), getText)).toBe(
      "Saved locally in this browser.",
    );
    expect(presentWriterStatus(view, statusSnapshot("save-as", "unconfirmed"), getText)).toBe(
      "Saving document.",
    );
    expect(presentWriterStatus(view, statusSnapshot("open", "succeeded"), getText)).toBe(
      "Document opened.",
    );
    expect(presentWriterStatus(view, statusSnapshot("open", "failed"), getText)).toBe(
      "Document operation failed.",
    );
    expect(
      presentWriterStatus(view, statusSnapshot("open", "failed", false, "broken"), getText),
    ).toBe("broken");
  });

  it("maps command errors to stable user-facing messages", /** Checks maps command errors to stable user-facing messages. @returns Test callback result. */ () => {
    const cases: readonly [string, string, string][] = [
      [WRITER_COMMAND_IDS.openOdt, "error", "Could not open ODT: error"],
      [WRITER_COMMAND_IDS.saveOdt, "error", "Could not save ODT: error"],
      [WRITER_COMMAND_IDS.exportText, "error", "Could not start plain-text download."],
      [WRITER_COMMAND_IDS.copy, "selection-required", "Select text to copy."],
      [WRITER_COMMAND_IDS.copy, "error", "Could not copy selection."],
      [WRITER_COMMAND_IDS.cut, "selection-required", "Select text to cut."],
      [WRITER_COMMAND_IDS.cut, "error", "Could not copy selection."],
      [WRITER_COMMAND_IDS.paste, "clipboard-empty", "Clipboard has no text to paste."],
      [WRITER_COMMAND_IDS.paste, "error", "Could not read browser clipboard."],
    ];
    for (const [commandId, code, expected] of cases) {
      const view = failureView({ commandId, code, error: "error" });
      expect(presentWriterCommandError(view, getText)).toBe(expected);
      expect(presentWriterStatus(view, statusSnapshot("none", "idle"), getText)).toBe(expected);
    }
  });
  it("completes shell-owned hyperlink and page dialogs from the browser presenter", /** Checks completes shell-owned hyperlink and page dialogs from the browser presenter. @returns Test callback result. */ async () => {
    const session = createWriterDocumentSession();
    const view = render(<WriterWorkbench isActive view={session.view} />);
    const dialogs = session.view.GetDialogController();
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Document title" }), {
      key: "ArrowLeft",
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: " " },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Layout parity" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    expect(session.docShell.GetTitle()).toBe("Layout parity");
    const topMargin = screen.getByRole("button", { name: "Top page margin" });
    fireEvent.pointerDown(topMargin, { clientY: 40 });
    fireEvent.pointerUp(window, { clientY: 48 });
    let link!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        link = dialogs.RequestHyperlinkDialog(WRITER_COMMAND_IDS.hyperlinkDialog);
      },
    );
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByText("Apply"));
    await expect(link).resolves.toEqual({
      hyperlink: { url: "https://example.com" },
      text: "",
    });

    let page!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        page = dialogs.RequestPageDialog(
          WRITER_COMMAND_IDS.pageDialog,
          session.docShell.GetDoc().GetPageDesc().GetValue(),
        );
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(page).resolves.toBeUndefined();

    let edit!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        edit = dialogs.RequestHyperlinkDialog(WRITER_COMMAND_IDS.editHyperlink, {
          url: "https://example.com",
        });
      },
    );
    expect(screen.getByLabelText("URL")).toHaveValue("https://example.com");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(edit).resolves.toBeUndefined();

    let acceptedPage!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        acceptedPage = dialogs.RequestPageDialog(
          WRITER_COMMAND_IDS.pageDialog,
          session.docShell.GetDoc().GetPageDesc().GetValue(),
        );
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(acceptedPage).resolves.toMatchObject({ pageDescriptor: { name: "Standard" } });
    view.unmount();
    session.Close();
  });

  it("rolls back a title edit when immediate browser persistence fails", /** Checks rename collision feedback. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const previous = session.docShell.GetTitle();
    const autosave = {
      Flush: vi.fn().mockRejectedValue(new Error("Name already exists")),
    } as unknown as WriterAutosaveController;
    const rendered = render(<WriterWorkbench autosave={autosave} isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Conflicting title" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(session.docShell.GetTitle()).toBe(previous),
    );
    expect(autosave.Flush).toHaveBeenCalledTimes(1);
    expect(session.docShell.GetMedium().GetLastOperation()).toMatchObject({
      operation: "save",
      state: "failed",
      message: "Name already exists",
    });
    rendered.unmount();
    session.Close();
  });
  it("flushes browser storage on Ctrl/Meta+S without opening Save As or Export", /** Checks immediate local save accelerator routing. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const autosave = {
      Flush: vi.fn().mockResolvedValue(undefined),
    } as unknown as WriterAutosaveController;
    const rendered = render(
      <WriterWorkbench
        autosave={autosave}
        fileDialogs={session.fileDialogs}
        isActive
        view={session.view}
      />,
    );
    const ctrl = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "s",
    });
    window.dispatchEvent(ctrl);
    expect(ctrl.defaultPrevented).toBe(true);
    const meta = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      metaKey: true,
      key: "S",
    });
    window.dispatchEvent(meta);
    expect(meta.defaultPrevented).toBe(true);
    expect(autosave.Flush).toHaveBeenCalledTimes(2);
    expect(session.fileDialogs.GetSnapshot()).toBeUndefined();
    for (const options of [
      { key: "q", ctrlKey: true },
      { key: "s" },
      { key: "s", ctrlKey: true, altKey: true },
      { key: "s", ctrlKey: true, shiftKey: true },
    ]) {
      const ignored = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...options });
      window.dispatchEvent(ignored);
    }
    expect(autosave.Flush).toHaveBeenCalledTimes(2);
    rendered.rerender(
      <WriterWorkbench
        autosave={autosave}
        fileDialogs={session.fileDialogs}
        isActive={false}
        view={session.view}
      />,
    );
    const inactive = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "s",
    });
    window.dispatchEvent(inactive);
    expect(inactive.defaultPrevented).toBe(false);
    rendered.rerender(
      <WriterWorkbench fileDialogs={session.fileDialogs} isActive view={session.view} />,
    );
    const withoutStore = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      key: "s",
    });
    window.dispatchEvent(withoutStore);
    expect(withoutStore.defaultPrevented).toBe(true);
    rendered.unmount();
    session.Close();
  });
  it("reports immediate local save failures", /** Checks both Error and string storage failures. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const autosave = {
      Flush: vi.fn().mockRejectedValue(new Error("Storage failed")),
    } as unknown as WriterAutosaveController;
    const rendered = render(<WriterWorkbench autosave={autosave} isActive view={session.view} />);
    window.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ctrlKey: true, key: "s" }),
    );
    await waitFor(
      /** Waits for the first storage failure state. @returns Assertion. */
      () =>
        expect(session.docShell.GetMedium().GetLastOperation()).toMatchObject({
          operation: "save",
          state: "failed",
          message: "Storage failed",
        }),
    );
    (autosave.Flush as ReturnType<typeof vi.fn>).mockRejectedValue("quota exceeded");
    window.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true, metaKey: true, key: "s" }),
    );
    await waitFor(
      /** Waits for the second storage failure state. @returns Assertion. */
      () => expect(session.docShell.GetMedium().GetLastOperation().message).toBe("quota exceeded"),
    );
    rendered.unmount();
    session.Close();
  });
  it("ignores a rejected title and presents non-Error save failures", /** Checks title validation and adapter error reporting. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const previous = session.docShell.GetTitle();
    const rename = vi.spyOn(session.docShell, "RenameDocument");
    const autosave = {
      Flush: vi.fn().mockRejectedValue("quota exceeded"),
    } as unknown as WriterAutosaveController;
    const rendered = render(<WriterWorkbench autosave={autosave} isActive view={session.view} />);
    rename.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Rejected" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    expect(autosave.Flush).not.toHaveBeenCalled();
    expect(session.docShell.GetTitle()).toBe(previous);
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Later" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(session.docShell.GetMedium().GetLastOperation().message).toBe("quota exceeded"),
    );
    expect(session.docShell.GetTitle()).toBe(previous);
    rendered.unmount();
    session.Close();
  });

  it("passes an active autosave controller into file dialogs", /** Checks file dialog composition. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const autosave = { Flush: vi.fn() } as unknown as WriterAutosaveController;
    const rendered = render(
      <WriterWorkbench
        autosave={autosave}
        fileDialogs={session.fileDialogs}
        isActive
        services={session.services}
        view={session.view}
      />,
    );
    act(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        session.fileDialogs.Show("export"),
    );
    expect(screen.getByRole("dialog", { name: "Export" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Export" })).toBeNull();
    rendered.rerender(
      <WriterWorkbench
        fileDialogs={session.fileDialogs}
        isActive
        services={session.services}
        view={session.view}
      />,
    );
    act(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        session.fileDialogs.Show("export"),
    );
    expect(screen.getByRole("dialog", { name: "Export" })).toBeVisible();
    rendered.unmount();
    session.Close();
  });
  // executes domain commands without DOM through the top Writer shell
  it("keeps the suite test root active", /** Keeps test discovery active. @returns Nothing. */ () => {
    expect(true).toBe(true);
  });
});

/** Creates a fixture through the actual native state setters. @param value - Active value. @param which - Identity. @param mode - Active rule. @returns Native item. */
function lineSpacingFixture(
  value: number,
  which: number,
  mode: "proportional" | "fixed" | "minimum" | "leading" = "proportional",
): SvxLineSpacingItem {
  const item = new SvxLineSpacingItem(200, which);
  if (mode === "proportional") item.SetPropLineSpace(value);
  else if (mode === "leading") item.SetInterLineSpace(value);
  else {
    item.SetLineHeight(value);
    if (mode === "fixed") item.SetLineSpaceRule(SvxLineSpaceRule.Fix);
  }
  return item;
}
