/** @fileoverview Original SwTextNode::JoinNext/JoinPrev admission and survivor operations from ndtxt.cxx, using the existing actual node/hint/index owners. */
import { SwNodeIndex } from "../crsr/pam";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import * as H from "../../../inc/hintids";
import { SwTextNode } from "./ndtxt";
/** Original forward join retains the current node; unrepresented non-text/transparent-section nodes are rejected by CanJoinNext. @param node - Actual surviving paragraph. @returns Same native owner. */
export function JoinNext(node: SwTextNode): SwTextNode {
  const index = new SwNodeIndex(node);
  if (node.CanJoinNext(index)) {
    const next = index.GetNode();
    if (!(next instanceof SwTextNode)) throw new Error("assert(join text node)");
    node.AppendTextNode(next, false, true);
    node.GetNodes().removeTextNode(next);
  }
  return node;
}
/** Original reverse join retains the trailing node and inserts the preceding node's complete contents at zero. @param node - Actual surviving paragraph. @returns Nothing. */
export function JoinPrev(node: SwTextNode): void {
  const index = new SwNodeIndex(node);
  if (node.CanJoinPrev(index)) {
    const previous = index.GetNode();
    if (!(previous instanceof SwTextNode)) throw new Error("assert(join text node)");
    node.AppendTextNode(previous, true, true);
    node.GetNodes().removeTextNode(previous);
  }
}

/** Original CutImpl hard-attribute transfer for a complete paragraph. Current text-node ranges cannot hold the unrepresented frame style-name items; page/break are the represented exclusions in the destination difference test. @param target - Actual survivor after string insertion. @param source - Actual source before cutting. @param oldLength - Destination pre-insertion length. @param offset - Destination insertion start. @returns Nothing. */
export function ApplyCutTextNodeAttributes(
  target: SwTextNode,
  source: SwTextNode,
  oldLength: number,
  offset: number,
): void {
  const direct = source.GetpSwAttrSet();
  if (!direct) return;
  let hasDifferent = false;
  const destination = target.GetpSwAttrSet();
  if (destination) {
    const parent = destination.GetParent();
    if (!parent) throw new Error("assert(text attribute parent)");
    for (const item of destination.entries()) {
      const which = item.Which();
      if (
        which !== H.RES_PAGEDESC &&
        which !== H.RES_BREAK &&
        destination.GetItemState(which, false) === SfxItemState.SET &&
        !item.equals(parent.Get(which, true))
      ) {
        hasDifferent = true;
        break;
      }
    }
  }
  const charactersOnly = !!oldLength || hasDifferent || source.Len() !== target.Len();
  const set = new SfxItemSet(
    target.GetDoc().GetAttrPool(),
    charactersOnly
      ? [
          [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
          [H.RES_TXTATR_INETFMT, H.RES_TXTATR_CHARFMT],
          [H.RES_UNKNOWNATR_BEGIN, H.RES_UNKNOWNATR_END - 1],
        ]
      : [[H.RES_CHRATR_BEGIN, H.RES_UNKNOWNATR_END - 1]],
  );
  try {
    set.PutSet(direct);
    if (!charactersOnly) set.ClearItem(H.RES_PARATR_LIST_LEVEL);
    if (set.Count()) target.SetAttr(set, offset, offset + source.Len());
  } finally {
    set.Dispose();
  }
}
