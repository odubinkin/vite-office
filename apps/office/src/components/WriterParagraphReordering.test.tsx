/** @fileoverview Verifies contextual Writer paragraph movement, active formatting retention, and undoable browser workbench history. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../App";

/**
 * Replaces one complete document-integrated editable paragraph value in the browser test DOM.
 *
 * @param paragraph - Accessible contenteditable Writer paragraph whose text is replaced.
 * @param text - Complete plain-text body passed to the bounded Writer workbench.
 * @returns Nothing; dispatches a browser input event after updating DOM text.
 */
function enterWriterParagraphText(paragraph: HTMLElement, text: string): void {
  paragraph.textContent = text;
  fireEvent.input(paragraph);
}

describe("Writer paragraph reordering" /** Groups Writer formatting-toolbar movement scenarios. @returns Nothing; Vitest registers cases. */, function defineWriterParagraphReorderingTests(): void {
  it("moves Writer paragraphs through the formatting toolbar and undoable history" /**
   * Verifies the selected paragraph moves across adjacent positions while preserving its text and active formatting target.
   *
   * @returns Nothing; assertions cover visible reordering boundaries and history restoration.
   */, function movesWriterParagraphs(): void {
    render(<App />);

    const firstParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    enterWriterParagraphText(firstParagraph, "First paragraph");
    fireEvent.click(screen.getByRole("button", { name: "Add paragraph" }));
    const secondParagraph = screen.getByRole("textbox", { name: "Writer paragraph 2" });
    enterWriterParagraphText(secondParagraph, "Second paragraph");
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "heading-1" } });
    const paragraphActions = screen.getByLabelText("Paragraph actions");
    expect(screen.getByRole("option", { name: "Move paragraph up" })).toBeEnabled();
    expect(screen.getByRole("option", { name: "Move paragraph down" })).toBeDisabled();
    fireEvent.change(paragraphActions, { target: { value: "none" } });
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "First paragraph",
    );
    fireEvent.change(paragraphActions, { target: { value: "up" } });
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Second paragraph",
    );
    expect(screen.getByRole("textbox", { name: "Writer paragraph 2" })).toHaveTextContent(
      "First paragraph",
    );
    expect(screen.getByLabelText("Paragraph style")).toHaveValue("heading-1");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "First paragraph",
    );
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "Second paragraph",
    );
    expect(screen.getByRole("option", { name: "Move paragraph down" })).toBeEnabled();
    fireEvent.change(paragraphActions, { target: { value: "down" } });
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
      "First paragraph",
    );
  });
});
