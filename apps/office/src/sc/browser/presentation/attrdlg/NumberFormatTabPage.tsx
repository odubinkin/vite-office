/** @fileoverview Native Numbers page controls and formatter-backed preview. */
import { useState } from "react";
import type { Color } from "../../../../tools/inc/color";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import type { SfxUInt32Item } from "../../../../svl/source/items/intitem";
import { SvNumFormatType as T } from "../../../../svl/inc/zforlist";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  GetNumberFormatLanguages,
  numberFormatCategories,
} from "../../../../svx/source/items/numfmtsh";
import { GetCurrencySymbols } from "../../../../svx/source/tbxctrls/tbcontrl.currency";
import type { ScAttrDlg, NumberFormatChange } from "../../../source/ui/attrdlg/attrdlg";
import { ATTR_LANGUAGE_FORMAT, ATTR_VALUE_FORMAT } from "../../../inc/scitems";
import type { SvxLanguageItem } from "../../../../editeng/source/items/textitem.language";

const fieldClass = "min-w-0 rounded border border-slate-300 bg-white px-2 py-1 text-sm";
const listClass = "h-44 w-full " + fieldClass;

/** Converts the formatter's optional source foreground to an HTML color. @param color - Formatter output. @returns CSS RGB or no override. */
function previewColor(color: Color | null | undefined): string | undefined {
  return color ? "#" + color.GetRGBColor().toUInt32().toString(16).padStart(6, "0") : undefined;
}

/** Provides the dialog's preview model and editable number-format draft. */
interface Props {
  readonly model: ScAttrDlg;
  readonly edit: NumberFormatChange | undefined;
  readonly setEdit: (value: NumberFormatChange) => void;
}

/** Renders the source Category, Format, Locale, Options and Format Code hierarchy.
 * @param props - Original formatter and dialog state.
 * @param props.model - Actual dialog snapshot.
 * @param props.edit - Modified picture.
 * @param props.setEdit - Stages an uncommitted picture.
 * @returns Numbers tab.
 */
