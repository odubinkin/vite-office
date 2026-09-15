/** @fileoverview Implements the Writer SwDoc aggregate from pinned LibreOffice `sw/inc/doc.hxx` and `sw/source/core/doc/docnew.cxx`. */

import { SwAttrPool } from "../attr/swatrset";
import { SwNodes } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import { DocumentContentOperationsManager } from "./DocumentContentOperationsManager";
import { DocumentListsManager } from "./DocumentListsManager";
import { DocumentSettingManager } from "./DocumentSettingManager";
import { DocumentStateManager } from "./DocumentStateManager";
import { DocumentStylePoolManager } from "./DocumentStylePoolManager";
import type { SwTextFormatColl, WriterParagraphStyle } from "./fmtcol";
import type { SwNumRule } from "./number";
import type { SwAtomicModelHint } from "../../../inc/hints";
import { SfxUndoManager } from "../../../../svl/source/undo/undo";
import type { SwUndoRedoContext } from "../undo/undobj";

/** Final Writer document aggregate; notification and domain policies are composed managers. */
export class SwDoc {
  private readonly attrPool: SwAttrPool;
  private readonly contentOperationsManager: DocumentContentOperationsManager;
  private readonly listsManager: DocumentListsManager;
  private readonly settingManager = new DocumentSettingManager();
  private readonly stateManager = new DocumentStateManager();
  private readonly stylePoolManager: DocumentStylePoolManager;
  private readonly undoManager = new SfxUndoManager<SwUndoRedoContext>();
  public readonly nodes: SwNodes;

  /** Creates the canonical fixed sections and optionally one empty body node. @param createInitialTextNode - Whether to create initial body content. @returns Nothing. */
  public constructor(createInitialTextNode: boolean | string = true) {
    this.attrPool = new SwAttrPool(this);
    this.stylePoolManager = new DocumentStylePoolManager(this.attrPool);
    this.listsManager = new DocumentListsManager(this.stateManager);
    this.nodes = new SwNodes(this);
    this.contentOperationsManager = new DocumentContentOperationsManager();
    if (createInitialTextNode !== false)
      this.nodes.MakeTextNode(
        typeof createInitialTextNode === "string" ? createInitialTextNode : "writer-paragraph-1",
      );
  }

  /** Returns Writer's complete node array. @returns Owned node array. */
  public GetNodes(): SwNodes {
    return this.nodes;
  }
  /** Returns the document attribute pool. @returns SwAttrPool. */
  public GetAttrPool(): SwAttrPool {
    return this.attrPool;
  }
  /** Returns content-operation ownership. @returns Content manager. */
  public GetDocumentContentOperationsManager(): DocumentContentOperationsManager {
    return this.contentOperationsManager;
  }
  /** Returns list and numbering ownership. @returns List manager. */
  public GetDocumentListsManager(): DocumentListsManager {
    return this.listsManager;
  }
  /** Returns settings ownership. @returns Settings manager. */
  public GetDocumentSettingManager(): DocumentSettingManager {
    return this.settingManager;
  }
  /** Returns mutation state and notifications. @returns State manager. */
  public GetDocumentStateManager(): DocumentStateManager {
    return this.stateManager;
  }
  /** Routes a model mutation to the state manager without making SwDoc a broadcaster. @param hint - Model delta. @returns Nothing. */
  public NotifyModelChange(hint: SwAtomicModelHint): void {
    this.stateManager.NotifyModelChange(hint);
  }
  /** Returns style-pool ownership. @returns Style manager. */
  public GetDocumentStylePoolManager(): DocumentStylePoolManager {
    return this.stylePoolManager;
  }
  /** Returns Writer's document-owned undo manager. @returns Undo manager. */
  public GetUndoManager(): SfxUndoManager<SwUndoRedoContext> {
    return this.undoManager;
  }
  /** Returns the default paragraph collection. @returns Default collection. */
  public GetDfltTextFormatColl(): SwTextFormatColl {
    return this.stylePoolManager.GetDfltTextFormatColl();
  }
  /** Returns document paragraph collections. @returns Ordered collections. */
  public GetTextFormatColls(): readonly SwTextFormatColl[] {
    return this.stylePoolManager.GetTextFormatColls();
  }
  /** Finds a supported paragraph collection. @param id - Programmatic identity. @returns Existing collection. */
  public FindTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl | undefined {
    return this.stylePoolManager.FindTextFormatColl(id);
  }
  /** Finds or creates a paragraph collection. @param id - Programmatic identity. @returns Document collection. */
  public GetTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl {
    return this.stylePoolManager.GetTextFormatColl(id);
  }
  /** Adds a numbering rule. @param rule - Source rule. @returns Stored rule. */
  public AddNumRule(rule: SwNumRule): SwNumRule {
    return this.listsManager.AddNumRule(rule);
  }
  /** Finds a numbering rule. @param name - Rule name. @returns Matching rule. */
  public FindNumRulePtr(name: string): SwNumRule | undefined {
    return this.listsManager.FindNumRulePtr(name);
  }
  /** Returns numbering rules. @returns Rule table. */
  public GetNumRuleTable(): readonly SwNumRule[] {
    return this.listsManager.GetNumRuleTable();
  }
  /** Finds or creates a compatible numbering rule. @param name - Rule name. @param kind - Rule family. @param level - Checked level. @returns Document rule. */
  public EnsureNumRule(name: string, kind: "bullet" | "numbered", level = 0): SwNumRule {
    return this.listsManager.EnsureNumRule(name, kind, level);
  }
  /** Returns body text nodes. @returns Ordered body content. */
  public get paragraphs(): readonly SwTextNode[] {
    return this.nodes.getTextNodes();
  }
  /** Runs one semantic model transaction. @param mutation - Mutation callback. @returns Callback result. */
  public RunModelTransaction<Result>(mutation: () => Result): Result {
    return this.stateManager.RunModelTransaction(mutation);
  }
  /** Disposes the document notification graph. @returns Nothing. */
  public Dispose(): void {
    this.stateManager.Dispose();
  }
}

/** Creates a Writer document; the optional label is accepted only by browser fixtures and is not stored in the model. @param projectionLabel - Optional non-blank external label. @returns New document. */
export function createWriterDocument(projectionLabel?: string): SwDoc {
  if (projectionLabel !== undefined && projectionLabel.trim().length === 0)
    throw new Error("Paragraph label must not be blank.");
  return new SwDoc(projectionLabel ?? true);
}
