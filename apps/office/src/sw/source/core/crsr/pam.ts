/**
 * @fileoverview Implements Writer model positions and point-and-mark selections from the pinned LibreOffice `sw/source/core/crsr/pam.cxx` boundary.
 */

import { goNext, goPrevious } from "../docnode/nodes.navigation";
import { Ring } from "../../../inc/ring";
import { SwContentNode, SwNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  SwContentIndex,
  type SwContentIndexAffinity,
  type SwContentIndexOwnerKind,
} from "../bastyp/index";

/** Native node index registers with its actual node and follows original RemoveNode correction as well as insertion/movement identity. */
export class SwNodeIndex {
  private node: SwNode;
  private readonly reference = new WeakRef(this);

  /**
   * Creates an index for an existing node or one current array offset.
   * @param nodeOrNodes - Existing node, copied native index or owning node array.
   * @param index - Native relative node/index offset or absolute array offset, default0.
   * @returns Nothing; initializes this index.
   */
  public constructor(nodeOrNodes: SwNode | SwNodes | SwNodeIndex, index = 0) {
    this.node = SwNodeIndex.ResolveNode(nodeOrNodes, index);
    this.node.RegisterNodeIndex(this.reference);
  }
  /** Original node/array/copy overloads resolve the same actual node before registration. @param origin - Native node, node array or copied index. @param offset - Original relative offset for node/index, absolute for array. @returns Actual node. */
  private static ResolveNode(origin: SwNode | SwNodes | SwNodeIndex, offset: number): SwNode {
    if (origin instanceof SwNodeIndex)
      return offset ? origin.GetNodes().at(origin.GetIndex() + offset) : origin.GetNode();
    if (origin instanceof SwNode)
      return offset ? origin.GetNodes().at(origin.GetIndex() + offset) : origin;
    return origin.at(offset);
  }
  /** Original owning array is resolved from the current actual node. @returns Borrowed node array. */
  public GetNodes(): SwNodes {
    return this.node.GetNodes();
  }

  /** Returns the current node array offset. @returns Current array offset. */
  public GetIndex(): number {
    return this.node.GetIndex();
  }

  /** Returns the indexed node. @returns Identity-bearing indexed node. */
  public GetNode(): SwNode {
    return this.node;
  }

  /** Original node/index/array assignment unlinks before registering the resolved target. @param origin - New native node, copied index or node array. @param offset - Relative node/index or absolute array offset. @returns This original index by reference. */
  public Assign(origin: SwNode | SwNodes | SwNodeIndex, offset = 0): this {
    const node = SwNodeIndex.ResolveNode(origin, offset);
    if (node === this.node) return this;
    this.node.DeRegisterNodeIndex(this.reference);
    this.node = node;
    this.node.RegisterNodeIndex(this.reference);
    return this;
  }
  /** Original index destructor unlinks only this borrowed index, never its node. @returns Nothing. */
  public Dispose(): void {
    this.node.DeRegisterNodeIndex(this.reference);
  }
}

/** Marks one content offset in the Writer document model. */
export class SwPosition {
  public readonly nNode: SwNodeIndex;
  public readonly nContent: SwContentIndex;

