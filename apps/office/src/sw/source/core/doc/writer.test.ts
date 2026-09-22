/** @fileoverview Verifies direct SwDoc construction and the external persistence codec. */

import { describe, expect, it } from "vitest";

import { decodeWriterDocument, encodeWriterDocument } from "./writer-document-codec";
import { isWriterParagraphAlignment } from "../txtnode/ndtxt";
import { createWriterDocument, SwDoc } from "./doc";

describe("Writer document boundaries", /** Registers construction and persistence-boundary tests. @returns Nothing. */ function defineWriterBoundaryTests(): void {
  it("constructs one canonical SwDoc without defining a second mutation API" /** Verifies the facade owns only construction while model mutation retains object identity. @returns Nothing. */, function constructsCanonicalDocument(): void {
    const writer = createWriterDocument();

    expect(writer).toBeInstanceOf(SwDoc);
    expect(writer.paragraphs).toHaveLength(1);
    expect(writer.paragraphs[0]?.GetText()).toBe("");
    expect(isWriterParagraphAlignment("center")).toBe(true);
    expect(isWriterParagraphAlignment("diagonal")).toBe(false);
  });

  it("round-trips the current snapshot schema and rejects obsolete roots" /** Verifies persistence restoration remains the only document-copy boundary exposed by the facade. @returns Nothing. */, function restoresSnapshots(): void {
    const writer = createWriterDocument();
    writer.paragraphs[0]?.InsertText("Body", 0);
    const snapshot = encodeWriterDocument(writer);
    const restored = decodeWriterDocument(snapshot);

    expect(restored).not.toBe(writer);
    expect(encodeWriterDocument(restored)).toEqual(snapshot);
    expect(
      /** Rejects a null persistence root. @returns Invalid document. */ () =>
        decodeWriterDocument(null),
    ).toThrow("schema is unsupported");
    expect(
      /** Rejects a retired non-SwDoc schema. @returns Invalid document. */ () =>
        decodeWriterDocument({ document: {}, paragraphs: [] }),
    ).toThrow("schema is unsupported");
  });
});
