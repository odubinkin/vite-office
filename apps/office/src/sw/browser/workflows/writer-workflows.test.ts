/** @fileoverview Verifies explicit Writer browser-platform failures. */

import { describe, expect, it, vi } from "vitest";

import { createWriterDocument } from "../../source/core/doc/doc";
import type { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh";
import { WriterClipboardWorkflowController, WriterPlatformError } from "./writer-workflows";

describe("WriterPlatformError", /** Registers platform-error tests. @returns Nothing. */ function definePlatformErrorTests(): void {
  it("retains a stable machine-readable code for Sfx command completion", /** Verifies stable failure identity. @returns Nothing. */ function retainsCode(): void {
    const error = new WriterPlatformError("storage-unavailable", "Browser storage is unavailable.");
    expect(error).toMatchObject({
      code: "storage-unavailable",
      message: "Browser storage is unavailable.",
      name: "WriterPlatformError",
    });
  });

  it("rejects a browser-handled Cut when the canonical SwPaM is collapsed", /** Verifies model deletion remains authoritative after native transfer handling. @returns Completion after rejection. */ async function rejectsCollapsedHandledCut(): Promise<void> {
    const controller = new WriterClipboardWorkflowController(
      {
        CreateTransferable: vi.fn(),
        DeleteSelection: /** Represents a collapsed persistent cursor. @returns False. */ () =>
          false,
      } as unknown as SwWrtShell,
      { copyRichText: vi.fn(), readRichClipboard: vi.fn() },
    );
    await expect(controller.Cut({ clipboardHandled: true })).rejects.toMatchObject({
      code: "selection-required",
    });
  });

  it("rejects Copy when the canonical SwPaM is collapsed", /** Verifies Copy requires a persistent Writer selection. @returns Completion after rejection. */ async function rejectsCollapsedCopy(): Promise<void> {
    const controller = new WriterClipboardWorkflowController(
      {
        CreateTransferable: vi.fn(
          /** Creates an empty transferable. @returns Transferable without a selection. */ () => ({
            CreateSelection:
              /** Reports the collapsed selection. @returns No transferable selection. */ () =>
                undefined,
          }),
        ),
      } as unknown as SwWrtShell,
      { copyRichText: vi.fn(), readRichClipboard: vi.fn() },
    );
    await expect(controller.Copy()).rejects.toMatchObject({ code: "selection-required" });
  });

  it("rejects empty browser clipboard payloads before Writer mutation", /** Verifies browser paste adaptation fails before calling the shell. @returns Completion after rejection. */ async function rejectsEmptyPaste(): Promise<void> {
    const shell = { PasteAtCursor: vi.fn() } as unknown as SwWrtShell;
    const controller = new WriterClipboardWorkflowController(shell, {
      copyRichText: vi.fn(),
      readRichClipboard: vi.fn(
        /** Returns an empty clipboard payload. @returns Empty rich/plain values. */ async () => ({
          html: "",
          plainText: "",
        }),
      ),
    });
    await expect(controller.Paste()).rejects.toMatchObject({ code: "clipboard-empty" });
    await expect(controller.Paste({ clipboardHandled: true })).rejects.toMatchObject({
      code: "clipboard-empty",
    });
    expect(shell.PasteAtCursor).not.toHaveBeenCalled();
  });

  it("accepts a browser-parsed paste supplied by the native edit window", /** Verifies the already-read clipboard branch converts through the target pool. @returns Completion after insertion. */ async function acceptsNativePaste(): Promise<void> {
    const paragraph = createWriterDocument().paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer paste fixture has no paragraph.");
    const pasteAtCursor = vi.fn();
    const controller = new WriterClipboardWorkflowController(
      {
        GetActiveParagraph: /** Returns the target pool owner. @returns Fixture paragraph. */ () =>
          paragraph,
        PasteAtCursor: pasteAtCursor,
      } as unknown as SwWrtShell,
      { copyRichText: vi.fn(), readRichClipboard: vi.fn() },
    );
    await controller.Paste({
      paste: {
        isBlock: false,
        paragraphs: [{ listKind: "none", listLevel: 0, runs: [{ attributes: {}, text: "x" }] }],
        source: "plain-text",
      },
    });
    expect(pasteAtCursor).toHaveBeenCalledOnce();
  });
});
