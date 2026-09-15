/** @fileoverview Ports Writer's script/language default-font policy from DocumentStylePoolManager.cxx. */

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
}

const fallbackFamilies: Readonly<
  Record<WriterDefaultFontType, Readonly<Record<WriterFontScript, string>>>
> = {
  fixed: { cjk: "Noto Sans Mono CJK", ctl: "Noto Sans Mono", western: "Liberation Mono" },
  heading: { cjk: "Noto Sans CJK", ctl: "Noto Sans Arabic", western: "Liberation Sans" },
  text: { cjk: "Noto Sans CJK", ctl: "Noto Naskh Arabic", western: "Liberation Serif" },
};

/** Selects one document default, mirroring OutputDevice::GetDefaultFont(..., OnlyOne). @param device - Optional output-device resolver. @param type - Requested font role. @param language - IETF language tag. @param script - Writer script slot. @returns Resolved family. */
export function getDefaultFont(
  device: DefaultFontDevice | undefined,
  type: WriterDefaultFontType,
  language: string,
  script: WriterFontScript,
): string {
  const resolved = device?.getDefaultFont(type, language, script)?.trim();
  return resolved === undefined || resolved.length === 0
    ? fallbackFamilies[type][script]
    : resolved;
}

/** Maps an IETF language tag to Writer's three script default slots. @param language - IETF language tag. @returns Writer script slot. */
export function getWriterFontScript(language: string): WriterFontScript {
  const primary = language.toLowerCase().split("-")[0] as string;
  if (["ar", "fa", "he", "ur", "ps", "sd", "ug"].includes(primary)) return "ctl";
  if (["zh", "ja", "ko"].includes(primary)) return "cjk";
  return "western";
}
