/** @fileoverview Verifies browser-visible Writer list marker calculation at the `number.cxx`-derived document boundary. */

import { describe, expect, it } from "vitest";

import {
  getWriterParagraphListMarker,
  SwNumFormat,
  SwNumRule,
  type WriterNumberingParagraph,
} from "./number";

/** Provides a compact immutable list paragraph fixture for marker calculations. @param id - Stable paragraph identity. @param kind - List presentation. @param level - Zero-based list level. @param listId - Optional canonical list identity. @returns Serializable numbering paragraph. */
function createParagraph(
  id: string,
  kind: WriterNumberingParagraph["list"]["kind"],
  level = 0,
  listId?: string,
): WriterNumberingParagraph {
  return {
    ...(listId === undefined
      ? {}
      : {
          /** Returns the canonical list identity. @returns List identity. */
          GetListId: () => listId,
        }),
    id,
    list: { kind, level },
  };
}

describe("Writer numbering markers" /** Groups deterministic list marker calculations. @returns Nothing; Vitest registers enclosed cases. */, function defineWriterNumberTests(): void {
  it("renders bullets and contiguous ordered markers while resetting at nonmatching boundaries" /** Verifies marker semantics do not edit paragraph text. @returns Nothing; assertions cover every current list kind and sequence boundary. */, function calculatesMarkers(): void {
    const paragraphs = [
      createParagraph("none", "none"),
      createParagraph("bullet", "bullet"),
      createParagraph("first", "numbered"),
      createParagraph("second", "numbered"),
      createParagraph("nested", "numbered", 1),
      createParagraph("restart", "numbered", 0, "separate-list"),
    ];
    expect(getWriterParagraphListMarker(paragraphs, "missing")).toBeUndefined();
    expect(getWriterParagraphListMarker(paragraphs, "none")).toBeUndefined();
    expect(getWriterParagraphListMarker(paragraphs, "bullet")).toBe("•");
    expect(getWriterParagraphListMarker(paragraphs, "first")).toBe("1.");
    expect(getWriterParagraphListMarker(paragraphs, "second")).toBe("2.");
    expect(getWriterParagraphListMarker(paragraphs, "nested")).toBe("1.");
    expect(getWriterParagraphListMarker(paragraphs, "restart")).toBe("1.");
  });

  it("continues a root number across nested items within the same canonical list" /** Verifies Writer list identity and level traversal. @returns Nothing. */, function continuesAcrossNestedItems(): void {
    const paragraphs = [
      createParagraph("root-1", "numbered", 0, "list-a"),
      createParagraph("nested-bullet", "bullet", 1, "list-a"),
      createParagraph("nested-number", "numbered", 1, "list-a"),
      createParagraph("root-2", "numbered", 0, "list-a"),
      createParagraph("other-root", "numbered", 0, "list-b"),
    ];
    expect(getWriterParagraphListMarker(paragraphs, "nested-number")).toBe("1.");
    expect(getWriterParagraphListMarker(paragraphs, "root-2")).toBe("2.");
    expect(getWriterParagraphListMarker(paragraphs, "other-root")).toBe("1.");
    const interrupted = [
      createParagraph("before", "numbered", 0, "same"),
      createParagraph("ordinary", "none"),
      createParagraph("after", "numbered", 0, "same"),
    ];
    expect(getWriterParagraphListMarker(interrupted, "after")).toBe("1.");
  });

  it("validates complete per-level rule snapshots" /** Covers current-schema invariants without compatibility fallbacks. @returns Nothing. */, function validatesRules(): void {
    expect(
      /** Constructs an incomplete rule. @returns Invalid rule. */ () =>
        new SwNumRule("short", [new SwNumFormat("bullet")]),
    ).toThrow("define every supported list level");
    expect(
      /** Restores a rule without level formats. @returns Invalid rule. */ () =>
        SwNumRule.fromSnapshot({ formats: undefined as never, listId: "id", name: "missing" }),
    ).toThrow("formats are invalid");
    expect(
      /** Restores a rule with no level formats. @returns Invalid rule. */ () =>
        SwNumRule.fromSnapshot({ formats: [], listId: "id", name: "empty" }),
    ).toThrow("formats are invalid");
    const rule = new SwNumRule("levels", "numbered");
    for (const level of [-1, 0.5, 10])
      expect(
        /** Reads an invalid numbering level. @returns Invalid format. */ () =>
          rule.GetNumFormat(level),
      ).toThrow("outside 0-9");
  });
});
