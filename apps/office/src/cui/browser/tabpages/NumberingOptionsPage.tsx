/** @fileoverview Browser numbering options over the native SvxNumberFormat value. */
import { getUniformNumberingValue } from "../../source/tabpages/numpages";
import { SvxNumType as Type } from "../../../editeng/inc/svxenum";
import type { SvxNumberFormat, ConstSvxNumberFormat } from "../../../editeng/inc/numitem";

const control = "w-full rounded border border-slate-400 p-1";
const numberTypes = [
  [Type.SVX_NUM_ARABIC, "1, 2, 3, …"],
  [Type.SVX_NUM_CHARS_UPPER_LETTER, "A, B, C, …"],
  [Type.SVX_NUM_CHARS_LOWER_LETTER, "a, b, c, …"],
  [Type.SVX_NUM_ROMAN_UPPER, "I, II, III, …"],
  [Type.SVX_NUM_ROMAN_LOWER, "i, ii, iii, …"],
  [Type.SVX_NUM_CHARS_UPPER_LETTER_N, "A, B, C, …, AA, BB, CC, …"],
  [Type.SVX_NUM_CHARS_LOWER_LETTER_N, "a, b, c, …, aa, bb, cc, …"],
  [Type.SVX_NUM_ARABIC_ZERO, "01, 02, 03, …"],
  [Type.SVX_NUM_ARABIC_ZERO3, "001, 002, 003, …"],
  [Type.SVX_NUM_ARABIC_ZERO4, "0001, 0002, 0003, …"],
  [Type.SVX_NUM_ARABIC_ZERO5, "00001, 00002, 00003, …"],
  [Type.SVX_NUM_CHAR_SPECIAL, "Bullet"],
  [Type.SVX_NUM_NUMBER_NONE, "None"],
] as const;

