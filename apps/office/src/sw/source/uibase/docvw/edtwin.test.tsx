/** @fileoverview Verifies browser-visible Enter paragraph breaks in the integrated Writer document canvas. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../../../../framework/source/services/App";

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

describe("Writer paragraph breaks" /** Groups native Enter interaction and guarded browser-selection behavior. @returns Nothing; Vitest registers the enclosed case. */, function defineWriterParagraphBreakTests(): void {
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
});
