/**
 * @fileoverview Provides pure Writer workbench paragraph identity and focus-resolution helpers without React state or browser dependencies.
 */

import type { WriterDocument, WriterParagraph } from "../domain/writer";
import { createDocument } from "../domain/document";
import { createWriterDocument } from "../domain/writer";

/**
 * Creates the bounded initial Writer document used by the browser workbench session.
 *
 * @returns Immutable Writer document with one empty default-styled paragraph and new lifecycle state.
 */
export function createWriterWorkbenchDocument(): WriterDocument {
  return createWriterDocument(
    createDocument({
      id: "writer-workbench",
      suiteId: "writer",
      title: "Untitled Writer Document",
    }),
    "writer-paragraph-1",
  );
}

/**
 * Reads the first paragraph length used as the bounded workbench history selection position.
 *
 * @param writerDocument - Immutable Writer document with the non-empty body invariant.
 * @returns UTF-16 length of the first paragraph text for deterministic history selection.
 */
export function getWorkbenchSelectionPosition(writerDocument: WriterDocument): number {
  return (writerDocument.paragraphs[0] as WriterParagraph).text.length;
}

/**
 * Derives the first available numeric paragraph identity for the bounded Writer workbench document.
 *
 * @param writerDocument - Immutable Writer document whose existing identities are inspected.
 * @returns Stable next paragraph identity that does not collide with the current body.
 */
export function getNextWriterParagraphId(writerDocument: WriterDocument): string {
  let ordinal = writerDocument.paragraphs.length + 1;
  let candidate = `writer-paragraph-${ordinal}`;
  while (
    writerDocument.paragraphs.some(
      /**
       * Detects whether an existing paragraph owns the candidate identity.
       *
       * @param paragraph - Immutable paragraph candidate to inspect.
       * @returns True only when the candidate identity is already occupied.
       */
      function hasCandidateId(paragraph): boolean {
        return paragraph.id === candidate;
      },
    )
  ) {
    ordinal += 1;
    candidate = `writer-paragraph-${ordinal}`;
  }
  return candidate;
}

/**
 * Resolves the focused Writer paragraph or safely falls back to the first body paragraph.
 *
 * @param writerDocument - Immutable current Writer body whose paragraph identities are inspected.
 * @param preferredParagraphId - Last focused identity, which can be stale after history or loading.
 * @returns Existing preferred paragraph or the guaranteed first paragraph in the non-empty body.
 */
export function getActiveWriterParagraph(
  writerDocument: WriterDocument,
  preferredParagraphId: string,
): WriterParagraph {
  return (
    writerDocument.paragraphs.find(
      /**
       * Finds the paragraph that retains the currently focused identity.
       *
       * @param paragraph - Immutable paragraph candidate inspected without mutation.
       * @returns True only when the candidate owns preferredParagraphId.
       */
      function hasPreferredIdentity(paragraph): boolean {
        return paragraph.id === preferredParagraphId;
      },
    ) ?? (writerDocument.paragraphs[0] as WriterParagraph)
  );
}
