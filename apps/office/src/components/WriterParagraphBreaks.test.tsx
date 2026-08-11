/** @fileoverview Verifies browser-visible Enter paragraph breaks in the integrated Writer document canvas. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { App } from "../App";

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
  });
});
