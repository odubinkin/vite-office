/** @fileoverview Structured transfer of native theme values between browser realms. */
import { Color, ColorTransparency } from "../../tools/inc/color";
import { ColorSet } from "../inc/theme/ColorSet";
import { FontScheme, Theme, type ThemeFont, type ThemeFontScript } from "../inc/theme/Theme";
import { convertToThemeColorType, ThemeColorType } from "../inc/theme/ThemeColorType";

/** Plain transport of the represented theme and its ordered entries. */
export interface ThemeRecord {
  readonly name: string;
  readonly colors?: {
    readonly name: string;
    readonly entries: readonly (readonly [ThemeColorType, number])[];
  };
  readonly fontScheme: {
    readonly name: string;
    readonly major: readonly (readonly [ThemeFontScript, ThemeFont])[];
    readonly minor: readonly (readonly [ThemeFontScript, ThemeFont])[];
    readonly majorSupplemental: FontScheme["majorSupplemental"];
    readonly minorSupplemental: FontScheme["minorSupplemental"];
  };
}

/** Captures the theme before transferring an isolated graph. @param theme - Actual document theme. @returns Copied record. */
export function encodeTheme(theme: Theme): ThemeRecord {
  const scheme = theme.fontScheme;
  const colors = theme.colorSet;
  const entries: [ThemeColorType, number][] = [];
  if (colors)
    for (let index = 0; index <= ThemeColorType.LAST; ++index) {
      const type = convertToThemeColorType(index);
      const color = colors.findColor(type);
      if (color) entries.push([type, color.toUInt32()]);
    }
  return {
    name: theme.name,
    ...(colors ? { colors: { name: colors.name, entries } } : {}),
    fontScheme: {
      name: scheme.name,
      major: [...scheme.majorFont].map(
        /** Copies an individual primary entry. @param pair - Font record. @returns Independent primary entry. */
        ([script, font]) => [script, { ...font }],
      ),
      minor: [...scheme.minorFont].map(
        /** Copies an individual primary entry. @param pair - Font record. @returns Independent primary entry. */
        ([script, font]) => [script, { ...font }],
      ),
      majorSupplemental: scheme.majorSupplemental.map(copySupplemental),
      minorSupplemental: scheme.minorSupplemental.map(copySupplemental),
    },
  };
}

/** Copies one supplemental font. @param font - Actual supplemental font. @returns Independent record. */
function copySupplemental(font: { script: string; typeface: string }): {
  script: string;
  typeface: string;
} {
  return { script: font.script, typeface: font.typeface };
}

/** Restores the true theme from typed graph data. @param record - Captured theme. @returns Native model. */
export function decodeTheme(record: ThemeRecord): Theme {
  if (typeof record?.name !== "string" || typeof record.fontScheme?.name !== "string")
    throw new Error("Stored document theme is invalid.");
  const theme = new Theme(record.name);
  const source = record.fontScheme;
  const fonts = new FontScheme(source.name);
  for (const [entries, output] of [
    [source.major, fonts.majorFont],
    [source.minor, fonts.minorFont],
  ] as const) {
    if (!Array.isArray(entries)) throw new Error("Stored theme font collection is invalid.");
    for (const [script, font] of entries) {
      if (
        (script !== "latin" && script !== "ea" && script !== "cs") ||
        typeof font?.typeface !== "string" ||
        typeof font.panose !== "string" ||
        !Number.isInteger(font.pitchFamily) ||
        !Number.isInteger(font.charset)
      )
        throw new Error("Stored theme font is invalid.");
      output.set(script, { ...font });
    }
  }
  for (const [entries, output] of [
    [source.majorSupplemental, fonts.majorSupplemental],
    [source.minorSupplemental, fonts.minorSupplemental],
  ] as const) {
    if (!Array.isArray(entries)) throw new Error("Stored supplemental font collection is invalid.");
    for (const entry of entries) {
      if (typeof entry?.script !== "string" || typeof entry.typeface !== "string")
        throw new Error("Stored supplemental font is invalid.");
      output.push(copySupplemental(entry));
    }
  }
  theme.fontScheme = fonts;
  if (record.colors) {
    if (typeof record.colors.name !== "string" || !Array.isArray(record.colors.entries))
      throw new Error("Stored theme color set is invalid.");
    const colors = new ColorSet(record.colors.name);
    for (const [type, value] of record.colors.entries) {
      if (
        type < 0 ||
        type > ThemeColorType.LAST ||
        !Number.isInteger(type) ||
        !Number.isInteger(value) ||
        value < 0 ||
        value > 0xffffffff
      )
        throw new Error("Stored theme color is invalid.");
      colors.add(type, new Color(ColorTransparency, value, "ColorTransparencyTag"));
    }
    theme.colorSet = colors;
  }
  return theme;
}
