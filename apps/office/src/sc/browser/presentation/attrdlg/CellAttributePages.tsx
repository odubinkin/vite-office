/** @fileoverview Asian Typography and Cell Protection controls over native Calc items. */
import {
  asianTypographyControls,
  type AsianTypographySlot,
  type SvxAsianTabPage,
} from "../../../../cui/source/tabpages/paragrph";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { ScProtectionAttr } from "../../../inc/attrib";
import { ATTR_PROTECTION } from "../../../inc/scitems";
import type { ScAttrDlg } from "../../../source/ui/attrdlg/attrdlg";

/** Keeps page edits in the actual staged item set. */
interface PageProps {
  readonly model: ScAttrDlg;
  readonly onChange: (items: readonly SfxPoolItem[]) => void;
}

/** Reads a dialog value with its original mixed state. @param model - Dialog state. @param which - Attribute. @returns Effective native item. */
function item<T extends SfxPoolItem>(model: ScAttrDlg, which: number): T | undefined {
  return model.GetItem<T>(which);
}

/** Projects the source compound protection item and its independent print flag.
 * @param props - Dialog item owners.
 * @param props.model - Input and staged sets.
 * @param props.onChange - Writes one compound item.
 * @returns Cell Protection tab.
 */
export function CellProtectionTabPage({ model, onChange }: PageProps): React.JSX.Element {
  const active = item<ScProtectionAttr>(model, ATTR_PROTECTION);
  /** Updates the full pooled item while retaining the other flags. @param field - Source setter. @param value - Changed flag. @returns Nothing. */
  function change(
    field: "SetProtection" | "SetHideCell" | "SetHideFormula" | "SetHidePrint",
    value: boolean,
  ): void {
    const next = active ? new ScProtectionAttr(active) : new ScProtectionAttr();
    next[field](value);
    onChange([next]);
  }
  return (
    <div className="grid gap-4 text-sm">
      <fieldset className="grid gap-2 rounded border border-slate-200 p-3">
        <legend className="px-1 font-medium">Protection</legend>
        <Check
          label="Hide all"
          value={active?.GetHideCell()}
          change={
            /** Stages the Hide All flag. @param value - New control value. @returns Nothing. */ (
              value,
            ) => change("SetHideCell", value)
          }
        />
        <Check
          label="Protected"
          value={active?.GetProtection()}
          disabled={active?.GetHideCell() === true}
          change={
            /** Stages the Protected flag. @param value - New control value. @returns Nothing. */ (
              value,
            ) => change("SetProtection", value)
          }
        />
        <Check
          label="Hide formula"
          value={active?.GetHideFormula()}
          disabled={active?.GetHideCell() === true}
          change={
            /** Stages the Hide Formula flag. @param value - New control value. @returns Nothing. */ (
              value,
            ) => change("SetHideFormula", value)
          }
        />
        <p className="text-slate-600">
          Cell protection is only effective after the current sheet has been protected.
        </p>
      </fieldset>
      <fieldset className="grid gap-2 rounded border border-slate-200 p-3">
        <legend className="px-1 font-medium">Print</legend>
        <Check
          label="Hide when printing"
          value={active?.GetHidePrint()}
          change={
            /** Stages the Hide when printing flag. @param value - New control value. @returns Nothing. */ (
              value,
            ) => change("SetHidePrint", value)
          }
        />
      </fieldset>
    </div>
  );
}

/** Renders the original Asian typography page's native Line Change group.
 * @param props - Dialog bindings.
 * @param props.model - Original control draft.
 * @param props.onChange - Stages a changed checkbox.
 * @returns Asian Typography tab.
 */
export function AsianTypographyTabPage({
  model,
  onChange,
}: {
  readonly model: SvxAsianTabPage;
  readonly onChange: (slot: AsianTypographySlot, checked: boolean) => void;
}): React.JSX.Element {
  return (
    <fieldset className="grid gap-3 rounded border border-slate-200 p-3 text-sm">
      <legend className="px-1 font-medium">Line Change</legend>
      {asianTypographyControls.map(
        /** Maps the original slot to its native item state. @param control - Slot and label. @returns Checkbox. */
        ([slot, label]) => (
          <Check
            key={slot}
            label={label}
            {...model.GetState(slot)}
            change={
              /** Stages the native checkbox value. @param checked - Control state. @returns Nothing. */
              (checked) => onChange(slot, checked)
            }
          />
        ),
      )}
    </fieldset>
  );
}

/** Browser checkbox with the native mixed value. @param props - Check control bindings. @param props.label - Label. @param props.value - Value or mixed. @param props.disabled - Sensitivity. @param props.change - Updates the native flag. @returns Labeled control. */
function Check({
  label,
  value,
  disabled,
  change,
}: {
  readonly label: string;
  readonly value: boolean | undefined;
  readonly disabled?: boolean;
  readonly change: (value: boolean) => void;
}): React.JSX.Element {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={value ?? false}
        aria-checked={value ?? "mixed"}
        disabled={disabled}
        ref={
          /** Sets the browser checkbox's mixed state. @param input - Rendered checkbox. @returns Nothing. */ (
            input,
          ) => {
            if (input) input.indeterminate = value === undefined;
          }
        }
        onChange={
          /** Forwards the native checked value. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => change(event.currentTarget.checked)
        }
      />
      {label}
    </label>
  );
}
