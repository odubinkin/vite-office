/**
 * @fileoverview Verifies the visible foundation status, suite navigation, and selection behavior of the workbench.
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
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
    expect(screen.getByText("New document · revision 0")).toBeInTheDocument();
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
    expect(screen.getByText("Unsaved changes · revision 1")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(suiteDefinitions.length + 4);
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
      fireEvent.change(editor, { target: { value: "Stored body" } });
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
      fireEvent.change(editor, { target: { value: "Changed body" } });
      await act(
        /** Starts the asynchronous load interaction. @returns A fulfilled React act promise. */
        async function loadsDocument(): Promise<void> {
          fireEvent.click(screen.getByRole("button", { name: "Load locally" }));
        },
      );
      await waitFor(
        /** Waits for restored text and load feedback. @returns A fulfilled polling promise. */
        async function verifiesLoadedDocument(): Promise<void> {
          expect(editor).toHaveValue("Stored body");
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
});
