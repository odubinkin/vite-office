/** @fileoverview Provides pure Writer workbench document and paragraph identity helpers. */

import {
  createWriterDocument,
  type WriterDocument,
  type WriterParagraph,
} from "../../core/doc/writer";

/** Creates the initial empty Writer document used by the browser session. @returns New canonical SwDoc. */
export function createWriterWorkbenchDocument(): WriterDocument {
  return createWriterDocument("writer-paragraph-1");
}

/** Derives the first available numeric paragraph identity. @param writerDocument - Current Writer graph. @returns Stable non-colliding identity. */
export function getNextWriterParagraphId(writerDocument: WriterDocument): string {
  let ordinal = writerDocument.paragraphs.length + 1;
  let candidate = `writer-paragraph-${ordinal}`;
  while (
    writerDocument.paragraphs.some(
      /** Checks one paragraph identity. @param paragraph - Existing node. @returns Whether candidate is occupied. */
      (paragraph) => paragraph.id === candidate,
    )
  ) {
    ordinal += 1;
    candidate = `writer-paragraph-${ordinal}`;
  }
  return candidate;
}

/** Resolves the focused paragraph or the non-empty body's first node. @param writerDocument - Current Writer graph. @param preferredParagraphId - Preferred node identity. @returns Existing preferred or first paragraph. */
export function getActiveWriterParagraph(
  writerDocument: WriterDocument,
  preferredParagraphId: string,
): WriterParagraph {
  return (
    writerDocument.paragraphs.find(
      /** Matches the preferred identity. @param paragraph - Candidate node. @returns Whether IDs match. */
      (paragraph) => paragraph.id === preferredParagraphId,
    ) ?? (writerDocument.paragraphs[0] as WriterParagraph)
  );
}
