/** @fileoverview Verifies browser edit intent normalization and IME isolation. */

import { describe, expect, it, vi } from "vitest";

import { BrowserWriterEditController } from "./writer-edit-controller";
import { BrowserWriterCompositionAdapter } from "./writer-composition";

describe("BrowserWriterEditController" /** Groups edit-controller behavior. @returns Nothing. */, () => {
  it("sends normalized supported intents to Writer and reports fallback separately" /** Verifies supported, composition, and fallback dispositions. @returns Nothing. */, () => {
    const executeIntent = vi.fn(
      /** Accepts a normalized edit intent. @returns Handled. */ () => true,
    );
    const reportFallback = vi.fn();
    const controller = new BrowserWriterEditController({
      executeIntent,
      reportFallback,
      synchronizeSelection: /** Synchronizes the fixture selection. @returns Available. */ () =>
        true,
    });
    expect(controller.HandleIntent({ data: "x", inputType: "insertText" })).toBe("handled");
    expect(executeIntent).toHaveBeenCalledWith("insertText", "x");
    expect(controller.HandleIntent({ data: "ime", inputType: "insertCompositionText" })).toBe(
      "native-composition",
    );
    controller.ReportFallback("insertTranspose");
    expect(reportFallback).toHaveBeenCalledWith("insertTranspose");
  });

  it("fails safely before execution when selection cannot enter Writer" /** Verifies unavailable selection blocks mutation. @returns Nothing. */, () => {
    const executeIntent = vi.fn(
      /** Accepts a normalized edit intent. @returns Handled. */ () => true,
    );
    const controller = new BrowserWriterEditController({
      executeIntent,
      reportFallback: vi.fn(),
      synchronizeSelection:
        /** Rejects fixture selection synchronization. @returns Unavailable. */ () => false,
    });
    expect(controller.HandleIntent({ data: null, inputType: "deleteContentBackward" })).toBe(
      "unsupported",
    );
    expect(executeIntent).not.toHaveBeenCalled();
  });
});

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
    expect(adapter.ConsumeInput("insertCompositionText")).toBe(true);
    expect(adapter.End("日本")).toBe(true);
    expect(start).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenLastCalledWith("日本");
    expect(end).toHaveBeenCalledTimes(1);
    expect(adapter.ConsumeBeforeInput("insertFromComposition")).toBe(true);
    expect(adapter.ConsumeBeforeInput("insertFromComposition")).toBe(false);
  });
});
