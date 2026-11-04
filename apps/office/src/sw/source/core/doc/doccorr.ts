/** @fileoverview Original absolute position/physical-PaM-bound correction primitives from doccorr.cxx. The UNO branch uses actual document weak owners; global correction traverses actual native view-shell and cursor owners. */
import { SwPosition, SwPaM, type SwNodeIndex } from "../crsr/pam";
import { SwEditShell } from "../edit/ednumber";
import { SwCursorShell } from "../crsr/trvltbl";
import { SwStartNode, SwContentNode, type SwNode } from "../docnode/node";
import type { SwDoc } from "./doc";
import { DelBookmarks } from "./docbm";
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

/** Original SwDoc::GetEditShell searches the actual current-view ring and keeps non-editing views in traversal order. @param doc - Actual document. @returns First actual edit shell or no shell. */
export function GetEditShell(doc: SwDoc): SwEditShell | undefined {
  const current = doc.getIDocumentLayoutAccess().GetCurrentViewShell();
  if (current)
    for (const shell of current.GetRingContainer()) if (shell instanceof SwEditShell) return shell;
  return undefined;
}
/** Original global absolute correction captures position values before any live shell or UNO bound mutates, then traverses actual source-owned rings. ENABLE_YRS peer-cursor support is not enabled by this application. @param range - Original inclusive correction range. @param newPosition - Original target position. @returns Nothing. */
export function PaMCorrAbs(range: SwPaM, newPosition: SwPosition): void {
  const start = range.Start().clone(),
    end = range.End().clone(),
    target = newPosition.clone();
  try {
    const doc = start.GetNode().GetDoc(),
      shell = doc.GetEditShell();
    if (shell)
      for (const view of shell.GetRingContainer()) {
        if (!(view instanceof SwCursorShell)) continue;
        const stack = view.GetStackCursor();
        if (stack)
          for (const pam of stack.GetRingContainer()) lcl_PaMCorrAbs(pam, start, end, target);
        for (const pam of view.GetCursor_().GetRingContainer())
          lcl_PaMCorrAbs(pam, start, end, target);
        const table = view.GetTableCrs();
        if (view.IsTableMode() && table) lcl_PaMCorrAbs(table, start, end, target);
      }
    CorrectUnoCursorsAbsolute(doc, start, end, target);
  } finally {
    start.Dispose();
    end.Dispose();
    target.Dispose();
  }
}

/** Original static SwDoc::CorrAbs node-index overload deletes marks before optional inclusive global cursor correction. @param start - Inclusive native start. @param end - Inclusive native end. @param target - Actual correction position. @param moveCursor - Original false default. @returns Nothing. */
export function CorrAbsNodes(
  start: SwNodeIndex,
  end: SwNodeIndex,
  target: SwPosition,
  moveCursor = false,
): void {
  DelBookmarks(start.GetNode(), end.GetNode());
  if (!moveCursor) return;
  const last = end.GetNode(),
    begin = new SwPosition(start.GetNode()),
    finish = new SwPosition(last, last instanceof SwContentNode ? last.Len() : 0),
    range = new SwPaM(finish, begin);
  try {
    PaMCorrAbs(range, target);
  } finally {
    range.Dispose();
    begin.Dispose();
    finish.Dispose();
  }
}
