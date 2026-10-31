/** @fileoverview Original absolute position/physical-PaM-bound correction primitives from doccorr.cxx. The UNO branch uses actual document weak owners; global edit-shell traversal requires its actual native view-shell owner and is not simulated here. */
import type { SwPosition, SwPaM } from "../crsr/pam";
import { SwStartNode, type SwNode } from "../docnode/node";
import type { SwDoc } from "./doc";
import { SwUnoTableCursor, UnoCursorHint } from "../../../inc/unocrsr";
/** Original closed range comparison and value assignment. @param position - Actual position to correct. @param start - Original inclusive start. @param end - Original inclusive end. @param target - Actual correction position. @returns Original changed result. */
export function lcl_PosCorrAbs(
  position: SwPosition,
  start: SwPosition,
  end: SwPosition,
  target: SwPosition,
): boolean {
  if (start.compare(position) <= 0 && position.compare(end) <= 0) {
    position.Assign(target.GetNode(), target.GetContentIndex());
    return true;
  }
  return false;
}
/** Original correction visits both physical bounds, including an inactive bound. Both operations run even after the first succeeds; no boolean short circuit or pointer-alias substitute is used. @param range - Actual native PaM owner. @param start - Original inclusive start. @param end - Original inclusive end. @param target - Actual correction position. @returns Whether either bound matched. */
export function lcl_PaMCorrAbs(
  range: SwPaM,
  start: SwPosition,
  end: SwPosition,
  target: SwPosition,
): boolean {
  const first = lcl_PosCorrAbs(range.GetBound(), start, end, target),
    second = lcl_PosCorrAbs(range.GetBound(false), start, end, target);
  return first || second;
}

/** Original relevant section lookup for the represented fixed/table/cell/normal start-node families. Transparent SwSectionNode is not represented by the current node model; its source-only upward skip has no admitted operand here. @param node - Actual model node. @returns Original surrounding start owner. */
export function lcl_FindUnoCursorSection(node: SwNode): SwStartNode {
  return node instanceof SwStartNode ? node : node.StartOfSectionNode();
}
/** Original UNO-cursor branch of PaMCorrAbs, split for composition with the pending real view-shell branch. Inputs are the original caller's position value snapshots, not aliases into mutable cursor bounds. This is not a replacement for global PaMCorrAbs. @param doc - Actual range document. @param start - Inclusive start snapshot. @param end - Inclusive end snapshot. @param target - Target snapshot. @returns Nothing. */
export function CorrectUnoCursorsAbsolute(
  doc: SwDoc,
  start: SwPosition,
  end: SwPosition,
  target: SwPosition,
): void {
  doc.cleanupUnoCursorTable();
  for (const weak of doc.mvUnoCursorTable) {
    const held = weak.lock();
    try {
      const cursor = held.get();
      if (!cursor) continue;
      const leaveSection =
        cursor.IsRemainInSection() &&
        lcl_FindUnoCursorSection(target.GetNode()) !==
          lcl_FindUnoCursorSection(cursor.GetPoint().GetNode());
      let changed = false;
      for (const pam of cursor.GetRingContainer())
        changed = lcl_PaMCorrAbs(pam, start, end, target) || changed;
      if (cursor instanceof SwUnoTableCursor)
        for (const pam of cursor.GetSelRing().GetRingContainer())
          changed = lcl_PaMCorrAbs(pam, start, end, target) || changed;
      if (changed && leaveSection) cursor.m_aNotifier.Broadcast(new UnoCursorHint());
    } finally {
      held.reset();
    }
  }
}
