/** @fileoverview Calc's center-mode presentation of the original shared Page tab. */
import { useId } from "react";
import type { SvxPageDescPage } from "../../../../cui/source/tabpages/page";
import { SvxPageUsage } from "../../../../svx/inc/pageitem";
import { Paper } from "../../../../i18nutil/inc/paper";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import type { FieldUnit } from "../../../../tools/inc/fldunit";
import type { ScPageStyleGeometry } from "../../../source/ui/styleui/styledlg";
import { PageStyleMetric } from "./PageStyleMetric";

/** Shared page geometry and the Calc layout fields. */
interface ScPageFormatTabProps {
  readonly page: SvxPageDescPage;
  readonly layout: ScPageStyleGeometry;
  readonly unit: FieldUnit;
  readonly onChange: (value: ScPageStyleGeometry) => void;
}

const orientations = [
  [false, "Portrait"],
  [true, "Landscape"],
] as const;
const pageUsage = [
  [SvxPageUsage.All, "Right and left"],
  [SvxPageUsage.Mirror, "Mirrored"],
  [SvxPageUsage.Right, "Only right"],
  [SvxPageUsage.Left, "Only left"],
] as const;
const pageNumbering = [
  [SvxNumType.SVX_NUM_ARABIC, "1, 2, 3, …"],
  [SvxNumType.SVX_NUM_CHARS_UPPER_LETTER, "A, B, C, …"],
  [SvxNumType.SVX_NUM_CHARS_LOWER_LETTER, "a, b, c, …"],
  [SvxNumType.SVX_NUM_ROMAN_UPPER, "I, II, III, …"],
  [SvxNumType.SVX_NUM_ROMAN_LOWER, "i, ii, iii, …"],
  [SvxNumType.SVX_NUM_NUMBER_NONE, "None"],
] as const;
const lengths = [
  ["width", "Width"],
  ["height", "Height"],
] as const;
const margins = [
  ["leftMargin", "Left"],
  ["rightMargin", "Right"],
  ["topMargin", "Top"],
  ["bottomMargin", "Bottom"],
] as const;
const selectClass = "min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1.5";

/** Uses shared native paper and margin handlers; applies Calc's original table alignment fields. @param props - Page contents. @returns Page tab. */
export function ScPageFormatTab({
  page,
  layout,
  unit,
  onChange,
}: ScPageFormatTabProps): React.JSX.Element {
  const orientationName = useId();
  const geometry = page.GetGeometry();
  const limits = page.GetFieldRanges();
  const previewScale = 132 / Math.max(geometry.width, geometry.height);
  return (
    <div className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_160px]">
      <div className="grid gap-3">
        <fieldset className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 p-3">
          <legend className="px-1 font-semibold">Paper Format</legend>
          <label className="col-span-2 grid gap-1">
            Format
            <select
              className={selectClass}
              value={page.GetPaperSizeBox().get_active_id()}
              onChange={(event) => {
                page.PaperSizeSelect_Impl(Number(event.target.value) as Paper);
                onChange({ ...layout, ...page.GetGeometry() });
              }}
            >
              {page
                .GetPaperSizeBox()
                .GetEntries()
                .map(({ paper, label }) => (
                  <option key={paper} value={paper}>
                    {label}
                  </option>
                ))}
            </select>
          </label>
          {lengths.map(([key, label]) => (
            <PageStyleMetric
              key={key}
              label={label}
              unit={unit}
              value={geometry[key]}
              {...limits[key]}
              onChange={(value) => {
                page.PaperSizeModify_Impl(key, value);
                onChange({ ...layout, ...page.GetGeometry() });
              }}
            />
          ))}
          <fieldset className="col-span-2 flex flex-wrap gap-3">
            <legend className="mb-1">Orientation</legend>
            {orientations.map(([landscape, label]) => (
              <label key={label} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name={orientationName}
                  checked={geometry.landscape === landscape}
                  onChange={() => {
                    page.SwapOrientation_Impl(landscape);
                    onChange({ ...layout, ...page.GetGeometry() });
                  }}
                />
                {label}
              </label>
            ))}
          </fieldset>
          <label className="col-span-2 grid gap-1">
            Text direction
            <select
              className={selectClass}
              value={layout.direction}
              onChange={(event) =>
                onChange({ ...layout, direction: Number(event.target.value) as SvxFrameDirection })
              }
            >
              <option value={SvxFrameDirection.Environment}>
                Use superordinate object settings
              </option>
              <option value={SvxFrameDirection.Horizontal_LR_TB}>Left-to-right (horizontal)</option>
              <option value={SvxFrameDirection.Horizontal_RL_TB}>Right-to-left (horizontal)</option>
            </select>
          </label>
        </fieldset>
        <fieldset className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 p-3">
          <legend className="px-1 font-semibold">Margins</legend>
          {margins.map(([key, label]) => (
            <PageStyleMetric
              key={key}
              label={
                layout.usage === SvxPageUsage.Mirror && key === "leftMargin"
                  ? "Inner"
                  : layout.usage === SvxPageUsage.Mirror && key === "rightMargin"
                    ? "Outer"
                    : label
              }
              unit={unit}
              value={geometry[key]}
              {...limits[key]}
              onChange={(value) => {
                page.SetMargin(key, value);
                onChange({ ...layout, ...page.GetGeometry() });
              }}
            />
          ))}
        </fieldset>
        <fieldset className="grid grid-cols-2 gap-3 rounded-md border border-slate-200 p-3">
          <legend className="px-1 font-semibold">Layout Settings</legend>
          <label className="grid gap-1">
            Page layout
            <select
              className={selectClass}
              value={layout.usage}
              onChange={(event) =>
                onChange({ ...layout, usage: Number(event.target.value) as SvxPageUsage })
              }
            >
              {pageUsage.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            Page numbers
            <select
              className={selectClass}
              value={layout.numbering}
              onChange={(event) =>
                onChange({ ...layout, numbering: Number(event.target.value) as SvxNumType })
              }
            >
              {!pageNumbering.some(([value]) => value === layout.numbering) ? (
                <option value={layout.numbering}>Current format</option>
              ) : null}
              {pageNumbering.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <fieldset className="col-span-2 flex flex-wrap gap-3">
            <legend className="mb-1">Table alignment</legend>
            {(
              [
                ["centerHorizontal", "Horizontal"],
                ["centerVertical", "Vertical"],
              ] as const
            ).map(([key, title]) => (
              <label key={key} className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={layout[key]}
                  onChange={(event) => onChange({ ...layout, [key]: event.target.checked })}
                />
                {title}
              </label>
            ))}
          </fieldset>
        </fieldset>
      </div>
      <div
        aria-label="Page preview"
        className="hidden min-h-40 place-items-center rounded-md bg-slate-100 md:grid"
      >
        <div
          aria-hidden
          className="relative border border-slate-400 bg-white shadow-sm"
          style={{ width: geometry.width * previewScale, height: geometry.height * previewScale }}
        >
          <div
            className="absolute border border-dashed border-slate-300"
            style={{
              top: geometry.topMargin * previewScale,
              right: geometry.rightMargin * previewScale,
              bottom: geometry.bottomMargin * previewScale,
              left: geometry.leftMargin * previewScale,
            }}
          />
        </div>
      </div>
    </div>
  );
}
