/**
 * @fileoverview Verifies the visible foundation status, suite navigation, and selection behavior of the workbench.
 */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { createDocument } from "./domain/document";
import { saveWriterDocument, type WriterSnapshotState } from "./domain/writer-storage";
import { IndexedDbDocumentStorageAdapter } from "./platform/indexeddb-storage";

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

  it("places implemented Writer commands in accessible top-level menus" /**
   * Verifies File, Edit, View, Format, and Styles open their Writer-positioned command popups while Add paragraph is absent.
   *
   * @returns Nothing; assertions cover bounded command placement and disabled state.
   */, function rendersWriterMenus(): void {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("menu", { name: "File menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Save" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.queryByRole("menu", { name: "File menu" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    expect(screen.getByRole("menu", { name: "View menu" })).toBeVisible();
    const sidebarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Sidebar" });
    expect(sidebarMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(sidebarMenuItem);
    expect(
      screen.queryByRole("complementary", { name: "Writer properties sidebar" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const hiddenSidebarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Sidebar" });
    expect(hiddenSidebarMenuItem).toHaveAttribute("aria-checked", "false");
    fireEvent.click(hiddenSidebarMenuItem);
    expect(screen.getByRole("complementary", { name: "Writer properties sidebar" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const rulersMenuItem = screen.getByRole("menuitem", { name: "Rulers" });
    expect(rulersMenuItem).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(rulersMenuItem);
    const horizontalRulerMenuItem = screen.getByRole("menuitemcheckbox", {
      name: "Horizontal ruler",
    });
    expect(horizontalRulerMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(horizontalRulerMenuItem);
    expect(screen.queryByLabelText("Writer horizontal ruler")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rulers" }));
    const hiddenHorizontalRulerMenuItem = screen.getByRole("menuitemcheckbox", {
      name: "Horizontal ruler",
    });
    expect(hiddenHorizontalRulerMenuItem).toHaveAttribute("aria-checked", "false");
    fireEvent.click(hiddenHorizontalRulerMenuItem);
    expect(screen.getByLabelText("Writer horizontal ruler")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const statusBarMenuItem = screen.getByRole("menuitemcheckbox", { name: "Status Bar" });
    expect(statusBarMenuItem).toHaveAttribute("aria-checked", "true");
    fireEvent.click(statusBarMenuItem);
    expect(screen.queryByRole("status", { name: "Writer status bar" })).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Writer document canvas" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const hiddenStatusBarMenuItem = screen.getByRole("menuitemcheckbox", {
      name: "Status Bar",
    });
    expect(hiddenStatusBarMenuItem).toHaveAttribute("aria-checked", "false");
    fireEvent.click(hiddenStatusBarMenuItem);
    expect(screen.getByRole("status", { name: "Writer status bar" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(screen.getByRole("menu", { name: "Edit menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Undo" })).toBeDisabled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    const getSelection = vi.spyOn(window, "getSelection").mockReturnValue(null);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    getSelection.mockRestore();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    expect(screen.getByRole("menu", { name: "Format menu" })).toBeVisible();
    expect(screen.getByRole("menuitem", { name: "Align left" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Styles" }));
    expect(screen.getByRole("menu", { name: "Styles menu" })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Add paragraph" })).not.toBeInTheDocument();
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

  it("does not put structural paragraph actions in the document page" /**
   * Verifies page-integrated text has no persistent removal or movement buttons; movement belongs to Format.
   *
   * @returns Nothing; assertions cover Writer-consistent action placement.
   */, function keepsParagraphActionsOutOfCanvas(): void {
    render(<App />);

    expect(screen.queryByRole("button", { name: "Remove paragraph 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move paragraph 1 up" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Paragraph actions")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    expect(screen.getByRole("menuitem", { name: "Move item up" })).toBeDisabled();
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

  it("copies the selected Writer body through Edit and the standard toolbar" /**
   * Verifies empty-selection feedback, successful browser clipboard writes, and rejected clipboard feedback without document mutation.
   *
   * @returns A promise resolved after the asynchronous copy feedback is asserted.
   */, async function copiesWriterSelection(): Promise<void> {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
      render(<App />);
      const editor = screen.getByRole("textbox", { name: "Writer document text" });
      const getSelection = vi.spyOn(window, "getSelection").mockReturnValue(null);
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
      getSelection.mockRestore();
      expect(screen.getByText("Select text to copy.")).toBeInTheDocument();
      enterWriterParagraphText(editor, "Copied Writer body");
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      const copyMenuItem = screen.getByRole("menuitem", { name: "Copy" });
      await act(
        /** Requests native Copy from the Writer Edit menu. @returns A fulfilled React act promise. */
        async function copiesSelectedText(): Promise<void> {
          fireEvent.click(copyMenuItem);
        },
      );
      expect(writeText).toHaveBeenCalledWith("Copied Writer body");
      expect(screen.getByText("Copied selection.")).toBeInTheDocument();
      writeText.mockRejectedValueOnce(new Error("Denied"));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
      fireEvent.click(screen.getByRole("button", { name: "Edit" }));
      const rejectedCopyMenuItem = screen.getByRole("menuitem", { name: "Copy" });
      await act(
        /** Requests a rejected native copy that must surface deterministic status feedback. @returns A fulfilled React act promise. */
        async function rejectsSelectedTextCopy(): Promise<void> {
          fireEvent.click(rejectedCopyMenuItem);
        },
      );
      expect(screen.getByText("Could not copy selection.")).toBeInTheDocument();
    } finally {
      if (originalClipboard === undefined)
        delete (navigator as unknown as { clipboard?: unknown }).clipboard;
      else Object.defineProperty(navigator, "clipboard", originalClipboard);
    }
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
   * @returns A promise resolved after the loaded body and menu-based move are asserted.
   */, async function loadsAndMovesIrregularBody(): Promise<void> {
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
            style: "default",
            text: "First stored paragraph",
          },
          {
            alignment: "left",
            id: "writer-paragraph-3",
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
      fireEvent.click(screen.getByRole("menuitem", { name: "Move item up" }));
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "Third stored paragraph",
      );
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
