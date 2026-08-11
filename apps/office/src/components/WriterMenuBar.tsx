/**
 * @fileoverview Renders the implemented Writer commands in their pinned LibreOffice menu locations without copying native menu visuals.
 */

import { useState } from "react";

import type {
  WriterParagraphAlignment,
  WriterParagraphMoveDirection,
  WriterParagraphStyle,
} from "../domain/writer";

/** Identifies the Writer top-level menu that currently has an implemented popup. */
type ImplementedWriterMenu = "edit" | "file" | "format" | "styles" | "view";

/** Describes enabled state and immutable action callbacks exposed from the stateful Writer workbench. */
export interface WriterMenuBarProps {
  /** Alignment currently applied to the focused Writer paragraph. */
  readonly alignment: WriterParagraphAlignment;
  /** Whether moving the focused Writer paragraph toward the document end is valid. */
  readonly canMoveDown: boolean;
  /** Whether moving the focused Writer paragraph toward the document start is valid. */
  readonly canMoveUp: boolean;
  /** Whether a following history snapshot exists for Redo. */
  readonly canRedo: boolean;
  /** Whether a preceding history snapshot exists for Undo. */
  readonly canUndo: boolean;
  /** Whether browser-local storage operations are temporarily unavailable. */
  readonly isStoragePending: boolean;
  /** Whether the contextual Writer properties sidebar is currently visible. */
  readonly isSidebarVisible: boolean;
  /** Whether the Writer status bar is currently visible. */
  readonly isStatusBarVisible: boolean;
  /** Whether the horizontal Writer ruler is currently visible. */
  readonly isHorizontalRulerVisible: boolean;
  /** Applies a focused-paragraph horizontal alignment. */
  readonly onAlignmentChange: (alignment: WriterParagraphAlignment) => void;
  /** Starts the current plain-text browser download. */
  readonly onDownload: () => void;
  /** Requests browser selection of the complete rendered Writer document. */
  readonly onSelectAll: () => void;
  /** Loads the existing document identity from browser-local storage. */
  readonly onLoad: () => void;
  /** Moves the focused paragraph by one valid adjacent position. */
  readonly onMoveParagraph: (direction: WriterParagraphMoveDirection) => void;
  /** Restores the following immutable Writer history snapshot. */
  readonly onRedo: () => void;
  /** Saves the current Writer document in browser-local storage. */
  readonly onSave: () => void;
  /** Requests the next visibility state for the Writer properties sidebar. */
  readonly onSidebarVisibilityChange: (isVisible: boolean) => void;
  /** Requests the next visibility state for the Writer status bar. */
  readonly onStatusBarVisibilityChange: (isVisible: boolean) => void;
  /** Requests the next visibility state for the Writer horizontal ruler. */
  readonly onHorizontalRulerVisibilityChange: (isVisible: boolean) => void;
  /** Applies a bounded paragraph style to the focused Writer paragraph. */
  readonly onStyleChange: (style: WriterParagraphStyle) => void;
  /** Restores the preceding immutable Writer history snapshot. */
  readonly onUndo: () => void;
  /** Bounded paragraph style currently applied to the focused Writer paragraph. */
  readonly style: WriterParagraphStyle;
}

/** Defines one top-level Writer label retained as structural placement chrome. */
interface WriterMenuLabel {
  /** Stable literal used to identify the menu whose popup is implemented, when any. */
  readonly id?: ImplementedWriterMenu;
  /** Reader-facing top-level Writer menu title. */
  readonly label: string;
}

/** Lists the pinned Writer top-level menu order while identifying the enabled subset. */
const writerMenuLabels: readonly WriterMenuLabel[] = [
  { id: "file", label: "File" },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { label: "Insert" },
  { id: "format", label: "Format" },
  { id: "styles", label: "Styles" },
  { label: "Table" },
  { label: "Tools" },
  { label: "Window" },
  { label: "Help" },
];

