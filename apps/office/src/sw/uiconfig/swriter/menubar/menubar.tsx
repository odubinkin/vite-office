/**
 * @fileoverview Renders the implemented Writer commands in their pinned LibreOffice menu locations without copying native menu visuals.
 */

import { useState } from "react";

import { writerMenuPlacements, type WriterTopLevelMenu } from "./menubar-commands";
import { WriterFormatMenu } from "./format-menu";
import type {
  WriterCharacterAttributes,
  WriterCharacterFormat,
  WriterParagraphAlignment,
  WriterParagraphListKind,
  WriterParagraphStyle,
} from "../../../source/core/doc/writer";

/** Describes enabled state and immutable action callbacks exposed from the stateful Writer workbench. */
export interface WriterMenuBarProps {
  /** Alignment currently applied to the focused Writer paragraph. */
  readonly alignment: WriterParagraphAlignment;
  /** Direct character attributes currently active at the Writer selection or caret. */
  readonly characterAttributes: WriterCharacterAttributes;
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
  /** List presentation currently applied to the focused Writer paragraph. */
  readonly listKind: WriterParagraphListKind;
  /** Zero-based nesting level currently applied to the focused Writer paragraph. */
  readonly listLevel: number;
  /** Applies a focused-paragraph horizontal alignment. */
  readonly onAlignmentChange: (alignment: WriterParagraphAlignment) => void;
  /** Toggles one direct character format over the current Writer selection or pending caret state. */
  readonly onCharacterFormatChange: (format: WriterCharacterFormat) => void;
  /** Applies a focused-paragraph default list presentation. */
  readonly onListKindChange: (listKind: WriterParagraphListKind) => void;
  /** Applies a focused-paragraph Promote or Demote list-level transition. */
  readonly onListLevelChange: (command: "demote" | "promote") => void;
  /** Starts the current plain-text browser download. */
  readonly onDownload: () => void;
  /** Requests cutting the current native Writer selection after successful clipboard write. */
  readonly onCut: () => void;
  /** Requests copying the current native Writer selection to the browser clipboard. */
  readonly onCopy: () => void;
  /** Requests pasting browser clipboard text at the current Writer selection or caret. */
  readonly onPaste: () => void;
  /** Requests browser selection of the complete rendered Writer document. */
  readonly onSelectAll: () => void;
  /** Loads the existing document identity from browser-local storage. */
  readonly onLoad: () => void;
  /** Creates a new empty Writer document. */
  readonly onNew: () => void;
  /** Opens an OpenDocument Text file selected by the browser user. */
  readonly onOpenOdt: () => void;
  /** Restores the following immutable Writer history snapshot. */
  readonly onRedo: () => void;
  /** Saves the current Writer document in browser-local storage. */
  readonly onSave: () => void;
  /** Downloads the current Writer document as OpenDocument Text. */
  readonly onSaveOdt: () => void;
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

/**
 * Renders accessible popups for every visible Writer menu, retaining honest unavailable states where no commands exist.
 *
 * @param props - Current Writer command state and immutable transition callbacks.
 * @param props.alignment - Current focused-paragraph alignment.
 * @param props.characterAttributes - Direct character attributes active at the Writer selection or caret.
 * @param props.canRedo - Whether the Edit Redo menu entry is enabled.
 * @param props.canUndo - Whether the Edit Undo menu entry is enabled.
 * @param props.isHorizontalRulerVisible - Whether the View Rulers horizontal item is currently checked.
 * @param props.listKind - Current focused-paragraph default list presentation.
 * @param props.listLevel - Current focused-paragraph list nesting level.
 * @param props.isStoragePending - Whether File storage entries are temporarily disabled.
 * @param props.isSidebarVisible - Whether the View Sidebar check item is currently checked.
 * @param props.isStatusBarVisible - Whether the View Status Bar check item is currently checked.
 * @param props.onAlignmentChange - Callback used by Format alignment entries.
 * @param props.onCharacterFormatChange - Callback used by Format Text entries.
 * @param props.onCut - Callback used by Edit Cut entry.
 * @param props.onListKindChange - Callback used by Format Bullets and Numbering entries.
 * @param props.onListLevelChange - Callback used by Format Promote and Demote entries.
 * @param props.onDownload - Callback used by File Save As Text entry.
 * @param props.onCopy - Callback used by Edit Copy entry.
 * @param props.onHorizontalRulerVisibilityChange - Callback used by the View Rulers horizontal item.
 * @param props.onLoad - Callback used by File Open Local Copy entry.
 * @param props.onNew - Callback used by File New.
 * @param props.onOpenOdt - Callback used by File Open ODT.
 * @param props.onPaste - Callback used by Edit Paste entry.
 * @param props.onRedo - Callback used by Edit Redo entry.
 * @param props.onSave - Callback used by File Save entry.
 * @param props.onSaveOdt - Callback used by File Save as ODT.
 * @param props.onSelectAll - Callback used by Edit Select All entry.
 * @param props.onSidebarVisibilityChange - Callback used by the View Sidebar check item.
 * @param props.onStatusBarVisibilityChange - Callback used by the View Status Bar check item.
 * @param props.onStyleChange - Callback used by Styles entries.
 * @param props.onUndo - Callback used by Edit Undo entry.
 * @param props.style - Current focused-paragraph style.
 * @returns A Writer-style menu bar whose visible menus have semantic popup menus.
 */
export function WriterMenuBar({
  alignment,
  characterAttributes,
  canRedo,
  canUndo,
  isHorizontalRulerVisible,
  listKind,
  listLevel,
  isSidebarVisible,
  isStatusBarVisible,
  isStoragePending,
  onAlignmentChange,
  onCharacterFormatChange,
  onCut,
  onListKindChange,
  onListLevelChange,
  onDownload,
  onCopy,
  onHorizontalRulerVisibilityChange,
  onLoad,
  onNew,
  onOpenOdt,
  onPaste,
  onRedo,
  onSave,
  onSaveOdt,
  onSelectAll,
  onSidebarVisibilityChange,
  onStatusBarVisibilityChange,
  onStyleChange,
  onUndo,
  style,
}: WriterMenuBarProps): React.JSX.Element {
  const [openMenu, setOpenMenu] = useState<WriterTopLevelMenu | undefined>();
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
   * Toggles a single Writer popup while ensuring no other popup remains open.
   *
   * @param menu - Writer menu requested by its top-level trigger.
   * @returns Nothing; React records the next visible popup.
   */
  function toggleMenu(menu: WriterTopLevelMenu): void {
    setIsRulersMenuOpen(false);
    setOpenMenu(
      /**
       * Derives the next popup identity from the current open menu.
       *
       * @param currentMenu - Current popup identity or no open popup.
       * @returns No menu when the same trigger closes it, otherwise the requested menu.
       */
      function getNextOpenMenu(currentMenu): WriterTopLevelMenu | undefined {
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
   * Renders the contextual popup for one visible Writer top-level menu.
   *
   * @param menu - Writer menu whose command group or unavailable state should be rendered.
   * @returns A positioned popup containing bounded commands or an honest unavailable-command state.
   */
  function renderPopup(menu: WriterTopLevelMenu): React.JSX.Element {
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
          {renderMenuItem("New", invokeMenuAction.bind(undefined, onNew), isStoragePending)}
          {renderMenuItem(
            "Open ODT…",
            invokeMenuAction.bind(undefined, onOpenOdt),
            isStoragePending,
          )}
          {renderMenuItem(
            "Save as ODT…",
            invokeMenuAction.bind(undefined, onSaveOdt),
            isStoragePending,
          )}
          <div aria-hidden="true" className="my-1 border-t border-slate-200" />
          {renderMenuItem(
            "Open local copy…",
            invokeMenuAction.bind(undefined, onLoad),
            isStoragePending,
          )}
          {renderMenuItem(
            "Save local copy",
            invokeMenuAction.bind(undefined, onSave),
            isStoragePending,
          )}
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
          {renderMenuItem("Cut", invokeMenuAction.bind(undefined, onCut))}
          {renderMenuItem("Copy", invokeMenuAction.bind(undefined, onCopy))}
          {renderMenuItem("Paste", invokeMenuAction.bind(undefined, onPaste))}
          {renderMenuItem("Select All", invokeMenuAction.bind(undefined, onSelectAll))}
        </div>
      );
    }
    if (menu === "format")
      return (
        <WriterFormatMenu
          alignment={alignment}
          characterAttributes={characterAttributes}
          listKind={listKind}
          listLevel={listLevel}
          onAlignmentChange={onAlignmentChange}
          onCharacterFormatChange={onCharacterFormatChange}
          onInvoke={invokeMenuAction}
          onListKindChange={onListKindChange}
          onListLevelChange={onListLevelChange}
        />
      );
    if (menu === "styles") {
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
      <div
        aria-label={`${menu.charAt(0).toUpperCase()}${menu.slice(1)} menu`}
        className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-3 shadow-lg"
        id={menuId}
        role="menu"
      >
        <p className="text-sm text-slate-500">No browser command is implemented here yet.</p>
      </div>
    );
  }

  return (
    <nav
      aria-label="Writer menu bar"
      className="flex overflow-visible border-b border-slate-200 px-2 py-1"
    >
      {writerMenuPlacements.map(
        /**
         * Renders one top-level Writer trigger and its popup.
         *
         * @param menu - Immutable top-level Writer menu placement metadata.
         * @returns An interactive popup trigger in the pinned Writer menu-bar order.
         */
        function renderMenuLabel(menu): React.JSX.Element {
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
