/** @fileoverview Browser presentation of original paralinespacingcontrol.ui and its actual source controller. */
import { useEffect, useId, useRef, useState } from "react";
import spacePara1 from "../../../../icon-themes/colibre_svg/cmd/lc_spacepara1.svg";
import spacePara15 from "../../../../icon-themes/colibre_svg/cmd/lc_spacepara15.svg";
import spacePara2 from "../../../../icon-themes/colibre_svg/cmd/lc_spacepara2.svg";
/** Original image_spacing_1/115 share the same source icon. */
const presetImages = [spacePara1, spacePara1, spacePara15, spacePara2] as const;
import {
  ParaLineSpacingControl as NativeControl,
  LINE_SPACING_MODES,
} from "../../../source/sidebar/paragraph/ParaLineSpacingControl";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { formatPercent } from "../../../../i18nutil/source/utility/unicode.percent";
import type { FieldUnit } from "../../../../tools/inc/fldunit";
import type { SfxItemState } from "../../../../svl/inc/itemset";
import { FieldUnit as F } from "../../../../tools/inc/fldunit";
import { SV_FUNIT_STRINGS } from "../../../../vcl/inc/units";
import {
  getSystemLocale,
  getSystemDecimalSeparator,
  getSystemDecimalSeparatorAlternate,
} from "../../../../unotools/source/misc/syslocale";
/** Real frame fields and command/popup ports. */
export interface ParaLineSpacingControlProps {
  readonly unit: FieldUnit;
  readonly state: SfxItemState;
  readonly item: SvxLineSpacingItem | undefined;
  readonly dispatch: (item: SvxLineSpacingItem) => void;
  readonly close: () => void;
}
/** Presents four preset buttons and original eight-mode custom value group. @param props - Actual popup frame binding. @returns Popup content. */
export function ParaLineSpacingControl(props: ParaLineSpacingControlProps): React.JSX.Element {
  const [owner] = useState(
    /** Original popup is initialized once from the current frame status. @returns Native control. */ () =>
      new NativeControl(props.unit, props.state, props.item, true, props.dispatch, props.close),
  );
  const valueId = useId();
  const [, render] = useState(0),
    [text, setText] = useState<string | undefined>(),
    root = useRef<HTMLDivElement>(null);
  useEffect(
    /** Follows native GrabFocus when this actual popup opens. @returns Nothing. */ () => {
      const target = owner.GrabFocus();
      root.current
        ?.querySelector<HTMLElement>(target === "mode" ? "select" : `[data-preset="${target}"]`)
        ?.focus();
    },
    [owner],
  );
  const locale = getSystemLocale(),
    languageField = String.fromCharCode(
      ...locale.Language.getStr().subarray(0, locale.Language.getLength()),
    ),
    country = String.fromCharCode(
      ...locale.Country.getStr().subarray(0, locale.Country.getLength()),
    ),
    tag =
      languageField === "qlt"
        ? String.fromCharCode(...locale.Variant.getStr().subarray(0, locale.Variant.getLength()))
        : languageField + (country ? "-" + country : ""),
    language = tag.split("-")[0] as string;
  const field = owner.activeField === "percent" ? owner.percent : owner.metric,
    empty = owner.activeField === "percent" ? owner.percentEmpty : owner.metricEmpty,
    unit = field.get_unit(),
    decimal = getSystemDecimalSeparator(),
    suffix =
      SV_FUNIT_STRINGS.find(
        /** Borrows original first unit alias. @param row - Native alias. @returns Whether this field. */ (
          row,
        ) => row[1] === unit,
      )?.[0] ?? "",
    formatted = empty
      ? ""
      : unit === F.PERCENT
        ? formatPercent(Number(field.get_value(F.NONE)) / 10 ** field.get_digits(), language, tag)
        : (Number(field.get_value(F.NONE)) / 10 ** field.get_digits())
            .toFixed(field.get_digits())
            .replace(".", decimal) + (suffix === "" ? "" : (unit === F.INCH ? "" : " ") + suffix);
  /** Publishes actual field/selection updates after original handler execution. @returns Nothing. */
  function refresh(): void {
    render(
      /** Updates presentation revision only. @param value - Old revision. @returns Next revision. */ (
        value,
      ) => value + 1,
    );
  }
  /** Applies the original normalized spin increments through the actual field range. @param direction - Spin direction. @param page - Use original page increment. @returns Nothing. */
  function stepField(direction: bigint, page: boolean): void {
    const increments = field.get_increments(F.NONE);
    field.set_value(
      field.get_value(F.NONE) + direction * (page ? increments[1] : increments[0]),
      F.NONE,
    );
    owner.LineSPDistAtHdl_Impl();
    setText(undefined);
    refresh();
  }
  return (
    <div
      ref={root}
      role="dialog"
      aria-label="Line Spacing"
      className="w-60 max-w-[calc(100vw-2rem)] border border-slate-300 bg-white p-2 shadow-lg"
    >
      <div className="grid gap-1">
        {["Spacing: 1", "Spacing: 1.15", "Spacing: 1.5", "Spacing: 2"].map(
          /** Original preset buttons dispatch and close. @param label - Source label. @param index - Native row. @returns Button. */ (
            label,
            index,
          ) => (
            <button
              type="button"
              data-preset={index}
              key={label}
              className="flex items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-indigo-50"
              onClick={
                /** Executes the original predefined handler. @returns Nothing. */ () =>
                  owner.ExecuteLineSpacing(index)
              }
            >
              <img src={presetImages[index]} alt="" className="size-6" />
              {label}
            </button>
          ),
        )}
      </div>
      <fieldset className="mt-2 grid gap-2 border-t pt-2 text-xs">
        <legend className="font-semibold">Custom Value</legend>
        <label className="grid gap-1">
          Line Spacing:
          <select
            aria-label="Line spacing mode"
            value={owner.active}
            disabled={!owner.modeEnabled}
            className="w-full rounded border p-1"
            onChange={
              /** Mode changes execute immediately, retaining popup. @param event - Native selector event. @returns Nothing. */ (
                event,
              ) => {
                owner.LineSPDistHdl_Impl(Number(event.target.value));
                setText(undefined);
                refresh();
              }
            }
          >
            {owner.active === -1 && <option value={-1} hidden />}
            {LINE_SPACING_MODES.map(
              /** Retains resource order. @param label - Native name. @param index - Source position. @returns Mode. */ (
                label,
                index,
              ) => (
                <option key={label} value={index}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>
        <div className="grid gap-1">
          <label htmlFor={valueId}>Value:</label>
          <span className="inline-flex min-w-0 items-stretch">
            <input
              id={valueId}
              aria-label="Line spacing value"
              role="spinbutton"
              aria-valuenow={
                empty ? undefined : Number(field.get_value(F.NONE)) / 10 ** field.get_digits()
              }
              aria-valuemin={Number(field.get_range(F.NONE)[0]) / 10 ** field.get_digits()}
              aria-valuemax={Number(field.get_range(F.NONE)[1]) / 10 ** field.get_digits()}
              inputMode="decimal"
              disabled={!owner.valueEnabled}
              value={text ?? formatted}
              className="w-full rounded border p-1"
              onChange={
                /** Actual VCL parser and range own accepted values. @param event - Editable text. @returns Nothing. */ (
                  event,
                ) => {
                  setText(event.target.value);
                  if (
                    !field.set_text(
                      event.target.value,
                      decimal,
                      getSystemDecimalSeparatorAlternate(),
                    )
                  )
                    return;
                  owner.LineSPDistAtHdl_Impl();
                  refresh();
                }
              }
              onBlur={
                /** Restores actual native field formatting. @returns Nothing. */ () =>
                  setText(undefined)
              }
              onKeyDown={
                /** Uses original normalized increments and limits. @param event - Real keyboard event. @returns Nothing. */ (
                  event,
                ) => {
                  if (!["ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(event.key)) return;
                  event.preventDefault();
                  stepField(event.key.endsWith("Down") ? -1n : 1n, event.key.startsWith("Page"));
                }
              }
            />
            <span className="grid shrink-0 grid-rows-2">
              {([1n, -1n] as const).map(
                /** Presents the original numeric field spin arrows. @param direction - Native spin direction. @returns Pointer control. */
                (direction) => (
                  <button
                    type="button"
                    key={String(direction)}
                    tabIndex={-1}
                    disabled={!owner.valueEnabled}
                    aria-label={
                      direction === 1n
                        ? "Increase line spacing value"
                        : "Decrease line spacing value"
                    }
                    className="border border-slate-300 px-1 text-[8px] leading-none disabled:opacity-50"
                    onMouseDown={
                      /** Keeps the native entry's keyboard focus on pointer spin. @param event - Actual pointer. @returns Nothing. */ (
                        event,
                      ) => event.preventDefault()
                    }
                    onClick={
                      /** Uses the same native numeric step as arrow keys. @returns Nothing. */ () =>
                        stepField(direction, false)
                    }
                  >
                    {direction === 1n ? "▴" : "▾"}
                  </button>
                ),
              )}
            </span>
          </span>
        </div>
      </fieldset>
    </div>
  );
}
