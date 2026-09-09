/**
 * @fileoverview Implements the Writer SwDoc aggregate from the pinned LibreOffice `sw/source/core/doc/docnew.cxx` ownership boundary.
 */

import { markDocumentDirty, type OfficeDocument } from "../../../../sfx2/source/doc/docfac";
import { SwAttrPool } from "../attr/swatrset";
import { SwNodes } from "../docnode/nodes";
import {
  SwTextFormatColl,
  type SwTextFormatCollSnapshot,
  type WriterParagraphStyle,
} from "./fmtcol";
import { SwNumRule, type SwNumRuleSnapshot } from "./number";
import type { SwTextNode, SwTextNodeSnapshot } from "../txtnode/ndtxt";

/** Cycle-free persisted state of the currently implemented SwDoc subset. */
export interface SwDocSnapshot {
  /** Shared browser document lifecycle metadata. */
  readonly document: OfficeDocument;
  /** Document-owned numbering-rule definitions. */
  readonly numRules: readonly SwNumRuleSnapshot[];
  /** Ordered regular-content text nodes; fixed sections are recreated by SwNodes. */
  readonly textNodes: readonly SwTextNodeSnapshot[];
  /** Document-owned paragraph style collections. */
  readonly textFormatCollections: readonly SwTextFormatCollSnapshot[];
  /** Writer model schema discriminator. */
  readonly swModelVersion: 3;
}

/** Owns Writer's document node array and browser lifecycle metadata. */
export class SwDoc {
  public document: OfficeDocument;
  private readonly attrPool: SwAttrPool;
  private readonly textFormatCollections: SwTextFormatColl[];
  private readonly numRules = new Map<string, SwNumRule>();
  public readonly nodes: SwNodes;

  /** Creates a Writer document graph with an optional initial text node. @param document - Browser lifecycle metadata. @param initialTextNodeId - Optional initial node identity. @returns Nothing. */
  public constructor(document: OfficeDocument, initialTextNodeId?: string) {
    this.document = { ...document };
    this.attrPool = new SwAttrPool(this);
    const defaultTextFormatColl = new SwTextFormatColl(this.attrPool, "default", "Paragraph style");
    const headingOne = new SwTextFormatColl(
      this.attrPool,
      "heading-1",
      "Heading 1",
      defaultTextFormatColl,
    );
    this.textFormatCollections = [defaultTextFormatColl, headingOne];
    this.nodes = new SwNodes(this);
    if (initialTextNodeId !== undefined) this.nodes.MakeTextNode(initialTextNodeId);
  }

  /** Returns Writer's complete node array. @returns Owned node array. */
  public GetNodes(): SwNodes {
    return this.nodes;
  }

  /** Returns Writer's document-owned attribute pool. @returns SwAttrPool. */
  public GetAttrPool(): SwAttrPool {
    return this.attrPool;
  }

  /** Returns the default paragraph style collection. @returns Default SwTextFormatColl. */
  public GetDfltTextFormatColl(): SwTextFormatColl {
    return this.textFormatCollections[0] as SwTextFormatColl;
  }

  /** Returns the document-owned paragraph style table. @returns Ordered style collections. */
  public GetTextFormatColls(): readonly SwTextFormatColl[] {
    return this.textFormatCollections;
  }

  /** Finds one supported paragraph style collection. @param id - Programmatic style identity. @returns Matching collection, when present. */
  public FindTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl | undefined {
    return this.textFormatCollections.find(
      /** Matches a style collection identity. @param collection - Document style. @returns True when IDs match. */
      function hasStyleId(collection): boolean {
        return collection.id === id;
      },
    );
  }

  /** Returns one supported paragraph style or throws for a broken style table. @param id - Programmatic style identity. @returns Matching collection. */
  public GetTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl {
    const collection = this.FindTextFormatColl(id);
    if (collection === undefined) throw new Error(`Unknown SwTextFormatColl: ${id}`);
    return collection;
  }

