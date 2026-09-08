/**
 * @fileoverview Implements bounded Writer list-level commands at the LibreOffice `sw/source/uibase/shells/listsh.cxx` ownership boundary.
 */

import type { WriterDocument } from "../../core/doc/writer";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";

/** Identifies the two executable Writer list-level commands. */
export type WriterListLevelCommand = "demote" | "promote";

/**
 * Applies a bounded Writer Promote or Demote transition to one active list paragraph.
 *
 * Demote corresponds to `.uno:DecrementLevel` and increases the zero-based nesting level. Promote corresponds
 * to `.uno:IncrementLevel` and decreases it. Ordinary paragraphs and requests beyond either boundary are no-ops.
 *
 * @param writerDocument - Prior Writer document graph.
 * @param paragraphId - Existing paragraph identity targeted by the Writer list command.
 * @param command - Promote or Demote command requested by the Writer menu or numbering toolbar.
 * @returns Original document for non-list or boundary no-ops, otherwise a dirty document with only the level changed.
 * @throws {Error} When paragraphId or command is unsupported.
 */
export function changeWriterParagraphListLevel(
  writerDocument: WriterDocument,
  paragraphId: string,
  command: WriterListLevelCommand,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /** Finds the paragraph selected by stable identity. @param candidate - Immutable Writer paragraph candidate. @returns True only for paragraphId. */
    function hasParagraphId(candidate): boolean {
      return candidate.id === paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  if (command !== "demote" && command !== "promote")
    throw new Error(`Unsupported Writer list-level command: ${command}`);
  if (paragraph.list.kind === "none") return writerDocument;
  const nextLevel = command === "demote" ? paragraph.list.level + 1 : paragraph.list.level - 1;
  if (nextLevel < 0 || nextLevel > WRITER_MAX_LIST_LEVEL) return writerDocument;
  const next = writerDocument.clone();
  const nextParagraph = next.nodes.findTextNode(paragraphId) as typeof paragraph;
  nextParagraph.SetParagraphList({ ...nextParagraph.list, level: nextLevel });
  next.SetModified();
  return next;
}
