/** @fileoverview Implements Writer cell traversal over the actual SwPaM/SwNodes owners from swcrsr.cxx. */
import { SwPaM } from "./pam";
import { SwEndNode, SwTableBoxStartNode, SwTableNode, type SwStartNode } from "../docnode/node";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwTable, type SwTableBox } from "../table/swtable";

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

/** Owns native table endpoints and sorted actual selected boxes; native cursor rings remain pending. */
export class SwTableCursor extends SwCursor {
  private readonly selectedBoxes: SwTableBox[] = [];
  /** Returns the native selected-box count. @returns Count. */
  public GetSelectedBoxesCount(): number {
    return this.selectedBoxes.length;
  }
  /** Returns selected native identities in node order. @returns Selected boxes. */
  public GetSelectedBoxes(): readonly SwTableBox[] {
    return this.selectedBoxes;
  }
  /** Inserts one identity into the native sorted set. @param box - Box owner. @returns Nothing. */
  public InsertBox(box: SwTableBox): void {
    if (this.selectedBoxes.includes(box)) return;
    const index = this.selectedBoxes.findIndex(
      /** Projects actual native table ownership. @param existing - Current owner. @returns Operation result. */ (
        existing,
      ) => existing.GetStartNode().GetIndex() > box.GetStartNode().GetIndex(),
    );
    this.selectedBoxes.splice(index < 0 ? this.selectedBoxes.length : index, 0, box);
  }
  /** Removes one native selection entry. @param index - Sorted position. @returns Nothing. */
  public DeleteBox(index: number): void {
    this.selectedBoxes.splice(index, 1);
  }
  /** Reconciles old and new sorted native identities using upstream's difference order. @param boxes - New sorted set. @returns Nothing. */
  public ActualizeSelection(boxes: readonly SwTableBox[]): void {
    let old = 0,
      next = 0;
    while (old < this.selectedBoxes.length && next < boxes.length) {
      const previous = this.selectedBoxes[old] as SwTableBox,
        candidate = boxes[next] as SwTableBox;
      if (previous === candidate) {
        old++;
        next++;
      } else if (previous.GetStartNode().GetIndex() < candidate.GetStartNode().GetIndex())
        this.DeleteBox(old);
      else {
        this.InsertBox(candidate);
        old++;
        next++;
      }
    }
    while (old < this.selectedBoxes.length) this.DeleteBox(old);
    for (; next < boxes.length; next++) this.InsertBox(boxes[next] as SwTableBox);
  }
  /** Rebuilds flat table selection from actual point and mark sections. @returns Whether both endpoints belong to one table. */
  public NewTableSelection(): boolean {
    const start = this.GetPoint().GetNode().StartOfSectionNode(),
      end = this.GetMark().GetNode().StartOfSectionNode();
    if (!(start instanceof SwTableBoxStartNode) || !(end instanceof SwTableBoxStartNode))
      return false;
    const table = start.StartOfSectionNode() as SwTableNode;
    if (table !== end.StartOfSectionNode()) return false;
    const boxes: SwTableBox[] = [];
    table.GetTable().CreateSelection(start, end, boxes, SwTable.SEARCH_NONE);
    this.ActualizeSelection(boxes);
    return true;
  }
}
