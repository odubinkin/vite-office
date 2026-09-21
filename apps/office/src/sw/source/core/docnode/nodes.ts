/**
 * @fileoverview Implements the Writer SwNodes array and fixed sections from the pinned LibreOffice `sw/source/core/docnode/nodes.cxx` boundary.
 */

import type { SwDoc } from "../doc/doc";
import { SwEndNode, SwStartNode, type SwNode } from "./node";
import { SwTextNode } from "../txtnode/ndtxt";

/** Owns every Writer model node and the fixed non-content/content section sentinels. */
export class SwNodes {
  private readonly nodeArray: SwNode[] = [];
  private readonly endOfPostIts: SwEndNode;
  private readonly endOfInserts: SwEndNode;
  private readonly endOfAutotext: SwEndNode;
  private readonly endOfRedlines: SwEndNode;
  private readonly endOfContent: SwEndNode;

  /** Creates LibreOffice's five fixed node sections in their canonical order. @param document - Owning Writer document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {
    const root = this.appendStartNode();
    this.endOfPostIts = this.appendEndNode(root);
    this.endOfInserts = this.createFixedSection(undefined);
    this.endOfAutotext = this.createFixedSection(root);
    this.endOfRedlines = this.createFixedSection(root);
    this.endOfContent = this.createFixedSection(root);
  }

  /** Returns the document that owns this node array. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the current node count, including fixed sentinels. @returns Total node count. */
  public Count(): number {
    return this.nodeArray.length;
  }

  /** Returns one node by current array offset. @param index - Current array offset. @returns Node at index. */
  public at(index: number): SwNode {
    const node = this.nodeArray[index];
    if (node === undefined) throw new Error(`Unknown SwNode index: ${index}`);
    return node;
  }

  /** Returns an immutable ordered view of all nodes. @returns Ordered nodes. */
  public entries(): readonly SwNode[] {
    return this.nodeArray;
  }

  /** Returns the end sentinel of the regular document content section. @returns Content end sentinel. */
  public GetEndOfContent(): SwEndNode {
    return this.endOfContent;
  }

  /** Returns the final sentinel before the regular content section. @returns Extras end sentinel. */
  public GetEndOfExtras(): SwEndNode {
    return this.endOfRedlines;
  }

  /** Returns the end sentinel of the post-it section. @returns Post-it end sentinel. */
  public GetEndOfPostIts(): SwEndNode {
    return this.endOfPostIts;
  }

  /** Returns the end sentinel of the inserts section. @returns Inserts end sentinel. */
  public GetEndOfInserts(): SwEndNode {
    return this.endOfInserts;
  }

  /** Returns the end sentinel of the autotext section. @returns Autotext end sentinel. */
  public GetEndOfAutotext(): SwEndNode {
    return this.endOfAutotext;
  }

  /** Returns the end sentinel of the redline section. @returns Redline end sentinel. */
  public GetEndOfRedlines(): SwEndNode {
    return this.endOfRedlines;
  }

  /** Returns all regular body text nodes without exposing section sentinels to the view. @returns Ordered body text nodes. */
  public getTextNodes(): readonly SwTextNode[] {
    const start = this.endOfRedlines.GetIndex() + 1;
    const end = this.endOfContent.GetIndex();
    return this.nodeArray.slice(start, end).filter(
      /** Narrows body nodes to text nodes. @param node - Ordered body candidate. @returns True only for SwTextNode. */
      function isTextNode(node): node is SwTextNode {
        return node instanceof SwTextNode;
      },
    );
  }

  /** Inserts a new text node immediately before the content end sentinel. @param text - Initial text. @returns Inserted text node. */
  public MakeTextNode(text = ""): SwTextNode {
    const node = new SwTextNode(
      this,
      this.endOfContent.StartOfSectionNode(),
      this.document.GetDfltTextFormatColl(),
      text,
    );
    this.nodeArray.splice(this.endOfContent.GetIndex(), 0, node);
    this.document.NotifyModelChange({ index: node.GetIndex(), kind: "node-inserted" });
    return node;
  }

  /** Inserts one prepared text node directly after an existing body text node. @param source - Existing predecessor. @param node - Prepared new node. @returns Nothing. */
  public insertTextNodeAfter(source: SwTextNode, node: SwTextNode): void {
    if (source.GetNodes() !== this || node.GetNodes() !== this)
      throw new Error("SwTextNode belongs to another SwNodes array.");
    this.nodeArray.splice(source.GetIndex() + 1, 0, node);
    this.document.GetDocumentListsManager().RegisterListItem(node);
    this.document.NotifyModelChange({
      index: node.GetIndex(),
      kind: "node-inserted",
    });
  }

