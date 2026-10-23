/** @fileoverview Actual Writer font-family/point-size widgets shared with Calc;the frame supplies selected value,availability and acceptance ports. */
import { useEffect, useState } from "react";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../vcl/browser/font-list";
import { createBrowserFontItem } from "./font-item";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
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
  readonly onSelect: (value: SvxFontItem) => void;
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
            onSelect(createBrowserFontItem(event.target.value));
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

/** Original editable absolute-size control shared with Writer and Calc. */
export { FontSizeSelect } from "./FontSizeBox";
