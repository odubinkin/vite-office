/** @fileoverview Owns the bounded ODF-to-core length conversion responsibility from pinned xmloff/source/core/xmluconv.cxx. */

import { Converter, type CoreMeasureUnit } from "../../../sax/source/tools/converter";
import * as N from "../../../offapi/com/sun/star/style/NumberingType";
import {
  findNumberingType,
  getNumberingIdentifier,
} from "../../../i18npool/source/defaultnumberingprovider/defaultnumberingprovider";

const standardNumberingTypes = new Map([
  ["1", N.ARABIC],
  ["a", N.CHARS_LOWER_LETTER],
  ["A", N.CHARS_UPPER_LETTER],
  ["i", N.ROMAN_LOWER],
  ["I", N.ROMAN_UPPER],
  ["", N.NUMBER_NONE],
]);

const standardNumberingFormats = new Map<number, string>();
for (const [format, type] of standardNumberingTypes) standardNumberingFormats.set(type, format);
standardNumberingFormats.set(N.CHARS_LOWER_LETTER_N, "a");
standardNumberingFormats.set(N.CHARS_UPPER_LETTER_N, "A");

/** Delegates configured XML core measurement conversion to the SAX converter. */
export class SvXMLUnitConverter {
  /** Captures the owning import's core measurement unit. @param coreUnit - Core unit. @returns Nothing. */
  public constructor(private readonly coreUnit: CoreMeasureUnit) {}

  /** Exports a represented native numbering type. @param type - Native type. @returns XML format. */
  public convertNumFormat(type: number): string;
  /** Imports a represented XML numbering format with native NONE permission. @param type - Output native type. @param format - XML format. @param numberNone - Permit NUMBER_NONE. @returns Conversion success. */
  public convertNumFormat(type: { value: number }, format: string, numberNone?: boolean): boolean;
  /** Imports the original ODF format and alphabetic repetition mode. @param type - Output native type. @param format - XML format. @param letterSync - Original style:num-letter-sync text. @param numberNone - Permit NUMBER_NONE. @returns Conversion success. */
  public convertNumFormat(
    type: { value: number },
    format: string,
    letterSync: string,
    numberNone: boolean,
  ): boolean;
  /** Converts a standard native numbering format and its sibling letter-sync flag. @param type - Native type or output reference. @param format - Import format. @param letterSync - Source flag or earlier empty-format permission. @param numberNone - Permit empty import. @returns Format or conversion success. */
  public convertNumFormat(
    type: number | { value: number },
    format?: string,
    letterSync: string | boolean = "",
    numberNone = false,
  ): string | boolean {
    if (typeof type === "number") {
      const value = standardNumberingFormats.get(type);
      if (value !== undefined) return value;
      return getNumberingIdentifier(type);
    }
    if (format === "" && !(typeof letterSync === "boolean" ? letterSync : numberNone)) return false;
    const value =
      standardNumberingTypes.get(format ?? "") ?? findNumberingType(format ?? "") ?? N.ARABIC;
    type.value = value;
    if (letterSync === "true") {
      if (value === N.CHARS_LOWER_LETTER) type.value = N.CHARS_LOWER_LETTER_N;
      else if (value === N.CHARS_UPPER_LETTER) type.value = N.CHARS_UPPER_LETTER_N;
    }
    return true;
  }

  /** Emits the native true flag only for repeated-letter numbering. @param type - Native numbering type. @returns XML flag or empty. */
  public static convertNumLetterSync(type: number): string {
    return type === N.CHARS_LOWER_LETTER_N || type === N.CHARS_UPPER_LETTER_N ? "true" : "";
  }

  /** Serializes through the configured native core unit to the supported CM XML unit. @param value - Core integer. @returns XML centimetre measure. */
  public convertMeasureToXML(value: number): string {
    return Converter.convertMeasureToXML(value, this.coreUnit);
  }

  /** Converts one XML measure using native failure and range semantics. @param value - XML measure. @param min - Inclusive lower limit. @param max - Inclusive upper limit. @returns Core integer or null on conversion failure. */
  public convertMeasureToCore(value: string, min = -2147483648, max = 2147483647): number | null {
    return Converter.convertMeasure(value, this.coreUnit, min, max);
  }
}

/** Converts one bounded ODF absolute length to Writer twips. @param value - ODF length. @param signed - Whether negative values are allowed. @param label - Error label. @returns Twips. */
export function importOdfLength(value: string, signed: boolean, label: string): number {
  const match = new RegExp(`^(${signed ? "-?" : ""}(?:0|[0-9]+(?:\\.[0-9]+)?))(cm|in|mm|pt)$`).exec(
    value,
  );
  if (match === null) throw new Error(`Unsupported ODF ${label}: ${value}`);
  return new SvXMLUnitConverter("twip").convertMeasureToCore(value) as number;
}

/** Encodes a programmatic style name like SvXMLUnitConverter::encodeStyleName. @param name - Programmatic name. @returns XML style name. */
export function encodeStyleName(name: string): string {
  let encoded = "";
  for (let index = 0; index < name.length; index += 1) {
    const character = name[index] as string;
    const code = character.charCodeAt(0);
    const validAscii =
      (code >= 0x41 && code <= 0x5a) ||
      (code >= 0x61 && code <= 0x7a) ||
      (index > 0 && ((code >= 0x30 && code <= 0x39) || character === "-" || character === "."));
    const validLatin =
      (code >= 0x00c0 && code <= 0x00d6) ||
      (code >= 0x00d8 && code <= 0x00f6) ||
      (code >= 0x00f8 && code <= 0x00fe);
    const forbiddenUnicode =
      (code >= 0xf900 && code <= 0xfffe) || (code >= 0x20dd && code <= 0x20e0);
    const validUnicode =
      code >= 0x00ff &&
      !forbiddenUnicode &&
      (/^[\p{Lu}\p{Ll}\p{Lt}\p{Lo}\p{Nl}]$/u.test(character) ||
        (index > 0 && /^[\p{Mn}\p{Me}\p{Mc}\p{Lm}\p{Nd}]$/u.test(character)) ||
        (code >= 0x02bb && code <= 0x02c1) ||
        code === 0x0559 ||
        code === 0x06e5 ||
        code === 0x06e6 ||
        (index > 0 && code === 0x0387));
    if (validAscii || validLatin || validUnicode) {
      encoded += character;
      continue;
    }
    encoded += `_${code.toString(16)}_`;
  }
  return encoded.length <= 0x7fff ? encoded : name;
}
