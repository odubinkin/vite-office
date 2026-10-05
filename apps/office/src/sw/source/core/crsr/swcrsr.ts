/** @fileoverview Implements Writer cell traversal over the actual SwPaM/SwNodes owners from swcrsr.cxx. */
import { SwPaM } from "./pam";
import { SwEndNode, SwTableBoxStartNode } from "../docnode/node";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Persistent Writer cursor; cell navigation never uses body ordinals or display paragraphs. */
export class SwCursor extends SwPaM {
  /** Moves to the next cell's first content position. @param count - Native cell count. @returns Whether traversal succeeded. */
  public GoNextCell(count = 1): boolean {
    return this.GoPrevNextCell(true, count);
  }
  /** Moves to the previous cell's first content position. @param count - Native cell count. @returns Whether traversal succeeded. */
  public GoPrevCell(count = 1): boolean {
    return this.GoPrevNextCell(false, count);
  }
  /** Traverses flat cell sections while retaining the fixed mark. @param next - Forward direction. @param count - Unsigned native cell count. @returns Whether a destination exists in the same table. */
  public GoPrevNextCell(next: boolean, count: number): boolean {
    let section = this.GetPoint().GetNode().StartOfSectionNode();
    if (!(section instanceof SwTableBoxStartNode)) return false;
    // Implemented table cells have a flat SwTableNode parent and a first text node.
    const nodes = section.GetNodes();
    for (let remaining = count & 0xffff; remaining > 0; remaining--) {
      const adjacent = nodes.at(
        next ? section.EndOfSectionNode().GetIndex() + 1 : section.GetIndex() - 1,
      );
      const candidate = next
        ? adjacent
        : adjacent instanceof SwEndNode
          ? adjacent.StartOfSectionNode()
          : undefined;
      if (!(candidate instanceof SwTableBoxStartNode)) return false;
      section = candidate;
    }
    const node = nodes.at(section.GetIndex() + 1) as SwTextNode;
    this.GetPoint().Assign(node, 0);
    return true;
  }
}
