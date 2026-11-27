/** @fileoverview Renders the native Writer Navigator toolbar and content tree as a retained modeless window. */
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  IndentDecrease,
  IndentIncrease,
  ListTree,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type {
  SwNavigatorContentGroup,
  SwNavigatorContentType,
  SwNavigatorHeadingCommand,
} from "../../source/uibase/utlui/content";
import type { SwView } from "../../source/uibase/uiview/view";
import { queueWriterCursorReveal } from "./writer-cursor-reveal";

/** One visible original content tree row and its keyboard ancestry. */
interface NavigatorRow {
  readonly id: string;
  readonly title: string;
  readonly type: SwNavigatorContentType;
  readonly level: number;
  readonly group: boolean;
  readonly parent?: string;
  readonly children?: boolean;
}

const contentTitles = { outline: "Headings", table: "Tables", bookmark: "Bookmarks" } as const;

const headingTools = [
  ["promote", "Promote Outline Level", IndentDecrease],
  ["demote", "Demote Outline Level", IndentIncrease],
  ["chapterup", "Move Heading Up", ArrowUp],
  ["chapterdown", "Move Heading Down", ArrowDown],
] as const satisfies readonly (readonly [SwNavigatorHeadingCommand, string, typeof ArrowUp])[];

/** Projects the native content hierarchy and retains the requested outline depth. @param groups - Native content roots. @param outlineLevel - Maximum visible heading level. @param collapsed - Retained closed entries. @param root - Optional content-navigation root. @param label - Original localized text. @returns Visible rows. */
function getRows(
  groups: readonly SwNavigatorContentGroup[],
  outlineLevel: number,
  collapsed: ReadonlySet<string>,
  root: SwNavigatorContentType | undefined,
  label: (key: string, fallback: string) => string,
): NavigatorRow[] {
  const rows: NavigatorRow[] = [];
  for (const { type, contents } of groups) {
    if (root && root !== type) continue;
    const entries = contents.filter(
      /** Filters deeper outlines as the native level control does. @param content - Existing content entry. @returns Whether visible at the selected depth. */
      (content) => (content.level ?? 1) <= outlineLevel,
    );
    const group: NavigatorRow = {
      type,
      group: true,
      id: type,
      title: label(type, contentTitles[type]),
      level: 1,
      children: entries.length > 0,
    };
    rows.push(group);
    if (collapsed.has(group.id)) continue;
    const ancestors: { row: NavigatorRow; sourceLevel: number; hidden: boolean }[] = [
      { row: group, sourceLevel: 0, hidden: false },
    ];
    entries.forEach(
      /** Keeps each existing outline under its closest original heading. @param entry - Current content entry. @param index - Position in the filtered root. @returns Nothing. */
      (entry, index) => {
        const sourceLevel = entry.level ?? 1;
        while (ancestors.length > 1 && (ancestors.at(-1)?.sourceLevel ?? 0) >= sourceLevel)
          ancestors.pop();
        const parent = ancestors.at(-1) ?? { row: group, sourceLevel: 0, hidden: false };
        const row: NavigatorRow = {
          type,
          group: false,
          id: entry.id,
          title: entry.title || label("empty-heading", "Empty heading"),
          parent: parent.row.id,
          level: parent.row.level + 1,
          children: (entries[index + 1]?.level ?? 0) > sourceLevel,
        };
        const hidden = parent.hidden || collapsed.has(parent.row.id);
        if (!hidden) rows.push(row);
        if (row.children) ancestors.push({ row, sourceLevel, hidden });
      },
    );
  }
  return rows;
}

