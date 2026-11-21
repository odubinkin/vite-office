/** @fileoverview Writer view search dispatch over the native model cursor and replacement history. */
import type { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import {
  SvtSearchOptions,
  type SearchOptionsConfiguration,
} from "../../../../unotools/source/config/searchopt";
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../../i18nutil/inc/transliteration";
import { ABSOLUTE, APPROXIMATE } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import {
  LEV_RELAXED,
  NORM_WORD_ONLY,
  REG_NOT_BEGINOFLINE,
  REG_NOT_ENDOFLINE,
} from "../../../../offapi/com/sun/star/util/SearchFlags";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SearchOptionFlags } from "../../../../svl/inc/srchdefs";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { GetSettings } from "../../../../vcl/source/app/svapp";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { RES_PROTECT } from "../../../inc/hintids";
import { FindFormat } from "../../core/crsr/findcoll";
import {
  getWriterMaterializedParagraphStyleDefinition,
  WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL,
} from "../../../inc/poolfmt";
import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import { SwCursor, type SwSearchNodeFilter } from "../../core/crsr/swcrsr";
import { PopMode } from "../../core/crsr/trvltbl";
import type { SwDoc } from "../../core/doc/doc";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
import type { SwNode, SwStartNode } from "../../core/docnode/node";
import { setTextFormatCollAtShell } from "../../core/edit/edfcol";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { CollectTextFlyFrames } from "../../core/layout/flycnt";
import type { SwTableBox } from "../../core/table/swtable-boxline";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { findParagraphStyle } from "../app/docst";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import { SwASCWriter } from "../../filter/ascii/wrtasc";

/** Native options accepted by the Similarity Search dialog. */
export interface WriterSimilarityOptions {
  readonly changedChars: number;
  readonly insertedChars: number;
  readonly deletedChars: number;
  readonly relaxed: boolean;
}

/** The browser-supported values carried by the native search item. */
export interface WriterSearchItem {
  readonly search: string;
  readonly replacement: string;
  readonly matchCase: boolean;
  readonly matchDiacritics: boolean;
  readonly matchKashida: boolean;
  readonly matchCharacterWidth: boolean;
  readonly useAsianOptions: boolean;
  readonly japaneseFlags: number;
  readonly wholeWords: boolean;
  readonly similaritySearch: boolean;
  readonly styleSearch: boolean;
  readonly searchStyle: string;
  readonly replaceStyle: string;
  readonly similarity: WriterSimilarityOptions;
  readonly selection: boolean;
  readonly searchOptions?: SearchOptions2;
  readonly searchInNotes?: boolean;
}

/** The represented SvxSearchItem value exchanged by Writer search slots. */
export interface WriterSearchSlotItem extends WriterSearchItem {
  readonly command: SvxSearchCmd;
  readonly backward: boolean;
}

/** Arguments of FID_SEARCH_NOW. */
export interface WriterExecuteSearchArguments {
  readonly SearchItem: WriterSearchSlotItem;
  readonly Quiet?: boolean;
  readonly UseAttrItemList?: boolean;
}

/** Search label state returned by SwView search commands. */
export interface WriterSearchResult {
  readonly matches: number;
  readonly wrapped: boolean;
}

/** State published by SwView search commands to the open search controls and document view. */
export type WriterSearchFeedback =
  | {
      readonly kind: "result";
      readonly result: WriterSearchResult;
      readonly command: SvxSearchCmd;
      readonly backward: boolean;
    }
  | { readonly kind: "error"; readonly message: string };

/** Converts the browser's UTF-16 string to the model's counted value. @param value - Browser text. @returns Native string. */
function toOUString(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let index = 0; index < value.length; index++) units[index] = value.charCodeAt(index);
  return new OUString(units, units.length);
}

