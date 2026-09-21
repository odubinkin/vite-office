/**
 * @fileoverview Implements Writer document model nodes and structural transitions from the pinned LibreOffice `sw/source/core/docnode/node.cxx` boundary.
 */

import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { SwAttrSet } from "../attr/swatrset";
import { SwContentIndexRegistry } from "../bastyp/contentindex";
import { SwTextFormatColl, type SwFormatColl } from "../doc/fmtcol";
import type { SwNodes } from "./nodes";

/** Identifies the node categories implemented by the current Writer model slice. */
export type SwNodeType = "end" | "start" | "text";

/** Base class of every Writer document model element. */
export abstract class SwNode extends SwContentIndexRegistry {
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
    private readonly startOfSection?: SwStartNode,
  ) {
    super();
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

  /** Creates a section start sentinel. @param nodes - Owning node array. @param parent - Optional parent section. @returns Nothing. */
  public constructor(nodes: SwNodes, parent?: SwStartNode) {
    super(nodes, "start", parent);
  }

  /** Links the matching end sentinel during SwNodes construction. @param end - Matching end sentinel. @returns Nothing. */
  public setEndOfSection(end: SwEndNode): void {
    this.endOfSection = end;
  }

  /** Returns the matching section end sentinel. @returns Matching end sentinel. */
  public EndOfSectionNode(): SwEndNode {
    if (this.endOfSection === undefined) throw new Error("SwStartNode has no end sentinel.");
    return this.endOfSection;
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
  private attributeSet: SwAttrSet | undefined;

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

  /** Returns the current content length. @returns UTF-16 content length. */
  public abstract Len(): number;

  /** Returns an effective direct, inherited, or pool-default item. @param which - Queried WhichId. @param inParent - Whether collection inheritance participates. @returns Effective item. */
  public GetAttr(which: number, inParent = true): SfxPoolItem {
    return this.GetSwAttrSet().Get(which, inParent);
  }

  /** Returns the direct auto-attribute set or the current collection set when absent. @returns Effective Writer attribute set. */
  public GetSwAttrSet(): SwAttrSet {
    return this.attributeSet ?? this.formatColl.GetAttrSet();
  }

  /** Returns the optional direct auto-attribute set. @returns Direct Writer attributes, when allocated. */
  public GetpSwAttrSet(): SwAttrSet | undefined {
    return this.attributeSet;
  }

  /** Reports whether direct auto attributes have been allocated. @returns True when a direct set exists. */
  public HasSwAttrSet(): boolean {
    return this.attributeSet !== undefined;
  }

  /** Stores one item or set as direct node attributes. @param itemOrSet - Direct item or item set. @returns True when at least one delta changed. */
  public SetAttr(itemOrSet: SfxPoolItem | SfxItemSet): boolean {
    const set = this.GetOrCreateSwAttrSet();
    const changed = "Which" in itemOrSet ? set.Put(itemOrSet) !== undefined : set.PutSet(itemOrSet);
    if (changed)
      this.GetDoc().NotifyModelChange({
        kind: "attribute-set-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
    return changed;
  }

  /** Clears one direct item and releases an empty auto-attribute set. @param which - Cleared WhichId. @returns True when removed. */
  public ResetAttr(which: number): boolean {
    if (this.attributeSet === undefined) return false;
    const removed = this.attributeSet.ClearItem(which) !== 0;
    if (this.attributeSet.Count() === 0) this.attributeSet = undefined;
    if (removed)
      this.GetDoc().NotifyModelChange({
        kind: "attribute-set-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
    return removed;
  }

  /** Clears every direct node item and releases the auto-attribute set. @returns Removed item count. */
  public ResetAllAttr(): number {
    if (this.attributeSet === undefined) return 0;
    const removed = this.attributeSet.ClearItem();
    this.attributeSet = undefined;
    if (removed > 0)
      this.GetDoc().NotifyModelChange({
        kind: "attribute-set-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
    return removed;
  }

  /** Changes the registered format collection and reparents direct attributes. @param formatColl - New document-owned collection. @returns Previous collection. */
  public ChgFormatColl(formatColl: SwFormatColl): SwFormatColl {
    if (formatColl.GetAttrSet().GetPool() !== this.GetDoc().GetAttrPool())
      throw new Error("SwContentNode format collection belongs to another document.");
    const previous = this.formatColl;
    if (previous !== formatColl) {
      this.formatColl = formatColl;
      this.attributeSet?.SetParent(formatColl.GetAttrSet());
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
    this.attributeSet ??= new SwAttrSet(
      this.GetDoc().GetAttrPool(),
      WRITER_TEXT_NODE_WHICH_RANGES,
      this.formatColl.GetAttrSet(),
    );
    return this.attributeSet;
  }
}
