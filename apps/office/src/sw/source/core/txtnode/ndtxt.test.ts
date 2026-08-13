/**
 * @fileoverview Verifies normalized immutable Writer text-node runs, direct attributes, range toggles, insertion, and split behavior.
 */

import { describe, expect, it } from "vitest";

import {
  createWriterTextRuns,
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  getWriterTextAttributesAtOffset,
  getWriterTextFromRuns,
  insertWriterTextRun,
  normalizeWriterCharacterAttributes,
  normalizeWriterTextRuns,
  splitWriterTextRuns,
  toggleWriterTextRangeFormat,
} from "./ndtxt";

/** Creates a compact default direct-format text run. @param text - Non-empty visible text run body. @returns Default-attribute Writer text run. */
function defaultRun(text: string) {
  return { attributes: DEFAULT_WRITER_CHARACTER_ATTRIBUTES, text };
}

describe("Writer text nodes" /** Groups immutable direct character-format run behavior. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterTextNodeTests(): void {
  it("creates and normalizes visible text runs without retaining malformed fragments" /** Verifies text compatibility projection, defaults, attribute normalization, empty removal, and adjacent merge behavior. @returns Nothing; assertions protect the text-node persistence contract. */, function normalizesRuns(): void {
    expect(createWriterTextRuns("")).toEqual([]);
    expect(createWriterTextRuns("Body")).toEqual([defaultRun("Body")]);
    expect(normalizeWriterCharacterAttributes(undefined)).toEqual(
      DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
    );
    expect(normalizeWriterCharacterAttributes({ bold: true, italic: 1, underline: true })).toEqual({
      bold: true,
      italic: false,
      underline: true,
    });
    expect(
      normalizeWriterTextRuns([
        undefined,
        { attributes: { bold: true }, text: "A" },
        { attributes: { bold: true }, text: "B" },
        { attributes: {}, text: "" },
        { attributes: { italic: true }, text: "C" },
      ]),
    ).toEqual([
      { attributes: { bold: true, italic: false, underline: false }, text: "AB" },
      { attributes: { bold: false, italic: true, underline: false }, text: "C" },
    ]);
    expect(getWriterTextFromRuns("invalid")).toBe("");
    expect(getWriterTextFromRuns([defaultRun("A"), defaultRun("B")])).toBe("AB");
  });

  it("toggles a selected range on and off while preserving surrounding direct attributes" /** Verifies range splitting, all-selected toggle detection, no-op collapse, and bounded errors. @returns Nothing; assertions protect direct-format command semantics. */, function togglesRanges(): void {
    const source = [
      defaultRun("A"),
      { attributes: { bold: true, italic: false, underline: false }, text: "BC" },
      defaultRun("D"),
    ] as const;
    expect(toggleWriterTextRangeFormat(source, 1, 3, "bold")).toEqual([defaultRun("ABCD")]);
    expect(toggleWriterTextRangeFormat([defaultRun("ABCD")], 1, 3, "italic")).toEqual([
      defaultRun("A"),
      { attributes: { bold: false, italic: true, underline: false }, text: "BC" },
      defaultRun("D"),
    ]);
    expect(toggleWriterTextRangeFormat(source, 2, 2, "underline")).toEqual(source);
    expect(
      /** Attempts an invalid negative direct-format range. @returns Nothing; the domain call always throws. */
      function togglesNegativeRange(): void {
        toggleWriterTextRangeFormat(source, -1, 1, "bold");
      },
    ).toThrow("outside");
    expect(
      /** Attempts a reversed direct-format range. @returns Nothing; the domain call always throws. */
      function togglesReversedRange(): void {
        toggleWriterTextRangeFormat(source, 3, 2, "bold");
      },
    ).toThrow("outside");
  });

  it("inserts and splits runs at every direct-format boundary" /** Verifies insertion at paragraph start/middle/end, normalization, split retention, and invalid offsets. @returns Nothing; assertions protect typed pending-format behavior. */, function insertsAndSplitsRuns(): void {
    const source = [
      { attributes: { bold: true, italic: false, underline: false }, text: "AB" },
      defaultRun("CD"),
    ] as const;
    const italic = { bold: false, italic: true, underline: false } as const;
    expect(insertWriterTextRun(source, 0, "X", italic)).toEqual([
      { attributes: italic, text: "X" },
      { attributes: { bold: true, italic: false, underline: false }, text: "AB" },
      defaultRun("CD"),
    ]);
    expect(insertWriterTextRun(source, 1, "X", italic)).toEqual([
      { attributes: { bold: true, italic: false, underline: false }, text: "A" },
      { attributes: italic, text: "X" },
      { attributes: { bold: true, italic: false, underline: false }, text: "B" },
      defaultRun("CD"),
    ]);
    expect(insertWriterTextRun(source, 4, "X", DEFAULT_WRITER_CHARACTER_ATTRIBUTES)).toEqual([
      { attributes: { bold: true, italic: false, underline: false }, text: "AB" },
      defaultRun("CDX"),
    ]);
    expect(insertWriterTextRun(source, 2, "", italic)).toEqual(source);
    expect(
      /** Attempts direct text insertion beyond the paragraph body. @returns Nothing; the domain call always throws. */
      function insertsBeyondTextRuns(): void {
        insertWriterTextRun(source, 5, "X", italic);
      },
    ).toThrow("outside");
    expect(splitWriterTextRuns(source, 0)).toEqual({ prefix: [], suffix: source });
    expect(splitWriterTextRuns(source, 2)).toEqual({
      prefix: [{ attributes: { bold: true, italic: false, underline: false }, text: "AB" }],
      suffix: [defaultRun("CD")],
    });
    expect(splitWriterTextRuns(source, 1)).toEqual({
      prefix: [{ attributes: { bold: true, italic: false, underline: false }, text: "A" }],
      suffix: [
        { attributes: { bold: true, italic: false, underline: false }, text: "B" },
        defaultRun("CD"),
      ],
    });
    expect(
      /** Attempts splitting beyond visible Writer run text. @returns Nothing; the domain call always throws. */
      function splitsBeyondTextRuns(): void {
        splitWriterTextRuns(source, 5);
      },
    ).toThrow("outside");
  });

  it("derives collapsed-caret attributes from preceding or following writer text" /** Verifies pending character-format inheritance across empty, start, interior, end, and invalid caret positions. @returns Nothing; assertions protect collapsed-caret command state. */, function readsCaretAttributes(): void {
    const source = [
      { attributes: { bold: true, italic: false, underline: false }, text: "AB" },
      { attributes: { bold: false, italic: true, underline: false }, text: "CD" },
    ] as const;
    expect(getWriterTextAttributesAtOffset([], 0)).toEqual(DEFAULT_WRITER_CHARACTER_ATTRIBUTES);
    expect(getWriterTextAttributesAtOffset(source, 0)).toEqual(source[0]?.attributes);
    expect(getWriterTextAttributesAtOffset(source, 2)).toEqual(source[0]?.attributes);
    expect(getWriterTextAttributesAtOffset(source, 3)).toEqual(source[1]?.attributes);
    expect(getWriterTextAttributesAtOffset(source, 4)).toEqual(source[1]?.attributes);
    expect(
      /** Attempts to derive direct attributes before the Writer text start. @returns Nothing; the domain call always throws. */
      function readsNegativeCaretOffset(): void {
        getWriterTextAttributesAtOffset(source, -1);
      },
    ).toThrow("outside");
  });
});
