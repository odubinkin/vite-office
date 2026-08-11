/**
 * @fileoverview Verifies the visible foundation status, suite navigation, and selection behavior of the workbench.
 */

import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { IDBFactory } from "fake-indexeddb";
import { describe, expect, it, vi } from "vitest";

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
    expect(screen.getAllByRole("button")).toHaveLength(suiteDefinitions.length + 5);
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

    fireEvent.change(screen.getByRole("textbox", { name: "Writer document text" }), {
      target: { value: "Retained Writer body" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Calc, Foundation only" }));
    fireEvent.keyDown(window, { ctrlKey: true, key: "z" });
    expect(screen.queryByRole("textbox", { name: "Writer document text" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Writer, Foundation only" }));
    expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveValue(
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

  it("starts a plain-text download and reports adapter failures" /**
   * Verifies the user-visible result for successful and rejected browser download capabilities.
   * @returns Nothing; assertions validate both synchronous outcomes.
   */, function downloadsWriterText(): void {
    const createObjectUrl = vi.fn(
      /** Produces the deterministic test object URL. @returns Fixed object URL. */
      function createObjectUrl(): string {
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
    fireEvent.change(screen.getByRole("textbox", { name: "Writer document text" }), {
      target: { value: "Download body" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Download text" }));
    expect(screen.getByText("Plain-text download started.")).toBeInTheDocument();
    createObjectUrl.mockImplementationOnce(
      /** Simulates unsupported browser object URL creation. @returns No URL because this call throws. */
      function rejectsObjectUrl(): string {
        throw new Error("unsupported");
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Download text" }));
    expect(screen.getByText("Could not start plain-text download.")).toBeInTheDocument();
    click.mockRestore();
  });
});
