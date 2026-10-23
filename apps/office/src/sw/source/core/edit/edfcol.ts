/** @fileoverview Ports SwEditShell::SetTextFormatColl's ordered collection/reset history from pinned sw/source/core/edit/edfcol.cxx. */
import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";
import { getTextFormatCollNodes, setTextFormatCollAtNode } from "../doc/docfmt";
import { createParagraphStyleResetSet } from "../doc/DocumentContentOperationsManager";
import { SwUndoFormatColl } from "../undo/unfmco";
import { RES_BREAK, RES_PAGEDESC } from "../../../inc/hintids";
import type { SwNumRuleItem } from "../para/paratr";
import { SwUndoResetAttr } from "../undo/unattr";
import type { SwUndoCursorState, SwUndoRedoContext } from "../undo/undobj";

/** Prepared native operation and its ordered history; initial flags are distinct from redo defaults. */
export interface TextFormatCollOperation {
  readonly action: SfxListUndoAction<SwUndoRedoContext>;
  readonly execute: () => void;
}

/** Creates one source-owned range operation with two native history owners. @param document - Active model. @param range - Current point/mark. @param collection - Owned requested collection. @param state - Cursor and pending items. @param resetAllCharAttrs - Initial native full-character reset eligibility. @returns Prepared operation. */
export function createTextFormatCollAction(
  document: SwDoc,
  range: SwPaM,
  collection: SwTextFormatColl,
  state: SwUndoCursorState,
  resetAllCharAttrs = false,
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
    resetAllCharAttrs ||
    collection.GetAttrSet().GetItemState(RES_PARATR_NUMRULE) === SfxItemState.SET;
  const action = new SfxListUndoAction<SwUndoRedoContext>("Paragraph Style");
  action.AddAction(
    new SwUndoFormatColl(range, collection, ordered, ordered, resetListAttrs, resetAllCharAttrs),
  );
  const reset = new SwUndoResetAttr(range, expanded);
  action.AddAction(reset);
  return {
    action,
    /** Executes native initial collection reset followed by exact hint cleanup. @returns Nothing. */
    execute: () => {
      const resetSet = resetAllCharAttrs ? createParagraphStyleResetSet(document) : undefined;
      for (const node of nodes) setTextFormatCollAtNode(node, collection, resetListAttrs, resetSet);
      reset.ApplyExact();
    },
  };
}

/** Copies only point-node direct attributes, excluding break/page and automatic numbering as native FillByEx. @param document - Original graph. @param range - Actual shell cursor. @param collection - Destination style. @returns Nothing. */
export function fillParagraphStyleByExample(
  document: SwDoc,
  range: SwPaM,
  collection: SwTextFormatColl,
): void {
  const node = range.GetPoint().GetNode() as SwTextNode;
  const direct = node.GetpSwAttrSet();
  if (direct === undefined) return;
  const set = direct.Clone();
  const hasSpecial =
    direct.GetItemIfSet(RES_BREAK, false) !== undefined ||
    direct.GetItemIfSet(RES_PAGEDESC, false) !== undefined;
  set.ClearItem(RES_BREAK);
  set.ClearItem(RES_PAGEDESC);
  const rule = direct.GetItemIfSet(RES_PARATR_NUMRULE, false) as SwNumRuleItem | undefined;
  const autoRule =
    rule !== undefined && document.FindNumRulePtr(rule.GetValue())?.IsAutoRule() === true;
  if (autoRule) set.ClearItem(RES_PARATR_NUMRULE);
  if ((hasSpecial || autoRule) && set.Count() === 0) return;
  document.ChgFormat(collection, set);
}

/** Consumed edit-shell ports for original collection application; the shell retains cursor and history ownership. */
interface TextFormatCollShell {
  GetDoc(): SwDoc;
  GetCursor(): SwPaM;
  CaptureCursorState(): SwUndoCursorState;
  ApplyAction(
    action: SfxUndoAction<SwUndoRedoContext>,
    tryMerge: boolean,
    execute: () => void,
  ): boolean;
}
/** Applies source-ordered collection/reset operations over the actual cursor ring with one native undo group. @param target - Original shell. @param collection - Owned paragraph format. @param resetAllCharAttrs - Initial selective reset eligibility. @returns Whether applied. */
export function setTextFormatCollAtShell(
  target: TextFormatCollShell,
  collection: SwTextFormatColl,
  resetAllCharAttrs: boolean,
): boolean {
  const document = target.GetDoc(),
    cursor = target.GetCursor(),
    ranges = [...cursor.GetRingContainer()];
  if (ranges.length > 1) {
    const group = new SfxListUndoAction<SwUndoRedoContext>("Paragraph Style");
    return target.ApplyAction(
      group,
      false,
      /** Captures each original ring range after the preceding range mutation. @returns Nothing. */
      () => {
        for (const range of ranges) {
          const operation = createTextFormatCollAction(
            document,
            range,
            collection,
            target.CaptureCursorState(),
            resetAllCharAttrs,
          );
          group.AddAction(operation.action);
          operation.execute();
        }
      },
    );
  }
  const operation = createTextFormatCollAction(
    document,
    cursor,
    collection,
    target.CaptureCursorState(),
    resetAllCharAttrs,
  );
  return target.ApplyAction(operation.action, false, operation.execute);
}
