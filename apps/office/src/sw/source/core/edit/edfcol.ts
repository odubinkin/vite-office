/** @fileoverview Ports the supported single-PaM paragraph collection application from native sw/source/core/edit/edfcol.cxx. */

import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { getTextFormatCollNodes } from "../doc/docfmt";
import { SwUndoFormatColl } from "../undo/unfmco";
import type { SwUndoCursorState } from "../undo/undobj";

/** Creates one source-owned range action for paragraph collection application. Direct reset and native unchanged-request history remain separate obligations. @param document - Active model. @param range - Current point/mark. @param collection - Owned requested collection. @param state - Cursor and pending items. @returns One native range action, or no action when every selected collection matches. */
export function createTextFormatCollAction(
  document: SwDoc,
  range: SwPaM,
  collection: SwTextFormatColl,
  state: SwUndoCursorState,
): SwUndoFormatColl | undefined {
  const nodes = getTextFormatCollNodes(document, range);
  if (collection.GetAttrSet().GetDoc() !== document)
    throw new Error("Writer paragraph style collection belongs to another document.");
  if (
    nodes.every(
      /** Checks all selected owners, rather than only the active endpoint. @param node - Selected node. @returns Whether already requested. */
      (node) => node.GetTextFormatColl() === collection,
    )
  )
    return undefined;
  return new SwUndoFormatColl(range, collection, state, state);
}
