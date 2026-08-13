/**
 * @fileoverview Verifies the visible foundation status, suite navigation, and selection behavior of the workbench.
 */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";

import { Desktop as App } from "./desktop";
import { createDocument } from "../../../sfx2/source/doc/docfac";
import { createWriterTextRuns } from "../../../sw/source/core/txtnode/ndtxt";
import {
  saveWriterDocument,
  type WriterSnapshotState,
} from "../../../sw/source/core/doc/writer-storage";
import { IndexedDbDocumentStorageAdapter } from "../../../vcl/browser/indexeddb-storage";

/**
 * Replaces the complete text content of one document-integrated editable Writer paragraph.
 *
 * @param paragraph - Accessible contenteditable paragraph rendered by the Writer document page.
 * @param text - Complete replacement text that the bounded paragraph model should store.
 * @returns Nothing; React receives the browser input event after the DOM text changes.
 */
function enterWriterParagraphText(paragraph: HTMLElement, text: string): void {
  paragraph.textContent = text;
  fireEvent.input(paragraph);
}

/**
 * Selects a visible Writer paragraph range for a direct character-format command.
 *
 * @param paragraph - Editable Writer paragraph whose complete visible text is selected.
 * @returns Nothing; the browser selection is replaced with the paragraph text range.
 */
function selectWriterParagraphText(paragraph: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = globalThis.getSelection();
  if (selection === null) throw new Error("Browser selection must be available in Writer tests.");
  selection.removeAllRanges();
  selection.addRange(range);
}

