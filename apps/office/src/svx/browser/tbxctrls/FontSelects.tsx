/** @fileoverview Actual Writer font-family/point-size widgets shared with Calc;the frame supplies selected value,availability and acceptance ports. */
import { useEffect, useMemo, useState } from "react";
import { ComboBox } from "../../../vcl/browser/ComboBox";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../vcl/browser/font-list";
import { createBrowserFontItem } from "./font-item";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
const noEmbeddedFontFamilies: readonly string[] = [];

/** Device-backed font selector. @param props - Command surface properties. @returns Selector. */
export function FontNameSelect({
  value,
  enabled,
  label,
  onSelect,
  embeddedFontFamilies = noEmbeddedFontFamilies,
  fontAvailability = {},
  unavailableFontMessage,
  focusDocument,
  inSidebar,
}: {
  readonly value: unknown;
  readonly enabled: boolean;
  readonly label: string;
  readonly onSelect: (value: SvxFontItem) => void;
  readonly embeddedFontFamilies?: readonly string[];
  readonly fontAvailability?: Readonly<Record<string, boolean>>;
  readonly unavailableFontMessage?: string;
  readonly focusDocument?: () => void;
  readonly inSidebar?: boolean;
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
  const options = useMemo(
    /** Lists available names without fabricating an installed face for the current typed value. @returns Actual family rows. */
    () => [...new Set([...embeddedFontFamilies, ...fonts])],
    [embeddedFontFamilies, fonts],
  );
  const unavailable =
    embeddedFontFamilies.includes(selected) && fontAvailability[selected] === false;
  return (
    <span className="contents">
      <ComboBox
        resetKey={selected}
        options={options}
        value={selected}
        enabled={enabled}
        label={label}
        getText={
          /** Retains exact native family text. @param name - Family. @returns Text. */
          (name) => name
        }
        getId={
          /** Uses the available family identity. @param name - Family. @returns Identity. */
          (name) => name
        }
        onAccept={
          /** Releases frame focus before final CharFontName dispatch; Tab retains normal focus traversal. @param name - Accepted text. @param release - Whether explicit release is requested. @returns Nothing. */
          (name, release) => {
            if (release) focusDocument?.();
            onSelect(createBrowserFontItem(name));
          }
        }
        onCancel={
          /** Leaves sidebar Escape to the owning deck and releases toolbar focus on cancellation. @returns Whether consumed. */
          () => {
            if (inSidebar) return false;
            focusDocument?.();
            return true;
          }
        }
      />
      {unavailable && unavailableFontMessage !== undefined ? (
        <span role="status" className="text-xs text-amber-700">
          {unavailableFontMessage}
        </span>
      ) : null}
    </span>
  );
}

/** Original editable absolute-size control shared with Writer and Calc. */
export { FontSizeSelect } from "./FontSizeBox";
