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
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  CommandPopupMenu,
  type CommandPopupMenuProps,
} from "../../../framework/browser/presentation/CommandPopupMenu";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type {
  SwNavigatorContentGroup,
  SwNavigatorContentType,
  SwNavigatorHeadingCommand,
} from "../../source/uibase/utlui/content";
import { OutlineTrackingMode } from "../../source/uibase/utlui/navicfg";
import { selectWriterPopupCommandResource } from "./writer-command-presentation";
import type { SwView } from "../../source/uibase/uiview/view";
import { SwNavigationElement } from "../../source/uibase/ribbar/workctrl";
import { WriterNavigatorNavigation } from "./WriterNavigatorNavigation";
import { WriterNavigatorRename } from "./WriterNavigatorRename";
import { queueWriterCursorReveal } from "./writer-cursor-reveal";
import { getWriterNavigatorMenuItems, navigatorOutlineLevels } from "./writer-navigator-menu";

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

const contentTitles = {
  outline: "Headings",
  table: "Tables",
  bookmark: "Bookmarks",
  hyperlink: "Hyperlinks",
  comment: "Comments",
} as const;

const headingTools = [
  ["promote", "Promote Outline Level", IndentDecrease],
  ["demote", "Demote Outline Level", IndentIncrease],
  ["chapterup", "Move Heading Up", ArrowUp],
  ["chapterdown", "Move Heading Down", ArrowDown],
] as const satisfies readonly (readonly [SwNavigatorHeadingCommand, string, typeof ArrowUp])[];

/** Projects the native content hierarchy and retains the requested outline depth. @param groups - Native content roots. @param collapsed - Retained closed entries. @param root - Optional content-navigation root. @param label - Original localized text. @returns Visible rows. */
function getRows(
  groups: readonly SwNavigatorContentGroup[],
  collapsed: ReadonlySet<string>,
  root: SwNavigatorContentType | undefined,
  label: (key: string, fallback: string) => string,
): NavigatorRow[] {
  const rows: NavigatorRow[] = [];
  for (const { type, contents: entries, alphabetical } of groups) {
    if (root && root !== type) continue;
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
        const sourceLevel = alphabetical ? 1 : (entry.level ?? 1);
        while (ancestors.length > 1 && (ancestors.at(-1)?.sourceLevel ?? 0) >= sourceLevel)
          ancestors.pop();
        const parent = ancestors.at(-1) ?? { row: group, sourceLevel: 0, hidden: false };
        const row: NavigatorRow = {
          type,
          group: false,
          id: entry.id,
          title: entry.title || (type === "outline" ? label("empty-heading", "Empty heading") : ""),
          parent: parent.row.id,
          level: parent.row.level + 1,
          children: !alphabetical && (entries[index + 1]?.level ?? 0) > sourceLevel,
        };
        const hidden = parent.hidden || collapsed.has(parent.row.id);
        if (!hidden) rows.push(row);
        if (row.children) ancestors.push({ row, sourceLevel, hidden });
      },
    );
  }
  return rows;
}

/** Expands the native path to each retained or tracked row. @param entries - Complete tree within the root and outline depth. @param ids - Rows to reveal. @param collapsed - Current closed entries. @returns Updated closed entries. */
function expandAncestors(
  entries: readonly NavigatorRow[],
  ids: readonly string[],
  collapsed: ReadonlySet<string>,
): ReadonlySet<string> {
  const byId = new Map(
    entries.map(
      /** Indexes the current tree parents. @param row - Native content entry. @returns Identity and entry. */
      (row) => [row.id, row],
    ),
  );
  const next = new Set(collapsed);
  for (const id of ids) {
    let parent = byId.get(id)?.parent;
    while (parent) {
      next.delete(parent);
      parent = byId.get(parent)?.parent;
    }
  }
  return next.size === collapsed.size ? collapsed : next;
}

