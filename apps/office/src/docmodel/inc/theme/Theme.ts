/** @fileoverview Represented document-model theme values and source FontScheme defaults. */
import type { ColorSet } from "./ColorSet";

/** A major or minor ThemeFont record in the active font collection. */
export interface ThemeFont {
  typeface: string;
  panose: string;
  pitchFamily: number;
  charset: number;
}

/** The XML collection keys map to the original Latin, Asian and complex-script theme entries. */
export type ThemeFontCollection = "majorFont" | "minorFont";
/** Original primary entries in each collection. */
export type ThemeFontScript = "latin" | "ea" | "cs";

/** Original theme font scheme with primary and supplemental declarations. */
export class FontScheme {
  readonly majorFont = new Map<ThemeFontScript, ThemeFont>();
  readonly minorFont = new Map<ThemeFontScript, ThemeFont>();
  readonly majorSupplemental: { script: string; typeface: string }[] = [];
  readonly minorSupplemental: { script: string; typeface: string }[] = [];

  /** Uses the original Office name for a default-constructed scheme. @param name - Source name. @returns Font scheme. */
  constructor(readonly name = "Office") {}

  /** Creates the model Theme's original default Latin and Asian/complex font entries. @returns Native default font scheme. */
  static getDefault(): FontScheme {
    const scheme = new FontScheme();
    for (const collection of [scheme.majorFont, scheme.minorFont])
      for (const script of ["latin", "ea", "cs"] as const)
        collection.set(script, {
          typeface: script === "latin" ? "Arial" : "DejaVu Sans",
          panose: "",
          pitchFamily: 0,
          charset: 1,
        });
    return scheme;
  }
}

/** Document-level theme shared with format filters. */
export class Theme {
  colorSet: ColorSet | undefined;
  fontScheme = FontScheme.getDefault();

  /** Initial theme name from the owning format. @param name - Original theme name. @returns Theme. */
  constructor(readonly name = "") {}
}
