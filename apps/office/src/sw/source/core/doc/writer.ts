/**
 * @fileoverview Defines a narrow serializable Writer paragraph body and pure editing operations without layout, formatting, or browser coupling.
 */

import { markDocumentDirty, type OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import {
  createDefaultWriterParagraphList,
  normalizeWriterParagraphList,
  type WriterParagraphList,
} from "./list";
import {
  createWriterTextRuns,
  getWriterTextAttributesAtOffset,
  getWriterTextFromRuns,
  insertWriterTextRun,
  normalizeWriterTextRuns,
  splitWriterTextRuns,
  toggleWriterTextRangeFormat,
  type WriterCharacterFormat,
  type WriterTextRun,
} from "../txtnode/ndtxt";
export { moveWriterParagraph, removeWriterParagraph } from "../docnode/node";
export { isWriterParagraphListKind, WRITER_PARAGRAPH_LIST_KINDS } from "./list";
export type { WriterParagraphList, WriterParagraphListKind } from "./list";
export { getWriterParagraphListMarker } from "./number";
export type { WriterNumberingParagraph } from "./number";
export type {
  WriterCharacterAttributes,
  WriterCharacterFormat,
  WriterTextRun,
} from "../txtnode/ndtxt";

/** Enumerates the bounded paragraph alignments available in the Writer workbench. */
export const WRITER_PARAGRAPH_ALIGNMENTS = ["left", "center", "right", "justify"] as const;

/** Identifies one supported horizontal paragraph alignment. */
export type WriterParagraphAlignment = (typeof WRITER_PARAGRAPH_ALIGNMENTS)[number];

/** Enumerates the bounded paragraph styles currently available in the Writer workbench. */
export const WRITER_PARAGRAPH_STYLES = ["default", "heading-1"] as const;

/** Identifies one supported Writer paragraph style without modeling style inheritance. */
export type WriterParagraphStyle = (typeof WRITER_PARAGRAPH_STYLES)[number];

/** Identifies a one-position movement direction in an ordered Writer paragraph body. */
export type WriterParagraphMoveDirection = "up" | "down";

/** Describes one immutable plain-text Writer paragraph. */
export interface WriterParagraph {
  /** Horizontal presentation alignment applied to the complete paragraph. */
  readonly alignment: WriterParagraphAlignment;
  /** Stable caller-provided paragraph identity. */
  readonly id: string;
  /** Serializable list state retained independently from paragraph text and style. */
  readonly list: WriterParagraphList;
  /** Canonical direct-format text runs from which the compatibility text projection is derived. */
  readonly runs: readonly WriterTextRun[];
  /** Bounded direct paragraph-style choice applied to the complete paragraph. */
  readonly style: WriterParagraphStyle;
  /** Visible plain Unicode text deterministically derived from runs for existing plain-text consumers. */
  readonly text: string;
}

/** Describes a document header paired with an ordered immutable paragraph body. */
export interface WriterDocument {
  /** Shared serializable document lifecycle header. */
  readonly document: OfficeDocument;
  /** Non-empty ordered plain-text paragraph body. */
  readonly paragraphs: readonly WriterParagraph[];
}

/**
 * Creates a Writer body with one empty paragraph.
 *
 * @param document - Shared Writer document header that remains unmodified.
 * @param paragraphId - Stable non-empty identity for the initial paragraph.
 * @returns Immutable Writer document body with one empty paragraph.
 * @throws {Error} When paragraphId is blank.
 */
export function createWriterDocument(
  document: OfficeDocument,
  paragraphId: string,
): WriterDocument {
  if (paragraphId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
  return {
    document,
    paragraphs: [
      {
        alignment: "left",
        id: paragraphId,
        list: createDefaultWriterParagraphList(),
        runs: [],
        style: "default",
        text: "",
      },
    ],
  };
}

/**
 * Appends one empty plain-text paragraph to the ordered Writer body and marks the document dirty.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Stable non-empty identity for the appended paragraph.
 * @returns New Writer document with the appended empty paragraph and dirty lifecycle header.
 * @throws {Error} When paragraphId is blank or already exists in the document.
 */
export function appendWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
): WriterDocument {
  if (paragraphId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
  const existingParagraph = writerDocument.paragraphs.find(
    /**
     * Finds an existing paragraph whose identity would collide with the requested append.
     *
     * @param candidate - Immutable paragraph candidate to inspect.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (existingParagraph !== undefined) throw new Error(`Duplicate paragraph: ${paragraphId}`);
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: [
      ...writerDocument.paragraphs,
      {
        alignment: "left",
        id: paragraphId,
        list: createDefaultWriterParagraphList(),
        runs: [],
        style: "default",
        text: "",
      },
    ],
  };
}

/**
 * Splits one plain-text Writer paragraph at a UTF-16 caret offset and inserts the trailing text as its adjacent sibling.
 *
 * The inserted paragraph inherits the source paragraph's bounded alignment and style, which mirrors ordinary Writer
 * paragraph-break editing within this plain-text model.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing stable identity of the paragraph that contains the caret.
 * @param offset - Integer UTF-16 caret offset from zero through the source paragraph text length.
 * @param nextParagraphId - Stable non-empty identity reserved for the newly inserted adjacent paragraph.
 * @returns New dirty Writer document with source-prefix text and an immediately following inherited-format paragraph.
 * @throws {Error} When either paragraph identity is invalid or duplicated, the source paragraph is absent, or offset is outside the permitted integer range.
 */
export function splitWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
  offset: number,
  nextParagraphId: string,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /**
     * Finds the paragraph selected by the requested stable identity.
     *
     * @param candidate - Immutable paragraph candidate to inspect.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (nextParagraphId.trim().length === 0) throw new Error("Paragraph id must not be blank.");
  if (
    writerDocument.paragraphs.some(
      /**
       * Detects a collision between an existing paragraph and the requested inserted identity.
       *
       * @param candidate - Immutable paragraph candidate to inspect.
       * @returns True only when candidate owns nextParagraphId.
       */
      function hasNextParagraphId(candidate): boolean {
        return candidate.id === nextParagraphId;
      },
    )
  ) {
    throw new Error(`Duplicate paragraph: ${nextParagraphId}`);
  }
  if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.text.length)
    throw new Error("Split offset is outside the paragraph.");
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.flatMap(
      /**
       * Replaces only the source paragraph with its prefix and inherited-format trailing sibling.
       *
       * @param candidate - Immutable paragraph candidate preserved or split without mutation.
       * @returns One preserved paragraph or the two immutable paragraphs produced by the split.
       */
      function splitSelectedParagraph(candidate): readonly WriterParagraph[] {
        return candidate.id === paragraphId
          ? [...splitWriterParagraphRuns(candidate, offset, nextParagraphId)]
          : [candidate];
      },
    ),
  };
}

