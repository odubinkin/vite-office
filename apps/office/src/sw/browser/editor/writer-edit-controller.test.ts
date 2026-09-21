/** @fileoverview Verifies browser edit intent normalization and IME isolation. */

import { describe, expect, it, vi } from "vitest";

import { BrowserWriterEditController, type BrowserWriterEditPort } from "./writer-edit-controller";
import { BrowserWriterCompositionAdapter } from "./writer-composition";

describe("BrowserWriterEditController" /** Groups edit-controller behavior. @returns Nothing. */, () => {
  it("sends normalized supported intents to Writer and rejects unsupported intents" /** Verifies supported, composition, and unsupported dispositions. @returns Nothing. */, () => {
    const port = createEditPort();
    const controller = new BrowserWriterEditController(port);
    expect(controller.HandleIntent({ data: "x", inputType: "insertText" })).toBe("handled");
    expect(port.insert).toHaveBeenCalledWith("x");
    expect(controller.HandleIntent({ data: "ime", inputType: "insertCompositionText" })).toBe(
      "native-composition",
    );
    expect(controller.HandleIntent({ data: null, inputType: "insertTranspose" })).toBe(
      "unsupported",
    );
  });

  it("fails safely before execution when selection cannot enter Writer" /** Verifies unavailable selection blocks mutation. @returns Nothing. */, () => {
    const controller = new BrowserWriterEditController({
      ...createEditPort(),
      synchronizeSelection:
        /** Rejects fixture selection synchronization. @returns Unavailable. */ () => false,
    });
    expect(controller.HandleIntent({ data: null, inputType: "deleteContentBackward" })).toBe(
      "unsupported",
    );
  });
});

/** Creates a complete spy-backed Writer operation port. @returns Browser edit port fixture. */
function createEditPort(): BrowserWriterEditPort {
  return {
    deleteForward: vi.fn(/** Deletes forward. @returns Changed. */ () => true),
    deleteLeft: vi.fn(/** Deletes backward. @returns Changed. */ () => true),
    deleteSelection: vi.fn(/** Deletes a selection. @returns Changed. */ () => true),
    insert: vi.fn(/** Inserts text. @returns Changed. */ () => true),
    redo: vi.fn(/** Redoes an edit. @returns Changed. */ () => true),
    replace: vi.fn(/** Replaces a selection. @returns Changed. */ () => true),
    setListKind: vi.fn(/** Sets list kind. @returns Changed. */ () => true),
    splitNode: vi.fn(/** Splits a node. @returns Changed. */ () => true),
    synchronizeSelection: vi.fn(/** Synchronizes selection. @returns Changed. */ () => true),
    toggleCharacterFormat: vi.fn(/** Toggles formatting. @returns Changed. */ () => true),
    undo: vi.fn(/** Undoes an edit. @returns Changed. */ () => true),
  };
}

describe("BrowserWriterCompositionAdapter" /** Groups IME adapter behavior. @returns Nothing. */, () => {
  it("keeps updates transient, commits once, and consumes the trailing input echo" /** Verifies one transient composition transaction. @returns Nothing. */, () => {
    const end = vi.fn(/** Commits fixture composition. @returns Changed. */ () => true);
    const start = vi.fn();
    const update = vi.fn();
    const adapter = new BrowserWriterCompositionAdapter({
      end,
      start,
      synchronizeSelection: /** Synchronizes the fixture selection. @returns Available. */ () =>
        true,
      update,
    });
    adapter.Start();
    adapter.Update("にほ");
    expect(adapter.End("日本")).toBe(true);
    expect(start).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenLastCalledWith("日本");
    expect(end).toHaveBeenCalledTimes(1);
    expect(adapter.ConsumeBeforeInput("insertFromComposition")).toBe(true);
    expect(adapter.ConsumeBeforeInput("insertFromComposition")).toBe(false);
  });
});
