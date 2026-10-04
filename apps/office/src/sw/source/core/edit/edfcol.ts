/** @fileoverview Ports SwEditShell::SetTextFormatColl's ordered collection/reset history from pinned sw/source/core/edit/edfcol.cxx. */
import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxListUndoAction } from "../../../../svl/source/undo/undo";
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";
import { getTextFormatCollNodes, setTextFormatCollAtNode } from "../doc/docfmt";
import { SwUndoFormatColl } from "../undo/unfmco";
import { SwUndoResetAttr } from "../undo/unattr";
import type { SwUndoCursorState, SwUndoRedoContext } from "../undo/undobj";

/** Prepared native operation and its ordered history; initial flags are distinct from redo defaults. */
export interface TextFormatCollOperation {
  readonly action: SfxListUndoAction<SwUndoRedoContext>;
  readonly execute: () => void;
}

/** Creates one source-owned ordinary range operation with two native history owners. @param document - Active model. @param range - Current point/mark. @param collection - Owned requested collection. @param state - Cursor and pending items. @returns Prepared operation. */
export function createTextFormatCollAction(
  document: SwDoc,
  range: SwPaM,
  collection: SwTextFormatColl,
  state: SwUndoCursorState,
): TextFormatCollOperation {
  const nodes = getTextFormatCollNodes(document, range);
  if (collection.GetAttrSet().GetDoc() !== document)
    throw new Error("Writer paragraph style collection belongs to another document.");
  const start = range.Start(),
    end = range.End(),
    startNode = start.GetNode() as SwTextNode,
    endNode = end.GetNode() as SwTextNode;
  const ordered: SwUndoCursorState =
    state.mark === undefined
      ? state
      : {
          ...state,
          activeParagraph: endNode,
          point: { node: endNode, offset: end.GetContentIndex() },
          mark: { node: startNode, offset: start.GetContentIndex() },
        };
  const expanded: SwUndoCursorState = {
    ...state,
    activeParagraph: endNode,
    point: { node: endNode, offset: endNode.Len() },
    mark: { node: startNode, offset: 0 },
  };
  const resetListAttrs =
    collection.GetAttrSet().GetItemState(RES_PARATR_NUMRULE) === SfxItemState.SET;
  const action = new SfxListUndoAction<SwUndoRedoContext>("Paragraph Style");
  action.AddAction(new SwUndoFormatColl(range, collection, ordered, ordered, resetListAttrs));
  const reset = new SwUndoResetAttr(range, expanded);
  action.AddAction(reset);
  return {
    action,
    /** Executes native initial collection reset followed by exact hint cleanup. @returns Nothing. */
    execute: () => {
      for (const node of nodes) setTextFormatCollAtNode(node, collection, resetListAttrs);
      reset.ApplyExact();
    },
  };
}
