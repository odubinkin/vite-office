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
  const close =
    /** Closes Paste Special with the current selection and the requested disposition. @param accepted - Whether the user accepted the operation. @returns Nothing. */ (
      accepted: boolean,
    ): void => onRespond({ accepted, selection: state });
  return (
    <form
      role="dialog"
      aria-label={title}
      aria-modal="true"
      className="office-dialog-panel fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-1rem)] w-[34rem] max-w-[calc(100vw-1rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto"
      onKeyDown={
        /** Closes the active dialog. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.key !== "Escape") return;
          event.preventDefault();
          event.stopPropagation();
          close(false);
        }
      }
      onSubmit={
        /** Closes the active dialog. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          event.preventDefault();
          close(true);
        }
      }
    >
      <DialogHeader
        title={title}
        onClose={
          /** Rejects the Paste Special dialog from its modal close control. @returns Nothing. */ () =>
            close(false)
        }
      />
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        <fieldset className={fieldClass + " col-span-2"}>
          <legend>Presets</legend>
          <div className="flex flex-wrap gap-2">
            {pasteSpecialPresets.map(
              /** Renders one button for the source entry. @param entry - Source entry. @returns Rendered element. */ ({
                label,
                selection,
              }) => (
                <button
                  key={label}
                  type="button"
                  className={buttonClass}
                  onClick={
                    /** Reports the dialog result and updates the state. @returns Nothing. */ () => {
                      if (immediate) onRespond({ accepted: true, selection });
                      else setState(selection);
                    }
                  }
                >
                  {label}
                </button>
              ),
            )}
          </div>
          <label className={labelClass}>
            <input
              type="checkbox"
              checked={immediate}
              onChange={
                /** Updates the immediate. @param event - Control change event. @returns Nothing. */ (
                  event,
                ) => setImmediate(event.target.checked)
              }
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
                onChange={
                  /** Updates the state. @param event - Control change event. @returns Nothing. */ (
                    event,
                  ) => setState({ ...state, all: event.target.checked })
                }
              />
              All
            </label>
            {content.map(
              /** Renders one label for the source entry. @param entry - Source entry. @returns Rendered element. */ ([
                flag,
                label,
              ]) => (
                <label key={flag} className={labelClass}>
                  <input
                    type="checkbox"
                    checked={Boolean(state.flags & flag)}
                    disabled={state.all || flag === F.NOTE || flag === F.OBJECTS}
                    onChange={
                      /** Updates the state. @param event - Control change event. @returns Nothing. */ (
                        event,
                      ) =>
                        setState({
                          ...state,
                          flags: (event.target.checked
                            ? state.flags | flag
                            : state.flags & ~flag) as F,
                        })
                    }
                  />
                  {label}
                </label>
              ),
            )}
          </fieldset>
          <fieldset className={fieldClass}>
            <legend>Shift Cells</legend>
            {["Don't shift", "Down", "Right"].map(
              /** Renders one label for the source entry. @param label - Source entry. @param index - Entry index. @returns Rendered element. */ (
                label,
                index,
              ) => (
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
              ),
            )}
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
                onChange={
                  /** Updates the state. @param event - Control change event. @returns Nothing. */ (
                    event,
                  ) => setState({ ...state, transpose: event.target.checked })
                }
              />
              Transpose
            </label>
            <label className={labelClass}>
              <input
                type="checkbox"
                checked={state.skipEmpty}
                onChange={
                  /** Updates the state. @param event - Control change event. @returns Nothing. */ (
                    event,
                  ) => setState({ ...state, skipEmpty: event.target.checked })
                }
              />
              Skip empty cells
            </label>
          </fieldset>
          <fieldset className={fieldClass}>
            <legend>Operations</legend>
            {["None", "Add", "Subtract", "Multiply", "Divide"].map(
              /** Renders one label for the source entry. @param label - Source entry. @param index - Entry index. @returns Rendered element. */ (
                label,
                index,
              ) => (
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
              ),
            )}
          </fieldset>
        </div>
      </div>
      <div className="office-dialog-actions">
        <button type="button" className={buttonClass + " mr-auto"} disabled>
          Help
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={
            /** Rejects the Paste Special selection from the Cancel button. @returns Nothing. */ () =>
              close(false)
          }
        >
          Cancel
        </button>
        <button type="submit" className="office-dialog-primary" autoFocus>
          OK
        </button>
      </div>
    </form>
  );
}
