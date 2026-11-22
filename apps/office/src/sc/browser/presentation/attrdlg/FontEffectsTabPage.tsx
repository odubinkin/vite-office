/** @fileoverview Calc character effects page with source line, relief and emphasis controls over native pool items. */
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxCharReliefItem,
  SvxContourItem,
  SvxOverlineItem,
  SvxShadowedItem,
  SvxUnderlineItem,
  SvxWordLineModeItem,
} from "../../../../editeng/source/items/textitem";
import {
  SvxCrossedOutItem,
  SvxEmphasisMarkItem,
} from "../../../../editeng/source/items/textitem.effects";
import { SvxColorItem } from "../../../../editeng/source/items/textitem.color";
import { Color, COL_AUTO, COL_TRANSPARENT } from "../../../../tools/inc/color";
import {
  FontEmphasisMark as Emphasis,
  FontLineStyle as Line,
  FontStrikeout as Strikeout,
} from "../../../../tools/inc/fontenum";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import * as attr from "../../../inc/scitems";
import type { ScAttrDlg } from "../../../source/ui/attrdlg/attrdlg";

/** One native combo row. */
type Choice = readonly [number, string];

const lineStyles: readonly Choice[] = [
  [0, "(Without)"],
  [1, "Single"],
  [2, "Double"],
  [12, "Bold"],
  [3, "Dotted"],
  [13, "Dotted (Bold)"],
  [5, "Dash"],
  [14, "Dash (Bold)"],
  [6, "Long Dash"],
  [15, "Long Dash (Bold)"],
  [7, "Dot Dash"],
  [16, "Dot Dash (Bold)"],
  [8, "Dot Dot Dash"],
  [17, "Dot Dot Dash (Bold)"],
  [10, "Wave"],
  [18, "Wave (Bold)"],
  [11, "Double Wave"],
];

/** Original dialog exchange. */
interface Props {
  readonly model: ScAttrDlg;
  readonly onChange: (items: readonly SfxPoolItem[]) => void;
}

