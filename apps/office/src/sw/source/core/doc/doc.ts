/** @fileoverview Implements the Writer SwDoc aggregate from pinned LibreOffice `sw/inc/doc.hxx` and `sw/source/core/doc/docnew.cxx`. */

import { SwAttrPool } from "../attr/swatrset";
import { SwTableLineFormat, SwTableBoxFormat } from "../../../inc/swtblfmt";
import { SwFrameFormat } from "../layout/atrfrm";
import { SetTableName } from "./docchart";
import type { SwFormat } from "../attr/format";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import { SwNodes } from "../docnode/nodes";
import { SwTableNode, type SwNode } from "../docnode/node";
import { SwTextNode } from "../txtnode/ndtxt";
import {
  createWriterTableBoxItem,
  type SwTable,
  type SwTableBox,
  type SwTableBoxFormat as SwTableBoxFormatValue,
} from "../table/swtable";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwTabCols } from "../bastyp/tabcol";
import type { SwTabFrame } from "../layout/tabfrm";
import {
  GetSwTabRows,
  SetSwTabRows,
  SetSwTabCols,
  InsertSwTableColumns,
  InsertSwTableRows,
} from "../docnode/ndtbl";
import {
  GetSwCursorRowSplit,
  SetSwRowSplit,
  GetSwRowHeight,
  SetSwRowHeight,
  GetSwBoxAttr,
  GetSwBoxAlign,
  SetSwBoxAttr,
  SetSwTabBorders,
  GetSwTabBorders,
} from "../docnode/ndtbl1";
import type { SwCursor } from "../crsr/swcrsr";
import type { SwFormatFrameSize } from "../../../inc/fmtfsize";
import type { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import type { SwUndoCursorState } from "../undo/undobj";
import { SwInsertTableFlags, type SwInsertTableOptions } from "../../../inc/itabenum";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { DocumentContentOperationsManager } from "./DocumentContentOperationsManager";
import { DocumentMarkAccess } from "./docbm";
import { DocumentListItemsManager } from "./DocumentListItemsManager";
import { DocumentListsManager } from "./DocumentListsManager";
import { DocumentSettingManager } from "./DocumentSettingManager";
import { DocumentStateManager } from "./DocumentStateManager";
import { DocumentStylePoolManager } from "./DocumentStylePoolManager";
import { createStyleManager } from "./swstylemanager";
import type { IStyleAccess } from "../../../inc/istyleaccess";
import { SwTextFormatColl, isWriterParagraphStyle, type WriterParagraphStyle } from "./fmtcol";
import {
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
} from "../../../inc/hintids";
import { SwNumRuleItem } from "../para/paratr";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import type { SwNumRule } from "./number";
import { WRITER_MAX_LIST_LEVEL } from "./list";
import { OutlineUpDown as moveOutlineLevels } from "./docnum";
import { SwPaM, SwPosition } from "../crsr/pam";
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

/** Native SetNumRule operation flags from doc.hxx. */
export enum SetNumRuleMode {
  Default = 0,
  CreateNewList = 1,
  DontSetItem = 2,
  ResetIndentAttrs = 4,
  DontSetIfAlreadyApplied = 8,
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
  /** Renames a table through its native frame owner. @param format - Table frame. @param name - Requested name. @returns Nothing. */
  public SetTableName(format: SwFrameFormat, name: string): void {
    SetTableName(this, format, name);
  }
  /** Finds a used table frame by its current name. @param name - Raw name. @returns Live frame, when present. */
  public FindTableFormatByName(name: string): SwFrameFormat | undefined {
    return this.GetTables()
      .find(
        /** Matches native used table identity. @param table - Live owner. @returns Whether named. */ (
          table,
        ) => table.GetName() === name,
      )
      ?.GetFrameFormat();
  }
  /** Applies represented border attributes over native point/mark cell endpoints. @param cursor - Original shell cursor. @param value - Supplied border and distance attributes. @param cursorState - Optional original displayed cursor state. @returns Whether admitted. */
  public SetTabBorders(
    cursor: SwCursor,
    value: SfxItemSet,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return SetSwTabBorders(this, cursor, value, cursorState);
  }
  /** Reads original native selection common border items. @param cursor - Actual display cursor. @param value - In/out native item set. @returns Nothing. */
  public GetTabBorders(cursor: SwCursor, value: SfxItemSet): void {
    GetSwTabBorders(this, cursor, value);
  }
  /** Reads native row geometry over actual physical cell owners. @param result - Output carrier. @param frame - Native frame. @param start - Current cell. @returns Whether represented. */
  public static GetTabRows(result: SwTabCols, frame: SwTabFrame, start: SwTableBox): boolean {
    return GetSwTabRows(result, frame, start);
  }

  /** Reads native row split from current or selected canonical boxes. @param cursor - Original shell cursor. @returns Common row item or no item. */
  public static GetRowSplit(cursor: SwCursor): SwFormatRowSplit | undefined {
    return GetSwCursorRowSplit(cursor);
  }
  /** Publishes native row split attributes through document-owned history. @param cursor - Actual current or selected cursor. @param split - New row item. @param cursorState - Optional shell cursor attributes. @returns Whether admitted. */
  public SetRowSplit(
    cursor: SwCursor,
    split: SwFormatRowSplit,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return SetSwRowSplit(this, cursor, split, cursorState);
  }
  /** Reads the complete common native row-size item. @param cursor - Actual current or table-selected cursor. @returns Cloned common frame size or no item. */
  public static GetRowHeight(cursor: SwCursor): SwFormatFrameSize | undefined {
    return GetSwRowHeight(cursor);
  }
  /** Publishes the complete size item through document-owned row attributes and history. @param cursor - Actual current or table-selected cursor. @param size - Native frame-size item. @param cursorState - Optional shell history attributes. @returns Whether admitted. */
  public SetRowHeight(
    cursor: SwCursor,
    size: SwFormatFrameSize,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return SetSwRowHeight(this, cursor, size, cursorState);
  }
  /** Applies native row-height deltas through the source ndtbl owner split. @param next - Requested rows. @param currentColumnOnly - Original hit cell only. @param frame - Physical frame. @param start - Actual cell. @param cursorState - Retained native cursor. @returns Whether changed. */
  public SetTabRows(
    next: SwTabCols,
    currentColumnOnly: boolean,
    frame: SwTabFrame,
    start: SwTableBox,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return SetSwTabRows(this, next, currentColumnOnly, frame, start, cursorState);
  }
  private mbDtor = false;
  private mbInReading = false;
  /** Reports the native document destruction phase. @returns Destruction flag. */
  public IsInDtor(): boolean {
    return this.mbDtor;
  }
  /** Reports the native document reading phase. @returns Reading flag. */
  public IsInReading(): boolean {
    return this.mbInReading;
  }
  /** Sets the native reading phase around document import. @param reading - New flag. @returns Nothing. */
  public SetInReading(reading: boolean): void {
    this.mbInReading = reading;
  }
  private readonly defaultFrameFormat: SwFrameFormat;
  private nextTableLineFormat = 0;
  private nextTableBoxFormat = 0;
  private readonly attrPool: SwAttrPool;
  private readonly styleAccess: IStyleAccess;
  private readonly contentOperationsManager: DocumentContentOperationsManager;
  private readonly markAccess: DocumentMarkAccess;
  private readonly listsManager: DocumentListsManager;
  private readonly listItemsManager = new DocumentListItemsManager();
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
    this.defaultFrameFormat = new SwFrameFormat(this.attrPool, "Default Frame Format");
    this.styleAccess = createStyleManager();
    this.stylePoolManager = new DocumentStylePoolManager(this.attrPool);
    this.listsManager = new DocumentListsManager(this.stateManager);
    this.nodes = new SwNodes(this);
    this.contentOperationsManager = new DocumentContentOperationsManager(this);
    this.markAccess = new DocumentMarkAccess(this);
    if (options?.createInitialTextNode !== false && createInitialTextNode !== false)
      this.nodes.MakeTextNode();
  }

  /** Reads the document-owned default frame. @returns Native default format. */
  public GetDfltFrameFormat(): SwFrameFormat {
    return this.defaultFrameFormat;
  }
  /** Creates a uniquely named native row format derived from the default frame. @returns Native row format. */
  public MakeTableLineFormat(): SwTableLineFormat {
    const format = new SwTableLineFormat(this.attrPool, this.defaultFrameFormat);
    format.SetFormatName("TableLine" + ++this.nextTableLineFormat);
    return format;
  }
  /** Creates a unique native cell format derived from the default frame. @returns Native box owner. */
  public MakeTableBoxFormat(): SwTableBoxFormat {
    const format = new SwTableBoxFormat(this.attrPool, this.defaultFrameFormat);
    format.SetFormatName("TableBox" + ++this.nextTableBoxFormat);
    return format;
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

  /** Returns the document-owned automatic style manager. @returns Stable style access. */
  public GetIStyleAccess(): IStyleAccess {
    return this.styleAccess;
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
  /** Marks an existing native list without creating or editing its numbering ownership. @param listId - Persistent list identity. @param level - Native list depth. @param value - Mark or clear. @returns Nothing. */
  public MarkListLevel(listId: string, level: number, value: boolean): void {
    this.GetDocumentListsManager().GetListByName(listId)?.MarkListLevel(level, value);
  }

  /** Returns the source-owned shown numbered-item registry. @returns Document list items. */
  public getIDocumentListItems(): DocumentListItemsManager {
    return this.listItemsManager;
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
  /** Reports regular node use, including derived paragraph collections like native poolfmt.cxx. @param format - Candidate identity. @returns Whether a regular node depends on it. */
  public IsUsed(format: SwTextFormatColl): boolean {
    for (const node of this.nodes.entries()) {
      if (!(node instanceof SwTextNode)) continue;
      let owner: SwFormat | undefined = node.GetTextFormatColl();
      while (owner !== undefined) {
        if (owner === format) return true;
        owner = owner.DerivedFrom();
      }
    }
    return false;
  }
  /** Finds a supported paragraph collection. @param id - Programmatic identity. @returns Existing collection. */
  public FindTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl | undefined {
    return this.stylePoolManager.FindTextFormatColl(id);
  }
  /** Finds a document-owned collection by its native name. @param name - Display name. @returns Existing owner. */
  public FindTextFormatCollByName(name: string): SwTextFormatColl | undefined {
    return this.GetTextFormatColls().find(
      /** Matches the native name. @param collection - Owner. @returns Match. */
      (collection) => collection.GetName() === name,
    );
  }
  /** Finds or creates a paragraph collection. @param id - Programmatic identity. @returns Document collection. */
  public GetTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl {
    return this.stylePoolManager.GetTextFormatColl(id);
  }

  /** Creates and registers a named text collection like native docfmt.cxx. @param name - Display name. @param parent - Parent collection. @param id - Stable graph identity, defaulting to the name. @returns New document-owned collection. */
  public MakeTextFormatColl(name: string, parent?: SwTextFormatColl, id = name): SwTextFormatColl {
    const collection = this.stylePoolManager.AddTextFormatColl(
      new SwTextFormatColl(this.attrPool, id, name, parent),
    );
    this.NotifyModelChange({ kind: "format-inheritance-changed", formatId: name });
    return collection;
  }

  /** Copies absent custom style ownership with native parent/follow/direct-item and manual-rule handling. @param source - Source collection. @returns Destination collection; the existing builtin identity adapter is retained. */
  public CopyTextColl(source: SwTextFormatColl): SwTextFormatColl {
    if (isWriterParagraphStyle(source.id)) return this.GetTextFormatColl(source.id);
    const existing = this.FindTextFormatCollByName(source.GetName());
    if (existing !== undefined) return existing;
    const sourceParent = source.DerivedFrom();
    const parent =
      sourceParent instanceof SwTextFormatColl
        ? this.CopyTextColl(sourceParent)
        : this.GetDfltTextFormatColl();
    const completed = this.FindTextFormatCollByName(source.GetName());
    if (completed !== undefined) return completed;
    const copied = this.MakeTextFormatColl(source.GetName(), parent, source.id);
    copied.SetFormatAttrSet(source.GetAttrSet());
    if (source.IsAssignedToListLevelOfOutlineStyle())
      copied.AssignToListLevelOfOutlineStyle(source.GetAssignedOutlineStyleLevel());
    const follow = source.GetNextTextFormatColl();
    if (follow !== source) copied.SetNextTextFormatColl(this.CopyTextColl(follow));
    const ruleName = (
      source.GetAttrSet().GetItemIfSet(RES_PARATR_NUMRULE, false) as SwNumRuleItem | undefined
    )?.GetValue();
    const rule =
      ruleName === undefined || ruleName === ""
        ? undefined
        : source.GetAttrSet().GetDoc().FindNumRulePtr(ruleName);
    if (rule !== undefined && !rule.IsAutoRule() && source.GetAttrSet().GetDoc() !== this) {
      const destinationRule = this.FindNumRulePtr(rule.GetName());
      if (destinationRule === undefined) this.AddNumRule(rule);
      else destinationRule.Invalidate();
    }
    return copied;
  }
  /** Adds a numbering rule. @param rule - Source rule. @returns Stored rule. */
  public AddNumRule(rule: SwNumRule): SwNumRule {
    return this.listsManager.AddNumRule(rule);
  }
  /** Finds a numbering rule. @param name - Rule name. @returns Matching rule. */
  public FindNumRulePtr(name: string): SwNumRule | undefined {
    return this.listsManager.FindNumRulePtr(name);
  }

  /** Searches native ordered text nodes, stopping at the nearest rule even when incompatible. @param position - Search origin. @param forward - Search direction. @param numbered - Enumeration rather than itemization. @param outline - Required rule classification. @param nonEmptyAllowed - Plain nonempty paragraphs allowed, minus one for unlimited. @param listId - Caller-owned output list identity. @param investigateStart - Include the origin, false by default. @returns Matching native rule, if any. */
  public SearchNumRule(
    position: SwPosition,
    forward: boolean,
    numbered: boolean,
    outline: boolean,
    nonEmptyAllowed: number,
    listId: { value: string },
    investigateStart = false,
  ): SwNumRule | undefined {
    const origin = position.GetNode();
    if (!(origin instanceof SwTextNode)) return undefined;
    if (origin.GetDoc() !== this) throw new Error("Numbering search belongs to another document.");
    const root = this.nodes.at(0);
    let section = origin.StartOfSectionNode();
    while (section !== root && section.StartOfSectionNode() !== root)
      section = section.StartOfSectionNode();
    const start = section.GetIndex(),
      end = section.EndOfSectionNode().GetIndex(),
      step = forward ? 1 : -1;
    for (
      let index = origin.GetIndex() + (investigateStart ? 0 : step);
      index > start && index < end;
      index += step
    ) {
      const node = this.nodes.at(index);
      if (!(node instanceof SwTextNode)) continue;
      const rule = node.GetNumRule();
      if (rule !== undefined) {
        if (
          rule.IsOutlineRule() === outline &&
          (numbered ? rule.Get(0).IsEnumeration() : rule.Get(0).IsItemize())
        ) {
          listId.value = node.GetListId();
          return rule;
        }
        return undefined;
      }
      if (node.Len() > 0) {
        if (nonEmptyAllowed === 0) return undefined;
        nonEmptyAllowed = Math.max(-1, nonEmptyAllowed - 1);
      }
    }
    return undefined;
  }
  /** Returns numbering rules. @returns Rule table. */
  public GetNumRuleTable(): readonly SwNumRule[] {
    return this.listsManager.GetNumRuleTable();
  }

  /** Applies native numbering rule and list identities over an inclusive node range. @param range - Actual native range. @param rule - Source rule value. @param mode - Native operation flags. @param continuedListId - Optional existing list identity. @returns Explicit list identity applied, otherwise empty. */
  public SetNumRule(
    range: SwPaM,
    rule: SwNumRule,
    mode = SetNumRuleMode.Default,
    continuedListId = "",
  ): string {
    if (range.GetPoint().GetNode().GetNodes() !== this.nodes)
      throw new Error("Writer numbering range belongs to another node array.");
    return this.RunModelTransaction(
      /** Applies native rule ownership before paragraph attributes. @returns Applied explicit list identity. */ () => {
        let stored = this.FindNumRulePtr(rule.GetName());
        const created = stored === undefined;
        if (stored === undefined) {
          stored = this.listsManager.AddNumRule(rule);
          if (stored.GetDefaultListId().length === 0)
            stored.SetDefaultListId(
              this.listsManager.GetListForListStyle(stored.GetName()).GetListId(),
            );
        } else if (!stored.Equals(rule)) {
          stored.Assign(rule);
          this.listsManager.InvalidateAllLists();
        }
        let listId = "";
        if (!(mode & SetNumRuleMode.DontSetItem)) {
          if (mode & SetNumRuleMode.CreateNewList)
            listId = created
              ? stored.GetDefaultListId()
              : this.listsManager.CreateList(stored.GetName()).GetListId();
          else if (continuedListId.length > 0) listId = continuedListId;
        }
        const start = range.Start().GetNodeIndex(),
          end = range.End().GetNodeIndex();
        if (listId.length > 0) {
          for (let index = start; index <= end; index++) {
            const node = this.nodes.at(index);
            if (node instanceof SwTextNode)
              node.SetAttr(new SfxStringItem(RES_PARATR_LIST_ID, listId));
          }
        }
        let flags = mode;
        if (!range.HasMark()) {
          const node = range.GetPoint().GetNode();
          if (node instanceof SwTextNode) {
            const current = node.GetNumRule();
            if (current?.GetName() === stored.GetName()) {
              flags |= SetNumRuleMode.DontSetItem;
              if (!node.IsInList()) node.AddToList();
            } else if (
              current === undefined &&
              this.FindNumRulePtr(node.GetTextFormatColl().GetNumRule().GetValue()) === stored
            ) {
              node.ResetAttr(RES_PARATR_NUMRULE);
              flags |= SetNumRuleMode.DontSetItem;
            }
          }
        }
        if (!(flags & SetNumRuleMode.DontSetItem)) {
          for (let index = start; index <= end; index++) {
            const node = this.nodes.at(index);
            if (
              node instanceof SwTextNode &&
              (!(flags & SetNumRuleMode.DontSetIfAlreadyApplied) ||
                node.GetNumRule(true) !== stored)
            )
              node.SetAttr(new SwNumRuleItem(stored.GetName()));
          }
        }
        if (
          flags & SetNumRuleMode.ResetIndentAttrs &&
          stored.Get(0).GetPositionAndSpaceMode() === "label-alignment"
        ) {
          for (let index = start; index <= end; index++) {
            const node = this.nodes.at(index);
            if (node instanceof SwTextNode)
              node.ResetAttr([RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_MARGIN_RIGHT]);
          }
        }
        this.NotifyModelChange({ kind: "numbering-changed", ruleName: stored.GetName() });
        return listId;
      },
    );
  }

  /** Changes native restart only on a numbered text node with a different flag. @param position - Actual node position. @param flag - Requested restart state. @returns Whether a flag changed. */
  public SetNumRuleStart(position: SwPosition, flag: boolean): boolean {
    const node = position.GetNode();
    if (node.GetNodes() !== this.nodes)
      throw new Error("Writer numbering start belongs to another node array.");
    if (
      !(node instanceof SwTextNode) ||
      node.GetNumRule() === undefined ||
      node.IsListRestart() === flag
    )
      return false;
    return this.RunModelTransaction(
      /** Applies the represented document flag primitive. @returns True. */ () => {
        node.SetListRestart(flag);
        return true;
      },
    );
  }
  /** Sets native counted state independently of applying a list rule. @param range - Inclusive native range. @param counted - Requested count state. @returns Nothing. */
  public SetCounted(range: SwPaM, counted: boolean): void {
    if (range.GetPoint().GetNode().GetNodes() !== this.nodes)
      throw new Error("Writer numbering range belongs to another node array.");
    this.RunModelTransaction(
      /** Mutates only counted attributes on current text nodes. @returns Nothing. */ () => {
        for (
          let index = range.Start().GetNodeIndex();
          index <= range.End().GetNodeIndex();
          index++
        ) {
          const node = this.nodes.at(index);
          if (node instanceof SwTextNode) node.SetCountedInList(counted);
        }
      },
    );
  }

  /** Checks the represented numbering range before changing any level. @param range - Native selection. @param down - Demote direction. @returns Whether every numbered node can move. */
  public CanNumUpDown(range: SwPaM, down: boolean): boolean {
    const nodes = this.GetNumberedNodes(range);
    return (
      nodes.length > 0 &&
      nodes.every(
        /** Checks the actual list-tree level. @param node - Selected numbered node. @returns Whether within native limits. */
        (node) =>
          down ? node.GetActualListLevel() < WRITER_MAX_LIST_LEVEL : node.GetActualListLevel() > 0,
      )
    );
  }

  /** Changes only list levels in the actual selected node range, including cells. @param range - Native selection. @param down - Demote direction. @returns Whether the supported numbering range changed. */
  public NumUpDown(range: SwPaM, down: boolean): boolean {
    if (!this.CanNumUpDown(range, down)) return false;
    const nodes = this.GetNumberedNodes(range);
    return this.stateManager.RunModelTransaction(
      /** Applies one fully validated native range. @returns True after mutation. */
      () => {
        for (const node of nodes)
          node.SetAttrListLevel(node.GetActualListLevel() + (down ? 1 : -1));
        return true;
      },
    );
  }

  /** Moves outline levels through the source-owned docnum method body. @param range - Actual native selection. @param offset - Signed short displacement. @returns Native whole-range applicability. */
  public OutlineUpDown(range: SwPaM, offset: number): boolean {
    return moveOutlineLevels(this, range, offset);
  }

  /** Applies native numbering visibility or removes an already uncounted direct list. @param node - Actual document node. @param del - Hide numbering when true. @returns Whether numbering changed. */
  public NumOrNoNum(node: SwNode, del = false): boolean {
    if (node.GetNodes() !== this.nodes)
      throw new Error("Writer numbering node belongs to another node array.");
    if (
      !(node instanceof SwTextNode) ||
      node.GetNumRule() === undefined ||
      (!node.HasNumber() && !node.HasBullet())
    )
      return false;
    if (node.IsCountedInList() === del) {
      node.SetCountedInList(!del);
      return true;
    }
    if (
      del &&
      node.GetNumRule(false) !== undefined &&
      node.GetActualListLevel() >= 0 &&
      node.GetActualListLevel() <= WRITER_MAX_LIST_LEVEL
    ) {
      const point = new SwPosition(node, 0),
        range = new SwPaM(point);
      try {
        return this.DelNumRules(range);
      } finally {
        range.Dispose();
        point.Dispose();
      }
    }
    return false;
  }

  /** Removes numbering over native inclusive node coordinates. @param range - Actual Writer selection. @returns Whether numbered nodes were changed. */
  public DelNumRules(range: SwPaM): boolean {
    const nodes = this.GetNumberedNodes(range);
    if (nodes.length === 0) return false;
    return this.RunModelTransaction(
      /** Resets native numbering attributes without recreating a list DTO. @returns True after mutation. */
      () => {
        for (const node of nodes) {
          if (node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_NUMRULE, false) !== undefined)
            node.ResetAttr(RES_PARATR_NUMRULE);
          else node.SetAttr(new SwNumRuleItem(""));
          node.ResetAttr([
            RES_PARATR_LIST_ID,
            RES_PARATR_LIST_LEVEL,
            RES_PARATR_LIST_ISRESTART,
            RES_PARATR_LIST_RESTARTVALUE,
            RES_PARATR_LIST_ISCOUNTED,
          ]);
          if (node.GetTextFormatColl().IsAssignedToListLevelOfOutlineStyle())
            node.SetCountedInList(false);
        }
        return true;
      },
    );
  }

  /** Selects native text owners with rules across inclusive SwNodes coordinates. @param range - Native selection. @returns Selected numbered nodes. */
  private GetNumberedNodes(range: SwPaM): readonly SwTextNode[] {
    // SwPaM validates both endpoints belong to the same node array.
    if (range.GetPoint().GetNode().GetNodes() !== this.nodes)
      throw new Error("Writer numbering range belongs to another node array.");
    const nodes: SwTextNode[] = [];
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = this.nodes.at(index);
      if (node instanceof SwTextNode && node.GetNumRule() !== undefined) nodes.push(node);
    }
    return nodes;
  }
  /** Finds or creates a compatible numbering rule. @param name - Rule name. @param kind - Rule family. @param level - Checked level. @returns Document rule. */
  public EnsureNumRule(name: string, kind: "bullet" | "numbered", level = 0): SwNumRule {
    return this.listsManager.EnsureNumRule(name, kind, level);
  }
  /** Returns body text nodes. @returns Ordered body content. */
  public get paragraphs(): readonly SwTextNode[] {
    return this.nodes.getTextNodes();
  }
  /** Returns canonical tables in direct body order. @returns Table graphs. */
  public GetTables(): readonly SwTable[] {
    return this.nodes
      .getBodyContent()
      .flatMap(
        /** Projects a body table node. @param node - Body block. @returns Zero or one table. */ (
          node,
        ) => (node instanceof SwTableNode ? [node.GetTable()] : []),
      );
  }
  /** Applies a complete native vertical box item. @param cursor - Actual cursor. @param value - Full item. @param cursorState - Optional live shell history state. @returns Whether admitted. */
  public SetBoxAttr(
    cursor: SwCursor,
    value: SwFormatVertOrient,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return SetSwBoxAttr(this, cursor, value, cursorState);
  }
  /** Reads a cloned complete common box item. @param cursor - Actual cursor. @returns Common item or no item. */
  public static GetBoxAttr(cursor: SwCursor): SwFormatVertOrient | undefined {
    return GetSwBoxAttr(cursor);
  }
  /** Applies native cell alignment with position0 and PRINT_AREA relation. @param cursor - Actual cursor. @param align - Native orientation. @param cursorState - Optional live history state. @returns Whether admitted. */
  public SetBoxAlign(cursor: SwCursor, align: number, cursorState?: SwUndoCursorState): boolean {
    return this.SetBoxAttr(cursor, new SwFormatVertOrient(0, align), cursorState);
  }
  /** Reads common native cell alignment. @param cursor - Actual cursor. @returns Orientation or native mixed/absent65535. */
  public static GetBoxAlign(cursor: SwCursor): number {
    return GetSwBoxAlign(cursor);
  }

  /** Applies native table separators and publishes document-owned attribute history. @param table - Actual table. @param next - Requested separator geometry. @param previous - Original geometry. @param start - Actual current box. @param currentRowOnly - Independent row graph request. @param cursorState - Optional shell cursor attributes. @returns Whether admitted. */
  public SetTabCols(
    table: SwTable,
    next: SwTabCols,
    previous: SwTabCols,
    start: SwTableBox,
    currentRowOnly: boolean,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return SetSwTabCols(this, table, next, previous, start, currentRowOnly, cursorState);
  }
  /** Inserts native counted flat rows and publishes one document-owned history record. @param boxes - Actual selected boxes. @param count - Native row count. @param behind - Insert after the selected edge. @param insertDummy - Native tracked-change policy. @param cursorState - Original browser cursor attributes. @param afterCursor - Optional unchanged live selection after insertion. @returns Whether admitted. */
  public InsertRow(
    boxes: readonly SwTableBox[],
    count = 1,
    behind = true,
    insertDummy = true,
    cursorState?: SwUndoCursorState,
    afterCursor?: SwUndoCursorState,
  ): boolean {
    return InsertSwTableRows(this, boxes, count, behind, insertDummy, cursorState, afterCursor);
  }

  /** Inserts native columns and publishes one already-executed document history action. @param boxes - Expanded actual column selection. @param count - Native count. @param behind - Trailing edge. @param insertDummy - Redline policy. @param cursorState - Optional shell attributes. @param afterCursor - Optional preserved live selection. @returns Whether inserted. */
  public InsertCol(
    boxes: readonly SwTableBox[],
    count = 1,
    behind = true,
    insertDummy = true,
    cursorState?: SwUndoCursorState,
    afterCursor?: SwUndoCursorState,
  ): boolean {
    return InsertSwTableColumns(this, boxes, count, behind, insertDummy, cursorState, afterCursor);
  }

  /** Resolves native first-unused table naming. @returns Unoccupied table name. */
  public GetUniqueTableName(): string {
    const names = this.GetTables().map(
      /** Reads an actual frame name. @param table - Native table. @returns Name. */ (table) =>
        table.GetName(),
    );
    let number = 1;
    while (names.includes("Table" + number)) number++;
    return "Table" + number;
  }
  /** Constructs represented flat table geometry and styles before an actual body position from ndtbl.cxx. @param options - Native flags and repetition. @param position - Body insertion position. @param rows - Row count. @param columns - Column count. @param name - Requested frame name. @param boxFormat - Existing browser autoformat attributes. @returns Native table. */
  public InsertTable(
    options: SwInsertTableOptions,
    position: SwPosition,
    rows: number,
    columns: number,
    name = "",
    boxFormat?: SwTableBoxFormatValue,
  ): SwTable {
    const node = position.GetNode();
    if (
      !(node instanceof SwTextNode) ||
      !this.paragraphs.includes(node) ||
      !Number.isInteger(rows) ||
      rows < 1 ||
      rows > 65535 ||
      !Number.isInteger(columns) ||
      columns < 1 ||
      columns > 65535
    )
      throw new Error(
        "Writer insertion requires body text and positive unsigned table dimensions.",
      );
    const header = Boolean(options.mnInsMode & SwInsertTableFlags.Headline),
      borders = Boolean(options.mnInsMode & SwInsertTableFlags.DefaultBorder),
      repeat = header ? options.mnRowsToRepeat & 0xffff : 0,
      width = Math.floor(65535 / columns) * columns;
    if (
      name === "" ||
      this.GetTables().some(
        /** Checks the actual native name set. @param table - Existing owner. @returns Collision. */ (
          table,
        ) => table.GetName() === name,
      )
    )
      name = this.GetUniqueTableName();
    const table = this.nodes.InsertTable(node, name, {
      width,
      horiOrient: HoriOrientation.FULL,
      headerRows: header ? Math.max(1, repeat) : 0,
      repeatHeaderRows: repeat !== 0,
      layoutSplit: Boolean(options.mnInsMode & SwInsertTableFlags.SplitLayout),
    });
    for (let column = 0; column < columns; column++) table.AddColumnWidth(width / columns);
    const headStyle = header && (rows !== 1 || !borders) ? "table-heading" : "table-contents";
    for (let row = 0; row < rows; row++) {
      const line = this.nodes.AppendTableRow(
        table,
        columns,
        {},
        Array.from(
          { length: columns },
          /** Creates independent represented box attributes. @returns Box format. */ () =>
            boxFormat === undefined ? { box: createWriterTableBoxItem(borders) } : { ...boxFormat },
        ),
      );
      for (const box of line.GetTabBoxes())
        for (const paragraph of box.GetParagraphs())
          paragraph.ChgFormatColl(
            this.GetTextFormatColl(row === 0 || row < repeat ? headStyle : "table-contents"),
          );
    }
    return table;
  }
  /** Runs one semantic model transaction. @param mutation - Mutation callback. @returns Callback result. */
  public RunModelTransaction<Result>(mutation: () => Result): Result {
    return this.stateManager.RunModelTransaction(mutation);
  }
  /** Disposes the document notification graph. @returns Nothing. */
  public Dispose(): void {
    this.mbDtor = true;
    for (const node of this.nodes.entries()) if (node instanceof SwTextNode) node.RemoveFromList();
    this.undoManager.Dispose();
    this.stateManager.Dispose();
  }
}

/** Creates a Writer document with one canonical body text node. @returns New document. */
export function createWriterDocument(): SwDoc {
  return new SwDoc();
}
