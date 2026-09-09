/** @fileoverview Verifies browser-visible Enter paragraph breaks in the integrated Writer document canvas. */

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Desktop as App } from "../../../../framework/source/services/desktop";

/**
 * Replaces one document-integrated editable Writer paragraph with complete plain text.
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
 * Places a collapsed browser selection at a UTF-16 text offset within an editable test paragraph.
 *
 * @param paragraph - Rendered editable paragraph that owns the text node used for the selection.
 * @param offset - Zero-based UTF-16 caret offset within the paragraph's sole text node.
 * @returns Nothing; the browser selection is replaced with the requested collapsed range.
 */
function placeWriterCaret(paragraph: HTMLElement, offset: number): void {
  const textNode = paragraph.firstChild;
  if (textNode === null) throw new Error("Writer test paragraph must contain a text node.");
  const range = document.createRange();
  range.setStart(textNode, offset);
  range.collapse(true);
  const selection = window.getSelection();
  if (selection === null) throw new Error("Browser selection must be available in Writer tests.");
  selection.removeAllRanges();
  selection.addRange(range);
}

/**
 * Applies one browser-native text edit with its post-edit caret and InputEvent kind.
 *
 * @param paragraph - Editable Writer paragraph receiving the native mutation.
 * @param text - Complete post-edit paragraph text.
 * @param inputType - Native InputEvent edit kind.
 * @param caretOffset - Collapsed caret after the browser mutation.
 * @returns Nothing; the DOM mutation is committed through the Writer input boundary.
 */
function inputWriterParagraphText(
  paragraph: HTMLElement,
  text: string,
  inputType: string,
  caretOffset = text.length,
): void {
  paragraph.textContent = text;
  placeWriterCaret(paragraph, caretOffset);
  fireEvent.input(paragraph, { inputType });
}

