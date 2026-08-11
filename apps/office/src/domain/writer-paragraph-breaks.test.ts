/** @fileoverview Verifies the immutable Writer paragraph-break transition independently from other body operations. */

import { describe, expect, it } from "vitest";

import { createDocument } from "./document";
import {
  appendWriterParagraph,
  createWriterDocument,
  insertWriterText,
  mergeWriterParagraphWithPrevious,
  setWriterParagraphAlignment,
  setWriterParagraphStyle,
  splitWriterParagraph,
  type WriterDocument,
} from "./writer";

/**
 * Creates a formatted two-paragraph fixture whose first paragraph can be split while preserving an unrelated sibling.
 *
 * @returns Immutable Writer document with a centered Heading 1 source paragraph and an untouched trailing sibling.
 */
function createParagraphBreakFixture(): WriterDocument {
  return appendWriterParagraph(
    setWriterParagraphStyle(
      setWriterParagraphAlignment(
        insertWriterText(
          createWriterDocument(
            createDocument({ id: "writer-breaks", suiteId: "writer", title: "Writer" }),
            "p-1",
          ),
          "p-1",
          0,
          "before after",
        ),
        "p-1",
        "center",
      ),
      "p-1",
      "heading-1",
    ),
    "p-3",
  );
}

/** Attempts a split with an existing inserted identity. @param writer - Valid Writer document. @returns Invalid split transition that always throws. */
function splitDuplicateParagraph(writer: WriterDocument): WriterDocument {
  return splitWriterParagraph(writer, "p-1", 0, "p-1");
}

/** Attempts a split with a blank inserted identity. @param writer - Valid Writer document. @returns Invalid split transition that always throws. */
function splitBlankParagraph(writer: WriterDocument): WriterDocument {
  return splitWriterParagraph(writer, "p-1", 0, " ");
}

/** Attempts a split outside paragraph text bounds. @param writer - Valid Writer document. @returns Invalid split transition that always throws. */
function splitOversizedOffset(writer: WriterDocument): WriterDocument {
  return splitWriterParagraph(writer, "p-1", 99, "p-2");
}

describe("Writer paragraph breaks" /** Groups normal and rejected immutable paragraph split behavior. @returns Nothing; Vitest registers the enclosed case. */, function defineWriterParagraphBreakTests(): void {
  it("joins a non-first paragraph into its predecessor while preserving the predecessor formatting" /** Verifies Backspace paragraph-boundary semantics retain the preceding identity and properties. @returns Nothing; assertions validate successful and rejected joins. */, function mergesParagraphs(): void {
    const writer = appendWriterParagraph(createParagraphBreakFixture(), "p-4");
    const joined = mergeWriterParagraphWithPrevious(writer, "p-3");

    expect(joined.paragraphs).toEqual([
      { alignment: "center", id: "p-1", style: "heading-1", text: "before after" },
      { alignment: "left", id: "p-4", style: "default", text: "" },
    ]);
    expect(
      /** Executes the first-paragraph join rejection. @returns Invalid merge transition that always throws. */
      function mergesFirstParagraph(): WriterDocument {
        return mergeWriterParagraphWithPrevious(writer, "p-1");
      },
    ).toThrowError();
    expect(
      /** Executes the missing-paragraph join rejection. @returns Invalid merge transition that always throws. */
      function mergesMissingParagraph(): WriterDocument {
        return mergeWriterParagraphWithPrevious(writer, "missing");
      },
    ).toThrowError();
  });

  it("splits a paragraph at its caret while preserving ordered formatting and identity" /** Verifies source-prefix text, adjacent trailing text, property inheritance, sibling preservation, and invalid input rejection. @returns Nothing; assertions validate the complete pure transition. */, function splitsParagraphs(): void {
    const writer = createParagraphBreakFixture();
    const split = splitWriterParagraph(writer, "p-1", 7, "p-2");

    expect(writer.paragraphs).toEqual([
      { alignment: "center", id: "p-1", style: "heading-1", text: "before after" },
      { alignment: "left", id: "p-3", style: "default", text: "" },
    ]);
    expect(split).toMatchObject({
      document: { lifecycle: "dirty", revision: writer.document.revision },
      paragraphs: [
        { alignment: "center", id: "p-1", style: "heading-1", text: "before " },
        { alignment: "center", id: "p-2", style: "heading-1", text: "after" },
        { alignment: "left", id: "p-3", style: "default", text: "" },
      ],
    });
    expect(
      /** Executes the duplicate inserted-identity failure. @returns Invalid split result that always throws. */
      function splitsWithDuplicateParagraph(): WriterDocument {
        return splitDuplicateParagraph(writer);
      },
    ).toThrowError();
    expect(
      /** Executes the blank inserted-identity failure. @returns Invalid split result that always throws. */
      function splitsWithBlankParagraph(): WriterDocument {
        return splitBlankParagraph(writer);
      },
    ).toThrowError();
    expect(
      /** Executes the oversized split-offset failure. @returns Invalid split result that always throws. */
      function splitsBeyondParagraph(): WriterDocument {
        return splitOversizedOffset(writer);
      },
    ).toThrowError();
    expect(
      /** Executes the missing source-paragraph failure. @returns Invalid split result that always throws. */
      function splitsMissingParagraph(): WriterDocument {
        return splitWriterParagraph(writer, "missing", 0, "p-2");
      },
    ).toThrowError();
    expect(
      /** Executes the fractional split-offset failure. @returns Invalid split result that always throws. */
      function splitsAtFractionalOffset(): WriterDocument {
        return splitWriterParagraph(writer, "p-1", 0.5, "p-2");
      },
    ).toThrowError();
  });
});
