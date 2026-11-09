/**
 * @fileoverview Implements Writer document model nodes and structural transitions from the pinned LibreOffice `sw/source/core/docnode/node.cxx` boundary.
 */

import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { SwContentIndex } from "../bastyp/index";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwStartNodeType } from "../../../inc/ndtyp";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { AttrSetChangeHint, SwAttrSetChg } from "../../../inc/hints";
import { WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SwAttrSet } from "../attr/swatrset";
import { SwContentIndexRegistry } from "../bastyp/index";
import { SwTextFormatColl, type SwFormatColl } from "../doc/fmtcol";
import type { SwNodes } from "./nodes";
import { AttrSetHandleHelper, type SwAttrSetHandle } from "./node-attribute-handle";
import type { SwTableBox } from "../table/swtable";
import type { SwTable } from "../table/swtable";
import type { SwPosition, SwNodeIndex } from "../crsr/pam";
import type { SwRootFrame } from "../layout/newfrm";
import { SwContentFrame } from "../layout/ssfrm";
import { SwClient, SwIterator } from "../../../inc/calbck";
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";
import { SwNumRuleItem } from "../para/paratr";
import { SwFrameType } from "../layout/wsfrm";
import { GetFrameOfModify } from "../layout/frmtool";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { RES_FLYFRMFMT, RES_PAGEDESC } from "../../../inc/hintids";
import type { SwFrameFormat } from "../layout/atrfrm";
import type { SwFormatPageDesc } from "../attr/fmtpdsc";
import type { SwPageDesc } from "../layout/pagedesc";

/** Identifies the node categories implemented by the current Writer model slice. */
export type SwNodeType = "end" | "start" | "text";

/** Base class of every Writer document model element. */
export abstract class SwNode extends SwContentIndexRegistry {
  private m_bIgnoreDontExpand = false;
  // Original m_vIndices is a borrowed ring. Weak references retain that lifetime
  // boundary in JavaScript without making every temporary index a node-owned object.
  private readonly m_vIndices = new Set<WeakRef<SwNodeIndex>>();
  private readonly nodeIndexFinalizers = new FinalizationRegistry<WeakRef<SwNodeIndex>>(
    /** Releases only a borrowed reference when its JavaScript index is collected. Explicit native Dispose/Assign already unlink synchronously. @param reference - Collected index reference. @returns Nothing. */ (
      reference,
    ) => {
      this.m_vIndices.delete(reference);
    },
  );
  /** Original node-index registration across the TypeScript owner split. @param reference - Borrowed native index reference. @returns Nothing. */
  RegisterNodeIndex(reference: WeakRef<SwNodeIndex>): void {
    this.m_vIndices.add(reference);
    const index = reference.deref();
    if (index) this.nodeIndexFinalizers.register(index, reference, reference);
  }
  /** Original node-index unlink on reassignment/destruction. @param reference - Registered borrowed reference. @returns Nothing. */
  DeRegisterNodeIndex(reference: WeakRef<SwNodeIndex>): void {
    this.m_vIndices.delete(reference);
    this.nodeIndexFinalizers.unregister(reference);
  }
  /** Original RemoveNode index correction assigns each live index to the first following node before removal. Assignment unlinks it from this owner. @param target - Actual first surviving node. @returns Nothing. */
  MoveNodeIndicesTo(target: SwNode): void {
    if (target === this) return;
    for (const reference of this.m_vIndices) {
      const index = reference.deref();
      if (index) index.Assign(target);
      else this.m_vIndices.delete(reference);
    }
  }

  /**
   * Creates a node owned by one SwNodes array.
   * @param nodes - Owning node array.
   * @param nodeType - Implemented node category.
   * @param startOfSection - Optional containing section start.
   * @returns Nothing; initializes this node.
   */
  protected constructor(
    private readonly nodes: SwNodes,
    private readonly nodeType: SwNodeType,
    private startOfSection?: SwStartNode,
  ) {
    super();
  }

