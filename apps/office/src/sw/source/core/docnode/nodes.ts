/**
 * @fileoverview Implements the Writer SwNodes array and fixed sections from the pinned LibreOffice `sw/source/core/docnode/nodes.cxx` boundary.
 */

import { SwOutlineNodes } from "./ndnum";
import type { SwDoc } from "../doc/doc";
import { SwEndNode, SwStartNode, SwTableBoxStartNode, SwTableNode, type SwNode } from "./node";
import { SwTextNode } from "../txtnode/ndtxt";
import {
  SwTable,
  SwTableBox,
  SwTableLine,
  type SwTableBoxFormat,
  type SwTableFormat,
  type SwTableLineFormat,
} from "../table/swtable";

/** Actual row/cell section nodes retained by table insertion history. */
export interface SwTableRowSection {
  readonly line: SwTableLine;
  readonly nodes: readonly SwNode[];
}

/** Owns every Writer model node and the fixed non-content/content section sentinels. */
export class SwNodes {
  private readonly nodeArray: SwNode[] = [];
  private readonly m_aOutlineNodes = new SwOutlineNodes();
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

  /** Reports canonical document-node ownership. @returns Whether this is the document array. */
  public IsDocNodes(): boolean {
    return this === this.document.GetNodes();
  }

  /** Returns the source-owned sorted outline index. @returns Outline index. */
  public GetOutLineNds(): SwOutlineNodes {
    return this.m_aOutlineNodes;
  }
  /** Reconciles the native outline transition for a connected document node. @param node - Candidate model node. @returns Nothing. */
  public UpdateOutlineNode(node: SwNode): void {
    // Detached clones and non-document arrays have no native outline-index lifetime.
    if (
      !this.IsDocNodes() ||
      this.indexOfOrUndefined(node) === undefined ||
      !(node instanceof SwTextNode) ||
      !node.IsOutlineStateChanged()
    )
      return;
    const found = this.m_aOutlineNodes.contains(node);
    if (node.IsOutline()) {
      if (!found && node.GetNodes() === this) this.m_aOutlineNodes.insert(node);
    } else if (found) this.m_aOutlineNodes.erase(node);
    node.UpdateOutlineState();
    // Native Chapter field propagation remains outside the implemented fields profile.
  }
  /** Registers outline membership after insertion establishes native array lifetime. @param node - Inserted paragraph. @returns Nothing. */
  private InsertOutlineNode(node: SwTextNode): void {
    if (!this.IsDocNodes()) return;
    if (node.IsOutline()) this.m_aOutlineNodes.insert(node);
    node.UpdateOutlineState();
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
    return this.getBodyContent().filter(
      /** Narrows body nodes to text nodes. @param node - Ordered body candidate. @returns True only for SwTextNode. */
      function isTextNode(node): node is SwTextNode {
        return node instanceof SwTextNode;
      },
    );
  }

  /** Returns direct body paragraphs and tables in document order. @returns Ordered body blocks. */
  public getBodyContent(): readonly (SwTextNode | SwTableNode)[] {
    const bodyStart = this.endOfContent.StartOfSectionNode();
    return this.nodeArray
      .slice(this.endOfRedlines.GetIndex() + 1, this.endOfContent.GetIndex())
      .filter(
        /** Keeps only direct children of the body section. @param node - Candidate. @returns Whether a direct body block. */
        (node): node is SwTextNode | SwTableNode =>
          (node instanceof SwTextNode || node instanceof SwTableNode) &&
          node.StartOfSectionNode() === bodyStart,
      );
  }

  /** Inserts a table section after an optional body paragraph. @param name - Table identity. @param format - Physical table geometry. @param after - Optional body predecessor. @returns Canonical table. */
  public MakeTableNode(name: string, format: SwTableFormat = {}, after?: SwTextNode): SwTable {
    if (after !== undefined && !this.getTextNodes().includes(after))
      throw new Error("Writer table insertion needs a body paragraph in this document.");
    const node = new SwTableNode(this, this.endOfContent.StartOfSectionNode());
    const end = new SwEndNode(this, node);
    node.setEndOfSection(end);
    this.nodeArray.splice(
      after === undefined ? this.endOfContent.GetIndex() : after.GetIndex() + 1,
      0,
      node,
      end,
    );
    const table = new SwTable(node, name, format);
    node.SetTable(table);
    this.document.NotifyModelChange({ index: node.GetIndex(), kind: "node-inserted" });
    return table;
  }