  /**
   * Creates a native position on a content or structural node.
   * @param node - Positioned native node.
   * @param nContent - UTF-16 offset inside node.
   * @param ownerKind - Registered owner category.
   * @param affinity - Boundary affinity.
   * @returns Nothing; initializes this position.
   */
  public constructor(
    node: SwNode,
    nContent = 0,
    ownerKind: SwContentIndexOwnerKind = "cursor",
    affinity: SwContentIndexAffinity = "after",
  ) {
    if (
      !Number.isInteger(nContent) ||
      nContent < 0 ||
      nContent > (node instanceof SwContentNode ? node.Len() : 0)
    )
      throw new Error("SwPosition content offset is outside its node.");
    this.nNode = new SwNodeIndex(node);
    this.nContent = new SwContentIndex(
      node instanceof SwContentNode ? node : undefined,
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
    const node = this.GetNode();
    if (
      !Number.isInteger(offset) ||
      offset < 0 ||
      offset > (node instanceof SwContentNode ? node.Len() : 0)
    )
      throw new Error("SwPosition content offset is outside its node.");
    this.Assign(node, offset);
  }

  /** Compares model order by node and then content offset. @param other - Position to compare. @returns Signed ordering result. */
  public compare(other: SwPosition): number {
    return (
      this.GetNodeIndex() - other.GetNodeIndex() || this.GetContentIndex() - other.GetContentIndex()
    );
  }

  /** Reassigns both node and registered content index. @param node - Destination native node. @param offset - Destination offset. @returns Nothing. */
  public Assign(node: SwNode, offset = 0): void {
    this.nContent.Assign(node instanceof SwContentNode ? node : undefined, offset);
    this.nNode.Assign(node);
  }

  /** Changes the bounded position owner category. @param ownerKind - New owner kind. @returns Nothing. */
  public SetOwnerKind(ownerKind: SwContentIndexOwnerKind): void {
    this.nContent.SetOwnerKind(ownerKind);
  }

  /** Explicitly unregisters the content position. @returns Nothing. */
  public Dispose(): void {
    this.nContent.Dispose();
    this.nNode.Dispose();
  }

  /** Creates an independent registered position on the same node. @param ownerKind - Optional owner override. @returns Cloned position. */
  public clone(ownerKind = this.nContent.GetOwnerKind()): SwPosition {
    return new SwPosition(
      this.GetNode(),
      this.GetContentIndex(),
      ownerKind,
      this.nContent.GetAffinity(),
    );
  }
}

/** Represents Writer's direction-preserving Point-and-Mark selection. */
export class SwPaM extends Ring<SwPaM> {
  private inFrontOfLabel = false;
  /** Reads native list-label cursor affinity. @returns Label position state. */
  public IsInFrontOfLabel(): boolean {
    return this.inFrontOfLabel;
  }
  /** Assigns native label affinity without changing the text point. @param value - Label state. @returns Nothing. */
  public SetInFrontOfLabel_(value: boolean): void {
    this.inFrontOfLabel = value;
  }
  private readonly m_Bound1: SwPosition;
  private readonly m_Bound2: SwPosition;
  private m_pPoint: SwPosition;
  private m_pMark: SwPosition;
  /** Native physical bounds and pointer aliases; the existing point-first TypeScript binding translates the original two-position argument order without changing callers. The unused single-position bound starts at document node0. @param point - Actual moving endpoint. @param mark - Optional actual fixed endpoint. @param ring - Original selection ring. @returns Native range owner. */
  public constructor(point: SwPosition, mark?: SwPosition, ring?: SwPaM) {
    super(ring);
    if (mark && mark.GetNode().GetNodes() !== point.GetNode().GetNodes())
      throw new Error("SwPaM endpoints belong to different documents.");
    this.m_Bound1 = (mark ?? point).clone(mark ? "mark" : "cursor");
    this.m_Bound2 = mark ? point.clone("cursor") : new SwPosition(point.GetNode().GetNodes().at(0));
    this.m_pPoint = mark ? this.m_Bound2 : this.m_Bound1;
    this.m_pMark = mark ? this.m_Bound1 : this.m_pPoint;
  }
  /** Original physical bound query is independent from Point/Mark orientation and active selection. @param one - First physical bound, default true. @returns Same actual owned bound. */
  public GetBound(one = true): SwPosition {
    return one ? this.m_Bound1 : this.m_Bound2;
  }
  /** Returns the next native range in the circular selection. @returns Next owner. */
  public GetNext(): SwPaM {
    return this.GetNextInRing();
  }
  /** Returns the previous native range in the circular selection. @returns Previous owner. */
  public GetPrev(): SwPaM {
    return this.GetPrevInRing();
  }
  /** Reports multiple actual selection owners. @returns Whether ring is nontrivial. */
  public IsMultiSelection(): boolean {
    return !this.unique();
  }
  /** Existing position-pair binding for native value assignment retains both physical positions. Copies protect aliases supplied by existing atomic replacement callers; no replacement PaM/position owner is installed. @param point - New moving endpoint. @param mark - Optional fixed endpoint. @returns This native range. */
  public Assign(point: SwPosition, mark?: SwPosition): this {
    if (mark && mark.GetNode().GetNodes() !== point.GetNode().GetNodes())
      throw new Error("SwPaM endpoints belong to different documents.");
    const nextPoint = point.clone(),
      nextMark = mark?.clone();
    try {
      this.m_pPoint.Assign(nextPoint.GetNode(), nextPoint.GetContentIndex());
      this.m_pPoint.SetOwnerKind("cursor");
      this.m_pPoint.nContent.SetAffinity(nextPoint.nContent.GetAffinity());
      if (nextMark) {
        this.SetMark();
        this.m_pMark.Assign(nextMark.GetNode(), nextMark.GetContentIndex());
        this.m_pMark.nContent.SetAffinity(nextMark.nContent.GetAffinity());
      } else this.DeleteMark();
      return this;
    } finally {
      nextPoint.Dispose();
      nextMark?.Dispose();
    }
  }
  /** Returns the original moving pointer alias. @returns Borrowed point. */
  public GetPoint(): SwPosition {
    return this.m_pPoint;
  }
  /** Returns the original mark alias, equal to point while unmarked. @returns Borrowed mark. */
  public GetMark(): SwPosition {
    return this.m_pMark;
  }
  /** Original selection presence tests pointer identity, not coordinates. @returns Whether the two pointer aliases differ. */
  public HasMark(): boolean {
    return this.m_pPoint !== this.m_pMark;
  }
  /** Original Exchange swaps pointer aliases, never the owned bounds. @returns Nothing. */
  public Exchange(): void {
    if (this.HasMark()) [this.m_pPoint, this.m_pMark] = [this.m_pMark, this.m_pPoint];
  }
  /** Original Normalize default keeps Point first. @param pointFirst - Native ordering, default true. @returns Nothing. */
  public Normalize(pointFirst = true): void {
    if (
      (pointFirst && this.m_pPoint.compare(this.m_pMark) > 0) ||
      (!pointFirst && this.m_pPoint.compare(this.m_pMark) < 0)
    )
      this.Exchange();
  }
  /** Original SetMark reuses the opposite physical bound and copies Point every time. @returns Nothing. */
  public SetMark(): void {
    this.m_pMark = this.m_pPoint === this.m_Bound1 ? this.m_Bound2 : this.m_Bound1;
    this.m_pMark.Assign(this.m_pPoint.GetNode(), this.m_pPoint.GetContentIndex());
    this.m_pMark.SetOwnerKind("mark");
    this.m_pMark.nContent.SetAffinity(this.m_pPoint.nContent.GetAffinity());
  }
  /** Original DeleteMark parks the formerly active mark at document node0, then aliases Point. An already unmarked range leaves its inactive bound untouched. @returns Nothing. */
  public DeleteMark(): void {
    if (this.HasMark()) {
      this.m_pMark.Assign(this.m_pPoint.GetNode().GetNodes().at(0));
      this.m_pMark = this.m_pPoint;
    }
  }
  /** Original destruction releases both physical bounds independently from pointer aliases. @returns Nothing. */
  public Dispose(): void {
    this.unlink();
    this.m_Bound1.Dispose();
    this.m_Bound2.Dispose();
  }
  /** Original start query selects Point on an equal-coordinate tie. @returns Actual selected endpoint. */
  public Start(): SwPosition {
    return this.m_pPoint.compare(this.m_pMark) <= 0 ? this.m_pPoint : this.m_pMark;
  }
  /** Original end query selects Mark on an equal-coordinate tie. @returns Actual selected endpoint. */
  public End(): SwPosition {
    return this.m_pPoint.compare(this.m_pMark) > 0 ? this.m_pPoint : this.m_pMark;
  }
  /** Original ordered pair retains the actual endpoint identities. @returns Borrowed start/end pair. */
  public StartEnd(): readonly [SwPosition, SwPosition] {
    return [this.Start(), this.End()];
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
  if (cursor.IsMultiSelection()) {
    const ranges: WriterTextRange[] = [];
    for (const current of cursor.GetRingContainer())
      ranges.push(...(getWriterSinglePaMTextRanges(current) ?? []));
    return ranges;
  }
  return getWriterSinglePaMTextRanges(cursor);
}

/** Resolves one native PaM while ring traversal remains outside its linear span. @param cursor - Native range owner. @returns Paragraph-local ranges. */
function getWriterSinglePaMTextRanges(cursor: SwPaM): readonly WriterTextRange[] | undefined {
  if (!cursor.HasMark()) return undefined;
  const point = cursor.GetPoint();
  const mark = cursor.GetMark();
  const first = point.compare(mark) <= 0 ? point : mark;
  const last = first === point ? mark : point;
  const firstNode = first.GetNode() as SwTextNode;
  const lastNode = last.GetNode() as SwTextNode;
  // SwPaM.Assign validates that both endpoints belong to one SwNodes graph.
  return firstNode
    .GetNodes()
    .entries()
    .slice(firstNode.GetIndex(), lastNode.GetIndex() + 1)
    .filter(
      /** Selects actual text nodes within the native PaM span, including cell text. @param node - Connected node. @returns Whether it contains editable text. */
      (node): node is SwTextNode => node.IsTextNode(),
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

/** Original fixed-section range classification, including second-level boundaries outside body content.
 * @param start - Source node.
 * @param end - Target node.
 * @param checkSection - Whether non-body ranges must share a second-level section.
 * @returns Native range admission.
 */
export function CheckNodesRange(start: SwNode, end: SwNode, checkSection: boolean): boolean {
  const nodes = start.GetNodes(),
    first = start.GetIndex(),
    last = end.GetIndex();
  const classify =
    /** Applies original Chk_Both/Chk_One/Chk_None classification. @param base - Fixed end node. @returns Native enum value. */ (
      base: SwNode,
    ): number => {
      const lower = base.StartOfSectionNode().GetIndex(),
        upper = base.GetIndex();
      const a = lower < first && upper >= first,
        b = lower < last && upper >= last;
      return a && b ? 0 : a || b ? 1 : 2;
    };
  let section = classify(nodes.GetEndOfContent());
  if (section !== 2) return section === 0;
  for (const base of [
    nodes.GetEndOfAutotext(),
    nodes.GetEndOfPostIts(),
    nodes.GetEndOfInserts(),
    nodes.GetEndOfRedlines(),
  ]) {
    section = classify(base);
    if (section === 2) continue;
    if (section !== 0) return false;
    if (!checkSection) return true;
    const node = nodes.at(first);
    let surrounding = node.IsStartNode() ? node : node.StartOfSectionNode();
    if (surrounding === nodes.at(last).StartOfSectionNode()) return true;
    if (surrounding.StartOfSectionNode().GetIndex() === 0) return false;
    for (;;) {
      const parent = surrounding.StartOfSectionNode();
      if (parent.EndOfSectionNode() === base) break;
      surrounding = parent;
    }
    const lower = surrounding.GetIndex(),
      upper = surrounding.EndOfSectionNode().GetIndex();
    // The ancestor walk starts at first's actual section; valid native section
    // ownership already places first between these same sentinels.
    return lower <= last && last <= upper;
  }
  return false;
}
/** Original GoNextPos, retaining the existing unchecked call profile as the default. @param position - Registered position. @param check - Native fixed/second-level section check. @returns Found content owner or undefined. */
export function GoNextPos(position: SwPosition, check = false): SwContentNode | undefined {
  return GoAdjacentPos(position, 1, check);
}
/** Original GoPreviousPos assigns zero, not the previous node's end. @param position - Registered position. @param check - Native fixed/second-level section check. @returns Found content owner or undefined. */
export function GoPreviousPos(position: SwPosition, check = false): SwContentNode | undefined {
  return GoAdjacentPos(position, -1, check);
}
/** Source SwNodes adjacency and GoPos range check before committing cursor movement. @param position - Registered source. @param direction - Native direction. @param check - Native range-check policy. @returns Found content owner. */
function GoAdjacentPos(
  position: SwPosition,
  direction: 1 | -1,
  check: boolean,
): SwContentNode | undefined {
  const index = new SwNodeIndex(position.GetNode());
  const node = direction > 0 ? goNext(index) : goPrevious(index, false);
  if (node !== undefined) {
    if (
      check &&
      Math.abs(node.GetIndex() - position.GetNodeIndex()) !== 1 &&
      !CheckNodesRange(position.GetNode(), node, true)
    )
      return undefined;
    position.Assign(node, 0);
  }
  return node;
}