  /** Original inline node-type getter from ndtxt.hxx returns null for nontext nodes. @returns Actual text owner or null. */
  public GetTextNode(): SwTextNode | null {
    return this.nodeType === "text" ? (this as SwNode as SwTextNode) : null;
  }
  /** Reports whether end-equal hints ignore DontExpand during coordinate updates. @returns Native node state. */
  public IsIgnoreDontExpand(): boolean {
    return this.m_bIgnoreDontExpand;
  }

  /** Assigns the native ignore-expansion state without broadcasting. @param value - New state. @returns Nothing. */
  public SetIgnoreDontExpand(value: boolean): void {
    this.m_bIgnoreDontExpand = value;
  }

  /** Original enclosing-table lookup includes a table node itself, then follows actual section owners up to the root sentinel. @returns Actual enclosing table or null. */
  public FindTableNode(): SwTableNode | null {
    if (this instanceof SwTableNode) return this;
    let current = this.StartOfSectionNode();
    while (!(current instanceof SwTableNode) && current.GetIndex())
      current = current.StartOfSectionNode();
    return current instanceof SwTableNode ? current : null;
  }
  /** Original node.cxx lookup resolves the actual containing cell and its table-owned box. @returns Actual box or null outside a cell. */
  public GetTableBox(): SwTableBox | null {
    const start = this.FindTableBoxStartNode();
    if (!start) return null;
    const table = start.FindTableNode();
    if (!table) throw new Error("assert(native cell has a containing table)");
    return table.GetTable().GetTableBox(start.GetIndex()) ?? null;
  }
  /** Original typed-start lookup includes a start node itself and preserves the root-index termination condition. @param type - Native section tag. @returns Actual matching start or null. */
  public FindStartNodeByType(type: SwStartNodeType): SwStartNode | null {
    let current = this instanceof SwStartNode ? this : this.StartOfSectionNode();
    while (current.GetStartNodeType() !== type && current.GetIndex())
      current = current.StartOfSectionNode();
    return current.GetStartNodeType() === type ? current : null;
  }
  /** Original fly start-node query. @returns Actual fly section or null. */
  public FindFlyStartNode(): SwStartNode | null {
    return this.FindStartNodeByType(SwStartNodeType.SwFlyStartNode);
  }
  /** Original registry branch of GetFlyFormat for the represented model, where there are no physical fly frames. @returns Actual original owning fly format, if any. */
  public GetFlyFormat(): SwFrameFormat | undefined {
    const start = this.FindFlyStartNode();
    if (start !== null)
      for (const format of this.GetDoc().GetSpzFrameFormats())
        if (
          format.Which() === RES_FLYFRMFMT &&
          format.GetContent().GetContentIdx()?.GetNode() === start
        )
          return format;
    return undefined;
  }
  /** Original table-box section lookup delegates to the generic tag search. @returns Actual start or null. */
  public FindTableBoxStartNode(): SwStartNode | null {
    return this.FindStartNodeByType(SwStartNodeType.SwTableBoxStartNode);
  }
  /** Returns the owning node array. @returns Owning SwNodes. */
  public GetNodes(): SwNodes {
    return this.nodes;
  }

  /** Returns the owning Writer document. @returns Owning SwDoc. */
  public GetDoc() {
    return this.nodes.GetDoc();
  }

  /** Returns the node's current offset in its owner array. @returns Current node offset. */
  public GetIndex(): number {
    return this.nodes.indexOf(this);
  }

  /** Returns this node's model category. @returns Implemented node type. */
  public GetNodeType(): SwNodeType {
    return this.nodeType;
  }

  /** Returns the section start that contains this node. @returns Containing section start. */
  public StartOfSectionNode(): SwStartNode {
    if (this instanceof SwStartNode && this.startOfSection === undefined) return this;
    if (this.startOfSection === undefined) throw new Error("SwNode has no section owner.");
    return this.startOfSection;
  }

  /** Original inline node.hxx section-end index resolves the actual shared section owner. @returns Native end-node offset. */
  public EndOfSectionIndex(): number {
    return this.EndOfSectionNode().GetIndex();
  }
  /** Original common matching-end query uses a start node itself or the node's enclosing start. @returns Actual matching end sentinel. */
  public EndOfSectionNode(): SwEndNode {
    return this.StartOfSectionNode().EndOfSectionNode();
  }

