/** @fileoverview Verifies model-owned Writer clipboard transfer from a canonical shell selection. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh1";
import {
  fixtureSplitParagraph,
  setTestCursor,
  setTestSelection,
} from "../../../../test/wrtsh-test-helpers";

/** Creates a Writer shell with one stable paragraph. @param text - Optional initial paragraph text. @returns Shell fixture. */
function createShell(text = ""): SwWrtShell {
  const document = createWriterDocument();
  const documentState = createDocument({
    id: "input-document",
    suiteId: "writer",
    title: "Input document",
  });
  if (text.length > 0) document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(new SwDocShell(document, documentState));
}

describe("Writer shell clipboard transfer", /** Registers model transfer tests. @returns Nothing. */ function defineWriterShellTransferTests(): void {
  it("creates clipboard transfer data from the shell SwPaM without rendered DOM", /** Verifies model-owned transfer serialization. @returns Nothing. */ function createsModelTransfer(): void {
    const shell = createShell("alpha beta");
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 5, paragraphId: "p-1" },
    });
    shell.ToggleCharacterFormat("bold");
    shell.ToggleCharacterFormat("italic");
    shell.ToggleCharacterFormat("underline");
    shell.SetFontFamily("Noto Serif");
    const transfer = shell.CreateTransferable().CreateSelection();
    expect(transfer).toEqual({
      html: expect.stringContaining(
        '<span style="text-decoration: underline; font-family: Noto Serif"><em><strong>alpha</strong></em></span>',
      ),
      plainText: "alpha",
    });
    setTestSelection(shell, {
      mark: { offset: 5, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(shell.CreateTransferable().CreateSelection()?.plainText).toBe("alpha");
    setTestCursor(shell, "p-1", 5);
    expect(shell.CreateTransferable().CreateSelection()).toBeUndefined();

    const multiParagraph = createShell("firstsecond");
    const secondId = fixtureSplitParagraph(multiParagraph, "p-1", 5);
    setTestCursor(multiParagraph, "p-1", 0);
    multiParagraph.SetParagraphListKind("bullet");
    setTestCursor(multiParagraph, secondId, 0);
    multiParagraph.SetParagraphListKind("numbered");
    setTestSelection(multiParagraph, {
      mark: { offset: 6, paragraphId: secondId },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(multiParagraph.CreateTransferable().CreateSelection()).toMatchObject({
      plainText: expect.stringContaining("first"),
    });

    const emptyParagraphs = createShell();
    const emptySecondId = fixtureSplitParagraph(emptyParagraphs, "p-1", 0);
    setTestSelection(emptyParagraphs, {
      mark: { offset: 0, paragraphId: emptySecondId },
      point: { offset: 0, paragraphId: "p-1" },
    });
    const emptyTransfer = emptyParagraphs.CreateTransferable();
    expect(emptyTransfer.CreateSelection()).toMatchObject({
      html: expect.stringContaining("<p"),
      plainText: "\n",
    });
    let copied = "";
    emptyTransfer.Cut(
      /** Captures a paragraph-break-only clipboard payload. @param selection - Writer selection. @returns Nothing. */ (
        selection,
      ) => {
        copied = selection.plainText;
      },
    );
    expect(copied).toBe("\n");
    expect(emptyParagraphs.GetDoc().paragraphs).toHaveLength(1);
    setTestSelection(emptyParagraphs, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: "p-1" },
    });
    expect(emptyParagraphs.CreateTransferable().CreateSelection()).toBeUndefined();
  });
});
