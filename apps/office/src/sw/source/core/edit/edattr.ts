/** @fileoverview Ports the supported SwEditShell::IsMoveLeftMargin and MoveLeftMargin selection traversal from pinned `sw/source/core/edit/edattr.cxx`. */

import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import type { SwDoc } from "../doc/doc";
import { getMoveLeftMarginDistance, getMovedLeftMargin } from "../doc/docfmt";
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndoMoveLeftMargin } from "../undo/unattr";
import type { SwUndoCursorState, SwUndoRedoContext } from "../undo/undobj";
import type { SfxUndoAction } from "../../../../svl/source/undo/undo";

/** Text nodes in the inclusive point-and-mark range, in document order. @param document - Writer document. @param cursor - Selection. @returns Selected nodes. */
export function getMoveLeftMarginNodes(document: SwDoc, cursor: SwPaM): readonly SwTextNode[] {
  const start = cursor.Start().GetNodeIndex();
  const end = cursor.End().GetNodeIndex();
  return document.paragraphs.filter(
    /** Includes all selected text nodes. @param node - Candidate. @returns Whether selected. */ (
      node,
    ) => node.GetIndex() >= start && node.GetIndex() <= end,
  );
}

/** Mirrors the upstream increase guard using the current page body as the browser layout frame. @param document - Writer document. @param cursor - Selection. @param right - Increase direction. @param modulus - Snap to default tabs. @returns Whether all selected nodes permit the operation. */
export function isMoveLeftMargin(
  document: SwDoc,
  cursor: SwPaM,
  right: boolean,
  modulus = true,
): boolean {
  const distance = getMoveLeftMarginDistance(document);
  if (distance <= 0) return false;
  const nodes = getMoveLeftMarginNodes(document, cursor);
  if (!right)
    return nodes.some(
      /** Checks for an effective decrease. @param node - Selected text node. @returns Whether changed. */ (
        node,
      ) => getMovedLeftMargin(node, distance, false, modulus) !== node.GetParagraphTextLeftMargin(),
    );
  const page = document.GetPageDesc().GetValue();
  const frameWidth = page.width - page.leftMargin - page.rightMargin;
  const fiveMillimeters = Math.round((5 * 1440) / 25.4);
  return nodes.every(
    /** Enforces SwEditShell's frame-width margin guard. @param node - Selected text node. @returns Whether next indent fits. */ (
      node,
    ) => frameWidth > getMovedLeftMargin(node, distance, true, modulus) + fiveMillimeters,
  );
}

/** Builds one undo unit for SwDoc::MoveLeftMargin across the selected text nodes. @param document - Writer document. @param cursor - Selection. @param right - Increase direction. @param modulus - Snap to default tabs. @param state - Cursor history boundary. @returns One action or undefined for a no-op. */
export function createMoveLeftMarginAction(
  document: SwDoc,
  cursor: SwPaM,
  right: boolean,
  modulus: boolean,
  state: SwUndoCursorState,
): SfxUndoAction<SwUndoRedoContext> | undefined {
  if (!isMoveLeftMargin(document, cursor, right, modulus)) return undefined;
  const distance = getMoveLeftMarginDistance(document);
  const actions = getMoveLeftMarginNodes(document, cursor).flatMap(
    /** Builds one node's undo transition. @param node - Selected text node. @returns Zero or one action. */ (
      node,
    ) => {
      const before = node.GetParagraphTextLeftMargin();
      const after = getMovedLeftMargin(node, distance, right, modulus);
      return before === after ? [] : [new SwUndoMoveLeftMargin(node, before, after, state, state)];
    },
  );
  if (actions.length === 1) return actions[0];
  const group = new SfxListUndoAction<SwUndoRedoContext>("Move Left Margin");
  for (const action of actions) group.AddAction(action);
  return group;
}
