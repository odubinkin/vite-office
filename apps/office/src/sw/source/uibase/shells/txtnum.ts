/**
 * @fileoverview Implements the browser Writer equivalents of `FN_NUM_BULLET_ON`, `FN_NUM_NUMBERING_ON`, and `FN_NUM_BULLET_OFF` from LibreOffice `sw/source/uibase/shells/txtnum.cxx`.
 */

import { markDocumentDirty } from "../../../../sfx2/source/doc/docfac";
import type { WriterDocument, WriterParagraph } from "../../core/doc/writer";
import { isWriterParagraphListKind, type WriterParagraphListKind } from "../../core/doc/list";

/**
 * Changes one paragraph's default Writer list presentation and marks a changed document dirty.
 *
 * The transition preserves the current level and future style metadata so later list-level and named-style commands
 * can extend this first command layer without replacing paragraph serialization.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param paragraphId - Existing paragraph identity whose list presentation changes.
 * @param listKind - Supported next bullet, numbered, or no-list presentation.
 * @returns Original document for an identical list kind, otherwise a dirty document with one updated paragraph.
 * @throws {Error} When paragraphId is absent or listKind is unsupported.
 */
export function setWriterParagraphListKind(
  writerDocument: WriterDocument,
  paragraphId: string,
  listKind: WriterParagraphListKind,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /** Finds the paragraph selected by stable identity. @param candidate - Immutable paragraph candidate. @returns True only when candidate owns paragraphId. */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (!isWriterParagraphListKind(listKind))
    throw new Error(`Unsupported Writer paragraph list kind: ${listKind}`);
  if (paragraph.list.kind === listKind) return writerDocument;
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /** Replaces only the selected paragraph list kind. @param candidate - Immutable paragraph candidate. @returns Updated selected paragraph or original sibling. */
      function updateSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === paragraphId
          ? { ...candidate, list: { ...candidate.list, kind: listKind } }
          : candidate;
      },
    ),
  };
}
