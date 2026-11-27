/** @fileoverview Alignment, Asian Typography and Cell Protection controls over native Calc items. */
import {
  asianTypographyControls,
  type AsianTypographySlot,
  type SvxAsianTabPage,
} from "../../../../cui/source/tabpages/paragrph";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxHorJustifyItem,
  SvxJustifyMethodItem,
  SvxVerJustifyItem,
} from "../../../../editeng/inc/justifyitem";
import {
  SvxCellHorJustify as H,
  SvxCellJustifyMethod as M,
  SvxCellVerJustify as V,
} from "../../../../editeng/inc/svxenum";
import { SvxFrameDirectionItem } from "../../../../editeng/source/items/frmitems.direction";
import { SvxFrameDirection as D } from "../../../../editeng/inc/frmdir";
import { SvxRotateMode as R, SvxRotateModeItem } from "../../../../svx/inc/rotmodit";
import {
  ScHyphenateCell,
  ScIndentItem,
  ScLineBreakCell,
  ScProtectionAttr,
  ScRotateValueItem,
  ScShrinkToFitCell,
  ScVerticalStackCell,
} from "../../../inc/attrib";
import {
  ATTR_HOR_JUSTIFY,
  ATTR_HOR_JUSTIFY_METHOD,
  ATTR_HYPHENATE,
  ATTR_INDENT,
  ATTR_LINEBREAK,
  ATTR_PROTECTION,
  ATTR_ROTATE_MODE,
  ATTR_ROTATE_VALUE,
  ATTR_SHRINKTOFIT,
  ATTR_STACKED,
  ATTR_VER_JUSTIFY,
  ATTR_VER_JUSTIFY_METHOD,
  ATTR_WRITINGDIR,
} from "../../../inc/scitems";
import type { ScAttrDlg } from "../../../source/ui/attrdlg/attrdlg";

const field = "rounded border border-slate-300 bg-white px-2 py-1 text-sm";
const group =
  "grid grid-cols-[minmax(8rem,1fr)_minmax(9rem,1fr)] items-center gap-3 rounded border border-slate-200 p-3 text-sm";

/** Keeps page edits in the actual staged item set. */
interface PageProps {
  readonly model: ScAttrDlg;
  readonly onChange: (items: readonly SfxPoolItem[]) => void;
}

/** Reads a dialog value with its original mixed state. @param model - Dialog state. @param which - Attribute. @returns Effective native item. */
function item<T extends SfxPoolItem>(model: ScAttrDlg, which: number): T | undefined {
  return model.GetItem<T>(which);
}

/** Projects the represented alignment items in original field groups.
 * @param props - Dialog item owners.
 * @param props.model - Input and staged sets.
 * @param props.onChange - Writes typed items.
 * @returns Alignment tab.
 */