  /** Reassigns the canonical section during native TextToTable, retaining node and registered index identity. @param start - Connected new section. @returns Nothing. */
  public SetStartOfSection(start: SwStartNode): void {
    if (start.GetNodes() !== this.nodes) throw new Error("Section belongs to another document.");
    this.startOfSection = start;
  }

  /** Reports whether this is a section start sentinel. @returns True for SwStartNode. */
  public IsStartNode(): this is SwStartNode {
    return this.nodeType === "start";
  }

  /** Reports whether this is a section end sentinel. @returns True for SwEndNode. */
  public IsEndNode(): this is SwEndNode {
    return this.nodeType === "end";
  }

  /** Reports whether this is a text content node. @returns True for text nodes. */
  public IsTextNode(): boolean {
    return this.nodeType === "text";
  }
}

/** Starts one ordered section in the Writer node array. */
export class SwStartNode extends SwNode {
  private endOfSection?: SwEndNode;

  /** Creates a section start sentinel. @param nodes - Owning node array. @param parent - Optional parent section. @param startNodeType - Original structural section tag. @returns Nothing. */
  public constructor(
    nodes: SwNodes,
    parent?: SwStartNode,
    private readonly startNodeType = SwStartNodeType.SwNormalStartNode,
  ) {
    super(nodes, "start", parent);
  }

  /** Original section-kind value is independent of the ordinary node category. @returns Native section tag. */
  public GetStartNodeType(): SwStartNodeType {
    return this.startNodeType;
  }

  /** Links the matching end sentinel during SwNodes construction. @param end - Matching end sentinel. @returns Nothing. */
  public setEndOfSection(end: SwEndNode): void {
    this.endOfSection = end;
  }

  /** Returns the matching section end sentinel. @returns Matching end sentinel. */
  public override EndOfSectionNode(): SwEndNode {
    if (this.endOfSection === undefined) throw new Error("SwStartNode has no end sentinel.");
    return this.endOfSection;
  }
}

/** Begins one table section in the ordered Writer node array. */
export class SwTableNode extends SwStartNode {
  private table: SwTable | undefined;

  /** Creates a table start node. @param nodes - Owning array. @param parent - Body section. @returns Nothing. */
  public constructor(nodes: SwNodes, parent: SwStartNode) {
    super(nodes, parent);
  }

  /** Attaches the canonical table graph. @param table - Table owned by this section. @returns Nothing. */
  public SetTable(table: SwTable): void {
    this.table = table;
  }

  /** Returns the canonical table graph. @returns Table. */
  public GetTable(): SwTable {
    if (this.table === undefined) throw new Error("SwTableNode has no table.");
    return this.table;
  }
}

/** Begins one table cell section inside its table node. */
export class SwTableBoxStartNode extends SwStartNode {
  /** Creates a cell section. @param nodes - Owning array. @param parent - Containing native section; HTML can allocate a real cell section before assigning a core box. @returns Nothing. */
  public constructor(nodes: SwNodes, parent?: SwStartNode) {
    super(nodes, parent, SwStartNodeType.SwTableBoxStartNode);
  }
}

/** Ends one ordered section in the Writer node array. */
export class SwEndNode extends SwNode {
  /** Creates an end sentinel linked to its start sentinel. @param nodes - Owning node array. @param start - Matching start sentinel. @returns Nothing. */
  public constructor(nodes: SwNodes, start: SwStartNode) {
    super(nodes, "end", start);
  }
}

/** Base class for nodes that own indexable content. */
export abstract class SwContentNode extends SwNode {
  private readonly mpAttrSet: SwAttrSetHandle = { value: undefined };

