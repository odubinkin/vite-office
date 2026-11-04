/**
 * @fileoverview Implements the Writer SwNodes array and fixed sections from the pinned LibreOffice `sw/source/core/docnode/nodes.cxx` boundary.
 */
import { InsertTableNodes, TextToTableNodes } from "./ndtbl";
import type { SwAttrSet } from "../attr/swatrset";
import { RES_PAGEDESC } from "../../../inc/hintids";
import { SwStartNodeType } from "../../../inc/ndtyp";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { SwNumRule } from "../doc/number";
import { goNext, goPrevious } from "./nodes.navigation";
import { SwNodeIndex, CheckNodesRange, type SwPosition } from "../crsr/pam";
import type { SwNodeRange } from "../../../inc/ndindex";
import { SwClient, SwIterator } from "../../../inc/calbck";

import { SwRowFrame, SwCellFrame, SwTabFrame } from "../layout/tabfrm";
import { SwOutlineNodes } from "./ndnum";
import type { SwDoc } from "../doc/doc";
import {
  SwContentNode,
  SwEndNode,
  SwStartNode,
  SwTableBoxStartNode,
  SwTableNode,
  type SwNode,
} from "./node";
import { SwTextNode } from "../txtnode/ndtxt";
import {
  SwTable,
  SwTableBox,
  SwTableLine,
  type SwTableBoxFormat,
  type SwTableFormat,
  type SwTableLineFormatValue,
} from "../table/swtable";

/** Actual row/cell section nodes retained by table insertion history. */
export interface SwTableRowSection {
  readonly line: SwTableLine;
  readonly nodes: readonly SwNode[];
}

/** Actual detached or retained native cell section. */
export interface SwTableBoxSection {
  readonly box: SwTableBox;
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

  /** Original static ndtbl.cxx node-matrix phase. Existing table/frame bootstrap remains the current model representation; this operation constructs actual sections without substituting a box/line graph. @param where - Actual insertion boundary. @param boxes - Native uint16 cell count. @param content - Body collection. @param lines - Native uint16 row count, zero creates one content row. @param repeat - Native repeat count. @param headline - Optional header collection. @param attrs - Optional source paragraph attributes. @returns Actual table node, or null for zero boxes. */
  public static InsertTable(
    where: SwNode,
    boxes: number,
    content: SwTextFormatColl,
    lines: number,
    repeat: number,
    headline: SwTextFormatColl | null,
    attrs: SwAttrSet | null,
  ): SwTableNode | null {
    return InsertTableNodes(where, boxes, content, lines, repeat, headline, attrs);
  }

  /** Creates LibreOffice's five fixed node sections in their canonical order. @param document - Owning Writer document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {
    const root = this.appendStartNode();
    this.endOfPostIts = this.appendEndNode(root);
    this.endOfInserts = this.createFixedSection(undefined);
    this.endOfAutotext = this.createFixedSection(root);
    this.endOfRedlines = this.createFixedSection(root);
    this.endOfContent = this.createFixedSection(root);
  }

  /** Original next-content lookup and index/position assignment. @param index - Actual node index or position. @returns Next content owner or undefined. */
  public static GoNext(index: SwNodeIndex | SwPosition): SwContentNode | undefined {
    const node = goNext("nNode" in index ? index.nNode : index);
    if (node !== undefined) index.Assign(node);
    return node;
  }
  /** Original previous-content lookup; crossing a global section is explicit. @param index - Actual node index or position. @param canCrossBoundary - Native opt-in used by search-region construction. @returns Previous content owner or undefined. */
  public static GoPrevious(
    index: SwNodeIndex | SwPosition,
    canCrossBoundary = false,
  ): SwContentNode | undefined {
    const node = goPrevious("nNode" in index ? index.nNode : index, canCrossBoundary);
    if (node !== undefined) index.Assign(node);
    return node;
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
    return this.MakeTableNodeAt(
      after === undefined ? this.endOfContent.GetIndex() : after.GetIndex() + 1,
      name,
      format,
    );
  }