describe("Writer paragraph breaks" /** Groups native Enter interaction and guarded browser-selection behavior. @returns Nothing; Vitest registers the enclosed case. */, function defineWriterParagraphBreakTests(): void {
  beforeEach(
    /** Opens the dedicated Writer page used by application-integrated editor tests. @returns Nothing. */
    function openWriterRoute(): void {
      globalThis.history.replaceState(null, "", "/writer");
    },
  );

  it("routes a native same-paragraph Paste event through the immutable Writer document body" /** Verifies React's document-body clipboard listener replaces selected text with safe direct-format runs instead of allowing editable-host HTML mutation. @returns Nothing; browser-visible pasted markup is asserted. */, function routesNativePasteThroughDocumentBody(): void {
    render(<App />);
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    const documentBody = screen.getByRole("article", { name: "Writer document body" });
    window.getSelection()?.removeAllRanges();
    fireEvent.paste(documentBody, {
      clipboardData: {
        /** Supplies visible test text that must be ignored without a Writer selection or caret. @returns Plain clipboard text. */
        getData: (): string => "Ignored",
      },
    });
    expect(paragraph).toHaveTextContent("");
    enterWriterParagraphText(paragraph, "Replace me");
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    const selection = window.getSelection() as Selection;
    selection.removeAllRanges();
    selection.addRange(range);
    fireEvent.paste(documentBody, {
      clipboardData: {
        /** Supplies safe rich HTML plus plain text for the test-owned native Paste event. @param type - Requested clipboard MIME type. @returns Bounded rich HTML or plain fallback text. */
        getData(type: string): string {
          return type === "text/html" ? "<strong>Inserted</strong>" : "Inserted";
        },
      },
    });
    const pastedParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    expect(pastedParagraph).toHaveTextContent("Inserted");
    expect(pastedParagraph.querySelector("strong")).toHaveTextContent("Inserted");
  });

  it("keeps the typing caret stable and routes Ctrl/Cmd+A to Writer Select All" /** Verifies immutable input commits preserve a mid-paragraph caret while both platform Select All shortcuts select every Writer paragraph. @returns Nothing; the browser selection and visible paragraph contents are asserted. */, function handlesDocumentSelectionShortcuts(): void {
    render(<App />);
    const firstParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    enterWriterParagraphText(firstParagraph, "Before after");
    firstParagraph.textContent = "Before Xafter";
    placeWriterCaret(firstParagraph, 8);
    fireEvent.input(firstParagraph);
    expect(window.getSelection()?.getRangeAt(0).startOffset).toBe(8);
    expect(window.getSelection()?.isCollapsed).toBe(true);
    fireEvent.keyDown(firstParagraph, { ctrlKey: true, key: "a" });
    expect(window.getSelection()?.toString()).toContain("Before Xafter");
    fireEvent.keyDown(firstParagraph, { metaKey: true, key: "a" });
    expect(window.getSelection()?.toString()).toContain("Before Xafter");
    placeWriterCaret(firstParagraph, "Before Xafter".length);
    fireEvent.keyDown(firstParagraph, { key: "Enter" });
    const secondParagraph = screen.getByRole("textbox", { name: "Writer paragraph 2" });
    enterWriterParagraphText(secondParagraph, "Second paragraph");
    placeWriterCaret(firstParagraph, "Before Xafter".length);
    fireEvent.keyDown(firstParagraph, { key: "ArrowRight" });
    expect(secondParagraph).toHaveFocus();
    expect(window.getSelection()?.getRangeAt(0).startOffset).toBe(0);
    fireEvent.keyDown(secondParagraph, { key: "ArrowLeft" });
    expect(firstParagraph).toHaveFocus();
    expect(window.getSelection()?.getRangeAt(0).startOffset).toBe("Before Xafter".length);
    fireEvent.keyDown(firstParagraph, { key: "ArrowDown" });
    expect(secondParagraph).toHaveFocus();
    placeWriterCaret(secondParagraph, 0);
    fireEvent.keyDown(secondParagraph, { key: "ArrowUp" });
    expect(firstParagraph).toHaveFocus();
    fireEvent.keyDown(secondParagraph, { ctrlKey: true, key: "a" });
    expect(window.getSelection()?.toString()).toContain("Before Xafter");
    expect(window.getSelection()?.toString()).toContain("Second paragraph");
  });

  it("keeps native contenteditable deletion outside React child reconciliation" /**
   * Reproduces Chromium removing a formatted descendant before React commits the corresponding Writer model update.
   * @returns Nothing; the browser-owned DOM deletion and a longer selection replacement commit without NotFoundError or stale text.
   */, function handlesBrowserOwnedFormattedDeletion(): void {
    render(<App />);
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    inputWriterParagraphText(paragraph, "Bold", "insertText");
    const selection = window.getSelection() as Selection;
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    selection.removeAllRanges();
    selection.addRange(range);
    fireEvent.click(screen.getByRole("button", { name: "Bold" }));
    const formattedParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    expect(formattedParagraph.querySelector("strong")).toHaveTextContent("Bold");
    formattedParagraph.querySelector("strong")?.remove();
    expect(
      /** Commits browser-owned descendant removal through React. @returns Nothing; Writer receives the empty text. */ function commitNativeDeletion(): void {
        fireEvent.input(formattedParagraph, { inputType: "deleteContentBackward" });
      },
    ).not.toThrow();
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent("");

    const emptyParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    inputWriterParagraphText(emptyParagraph, "a", "insertText");
    inputWriterParagraphText(emptyParagraph, "longer", "insertText");
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "longer",
    );
  });

  it("groups adjacent typing and deletion at LibreOffice undo boundaries" /**
   * Verifies SwUndoInsert/SwUndoDelete-compatible word, delimiter, and Backspace grouping in the snapshot adapter.
   * @returns Nothing; each Undo restores the preceding semantic input group.
   */, function groupsWriterTypingHistory(): void {
    render(<App />);
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    for (const text of ["a", "ab", "abc", "abc ", "abc d", "abc de", "abc def"])
      inputWriterParagraphText(paragraph, text, "insertText");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(paragraph.textContent).toBe("abc ");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(paragraph).toHaveTextContent("abc");
    inputWriterParagraphText(paragraph, "ab", "deleteContentBackward");
    inputWriterParagraphText(paragraph, "a", "deleteContentBackward");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(paragraph).toHaveTextContent("abc");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(paragraph).toHaveTextContent("");

    for (const text of ["a", "ab", "abc"]) inputWriterParagraphText(paragraph, text, "insertText");
    inputWriterParagraphText(paragraph, "bc", "deleteContentForward", 0);
    inputWriterParagraphText(paragraph, "c", "deleteContentForward", 0);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(paragraph).toHaveTextContent("abc");
    inputWriterParagraphText(paragraph, "ac", "deleteByDrag", 1);
    inputWriterParagraphText(paragraph, "ax c", "insertText", 3);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(paragraph).toHaveTextContent("ac");
  });

  it("creates and focuses an adjacent Writer paragraph through Enter" /** Verifies Enter splits text at a caret, inherits formatting, ignores unsafe modifiers/selections, and retains undo/redo. @returns Nothing; assertions cover the browser-visible paragraph-break flow. */, function createsParagraphThroughEnter(): void {
    render(<App />);

    const firstParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    enterWriterParagraphText(firstParagraph, "Before after");
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "heading-1" } });
    fireEvent.click(screen.getByRole("button", { name: "Align center" }));
    firstParagraph.focus();
    placeWriterCaret(firstParagraph, 0);
    fireEvent.keyDown(firstParagraph, { key: "Backspace" });
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    window.getSelection()?.removeAllRanges();
    fireEvent.keyDown(firstParagraph, { key: "Enter" });
    const getSelection = vi.spyOn(window, "getSelection").mockReturnValue(null);
    fireEvent.keyDown(firstParagraph, { key: "Enter" });
    getSelection.mockRestore();
    const outsideParagraph = document.createElement("p");
    outsideParagraph.textContent = "Outside Writer";
    document.body.append(outsideParagraph);
    placeWriterCaret(outsideParagraph, 1);
    fireEvent.keyDown(firstParagraph, { key: "Enter" });
    outsideParagraph.remove();
    firstParagraph.focus();
    placeWriterCaret(firstParagraph, 7);
    fireEvent.keyDown(firstParagraph, { key: "Enter" });

    const secondParagraph = screen.getByRole("textbox", { name: "Writer paragraph 2" });
    expect(firstParagraph).toHaveTextContent("Before");
    expect(secondParagraph).toHaveTextContent("after");
    expect(secondParagraph).toHaveFocus();
    expect(secondParagraph).toHaveClass("text-2xl", "font-bold");
    expect(secondParagraph).toHaveStyle({ textAlign: "center" });
    expect(screen.getByText("Paragraph 2 is active.")).toBeInTheDocument();
    firstParagraph.focus();
    placeWriterCaret(firstParagraph, 1);
    fireEvent.keyDown(firstParagraph, { key: "Delete" });
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Select All" }));
    expect(window.getSelection()?.toString()).toContain("Before");
    expect(window.getSelection()?.toString()).toContain("after");
    fireEvent.keyDown(secondParagraph, { key: "Escape" });
    fireEvent.keyDown(secondParagraph, { key: "Enter", shiftKey: true });
    fireEvent.keyDown(secondParagraph, { altKey: true, key: "Enter" });
    fireEvent.keyDown(secondParagraph, { ctrlKey: true, key: "Enter" });
    fireEvent.keyDown(secondParagraph, { key: "Enter", metaKey: true });
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.queryByRole("textbox", { name: "Writer paragraph 2" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    const restoredSecondParagraph = screen.getByRole("textbox", { name: "Writer paragraph 2" });
    expect(restoredSecondParagraph).toHaveTextContent("after");
    restoredSecondParagraph.focus();
    placeWriterCaret(restoredSecondParagraph, 0);
    fireEvent.keyDown(restoredSecondParagraph, { key: "Backspace" });
    expect(screen.queryByRole("textbox", { name: "Writer paragraph 2" })).not.toBeInTheDocument();
    expect(firstParagraph).toHaveTextContent("Before after");
    expect(firstParagraph).toHaveFocus();
    expect(window.getSelection()?.getRangeAt(0).startOffset).toBe("Before ".length);
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("textbox", { name: "Writer paragraph 2" })).toHaveTextContent("after");
    firstParagraph.focus();
    placeWriterCaret(firstParagraph, 7);
    fireEvent.keyDown(firstParagraph, { key: "Delete" });
    expect(screen.queryByRole("textbox", { name: "Writer paragraph 2" })).not.toBeInTheDocument();
    expect(firstParagraph).toHaveTextContent("Before after");
    expect(firstParagraph).toHaveFocus();
    placeWriterCaret(firstParagraph, "Before after".length);
    fireEvent.keyDown(firstParagraph, { key: "Delete" });
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(firstParagraph).toHaveTextContent("Before after");
  });

  it("intercepts native Cut and Paste without allowing browser contenteditable mutation" /** Verifies one same-paragraph selection transfers rich MIME data, deletes only after Cut, restores semantic direct formatting on Paste, and remains reversible. @returns Nothing; bounded browser clipboard transitions are asserted. */, function handlesNativeClipboardEditing(): void {
    render(<App />);
    const paragraph = screen.getByRole("textbox", { name: "Writer document text" });
    const emptyCutClipboardData = { getData: vi.fn(), setData: vi.fn() };
    window.getSelection()?.removeAllRanges();
    fireEvent.cut(paragraph, { clipboardData: emptyCutClipboardData });
    expect(emptyCutClipboardData.setData).not.toHaveBeenCalled();
    enterWriterParagraphText(paragraph, "Cut me");
    const selection = window.getSelection() as Selection;
    const cutRange = document.createRange();
    cutRange.selectNodeContents(paragraph);
    selection.removeAllRanges();
    selection.addRange(cutRange);
    const cutClipboardData = { getData: vi.fn(), setData: vi.fn() };
    fireEvent.cut(paragraph, { clipboardData: cutClipboardData });
    expect(cutClipboardData.setData).toHaveBeenNthCalledWith(1, "text/plain", "Cut me");
    expect(cutClipboardData.setData).toHaveBeenNthCalledWith(
      2,
      "text/html",
      expect.stringContaining("Cut me"),
    );
    expect(paragraph).toHaveTextContent("");
    const cutParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    fireEvent.paste(cutParagraph, {
      clipboardData: {
        getData: vi.fn(
          /** Supplies test-owned HTML and plain-text MIME values for native Writer Paste. @param type - Requested clipboard MIME type. @returns Rich Writer markup for HTML or visible plain text otherwise. */
          function getClipboardData(type: string): string {
            return type === "text/html" ? "<strong>Pasted</strong>" : "Pasted";
          },
        ),
      },
    });
    const pastedParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    expect(pastedParagraph).toHaveTextContent("Pasted");
    expect(pastedParagraph.querySelector("strong")).toHaveTextContent("Pasted");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent("");
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    const restoredParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    expect(restoredParagraph.querySelector("strong")).toHaveTextContent("Pasted");
    fireEvent.paste(restoredParagraph, {
      clipboardData: {
        /** Supplies no MIME text for the deterministic empty-Paste feedback branch. @returns Empty clipboard value. */
        getData: (): string => "",
      },
    });
    expect(screen.getByText("Clipboard has no text to paste.")).toBeInTheDocument();
  });
});
