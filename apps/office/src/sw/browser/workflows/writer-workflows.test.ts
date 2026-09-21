/** @fileoverview Verifies explicit Writer browser-platform failures. */

import { describe, expect, it, vi } from "vitest";

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
});
