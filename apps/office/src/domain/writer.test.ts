/**
 * @fileoverview Verifies serializable Writer paragraph creation, immutable insertion, lifecycle integration, and invalid edit rejection.
 */

import { describe, expect, it } from "vitest";

import { createDocument } from "./document";
import {
  appendWriterParagraph,
  createWriterDocument,
  insertWriterText,
  replaceWriterParagraph,
  type WriterDocument,
} from "./writer";

/**
 * Creates a valid Writer document fixture.
 *
 * @returns Immutable Writer document with one empty paragraph.
 */
function createFixture(): WriterDocument {
  return createWriterDocument(
    createDocument({ id: "writer-1", suiteId: "writer", title: "Writer" }),
    "p-1",
  );
}

/**
 * Attempts to create a document with a whitespace-only paragraph identity.
 *
 * @param writer - Valid Writer document whose header is reused without mutation.
 * @returns An invalid Writer document creation result; the call always throws.
 */
function createBlankParagraph(writer: WriterDocument): WriterDocument {
  return createWriterDocument(writer.document, " ");
}

/**
 * Attempts to append a paragraph with an identity that already belongs to the document.
 *
 * @param writer - Valid Writer document to inspect without mutation.
 * @returns An invalid append result; the call always throws.
 */
function appendDuplicateParagraph(writer: WriterDocument): WriterDocument {
  return appendWriterParagraph(writer, "p-1");
}

/**
 * Attempts to append a paragraph with a blank identity.
 *
 * @param writer - Valid Writer document to inspect without mutation.
 * @returns An invalid append result; the call always throws.
 */
function appendBlankParagraph(writer: WriterDocument): WriterDocument {
  return appendWriterParagraph(writer, " ");
}

/**
 * Attempts to insert text into a paragraph that does not exist.
 *
 * @param writer - Valid Writer document to query without mutation.
 * @returns An invalid insertion result; the call always throws.
 */
function editMissingParagraph(writer: WriterDocument): WriterDocument {
  return insertWriterText(writer, "missing", 0, "x");
}

/**
 * Attempts to insert text before the valid paragraph range.
 *
 * @param writer - Valid Writer document to query without mutation.
 * @returns An invalid insertion result; the call always throws.
 */
function insertNegativeOffset(writer: WriterDocument): WriterDocument {
  return insertWriterText(writer, "p-1", -1, "x");
}

/**
 * Attempts to insert text beyond the valid paragraph range.
 *
 * @param writer - Valid Writer document to query without mutation.
 * @returns An invalid insertion result; the call always throws.
 */
function insertOversizedOffset(writer: WriterDocument): WriterDocument {
  return insertWriterText(writer, "p-1", 1, "x");
}

/**
 * Attempts to insert text at a non-integer UTF-16 offset.
 *
 * @param writer - Valid Writer document to query without mutation.
 * @returns An invalid insertion result; the call always throws.
 */
function insertFractionalOffset(writer: WriterDocument): WriterDocument {
  return insertWriterText(writer, "p-1", 0.5, "x");
}

/**
 * Attempts to replace text in a paragraph that does not exist.
 *
 * @param writer - Valid Writer document to query without mutation.
 * @returns An invalid replacement result; the call always throws.
 */
function replaceMissingParagraph(writer: WriterDocument): WriterDocument {
  return replaceWriterParagraph(writer, "missing", "x");
}

