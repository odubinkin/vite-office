/**
 * @fileoverview Applies bounded Writer direct character attributes at the LibreOffice `sw/source/uibase/shells/txtattr.cxx` command-shell ownership boundary.
 */

import {
  toggleWriterParagraphCharacterFormat,
  type WriterCharacterFormat,
  type WriterDocument,
} from "../../core/doc/writer";

/** Describes a same-paragraph browser selection eligible for a direct Writer character command. */
export interface WriterCharacterSelection {
  /** Exclusive UTF-16 range end inside paragraphId. */
  readonly end: number;
  /** Stable identity of the selected Writer paragraph. */
  readonly paragraphId: string;
  /** Inclusive UTF-16 range start inside paragraphId. */
  readonly start: number;
}

/**
 * Toggles a Writer direct character attribute over one non-empty same-paragraph selection.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param selection - Browser selection resolved to one Writer paragraph range.
 * @param format - Direct Writer character command selected by UI or shortcut.
 * @returns Original document when the selection is collapsed, otherwise the document with formatted runs.
 */
export function toggleWriterCharacterFormat(
  writerDocument: WriterDocument,
  selection: WriterCharacterSelection,
  format: WriterCharacterFormat,
): WriterDocument {
  return selection.start === selection.end
    ? writerDocument
    : toggleWriterParagraphCharacterFormat(
        writerDocument,
        selection.paragraphId,
        selection.start,
        selection.end,
        format,
      );
}
