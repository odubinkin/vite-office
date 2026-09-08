/**
 * @fileoverview Implements the Writer SwDoc aggregate from the pinned LibreOffice `sw/source/core/doc/docnew.cxx` ownership boundary.
 */

import { markDocumentDirty, type OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import { SwNodes } from "../docnode/nodes";
import type { SwTextNode, SwTextNodeSnapshot } from "../txtnode/ndtxt";

/** Cycle-free persisted state of the currently implemented SwDoc subset. */
export interface SwDocSnapshot {
  /** Shared browser document lifecycle metadata. */
  readonly document: OfficeDocument;
  /** Ordered regular-content text nodes; fixed sections are recreated by SwNodes. */
  readonly textNodes: readonly SwTextNodeSnapshot[];
  /** Writer model schema discriminator. */
  readonly swModelVersion: 1;
}

/** Owns Writer's document node array and browser lifecycle metadata. */
export class SwDoc {
  public document: OfficeDocument;
  public readonly nodes: SwNodes;

  /** Creates a Writer document graph with an optional initial text node. @param document - Browser lifecycle metadata. @param initialTextNodeId - Optional initial node identity. @returns Nothing. */
  public constructor(document: OfficeDocument, initialTextNodeId?: string) {
    this.document = { ...document };
    this.nodes = new SwNodes(this);
    if (initialTextNodeId !== undefined) this.nodes.MakeTextNode(initialTextNodeId);
  }

  /** Returns Writer's complete node array. @returns Owned node array. */
  public GetNodes(): SwNodes {
    return this.nodes;
  }

  /** Returns body text nodes as a read-only browser projection. @returns Ordered body text nodes. */
  public get paragraphs(): readonly SwTextNode[] {
    return this.nodes.getTextNodes();
  }

  /** Marks a changed model dirty through the shared browser lifecycle boundary. @returns Nothing. */
  public SetModified(): void {
    this.document = markDocumentDirty(this.document);
  }

  /** Creates an independent document graph for transaction-history snapshots. @returns Cloned document graph. */
  public clone(): SwDoc {
    const cloned = new SwDoc(this.document);
    cloned.nodes.copyContentFrom(this.nodes);
    return cloned;
  }

  /** Serializes the graph without its ownership cycles. @returns Versioned Writer snapshot. */
  public toSnapshot(): SwDocSnapshot {
    return {
      document: { ...this.document },
      swModelVersion: 1,
      textNodes: this.paragraphs.map(
        /** Serializes one regular body text node. @param node - Canonical SwTextNode. @returns Persisted node record. */
        function serializeTextNode(node): SwTextNodeSnapshot {
          return node.toSnapshot();
        },
      ),
    };
  }

  /** Restores a canonical Writer graph from a validated current snapshot. @param snapshot - Current model snapshot. @returns Restored document graph. */
  public static fromSnapshot(snapshot: SwDocSnapshot): SwDoc {
    const document = new SwDoc(snapshot.document);
    document.nodes.restoreContent(snapshot.textNodes);
    return document;
  }
}
