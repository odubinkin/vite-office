/**
 * @fileoverview Renders the implemented Writer paragraph-alignment commands in the durable formatting toolbar while retaining placeholders for later character formatting.
 */

import { AlignCenter, AlignJustify, AlignLeft, AlignRight, type LucideIcon } from "lucide-react";

import type {
  WriterParagraphAlignment,
  WriterParagraphMoveDirection,
  WriterParagraphStyle,
} from "../domain/writer";

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
  /** Alignment of the currently focused Writer paragraph. */
  readonly alignment: WriterParagraphAlignment;
  /** Whether moving the focused Writer paragraph one position down is possible. */
  readonly canMoveDown: boolean;
  /** Whether moving the focused Writer paragraph one position up is possible. */
  readonly canMoveUp: boolean;
  /** Requests a new alignment for the currently focused Writer paragraph. */
  readonly onAlignmentChange: (alignment: WriterParagraphAlignment) => void;
  /** Requests one upstream-placed adjacent movement for the focused Writer paragraph. */
  readonly onMoveParagraph: (direction: WriterParagraphMoveDirection) => void;
  /** Requests a new style for the currently focused Writer paragraph. */
  readonly onStyleChange: (style: WriterParagraphStyle) => void;
  /** Style of the currently focused Writer paragraph. */
  readonly style: WriterParagraphStyle;
}

/**
 * Renders Writer alignment commands beside intentionally disabled character-format placeholders.
 *
 * @param props - Focused paragraph formatting and callbacks owned by the Writer workbench.
 * @param props.alignment - Alignment currently applied to the active Writer paragraph.
 * @param props.canMoveDown - Whether the downstream paragraph-menu item is enabled.
 * @param props.canMoveUp - Whether the upstream paragraph-menu item is enabled.
 * @param props.onAlignmentChange - Callback that records the requested paragraph alignment.
 * @param props.onMoveParagraph - Callback that records a focused-paragraph adjacent movement.
 * @param props.onStyleChange - Callback that records the requested paragraph style.
 * @param props.style - Style currently applied to the active Writer paragraph.
 * @returns A semantic formatting toolbar with four usable paragraph-alignment controls.
 */
export function WriterParagraphFormattingToolbar({
  alignment,
  canMoveDown,
  canMoveUp,
  onAlignmentChange,
  onMoveParagraph,
  onStyleChange,
  style,
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
      <button
        aria-label="Bold"
        className="grid size-8 place-items-center rounded-md border border-slate-300 bg-white font-black text-slate-400"
        disabled
        type="button"
      >
        B
      </button>
      <button
        aria-label="Italic"
        className="grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-lg font-serif italic text-slate-400"
        disabled
        type="button"
      >
        I
      </button>
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
      <label className="sr-only" htmlFor="writer-paragraph-actions">
        Paragraph actions
      </label>
      <select
        className="h-8 min-w-36 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        id="writer-paragraph-actions"
        onChange={
          /**
           * Routes a notebookbar-equivalent paragraph menu item to the active paragraph.
           *
           * @param event - Browser selection event emitted by the paragraph action menu.
           * @returns Nothing; the workbench schedules a history transition when an action is selected.
           */
          function changeParagraphAction(event: React.ChangeEvent<HTMLSelectElement>): void {
            if (event.target.value === "up" || event.target.value === "down") {
              onMoveParagraph(event.target.value);
            }
          }
        }
        value="none"
      >
        <option value="none">Paragraph actions</option>
        <option disabled={!canMoveUp} value="up">
          Move paragraph up
        </option>
        <option disabled={!canMoveDown} value="down">
          Move paragraph down
        </option>
      </select>
      <span className="text-xs font-medium text-slate-500">Paragraph alignment</span>
    </>
  );
}
