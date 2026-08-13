/** @fileoverview Verifies browser-visible Writer list marker calculation at the `number.cxx`-derived document boundary. */

import { describe, expect, it } from "vitest";

import { getWriterParagraphListMarker, type WriterNumberingParagraph } from "./number";

/** Provides a compact immutable list paragraph fixture for marker calculations. @param id - Stable paragraph identity. @param kind - List presentation. @param level - Zero-based list level. @returns Serializable numbering paragraph. */
function createParagraph(
  id: string,
  kind: WriterNumberingParagraph["list"]["kind"],
  level = 0,
): WriterNumberingParagraph {
  return { id, list: { kind, level } };
}

describe("Writer numbering markers" /** Groups deterministic list marker calculations. @returns Nothing; Vitest registers enclosed cases. */, function defineWriterNumberTests(): void {
  it("renders bullets and contiguous ordered markers while resetting at nonmatching boundaries" /** Verifies marker semantics do not edit paragraph text. @returns Nothing; assertions cover every current list kind and sequence boundary. */, function calculatesMarkers(): void {
    const paragraphs = [
      createParagraph("none", "none"),
      createParagraph("bullet", "bullet"),
      createParagraph("first", "numbered"),
      createParagraph("second", "numbered"),
      createParagraph("nested", "numbered", 1),
      createParagraph("restart", "numbered"),
    ];
    expect(getWriterParagraphListMarker(paragraphs, "missing")).toBeUndefined();
    expect(getWriterParagraphListMarker(paragraphs, "none")).toBeUndefined();
    expect(getWriterParagraphListMarker(paragraphs, "bullet")).toBe("•");
    expect(getWriterParagraphListMarker(paragraphs, "first")).toBe("1.");
    expect(getWriterParagraphListMarker(paragraphs, "second")).toBe("2.");
    expect(getWriterParagraphListMarker(paragraphs, "nested")).toBe("1.");
    expect(getWriterParagraphListMarker(paragraphs, "restart")).toBe("1.");
  });
});
