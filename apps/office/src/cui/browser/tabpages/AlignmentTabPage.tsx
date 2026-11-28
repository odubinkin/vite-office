/** @fileoverview Browser presentation of the original CUI cell Alignment notebook page. */
import { useId, useRef } from "react";
import { DialControl } from "../../../svx/browser/dialog/DialControl";
import {
  referenceEdges,
  writingDirections,
  type AlignmentTabPage as AlignmentModel,
  type AlignmentValues,
} from "../../source/tabpages/align";

const group = "grid content-start gap-3 rounded border border-slate-200 p-3 text-sm";
const field =
  "min-w-0 rounded border border-slate-300 bg-white px-2 py-1 text-sm disabled:bg-slate-50";
const horizontalLabels = [
  "Default",
  "Left",
  "Center",
  "Right",
  "Justified",
  "Filled",
  "Distributed",
];
const verticalLabels = ["Default", "Top", "Middle", "Bottom", "Justified", "Distributed"];
const edgeLabels = [
  "Text Extension From Lower Cell Border",
  "Text Extension From Upper Cell Border",
  "Text Extension Inside Cell",
];

/** Projects the alignment properties using source-sensitive control state. @param props - Original CUI page and edit notification. @returns Original Alignment groups. */
export function AlignmentTabPage({
  page,
  changed,
}: Readonly<{ page: AlignmentModel; changed: () => void }>): React.JSX.Element {
  const degrees = useRef<HTMLInputElement>(null);
  const referenceName = useId();
  const values = page.GetValues();
  const enabled = page.GetSensitivity();

  /** Updates one linked browser control in the native page. @param name - Control identity. @param value - Actual edit. @returns Nothing. */
  function set<K extends keyof AlignmentValues>(name: K, value: AlignmentValues[K]): void {
    page.SetValue(name, value);
    changed();
  }

  /** Renders one native checkbox with its mixed and enabled states. @param name - Control identity. @param label - Caption. @param disabled - Whether the control is insensitive. @returns Checkbox. */
  function checkbox(
    name: "stacked" | "asian" | "wrap" | "hyphen" | "shrink",
    label: string,
    disabled = false,
  ): React.JSX.Element {
    return (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={values[name] === true}
          disabled={disabled}
          ref={
            /** Projects the source indeterminate value into the native input. @param element - Mounted checkbox. @returns Nothing. */
            (element) => {
              if (element) element.indeterminate = values[name] === undefined;
            }
          }
          onChange={
            /** Cycles the actual native checkbox state. @returns Nothing. */ () => {
              page.Toggle(name);
              changed();
            }
          }
        />
        {label}
      </label>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <fieldset className={group}>
        <legend className="px-1 font-medium">Text alignment</legend>
        <AlignmentChoice
          label="Horizontal"
          value={values.horizontal}
          options={horizontalLabels}
          changed={
            /** Selects horizontal alignment. @param value - Source entry ID. @returns Nothing. */ (
              value,
            ) => set("horizontal", value)
          }
        />
        <label className="grid grid-cols-2 items-center gap-2">
          Indent
          <input
            className={field}
            type="number"
            min={0}
            max={990}
            step="any"
            value={values.indent === undefined ? "" : values.indent / 20}
            disabled={!enabled.indent}
            onKeyDown={
              /** Applies the native ten-point increment without restricting typed values to the step grid. @param event - Indent key. @returns Nothing. */
              (event) => {
                if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                event.preventDefault();
                const next = (values.indent ?? 0) + (event.key === "ArrowUp" ? 200 : -200);
                set("indent", Math.min(19800, Math.max(0, next)));
              }
            }
            onChange={
              /** Writes the point entry in native twips. @param event - Edited indent. @returns Nothing. */
              (event) => {
                const points = event.currentTarget.valueAsNumber;
                if (Number.isFinite(points))
                  set("indent", Math.round(Math.min(990, Math.max(0, points)) * 20));
              }
            }
          />
        </label>
        <AlignmentChoice
          label="Vertical"
          value={values.vertical}
          options={verticalLabels}
          changed={
            /** Selects vertical alignment. @param value - Source entry ID. @returns Nothing. */ (
              value,
            ) => set("vertical", value)
          }
        />
      </fieldset>
      <fieldset className={group}>
        <legend className="px-1 font-medium">Text orientation</legend>
        <div className="grid grid-cols-2 items-center gap-2">
          <DialControl
            angle={values.angle}
            disabled={!enabled.angle}
            onChange={
              /** Synchronizes the angle from the dial. @param value - Rotation in hundredths. @returns Nothing. */ (
                value,
              ) => set("angle", value)
            }
            focusField={
              /** Returns focus to the linked spin field. @returns Nothing. */ () =>
                degrees.current?.focus()
            }
          />
          <label className="grid gap-1">
            Degrees
            <input
              className={field}
              type="number"
              ref={degrees}
              min={0}
              max={359}
              step="any"
              value={values.angle === undefined ? "" : Math.trunc(values.angle / 100)}
              disabled={!enabled.angle}
              onChange={
                /** Updates the dial from its original bounded spin field. @param event - Edited angle. @returns Nothing. */
                (event) => {
                  const angle = event.currentTarget.valueAsNumber;
                  if (Number.isFinite(angle))
                    set("angle", Math.round(Math.min(359, Math.max(0, angle))) * 100);
                }
              }
              onKeyDown={
                /** Wraps the original spin field across its zero and 359 degree endpoints. @param event - Field key. @returns Nothing. */
                (event) => {
                  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                  event.preventDefault();
                  const current = Math.trunc((values.angle ?? 0) / 100);
                  const next = current + (event.key === "ArrowUp" ? 5 : -5);
                  set("angle", ((next + 360) % 360) * 100);
                }
              }
            />
          </label>
        </div>
        <fieldset className="grid grid-cols-3 gap-1" disabled={!enabled.reference}>
          <legend className="mb-1">Reference edge</legend>
          {referenceEdges.map(
            /** Presents one source reference edge in the value-set order. @param edge - Native rotation mode. @param index - Visible order. @returns Edge option. */
            (edge, index) => (
              <label
                key={edge}
                className="relative grid rounded border border-slate-300 p-1.5 text-center text-xs has-[:checked]:bg-indigo-50 has-[:disabled]:opacity-50"
              >
                <input
                  type="radio"
                  name={referenceName}
                  checked={values.reference === edge}
                  onChange={
                    /** Selects the actual rotation reference. @returns Nothing. */ () =>
                      set("reference", edge)
                  }
                />
                {edgeLabels[index]}
              </label>
            ),
          )}
        </fieldset>
        {checkbox("stacked", "Vertically stacked", !enabled.stacked)}
        {page.HasAsianVertical() && checkbox("asian", "Asian layout mode", !enabled.asian)}
      </fieldset>
      <fieldset className={group + " sm:col-span-2"}>
        <legend className="px-1 font-medium">Properties</legend>
        {checkbox("wrap", "Wrap text automatically")}
        {checkbox("hyphen", "Hyphenation active", !enabled.hyphen)}
        {checkbox("shrink", "Shrink to fit cell size", !enabled.shrink)}
        <AlignmentChoice
          label="Text direction"
          value={
            values.direction === undefined ? undefined : writingDirections.indexOf(values.direction)
          }
          options={[
            "Left-to-right (LTR)",
            "Right-to-left (RTL)",
            "Use superordinate object settings",
          ]}
          changed={
            /** Maps the original frame direction option to its native enum. @param value - UI position. @returns Nothing. */
            (value) => set("direction", writingDirections[value])
          }
        />
      </fieldset>
    </div>
  );
}

/** Displays a native choice from the source active row or its mixed state. @param props - Choice label, entries and selected value. @returns Label and select. */
function AlignmentChoice({
  label,
  value,
  options,
  changed,
}: Readonly<{
  label: string;
  value: number | undefined;
  options: readonly string[];
  changed: (value: number) => void;
}>): React.JSX.Element {
  return (
    <label className="grid grid-cols-2 items-center gap-2">
      {label}
      <select
        className={field}
        value={value ?? ""}
        onChange={
          /** Exchanges the selected source combo entry. @param event - Selection. @returns Nothing. */
          (event) => changed(Number(event.currentTarget.value))
        }
      >
        {value === undefined && <option value="" disabled />}
        {options.map(
          /** Uses the source combo-box position as the option ID. @param label - Source caption. @param index - Choice identity. @returns Option. */
          (label, index) => (
            <option key={label} value={index}>
              {label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}