/** Admits body paragraphs, connected text frames, and active page stories. @param document - Current native model. @param pageStories - Visible page-story sections. @returns Admission for the represented profile. */
function createSearchNodeFilter(
  document: SwDoc,
  pageStories: ReadonlySet<SwStartNode>,
): SwSearchNodeFilter {
  const bodyStart = document.nodes.GetEndOfContent().StartOfSectionNode().GetIndex();
  const frames = CollectTextFlyFrames(document);
  return /** Follows the native fly chain to the editable body. @param node - Candidate paragraph. @returns Whether it is represented. */ (
    node,
  ) => {
    if (node.GetIndex() > bodyStart) return true;
    const pageStory =
      node.FindStartNodeByType(SwStartNodeType.SwHeaderStartNode) ??
      node.FindStartNodeByType(SwStartNodeType.SwFooterStartNode);
    if (pageStory !== null) return pageStories.has(pageStory);
    const visited = new Set<SwTextNode>();
    let owner = node;
    while (owner.GetIndex() <= bodyStart) {
      if (visited.has(owner)) return false;
      visited.add(owner);
      const fly = owner.GetFlyFormat();
      const anchor = fly?.GetAnchor().GetAnchorNode()?.GetTextNode();
      if (
        !anchor ||
        !frames
          .get(anchor)
          ?.some(
            /** Checks the native layout's represented text-frame anchors. @param entry - Frame hosted by this anchor. @returns Whether it belongs to the candidate. */ (
              entry,
            ) => entry.format === fly,
          )
      )
        return false;
      owner = anchor;
    }
    return true;
  };
}

/** Reads a represented frame's inherited content-protection bit. @param format - Native layout format. @returns Whether its content is protected. */
function isContentProtected(format: SwFrameFormat | undefined): boolean {
  return (
    (format?.GetAttrSet().Get(RES_PROTECT) as SvxProtectItem | undefined)?.IsContentProtected() ===
    true
  );
}

/** Follows the native containing table formats up to an enclosing cell or story. @param node - Text or nested table owner. @returns Whether a layout ancestor protects the content. */
function isInProtectedTable(node: SwNode): boolean {
  for (let box = node.GetTableBox(); box !== null;) {
    const table = box.GetStartNode().FindTableNode();
    if (table === null) return false;
    if (box.getRowSpan() < 1 || isContentProtected(table.GetTable().GetFrameFormat())) return true;
    for (let parent: SwTableBox | null = box; parent !== null;) {
      const line = parent.GetUpper();
      if (isContentProtected(parent.GetFrameFormat()) || isContentProtected(line?.GetFrameFormat()))
        return true;
      parent = line?.GetUpper() ?? null;
    }
    box = table.GetTableBox();
  }
  return false;
}

/** Applies the represented SwFrame::IsProtected owners to an editable search result. @param node - Result endpoint. @returns Whether the content admits replacement. */
function canReplaceAtNode(node: SwNode): boolean {
  const seen = new Set<SwNode>();
  for (let owner: SwNode | undefined = node; owner !== undefined;) {
    if (seen.has(owner)) return false;
    seen.add(owner);
    const fly = owner.GetFlyFormat();
    if (isInProtectedTable(owner) || isContentProtected(fly)) return false;
    owner = fly?.GetAnchor().GetAnchorNode() ?? undefined;
  }
  return true;
}

/** Drops temporary cursor owners left by a non-selection search. @param cursor - Working search ring. @returns Nothing. */
function disposeSearchRing(cursor: SwCursor): void {
  while (cursor.GetNext() !== cursor) cursor.GetNext().Dispose();
}

/** Copies the live cursor and any selected ranges into the working search ring. @param cursor - Displayed text cursor. @param inSelection - Whether to search the selection ring. @returns Owned working cursor. */
function createSearchCursor(cursor: SwCursor, inSelection: boolean): SwCursor {
  const search = new SwCursor(cursor.GetPoint(), cursor.HasMark() ? cursor.GetMark() : undefined);
  if (inSelection) {
    for (let range = cursor.GetNext(); range !== cursor; range = range.GetNext())
      new SwCursor(range.GetPoint(), range.HasMark() ? range.GetMark() : undefined, search);
  }
  return search;
}