  /** Existing browser table-builder bootstrap inserts an actual empty graph before a connected node; native SwNodes::InsertTable is the separate static matrix entry point. @param position - Actual insertion boundary. @param name - Table name. @param format - Builder attributes. @returns Connected table. */
  public MakeTableNodeBefore(position: SwNode, name: string, format: SwTableFormat): SwTable {
    if (position.GetNodes() !== this || this.indexOf(position) < 0)
      throw new Error("Writer table builder requires a connected insertion boundary.");
    return this.MakeTableNodeAt(position.GetIndex(), name, format);
  }

  /** Constructs actual start/end owners at the requested native array boundary. @param index - Array boundary. @param name - Table name. @param format - Frame attributes. @returns Connected table. */
  private MakeTableNodeAt(index: number, name: string, format: SwTableFormat): SwTable {
    const previous = index ? this.at(index - 1) : null;
    let parent = previous instanceof SwStartNode ? previous : previous?.StartOfSectionNode();
    if (previous instanceof SwEndNode) parent = parent?.StartOfSectionNode();
    if (!parent) throw new Error("assert(table insertion has a containing section)");
    const node = new SwTableNode(this, parent);
    const end = new SwEndNode(this, node);
    node.setEndOfSection(end);
    this.nodeArray.splice(index, 0, node, end);
    const table = new SwTable(node, name, format);
    node.SetTable(table);
    this.document.NotifyModelChange({ index: node.GetIndex(), kind: "node-inserted" });
    return table;
  }

  /** Deletes the complete inserted section and corrects live content indices to the following paragraph. @param tableNode - Connected native table section. @returns Nothing. */
  public DeleteTable(tableNode: SwTableNode): void {
    const index = this.indexOf(tableNode),
      end = tableNode.EndOfSectionNode().GetIndex();
    const next = this.at(end + 1);
    if (!(next instanceof SwTextNode))
      throw new Error("Writer inserted table needs following text.");
    for (const node of this.nodeArray.slice(index + 1, end))
      if (node instanceof SwTextNode) {
        node.CollapseContentIndicesTo(next, 0);
        this.m_aOutlineNodes.erase(node);
        node.RemoveFromList();
      }
    this.CorrectNodeIndices(index, end - index + 1);
    this.DestroyTableNode(tableNode);
    this.nodeArray.splice(index, end - index + 1);
    this.document.NotifyModelChange({ index, kind: "node-removed" });
  }

  /** Wraps imported text using the native ndtbl owner. @param rows - Validated cell nodes. @param name - Table identity. @returns Canonical table. */
  public TextToTable(rows: readonly (readonly (readonly SwTextNode[])[])[], name: string): SwTable {
    return TextToTableNodes.call(this, rows, name);
  }

  /** Appends one row and its cell sections to a table. @param table - Owning table. @param columnCount - Number of cells. @param lineFormat - Row geometry. @param boxFormats - Cell geometry by column. @returns New row. */
  public AppendTableRow(
    table: SwTable,
    columnCount: number,
    lineFormat: SwTableLineFormatValue = {},
    boxFormats: readonly SwTableBoxFormat[] = [],
  ): SwTableLine {
    if (!Number.isInteger(columnCount) || columnCount < 1)
      throw new Error("Writer table row needs at least one cell.");
    const tableNode = table.GetTableNode();
    if (tableNode.GetNodes() !== this) throw new Error("Writer table belongs to another document.");
    const frameFormat = this.document.MakeTableLineFormat(),
      line = new SwTableLine(frameFormat);
    line.SetFormat(lineFormat);
    for (let column = 0; column < columnCount; column += 1) {
      const start = new SwTableBoxStartNode(this, tableNode);
      const paragraph = new SwTextNode(this, start, this.document.GetDfltTextFormatColl());
      const end = new SwEndNode(this, start);
      start.setEndOfSection(end);
      this.nodeArray.splice(tableNode.EndOfSectionNode().GetIndex(), 0, start, paragraph, end);
      this.InsertOutlineNode(paragraph);
      const box = new SwTableBox(this.document.MakeTableBoxFormat(), start);
      box.SetFormat(boxFormats[column] ?? {});
      line.AddBox(box);
    }
    table.AddLine(line);
    this.document.NotifyModelChange({ index: tableNode.GetIndex(), kind: "node-inserted" });
    return line;
  }

