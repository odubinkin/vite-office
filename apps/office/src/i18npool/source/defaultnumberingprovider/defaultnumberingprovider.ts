/** @fileoverview Decimal-zero identifiers and formatting from LibreOffice's DefaultNumberingProvider. */

import * as N from "../../../offapi/com/sun/star/style/NumberingType";

const decimalZeroWidths = new Map<number, number>([
  [N.ARABIC_ZERO, 2],
  [N.ARABIC_ZERO3, 3],
  [N.ARABIC_ZERO4, 4],
  [N.ARABIC_ZERO5, 5],
]);

/** Formats a decimal-zero type using its native minimum width. @param type - UNO numbering type. @param value - Positive numbering value. @returns Marker or undefined for other families. */
export function formatArabicZero(type: number, value: number): string | undefined {
  const width = decimalZeroWidths.get(type);
  return width === undefined ? undefined : String(value).padStart(width, "0");
}

const supportedTypes = new Map<string, number>();
for (const type of decimalZeroWidths.keys()) {
  const samples = [1, 2, 3].map(
    /** Formats one number in the source identifier. @param value - Sample value. @returns Decimal marker. */
    (value) => formatArabicZero(type, value),
  );
  const identifier = samples.join(", ") + ", ...";
  supportedTypes.set(identifier, type);
}

/** Returns the provider identifier for a supported extended numbering type. @param type - UNO numbering type. @returns Identifier or an empty string. */
export function getNumberingIdentifier(type: number): string {
  for (const [identifier, candidate] of supportedTypes) if (candidate === type) return identifier;
  return "";
}

/** Looks up an extended numbering identifier. @param identifier - Provider identifier. @returns UNO type when supported. */
export function findNumberingType(identifier: string): number | undefined {
  return supportedTypes.get(identifier);
}

const romanSymbols = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
] as const;

/** Formats the locale-independent Roman and Latin numbering types. @param type - Native UNO numbering type. @param value - Positive numbering value. @returns Marker or undefined for other types. */
export function formatLatinNumber(type: number, value: number): string | undefined {
  if (type === N.ROMAN_UPPER || type === N.ROMAN_LOWER) {
    let output = "";
    for (const [magnitude, symbol] of romanSymbols) {
      output += symbol.repeat(Math.floor(value / magnitude));
      value %= magnitude;
    }
    return type === N.ROMAN_LOWER ? output.toLowerCase() : output;
  }
  switch (type) {
    case N.CHARS_UPPER_LETTER_N:
    case N.CHARS_LOWER_LETTER_N: {
      const base = type === N.CHARS_UPPER_LETTER_N ? 65 : 97;
      return String.fromCharCode(base + ((value - 1) % 26)).repeat(Math.ceil(value / 26));
    }
    case N.CHARS_UPPER_LETTER:
    case N.CHARS_LOWER_LETTER: {
      const base = type === N.CHARS_UPPER_LETTER ? 65 : 97;
      let output = "";
      while (value > 0) {
        value--;
        output = String.fromCharCode(base + (value % 26)) + output;
        value = Math.floor(value / 26);
      }
      return output;
    }
    default:
      return undefined;
  }
}