/**
 * Renders accessible popups for implemented Writer commands and static placement labels for the remaining menus.
 *
 * @param props - Current Writer command state and immutable transition callbacks.
 * @param props.alignment - Current focused-paragraph alignment.
 * @param props.canMoveDown - Whether the Move Item Down menu entry is enabled.
 * @param props.canMoveUp - Whether the Move Item Up menu entry is enabled.
 * @param props.canRedo - Whether the Edit Redo menu entry is enabled.
 * @param props.canUndo - Whether the Edit Undo menu entry is enabled.
 * @param props.isHorizontalRulerVisible - Whether the View Rulers horizontal item is currently checked.
 * @param props.isStoragePending - Whether File storage entries are temporarily disabled.
 * @param props.isSidebarVisible - Whether the View Sidebar check item is currently checked.
 * @param props.isStatusBarVisible - Whether the View Status Bar check item is currently checked.
 * @param props.onAlignmentChange - Callback used by Format alignment entries.
 * @param props.onDownload - Callback used by File Save As Text entry.
 * @param props.onHorizontalRulerVisibilityChange - Callback used by the View Rulers horizontal item.
 * @param props.onLoad - Callback used by File Open Local Copy entry.
 * @param props.onMoveParagraph - Callback used by Format list movement entries.
 * @param props.onRedo - Callback used by Edit Redo entry.
 * @param props.onSave - Callback used by File Save entry.
 * @param props.onSelectAll - Callback used by Edit Select All entry.
 * @param props.onSidebarVisibilityChange - Callback used by the View Sidebar check item.
 * @param props.onStatusBarVisibilityChange - Callback used by the View Status Bar check item.
 * @param props.onStyleChange - Callback used by Styles entries.
 * @param props.onUndo - Callback used by Edit Undo entry.
 * @param props.style - Current focused-paragraph style.
 * @returns A Writer-style menu bar whose enabled commands have semantic popup menus.
 */