  /** Adds a document-owned numbering rule. @param rule - New rule. @returns Stored rule. */
  public AddNumRule(rule: SwNumRule): SwNumRule {
    if (this.numRules.has(rule.GetName()))
      throw new Error(`Duplicate SwNumRule: ${rule.GetName()}`);
    const stored = rule.clone();
    this.numRules.set(stored.GetName(), stored);
    return stored;
  }

  /** Finds a numbering rule by the name stored in SwNumRuleItem. @param name - Rule name. @returns Matching rule, when present. */
  public FindNumRulePtr(name: string): SwNumRule | undefined {
    return this.numRules.get(name);
  }

  /** Returns all document-owned numbering rules. @returns Rules in insertion order. */
  public GetNumRuleTable(): readonly SwNumRule[] {
    return [...this.numRules.values()];
  }

  /** Finds or creates a rule with stable level-format semantics. @param name - Rule name. @param kind - Bullet or numbering family. @param level - Level whose format must agree. @returns Document-owned rule. */
  public EnsureNumRule(name: string, kind: "bullet" | "numbered", level = 0): SwNumRule {
    const existing = this.FindNumRulePtr(name);
    if (existing !== undefined) {
      if (existing.GetNumFormat(level).GetKind() !== kind)
        throw new Error(`SwNumRule ${name} has a different format at level ${level}.`);
      return existing;
    }
    return this.AddNumRule(new SwNumRule(name, kind));
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
    return SwDoc.fromSnapshot(this.toSnapshot());
  }

  /** Serializes the graph without its ownership cycles. @returns Versioned Writer snapshot. */
  public toSnapshot(): SwDocSnapshot {
    return {
      document: { ...this.document },
      numRules: this.GetNumRuleTable().map(
        /** Serializes one document numbering rule. @param rule - Document-owned rule. @returns Rule snapshot. */
        function serializeNumRule(rule): SwNumRuleSnapshot {
          return rule.toSnapshot();
        },
      ),
      swModelVersion: 3,
      textNodes: this.paragraphs.map(
        /** Serializes one regular body text node. @param node - Canonical SwTextNode. @returns Persisted node record. */
        function serializeTextNode(node): SwTextNodeSnapshot {
          return node.toSnapshot();
        },
      ),
      textFormatCollections: this.textFormatCollections.map(
        /** Serializes one paragraph style collection. @param collection - Document-owned style. @returns Style snapshot. */
        function serializeTextFormatColl(collection): SwTextFormatCollSnapshot {
          return collection.toSnapshot();
        },
      ),
    };
  }

  /** Restores a canonical Writer graph from a validated current snapshot. @param snapshot - Current model snapshot. @returns Restored document graph. */
  public static fromSnapshot(snapshot: SwDocSnapshot): SwDoc {
    const document = new SwDoc(snapshot.document);
    document.restoreTextFormatCollections(snapshot.textFormatCollections);
    snapshot.numRules.forEach(
      /** Restores one document numbering rule. @param ruleSnapshot - Persisted rule. @returns Nothing. */
      function restoreNumRule(ruleSnapshot): void {
        document.AddNumRule(SwNumRule.fromSnapshot(ruleSnapshot));
      },
    );
    document.nodes.restoreContent(snapshot.textNodes);
    return document;
  }

  /** Restores attributes, names, and inheritance for the bounded style table. @param snapshots - Persisted style definitions. @returns Nothing. */
  private restoreTextFormatCollections(snapshots: readonly SwTextFormatCollSnapshot[]): void {
    snapshots.forEach(
      /** Restores collection-local state before linking parents. @param snapshot - Persisted style definition. @returns Nothing. */
      (snapshot): void => {
        const collection = this.GetTextFormatColl(snapshot.id);
        collection.SetFormatName(snapshot.name);
        collection.ResetAllFormatAttr();
        collection.GetAttrSet().restoreSnapshots(snapshot.items);
      },
    );
    snapshots.forEach(
      /** Restores collection inheritance after every collection exists. @param snapshot - Persisted style definition. @returns Nothing. */
      (snapshot): void => {
        const collection = this.GetTextFormatColl(snapshot.id);
        collection.SetDerivedFrom(
          snapshot.parentId === undefined ? undefined : this.GetTextFormatColl(snapshot.parentId),
        );
      },
    );
  }
}
