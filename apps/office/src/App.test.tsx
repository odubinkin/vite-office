/**
 * @fileoverview Verifies the visible foundation status, suite navigation, and selection behavior of the workbench.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";
import { suiteDefinitions } from "./domain/suites";

describe("App" /**
 * Groups user-observable workbench foundation tests.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineAppTests(): void {
  it("renders the Writer plain-text editor and updates its immutable lifecycle feedback" /**
   * Verifies the accessible editor starts clean, replaces its sole paragraph, and reports dirty state.
   *
   * @returns Nothing; assertions describe the rendered static shell.
   */, function verifyWriterEditing(): void {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Browser workbench foundation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Plain-text editing enabled")).toBeInTheDocument();
    expect(screen.getByText("Static frontend")).toBeInTheDocument();
    expect(
      screen.getByText(/Untitled Writer Document is a serializable new document/),
    ).toBeInTheDocument();
    const editor = screen.getByRole("textbox", { name: "Writer document text" });
    const undoButton = screen.getByRole("button", { name: "Undo" });
    const redoButton = screen.getByRole("button", { name: "Redo" });
    expect(editor).toHaveValue("");
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
    fireEvent.keyDown(window, { ctrlKey: true, key: "z" });
    expect(screen.getByRole("status")).toHaveTextContent("New document · revision 0");
    fireEvent.change(editor, { target: { value: "A browser-authored paragraph." } });
    expect(editor).toHaveValue("A browser-authored paragraph.");
    expect(undoButton).toBeEnabled();
    fireEvent.keyDown(window, { ctrlKey: true, key: "z" });
    expect(editor).toHaveValue("");
    fireEvent.keyDown(window, { ctrlKey: true, key: "z", shiftKey: true });
    expect(editor).toHaveValue("A browser-authored paragraph.");
    fireEvent.keyDown(window, { key: "z", metaKey: true });
    expect(editor).toHaveValue("");
    fireEvent.keyDown(window, { key: "z", metaKey: true, shiftKey: true });
    expect(editor).toHaveValue("A browser-authored paragraph.");
    fireEvent.keyDown(window, { key: "x" });
    fireEvent.keyDown(window, { key: "Shift" });
    fireEvent.click(undoButton);
    expect(editor).toHaveValue("");
    expect(redoButton).toBeEnabled();
    fireEvent.click(redoButton);
    expect(editor).toHaveValue("A browser-authored paragraph.");
    fireEvent.click(undoButton);
    fireEvent.change(editor, { target: { value: "A branched paragraph." } });
    expect(redoButton).toBeDisabled();
    fireEvent.change(editor, { target: { value: "A branched paragraph." } });
    expect(screen.getByRole("status")).toHaveTextContent("Unsaved changes · revision 1");
    expect(screen.getAllByRole("button")).toHaveLength(suiteDefinitions.length + 2);
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
});