  /** Original GoNext content-index overload for the consumed Chars (0), nonhidden/noncell responsibility. Other skip-mode services are not represented by this signature. @param index - Actual registered content index. @param mode - Original SwCursorSkipMode::Chars. @returns Whether one original code point was consumed. */
  public GoNext(index: SwContentIndex, mode: 0): boolean {
    void mode;
    if (index.GetIndex() >= this.Len()) return false;
    let offset = index.GetIndex() + 1;
    const node = this.GetTextNode();
    if (node) {
      const text = unicode(node.GetText()),
        pos: [number] = [index.GetIndex()];
      try {
        text.iterateCodePoints(pos);
        offset = pos[0];
      } finally {
        text.dispose();
      }
    }
    index.Assign(index.GetContentNode(), offset);
    return true;
  }
  /** Original GoPrevious content-index overload for the consumed Chars (0), nonhidden/noncell responsibility. @param index - Actual registered content index. @param mode - Original SwCursorSkipMode::Chars. @returns Whether one original code point was consumed. */
  public GoPrevious(index: SwContentIndex, mode: 0): boolean {
    void mode;
    if (index.GetIndex() <= 0) return false;
    let offset = index.GetIndex() - 1;
    const node = this.GetTextNode();
    if (node) {
      const text = unicode(node.GetText()),
        pos: [number] = [index.GetIndex()];
      try {
        text.iterateCodePoints(pos, -1);
        offset = pos[0];
      } finally {
        text.dispose();
      }
    }
    index.Assign(index.GetContentNode(), offset);
    return true;
  }
  /** Borrows a registered content frame through the native no-view-position query. Only text content frames are represented; native geometry/Calc and non-text content remain unported. @param layout - Optional original layout filter. @param position - Optional original model position. @returns Original text content frame or no registered match. */
  public getLayoutFrame(layout?: SwRootFrame, position?: SwPosition): SwContentFrame | undefined {
    return GetFrameOfModify(layout, this, SwFrameType.Txt, position) as SwContentFrame | undefined;
  }

  /** Original physical direction query uses the current registered frame without invoking formatting. @param position - Actual model position. @returns Physical direction or Unknown when there is no frame. */
  public GetTextDirection(position: SwPosition): SvxFrameDirection {
    const frame = this.getLayoutFrame(
      this.GetDoc().getIDocumentLayoutAccess().GetCurrentLayout(),
      position,
    );
    if (frame === undefined) return SvxFrameDirection.Unknown;
    if (frame.IsVertical()) {
      if (frame.IsVertLRBT()) return SvxFrameDirection.Vertical_LR_BT;
      return frame.IsRightToLeft()
        ? SvxFrameDirection.Vertical_LR_TB
        : SvxFrameDirection.Vertical_RL_TB;
    }
    return frame.IsRightToLeft()
      ? SvxFrameDirection.Horizontal_RL_TB
      : SvxFrameDirection.Horizontal_LR_TB;
  }
  /** Original content-node page assignment and no-physical-pages fallback in FindPageDesc. The existing page item binds by name to the actual owned descriptor. @returns Borrowed descriptor, or absent outside the document node array. */
  public FindPageDesc(): SwPageDesc | undefined {
    if (!this.GetNodes().IsDocNodes()) return undefined;
    const doc = this.GetDoc(),
      assignment = this.GetAttr(RES_PAGEDESC) as SwFormatPageDesc;
    return doc.FindPageDesc(assignment.GetPageDescName()) ?? doc.GetPageDesc(0);
  }

  /** Original numbering invalidation for represented nonconditional collections and actual document-owned rules. @returns Whether a named native rule was found. */
  public InvalidateNumRule(): boolean {
    const item = this.GetAttr(RES_PARATR_NUMRULE),
      name = item instanceof SwNumRuleItem ? item.GetValue() : "",
      rule = this.GetNodes().IsDocNodes() && name ? this.GetDoc().FindNumRulePtr(name) : undefined;
    rule?.Invalidate();
    return rule !== undefined;
  }
  /** Original current text-frame listener teardown and follow unlinking. Current layout owns text frames and sibling chains; merged redline/footnote/accessibility frame families are not represented. @param layout - Optional native root filter. @returns Nothing. */
  public DelFrames(layout?: SwRootFrame): void {
    for (const client of new SwIterator(SwClient, this)) {
      if (!(client instanceof SwContentFrame) || (layout && layout !== client.getRootFrame()))
        continue;
      if (client.IsFollow()) {
        const master = client.FindMaster();
        if (!master) throw new Error("assert(content follow has a master)");
        master.SetFollow(client.GetFollow());
      }
      client.SetFollow(undefined);
      client.RemoveFromLayout();
      client.DestroyImpl();
    }
  }

