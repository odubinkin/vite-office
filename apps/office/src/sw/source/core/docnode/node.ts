/**
 * @fileoverview Implements Writer document model nodes and structural transitions from the pinned LibreOffice `sw/source/core/docnode/node.cxx` boundary.
 */

import type { WriterDocument, WriterParagraphMoveDirection } from "../doc/writer";
import type { SwNodes } from "./nodes";

/** Identifies the node categories implemented by the current Writer model slice. */
export type SwNodeType = "end" | "start" | "text";

/** Base class of every Writer document model element. */
export abstract class SwNode {
  /**
   * Creates a node owned by one SwNodes array.
   * @param nodes - Owning node array.
   * @param id - Stable node identity.
   * @param nodeType - Implemented node category.
   * @param startOfSection - Optional containing section start.
   * @returns Nothing; initializes this node.
   */
  protected constructor(
    private readonly nodes: SwNodes,
    public readonly id: string,
    private readonly nodeType: SwNodeType,
    private readonly startOfSection?: SwStartNode,
  ) {}

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

  /** Creates a section start sentinel. @param nodes - Owning node array. @param id - Sentinel identity. @param parent - Optional parent section. @returns Nothing. */
  public constructor(nodes: SwNodes, id: string, parent?: SwStartNode) {
    super(nodes, id, "start", parent);
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
  /** Creates an end sentinel linked to its start sentinel. @param nodes - Owning node array. @param id - Sentinel identity. @param start - Matching start sentinel. @returns Nothing. */
  public constructor(nodes: SwNodes, id: string, start: SwStartNode) {
    super(nodes, id, "end", start);
  }
}

/** Base class for nodes that own indexable content. */
export abstract class SwContentNode extends SwNode {
  /** Creates a content node in one Writer section. @param nodes - Owning node array. @param id - Node identity. @param startOfSection - Containing section. @returns Nothing. */
  protected constructor(nodes: SwNodes, id: string, startOfSection: SwStartNode) {
    super(nodes, id, "text", startOfSection);
  }

  /** Returns the current content length. @returns UTF-16 content length. */
  public abstract Len(): number;
}

/** Moves one named Writer paragraph by one adjacent body position. @param writerDocument - Prior document graph. @param paragraphId - Text-node identity. @param direction - Adjacent move direction. @returns Changed cloned graph. */
export function moveWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
  direction: WriterParagraphMoveDirection,
): WriterDocument {
  if (direction !== "up" && direction !== "down")
    throw new Error(`Unsupported Writer paragraph direction: ${direction}`);
  const next = writerDocument.clone();
  const node = next.nodes.findTextNode(paragraphId);
  if (node === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  next.nodes.moveTextNode(node, direction === "up" ? -1 : 1);
  next.SetModified();
  return next;
}

/** Removes one named Writer text node while preserving a non-empty body. @param writerDocument - Prior document graph. @param paragraphId - Removed text-node identity. @returns Changed cloned graph. */
export function removeWriterParagraph(
  writerDocument: WriterDocument,
  paragraphId: string,
): WriterDocument {
  const next = writerDocument.clone();
  const node = next.nodes.findTextNode(paragraphId);
  if (node === undefined) throw new Error(`Unknown paragraph: ${paragraphId}`);
  next.nodes.removeTextNode(node);
  next.SetModified();
  return next;
}
