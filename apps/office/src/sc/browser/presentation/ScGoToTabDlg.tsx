/** @fileoverview React counterpart of native gototabdlg.cxx/gotosheetdialog.ui using shared Writer dialog presentation. */
import { useEffect, useRef, useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import type { CalcGoToSheetRequest } from "../workflows/calc-sheet-workflows";
/** Source Go to Sheet widget state and completion callbacks. */
export interface ScGoToTabDlgProps extends CalcGoToSheetRequest {
  readonly onCancel: () => void;
  readonly onSubmit: (name: string) => void;
}
/** Presents source mask and single sheet selection;filtering clears selection as native FindNameHdl. @param props - Native initialization and results. @returns Modal. */
export function ScGoToTabDlg({
  names,
  selectedName,
  onCancel,
  onSubmit,
}: ScGoToTabDlgProps): React.JSX.Element {
  const [mask, setMask] = useState(""),
    [selected, setSelected] = useState(selectedName),
    entry = useRef<HTMLInputElement>(null),
    list = useRef<HTMLDivElement>(null);
  useEffect(
    /** Focuses the native name-mask entry when shown. @returns Nothing. */ () => {
      entry.current?.focus();
    },
    [],
  );
  const visible = names.filter(
    /** Uses native case-sensitive substring matching without trimming the mask. @param name - Actual sheet name. @returns Visible. */ (
      name,
    ) => name.includes(mask),
  );
  return (
    <div
      role="dialog"
      aria-label="Go to Sheet"
      aria-modal="true"
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Retains native Escape cancellation. @param event - Dialog key. @returns Nothing. */ (
          event,
        ) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            onCancel();
          }
        }
      }
    >
      <form
        data-office-modal-panel="true"
        className="office-dialog-form w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={
          /** Completes OK even with no selected entry,as native dialog acceptance. @param event - Form event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            onSubmit(selected);
          }
        }
      >
        <DialogHeader title="Go to Sheet" onClose={onCancel} />
        <div className="office-dialog-content">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Type a Sheet Name
            <input
              ref={entry}
              className="rounded-md border border-slate-300 px-3 py-2 font-normal"
              value={mask}
              onChange={
                /** Native FindNameHdl rebuilds rows and clears their selection. @param event - Name mask. @returns Nothing. */ (
                  event,
                ) => {
                  setMask(event.target.value);
                  setSelected("");
                }
              }
            />
          </label>
          <div className="mt-4 text-sm font-semibold text-slate-700" id="calc-goto-sheet-label">
            Sheets
          </div>
          <div
            ref={list}
            role="listbox"
            aria-labelledby="calc-goto-sheet-label"
            tabIndex={0}
            aria-activedescendant={
              selected === "" ? undefined : `calc-goto-sheet-${names.indexOf(selected)}`
            }
            className="mt-1 h-60 overflow-y-auto rounded-md border border-slate-300 p-1"
            onKeyDown={
              /** Implements native single-list selection keys. @param event - List key. @returns Nothing. */ (
                event,
              ) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSubmit(selected);
                  return;
                }
                const index = visible.indexOf(selected);
                if (
                  ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key) &&
                  visible.length > 0
                ) {
                  event.preventDefault();
                  const next =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? visible.length - 1
                        : event.key === "ArrowDown"
                          ? Math.min(visible.length - 1, index + 1)
                          : Math.max(0, index - 1);
                  setSelected(visible[next] as string);
                }
              }
            }
          >
            {visible.map(
              /** Retains native ordered sheet names as single-select rows. @param name - Actual name. @returns Row. */ (
                name,
              ) => (
                <div
                  key={name}
                  id={`calc-goto-sheet-${names.indexOf(name)}`}
                  role="option"
                  aria-selected={selected === name}
                  className={`cursor-default rounded px-3 py-1.5 text-sm ${selected === name ? "bg-indigo-100 text-indigo-900" : "text-slate-700 hover:bg-slate-100"}`}
                  onClick={
                    /** Selects a row without changing the document. @returns Nothing. */ () => {
                      setSelected(name);
                      list.current?.focus();
                    }
                  }
                  onDoubleClick={
                    /** Native item activation responds OK with this selected entry. @returns Nothing. */ () =>
                      onSubmit(name)
                  }
                >
                  {name}
                </div>
              ),
            )}
          </div>
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