  /** Removes one body text node while retaining Writer's non-empty content invariant. @param node - Removed text node. @returns Nothing. */
  public removeTextNode(node: SwTextNode): void {
    if (node.GetNodes() !== this) throw new Error("SwTextNode belongs to another SwNodes array.");
    const textNodes = this.getTextNodes();
    if (textNodes.length === 1) throw new Error("Writer document must retain one paragraph.");
    const textIndex = textNodes.indexOf(node);
    if (textIndex < 0) throw new Error("SwTextNode is not body content.");
    const next = textNodes[textIndex + 1];
    const previous = textNodes[textIndex - 1];
    if (next !== undefined) node.CollapseContentIndicesTo(next, 0);
    else node.CollapseContentIndicesTo(previous as SwTextNode, (previous as SwTextNode).Len());
    const nodeIndex = node.GetIndex();
    this.document.GetDocumentListsManager().UnregisterListItem(node, node.GetListId());
    this.nodeArray.splice(nodeIndex, 1);
    this.document.NotifyModelChange({ index: nodeIndex, kind: "node-removed" });
  }

  /** Replaces one body node in place while preserving every registered content index. @param node - Removed node. @param replacement - Same-document replacement. @returns Nothing. */
  public replaceTextNode(node: SwTextNode, replacement: SwTextNode): void {
    if (node.GetNodes() !== this || replacement.GetNodes() !== this)
      throw new Error("SwTextNode belongs to another SwNodes array.");
    if (this.indexOfOrUndefined(replacement) !== undefined)
      throw new Error("Replacement SwTextNode already belongs to body content.");
    const index = node.GetIndex();
    node.MoveAllContentIndicesTo(replacement);
    this.document.GetDocumentListsManager().UnregisterListItem(node, node.GetListId());
    this.nodeArray[index] = replacement;
    this.document.GetDocumentListsManager().RegisterListItem(replacement);
    this.document.NotifyModelChange({ index, kind: "node-removed" });
    this.document.NotifyModelChange({ index, kind: "node-inserted" });
  }

  /** Moves one body text node by one adjacent text-node position. @param node - Moved text node. @param delta - Minus or plus one position. @returns Nothing. */
  public moveTextNode(node: SwTextNode, delta: -1 | 1): void {
    const textNodes = this.getTextNodes();
    const current = textNodes.indexOf(node);
    const target = current + delta;
    if (current < 0) throw new Error("SwTextNode belongs to another SwNodes array.");
    if (target < 0 || target >= textNodes.length)
      throw new Error("Writer paragraph movement crosses the document boundary.");
    const other = textNodes[target] as SwTextNode;
    const currentIndex = node.GetIndex();
    const otherIndex = other.GetIndex();
    this.nodeArray[currentIndex] = other;
    this.nodeArray[otherIndex] = node;
    this.document.GetDocumentListsManager().InvalidateAllLists();
    this.document.NotifyModelChange({
      index: currentIndex,
      kind: "node-inserted",
    });
    this.document.NotifyModelChange({ index: otherIndex, kind: "node-inserted" });
  }

  /** Copies body text nodes from another array into this array's content section. @param source - Source node array. @returns Nothing. */
  public copyContentFrom(source: SwNodes): void {
    for (const rule of source.GetDoc().GetNumRuleTable())
      if (this.document.FindNumRulePtr(rule.GetName()) === undefined)
        this.document.AddNumRule(rule);
    source.getTextNodes().forEach(
      /** Clones one source text node before the content end sentinel. @param node - Source body node. @returns Nothing. */
      (node): void => {
        const clone = node.CloneTo(this);
        this.nodeArray.splice(this.endOfContent.GetIndex(), 0, clone);
        this.document.GetDocumentListsManager().RegisterListItem(clone);
      },
    );
  }

  /** Returns the current position of a node owned by this array. @param node - Owned node. @returns Current array offset. */
  public indexOf(node: SwNode): number {
    const index = this.nodeArray.indexOf(node);
    if (index < 0) throw new Error("SwNode is disconnected from its SwNodes array.");
    return index;
  }

  /** Returns a current offset for connected nodes. @param node - Candidate node. @returns Offset or undefined. */
  public indexOfOrUndefined(node: SwNode): number | undefined {
    const index = this.nodeArray.indexOf(node);
    return index < 0 ? undefined : index;
  }

  /** Creates one fixed start/end section pair and returns its end sentinel. @param parent - Optional parent section. @returns Created end sentinel. */
  private createFixedSection(parent: SwStartNode | undefined): SwEndNode {
    const start = this.appendStartNode(parent);
    return this.appendEndNode(start);
  }

  /** Appends a start sentinel. @param parent - Optional parent section. @returns Created start sentinel. */
  private appendStartNode(parent?: SwStartNode): SwStartNode {
    const node = new SwStartNode(this, parent);
    this.nodeArray.push(node);
    return node;
  }

  /** Appends an end sentinel and links it to its start sentinel. @param start - Matching section start. @returns Created end sentinel. */
  private appendEndNode(start: SwStartNode): SwEndNode {
    const node = new SwEndNode(this, start);
    this.nodeArray.push(node);
    start.setEndOfSection(node);
    return node;
  }
}
