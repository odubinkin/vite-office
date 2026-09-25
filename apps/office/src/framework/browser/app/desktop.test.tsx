/**
 * @fileoverview Verifies browser launcher navigation and Writer selection behavior.
 */

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Desktop } from "./desktop";
import { createOfficeModuleDescriptors } from "./modulemanager";
import { ZipFile } from "../../../package/source/zipapi/ZipFile";
import { createWriterDocument } from "../../../sw/source/core/doc/doc";
import { writeOdtDocument } from "../../../sw/source/filter/xml/wrtxml";
import { createWriterModuleFactory } from "../../../sw/browser/composition/writer-module";

/** Renders framework Desktop with the Writer factory registered by a test composition root. @returns Configured desktop element. */
function App(): React.JSX.Element {
  return <Desktop modules={createOfficeModuleDescriptors([createWriterModuleFactory()])} />;
}

/**
 * Replaces the complete text content of one document-integrated editable Writer paragraph.
 *
 * @param paragraph - Accessible contenteditable paragraph rendered by the Writer document page.
 * @param text - Complete replacement text that the bounded paragraph model should store.
 * @returns Nothing; Writer receives the browser editing intent through beforeinput.
 */
function enterWriterParagraphText(paragraph: HTMLElement, text: string): void {
  const range = document.createRange();
  range.selectNodeContents(paragraph);
  const selection = globalThis.getSelection();
  if (selection === null) throw new Error("Browser selection must be available in Writer tests.");
  selection.removeAllRanges();
  selection.addRange(range);
  document.dispatchEvent(new Event("selectionchange"));
  fireEvent(
    paragraph,
    new InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: text,
      inputType: "insertReplacementText",
    }),
  );
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
  document.dispatchEvent(new Event("selectionchange"));
}

/** Invokes one Writer File menu command by its accessible label. @param name - Visible command label. @returns A promise fulfilled after asynchronous command state settles. */
async function invokeWriterFileCommand(name: string): Promise<void> {
  fireEvent.click(screen.getByRole("button", { name: "File" }));
  fireEvent.click(screen.getByRole("menuitem", { name }));
  await act(
    /** Flushes state scheduled by asynchronous File commands. @returns A fulfilled React act promise. */
    async () => undefined,
  );
}

