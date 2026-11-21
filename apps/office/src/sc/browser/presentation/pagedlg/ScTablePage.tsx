/** @fileoverview Native Calc Sheet print tab widgets from sheetprintpage.ui. */
import { useId, useRef } from "react";
import {
  sheetPrintFlags,
  sheetPrintObjects,
  sheetScaleModes,
  type ScTablePageState,
} from "../../../source/ui/pagedlg/tptable";

/** Checkbox and spinner controls of the original table page. */
interface ScTablePageProps {
  readonly state: ScTablePageState;
  readonly onChange: (state: ScTablePageState) => void;
}

/** Constrains browser numeric inputs to native GtkAdjustment bounds. @param value - Entry value. @param min - Lower limit. @param max - Upper limit. @returns Integral adjustment value. */
function adjusted(value: string, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.trunc(Number(value))));
}

/** Renders page order, print flags and the original mutually exclusive scaling controls. @param props - Source settings. @returns Sheet tab. */
export function ScTablePage({ state, onChange }: ScTablePageProps): React.JSX.Element {
  const order = useId();
  const first = useRef<HTMLInputElement>(null);
  const print = [...sheetPrintFlags.slice(0, 3), ...sheetPrintObjects, ...sheetPrintFlags.slice(3)];
  const inputClass = "w-24 rounded-md border border-slate-300 px-2 py-1 disabled:bg-slate-100";
  return (
    <div className="grid gap-4 text-sm">
      <fieldset className="grid gap-2 rounded-md border border-slate-200 p-3">
        <legend className="px-1 font-semibold">Page Order</legend>
        {([true, false] as const).map((topDown) => (
          <label className="flex items-center gap-2" key={String(topDown)}>
            <input
              type="radio"
              name={order}
              checked={state.topDown === topDown}
              onChange={() => onChange({ ...state, topDown })}
            />
            {topDown ? "Top to bottom, then right" : "Left to right, then down"}
          </label>
        ))}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.useFirstPage}
              onChange={(event) => onChange({ ...state, useFirstPage: event.target.checked })}
            />
            First page number
          </label>
          <input
            ref={first}
            aria-label="First page number value"
            type="number"
            className={inputClass}
            min={1}
            max={9999}
            value={state.firstPage}
            disabled={!state.useFirstPage}
            onChange={(event) =>
              onChange({ ...state, firstPage: adjusted(event.target.value, 1, 9999) })
            }
          />
        </div>
      </fieldset>
      <fieldset className="grid grid-cols-1 gap-2 rounded-md border border-slate-200 p-3 sm:grid-cols-2">
        <legend className="px-1 font-semibold">Print</legend>
        {print.map(([key, title]) => (
          <label className="flex items-center gap-2" key={key}>
            <input
              type="checkbox"
              checked={state.flags[key]}
              onChange={(event) =>
                onChange({ ...state, flags: { ...state.flags, [key]: event.target.checked } })
              }
            />
            {title}
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-3 rounded-md border border-slate-200 p-3">
        <legend className="px-1 font-semibold">Scale</legend>
        <label className="grid gap-1">
          Scaling mode
          <select
            className="rounded-md border border-slate-300 p-2"
            value={state.scaleMode}
            onChange={(event) =>
              onChange({
                ...state,
                scaleMode: Number(event.target.value) as ScTablePageState["scaleMode"],
              })
            }
          >
            {sheetScaleModes.map((label, index) => (
              <option key={label} value={index}>
                {label}
              </option>
            ))}
          </select>
        </label>
        {state.scaleMode === 1 ? (
          <div className="grid gap-2">
            {(["width", "height"] as const).map((axis) => {
              const label = axis === "width" ? "Width in pages" : "Height in pages";
              return (
                <div className="flex items-center gap-3" key={axis}>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state[axis] !== 0}
                      onChange={(event) =>
                        onChange({ ...state, [axis]: event.target.checked ? 1 : 0 })
                      }
                    />
                    {label}
                  </label>
                  <input
                    aria-label={label + " value"}
                    className={inputClass}
                    type="number"
                    min={1}
                    max={1000}
                    disabled={!state[axis]}
                    value={state[axis] || ""}
                    onChange={(event) =>
                      onChange({ ...state, [axis]: adjusted(event.target.value, 1, 1000) })
                    }
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <label className="flex items-center gap-3">
            {state.scaleMode === 0 ? "Scaling factor" : "Number of pages"}
            <input
              className={inputClass}
              type="number"
              min={state.scaleMode === 0 ? 10 : 1}
              max={state.scaleMode === 0 ? 400 : 1000}
              value={state.scaleMode === 0 ? state.percent : state.pages}
              onChange={(event) =>
                onChange(
                  state.scaleMode === 0
                    ? { ...state, percent: adjusted(event.target.value, 10, 400) }
                    : { ...state, pages: adjusted(event.target.value, 1, 1000) },
                )
              }
            />
            {state.scaleMode === 0 ? "%" : null}
          </label>
        )}
      </fieldset>
    </div>
  );
}
