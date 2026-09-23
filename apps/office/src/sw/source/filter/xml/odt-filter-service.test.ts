/** @fileoverview Verifies the asynchronous neutral ODT filter contract used inline and in workers. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwPosition } from "../../core/crsr/pam";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh";
import {
  createInlineOdtFilterService,
  createOdtFilterDocument,
  normalizeOdtFilterError,
  OdtFilterError,
} from "./odt-filter-service";
import { createOdtWriterTransfer, restoreOdtWriterTransfer } from "./odt-transfer";

/** Creates deterministic Writer metadata. @returns New metadata. */
function metadata() {
  return createDocument({ id: "odt-service", suiteId: "writer", title: "Worker filter" });
}

describe("ODT filter service" /** Groups asynchronous inline filter behavior. @returns Nothing. */, () => {
  it("round-trips a neutral filter document and reports import/export stages" /** Verifies the same service contract used by the worker runtime. @returns Completion after assertions. */, async () => {
    const service = createInlineOdtFilterService();
    const document = createWriterDocument();
    const shell = new SwDocShell(document, metadata());
    new SwWrtShell(shell).Insert("worker body");
    const progress: string[] = [];
    const bytes = await service.Export(
      createOdtFilterDocument(document, shell.GetDocumentState().title),
      {
        onProgress:
          /** Records an export stage. @param stage - Qualified stage. @returns New array length. */ (
            stage,
          ) => progress.push(stage),
      },
    );
    const imported = await service.Import(bytes, metadata(), {
      onProgress:
        /** Records an import stage. @param stage - Qualified stage. @returns New array length. */ (
          stage,
        ) => progress.push(stage),
    });
    expect(progress).toEqual([
      "export:styles",
      "export:content",
      "export:metadata",
      "export:package",
      "import:package",
      "import:package",
      "import:package",
      "import:manifest",
      "import:manifest",
      "import:styles",
      "import:styles",
      "import:content",
      "import:content",
      "import:metadata",
      "import:metadata",
      "import:mapping",
    ]);
    expect(imported.document).toMatchObject({
      graph: { swModelVersion: 13, textNodes: [{ hints: [], text: "worker body" }] },
      transferVersion: 4,
    });
    expect(imported.document).not.toHaveProperty("document");
  });

  it("cooperatively cancels, honors AbortSignal, and rejects closed services" /** Covers all inline lifecycle stops. @returns Completion after assertions. */, async () => {
    const service = createInlineOdtFilterService();
    const document = createWriterDocument();
    const state = metadata();
    const bytes = await service.Export(createOdtFilterDocument(document, state.title));
    await expect(
      service.Import(bytes, metadata(), {
        onProgress:
          /** Cancels at the first parsed style stage. @param stage - Qualified stage. @returns Nothing. */ (
            stage,
          ) => {
            if (stage === "import:styles") service.Cancel();
          },
      }),
    ).rejects.toMatchObject({ category: "cancelled" });
    const abort = new AbortController();
    abort.abort();
    await expect(service.Import(bytes, metadata(), { signal: abort.signal })).rejects.toMatchObject(
      {
        category: "cancelled",
      },
    );
    await expect(service.Export({} as Parameters<typeof service.Export>[0])).rejects.toMatchObject({
      category: "format",
    });
    service.Close();
    await expect(
      service.Export(createOdtFilterDocument(document, state.title)),
    ).rejects.toMatchObject({
      category: "internal",
    });
  });

  it("normalizes legacy filter errors into stable categories" /** Verifies worker-safe error classification. @returns Nothing. */, () => {
    const typed = new OdtFilterError("protocol", "typed");
    expect(normalizeOdtFilterError(typed)).toBe(typed);
    expect(normalizeOdtFilterError(new Error("archive exceeds limit"))).toMatchObject({
      category: "resource",
    });
    expect(normalizeOdtFilterError(new Error("Unsupported property"))).toMatchObject({
      category: "unsupported",
    });
    expect(normalizeOdtFilterError(new Error("broken package"))).toMatchObject({
      category: "format",
    });
    expect(normalizeOdtFilterError("plain failure")).toMatchObject({
      category: "format",
      message: "plain failure",
    });
  });

  it("rejects malformed ODT worker transfers without migration" /** Verifies the worker boundary accepts only its current envelope. @returns Nothing. */, () => {
    for (const transfer of [
      null,
      [],
      {},
      { transferVersion: 1 },
      { transferVersion: 2 },
      { document: {}, transferVersion: 4 },
    ])
      expect(
        /** Restores one malformed worker transfer. @returns Invalid result. */ () =>
          restoreOdtWriterTransfer(transfer),
      ).toThrow("schema is unsupported");
  });

  it("owns and validates a rich worker graph independently from durable storage" /** Covers worker-only styles, items, numbering, and both hint variants. @returns Nothing. */, () => {
    const document = createWriterDocument();
    const shell = new SwDocShell(document, metadata());
    const editing = new SwWrtShell(shell);
    editing.Insert("linked text");
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer fixture paragraph is missing.");
    paragraph.SetParagraphAlignment("right");
    editing.SetParagraphStyle("heading-1");
    editing.SetParagraphListKind("bullet");
    editing.SetPaM(new SwPosition(paragraph, 6), new SwPosition(paragraph, 0));
    editing.SetHyperlink({ targetFrame: "_blank", url: "https://example.test" });
    editing.ToggleCharacterFormat("bold");
    const transfer = createOdtWriterTransfer(document);
    const restored = restoreOdtWriterTransfer(transfer);
    expect(createOdtWriterTransfer(restored)).toEqual(transfer);

    expect(
      /** Restores a malformed graph. @returns Invalid result. */ () =>
        restoreOdtWriterTransfer({ graph: {}, transferVersion: 4 }),
    ).toThrow("document schema is unsupported");
    expect(
      /** Restores a graph without a body node. @returns Invalid result. */ () =>
        restoreOdtWriterTransfer({
          ...transfer,
          graph: { ...transfer.graph, textNodes: [] },
        }),
    ).toThrow("has no body text node");
    expect(
      /** Restores an invalid paragraph collection identity. @returns Invalid result. */ () =>
        restoreOdtWriterTransfer({
          ...transfer,
          graph: {
            ...transfer.graph,
            textFormatCollections: transfer.graph.textFormatCollections.map(
              /** Corrupts only the first style identity. @param style - Encoded style. @param index - Style index. @returns Original or corrupted style. */ (
                style,
                index,
              ) => (index === 0 ? { ...style, id: "invalid-style" } : style),
            ),
          },
        }),
    ).toThrow("style is invalid");
    expect(
      /** Restores an invalid text-node collection identity. @returns Invalid result. */ () =>
        restoreOdtWriterTransfer({
          ...transfer,
          graph: {
            ...transfer.graph,
            textNodes: transfer.graph.textNodes.map(
              /** Corrupts only the first node style identity. @param node - Encoded text node. @param index - Node index. @returns Original or corrupted node. */ (
                node,
                index,
              ) => (index === 0 ? { ...node, formatCollId: "invalid-style" } : node),
            ),
          },
        }),
    ).toThrow("paragraph style is invalid");
  });
});
