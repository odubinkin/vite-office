/** @fileoverview React presentation of native ColWidthDialog/RowHeightDialog over the source ScMetricInputDlg and shared Writer dialog styling. */
import { ChevronUp, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, useId, type MouseEvent } from "react";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import { FieldUnit } from "../../../tools/inc/fldunit";
import {
  getSystemDecimalSeparator,
  getSystemDecimalSeparatorAlternate,
} from "../../../unotools/source/misc/syslocale";
import type { ScMetricInputDlg as NativeDialog } from "../../source/ui/miscdlgs/mtrindlg";
/** Native dialog result callbacks and real numeric owner. */
export interface ScMetricInputDlgProps {
  readonly model: NativeDialog;
  readonly onCancel: () => void;
  readonly onSubmit: (twips: number) => void;
}
/** Presents native dimension/default controls;only temporary text is React state. @param props - Actual dialog and completion. @returns Modal. */
export function ScMetricInputDlg({
  model,
  onCancel,
  onSubmit,
}: ScMetricInputDlgProps): React.JSX.Element {
  const width = model.dialogName === "ColWidthDialog",
    title = width ? "Column Width" : "Row Height",
    label = width ? "Width" : "Height",
    scale = 10 ** model.decimals,
    increment = model.value.normalize(1n);
  const decimal = getSystemDecimalSeparator(),
    alternate = getSystemDecimalSeparatorAlternate(),
    valueId = useId(),
    input = useRef<HTMLInputElement>(null),
    [minimum, maximum] = model.value.get_range(FieldUnit.NONE);
  /** Source two-digit bounded CM/INCH formatting;the native one-metre domain never needs grouping. @returns Native display text. */
  function format(): string {
    const value = model.value.get_value(FieldUnit.NONE);
    return (
      (Number(value) / scale).toFixed(model.decimals).replace(".", decimal) +
      (model.unit === FieldUnit.INCH ? "″" : " cm")
    );
  }
  const [text, setText] = useState(format),
    [isDefault, setDefault] = useState(model.IsDefault());
  useEffect(
    /** Native width entry receives initial focus and selection. @returns Nothing. */ () => {
      input.current?.focus();
      input.current?.select();
    },
    [],
  );
  /** Reconciles accepted native parser output or restores last valid value. @returns Nothing. */
  function update(): void {
    model.value.set_text(text, decimal, alternate);
    setText(format());
    setDefault(model.IsDefault());
  }
  /** Native normalized step/page increments clamp through the shared metric owner. @param delta - Normalized increment. @returns Nothing. */
  function step(delta: bigint): void {
    model.value.set_text(text, decimal, alternate);
    model.value.set_value(model.value.get_value(FieldUnit.NONE) + delta, FieldUnit.NONE);
    setText(format());
    setDefault(model.IsDefault());
  }
  /** Native spin arrows retain entry focus during pointer adjustment. @param event - Pointer press. @returns Nothing. */
  function retainInputFocus(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
  }
  return (
    <div
      role="dialog"
      aria-label={title}
      aria-modal="true"
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Native Escape cancellation. @param event - Key. @returns Nothing. */ (event) => {
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
          /** Accepts parsed native metric twips. @param event - Submission. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            update();
            onSubmit(model.GetInputValue());
          }
        }
      >
        <DialogHeader title={title} onClose={onCancel} />
        <div className="office-dialog-content grid gap-4">
          <div className="grid gap-1 text-sm font-semibold text-slate-700">
            <label htmlFor={valueId}>{label}</label>
            <div className="flex overflow-hidden rounded-md border border-slate-300">
              <input
                ref={input}
                id={valueId}
                role="spinbutton"
                aria-valuemin={Number(minimum) / scale}
                aria-valuemax={Number(maximum) / scale}
                aria-valuenow={Number(model.value.get_value(FieldUnit.NONE)) / scale}
                aria-valuetext={text}
                aria-label={label}
                aria-description={
                  width
                    ? "Enter the column width that you want to use."
                    : "Enter the row height that you want to use."
                }
                className="min-w-0 flex-1 px-3 py-2 font-normal outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                value={text}
                onBlur={update}
                onChange={
                  /** Retains editable text while native parsing updates the default checkbox. @param event - Input. @returns Nothing. */ (
                    event,
                  ) => {
                    setText(event.target.value);
                    model.value.set_text(event.target.value, decimal, alternate);
                    setDefault(model.IsDefault());
                  }
                }
                onKeyDown={
                  /** Native decimal increments and page increments. @param event - Key. @returns Nothing. */ (
                    event,
                  ) => {
                    const key = event.key;
                    if (["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(key)) {
                      event.preventDefault();
                      const delta =
                        key === "PageUp" || key === "PageDown" ? increment : increment / 10n;
                      step(key === "ArrowUp" || key === "PageUp" ? delta : -delta);
                    }
                  }
                }
              />
              <div className="grid grid-rows-2 border-l border-slate-300">
                {([1n, -1n] as const).map(
                  /** Projects the native increment/decrement actions. @param direction - Step sign. @returns Arrow control. */ (
                    direction,
                  ) => (
                    <button
                      key={String(direction)}
                      type="button"
                      tabIndex={-1}
                      aria-label={
                        (direction > 0n ? "Increase " : "Decrease ") + label.toLowerCase()
                      }
                      disabled={
                        direction > 0n
                          ? model.value.get_value(FieldUnit.NONE) >= maximum
                          : model.value.get_value(FieldUnit.NONE) <= minimum
                      }
                      className="grid w-7 place-items-center bg-slate-50 text-slate-600 hover:bg-indigo-50 disabled:text-slate-300"
                      onMouseDown={retainInputFocus}
                      onClick={
                        /** Applies the native one-tenth display-unit increment. @returns Nothing. */ () =>
                          step(direction * (increment / 10n))
                      }
                    >
                      {direction > 0n ? (
                        <ChevronUp className="size-3" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="size-3" aria-hidden="true" />
                      )}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={
                /** Original user toggle saves/restores the previous native value. @param event - Toggle. @returns Nothing. */ (
                  event,
                ) => {
                  model.SetDefValHdl(event.target.checked);
                  setText(format());
                  setDefault(model.IsDefault());
                }
              }
            />
            Default value
          </label>
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
