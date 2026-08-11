/**
 * @fileoverview Renders the implemented Writer paragraph-alignment commands in the durable formatting toolbar while retaining placeholders for later character formatting.
 */

import { AlignCenter, AlignJustify, AlignLeft, AlignRight, type LucideIcon } from "lucide-react";

import type { WriterParagraphAlignment } from "../domain/writer";

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
  /** Requests a new alignment for the currently focused Writer paragraph. */
  readonly onAlignmentChange: (alignment: WriterParagraphAlignment) => void;
}

/**
 * Renders Writer alignment commands beside intentionally disabled character-format placeholders.
 *
 * @param props - Focused paragraph alignment and a callback owned by the Writer workbench.
 * @param props.alignment - Alignment currently applied to the active Writer paragraph.
 * @param props.onAlignmentChange - Callback that records the requested paragraph alignment.
 * @returns A semantic formatting toolbar with four usable paragraph-alignment controls.
 */
export function WriterParagraphFormattingToolbar({
  alignment,
  onAlignmentChange,
}: WriterParagraphFormattingToolbarProps): React.JSX.Element {
  return (
    <>
      <label className="sr-only" htmlFor="writer-style">
        Paragraph style
      </label>
      <select
        className="h-8 min-w-44 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-600 disabled:cursor-not-allowed"
        disabled
        id="writer-style"
        value="Default Paragraph Style"
      >
        <option>Default Paragraph Style</option>
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
      <span className="text-xs font-medium text-slate-500">Paragraph alignment</span>
    </>
  );
}
