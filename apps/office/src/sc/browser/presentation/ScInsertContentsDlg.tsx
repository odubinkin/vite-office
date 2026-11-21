/** @fileoverview Browser rendering of the original Calc Paste Special groups. */
import { useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import { InsertDeleteFlags as F } from "../../inc/global";
import {
  pasteSpecialPresets,
  type ScInsertContentsResponse,
  type ScInsertContentsState,
} from "../../source/ui/miscdlgs/inscodlg";

const content = [
  [F.VALUE, "Numbers"],
  [F.STRING, "Text"],
  [F.DATETIME, "Date & time"],
  [F.ATTRIB, "Formats"],
  [F.NOTE, "Comments"],
  [F.OBJECTS, "Objects"],
  [F.FORMULA, "Formulas"],
] as const;
const fieldClass = "space-y-1 rounded border border-slate-300 px-3 pb-2";
const labelClass = "flex items-center gap-2";
const buttonClass = "office-dialog-secondary";

/** Pending source options and dialog response. */
interface Props {
  readonly initial: ScInsertContentsState;
  readonly onRespond: (result: ScInsertContentsResponse) => void;
}

/** Presents the native Paste Special groups and their represented choices. @param props - Active request. @returns Paste Special dialog. */
export function ScInsertContentsDlg({ initial, onRespond }: Props): React.JSX.Element {
  const [state, setState] = useState(initial);
  const [immediate, setImmediate] = useState(true);
  const title = "Paste Special";
  /** Closes with the current options and the native acceptance decision. @param accepted - Whether to paste. @returns Nothing. */
  const close = (accepted: boolean): void => onRespond({ accepted, selection: state });
  return (
    <form
      role="dialog"
      aria-label={title}
      aria-modal="true"
      className="office-dialog-panel fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-1rem)] w-[34rem] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        close(false);
      }}
      onSubmit={(event) => {
        event.preventDefault();
        close(true);
      }}
    >
      <DialogHeader title={title} onClose={() => close(false)} />
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        <fieldset className={fieldClass + " col-span-2"}>
          <legend>Presets</legend>
          <div className="flex flex-wrap gap-2">
            {pasteSpecialPresets.map(({ label, selection }) => (
              <button
                key={label}
                type="button"
                className={buttonClass}
                onClick={() => {
                  if (immediate) onRespond({ accepted: true, selection });
                  else setState(selection);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <label className={labelClass}>
            <input
              type="checkbox"
              checked={immediate}
              onChange={(event) => setImmediate(event.target.checked)}
            />
            Run immediately
          </label>
        </fieldset>
        <div className="space-y-3">
          <fieldset className={fieldClass}>
            <legend>Paste</legend>
            <label className={labelClass}>
              <input
                type="checkbox"
                checked={state.all}
                onChange={(event) => setState({ ...state, all: event.target.checked })}
              />
              All
            </label>
            {content.map(([flag, label]) => (
              <label key={flag} className={labelClass}>
                <input
                  type="checkbox"
                  checked={Boolean(state.flags & flag)}
                  disabled={state.all || flag === F.NOTE || flag === F.OBJECTS}
                  onChange={(event) =>
                    setState({
                      ...state,
                      flags: (event.target.checked ? state.flags | flag : state.flags & ~flag) as F,
                    })
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
          <fieldset className={fieldClass}>
            <legend>Shift Cells</legend>
            {["Don't shift", "Down", "Right"].map((label, index) => (
              <label key={label} className={labelClass}>
                <input
                  type="radio"
                  name="shift"
                  checked={index === 0}
                  readOnly
                  disabled={index !== 0}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
        <div className="space-y-3">
          <fieldset className={fieldClass}>
            <legend>Options</legend>
            <label className={labelClass}>
              <input type="checkbox" disabled />
              As Link
            </label>
            <label className={labelClass}>
              <input
                type="checkbox"
                checked={state.transpose}
                onChange={(event) => setState({ ...state, transpose: event.target.checked })}
              />
              Transpose
            </label>
            <label className={labelClass}>
              <input
                type="checkbox"
                checked={state.skipEmpty}
                onChange={(event) => setState({ ...state, skipEmpty: event.target.checked })}
              />
              Skip empty cells
            </label>
          </fieldset>
          <fieldset className={fieldClass}>
            <legend>Operations</legend>
            {["None", "Add", "Subtract", "Multiply", "Divide"].map((label, index) => (
              <label key={label} className={labelClass}>
                <input
                  type="radio"
                  name="operation"
                  checked={index === 0}
                  readOnly
                  disabled={index !== 0}
                />
                {label}
              </label>
            ))}
          </fieldset>
        </div>
      </div>
      <div className="office-dialog-actions">
        <button type="button" className={buttonClass + " mr-auto"} disabled>
          Help
        </button>
        <button type="button" className={buttonClass} onClick={() => close(false)}>
          Cancel
        </button>
        <button type="submit" className="office-dialog-primary" autoFocus>
          OK
        </button>
      </div>
    </form>
  );
}
