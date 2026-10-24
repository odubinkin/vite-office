/** @fileoverview Actual Writer font-family/point-size widgets shared with Calc;the frame supplies selected value,availability and acceptance ports. */
import { useEffect, useMemo, useState, useRef } from "react";
import { ComboBox } from "../../../vcl/browser/ComboBox";
import { FontNamePreview } from "../../../svtools/browser/FontNamePreview";
import { BrowserFontPreviewResources } from "../../../svtools/browser/font-preview-resources";
import { FontList, FALLBACK_FONT_FAMILIES } from "../../../svtools/browser/font-list";
import { createBrowserFontItem } from "./font-item";
import type { SvxFontItem } from "../../../editeng/inc/fontitem";
import {
  getComboBoxMruEntries,
  restoreComboBoxMru,
  updateComboBoxMru,
} from "../../../vcl/browser/combobox-mru";
import { readFontMruEntries, saveFontMruEntries } from "../../../svtools/browser/font-mru-store";
const noEmbeddedFontFamilies: readonly string[] = [];
const noFontAvailability: Readonly<Record<string, boolean>> = Object.freeze({});

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
  const embeddedKey = JSON.stringify(
    embeddedFontFamilies.map(
      /** Watches actual package identity and load availability without treating new array objects as font changes. @param family - Declared embedded family. @returns Source revision fields. */ (
        family,
      ) => [family, fontAvailability[family]],
    ),
  );
  const availabilityIdentity = embeddedFontFamilies.some(
    /** A published font-load record owns a real source revision even when another document uses the same family names. @param family - Declared family. @returns Whether the actual owner published this entry. */ (
      family,
    ) => Object.hasOwn(fontAvailability, family),
  )
    ? fontAvailability
    : noFontAvailability;
  const inventoryIdentity = useMemo(
    /** An actual enable/package transition invalidates the old device snapshot even if it later returns to an earlier value. @returns Current source identity. */ () => ({
      enabled,
      embeddedKey,
      availabilityIdentity,
    }),
    [enabled, embeddedKey, availabilityIdentity],
  );
  const [previewSource, setPreviewSource] = useState<
    Readonly<{
      list: FontList;
      resources: BrowserFontPreviewResources;
      identity: typeof inventoryIdentity;
    }>
  >();
  const [fonts, setFonts] = useState<readonly string[]>(FALLBACK_FONT_FAMILIES);
  const [recent, setRecent] = useState<readonly string[]>([]);
  const recentRows = useRef<readonly string[]>([]),
    hasFontList = useRef(false);
  const selected = String(value ?? "");
  useEffect(
    /** Loads device fonts after mount. @returns Cleanup. */ () => {
      if (!inventoryIdentity.enabled) return;
      let active = true;
      const resources = new BrowserFontPreviewResources();
      void FontList.FromBrowser().then(
        /** Publishes the font list. @param fontList - Loaded fonts. @returns Nothing. */ (
          fontList,
        ) => {
          if (active) {
            const current = getComboBoxMruEntries(recentRows.current);
            const restored = restoreComboBoxMru(
              current.length === 0 ? readFontMruEntries() : current,
              fontList.GetFontNames(),
            );
            recentRows.current = restored;
            setRecent(restored);
            hasFontList.current = true;
            setFonts(fontList.GetFontNames());
            setPreviewSource({ list: fontList, resources, identity: inventoryIdentity });
          }
        },
      );
      return /** Prevents stale publication. @returns Nothing. */ () => {
        active = false;
        resources.dispose();
      };
    },
    [inventoryIdentity],
  );
  useEffect(
    /** Saves this actual populated widget on React teardown or native browser page teardown. @returns Listener removal and actual unmount save. */ () => {
      const save =
        /** Reads current widget rows,not an earlier render snapshot. @returns Nothing. */ () => {
          if (hasFontList.current) saveFontMruEntries(getComboBoxMruEntries(recentRows.current));
        };
      window.addEventListener("pagehide", save);
      return /** Removes the host listener and persists the actual widget state. @returns Nothing. */ () => {
        window.removeEventListener("pagehide", save);
        save();
      };
    },
    [],
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
        mruOptions={recent}
        value={selected}
        enabled={enabled}
        label={label}
        renderItem={
          /** Uses the original FontNameBox painter for actual acquired physical data. @param name - Logical family. @param selectedRow - Actual combo selection. @returns Readable source preview row. */ (
            name,
            selectedRow,
          ) => (
            <FontNamePreview
              family={name}
              selected={selectedRow}
              source={previewSource?.identity === inventoryIdentity ? previewSource : undefined}
            />
          )
        }
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
            // Native GTK updates history after entry activation/direct pick,not Tab or travel.
            if (release) {
              const next = updateComboBoxMru(recentRows.current, name, 5);
              recentRows.current = next;
              setRecent(next);
            }
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