  /** Appends one row and its cell sections to a table. @param table - Owning table. @param columnCount - Number of cells. @param lineFormat - Row geometry. @param boxFormats - Cell geometry by column. @returns New row. */
  public AppendTableRow(
    table: SwTable,
    columnCount: number,
    lineFormat: SwTableLineFormat = {},
    boxFormats: readonly SwTableBoxFormat[] = [],
  ): SwTableLine {
    if (!Number.isInteger(columnCount) || columnCount < 1)
      throw new Error("Writer table row needs at least one cell.");
    const tableNode = table.GetTableNode();
    if (tableNode.GetNodes() !== this) throw new Error("Writer table belongs to another document.");
    const line = new SwTableLine(lineFormat);
    for (let column = 0; column < columnCount; column += 1) {
      const start = new SwTableBoxStartNode(this, tableNode);
      const paragraph = new SwTextNode(this, start, this.document.GetDfltTextFormatColl());
      const end = new SwEndNode(this, start);
      start.setEndOfSection(end);
      this.nodeArray.splice(tableNode.EndOfSectionNode().GetIndex(), 0, start, paragraph, end);
      this.InsertOutlineNode(paragraph);
      const box = new SwTableBox(start, boxFormats[column]);
      line.AddBox(box);
    }
    table.AddLine(line);
    this.document.NotifyModelChange({ index: tableNode.GetIndex(), kind: "node-inserted" });
    return line;
  }

  /** Adds another paragraph within an existing cell section. @param box - Cell. @returns New paragraph. */
  public AppendTableCellParagraph(box: SwTableBox): SwTextNode {
    const start = box.GetStartNode();
    if (start.GetNodes() !== this)
      throw new Error("Writer table cell belongs to another document.");
    const paragraph = new SwTextNode(this, start, this.document.GetDfltTextFormatColl());
    this.nodeArray.splice(start.EndOfSectionNode().GetIndex(), 0, paragraph);
    this.InsertOutlineNode(paragraph);
    this.document.NotifyModelChange({ index: paragraph.GetIndex(), kind: "node-inserted" });
    return paragraph;
  }

  /** Prepares an empty row with native source row/cell formats and first-paragraph attributes. @param table - Connected table. @param source - Source row. @returns Detached actual sections. */
  public PrepareTableRow(table: SwTable, source: SwTableLine): SwTableRowSection {
    const tableNode = table.GetTableNode();
    if (tableNode.GetNodes() !== this || !table.GetTabLines().includes(source))
      throw new Error("Writer table row belongs to another table.");
    const line = new SwTableLine(source.GetFormat()),
      nodes: SwNode[] = [];
    for (const box of source.GetTabBoxes()) {
      const start = new SwTableBoxStartNode(this, tableNode),
        original = this.at(box.GetStartNode().GetIndex() + 1) as SwTextNode,
        paragraph = new SwTextNode(this, start, original.GetTextFormatColl()),
        end = new SwEndNode(this, start);
      start.setEndOfSection(end);
      const items = original.GetpSwAttrSet();
      if (items !== undefined) paragraph.SetAttr(items);
      nodes.push(start, paragraph, end);
      line.AddBox(new SwTableBox(start, box.GetFormat()));
    }
    return { line, nodes };
  }

  /** Connects an appended row's retained sections atomically with its table line. @param table - Target table. @param section - Prepared or retained row. @returns Nothing. */
  public InsertTableRow(table: SwTable, section: SwTableRowSection): void {
    const tableNode = table.GetTableNode();
    if (
      tableNode.GetNodes() !== this ||
      section.nodes.some(
        /** Rejects foreign or already connected section owners. @param node - Section node. @returns Whether ownership is invalid. */
        (node) => node.GetNodes() !== this || this.indexOfOrUndefined(node) !== undefined,
      )
    )
      throw new Error("Writer table row is not detached from this document.");
    const index = tableNode.EndOfSectionNode().GetIndex();
    this.nodeArray.splice(index, 0, ...section.nodes);
    table.AddLine(section.line);
    for (const node of section.nodes)
      if (node instanceof SwTextNode) {
        node.AddToList();
        this.InsertOutlineNode(node);
      }
    this.document.NotifyModelChange({ index, kind: "node-inserted" });
  }

