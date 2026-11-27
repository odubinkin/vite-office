/** @fileoverview Browser resources and UserColors settings for the native Area palette. */
import chart from "../../../extras/source/palettes/chart-palettes.soc?raw";
import compatibility from "../../../extras/source/palettes/compatibility.soc?raw";
import freecolour from "../../../extras/source/palettes/freecolour-hlc.soc?raw";
import html from "../../../extras/source/palettes/html.soc?raw";
import libreoffice from "../../../extras/source/palettes/libreoffice.soc?raw";
import material from "../../../extras/source/palettes/material.soc?raw";
import standard from "../../../extras/source/palettes/standard.soc?raw";
import tonal from "../../../extras/source/palettes/tonal.soc?raw";

import type { Color } from "../../../tools/inc/color";

/** A palette entry stores its visible name and the browser RGB value. */
export type NamedColor = Readonly<{ name: string; rgb: string }>;

const systemPalettes = {
  "Chart Palettes": chart,
  Compatibility: compatibility,
  "Freecolour HLC": freecolour,
  HTML: html,
  LibreOffice: libreoffice,
  Material: material,
  Standard: standard,
  Tonal: tonal,
};

/** Name of an installed system color table. */
export type PaletteName = keyof typeof systemPalettes;
/** Ordered names of the installed SOC resources. */
export const paletteNames = Object.keys(systemPalettes) as PaletteName[];

const palettePreference = "org.openoffice.Office.Common/UserColors/PaletteName";
const recentPreference = "org.openoffice.Office.Common/UserColors/RecentColors";
const maxRecentColors = 12;
const parsedPalettes = new Map<PaletteName, readonly NamedColor[]>();

/** Reads a suite-installed SOC resource using browser XML parsing. @param palette - Selected palette. @returns Source names and RGB values in order. */
export function getPaletteColors(palette: PaletteName): readonly NamedColor[] {
  const cached = parsedPalettes.get(palette);
  if (cached) return cached;
  const xml = new DOMParser().parseFromString(systemPalettes[palette], "application/xml");
  const drawNamespace = xml.documentElement.lookupNamespaceURI("draw");
  const entries = Array.from(
    xml.getElementsByTagNameNS(drawNamespace, "color"),
    /** Reads the native entry attributes. @param color - Source palette node. @returns Named swatch. */
    (color) => ({
      name: color.getAttributeNS(drawNamespace, "name") ?? "",
      rgb: color.getAttributeNS(drawNamespace, "color")?.toLowerCase() ?? "",
    }),
  );
  parsedPalettes.set(palette, entries);
  return entries;
}

/** Resolves the UserColors palette preference or its native Standard default. @returns Installed palette. */
export function getPaletteName(): PaletteName {
  const value = readPreference(palettePreference) as PaletteName | null;
  return value && paletteNames.includes(value) ? value : "Standard";
}

/** Records the palette preferred by the user. @param name - Installed palette. @returns Nothing. */
export function setPaletteName(name: PaletteName): void {
  writePreference(palettePreference, name);
}

/** Reads recent colors from the same office profile as the palette preference. @returns Stored colors in recent order. */
export function getRecentColors(): readonly NamedColor[] {
  let value: unknown;
  try {
    value = JSON.parse(readPreference(recentPreference) ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(value)) return [];
  return value.filter(
    /** Validates a stored named color. @param entry - Profile value. @returns Whether the value is a swatch. */
    (entry): entry is NamedColor =>
      typeof entry?.name === "string" &&
      typeof entry.rgb === "string" &&
      /^#[0-9a-f]{6}$/u.test(entry.rgb),
  );
}

/** Saves a color exchanged by the native page as a unique most-recent entry. @param color - Exchanged native color. @param preset - Selected palette entry name if present. @returns Nothing. */
export function addRecentColor(color: Readonly<Color>, preset?: string): void {
  const rgb = `#${(color.toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
  const others = getRecentColors().filter(
    /** Excludes any prior instance of this RGB. @param entry - Existing swatch. @returns Whether to keep it. */
    (entry) => entry.rgb !== rgb,
  );
  const recent = { name: preset ?? rgb.toUpperCase(), rgb };
  writePreference(recentPreference, JSON.stringify([recent, ...others].slice(0, maxRecentColors)));
}

/** Reads a browser profile value even when storage is denied. @param name - Native settings identity. @returns Stored preference. */
function readPreference(name: string): string | null {
  try {
    return globalThis.localStorage.getItem(name);
  } catch {
    return null;
  }
}

/** Writes a browser profile value where storage is available. @param name - Native settings identity. @param value - Serialized settings. @returns Nothing. */
function writePreference(name: string, value: string): void {
  try {
    globalThis.localStorage.setItem(name, value);
  } catch {
    // Palette choices remain available for the open dialog when storage is disabled.
  }
}
