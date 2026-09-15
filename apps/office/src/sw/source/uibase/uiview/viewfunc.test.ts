/** @fileoverview Verifies Writer workbench document and paragraph identity helpers. */

import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import {
  createWriterWorkbenchDocument,
  getActiveWriterParagraph,
  getNextWriterParagraphId,
} from "./viewfunc";

describe("Writer workbench helpers" /** Groups pure identity helpers. @returns Nothing. */, function defineWriterWorkbenchHelperTests(): void {
  it("creates the canonical empty Writer workbench graph" /** Verifies initial identity and body invariants. @returns Nothing. */, function createsWorkbenchDocument(): void {
    const document = createWriterWorkbenchDocument();
    expect(document).not.toHaveProperty("document");
    expect(
      document.paragraphs.map(
        /** Returns a paragraph identity. @param paragraph - Writer paragraph. @returns Its identity. */
        (paragraph) => paragraph.id,
      ),
    ).toEqual(["writer-paragraph-1"]);
  });

  it("generates a non-colliding paragraph identity and resolves stale focus" /** Verifies deterministic identity/focus fallbacks. @returns Nothing. */, function resolvesParagraphs(): void {
    const document = createWriterDocument("writer-paragraph-1");
    document.nodes.MakeTextNode("writer-paragraph-3");
    expect(getNextWriterParagraphId(document)).toBe("writer-paragraph-4");
    expect(getActiveWriterParagraph(document, "writer-paragraph-3")).toBe(document.paragraphs[1]);
    expect(getActiveWriterParagraph(document, "missing")).toBe(document.paragraphs[0]);
  });
});