  /** Disconnects an inserted row while preserving its identities for Redo. @param table - Owning table. @param section - Connected inserted row. @param target - Surviving cursor owner. @param offset - Retargeted registered offset. @returns Nothing. */
  public RemoveTableRow(
    table: SwTable,
    section: SwTableRowSection,
    target: SwTextNode,
    offset: number,
  ): void {
    if (table.GetTableNode().GetNodes() !== this || target.GetNodes() !== this)
      throw new Error("Writer table history belongs to another document.");
    if (!table.GetTabLines().includes(section.line))
      throw new Error("Writer table row is not connected.");
    const boxes = section.line.GetTabBoxes(),
      index = (boxes[0] as SwTableBox).GetStartNode().GetIndex(),
      end = (boxes.at(-1) as SwTableBox).GetStartNode().EndOfSectionNode().GetIndex();
    if (
      section.nodes.length !== end - index + 1 ||
      section.nodes.some(
        /** Requires the exact connected native section sequence. @param node - Retained node. @param delta - Section offset. @returns Whether sequence differs. */
        (node, delta) => this.nodeArray[index + delta] !== node,
      )
    )
      throw new Error("Writer table row is not connected.");
    for (const node of section.nodes)
      if (node instanceof SwTextNode) {
        node.CollapseContentIndicesTo(target, offset);
        this.m_aOutlineNodes.erase(node);
        node.RemoveFromList();
      }
    this.nodeArray.splice(index, section.nodes.length);
    table.RemoveLine(section.line);
    this.document.NotifyModelChange({ index, kind: "node-removed" });
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
    this.InsertOutlineNode(node);
    this.document.NotifyModelChange({ index: node.GetIndex(), kind: "node-inserted" });
    return node;
  }

  /** Inserts one prepared text node after an existing node,including the actual body start sentinel during undo. @param source - Existing predecessor. @param node - Prepared new node. @returns Nothing. */
  public insertTextNodeAfter(source: SwNode, node: SwTextNode): void {
    if (source.GetNodes() !== this || node.GetNodes() !== this)
      throw new Error("SwTextNode belongs to another SwNodes array.");
    this.nodeArray.splice(source.GetIndex() + 1, 0, node);
    node.AddToList();
    this.InsertOutlineNode(node);
    this.document.NotifyModelChange({
      index: node.GetIndex(),
      kind: "node-inserted",
    });
  }

  /** Removes one connected text node while retaining its section's non-empty content invariant. @param node - Removed text node. @returns Nothing. */
  public removeTextNode(node: SwTextNode): void {
    if (node.GetNodes() !== this) throw new Error("SwTextNode belongs to another SwNodes array.");
    const textNodes = this.nodeArray.filter(
      /** Keeps actual text owners in the removed node section. @param candidate - Connected node. @returns Whether it belongs to this text section. */
      (candidate): candidate is SwTextNode =>
        candidate.IsTextNode() && candidate.StartOfSectionNode() === node.StartOfSectionNode(),
    );
    if (textNodes.length === 1) throw new Error("Writer document must retain one paragraph.");
    const textIndex = textNodes.indexOf(node);
    if (textIndex < 0) throw new Error("SwTextNode is not body content or connected cell text.");
    const next = textNodes[textIndex + 1];
    const previous = textNodes[textIndex - 1];
    if (next !== undefined) node.CollapseContentIndicesTo(next, 0);
    else node.CollapseContentIndicesTo(previous as SwTextNode, (previous as SwTextNode).Len());
    const nodeIndex = node.GetIndex();
    this.m_aOutlineNodes.erase(node);
    node.RemoveFromList();
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
    this.m_aOutlineNodes.erase(node);
    node.MoveAllContentIndicesTo(replacement);
    node.RemoveFromList();
    this.nodeArray[index] = replacement;
    replacement.AddToList();
    this.InsertOutlineNode(replacement);
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
    const lists = this.document.GetDocumentListsManager();
    for (const item of [node, other]) {
      this.m_aOutlineNodes.erase(item);
      item.GetNum()?.RemoveMe(this.document);
    }
    this.nodeArray[currentIndex] = other;
    this.nodeArray[otherIndex] = node;
    for (const item of [node, other]) {
      this.InsertOutlineNode(item);
      const record = item.GetNum();
      if (record !== undefined)
        lists
          .GetListByName(item.GetListId())
          ?.InsertListItem(record, item.GetAttrListLevel(), this.document);
    }
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
        clone.AddToList();
        this.InsertOutlineNode(clone);
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