  /** Creates a content node in one Writer section. @param nodes - Owning node array. @param startOfSection - Containing section. @param formatColl - Registered format collection. @returns Nothing. */
  protected constructor(
    nodes: SwNodes,
    startOfSection: SwStartNode,
    private formatColl: SwFormatColl = nodes.GetDoc().GetDfltTextFormatColl(),
  ) {
    super(nodes, "text", startOfSection);
    if (formatColl.GetAttrSet().GetPool() !== nodes.GetDoc().GetAttrPool())
      throw new Error("SwContentNode format collection belongs to another document.");
  }

  /** Original adjacent join admission and optional index/position output. Current node graph has fixed/table/cell sections, but no transparent SwSectionNode owner to skip. @param index - Optional borrowed native output. @returns Whether the next content owner fits. */
  public CanJoinNext(index?: SwNodeIndex | SwPosition): boolean {
    const nodes = this.GetNodes(),
      nextIndex = this.GetIndex() + 1;
    if (nextIndex === nodes.Count() - 1) return false;
    const next = nodes.at(nextIndex);
    if (
      !(next instanceof SwContentNode) ||
      next.GetNodeType() !== this.GetNodeType() ||
      this.Len() + next.Len() >= 0x7ffffffd
    )
      return false;
    index?.Assign(next);
    return true;
  }
  /** Original previous-content join admission preserves the caller output on failure and uses the preceding owner's capacity. @param index - Optional borrowed node-index output. @returns Whether the previous content owner fits. */
  public CanJoinPrev(index?: SwNodeIndex): boolean {
    const previousIndex = this.GetIndex() - 1;
    if (previousIndex === 0) return false;
    const previous = this.GetNodes().at(previousIndex);
    if (
      !(previous instanceof SwContentNode) ||
      previous.GetNodeType() !== this.GetNodeType() ||
      previous.Len() + this.Len() >= 0x7ffffffd
    )
      return false;
    index?.Assign(previous);
    return true;
  }
  /** Returns the current content length. @returns UTF-16 content length. */
  public abstract Len(): number;

  /** Returns an effective direct, inherited, or pool-default item. @param which - Queried WhichId. @param inParent - Whether collection inheritance participates. @returns Effective item. */
  public GetAttr(which: number, inParent = true): SfxPoolItem {
    return this.GetSwAttrSet().Get(which, inParent);
  }

  /** Returns the direct auto-attribute set or the current collection set when absent. @returns Effective Writer attribute set. */
  public GetSwAttrSet(): SwAttrSet {
    return this.mpAttrSet.value ?? this.formatColl.GetAttrSet();
  }

  /** Returns the optional direct auto-attribute set. @returns Direct Writer attributes, when allocated. */
  public GetpSwAttrSet(): SwAttrSet | undefined {
    return this.mpAttrSet.value;
  }

  /** Reports whether direct auto attributes have been allocated. @returns True when a direct set exists. */
  public HasSwAttrSet(): boolean {
    return this.mpAttrSet.value !== undefined;
  }

  /** Stores one item or set as direct node attributes. @param itemOrSet - Direct item or item set. @returns True when at least one delta changed. */
  public SetAttr(itemOrSet: SfxPoolItem | SfxItemSet): boolean {
    const set = this.GetOrCreateSwAttrSet();
    const oldSet = new SwAttrSet(set.GetPool(), set.GetRanges());
    const newSet = new SwAttrSet(set.GetPool(), set.GetRanges());
    const changed = AttrSetHandleHelper.Put_BC(this.mpAttrSet, itemOrSet, oldSet, newSet);
    if (changed) this.NotifyAttrChange(oldSet, newSet);
    return changed;
  }

