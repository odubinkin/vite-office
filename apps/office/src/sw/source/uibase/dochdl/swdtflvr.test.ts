/** @fileoverview Verifies that Writer transfer serialization is model-owned. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwPosition } from "../../core/crsr/pam";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh1";
import { WriterTransferError } from "./swdtflvr";
import { setTestSelection } from "../../../../test/wrtsh-test-helpers";

describe("SwTransferable", /** Groups model-owned transfer tests. @returns Nothing. */ function defineWriterTransferableTests(): void {
  it("serializes only SwPaM model data even when rendered DOM disagrees", /** Verifies rendered descendants cannot forge clipboard output. @returns Nothing. */ function ignoresRenderedDom(): void {
    const model = createWriterDocument();
    model.paragraphs[0]?.InsertText("model text", 0);
    const shell = new SwWrtShell(
      new SwDocShell(
        model,
        createDocument({ id: "transfer", suiteId: "writer", title: "Transfer" }),
      ),
    );
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 5, paragraphId: "p-1" },
    });
    document.body.innerHTML = '<p data-writer-paragraph-id="p-1">forged DOM</p>';
    expect(shell.CreateTransferable().CreateSelection()).toMatchObject({ plainText: "model" });
  });

  it("ignores a selection whose nodes are outside the active document", /** Checks stale transfer endpoints. @returns Nothing. */ () => {
    const active = createWriterDocument();
    const foreign = createWriterDocument();
    foreign.paragraphs[0]?.SetText("Foreign");
    const shell = new SwWrtShell(
      new SwDocShell(active, createDocument({ id: "active", suiteId: "writer", title: "Active" })),
    );
    const node = foreign.paragraphs[0];
    if (node === undefined) throw new Error("Missing foreign node.");
    shell.GetCursor().Assign(new SwPosition(node, 0), new SwPosition(node, 2));
    expect(shell.CreateTransferable().CreateSelection()).toBeUndefined();
  });

  it("keeps selected content when transfer writing fails or the selection changes", /** Verifies upstream copy-before-delete and persistent PaM ownership. @returns Test completion. */ async () => {
    const model = createWriterDocument();
    const paragraph = model.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing Writer paragraph.");
    paragraph.SetText("Writer text");
    const shell = new SwWrtShell(
      new SwDocShell(model, createDocument({ id: "cut", suiteId: "writer", title: "Cut" })),
    );
    const transfer = shell.CreateTransferable();
    expect(
      /** Copies without a selection. @returns Nothing. */ () =>
        transfer.Copy(/** Accepts a copied selection. @returns Nothing. */ () => undefined),
    ).toThrow(WriterTransferError);
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 6, paragraphId: "p-1" },
    });
    expect(
      /** Rejects a failed synchronous clipboard write. @returns Nothing. */ () =>
        transfer.Cut(
          /** Simulates a failed platform write. @returns Nothing. */ () => {
            throw new Error("clipboard unavailable");
          },
        ),
    ).toThrow("clipboard unavailable");
    expect(paragraph.GetText()).toBe("Writer text");
    await expect(
      transfer.Cut(
        /** Simulates a rejected asynchronous clipboard write. @returns Rejected write. */ () =>
          Promise.reject(new Error("clipboard denied")),
      ),
    ).rejects.toThrow("clipboard denied");
    expect(paragraph.GetText()).toBe("Writer text");
    let completeWrite: (() => void) | undefined;
    const pending = transfer.Cut(
      /** Delays the platform write until the selection changes. @returns Pending write. */ () =>
        new Promise<void>(
          /** Exposes transfer completion. @param resolve - Promise resolver. @returns Nothing. */ (
            resolve,
          ): void => {
            completeWrite = resolve;
          },
        ),
    );
    setTestSelection(shell, {
      mark: { offset: 7, paragraphId: "p-1" },
      point: { offset: 11, paragraphId: "p-1" },
    });
    completeWrite?.();
    await expect(pending).rejects.toThrow(WriterTransferError);
    expect(paragraph.GetText()).toBe("Writer text");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 6, paragraphId: "p-1" },
    });
    await transfer.Cut(
      /** Accepts the asynchronous clipboard write. @returns Completed write. */ () =>
        Promise.resolve(),
    );
    expect(paragraph.GetText()).toBe(" text");
  });

  it("retains hyperlinks in rich transfer and applies imported hints at the Writer target", /** Checks native link and target-pool semantics. @returns Nothing. */ function transfersHyperlinks(): void {
    const model = createWriterDocument();
    const paragraph = model.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing Writer paragraph.");
    paragraph.InsertText("Link", 0);
    paragraph.SetHyperlink(0, 4, { url: "https://example.com" });
    const shell = new SwWrtShell(
      new SwDocShell(
        model,
        createDocument({ id: "link-transfer", suiteId: "writer", title: "Transfer" }),
      ),
    );
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 4, paragraphId: "p-1" },
    });
    expect(shell.CreateTransferable().CreateSelection()?.html).toContain(
      '<a href="https://example.com">Link</a>',
    );
    shell.SelectAll();
    expect(
      shell.CreateTransferable().Paste({
        isBlock: false,
        paragraphs: [
          {
            listKind: "none",
            listLevel: 0,
            runs: [
              {
                attributes: { bold: false, italic: false, underline: false },
                hyperlink: { url: "https://example.org" },
                text: "New",
              },
            ],
          },
        ],
      }),
    ).toBe(true);
    expect(paragraph.GetText()).toBe("New");
    expect(projectWriterTextRuns(paragraph)[0]?.hyperlink?.url).toBe("https://example.org");
    expect(shell.Undo()).toBe(true);
    expect(paragraph.GetText()).toBe("Link");
  });
});
