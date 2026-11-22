/** @fileoverview Browser controls for the original numbering position page. */
import { SvxAdjust } from "../../../editeng/inc/svxenum";
import type { SvxNumberFormat, ConstSvxNumberFormat } from "../../../editeng/inc/numitem";
import type { ComponentType } from "react";
import type { FieldUnit } from "../../../tools/inc/fldunit";

const control = "w-full rounded border border-slate-400 p-1";

/** Presents the native alignment or legacy geometry controls. @param props - Selected levels and native format exchange. @returns Numbering position controls. */
export function NumberingPositionPage({
  format,
  unit,
  edit,
  reset,
  label,
  MetricField,
}: Readonly<{
  format: ConstSvxNumberFormat;
  unit: FieldUnit;
  edit: (change: (format: SvxNumberFormat) => void) => void;
  reset: () => void;
  MetricField: ComponentType<{
    "aria-label": string;
    className: string;
    value: number;
    unit: FieldUnit;
    minimum: number;
    maximum: number;
    disabled: boolean;
    onValueChange: (twips: number) => void;
  }>;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const aligned = format.GetPositionAndSpaceMode() === "label-alignment";
  /** Binds a native dimension to its metric field. @param caption - Visible label. @param value - Physical twips. @param write - Per-level writer. @param disabled - Gated field state. @returns Metric control. */
  function metric(
    caption: string,
    value: number,
    write: (format: SvxNumberFormat, value: number) => void,
    disabled = false,
  ) {
    return (
      <label className="grid gap-1">
        {caption}
        <MetricField
          aria-label={caption}
          className={control}
          value={value}
          unit={unit}
          minimum={-32768}
          maximum={32767}
          disabled={disabled}
          onValueChange={
            /** Updates each selected level in twips. @param twips - Native distance. @returns Nothing. */
            (twips) =>
              edit(
                /** Updates one selected level. @param level - Independent level. @returns Nothing. */ (
                  level,
                ) => write(level, twips),
              )
          }
        />
      </label>
    );
  }

  return (
    <fieldset className="grid gap-3 rounded border border-slate-200 p-3 sm:grid-cols-2">
      <legend>{label("position.geometry", "Position and Spacing")}</legend>
      {aligned && (
        <>
          <label className="grid gap-1">
            {label("position.followed-by", "Followed by")}
            <select
              className={control}
              value={format.GetLabelFollowedBy()}
              onChange={
                /** Selects the native label separator. @param event - Selected separator. @returns Nothing. */
                (event) => {
                  const value = event.currentTarget.value as ReturnType<
                    ConstSvxNumberFormat["GetLabelFollowedBy"]
                  >;
                  edit(
                    /** Changes the separator at this level. @param level - Editable format. @returns Nothing. */ (
                      level,
                    ) => level.SetLabelFollowedBy(value),
                  );
                }
              }
            >
              <option value="listtab">{label("position.tab", "Tab stop")}</option>
              <option value="space">{label("position.space", "Space")}</option>
              <option value="nothing">{label("position.nothing", "Nothing")}</option>
            </select>
          </label>
          {metric(
            label("position.tab-stop", "Tab stop at"),
            format.GetListtabPos(),
            /** Stores the tab stop. @param level - Editable format. @param value - Twips. @returns Nothing. */
            (level, value) => level.SetListtabPos(value),
            format.GetLabelFollowedBy() !== "listtab",
          )}
        </>
      )}
      <label className="grid gap-1">
        {label("position.alignment", "Alignment")}
        <select
          className={control}
          value={format.GetNumAdjust()}
          onChange={
            /** Selects the native label alignment. @param event - Selected alignment. @returns Nothing. */
            (event) => {
              const value = Number(event.currentTarget.value) as SvxAdjust;
              edit(
                /** Changes label alignment at this level. @param level - Editable format. @returns Nothing. */ (
                  level,
                ) => level.SetNumAdjust(value),
              );
            }
          }
        >
          <option value={SvxAdjust.Left}>{label("position.left", "Left")}</option>
          <option value={SvxAdjust.Center}>{label("position.center", "Centered")}</option>
          <option value={SvxAdjust.Right}>{label("position.right", "Right")}</option>
        </select>
      </label>
      {aligned ? (
        <>
          {metric(
            label("position.aligned-at", "Aligned at"),
            format.GetIndentAt() + format.GetFirstLineIndent(),
            /** Keeps the text position when changing the label's absolute position. @param level - Editable format. @param value - Twips. @returns Nothing. */
            (level, value) => level.SetFirstLineIndent(value - level.GetIndentAt()),
          )}
          {metric(
            label("position.indent-at", "Indent at"),
            format.GetIndentAt(),
            /** Keeps the label's absolute position when changing the indent. @param level - Editable format. @param value - Twips. @returns Nothing. */
            (level, value) => {
              level.SetFirstLineIndent(level.GetFirstLineIndent() + level.GetIndentAt() - value);
              level.SetIndentAt(value);
            },
          )}
        </>
      ) : (
        <>
          {metric(
            label("position.indent", "Indent"),
            format.GetAbsLSpace() + format.GetFirstLineOffset(),
            /** Stores the absolute indented position. @param level - Editable format. @param value - Twips. @returns Nothing. */
            (level, value) => level.SetAbsLSpace(value - level.GetFirstLineOffset()),
          )}
          {metric(
            label("position.width", "Width of numbering"),
            -format.GetFirstLineOffset(),
            /** Stores the native negative first-line offset. @param level - Editable format. @param value - Twips. @returns Nothing. */
            (level, value) => {
              level.SetAbsLSpace(level.GetAbsLSpace() + level.GetFirstLineOffset() + value);
              level.SetFirstLineOffset(-value);
            },
          )}
          {metric(
            label("position.distance", "Minimum space between numbering and text"),
            format.GetCharTextDistance(),
            /** Stores the native minimum label distance. @param level - Editable format. @param value - Twips. @returns Nothing. */
            (level, value) => level.SetCharTextDistance(value),
          )}
        </>
      )}
      <button
        type="button"
        onClick={reset}
        className="justify-self-start rounded border border-slate-300 px-3 py-1"
      >
        {label("position.default", "Default")}
      </button>
    </fieldset>
  );
}