  /** Clears direct items by inclusive range or ordered vector. @param which - First WhichId or vector. @param end - Inclusive range end. @returns Whether items were removed. */
  public ResetAttr(which: number | readonly number[], end = 0): boolean {
    const set = this.GetpSwAttrSet();
    if (set === undefined) return false;
    const oldSet = new SwAttrSet(set.GetPool(), set.GetRanges());
    const newSet = new SwAttrSet(set.GetPool(), set.GetRanges());
    if (typeof which === "number") {
      const last = end === 0 || end < which ? which : end;
      const changed =
        AttrSetHandleHelper.ClearItem_BC(this.mpAttrSet, which, last, oldSet, newSet) !== 0;
      if (changed) {
        this.NotifyAttrChange(oldSet, newSet);
        if ((this.mpAttrSet.value as SwAttrSet).Count() === 0) this.mpAttrSet.value = undefined;
      }
      return changed;
    }
    let count = 0;
    for (const id of which)
      if (AttrSetHandleHelper.ClearItem_BC(this.mpAttrSet, id, undefined, oldSet, newSet) !== 0)
        count++;
    if (count !== 0) this.NotifyAttrChange(oldSet, newSet);
    if ((this.mpAttrSet.value as SwAttrSet).Count() === 0) this.mpAttrSet.value = undefined;
    return count !== 0;
  }

  /** Clears all direct items, broadcasts while the changed set is owned and returns semantic new-delta count. @returns Broadcast new-item count, excluding INVALID/DISABLED and slot entries. */
  public ResetAllAttr(): number {
    const set = this.GetpSwAttrSet();
    if (set === undefined) return 0;
    const oldSet = new SwAttrSet(set.GetPool(), set.GetRanges());
    const newSet = new SwAttrSet(set.GetPool(), set.GetRanges());
    const changed =
      AttrSetHandleHelper.ClearItem_BC(this.mpAttrSet, 0, undefined, oldSet, newSet) !== 0;
    if (changed) {
      this.NotifyAttrChange(oldSet, newSet);
      if ((this.mpAttrSet.value as SwAttrSet).Count() === 0) this.mpAttrSet.value = undefined;
    }
    return newSet.Count();
  }

  /** Publishes original native deltas before the document observer while the changed set remains owned. @param oldSet - Borrowed old delta. @param newSet - Borrowed accepted delta. @returns Nothing. */
  private NotifyAttrChange(oldSet: SwAttrSet, newSet: SwAttrSet): void {
    const current = this.mpAttrSet.value as SwAttrSet;
    this.CallSwClientNotify(
      new AttrSetChangeHint(new SwAttrSetChg(current, oldSet), new SwAttrSetChg(current, newSet)),
    );
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Changes the registered format collection and reparents direct attributes. @param formatColl - New document-owned collection. @returns Previous collection. */
  public ChgFormatColl(formatColl: SwFormatColl): SwFormatColl {
    if (formatColl.GetAttrSet().GetPool() !== this.GetDoc().GetAttrPool())
      throw new Error("SwContentNode format collection belongs to another document.");
    const previous = this.formatColl;
    if (previous !== formatColl) {
      this.formatColl = formatColl;
      this.mpAttrSet.value?.SetParent(formatColl.GetAttrSet());
      this.GetDoc().NotifyModelChange({
        formatId: formatColl.GetName(),
        kind: "format-inheritance-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
    }
    return previous;
  }

  /** Returns the registered format collection. @returns Current collection. */
  public GetFormatColl(): SwFormatColl {
    return this.formatColl;
  }

  /** Returns the registered paragraph style collection. @returns Current text-format collection. */
  public GetTextFormatColl(): SwTextFormatColl {
    if (!(this.formatColl instanceof SwTextFormatColl))
      throw new Error("SwContentNode is not registered in a SwTextFormatColl.");
    return this.formatColl;
  }

  /** Creates the node's direct Writer attribute set on first mutation. @returns Direct auto-attribute set. */
  private GetOrCreateSwAttrSet(): SwAttrSet {
    this.mpAttrSet.value ??= new SwAttrSet(
      this.GetDoc().GetAttrPool(),
      WRITER_TEXT_NODE_WHICH_RANGES,
      this.formatColl.GetAttrSet(),
    );
    return this.mpAttrSet.value;
  }
}