/** Binds the available character effects to their concrete item owners. @param props - Native input and output. @returns Font Effects page. */
export function FontEffectsTabPage({ model, onChange }: Props): React.JSX.Element {
  const underline = model.GetItem<SvxUnderlineItem>(attr.ATTR_FONT_UNDERLINE);
  const overline = model.GetItem<SvxOverlineItem>(attr.ATTR_FONT_OVERLINE);
  const strikeout = model.GetItem<SvxCrossedOutItem>(attr.ATTR_FONT_CROSSEDOUT)?.GetStrikeout();
  const relief = model.GetItem<SvxCharReliefItem>(attr.ATTR_FONT_RELIEF)?.GetValue();
  const emphasis = model
    .GetItem<SvxEmphasisMarkItem>(attr.ATTR_FONT_EMPHASISMARK)
    ?.GetEmphasisMark();
  const fontColor = model.GetItem<SvxColorItem>(attr.ATTR_FONT_COLOR)?.GetValue();
  const emphasisStyle = emphasis === undefined ? undefined : emphasis & Emphasis.Style;
  const emphasisPosition =
    emphasis && emphasis & Emphasis.PosBelow ? Emphasis.PosBelow : Emphasis.PosAbove;

  /** Stages one line edit while preserving the other part of the line item. @param which - Line item. @param value - New style or color. @returns Nothing. */
  function changeLine(which: number, value: Line | Color): void {
    const current = which === attr.ATTR_FONT_UNDERLINE ? underline : overline;
    const item =
      current?.Clone() ??
      (which === attr.ATTR_FONT_UNDERLINE
        ? new SvxUnderlineItem(Line.LINESTYLE_NONE, which)
        : new SvxOverlineItem(Line.LINESTYLE_NONE, which));
    if (typeof value === "number") item.SetLineStyle(value);
    else item.SetColor(value);
    onChange([item]);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <fieldset className="grid gap-2 rounded border p-3">
        <legend className="px-1 text-sm font-medium">Font Color</legend>
        <ColorField
          label="Font color"
          value={fontColor}
          automatic={COL_AUTO}
          change={
            /** Stages the selected font color. @param color - New control value. @returns Nothing. */ (
              color,
            ) => onChange([new SvxColorItem(color, attr.ATTR_FONT_COLOR)])
          }
        />
        <Select
          label="Relief"
          value={relief}
          choices={[
            [0, "(Without)"],
            [1, "Embossed"],
            [2, "Engraved"],
          ]}
          change={
            /** Stages the selected relief. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new SvxCharReliefItem(value as FontRelief, attr.ATTR_FONT_RELIEF)])
          }
        />
        <Flag
          label="Outline"
          value={model.GetItem<SvxContourItem>(attr.ATTR_FONT_CONTOUR)?.GetValue()}
          disabled={Boolean(relief)}
          change={
            /** Stages the native character outline flag. @param checked - New control value. @returns Nothing. */ (
              checked,
            ) => onChange([new SvxContourItem(checked, attr.ATTR_FONT_CONTOUR)])
          }
        />
        <Flag
          label="Shadow"
          value={model.GetItem<SvxShadowedItem>(attr.ATTR_FONT_SHADOWED)?.GetValue()}
          disabled={Boolean(relief)}
          change={
            /** Stages the character shadow flag. @param checked - New control value. @returns Nothing. */ (
              checked,
            ) => onChange([new SvxShadowedItem(checked, attr.ATTR_FONT_SHADOWED)])
          }
        />
        <Select
          label="Emphasis mark"
          value={emphasisStyle}
          choices={[
            [0, "(Without)"],
            [1, "Dot"],
            [2, "Circle"],
            [3, "Disc"],
            [4, "Accent"],
          ]}
          change={
            /** Updates the emphasis shape while retaining its position. @param value - New control value. @returns Nothing. */ (
              value,
            ) =>
              onChange([
                new SvxEmphasisMarkItem(
                  value ? value | emphasisPosition : Emphasis.NONE,
                  attr.ATTR_FONT_EMPHASISMARK,
                ),
              ])
          }
        />
        <Select
          label="Position"
          value={emphasisPosition}
          disabled={!emphasisStyle}
          choices={[
            [Emphasis.PosAbove, "Above text"],
            [Emphasis.PosBelow, "Below text"],
          ]}
          change={
            /** Updates the original position of the emphasis mark. @param value - New control value. @returns Nothing. */ (
              value,
            ) =>
              onChange([
                new SvxEmphasisMarkItem((emphasisStyle ?? 0) | value, attr.ATTR_FONT_EMPHASISMARK),
              ])
          }
        />
      </fieldset>
      <fieldset className="grid gap-2 rounded border p-3">
        <legend className="px-1 text-sm font-medium">Text Decoration</legend>
        <Select
          label="Overlining"
          value={overline?.GetLineStyle()}
          choices={lineStyles}
          change={
            /** Updates the overline style. @param value - New control value. @returns Nothing. */ (
              value,
            ) => changeLine(attr.ATTR_FONT_OVERLINE, value)
          }
        />
        <ColorField
          label="Overline color"
          value={overline?.GetColor()}
          automatic={COL_TRANSPARENT}
          disabled={!overline?.GetLineStyle()}
          change={
            /** Updates the overline color. @param color - New control value. @returns Nothing. */ (
              color,
            ) => changeLine(attr.ATTR_FONT_OVERLINE, color)
          }
        />
        <Select
          label="Strikethrough"
          value={strikeout}
          choices={[
            [0, "(Without)"],
            [1, "Single"],
            [2, "Double"],
            [4, "Bold"],
            [5, "With /"],
            [6, "With X"],
          ]}
          change={
            /** Updates the original strikeout style. @param value - New control value. @returns Nothing. */ (
              value,
            ) => onChange([new SvxCrossedOutItem(value as Strikeout, attr.ATTR_FONT_CROSSEDOUT)])
          }
        />
        <Select
          label="Underlining"
          value={underline?.GetLineStyle()}
          choices={lineStyles}
          change={
            /** Updates the underline style. @param value - New control value. @returns Nothing. */ (
              value,
            ) => changeLine(attr.ATTR_FONT_UNDERLINE, value)
          }
        />
        <ColorField
          label="Underline color"
          value={underline?.GetColor()}
          automatic={COL_TRANSPARENT}
          disabled={!underline?.GetLineStyle()}
          change={
            /** Updates the underline color. @param color - New control value. @returns Nothing. */ (
              color,
            ) => changeLine(attr.ATTR_FONT_UNDERLINE, color)
          }
        />
        <Flag
          label="Individual words"
          value={model.GetItem<SvxWordLineModeItem>(attr.ATTR_FONT_WORDLINE)?.GetValue()}
          disabled={!underline?.GetLineStyle() && !overline?.GetLineStyle() && !strikeout}
          change={
            /** Stages the individual-words flag. @param checked - New control value. @returns Nothing. */ (
              checked,
            ) => onChange([new SvxWordLineModeItem(checked, attr.ATTR_FONT_WORDLINE)])
          }
        />
      </fieldset>
      <output
        aria-label="Font effects preview"
        className="rounded border p-3 text-center sm:col-span-2"
        style={{
          color: fontColor?.IsTransparent() ? undefined : cssColor(fontColor),
          textDecorationLine:
            [
              underline?.GetLineStyle() && "underline",
              overline?.GetLineStyle() && "overline",
              strikeout && "line-through",
            ]
              .filter(Boolean)
              .join(" ") || undefined,
        }}
      >
        {typeof model.sample === "string" && model.sample ? model.sample : "Sample text"}
      </output>
    </div>
  );
}

