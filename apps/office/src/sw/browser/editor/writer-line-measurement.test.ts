/** @fileoverview Checks browser-shaped line boundaries and safe measurement fallbacks. */

import { describe, expect, it } from "vitest";

import type { WriterParagraphProjection } from "../presentation/writer-view-projection";
import { measureWriterTextLines } from "./writer-line-measurement";

/** Builds the view fields used by the browser line port. @param text - Source text. @returns Paragraph projection. */
function paragraph(text: string): WriterParagraphProjection {
  return {
    alignment: "left",
    computedStyle: {
      firstLineIndentPt: 0,
      fontStyle: "normal",
      fontSizePt: 12,
      fontWeight: 400,
      lineHeight: 1.2,
      lowerSpacingPt: 0,
      rightMarginPt: 0,
      upperSpacingPt: 0,
    },
    id: "p",
    list: { kind: "none", level: 0 },
    listId: "",
    numRuleName: "",
    nodeIndex: 0,
    runs: [],
    style: "body-text",
    styleDisplayName: "Body Text",
    text,
    textLeftMargin: 0,
  };
}

describe("browser Writer line measurement", /** Groups shaped-line cases. @returns Nothing. */ () => {
  it("keeps different font ascenders on one visual line", /** callback handles this value. @returns The result. */ () => {
    const element = document.createElement("p");
    element.innerHTML = "<strong>ab</strong><span>cd</span><span>ef</span>";
    const original = Range.prototype.getClientRects;
    Object.defineProperty(Range.prototype, "getClientRects", {
      configurable: true,
      /** Simulates differing glyph ascent on the same line and a later line. @param this - Measured range. @returns Character rectangle. */
      value: function (this: Range): DOMRectList {
        const text = this.startContainer.textContent;
        const top = text === "ab" ? 0 : text === "cd" ? 3 : 25;
        const height = text === "cd" ? 18 : 16;
        return [{ top, height }] as unknown as DOMRectList;
      },
    });
    try {
      expect(
        measureWriterTextLines(paragraph("abcdef"), element).map(
          /** map handles this value. @param line - Input 1. @returns The result. */ (line) => [
            line.start,
            line.end,
          ],
        ),
      ).toEqual([
        [0, 4],
        [4, 6],
      ]);
    } finally {
      if (original === undefined) Reflect.deleteProperty(Range.prototype, "getClientRects");
      else
        Object.defineProperty(Range.prototype, "getClientRects", {
          configurable: true,
          value: original,
        });
    }
  });
  it("keeps one source offset across styled runs and ignores a missing character rectangle", /** Verifies browser range boundaries. @returns Nothing. */ () => {
    const element = document.createElement("p");
    element.innerHTML = "<strong>ab</strong><em>cd</em>";
    const old = Range.prototype.getClientRects;
    Object.defineProperty(Range.prototype, "getClientRects", {
      configurable: true,
      /** Supplies visual rectangles for two styled text runs. @param this - Measured range. @returns Character rectangles. */
      value: function (this: Range): DOMRectList {
        return this.startOffset === 0 && this.startContainer.textContent === "ab"
          ? ([] as unknown as DOMRectList)
          : ([
              { top: this.startContainer.textContent === "ab" ? 0 : 20, height: 18 },
            ] as unknown as DOMRectList);
      },
    });
    try {
      expect(
        measureWriterTextLines(paragraph("abcd"), element).map(
          /** Projects measured offsets. @param line - Visual line. @returns Source range. */ (
            line,
          ) => [line.start, line.end],
        ),
      ).toEqual([
        [0, 2],
        [2, 4],
      ]);
      expect(measureWriterTextLines(paragraph("different"), element)).toEqual([
        { start: 0, end: 9, height: 288 },
      ]);
    } finally {
      if (old === undefined) Reflect.deleteProperty(Range.prototype, "getClientRects");
      else
        Object.defineProperty(Range.prototype, "getClientRects", {
          configurable: true,
          value: old,
        });
    }
  });
});
