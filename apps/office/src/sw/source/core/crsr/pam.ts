/**
 * @fileoverview Implements Writer model positions and point-and-mark selections from the pinned LibreOffice `sw/source/core/crsr/pam.cxx` boundary.
 */

import type { SwContentNode, SwNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";

/** Tracks a node through structural array changes by retaining its object identity. */
export class SwNodeIndex {
  private node: SwNode;

  /**
   * Creates an index for an existing node or one current array offset.
   * @param nodeOrNodes - Existing node or owning node array.
   * @param index - Optional current offset in nodeOrNodes.
   * @returns Nothing; initializes this index.
   */
  public constructor(nodeOrNodes: SwNode | SwNodes, index?: number) {
    this.node = index === undefined ? (nodeOrNodes as SwNode) : (nodeOrNodes as SwNodes).at(index);
  }

  /** Returns the current node array offset. @returns Current array offset. */
  public GetIndex(): number {
    return this.node.GetIndex();
  }

  /** Returns the indexed node. @returns Identity-bearing indexed node. */
  public GetNode(): SwNode {
    return this.node;
  }

  /** Reassigns this registered-style index to another node. @param node - New indexed node. @returns Nothing. */
  public Assign(node: SwNode): void {
    this.node = node;
  }
}

/** Marks one content offset in the Writer document model. */
export class SwPosition {
  public readonly nNode: SwNodeIndex;

  /**
   * Creates a position owned by one content node.
   * @param node - Positioned content node.
   * @param nContent - UTF-16 offset inside node.
   * @returns Nothing; initializes this position.
   */
  public constructor(
    node: SwContentNode,
    public nContent = 0,
  ) {
    if (!Number.isInteger(nContent) || nContent < 0 || nContent > node.Len())
      throw new Error("SwPosition content offset is outside its node.");
    this.nNode = new SwNodeIndex(node);
  }

  /** Returns the current node array offset. @returns Current node offset. */
  public GetNodeIndex(): number {
    return this.nNode.GetIndex();
  }

  /** Returns the positioned node. @returns Positioned model node. */
  public GetNode(): SwNode {
    return this.nNode.GetNode();
  }

  /** Returns the content offset. @returns UTF-16 content offset. */
  public GetContentIndex(): number {
    return this.nContent;
  }

  /** Changes the content offset inside the current content node. @param offset - New UTF-16 offset. @returns Nothing. */
  public SetContent(offset: number): void {
    const node = this.GetNode() as SwContentNode;
    if (!Number.isInteger(offset) || offset < 0 || offset > node.Len())
      throw new Error("SwPosition content offset is outside its node.");
    this.nContent = offset;
  }

  /** Compares model order by node and then content offset. @param other - Position to compare. @returns Signed ordering result. */
  public compare(other: SwPosition): number {
    return this.GetNodeIndex() - other.GetNodeIndex() || this.nContent - other.nContent;
  }

  /** Creates an independent position on the same node. @returns Cloned position. */
  public clone(): SwPosition {
    return new SwPosition(this.GetNode() as SwContentNode, this.nContent);
  }
}

/** Represents Writer's direction-preserving Point-and-Mark selection. */
export class SwPaM {
  private point: SwPosition;
  private mark: SwPosition | undefined;

  /**
   * Creates a collapsed position or an explicit mark-to-point selection.
   * @param point - Moving point endpoint.
   * @param mark - Optional fixed mark endpoint.
   * @returns Nothing; initializes this range.
   */
  public constructor(point: SwPosition, mark?: SwPosition) {
    this.point = point.clone();
    this.mark = mark?.clone();
    if (
      this.mark !== undefined &&
      this.mark.GetNode().GetNodes() !== this.point.GetNode().GetNodes()
    )
      throw new Error("SwPaM endpoints belong to different documents.");
  }

  /** Returns the moving point endpoint. @returns Point position. */
  public GetPoint(): SwPosition {
    return this.point;
  }

  /** Returns the fixed mark, or point for a collapsed selection. @returns Mark or point position. */
  public GetMark(): SwPosition {
    return this.mark ?? this.point;
  }

  /** Reports whether mark is distinct from point. @returns True when the range owns a mark. */
  public HasMark(): boolean {
    return this.mark !== undefined;
  }

  /** Sets mark to the current point. @returns Nothing. */
  public SetMark(): void {
    this.mark = this.point.clone();
  }

  /** Removes mark while retaining point. @returns Nothing. */
  public DeleteMark(): void {
    this.mark = undefined;
  }

  /** Returns the earlier endpoint irrespective of selection direction. @returns Ordered start position. */
  public Start(): SwPosition {
    const mark = this.GetMark();
    return mark.compare(this.point) <= 0 ? mark : this.point;
  }

  /** Returns the later endpoint irrespective of selection direction. @returns Ordered end position. */
  public End(): SwPosition {
    const mark = this.GetMark();
    return mark.compare(this.point) <= 0 ? this.point : mark;
  }
}
