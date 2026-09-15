/** @fileoverview Verifies direct SwDoc construction and the external persistence codec. */

import { describe, expect, it } from "vitest";

import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/persistence/writer-document-codec";
import { isWriterParagraphAlignment } from "../txtnode/ndtxt";
import { createWriterDocument, SwDoc } from "./doc";

describe("Writer document boundaries", /** Registers construction and persistence-boundary tests. @returns Nothing. */ function defineWriterBoundaryTests(): void {
  it("constructs one canonical SwDoc without defining a second mutation API" /** Verifies the facade owns only construction while model mutation retains object identity. @returns Nothing. */, function constructsCanonicalDocument(): void {
    const writer = createWriterDocument("p-1");

    expect(writer).toBeInstanceOf(SwDoc);
    expect(writer.paragraphs).toMatchObject([{ id: "p-1", text: "" }]);
    expect(isWriterParagraphAlignment("center")).toBe(true);
    expect(isWriterParagraphAlignment("diagonal")).toBe(false);
    expect(
      /** Rejects a blank initial text-node identity. @returns Invalid document. */ () =>
        createWriterDocument(" "),
    ).toThrow("must not be blank");
  });

  it("round-trips the current snapshot schema and rejects obsolete roots" /** Verifies persistence restoration remains the only document-copy boundary exposed by the facade. @returns Nothing. */, function restoresSnapshots(): void {
    const writer = createWriterDocument("p-1");
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
