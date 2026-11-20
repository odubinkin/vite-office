/** @fileoverview Browser presentation of showsheetdialog.ui and tabcolordialog.ui. */
import { useId, useLayoutEffect, useRef, useState } from "react";
import { ScGroupDlg } from "./ScGroupDlg";
import { DialogHeader } from "../../../framework/browser/presentation/DialogHeader";
import palettes from "../../../svx/browser/tbxctrls/color-palettes.json" with { type: "json" };
import type { CalcSheetTabDialog } from "../workflows/calc-sheet-workflows";

/** Immutable dialog inputs and response callbacks. */
interface ScSheetTabDialogProps {
  readonly model: CalcSheetTabDialog;
  readonly onCancel: () => void;
  readonly onSubmit: (value: number[] | string) => void;
}

/** Presents the active tab or outline request from the shared sheet workflow. @param props - Dialog and result handlers. @returns Modal. */
export function ScSheetTabDialog(props: ScSheetTabDialogProps): React.JSX.Element {
  const { model, onCancel, onSubmit } = props;
  if (model.kind === "group" || model.kind === "ungroup")
    return (
      <ScGroupDlg ungroup={model.kind === "ungroup"} onCancel={onCancel} onSubmit={onSubmit} />
    );
  return <ScSheetChooser model={model} onCancel={onCancel} onSubmit={onSubmit} />;
}

/** Presents the source multi-select list or palette and its original response buttons. @param props - Dialog data and response callbacks. @returns Modal. */
function ScSheetChooser({
  model,
  onCancel,
  onSubmit,
}: Omit<ScSheetTabDialogProps, "model"> & {
  readonly model: Exclude<CalcSheetTabDialog, { readonly kind: "group" | "ungroup" }>;
}): React.JSX.Element {
  const [palette, setPalette] = useState<keyof typeof palettes>("Standard");
  const [color, setColor] = useState("auto");
  const title =
    model.kind === "color" ? "Tab Color" : model.kind === "show" ? "Show Sheet" : "Select Sheets";
  const list = useRef<HTMLSelectElement>(null),
    defaultButton = useRef<HTMLButtonElement>(null);
  const group = useId();
  useLayoutEffect(
    /** Moves focus into the active dialog. @returns Nothing. */
    () => (list.current ?? defaultButton.current)?.focus(),
    [],
  );

  /** Returns selected list rows in document order. @returns Row indices. */
  function selectedRows(): number[] {
    return Array.from(
      list.current?.selectedOptions ?? [],
      /** Converts an option's row value. @param option - Selected row. @returns Index. */
      (option) => Number(option.value),
    );
  }

  return (
    <div
      role="dialog"
      aria-label={title}
      aria-modal="true"
      data-office-modal="true"
      className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      onKeyDown={
        /** Cancels from any dialog widget. @param event - Browser key event. @returns Nothing. */
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
        className="office-dialog-form w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={
          /** Accepts the current widget selection. @param event - Native form submit. @returns Nothing. */
          (event) => {
            event.preventDefault();
            onSubmit(model.kind === "color" ? color : selectedRows());
          }
        }
      >
        <DialogHeader title={title} onClose={onCancel} />
        <div className="office-dialog-content">
          {model.kind === "color" ? (
            <>
              <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                Palette:
                <select
                  className="min-w-0 flex-1 rounded-md border border-slate-300 p-2 font-normal"
                  value={palette}
                  onChange={
                    /** Resets the active swatch when the palette reloads. @param event - Selected palette. @returns Nothing. */
                    (event) => {
                      setPalette(event.target.value as keyof typeof palettes);
                      setColor("auto");
                    }
                  }
                >
                  {Object.keys(palettes).map(
                    /** Renders one available palette. @param name - Palette name. @returns Option. */
                    (name) => (
                      <option key={name}>{name}</option>
                    ),
                  )}
                </select>
              </label>
              <button
                type="button"
                ref={defaultButton}
                aria-pressed={color === "auto"}
                className="office-dialog-secondary mt-3"
                onClick={
                  /** Chooses the native automatic tab color. @returns Nothing. */ () =>
                    setColor("auto")
                }
              >
                Default
              </button>
              <fieldset className="mt-3">
                <legend className="sr-only">Tab colors</legend>
                <div className="grid max-h-56 grid-cols-12 gap-1 overflow-y-auto p-1">
                  {palettes[palette].map(
                    /** Uses native single-choice keyboard and pointer behavior for each palette swatch. @param swatch - Palette entry. @param index - Palette position. @returns Swatch. */
                    (swatch, index) => (
                      <label key={index} title={swatch} className="relative block aspect-square">
                        <input
                          type="radio"
                          name={group}
                          aria-label={swatch}
                          className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          checked={color === swatch && palettes[palette].indexOf(swatch) === index}
                          onChange={
                            /** Chooses this color. @returns Nothing. */ () => setColor(swatch)
                          }
                          onDoubleClick={
                            /** Accepts an activated swatch. @returns Nothing. */ () =>
                              onSubmit(swatch)
                          }
                        />
                        <span
                          aria-hidden="true"
                          className="block h-full rounded border border-slate-300 peer-checked:ring-2 peer-checked:ring-indigo-600 peer-focus-visible:outline peer-focus-visible:outline-offset-2"
                          style={{ backgroundColor: swatch }}
                        />
                      </label>
                    ),
                  )}
                </div>
              </fieldset>
            </>
          ) : (
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              {model.kind === "show" ? "Hidden Sheets" : "Selected sheets"}
              <select
                ref={list}
                multiple
                size={10}
                className="w-full rounded-md border border-slate-300 p-1 font-normal"
                defaultValue={model.selected.map(String)}
                onDoubleClick={
                  /** Activates the current list selection. @returns Nothing. */ () =>
                    onSubmit(selectedRows())
                }
                onKeyDown={
                  /** Mirrors native activation by Enter. @param event - Widget key. @returns Nothing. */
                  (event) => {
                    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
                    event.preventDefault();
                    onSubmit(selectedRows());
                  }
                }
              >
                {model.names.map(
                  /** Preserves document order. @param name - Sheet name. @param index - Sheet list row. @returns Option. */
                  (name, index) => (
                    <option key={name} value={index}>
                      {name}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
        </div>
        <div className="office-dialog-actions">
          {model.kind !== "color" && (
            <button type="button" className="office-dialog-secondary mr-auto" disabled>
              Help
            </button>
          )}
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