/** Holds the search item and executes the represented SwView::ExecSearch branches. */
export class SwViewSearch {
  private item: WriterSearchItem = {
    search: "",
    replacement: "",
    matchCase: false,
    matchDiacritics: true,
    matchKashida: false,
    matchCharacterWidth: false,
    useAsianOptions: false,
    japaneseFlags: 0,
    wholeWords: false,
    similaritySearch: false,
    styleSearch: false,
    searchStyle: "",
    replaceStyle: "",
    similarity: { changedChars: 2, insertedChars: 2, deletedChars: 2, relaxed: true },
    selection: false,
  };
  private pageStories: ReadonlySet<SwStartNode> = new Set();
  private feedback: WriterSearchFeedback | undefined;
  private readonly feedbackListeners = new Set<() => void>();
  private lastCommand: SvxSearchCmd | undefined;
  private searchInOther = false;
  private searchDialogJustOpened = false;
  private lastRequest:
    { item: WriterSearchItem; command: SvxSearchCmd; backward: boolean } | undefined;

  /** Connects search to the writing shell and user search properties. @param shell - Persistent writing shell. @param configuration - User search configuration. @returns Search owner. */
  public constructor(
    private readonly shell: SwWrtShell,
    public readonly configuration?: SearchOptionsConfiguration,
  ) {
    const options = new SvtSearchOptions(configuration);
    this.item = {
      ...this.item,
      matchCase: options.GetFlag("IsMatchCase"),
      matchDiacritics: !options.GetFlag("IsIgnoreDiacritics_CTL"),
      matchKashida: !options.GetFlag("IsIgnoreKashida_CTL"),
      matchCharacterWidth: !options.GetFlag("Japanese/IsMatchFullHalfWidthForms"),
      useAsianOptions: options.GetFlag("IsUseAsianOptions"),
      japaneseFlags: options.GetJapaneseTransliterationFlags() & ~TransliterationFlags.IGNORE_WIDTH,
      wholeWords: options.GetFlag("IsWholeWordsOnly"),
      similaritySearch: options.GetFlag("IsSimilaritySearch"),
      styleSearch: options.GetFlag("IsSearchForStyles"),
    };
  }

  /** Registers the current device layout's page-story model owners. @param sections - Visible story roots. @returns Registration cleanup. */
  public RegisterPageStories(sections: ReadonlySet<SwStartNode>): () => void {
    this.pageStories = sections;
    return /** Releases the active device registration. @returns Nothing. */ () => {
      if (this.pageStories === sections) this.pageStories = new Set();
    };
  }

  /** Returns the current search item for the Find toolbar and dialog. @returns Current settings. */
  public GetSearchItem(): WriterSearchItem {
    return this.item;
  }

  /** Reads the latest stable search feedback snapshot. @returns Search feedback or an empty label. */
  public readonly GetFeedback =
    /** Borrows the completed search result. @returns Current feedback. */ () => this.feedback;

  /** Observes shared search feedback. @param listener - View callback. @returns Unsubscribe callback. */
  public readonly SubscribeFeedback =
    /** Registers one view observer. @param listener - View callback. @returns Unsubscribe callback. */ (
      listener: () => void,
    ): (() => void) => {
      this.feedbackListeners.add(listener);
      return /** Removes this observer. @returns Nothing. */ () => {
        this.feedbackListeners.delete(listener);
      };
    };

  /** Clears the shared search label when the query changes. @returns Nothing. */
  public ClearFeedback(): void {
    this.PublishFeedback(undefined);
  }

  /** Updates feedback after the native cursor has been committed. @param feedback - State to publish. @returns Nothing. */
  private PublishFeedback(feedback: WriterSearchFeedback | undefined): void {
    if (this.feedback === feedback) return;
    this.feedback = feedback;
    for (const listener of this.feedbackListeners) listener();
  }