  /** Appends one original cell section while a streamed row is built. @param table - Connected table. @param line - Connected row. @param format - Native box attributes. @returns Original box. */
  public AppendTableBox(table: SwTable, line: SwTableLine, format: SwTableBoxFormat): SwTableBox {
    const tableNode = table.GetTableNode();
    if (tableNode.GetNodes() !== this || !table.GetTabLines().includes(line))
      throw new Error("Writer table row belongs to another table.");
    const start = new SwTableBoxStartNode(this, tableNode),
      paragraph = new SwTextNode(this, start, this.document.GetDfltTextFormatColl()),
      end = new SwEndNode(this, start),
      box = new SwTableBox(this.document.MakeTableBoxFormat(), start);
    box.SetFormat(format);
    start.setEndOfSection(end);
    this.nodeArray.splice(tableNode.EndOfSectionNode().GetIndex(), 0, start, paragraph, end);
    this.InsertOutlineNode(paragraph);
    line.AddBox(box);
    this.document.NotifyModelChange({ index: tableNode.GetIndex(), kind: "node-inserted" });
    return box;
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
    const line = new SwTableLine(source.GetFrameFormat()),
      nodes: SwNode[] = [];
    for (const box of source.GetTabBoxes()) {
      const section = this.PrepareTableBox(table, box);
      nodes.push(...section.nodes);
      line.AddBox(section.box);
    }
    return { line, nodes };
  }