/** Edits the selected native numbering levels. @param props - Active levels and options exchange. @returns Native Customize controls. */
export function NumberingOptionsPage({
  formats,
  highestLevel,
  edit,
  characterStyles,
  continuous,
  setContinuous,
  label,
}: Readonly<{
  formats: readonly [ConstSvxNumberFormat, ...ConstSvxNumberFormat[]];
  highestLevel: number;
  edit: (change: (format: SvxNumberFormat, level: number) => void) => void;
  characterStyles: readonly string[];
  continuous: boolean;
  setContinuous: (value: boolean) => void;
  label: (key: string, fallback: string) => string;
}>): React.JSX.Element {
  const format = formats[0];
  const last = formats[formats.length - 1] ?? format;
  const type = getUniformNumberingValue(
    formats,
    /** Reads each selected level's type. @param level - Format. @returns Type. */ (level) =>
      level.GetNumberingType(),
  );
  const startType = format.GetNumberingType();
  const zeroAllowed =
    startType >= Type.SVX_NUM_ARABIC &&
    startType !== Type.SVX_NUM_CHARS_UPPER_LETTER_N &&
    startType !== Type.SVX_NUM_CHARS_LOWER_LETTER_N;
  const bullet = type === Type.SVX_NUM_CHAR_SPECIAL;
  const customType = !numberTypes.some(
    /** Checks the supported type menu against the current format. @param entry - Native type and label. @returns Match. */
    ([id]) => type === id,
  );
  const glyph = getUniformNumberingValue(
    formats,
    /** Reads the selected glyph. @param level - Format. @returns Glyph. */ (level) =>
      level.GetBulletChar(),
  );
  const characterStyle = getUniformNumberingValue(
    formats,
    /** Reads the selected character style. @param level - Format. @returns Name. */ (level) =>
      level.GetCharFormatName(),
  );
  const sublevels = getUniformNumberingValue(
    formats,
    /** Reads the selected sublevel count. @param level - Format. @returns Level count. */ (
      level,
    ) => level.GetIncludeUpperLevels(),
  );
  const legal = getUniformNumberingValue(
    formats,
    /** Reads the selected Arabic sublevels flag. @param level - Format. @returns Flag. */ (
      level,
    ) => level.GetIsLegal(),
  );
  /** Binds a native string field. @param caption - Visible label. @param value - Current text. @param onChange - Native change. @returns Text input. */
  function textField(caption: string, value: string, onChange: (value: string) => void) {
    return (
      <label className="grid gap-1">
        {caption}
        <input
          className={control}
          value={value}
          onChange={
            /** Exchanges the browser text. @param event - Changed input. @returns Nothing. */
            (event) => onChange(event.currentTarget.value)
          }
        />
      </label>
    );
  }
  /** Binds a bounded native counting field. @param caption - Visible label. @param value - Active value. @param min - Lower limit. @param max - Upper limit. @param write - Per-level mutation. @param disabled - Control sensitivity. @returns Numeric input. */
  function numberField(
    caption: string,
    value: number | undefined,
    min: number,
    max: number,
    write: (format: SvxNumberFormat, value: number, index: number) => void,
    disabled = false,
  ) {
    return (
      <label className="grid gap-1">
        {caption}
        <input
          type="number"
          className={control}
          min={min}
          max={max}
          value={value ?? ""}
          disabled={disabled}
          onChange={
            /** Stores a defined integer in the native range. @param event - Browser input. @returns Nothing. */
            (event) => {
              const next = event.currentTarget.valueAsNumber;
              if (Number.isInteger(next) && next >= min && next <= max)
                edit(
                  /** Updates one level. @param level - Editable format. @param index - Native level. @returns Nothing. */ (
                    level,
                    index,
                  ) => write(level, next, index),
                );
            }
          }
        />
      </label>
    );
  }
  return (
    <>
      <fieldset className="grid gap-3 rounded border border-slate-200 p-3 sm:grid-cols-2">
        <legend>{label("customize.numbering", "Numbering")}</legend>
        <label className="grid gap-1">
          {label("customize.type", "Number")}
          <select
            className={control}
            value={type ?? ""}
            onChange={
              /** Changes the native numbering type. @param event - Selected type. @returns Nothing. */
              (event) => {
                const next = Number(event.currentTarget.value) as Type;
                edit(
                  /** Switches numbering family while retaining independent geometry. @param level - Editable format. @param index - Native level. @returns Nothing. */
                  (level, index) => {
                    level.SetNumberingType(next);
                    if (next === Type.SVX_NUM_CHAR_SPECIAL) {
                      level.SetListFormat("", "", index);
                      if (level.GetBulletChar() === 0) level.SetBulletChar(0x2022);
                    }
                  },
                );
              }
            }
          >
            {type === undefined && <option value="" disabled />}
            {type !== undefined && customType && (
              <option value={type} disabled>
                {label("customize.current-format", "Current format")}
              </option>
            )}
            {numberTypes.map(
              /** Presents an available native identifier. @param entry - Type and label. @returns Option. */
              ([id, caption]) => (
                <option key={id} value={id}>
                  {label(`type.${id}`, caption)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="grid gap-1">
          {label("customize.character-style", "Character style")}
          <select
            className={control}
            value={characterStyle ?? "\u0001"}
            onChange={
              /** Exchanges the chosen character style name. @param event - Selected style. @returns Nothing. */
              (event) => {
                const name = event.currentTarget.value;
                edit(
                  /** Sets the shared format's native style name. @param level - Editable format. @returns Nothing. */ (
                    level,
                  ) => level.SetCharFormatName(name),
                );
              }
            }
          >
            {characterStyle === undefined && <option value={"\u0001"} disabled />}
            <option value="">{label("customize.no-style", "None")}</option>
            {characterStyles.map(
              /** Presents one available document character style. @param name - Native name. @returns Option. */
              (name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ),
            )}
          </select>
        </label>
        {bullet &&
          textField(
            label("customize.character", "Character"),
            glyph && glyph <= 0x10ffff ? String.fromCodePoint(glyph) : "",
            /** Stores a Unicode scalar as the bullet. @param value - Entered glyph. @returns Nothing. */
            (value) =>
              edit(
                /** Updates the specific marker. @param level - Editable format. @returns Nothing. */ (
                  level,
                ) => level.SetBulletChar(value.codePointAt(0) ?? 0),
              ),
          )}
        {!bullet && type !== Type.SVX_NUM_BITMAP && (
          <>
            {textField(
              label("customize.before", "Before"),
              format.GetPrefix() === last.GetPrefix() ? format.GetPrefix() : "",
              /** Updates the native prefix. @param value - New prefix. @returns Nothing. */
              (value) =>
                edit(
                  /** Regenerates the level pattern. @param level - Format. @param index - Native level. @returns Nothing. */ (
                    level,
                    index,
                  ) => level.SetListFormat(value, level.GetSuffix(), index),
                ),
            )}
            {textField(
              label("customize.after", "After"),
              format.GetSuffix() === last.GetSuffix() ? format.GetSuffix() : "",
              /** Updates the native suffix. @param value - New suffix. @returns Nothing. */
              (value) =>
                edit(
                  /** Regenerates the level pattern. @param level - Format. @param index - Native level. @returns Nothing. */ (
                    level,
                    index,
                  ) => level.SetListFormat(level.GetPrefix(), value, index),
                ),
            )}
            {numberField(
              label("customize.start", "Start at"),
              format.GetStart() === last.GetStart() ? format.GetStart() : undefined,
              zeroAllowed ? 0 : 1,
              65535,
              /** Sets the numbering start. @param level - Format. @param value - Start value. @returns Nothing. */
              (level, value) => level.SetStart(value),
            )}
            {numberField(
              label("customize.sublevels", "Show sublevels"),
              sublevels,
              1,
              highestLevel + 1,
              /** Updates included levels and their pattern. @param level - Format. @param value - Requested count. @param index - Native level. @returns Nothing. */
              (level, value, index) => {
                level.SetIncludeUpperLevels(Math.min(index + 1, value));
                level.SetListFormat(level.GetPrefix(), level.GetSuffix(), index);
              },
              highestLevel === 0 || continuous,
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={legal === true}
                disabled={continuous}
                ref={
                  /** Displays mixed legal numbering across the current selection. @param input - Mounted control. @returns Nothing. */
                  (input) => {
                    if (input) input.indeterminate = legal === undefined;
                  }
                }
                onChange={
                  /** Applies the native flag to the selected levels. @param event - Toggled checkbox. @returns Nothing. */
                  (event) => {
                    const value = event.currentTarget.checked;
                    edit(
                      /** Writes a level flag. @param level - Editable format. @returns Nothing. */ (
                        level,
                      ) => level.SetIsLegal(value),
                    );
                  }
                }
              />
              {label("customize.legal", "All sublevels Arabic")}
            </label>
          </>
        )}
      </fieldset>
      <fieldset className="rounded border border-slate-200 p-3">
        <legend>{label("customize.all-levels", "All Levels")}</legend>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={continuous}
            onChange={
              /** Sets the original consecutive numbering flag. @param event - Toggled checkbox. @returns Nothing. */
              (event) => setContinuous(event.currentTarget.checked)
            }
          />
          {label("customize.continuous", "Consecutive numbering")}
        </label>
      </fieldset>
    </>
  );
}