  /** Supplies the used search collections and all paragraph style choices for replacement. @returns Native style lists for the dialog. */
  public GetParagraphStyles(): {
    search: readonly { id: string; name: string }[];
    replace: readonly { id: string; name: string }[];
  } {
    const doc = this.shell.GetDoc();
    const all = new Map<string, string>();
    const used: { id: string; name: string }[] = [];
    for (const definition of WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL)
      all.set(definition.id, SwStyleNameMapper.GetUIName(definition.poolId, definition.name));
    for (const style of doc.GetTextFormatColls()) {
      const name = style.GetName();
      const isUsed = doc.IsUsed(style);
      // AppendStyleList admits favourite built-ins independently of visibility.
      if (style.IsHidden() && !isUsed && !(all.has(style.id) && style.IsFavourite()))
        all.delete(style.id);
      else all.set(style.id, name);
      if (isUsed) used.push({ id: style.id, name });
    }
    const replace = Array.from(
      all,
      /** Detaches the available native style identity and name. @param entry - Style entry. @returns Dialog entry. */ ([
        id,
        name,
      ]) => ({ id, name }),
    );
    return { search: used, replace };
  }

  /** Resolves a search template as native GetParaStyle with GETSTYLE_CREATESOME. @param name - Browser identity or Writer UI name. @returns Document-owned paragraph collection. */
  private GetParaStyle(name: string): SwTextFormatColl | undefined {
    const document = this.shell.GetDoc();
    const owned = document.FindTextFormatColl(name);
    if (owned !== undefined) return owned;
    const id =
      findParagraphStyle(document, name) ?? getWriterMaterializedParagraphStyleDefinition(name)?.id;
    return id === undefined ? undefined : document.GetTextFormatColl(id);
  }

  /** Reflects native text and table selection availability for the search dialog. @returns Whether a document selection exists. */
  public HasSelection(): boolean {
    const cursor = this.shell.GetCursor_();
    return (
      this.shell.HasBoxSelection() ||
      (cursor.HasMark() && cursor.Start().compare(cursor.End()) !== 0)
    );
  }

  /** Reports the native SID_SEARCH_OPTIONS mask for the attached Writer view. @returns Available search options. */
  public GetSearchOptions(): SearchOptionFlags {
    return this.CanReplace()
      ? SearchOptionFlags.ALL
      : SearchOptionFlags.ALL & ~(SearchOptionFlags.REPLACE | SearchOptionFlags.REPLACE_ALL);
  }

  /** Shares the read-only decision with the search dispatcher. @returns Whether replacing is allowed. */
  private CanReplace(): boolean {
    return !this.shell.GetViewOptions().IsReadonly();
  }

  /** Marks the next SID_SEARCH_ITEM state query as initialization of the new dialog. @returns Nothing. */
  public SearchOn(): void {
    this.searchDialogJustOpened = true;
  }

  /** Returns SID_SEARCH_ITEM state and seeds the newly opened dialog from the selection. @returns Current search properties. */
  public StateSearch(): WriterSearchSlotItem {
    if (this.searchDialogJustOpened) {
      this.searchDialogJustOpened = false;
      const cursor = this.shell.GetCursor();
      const text =
        cursor.IsMultiSelection() || this.shell.IsTableMode() ? "" : this.shell.GetSelText();
      const hasSelection = this.HasSelection();
      const selection = text.length === 0 && hasSelection;
      const options = new SvtSearchOptions(this.configuration);
      this.item = {
        ...this.item,
        search: text || this.item.search,
        selection,
        ...(this.configuration === undefined
          ? {}
          : {
              matchDiacritics: !options.GetFlag("IsIgnoreDiacritics_CTL"),
              matchKashida: !options.GetFlag("IsIgnoreKashida_CTL"),
            }),
      };
      if (this.lastRequest !== undefined && hasSelection)
        this.lastRequest = {
          ...this.lastRequest,
          item: {
            ...this.lastRequest.item,
            search: text || this.lastRequest.item.search,
            selection,
          },
        };
    }
    return {
      ...this.item,
      similarity: { ...this.item.similarity },
      command: this.lastRequest?.command ?? SvxSearchCmd.FIND,
      backward:
        this.lastRequest?.backward ??
        new SvtSearchOptions(this.configuration).GetFlag("IsBackwards"),
    };
  }