/**
 * Joins one non-first Writer paragraph into its preceding sibling and removes the paragraph-break boundary.
 *
 * The preceding paragraph remains the surviving paragraph and therefore retains its stable identity and bounded
 * formatting while the selected paragraph's complete text is appended.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing non-first paragraph identity selected at its start-caret boundary.
 * @returns New dirty Writer document with paragraphId removed and its text appended to the preceding paragraph.
 * @throws {Error} When paragraphId is absent or identifies the first paragraph, which has no preceding sibling.
 */
export function mergeWriterParagraphWithPrevious(
  writerDocument: WriterDocument,
  paragraphId: string,
): WriterDocument {
  const paragraphIndex = writerDocument.paragraphs.findIndex(
    /**
     * Finds the ordered paragraph selected for removal of its preceding break.
     *
     * @param candidate - Immutable paragraph candidate inspected without mutation.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraphIndex < 0) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (paragraphIndex === 0) throw new Error("First Writer paragraph has no preceding paragraph.");
  const precedingParagraph = writerDocument.paragraphs[paragraphIndex - 1] as WriterParagraph;
  const selectedParagraph = writerDocument.paragraphs[paragraphIndex] as WriterParagraph;
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.flatMap(
      /**
       * Keeps unrelated entries, replaces the preceding paragraph with joined text, and omits the selected paragraph.
       *
       * @param candidate - Immutable paragraph candidate preserved, updated, or omitted without mutation.
       * @returns One retained paragraph, one updated preceding paragraph, or no paragraph for the removed selected entry.
       */
      function joinAdjacentParagraphs(candidate): readonly WriterParagraph[] {
        if (candidate.id === precedingParagraph.id) {
          const runs = normalizeWriterTextRuns([...candidate.runs, ...selectedParagraph.runs]);
          return [{ ...candidate, runs, text: getWriterTextFromRuns(runs) }];
        }
        return candidate.id === paragraphId ? [] : [candidate];
      },
    ),
  };
}

