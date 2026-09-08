/**
 * @fileoverview Verifies serializable Writer paragraph creation, immutable insertion, lifecycle integration, and invalid edit rejection.
 */

import { describe, expect, it } from "vitest";

import { createDocument } from "../../../../sfx2/source/doc/docfac";
import {
  appendWriterParagraph,
  createWriterDocument,
  insertWriterText,
  insertWriterTextWithAttributes,
  moveWriterParagraph,
  normalizeWriterParagraphFormatting,
  removeWriterParagraph,
  replaceWriterParagraph,
  setWriterParagraphAlignment,
  setWriterParagraphStyle,
  serializeWriterDocument,
  toggleWriterParagraphCharacterFormat,
  type WriterDocument,
  type WriterParagraphAlignment,
  type WriterParagraphStyle,
  type WriterParagraphMoveDirection,
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

/** Projects canonical SwTextNodes to stable assertion records. @param writer - Writer document graph. @returns Cycle-free paragraph values. */
function projectParagraphs(writer: WriterDocument) {
  return writer.paragraphs.map(
    /** Projects one text node without its SwNodes ownership graph. @param paragraph - Canonical body node. @returns View assertion record. */
    function projectParagraph(paragraph) {
      return {
        alignment: paragraph.alignment,
        id: paragraph.id,
        list: paragraph.list,
        runs: paragraph.runs,
        style: paragraph.style,
        text: paragraph.text,
      };
    },
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
 * Attempts to remove a paragraph that does not exist.
 *
 * @param writer - Valid Writer document to inspect without mutation.
 * @returns An invalid removal result; the call always throws.
 */
function removeMissingParagraph(writer: WriterDocument): WriterDocument {
  return removeWriterParagraph(writer, "missing");
}

/**
 * Attempts to remove the only remaining paragraph in a Writer document.
 *
 * @param writer - Valid Writer document containing one paragraph.
 * @returns An invalid removal result; the call always throws.
 */
function removeOnlyParagraph(writer: WriterDocument): WriterDocument {
  return removeWriterParagraph(writer, "p-1");
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

/** Attempts direct-format insertion beyond a valid paragraph boundary. @param writer - Valid Writer document to inspect without mutation. @returns An invalid insertion result; the call always throws. */
function insertFormattedTextBeyondParagraph(writer: WriterDocument): WriterDocument {
  return insertWriterTextWithAttributes(writer, "p-1", 1, "x", {
    bold: true,
    italic: false,
    underline: false,
  });
}

/** Attempts direct-format insertion into a paragraph that is absent from the Writer body. @param writer - Valid Writer document to inspect without mutation. @returns An invalid insertion result; the call always throws. */
function insertFormattedTextIntoMissingParagraph(writer: WriterDocument): WriterDocument {
  return insertWriterTextWithAttributes(writer, "missing", 0, "x", {
    bold: true,
    italic: false,
    underline: false,
  });
}

/** Attempts direct character formatting for a missing paragraph. @param writer - Valid Writer document to inspect without mutation. @returns An invalid formatting result; the call always throws. */
function formatMissingParagraph(writer: WriterDocument): WriterDocument {
  return toggleWriterParagraphCharacterFormat(writer, "missing", 0, 1, "bold");
}

/** Creates an invalid range-format operation for error assertions. @param writer - Source document. @param start - Invalid range start. @param end - Range end. @returns Deferred operation. */
function throwingWriterFormat(
  writer: WriterDocument,
  start: number,
  end: number,
): () => WriterDocument {
  /** Runs the invalid range operation. @returns The invalid result; this always throws. */
  function formatInvalidRange(): WriterDocument {
    return toggleWriterParagraphCharacterFormat(writer, "p-1", start, end, "bold");
  }
  return formatInvalidRange;
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

/**
 * Attempts to set an unsupported paragraph alignment through an untyped boundary value.
 *
 * @param writer - Valid Writer document to inspect without mutation.
 * @returns An invalid alignment transition; the delegated call always throws.
 */
function setUnsupportedAlignment(writer: WriterDocument): WriterDocument {
  return setWriterParagraphAlignment(writer, "p-1", "diagonal" as WriterParagraphAlignment);
}

/**
 * Attempts to align a paragraph identity that is absent from the Writer body.
 *
 * @param writer - Valid Writer document to inspect without mutation.
 * @returns An invalid alignment transition; the delegated call always throws.
 */
function setMissingParagraphAlignment(writer: WriterDocument): WriterDocument {
  return setWriterParagraphAlignment(writer, "missing", "center");
}

/** Attempts an unsupported style through an untyped boundary. @param writer - Valid Writer document. @returns Invalid style transition that always throws. */
function setUnsupportedStyle(writer: WriterDocument): WriterDocument {
  return setWriterParagraphStyle(writer, "p-1", "caption" as WriterParagraphStyle);
}

/** Attempts an unsupported movement through an untyped boundary. @param writer - Valid Writer document. @returns Invalid movement that always throws. */
function moveUnsupportedDirection(writer: WriterDocument): WriterDocument {
  return moveWriterParagraph(writer, "p-1", "sideways" as WriterParagraphMoveDirection);
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
    const withSecondParagraph = replaceWriterParagraph(
      appendWriterParagraph(writer, "p-2"),
      "p-2",
      "unchanged",
    );
    const inserted = insertWriterText(withSecondParagraph, "p-1", 0, "hello");
    expect(insertWriterText(inserted, "p-1", 0, "")).toBe(inserted);
    expect(
      insertWriterTextWithAttributes(inserted, "p-1", 0, "", {
        bold: true,
        italic: false,
        underline: false,
      }),
    ).toBe(inserted);
    const middle = insertWriterText(inserted, "p-1", 2, "!");
    const replaced = replaceWriterParagraph(middle, "p-2", "updated");
    const unchanged = replaceWriterParagraph(replaced, "p-2", "updated");
    expect(writer).toMatchObject({
      document: { lifecycle: "new", revision: 0 },
      paragraphs: [
        {
          alignment: "left",
          id: "p-1",
          list: { kind: "none", level: 0 },
          runs: [],
          style: "default",
          text: "",
        },
      ],
    });
    expect(inserted.document).toMatchObject({ lifecycle: "dirty", revision: 1 });
    expect(inserted.paragraphs[0]?.text).toBe("hello");
    expect(middle.paragraphs[0]?.text).toBe("he!llo");
    expect(middle.paragraphs[1]?.text).toBe("unchanged");
    expect(toggleWriterParagraphCharacterFormat(middle, "p-1", 2, 2, "bold")).toBe(middle);
    expect(throwingWriterFormat(middle, -1, 2)).toThrow("outside the paragraph");
    expect(
      toggleWriterParagraphCharacterFormat(middle, "p-1", 0, 2, "bold").paragraphs[1],
    ).toMatchObject({ id: "p-2", text: "unchanged" });
    expect(replaced.paragraphs[1]?.text).toBe("updated");
    expect(unchanged).toBe(replaced);
    expect(JSON.parse(JSON.stringify(serializeWriterDocument(replaced)))).toEqual(
      serializeWriterDocument(replaced),
    );
  });

  it("appends an ordered empty paragraph immutably and rejects duplicate identities" /**
   * Verifies append uses the shared dirty lifecycle transition without mutating the original body.
   *
   * @returns Nothing; assertions validate the appended body and invalid-identity branch.
   */, function appendsParagraphs(): void {
    const writer = createFixture();
    const appended = appendWriterParagraph(writer, "p-2");

    expect(projectParagraphs(writer)).toEqual([
      {
        alignment: "left",
        id: "p-1",
        list: { kind: "none", level: 0 },
        runs: [],
        style: "default",
        text: "",
      },
    ]);
    expect(appended.document).toMatchObject({ lifecycle: "dirty", revision: 1 });
    expect(projectParagraphs(appended)).toEqual([
      {
        alignment: "left",
        id: "p-1",
        list: { kind: "none", level: 0 },
        runs: [],
        style: "default",
        text: "",
      },
      {
        alignment: "left",
        id: "p-2",
        list: { kind: "none", level: 0 },
        runs: [],
        style: "default",
        text: "",
      },
    ]);
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

  it("removes one non-final paragraph immutably and protects the non-empty body invariant" /**
   * Verifies valid removal preserves sibling order and invalid removal cannot erase the document body.
   *
   * @returns Nothing; assertions validate removal and all error branches.
   */, function removesParagraphs(): void {
    const writer = appendWriterParagraph(createFixture(), "p-2");
    const removed = removeWriterParagraph(writer, "p-1");

    expect(writer.paragraphs).toHaveLength(2);
    expect(removed.document).toMatchObject({ lifecycle: "dirty", revision: 1 });
    expect(projectParagraphs(removed)).toEqual([
      {
        alignment: "left",
        id: "p-2",
        list: { kind: "none", level: 0 },
        runs: [],
        style: "default",
        text: "",
      },
    ]);
    expect(
      /**
       * Executes the missing-paragraph removal failure case for Vitest.
       *
       * @returns Invalid Writer removal result; the delegated call always throws.
       */
      function removesMissingParagraph(): WriterDocument {
        return removeMissingParagraph(writer);
      },
    ).toThrowError();
    expect(
      /**
       * Executes the final-paragraph removal failure case for Vitest.
       *
       * @returns Invalid Writer removal result; the delegated call always throws.
       */
      function removesOnlyParagraph(): WriterDocument {
        return removeOnlyParagraph(createFixture());
      },
    ).toThrowError();
  });

  it("changes one paragraph alignment immutably and normalizes legacy stored values" /**
   * Verifies alignment uses the shared dirty transition, preserves no-op references, and restores old snapshots safely.
   *
   * @returns Nothing; assertions validate valid, invalid, and legacy alignment behavior.
   */, function alignsParagraphs(): void {
    const writer = appendWriterParagraph(createFixture(), "p-2");
    const aligned = setWriterParagraphAlignment(writer, "p-2", "center");
    const unchanged = setWriterParagraphAlignment(aligned, "p-2", "center");
    const legacyWriter = { document: writer.document, paragraphs: [{ id: "p-1", text: "Legacy" }] };
    const normalized = normalizeWriterParagraphFormatting(legacyWriter);

    expect(projectParagraphs(writer)[1]).toEqual({
      alignment: "left",
      id: "p-2",
      list: { kind: "none", level: 0 },
      runs: [],
      style: "default",
      text: "",
    });
    expect(aligned.paragraphs[0]).toMatchObject({ id: "p-1", text: "" });
    expect(projectParagraphs(aligned)[1]).toEqual({
      alignment: "center",
      id: "p-2",
      list: { kind: "none", level: 0 },
      runs: [],
      style: "default",
      text: "",
    });
    expect(unchanged).toBe(aligned);
    expect(projectParagraphs(normalized)).toEqual([
      {
        alignment: "left",
        id: "p-1",
        list: { kind: "none", level: 0 },
        runs: [
          {
            attributes: { bold: false, italic: false, underline: false },
            text: "Legacy",
          },
        ],
        style: "default",
        text: "Legacy",
      },
    ]);
    expect(normalizeWriterParagraphFormatting(aligned)).toBe(aligned);
    expect(
      /** Executes the unsupported-alignment failure case for Vitest. @returns Invalid alignment transition; delegated call always throws. */
      function setsUnsupportedAlignment(): WriterDocument {
        return setUnsupportedAlignment(writer);
      },
    ).toThrowError();
    expect(
      /** Executes the missing-paragraph alignment failure case for Vitest. @returns Invalid alignment transition; delegated call always throws. */
      function alignsMissingParagraph(): WriterDocument {
        return setMissingParagraphAlignment(writer);
      },
    ).toThrowError();
  });

  it("changes one paragraph style immutably and rejects unsupported styles" /** Verifies style state mirrors the alignment transition's identity, no-op, and validation contract. @returns Nothing; assertions validate bounded styles. */, function stylesParagraphs(): void {
    const writer = appendWriterParagraph(createFixture(), "p-2");
    const styled = setWriterParagraphStyle(writer, "p-1", "heading-1");
    expect(styled.paragraphs[0]).toMatchObject({ style: "heading-1" });
    expect(setWriterParagraphStyle(styled, "p-1", "heading-1")).toBe(styled);
    expect(
      /** Executes the unsupported-style failure case. @returns Invalid transition that always throws. */
      function stylesUnsupportedParagraph(): WriterDocument {
        return setUnsupportedStyle(writer);
      },
    ).toThrowError();
    expect(
      /** Executes the missing-paragraph style failure case. @returns Invalid transition that always throws. */
      function stylesMissingParagraph(): WriterDocument {
        return setWriterParagraphStyle(writer, "missing", "heading-1");
      },
    ).toThrowError();
  });

  it("moves a paragraph by one adjacent position without losing its properties" /** Verifies exact ordering, identity retention, dirty lifecycle behavior, and every invalid movement boundary. @returns Nothing; assertions validate adjacent paragraph movement. */, function movesParagraphs(): void {
    const writer = appendWriterParagraph(appendWriterParagraph(createFixture(), "p-2"), "p-3");
    const styled = setWriterParagraphStyle(
      setWriterParagraphAlignment(writer, "p-2", "right"),
      "p-2",
      "heading-1",
    );
    const movedUp = moveWriterParagraph(styled, "p-2", "up");
    const movedDown = moveWriterParagraph(movedUp, "p-2", "down");

    expect(movedUp.paragraphs[0]?.id).toBe("p-2");
    expect(movedUp.paragraphs[1]?.id).toBe("p-1");
    expect(movedUp.paragraphs[2]?.id).toBe("p-3");
    expect(movedUp.paragraphs[0]).toMatchObject({ alignment: "right", style: "heading-1" });
    expect(movedDown.paragraphs[0]?.id).toBe("p-1");
    expect(movedDown.paragraphs[1]?.id).toBe("p-2");
    expect(movedDown.paragraphs[2]?.id).toBe("p-3");
    expect(
      /** Executes the upper-boundary failure. @returns Invalid movement that always throws. */
      function movesFirstParagraphUp(): WriterDocument {
        return moveWriterParagraph(styled, "p-1", "up");
      },
    ).toThrowError();
    expect(
      /** Executes the lower-boundary failure. @returns Invalid movement that always throws. */
      function movesLastParagraphDown(): WriterDocument {
        return moveWriterParagraph(styled, "p-3", "down");
      },
    ).toThrowError();
    expect(
      /** Executes the missing-paragraph failure. @returns Invalid movement that always throws. */
      function movesMissingParagraph(): WriterDocument {
        return moveWriterParagraph(styled, "missing", "down");
      },
    ).toThrowError();
    expect(
      /** Executes the unsupported-direction failure. @returns Invalid movement that always throws. */
      function movesUnsupportedDirection(): WriterDocument {
        return moveUnsupportedDirection(styled);
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
      /** Executes the direct-format insertion boundary failure case for Vitest. @returns Invalid Writer insertion result; the delegated call always throws. */
      function insertsFormattedTextBeyondParagraph(): WriterDocument {
        return insertFormattedTextBeyondParagraph(writer);
      },
    ).toThrowError("Insertion offset is outside the paragraph.");
    expect(
      /** Executes the missing direct-format insertion paragraph failure case for Vitest. @returns Invalid Writer insertion result; the delegated call always throws. */
      function insertsFormattedTextIntoMissingParagraph(): WriterDocument {
        return insertFormattedTextIntoMissingParagraph(writer);
      },
    ).toThrowError("Unknown paragraph: missing");
    expect(
      /** Executes the missing direct-format paragraph failure case for Vitest. @returns Invalid Writer formatting result; the delegated call always throws. */
      function formatsMissingParagraph(): WriterDocument {
        return formatMissingParagraph(writer);
      },
    ).toThrowError("Unknown paragraph: missing");
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
