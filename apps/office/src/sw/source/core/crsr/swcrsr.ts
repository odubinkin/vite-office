/** @fileoverview Implements Writer cell traversal over the actual SwPaM/SwNodes owners from swcrsr.cxx. */
import { SwPaM } from "./pam";
import { SwEndNode, SwTableBoxStartNode, type SwStartNode } from "../docnode/node";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Persistent Writer cursor; cell navigation never uses body ordinals or display paragraphs. */
export class SwCursor extends SwPaM {
  /** Moves to a current section endpoint, reporting false if already there. @param start - Beginning direction. @returns Whether the point changed. */
  public MoveSection(start: boolean): boolean {
    return this.MoveToBoundary(this.GetPoint().GetNode().StartOfSectionNode(), start);
  }
  /** Moves to a current flat table endpoint; ordinary marked cursors cannot move tables. @param start - Beginning direction. @returns Whether a table endpoint was accepted, even when unchanged. */
  public MoveTable(start: boolean): boolean {
    const section = this.GetPoint().GetNode().StartOfSectionNode();
    if (
      !(section instanceof SwTableBoxStartNode) ||
      (this.HasMark() && !(this instanceof SwTableCursor))
    )
      return false;
    this.MoveToBoundary(section.StartOfSectionNode(), start);
    return true;
  }
  /** Moves within the actual content section, including table text at document edges. @param start - Beginning direction. @returns Native accepted movement result. */
  public SttEndDoc(start: boolean): boolean {
    this.MoveToBoundary(
      this.GetPoint().GetNode().GetNodes().GetEndOfContent().StartOfSectionNode(),
      start,
    );
    return true;
  }
  /** Resolves a guaranteed content-bearing section through its sentinels. @param section - Containing native section. @param start - Beginning direction. @returns Whether point changed. */
  private MoveToBoundary(section: SwStartNode, start: boolean): boolean {
    const nodes = section.GetNodes();
    let index = start ? section.GetIndex() + 1 : section.EndOfSectionNode().GetIndex() - 1;
    while (!nodes.at(index).IsTextNode()) index += start ? 1 : -1;
    const node = nodes.at(index) as SwTextNode,
      offset = start ? 0 : node.Len(),
      point = this.GetPoint();
    if (point.GetNode() === node && point.GetContentIndex() === offset) return false;
    point.Assign(node, offset);
    return true;
  }
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

/** Native table-mode endpoint owner for the implemented flat profile; selected-box painting and cursor rings remain unverified. */
export class SwTableCursor extends SwCursor {}
