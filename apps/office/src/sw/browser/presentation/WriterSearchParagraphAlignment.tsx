/** @fileoverview Browser controls for the represented SvxParaAlignTabPage adjustment item. */
import { useId, useState } from "react";
import { SvxAdjust } from "../../../editeng/inc/svxenum";
import { SvxAdjustItem } from "../../../editeng/inc/adjustitem";
import { RES_PARATR_ADJUST } from "../../inc/hintids";
import { paragraphAdjustments } from "./writer-search-format-values";

const lastLines = [
  [SvxAdjust.Left, "Start"],
  [SvxAdjust.Center, "Centered"],
  [SvxAdjust.Block, "Justified"],
] as const;

/** One percentage control in the native justification group. @param props - Caption, native value, bounds and change callback. @returns Labeled metric field. */
function PercentField(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}): React.JSX.Element {
  const [draft, setDraft] = useState<string>();
  return (
    <label className="grid gap-1 text-sm">
      {props.label}
      <span className="flex items-center gap-1">
        <input
          className="w-24 rounded border border-slate-400 p-1"
          type="number"
          min={props.min}
          max={props.max}
          value={draft ?? props.value}
          onChange={
            /** Keeps partial input while applying valid percentage changes. @param event - Edited field. @returns Nothing. */
            (event) => {
              const value = Math.round(event.currentTarget.valueAsNumber);
              if (value >= props.min && value <= props.max) {
                setDraft(undefined);
                props.onChange(value);
              } else setDraft(event.currentTarget.value);
            }
          }
          onBlur={
            /** Commits a numeric draft against the original spin bounds. @param event - Focus departure. @returns Nothing. */
            (event) => {
              if (draft === undefined) return;
              setDraft(undefined);
              const value = event.currentTarget.valueAsNumber;
              if (Number.isFinite(value))
                props.onChange(Math.round(Math.min(props.max, Math.max(props.min, value))));
            }
          }
          onKeyDown={
            /** Commits pending input before the dialog handles Enter. @param event - Key press. @returns Nothing. */
            (event) => {
              if (event.key === "Enter" && draft !== undefined) {
                event.preventDefault();
                event.currentTarget.blur();
              }
            }
          }
        />
        <span aria-hidden="true">%</span>
      </span>
    </label>
  );
}

