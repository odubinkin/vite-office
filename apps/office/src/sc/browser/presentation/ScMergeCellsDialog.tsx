/** @fileoverview Browser radio controls and illustrations for the original Calc Merge Cells dialog. */
import { ArrowRight } from "lucide-react";
import { useId, useState } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import {
  ScMergeCellsOption,
  type ScMergeCellsDialog as NativeDialog,
} from "../../source/ui/miscdlgs/mergecellsdialog";

const choices = [
  {
    option: ScMergeCellsOption.MoveContentHiddenCells,
    label: "Move the contents of the hidden cells into the first cell",
    result: "A B C",
  },
  {
    option: ScMergeCellsOption.KeepContentHiddenCells,
    label: "Keep the contents of the hidden cells",
    result: "A",
  },
  {
    option: ScMergeCellsOption.EmptyContentHiddenCells,
    label: "Empty the contents of the hidden cells",
    result: "A",
  },
] as const;

/** Active native merge model and its modal completion. */
interface Props {
  readonly model: NativeDialog;
  readonly onCancel: () => void;
  readonly onSubmit: (option: ScMergeCellsOption) => void;
}

/** Shows the original occupied-cell question and three mutually exclusive policies. @param props - Native request and handlers. @returns Dialog. */
export function ScMergeCellsDialog({ model, onCancel, onSubmit }: Props): React.JSX.Element {
  const [choice, setChoice] = useState(model.initialOption);
  const group = useId(),
    message = useId();
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Merge Cells"
      aria-describedby={message}
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Handles keyboard input on the "Merge Cells" control. @param event - Browser event. @returns Nothing. */ (
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
        className="office-dialog-form max-h-full w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={
          /** Submits the current selection. @param event - Browser event. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            onSubmit(choice);
          }
        }
      >
        <DialogHeader title="Merge Cells" onClose={onCancel} />
        <fieldset className="space-y-3 px-4 py-3">
          <legend id={message} className="pt-3">
            Some cells are not empty.
          </legend>
          {choices.map(
            /** Renders one div for the source entry. @param entry - Source entry. @returns Rendered element. */ ({
              option,
              label,
              result,
            }) => (
              <div key={option}>
                <label className="flex items-start gap-2">
                  <input
                    type="radio"
                    name={group}
                    checked={choice === option}
                    onChange={/** Updates the choice. @returns Nothing. */ () => setChoice(option)}
                    className="mt-1"
                  />
                  {label}
                </label>
                <div aria-hidden="true" className="ml-6 mt-1 flex items-center gap-2 text-xs">
                  <span className="grid w-16 grid-cols-3 divide-x divide-slate-300 border border-slate-300 text-center">
                    <span>A</span>
                    <span>B</span>
                    <span>C</span>
                  </span>
                  <ArrowRight size={14} />
                  <span className="relative block w-16 border border-indigo-300 bg-indigo-50 px-1">
                    {result}
                    {option === ScMergeCellsOption.KeepContentHiddenCells && (
                      <span className="absolute inset-y-0 right-0 w-2/3 border-l border-dashed border-indigo-300 bg-indigo-100/60 text-center text-indigo-600/60">
                        B C
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ),
          )}
        </fieldset>
        <div className="office-dialog-actions">
          <button type="button" className="office-dialog-secondary mr-auto" disabled>
            Help
          </button>
          <button type="button" className="office-dialog-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="office-dialog-primary" autoFocus>
            OK
          </button>
        </div>
      </form>
    </div>
  );
}
