/** @fileoverview Verifies browser-only plain-text clipboard success, fallback, and failure paths. */

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  copyPlainText,
  copyRichText,
  readRichClipboard,
  type BrowserClipboardReadEnvironment,
  type BrowserClipboardEnvironment,
  type BrowserClipboardItemConstructor,
  type BrowserRichClipboardEnvironment,
} from "./browser-clipboard";

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

/** Provides a deterministic ClipboardItem fixture that retains MIME-typed blobs for assertions. */
class ClipboardItemFixture {
  /** MIME-typed blobs provided by the tested rich clipboard adapter. */
  readonly items: Record<string, Blob>;

  /**
   * Creates a fixture rich clipboard item.
   *
   * @param items - MIME-typed blobs supplied by the rich clipboard adapter.
   * @returns A rich ClipboardItem fixture that retains the supplied MIME blobs.
   */
  constructor(items: Record<string, Blob>) {
    this.items = items;
  }
}

/**
 * Creates the browser environment passed to deterministic rich clipboard adapter tests.
 *
 * @param clipboard - Native rich/plain clipboard writer, or undefined when legacy fallback must run.
 * @param clipboardItem - ClipboardItem constructor exposed by the simulated browser, or undefined when rich write is unsupported.
 * @returns Browser capability object with test-owned clipboard boundaries.
 */
function createRichClipboardEnvironment(
  clipboard: Pick<Clipboard, "write" | "writeText"> | undefined,
  clipboardItem: BrowserClipboardItemConstructor | undefined,
): BrowserRichClipboardEnvironment {
  return { Blob: globalThis.Blob, ClipboardItem: clipboardItem, clipboard, document };
}

/**
 * Creates a browser clipboard reader environment for rich Paste adapter tests.
 *
 * @param clipboard - Native browser read capability or no capability when the adapter must reject.
 * @returns Browser-only clipboard read environment with no unrelated DOM dependency.
 */
function createClipboardReadEnvironment(
  clipboard: Pick<Clipboard, "read" | "readText"> | undefined,
): BrowserClipboardReadEnvironment {
  return { clipboard };
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

  it("writes rich HTML and matching plain text through ClipboardItem when supported" /** Verifies rich-capable target editors receive portable inline HTML rather than Tailwind class names. @returns A promise resolved after MIME payload assertions pass. */, async function writesRichClipboardItem(): Promise<void> {
    const write = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    await copyRichText(
      { html: '<p style="font-weight: 700;">Heading</p>', plainText: "Heading" },
      createRichClipboardEnvironment(
        { write, writeText } as unknown as Pick<Clipboard, "write" | "writeText">,
        ClipboardItemFixture as unknown as BrowserClipboardItemConstructor,
      ),
    );
    const clipboardItems = write.mock.calls[0]?.[0] as readonly ClipboardItemFixture[];
    const clipboardItem = clipboardItems[0] as ClipboardItemFixture;
    expect(await clipboardItem.items["text/html"]?.text()).toBe(
      '<p style="font-weight: 700;">Heading</p>',
    );
    expect(await clipboardItem.items["text/plain"]?.text()).toBe("Heading");
    expect(writeText).not.toHaveBeenCalled();
  });

  it("falls back to correct plain text when rich clipboard writing is unsupported or rejected" /** Verifies a rejected rich capability never loses the visible Writer text. @returns A promise resolved after plain-text fallback assertions pass. */, async function fallsBackFromRichClipboard(): Promise<void> {
    const rejectedWrite = vi.fn().mockRejectedValue(new Error("Denied"));
    const rejectedWriteText = vi.fn().mockResolvedValue(undefined);
    await copyRichText(
      { html: "<p>Visible</p>", plainText: "Visible" },
      createRichClipboardEnvironment(
        { write: rejectedWrite, writeText: rejectedWriteText } as unknown as Pick<
          Clipboard,
          "write" | "writeText"
        >,
        ClipboardItemFixture as unknown as BrowserClipboardItemConstructor,
      ),
    );
    const unsupportedWriteText = vi.fn().mockResolvedValue(undefined);
    await copyRichText(
      { html: "<p>Fallback</p>", plainText: "Fallback" },
      createRichClipboardEnvironment(
        { write: vi.fn(), writeText: unsupportedWriteText } as unknown as Pick<
          Clipboard,
          "write" | "writeText"
        >,
        undefined,
      ),
    );
    expect(rejectedWriteText).toHaveBeenCalledWith("Visible");
    expect(unsupportedWriteText).toHaveBeenCalledWith("Fallback");
  });

  it("reads the first text-capable rich clipboard item and falls back to plain text" /** Verifies browser Paste sees both supported MIME representations while rejected rich reads retain plain visible text. @returns A promise resolved after read payloads are asserted. */, async function readsRichClipboard(): Promise<void> {
    const getType = vi.fn(
      /** Returns a deterministic MIME blob for one test clipboard item. @param type - Requested MIME type. @returns Rich or plain visible-text Blob. */
      async function getClipboardType(type: string): Promise<Blob> {
        return new Blob([type === "text/html" ? "<strong>Bold</strong>" : "Bold"], { type });
      },
    );
    await expect(
      readRichClipboard(
        createClipboardReadEnvironment({
          read: vi
            .fn()
            .mockResolvedValue([
              { getType, types: ["text/html", "text/plain"] } as unknown as ClipboardItem,
            ]),
          readText: vi.fn(),
        }),
      ),
    ).resolves.toEqual({ html: "<strong>Bold</strong>", plainText: "Bold" });
    const readText = vi.fn().mockResolvedValue("Plain fallback");
    await expect(
      readRichClipboard(
        createClipboardReadEnvironment({
          read: vi.fn().mockRejectedValue(new Error("Denied")),
          readText,
        }),
      ),
    ).resolves.toEqual({ html: "", plainText: "Plain fallback" });
    await expect(
      readRichClipboard(
        createClipboardReadEnvironment({
          read: vi.fn().mockResolvedValue([{ getType, types: [] } as unknown as ClipboardItem]),
          readText: vi.fn(),
        }),
      ),
    ).resolves.toEqual({ html: "", plainText: "" });
    await expect(readRichClipboard(createClipboardReadEnvironment(undefined))).rejects.toThrow(
      "Browser clipboard read is unavailable.",
    );
  });
});