  /** Reads the Find Bar's selection text for its single-line entry. @returns Browser search text. */
  public GetFindBarSeed(): string {
    return this.GetFindBarSelection(this.shell.GetCursor())
      .replaceAll("\r", "")
      .replaceAll("\n", "");
  }

  /** Reads the represented UNO view-cursor text using the native selection writer. @param cursor - Native editing ring. @returns Text to seed the Find Bar. */
  private GetFindBarSelection(cursor: SwCursor): string {
    if (!cursor.HasMark() || this.shell.IsTableMode()) return "";
    const writer = new SwASCWriter();
    writer.m_bASCII_NoLastLineEnd = true;
    writer.m_bExportParagraphNumbering = false;
    let text = "";
    for (const range of cursor.GetRingContainer()) {
      if (range.HasMark() && range.Start().compare(range.End()) !== 0) text += writer.Write(range);
    }
    return text;
  }

  /** Stores the dialog item and commits the properties saved by the source dialog. @param properties - Dispatched search item. @param closing - Whether the dialog is closing. @returns Nothing. */
  public SetSearchProperties(properties: WriterSearchSlotItem, closing = false): void {
    const { command, backward, ...item } = properties;
    this.item = { ...item, similarity: { ...item.similarity } };
    this.lastRequest = { item: this.item, command, backward };
    const options = new SvtSearchOptions(this.configuration);
    options.SetFlag("IsIgnoreDiacritics_CTL", !item.matchDiacritics);
    options.SetFlag("IsIgnoreKashida_CTL", !item.matchKashida);
    if (closing) {
      options.SetFlag("IsWholeWordsOnly", item.wholeWords);
      options.SetFlag("IsBackwards", backward);
      options.SetFlag("IsSearchForStyles", item.styleSearch);
      options.SetFlag("IsSimilaritySearch", item.similaritySearch);
      options.SetFlag("IsUseAsianOptions", item.useAsianOptions);
    }
    options.Commit();
  }

  /** Repeats the source command with its last dispatched search item. @returns Whether a match was found. */
  public RepeatSearch(): boolean {
    const request = this.lastRequest;
    if (request === undefined) return false;
    return this.DispatchSearch(request.item, request.command, request.backward).matches > 0;
  }

  /** Prepares the Find Bar request with its own transliteration flags. @param query - Toolbar text and toggles. @returns Native search item. */
  public CreateFindBarSearchItem(
    query: Readonly<{
      search: string;
      matchCase: boolean;
      matchDiacritics: boolean;
    }>,
  ): WriterSearchItem {
    const item = {
      ...this.item,
      search: query.search,
      matchCase: query.matchCase,
      matchCharacterWidth: true,
      wholeWords: false,
      similaritySearch: false,
      styleSearch: false,
      selection: false,
    };
    this.item = item;
    return {
      ...item,
      matchDiacritics: query.matchDiacritics,
      matchKashida: false,
      useAsianOptions: false,
    };
  }

  /** Runs the represented Find, Find All, Replace and Replace All commands. @param item - Options dispatched by the active surface. @param command - Search operation. @param backward - Direction. @param quiet - Whether to suppress miss and bulk count messages. @returns Search feedback. */
  public ExecSearch(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward = false,
    quiet = false,
  ): WriterSearchResult {
    return this.DispatchSearch(item, command, backward, quiet);
  }

