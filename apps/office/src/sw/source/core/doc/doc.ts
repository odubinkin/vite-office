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
import { UndoManager } from "../undo/docundo";
import type { DefaultFontDevice } from "./default-font";
import {
  createDefaultWriterPageDescriptor,
  equalWriterPageDescriptors,
  SwPageDesc,
  type WriterPageDescriptorValue,
} from "../layout/pagedesc";

/** Construction policy for locale/device-dependent Writer defaults. */
export interface SwDocOptions {
  readonly createInitialTextNode?: boolean;
  readonly defaultFontDevice?: DefaultFontDevice;
  readonly locale?: string;
}

/** Final Writer document aggregate; notification and domain policies are composed managers. */
export class SwDoc {
  private readonly attrPool: SwAttrPool;
  private readonly contentOperationsManager: DocumentContentOperationsManager;
  private readonly listsManager: DocumentListsManager;
  private readonly settingManager = new DocumentSettingManager();
  private readonly stateManager = new DocumentStateManager();
  private readonly stylePoolManager: DocumentStylePoolManager;
  private readonly undoManager = new UndoManager(this);
  private readonly defaultFontDevice: DefaultFontDevice | undefined;
  private readonly locale: string;
  private readonly pageDesc: SwPageDesc;
  public readonly nodes: SwNodes;

  /** Creates the canonical fixed sections and optionally one empty body node. @param createInitialTextNode - Whether to create initial body content. @returns Nothing. */
  public constructor(createInitialTextNode: boolean | SwDocOptions = true) {
    const options = typeof createInitialTextNode === "object" ? createInitialTextNode : undefined;
    this.defaultFontDevice = options?.defaultFontDevice;
    this.locale = options?.locale ?? "en-US";
    this.pageDesc = createDefaultWriterPageDescriptor(this.locale);
    this.attrPool = new SwAttrPool(this);
    this.stylePoolManager = new DocumentStylePoolManager(this.attrPool);
    this.listsManager = new DocumentListsManager(this.stateManager);
    this.nodes = new SwNodes(this);
    this.contentOperationsManager = new DocumentContentOperationsManager(this);
    if (options?.createInitialTextNode !== false && createInitialTextNode !== false)
      this.nodes.MakeTextNode();
  }

  /** Returns the document locale used for script-specific defaults. @returns BCP 47 locale. */
  public GetLocale(): string {
    return this.locale;
  }
  /** Returns the document-owned Standard page descriptor. @returns Page descriptor. */
  public GetPageDesc(): SwPageDesc {
    return this.pageDesc;
  }
  /** Replaces the supported Standard page geometry and publishes one model hint. @param value - Page geometry. @returns Whether it changed. */
  public ChgPageDesc(value: WriterPageDescriptorValue): boolean {
    const before = this.pageDesc.GetValue();
    if (equalWriterPageDescriptors(before, value)) return false;
    this.pageDesc.SetValue(value);
    this.NotifyModelChange({ kind: "page-descriptor-changed" });
    return true;
  }

  /** Returns the injected output-device font resolver. @returns Device or undefined. */
  public GetDefaultFontDevice(): DefaultFontDevice | undefined {
    return this.defaultFontDevice;
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
  public GetUndoManager(): UndoManager {
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
    this.undoManager.Dispose();
    this.stateManager.Dispose();
  }
}

/** Creates a Writer document with one canonical body text node. @returns New document. */
export function createWriterDocument(): SwDoc {
  return new SwDoc();
}
