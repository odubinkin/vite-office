/** @fileoverview Native content-neighbor lookup helpers split from nodes.cxx to preserve core module initialization. */
import type { SwNodeIndex } from "../crsr/pam";
import { SwContentNode, type SwNode } from "./node";
/** Original goNext scans content nodes before the final sentinel. @param index - Borrowed node index. @returns Next content owner or undefined. */
export function goNext(index: SwNodeIndex): SwContentNode | undefined {
  const nodes = index.GetNode().GetNodes(),
    last = nodes.Count() - 1;
  for (let i = index.GetIndex() + 1; i < last; i++) {
    const node = nodes.at(i);
    if (node instanceof SwContentNode) return node;
  }
  return undefined;
}
/** Original goPrevious enforces the native global-section lower bound unless explicitly disabled. @param index - Borrowed node index. @param canCrossBoundary - Native crossing policy. @returns Previous content owner or undefined. */
export function goPrevious(
  index: SwNodeIndex,
  canCrossBoundary: boolean,
): SwContentNode | undefined {
  const nodes = index.GetNode().GetNodes(),
    first = canCrossBoundary ? 0 : startOfGlobalSection(index.GetNode());
  for (let i = index.GetIndex() - 1; i > first; i--) {
    const node = nodes.at(i);
    if (node instanceof SwContentNode) return node;
  }
  return undefined;
}
/** Consumed startOfGlobalSection branches for represented body/fixed-section node kinds. @param node - Native node. @returns Native lower traversal bound. */
function startOfGlobalSection(node: SwNode): number {
  const nodes = node.GetNodes(),
    offset = node.GetIndex();
  if (nodes.GetEndOfExtras().GetIndex() < offset) return nodes.GetEndOfExtras().GetIndex() + 1;
  if (nodes.GetEndOfAutotext().GetIndex() < offset) return nodes.GetEndOfAutotext().GetIndex() + 1;
  // Fly/header/footer/footnote start-node kinds are not represented by this kernel.
  if (nodes.GetEndOfInserts().GetIndex() < offset) return nodes.GetEndOfInserts().GetIndex() + 1;
  if (nodes.GetEndOfPostIts().GetIndex() < offset) return nodes.GetEndOfPostIts().GetIndex() + 1;
  return 0;
}
