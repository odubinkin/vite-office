/** @fileoverview Owns bounded single-paragraph external insertion over SwReader native cursor rings. */
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import type { SwPaM } from "../../core/crsr/pam";
import type { SwTextFragment, SwTextNode } from "../../core/txtnode/ndtxt";
import { SwUndoInsert } from "../../core/undo/unins";
import {
  createWriterCollapsedCursorState,
  type SwUndoCursorPosition,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../../core/undo/undobj";

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
