/** @fileoverview Verifies that Writer transfer serialization is model-owned. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "../wrtsh/wrtsh";

describe("SwTransferable", /** Groups model-owned transfer tests. @returns Nothing. */ function defineWriterTransferableTests(): void {
  it("serializes only SwPaM model data even when rendered DOM disagrees", /** Verifies rendered descendants cannot forge clipboard output. @returns Nothing. */ function ignoresRenderedDom(): void {
    const model = createWriterDocument("p-1");
    model.paragraphs[0]?.InsertText("model text", 0);
    const shell = new SwWrtShell(
      new SwDocShell(
        model,
        createDocument({ id: "transfer", suiteId: "writer", title: "Transfer" }),
      ),
    );
    shell.SetSelection({
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 5, paragraphId: "p-1" },
    });
    document.body.innerHTML = '<p data-writer-paragraph-id="p-1">forged DOM</p>';
    expect(shell.CreateTransferable().CreateSelection()).toMatchObject({ plainText: "model" });
  });
});
