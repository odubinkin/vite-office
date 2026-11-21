/** @fileoverview Browser controls for the Calc Header and Footer tabs of Page Style. */
import type { FieldUnit } from "../../../../tools/inc/fldunit";
import type { ScHFPageState } from "../../../source/ui/pagedlg/tphf";
import { PageStyleMetric } from "./PageStyleMetric";

/** Native six settings and four dimensions for the active header/footer tab. */
interface ScHFPageProps {
  readonly title: "Header" | "Footer";
  readonly state: ScHFPageState;
  readonly unit: FieldUnit;
  readonly shareSides: boolean;
  readonly onChange: (value: ScHFPageState) => void;
}

const geometry = [
  ["left", "Left margin"],
  ["right", "Right margin"],
  ["spacing", "Spacing"],
  ["height", "Height"],
] as const;

/** Renders the original header/footer configuration and disables layout fields while off. @param props - Source controls. @returns Tab contents. */
export function ScHFPage({
  title,
  state,
  unit,
  shareSides,
  onChange,
}: ScHFPageProps): React.JSX.Element {
  return (
    <div className="grid gap-4 text-sm">
      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={(event) => onChange({ ...state, enabled: event.target.checked })}
        />
        {title} on
      </label>
      <fieldset
        disabled={!state.enabled}
        className="grid gap-3 rounded-md border border-slate-200 p-3"
      >
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.shared}
            disabled={!shareSides}
            onChange={(event) => onChange({ ...state, shared: event.target.checked })}
          />
          Same content on left and right pages
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.sharedFirst}
            onChange={(event) => onChange({ ...state, sharedFirst: event.target.checked })}
          />
          Same content on first page
        </label>
        <div className="grid grid-cols-2 gap-3">
          {geometry.map(([key, label]) => (
            <PageStyleMetric
              key={key}
              label={label}
              unit={unit}
              value={state[key]}
              onChange={(value) => onChange({ ...state, [key]: value })}
            />
          ))}
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.dynamic}
            onChange={(event) => onChange({ ...state, dynamic: event.target.checked })}
          />
          AutoFit height
        </label>
      </fieldset>
    </div>
  );
}
