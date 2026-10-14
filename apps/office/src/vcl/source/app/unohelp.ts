/** @fileoverview Both original ConvertFontSlant overloads, with explicit erased-enum source selection for JS numbers. */
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
