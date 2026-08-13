/**
 * @fileoverview Renders the bounded Writer Format popup and pinned Bullets and Numbering submenu at the LibreOffice `sw/uiconfig/swriter/menubar/menubar.xml` ownership boundary.
 */

import { useState } from "react";

import {
  writerBulletsAndNumberingMenuCommands,
  writerListLevelMenuCommands,
} from "./menubar-commands";
import type {
  WriterCharacterAttributes,
  WriterCharacterFormat,
  WriterParagraphAlignment,
  WriterParagraphListKind,
} from "../../../source/core/doc/writer";
import { WRITER_MAX_LIST_LEVEL } from "../../../source/core/doc/list";

/** Describes immutable Writer state and callbacks needed by the Format popup. */
export interface WriterFormatMenuProps {
  /** Direct character attributes currently active at the Writer selection or caret. */
  readonly characterAttributes: WriterCharacterAttributes;
  /** Focused paragraph horizontal alignment. */
  readonly alignment: WriterParagraphAlignment;
  /** Focused paragraph list presentation. */
  readonly listKind: WriterParagraphListKind;
  /** Zero-based focused paragraph list nesting level. */
  readonly listLevel: number;
  /** Applies a focused-paragraph alignment command. */
  readonly onAlignmentChange: (alignment: WriterParagraphAlignment) => void;
  /** Toggles one direct character format over the current Writer selection or pending caret state. */
  readonly onCharacterFormatChange: (format: WriterCharacterFormat) => void;
  /** Applies a focused-paragraph list presentation command. */
  readonly onListKindChange: (listKind: WriterParagraphListKind) => void;
  /** Applies a focused-paragraph list-level command. */
  readonly onListLevelChange: (command: "demote" | "promote") => void;
  /** Runs a menu action before the parent closes the current popup. */
  readonly onInvoke: (action: () => void) => void;
}

/**
 * Renders the currently implemented Writer Format menu commands and its positioned Bullets and Numbering submenu.
 *
 * @param props - Focused paragraph command state and callbacks owned by the enclosing Writer menu bar.
 * @param props.alignment - Current focused-paragraph horizontal alignment.
 * @param props.characterAttributes - Direct character attributes active at the Writer selection or caret.
 * @param props.listKind - Current focused-paragraph list presentation.
 * @param props.listLevel - Current focused-paragraph list nesting level.
 * @param props.onAlignmentChange - Alignment transition callback.
 * @param props.onCharacterFormatChange - Direct character-format transition callback.
 * @param props.onListKindChange - List-kind transition callback.
 * @param props.onListLevelChange - List-level transition callback.
 * @param props.onInvoke - Parent callback that runs and closes one enabled menu command.
 * @returns An accessible Format popup retaining the pinned Writer command order.
 */
