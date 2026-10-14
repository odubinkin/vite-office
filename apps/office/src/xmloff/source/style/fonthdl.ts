/** @fileoverview Native fonthdl.cxx font-family generic mapping at the existing browser string/enum boundary; no substitute font or UNO descriptor provider. */
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
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