describe("App" /**
 * Groups user-observable workbench foundation tests.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineAppTests(): void {
  beforeEach(
    /** Opens the dedicated Writer pathname used by editor-focused tests. @returns Nothing. */
    function openWriterRoute(): void {
      globalThis.history.replaceState(null, "", "/writer");
    },
  );

  it("renders the integrated Writer document editor and updates immutable history" /**
   * Verifies the accessible page-integrated editor starts clean and replaces its sole paragraph through history.
   *
   * @returns Nothing; assertions describe the rendered static shell.
   */, function verifyWriterEditing(): void {
    render(<App />);

    expect(screen.getByRole("region", { name: "Writer workspace" })).toBeVisible();
    expect(screen.getByRole("menubar", { name: "Writer menu bar" })).toBeVisible();
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
    expect(
      screen.getByRole("region", { name: "Writer workspace" }).closest("main"),
    ).toHaveAttribute("id", "workspace");
    expect(screen.queryByText("Vite Office")).not.toBeInTheDocument();
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    expect(screen.getByRole("article", { name: "Writer document body" })).toContainElement(editor);
    expect(within(documentCanvas).getByRole("textbox", { name: "Writer document text" })).toBe(
      editor,
    );
    expect(screen.getByRole("article", { name: "Writer document body" })).toHaveAttribute(
      "contenteditable",
      "true",
    );
    expect(editor).not.toHaveAttribute("contenteditable");
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
    expect(within(formattingToolbar).getByRole("button", { name: "Start" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Start" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "default" } });
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "heading-1" } });
    expect(firstParagraph).toHaveStyle({ fontSize: "18pt" });
    expect(firstParagraph).toHaveAccessibleDescription(/Paragraph style: Heading 1/);
    expect(
      within(screen.getByRole("complementary", { name: "Writer properties sidebar" })).getByText(
        "Heading 1",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByLabelText("Paragraph style")).toHaveValue("default");
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Center" }));
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
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Text" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Italic" }));
    expect(editor.querySelector("strong em")).toHaveTextContent("Body");
    selectWriterParagraphText(editor);
    fireEvent.keyDown(window, { ctrlKey: true, key: "u" });
    expect(editor.querySelector("strong em span")).toHaveStyle({ textDecoration: "underline" });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(editor.querySelector("strong em span")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(editor.querySelector("strong em span")).toBeInTheDocument();
  });

  it("selects local-compatible fonts and sizes and exposes source-backed paragraph styles", /** Verifies the Writer selectors and visible style classes. @returns Nothing. */ function selectsWriterFontsAndStyles(): void {
    render(<App />);
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    enterWriterParagraphText(editor, "Styled");
    selectWriterParagraphText(editor);
    const fontSelect = screen.getByLabelText("Font name");
    expect(within(fontSelect).getByRole("option", { name: "Noto Serif" })).toBeInTheDocument();
    fireEvent.change(fontSelect, { target: { value: "Noto Serif" } });
    expect(editor.querySelector("span")).toHaveStyle({ fontFamily: "Noto Serif" });
    const fontSizeSelect = screen.getByLabelText("Font size");
    expect(within(fontSizeSelect).getByRole("option", { name: "14 pt" })).toBeInTheDocument();
    fireEvent.change(fontSizeSelect, { target: { value: "14" } });
    expect(editor.querySelector('[style*="font-size"]')).toHaveStyle({ fontSize: "14pt" });

    const styleSelect = screen.getByLabelText("Paragraph style");
    expect(within(styleSelect).getAllByRole("option")).toHaveLength(26);
    expect(
      within(styleSelect).queryByRole("option", { name: "List Heading" }),
    ).not.toBeInTheDocument();
    for (const [style, fontSize] of [
      ["title", "28pt"],
      ["subtitle", "18pt"],
      ["heading-3", "14pt"],
      ["heading-5", "12pt"],
      ["heading", "14pt"],
      ["preformatted-text", "10pt"],
      ["quotations", "12pt"],
      ["caption", "10pt"],
      ["footnote", "10pt"],
    ] as const) {
      fireEvent.change(styleSelect, { target: { value: style } });
      expect(editor).toHaveStyle({ fontSize });
    }
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
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    expect(screen.getByRole("menuitemradio", { name: "No List" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("applies and toggles Writer list commands from their pinned toolbar and Format submenu" /** Verifies visible list markers, active command state, accessible list descriptions, and no-op removal history behavior. @returns Nothing; assertions cover both list command placements. */, function appliesWriterLists(): void {
    render(<App />);
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    const paragraphId = paragraph.dataset.writerParagraphId as string;
    const formattingToolbar = screen.getByRole("toolbar", { name: "Writer formatting toolbar" });
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Unordered List" }));
    expect(screen.getByTestId(`writer-list-marker-${paragraphId}`)).toHaveTextContent("•");
    expect(paragraph).toHaveAccessibleDescription(/Paragraph list: Unordered List/);
    expect(paragraph.textContent).not.toContain("•");
    expect(within(formattingToolbar).getByRole("button", { name: "Bold" })).toBeVisible();
    expect(within(formattingToolbar).getByRole("button", { name: "Decrease" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Unordered List" }));
    expect(screen.queryByTestId(`writer-list-marker-${paragraphId}`)).not.toBeInTheDocument();
    expect(within(formattingToolbar).getByRole("button", { name: "Bold" })).toBeVisible();
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Ordered List" }));
    expect(screen.getByTestId(`writer-list-marker-${paragraphId}`)).toHaveTextContent("1.");
    expect(within(formattingToolbar).getByRole("button", { name: "Decrease" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    expect(screen.getByRole("menuitem", { name: "Demote Outline Level" })).toBeEnabled();
    fireEvent.click(screen.getByRole("menuitem", { name: "Demote Outline Level" }));
    expect(paragraph).toHaveAttribute("data-list-level", "1");
    expect(paragraph.parentElement).toHaveStyle({ marginInlineStart: "36pt" });
    fireEvent.click(within(formattingToolbar).getByRole("button", { name: "Decrease" }));
    expect(paragraph).toHaveAttribute("data-list-level", "0");
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    expect(screen.getByRole("menu", { name: "Lists menu" })).toBeVisible();
    fireEvent.click(screen.getByRole("menuitemradio", { name: "No List" }));
    expect(screen.queryByTestId("writer-list-marker-writer-paragraph-1")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Format" }));
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Lists" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "No List" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
  });

  it("renders only the launcher at root and a full-page foundation suite at its route" /**
   * Exercises root, suite, and unknown pathname presentation without mixing global and suite chrome.
   *
   * @returns Nothing; assertions verify route-specific page composition and launcher links.
   */, function verifySuiteRoutes(): void {
    globalThis.history.replaceState(null, "", "/");
    render(<App />);

    expect(screen.getByText("Vite Office")).toBeInTheDocument();
    expect(screen.getByLabelText("Search is unavailable")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("navigation", { name: "Office applications" })).toBeVisible();
    expect(screen.getByRole("link", { name: "Writer" })).toHaveAttribute("href", "/writer");
    expect(screen.getByRole("link", { name: "Calc, Foundation only" })).toHaveAttribute(
      "href",
      "/calc",
    );
    expect(document.querySelector("#workspace")).not.toBeInTheDocument();

    cleanup();
    globalThis.history.replaceState(null, "", "/calc");
    render(<App />);

    expect(screen.getByText("Calc: Foundation only")).toBeInTheDocument();
    expect(screen.getByText(/Worksheets, formulas, analysis/)).toBeInTheDocument();
    expect(
      screen.getByText(
        /No document model, editing shell, persistence, or command surface is registered/,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Writer document text" })).not.toBeInTheDocument();
    expect(screen.getByText("No editor features enabled")).toBeInTheDocument();
    expect(document.querySelector("#workspace")).toHaveClass("h-screen");
    expect(screen.queryByText("Vite Office")).not.toBeInTheDocument();

    cleanup();
    globalThis.history.replaceState(null, "", "/unknown-suite");
    render(<App />);
    expect(screen.getByRole("navigation", { name: "Office applications" })).toBeVisible();
    expect(document.querySelector("#workspace")).not.toBeInTheDocument();
  });

  it("opens an ODT through the computer tab and exports a parseable package", /** Exercises the browser file dialog boundaries. @returns Completed assertions. */ async () => {
    const oldFactory = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: new IDBFactory() });
    const source = createWriterDocument();
    source.paragraphs[0]?.SetText("Imported package body");
    const bytes = writeOdtDocument(source, { title: "Imported package" });
    let downloaded: Blob | undefined;
    const createUrl = vi.spyOn(URL, "createObjectURL").mockImplementation(
      /** Captures exported content. @param blob - Download body. @returns Test URL. */ (blob) => {
        if (blob instanceof Blob) downloaded = blob;
        return "blob:writer-test";
      },
    );
    const revokeUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(/** Suppresses browser navigation. @returns Nothing. */ () => undefined);
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(/** Suppresses browser navigation. @returns Nothing. */ () => undefined);
    try {
      render(<App />);
      await invokeWriterFileCommand("Open…");
      expect(screen.getByRole("dialog", { name: "Open" })).toBeVisible();
      fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
      fireEvent.change(screen.getByLabelText("Browse"), {
        target: { files: [new File([bytes as BlobPart], "imported.odt")] },
      });
      await waitFor(
        /** Waits for the imported body. @returns Nothing. */ () =>
          expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
            "Imported package body",
          ),
      );
      await waitFor(
        /** Waits for the immediate browser save. @returns Nothing. */ () =>
          expect(screen.queryByRole("dialog", { name: "Open" })).not.toBeInTheDocument(),
      );
      await invokeWriterFileCommand("Open…");
      await waitFor(
        /** Finds the imported browser copy without waiting for autosave. @returns Nothing. */ () =>
          expect(screen.getByRole("button", { name: "Imported package" })).toBeVisible(),
      );
      fireEvent.click(screen.getByRole("button", { name: "Close" }));
      await invokeWriterFileCommand("Export…");
      expect(screen.getByRole("button", { name: "Download ODT" })).toHaveTextContent("ODT");
      expect(screen.getByRole("button", { name: "Download TXT" })).toHaveTextContent("TXT");
      fireEvent.click(screen.getByRole("button", { name: "Download ODT" }));
      await waitFor(
        /** Waits for an ODT download. @returns Nothing. */ () =>
          expect(downloaded).toBeInstanceOf(Blob),
      );
      if (downloaded === undefined) throw new Error("Expected an ODT download.");
      const archive = new ZipFile(new Uint8Array(await downloaded.arrayBuffer()));
      expect(await archive.readTextEntry("content.xml")).toContain(
        "Imported<text:s/>package<text:s/>body",
      );
    } finally {
      createUrl.mockRestore();
      revokeUrl.mockRestore();
      click.mockRestore();
      Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: oldFactory });
    }
  });

  it("immediately saves imported TXT but never saves an empty import", /** Checks imported document persistence timing. @returns Completed assertions. */ async () => {
    const oldFactory = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: new IDBFactory() });
    try {
      render(<App />);
      await invokeWriterFileCommand("Open…");
      fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
      fireEvent.change(screen.getByLabelText("Browse"), {
        target: { files: [new File(["Imported text"], "notes.txt", { type: "text/plain" })] },
      });
      await waitFor(
        /** Waits for TXT import and immediate storage. @returns Nothing. */ () =>
          expect(screen.queryByRole("dialog", { name: "Open" })).not.toBeInTheDocument(),
      );
      await invokeWriterFileCommand("Open…");
      await waitFor(
        /** Finds the newly imported browser copy. @returns Nothing. */ () =>
          expect(screen.getByRole("button", { name: "notes" })).toBeVisible(),
      );
      fireEvent.click(screen.getByRole("tab", { name: "On computer" }));
      fireEvent.change(screen.getByLabelText("Browse"), {
        target: { files: [new File([""], "empty.txt", { type: "text/plain" })] },
      });
      await waitFor(
        /** Waits for empty import to finish. @returns Nothing. */ () =>
          expect(screen.queryByRole("dialog", { name: "Open" })).not.toBeInTheDocument(),
      );
      await invokeWriterFileCommand("Open…");
      await waitFor(
        /** Confirms the earlier nonempty copy remains available. @returns Nothing. */ () =>
          expect(screen.getByRole("button", { name: "notes" })).toBeVisible(),
        { timeout: 5000 },
      );
      expect(screen.queryByRole("button", { name: "empty" })).not.toBeInTheDocument();
    } finally {
      Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: oldFactory });
    }
  });

  it("keeps named browser copies available from Open", /** Covers Save As copy and browser listing without manual Save. @returns Completed assertions. */ async () => {
    const oldFactory = globalThis.indexedDB;
    Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: new IDBFactory() });
    try {
      render(<App />);
      enterWriterParagraphText(
        screen.getByRole("textbox", { name: "Writer document text" }),
        "Stored body",
      );
      await invokeWriterFileCommand("Save As…");
      fireEvent.change(screen.getByLabelText("New copy name"), {
        target: { value: "First copy" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Save copy" }));
      await waitFor(
        /** Waits for the saved title. @returns Nothing. */ () =>
          expect(screen.getByRole("button", { name: "Edit document title" })).toHaveTextContent(
            "First copy",
          ),
        { timeout: 5000 },
      );
      await invokeWriterFileCommand("Open…");
      expect(screen.getByRole("tab", { name: "In browser" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      const browserTab = screen.getByRole("tab", { name: "In browser" });
      browserTab.focus();
      fireEvent.keyDown(browserTab, { key: "ArrowRight" });
      expect(screen.getByRole("tab", { name: "On computer" })).toHaveAttribute(
        "aria-selected",
        "true",
      );
      fireEvent.keyDown(screen.getByRole("tab", { name: "On computer" }), { key: "Home" });
      expect(browserTab).toHaveAttribute("aria-selected", "true");
      await waitFor(
        /** Waits for the browser document list. @returns Nothing. */ () =>
          expect(screen.getByRole("button", { name: "First copy" })).toBeVisible(),
      );
      fireEvent.click(screen.getByRole("button", { name: "First copy" }));
      await waitFor(
        /** Waits for the browser copy. @returns Nothing. */ () =>
          expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
            "Stored body",
          ),
      );
    } finally {
      Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: oldFactory });
    }
  }, 15_000);
});
