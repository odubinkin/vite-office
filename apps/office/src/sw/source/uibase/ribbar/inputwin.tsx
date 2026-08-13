/**
 * @fileoverview Renders the implemented Writer paragraph-alignment commands in the durable formatting toolbar while retaining placeholders for later character formatting.
 */

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  IndentIncrease,
  List,
  ListOrdered,
  Outdent,
  type LucideIcon,
} from "lucide-react";

import { writerTextObjectBarListCommands } from "../../../uiconfig/swriter/toolbar/textobjectbar";
import { writerNumObjectBarListLevelCommands } from "../../../uiconfig/swriter/toolbar/numobjectbar";
import { WRITER_MAX_LIST_LEVEL } from "../../core/doc/list";
import type {
  WriterCharacterAttributes,
  WriterCharacterFormat,
  WriterParagraphAlignment,
  WriterParagraphListKind,
  WriterParagraphStyle,
} from "../../core/doc/writer";

/** Describes one labelled formatting-toolbar command for a supported paragraph alignment. */
interface ParagraphAlignmentControl {
  /** Alignment applied when the command is activated. */
  readonly alignment: WriterParagraphAlignment;
  /** Icon displayed in the compact formatting control. */
  readonly Icon: LucideIcon;
  /** Stable accessible command label. */
  readonly label: string;
}

/** Lists the Writer paragraph-alignment controls in their left-to-right toolbar order. */
const paragraphAlignmentControls: readonly ParagraphAlignmentControl[] = [
  { alignment: "left", Icon: AlignLeft, label: "Align left" },
  { alignment: "center", Icon: AlignCenter, label: "Align center" },
  { alignment: "right", Icon: AlignRight, label: "Align right" },
  { alignment: "justify", Icon: AlignJustify, label: "Justify paragraph" },
];

/** Defines current Writer paragraph formatting state and its requested transition. */
export interface WriterParagraphFormattingToolbarProps {
  /** Direct character attributes currently active at the Writer selection or caret. */
  readonly characterAttributes: WriterCharacterAttributes;
  /** Alignment of the currently focused Writer paragraph. */
  readonly alignment: WriterParagraphAlignment;
  /** Requests a new alignment for the currently focused Writer paragraph. */
  readonly onAlignmentChange: (alignment: WriterParagraphAlignment) => void;
  /** Toggles one direct character format over the current Writer selection or pending caret state. */
  readonly onCharacterFormatChange: (format: WriterCharacterFormat) => void;
  /** Requests a new default list presentation for the currently focused Writer paragraph. */
  readonly onListKindChange: (listKind: WriterParagraphListKind) => void;
  /** Requests one Promote or Demote list-level transition for the focused Writer paragraph. */
  readonly onListLevelChange: (command: "demote" | "promote") => void;
  /** Requests a new style for the currently focused Writer paragraph. */
  readonly onStyleChange: (style: WriterParagraphStyle) => void;
  /** Style of the currently focused Writer paragraph. */
  readonly style: WriterParagraphStyle;
  /** List presentation currently applied to the focused Writer paragraph. */
  readonly listKind: WriterParagraphListKind;
  /** Zero-based list nesting level currently applied to the focused Writer paragraph. */
  readonly listLevel: number;
}

/**
 * Renders Writer direct-character, alignment, and default-list commands in their pinned text-object toolbar order.
 *
 * @param props - Focused paragraph formatting and callbacks owned by the Writer workbench.
 * @param props.alignment - Alignment currently applied to the active Writer paragraph.
 * @param props.characterAttributes - Direct character attributes active at the Writer selection or caret.
 * @param props.onAlignmentChange - Callback that records the requested paragraph alignment.
 * @param props.onCharacterFormatChange - Callback that records the requested direct character attribute.
 * @param props.onListKindChange - Callback that records the requested default list presentation.
 * @param props.onListLevelChange - Callback that records a requested list-level transition.
 * @param props.onStyleChange - Callback that records the requested paragraph style.
 * @param props.style - Style currently applied to the active Writer paragraph.
 * @param props.listKind - List presentation currently applied to the active Writer paragraph.
 * @param props.listLevel - List nesting level currently applied to the active Writer paragraph.
 * @returns A semantic formatting toolbar with direct-character, paragraph-alignment, and default-list controls.
 */
