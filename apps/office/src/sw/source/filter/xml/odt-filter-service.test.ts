/** @fileoverview Verifies the asynchronous neutral ODT filter contract used inline and in workers. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import { createWriterSnapshot } from "../../core/doc/writer-storage";
import { createWriterDocument, insertWriterText } from "../../core/doc/writer";
import {
  createInlineOdtFilterService,
  normalizeOdtFilterError,
  OdtFilterError,
} from "./odt-filter-service";

/** Creates deterministic Writer metadata. @returns New metadata. */
function metadata() {
  return createDocument({ id: "odt-service", suiteId: "writer", title: "Worker filter" });
}

describe("ODT filter service" /** Groups asynchronous inline filter behavior. @returns Nothing. */, () => {
  it("round-trips a neutral snapshot and reports import/export stages" /** Verifies the same service contract used by the worker runtime. @returns Completion after assertions. */, async () => {
    const service = createInlineOdtFilterService();
    const document = insertWriterText(
      createWriterDocument(metadata(), "p-1"),
      "p-1",
      0,
      "worker body",
    );
    const progress: string[] = [];
    const bytes = await service.Export(createWriterSnapshot(document), {
      onProgress:
        /** Records an export stage. @param stage - Qualified stage. @returns New array length. */ (
          stage,
        ) => progress.push(stage),
    });
    const snapshot = await service.Import(bytes, metadata(), {
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
    expect(snapshot.state.writerDocument).toMatchObject({ textNodes: [{ text: "worker body" }] });
  });

  it("cooperatively cancels, honors AbortSignal, and rejects closed services" /** Covers all inline lifecycle stops. @returns Completion after assertions. */, async () => {
    const service = createInlineOdtFilterService();
    const document = createWriterDocument(metadata(), "p-1");
    const bytes = await service.Export(createWriterSnapshot(document));
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
    await expect(service.Export(createWriterSnapshot(document))).rejects.toMatchObject({
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
