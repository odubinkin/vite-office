/** @fileoverview Implements the Writer SwDoc aggregate from pinned LibreOffice `sw/inc/doc.hxx` and `sw/source/core/doc/docnew.cxx`. */
import {
  MakePageDesc,
  DelPageDesc,
  ChgPageDesc,
  IsSquaredPageMode,
  SetDefaultPageMode,
} from "./docdesc";
import { CopyTextColl, ChgFormat, SetDefault, ForEachParaAtrTabStopItem } from "./docfmt";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SwCharFormat } from "../../../inc/charfmt";
import { SwGrfFormatColl } from "../../../inc/fmtcol";
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
  SetSwRowsToRepeat,
  InsertSwTableColumns,
  InsertSwTableRows,
} from "../docnode/ndtbl";
import {
  GetSwCursorRowSplit,
  SetSwRowSplit,
  GetSwRowHeight,
  SetSwRowHeight,
  BalanceSwRowHeight,
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
import type { SwInsertTableOptions } from "../../../inc/itabenum";
import { InsertTable as InsertNativeTable } from "../docnode/ndtbl";
import { DocumentContentOperationsManager } from "./DocumentContentOperationsManager";
import { DocumentMarkAccess } from "./docbm";
import { DocumentListItemsManager } from "./DocumentListItemsManager";
import { DocumentListsManager } from "./DocumentListsManager";
import { DocumentSettingManager } from "./DocumentSettingManager";
import { DocumentStateManager } from "./DocumentStateManager";
import { DocumentStylePoolManager } from "./DocumentStylePoolManager";
import { createStyleManager } from "./swstylemanager";
import type { IStyleAccess } from "../../../inc/istyleaccess";
import { SwTextFormatColl, type WriterParagraphStyle } from "./fmtcol";
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
import { OutlineUpDown as moveOutlineLevels, GetUniqueNumRuleName } from "./docnum";
import { moveLeftMargin, InsertPoolItem, CopyCharFormat } from "./docfmt";
import { SwUndoMoveLeftMargin } from "../undo/unattr";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwAtomicModelHint } from "../../../inc/hints";
import { UndoManager } from "../undo/docundo";
import type { DefaultFontDevice } from "./default-font";
import {
  createDefaultWriterPageDescriptor,
  SwPageDesc,
  type WriterPageDescriptorValue,
} from "../layout/pagedesc";
/** Construction policy for locale/device-dependent Writer defaults. */
export interface SwDocOptions {
  readonly createInitialTextNode?: boolean;
  readonly defaultFontDevice?: DefaultFontDevice;
  readonly locale?: string;
}
import { SetAttrMode } from "../../../inc/swtypes";
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
  /** Applies native import/API item deltas through docfmt. @param range - Registered range. @param item - Actual pool item. @returns Nothing.  @param mode - Native operation input. */
  public InsertPoolItem(
    range: SwPaM,
    item: import("../../../../svl/source/items/poolitem").SfxPoolItem,
    mode = SetAttrMode.DEFAULT,
  ): void {
    InsertPoolItem(this, range, item, mode);
  }
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
  /** Balances registered source row-frame areas through native row attribute/history ownership. @param cursor - Original cursor. @param testOnly - Read-only admission. @param optimize - Average rather than maximum. @param cursorState - Original shell state. @returns Whether multiple rows are admitted. */
  public BalanceRowHeight(
    cursor: SwCursor,
    testOnly: boolean,
    optimize = false,
    cursorState?: SwUndoCursorState,
  ): boolean {
    return BalanceSwRowHeight(this, cursor, testOnly, optimize, cursorState);
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
  private mbInXMLImport = false;
  /** Reads the native XML-import portion-building policy. @returns Import flag. */
  public IsInXMLImport(): boolean {
    return this.mbInXMLImport;
  }
  /** Sets the original XML-import flag around its owning import. @param importing - New flag. @returns Nothing. */
  public SetInXMLImport(importing: boolean): void {
    this.mbInXMLImport = importing;
  }
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
  private readonly defaultCharFormat: SwCharFormat;
  private readonly defaultGrfFormatColl: SwGrfFormatColl;
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
    this.attrPool = new SwAttrPool(this);
    this.defaultCharFormat = new SwCharFormat(this.attrPool, "Character style");
    this.defaultGrfFormatColl = new SwGrfFormatColl(this.attrPool, "Graphikformatvorlage");
    this.defaultFrameFormat = new SwFrameFormat(this.attrPool, "Default Frame Format");
    this.pageDescs = [createDefaultWriterPageDescriptor(this.locale, this)];
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
  /** Registers one package font resource by path; distinct declaration face names may alias the same resource, as in native fontFilesMap. @param font - Declared face and package path. @returns Nothing. */
  public RegisterEmbeddedFont(font: WriterEmbeddedFont): void {
    const existing = this.embeddedFonts.get(font.path);
    if (existing !== undefined) {
      if (
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
  /** Creates a native document-owned page descriptor. @param name - Unique style name. @param source - Optional native copy. @returns Descriptor. */
  public MakePageDesc(name: string, source?: SwPageDesc): SwPageDesc {
    return MakePageDesc(this, this.pageDescs, name, source);
  }
  /** Deletes a non-default descriptor through native page ownership. @param descriptor - Style name or index. @returns Whether deleted. */
  public DelPageDesc(descriptor: number | string): boolean {
    return DelPageDesc(this, this.pageDescs, descriptor);
  }
  /** Applies the existing browser geometry ingress to a native descriptor. @param value - Geometry. @param target - Name or index. @returns Whether changed. */
  public ChgPageDesc(value: WriterPageDescriptorValue, target: number | string = 0): boolean {
    return ChgPageDesc(this, value, target);
  }
  /** Native effective document default. @param which - Attribute identity. @returns Pool-owned item. */
  public GetDefault(which: number): SfxPoolItem {
    return this.attrPool.GetUserOrPoolDefaultItem(which);
  }
  /** Native default-attribute mutation and notification ownership. @param value - Item or set. @returns Nothing. */
  public SetDefault(value: SfxPoolItem | SfxItemSet): void {
    SetDefault(this, value);
  }
  /** Original document squared-page-mode predicate. @returns Mode. */
  public IsSquaredPageMode(): boolean {
    return IsSquaredPageMode(this);
  }
  /** Original document-wide grid-mode mutation. @param squared - Mode. @returns Nothing. */
  public SetDefaultPageMode(squared: boolean): void {
    SetDefaultPageMode(this, squared);
  }
  /** Native node/style traversal for authored tab-stop items. @param callback - Original early-stop visitor. @returns Nothing. */
  public ForEachParaAtrTabStopItem(callback: (item: SvxTabStopItem) => boolean): void {
    ForEachParaAtrTabStopItem(this, callback);
  }
  /** Returns the injected output-device font resolver. @returns Device or undefined. */
  public GetDefaultFontDevice(): DefaultFontDevice | undefined {
    return this.defaultFontDevice;
  }
  /** Native default character format. @returns Document-owned format. */
  public GetDfltCharFormat(): SwCharFormat {
    return this.defaultCharFormat;
  }
  /** Returns the native character-format table. @returns Character owners. */
  public GetCharFormats(): readonly SwCharFormat[] {
    return this.stylePoolManager.GetCharFormats();
  }
  /** Materializes a native pooled character style. @param id - Original pool ID. @returns Character owner or undefined. */
  public GetCharFormatFromPool(id: number): SwCharFormat | undefined {
    return this.stylePoolManager.GetCharFormatFromPool(id);
  }
  /** Finds the first native character style by its UI name. @param name - UI name. @returns Owner. */
  public FindCharFormatByName(name: string): SwCharFormat | undefined {
    return this.GetCharFormats().find(
      /** Checks actual UI identity. @param format - Owner. @returns Match. */ (format) =>
        format.GetName() === name,
    );
  }
  /** Creates a native named character style. @param name - UI name. @param parent - Optional original parent. @returns Owned style. */
  public MakeCharFormat(name: string, parent: SwCharFormat | undefined): SwCharFormat {
    const format = this.stylePoolManager.MakeCharFormat(name, parent);
    this.stateManager.SetModified();
    return format;
  }
  /** Copies an actual source character format with its native name/parent policy. @param source - Actual source. @returns Destination-owned style. */
  public CopyCharFormat(source: SwCharFormat): SwCharFormat {
    return CopyCharFormat(this, source);
  }
  /** Native default graphic collection. @returns Document-owned collection. */
  public GetDfltGrfFormatColl(): SwGrfFormatColl {
    return this.defaultGrfFormatColl;
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
  /** Returns the actual style-pool owner through Writer's native access boundary. @returns Style manager. */
  public getIDocumentStylePoolAccess(): DocumentStylePoolManager {
    return this.stylePoolManager;
  }
  /** Appends one original range undo before applying typed paragraph attributes. @param range - Native selected range. @param right - Increase direction. @param modulus - Native snapping policy. @param state - Optional browser shell cursor adjunct. @returns Nothing. */
  public MoveLeftMargin(
    range: SwPaM,
    right: boolean,
    modulus: boolean,
    state?: SwUndoCursorState,
  ): void {
    const action = this.GetUndoManager().DoesUndo()
      ? new SwUndoMoveLeftMargin(range, right, modulus, state)
      : undefined;
    if (action !== undefined) this.GetUndoManager().AddUndoAction(action);
    moveLeftMargin(this, range, right, modulus, action?.GetHistory());
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
  public MakeTextFormatColl(
    name: string,
    parent?: SwTextFormatColl,
    id?: string,
  ): SwTextFormatColl {
    let identity = id ?? name;
    if (id === undefined) {
      let suffix = 1;
      while (this.FindTextFormatColl(identity) !== undefined) identity = `${name}:${suffix++}`;
    }
    const collection = this.stylePoolManager.AddTextFormatColl(
      new SwTextFormatColl(this.attrPool, identity, name, parent),
    );
    this.NotifyModelChange({ kind: "format-inheritance-changed", formatId: name });
    return collection;
  }

  /** Changes represented paragraph-format attributes with original ChgFormat history ownership. @param collection - Actual named format. @param set - Incoming direct items. @returns Nothing. */
  public ChgFormat(collection: SwTextFormatColl, set: SfxItemSet): void {
    ChgFormat(this, collection, set);
  }

  /** Removes a named collection and corrects follow links before original format death. Used by creation undo with recording suppressed. @param collection - Owned non-default collection. @returns Nothing. */
  public DelTextFormatColl(collection: SwTextFormatColl): void {
    if (collection === this.GetDfltTextFormatColl()) return;
    this.stylePoolManager.RemoveTextFormatColl(collection);
    for (const owner of this.GetTextFormatColls())
      if (owner.GetNextTextFormatColl() === collection) owner.SetNextTextFormatColl(owner);
    collection.DisposeModify();
    this.NotifyModelChange({ kind: "format-inheritance-changed", formatId: collection.GetName() });
  }

  /** Copies a paragraph style through the original docfmt owner. @param source - Source collection. @returns Destination collection. */
  public CopyTextColl(source: SwTextFormatColl): SwTextFormatColl {
    return CopyTextColl(this, source);
  }
  /** Adds a numbering rule. @param rule - Source rule. @returns Stored rule. */
  public GetUniqueNumRuleName(): string {
    return GetUniqueNumRuleName(this);
  }

  /** Stores an independent native numbering rule. @param rule - Source rule. @returns Document-owned rule. */
  public AddNumRule(rule: SwNumRule): SwNumRule {
    const stored = this.listsManager.AddNumRule(rule);
    const list = this.listsManager.GetListForListStyle(stored.GetName());
    if (!stored.GetDefaultListId()) stored.SetDefaultListId(list.GetListId());
    return stored;
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

  /** Sets the original table headline count through native document history and notification. @param table - Original native owner. @param count - Requested uint16 count. @returns Whether changed. */
  public SetRowsToRepeat(table: SwTable, count: number): boolean {
    return SetSwRowsToRepeat(this, table, count);
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
    return InsertNativeTable(this, options, position, rows, columns, name, boxFormat);
  }

  /** Runs one semantic model transaction. @param mutation - Mutation callback. @returns Callback result. */
  public RunModelTransaction<Result>(mutation: () => Result): Result {
    return this.stateManager.RunModelTransaction(mutation);
  }
  /** Disposes the document notification graph. @returns Nothing. */
  public Dispose(): void {
    this.mbDtor = true;
    for (const page of this.pageDescs) page.DisposeModify();
    this.pageDescs.length = 0;
    for (const node of this.nodes.entries()) if (node instanceof SwTextNode) node.RemoveFromList();
    this.markAccess.Dispose();
    this.undoManager.Dispose();
    this.defaultGrfFormatColl.DisposeModify();
    for (const format of [...this.GetCharFormats()].reverse()) format.DisposeModify();
    this.stateManager.Dispose();
  }
}

/** Creates a Writer document with one canonical body text node. @returns New document. */
export function createWriterDocument(): SwDoc {
  return new SwDoc();
}