export function AlignmentTabPage({ model, onChange }: PageProps): React.JSX.Element {
  const horizontal = item<SvxHorJustifyItem>(model, ATTR_HOR_JUSTIFY)?.GetValue();
  const vertical = item<SvxVerJustifyItem>(model, ATTR_VER_JUSTIFY)?.GetValue();
  const h =
    horizontal === H.Block &&
    item<SvxJustifyMethodItem>(model, ATTR_HOR_JUSTIFY_METHOD)?.GetValue() === M.Distribute
      ? 6
      : horizontal;
  const v =
    vertical === V.Block &&
    item<SvxJustifyMethodItem>(model, ATTR_VER_JUSTIFY_METHOD)?.GetValue() === M.Distribute
      ? 5
      : vertical;
  const wrap = item<ScLineBreakCell>(model, ATTR_LINEBREAK)?.GetValue();
  const stacked = item<ScVerticalStackCell>(model, ATTR_STACKED)?.GetValue();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <fieldset className={group}>
        <legend className="px-1 font-medium">Text alignment</legend>
        <Choice
          label="Horizontal"
          value={h}
          options={["Default", "Left", "Center", "Right", "Justified", "Filled", "Distributed"]}
          change={
            /** Stages horizontal alignment and its justification method. @param value - New control value. @returns Nothing. */ (
              value,
            ) =>
              onChange([
                new SvxHorJustifyItem(value === 6 ? H.Block : value, ATTR_HOR_JUSTIFY),
                new SvxJustifyMethodItem(
                  value === 6 ? M.Distribute : M.Auto,
                  ATTR_HOR_JUSTIFY_METHOD,
                ),
              ])
          }
        />
        <Measure
          label="Indent"
          value={(item<ScIndentItem>(model, ATTR_INDENT)?.GetValue() ?? 0) / 20}
          min={0}
          max={99}
          step={1}
          disabled={horizontal !== H.Left}
          change={
            /** Converts points to twips for the indent item. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new ScIndentItem(Math.round(value * 20))])
          }
        />
        <Choice
          label="Vertical"
          value={v}
          options={["Default", "Top", "Middle", "Bottom", "Justified", "Distributed"]}
          change={
            /** Stages vertical alignment and its justification method. @param value - New control value. @returns Nothing. */ (
              value,
            ) =>
              onChange([
                new SvxVerJustifyItem(value === 5 ? V.Block : value, ATTR_VER_JUSTIFY),
                new SvxJustifyMethodItem(
                  value === 5 ? M.Distribute : M.Auto,
                  ATTR_VER_JUSTIFY_METHOD,
                ),
              ])
          }
        />
      </fieldset>
      <fieldset className={group}>
        <legend className="px-1 font-medium">Text orientation</legend>
        <Measure
          label="Degrees"
          value={(item<ScRotateValueItem>(model, ATTR_ROTATE_VALUE)?.GetValue() ?? 0) / 100}
          min={0}
          max={359}
          step={5}
          wrap
          disabled={stacked === true}
          change={
            /** Converts degrees to the native hundredths of a degree. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new ScRotateValueItem(Math.round(value * 100))])
          }
        />
        <Choice
          label="Reference edge"
          value={item<SvxRotateModeItem>(model, ATTR_ROTATE_MODE)?.GetValue()}
          options={["Inside cell", "Upper edge", "Cell center", "Lower edge"]}
          disabled={stacked === true}
          change={
            /** Stages the native rotation reference edge. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new SvxRotateModeItem(value as R, ATTR_ROTATE_MODE)])
          }
        />
        <div className="col-span-2">
          <Check
            label="Vertically stacked"
            value={stacked}
            change={
              /** Stages the original stacked text flag. @param value - New control value. @returns Nothing. */ (
                value,
              ) => onChange([new ScVerticalStackCell(value)])
            }
          />
        </div>
      </fieldset>
      <fieldset className="grid gap-2 rounded border border-slate-200 p-3 text-sm sm:col-span-2">
        <legend className="px-1 font-medium">Properties</legend>
        <Check
          label="Wrap text automatically"
          value={wrap}
          change={
            /** Stages automatic line wrapping. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new ScLineBreakCell(value)])
          }
        />
        <Check
          label="Hyphenation active"
          value={item<ScHyphenateCell>(model, ATTR_HYPHENATE)?.GetValue()}
          disabled={!wrap && horizontal !== H.Block}
          change={
            /** Stages the hyphenation flag. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new ScHyphenateCell(value)])
          }
        />
        <Check
          label="Shrink to fit cell size"
          value={item<ScShrinkToFitCell>(model, ATTR_SHRINKTOFIT)?.GetValue()}
          disabled={wrap === true || horizontal === H.Repeat}
          change={
            /** Stages the shrink-to-fit flag. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new ScShrinkToFitCell(value)])
          }
        />
        <Choice
          label="Text direction"
          value={item<SvxFrameDirectionItem>(model, ATTR_WRITINGDIR)?.GetValue()}
          options={[
            "Left-to-right (LTR)",
            "Right-to-left (RTL)",
            "",
            "",
            "Use superordinate object settings",
          ]}
          change={
            /** Stages the selected frame direction. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new SvxFrameDirectionItem(value as D, ATTR_WRITINGDIR)])
          }
        />
      </fieldset>
    </div>
  );
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

/** One native enum option group. @param props - Selection control. @param props.label - Label. @param props.value - Value or mixed. @param props.options - Ordered source labels. @param props.disabled - Sensitivity. @param props.change - Updates the native enum value. @returns Labeled control. */
function Choice({
  label,
  value,
  options,
  disabled,
  change,
}: {
  readonly label: string;
  readonly value: number | undefined;
  readonly options: readonly string[];
  readonly disabled?: boolean;
  readonly change: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className="contents">
      {label}
      <select
        className={field}
        value={value ?? ""}
        disabled={disabled}
        onChange={
          /** Returns the selected enum value. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => change(Number(event.currentTarget.value))
        }
      >
        {value === undefined && <option value="" />}
        {options.map(
          /** Lists each original enum choice. @param name - Display name. @param index - Source position. @returns Option. */ (
            name,
            index,
          ) =>
            name && (
              <option key={index} value={index}>
                {name}
              </option>
            ),
        )}
      </select>
    </label>
  );
}

/** One bounded native metric input binding. @param props - Spin control. @param props.label - Label. @param props.value - Current value. @param props.min - Minimum. @param props.max - Maximum. @param props.step - Step. @param props.wrap - Cycles the source angle. @param props.disabled - Sensitivity. @param props.change - Updates native units. @returns Labeled control. */
function Measure({
  label,
  value,
  min,
  max,
  step,
  wrap,
  disabled,
  change,
}: {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly wrap?: boolean;
  readonly disabled: boolean;
  readonly change: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className="contents">
      {label}
      <input
        type="number"
        className={field}
        min={min}
        max={max}
        step={wrap ? "any" : step}
        value={value}
        disabled={disabled}
        onKeyDown={
          /** Cycles the metric angle by the source increment. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => {
            if (!wrap || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) return;
            event.preventDefault();
            const next = value + (event.key === "ArrowUp" ? step : -step);
            const period = max - min + 1;
            change(min + ((next - min + period) % period));
          }
        }
        onChange={
          /** Accepts numeric input in the source interval. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => {
            const next = event.currentTarget.valueAsNumber;
            if (next >= min && next <= max) change(next);
          }
        }
      />
    </label>
  );
}
