/** @fileoverview Native SwDoc CreateUnoCursor, weak-table cleanup and document-destruction notification responsibility split from doc.cxx/doc.hxx/docnew.cxx. */
import type { SwDoc } from "./doc";
import type { SwPosition } from "../crsr/pam";
import {
  SwUnoCursor,
  SwUnoTableCursor,
  UnoCursorSharedPtr,
  UnoCursorWeakPtr,
  UnoCursorHint,
} from "../../../inc/unocrsr";
/** Original factory creates the real requested cursor kind and registers only a weak pointer in the document. @param doc - Actual document. @param point - Native initial position. @param table - Original table-cursor selector, default false. @returns Original owning shared value. */
export function CreateUnoCursor(doc: SwDoc, point: SwPosition, table = false): UnoCursorSharedPtr {
  const result = new UnoCursorSharedPtr(
    table ? new SwUnoTableCursor(point) : new SwUnoCursor(point),
  );
  doc.mvUnoCursorTable.push(new UnoCursorWeakPtr(result));
  return result;
}
/** Original cleanup removes expired weak values without inventing cursor liveness predicates. @param doc - Actual document. @returns Nothing. */
export function cleanupUnoCursorTable(doc: SwDoc): void {
  for (let i = doc.mvUnoCursorTable.length; i;)
    if (doc.mvUnoCursorTable[--i]?.expired()) doc.mvUnoCursorTable.splice(i, 1);
}
/** Original document destructor holds each successful weak lock across the complete hint broadcast. Member destruction occurs only after that genuine temporary strong value releases. @param doc - Actual document already in destruction. @returns Nothing. */
export function NotifyUnoCursorsOnDocDestruction(doc: SwDoc): void {
  const hint = new UnoCursorHint();
  cleanupUnoCursorTable(doc);
  for (const weak of doc.mvUnoCursorTable) {
    const held = weak.lock();
    try {
      held.get()?.m_aNotifier.Broadcast(hint);
    } finally {
      held.reset();
    }
  }
}
