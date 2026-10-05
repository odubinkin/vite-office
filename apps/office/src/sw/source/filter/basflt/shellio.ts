/** @fileoverview Owns external fragment and plain-text reads over SwReader native selected-cell rings. */
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwPosition, type SwPaM } from "../../core/crsr/pam";
import { SwUndoInsDoc } from "../../core/undo/untblk";
import { prepareWriterAsciiParagraphs, readWriterAsciiParagraphs } from "../ascii/parasc";
import type { SwTextFragment, SwTextNode } from "../../core/txtnode/ndtxt";
import { SwUndoInsert } from "../../core/undo/unins";
import {
  createWriterCollapsedCursorState,
  createWriterUndoCursorState,
  type SwUndoCursorPosition,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../../core/undo/undobj";

/** Native reader history and sequential first import, before retained-content redo. */
export interface WriterReadTextOperation {
  readonly action: SfxListUndoAction<SwUndoRedoContext>;
  readonly execute: (context: SwUndoRedoContext) => void;
}

/** Prepares external plain text reading at actual selected-cell ring points. @param cursor - Native cell editing ring. @param text - Plain clipboard text. @param before - Displayed table selection. @returns Native operation, or undefined when nothing imports. */
export function createWriterReadTextOperation(
  cursor: SwPaM,
  text: string,
  before: SwUndoCursorState,
): WriterReadTextOperation | undefined {
  const paragraphs = prepareWriterAsciiParagraphs(text);
  if (paragraphs.length === 1 && paragraphs[0] === "") return undefined;
  for (const range of cursor.GetRingContainer())
    if (range.GetPoint().GetContentIndex() !== (range.GetPoint().GetNode() as SwTextNode).Len())
      throw new Error("Writer table plain import requires native end-of-cell points.");
  const action = new SfxListUndoAction<SwUndoRedoContext>("Paste");
  return {
    action,
    execute:
      /** Coordinates native ASCII insertion and retained history. @param context - Native operation input. @returns Operation result. */ (
        context,
      ) => {
        const points = [...cursor.GetRingContainer()].map(
          /** Coordinates native ASCII insertion and retained history. @param range - Native operation input. @returns Operation result. */ (
            range,
          ) => range.GetPoint().clone(),
        );
        const point = new SwPosition(before.point.node, before.point.offset),
          mark =
            before.mark === undefined
              ? undefined
              : new SwPosition(before.mark.node, before.mark.offset);
        try {
          let after = before;
          for (const [index, current] of points.entries()) {
            const node = current.GetNode() as SwTextNode,
              local = createWriterCollapsedCursorState(
                node,
                current.GetContentIndex(),
                before.pendingCharacterItems,
              ),
              history = new SwUndoInsDoc(current, index === 0 ? before : local);
            readWriterAsciiParagraphs(current, paragraphs);
            after = {
              ...createWriterUndoCursorState(
                point.GetNode() as SwTextNode,
                point.GetContentIndex(),
                mark?.GetNode() as SwTextNode | undefined,
                mark?.GetContentIndex(),
                point.GetNode() as SwTextNode,
                before.pendingCharacterItems,
              ),
              ...(before.tableSelection === true ? { tableSelection: true } : {}),
            };
            history.SetInsertRange(
              current,
              index === points.length - 1
                ? after
                : createWriterCollapsedCursorState(
                    current.GetNode() as SwTextNode,
                    current.GetContentIndex(),
                    before.pendingCharacterItems,
                  ),
            );
            action.AddAction(history);
          }
          context.RestoreCursor(after);
        } finally {
          for (const current of points) current.Dispose();
          point.Dispose();
          mark?.Dispose();
        }
      },
  };
}

/** Reads one already-imported fragment at every native ring point, retaining selection ownership. @param cursor - Actual editing ranges. @param fragment - Native clipboard fragment. @param before - Displayed table selection. @returns Grouped insertion history, or undefined for empty text. */
export function createWriterReadFragmentAction(
  cursor: SwPaM,
  fragment: SwTextFragment,
  before: SwUndoCursorState,
): SfxListUndoAction<SwUndoRedoContext> | undefined {
  if (fragment.text.length === 0) return undefined;
  const points = [...cursor.GetRingContainer()].map(
    /** Captures each insertion point before history restoration reconciles the ring. @param range - Actual native range. @returns Native insertion coordinates. */
    (range) => ({
      node: range.GetPoint().GetNode() as SwTextNode,
      offset: range.GetPoint().GetContentIndex(),
    }),
  );
  const after: SwUndoCursorState = {
    ...before,
    point: advancePosition(before.point, points, fragment.text.length),
    ...(before.mark === undefined
      ? {}
      : { mark: advancePosition(before.mark, points, fragment.text.length) }),
  };
  const action = new SfxListUndoAction<SwUndoRedoContext>("Paste");
  for (const [index, point] of points.entries()) {
    const local = createWriterCollapsedCursorState(
      point.node,
      point.offset,
      before.pendingCharacterItems,
    );
    action.AddAction(
      new SwUndoInsert(
        point.node,
        point.offset,
        fragment,
        undefined,
        index === 0 ? before : local,
        index === points.length - 1
          ? after
          : createWriterCollapsedCursorState(
              point.node,
              point.offset + fragment.text.length,
              before.pendingCharacterItems,
            ),
        SwInsertFlags.DEFAULT,
      ),
    );
  }
  return action;
}

/** Advances a native displayed endpoint affected by imported text. @param position - Original endpoint. @param points - Editing ring insertions. @param length - Fragment length. @returns Updated endpoint. */
function advancePosition(
  position: SwUndoCursorPosition,
  points: readonly SwUndoCursorPosition[],
  length: number,
): SwUndoCursorPosition {
  let offset = position.offset;
  for (const point of points)
    if (point.node === position.node && point.offset <= position.offset) offset += length;
  return { node: position.node, offset };
}
