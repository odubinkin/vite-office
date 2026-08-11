/** @fileoverview Provides immutable Writer paragraph structure transitions without browser or layout dependencies. */

import { markDocumentDirty } from "./document";
import type { WriterDocument, WriterParagraph, WriterParagraphMoveDirection } from "./writer";

/**
 * Moves one named Writer paragraph by one adjacent position without changing paragraph content.
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
    /** Finds the selected paragraph position. @param paragraph - Paragraph inspected without mutation. @returns True only when paragraph owns paragraphId. */
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
    /** Finds the requested paragraph. @param candidate - Paragraph inspected without mutation. @returns True only when candidate owns paragraphId. */
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
      /** Omits only paragraphId. @param candidate - Paragraph retained or removed. @returns True when candidate is retained. */
      function omitsSelectedParagraph(candidate): boolean {
        return candidate.id !== paragraphId;
      },
    ),
  };
}
