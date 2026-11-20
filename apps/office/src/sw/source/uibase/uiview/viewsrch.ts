/** @fileoverview Writer view search dispatch over the native model cursor and replacement history. */
import { SearchOptions2 } from "../../../../i18nutil/inc/searchopt";
import { TransliterationFlags } from "../../../../i18nutil/inc/transliteration";
import { APPROXIMATE } from "../../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { LEV_RELAXED, NORM_WORD_ONLY } from "../../../../offapi/com/sun/star/util/SearchFlags";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { SvxSearchCmd } from "../../../../svl/inc/srchitem";
import { TextSearch } from "../../../../unotools/inc/textsearch";
import { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import { FindFormat } from "../../core/crsr/findcoll";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";
import { FindTextImpl } from "../../core/crsr/findtxt";
import { getWriterSelectedTextRange, SwPaM } from "../../core/crsr/pam";
import { SwCursor, type SwSearchNodeFilter } from "../../core/crsr/swcrsr";
import type { SwDoc } from "../../core/doc/doc";
import type { SwStartNode } from "../../core/docnode/node";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { CollectTextFlyFrames } from "../../core/layout/flycnt";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwWrtShell } from "../wrtsh/wrtsh1";

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
  readonly findbarMatchDiacritics: boolean;
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
    findbarMatchDiacritics: false,
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

  /** Initializes the displayed search item from the Writer selection. @param dialog - Whether the modeless dialog is opening. @returns Current settings. */
  public OpenSearch(dialog: boolean): WriterSearchItem {
    this.ClearFeedback();
    const cursor = this.shell.GetCursor();
    const range = getWriterSelectedTextRange(cursor);
    const selectedCount = [...cursor.GetRingContainer()].filter(
      /** Counts nonempty native selection ranges. @param member - Registered range. @returns Whether it selects content. */ (
        member,
      ) => member.HasMark() && member.Start().compare(member.End()) !== 0,
    ).length;
    if (range !== undefined && selectedCount === 1) {
      this.item = {
        ...this.item,
        search: range.node.GetText().slice(range.start, range.end),
        selection: dialog ? false : this.item.selection,
      };
    } else if (dialog) {
      this.item = { ...this.item, selection: this.HasSelection() };
    }
    return this.item;
  }

  /** Updates the shared search item without editing the document. @param item - Search controls. @returns Nothing. */
  public SetSearchItem(item: WriterSearchItem): void {
    this.item = item;
  }

  /** Saves the dialog's current query as a Find request when the modeless dialog closes. @param item - Accepted dialog state. @param backward - Dialog direction. @returns Nothing. */
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

  /** Runs the represented Find, Find All, Replace and Replace All commands. @param item - Options dispatched by the active surface. @param command - Search operation. @param backward - Direction. @returns Search feedback. */
  public ExecSearch(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward = false,
  ): WriterSearchResult {
    this.lastRequest = { item, command, backward };
    return this.DispatchSearch(item, command, backward);
  }

  /** Executes both a fresh and a repeated request and updates the view feedback. @param item - Dispatched options. @param command - Search operation. @param backward - Direction. @returns Native result. */
  private DispatchSearch(
    item: WriterSearchItem,
    command: SvxSearchCmd,
    backward: boolean,
  ): WriterSearchResult {
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
    options.replaceString.assign(toOUString(item.replacement));
    options.searchFlag = item.wholeWords ? NORM_WORD_ONLY : 0;
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
            if (style !== undefined && command === SvxSearchCmd.REPLACE && item.replaceStyle) {
              this.shell.SetParagraphStyle(item.replaceStyle);
            } else if (
              style === undefined &&
              command === SvxSearchCmd.REPLACE &&
              cursor.HasMark() &&
              !cursor.IsMultiSelection()
            ) {
              const match = new SwPaM(cursor.GetPoint());
              try {
                if (
                  FindTextImpl(
                    match,
                    options,
                    new TextSearch(options),
                    backward,
                    cursor,
                    acceptsNode,
                  )
                ) {
                  cursor.Assign(match.GetPoint(), match.GetMark());
                  document
                    .GetDocumentContentOperationsManager()
                    .ReplaceRange(cursor, item.replacement, false);
                }
              } finally {
                match.Dispose();
              }
            }

            // Keep the displayed PaM registered while the search moves a separate ring.
            // During Replace All, the displayed content indices follow the actual edits.
            const fromTableCaret = !inSelection && this.shell.HasBoxSelection();
            const search = new SwCursor(
              fromTableCaret ? this.shell.getShellCursor().GetPoint() : cursor.GetPoint(),
              !fromTableCaret && cursor.HasMark() ? cursor.GetMark() : undefined,
            );
            if (inSelection) {
              for (let range = cursor.GetNext(); range !== cursor; range = range.GetNext())
                new SwCursor(
                  range.GetPoint(),
                  range.HasMark() ? range.GetMark() : undefined,
                  search,
                );
            }
            let transferred = false;
            try {
              const all = command === SvxSearchCmd.FIND_ALL || command === SvxSearchCmd.REPLACE_ALL;
              const replaceAll = command === SvxSearchCmd.REPLACE_ALL;
              search.Normalize(backward);
              const start =
                all || (this.lastCommand === SvxSearchCmd.FIND_ALL && !inSelection)
                  ? first
                  : SwDocPositions.Curr;
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
              let matches: number;
              let wrapped = false;
              if (all || inSelection) {
                const scope = inSelection ? FindRanges.InSel : FindRanges.InBody;
                matches = find(start, scope | (all ? FindRanges.InSelAll : 0));
              } else {
                if (start === first) search.FillFindPos(first, search.GetPoint());
                const fromOther =
                  search.GetPoint().GetNodeIndex() <= document.nodes.GetEndOfExtras().GetIndex();
                matches = find(start, fromOther ? FindRanges.InOther : FindRanges.InBodyOnly);
                if (matches === 0 && !fromOther) matches = find(start, FindRanges.InOther);
                if (matches === 0 && (start !== first || fromOther)) {
                  search.FillFindPos(first, search.GetPoint());
                  matches = find(first, FindRanges.InBodyOnly);
                  if (matches === 0 && fromOther) matches = find(first, FindRanges.InOther);
                  wrapped = matches > 0;
                }
              }
              if (matches > 0 && !replaceAll) {
                this.shell.ClearMark();
                this.shell.SetPaM(search.GetPoint(), search.GetMark());
                search.GetRingContainer().merge(this.shell.GetCursor_().GetRingContainer());
                transferred = true;
              } else if (!inSelection && !replaceAll) {
                this.shell.ClearMark();
              }
              this.lastCommand = command;
              return { matches, wrapped };
            } finally {
              if (!transferred) disposeSearchRing(search);
              search.Dispose();
            }
          },
        );
        this.shell.NotifySelectionChanged();
        return result;
      },
    );
  }
}
