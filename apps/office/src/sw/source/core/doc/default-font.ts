/** @fileoverview Ports Writer's script/language default-font policy from DocumentStylePoolManager.cxx. */

import { DefaultFontType } from "../../../../unotools/inc/fontdefs";

/** Writer scripts addressed by the three default-font item slots. */
export type WriterFontScript = "western" | "cjk" | "ctl";

/** The Writer font classes requested from an injected output-device adapter. */
export type WriterDefaultFontType = "text" | "heading" | "fixed";

/** Narrow output-device contract; browser font discovery remains in vcl/browser. */
export interface DefaultFontDevice {
  /** Returns a usable family for one Writer request, or undefined when unavailable. */
  getDefaultFont(
    type: WriterDefaultFontType,
    language: string,
    script: WriterFontScript,
  ): string | undefined;
  /** Measures the selected physical font height in document twips for filter output. */
  measureTextHeight?(family: string, heightTwips: number): number;
}

const fallbackFamilies: Readonly<
  Record<WriterDefaultFontType, Readonly<Record<WriterFontScript, string>>>
> = {
  fixed: { cjk: "Noto Sans Mono CJK", ctl: "Noto Sans Mono", western: "Liberation Mono" },
  heading: { cjk: "Noto Sans CJK", ctl: "Noto Sans Arabic", western: "Liberation Sans" },
  text: { cjk: "Noto Sans CJK", ctl: "Noto Naskh Arabic", western: "Liberation Serif" },
};

/** Separates the document value from the output-device substitution. */
export interface WriterDefaultFontSelection {
  readonly requestedFamily: string;
  readonly resolvedFamily: string;
}

/** Selects the serialized Writer default and its current device resolution independently. @param device - Optional output-device resolver. @param type - Requested font role. @param language - IETF language tag. @param script - Writer script slot. @returns Requested and resolved families. */
export function getDefaultFontSelection(
  device: DefaultFontDevice | undefined,
  type: WriterDefaultFontType,
  language: string,
  script: WriterFontScript,
): WriterDefaultFontSelection {
  const requestedFamily = fallbackFamilies[type][script];
  const deviceFamily = device?.getDefaultFont(type, language, script)?.trim();
  return {
    requestedFamily,
    resolvedFamily:
      deviceFamily === undefined || deviceFamily.length === 0 ? requestedFamily : deviceFamily,
  };
}

/** Selects one document default, mirroring OutputDevice::GetDefaultFont(..., OnlyOne). @param device - Optional output-device resolver. @param type - Requested font role. @param language - IETF language tag. @param script - Writer script slot. @returns Resolved family. */
export function getDefaultFont(
  device: DefaultFontDevice | undefined,
  type: WriterDefaultFontType,
  language: string,
  script: WriterFontScript,
): string {
  return getDefaultFontSelection(device, type, language, script).resolvedFamily;
}

/** Maps an IETF language tag to Writer's three script default slots. @param language - IETF language tag. @returns Writer script slot. */
export function getWriterFontScript(language: string): WriterFontScript {
  const primary = language.toLowerCase().split("-")[0] as string;
  if (["ar", "fa", "he", "ur", "ps", "sd", "ug"].includes(primary)) return "ctl";
  if (["zh", "ja", "ko"].includes(primary)) return "cjk";
  return "western";
}

/** Selects the language used for one script-specific default slot. @param documentLocale - Document locale. @param script - Requested Writer script. @returns Locale for default-font lookup. */
export function getWriterDefaultFontLanguage(
  documentLocale: string,
  script: WriterFontScript,
): string {
  return getWriterFontScript(documentLocale) === script
    ? documentLocale
    : { cjk: "zh-CN", ctl: "ar-SA", western: "en-US" }[script];
}

/** Original DocumentStylePoolManager text/heading script roles and the single FIXED role applied to all scripts. @param type - Writer role. @param script - Script slot. @returns Native role ID. */
export function getWriterDefaultFontType(
  type: WriterDefaultFontType,
  script: WriterFontScript,
): DefaultFontType {
  if (type === "fixed") return DefaultFontType.FIXED;
  const types = {
    text: {
      western: DefaultFontType.LATIN_TEXT,
      cjk: DefaultFontType.CJK_TEXT,
      ctl: DefaultFontType.CTL_TEXT,
    },
    heading: {
      western: DefaultFontType.LATIN_HEADING,
      cjk: DefaultFontType.CJK_HEADING,
      ctl: DefaultFontType.CTL_HEADING,
    },
  };
  return types[type][script];
}