/** Edits all represented justification members together in the native item. @param props - Active item, translations and output callback. @returns Alignment options and justification controls. */
export function WriterSearchParagraphAlignment(props: {
  value?: SvxAdjustItem | undefined;
  label: (key: string, fallback: string) => string;
  onChange: (item: SvxAdjustItem) => void;
}): React.JSX.Element {
  const group = useId();
  const { label } = props;
  const item = props.value ?? new SvxAdjustItem(SvxAdjust.Left, RES_PARATR_ADJUST);
  const justified = props.value?.GetAdjust() === SvxAdjust.Block;

  /** Copies the complete item before editing a member. @param apply - Native adjustment mutation. @returns Nothing. */
  function edit(apply: (item: SvxAdjustItem) => void): void {
    const next = item.Clone();
    apply(next);
    props.onChange(next);
  }

  /** Applies the native alignment toggled handler. @param adjust - Selected alignment. @returns Nothing. */
  function changeAlignment(adjust: SvxAdjust): void {
    edit(
      /** Resets last-line options when leaving justified alignment. @param next - Draft item. @returns Nothing. */
      (next) => {
        next.SetAdjust(adjust);
        if (adjust !== SvxAdjust.Block) {
          next.SetLastBlock(SvxAdjust.Left);
          next.SetOneWord(SvxAdjust.Left);
        }
      },
    );
  }

  /** Applies the original word spacing spin-button dependency rules. @param field - Edited limit or desired spacing. @param value - Whole percent. @returns Nothing. */
  function changeWordSpacing(field: "minimum" | "desired" | "maximum", value: number): void {
    edit(
      /** Updates the edited value and brings the other fields inside the new limits. @param next - Draft item. @returns Nothing. */
      (next) => {
        if (field === "minimum") {
          next.SetPropWordSpacingMinimum(value);
          next.SetPropWordSpacing(Math.max(value, next.GetPropWordSpacing()));
          next.SetPropWordSpacingMaximum(Math.max(value, next.GetPropWordSpacingMaximum()));
        } else if (field === "maximum") {
          next.SetPropWordSpacingMaximum(value);
          next.SetPropWordSpacingMinimum(Math.min(value, next.GetPropWordSpacingMinimum()));
          next.SetPropWordSpacing(Math.min(value, next.GetPropWordSpacing()));
        } else {
          next.SetPropWordSpacing(value);
          next.SetPropWordSpacingMinimum(Math.min(value, next.GetPropWordSpacingMinimum()));
          next.SetPropWordSpacingMaximum(Math.max(value, next.GetPropWordSpacingMaximum()));
        }
      },
    );
  }

  return (
    <>
      <fieldset className="grid gap-1 rounded border border-slate-200 p-2">
        <legend className="text-sm">{label("alignment-options", "Options")}</legend>
        {paragraphAdjustments.map(
          /** Renders a native horizontal alignment. @param option - Native value and caption. @returns Radio control. */
          ([value, caption]) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={group}
                checked={props.value?.GetAdjust() === value}
                onChange={
                  /** Selects this alignment. @returns Nothing. */ () => changeAlignment(value)
                }
              />
              {label(`paragraph-alignment.${value}`, caption)}
            </label>
          ),
        )}
        <label className="grid gap-1 text-sm">
          {label("last-line", "Last line")}
          <select
            className="rounded border border-slate-400 p-1"
            disabled={!justified}
            value={justified ? item.GetLastBlock() : SvxAdjust.Left}
            onChange={
              /** Applies the last-line selection and expansion dependency. @param event - Active row. @returns Nothing. */
              (event) => {
                const value = Number(event.currentTarget.value);
                edit(
                  /** Applies the native last-line changed handler. @param next - Draft item. @returns Nothing. */
                  (next) => {
                    next.SetLastBlock(value);
                    if (value !== SvxAdjust.Block) next.SetOneWord(SvxAdjust.Left);
                  },
                );
              }
            }
          >
            {lastLines.map(
              /** Renders a native last-line row. @param row - Value and caption. @returns Option. */
              ([value, caption]) => (
                <option key={value} value={value}>
                  {label(`last-line.${value}`, caption)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={!justified || item.GetLastBlock() !== SvxAdjust.Block}
            checked={justified && item.GetOneWord() === SvxAdjust.Block}
            onChange={
              /** Updates the single-word expansion flag. @param event - Checkbox change. @returns Nothing. */
              (event) => {
                const value = event.currentTarget.checked ? SvxAdjust.Block : SvxAdjust.Left;
                edit(
                  /** Writes the native flag. @param next - Draft item. @returns Nothing. */ (
                    next,
                  ) => next.SetOneWord(value),
                );
              }
            }
          />
          {label("expand-single-word", "Expand single word")}
        </label>
      </fieldset>
      <fieldset disabled={!justified} className="grid gap-2 rounded border border-slate-200 p-2">
        <legend className="text-sm">{label("justification", "Justification")}</legend>
        <div
          role="group"
          aria-label={label("word-spacing", "Word spacing")}
          className="grid gap-2 sm:grid-cols-3"
        >
          <PercentField
            label={label("word-spacing-minimum", "Minimum word spacing")}
            value={item.GetPropWordSpacingMinimum()}
            min={0}
            max={1000}
            onChange={
              /** Edits the minimum. @param value - Whole percent. @returns Nothing. */ (value) =>
                changeWordSpacing("minimum", value)
            }
          />
          <PercentField
            label={label("word-spacing-desired", "Desired word spacing")}
            value={item.GetPropWordSpacing()}
            min={0}
            max={1000}
            onChange={
              /** Edits the desired spacing. @param value - Whole percent. @returns Nothing. */ (
                value,
              ) => changeWordSpacing("desired", value)
            }
          />
          <PercentField
            label={label("word-spacing-maximum", "Maximum word spacing")}
            value={item.GetPropWordSpacingMaximum()}
            min={0}
            max={1000}
            onChange={
              /** Edits the maximum. @param value - Whole percent. @returns Nothing. */ (value) =>
                changeWordSpacing("maximum", value)
            }
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={item.GetParagraphComposer()}
            onChange={
              /** Edits the paragraph composer flag. @param event - Checkbox change. @returns Nothing. */
              (event) => {
                const value = event.currentTarget.checked;
                edit(
                  /** Stores the native flag. @param next - Draft item. @returns Nothing. */ (
                    next,
                  ) => next.SetParagraphComposer(value),
                );
              }
            }
          />
          {label("paragraph-composer", "Paragraph Composer")}
        </label>
        <div
          role="group"
          aria-label={label("letter-spacing", "Letter spacing")}
          className="grid gap-2 sm:grid-cols-2"
        >
          <PercentField
            label={label("letter-spacing-minimum", "Minimum letter spacing")}
            value={item.GetPropLetterSpacingMinimum()}
            min={-100}
            max={0}
            onChange={
              /** Edits the letter spacing minimum. @param value - Whole percent. @returns Nothing. */ (
                value,
              ) =>
                edit(
                  /** Stores the native minimum. @param next - Draft item. @returns Nothing. */ (
                    next,
                  ) => next.SetPropLetterSpacingMinimum(value),
                )
            }
          />
          <PercentField
            label={label("letter-spacing-maximum", "Maximum letter spacing")}
            value={item.GetPropLetterSpacingMaximum()}
            min={0}
            max={500}
            onChange={
              /** Edits the letter spacing maximum. @param value - Whole percent. @returns Nothing. */ (
                value,
              ) =>
                edit(
                  /** Stores the native maximum. @param next - Draft item. @returns Nothing. */ (
                    next,
                  ) => next.SetPropLetterSpacingMaximum(value),
                )
            }
          />
        </div>
        <div
          role="group"
          aria-label={label("glyph-scaling", "Glyph scaling")}
          className="grid gap-2 sm:grid-cols-2"
        >
          <PercentField
            label={label("glyph-scaling-minimum", "Minimum glyph scaling")}
            value={item.GetPropScaleWidthMinimum()}
            min={50}
            max={100}
            onChange={
              /** Edits the glyph scaling minimum. @param value - Whole percent. @returns Nothing. */ (
                value,
              ) =>
                edit(
                  /** Stores the native minimum. @param next - Draft item. @returns Nothing. */ (
                    next,
                  ) => next.SetPropScaleWidthMinimum(value),
                )
            }
          />
          <PercentField
            label={label("glyph-scaling-maximum", "Maximum glyph scaling")}
            value={item.GetPropScaleWidthMaximum()}
            min={100}
            max={200}
            onChange={
              /** Edits the glyph scaling maximum. @param value - Whole percent. @returns Nothing. */ (
                value,
              ) =>
                edit(
                  /** Stores the native maximum. @param next - Draft item. @returns Nothing. */ (
                    next,
                  ) => next.SetPropScaleWidthMaximum(value),
                )
            }
          />
        </div>
      </fieldset>
    </>
  );
}
