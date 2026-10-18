/** @fileoverview Both original ConvertFontSlant overloads, with explicit erased-enum source selection for JS numbers. */
import { FontWeight as NativeWeight } from "../../../tools/inc/fontenum";
import { FontWeight as WireWeight } from "../../../offapi/com/sun/star/awt/FontWeight";
import { FontItalic as I } from "../../../tools/inc/fontenum";
import { FontSlant as S } from "../../../offapi/com/sun/star/awt/FontSlant";
/** Original FontItalic-to-FontSlant overload. @param value - Native italic enum. @param from - Erased native enum family. @returns Slant. */
export function ConvertFontSlant(value: I, from: "FontItalic"): S;
/** Original FontSlant-to-FontItalic overload. @param value - Native slant enum. @param from - Erased native enum family. @returns Italic. */
export function ConvertFontSlant(value: S, from: "FontSlant"): I;
/** Explicit overload selector avoids guessing from overlapping numeric enum values. @param value - Enum payload. @param from - Native source family. @returns Converted enum. */
export function ConvertFontSlant(value: I | S, from: "FontItalic" | "FontSlant"): I | S {
  if (from === "FontItalic") {
    let result = S.DONTKNOW;
    switch (value) {
      case I.ITALIC_NONE:
        result = S.NONE;
        break;
      case I.ITALIC_OBLIQUE:
        result = S.OBLIQUE;
        break;
      case I.ITALIC_NORMAL:
        result = S.ITALIC;
        break;
      case I.ITALIC_DONTKNOW:
        result = S.DONTKNOW;
        break;
      case I.FontItalic_FORCE_EQUAL_SIZE:
        result = S.MAKE_FIXED_SIZE;
        break;
    }
    return result;
  }
  let result = I.ITALIC_DONTKNOW;
  switch (value) {
    case S.NONE:
      result = I.ITALIC_NONE;
      break;
    case S.OBLIQUE:
      result = I.ITALIC_OBLIQUE;
      break;
    case S.ITALIC:
      result = I.ITALIC_NORMAL;
      break;
    case S.DONTKNOW:
      result = I.ITALIC_DONTKNOW;
      break;
    case S.REVERSE_OBLIQUE:
      result = I.ITALIC_OBLIQUE;
      break;
    case S.REVERSE_ITALIC:
      result = I.ITALIC_NORMAL;
      break;
    case S.MAKE_FIXED_SIZE:
      result = I.FontItalic_FORCE_EQUAL_SIZE;
      break;
  }
  return result;
}

/** Original native-enum-to-float overload. @param value - Native enum. @param from - Erased input family. @returns UNO float weight. */
export function ConvertFontWeight(value: NativeWeight, from: "FontWeight"): number;
/** Original float-to-native-enum overload. @param value - Native float input. @param from - Erased input family. @returns Native weight. */
export function ConvertFontWeight(value: number, from: "float"): NativeWeight;
/** Original ordered comparisons and float parameter rounding; explicit source selector avoids guessing from numeric value. @param value - Input scalar. @param from - Native overload family. @returns Converted weight. */
export function ConvertFontWeight(value: number, from: "FontWeight" | "float"): number {
  if (from === "FontWeight") {
    if (value === NativeWeight.WEIGHT_DONTKNOW) return WireWeight.DONTKNOW;
    else if (value === NativeWeight.WEIGHT_THIN) return WireWeight.THIN;
    else if (value === NativeWeight.WEIGHT_ULTRALIGHT) return WireWeight.ULTRALIGHT;
    else if (value === NativeWeight.WEIGHT_LIGHT) return WireWeight.LIGHT;
    else if (value === NativeWeight.WEIGHT_SEMILIGHT) return WireWeight.SEMILIGHT;
    else if (value === NativeWeight.WEIGHT_NORMAL) return WireWeight.NORMAL;
    else if (value === NativeWeight.WEIGHT_MEDIUM) return WireWeight.MEDIUM;
    else if (value === NativeWeight.WEIGHT_SEMIBOLD) return WireWeight.SEMIBOLD;
    else if (value === NativeWeight.WEIGHT_BOLD) return WireWeight.BOLD;
    else if (value === NativeWeight.WEIGHT_ULTRABOLD) return WireWeight.ULTRABOLD;
    else if (value === NativeWeight.WEIGHT_BLACK) return WireWeight.BLACK;
    return WireWeight.DONTKNOW;
  }
  const weight = Math.fround(value);
  if (weight <= WireWeight.DONTKNOW) return NativeWeight.WEIGHT_DONTKNOW;
  else if (weight <= WireWeight.THIN) return NativeWeight.WEIGHT_THIN;
  else if (weight <= WireWeight.ULTRALIGHT) return NativeWeight.WEIGHT_ULTRALIGHT;
  else if (weight <= WireWeight.LIGHT) return NativeWeight.WEIGHT_LIGHT;
  else if (weight <= WireWeight.SEMILIGHT) return NativeWeight.WEIGHT_SEMILIGHT;
  else if (weight <= WireWeight.NORMAL) return NativeWeight.WEIGHT_NORMAL;
  else if (weight <= WireWeight.MEDIUM) return NativeWeight.WEIGHT_MEDIUM;
  else if (weight <= WireWeight.SEMIBOLD) return NativeWeight.WEIGHT_SEMIBOLD;
  else if (weight <= WireWeight.BOLD) return NativeWeight.WEIGHT_BOLD;
  else if (weight <= WireWeight.ULTRABOLD) return NativeWeight.WEIGHT_ULTRABOLD;
  else if (weight <= WireWeight.BLACK) return NativeWeight.WEIGHT_BLACK;
  return NativeWeight.WEIGHT_DONTKNOW;
}
