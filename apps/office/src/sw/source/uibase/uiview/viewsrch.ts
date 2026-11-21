/** @fileoverview Writer view search dispatch over the native model cursor and replacement history. */
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
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { GetSettings } from "../../../../vcl/source/app/svapp";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { FindFormat } from "../../core/crsr/findcoll";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";
import { SwCursor, type SwSearchNodeFilter } from "../../core/crsr/swcrsr";
import { PopMode } from "../../core/crsr/trvltbl";
import type { SwDoc } from "../../core/doc/doc";
import type { SwStartNode } from "../../core/docnode/node";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { CollectTextFlyFrames } from "../../core/layout/flycnt";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
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

// Common.xcs SearchOptions/Japanese enables each equivalence by default.
const defaultJapaneseFlags =
  TransliterationFlags.IGNORE_KANA |
  TransliterationFlags.ignoreSize_ja_JP |
  TransliterationFlags.ignoreMinusSign_ja_JP |
  TransliterationFlags.ignoreIterationMark_ja_JP |
  TransliterationFlags.ignoreTraditionalKanji_ja_JP |
  TransliterationFlags.ignoreTraditionalKana_ja_JP |
  TransliterationFlags.ignoreZiZu_ja_JP |
  TransliterationFlags.ignoreBaFa_ja_JP |
  TransliterationFlags.ignoreTiJi_ja_JP |
  TransliterationFlags.ignoreHyuByu_ja_JP |
  TransliterationFlags.ignoreSeZe_ja_JP |
  TransliterationFlags.ignoreIandEfollowedByYa_ja_JP |
  TransliterationFlags.ignoreKiKuFollowedBySa_ja_JP |
  TransliterationFlags.ignoreProlongedSoundMark_ja_JP |
  TransliterationFlags.ignoreSeparator_ja_JP |
  TransliterationFlags.ignoreSpace_ja_JP |
  TransliterationFlags.ignoreMiddleDot_ja_JP;

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
    japaneseFlags: defaultJapaneseFlags,
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
  private lastRequest:
    { item: WriterSearchItem; command: SvxSearchCmd; backward: boolean } | undefined;

  /** Connects search to the same Writer shell as editing. @param shell - Persistent writing shell. @returns Search owner. */
  public constructor(private readonly shell: SwWrtShell) {}

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
      all.set(style.id, name);
      if (doc.IsUsed(style)) used.push({ id: style.id, name });
    }
    const replace = Array.from(
      all,
      /** Detaches the available native style identity and name. @param entry - Style entry. @returns Dialog entry. */ ([
        id,
        name,
      ]) => ({ id, name }),
    );
    /** Orders displayed style names. @param a - First entry. @param b - Second entry. @returns Name order. */
    function compare(a: { name: string }, b: { name: string }): number {
      return a.name.localeCompare(b.name);
    }
    return { search: used.sort(compare), replace: replace.sort(compare) };
  }

  /** Reflects native text and table selection availability for the search dialog. @returns Whether a document selection exists. */
  public HasSelection(): boolean {
    const cursor = this.shell.GetCursor_();
    return (
      this.shell.HasBoxSelection() ||
      (cursor.HasMark() && cursor.Start().compare(cursor.End()) !== 0)
    );
  }

  /** Reports the replacement commands allowed by the native Writer view state. @returns Whether Replace and Replace All are enabled. */
  public CanReplace(): boolean {
    return !this.shell.GetViewOptions().IsReadonly();
  }

  /** Initializes the displayed search item from the Writer selection. @param dialog - Whether the modeless dialog is opening. @returns Current settings. */
  public OpenSearch(dialog: boolean): WriterSearchItem {
    this.ClearFeedback();
    const cursor = this.shell.GetCursor();
    if (dialog) {
      const text =
        cursor.IsMultiSelection() || this.shell.IsTableMode() ? "" : this.shell.GetSelText();
      this.item = {
        ...this.item,
        search: text || this.item.search,
        selection: text.length === 0 && this.HasSelection(),
      };
    } else {
      // Keep the search value consistent with the browser's single-line input.
      const text = this.GetFindBarSelection(cursor).replaceAll("\r", "").replaceAll("\n", "");
      return { ...this.item, search: text };
    }
    return this.item;
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

  /** Updates the shared search item without editing the document. @param item - Search controls. @returns Nothing. */
  public SetSearchItem(item: WriterSearchItem): void {
    this.item = item;
  }

  /** Publishes the dialog's accepted state as a Find request, as in SaveToModule. @param item - Accepted dialog state. @param backward - Dialog direction. @returns Nothing. */
  public SaveSearchItem(item: WriterSearchItem, backward: boolean): void {
    this.SetSearchItem(item);
    this.lastRequest = { item, command: SvxSearchCmd.FIND, backward };
  }

  /** Repeats the source command with its last dispatched search item. @returns Whether a match was found. */
  public RepeatSearch(): boolean {
    const request = this.lastRequest;
    if (request === undefined) return false;
    return this.DispatchSearch(request.item, request.command, request.backward).matches > 0;
  }

  /** Dispatches the Find Bar's absolute search with its own transliteration flags. @param query - Toolbar text, toggles and direction. @returns Search feedback. */
  public ExecFindBarSearch(
    query: Readonly<{
      search: string;
      matchCase: boolean;
      matchDiacritics: boolean;
      all: boolean;
      backward: boolean;
    }>,
  ): WriterSearchResult {
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
    this.SetSearchItem(item);
    return this.ExecSearch(
      {
        ...item,
        matchDiacritics: query.matchDiacritics,
        matchKashida: false,
        useAsianOptions: false,
      },
      query.all ? SvxSearchCmd.FIND_ALL : SvxSearchCmd.FIND,
      query.backward,
    );
  }

  /** Runs the represented Find, Find All, Replace and Replace All commands. @param item - Options dispatched by the active surface. @param command - Search operation. @param backward - Direction. @returns Search feedback. */
  public ExecSearch(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward = false,
  ): WriterSearchResult {
    return this.DispatchSearch(item, command, backward);
  }

  /** Executes both a fresh and a repeated request and updates the view feedback. @param item - Dispatched options. @param command - Search operation. @param backward - Direction. @returns Native result. */
  private DispatchSearch(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward: boolean,
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
    this.PublishFeedback({ kind: "result", result, command, backward });
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

  /** Searches the model with the request's original options. @param item - Dispatched search item. @param command - Requested operation. @param backward - Direction. @returns Search feedback. */
  private Search(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward: boolean,
  ): WriterSearchResult {
    if (item.styleSearch ? !item.searchStyle : item.search.length === 0)
      return { matches: 0, wrapped: false };
    const inSelection = item.selection;
    if (inSelection && !this.HasSelection()) return { matches: 0, wrapped: false };
    const options = new SearchOptions2();
    options.searchString.assign(toOUString(item.search));
    // Only Replace All performs replacement in FUNC_Search. Single Replace
    // validates a match with Find before replacing it through the edit shell.
    if (command === SvxSearchCmd.REPLACE_ALL)
      options.replaceString.assign(toOUString(item.replacement));
    options.Locale = GetSettings().GetLanguageTag().getLocale();
    options.AlgorithmType2 = ABSOLUTE;
    options.searchFlag =
      (item.wholeWords ? NORM_WORD_ONLY : 0) |
      (inSelection ? REG_NOT_BEGINOFLINE | REG_NOT_ENDOFLINE : 0);
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
    const cursor = this.shell.GetCursor();
    const first = backward ? SwDocPositions.End : SwDocPositions.Start;
    const last = backward ? SwDocPositions.Start : SwDocPositions.End;
    const document = this.shell.GetDoc();
    const style = item.styleSearch ? document.FindTextFormatColl(item.searchStyle) : undefined;
    if (item.styleSearch && style === undefined) return { matches: 0, wrapped: false };
    const acceptsNode = createSearchNodeFilter(document, this.pageStories);
    return this.shell.RunNotificationTransaction(
      /** Releases the new cursor and editing notifications together. @returns Search feedback. */ () => {
        const result = document.RunModelTransaction(
          /** Publishes edits only after restoring the view cursor. @returns Search feedback. */ () => {
            if (command === SvxSearchCmd.REPLACE) {
              if (backward) this.shell.Push();
              try {
                if (style === undefined)
                  this.ReplaceSelection(cursor, options, item.replacement, last, acceptsNode);
                else if (item.replaceStyle) this.shell.SetParagraphStyle(item.replaceStyle);
              } finally {
                if (backward) this.shell.Pop(PopMode.DeleteStack);
              }
              if (backward) this.shell.GetCursor_().Exchange();
            }

            const replaceAll = command === SvxSearchCmd.REPLACE_ALL;
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
                style !== undefined && replaceAll && item.replaceStyle
                  ? document.GetTextFormatColl(item.replaceStyle)
                  : undefined;
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
                          acceptsNode,
                        )
                      : FindFormat(
                          search,
                          style,
                          replacement,
                          from,
                          last,
                          ranges,
                          this.shell.CaptureCursorState(),
                          acceptsNode,
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
