/** @fileoverview Browser projection of the source Paste Special clipboard-format list. */
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";

/** Selection and cancellation callbacks for the browser's represented clipboard format. */
interface Props {
  readonly onAccept: () => void;
  readonly onCancel: () => void;
}

/** Shows the available portable clipboard format before opening text import. @param props - Native dialog response. @returns Clipboard format dialog. */
export function ScClipboardFormatDlg({ onAccept, onCancel }: Props): React.JSX.Element {
  const title = "Paste Special";
  return (
    <form
      role="dialog"
      aria-label={title}
      aria-modal="true"
      className="office-dialog-panel fixed left-1/2 top-1/3 z-50 w-96 max-w-[calc(100vw-2rem)] -translate-x-1/2"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      }}
      onSubmit={(event) => {
        event.preventDefault();
        onAccept();
      }}
    >
      <DialogHeader title={title} onClose={onCancel} />
      <label className="block space-y-1 px-4 py-3">
        <span>Selection</span>
        <select
          size={3}
          defaultValue="text/plain"
          onDoubleClick={onAccept}
          autoFocus
          className="block w-full rounded border border-slate-300"
        >
          <option value="text/plain">Unformatted text</option>
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
