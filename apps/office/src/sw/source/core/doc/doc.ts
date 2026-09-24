/** @fileoverview Implements the Writer SwDoc aggregate from pinned LibreOffice `sw/inc/doc.hxx` and `sw/source/core/doc/docnew.cxx`. */

import { SwAttrPool } from "../attr/swatrset";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { SwNodes } from "../docnode/nodes";
import type { SwTextNode } from "../txtnode/ndtxt";
import { DocumentContentOperationsManager } from "./DocumentContentOperationsManager";
import { DocumentMarkAccess } from "./docbm";
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

/** One package-backed Writer font face; bytes are attached only after manifest and ZIP validation. */
export interface WriterEmbeddedFont {
  readonly faceName: string;
  readonly familyName: string;
  readonly path: string;
  readonly format: string;
  readonly weight: "normal" | "bold";
  readonly style: "normal" | "italic";
  readonly bytes?: Uint8Array;
  readonly canLoad?: boolean;
}

/** Final Writer document aggregate; notification and domain policies are composed managers. */
export class SwDoc {
  private readonly attrPool: SwAttrPool;
  private readonly contentOperationsManager: DocumentContentOperationsManager;
  private readonly markAccess: DocumentMarkAccess;
  private readonly listsManager: DocumentListsManager;
  private readonly settingManager = new DocumentSettingManager();
  private readonly stateManager = new DocumentStateManager();
  private readonly stylePoolManager: DocumentStylePoolManager;
  private readonly undoManager = new UndoManager(this);
  private readonly defaultFontDevice: DefaultFontDevice | undefined;
  private readonly locale: string;
  private lineNumberInfo = new SwLineNumberInfo();
  private readonly pageDescs: SwPageDesc[];
  private readonly embeddedFonts = new Map<string, WriterEmbeddedFont>();
  public readonly nodes: SwNodes;

  /** Creates the canonical fixed sections and optionally one empty body node. @param createInitialTextNode - Whether to create initial body content. @returns Nothing. */
  public constructor(createInitialTextNode: boolean | SwDocOptions = true) {
    const options = typeof createInitialTextNode === "object" ? createInitialTextNode : undefined;
    this.defaultFontDevice = options?.defaultFontDevice;
    this.locale = options?.locale ?? "en-US";
    this.pageDescs = [createDefaultWriterPageDescriptor(this.locale)];
    this.attrPool = new SwAttrPool(this);
    this.stylePoolManager = new DocumentStylePoolManager(this.attrPool);
    this.listsManager = new DocumentListsManager(this.stateManager);
    this.nodes = new SwNodes(this);
    this.contentOperationsManager = new DocumentContentOperationsManager(this);
    this.markAccess = new DocumentMarkAccess(this);
    if (options?.createInitialTextNode !== false && createInitialTextNode !== false)
      this.nodes.MakeTextNode();
  }

