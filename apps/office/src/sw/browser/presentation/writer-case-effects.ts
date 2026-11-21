/** @fileoverview Projects native character case effects without replacing editable text. */
import { SvxCaseMap } from "../../../editeng/inc/svxenum";

/** Returns the platform style for a uniform native case effect. @param mode - Effective case item. @returns Character rendering style. */
export function browserCaseStyle(mode: SvxCaseMap | undefined) {
  switch (mode) {
    case SvxCaseMap.Uppercase:
      return { textTransform: "uppercase" } as const;
    case SvxCaseMap.Lowercase:
      return { textTransform: "lowercase" } as const;
    case SvxCaseMap.SmallCaps:
      return { fontVariantCaps: "small-caps" } as const;
    default:
      return undefined;
  }
}

/** Finds the UTF-16 units selected by the native title-case scan. @param value - Original text. @param preceding - Previous UTF-16 unit when available. @returns Original text and first units to paint in uppercase. */
export function getTitleCaseParts(
  value: string,
  preceding: string | undefined,
): readonly Readonly<{ text: string; uppercase: boolean }>[] {
  const parts: { text: string; uppercase: boolean }[] = [];
  let end = 0;
  for (const match of value.matchAll(/(^|[ \t]+)([^ \t])/gu)) {
    const [, blank = "", initial = ""] = match;
    const offset = match.index + blank.length;
    if (offset === 0 && preceding !== undefined && preceding !== " " && preceding !== "\t")
      continue;
    // The source maps one UTF-16 unit at a time, so a supplementary code point stays whole.
    if (initial.length !== 1) continue;
    if (end < offset) parts.push({ text: value.slice(end, offset), uppercase: false });
    parts.push({ text: initial, uppercase: true });
    end = offset + 1;
  }
  if (end < value.length) parts.push({ text: value.slice(end), uppercase: false });
  return parts;
}
