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
  readonly onEdit: (button: HTMLButtonElement) => void;
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
  onEdit,
}: ScHFPageProps): React.JSX.Element {
  return (
    <div className="grid gap-4 text-sm">
      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={
            /** Updates whether the header or footer is enabled. @param event - Enabled checkbox change event. @returns Nothing. */ (
              event,
            ) => onChange({ ...state, enabled: event.target.checked })
          }
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
            onChange={
              /** Updates whether the region is shared across left and right pages. @param event - Sharing checkbox change event. @returns Nothing. */ (
                event,
              ) => onChange({ ...state, shared: event.target.checked })
            }
          />
          Same content on left and right pages
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.sharedFirst}
            onChange={
              /** Updates whether the first page shares the same region. @param event - First-page sharing checkbox change event. @returns Nothing. */ (
                event,
              ) => onChange({ ...state, sharedFirst: event.target.checked })
            }
          />
          Same content on first page
        </label>
        <div className="grid grid-cols-2 gap-3">
          {geometry.map(
            /** Renders one PageStyleMetric for the source entry. @param entry - Source entry. @returns Rendered element. */ ([
              key,
              label,
            ]) => (
              <PageStyleMetric
                key={key}
                label={label}
                unit={unit}
                value={state[key]}
                onChange={
                  /** Applies the dimension value to the relevant header or footer setting. @param value - Region dimension in the item's units. @returns Nothing. */ (
                    value,
                  ) => onChange({ ...state, [key]: value })
                }
              />
            ),
          )}
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={state.dynamic}
            onChange={
              /** Updates whether the region height grows automatically. @param event - Automatic height checkbox change event. @returns Nothing. */ (
                event,
              ) => onChange({ ...state, dynamic: event.target.checked })
            }
          />
          AutoFit height
        </label>
        <button
          type="button"
          className="office-dialog-secondary justify-self-start"
          onClick={
            /** Opens the region text editor from its originating button. @param event - Edit button click event. @returns Nothing. */ (
              event,
            ) => onEdit(event.currentTarget)
          }
        >
          Edit…
        </button>
      </fieldset>
    </div>
  );
}
