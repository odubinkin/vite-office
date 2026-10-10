/** @fileoverview Ports the supported SwEditShell::IsMoveLeftMargin and MoveLeftMargin selection traversal from pinned `sw/source/core/edit/edattr.cxx`. */

import type { SwDoc } from "../doc/doc";
import { getMoveLeftMarginDistance } from "../doc/docfmt";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { RES_LR_SPACE } from "../../../inc/hintids";
import type { SwPaM } from "../crsr/pam";
import type { SwUndoCursorState } from "../undo/undobj";

/** Reads native edit-shell admission across the actual cursor ring; current page-body frame geometry remains a browser layout accommodation. @param document - Original document. @param cursor - Native cursor ring. @param right - Increase direction. @param modulus - Native snapping policy. @returns Original represented admission. */
export function isMoveLeftMargin(
  document: SwDoc,
  cursor: SwPaM,
  right: boolean,
  modulus = true,
): boolean {
  const distance = getMoveLeftMarginDistance(document) & 0xffff;
  if (distance === 0) return false;
  if (!right) return true;
  const page = document.GetPageDesc().GetValue();
  const frameWidth = page.width - page.leftMargin - page.rightMargin;
  const fiveMillimeters = Math.round((5 * 1440) / 25.4);
  for (const range of cursor.GetRingContainer()) {
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      const margin = node.GetAttr(RES_LR_SPACE) as SvxLRSpaceItem;
      let next = margin.ResolveTextLeft() + distance;
      if (modulus) next = Math.trunc(next / distance) * distance;
      if (!(frameWidth > next + fiveMillimeters)) return false;
    }
  }
  return true;
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
