/** @fileoverview Native SvxCharEffectsPage emphasis selectors for Writer search formats. */
import { useState } from "react";
import { FontEmphasisMark } from "../../../tools/inc/fontenum";
import { emphasisMarks } from "./writer-search-format-values";

/** Edits the emphasis style and position stored together in one item. @param props - Current value and bindings. @returns Native emphasis selectors. */
export function WriterSearchEmphasisControls({
  value,
  label,
  onChange,
}: Readonly<{
  value: string;
  label: (key: string, fallback: string) => string;
  onChange: (mark: FontEmphasisMark) => void;
}>): React.JSX.Element {
  const mark = Number(value);
  const style = mark & FontEmphasisMark.Style;
  const [position, setPosition] = useState(
    (mark & ~FontEmphasisMark.Style) === FontEmphasisMark.PosBelow
      ? FontEmphasisMark.PosBelow
      : FontEmphasisMark.PosAbove,
  );
  return (
    <>
      <label className="grid gap-1 text-sm">
        {label("emphasis-mark", "Emphasis mark")}
        <select
          className="rounded border border-slate-400 p-1"
          value={value === "" || style > FontEmphasisMark.Accent ? "" : style}
          onChange={
            /** Combines the selected style and current position. @param event - Style change. @returns Nothing. */
            (event) => {
              const selected = Number(event.currentTarget.value);
              onChange(selected === FontEmphasisMark.NONE ? selected : selected | position);
            }
          }
        >
          <option value="" disabled />
          {emphasisMarks.map(
            /** Projects one native style choice. @param choice - Style and caption. @returns List option. */
            ([style, caption]) => (
              <option key={style} value={style}>
                {label(`emphasis-style.${style}`, caption)}
              </option>
            ),
          )}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        {label("emphasis-position", "Position")}
        <select
          className="rounded border border-slate-400 p-1"
          disabled={style === FontEmphasisMark.NONE || style > FontEmphasisMark.Accent}
          value={position}
          onChange={
            /** Updates placement while keeping the style. @param event - Position change. @returns Nothing. */
            (event) => {
              const selected = Number(event.currentTarget.value);
              setPosition(selected);
              onChange(style | selected);
            }
          }
        >
          <option value={FontEmphasisMark.PosAbove}>{label("emphasis-above", "Above text")}</option>
          <option value={FontEmphasisMark.PosBelow}>{label("emphasis-below", "Below text")}</option>
        </select>
      </label>
    </>
  );
}
