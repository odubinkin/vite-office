/** @fileoverview Ports the supported single-PaM paragraph collection application from native sw/source/core/edit/edfcol.cxx. */

import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";
import { getTextFormatCollNodes } from "../doc/docfmt";
import { SwUndoFormatColl } from "../undo/unfmco";
import type { SwUndoCursorState } from "../undo/undobj";

/** Creates one source-owned ordinary range action, including native repeated-request history. @param document - Active model. @param range - Current point/mark. @param collection - Owned requested collection. @param state - Cursor and pending items. @returns One native range action. */
export function createTextFormatCollAction(
  document: SwDoc,
  range: SwPaM,
  collection: SwTextFormatColl,
  state: SwUndoCursorState,
): SwUndoFormatColl {
  getTextFormatCollNodes(document, range);
  if (collection.GetAttrSet().GetDoc() !== document)
    throw new Error("Writer paragraph style collection belongs to another document.");
  return new SwUndoFormatColl(
    range,
    collection,
    state,
    state,
    collection.GetAttrSet().GetItemState(RES_PARATR_NUMRULE) === SfxItemState.SET,
  );
}
