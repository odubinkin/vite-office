/**
 * @fileoverview Defines a narrow serializable Writer paragraph body and pure editing operations without layout, formatting, or browser coupling.
 */

import { markDocumentDirty, type OfficeDocument } from "./document";

/** Describes one immutable plain-text Writer paragraph. */
export interface WriterParagraph {
  /** Stable caller-provided paragraph identity. */
  readonly id: string;
  /** Plain Unicode text; inline formatting remains out of scope. */
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
  return { document, paragraphs: [{ id: paragraphId, text: "" }] };
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
    paragraphs: [...writerDocument.paragraphs, { id: paragraphId, text: "" }],
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
              text: `${candidate.text.slice(0, offset)}${text}${candidate.text.slice(offset)}`,
            }
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
        return candidate.id === paragraphId ? { ...candidate, text } : candidate;
      },
    ),
  };
}