/** Presents the original page toolbar and navigable content hierarchy for the active Writer view. @param props - Native tree owner and document focus callbacks. @returns Retained Navigator child window. */
export function WriterNavigator({
  view,
  visible,
  editingHost,
  focusDocument,
  commandSource,
  resolveArguments,
}: Readonly<
  BrowserCommandSurfaceProps & {
    view: SwView;
    visible: boolean;
    editingHost: RefObject<HTMLElement | null>;
    focusDocument: () => void;
  }
>): React.JSX.Element {
  const tree = view.GetNavigator();
  const localization = useBrowserLocalization();
  const treeRef = useRef<HTMLUListElement>(null);
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(
    /** Holds native expanded-state preferences for this window lifetime. @returns Closed entries. */
    () => new Set(),
  );
  const [selected, setSelected] = useState<string | null>("");
  const [renaming, setRenaming] = useState<string>();
  const [extended, setExtended] = useState<readonly string[]>(
    /** Starts an already rooted outline at the category row. @returns Initial multi-selection. */
    () => (tree.GetRootType() === "outline" ? ["outline"] : []),
  );
  const selectionAnchor = useRef("");
  const trackedScroll = useRef<string | undefined>(undefined);
  const headingCommandActive = useRef(false);
  const [outlineLevel, setOutlineLevel] = useState(
    /** Restores the native configuration before building the tree. @returns Initial outline depth. */
    () => tree.GetOutlineLevel(),
  );
  const root = tree.GetRootType();
  const [popup, setPopup] = useState<
    | {
        rowId: string;
        position: CommandPopupMenuProps["position"];
        items: CommandPopupMenuProps["items"];
      }
    | undefined
  >();
  if (!visible && popup !== undefined) setPopup(undefined);
  if (!visible && renaming !== undefined) setRenaming(undefined);
  /** Looks up the application's translation for a native Navigator label. @param key - Control identity. @param fallback - Source label. @returns Label. */
  function label(key: string, fallback: string): string {
    return localization.GetText(`writer.navigator.${key}`, fallback);
  }
  const rows = getRows(visible ? tree.GetContents() : [], collapsed, root, label);
  const selectedRow =
    rows.find(
      /** Resolves the existing focus identity after a document edit. @param row - Mounted tree row. @returns Selection match. */
      (row) => row.id === selected,
    ) ?? rows[0];
  const popupRow = popup
    ? rows.find(
        /** Locates the context row while it is still visible. @param row - Navigator entry. @returns Whether it owns the menu. */
        (row) => row.id === popup.rowId,
      )
    : undefined;
  const multiple = root === "outline";
  const selectedIds = new Set(
    multiple ? extended : selectedRow && selected !== null ? [selectedRow.id] : [],
  );
  const headings = rows.flatMap(
    /** Resolves the selected visible heading identities in tree order. @param row - Tree entry. @returns Selection identity, if applicable. */
    (row) => (row.type === "outline" && !row.group && selectedIds.has(row.id) ? [row.id] : []),
  );
  const bookmarkRow =
    selectedRow?.type === "bookmark" && selectedIds.has(selectedRow.id) ? selectedRow : undefined;
  const deleteBookmark = bookmarkRow && (!bookmarkRow.group || bookmarkRow.children);
  const editBookmark =
    bookmarkRow && !bookmarkRow.group && tree.IsSelectedBookmarkAtCursor(bookmarkRow.id);

  useEffect(
    /** Releases grouped heading tracking after the retained tree selection is displayed. @returns Nothing. */
    () => {
      headingCommandActive.current = false;
    },
    [extended],
  );

  useEffect(
    /** Restores native content tree focus when the retained Navigator is shown. @returns Nothing. */
    () => {
      if (!visible) return;
      const entry = treeRef.current?.querySelector<HTMLElement>('[tabindex="0"]');
      (entry ?? treeRef.current)?.focus();
    },
    [visible],
  );

  const trackDocumentCursor = useEffectEvent(
    /** Follows the native document cursor while the tree is unfocused. @returns Nothing. */
    () => {
      const contents = treeRef.current;
      if (
        !visible ||
        !view.IsNavigatorVisible() ||
        headingCommandActive.current ||
        !contents ||
        (!editingHost.current?.contains(contents.ownerDocument.activeElement) &&
          !view.GetPostItMgr().GetActiveSidebarWin()?.HasFocus?.())
      )
        return;
      const id = tree.UpdateTracking(root);
      if (id === null) return;
      if (id === undefined) {
        setSelected(null);
        if (multiple) setExtended([]);
        return;
      }
      if (selectedIds.size === 1 && selectedIds.has(id)) return;
      const entries = getRows(tree.GetContents(), new Set(), root, label);
      const entry = entries.find(
        /** Checks whether the tracked row passes the outline depth setting. @param row - Candidate tree item. @returns Whether it is tracked. */
        (row) => row.id === id,
      );
      if (!entry) return;
      const focused =
        entry.type === "outline" && tree.GetOutlineTracking() === OutlineTrackingMode.Focus;
      const closed = new Set(collapsed);
      if (focused)
        for (const row of entries) if (row.parent === "outline" && row.children) closed.add(row.id);
      setCollapsed(expandAncestors(entries, [id], focused ? closed : collapsed));
      setSelected(id);
      if (multiple) setExtended([id]);
      selectionAnchor.current = id;
      trackedScroll.current = id;
    },
  );
  useEffect(
    /** Observes native cursor and focus activity in the active document. @returns Listener cleanup. */
    () => {
      if (!visible) return;
      return view.GetWrtShell().Subscribe(
        /** Tracks either a standalone cursor event or a committed selection transaction. @param hint - Current Writer state notification. @returns Nothing. */
        (hint) => {
          if (
            hint.kind === "cursor-selection-changed" ||
            (hint.kind === "model-transaction" &&
              hint.hints.some(
                /** Detects a cursor notification in the model transaction. @param change - Original atomic hint. @returns Whether the cursor changed. */
                (change) => change.kind === "cursor-selection-changed",
              ))
          )
            trackDocumentCursor();
        },
      );
    },
    [view, visible],
  );
  useEffect(
    /** Resumes tracking when focus returns to the document even without moving its cursor. @returns Listener cleanup. */
    () => {
      if (!visible) return;
      const owner = editingHost.current?.ownerDocument;
      /** Tracks the document or its native annotation window after leaving the tree. @returns Nothing. */
      function onFocus(): void {
        trackDocumentCursor();
      }
      owner?.addEventListener("focusin", onFocus);
      /** Releases the document focus listener. @returns Nothing. */
      function releaseFocusListener(): void {
        owner?.removeEventListener("focusin", onFocus);
      }
      return releaseFocusListener;
    },
    [editingHost, visible],
  );
  useLayoutEffect(
    /** Reveals the tracked row after its ancestors are rendered. @returns Nothing. */
    () => {
      const id = trackedScroll.current;
      if (id === undefined || id !== selected) return;
      trackedScroll.current = undefined;
      rowRefs.current.get(id)?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
    },
    [selected, collapsed],
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

  /** Updates the shared outline level from either native control. @param level - Selected visible depth. @returns Nothing. */
  function changeOutlineLevel(level: number): void {
    tree.SetOutlineLevel(level);
    setOutlineLevel(level);
  }

  /** Deletes the row or its bookmark category through the existing native history owner. @param row - Selected bookmark row or group. @returns Nothing. */
  function removeBookmarks(row: NavigatorRow): void {
    if (!tree.DeleteBookmarks(row.group ? undefined : row.id)) return;
    setSelected("bookmark");
    reveal();
  }

  /** Routes an editable entry through the original dialog or annotation editor. @param row - Target content entry. @returns Nothing. */
  function editContent(row: NavigatorRow): void {
    if (row.type === "table" && tree.GotoContent(row.id))
      view.Execute(WRITER_COMMAND_IDS.tableDialog);
    else if (row.type === "hyperlink" && tree.SelectHyperlink(row.id))
      view.Execute(WRITER_COMMAND_IDS.editHyperlink);
    else if (row.type === "comment") tree.EditComment(row.id);
  }

  /** Removes a represented hyperlink attribute or annotation through its native owner. @param row - Target content or group. @returns Nothing. */
  function deleteContent(row: NavigatorRow): void {
    if (row.type === "table") {
      if (row.group) {
        if (tree.DeleteTables()) reveal();
      } else if (tree.GotoContent(row.id)) {
        const result = view.Execute(WRITER_COMMAND_IDS.deleteTable);
        if (result.status === "executed" && result.value === true) reveal();
      }
    } else if (row.type === "hyperlink" && tree.SelectHyperlink(row.id)) {
      view.Execute(WRITER_COMMAND_IDS.removeHyperlink);
      reveal();
    } else if (row.type === "comment") {
      if (row.group) void tree.DeleteComments();
      else if (tree.DeleteComment(row.id)) reveal();
    }
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
      tree.SetRootType();
      setExtended([]);
      return;
    }
    if (!selectedRow) return;
    tree.SetRootType(selectedRow.type);
    selectionAnchor.current = selectedRow.id;
    setExtended([selectedRow.id]);
  }

  /** Applies the selected headings and reveals the retained native outline rows. @param command - Heading toolbar action. @param withChildren - Whether descendants move with their parent. @param selection - Heading identities when a native popup opened. @returns Nothing. */
  function runHeadingCommand(
    command: SwNavigatorHeadingCommand,
    withChildren: boolean,
    selection: readonly string[] = headings,
  ): void {
    let retained: readonly string[];
    headingCommandActive.current = true;
    try {
      retained = tree.ExecCommand(selection, command, withChildren);
    } finally {
      headingCommandActive.current = false;
    }
    if (retained.length === 0) return;
    if (!multiple) {
      reveal();
      return;
    }
    headingCommandActive.current = true;
    setExtended(retained);
    const active =
      selected !== null && retained.includes(selected) ? selected : (retained[0] ?? "");
    setSelected(active);
    selectionAnchor.current = active;
    setCollapsed(
      expandAncestors(getRows(tree.GetContents(), new Set(), root, label), retained, collapsed),
    );
  }

  /** Applies native tree navigation and activation keys. @param event - Focused tree key action. @returns Nothing. */
  function handleTreeKey(event: KeyboardEvent<HTMLUListElement>): void {
    if (selectedRow && (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10"))) {
      event.preventDefault();
      event.stopPropagation();
      const rect = rowRefs.current.get(selectedRow.id)?.getBoundingClientRect();
      if (rect) openContextMenu(selectedRow, { x: rect.left, y: rect.bottom });
      return;
    }
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

  /** Opens the original content-type popup against a selected tree row. @param row - Row receiving the popup request. @param position - Browser device point. @returns Nothing. */
  function openContextMenu(row: NavigatorRow, position: CommandPopupMenuProps["position"]): void {
    const alreadySelected = selectedIds.has(row.id);
    if (!alreadySelected) select(row, false, false);
    rowRefs.current.get(row.id)?.focus({ preventScroll: true });
    setPopup({
      rowId: row.id,
      position,
      items: menuItems(row, alreadySelected ? headings : [row.id]),
    });
  }

  /** Finds every expandable heading in the requested branch. @param row - Current outline entry. @returns Original expandable branch identities. */
  function outlineBranch(row: NavigatorRow): string[] {
    if (row.type !== "outline" || !row.children) return [];
    const entries = getRows(tree.GetContents(), new Set(), root, label);
    const index = entries.findIndex(
      /** Locates the subtree start in the full depth-limited tree. @param entry - Complete tree row. @returns Whether it is the root. */
      (entry) => entry.id === row.id,
    );
    const branch = [row.id];
    for (let i = index + 1; i < entries.length; i++) {
      const entry = entries[i];
      if (!entry || entry.level <= row.level) break;
      if (entry.children) branch.push(entry.id);
    }
    return branch;
  }

  /** Collapses categories while retaining descendant expansion state. @param row - Context row. @param categories - Open categories. @returns Nothing. */
  function collapseCategories(row: NavigatorRow, categories: readonly NavigatorRow[]): void {
    const next = new Set(collapsed);
    for (const category of categories) next.add(category.id);
    setCollapsed(next);
    setSelected(row.type);
    rowRefs.current.get(row.type)?.focus({ preventScroll: true });
  }

  /** Projects the current tree's native context action state. @param row - Owning menu row. @param selection - Heading selection at popup admission. @returns Connected menu entries. */
  function menuItems(
    row: NavigatorRow,
    selection: readonly string[],
  ): ReturnType<typeof getWriterNavigatorMenuItems> {
    const branch = outlineBranch(row);
    const allExpanded = branch.length
      ? branch.every(
          /** Tests whether the native branch contains any closed parent. @param id - Expandable row. @returns Whether it is open. */
          (id) => !collapsed.has(id),
        )
      : undefined;
    const categories = rows.filter(
      /** Collects open top-level categories without changing their descendants. @param entry - Visible row. @returns Whether it is a category to collapse. */
      (entry) => entry.group && entry.children && !collapsed.has(entry.id),
    );
    return getWriterNavigatorMenuItems(tree, {
      type: row.type,
      group: row.group,
      allExpanded,
      canCollapseCategories: root === undefined && categories.length > 0,
      hasContents: !row.group || row.children === true,
      readOnly: view.GetWrtShell().GetViewOptions().IsReadonly(),
      canDeleteTable: row.type === "table" && tree.CanDeleteTable(row.group ? undefined : row.id),
      label,
      toggleOutlineBranch:
        /** Applies the native expand or collapse operation to the whole outline branch. @returns Nothing. */ () => {
          const next = new Set(collapsed);
          for (const id of branch)
            if (allExpanded) next.add(id);
            else next.delete(id);
          setCollapsed(next);
        },
      goTo: /** Moves the Writer cursor to the content entry. @returns Nothing. */ () =>
        activate(row),
      selectContent:
        /** Selects the table through the native table slot. @returns Nothing. */ () => {
          if (!tree.GotoContent(row.id)) return;
          if (view.Execute(WRITER_COMMAND_IDS.selectTable).status === "executed") reveal();
        },
      runHeadingCommand:
        /** Applies a native context action with sublevels. @param command - Original heading operation. @returns Nothing. */ (
          command,
        ) => runHeadingCommand(command, true, selection),
      deleteBookmarks:
        /** Reuses the toolbar action for the same selected bookmark target. @returns Nothing. */ () =>
          removeBookmarks(row),
      editContent: /** Opens the original editor for the selected entry. @returns Nothing. */ () =>
        editContent(row),
      renameContent: /** Opens the native editable table label. @returns Nothing. */ () =>
        setRenaming(row.id),
      deleteContent:
        /** Removes the selected content through its native action. @returns Nothing. */ () =>
          deleteContent(row),
      setOutlineLevel: changeOutlineLevel,
      collapseCategories:
        /** Collapses the current tree's top-level categories. @returns Nothing. */ () =>
          collapseCategories(row, categories),
    });
  }

  const title = label("title", "Navigator");
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
        <WriterNavigatorNavigation
          view={view}
          editingHost={editingHost}
          visible={visible}
          label={label}
          selectType={
            /** Selects the matching native category without altering document selection. @param type - Navigation element. @returns Nothing. */
            (type) => {
              const category = {
                [SwNavigationElement.Table]: "table",
                [SwNavigationElement.Heading]: "outline",
                [SwNavigationElement.Bookmark]: "bookmark",
                [SwNavigationElement.Comment]: "comment",
              } as const;
              if (!(type in category)) return;
              const row = rows.find(
                /** Finds the existing category in the current tree. @param entry - Current entry. @returns Whether it is the requested category. */
                (entry) => entry.group && entry.type === category[type as keyof typeof category],
              );
              if (row) select(row);
            }
          }
        />
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
            (event) => changeOutlineLevel(Number(event.currentTarget.value))
          }
        >
          {outlineLevel === 0 && (
            <option hidden value={0}>
              0
            </option>
          )}
          {navigatorOutlineLevels.map(
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
              () => removeBookmarks(bookmarkRow)
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
              onContextMenu={
                /** Opens the Writer tree's row-specific popup. @param event - Context request. @returns Nothing. */
                (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  openContextMenu(row, { x: event.clientX, y: event.clientY });
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
              {renaming === row.id ? (
                <WriterNavigatorRename
                  title={row.title}
                  label={label("table-name", "Table name")}
                  onComplete={
                    /** Commits the native table rename and returns focus to the tree. @param name - New name or canceled edit. @returns Nothing. */
                    (name) => {
                      setRenaming(undefined);
                      if (name !== undefined) tree.RenameTable(row.id, name);
                      rowRefs.current.get(row.id)?.focus({ preventScroll: true });
                    }
                  }
                />
              ) : (
                <span className={row.group ? "truncate font-semibold" : "truncate"}>
                  {row.title}
                </span>
              )}
            </li>
          ),
        )}
      </ul>
      {visible &&
        popup &&
        popupRow &&
        createPortal(
          <CommandPopupMenu
            ariaLabel={label("context-menu", "Navigator context menu")}
            commandSource={commandSource}
            getCommandResource={
              /** Resolves standard command labels for bindings-backed popup entries. @param url - Command URL. @returns Display resource. */
              (url) => selectWriterPopupCommandResource(localization, url)
            }
            items={popup.items}
            position={popup.position}
            onClose={
              /** Dismisses the current Navigator popup. @returns Nothing. */ () =>
                setPopup(undefined)
            }
            resolveArguments={resolveArguments}
          />,
          document.body,
        )}
    </section>
  );
}