/** Presents the original page toolbar and navigable content hierarchy for the active Writer view. @param props - Native tree owner and document focus callbacks. @returns Retained Navigator child window. */
export function WriterNavigator({
  view,
  visible,
  editingHost,
  focusDocument,
}: Readonly<{
  view: SwView;
  visible: boolean;
  editingHost: RefObject<HTMLElement | null>;
  focusDocument: () => void;
}>): React.JSX.Element {
  const tree = view.GetNavigator();
  const localization = useBrowserLocalization();
  const treeRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    /** Holds native expanded-state preferences for this window lifetime. @returns Closed entries. */
    () => new Set(),
  );
  const [selected, setSelected] = useState("");
  const [extended, setExtended] = useState<readonly string[]>([]);
  const selectionAnchor = useRef("");
  const [outlineLevel, setOutlineLevel] = useState(10);
  const [root, setRoot] = useState<SwNavigatorContentType>();
  const [pageDraft, setPageDraft] = useState<{ origin: number; value: string }>();
  const page = tree.GetPageState();
  /** Looks up the application's translation for a native Navigator label. @param key - Control identity. @param fallback - Source label. @returns Label. */
  function label(key: string, fallback: string): string {
    return localization.GetText(`writer.navigator.${key}`, fallback);
  }
  const rows = getRows(visible ? tree.GetContents() : [], outlineLevel, collapsed, root, label);
  const selectedRow =
    rows.find(
      /** Resolves the existing focus identity after a document edit. @param row - Mounted tree row. @returns Selection match. */
      (row) => row.id === selected,
    ) ?? rows[0];
  const multiple = root === "outline";
  const selectedIds = new Set(multiple ? extended : selectedRow ? [selectedRow.id] : []);
  const headings = rows.flatMap(
    /** Resolves the selected visible heading identities in tree order. @param row - Tree entry. @returns Selection identity, if applicable. */
    (row) => (row.type === "outline" && !row.group && selectedIds.has(row.id) ? [row.id] : []),
  );
  const bookmarkRow = selectedRow?.type === "bookmark" ? selectedRow : undefined;
  const deleteBookmark = bookmarkRow && (!bookmarkRow.group || bookmarkRow.children);
  const editBookmark =
    bookmarkRow && !bookmarkRow.group && tree.IsSelectedBookmarkAtCursor(bookmarkRow.id);

  useEffect(
    /** Restores native content tree focus when the retained Navigator is shown. @returns Nothing. */
    () => {
      if (!visible) return;
      const entry = treeRef.current?.querySelector<HTMLElement>('[tabindex="0"]');
      (entry ?? treeRef.current)?.focus();
    },
    [visible],
  );

  /** Closes the child window and restores focus to Writer. @returns Nothing. */
  function close(): void {
    view.ToggleNavigator();
    focusDocument();
  }

  /** Shows the position the native cursor has moved to. @param number - Optional physical page. @returns Nothing. */
  function reveal(number?: number): void {
    focusDocument();
    queueWriterCursorReveal(editingHost, number);
  }

  /** Expands or collapses the selected native tree row. @param row - Content heading or group. @returns Nothing. */
  function toggle(row: NavigatorRow): void {
    if (!row.children) return;
    setCollapsed(
      /** Keeps other native entries and their expansion state. @param previous - Current closed entries. @returns Updated tree state. */
      (previous) => {
        const next = new Set(previous);
        if (!next.delete(row.id)) next.add(row.id);
        return next;
      },
    );
  }

  /** Activates a content row through the actual Writer cursor. @param row - Existing tree entry. @returns Nothing. */
  function activate(row: NavigatorRow): void {
    if (row.group) toggle(row);
    else if (tree.GotoContent(row.id)) reveal();
  }

  /** Navigates to an existing physical page. @param number - One-based page number. @returns Nothing. */
  function goToPage(number: number): void {
    if (!tree.GotoPage(number)) return;
    setPageDraft(undefined);
    reveal(number);
  }

  /** Selects a tree row and applies extended selection in the heading root. @param row - Newly active entry. @param extend - Include the range from the selection anchor. @param primary - Toggle an entry or add a range. @returns Nothing. */
  function select(row: NavigatorRow, extend = false, primary = false): void {
    setSelected(row.id);
    if (!multiple) return;
    if (extend) {
      const position = rows.indexOf(row);
      const anchor = rows.findIndex(
        /** Resolves the current selection anchor. @param entry - Visible row. @returns Whether this is the anchor. */
        (entry) => entry.id === selectionAnchor.current,
      );
      const start = anchor < 0 ? position : anchor;
      const range = rows.slice(Math.min(start, position), Math.max(start, position) + 1).map(
        /** Uses stable tree identities to retain the selected range after edits. @param entry - Visible row in the range. @returns Row identity. */
        (entry) => entry.id,
      );
      setExtended(primary ? [...new Set([...extended, ...range])] : range);
    } else {
      selectionAnchor.current = row.id;
      setExtended(
        !primary
          ? [row.id]
          : selectedIds.has(row.id)
            ? extended.filter(
                /** Removes the toggled identity. @param id - Selected row. @returns Whether it remains selected. */
                (id) => id !== row.id,
              )
            : [...extended, row.id],
      );
    }
  }

  /** Switches to or from native content root navigation with its matching selection mode. @returns Nothing. */
  function toggleRoot(): void {
    if (root) {
      setRoot(undefined);
      setExtended([]);
      return;
    }
    const entry = selectedRow?.id ?? "";
    setRoot(selectedRow?.type ?? "outline");
    selectionAnchor.current = entry;
    setExtended(entry ? [entry] : []);
  }

  /** Applies the selected headings and reveals the retained native outline rows. @param command - Heading toolbar action. @param withChildren - Whether descendants move with their parent. @returns Nothing. */
  function runHeadingCommand(command: SwNavigatorHeadingCommand, withChildren: boolean): void {
    const retained = tree.ExecCommand(headings, command, withChildren);
    if (retained.length === 0) return;
    if (!multiple) {
      reveal();
      return;
    }
    setExtended(retained);
    const active =
      selectedIds.has(selected) && retained.includes(selected) ? selected : (retained[0] ?? "");
    setSelected(active);
    selectionAnchor.current = active;
    const byId = new Map(
      getRows(tree.GetContents(), outlineLevel, new Set(), root, label).map(
        /** Indexes current tree parents after the chapter change. @param row - Live outline row. @returns Identity and tree entry. */
        (row) => [row.id, row],
      ),
    );
    const next = new Set(collapsed);
    for (const id of retained) {
      let parent = byId.get(id)?.parent;
      while (parent) {
        next.delete(parent);
        parent = byId.get(parent)?.parent;
      }
    }
    setCollapsed(next);
  }

  /** Applies native tree navigation and activation keys. @param event - Focused tree key action. @returns Nothing. */
  function handleTreeKey(event: KeyboardEvent<HTMLUListElement>): void {
    if (!selectedRow) return;
    const primary = event.ctrlKey || event.metaKey;
    if (
      multiple &&
      primary &&
      !event.altKey &&
      !event.shiftKey &&
      event.key.toLowerCase() === "a"
    ) {
      event.preventDefault();
      event.stopPropagation();
      setExtended(
        rows.map(
          /** Selects all visible rows in the heading root. @param row - Mounted outline tree entry. @returns Row identity. */
          (row) => row.id,
        ),
      );
      return;
    }
    const index = rows.indexOf(selectedRow);
    let next: NavigatorRow | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = rows[index + 1];
        break;
      case "ArrowUp":
        next = rows[index - 1];
        break;
      case "Home":
        next = rows[0];
        break;
      case "End":
        next = rows.at(-1);
        break;
      case "ArrowRight":
        if (collapsed.has(selectedRow.id)) toggle(selectedRow);
        else if (selectedRow.children) next = rows[index + 1];
        break;
      case "ArrowLeft":
        if (selectedRow.children && !collapsed.has(selectedRow.id)) toggle(selectedRow);
        else
          next = rows.find(
            /** Finds the original parent row. @param row - Visible entry. @returns Whether it is the parent. */
            (row) => row.id === selectedRow.parent,
          );
        break;
      case " ":
        if (multiple && (primary || event.shiftKey)) {
          select(selectedRow, event.shiftKey, primary);
          break;
        }
        activate(selectedRow);
        break;
      case "Enter":
        activate(selectedRow);
        break;
      default:
        return;
    }
    event.preventDefault();
    if (!next) return;
    if (multiple && primary && !event.shiftKey) setSelected(next.id);
    else select(next, event.shiftKey, primary);
    rowRefs.current.get(next.id)?.focus();
  }

  const title = label("title", "Navigator");
  const previous = label("previous-page", "Previous Page");
  const next = label("next-page", "Next Page");
  const currentPage = pageDraft?.origin === page.current ? pageDraft.value : String(page.current);
  return (
    <section
      aria-label={title}
      role="dialog"
      hidden={!visible}
      className={
        visible
          ? "absolute top-3 right-3 z-30 flex max-h-[calc(100%-1.5rem)] w-72 max-w-[calc(100%-1.5rem)] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl print:hidden"
          : "hidden"
      }
      onKeyDown={
        /** Closes the original Navigator window on its cancel key. @param event - Navigator key action. @returns Nothing. */
        (event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }
    >
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">
        <h2 className="font-semibold">{title}</h2>
        <button
          type="button"
          aria-label={label("close", "Close Navigator")}
          className="rounded p-1 hover:bg-slate-200"
          onClick={close}
        >
          <X size={16} />
        </button>
      </div>
      <div
        role="toolbar"
        aria-label={label("navigation", "Navigation")}
        className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-slate-200 p-2"
      >
        <button
          type="button"
          aria-label={previous}
          title={previous}
          disabled={page.current <= 1}
          className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"
          onClick={
            /** Goes to the previous physical page. @returns Nothing. */ () =>
              goToPage(page.current - 1)
          }
        >
          <ArrowUp size={16} />
        </button>
        <input
          type="number"
          min={1}
          max={page.count}
          value={currentPage}
          aria-label={label("go-to-page", "Go to page")}
          className="w-14 rounded border border-slate-300 px-1 text-sm"
          onChange={
            /** Retains the page-number draft. @param event - Input change. @returns Nothing. */
            (event) => setPageDraft({ origin: page.current, value: event.currentTarget.value })
          }
          onKeyDown={
            /** Submits the original Go to page field. @param event - Input key. @returns Nothing. */
            (event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              const requested = event.currentTarget.valueAsNumber;
              if (Number.isFinite(requested))
                goToPage(Math.max(1, Math.min(page.count, Math.trunc(requested))));
            }
          }
        />
        <button
          type="button"
          aria-label={next}
          title={next}
          disabled={page.current >= page.count}
          className="rounded p-1 hover:bg-slate-100 disabled:opacity-40"
          onClick={
            /** Goes to the next physical page. @returns Nothing. */ () =>
              goToPage(page.current + 1)
          }
        >
          <ArrowDown size={16} />
        </button>
        <button
          type="button"
          aria-label={label("content-view", "Content Navigation View")}
          title={label("content-view", "Content Navigation View")}
          aria-pressed={root !== undefined}
          className="ml-auto rounded p-1 hover:bg-slate-100 aria-pressed:bg-slate-200"
          onClick={toggleRoot}
        >
          <ListTree size={16} />
        </button>
        <select
          value={outlineLevel}
          aria-label={label("outline-level", "Show Up to Outline Level")}
          title={label("outline-level", "Show Up to Outline Level")}
          className="rounded border border-slate-300 px-1 text-sm"
          onChange={
            /** Sets the original maximum outline level. @param event - Level choice. @returns Nothing. */
            (event) => setOutlineLevel(Number(event.currentTarget.value))
          }
        >
          {Array.from(
            { length: 10 },
            /** Presents a native outline depth. @param _unused - Empty slot. @param index - Level offset. @returns Number. */ (
              _unused,
              index,
            ) => index + 1,
          ).map(
            /** Presents one original heading depth. @param level - Maximum depth. @returns Entry. */
            (level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ),
          )}
        </select>
      </div>
      {/* Keep the first click on a heading from shifting its row during double-click. */}
      <div
        role="toolbar"
        aria-label={
          bookmarkRow
            ? label("bookmark-tools", "Bookmark Tools")
            : label("heading-tools", "Heading Tools")
        }
        className={`flex min-h-8 shrink-0 items-center gap-1.5 border-b border-slate-200 px-2 py-1 ${headings.length > 0 || deleteBookmark || editBookmark ? "" : "invisible"}`}
      >
        {!bookmarkRow &&
          headingTools.map(
            /** Renders the original selection-specific heading buttons in toolbar order. @param tool - Original ID, tooltip and browser icon. @returns Native button. */
            ([command, fallback, Icon]) => {
              const title = label(command, fallback);
              return (
                <button
                  key={command}
                  type="button"
                  aria-label={title}
                  title={title}
                  className="rounded p-1 hover:bg-slate-100"
                  onClick={
                    /** Runs the heading button, excluding sublevels with the primary modifier alone. @param event - Original pointer or keyboard activation. @returns Nothing. */
                    (event) => {
                      const withoutChildren =
                        event.ctrlKey !== event.metaKey && !event.shiftKey && !event.altKey;
                      runHeadingCommand(command, !withoutChildren);
                    }
                  }
                >
                  <Icon size={16} />
                </button>
              );
            },
          )}
        {editBookmark && (
          <button
            type="button"
            aria-label={label("edit-bookmark", "Edit Bookmark")}
            title={label("edit-bookmark", "Edit Bookmark")}
            className="rounded p-1 hover:bg-slate-100"
            onClick={
              /** Dispatches the source EditBookmark slot with the selected mark name. @returns Nothing. */
              () => {
                view.Execute(WRITER_COMMAND_IDS.editBookmark, { Bookmark: bookmarkRow.title });
              }
            }
          >
            <Pencil size={16} />
          </button>
        )}
        {deleteBookmark && (
          <button
            type="button"
            aria-label={
              bookmarkRow.group
                ? label("delete-all-bookmarks", "Delete All Bookmarks")
                : label("delete-bookmark", "Delete Bookmark")
            }
            title={
              bookmarkRow.group
                ? label("delete-all-bookmarks", "Delete All Bookmarks")
                : label("delete-bookmark", "Delete Bookmark")
            }
            className="rounded p-1 hover:bg-slate-100"
            onClick={
              /** Deletes the selected mark or all marks under the Bookmark category. @returns Nothing. */
              () => {
                if (!tree.DeleteBookmarks(bookmarkRow.group ? undefined : bookmarkRow.id)) return;
                setSelected("bookmark");
                reveal();
              }
            }
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      <ul
        ref={treeRef}
        tabIndex={rows.length === 0 ? 0 : -1}
        role="tree"
        aria-label={label("content", "Document content")}
        aria-multiselectable={multiple || undefined}
        className="min-h-0 flex-1 overflow-auto p-2 text-sm"
        onKeyDown={handleTreeKey}
      >
        {rows.map(
          /** Presents a retained native tree row. @param row - Content or group. @returns Accessible tree item. */
          (row) => (
            <li
              key={row.id}
              role="treeitem"
              aria-level={row.level}
              aria-selected={selectedIds.has(row.id)}
              aria-expanded={row.children ? !collapsed.has(row.id) : undefined}
              tabIndex={selectedRow?.id === row.id ? 0 : -1}
              className="flex min-h-7 cursor-default select-none items-center gap-1 truncate rounded pe-1 hover:bg-slate-50 aria-selected:bg-indigo-50"
              style={{ paddingInlineStart: (row.level - 1) * 14 }}
              ref={
                /** Registers the live row for native keyboard focus. @param item - Mounted item. @returns Nothing. */
                (item) => {
                  if (item) rowRefs.current.set(row.id, item);
                  else rowRefs.current.delete(row.id);
                }
              }
              onFocus={
                /** Selects the focused entry. @returns Nothing. */ () => setSelected(row.id)
              }
              onClick={
                /** Selects a row with native extending and toggling modifiers. @param event - Pointer event. @returns Nothing. */
                (event) => {
                  select(row, event.shiftKey, event.ctrlKey || event.metaKey);
                  if (row.group && !event.shiftKey && !event.ctrlKey && !event.metaKey) toggle(row);
                }
              }
              onDoubleClick={
                /** Activates a content entry. @returns Nothing. */ () => {
                  if (!row.group) activate(row);
                }
              }
            >
              {row.children ? (
                <span
                  aria-hidden="true"
                  className="flex w-4 shrink-0 justify-center"
                  onClick={
                    /** Toggles the original disclosure target independently from content activation. @param event - Pointer event. @returns Nothing. */
                    (event) => {
                      event.stopPropagation();
                      if (!multiple) setSelected(row.id);
                      toggle(row);
                    }
                  }
                >
                  {collapsed.has(row.id) ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                </span>
              ) : (
                <span aria-hidden="true" className="w-4 shrink-0" />
              )}
              <span className={row.group ? "truncate font-semibold" : "truncate"}>{row.title}</span>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