export function NumberFormatTabPage({ model, edit, setEdit }: Props): React.JSX.Element {
  const mixed = model.items.GetItemState(ATTR_VALUE_FORMAT) === SfxItemState.INVALID;
  const key = (model.items.Get(ATTR_VALUE_FORMAT) as SfxUInt32Item).GetValue();
  const initial = mixed ? null : model.formatter.GetEntry(key);
  const attrLanguage = (model.items.Get(ATTR_LANGUAGE_FORMAT) as SvxLanguageItem).GetLanguage();
  const language = edit?.language ?? initial?.GetLanguage() ?? attrLanguage ?? LANGUAGE_SYSTEM;
  const code = edit?.code ?? (initial ? text(initial.GetFormatstring()) : "");
  const [categoryOverride, setCategory] = useState<number>();
  const [currency, setCurrency] = useState("");
  const description = model.numbers.Describe(code, language);
  const type = description?.type ?? T.ALL;
  const initialCategory =
    !description || (model.sample === undefined && key === 0 && !edit)
      ? T.ALL
      : type === T.DATETIME
        ? T.DATE
        : type;
  const category = categoryOverride ?? initialCategory;
  const [locales] = useState(
    /** Loads the formatter locales for the current notebook. @returns Locale rows. */ () =>
      GetNumberFormatLanguages(),
  );
  const [currencyList] = useState(
    /** Loads the available source currencies. @returns Currency rows. */ () =>
      GetCurrencySymbols(new Set()),
  );
  const currencyRows = category === T.CURRENCY ? currencyList : [];
  const formats = model.numbers.GetFormats(category, language);
  const currentCode = description?.code ?? code;
  const selectedCode = formats.some(
    /** Resolves the selected original gallery row. @param row - Format gallery row. @returns Whether its code is active. */
    (row) => row.code === currentCode,
  )
    ? currentCode
    : "";
  const usable =
    [T.NUMBER, T.CURRENCY, T.PERCENT, T.SCIENTIFIC, T.TIME, T.FRACTION].some(
      /** Checks option availability for the effective source type. @param candidate - Type. @returns Match. */
      (candidate) => type === candidate,
    ) ||
    (!description && !code && category === T.ALL);

  /** Rebuilds the original compatible picture from its option controls.
   * @param patch - Newly edited field.
   * @returns Nothing.
   */
  function change(
    patch: Partial<{ grouped: boolean; red: boolean; precision: number; leadingZeros: number }>,
  ): void {
    const picture = code || model.numbers.GetStandardCode(T.NUMBER, language);
    const previous = description ?? { grouped: false, red: false, precision: 0, leadingZeros: 1 };
    setEdit({
      language,
      code: model.numbers.Generate(picture, language, { ...previous, ...patch }),
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[minmax(7rem,1fr)_minmax(10rem,2fr)] gap-3 sm:grid-cols-[minmax(7rem,1fr)_minmax(10rem,2fr)_minmax(9rem,1fr)]">
        <label className="space-y-1 text-sm">
          Category
          <select
            size={11}
            className={listClass}
            value={category}
            onChange={
              /** Switches to the selected source category. @param event - Browser control event. @returns Nothing. */ (
                event,
              ) => {
                const next = Number(event.currentTarget.value);
                setCategory(next);
                setCurrency("");
                const first = model.numbers.GetFormats(next, language)[0];
                setEdit({
                  language,
                  code: first?.code ?? model.numbers.GetStandardCode(next, language),
                });
              }
            }
          >
            {numberFormatCategories.map(
              /** Projects one source number-format category. @param entry - Original row data. @returns Category option. */ ([
                name,
                value,
              ]) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ),
            )}
          </select>
        </label>
        <div className="min-w-0 space-y-1">
          {category === T.CURRENCY && (
            <label className="block text-sm">
              Currency
              <select
                className={fieldClass + " w-full"}
                value={currency}
                onChange={
                  /** Selects the native currency picture. @param event - Browser control event. @returns Nothing. */ (
                    event,
                  ) => {
                    const id = event.currentTarget.value;
                    setCurrency(id);
                    const choice = id ? currencyRows[Number(id)] : undefined;
                    setEdit({
                      language,
                      code: choice
                        ? model.numbers.GetCurrencyCode(choice, language)
                        : model.numbers.GetStandardCode(T.CURRENCY, language),
                    });
                  }
                }
              >
                <option value="">Automatic</option>
                {currencyRows.map(
                  /** Projects one currency identity. @param entry - Currency choice. @param index - Source position. @returns Currency option. */ (
                    entry,
                    index,
                  ) => (
                    <option key={index} value={index}>
                      {entry.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
          <label className="block space-y-1 text-sm">
            Format
            <select
              size={11}
              className={listClass}
              value={selectedCode}
              onChange={
                /** Selects the original format picture. @param event - Browser control event. @returns Nothing. */ (
                  event,
                ) => setEdit({ language, code: event.currentTarget.value })
              }
            >
              {!selectedCode && <option value="" hidden />}
              {formats.map(
                /** Projects the source preview and underlying format picture. @param row - Format gallery row. @returns Format option. */
                (row) => (
                  <option
                    key={row.code}
                    value={row.code}
                    style={{ color: previewColor(row.color) }}
                  >
                    {row.label}
                  </option>
                ),
              )}
            </select>
          </label>
        </div>
        <div className="col-span-2 min-w-0 space-y-3 sm:col-span-1">
          <label className="space-y-1 text-sm">
            Locale
            <select
              className={fieldClass + " w-full"}
              value={language}
              onChange={
                /** Remaps the format picture to the selected locale. @param event - Browser control event. @returns Nothing. */ (
                  event,
                ) => {
                  const target = Number(event.currentTarget.value);
                  setEdit({
                    language: target,
                    code: model.numbers.Translate(code, language, target, category),
                  });
                }
              }
            >
              {!locales.some(
                /** Keeps the active locale available in the list. @param entry - Original row data. @returns Whether a locale matches. */ ({
                  id,
                }) => id === language,
              ) && <option value={language}>{language}</option>}
              {locales.map(
                /** Projects each supported locale name. @param entry - Original row data. @returns Locale option. */ ({
                  id,
                  name,
                }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ),
              )}
            </select>
          </label>
          <output
            aria-label="Preview"
            className="block min-h-9 overflow-auto rounded border border-slate-200 bg-white px-2 py-2 text-right text-sm"
            style={{
              color: previewColor(description?.color),
            }}
          >
            {description?.preview}
          </output>
        </div>
      </div>
      <fieldset className="grid gap-2 rounded border border-slate-200 p-3 text-sm sm:grid-cols-2">
        <legend className="px-1 font-medium">Options</legend>
        <DigitField
          label={type === T.FRACTION ? "Denominator places" : "Decimal places"}
          value={description?.precision ?? 0}
          max={type === T.FRACTION ? 8 : 20}
          disabled={!usable}
          change={
            /** Rebuilds the draft with the selected precision. @param precision - Source value. @returns Nothing. */ (
              precision,
            ) => change({ precision })
          }
        />
        <DigitField
          label="Leading zeroes"
          value={description?.leadingZeros ?? 1}
          max={20}
          disabled={!usable || type === T.TIME}
          change={
            /** Rebuilds the draft with the selected leading zero count. @param leadingZeros - Source value. @returns Nothing. */ (
              leadingZeros,
            ) => change({ leadingZeros })
          }
        />
        <label>
          <input
            type="checkbox"
            checked={description?.red ?? false}
            disabled={!usable}
            onChange={
              /** Regenerates the draft with its grouping flag. @param event - Browser control event. @returns Nothing. */ (
                event,
              ) => change({ red: event.currentTarget.checked })
            }
          />{" "}
          Negative numbers red
        </label>
        <label>
          <input
            type="checkbox"
            checked={description?.grouped ?? false}
            disabled={!usable || type === T.TIME || description?.spellOut}
            onChange={
              /** Regenerates the draft with its negative color flag. @param event - Browser control event. @returns Nothing. */ (
                event,
              ) => change({ grouped: event.currentTarget.checked })
            }
          />{" "}
          {type === T.SCIENTIFIC ? "Engineering notation" : "Thousands separator"}
        </label>
      </fieldset>
      <label className="block space-y-1 text-sm">
        Format Code
        <input
          className={fieldClass + " w-full font-mono"}
          value={code}
          aria-invalid={!!edit && !description}
          onChange={
            /** Stages the user's draft picture. @param event - Browser control event. @returns Nothing. */ (
              event,
            ) => setEdit({ language, code: event.currentTarget.value })
          }
        />
      </label>
    </div>
  );
}

/** Shows one native bounded number format option. @param props - Field and option binding. @param props.label - Visible name. @param props.value - Current value. @param props.max - Maximum digit count. @param props.disabled - Source admission. @param props.change - Writes a digit count. @returns Labeled spin control. */
function DigitField({
  label,
  value,
  max,
  disabled,
  change,
}: {
  readonly label: string;
  readonly value: number;
  readonly max: number;
  readonly disabled: boolean;
  readonly change: (value: number) => void;
}): React.JSX.Element {
  return (
    <label className="flex flex-wrap items-center justify-between gap-1">
      {label}
      <input
        type="number"
        className={fieldClass + " w-20"}
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={
          /** Applies a supported digit count. @param event - Browser control event. @returns Nothing. */ (
            event,
          ) => {
            const next = event.currentTarget.valueAsNumber;
            if (Number.isInteger(next) && next >= 0 && next <= max) change(next);
          }
        }
      />
    </label>
  );
}
