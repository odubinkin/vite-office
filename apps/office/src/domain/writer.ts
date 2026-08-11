/**
 * @fileoverview Defines a narrow serializable Writer paragraph body and pure editing operations without layout, formatting, or browser coupling.
 */

import { markDocumentDirty, type OfficeDocument } from "./document";

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
  /** Bounded direct paragraph-style choice applied to the complete paragraph. */
  readonly style: WriterParagraphStyle;
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
  return {
    document,
    paragraphs: [{ alignment: "left", id: paragraphId, style: "default", text: "" }],
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
      { alignment: "left", id: paragraphId, style: "default", text: "" },
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
          ? [
              { ...candidate, text: candidate.text.slice(0, offset) },
              { ...candidate, id: nextParagraphId, text: candidate.text.slice(offset) },
            ]
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
        if (candidate.id === precedingParagraph.id)
          return [{ ...candidate, text: `${candidate.text}${selectedParagraph.text}` }];
        return candidate.id === paragraphId ? [] : [candidate];
      },
    ),
  };
}

/**
 * Removes one named paragraph while preserving the non-empty Writer body invariant.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Stable identity of the paragraph to remove.
 * @returns New Writer document without the selected paragraph and with a dirty lifecycle header.
 * @throws {Error} When paragraphId is absent or the document has only one paragraph.
 */
export function removeWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
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
  if (writerDocument.paragraphs.length === 1)
    throw new Error("Writer document must retain one paragraph.");
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.filter(
      /**
       * Omits only the selected paragraph while preserving sibling order and references.
       *
       * @param candidate - Immutable paragraph candidate to retain or remove.
       * @returns True only when candidate is not the paragraph selected for removal.
       */
      function omitsSelectedParagraph(candidate): boolean {
        return candidate.id !== paragraphId;
      },
    ),
  };
}

/**
 * Moves one named Writer paragraph by one adjacent position without changing any paragraph content.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity selected for movement.
 * @param direction - One-position movement direction in the ordered paragraph body.
 * @returns Dirty Writer document with the selected paragraph swapped with its adjacent neighbor.
 * @throws {Error} When paragraphId is absent, direction is unsupported, or movement crosses a body boundary.
 */
export function moveWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
  direction: WriterParagraphMoveDirection,
): WriterDocument {
  const currentIndex = writerDocument.paragraphs.findIndex(
    /**
     * Finds the current body position of the paragraph selected for movement.
     *
     * @param paragraph - Immutable Writer paragraph inspected without mutation.
     * @returns True only when paragraph owns paragraphId.
     */
    function hasParagraphId(paragraph): boolean {
      return paragraph.id === paragraphId;
    },
  );
  if (currentIndex < 0) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (direction !== "up" && direction !== "down")
    throw new Error(`Unsupported Writer paragraph direction: ${direction}`);
  const nextIndex = currentIndex + (direction === "up" ? -1 : 1);
  if (nextIndex < 0 || nextIndex >= writerDocument.paragraphs.length)
    throw new Error("Writer paragraph movement crosses the document boundary.");
  const paragraphs = [...writerDocument.paragraphs];
  const movedParagraph = paragraphs[currentIndex] as WriterParagraph;
  paragraphs[currentIndex] = paragraphs[nextIndex] as WriterParagraph;
  paragraphs[nextIndex] = movedParagraph;
  return { document: markDocumentDirty(writerDocument.document), paragraphs };
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
      if (alignment === paragraph.alignment && style === paragraph.style) return paragraph;
      containsUnsupportedFormatting = true;
      return { ...paragraph, alignment, style };
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