describe("Writer paragraph body" /**
 * Groups paragraph creation and pure insertion behavior.
 *
 * @returns Nothing; Vitest registers enclosed cases.
 */, function defineWriterTests(): void {
  it("creates serializable bodies and changes paragraph text immutably while advancing lifecycle" /**
   * Verifies plain-text insertion and replacement preserve the prior body and use shared dirty-state revision behavior.
   *
   * @returns Nothing; assertions validate successful paragraph operations.
   */, function editsParagraphs(): void {
    const writer = createFixture();
    const withSecondParagraph = {
      ...writer,
      paragraphs: [...writer.paragraphs, { id: "p-2", text: "unchanged" }],
    };
    const inserted = insertWriterText(withSecondParagraph, "p-1", 0, "hello");
    const middle = insertWriterText(inserted, "p-1", 2, "!");
    const replaced = replaceWriterParagraph(middle, "p-2", "updated");
    const unchanged = replaceWriterParagraph(replaced, "p-2", "updated");
    expect(writer).toMatchObject({
      document: { lifecycle: "new", revision: 0 },
      paragraphs: [{ id: "p-1", text: "" }],
    });
    expect(inserted.document).toMatchObject({ lifecycle: "dirty", revision: 1 });
    expect(inserted.paragraphs[0]?.text).toBe("hello");
    expect(middle.paragraphs[0]?.text).toBe("he!llo");
    expect(middle.paragraphs[1]?.text).toBe("unchanged");
    expect(replaced.paragraphs[1]?.text).toBe("updated");
    expect(unchanged).toBe(replaced);
    expect(JSON.parse(JSON.stringify(replaced))).toEqual(replaced);
  });

  it("appends an ordered empty paragraph immutably and rejects duplicate identities" /**
   * Verifies append uses the shared dirty lifecycle transition without mutating the original body.
   *
   * @returns Nothing; assertions validate the appended body and invalid-identity branch.
   */, function appendsParagraphs(): void {
    const writer = createFixture();
    const appended = appendWriterParagraph(writer, "p-2");

    expect(writer.paragraphs).toEqual([{ id: "p-1", text: "" }]);
    expect(appended).toMatchObject({
      document: { lifecycle: "dirty", revision: 1 },
      paragraphs: [
        { id: "p-1", text: "" },
        { id: "p-2", text: "" },
      ],
    });
    expect(
      /**
       * Executes the duplicate-identity failure case for Vitest.
       *
       * @returns Invalid Writer append result; the delegated call always throws.
       */
      function appendsDuplicateParagraph(): WriterDocument {
        return appendDuplicateParagraph(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the blank append-identity failure case for Vitest.
       *
       * @returns Invalid Writer append result; the delegated call always throws.
       */
      function appendsBlankParagraph(): WriterDocument {
        return appendBlankParagraph(writer);
      },
    ).toThrowError();
  });

  it("rejects blank paragraph IDs, missing paragraphs, negative, oversized, and fractional offsets" /**
   * Verifies invalid calls do not silently corrupt the paragraph body.
   *
   * @returns Nothing; assertions validate all invalid-input branches.
   */, function rejectsInvalidEdits(): void {
    const writer = createFixture();
    expect(
      /**
       * Executes the blank-identity failure case for Vitest.
       *
       * @returns Invalid Writer creation result; the delegated call always throws.
       */
      function createsBlankParagraph(): WriterDocument {
        return createBlankParagraph(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the missing-paragraph insertion failure case for Vitest.
       *
       * @returns Invalid Writer insertion result; the delegated call always throws.
       */
      function editsMissingParagraph(): WriterDocument {
        return editMissingParagraph(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the negative-offset insertion failure case for Vitest.
       *
       * @returns Invalid Writer insertion result; the delegated call always throws.
       */
      function insertsNegativeOffset(): WriterDocument {
        return insertNegativeOffset(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the oversized-offset insertion failure case for Vitest.
       *
       * @returns Invalid Writer insertion result; the delegated call always throws.
       */
      function insertsOversizedOffset(): WriterDocument {
        return insertOversizedOffset(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the fractional-offset insertion failure case for Vitest.
       *
       * @returns Invalid Writer insertion result; the delegated call always throws.
       */
      function insertsFractionalOffset(): WriterDocument {
        return insertFractionalOffset(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the missing-paragraph replacement failure case for Vitest.
       *
       * @returns Invalid Writer replacement result; the delegated call always throws.
       */
      function replacesMissingParagraph(): WriterDocument {
        return replaceMissingParagraph(writer);
      },
    ).toThrowError();
  });
});
