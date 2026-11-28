/** @fileoverview Browser projection of the source Paste Special clipboard-format list. */
import { useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import {
  pasteTextImportCommand,
  type ClipboardFormatChoice,
} from "../workflows/calc-clipboard-workflow";

/** Selection and cancellation callbacks for the browser's represented clipboard format. */
interface Props {
  readonly onAccept: (choice: ClipboardFormatChoice) => void;
  readonly onCancel: () => void;
}

/** Shows the available portable clipboard format before opening text import. @param props - Native dialog response. @returns Clipboard format dialog. */
export function ScClipboardFormatDlg({ onAccept, onCancel }: Props): React.JSX.Element {
  const title = "Paste Special";
  const [choice, setChoice] = useState<ClipboardFormatChoice>("text/plain");
  return (
    <form
      role="dialog"
      aria-label={title}
      aria-modal="true"
      className="office-dialog-panel fixed left-1/2 top-1/3 z-50 w-96 max-w-[calc(100vw-2rem)] -translate-x-1/2"
      onKeyDown={
        /** Closes the active dialog. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          onCancel();
        }
      }
      onSubmit={
        /** Submits the current selection. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          event.preventDefault();
          onAccept(choice);
        }
      }
    >
      <DialogHeader title={title} onClose={onCancel} />
      <p className="px-4 pt-3">Source: Unknown source</p>
      <label className="block space-y-1 px-4 py-3">
        <span>Selection</span>
        <select
          size={3}
          value={choice}
          onChange={
            /** Updates the choice. @param event - Control change event. @returns Nothing. */ (
              event,
            ) =>
              setChoice(
                event.currentTarget.value === pasteTextImportCommand
                  ? pasteTextImportCommand
                  : "text/plain",
              )
          }
          onDoubleClick={
            /** Accepts the clipboard format on a double click. @returns Nothing. */ () =>
              onAccept(choice)
          }
          autoFocus
          className="block w-full rounded border border-slate-300"
        >
          <option value="text/plain">Unformatted text</option>
          <option value={pasteTextImportCommand}>Use text import dialog</option>
        </select>
      </label>
      <div className="office-dialog-actions">
        <button type="button" className="office-dialog-secondary mr-auto" disabled>
          Help
        </button>
        <button type="button" className="office-dialog-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="office-dialog-primary">
          OK
        </button>
      </div>
    </form>
  );
}
