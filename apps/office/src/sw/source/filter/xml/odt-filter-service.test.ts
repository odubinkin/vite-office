/** @fileoverview Verifies the asynchronous neutral ODT filter contract used inline and in workers. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh";
import {
  createInlineOdtFilterService,
  createOdtFilterDocument,
  normalizeOdtFilterError,
  OdtFilterError,
} from "./odt-filter-service";

/** Creates deterministic Writer metadata. @returns New metadata. */
function metadata() {
  return createDocument({ id: "odt-service", suiteId: "writer", title: "Worker filter" });
}

describe("ODT filter service" /** Groups asynchronous inline filter behavior. @returns Nothing. */, () => {
  it("round-trips a neutral filter document and reports import/export stages" /** Verifies the same service contract used by the worker runtime. @returns Completion after assertions. */, async () => {
    const service = createInlineOdtFilterService();
    const document = createWriterDocument("p-1");
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
      textNodes: [{ hints: [], text: "worker body" }],
    });
  });

  it("cooperatively cancels, honors AbortSignal, and rejects closed services" /** Covers all inline lifecycle stops. @returns Completion after assertions. */, async () => {
    const service = createInlineOdtFilterService();
    const document = createWriterDocument("p-1");
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
});