export function WriterParagraphFormattingToolbar({
  alignment,
  characterAttributes,
  onAlignmentChange,
  onCharacterFormatChange,
  onListKindChange,
  onListLevelChange,
  onStyleChange,
  style,
  listKind,
  listLevel,
}: WriterParagraphFormattingToolbarProps): React.JSX.Element {
  return (
    <>
      <label className="sr-only" htmlFor="writer-style">
        Paragraph style
      </label>
      <select
        className="h-8 min-w-44 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        id="writer-style"
        onChange={
          /**
           * Validates a browser select value before requesting its immutable paragraph-style transition.
           *
           * @param event - Browser change event emitted by the paragraph-style select.
           * @returns Nothing; the domain transition validates the browser-supplied value.
           */
          function changeParagraphStyle(event: React.ChangeEvent<HTMLSelectElement>): void {
            onStyleChange(event.target.value as WriterParagraphStyle);
          }
        }
        value={style}
      >
        <option value="default">Default Paragraph Style</option>
        <option value="heading-1">Heading 1</option>
      </select>
      <label className="sr-only" htmlFor="writer-font">
        Font name
      </label>
      <select
        className="h-8 min-w-36 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-600 disabled:cursor-not-allowed"
        disabled
        id="writer-font"
        value="System font"
      >
        <option>System font</option>
      </select>
      {(["bold", "italic", "underline"] as const).map(
        /** Renders one pinned direct character-format toggle. @param format - Supported Writer direct character format. @returns One active-aware Writer toolbar control. */
        function renderCharacterFormatControl(format): React.JSX.Element {
          const label = format === "bold" ? "Bold" : format === "italic" ? "Italic" : "Underline";
          return (
            <button
              aria-label={label}
              aria-pressed={characterAttributes[format]}
              className={`grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-800 transition hover:border-indigo-400 hover:text-indigo-800 ${format === "bold" ? "font-black" : format === "italic" ? "text-lg font-serif italic" : "underline"}`}
              key={format}
              onClick={
                /** Requests this direct Writer attribute without moving ownership from the workbench. @returns Nothing; parent records immutable selection or pending-caret state. */
                function toggleCharacterFormat(): void {
                  onCharacterFormatChange(format);
                }
              }
              title={label}
              type="button"
            >
              {format === "bold" ? "B" : format === "italic" ? "I" : "U"}
            </button>
          );
        },
      )}
      <span aria-hidden="true" className="h-6 border-l border-slate-300" />
      <div aria-label="Paragraph alignment" className="flex items-center gap-1" role="group">
        {paragraphAlignmentControls.map(
          /**
           * Renders one alignment command with active-state semantics and its supplied icon.
           *
           * @param control - Immutable alignment command metadata in display order.
           * @returns One accessible paragraph-alignment command button.
           */
          function renderAlignmentControl(control): React.JSX.Element {
            const Icon = control.Icon;
            const isActive = alignment === control.alignment;
            return (
              <button
                aria-label={control.label}
                aria-pressed={isActive}
                className={`grid size-8 place-items-center rounded-md border transition ${
                  isActive
                    ? "border-indigo-700 bg-indigo-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-800"
                }`}
                key={control.alignment}
                onClick={
                  /**
                   * Delegates this command's immutable alignment request to the workbench.
                   *
                   * @returns Nothing; the owning workbench schedules the history transition.
                   */
                  function changeParagraphAlignment(): void {
                    onAlignmentChange(control.alignment);
                  }
                }
                title={control.label}
                type="button"
              >
                <Icon aria-hidden="true" size={17} />
              </button>
            );
          },
        )}
      </div>
      <span aria-hidden="true" className="h-6 border-l border-slate-300" />
      <div aria-label="Paragraph lists" className="flex items-center gap-1" role="group">
        {writerTextObjectBarListCommands.map(
          /** Renders a pinned default-list control with toggle semantics. @param command - Immutable Writer toolbar list command. @returns One accessible default-list button. */
          function renderListControl(command): React.JSX.Element {
            const isActive = listKind === command.listKind;
            const Icon = command.listKind === "bullet" ? List : ListOrdered;
            return (
              <button
                aria-label={command.label}
                aria-pressed={isActive}
                className={`grid size-8 place-items-center rounded-md border transition ${
                  isActive
                    ? "border-indigo-700 bg-indigo-700 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-800"
                }`}
                key={command.unoCommand}
                onClick={
                  /** Toggles the active list kind off or requests the command's list kind. @returns Nothing; the parent records immutable history. */
                  function toggleParagraphList(): void {
                    onListKindChange(isActive ? "none" : command.listKind);
                  }
                }
                title={command.label}
                type="button"
              >
                <Icon aria-hidden="true" size={17} />
              </button>
            );
          },
        )}
      </div>
      <div aria-label="List level" className="flex items-center gap-1" role="group">
        {writerNumObjectBarListLevelCommands.map(
          /** Renders a pinned numbering-toolbar list-level control. @param command - Immutable Writer list-level command placement. @returns One accessible list-level button. */
          function renderListLevelControl(command): React.JSX.Element {
            const Icon = command.command === "demote" ? IndentIncrease : Outdent;
            const isDisabled =
              listKind === "none" ||
              (command.command === "demote" && listLevel === WRITER_MAX_LIST_LEVEL) ||
              (command.command === "promote" && listLevel === 0);
            return (
              <button
                aria-label={command.label}
                className="grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-indigo-400 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-45"
                disabled={isDisabled}
                key={command.unoCommand}
                onClick={
                  /** Delegates the requested Writer list-level transition to the history-owning workbench. @returns Nothing; the parent validates the immutable state transition. */
                  function changeListLevel(): void {
                    onListLevelChange(command.command);
                  }
                }
                title={command.label}
                type="button"
              >
                <Icon aria-hidden="true" size={17} />
              </button>
            );
          },
        )}
      </div>
    </>
  );
}