export function WriterMenuBar({
  alignment,
  canMoveDown,
  canMoveUp,
  canRedo,
  canUndo,
  isHorizontalRulerVisible,
  isSidebarVisible,
  isStatusBarVisible,
  isStoragePending,
  onAlignmentChange,
  onDownload,
  onHorizontalRulerVisibilityChange,
  onLoad,
  onMoveParagraph,
  onRedo,
  onSave,
  onSelectAll,
  onSidebarVisibilityChange,
  onStatusBarVisibilityChange,
  onStyleChange,
  onUndo,
  style,
}: WriterMenuBarProps): React.JSX.Element {
  const [openMenu, setOpenMenu] = useState<ImplementedWriterMenu | undefined>();
  const [isRulersMenuOpen, setIsRulersMenuOpen] = useState(false);

  /**
   * Closes the active popup after one enabled menu action invokes its immutable transition.
   *
   * @param action - Existing workbench callback that performs the requested command.
   * @returns Nothing; the action runs before React hides the menu popup.
   */
  function invokeMenuAction(action: () => void): void {
    action();
    setIsRulersMenuOpen(false);
    setOpenMenu(undefined);
  }

  /**
   * Toggles a single implemented popup while ensuring no other popup remains open.
   *
   * @param menu - Implemented Writer menu requested by its top-level trigger.
   * @returns Nothing; React records the next visible popup.
   */
  function toggleMenu(menu: ImplementedWriterMenu): void {
    setIsRulersMenuOpen(false);
    setOpenMenu(
      /**
       * Derives the next popup identity from the current open menu.
       *
       * @param currentMenu - Current implemented popup identity or no open popup.
       * @returns No menu when the same trigger closes it, otherwise the requested menu.
       */
      function getNextOpenMenu(currentMenu): ImplementedWriterMenu | undefined {
        return currentMenu === menu ? undefined : menu;
      },
    );
  }

  /**
   * Toggles the nested View Rulers popup while the enclosing View menu remains visible.
   *
   * @returns Nothing; React records the next visible Rulers popup state.
   */
  function toggleRulersMenu(): void {
    setIsRulersMenuOpen(
      /** Derives whether the View Rulers nested menu should become visible. @param isOpen - Current nested popup visibility. @returns The inverse visible state. */
      function getNextRulersMenuOpen(isOpen): boolean {
        return !isOpen;
      },
    );
  }

  /**
   * Renders an enabled or disabled command button in the active popup with standard menu semantics.
   *
   * @param label - Stable accessible label for the visible Writer command.
   * @param onClick - Existing workbench callback to invoke when the command is enabled.
   * @param disabled - Whether the current Writer state prevents command execution.
   * @param active - Whether the command represents the active paragraph formatting value.
   * @returns One semantic menuitem button.
   */
  function renderMenuItem(
    label: string,
    onClick: () => void,
    disabled = false,
    active = false,
  ): React.JSX.Element {
    return (
      <button
        aria-current={active ? "true" : undefined}
        className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-45 ${
          active
            ? "bg-indigo-50 font-semibold text-indigo-900"
            : "text-slate-700 hover:bg-slate-100"
        }`}
        disabled={disabled}
        onClick={onClick}
        role="menuitem"
        type="button"
      >
        {label}
      </button>
    );
  }

  /**
   * Renders one checked menu command whose action represents mutable workspace visibility rather than document history.
   *
   * @param label - Stable accessible label for the visible Writer toggle command.
   * @param onClick - Existing workbench callback to invoke after activation.
   * @param isChecked - Whether the workspace feature is currently visible or enabled.
   * @returns One semantic checkable menu item button.
   */
  function renderToggleMenuItem(
    label: string,
    onClick: () => void,
    isChecked: boolean,
  ): React.JSX.Element {
    return (
      <button
        aria-checked={isChecked}
        className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
        onClick={onClick}
        role="menuitemcheckbox"
        type="button"
      >
        {label}
      </button>
    );
  }

  /**
   * Renders the contextual command popup for one implemented Writer top-level menu.
   *
   * @param menu - Implemented menu whose command group should be rendered.
   * @returns A positioned popup containing only commands available in this bounded workbench.
   */
  function renderPopup(menu: ImplementedWriterMenu): React.JSX.Element {
    const menuId = `writer-${menu}-menu`;
    if (menu === "view") {
      return (
        <div
          aria-label="View menu"
          className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          id={menuId}
          role="menu"
        >
          {renderToggleMenuItem(
            "Status Bar",
            invokeMenuAction.bind(
              undefined,
              onStatusBarVisibilityChange.bind(undefined, !isStatusBarVisible),
            ),
            isStatusBarVisible,
          )}
          <div className="relative">
            <button
              aria-expanded={isRulersMenuOpen}
              aria-haspopup="menu"
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
              onClick={toggleRulersMenu}
              role="menuitem"
              type="button"
            >
              Rulers
              <span aria-hidden="true">›</span>
            </button>
            {isRulersMenuOpen ? (
              <div
                aria-label="Rulers menu"
                className="absolute left-full top-0 z-30 ml-1 w-52 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
                role="menu"
              >
                {renderToggleMenuItem(
                  "Horizontal ruler",
                  invokeMenuAction.bind(
                    undefined,
                    onHorizontalRulerVisibilityChange.bind(undefined, !isHorizontalRulerVisible),
                  ),
                  isHorizontalRulerVisible,
                )}
              </div>
            ) : null}
          </div>
          {renderToggleMenuItem(
            "Sidebar",
            invokeMenuAction.bind(
              undefined,
              onSidebarVisibilityChange.bind(undefined, !isSidebarVisible),
            ),
            isSidebarVisible,
          )}
        </div>
      );
    }
    if (menu === "file") {
      return (
        <div
          aria-label="File menu"
          className="absolute left-0 top-full z-20 mt-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          id={menuId}
          role="menu"
        >
          {renderMenuItem(
            "Open local copy…",
            invokeMenuAction.bind(undefined, onLoad),
            isStoragePending,
          )}
          {renderMenuItem("Save", invokeMenuAction.bind(undefined, onSave), isStoragePending)}
          <div aria-hidden="true" className="my-1 border-t border-slate-200" />
          {renderMenuItem("Save as text…", invokeMenuAction.bind(undefined, onDownload))}
        </div>
      );
    }
    if (menu === "edit") {
      return (
        <div
          aria-label="Edit menu"
          className="absolute left-0 top-full z-20 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          id={menuId}
          role="menu"
        >
          {renderMenuItem("Undo", invokeMenuAction.bind(undefined, onUndo), !canUndo)}
          {renderMenuItem("Redo", invokeMenuAction.bind(undefined, onRedo), !canRedo)}
          <div aria-hidden="true" className="my-1 border-t border-slate-200" />
          {renderMenuItem("Select All", invokeMenuAction.bind(undefined, onSelectAll))}
        </div>
      );
    }
    if (menu === "format") {
      return (
        <div
          aria-label="Format menu"
          className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
          id={menuId}
          role="menu"
        >
          <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Alignment
          </p>
          {renderMenuItem(
            "Align left",
            invokeMenuAction.bind(undefined, onAlignmentChange.bind(undefined, "left")),
            false,
            alignment === "left",
          )}
          {renderMenuItem(
            "Align center",
            invokeMenuAction.bind(undefined, onAlignmentChange.bind(undefined, "center")),
            false,
            alignment === "center",
          )}
          {renderMenuItem(
            "Align right",
            invokeMenuAction.bind(undefined, onAlignmentChange.bind(undefined, "right")),
            false,
            alignment === "right",
          )}
          {renderMenuItem(
            "Justify paragraph",
            invokeMenuAction.bind(undefined, onAlignmentChange.bind(undefined, "justify")),
            false,
            alignment === "justify",
          )}
          <div aria-hidden="true" className="my-1 border-t border-slate-200" />
          <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Bullets and numbering
          </p>
          {renderMenuItem(
            "Move item up",
            invokeMenuAction.bind(undefined, onMoveParagraph.bind(undefined, "up")),
            !canMoveUp,
          )}
          {renderMenuItem(
            "Move item down",
            invokeMenuAction.bind(undefined, onMoveParagraph.bind(undefined, "down")),
            !canMoveDown,
          )}
        </div>
      );
    }
    return (
      <div
        aria-label="Styles menu"
        className="absolute left-0 top-full z-20 mt-1 w-60 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        id={menuId}
        role="menu"
      >
        {renderMenuItem(
          "Default Paragraph Style",
          invokeMenuAction.bind(undefined, onStyleChange.bind(undefined, "default")),
          false,
          style === "default",
        )}
        {renderMenuItem(
          "Heading 1",
          invokeMenuAction.bind(undefined, onStyleChange.bind(undefined, "heading-1")),
          false,
          style === "heading-1",
        )}
      </div>
    );
  }

  return (
    <nav
      aria-label="Writer menu bar"
      className="flex overflow-x-auto border-b border-slate-200 px-2 py-1"
    >
      {writerMenuLabels.map(
        /**
         * Renders one top-level Writer label and its popup only when bounded functionality exists.
         *
         * @param menu - Immutable top-level Writer menu placement metadata.
         * @returns A static placement label or an interactive popup trigger.
         */
        function renderMenuLabel(menu): React.JSX.Element {
          if (menu.id === undefined) {
            return (
              <span
                className="rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500"
                key={menu.label}
              >
                {menu.label}
              </span>
            );
          }
          const isOpen = openMenu === menu.id;
          return (
            <div className="relative" key={menu.id}>
              <button
                aria-controls={`writer-${menu.id}-menu`}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className={`rounded-md px-2.5 py-1.5 text-sm font-medium transition ${isOpen ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"}`}
                onClick={toggleMenu.bind(undefined, menu.id)}
                type="button"
              >
                {menu.label}
              </button>
              {isOpen ? renderPopup(menu.id) : null}
            </div>
          );
        },
      )}
    </nav>
  );
}
