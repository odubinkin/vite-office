/**
 * @fileoverview Defines canonical SwPaM range and cursor-state helpers from
 * pinned LibreOffice `sw/source/uibase/wrtsh/select.cxx`.
 */

import type { SwTextNode as WriterParagraph } from "../../core/txtnode/ndtxt";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwPaM } from "../../core/crsr/pam";
import type { SwUndoCursorState } from "../../core/undo/undobj";

/** Shell-owned temporary extended-text-input state corresponding to LibreOffice SwExtTextInput. */
export interface WriterCompositionState {
  /** Cursor or selection replaced when the composition is committed. */
  readonly cursor: SwUndoCursorState;
  /** Latest browser composition text, not yet written into SwDoc. */
  text: string;
}

/** Describes one ordered same-node range through its canonical text-node owner. */
export interface WriterTextRange {
  /** Exclusive UTF-16 range end relative to the text node. */
  readonly end: number;
  /** Document-owned text node containing both endpoints. */
  readonly node: WriterParagraph;
  /** Inclusive UTF-16 range start relative to the text node. */
  readonly start: number;
}

/** Validates one stable cursor offset against its current Writer text node. @param paragraph - Target text node. @param offset - Candidate UTF-16 offset. @returns Whether the position is representable. */
export function isWriterCursorOffset(paragraph: WriterParagraph, offset: number): boolean {
  return Number.isInteger(offset) && offset >= 0 && offset <= paragraph.Len();
}

/** Returns an ordered non-empty same-node selection. @param selection - Cursor projection. @returns Bounded range or undefined. */
export function getWriterSelectedTextRange(cursor: SwPaM): WriterTextRange | undefined {
  if (!cursor.HasMark()) return undefined;
  const point = cursor.GetPoint();
  const mark = cursor.GetMark();
  if (point.GetNode() !== mark.GetNode()) return undefined;
  const start = Math.min(point.GetContentIndex(), mark.GetContentIndex());
  const end = Math.max(point.GetContentIndex(), mark.GetContentIndex());
  return start === end ? undefined : { end, node: point.GetNode() as WriterParagraph, start };
}

/** Returns every non-empty paragraph-local range covered by an ordered Writer selection. @param cursor - Writer selection. @returns Selected paragraph ranges or undefined. */
export function getWriterSelectedTextRanges(cursor: SwPaM): readonly WriterTextRange[] | undefined {
  if (!cursor.HasMark()) return undefined;
  const point = cursor.GetPoint();
  const mark = cursor.GetMark();
  const first = point.compare(mark) <= 0 ? point : mark;
  const last = first === point ? mark : point;
  const firstNode = first.GetNode() as WriterParagraph;
  const lastNode = last.GetNode() as WriterParagraph;
  if (firstNode.GetDoc() !== lastNode.GetDoc()) return undefined;
  return firstNode
    .GetDoc()
    .paragraphs.filter(
      /** Keeps only body paragraphs within the inclusive Writer node span. @param node - Body paragraph. @returns Whether selected. */ (
        node,
      ) => node.GetIndex() >= firstNode.GetIndex() && node.GetIndex() <= lastNode.GetIndex(),
    )
    .map(
      /** Converts one selected paragraph to its local bounded range. @param node - Selected paragraph. @returns Local range. */ (
        node,
      ) => ({
        end: node === lastNode ? last.GetContentIndex() : node.Len(),
        node,
        start: node === firstNode ? first.GetContentIndex() : 0,
      }),
    )
    .filter(
      /** Excludes zero-width boundary paragraphs without discarding the enclosing selection. @param range - Candidate range. @returns Whether non-empty. */ (
        range,
      ) => range.start < range.end,
    );
}

/** Creates an undo cursor state from canonical node references. @param point - Moving endpoint node. @param pointOffset - Moving endpoint offset. @param mark - Optional fixed endpoint node. @param markOffset - Optional fixed endpoint offset. @param activeParagraph - Active node. @param pendingCharacterAttributes - Pending caret attributes. @returns Complete undo cursor state. */
export function createWriterUndoCursorState(
  point: WriterParagraph,
  pointOffset: number,
  mark: WriterParagraph | undefined,
  markOffset: number | undefined,
  activeParagraph: WriterParagraph,
  pendingCharacterItems: SfxItemSet,
): SwUndoCursorState {
  return {
    activeParagraph,
    ...(mark === undefined || markOffset === undefined
      ? {}
      : { mark: { node: mark, offset: markOffset } }),
    pendingCharacterItems: pendingCharacterItems.Clone(),
    point: { node: point, offset: pointOffset },
  };
}

/** Creates a collapsed undo cursor endpoint. @param paragraph - Target node. @param offset - UTF-16 content offset. @param pendingCharacterAttributes - Pending caret attributes. @returns Complete undo cursor state. */
export function createWriterCollapsedCursorState(
  paragraph: WriterParagraph,
  offset: number,
  pendingCharacterItems: SfxItemSet,
): SwUndoCursorState {
  return {
    activeParagraph: paragraph,
    pendingCharacterItems: pendingCharacterItems.Clone(),
    point: { node: paragraph, offset },
  };
}