  /** Executes both a fresh and a repeated request and updates the view feedback. @param item - Dispatched options. @param command - Search operation. @param backward - Direction. @param quiet - Whether to suppress miss and bulk count messages. @returns Native result. */
  private DispatchSearch(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward: boolean,
    quiet = false,
  ): WriterSearchResult {
    if (
      (command === SvxSearchCmd.REPLACE || command === SvxSearchCmd.REPLACE_ALL) &&
      !this.CanReplace()
    )
      return { matches: 0, wrapped: false };
    this.lastRequest = { item, command, backward };
    let result: WriterSearchResult;
    try {
      result = this.Search(item, command, backward);
    } catch (error) {
      this.PublishFeedback({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
    if (
      quiet &&
      (result.matches === 0 ||
        command === SvxSearchCmd.FIND_ALL ||
        command === SvxSearchCmd.REPLACE_ALL)
    )
      this.ClearFeedback();
    else this.PublishFeedback({ kind: "result", result, command, backward });
    return result;
  }

  /** Validates the selected ranges and replaces the first matching span. @param cursor - Displayed selection ring. @param options - Active search options. @param replacement - New text. @param end - Directional search endpoint. @param acceptsNode - Represented layout admission. @returns Nothing. */
  private ReplaceSelection(
    cursor: SwCursor,
    options: SearchOptions2,
    replacement: string,
    end: SwDocPositions,
    acceptsNode: SwSearchNodeFilter,
  ): void {
    if (!cursor.HasMark()) return;
    const match = createSearchCursor(cursor, true);
    const scopedOptions = new SearchOptions2(options);
    scopedOptions.searchFlag |= REG_NOT_BEGINOFLINE | REG_NOT_ENDOFLINE;
    try {
      if (
        match.Find_Text(
          scopedOptions,
          false,
          SwDocPositions.Curr,
          end,
          [false],
          FindRanges.InSel,
          false,
          undefined,
          acceptsNode,
        ) > 0
      ) {
        const document = this.shell.GetDoc();
        if (canReplaceAtNode(match.GetPoint().GetNode()))
          document.GetDocumentContentOperationsManager().ReplaceRange(match, replacement, false);
        this.shell.SetPaM(match.GetPoint(), match.GetMark());
      }
    } finally {
      disposeSearchRing(match);
      match.Dispose();
    }
  }

  /** Runs the current-area and wrap passes of the native view search. @param cursor - Working cursor. @param first - Directional beginning of the document. @param inSelection - Whether the live selection ring bounds both passes. @param find - Model search strategy. @returns Match count and wrap state. */
  private SearchAndWrap(
    cursor: SwCursor,
    first: SwDocPositions,
    inSelection: boolean,
    find: (from: SwDocPositions, ranges: FindRanges) => number,
  ): WriterSearchResult {
    const saved = this.shell.getShellCursor();
    const origin = saved.GetPoint();
    const boundary = origin.clone();
    const forward = first === SwDocPositions.Start;
    try {
      cursor.FillFindPos(first, boundary);
      const dontWrap = cursor.GetPoint().compare(boundary) === 0;
      if (this.lastCommand === SvxSearchCmd.FIND_ALL) {
        disposeSearchRing(cursor);
        cursor.DeleteMark();
        cursor.MoveSection(forward);
      }
      cursor.Normalize(!forward);
      if (!inSelection) cursor.DeleteMark();

      const startedInOther = this.searchInOther;
      let matches = find(
        SwDocPositions.Curr,
        inSelection ? FindRanges.InSel : startedInOther ? FindRanges.InOther : FindRanges.InBody,
      );
      if (matches > 0) return { matches, wrapped: false };
      if (!inSelection && !startedInOther) {
        this.searchInOther = true;
        matches = find(SwDocPositions.Curr, FindRanges.InOther);
        if (matches > 0) return { matches, wrapped: false };
        this.searchInOther = false;
      } else this.searchInOther = !startedInOther;
      if (dontWrap) return { matches: 0, wrapped: false };

      cursor.Assign(origin, inSelection && saved.HasMark() ? saved.GetMark() : undefined);
      if (startedInOther) {
        cursor.DeleteMark();
        cursor.SttEndDoc(forward);
      }
      matches = find(first, inSelection ? FindRanges.InSel : FindRanges.InBody);
      if (!inSelection && matches === 0) {
        matches = find(first, FindRanges.InOther);
        this.searchInOther = matches > 0;
      }
      return { matches, wrapped: matches > 0 };
    } finally {
      boundary.Dispose();
    }
  }

  /** Copies native options or builds them from the represented dialog controls. @param item - Search item. @returns Independent options for this execution. */
  private CreateSearchOptions(item: WriterSearchItem): SearchOptions2 {
    const options =
      item.searchOptions === undefined
        ? new SearchOptions2()
        : new SearchOptions2(item.searchOptions);
    options.searchString.assign(toOUString(item.search));
    if (item.searchOptions !== undefined) return options;
    options.AlgorithmType2 = ABSOLUTE;
    options.searchFlag =
      (item.wholeWords ? NORM_WORD_ONLY : 0) |
      (item.selection ? REG_NOT_BEGINOFLINE | REG_NOT_ENDOFLINE : 0);
    if (item.similaritySearch) {
      options.AlgorithmType2 = APPROXIMATE;
      options.changedChars = item.similarity.changedChars;
      options.insertedChars = item.similarity.insertedChars;
      options.deletedChars = item.similarity.deletedChars;
      if (item.similarity.relaxed) options.searchFlag |= LEV_RELAXED;
    }
    options.transliterateFlags =
      (item.matchCase ? 0 : TransliterationFlags.IGNORE_CASE) |
      (item.matchDiacritics ? 0 : TransliterationFlags.IGNORE_DIACRITICS_CTL) |
      (item.matchKashida ? 0 : TransliterationFlags.IGNORE_KASHIDA_CTL) |
      (item.matchCharacterWidth ? 0 : TransliterationFlags.IGNORE_WIDTH) |
      (item.useAsianOptions ? item.japaneseFlags : 0);
    return options;
  }

  /** Searches the model with the request's original options. @param item - Dispatched search item. @param command - Requested operation. @param backward - Direction. @returns Search feedback. */
  private Search(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward: boolean,
  ): WriterSearchResult {
    if (item.searchInNotes)
      throw new Error("Writer notes and layout-text search are not implemented.");
    if (item.styleSearch ? !item.searchStyle : item.search.length === 0)
      return { matches: 0, wrapped: false };
    const inSelection = item.selection;
    if (inSelection && !this.HasSelection()) return { matches: 0, wrapped: false };
    const options = this.CreateSearchOptions(item);
    options.Locale = GetSettings().GetLanguageTag().getLocale();
    // Native FUNC_Search supplies replacement text only for Replace All.
    if (command === SvxSearchCmd.REPLACE_ALL)
      options.replaceString.assign(toOUString(item.replacement));
    else options.replaceString.clear();
    const cursor = this.shell.GetCursor();
    const first = backward ? SwDocPositions.End : SwDocPositions.Start;
    const last = backward ? SwDocPositions.Start : SwDocPositions.End;
    const document = this.shell.GetDoc();
    const style = item.styleSearch
      ? (this.GetParaStyle(item.searchStyle) ?? document.GetDfltTextFormatColl())
      : undefined;
    const acceptsNode = createSearchNodeFilter(document, this.pageStories);
    const replaceAll = command === SvxSearchCmd.REPLACE_ALL;
    return this.shell.RunNotificationTransaction(
      /** Releases the new cursor and editing notifications together. @returns Search feedback. */ () => {
        const result = document.RunModelTransaction(
          /** Publishes edits only after restoring the view cursor. @returns Search feedback. */ () => {
            if (command === SvxSearchCmd.REPLACE) {
              if (backward) this.shell.Push();
              try {
                if (style === undefined)
                  this.ReplaceSelection(cursor, options, item.replacement, last, acceptsNode);
                else {
                  const replacement = this.GetParaStyle(item.replaceStyle);
                  setTextFormatCollAtShell(
                    this.shell,
                    replacement ?? document.GetDfltTextFormatColl(),
                    false,
                    /** Rejects a style replacement with a protected selection endpoint. @param range - Shell selection. @returns Whether it admits editing. */ (
                      range,
                    ) =>
                      canReplaceAtNode(range.GetPoint().GetNode()) &&
                      canReplaceAtNode(range.GetMark().GetNode()),
                  );
                }
              } finally {
                if (backward) this.shell.Pop(PopMode.DeleteStack);
              }
              if (backward) this.shell.GetCursor_().Exchange();
            }

            const fromTableCaret = !inSelection && this.shell.HasBoxSelection();
            const search = fromTableCaret
              ? new SwCursor(this.shell.getShellCursor().GetPoint())
              : createSearchCursor(cursor, inSelection);
            if (replaceAll) this.shell.Push();
            let transferred = false;
            try {
              // Keep the table cursor alive so Pop can regenerate its box selections.
              if (replaceAll && !inSelection && !fromTableCaret) this.shell.ClearMark();
              const all = command === SvxSearchCmd.FIND_ALL || command === SvxSearchCmd.REPLACE_ALL;
              if (all) this.searchInOther = false;
              if (all) search.Normalize(backward);
              const replacement =
                style !== undefined && replaceAll
                  ? this.GetParaStyle(item.replaceStyle)
                  : undefined;
              const replacesMatches =
                replaceAll && (style === undefined || replacement !== undefined);
              const acceptsResult: SwSearchNodeFilter = replacesMatches
                ? /** Skips protected results when the model strategy can edit them. @param node - Candidate. @returns Whether the candidate is editable and visible. */ (
                    node,
                  ) => acceptsNode(node) && canReplaceAtNode(node)
                : acceptsNode;
              const find =
                /** Dispatches to the native model strategy in the given area. @param from - Start boundary. @param ranges - Search scope. @returns Match count. */ (
                  from: SwDocPositions,
                  ranges: FindRanges,
                ): number => {
                  const matches =
                    style === undefined
                      ? search.Find_Text(
                          options,
                          false,
                          from,
                          last,
                          [false],
                          ranges,
                          replaceAll,
                          undefined,
                          acceptsResult,
                        )
                      : FindFormat(
                          search,
                          style,
                          replacement,
                          from,
                          last,
                          ranges,
                          this.shell.CaptureCursorState(),
                          acceptsResult,
                        );
                  // Native InOther keeps its saved point in the working ring (WRITER-024).
                  // The view publishes only the match for this single-result pass.
                  if (ranges === FindRanges.InOther) disposeSearchRing(search);
                  return matches;
                };
              const result = all
                ? {
                    matches: find(
                      first,
                      (inSelection ? FindRanges.InSel : FindRanges.InBody) | FindRanges.InSelAll,
                    ),
                    wrapped: false,
                  }
                : this.SearchAndWrap(search, first, inSelection, find);
              const { matches } = result;
              if (replaceAll) {
                if (matches > 0 && !this.shell.IsTableMode()) disposeSearchRing(cursor);
              } else if (matches > 0 || (!all && inSelection)) {
                this.shell.ClearMark();
                this.shell.SetPaM(
                  search.GetPoint(),
                  search.HasMark() ? search.GetMark() : undefined,
                );
                search.GetRingContainer().merge(this.shell.GetCursor_().GetRingContainer());
                transferred = true;
              } else if (!inSelection) {
                this.shell.ClearMark();
                if (!all) this.shell.SetCursor(search.GetPoint());
              }
              if (!replaceAll || matches > 0) this.lastCommand = command;
              return result;
            } finally {
              if (!transferred) disposeSearchRing(search);
              search.Dispose();
              if (replaceAll) this.shell.Pop(PopMode.DeleteCurrent);
            }
          },
        );
        this.shell.NotifySelectionChanged();
        return result;
      },
    );
  }
}