/**
 * Inserts text at one zero-based UTF-16 offset in a named paragraph and marks the document dirty.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity to edit.
 * @param offset - Integer UTF-16 insertion offset from zero through paragraph text length.
 * @param text - Text to insert without mutation or formatting interpretation.
 * @returns New immutable Writer document with updated paragraph text and dirty lifecycle header.
 * @throws {Error} When paragraph is absent or offset is outside the permitted integer range.
 */
export function insertWriterText(
  writerDocument: WriterDocument,
  paragraphId: string,
  offset: number,
  text: string,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /**
     * Finds the paragraph selected by the requested stable identity.
     *
     * @param candidate - Immutable paragraph candidate to inspect.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.text.length)
    throw new Error("Insertion offset is outside the paragraph.");
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /**
       * Replaces only the selected paragraph while preserving every sibling object.
       *
       * @param candidate - Immutable paragraph candidate to preserve or update.
       * @returns Updated selected paragraph or the original sibling reference.
       */
      function updateSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId
          ? {
              ...candidate,
              runs: insertWriterTextRun(
                candidate.runs,
                offset,
                text,
                getWriterTextAttributes(candidate),
              ),
              text: `${candidate.text.slice(0, offset)}${text}${candidate.text.slice(offset)}`,
            }
          : candidate;
      },
    ),
  };
}

/**
 * Inserts text with explicit direct character attributes at one Writer paragraph offset.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity that owns the insertion.
 * @param offset - Integer UTF-16 insertion offset from zero through paragraph text length.
 * @param text - Text to insert without formatting interpretation.
 * @param attributes - Direct character attributes applied to the inserted text.
 * @returns New immutable Writer document with updated runs and a dirty lifecycle header.
 * @throws {Error} When paragraph is absent or offset is outside the permitted integer range.
 */
export function insertWriterTextWithAttributes(
  writerDocument: WriterDocument,
  paragraphId: string,
  offset: number,
  text: string,
  attributes: import("../txtnode/ndtxt").WriterCharacterAttributes,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /** Finds the paragraph selected by the requested stable identity. @param candidate - Immutable paragraph candidate to inspect. @returns True only when candidate owns paragraphId. */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (!Number.isInteger(offset) || offset < 0 || offset > paragraph.text.length)
    throw new Error("Insertion offset is outside the paragraph.");
  const runs = insertWriterTextRun(paragraph.runs, offset, text, attributes);
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /** Replaces only the selected paragraph runs. @param candidate - Immutable paragraph candidate. @returns Updated selected paragraph or original sibling. */
      function updateSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId
          ? { ...candidate, runs, text: getWriterTextFromRuns(runs) }
          : candidate;
      },
    ),
  };
}

/**
 * Replaces the complete plain-text content of one named paragraph and marks a changed document dirty.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity to replace.
 * @param text - Complete replacement text without formatting interpretation.
 * @returns The original document when text is unchanged, otherwise a new immutable Writer document.
 * @throws {Error} When paragraphId does not identify a paragraph in writerDocument.
 */
export function replaceWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
  text: string,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /**
     * Finds the paragraph selected by the requested stable identity.
     *
     * @param candidate - Immutable paragraph candidate to inspect.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (paragraph.text === text) return writerDocument;
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /**
       * Replaces only the selected paragraph while preserving every sibling object.
       *
       * @param candidate - Immutable paragraph candidate to preserve or update.
       * @returns Updated selected paragraph or the original sibling reference.
       */
      function updateSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId
          ? { ...candidate, runs: createWriterTextRuns(text), text }
          : candidate;
      },
    ),
  };
}

/**
 * Changes one paragraph's horizontal alignment and marks a changed document dirty.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity whose alignment changes.
 * @param alignment - Supported next alignment applied to the complete paragraph.
 * @returns Original document for an identical alignment, otherwise a dirty document with one updated paragraph.
 * @throws {Error} When paragraphId is absent or alignment is unsupported.
 */
