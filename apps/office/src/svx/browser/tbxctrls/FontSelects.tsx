/** @fileoverview Actual Writer font-family/point-size widgets shared with Calc;the frame supplies selected value,availability and acceptance ports. */
import { useEffect, useState } from "react";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../vcl/browser/font-list";
/** Device-backed font selector. @param props - Command surface properties. @returns Selector. */
export function FontNameSelect({
  value,
  enabled,
  label,
  onSelect,
  embeddedFontFamilies = [],
  fontAvailability = {},
  unavailableFontMessage,
}: {
  readonly value: unknown;
  readonly enabled: boolean;
  readonly label: string;
  readonly onSelect: (value: string) => void;
  readonly embeddedFontFamilies?: readonly string[];
  readonly fontAvailability?: Readonly<Record<string, boolean>>;
  readonly unavailableFontMessage?: string;
}): React.JSX.Element {
  const [fonts, setFonts] = useState<readonly string[]>(FALLBACK_FONT_FAMILIES);
  const selected = String(value ?? "");
  useEffect(
    /** Loads device fonts after mount. @returns Cleanup. */ () => {
      if (!enabled) return;
      let active = true;
      void FontList.FromBrowser().then(
        /** Publishes the font list. @param fontList - Loaded fonts. @returns Nothing. */ (
          fontList,
        ) => {
          if (active) setFonts(fontList.GetFontNames());
        },
      );
      return /** Prevents stale publication. @returns Nothing. */ () => {
        active = false;
      };
    },
    [enabled],
  );
  const options = [...new Set([selected, ...embeddedFontFamilies, ...fonts])];
  const unavailable =
    embeddedFontFamilies.includes(selected) && fontAvailability[selected] === false;
  return (
    <label className="contents">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        disabled={!enabled}
        className="h-8 min-w-40 max-w-52 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onChange={
          /** Applies the selected font. @param event - Select change. @returns Nothing. */ (
            event,
          ) => {
            onSelect(event.target.value);
          }
        }
        style={{ fontFamily: selected }}
        value={selected}
      >
        {options.map(
          /** Renders one font family. @param font - Family. @returns Option. */ (font) => (
            <option key={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ),
        )}
      </select>
      {unavailable && unavailableFontMessage !== undefined ? (
        <span role="status" className="text-xs text-amber-700">
          {unavailableFontMessage}
        </span>
      ) : null}
    </label>
  );
}

const STANDARD_FONT_SIZES_PT = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72] as const;

/** Shared point-size widget over the owning frame value and acceptance ports. @param props - Command surface properties. @returns Selector. */
export function FontSizeSelect({
  value,
  enabled,
  label,
  onSelect,
}: {
  readonly value: unknown;
  readonly enabled: boolean;
  readonly label: string;
  readonly onSelect: (value: number) => void;
}): React.JSX.Element {
  const selected = value === undefined ? "" : Number(value);
  const options =
    selected === ""
      ? STANDARD_FONT_SIZES_PT
      : STANDARD_FONT_SIZES_PT.includes(selected as (typeof STANDARD_FONT_SIZES_PT)[number])
        ? STANDARD_FONT_SIZES_PT
        : [selected, ...STANDARD_FONT_SIZES_PT];
  return (
    <label className="contents">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        disabled={!enabled}
        className="h-8 min-w-20 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onChange={
          /** Applies the selected font height. @param event - Select change. @returns Nothing. */ (
            event,
          ) => {
            onSelect(Number(event.target.value));
          }
        }
        value={selected}
      >
        {selected === "" ? <option value="" /> : null}
        {options.map(
          /** Renders one point size. @param size - Point height. @returns Option. */ (size) => (
            <option key={size} value={size}>{`${size} pt`}</option>
          ),
        )}
      </select>
    </label>
  );
}
