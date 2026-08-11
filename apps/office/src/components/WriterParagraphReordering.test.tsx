/** @fileoverview Verifies contextual Writer paragraph movement, active formatting retention, and undoable browser workbench history. */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "../App";

describe("Writer paragraph reordering" /** Groups visible Writer paragraph movement scenarios. @returns Nothing; Vitest registers cases. */, function defineWriterParagraphReorderingTests(): void {
  it("moves Writer paragraphs through contextual controls and undoable history" /**
   * Verifies the selected paragraph moves across adjacent positions while preserving its text and active formatting target.
   *
   * @returns Nothing; assertions cover visible reordering boundaries and history restoration.
   */, function movesWriterParagraphs(): void {
    render(<App />);

    const firstParagraph = screen.getByRole("textbox", { name: "Writer document text" });
    fireEvent.change(firstParagraph, { target: { value: "First paragraph" } });
    fireEvent.click(screen.getByRole("button", { name: "Add paragraph" }));
    const secondParagraph = screen.getByRole("textbox", { name: "Writer paragraph 2" });
    fireEvent.change(secondParagraph, { target: { value: "Second paragraph" } });
    fireEvent.change(screen.getByLabelText("Paragraph style"), { target: { value: "heading-1" } });
    expect(screen.getByRole("button", { name: "Move paragraph 1 up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move paragraph 2 down" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Move paragraph 2 up" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveValue(
      "Second paragraph",
    );
    expect(screen.getByRole("textbox", { name: "Writer paragraph 2" })).toHaveValue(
      "First paragraph",
    );
    expect(screen.getByLabelText("Paragraph style")).toHaveValue("heading-1");
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveValue(
      "First paragraph",
    );
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveValue(
      "Second paragraph",
    );
    fireEvent.click(screen.getByRole("button", { name: "Move paragraph 1 down" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveValue(
      "First paragraph",
    );
  });
});
