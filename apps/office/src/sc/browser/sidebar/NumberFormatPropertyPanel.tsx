/** @fileoverview Original NumberFormatPropertyPanel over Calc Sfx state and browser controls. */
import { useRef, useState } from "react";
import { SidebarPanel } from "../../../sfx2/browser/presentation/SidebarPanel";
import {
  type BrowserCommandSource,
  useBrowserCommandState,
} from "../../../framework/browser/presentation/command-surface";
import { CommandButton } from "../../../framework/browser/presentation/CommandToolbar";
import { officeCommandIcons } from "../../../framework/browser/presentation/office-command-icons";
import { officeToolbarButtonClassName } from "../../../framework/browser/presentation/office-control-styles";
import { SfxUInt16Item } from "../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import {
  NUMBER_FORMAT,
  NUMBER_FORMAT_TYPE,
  SID_NUMBER_FORMAT,
  SID_NUMBER_TYPE_FORMAT,
} from "../../sdi/formatsh.numformat";
import { FORMAT_CELL_DIALOG } from "../../source/ui/attrdlg/attrdlg";
import { getCalcCommandResource } from "../../uiconfig/scalc/menubar/menubar";
import type { ScDocShell } from "../../source/ui/docshell/docsh";
import { CalcCurrencyControl } from "../presentation/CalcFormattingToolbar";

const categories = [
  "General",
  "Number",
  "Percent",
  "Currency",
  "Date",
  "Time",
  "Scientific",
  "Fraction",
  "Boolean Value",
  "Text",
] as const;

/** Supplies the native Calc frame and active document. */
interface SidebarProps {
  readonly commandSource: BrowserCommandSource;
  readonly objectShell: ScDocShell;
  readonly focusDocument: () => void;
}

/** Case-specific state mirrors the original four mutable controls in the sidebar request. */
interface Options {
  readonly grouped: boolean;
  readonly red: boolean;
  readonly precision: number;
  readonly leading: number;
}

/** Projects the two source slots into category, shortcut toolbar, numeric fields and check buttons.
 * @param props - Native Calc view ports.
 * @param props.commandSource - Current Sfx frame.
 * @param props.objectShell - Calc document shell.
 * @param props.focusDocument - Native document focus.
 * @returns Number Format section.
 */
