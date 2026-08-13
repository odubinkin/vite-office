/** @fileoverview Verifies pure Writer workbench paragraph identity generation and focus fallback behavior. */

import { describe, expect, it } from "vitest";

import {
  appendWriterParagraph,
  createWriterDocument,
  type WriterDocument,
} from "../../core/doc/writer";
import { createDocument } from "../../../../sfx2/source/doc/document";
import { getActiveWriterParagraph, getNextWriterParagraphId } from "./viewfunc";

/** Creates a two-paragraph Writer fixture whose identities expose a generated-ID collision. @returns Immutable Writer fixture. */
function createWriterFixture(): WriterDocument {
  return appendWriterParagraph(
    createWriterDocument(
      createDocument({ id: "writer-workbench", suiteId: "writer", title: "Writer" }),
      "writer-paragraph-1",
    ),
    "writer-paragraph-3",
  );
}

describe("Writer workbench helpers" /** Groups pure focus and generated-ID helper tests. @returns Nothing; Vitest registers cases. */, function defineWriterWorkbenchHelperTests(): void {
  it("generates a non-colliding identity after the current body-length suffix" /** Verifies an occupied generated suffix is skipped deterministically. @returns Nothing; assertions validate identity generation. */, function generatesParagraphId(): void {
    expect(getNextWriterParagraphId(createWriterFixture())).toBe("writer-paragraph-4");
  });

  it("uses the focused paragraph when it exists and the first paragraph after history makes it stale" /** Verifies formatting has a stable deterministic target across current and stale focus identities. @returns Nothing; assertions validate reference selection. */, function resolvesFocusedParagraph(): void {
    const writerDocument = createWriterFixture();

    expect(getActiveWriterParagraph(writerDocument, "writer-paragraph-3")).toBe(
      writerDocument.paragraphs[1],
    );
    expect(getActiveWriterParagraph(writerDocument, "removed-paragraph")).toBe(
      writerDocument.paragraphs[0],
    );
  });
});
