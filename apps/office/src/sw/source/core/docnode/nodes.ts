/**
 * @fileoverview Implements the Writer SwNodes array and fixed sections from the pinned LibreOffice `sw/source/core/docnode/nodes.cxx` boundary.
 */

import type { SwDoc } from "../doc/doc";
import { SwEndNode, SwStartNode, type SwNode } from "./node";
import { SwTextNode, type SwTextNodeSnapshot } from "../txtnode/ndtxt";

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
    const root = this.appendStartNode("postits");
    this.endOfPostIts = this.appendEndNode("postits-end", root);
    this.endOfInserts = this.createFixedSection("inserts", undefined);
    this.endOfAutotext = this.createFixedSection("autotext", root);
    this.endOfRedlines = this.createFixedSection("redlines", root);
    this.endOfContent = this.createFixedSection("content", root);
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

  /** Finds a body text node by its stable browser identity. @param id - Stable text-node identity. @returns Matching node, when present. */
  public findTextNode(id: string): SwTextNode | undefined {
    return this.getTextNodes().find(
      /** Matches one Writer text-node identity. @param node - Body text node. @returns True when node owns id. */
      function hasId(node): boolean {
        return node.id === id;
      },
    );
  }

  /** Inserts a new text node immediately before the content end sentinel. @param id - Stable node identity. @param text - Initial text. @returns Inserted text node. */
  public MakeTextNode(id: string, text = ""): SwTextNode {
    if (id.trim().length === 0) throw new Error("Text node id must not be blank.");
    if (this.findTextNode(id) !== undefined) throw new Error(`Duplicate paragraph: ${id}`);
    const node = new SwTextNode(
      this,
      id,
      this.endOfContent.StartOfSectionNode(),
      this.document.GetDfltTextFormatColl(),
      text,
    );
    this.nodeArray.splice(this.endOfContent.GetIndex(), 0, node);
    return node;
  }

  /** Inserts one prepared text node directly after an existing body text node. @param source - Existing predecessor. @param node - Prepared new node. @returns Nothing. */
  public insertTextNodeAfter(source: SwTextNode, node: SwTextNode): void {
    if (source.GetNodes() !== this || node.GetNodes() !== this)
      throw new Error("SwTextNode belongs to another SwNodes array.");
    if (this.findTextNode(node.id) !== undefined)
      throw new Error(`Duplicate paragraph: ${node.id}`);
    this.nodeArray.splice(source.GetIndex() + 1, 0, node);
  }

  /** Removes one body text node while retaining Writer's non-empty content invariant. @param node - Removed text node. @returns Nothing. */
  public removeTextNode(node: SwTextNode): void {
    if (node.GetNodes() !== this) throw new Error("SwTextNode belongs to another SwNodes array.");
    if (this.getTextNodes().length === 1)
      throw new Error("Writer document must retain one paragraph.");
    this.nodeArray.splice(node.GetIndex(), 1);
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
  }

  /** Copies body text nodes from another array into this array's content section. @param source - Source node array. @returns Nothing. */
  public copyContentFrom(source: SwNodes): void {
    source.getTextNodes().forEach(
      /** Clones one source text node before the content end sentinel. @param node - Source body node. @returns Nothing. */
      (node): void => {
        this.insertSnapshot(node.toSnapshot());
      },
    );
  }

  /** Replaces the empty body with persisted text-node snapshots. @param snapshots - Ordered persisted text nodes. @returns Nothing. */
  public restoreContent(snapshots: readonly SwTextNodeSnapshot[]): void {
    this.getTextNodes().forEach(
      /** Removes an existing restored body node. @param node - Existing body text node. @returns Nothing. */
      (node): void => {
        this.nodeArray.splice(node.GetIndex(), 1);
      },
    );
    snapshots.forEach(
      /** Restores one ordered body text node. @param snapshot - Persisted node record. @returns Nothing. */
      (snapshot): void => {
        this.insertSnapshot(snapshot);
      },
    );
    if (this.getTextNodes().length === 0) throw new Error("SwNodes content section is empty.");
  }

  /** Returns the current position of a node owned by this array. @param node - Owned node. @returns Current array offset. */
  public indexOf(node: SwNode): number {
    const index = this.nodeArray.indexOf(node);
    if (index < 0) throw new Error("SwNode is disconnected from its SwNodes array.");
    return index;
  }

  /** Creates one fixed start/end section pair and returns its end sentinel. @param name - Section identity component. @param parent - Optional parent section. @returns Created end sentinel. */
  private createFixedSection(name: string, parent: SwStartNode | undefined): SwEndNode {
    const start = this.appendStartNode(name, parent);
    return this.appendEndNode(`${name}-end`, start);
  }

  /** Appends a start sentinel. @param name - Sentinel identity component. @param parent - Optional parent section. @returns Created start sentinel. */
  private appendStartNode(name: string, parent?: SwStartNode): SwStartNode {
    const node = new SwStartNode(this, `__sw_${name}`, parent);
    this.nodeArray.push(node);
    return node;
  }

  /** Appends an end sentinel and links it to its start sentinel. @param name - Sentinel identity component. @param start - Matching section start. @returns Created end sentinel. */
  private appendEndNode(name: string, start: SwStartNode): SwEndNode {
    const node = new SwEndNode(this, `__sw_${name}`, start);
    this.nodeArray.push(node);
    start.setEndOfSection(node);
    return node;
  }

  /** Restores and inserts one persisted text node. @param snapshot - Persisted text-node state. @returns Restored text node. */
  private insertSnapshot(snapshot: SwTextNodeSnapshot): SwTextNode {
    const node = SwTextNode.fromSnapshot(this, this.endOfContent.StartOfSectionNode(), snapshot);
    this.nodeArray.splice(this.endOfContent.GetIndex(), 0, node);
    return node;
  }
}