export function setWriterParagraphAlignment(
  writerDocument: WriterDocument,
  paragraphId: string,
  alignment: WriterParagraphAlignment,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /**
     * Finds the paragraph selected by the requested stable identity.
     *
     * @param candidate - Immutable paragraph candidate to inspect.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (!isWriterParagraphAlignment(alignment))
    throw new Error(`Unsupported Writer paragraph alignment: ${alignment}`);
  if (paragraph.alignment === alignment) return writerDocument;
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /**
       * Replaces only the selected paragraph alignment while preserving sibling object references.
       *
       * @param candidate - Immutable paragraph candidate to preserve or update.
       * @returns Updated selected paragraph or the original sibling reference.
       */
      function updateSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId ? { ...candidate, alignment } : candidate;
      },
    ),
  };
}

/**
 * Restores default alignment and style values for legacy or malformed stored paragraph formatting.
 *
 * @param writerDocument - Writer document read from a prior browser-local snapshot.
 * @returns The original document when every formatting value is supported, otherwise a normalized immutable copy.
 */
export function normalizeWriterParagraphFormatting(writerDocument: WriterDocument): WriterDocument {
  let containsUnsupportedFormatting = false;
  const paragraphs = writerDocument.paragraphs.map(
    /**
     * Preserves supported values and supplies legacy defaults for absent or unsupported formatting values.
     *
     * @param paragraph - Stored paragraph whose alignment requires validation.
     * @returns Original paragraph for supported values or an immutable replacement with safe defaults.
     */
    function normalizeParagraphFormatting(paragraph): WriterParagraph {
      const alignment = isWriterParagraphAlignment(paragraph.alignment)
        ? paragraph.alignment
        : "left";
      const style = isWriterParagraphStyle(paragraph.style) ? paragraph.style : "default";
      const list = normalizeWriterParagraphList(paragraph.list);
      const runs = normalizeWriterTextRuns(paragraph.runs);
      const text =
        runs.length === 0 && paragraph.text.length > 0
          ? paragraph.text
          : getWriterTextFromRuns(runs);
      const normalizedRuns =
        runs.length === 0 && text.length > 0 ? createWriterTextRuns(text) : runs;
      if (
        alignment === paragraph.alignment &&
        style === paragraph.style &&
        list.kind === paragraph.list?.kind &&
        list.level === paragraph.list?.level &&
        list.styleId === paragraph.list?.styleId &&
        text === paragraph.text &&
        areWriterTextRunsEquivalent(normalizedRuns, paragraph.runs)
      )
        return paragraph;
      containsUnsupportedFormatting = true;
      return { ...paragraph, alignment, list, runs: normalizedRuns, style, text };
    },
  );
  return containsUnsupportedFormatting ? { ...writerDocument, paragraphs } : writerDocument;
}

/**
 * Checks whether an unknown runtime value is a supported Writer paragraph alignment.
 *
 * @param value - Runtime candidate supplied by a storage snapshot or a boundary caller.
 * @returns True only when value is one of the declared alignment literals.
 */
export function isWriterParagraphAlignment(value: unknown): value is WriterParagraphAlignment {
  return WRITER_PARAGRAPH_ALIGNMENTS.some(
    /**
     * Compares one supported literal with the supplied runtime candidate.
     *
     * @param alignment - Supported alignment literal to compare.
     * @returns True only when the supplied value matches alignment exactly.
     */
    function matchesAlignment(alignment): boolean {
      return alignment === value;
    },
  );
}

/**
 * Changes one paragraph's bounded style and marks a changed document dirty.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity whose style changes.
 * @param style - Supported next style applied to the complete paragraph.
 * @returns Original document for an identical style, otherwise a dirty document with one updated paragraph.
 * @throws {Error} When paragraphId is absent or style is unsupported.
 */
export function setWriterParagraphStyle(
  writerDocument: WriterDocument,
  paragraphId: string,
  style: WriterParagraphStyle,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /**
     * Finds the paragraph selected by the requested stable identity.
     *
     * @param candidate - Immutable paragraph candidate to inspect.
     * @returns True only when candidate owns paragraphId.
     */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (!isWriterParagraphStyle(style))
    throw new Error(`Unsupported Writer paragraph style: ${style}`);
  if (paragraph.style === style) return writerDocument;
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /**
       * Replaces only the selected paragraph style while preserving sibling object references.
       *
       * @param candidate - Immutable paragraph candidate to preserve or update.
       * @returns Updated selected paragraph or the original sibling reference.
       */
      function updateSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId ? { ...candidate, style } : candidate;
      },
    ),
  };
}

