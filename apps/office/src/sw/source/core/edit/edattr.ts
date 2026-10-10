/** @fileoverview Ports the supported SwEditShell::IsMoveLeftMargin and MoveLeftMargin selection traversal from pinned `sw/source/core/edit/edattr.cxx`. */

import type { SwDoc } from "../doc/doc";
import { getMoveLeftMarginDistance, getMovedLeftMargin } from "../doc/docfmt";
import type { SwPaM } from "../crsr/pam";
import type { SwUndoCursorState } from "../undo/undobj";
import type { SwTextNode } from "../txtnode/ndtxt";

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

/** Runs the native edit-shell model bracket without building a scalar action or group. @param target - Original editing shell methods. @param right - Increase direction. @param modulus - Native tab snapping. @returns Nothing. */
export function moveLeftMarginAtShell(
  target: { GetDoc(): SwDoc; getShellCursor(): SwPaM; CaptureCursorState(): SwUndoCursorState },
  right: boolean,
  modulus: boolean,
): void {
  const document = target.GetDoc(),
    cursor = target.getShellCursor(),
    state = target.CaptureCursorState();
  document.RunModelTransaction(
    /** Executes the document-owned range history once. @returns Nothing. */ () =>
      document.MoveLeftMargin(cursor, right, modulus, state),
  );
}