export function WriterFormatMenu({
  alignment,
  characterAttributes,
  listKind,
  listLevel,
  onAlignmentChange,
  onCharacterFormatChange,
  onListKindChange,
  onListLevelChange,
  onInvoke,
}: WriterFormatMenuProps): React.JSX.Element {
  const [isBulletsAndNumberingMenuOpen, setIsBulletsAndNumberingMenuOpen] = useState(false);
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);

  /**
   * Renders an enabled or disabled Format menu command with standard Writer browser popup semantics.
   *
   * @param label - Stable accessible label for the visible command.
   * @param onClick - Action invoked through the enclosing popup before it closes.
   * @param disabled - Whether the focused Writer state prevents command execution.
   * @param active - Whether the command represents the current focused paragraph value.
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
   * Toggles the pinned Writer list submenu without closing the enclosing Format popup.
   *
   * @returns Nothing; React records the inverse nested-menu visibility.
   */
  function toggleBulletsAndNumberingMenu(): void {
    setIsBulletsAndNumberingMenuOpen(
      /** Derives the inverse nested Writer list menu visibility. @param isOpen - Existing submenu visibility. @returns Next submenu visibility. */
      function invertBulletsAndNumberingMenu(isOpen): boolean {
        return !isOpen;
      },
    );
  }

  return (
    <div
      aria-label="Format menu"
      className="absolute left-0 top-full z-20 mt-1 w-64 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
      id="writer-format-menu"
      role="menu"
    >
      <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Alignment
      </p>
      {renderMenuItem(
        "Align left",
        onInvoke.bind(undefined, onAlignmentChange.bind(undefined, "left")),
        false,
        alignment === "left",
      )}
      {renderMenuItem(
        "Align center",
        onInvoke.bind(undefined, onAlignmentChange.bind(undefined, "center")),
        false,
        alignment === "center",
      )}
      {renderMenuItem(
        "Align right",
        onInvoke.bind(undefined, onAlignmentChange.bind(undefined, "right")),
        false,
        alignment === "right",
      )}
      {renderMenuItem(
        "Justify paragraph",
        onInvoke.bind(undefined, onAlignmentChange.bind(undefined, "justify")),
        false,
        alignment === "justify",
      )}
      <div aria-hidden="true" className="my-1 border-t border-slate-200" />
      <div className="relative">
        <button
          aria-expanded={isTextMenuOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
          onClick={
            /** Toggles the pinned Format Text submenu without closing the enclosing popup. @returns Nothing; React records nested menu visibility. */
            function toggleTextMenu(): void {
              setIsTextMenuOpen(
                /** Inverts nested Text menu visibility. @param isOpen - Current nested menu state. @returns Inverted menu state. */
                function invertTextMenu(isOpen): boolean {
                  return !isOpen;
                },
              );
            }
          }
          role="menuitem"
          type="button"
        >
          Text
          <span aria-hidden="true">›</span>
        </button>
        {isTextMenuOpen ? (
          <div
            aria-label="Text menu"
            className="absolute left-full top-0 z-30 ml-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
            role="menu"
          >
            {(["bold", "italic", "underline"] as const).map(
              /** Renders a pinned Format Text direct-character command. @param format - Direct Writer character format. @returns One active-aware submenu command. */
              function renderTextFormatCommand(format): React.JSX.Element {
                const label =
                  format === "bold" ? "Bold" : format === "italic" ? "Italic" : "Underline";
                return (
                  <div key={format}>
                    {renderMenuItem(
                      label,
                      onInvoke.bind(undefined, onCharacterFormatChange.bind(undefined, format)),
                      false,
                      characterAttributes[format],
                    )}
                  </div>
                );
              },
            )}
          </div>
        ) : null}
      </div>
      <div aria-hidden="true" className="my-1 border-t border-slate-200" />
      <div className="relative">
        <button
          aria-expanded={isBulletsAndNumberingMenuOpen}
          aria-haspopup="menu"
          className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
          onClick={toggleBulletsAndNumberingMenu}
          role="menuitem"
          type="button"
        >
          Bullets and Numbering
          <span aria-hidden="true">›</span>
        </button>
        {isBulletsAndNumberingMenuOpen ? (
          <div
            aria-label="Bullets and Numbering menu"
            className="absolute left-full top-0 z-30 ml-1 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
            role="menu"
          >
            {writerBulletsAndNumberingMenuCommands.map(
              /** Renders one pinned first-layer Writer list command. @param command - Immutable menu command placement. @returns One active-aware list menu item wrapper. */
              function renderListMenuCommand(command): React.JSX.Element {
                return (
                  <div key={command.unoCommand}>
                    {renderMenuItem(
                      command.label,
                      onInvoke.bind(undefined, onListKindChange.bind(undefined, command.listKind)),
                      false,
                      listKind === command.listKind,
                    )}
                  </div>
                );
              },
            )}
            <div aria-hidden="true" className="my-1 border-t border-slate-200" />
            {writerListLevelMenuCommands.map(
              /** Renders one pinned Writer Promote or Demote command. @param command - Immutable Writer list-level menu placement. @returns One disabled-aware list-level menu item wrapper. */
              function renderListLevelMenuCommand(command): React.JSX.Element {
                const isDisabled =
                  listKind === "none" ||
                  (command.command === "demote" && listLevel === WRITER_MAX_LIST_LEVEL) ||
                  (command.command === "promote" && listLevel === 0);
                return (
                  <div key={command.unoCommand}>
                    {renderMenuItem(
                      command.label,
                      onInvoke.bind(undefined, onListLevelChange.bind(undefined, command.command)),
                      isDisabled,
                    )}
                  </div>
                );
              },
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