/**
 * Toggles one direct character format over a non-empty same-paragraph range and marks a changed document dirty.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity that owns the selected range.
 * @param start - Inclusive UTF-16 range start inside the paragraph.
 * @param end - Exclusive UTF-16 range end inside the paragraph.
 * @param format - Direct character format selected from a Writer command.
 * @returns Original document for a no-op normalized run sequence, otherwise a dirty document with formatted runs.
 * @throws {Error} When paragraphId is absent or range bounds are invalid.
 */
export function toggleWriterParagraphCharacterFormat(
  writerDocument: WriterDocument,
  paragraphId: string,
  start: number,
  end: number,
  format: WriterCharacterFormat,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /** Finds the paragraph selected for direct character formatting. @param candidate - Immutable paragraph candidate. @returns True only when it owns paragraphId. */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (start === end) return writerDocument;
  const runs = toggleWriterTextRangeFormat(paragraph.runs, start, end, format);
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /** Replaces exactly one formatted paragraph while retaining all siblings. @param candidate - Immutable paragraph candidate. @returns Updated selected paragraph or original sibling. */
      function updateFormattedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId
          ? { ...candidate, runs, text: getWriterTextFromRuns(runs) }
          : candidate;
      },
    ),
  };
}

/**
 * Checks whether an unknown runtime value is a supported Writer paragraph style.
 *
 * @param value - Runtime candidate supplied by a storage snapshot or a boundary caller.
 * @returns True only when value is one of the declared paragraph-style literals.
 */
export function isWriterParagraphStyle(value: unknown): value is WriterParagraphStyle {
  return WRITER_PARAGRAPH_STYLES.some(
    /**
     * Compares one supported literal with the supplied runtime candidate.
     *
     * @param style - Supported paragraph-style literal to compare.
     * @returns True only when the supplied value matches style exactly.
     */
    function matchesStyle(style): boolean {
      return style === value;
    },
  );
}

/**
 * Splits one Writer paragraph while retaining direct character runs on both adjacent output paragraphs.
 *
 * @param paragraph - Immutable source paragraph selected for a paragraph-break split.
 * @param offset - Valid UTF-16 split offset inside paragraph.text.
 * @param nextParagraphId - Reserved stable identity for the trailing output paragraph.
 * @returns Prefix and suffix paragraphs with text compatibility projections derived from their runs.
 */
function splitWriterParagraphRuns(
  paragraph: WriterParagraph,
  offset: number,
  nextParagraphId: string,
): readonly WriterParagraph[] {
  const split = splitWriterTextRuns(paragraph.runs, offset);
  return [
    { ...paragraph, runs: split.prefix, text: getWriterTextFromRuns(split.prefix) },
    {
      ...paragraph,
      id: nextParagraphId,
      runs: split.suffix,
      text: getWriterTextFromRuns(split.suffix),
    },
  ];
}

/**
 * Reads collapsed-caret attributes at a Writer paragraph end for the legacy plain-text insertion helper.
 *
 * @param paragraph - Immutable paragraph that owns the requested insertion.
 * @returns Direct attributes inherited at the end of paragraph text.
 */
function getWriterTextAttributes(paragraph: WriterParagraph) {
  return getWriterTextAttributesAtOffset(paragraph.runs, paragraph.text.length);
}

/** Compares normalized and stored Writer run sequences without relying on object identity. @param left - Normalized direct-format run sequence. @param right - Stored candidate run sequence. @returns True only when stored runs already have identical normalized text and attributes. */
function areWriterTextRunsEquivalent(left: readonly WriterTextRun[], right: unknown): boolean {
  const normalizedRight = normalizeWriterTextRuns(right);
  return (
    left.length === normalizedRight.length &&
    left.every(
      /** Compares one run at its deterministic ordered index. @param run - Expected normalized run. @param index - Ordered run position. @returns True only when the stored run matches every bounded attribute and text. */
      function matchesStoredRun(run, index): boolean {
        const storedRun = normalizedRight[index] as WriterTextRun;
        return (
          run.text === storedRun.text &&
          run.attributes.bold === storedRun.attributes.bold &&
          run.attributes.italic === storedRun.attributes.italic &&
          run.attributes.underline === storedRun.attributes.underline
        );
      },
    )
  );
}
