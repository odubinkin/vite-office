/** @fileoverview Browser Find toolbar and modeless Find and Replace dialog. */
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from "react";
import { Info } from "lucide-react";
import {
  useBrowserCommandState,
  type BrowserCommandSource,
} from "../../../framework/browser/presentation/command-surface";
import { SearchOptionFlags } from "../../../svl/inc/srchdefs";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import type {
  SwViewSearch,
  WriterExecuteSearchArguments,
  WriterSearchFeedback,
  WriterSearchItem,
  WriterSearchSlotItem,
} from "../../source/uibase/uiview/viewsrch";
import type { SwView } from "../../source/uibase/uiview/view";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { ABSOLUTE } from "../../../offapi/com/sun/star/util/SearchAlgorithms2";
import { SearchAlgorithms } from "../../../offapi/com/sun/star/util/SearchAlgorithms";
import { SvxSearchCellType, SvxSearchCmd } from "../../../svl/inc/srchitem";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { describeSearchAttributes } from "./writer-search-format-values";
import { WriterSearchAttributesDialog } from "./WriterSearchAttributesDialog";
import { WriterSearchFormatDialog } from "./WriterSearchFormatDialog";
import { WriterSearchAlgorithmOptions } from "./WriterSearchAlgorithmOptions";
import { WriterSimilaritySearchDialog } from "./WriterSimilaritySearchDialog";
import { WriterJapaneseSearchDialog } from "./WriterJapaneseSearchDialog";

const buttonStyle =
  "rounded border border-slate-300 bg-white px-2 py-1 text-sm hover:bg-slate-100 disabled:opacity-50";
const fieldStyle = "min-w-0 rounded border border-slate-400 bg-white px-2 py-1 text-sm";

/** Browseable histories of the modeless search dialog. */
export interface WriterSearchHistory {
  readonly search: readonly string[];
  readonly replacement: readonly string[];
}

// officecfg/registry/data/org/openoffice/Office/Common.xcu: FindReplaceRememberedSearches
const rememberedSearches = 10;

// The native toolbar manager saves the list on destruction. Entry activation
// separately remembers a search across all Find Bar controllers.
let savedFindBarHistory: readonly string[] = [];
let rememberedFindBarSearch = "";

/** The search dialog and toolbar own separate focus requests. */
export type SearchSurfaces = Partial<
  Record<"findbar" | "searchDialog", SearchFocusRequest | undefined>
>;

/** Search state queried when a surface is opened or refocused. */
export interface SearchFocusRequest {
  readonly revision: number;
  readonly search: string | undefined;
  readonly initial: WriterSearchItem | WriterSearchSlotItem;
  readonly feedback: WriterSearchFeedback | undefined;
}

/** Stores the query activated by the Find Bar entry. @param search - Activated query. @returns Nothing. */
function rememberFindBarActivation(search: string): void {
  rememberedFindBarSearch = search;
}

/** Moves a nonempty entry to the front of the native history. @param values - Current values. @param entry - Submitted value. @returns Ordered history. */
function remember(values: readonly string[], entry: string): readonly string[] {
  if (entry.length === 0 || values[0] === entry) return values;
  return [
    entry,
    ...values.filter(
      /** Removes the old occurrence. @param value - Previous history entry. @returns Whether to retain it. */ (
        value,
      ) => value !== entry,
    ),
  ].slice(0, rememberedSearches);
}

