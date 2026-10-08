/** @fileoverview Presents the native SwTableHeightDlg controls from Writer rowheight.ui. */
import { WriterDialogHeader } from "./WriterDialogHeader";
import { useEffect, useRef, useState } from "react";
import type { SwTableHeightDlg } from "../../source/ui/table/rowht";

/** Renders one native height draft, retaining all mutation in Apply. @param props - Native draft and close handlers. @returns Row height modal. */
export function WriterRowHeightDialog({
  draft,
  onCancel,
  onSubmit,
}: Readonly<{
  draft: SwTableHeightDlg;
  onCancel: () => void;
  onSubmit: () => void;
}>): React.JSX.Element {
  const [, refresh] = useState(0);
  const [help, setHelp] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(
    /** Focuses the native dialog's height entry without moving the shell cursor. @returns Nothing. */ () => {
      (input.current as HTMLInputElement).focus();
    },
    [],
  );
  return (
    <div
      role="dialog"
      aria-label="Row Height"
      aria-modal="true"
      data-writer-modal="true"
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4"
      onKeyDown={
        /** Cancels the unaccepted draft with Escape. @param event - Dialog key event. @returns Nothing. */
        (event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            onCancel();
          }
        }
      }
    >
      <form
        data-writer-modal-panel="true"
        className="w-full max-w-sm bg-white"
        onSubmit={
          /** Accepts the native draft through its owner. @param event - Form event. @returns Nothing. */
          (event) => {
            event.preventDefault();
            onSubmit();
          }
        }
      >
        <WriterDialogHeader title="Row Height" onClose={onCancel} />
        <div className="writer-dialog-content">
          <fieldset className="grid gap-3 rounded border p-3">
            <legend className="px-1 font-bold">Height</legend>
            <input
              ref={input}
              aria-label="Height (cm)"
              title="Enter the height that you want for the selected row(s)."
              className="w-28 rounded border px-2 py-1"
              type="number"
              min="0.04"
              max="99"
              step="0.01"
              value={Math.round(((draft.height * 2.54) / 1440) * 100) / 100}
              onChange={
                /** Dispatches metric input to the native draft. @param event - Height input. @returns Nothing. */
                (event) => {
                  draft.SetHeight((Number(event.target.value) * 1440) / 2.54);
                  refresh(
                    /** Presents accepted native metric state. @param version - Previous render. @returns Next render. */ (
                      version,
                    ) => version + 1,
                  );
                }
              }
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.fit}
                title="Automatically adjusts the row height to match the contents of the cells."
                onChange={
                  /** Updates the native automatic height flag. @param event - Fit toggle. @returns Nothing. */
                  (event) => {
                    draft.SetFit(event.target.checked);
                    refresh(
                      /** Presents the native fit state. @param version - Previous render. @returns Next render. */ (
                        version,
                      ) => version + 1,
                    );
                  }
                }
              />
              Fit to size
            </label>
          </fieldset>
          {help ? (
            <p role="note" className="text-sm">
              Changes the height of the selected row(s). Fit to size automatically adjusts the row
              height to match the contents of the cells.
            </p>
          ) : null}
        </div>
        <div className="writer-dialog-actions">
          <button
            type="button"
            className="mr-auto rounded border px-3 py-1"
            onClick={
              /** Displays the resource's contextual height help. @returns Nothing. */ () =>
                setHelp(true)
            }
          >
            Help
          </button>
          <button type="button" className="rounded border px-3 py-1" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="writer-dialog-primary">
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
