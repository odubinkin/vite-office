/** @fileoverview Shared Writer browser-title collision choice. */

/** Inputs for resolving one occupied browser document title. */
export interface WriterNameCollisionPanelProps {
  readonly busy: boolean;
  readonly conflictingTitle: string;
  readonly onCancel: () => void;
  readonly onOverwrite: () => void;
  readonly onSaveAs: (title: string) => void;
  readonly onTitleChange: (title: string) => void;
  readonly title: string;
}

/** Presents overwrite or editable save-as-new choices for a browser-title collision. @param props - Collision state and actions. @returns Collision form. */
export function WriterNameCollisionPanel({
  busy,
  conflictingTitle,
  onCancel,
  onOverwrite,
  onSaveAs,
  onTitleChange,
  title,
}: WriterNameCollisionPanelProps): React.JSX.Element {
  return (
    <form
      className="grid gap-4 p-6"
      onSubmit={
        /** Submits the editable alternative title. @param event - Form event. @returns Nothing. */ (
          event,
        ) => {
          event.preventDefault();
          onSaveAs(title);
        }
      }
    >
      <div>
        <h3 className="font-semibold text-slate-950">A document with this name exists</h3>
        <p className="mt-1 text-sm text-slate-600">
          Replace “{conflictingTitle}” or keep both documents with a new name.
        </p>
      </div>
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        New document name
        <input
          autoFocus
          className="rounded-lg border border-slate-300 p-2 focus-visible:outline-2 focus-visible:outline-indigo-600"
          onChange={
            /** Updates the editable alternative title. @param event - Input event. @returns Nothing. */ (
              event,
            ) => onTitleChange(event.target.value)
          }
          required
          value={title}
        />
      </label>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          disabled={busy}
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          className="rounded-lg border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
          disabled={busy}
          onClick={onOverwrite}
          type="button"
        >
          Replace existing
        </button>
        <button
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          disabled={busy}
          type="submit"
        >
          Save as new
        </button>
      </div>
    </form>
  );
}
