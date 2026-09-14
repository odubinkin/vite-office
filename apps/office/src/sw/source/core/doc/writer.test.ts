/** @fileoverview Verifies the thin Writer construction and serialization boundary. */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import {
  createWriterDocument,
  isWriterParagraphAlignment,
  normalizeWriterParagraphFormatting,
  serializeWriterDocument,
  SwDoc,
} from "./writer";

describe("Writer document facade", /** Registers construction and persistence-boundary tests. @returns Nothing. */ function defineWriterFacadeTests(): void {
  it("constructs one canonical SwDoc without defining a second mutation API" /** Verifies the facade owns only construction while model mutation retains object identity. @returns Nothing. */, function constructsCanonicalDocument(): void {
    const metadata = createDocument({ id: "writer-1", suiteId: "writer", title: "Writer" });
    const writer = createWriterDocument(metadata, "p-1");

    expect(writer).toBeInstanceOf(SwDoc);
    expect(writer.document).not.toBe(metadata);
    expect(writer.paragraphs).toMatchObject([{ id: "p-1", text: "" }]);
    expect(isWriterParagraphAlignment("center")).toBe(true);
    expect(isWriterParagraphAlignment("diagonal")).toBe(false);
    expect(
      /** Rejects a blank initial text-node identity. @returns Invalid document. */ () =>
        createWriterDocument(metadata, " "),
    ).toThrow("must not be blank");
  });

  it("round-trips the current snapshot schema and rejects obsolete roots" /** Verifies persistence restoration remains the only document-copy boundary exposed by the facade. @returns Nothing. */, function restoresSnapshots(): void {
    const writer = createWriterDocument(
      createDocument({ id: "writer-1", suiteId: "writer", title: "Writer" }),
      "p-1",
    );
    writer.paragraphs[0]?.InsertText("Body", 0);
    writer.SetModified();
    const snapshot = serializeWriterDocument(writer);
    const restored = normalizeWriterParagraphFormatting(snapshot);

    expect(restored).not.toBe(writer);
    expect(serializeWriterDocument(restored)).toEqual(snapshot);
    expect(normalizeWriterParagraphFormatting(writer)).toBe(writer);
    expect(
      /** Rejects a null persistence root. @returns Invalid document. */ () =>
        normalizeWriterParagraphFormatting(null),
    ).toThrow("invalid");
    expect(
      /** Rejects a retired non-SwDoc schema. @returns Invalid document. */ () =>
        normalizeWriterParagraphFormatting({ document: writer.document, paragraphs: [] }),
    ).toThrow("schema is unsupported");
  });
});