  /** Prepares actual empty cell nodes from native source-box first-paragraph attributes. @param table - Owner. @param source - Original source box. @returns Detached box section. */
  public PrepareTableBox(table: SwTable, source: SwTableBox): SwTableBoxSection {
    const tableNode = table.GetTableNode();
    if (tableNode.GetNodes() !== this || source.GetStartNode().StartOfSectionNode() !== tableNode)
      throw new Error("Writer table box belongs to another table.");
    const original = source.GetParagraphs()[0] as SwTextNode,
      start = new SwTableBoxStartNode(this, tableNode),
      paragraph = new SwTextNode(this, start, original.GetTextFormatColl()),
      end = new SwEndNode(this, start);
    start.setEndOfSection(end);
    const items = original.GetpSwAttrSet();
    if (items !== undefined) paragraph.SetAttr(items);
    return { box: new SwTableBox(source.GetFrameFormat(), start), nodes: [start, paragraph, end] };
  }
  /** Connects an actual native cell section at its row coordinate. @param table - Owner. @param line - Connected row. @param section - Detached native box. @param column - Insertion coordinate. @returns Nothing. */
  public InsertTableBox(
    table: SwTable,
    line: SwTableLine,
    section: SwTableBoxSection,
    column: number,
  ): void {
    if (
      table.GetTableNode().GetNodes() !== this ||
      !table.GetTabLines().includes(line) ||
      line.GetTabBoxes().length === 0 ||
      section.nodes.some(
        /** Rejects foreign or connected section nodes. @param node - Actual owner. @returns Whether invalid. */
        (node) => node.GetNodes() !== this || this.indexOfOrUndefined(node) !== undefined,
      )
    )
      throw new Error("Writer table box is not detached from this document.");
    if (!Number.isInteger(column) || column < 0 || column > line.GetTabBoxes().length)
      throw new Error("Writer table column position is invalid.");
    const next = line.GetTabBoxes()[column],
      index =
        next === undefined
          ? (line.GetTabBoxes().at(-1) as SwTableBox).GetStartNode().EndOfSectionNode().GetIndex() +
            1
          : next.GetStartNode().GetIndex();
    this.nodeArray.splice(index, 0, ...section.nodes);
    line.AddBox(section.box, column);
    for (const node of section.nodes)
      if (node instanceof SwTextNode) {
        node.AddToList();
        this.InsertOutlineNode(node);
      }
    this.document.NotifyModelChange({ index, kind: "node-inserted" });
  }
  /** Deletes an inserted native box section and releases its format registration. @param table - Owner. @param line - Connected row. @param section - Inserted actual nodes. @param target - Surviving native cursor node. @param offset - Cursor content. @returns Nothing. */
  public RemoveTableBox(
    table: SwTable,
    line: SwTableLine,
    section: SwTableBoxSection,
    target: SwTextNode,
    offset: number,
  ): void {
    if (table.GetTableNode().GetNodes() !== this || target.GetNodes() !== this)
      throw new Error("Writer table history belongs to another document.");
    if (!table.GetTabLines().includes(line) || !line.GetTabBoxes().includes(section.box))
      throw new Error("Writer table box is not connected.");
    const index = section.box.GetStartNode().GetIndex(),
      end = section.box.GetStartNode().EndOfSectionNode().GetIndex();
    if (
      section.nodes.length !== end - index + 1 ||
      section.nodes.some(
        /** Requires exact connected native section ownership. @param node - Retained owner. @param delta - Section offset. @returns Whether mismatched. */
        (node, delta) => this.nodeArray[index + delta] !== node,
      )
    )
      throw new Error("Writer table box is not connected.");
    for (const node of section.nodes)
      if (node instanceof SwTextNode) {
        node.CollapseContentIndicesTo(target, offset);
        this.m_aOutlineNodes.erase(node);
        node.RemoveFromList();
      }
    this.CorrectNodeIndices(index, section.nodes.length);
    this.nodeArray.splice(index, section.nodes.length);
    line.RemoveBox(section.box);
    this.DestroyTableBox(section.box);
    this.document.NotifyModelChange({ index, kind: "node-removed" });
  }

