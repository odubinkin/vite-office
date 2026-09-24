/**
 * @fileoverview Verifies normalized immutable Writer text-node runs, direct attributes, range toggles, insertion, and split behavior.
 */

import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../doc/doc";

import { projectWriterTextRuns } from "./ndtxt";
import {
  createWriterTextRuns,
  DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
  getWriterTextFromRuns,
  normalizeWriterCharacterAttributes,
  normalizeWriterTextRuns,
  splitWriterTextRuns,
} from "../../filter/basflt/writer-transfer";

/** Creates a compact default direct-format text run. @param text - Non-empty visible text run body. @returns Default-attribute Writer text run. */
function defaultRun(text: string) {
  return { attributes: DEFAULT_WRITER_CHARACTER_ATTRIBUTES, text };
}

describe("Writer text nodes" /** Groups immutable direct character-format run behavior. @returns Nothing; Vitest registers the enclosed cases. */, function defineWriterTextNodeTests(): void {
  it("creates and normalizes visible text runs without retaining malformed fragments" /** Verifies text compatibility projection, defaults, attribute normalization, empty removal, and adjacent merge behavior. @returns Nothing; assertions protect the text-node persistence contract. */, function normalizesRuns(): void {
    expect(projectWriterTextRuns(undefined)).toEqual([]);
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
    expect(
      normalizeWriterTextRuns([
        { attributes: {}, hyperlink: { url: "https://example.test/" }, text: "link" },
      ]),
    ).toEqual([
      {
        attributes: DEFAULT_WRITER_CHARACTER_ATTRIBUTES,
        hyperlink: { url: "https://example.test/" },
        text: "link",
      },
    ]);
    expect(getWriterTextFromRuns("invalid")).toBe("");
    expect(getWriterTextFromRuns([defaultRun("A"), defaultRun("B")])).toBe("AB");
  });

  it("splits projected runs at every direct-format boundary" /** Verifies split retention and invalid offsets at the clipboard projection boundary. @returns Nothing; assertions protect boundary serialization. */, function splitsRuns(): void {
    const source = [
      { attributes: { bold: true, italic: false, underline: false }, text: "AB" },
      defaultRun("CD"),
    ] as const;
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

  it("toggles a selected range through native hints", /** Verifies direct formatting mutates canonical hints while runs remain a derived projection. @returns Nothing. */ function togglesNativeRange(): void {
    const paragraph = createWriterDocument().paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer fixture paragraph is missing.");
    paragraph.InsertText("ABCD", 0);
    paragraph.ToggleTextRangeFormat(1, 3, "italic");
    expect(projectWriterTextRuns(paragraph)).toEqual([
      defaultRun("A"),
      { attributes: { ...DEFAULT_WRITER_CHARACTER_ATTRIBUTES, italic: true }, text: "BC" },
      defaultRun("D"),
    ]);
    paragraph.ToggleTextRangeFormat(1, 3, "italic");
    expect(projectWriterTextRuns(paragraph)).toEqual([defaultRun("ABCD")]);
  });
});
