/** @fileoverview Verifies browser-only plain-text clipboard success, fallback, and failure paths. */

import { afterEach, describe, expect, it, vi } from "vitest";

import { copyPlainText, type BrowserClipboardEnvironment } from "./browser-clipboard";

afterEach(
  /** Restores the legacy document command after each clipboard adapter scenario. @returns Nothing; the temporary test command is removed. */
  function restoreLegacyCopyCommand(): void {
    delete (document as unknown as { execCommand?: unknown }).execCommand;
  },
);

/**
 * Creates the browser environment passed to one deterministic clipboard adapter test.
 *
 * @param clipboard - Native clipboard writer to expose, or undefined when fallback must run.
 * @returns Browser capability object that uses the JSDOM document for local fallback behavior.
 */
function createClipboardEnvironment(
  clipboard: Pick<Clipboard, "writeText"> | undefined,
): BrowserClipboardEnvironment {
  return { clipboard, document };
}

describe("copyPlainText" /** Groups native clipboard and legacy fallback behaviors. @returns Nothing; Vitest registers the enclosed clipboard cases. */, function defineClipboardTests(): void {
  it("writes through the native Clipboard API when available" /** Verifies no legacy DOM fallback runs after a successful asynchronous write. @returns A promise resolved after native clipboard assertions pass. */, async function writesWithNativeClipboard(): Promise<void> {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await copyPlainText("Copied Writer text", createClipboardEnvironment({ writeText }));
    expect(writeText).toHaveBeenCalledWith("Copied Writer text");
  });

  it("falls back when native clipboard writes are denied or unavailable" /** Verifies the local textarea command receives both rejected and absent API cases. @returns A promise resolved after fallback assertions pass. */, async function fallsBackToLegacyCopy(): Promise<void> {
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", { configurable: true, value: execCommand });
    const rejectedClipboard = { writeText: vi.fn().mockRejectedValue(new Error("Denied")) };
    await copyPlainText("Fallback text", createClipboardEnvironment(rejectedClipboard));
    await copyPlainText("No native API", createClipboardEnvironment(undefined));
    expect(execCommand).toHaveBeenCalledTimes(2);
    expect(document.querySelector("textarea")).not.toBeInTheDocument();
  });

  it("rejects when the browser fallback cannot copy" /** Verifies callers can surface a deterministic clipboard failure. @returns A promise resolved after rejection assertions pass. */, async function rejectsOnFallbackFailure(): Promise<void> {
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: vi.fn().mockReturnValue(false),
    });
    await expect(
      copyPlainText("Blocked text", createClipboardEnvironment(undefined)),
    ).rejects.toThrow("Browser clipboard fallback rejected the copy operation.");
  });
});
