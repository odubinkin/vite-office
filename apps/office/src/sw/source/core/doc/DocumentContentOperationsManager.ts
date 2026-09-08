/**
 * @fileoverview Implements bounded SwPaM content operations at the pinned LibreOffice `sw/source/core/doc/DocumentContentOperationsManager.cxx` boundary.
 */

import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode, normalizeWriterTextRuns, type WriterTextRun } from "../txtnode/ndtxt";
import type { SwDoc, WriterDocument } from "./writer";

/** Describes one browser range that can be converted to a same-node SwPaM. */
export interface WriterParagraphTextRange {
  /** Exclusive UTF-16 range end relative to the text node. */
  readonly end: number;
  /** Stable identity of the SwTextNode containing both endpoints. */
  readonly paragraphId: string;
  /** Inclusive UTF-16 range start relative to the text node. */
  readonly start: number;
}

/** Applies Writer content mutations through SwPosition and SwPaM rather than view identities. */
export class DocumentContentOperationsManager {
  /** Creates the operations façade for one canonical SwDoc. @param document - Mutated Writer document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {}

  /** Replaces a same-node point-and-mark range with normalized text portions. @param range - Model range to replace. @param replacementRuns - Replacement content. @returns Nothing. */
  public ReplaceRange(range: SwPaM, replacementRuns: unknown): void {
    const start = range.Start();
    const end = range.End();
    const node = start.GetNode();
    if (!(node instanceof SwTextNode) || end.GetNode() !== node)
      throw new Error("Writer replacement range must stay inside one SwTextNode.");
    node.ReplaceRange(start.GetContentIndex(), end.GetContentIndex(), replacementRuns);
    this.document.SetModified();
  }

  /** Inserts plain text at one SwPosition using the node's inherited auto-format items. @param position - Model insertion position. @param text - Inserted plain text. @returns Nothing. */
  public InsertString(position: SwPosition, text: string): void {
    const node = position.GetNode();
    if (!(node instanceof SwTextNode)) throw new Error("Writer insertion requires a SwTextNode.");
    if (text.length === 0) return;
    node.InsertText(text, position.GetContentIndex());
    this.document.SetModified();
  }

  /** Deletes a bounded same-node SwPaM range. @param range - Model range to delete. @returns Nothing. */
  public DeleteRange(range: SwPaM): void {
    const start = range.Start();
    const end = range.End();
    const node = start.GetNode();
    if (!(node instanceof SwTextNode) || end.GetNode() !== node)
      throw new Error("Writer deletion range must stay inside one SwTextNode.");
    if (start.compare(end) === 0) return;
    node.EraseText(start.GetContentIndex(), end.GetContentIndex() - start.GetContentIndex());
    this.document.SetModified();
  }
}

/** Replaces one browser-resolved range through a direction-preserving SwPaM. @param writerDocument - Prior document graph. @param range - Browser-resolved range. @param replacementRuns - Replacement content. @returns Original graph for a no-op, otherwise a changed clone. */
export function replaceWriterParagraphTextRange(
  writerDocument: WriterDocument,
  range: WriterParagraphTextRange,
  replacementRuns: unknown,
): WriterDocument {
  const source = writerDocument.nodes.findTextNode(range.paragraphId);
  if (source === undefined) throw new Error(`Unknown paragraph: ${range.paragraphId}`);
  assertRange(source, range);
  const normalized = normalizeWriterTextRuns(replacementRuns);
  if (replacementIsEqual(source, range, normalized)) return writerDocument;
  const next = writerDocument.clone();
  const node = next.nodes.findTextNode(range.paragraphId) as SwTextNode;
  const point = new SwPosition(node, range.end);
  const mark = new SwPosition(node, range.start);
  new DocumentContentOperationsManager(next).ReplaceRange(new SwPaM(point, mark), normalized);
  return next;
}

/** Validates a browser range before constructing model positions. @param node - Range text node. @param range - Candidate range. @returns Nothing. */
function assertRange(node: SwTextNode, range: WriterParagraphTextRange): void {
  if (
    !Number.isInteger(range.start) ||
    !Number.isInteger(range.end) ||
    range.start < 0 ||
    range.end < range.start ||
    range.end > node.Len()
  )
    throw new Error("Writer text range is outside the paragraph.");
}

/** Detects a range replacement that leaves canonical text and auto-format hints unchanged. @param node - Selected text node. @param range - Replaced range. @param replacement - Normalized replacement. @returns True when replacement is a no-op. */
function replacementIsEqual(
  node: SwTextNode,
  range: WriterParagraphTextRange,
  replacement: readonly WriterTextRun[],
): boolean {
  const selected = node.runs.flatMap(
    /** Clips one complete view run to the selected range. @param run - Derived node run. @param index - Run order. @returns Selected fragment or nothing. */
    function clipRun(run, index): readonly WriterTextRun[] {
      const runStart = node.runs.slice(0, index).reduce(
        /** Sums preceding run lengths. @param total - Accumulated offset. @param preceding - Earlier run. @returns Updated offset. */
        function addLength(total, preceding): number {
          return total + preceding.text.length;
        },
        0,
      );
      const start = Math.max(range.start, runStart);
      const end = Math.min(range.end, runStart + run.text.length);
      return end <= start
        ? []
        : [{ attributes: run.attributes, text: run.text.slice(start - runStart, end - runStart) }];
    },
  );
  return JSON.stringify(normalizeWriterTextRuns(selected)) === JSON.stringify(replacement);
}
