/** @fileoverview Native fonthdl.cxx font-family generic mapping at the existing browser string/enum boundary; no substitute font or UNO descriptor provider. */
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import { Converter } from "../../../sax/source/tools/converter";
import { RTL_TEXTENCODING_SYMBOL, type rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";

/** Native five-member text font description before the application item pool. */
export interface XMLTextFont {
  familyName: string;
  styleName: string;
  family: FontFamily;
  pitch: FontPitch;
  charSet: rtl_TextEncoding;
}

/** Converts the original comma-separated XML family list to the native semicolon form. @param input - Lexical XML value. @returns Native family list. */
export function importFamilyName(input: string): string {
  const families: string[] = [];
  let position = 0;
  while (position <= input.length) {
    const comma = Converter.indexOfComma(input, position);
    let family = input.slice(position, comma === -1 ? undefined : comma).replace(/^ +| +$/gu, "");
    const quote = family[0];
    if (family.length >= 2 && (quote === "'" || quote === '"') && family.endsWith(quote))
      family = family.slice(1, -1);
    if (family.length > 0) families.push(family);
    if (comma === -1) break;
    position = comma + 1;
  }
  return families.join(";");
}

/** Converts the native semicolon family list to the original ODF quoting. @param familyName - Native family list. @returns XML family list. */
export function exportFamilyName(familyName: string): string {
  const families: string[] = [];
  for (const component of familyName.split(";")) {
    const family = component.replace(/^ +| +$/gu, "");
    if (family.length > 0) families.push(/[ ,]/u.test(family) ? `'${family}'` : family);
  }
  return families.join(", ");
}

/** Original lcl_getFontFamilyGenericMapping entries and declaration order, excluding the native sentinel from the browser lookup domain. */
const fontFamilyGenericMapping = [
  ["decorative", FontFamily.FAMILY_DECORATIVE],
  ["modern", FontFamily.FAMILY_MODERN],
  ["roman", FontFamily.FAMILY_ROMAN],
  ["script", FontFamily.FAMILY_SCRIPT],
  ["swiss", FontFamily.FAMILY_SWISS],
  ["system", FontFamily.FAMILY_SYSTEM],
] as const;
/** Applies the original enum table to imported ODF metadata; missing/invalid metadata leaves the unknown family value used by callers. @param generic - ODF token. @returns Native family enum. */
export function getFontFamilyFromGeneric(generic: string | undefined): FontFamily {
  return (
    fontFamilyGenericMapping.find(
      /** Finds a native input token. @param entry - Mapping pair. @returns Token equality. */ ([
        name,
      ]) => name === generic,
    )?.[1] ?? FontFamily.FAMILY_DONTKNOW
  );
}
/** Applies the same native table to export/presentation; unknown/native-sentinel values have no ODF token. @param family - Native family. @returns ODF generic token if mapped. */
export function getFontFamilyGeneric(family: FontFamily): string | undefined {
  const value = (family << 16) >> 16;
  return fontFamilyGenericMapping.find(
    /** Finds a native output enum. @param entry - Mapping pair. @returns Enum equality. */ ([
      ,
      mapped,
    ]) => mapped === value,
  )?.[0];
}

/** Applies the original fixed/variable pitch table; unknown is omitted and other native enum values use the original export fallback fixed. @param pitch - Native pitch. @returns ODF pitch or no attribute. */
export function getFontPitchGeneric(pitch: FontPitch): string | undefined {
  const value = (pitch << 16) >> 16;
  return value === FontPitch.PITCH_DONTKNOW
    ? undefined
    : value === FontPitch.PITCH_VARIABLE
      ? "variable"
      : "fixed";
}
/** Applies the original pitch import table, leaving unknown for absent/unmapped input. @param pitch - ODF pitch. @returns Native value. */
export function getFontPitchFromGeneric(pitch: string | undefined): FontPitch {
  return pitch === "fixed"
    ? FontPitch.PITCH_FIXED
    : pitch === "variable"
      ? FontPitch.PITCH_VARIABLE
      : FontPitch.PITCH_DONTKNOW;
}

/** Builds the native fallback XML members of one script. @param font - Original font values. @param suffix - Original script suffix. @returns Qualified attributes. */
export function exportInlineFont(
  font: Readonly<XMLTextFont>,
  suffix: "" | "-asian" | "-complex",
): readonly (readonly [string, string])[] {
  const attributes: [string, string][] = [];
  const familyName = exportFamilyName(font.familyName);
  if (familyName)
    attributes.push([suffix === "" ? "fo:font-family" : `style:font-family${suffix}`, familyName]);
  if (font.styleName) attributes.push([`style:font-style-name${suffix}`, font.styleName]);
  const generic = getFontFamilyGeneric(font.family);
  if (generic) attributes.push([`style:font-family-generic${suffix}`, generic]);
  const pitch = getFontPitchGeneric(font.pitch);
  if (pitch) attributes.push([`style:font-pitch${suffix}`, pitch]);
  if (font.charSet === RTL_TEXTENCODING_SYMBOL)
    attributes.push([`style:font-charset${suffix}`, "x-symbol"]);
  return attributes;
}