/** Displays the search controls for one active Writer surface. @param props - Mode, owner and focus callbacks. @returns Search UI. */
export function WriterSearch({
  dialog,
  request: { initial, revision: focusRequest, search: focusSearch },
  commandSource,
  history,
  onHistoryChange,
  view,
  canSearchSelection: hasDocumentSelection,
  close,
  openSearch,
  searchFeedback,
  findBarFeedback,
}: Readonly<{
  dialog: boolean;
  request: SearchFocusRequest;
  commandSource: BrowserCommandSource;
  history: WriterSearchHistory;
  onHistoryChange: Dispatch<SetStateAction<WriterSearchHistory>>;
  view: SwView;
  canSearchSelection: boolean;
  close: () => void;
  openSearch: (surface: "searchDialog", search: string) => void;
  searchFeedback: WriterSearchFeedback | undefined;
  findBarFeedback: WriterSearchFeedback | undefined;
}>): React.JSX.Element {
  const owner = view.GetSearch();
  const localization = useBrowserLocalization();
  const [feedbackOnEdit, setFeedbackOnEdit] = useState<WriterSearchFeedback>();
  const [findBarHistory, setFindBarHistory] = useState(
    /** Loads the toolbar manager's saved list. @returns Recent toolbar searches. */ () =>
      dialog ? [] : savedFindBarHistory,
  );
  const currentFindBarHistory = useRef(findBarHistory);
  const search = focusSearch ?? (dialog ? undefined : rememberedFindBarSearch || findBarHistory[0]);
  const [item, setItem] = useState({
    ...initial,
    search: search ?? (dialog ? initial.search : ""),
  });
  const [lastFocusRequest, setLastFocusRequest] = useState(focusRequest);
  if (focusRequest !== lastFocusRequest) {
    setLastFocusRequest(focusRequest);
    if (search !== undefined && search !== item.search) setItem({ ...item, search });
  }
  const [findbarMatchCase, setFindbarMatchCase] = useState(false);
  const [findbarMatchDiacritics, setFindbarMatchDiacritics] = useState(false);
  const [similarityOptionsOpen, setSimilarityOptionsOpen] = useState(false);
  const similarityOptionsButton = useRef<HTMLButtonElement>(null);
  const [japaneseOptionsOpen, setJapaneseOptionsOpen] = useState(false);
  const japaneseOptionsButton = useRef<HTMLButtonElement>(null);
  const [replaceBackward, setReplaceBackward] = useState("backward" in initial && initial.backward);
  const [formatDialog, setFormatDialog] = useState<"attributes" | "format">();
  const [formatTarget, setFormatTarget] = useState<"search" | "replace">("search");
  const pool = view.GetDocShell().GetDoc().GetAttrPool();
  const hasSearchAttributes = Boolean(item.searchAttributes?.GetEntries().length);
  const hasReplaceAttributes = Boolean(item.replaceAttributes?.GetEntries().length);
  const hasAttributes = dialog && (hasSearchAttributes || hasReplaceAttributes);
  const [otherOptionsOpen] = useState(
    initial.selection ||
      !initial.matchDiacritics ||
      initial.matchKashida ||
      initial.useAsianOptions ||
      initial.searchInNotes ||
      initial.regularExpression ||
      initial.similaritySearch ||
      initial.styleSearch ||
      initial.matchCharacterWidth ||
      hasAttributes,
  );
  const searchField = useRef<HTMLInputElement>(null);
  const searchStyleField = useRef<HTMLSelectElement>(null);
  const replaceField = useRef<HTMLInputElement>(null);
  const searchList = useId();
  const replacementList = useId();
  const searchOptionsState = useBrowserCommandState(
    commandSource,
    WRITER_COMMAND_IDS.searchOptions,
  );
  const searchOptions = !dialog
    ? SearchOptionFlags.ALL
    : searchOptionsState.value instanceof SfxUInt16Item
      ? searchOptionsState.value.GetValue()
      : SearchOptionFlags.NONE;
  const canReplace = hasOption(SearchOptionFlags.REPLACE);
  const canFormat = !item.similaritySearch && hasOption(SearchOptionFlags.FORMAT);
  const canReplaceAll = !item.searchInNotes && hasOption(SearchOptionFlags.REPLACE_ALL);

  /** Reads the view shell's option mask. @param option - Native search capability. @returns Whether the control is available. */
  function hasOption(option: SearchOptionFlags): boolean {
    return (searchOptions & option) !== 0;
  }

  const canSearchSelection = hasDocumentSelection && hasOption(SearchOptionFlags.SELECTION);
  if (dialog && !hasDocumentSelection && item.selection) setItem({ ...item, selection: false });

  useLayoutEffect(
    /** Saves the toolbar history when its controller is destroyed. @returns Optional cleanup. */ () => {
      if (dialog) return;
      return /** Retains this toolbar's latest history. @returns Nothing. */ () => {
        savedFindBarHistory = currentFindBarHistory.current;
      };
    },
    [dialog],
  );

  useLayoutEffect(
    /** Gives the search entry focus after the calling menu releases it. @returns Nothing. */ () => {
      if (!dialog && focusSearch !== undefined) owner.ClearFeedback();
      searchStyleField.current?.focus();
      searchField.current?.focus();
      searchField.current?.select();
    },
    [dialog, focusRequest, focusSearch, owner],
  );

  /** Resolves a search control label. @param key - Control identity. @param fallback - English label. @returns Localized text. */
  function text(key: string, fallback: string): string {
    return localization.GetText(`writer.search.${key}`, fallback);
  }

  /** Updates the draft and optionally publishes the dialog settings for Repeat Search. @param changes - Edited fields. @param commit - Whether the edit immediately reaches the module. @returns Nothing. */
  function update(changes: Partial<WriterSearchItem>, commit = true): void {
    const next = { ...item, ...changes };
    setItem(next);
    if (dialog && commit) saveDialogItem(next, replaceBackward);
    if (changes.search !== undefined) {
      if (!dialog || formatFeedback(findBarFeedback)) owner.ClearFeedback();
      else setFeedbackOnEdit(searchFeedback);
    }
  }

  /** Resolves the selected collection against the native list. @param styles - Available collections. @param id - Draft selection. @returns Applicable style identity. */
  function effectiveStyle(styles: readonly { id: string }[] | undefined, id: string): string {
    return styles?.some(
      /** Tests the exact collection identity. @param style - Available style. @returns Whether it is selected. */ (
        style,
      ) => style.id === id,
    )
      ? id
      : (styles?.[0]?.id ?? "");
  }

  /** Sorts the style selectors in UI-language natural order, as in the native combo boxes. @returns Sorted paragraph styles. */
  function getStyleOptions(): ReturnType<SwViewSearch["GetParagraphStyles"]> {
    const styles = owner.GetParagraphStyles();
    const compare = new Intl.Collator(localization.locale, { numeric: true }).compare;
    /** Compares visible names with the UI locale and numeric runs. @param first - Style entry. @param second - Style entry. @returns Sort order. */
    function byName(first: { name: string }, second: { name: string }): number {
      return compare(first.name, second.name);
    }
    return {
      search: [...styles.search].sort(byName),
      replace: [...styles.replace].sort(byName),
    };
  }

  const styleOptions = dialog && item.styleSearch && !hasAttributes ? getStyleOptions() : undefined;
  const searchStyle = effectiveStyle(styleOptions?.search, item.searchStyle);
  const replaceStyle = effectiveStyle(styleOptions?.replace, item.replaceStyle);

  /** Saves the native dialog settings as a Find request. @param draft - Dialog controls. @param backward - Direction saved from Replace backwards. @param closing - Whether Close also records the replacement. @returns Nothing. */
  function saveDialogItem(draft: WriterSearchItem, backward: boolean, closing = false): void {
    const styles =
      draft.styleSearch && !hasAttributes ? (styleOptions ?? getStyleOptions()) : undefined;
    if (styles === undefined)
      onHistoryChange(
        /** Remembers the current dialog term when it is saved. @param previous - Dialog history. @returns Updated history. */ (
          previous,
        ) => ({
          search: remember(previous.search, draft.search),
          replacement: closing
            ? remember(previous.replacement, draft.replacement)
            : previous.replacement,
        }),
      );
    const item: WriterSearchSlotItem = {
      ...draft,
      searchStyle: effectiveStyle(styles?.search, draft.searchStyle),
      replaceStyle: effectiveStyle(styles?.replace, draft.replaceStyle),
      selection: canSearchSelection && draft.selection,
      command: SvxSearchCmd.FIND,
      backward,
    };
    if (closing) view.Execute(WRITER_COMMAND_IDS.searchOff, { SearchItem: item });
    else view.Execute(WRITER_COMMAND_IDS.searchProperties, item);
  }

  /** Publishes text and style entries when they lose focus. @returns Nothing. */
  function saveDialogEntries(): void {
    saveDialogItem(item, replaceBackward);
  }

  /** Closes the surface, preserving the modeless dialog's input and histories. @returns Nothing. */
  function closeSearch(): void {
    if (dialog) saveDialogItem(item, replaceBackward, true);
    close();
  }

  /** Executes one search operation with the active surface's options. @param command - Operation. @param backward - Direction. @param activateEntry - Whether the toolbar entry initiated the operation. @returns Nothing. */
  function execute(command: SvxSearchCmd, backward = false, activateEntry = false): void {
    if (!dialog && command !== SvxSearchCmd.FIND_ALL) {
      if (activateEntry) rememberFindBarActivation(item.search);
      const entries = remember(currentFindBarHistory.current, item.search);
      currentFindBarHistory.current = entries;
      setFindBarHistory(entries);
    } else if (dialog && styleOptions === undefined) {
      onHistoryChange(
        /** Records the fields used by this dialog command. @param previous - Dialog history. @returns Updated history. */ (
          previous,
        ) => ({
          search:
            command === SvxSearchCmd.REPLACE
              ? previous.search
              : remember(previous.search, item.search),
          replacement:
            command === SvxSearchCmd.REPLACE || command === SvxSearchCmd.REPLACE_ALL
              ? remember(previous.replacement, item.replacement)
              : previous.replacement,
        }),
      );
    }
    try {
      if (!dialog) {
        if (command === SvxSearchCmd.FIND_ALL) searchField.current?.focus();
        const toolbarItem = owner.CreateFindBarSearchItem({
          search: item.search,
          matchCase: findbarMatchCase,
          matchDiacritics: findbarMatchDiacritics,
        });
        view.Execute(WRITER_COMMAND_IDS.executeSearch, {
          "SearchItem.SearchString": toolbarItem.search,
          "SearchItem.CellType": SvxSearchCellType.VALUE,
          "SearchItem.Backward": backward,
          "SearchItem.SearchFlags": 0,
          "SearchItem.TransliterateFlags":
            (toolbarItem.matchCase ? 0 : TransliterationFlags.IGNORE_CASE) |
            (toolbarItem.matchDiacritics ? 0 : TransliterationFlags.IGNORE_DIACRITICS_CTL) |
            (toolbarItem.matchKashida ? 0 : TransliterationFlags.IGNORE_KASHIDA_CTL),
          "SearchItem.Command": command,
          "SearchItem.AlgorithmType": SearchAlgorithms.ABSOLUTE,
          "SearchItem.AlgorithmType2": ABSOLUTE,
          "SearchItem.SearchFormatted": false,
          UseAttrItemList: false,
        });
        return;
      }
      const request: WriterExecuteSearchArguments = {
        SearchItem: {
          ...item,
          styleSearch: item.styleSearch,
          searchStyle,
          replaceStyle,
          selection: canSearchSelection && item.selection,
          command,
          backward,
        },
      };
      view.Execute(WRITER_COMMAND_IDS.executeSearch, request);
    } catch {
      // The view publishes command errors through the same feedback as repeat search.
    }
  }

  /** Localizes the last view-owned search result. @param feedback - Completed search or error. @returns Visible feedback text. */
  function formatFeedback(feedback: WriterSearchFeedback | undefined): string {
    if (feedback === undefined) return "";
    if (feedback.kind === "error") return feedback.message;
    const { result, command, backward } = feedback;
    if (result.matches === 0) return text("not-found", "Search key not found");
    if (command === SvxSearchCmd.REPLACE_ALL)
      return text("replaced", "Search key replaced %1 times.").replace(
        "%1",
        String(result.matches),
      );
    if (command === SvxSearchCmd.FIND_ALL)
      return result.matches === 1
        ? text("found-one", "One match found.")
        : text("found", "%1 results").replace("%1", String(result.matches));
    if (!result.wrapped) return "";
    return backward
      ? text("start", "Reached the beginning of the document")
      : text("end", "Reached the end of the document");
  }

  /** Processes the native search surface's Escape and find-entry Return keys. @param event - Browser key. @returns Nothing. */
  function onKeyDown(event: KeyboardEvent<HTMLElement>): void {
    if (event.nativeEvent.isComposing) return;
    if (
      !dialog &&
      event.target === searchField.current &&
      (event.ctrlKey || event.metaKey) &&
      !event.shiftKey &&
      !event.altKey &&
      ["f", "h"].includes(event.key.toLowerCase())
    ) {
      event.preventDefault();
      event.stopPropagation();
      if (event.key.toLowerCase() === "f") searchField.current?.select();
      else openSearch("searchDialog", item.search);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeSearch();
    } else if (
      (event.key === "Enter" &&
        (event.target === searchField.current || event.target === replaceField.current)) ||
      (!dialog &&
        event.target === searchField.current &&
        (event.key === "F3" ||
          ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "g")))
    ) {
      event.preventDefault();
      if (!cannotSearch && hasOption(SearchOptionFlags.SEARCH))
        execute(SvxSearchCmd.FIND, !dialog && event.shiftKey, !dialog);
    }
  }

  const findLabel = text("find", "Find");
  const findAllLabel = text("find-all", "Find All");
  const previousLabel = text("previous", "Find Previous");
  const nextLabel = text("next", "Find Next");
  const dialogLabel = text("dialog", "Find and Replace");
  const closeLabel = text("close", "Close");
  const cannotSearch =
    styleOptions === undefined ? item.search.length === 0 && !hasSearchAttributes : !searchStyle;
  const statusId = useId();
  const message = formatFeedback(searchFeedback);
  const invalid =
    dialog &&
    searchFeedback !== feedbackOnEdit &&
    searchFeedback?.kind === "result" &&
    searchFeedback.result.matches === 0;
  const field = (
    <input
      aria-label={findLabel}
      aria-describedby={message ? statusId : undefined}
      aria-invalid={invalid || undefined}
      className={`${fieldStyle} aria-invalid:border-rose-500 aria-invalid:bg-rose-50`}
      ref={searchField}
      list={searchList}
      type="text"
      value={item.search}
      onFocus={
        /** Targets find-side formatting. @returns Nothing. */ () => setFormatTarget("search")
      }
      onBlur={dialog ? saveDialogEntries : undefined}
      onChange={
        /** Stores the Writer search string. @param event - Updated control. @returns Nothing. */ (
          event,
        ) => update({ search: event.currentTarget.value }, false)
      }
    />
  );
  const searchHistory = (
    <datalist id={searchList}>
      {(dialog ? history.search : findBarHistory).map(
        /** Projects a recent search. @param value - Stored value. @returns Browser option. */ (
          value,
        ) => (
          <option key={value} value={value} />
        ),
      )}
    </datalist>
  );
  const matchCase = (
    <label className="flex items-center gap-1 text-sm">
      <input
        type="checkbox"
        checked={dialog ? item.matchCase : findbarMatchCase}
        disabled={
          dialog &&
          (!hasOption(SearchOptionFlags.EXACT) || item.styleSearch || item.useAsianOptions)
        }
        onChange={
          /** Stores the case option. @param event - Updated control. @returns Nothing. */ (
            event,
          ) => {
            const checked = event.currentTarget.checked;
            if (dialog) update({ matchCase: checked });
            else setFindbarMatchCase(checked);
          }
        }
      />
      {text("match-case", "Match case")}
    </label>
  );
  const previous = (
    <button
      type="button"
      className={buttonStyle}
      disabled={cannotSearch || !hasOption(SearchOptionFlags.BACKWARDS)}
      onClick={/** Searches backward. @returns Nothing. */ () => execute(SvxSearchCmd.FIND, true)}
    >
      {previousLabel}
    </button>
  );
  const next = (
    <button
      type="button"
      className={buttonStyle}
      disabled={cannotSearch || !hasOption(SearchOptionFlags.SEARCH)}
      onClick={/** Searches forward. @returns Nothing. */ () => execute(SvxSearchCmd.FIND)}
    >
      {nextLabel}
    </button>
  );
  const all = (
    <button
      type="button"
      className={buttonStyle}
      disabled={
        cannotSearch || Boolean(item.searchInNotes) || !hasOption(SearchOptionFlags.SEARCHALL)
      }
      onClick={/** Selects all matches. @returns Nothing. */ () => execute(SvxSearchCmd.FIND_ALL)}
    >
      {findAllLabel}
    </button>
  );
  const feedback = dialog ? (
    <div
      id={statusId}
      role="status"
      className={`flex min-h-8 items-center gap-2 rounded px-2 text-sm text-slate-700 ${message ? "bg-sky-100" : ""}`}
    >
      {message && <Info aria-hidden="true" className="size-4 shrink-0" />}
      {message}
    </div>
  ) : (
    <span id={statusId} role="status" className="text-sm text-slate-700">
      {message}
    </span>
  );

  if (!dialog)
    return (
      <section
        aria-label={findLabel}
        role="toolbar"
        className="flex flex-wrap items-center gap-2 border-t border-slate-300 bg-white px-3 py-1"
        onKeyDown={onKeyDown}
      >
        <button type="button" className={buttonStyle} onClick={closeSearch}>
          {closeLabel}
        </button>
        {field}
        {searchHistory}
        {previous}
        {next}
        {all}
        {matchCase}
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={findbarMatchDiacritics}
            onChange={
              /** Updates the Find toolbar option. @param event - Updated control. @returns Nothing. */ (
                event,
              ) => setFindbarMatchDiacritics(event.currentTarget.checked)
            }
          />
          {text("match-diacritics", "Match Diacritics")}
        </label>
        <button
          type="button"
          className={buttonStyle}
          onClick={
            /** Passes the live toolbar entry to the modeless dialog. @returns Nothing. */ () =>
              openSearch("searchDialog", item.search)
          }
        >
          {dialogLabel}
        </button>
        {feedback}
      </section>
    );

  return (
    <>
      <section
        aria-label={dialogLabel}
        role="dialog"
        inert={japaneseOptionsOpen || similarityOptionsOpen || formatDialog !== undefined}
        className="fixed bottom-8 right-4 z-40 grid max-h-[85dvh] max-w-[calc(100vw-2rem)] gap-3 overflow-auto rounded-lg border border-slate-300 bg-white p-4 shadow-xl"
        onKeyDown={onKeyDown}
      >
        <h2 className="office-dialog-header border-b border-slate-200 pb-3 text-xl font-bold text-slate-950">
          {dialogLabel}
        </h2>
        <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
          <legend className="px-1 text-sm">{text("search-for", "Search For")}</legend>
          {styleOptions === undefined ? (
            <>
              {field}
              {searchHistory}
            </>
          ) : (
            <select
              aria-label={findLabel}
              ref={searchStyleField}
              className={fieldStyle}
              value={searchStyle}
              onBlur={saveDialogEntries}
              onChange={
                /** Updates the native find collection. @param event - Selection. @returns Nothing. */ (
                  event,
                ) => update({ searchStyle: event.currentTarget.value }, false)
              }
            >
              {styleOptions.search.map(
                /** Projects one used collection. @param style - Style choice. @returns Browser option. */ (
                  style,
                ) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ),
              )}
            </select>
          )}
          {hasSearchAttributes && (
            <span className="text-sm">{describeSearchAttributes(item.searchAttributes, text)}</span>
          )}
          {matchCase}
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={item.wholeWords}
              disabled={
                item.regularExpression ||
                styleOptions !== undefined ||
                !hasOption(SearchOptionFlags.WHOLE_WORDS)
              }
              onChange={
                /** Stores the whole-word option. @param event - Updated control. @returns Nothing. */ (
                  event,
                ) => update({ wholeWords: event.currentTarget.checked })
              }
            />
            {text("whole-words", "Whole words only")}
          </label>
          {feedback}
        </fieldset>
        <fieldset disabled={!canReplace} className="grid gap-2 rounded border border-slate-200 p-2">
          <legend className="px-1 text-sm">{text("replace-with-group", "Replace With")}</legend>
          {styleOptions === undefined ? (
            <>
              <input
                aria-label={text("replace-with", "Replace with")}
                ref={replaceField}
                list={replacementList}
                className={fieldStyle}
                value={item.replacement}
                onBlur={saveDialogEntries}
                onFocus={
                  /** Targets replace-side formatting. @returns Nothing. */ () =>
                    setFormatTarget("replace")
                }
                onChange={
                  /** Stores replacement text. @param event - Updated control. @returns Nothing. */ (
                    event,
                  ) => update({ replacement: event.currentTarget.value }, false)
                }
              />
              <datalist id={replacementList}>
                {history.replacement.map(
                  /** Projects a recent replacement. @param value - Stored value. @returns Browser option. */ (
                    value,
                  ) => (
                    <option key={value} value={value} />
                  ),
                )}
              </datalist>
            </>
          ) : (
            <select
              aria-label={text("replace-with", "Replace with")}
              className={fieldStyle}
              value={replaceStyle}
              onBlur={saveDialogEntries}
              onChange={
                /** Updates the native replacement collection. @param event - Selection. @returns Nothing. */ (
                  event,
                ) => update({ replaceStyle: event.currentTarget.value }, false)
              }
            >
              {styleOptions.replace.map(
                /** Projects one available collection. @param style - Style choice. @returns Browser option. */ (
                  style,
                ) => (
                  <option key={style.id} value={style.id}>
                    {style.name}
                  </option>
                ),
              )}
            </select>
          )}
          {hasReplaceAttributes && (
            <span className="text-sm">
              {describeSearchAttributes(item.replaceAttributes, text)}
            </span>
          )}
        </fieldset>
        <div className="flex flex-wrap gap-1">
          {all}
          {previous}
          {next}
          <button
            type="button"
            className={buttonStyle}
            disabled={cannotSearch || !canReplace}
            onClick={
              /** Replaces the current match. @returns Nothing. */ () =>
                execute(SvxSearchCmd.REPLACE, replaceBackward)
            }
          >
            {text("replace", "Replace")}
          </button>
          <button
            type="button"
            className={buttonStyle}
            disabled={cannotSearch || !canReplaceAll}
            onClick={
              /** Replaces all matches. @returns Nothing. */ () => execute(SvxSearchCmd.REPLACE_ALL)
            }
          >
            {text("replace-all", "Replace All")}
          </button>
        </div>
        <details open={otherOptionsOpen}>
          <summary className="cursor-pointer text-sm">
            {text("other-options", "Other options")}
          </summary>
          <div className="mt-2 grid gap-x-4 gap-y-2 sm:grid-cols-2">
            <label className="flex items-center gap-1 text-sm sm:col-start-1 sm:row-start-1">
              <input
                type="checkbox"
                disabled={!canSearchSelection}
                checked={canSearchSelection && item.selection}
                onChange={
                  /** Restricts search to the Writer selection. @param event - Updated control. @returns Nothing. */ (
                    event,
                  ) => update({ selection: event.currentTarget.checked })
                }
              />
              {text("selection", "Current selection only")}
            </label>
            <label className="flex items-center gap-1 text-sm sm:col-start-2 sm:row-start-1">
              <input
                type="checkbox"
                checked={replaceBackward}
                disabled={!hasOption(SearchOptionFlags.BACKWARDS)}
                onChange={
                  /** Sets the native replacement direction. @param event - Updated control. @returns Nothing. */ (
                    event,
                  ) => {
                    const backward = event.currentTarget.checked;
                    setReplaceBackward(backward);
                    saveDialogItem(item, backward);
                  }
                }
              />
              {text("replace-backward", "Replace backwards")}
            </label>
            <label className="flex items-center gap-1 text-sm sm:col-start-2 sm:row-start-2">
              <input
                type="checkbox"
                checked={item.styleSearch}
                disabled={
                  item.regularExpression ||
                  item.similaritySearch ||
                  item.searchInNotes ||
                  !hasOption(SearchOptionFlags.FAMILIES)
                }
                onChange={
                  /** Switches between text fields and native paragraph style lists. @param event - Updated control. @returns Nothing. */ (
                    event,
                  ) =>
                    update({
                      styleSearch: event.currentTarget.checked,
                      ...(event.currentTarget.checked && !hasAttributes
                        ? { wholeWords: false, matchCase: false }
                        : {}),
                    })
                }
              />
              {hasAttributes && item.search.length > 0
                ? text("including-styles", "Including Styles")
                : text("search-for-styles", "Search for styles")}
            </label>
            <WriterSearchAlgorithmOptions
              item={item}
              styleMode={styleOptions !== undefined}
              hasOption={hasOption}
              update={update}
              text={text}
              buttonStyle={buttonStyle}
              similarityOptionsButton={similarityOptionsButton}
              openSimilarity={
                /** Opens the similarity limits dialog. @returns Nothing. */ () =>
                  setSimilarityOptionsOpen(true)
              }
            />
            <div className="flex items-center gap-2 sm:col-start-2 sm:row-start-4">
              <label className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={item.useAsianOptions}
                  onChange={
                    /** Enables the configured Japanese rules. @param event - Updated control. @returns Nothing. */ (
                      event,
                    ) => update({ useAsianOptions: event.currentTarget.checked })
                  }
                />
                {text("sounds-like-japanese", "Sounds like (Japanese)")}
              </label>
              <button
                type="button"
                ref={japaneseOptionsButton}
                className={buttonStyle}
                disabled={!item.useAsianOptions}
                onClick={
                  /** Opens the Japanese options dialog. @returns Nothing. */ () =>
                    setJapaneseOptionsOpen(true)
                }
              >
                {text("sounds", "Sounds…")}
              </button>
            </div>
            <label className="flex items-center gap-1 text-sm sm:col-start-1 sm:row-start-5">
              <input
                type="checkbox"
                checked={item.matchDiacritics}
                onChange={
                  /** Updates the full search dialog option. @param event - Updated control. @returns Nothing. */ (
                    event,
                  ) => update({ matchDiacritics: event.currentTarget.checked })
                }
              />
              {text("diacritic-sensitive", "Diacritic-sensitive")}
            </label>
            <label className="flex items-center gap-1 text-sm sm:col-start-2 sm:row-start-5">
              <input
                type="checkbox"
                checked={item.matchKashida}
                onChange={
                  /** Updates the dialog kashida option. @param event - Updated control. @returns Nothing. */ (
                    event,
                  ) => update({ matchKashida: event.currentTarget.checked })
                }
              />
              {text("kashida-sensitive", "Kashida-sensitive")}
            </label>
            <label className="flex items-center gap-1 text-sm sm:col-start-1 sm:row-start-6">
              <input
                type="checkbox"
                checked={item.searchInNotes ?? false}
                disabled={styleOptions !== undefined}
                onChange={
                  /** Includes anchored comment text. @param event - Changed checkbox. @returns Nothing. */ (
                    event,
                  ) => update({ searchInNotes: event.currentTarget.checked })
                }
              />
              {text("notes", "Comments")}
            </label>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <button
              type="button"
              className={buttonStyle}
              disabled={formatTarget !== "search" || styleOptions !== undefined || !canFormat}
              onClick={
                /** Opens the native attribute checklist. @returns Nothing. */ () =>
                  setFormatDialog("attributes")
              }
            >
              {text("attributes", "Attributes…")}
            </button>
            <button
              type="button"
              className={buttonStyle}
              disabled={styleOptions !== undefined || !canFormat}
              onClick={
                /** Opens exact formatting for the active field. @returns Nothing. */ () =>
                  setFormatDialog("format")
              }
            >
              {text("format", "Format…")}
            </button>
            <button
              type="button"
              className={buttonStyle}
              disabled={
                !canFormat ||
                (formatTarget === "search" ? !hasSearchAttributes : !hasReplaceAttributes)
              }
              onClick={
                /** Clears formatting for the focused entry. @returns Nothing. */ () => {
                  if (formatTarget === "search") {
                    update({ searchAttributes: undefined, styleSearch: false });
                    searchField.current?.focus();
                  } else {
                    update({ replaceAttributes: undefined, styleSearch: false });
                    replaceField.current?.focus();
                  }
                }
              }
            >
              {text("no-format", "No Format")}
            </button>
          </div>
        </details>
        <footer className="flex justify-end border-t border-slate-200 pt-2">
          <button type="button" className={buttonStyle} onClick={closeSearch}>
            {closeLabel}
          </button>
        </footer>
      </section>
      {formatDialog === "attributes" && (
        <WriterSearchAttributesDialog
          pool={pool}
          initial={item.searchAttributes}
          restoreFocus={searchField}
          onClose={
            /** Applies accepted criteria and closes the checklist. @param searchAttributes - Accepted criteria. @returns Nothing. */ (
              searchAttributes,
            ) => {
              if (searchAttributes !== undefined) update({ searchAttributes });
              setFormatDialog(undefined);
            }
          }
        />
      )}
      {formatDialog === "format" && (
        <WriterSearchFormatDialog
          pool={pool}
          unit={view.GetMetric()}
          target={formatTarget}
          initial={formatTarget === "search" ? item.searchAttributes : item.replaceAttributes}
          restoreFocus={formatTarget === "search" ? searchField : replaceField}
          onClose={
            /** Applies formatting to the active field. @param criteria - Accepted criteria. @returns Nothing. */ (
              criteria,
            ) => {
              if (criteria !== undefined)
                update(
                  formatTarget === "search"
                    ? { searchAttributes: criteria }
                    : { replaceAttributes: criteria },
                );
              setFormatDialog(undefined);
            }
          }
        />
      )}
      {similarityOptionsOpen && (
        <WriterSimilaritySearchDialog
          initial={item.similarity}
          restoreFocus={similarityOptionsButton}
          onClose={
            /** Saves an accepted similarity draft. @param similarity - Accepted settings or undefined on cancel. @returns Nothing. */ (
              similarity,
            ) => {
              if (similarity !== undefined) update({ similarity });
              setSimilarityOptionsOpen(false);
            }
          }
        />
      )}
      {japaneseOptionsOpen && (
        <WriterJapaneseSearchDialog
          initialFlags={
            item.japaneseFlags |
            (item.matchCase ? 0 : TransliterationFlags.IGNORE_CASE) |
            (item.matchCharacterWidth ? 0 : TransliterationFlags.IGNORE_WIDTH)
          }
          onClose={
            /** Returns accepted Japanese flags and restores the Sounds button. @param flags - Accepted flags or undefined on cancellation. @returns Nothing. */ (
              flags,
            ) => {
              if (flags !== undefined) {
                const ordinary =
                  TransliterationFlags.IGNORE_CASE | TransliterationFlags.IGNORE_WIDTH;
                update({
                  japaneseFlags: flags & ~ordinary,
                  matchCase: (flags & TransliterationFlags.IGNORE_CASE) === 0,
                  matchCharacterWidth: (flags & TransliterationFlags.IGNORE_WIDTH) === 0,
                });
              }
              setJapaneseOptionsOpen(false);
            }
          }
          restoreFocus={japaneseOptionsButton}
        />
      )}
    </>
  );
}