/** Projects an item RGB value to browser color. @param value - Native color. @returns RGB string. */
function cssColor(value: Readonly<Color> | undefined): string {
  return "#" + ((value?.toUInt32() ?? 0) & 0xffffff).toString(16).padStart(6, "0");
}

/** Presents a native effect selection. @param props - Choice bindings. @returns Labeled combo. */
function Select({
  label,
  value,
  choices,
  disabled,
  change,
}: {
  readonly label: string;
  readonly value: number | undefined;
  readonly choices: readonly Choice[];
  readonly disabled?: boolean;
  readonly change: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className="grid grid-cols-2 items-center gap-1 text-sm">
      {label}
      <select
        className="min-w-0 rounded border px-2 py-1"
        value={value ?? ""}
        disabled={disabled}
        onChange={
          /** Returns the selected native enum value. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => change(Number(event.currentTarget.value))
        }
      >
        {value === undefined && <option value="" hidden />}
        {choices.map(
          /** Projects one source effect choice. @param row - Source choice. @returns Choice. */ ([
            key,
            name,
          ]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

/** Presents an effect checkbox, including mixed selection. @param props - Boolean item binding. @returns Labeled checkbox. */
function Flag({
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
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={value ?? false}
        disabled={disabled}
        aria-checked={value ?? "mixed"}
        ref={
          /** Projects a mixed checkbox when the original item is invalid. @param input - Rendered checkbox. @returns Nothing. */ (
            input,
          ) => {
            if (input) input.indeterminate = value === undefined;
          }
        }
        onChange={
          /** Reports the updated boolean effect. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => change(event.currentTarget.checked)
        }
      />
      {label}
    </label>
  );
}

/** Presents a native color picker and its Automatic choice. @param props - Native color item binding. @returns Color controls. */
function ColorField({
  label,
  value,
  automatic,
  disabled,
  change,
}: {
  readonly label: string;
  readonly value: Readonly<Color> | undefined;
  readonly automatic: Readonly<Color>;
  readonly disabled?: boolean;
  readonly change: (value: Color) => void;
}): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <label className="flex items-center gap-2">
        {label}
        <input
          type="color"
          disabled={disabled}
          value={cssColor(value?.IsTransparent() ? undefined : value)}
          onChange={
            /** Reports the RGB chosen by the user. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => change(new Color(Number.parseInt(event.currentTarget.value.slice(1), 16)))
          }
        />
      </label>
      <button
        className="rounded border px-2 py-1 text-xs disabled:opacity-50"
        type="button"
        aria-label={`Automatic ${label.toLowerCase()}`}
        aria-pressed={value?.equals(automatic) ?? false}
        disabled={disabled}
        onClick={
          /** Restores the original automatic color. @returns Nothing. */ () =>
            change(new Color(automatic))
        }
      >
        Automatic
      </button>
    </div>
  );
}
