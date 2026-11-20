/** @fileoverview Native groupdialog.ui and ungroupdialog.ui presentation. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";

/** Original dialog choices and response callbacks. */
export interface ScGroupDlgProps {
  readonly ungroup: boolean;
  readonly onCancel: () => void;
  readonly onSubmit: (value: string) => void;
}

/** Renders the source Include or Deactivate for fieldset with Rows selected. @param props - Original dialog request. @returns Modal. */
export function ScGroupDlg({ ungroup, onCancel, onSubmit }: ScGroupDlgProps): React.JSX.Element {
  const title = ungroup ? "Ungroup" : "Group";
  const choice = useId(),
    first = useRef<HTMLInputElement>(null);
  const [axis, setAxis] = useState("R");
  useLayoutEffect(
    /** Focuses the source default Rows choice. @returns Nothing. */
    () => first.current?.focus(),
    [],
  );
  return (
    <div
      role="dialog"
      aria-label={title}
      aria-modal="true"
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Cancels with Escape from any widget. @param event - Dialog keyboard event. @returns Nothing. */
        (event) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          onCancel();
        }
      }
    >
      <form
        data-office-modal-panel="true"
        className="office-dialog-form w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={
          /** Returns the selected source axis. @param event - Submit event. @returns Nothing. */
          (event) => {
            event.preventDefault();
            onSubmit(axis);
          }
        }
      >
        <DialogHeader title={title} onClose={onCancel} />
        <div className="office-dialog-content">
          <fieldset className="grid gap-2 text-sm text-slate-700">
            <legend className="mb-2 font-semibold">{ungroup ? "Deactivate for" : "Include"}</legend>
            <label className="flex items-center gap-2">
              <input
                ref={first}
                type="radio"
                name={choice}
                checked={axis === "R"}
                onChange={/** Groups the rows. @returns Nothing. */ () => setAxis("R")}
              />
              Rows
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name={choice}
                checked={axis === "C"}
                onChange={/** Groups the columns. @returns Nothing. */ () => setAxis("C")}
              />
              Columns
            </label>
          </fieldset>
        </div>
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
    </div>
  );
}
