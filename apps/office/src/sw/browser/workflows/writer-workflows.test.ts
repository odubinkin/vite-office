/** @fileoverview Verifies browser command ports delegate transfer policy to Writer. */

import { describe, expect, it, vi } from "vitest";

import { createDocument } from "../../../sfx2/source/doc/objsh";
import { setTestCursor, setTestSelection } from "../../../test/wrtsh-test-helpers";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwDocShell } from "../../source/uibase/app/docsh";
import { SwWrtShell } from "../../source/uibase/wrtsh/wrtsh";
import {
  copyWriterSelection,
  cutWriterSelection,
  pasteWriterClipboard,
  WriterPlatformError,
} from "./writer-workflows";

/** Creates a command shell with one canonical paragraph. @param text - Initial text. @returns Writer shell. */
function createShell(text = ""): SwWrtShell {
  const document = createWriterDocument();
  document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(
    new SwDocShell(
      document,
      createDocument({ id: "transfer-workflow", suiteId: "writer", title: "Transfer" }),
    ),
  );
}

describe("Writer clipboard commands", /** Registers platform-port tests. @returns Nothing. */ function defineTests(): void {
  it("retains a stable browser-platform failure code", /** Checks clipboard failure identity. @returns Nothing. */ function retainsCode(): void {
    expect(
      new WriterPlatformError("storage-unavailable", "Browser storage is unavailable."),
    ).toMatchObject({
      code: "storage-unavailable",
      name: "WriterPlatformError",
    });
  });

  it("rejects Copy and Cut at a collapsed PaM without writing", /** Checks source-owned selection preconditions. @returns Completion after rejection. */ async function rejectsCollapsedSelection(): Promise<void> {
    const shell = createShell("Body");
    const write = vi.fn();
    await expect(copyWriterSelection(shell, write)).rejects.toMatchObject({
      code: "selection-required",
    });
    await expect(cutWriterSelection(shell, write)).rejects.toMatchObject({
      code: "selection-required",
    });
    expect(write).not.toHaveBeenCalled();
    expect(shell.GetActiveParagraph().GetText()).toBe("Body");
  });

  it("deletes only after a successful asynchronous Cut write", /** Checks upstream Copy-before-Delete order and failure atomicity. @returns Completion after both attempts. */ async function cutsAfterWrite(): Promise<void> {
    const shell = createShell("Body");
    setTestSelection(shell, {
      mark: { paragraphId: "p-1", offset: 0 },
      point: { paragraphId: "p-1", offset: 4 },
    });
    await expect(
      cutWriterSelection(
        shell,
        /** Rejects the browser write. @returns Rejected write. */ async function rejectWrite(): Promise<void> {
          throw new Error("denied");
        },
      ),
    ).rejects.toThrow("denied");
    expect(shell.GetActiveParagraph().GetText()).toBe("Body");
    const write = vi.fn(
      /** Confirms deletion has not started before the write resolves. @returns Completed write. */ async function confirmWriteOrder(): Promise<void> {
        expect(shell.GetActiveParagraph().GetText()).toBe("Body");
      },
    );
    await cutWriterSelection(shell, write);
    expect(write).toHaveBeenCalledWith(expect.objectContaining({ plainText: "Body" }));
    expect(shell.GetActiveParagraph().GetText()).toBe("");
    expect(shell.Undo()).toBe(true);
    expect(shell.GetActiveParagraph().GetText()).toBe("Body");
  });

  it("does not cut a different selection after an asynchronous write", /** Checks the selected Writer range remains the transfer target. @returns Completion after rejecting a moved selection. */ async function preservesMovedSelection(): Promise<void> {
    const shell = createShell("Body");
    setTestSelection(shell, {
      mark: { paragraphId: "p-1", offset: 0 },
      point: { paragraphId: "p-1", offset: 4 },
    });
    let release: (() => void) | undefined;
    const pending = new Promise<void>(
      /** Captures the browser write acknowledgement. @param resolve - Completes the write. @returns Nothing. */ (
        resolve,
      ) => {
        release = resolve;
      },
    );
    const cut = cutWriterSelection(
      shell,
      /** Waits for browser acknowledgement. @returns Pending write. */ function writeLater(): Promise<void> {
        return pending;
      },
    );
    setTestCursor(shell, "p-1", 2);
    release?.();
    await expect(cut).rejects.toMatchObject({ code: "selection-required" });
    expect(shell.GetActiveParagraph().GetText()).toBe("Body");
  });

  it("rejects empty browser clipboard data before Writer mutation", /** Checks empty transfer handling. @returns Completion after rejection. */ async function rejectsEmptyPaste(): Promise<void> {
    const shell = createShell("Body");
    await expect(
      pasteWriterClipboard(
        shell,
        /** Returns an empty browser clipboard. @returns Empty MIME pair. */ async function readEmptyClipboard() {
          return { html: "", plainText: "" };
        },
      ),
    ).rejects.toMatchObject({ code: "clipboard-empty" });
    expect(shell.GetActiveParagraph().GetText()).toBe("Body");
  });

  it("converts browser-parsed data through the target Writer pool", /** Checks a menu Paste path. @returns Completion after insertion. */ async function acceptsPaste(): Promise<void> {
    const shell = createShell();
    await pasteWriterClipboard(
      shell,
      /** Returns a rich browser clipboard. @returns Rich MIME pair. */ async function readRichClipboard() {
        return { html: "<strong>Rich</strong>", plainText: "Plain" };
      },
    );
    expect(shell.GetActiveParagraph().GetText()).toBe("Rich");
  });
});
