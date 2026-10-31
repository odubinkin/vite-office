/** @fileoverview Original SwTextNode::JoinNext/JoinPrev admission and survivor operations from ndtxt.cxx, using the existing actual node/hint/index owners. */
import { SwNodeIndex } from "../crsr/pam";
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