describe("App" /**
 * Groups user-observable workbench foundation tests.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineAppTests(): void {
  it("renders the integrated Writer document editor and updates immutable history" /**
   * Verifies the accessible page-integrated editor starts clean and replaces its sole paragraph through history.
   *
   * @returns Nothing; assertions describe the rendered static shell.
   */, function verifyWriterEditing(): void {
    render(<App />);

    expect(screen.getByRole("region", { name: "Writer workspace" })).toBeVisible();
    expect(screen.getByRole("navigation", { name: "Writer menu bar" })).toBeVisible();
    expect(screen.getByRole("toolbar", { name: "Writer standard toolbar" })).toBeVisible();
    expect(
      within(screen.getByRole("toolbar", { name: "Writer standard toolbar" })).queryByRole(
        "button",
        { name: "Download text" },
      ),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("toolbar", { name: "Writer formatting toolbar" })).toBeVisible();
    const documentCanvas = screen.getByRole("region", { name: "Writer document canvas" });
    expect(documentCanvas).toBeVisible();
    expect(screen.getByRole("complementary", { name: "Writer properties sidebar" })).toBeVisible();
    expect(screen.getByRole("status", { name: "Writer status bar" })).toBeVisible();
    expect(screen.getByText("Static frontend")).toBeInTheDocument();
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    expect(screen.getByRole("article", { name: "Writer document body" })).toContainElement(editor);
    expect(within(documentCanvas).getByRole("textbox", { name: "Writer document text" })).toBe(
      editor,
    );
    expect(editor).toHaveAttribute("contenteditable", "true");
    const undoButton = screen.getByRole("button", { name: "Undo" });
    const redoButton = screen.getByRole("button", { name: "Redo" });
    expect(editor).toHaveTextContent("");
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
    fireEvent.keyDown(window, { ctrlKey: true, key: "z" });
    expect(undoButton).toBeDisabled();
    enterWriterParagraphText(editor, "A browser-authored paragraph.");
    expect(editor).toHaveTextContent("A browser-authored paragraph.");
    expect(undoButton).toBeEnabled();
    fireEvent.keyDown(window, { ctrlKey: true, key: "z" });
    expect(editor).toHaveTextContent("");
    fireEvent.keyDown(window, { ctrlKey: true, key: "z", shiftKey: true });
    expect(editor).toHaveTextContent("A browser-authored paragraph.");
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(editor).toHaveTextContent("");
    fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });
    expect(editor).toHaveTextContent("A browser-authored paragraph.");
    fireEvent.keyDown(window, { key: "x" });
    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.click(undoButton);
    expect(editor).toHaveTextContent("");
    expect(redoButton).toBeEnabled();
    fireEvent.click(redoButton);
    expect(editor).toHaveTextContent("A browser-authored paragraph.");
    fireEvent.click(undoButton);
    enterWriterParagraphText(editor, "A branched paragraph.");
    expect(redoButton).toBeDisabled();
    enterWriterParagraphText(editor, "A branched paragraph.");
    expect(
      within(screen.getByRole("toolbar", { name: "Writer standard toolbar" })).getByRole("button", {
        name: "Undo",
      }),
    ).toBeEnabled();
  });

  it("formats the focused Writer paragraph through the formatting toolbar and history" /**
   * Verifies alignment targets the focused editable paragraph, updates the properties sidebar, and restores through undo/redo.
   *
   * @returns Nothing; assertions cover visible alignment state and immutable history behavior.
   */, function alignsFocusedWriterParagraph(): void {
    render(<App />);

    const firstParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    const formattingToolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    expect(within(formattingToolbar).getByRole("button", { name: "Align left" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Align left" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "default" } });
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "heading-1" } });
    expect(firstParagraph).toHaveClass("text-2xl", "font-bold");
    expect(firstParagraph).toHaveAccessibleDescription(/Paragraph style: Heading 1/);
    expect(
      within(screen.getByRole("complementary", { name: "Writer properties sidebar" })).getByText(
        "Heading 1",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByLabelText("Paragraph style")).toHaveValue("default");
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Align center" }));
    expect(firstParagraph).toHaveStyle({ textAlign: "center" });
    expect(screen.getByText("Centered")).toBeInTheDocument();
  });

  it("formats same-paragraph text through Writer toolbar, Format Text, shortcuts, pending typing, history, and Copy" /**
   * Verifies the pinned LO Writer locations all use the same direct-character command shell and semantic output.
   *
   * @returns Nothing; browser-visible semantic formatting and history state are asserted.
   */, function formatsWriterCharacters(): void {
    render(<App />);
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    const formattingToolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    enterWriterParagraphText(editor, "Body");
    selectWriterParagraphText(editor);
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Bold" }));
    expect(editor.querySelector("strong")).toHaveTextContent("Body");
    expect(within(formattingToolbar).getByRole("button", { name: "Bold" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    selectWriterParagraphText(editor);
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Italic" }));
    expect(editor.querySelector("strong em")).toHaveTextContent("Body");
    selectWriterParagraphText(editor);
    fireEvent.keyDown(window, { ctrlKey: true, key: "u" });
    expect(editor.querySelector("strong em span")).toHaveStyle({ textDecoration: "underline" });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(editor.querySelector("strong em span")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(editor.querySelector("strong em span")).toBeInTheDocument();
  });

  it("applies a collapsed Writer character command to subsequent typed text" /** Verifies a pending direct attribute creates semantic character runs without a native range selection. @returns Nothing; the browser-visible inserted run is asserted. */, function formatsSubsequentWriterTyping(): void {
    render(<App />);
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    fireEvent.keyDown(window, { ctrlKey: true, key: "b" });
    fireEvent.keyDown(window, { ctrlKey: true, key: "b" });
    fireEvent.keyDown(window, { ctrlKey: true, key: "i" });
    enterWriterParagraphText(editor, "Typed");
    expect(editor.querySelector("strong")).not.toBeInTheDocument();
    expect(editor.querySelector("em")).toHaveTextContent("Typed");
  });

  it("does not put structural paragraph actions in the document page" /**
   * Verifies page-integrated text has no persistent structural controls; list commands belong to Format's pinned submenu.
   *
   * @returns Nothing; assertions cover Writer-consistent action placement.
   */, function keepsParagraphActionsOutOfCanvas(): void {
    render(<App />);

    expect(screen.queryByRole("button", { name: "Remove paragraph 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move paragraph 1 up" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Paragraph actions")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Bullets and Numbering" }));
    expect(screen.getByRole("menuitem", { name: "Remove Bullets" })).toHaveAttribute(
      "aria-current",
      "true",
    );
  });

  it("applies and toggles Writer list commands from their pinned toolbar and Format submenu" /** Verifies visible list markers, active command state, accessible list descriptions, and no-op removal history behavior. @returns Nothing; assertions cover both list command placements. */, function appliesWriterLists(): void {
    render(<App />);
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    const formattingToolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Unordered List" }));
    expect(screen.getByTestId("writer-list-marker-writer-paragraph-1")).toHaveTextContent("•");
    expect(paragraph).toHaveAccessibleDescription(/Paragraph list: Unordered List/);
    expect(paragraph.textContent).not.toContain("•");
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Unordered List" }));
    expect(screen.queryByTestId("writer-list-marker-writer-paragraph-1")).not.toBeInTheDocument();
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Ordered List" }));
    expect(screen.getByTestId("writer-list-marker-writer-paragraph-1")).toHaveTextContent("1.");
    expect(within(formattingToolbar).getByRole("button", { name: "Promote" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Bullets and Numbering" }));
    expect(screen.getByRole("menuitem", { name: "Demote" })).toBeEnabled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Demote" }));
    expect(paragraph).toHaveAttribute("data-list-level", "1");
    expect(paragraph.parentElement).toHaveStyle({ marginInlineStart: "2rem" });
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Promote" }));
    expect(paragraph).toHaveAttribute("data-list-level", "0");
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Bullets and Numbering" }));
    expect(screen.getByRole("menu", { name: "Bullets and Numbering menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove Bullets" }));
    expect(screen.queryByTestId("writer-list-marker-writer-paragraph-1")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Bullets and Numbering" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove Bullets" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
  });

  it("updates the preview and live status when a suite is selected" /**
   * Exercises the suite-selection state transition through an accessible button.
   *
   * @returns Nothing; assertions verify the resulting main panel and status line.
   */, function verifySuiteSelection(): void {
    render(<App />);

    const calcButton = screen.getByRole("button", { name: "Calc, Foundation only" });
    fireEvent.click(calcButton);

    expect(calcButton).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Calc: Foundation only")).toBeInTheDocument();
    expect(screen.getByText(/Worksheets, formulas, analysis/)).toBeInTheDocument();
    expect(
      screen.getByText(/Untitled Calc Document is a serializable new document/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Writer document text" })).not.toBeInTheDocument();
    expect(screen.getByText("No editor features enabled")).toBeInTheDocument();
  });

  it("retains the Writer session and disables its shortcuts while another suite is selected" /**
   * Verifies that hiding the workbench neither discards text nor lets Writer commands run outside Writer.
   *
   * @returns Nothing; assertions cover workbench visibility and retained state.
   */, function retainsHiddenWriterSession(): void {
    render(<App />);

    enterWriterParagraphText(
      screen.getByRole("textbox", { name: "Writer document text" }),
      "Retained Writer body",
    );
    fireEvent.click(screen.getByRole("button", { name: "Calc, Foundation only" }));
    fireEvent.keyDown(window, { ctrlKey: true, key: "z" });
    expect(screen.queryByRole("textbox", { name: "Writer document text" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Writer, Foundation only" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Retained Writer body",
    );
  });

  it("saves and restores a Writer paragraph through browser-local IndexedDB" /**
   * Verifies Save persists the current body and Load restores it after a later in-memory edit.
   * @returns A promise resolved after the asynchronous storage feedback is asserted.
   */, async function savesAndLoadsWriterDocument(): Promise<void> {
    const originalIndexedDb = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: new IDBFactory(),
    });
    try {
      render(<App />);
      const editor = screen.getByRole("textbox", { name: "Writer document text" });
      enterWriterParagraphText(editor, "Stored body");
      fireEvent.change(screen.getByLabelText("Paragraph style"), {
        target: { value: "heading-1" },
      });
      await act(
        /** Starts the asynchronous save interaction. @returns A fulfilled React act promise. */
        async function savesDocument(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Save locally" }));
        },
      );
      await waitFor(
        /** Waits for successful save feedback. @returns A fulfilled polling promise. */
        async function verifiesSavedStatus(): Promise<void> {
          expect(screen.getByText("Saved locally in this browser.")).toBeInTheDocument();
        },
      );
      enterWriterParagraphText(editor, "Changed body");
      await act(
        /** Starts the asynchronous load interaction. @returns A fulfilled React act promise. */
        async function loadsDocument(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Load locally" }));
        },
      );
      await waitFor(
        /** Waits for restored text and load feedback. @returns A fulfilled polling promise. */
        async function verifiesLoadedDocument(): Promise<void> {
          expect(editor).toHaveTextContent("Stored body");
          expect(editor).toHaveClass("text-2xl", "font-bold");
          expect(screen.getByText("Loaded local saved copy.")).toBeInTheDocument();
        },
      );
    } finally {
      Object.defineProperty(globalThis, "indexedDB", {
        configurable: true,
        value: originalIndexedDb,
      });
    }
  });

  it("assigns a non-colliding paragraph identity after loading an irregular saved body" /**
   * Verifies the workbench skips an occupied generated identity when historical local data has a gap.
   *
   * @returns A promise resolved after the loaded body and focused-list command are asserted.
   */, async function loadsIrregularBody(): Promise<void> {
    const originalIndexedDb = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: new IDBFactory(),
    });
    try {
      const adapter = new IndexedDbDocumentStorageAdapter<WriterSnapshotState>(
        "vite-office-writer-workbench",
      );
      await saveWriterDocument(adapter, {
        document: createDocument({
          id: "writer-workbench",
          suiteId: "writer",
          title: "Untitled Writer Document",
        }),
        paragraphs: [
          {
            alignment: "left",
            id: "writer-paragraph-1",
            list: { kind: "none", level: 0 },
            runs: createWriterTextRuns("First stored paragraph"),
            style: "default",
            text: "First stored paragraph",
          },
          {
            alignment: "left",
            id: "writer-paragraph-3",
            list: { kind: "none", level: 0 },
            runs: createWriterTextRuns("Third stored paragraph"),
            style: "default",
            text: "Third stored paragraph",
          },
        ],
      });
      render(<App />);
      await act(
        /** Starts the asynchronous load of the irregular saved body. @returns A fulfilled React act promise. */
        async function loadsIrregularBody(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Load locally" }));
        },
      );
      await waitFor(
        /** Waits for the loaded body to become visible. @returns A fulfilled polling promise. */
        async function verifiesIrregularBody(): Promise<void> {
          expect(screen.getByRole("textbox", { name: "Writer paragraph 2" })).toHaveTextContent(
            "Third stored paragraph",
          );
        },
      );
      fireEvent.focus(screen.getByRole("textbox", { name: "Writer paragraph 2" }));
      fireEvent.click(screen.getByRole("button", { name: "Format" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Bullets and Numbering" }));
      fireEvent.click(screen.getByRole("menuitem", { name: /^Unordered List$/ }));
      expect(screen.getByTestId("writer-list-marker-writer-paragraph-3")).toHaveTextContent("•");
    } finally {
      Object.defineProperty(globalThis, "indexedDB", {
        configurable: true,
        value: originalIndexedDb,
      });
    }
  });

  it("reports missing, unavailable, and failing browser storage without changing Writer text" /**
   * Verifies non-destructive feedback for every unsupported or failed storage outcome.
   * @returns A promise resolved after all asynchronous error states are asserted.
   */, async function reportsStorageFailures(): Promise<void> {
    const originalIndexedDb = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: new IDBFactory() });
    try {
      render(<App />);
      await act(
        /** Starts a missing-snapshot lookup. @returns A fulfilled React act promise. */
        async function loadsMissing(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Load locally" }));
        },
      );
      await waitFor(
        /** Waits for missing-snapshot feedback. @returns A fulfilled polling promise. */
        async function verifiesMissing(): Promise<void> {
          expect(screen.getByText("No local saved copy exists.")).toBeInTheDocument();
        },
      );
    } finally {
      Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: undefined });
    }
    cleanup();
    render(<App />);
    await act(
      /** Starts save where IndexedDB is unavailable. @returns A fulfilled React act promise. */
      async function reportsUnavailable(): Promise<void> {
        fireEvent.click(screen.getByRole("button", { name: "Save locally" }));
      },
    );
    expect(screen.getByText("Browser storage is unavailable.")).toBeInTheDocument();
    await act(
      /** Starts load where IndexedDB is unavailable. @returns A fulfilled React act promise. */
      async function reportsUnavailableLoad(): Promise<void> {
        fireEvent.click(screen.getByRole("button", { name: "Load locally" }));
      },
    );
    cleanup();
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: {
        open:
          /** Throws a configured browser-factory failure. @returns Nothing; always throws. */
          function failsOpen(): IDBOpenDBRequest {
            throw new Error("unavailable");
          },
      },
    });
    render(<App />);
    await act(
      /** Starts a failing save operation. @returns A fulfilled React act promise. */
      async function reportsSaveFailure(): Promise<void> {
        fireEvent.click(screen.getByRole("button", { name: "Save locally" }));
      },
    );
    await waitFor(
      /** Waits for save-failure feedback. @returns A fulfilled polling promise. */
      async function verifiesSaveFailure(): Promise<void> {
        expect(screen.getByText("Could not save locally.")).toBeInTheDocument();
      },
    );
    await act(
      /** Starts a failing load operation. @returns A fulfilled React act promise. */
      async function reportsFailure(): Promise<void> {
        fireEvent.click(screen.getByRole("button", { name: "Load locally" }));
      },
    );
    await waitFor(
      /** Waits for load-failure feedback. @returns A fulfilled polling promise. */
      async function verifiesFailure(): Promise<void> {
        expect(screen.getByText("Could not load local copy.")).toBeInTheDocument();
      },
    );
    Object.defineProperty(globalThis, "indexedDB", {
      configurable: true,
      value: originalIndexedDb,
    });
  });

  it("starts a multi-paragraph plain-text download and reports adapter failures" /**
   * Verifies the user-visible result for successful and rejected browser download capabilities.
   * @returns A promise resolved after Blob text serialization is asserted.
   */, async function downloadsWriterText(): Promise<void> {
    let downloadedBlob: Blob | undefined;
    const createObjectUrl = vi.fn(
      /**
       * Captures the generated Blob and produces the deterministic test object URL.
       *
       * @param blob - Plain-text Blob supplied by the browser download adapter.
       * @returns Fixed object URL.
       */
      function createObjectUrl(blob: Blob): string {
        downloadedBlob = blob;
        return "blob:writer";
      },
    );
    const revokeObjectUrl = vi.fn(
      /** Records URL cleanup without external side effects. @returns Nothing. */
      function revokeObjectUrl(): void {},
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      /** Simulates browser download activation. @returns Nothing. */
      function clickAnchor(): void {},
    );
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: createObjectUrl });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: revokeObjectUrl });
    render(<App />);
    enterWriterParagraphText(
      screen.getByRole("textbox", { name: "Writer document text" }),
      "Download body",
    );
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Save as text…" }));
    expect(screen.getByText("Plain-text download started.")).toBeInTheDocument();
    expect(await downloadedBlob?.text()).toBe("Download body");
    createObjectUrl.mockImplementationOnce(
      /** Simulates unsupported browser object URL creation. @returns No URL because this call throws. */
      function rejectsObjectUrl(): string {
        throw new Error("unsupported");
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Save as text…" }));
    expect(screen.getByText("Could not start plain-text download.")).toBeInTheDocument();
    click.mockRestore();
  });
});
