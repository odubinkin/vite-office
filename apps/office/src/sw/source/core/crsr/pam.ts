/**
 * @fileoverview Implements Writer model positions and point-and-mark selections from the pinned LibreOffice `sw/source/core/crsr/pam.cxx` boundary.
 */

import type { SwContentNode, SwNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  SwContentIndex,
  type SwContentIndexAffinity,
  type SwContentIndexOwnerKind,
} from "../bastyp/index";

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
  public readonly nContent: SwContentIndex;

  /**
   * Creates a position owned by one content node.
   * @param node - Positioned content node.
   * @param nContent - UTF-16 offset inside node.
   * @param ownerKind - Registered owner category.
   * @param affinity - Boundary affinity.
   * @returns Nothing; initializes this position.
   */
  public constructor(
    node: SwContentNode,
    nContent = 0,
    ownerKind: SwContentIndexOwnerKind = "cursor",
    affinity: SwContentIndexAffinity = "after",
  ) {
    if (!Number.isInteger(nContent) || nContent < 0 || nContent > node.Len())
      throw new Error("SwPosition content offset is outside its node.");
    this.nNode = new SwNodeIndex(node);
    this.nContent = new SwContentIndex(
      node,
      nContent,
      ownerKind,
      affinity,
      /** Keeps the paired SwNodeIndex synchronized when structural operations transfer this content index. @param nextNode - New content node. @returns Nothing. */ (
        nextNode,
      ) => this.nNode.Assign(nextNode),
    );
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
    return this.nContent.GetIndex();
  }

  /** Changes the content offset inside the current content node. @param offset - New UTF-16 offset. @returns Nothing. */
  public SetContent(offset: number): void {
    const node = this.GetNode() as SwContentNode;
    if (!Number.isInteger(offset) || offset < 0 || offset > node.Len())
      throw new Error("SwPosition content offset is outside its node.");
    this.nContent.Assign(node, offset);
  }

  /** Compares model order by node and then content offset. @param other - Position to compare. @returns Signed ordering result. */
  public compare(other: SwPosition): number {
    return (
      this.GetNodeIndex() - other.GetNodeIndex() || this.GetContentIndex() - other.GetContentIndex()
    );
  }

  /** Reassigns both node and registered content index. @param node - Destination content node. @param offset - Destination offset. @returns Nothing. */
  public Assign(node: SwContentNode, offset: number): void {
    this.nContent.Assign(node, offset);
  }

  /** Changes the bounded position owner category. @param ownerKind - New owner kind. @returns Nothing. */
  public SetOwnerKind(ownerKind: SwContentIndexOwnerKind): void {
    this.nContent.SetOwnerKind(ownerKind);
  }

  /** Explicitly unregisters the content position. @returns Nothing. */
  public Dispose(): void {
    this.nContent.Dispose();
  }

  /** Creates an independent registered position on the same node. @param ownerKind - Optional owner override. @returns Cloned position. */
  public clone(ownerKind = this.nContent.GetOwnerKind()): SwPosition {
    return new SwPosition(
      this.GetNode() as SwContentNode,
      this.GetContentIndex(),
      ownerKind,
      this.nContent.GetAffinity(),
    );
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
    this.mark = undefined;
    this.Assign(point, mark);
  }

  /** Repositions this persistent PaM after cursor movement or atomic document replacement. @param point - New moving endpoint. @param mark - Optional fixed endpoint. @returns Nothing. */
  public Assign(point: SwPosition, mark?: SwPosition): void {
    const nextPoint = point.clone();
    nextPoint.SetOwnerKind("cursor");
    const nextMark = mark?.clone("mark");
    if (nextMark !== undefined && nextMark.GetNode().GetNodes() !== nextPoint.GetNode().GetNodes())
      throw new Error("SwPaM endpoints belong to different documents.");
    this.point?.Dispose();
    this.mark?.Dispose();
    this.point = nextPoint;
    this.mark = nextMark;
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
    this.mark?.Dispose();
    this.mark = this.point.clone("mark");
  }

  /** Removes mark while retaining point. @returns Nothing. */
  public DeleteMark(): void {
    this.mark?.Dispose();
    this.mark = undefined;
  }

  /** Unregisters both persistent PaM endpoints. @returns Nothing. */
  public Dispose(): void {
    this.point.Dispose();
    this.mark?.Dispose();
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

/** Ordered same-node range selected by a canonical Writer PaM. */
export interface WriterTextRange {
  readonly end: number;
  readonly node: SwTextNode;
  readonly start: number;
}

/** Returns the non-empty same-node range of one Writer PaM. @param cursor - Canonical selection. @returns Range or undefined. */
export function getWriterSelectedTextRange(cursor: SwPaM): WriterTextRange | undefined {
  if (!cursor.HasMark()) return undefined;
  const point = cursor.GetPoint();
  const mark = cursor.GetMark();
  if (point.GetNode() !== mark.GetNode()) return undefined;
  const start = Math.min(point.GetContentIndex(), mark.GetContentIndex());
  const end = Math.max(point.GetContentIndex(), mark.GetContentIndex());
  return start === end ? undefined : { end, node: point.GetNode() as SwTextNode, start };
}

/** Validates one stable cursor offset against its current Writer text node. @param paragraph - Target text node. @param offset - Candidate UTF-16 offset. @returns Whether the position is representable. */
export function isWriterCursorOffset(paragraph: SwTextNode, offset: number): boolean {
  return Number.isInteger(offset) && offset >= 0 && offset <= paragraph.Len();
}

/** Returns every non-empty paragraph-local range covered by an ordered Writer selection. @param cursor - Writer selection. @returns Selected paragraph ranges or undefined. */
export function getWriterSelectedTextRanges(cursor: SwPaM): readonly WriterTextRange[] | undefined {
  if (!cursor.HasMark()) return undefined;
  const point = cursor.GetPoint();
  const mark = cursor.GetMark();
  const first = point.compare(mark) <= 0 ? point : mark;
  const last = first === point ? mark : point;
  const firstNode = first.GetNode() as SwTextNode;
  const lastNode = last.GetNode() as SwTextNode;
  // SwPaM.Assign validates that both endpoints belong to one SwNodes graph.
  return firstNode
    .GetDoc()
    .paragraphs.filter(
      /** Keeps only body paragraphs within the inclusive Writer node span. @param node - Body paragraph. @returns Whether selected. */ (
        node,
      ) => node.GetIndex() >= firstNode.GetIndex() && node.GetIndex() <= lastNode.GetIndex(),
    )
    .map(
      /** Converts one selected paragraph to its local bounded range. @param node - Selected paragraph. @returns Local range. */ (
        node,
      ) => ({
        end: node === lastNode ? last.GetContentIndex() : node.Len(),
        node,
        start: node === firstNode ? first.GetContentIndex() : 0,
      }),
    )
    .filter(
      /** Excludes zero-width boundary paragraphs without discarding the enclosing selection. @param range - Candidate range. @returns Whether non-empty. */ (
        range,
      ) => range.start < range.end,
    );
}