export function NumberFormatPropertyPanel({
  commandSource,
  objectShell,
  focusDocument,
}: SidebarProps): React.JSX.Element {
  const category = useBrowserCommandState(commandSource, NUMBER_FORMAT_TYPE);
  const options = useBrowserCommandState(commandSource, NUMBER_FORMAT);
  const [emptyCategory, setEmptyCategory] = useState<typeof category>();
  const index = typeof category.value === "number" ? category.value : -1;
  const selected = index < 0 && emptyCategory === category ? 0 : index;
  if (index >= 0 && emptyCategory !== undefined) setEmptyCategory(undefined);
  const [group, negative, precision = 0, leading = 1, natNum] =
    typeof options.value === "string" ? options.value.split(",").map(Number) : [];
  const editable = index >= 0 && index <= 7 && index !== 4;
  const scientific = index === 6;
  const fraction = index === 7;
  const time = index === 5;
  const grouping = editable && !time && (scientific || !natNum || index === 0);
  const categoryBox = useRef<HTMLSelectElement>(null);

  /** Dispatches the source options item only with values owned by enabled and visible controls.
   * @param patch - Changed field.
   * @returns Nothing.
   */
  function update(patch: Partial<Options>): void {
    const next = {
      grouped: !!group,
      red: !!negative,
      precision: index === 0 ? 0 : precision,
      leading,
      ...patch,
    };
    const value = [
      Number(grouping && next.grouped),
      Number(editable && next.red),
      editable ? next.precision : 0,
      editable && !time ? next.leading : 0,
      "",
    ].join(",");
    commandSource.Execute(NUMBER_FORMAT, [new SfxStringItem(SID_NUMBER_FORMAT, value)]);
  }

  /** Moves focus into the first source control from the panel title. @returns Nothing. */
  function focusCategory(): void {
    categoryBox.current?.focus();
  }

  return (
    <SidebarPanel
      title="Number Format"
      {...{ focusDocument }}
      focusContent={focusCategory}
      moreOptions={
        <CommandButton
          commandId={FORMAT_CELL_DIALOG}
          commandSource={commandSource}
          getCommandResource={getCalcCommandResource}
          resolveArguments={noArguments}
          {...shortcutIcon(FORMAT_CELL_DIALOG)}
        />
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(3.5rem,1fr)] items-center gap-x-2 gap-y-2 text-xs text-slate-800">
        <label className="contents">
          <span>Category</span>
          <select
            className="min-w-0 rounded border border-slate-300 bg-white p-1"
            ref={categoryBox}
            value={selected}
            disabled={!category.enabled}
            onChange={
              /** Sends the native category index to the format shell. @param event - Selected category. @returns Nothing. */
              (event) => {
                const next = Number(event.currentTarget.value);
                if (index < 0 && next === 0) setEmptyCategory(category);
                else if (next >= 0 && next !== index)
                  commandSource.Execute(NUMBER_FORMAT_TYPE, [
                    new SfxUInt16Item(SID_NUMBER_TYPE_FORMAT, next),
                  ]);
              }
            }
          >
            {index < 0 ? <option value={-1} /> : null}
            {categories.map(
              /** Preserves the upstream category list order. @param value - Label. @param position - Source index. @returns Category. */
              (value, position) => (
                <option key={value} value={position}>
                  {value}
                </option>
              ),
            )}
          </select>
        </label>
        <div className="col-span-2 flex gap-1" role="toolbar" aria-label="Number Format">
          {[".uno:NumberFormatDecimal", ".uno:NumberFormatPercent"].map(
            /** Binds original numeric shortcut toolbar controls. @param id - Native command. @returns Bound button. */
            (id) => (
              <CommandButton
                key={id}
                commandId={id}
                commandSource={commandSource}
                getCommandResource={getCalcCommandResource}
                resolveArguments={noArguments}
                className={officeToolbarButtonClassName}
                {...shortcutIcon(id)}
              />
            ),
          )}
          <CalcCurrencyControl {...{ commandSource, objectShell }} />
        </div>
        <NumberFormatField
          label={fraction ? "Denominator places" : "Decimal places"}
          maximum={fraction ? 8 : 20}
          value={index === 0 ? "" : precision}
          disabled={!editable}
          onValue={
            /** Updates `precision`. @param value - Control callback value. @returns Nothing. */ (
              value,
            ) => update({ precision: value })
          }
        />
        <NumberFormatField
          label="Leading zeroes"
          maximum={20}
          value={leading}
          disabled={!editable || time}
          onValue={
            /** Updates `leading`. @param value - Control callback value. @returns Nothing. */ (
              value,
            ) => update({ leading: value })
          }
        />
        <label className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!negative}
            disabled={!editable}
            onChange={
              /** Updates `red`. @param event - Control change event. @returns Nothing. */ (
                event,
              ) => update({ red: event.currentTarget.checked })
            }
          />
          Negative numbers in red
        </label>
        <label className="col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!group}
            disabled={!grouping}
            onChange={
              /** Updates `grouped`. @param event - Control change event. @returns Nothing. */ (
                event,
              ) => update({ grouped: event.currentTarget.checked })
            }
          />
          {scientific ? "Engineering notation" : "Thousands separator"}
        </label>
      </div>
    </SidebarPanel>
  );
}

/** Provides a registered icon when present. @param id - Shortcut URL. @returns Optional toolbar icon. */
function shortcutIcon(id: string) {
  const icon = officeCommandIcons.get(id);
  return icon ? { icon } : {};
}

/** Supplies the default request for a numeric shortcut. @returns Undefined. */
function noArguments(): undefined {
  return undefined;
}

/** Projects a native spin control with the panel resource's original bounds.
 * @param props - Source control state and mutation.
 * @param props.label - Associated field label.
 * @param props.maximum - Inclusive maximum.
 * @param props.value - Current value or the source General blank.
 * @param props.disabled - Current control admission.
 * @param props.onValue - Native value change event.
 * @returns Labeled numeric field.
 */
function NumberFormatField({
  label,
  maximum,
  value,
  disabled,
  onValue,
}: {
  readonly label: string;
  readonly maximum: number;
  readonly value: number | "";
  readonly disabled: boolean;
  readonly onValue: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className="contents">
      <span className={disabled ? "text-slate-500" : undefined}>{label}</span>
      <input
        className="min-w-0 rounded border border-slate-300 bg-white p-1 disabled:bg-slate-100"
        type="number"
        min={0}
        max={maximum}
        step={1}
        value={value}
        disabled={disabled}
        onChange={
          /** Sends only a native integer value in the widget's admitted range. @param event - Current numeric entry. @returns Nothing. */
          (event) => {
            const next = event.currentTarget.valueAsNumber;
            if (Number.isInteger(next) && next >= 0 && next <= maximum) onValue(next);
          }
        }
      />
    </label>
  );
}