  /** Returns the document locale used for script-specific defaults. @returns BCP 47 locale. */
  public GetLocale(): string {
    return this.locale;
  }
  /** Registers a package font declaration before its ZIP entry is read. @param font - Declared face and package path. @returns Nothing. */
  public RegisterEmbeddedFont(font: WriterEmbeddedFont): void {
    const existing = this.embeddedFonts.get(font.path);
    if (existing !== undefined) {
      if (
        existing.faceName !== font.faceName ||
        existing.familyName !== font.familyName ||
        existing.weight !== font.weight ||
        existing.style !== font.style ||
        existing.format !== font.format
      )
        throw new Error(`Conflicting ODF embedded font: ${font.path}`);
      return;
    }
    this.embeddedFonts.set(font.path, { ...font });
  }
  /** Attaches validated package bytes and embedding permission. @param path - ZIP entry name. @param bytes - Bounded font data. @param canLoad - Whether the font permits viewing. @returns Nothing. */
  public SetEmbeddedFontBytes(path: string, bytes: Uint8Array, canLoad: boolean): void {
    const declared = this.embeddedFonts.get(path);
    if (declared === undefined) throw new Error(`Unknown ODF embedded font: ${path}`);
    this.embeddedFonts.set(path, { ...declared, bytes: bytes.slice(), canLoad });
  }
  /** Returns independent package font records for export, transfer, and browser loading. @returns Font records. */
  public GetEmbeddedFonts(): readonly WriterEmbeddedFont[] {
    return [...this.embeddedFonts.values()].map(
      /** Protects document-owned bytes. @param font - Stored font. @returns Independent record. */
      (font) => ({ ...font, ...(font.bytes === undefined ? {} : { bytes: font.bytes.slice() }) }),
    );
  }
  /** Returns a copy of the document-owned line-number configuration. @returns Line-number settings. */
  public GetLineNumberInfo(): SwLineNumberInfo {
    return this.lineNumberInfo.Clone();
  }
  /** Stores a line-number configuration and invalidates the document projection. @param info - New settings. @returns Whether changed. */
  public SetLineNumberInfo(info: SwLineNumberInfo): boolean {
    if (this.lineNumberInfo.equals(info)) return false;
    this.lineNumberInfo = info.Clone();
    this.NotifyModelChange({ kind: "line-number-info-changed" });
    return true;
  }
  /** Returns one document-owned page descriptor by stable collection position. @param index - Descriptor position. @returns Page descriptor. */
  public GetPageDesc(index = 0): SwPageDesc {
    const descriptor = this.pageDescs[index];
    if (descriptor === undefined) throw new Error("Writer page descriptor index is out of range.");
    return descriptor;
  }
  /** Returns the number of document-owned page descriptors. @returns Descriptor count. */
  public GetPageDescCnt(): number {
    return this.pageDescs.length;
  }
  /** Finds one descriptor by its stable page-style name. @param name - Page-style name. @returns Descriptor or undefined. */
  public FindPageDesc(name: string): SwPageDesc | undefined {
    return this.pageDescs.find(
      /** Matches a page style by stable name. @param descriptor - Candidate page style. @returns Whether names match. */ (
        descriptor,
      ) => descriptor.GetName() === name,
    );
  }
  /** Reports whether a descriptor belongs to this document. @param descriptor - Candidate identity. @returns Membership. */
  public ContainsPageDesc(descriptor: SwPageDesc | undefined): boolean {
    return descriptor !== undefined && this.pageDescs.includes(descriptor);
  }
  /** Creates a named descriptor, optionally copying supported geometry. @param name - Unique page-style name. @param source - Optional source descriptor. @returns New document-owned descriptor. */
  public MakePageDesc(name: string, source?: SwPageDesc): SwPageDesc {
    if (this.FindPageDesc(name) !== undefined)
      throw new Error(`Writer page descriptor exists: ${name}`);
    const descriptor = source?.Clone() ?? createDefaultWriterPageDescriptor(this.locale);
    descriptor.SetValue({ ...descriptor.GetValue(), name });
    this.pageDescs.push(descriptor);
    this.NotifyModelChange({ kind: "page-descriptor-changed" });
    return descriptor;
  }
  /** Deletes a non-default descriptor and restores incoming follow links to self-follow. @param descriptor - Name or position. @returns Whether deleted. */
  public DelPageDesc(descriptor: number | string): boolean {
    const index =
      typeof descriptor === "number"
        ? descriptor
        : this.pageDescs.findIndex(
            /** Finds a page style by name. @param item - Candidate page style. @returns Whether names match. */ (
              item,
            ) => item.GetName() === descriptor,
          );
    if (index <= 0 || index >= this.pageDescs.length) return false;
    const removed = this.pageDescs[index] as SwPageDesc;
    for (const item of this.pageDescs) if (item.GetFollow() === removed) item.SetFollow(null);
    this.pageDescs.splice(index, 1);
    this.NotifyModelChange({ kind: "page-descriptor-changed" });
    return true;
  }
  /** Replaces supported geometry at an existing descriptor identity and publishes one model hint. @param value - Page geometry. @param target - Name or position. @returns Whether it changed. */
  public ChgPageDesc(value: WriterPageDescriptorValue, target: number | string = 0): boolean {
    const descriptor =
      typeof target === "number" ? this.GetPageDesc(target) : this.FindPageDesc(target);
    if (descriptor === undefined) return false;
    if (value.name !== descriptor.GetName())
      throw new Error("Writer page descriptor replacement must preserve its identity.");
    const before = descriptor.GetValue();
    if (equalWriterPageDescriptors(before, value)) return false;
    descriptor.SetValue(value);
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
  /** Returns the document-owned bookmark and soft-break position manager. @returns Mark access. */
  public GetIDocumentMarkAccess(): DocumentMarkAccess {
    return this.markAccess;
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