  /** Connects a prepared native row at its actual boundary. @param table - Target table. @param section - Prepared native row. @param rowIndex - Native row position. @returns Nothing. */
  public InsertTableRow(
    table: SwTable,
    section: SwTableRowSection,
    rowIndex = table.GetTabLines().length,
  ): void {
    const tableNode = table.GetTableNode();
    if (
      tableNode.GetNodes() !== this ||
      section.nodes.some(
        /** Rejects foreign or already connected section owners. @param node - Section node. @returns Whether ownership is invalid. */
        (node) => node.GetNodes() !== this || this.indexOfOrUndefined(node) !== undefined,
      )
    )
      throw new Error("Writer table row is not detached from this document.");
    if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex > table.GetTabLines().length)
      throw new Error("Writer table row position is invalid.");
    const next = table.GetTabLines()[rowIndex],
      index =
        next === undefined
          ? tableNode.EndOfSectionNode().GetIndex()
          : (next.GetTabBoxes()[0] as SwTableBox).GetStartNode().GetIndex();
    this.nodeArray.splice(index, 0, ...section.nodes);
    table.AddLine(section.line, rowIndex);
    for (const node of section.nodes)
      if (node instanceof SwTextNode) {
        node.AddToList();
        this.InsertOutlineNode(node);
      }
    this.document.NotifyModelChange({ index, kind: "node-inserted" });
  }

  /** Disconnects an actual inserted row and retargets registered indices. @param table - Owning table. @param section - Connected inserted row. @param target - Surviving cursor owner. @param offset - Retargeted registered offset. @returns Nothing. */
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
    this.CorrectNodeIndices(index, section.nodes.length);
    this.nodeArray.splice(index, section.nodes.length);
    table.RemoveLine(section.line);
    writerClients2: for (const client of new SwIterator(SwClient, section.line.GetFrameFormat())) {
      if (client instanceof SwRowFrame && client.GetTabLine() === section.line)
        client.DestroyImpl();
      continue writerClients2;
    }
    for (const box of section.line.GetTabBoxes()) this.DestroyTableBoxFrames(box);
    section.line.Dispose();
    this.document.NotifyModelChange({ index, kind: "node-removed" });
  }

  /** Removes nested and content-cell layout clients before model-owned vectors destroy their actual children. @param box - Original model box. @returns Nothing. */
  private DestroyTableBoxFrames(box: SwTableBox): void {
    for (const line of box.GetTabLines()) {
      for (const client of new SwIterator(SwClient, line.GetFrameFormat()))
        if (client instanceof SwRowFrame && client.GetTabLine() === line) client.DestroyImpl();
      for (const child of line.GetTabBoxes()) this.DestroyTableBoxFrames(child);
    }
    for (const client of new SwIterator(SwClient, box.GetFrameFormat())) {
      if (client instanceof SwCellFrame && client.GetTabBox() === box) {
        if (client.GetUpper() !== undefined) client.RemoveFromLayout();
        client.DestroyImpl();
      }
    }
  }
  /** Removes actual cell layout clients before releasing one erased model box. @param box - Deleted native cell. @returns Nothing. */
  private DestroyTableBox(box: SwTableBox): void {
    this.DestroyTableBoxFrames(box);
    box.Dispose();
  }

  /** Existing complete table destructor responsibility shared by source node deletion and table history deletion. @param node - Actual table start. @returns Nothing. */
  private DestroyTableNode(node: SwTableNode): void {
    writerClients0: for (const client of new SwIterator(
      SwClient,
      node.GetTable().GetFrameFormat(),
    )) {
      if (client instanceof SwTabFrame && client.GetTable() === node.GetTable())
        client.DestroyImpl();
      continue writerClients0;
    }
    for (const row of node.GetTable().GetTabLines()) {
      writerClients1: for (const client of new SwIterator(SwClient, row.GetFrameFormat())) {
        if (client instanceof SwRowFrame && client.GetTabLine() === row) client.DestroyImpl();
        continue writerClients1;
      }
      for (const box of row.GetTabBoxes()) this.DestroyTableBoxFrames(box);
    }
    node.GetTable().Dispose();
  }
  /** Original DelNodes outline/frame phase, including the whole-array destructor branch which retains the five fixed sentinel pairs. @param start - Actual native start index. @param count - Original positive node count. @returns Nothing. */
  public DelNodes(start: SwNodeIndex, count = 1): void {
    const index = start.GetIndex();
    if (index === 0 && count === this.endOfContent.GetIndex() + 1) {
      for (const end of [
        this.endOfContent,
        this.endOfPostIts,
        this.endOfInserts,
        this.endOfAutotext,
        this.endOfRedlines,
      ]) {
        const first = end.StartOfSectionNode().GetIndex() + 1;
        if (first !== end.GetIndex()) this.RemoveNode(first, end.GetIndex() - first, true);
      }
      return;
    }
    for (const node of this.nodeArray.slice(index, index + count)) {
      if (node instanceof SwTextNode) this.m_aOutlineNodes.erase(node);
      if (node instanceof SwContentNode) {
        node.InvalidateNumRule();
        node.DelFrames();
      }
    }
    this.RemoveNode(index, count, true);
  }
  /** Original RemoveNode removes list membership before correcting all borrowed node indices, then destroys actual nodes backwards before the array erase. Fly-as-character/redline/transparent-section families are absent from this current model. @param index - First node offset. @param count - Original positive count. @param destroy - Delete native owners rather than detach them. @returns Nothing. */
  public RemoveNode(index: number, count: number, destroy: boolean): void {
    if (!Number.isInteger(count) || count < 1 || index < 0 || index + count >= this.Count())
      throw new Error("assert(valid RemoveNode range with a surviving successor)");
    const removed = this.nodeArray.slice(index, index + count);
    for (const node of removed) if (node instanceof SwTextNode) node.RemoveFromList();
    this.CorrectNodeIndices(index, count);
    if (destroy)
      for (let i = removed.length; i;) {
        const node = removed[--i];
        if (!node) continue;
        if (node instanceof SwTextNode) {
          node.GetpSwpHints()?.Dispose();
          node.DelFrames();
          if (node.IsOutline()) node.UpdateOutlineState();
          node.ResetAttr(RES_PAGEDESC);
        }
        if (node instanceof SwTableNode) this.DestroyTableNode(node);
        node.DisposeContentIndexRegistry();
        node.DisposeModify();
      }
    this.nodeArray.splice(index, count);
    this.document.NotifyModelChange({ index, kind: "node-removed" });
  }

  /** Original BigPtrArray InsertNode overloads insert an actual detached entry without substituting a section operation. @param node - Actual node owned by this array. @param position - Native index or absolute offset. @returns Nothing. */
  private InsertNode(node: SwNode, position: SwNodeIndex | number): void {
    const index = typeof position === "number" ? position : position.GetIndex();
    if (
      node.GetNodes() !== this ||
      this.indexOfOrUndefined(node) !== undefined ||
      !Number.isInteger(index) ||
      index < 0 ||
      index > this.Count()
    )
      throw new Error("assert(valid detached InsertNode entry and position)");
    this.nodeArray.splice(index, 0, node);
  }
  /** Original SectionDown wraps the existing range, deletes opposing boundary sentinels when required and preserves source endpoint updates. @param range - Actual in/out node range. @param type - Original structural start tag. @returns Nothing. */
  public SectionDown(range: SwNodeRange, type = SwStartNodeType.SwNormalStartNode): void {
    if (
      range.aStart.GetIndex() >= range.aEnd.GetIndex() ||
      range.aEnd.GetIndex() >= this.Count() ||
      !CheckNodesRange(range.aStart.GetNode(), range.aEnd.GetNode(), false)
    )
      return;
    const current = range.aStart.GetNode();
    const temporary = new SwNodeIndex(current.StartOfSectionNode());
    try {
      if (current instanceof SwEndNode) this.DelNodes(range.aStart);
      else {
        const previous = this.at(range.aStart.GetIndex() - 1);
        let parent = previous instanceof SwStartNode ? previous : previous.StartOfSectionNode();
        if (previous instanceof SwEndNode) parent = parent.StartOfSectionNode();
        const start = new SwStartNode(this, parent, type);
        this.InsertNode(start, range.aStart);
        range.aStart.Assign(start);
        temporary.Assign(range.aStart);
      }
      range.aEnd.Assign(range.aEnd, -1);
      if (range.aEnd.GetNode() instanceof SwStartNode) this.DelNodes(range.aEnd);
      else {
        range.aEnd.Assign(range.aEnd, 1);
        const start = range.aStart.GetNode();
        if (!(start instanceof SwStartNode)) throw new Error("assert(SectionDown start boundary)");
        const end = new SwEndNode(this, start);
        this.InsertNode(end, range.aEnd);
        start.setEndOfSection(end);
      }
      range.aEnd.Assign(range.aEnd, -1);
      SwNodes.SectionUpDown(temporary, range.aEnd);
    } finally {
      temporary.Dispose();
    }
  }
  /** Original shared forward stack walk repairs parents and matching ends until the stack empties at/beyond the supplied boundary, not merely until that index. @param start - Actual starting section index. @param end - Actual lower completion boundary. @returns Nothing. */
  private static SectionUpDown(start: SwNodeIndex, end: SwNodeIndex): void {
    const first = start.GetNode();
    if (!(first instanceof SwStartNode)) throw new Error("assert(SectionUpDown section start)");
    const stack: SwStartNode[] = [first],
      current = new SwNodeIndex(start, 1);
    try {
      for (;;) {
        const node = current.GetNode(),
          parent = stack.at(-1);
        if (!parent) throw new Error("assert(SectionUpDown nonempty start stack)");
        node.SetStartOfSection(parent);
        if (node instanceof SwStartNode) stack.push(node);
        else if (node instanceof SwEndNode) {
          parent.setEndOfSection(node);
          stack.pop();
          if (stack.length !== 0) {
            current.Assign(current, 1);
            continue;
          } else if (current.GetIndex() < end.GetIndex())
            stack.unshift(parent.StartOfSectionNode());
          else break;
        }
        current.Assign(current, 1);
      }
    } finally {
      current.Dispose();
    }
  }

  /** Original MakeTextSection inserts start/end first, then creates the initial text node immediately before that new end. Structural tags do not create unrelated frame/header/footnote objects. @param where - Actual insertion boundary. @param type - Original section tag. @param coll - Actual document collection. @returns Connected section start. */
  public MakeTextSection(
    where: SwNode,
    type: SwStartNodeType,
    coll: SwTextFormatColl,
  ): SwStartNode {
    if (where.GetNodes() !== this || coll.GetDoc() !== this.document)
      throw new Error("Text section owners belong to another document");
    const index = where.GetIndex();
    const previous = index ? this.at(index - 1) : null;
    let parent = previous instanceof SwStartNode ? previous : previous?.StartOfSectionNode();
    if (previous instanceof SwEndNode) parent = parent?.StartOfSectionNode();
    const start =
      type === SwStartNodeType.SwTableBoxStartNode
        ? new SwTableBoxStartNode(this, parent)
        : new SwStartNode(this, parent, type);
    const end = new SwEndNode(this, start);
    start.setEndOfSection(end);
    this.nodeArray.splice(index, 0, start, end);
    this.MakeTextNode(this.at(where.GetIndex() - 1), coll);
    return start;
  }
  /** Inserts a new text node immediately before the content end sentinel. @param text - Initial text. @returns Inserted text node. */
  public MakeTextNode(text?: string): SwTextNode;
  /** Original positioned native text construction. @param where - Insertion boundary. @param coll - Actual document style. @returns Connected text owner. */
  public MakeTextNode(where: SwNode, coll: SwTextFormatColl): SwTextNode;
  /** Shares original native text ownership between the existing body-text boundary and positioned construction. @param textOrWhere - Body text or native boundary. @param coll - Original native collection. @returns Actual connected paragraph. */
  public MakeTextNode(textOrWhere: string | SwNode = "", coll?: SwTextFormatColl): SwTextNode {
    const where = typeof textOrWhere === "string" ? this.endOfContent : textOrWhere;
    if (where.GetNodes() !== this || (coll && coll.GetDoc() !== this.document))
      throw new Error("Text node owners belong to another document");
    const node = new SwTextNode(
      this,
      where.StartOfSectionNode(),
      coll ?? this.document.GetDfltTextFormatColl(),
      typeof textOrWhere === "string" ? textOrWhere : "",
    );
    this.nodeArray.splice(where.GetIndex(), 0, node);
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

  /** Original RemoveNode borrowed-index phase for represented complete removals. Content cursors are corrected separately by the existing source operation before node-only indices are assigned to the first following structural/content node. @param start - First removed array offset. @param count - Actual removed node count. @returns Nothing. */
  private CorrectNodeIndices(start: number, count: number): void {
    const target = this.at(start + count);
    for (const node of this.nodeArray.slice(start, start + count)) node.MoveNodeIndicesTo(target);
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
    this.CorrectNodeIndices(nodeIndex, 1);
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
    node.MoveNodeIndicesTo(replacement);
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
        this.document.AddNumRule(new SwNumRule(rule));
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
