/** @fileoverview The consumed font cases of XMLTextImportPropertyMapper and its five-member defaulting contract. */
import type { FastAttributeList } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  type rtl_TextEncoding,
} from "../../../sal/inc/rtl/textenc";
import {
  getFontFamilyFromGeneric,
  getFontPitchFromGeneric,
  importFamilyName,
  type XMLTextFont,
} from "../style/fonthdl";

/** Original font-name special item followed by the five mapped members, per script. */
export const textFontProperties = [
  [
    T.STYLE_FONT_NAME,
    T.FO_FONT_FAMILY,
    T.STYLE_FONT_STYLE_NAME,
    T.STYLE_FONT_FAMILY_GENERIC,
    T.STYLE_FONT_PITCH,
    T.STYLE_FONT_CHARSET,
  ],
  [
    T.STYLE_FONT_NAME_ASIAN,
    T.STYLE_FONT_FAMILY_ASIAN,
    T.STYLE_FONT_STYLE_NAME_ASIAN,
    T.STYLE_FONT_FAMILY_GENERIC_ASIAN,
    T.STYLE_FONT_PITCH_ASIAN,
    T.STYLE_FONT_CHARSET_ASIAN,
  ],
  [
    T.STYLE_FONT_NAME_COMPLEX,
    T.STYLE_FONT_FAMILY_COMPLEX,
    T.STYLE_FONT_STYLE_NAME_COMPLEX,
    T.STYLE_FONT_FAMILY_GENERIC_COMPLEX,
    T.STYLE_FONT_PITCH_COMPLEX,
    T.STYLE_FONT_CHARSET_COMPLEX,
  ],
] as const;

/** Fills one script's members in SAX order and supplies native defaults when a family survives. @param attributes - Text properties. @param group - Native script association. @param findFont - ODF font-face declaration resolver. @param defaultEncoding - Platform encoding used for missing charset. @param missingFont - Optional unresolved reference diagnostic. @returns Complete members or absence. */
export function importTextFont(
  attributes: FastAttributeList,
  group: (typeof textFontProperties)[number],
  findFont: (name: string) => Readonly<XMLTextFont> | undefined,
  defaultEncoding: rtl_TextEncoding,
  missingFont?: (name: string) => void,
): XMLTextFont | undefined {
  const [reference, familyName, styleName, family, pitch, charSet] = group;
  const font: XMLTextFont = {
    familyName: "",
    styleName: "",
    family: FontFamily.FAMILY_DONTKNOW,
    pitch: FontPitch.PITCH_DONTKNOW,
    charSet: defaultEncoding,
  };
  let hasCharSet = false;
  for (const [token, input] of attributes) {
    switch (token) {
      case reference: {
        const face = findFont(input);
        if (face === undefined) missingFont?.(input);
        else {
          Object.assign(font, face);
          hasCharSet = true;
        }
        break;
      }
      case familyName: {
        const names = importFamilyName(input);
        if (names !== "") font.familyName = names;
        break;
      }
      case styleName:
        font.styleName = input;
        break;
      case family: {
        const value = getFontFamilyFromGeneric(input);
        if (value !== FontFamily.FAMILY_DONTKNOW) font.family = value;
        break;
      }
      case pitch: {
        const value = getFontPitchFromGeneric(input);
        if (value !== FontPitch.PITCH_DONTKNOW) font.pitch = value;
        break;
      }
      case charSet:
        if (input === "x-symbol") font.charSet = RTL_TEXTENCODING_SYMBOL;
        else if (!hasCharSet) font.charSet = RTL_TEXTENCODING_DONTKNOW;
        hasCharSet = true;
        break;
    }
  }
  return font.familyName === "" ? undefined : font;
}
