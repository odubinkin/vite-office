/**
 * @fileoverview Applies bounded immutable Writer text-range replacements at the LibreOffice `sw/source/core/doc/DocumentContentOperationsManager.cxx` ownership boundary.
 */

import { markDocumentDirty } from "../../../../sfx2/source/doc/docfac";
import {
  getWriterTextFromRuns,
  normalizeWriterTextRuns,
  splitWriterTextRuns,
  type WriterTextRun,
} from "../txtnode/ndtxt";
import type { WriterDocument, WriterParagraph } from "./writer";

/** Describes one non-empty or collapsed UTF-16 range inside a single Writer paragraph. */
export interface WriterParagraphTextRange {
  /** Exclusive UTF-16 range end relative to the visible paragraph text. */
  readonly end: number;
  /** Stable identity of the Writer paragraph containing both range endpoints. */
  readonly paragraphId: string;
  /** Inclusive UTF-16 range start relative to the visible paragraph text. */
  readonly start: number;
}

/**
 * Replaces one bounded same-paragraph Writer range with immutable direct-format runs.
 *
 * @param writerDocument - Immutable prior Writer document state.
 * @param range - Same-paragraph range to remove before inserting replacement runs.
 * @param replacementRuns - Untrusted or normalized direct-format runs that replace range text.
 * @returns Original document when visible text and normalized runs remain unchanged, otherwise a dirty replacement snapshot.
 * @throws {Error} When paragraphId is unknown or range offsets are not integer paragraph bounds.
 */
export function replaceWriterParagraphTextRange(
  writerDocument: WriterDocument,
  range: WriterParagraphTextRange,
  replacementRuns: unknown,
): WriterDocument {
  const paragraph = writerDocument.paragraphs.find(
    /** Finds the paragraph that contains the requested Writer range. @param candidate - Immutable paragraph candidate. @returns True only when candidate has range.paragraphId. */
    function hasRangeParagraphId(candidate): boolean {
      return candidate.id === range.paragraphId;
    },
  );
  if (paragraph === undefined) throw new Error(`Unknown paragraph: ${range.paragraphId}`);
  if (
    !Number.isInteger(range.start) ||
    !Number.isInteger(range.end) ||
    range.start < 0 ||
    range.end < range.start ||
    range.end > paragraph.text.length
  )
    throw new Error("Writer text range is outside the paragraph.");
  const runs = replaceWriterTextRuns(paragraph, range, replacementRuns);
  if (areWriterRunsEqual(paragraph.runs, runs)) return writerDocument;
  return {
    document: markDocumentDirty(writerDocument.document),
    paragraphs: writerDocument.paragraphs.map(
      /** Replaces only the selected paragraph text-run collection. @param candidate - Existing paragraph. @returns Updated selected paragraph or untouched sibling. */
      function replaceSelectedParagraph(candidate): WriterParagraph {
        return candidate.id === range.paragraphId
          ? { ...candidate, runs, text: getWriterTextFromRuns(runs) }
          : candidate;
      },
    ),
  };
}

/**
 * Produces the normalized run sequence around one validated text replacement.
 *
 * @param paragraph - Source paragraph owning the replacement range.
 * @param range - Valid same-paragraph UTF-16 replacement range.
 * @param replacementRuns - Candidate runs supplied by a browser clipboard boundary.
 * @returns Prefix, normalized replacement, and suffix runs merged where attributes match.
 */
function replaceWriterTextRuns(
  paragraph: WriterParagraph,
  range: WriterParagraphTextRange,
  replacementRuns: unknown,
): readonly WriterTextRun[] {
  const prefix = splitWriterTextRuns(paragraph.runs, range.start).prefix;
  const suffix = splitWriterTextRuns(paragraph.runs, range.end).suffix;
  return normalizeWriterTextRuns([
    ...prefix,
    ...normalizeWriterTextRuns(replacementRuns),
    ...suffix,
  ]);
}

/**
 * Compares direct-format run sequences without relying on persisted object identity.
 *
 * @param left - Existing normalized Writer runs.
 * @param right - Candidate normalized Writer runs.
 * @returns True only when visible text and every supported direct attribute match in order.
 */
function areWriterRunsEqual(
  left: readonly WriterTextRun[],
  right: readonly WriterTextRun[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      /** Compares one deterministic run position. @param run - Existing Writer run. @param index - Ordered run index. @returns True only when candidate run exactly matches. */
      function matchesRun(run, index): boolean {
        const candidate = right[index] as WriterTextRun;
        return (
          run.text === candidate.text &&
          run.attributes.bold === candidate.attributes.bold &&
          run.attributes.italic === candidate.attributes.italic &&
          run.attributes.underline === candidate.attributes.underline
        );
      },
    )
  );
}
