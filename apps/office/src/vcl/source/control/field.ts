/** @fileoverview Consumed original vcl numeric-field conversion and non-currency text parsing;locale decimal fields are borrowed values,not a fabricated LocaleDataWrapper. */
import { trim, toDouble } from "../../../o3tl/inc/string_view";
import { unicode } from "../../../i18nutil/source/utility/unicode";
import { FieldUnit, FieldToO3tlLength } from "../../../tools/inc/fldunit";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { rtl_ustr_toInt64_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { doubleToString } from "../../../sal/rtl/strtmpl.math";
import { SV_FUNIT_STRINGS } from "../../inc/units";
/** Native double conversion preserves invalid-unit and percentage behavior. @param value - Scaled value. @param base - Percent base. @param digits - Decimal digits. @param input - Input unit. @param output - Output unit. @returns Converted scaled value. */
export function ConvertDoubleValue(
  value: number,
  base: bigint,
  digits: number,
  input: FieldUnit,
  output: FieldUnit,
): number {
  if (input !== output) {
    if (input === FieldUnit.PERCENT && base > 0n && value > 0) {
      const divisor = 100 * 10 ** digits;
      if (base !== 1n) value *= Number(base);
      value += divisor / 2;
      value /= divisor;
    } else {
      const from = FieldToO3tlLength(input, Length.invalid),
        to = FieldToO3tlLength(output, Length.invalid);
      if (from !== Length.invalid && to !== Length.invalid) value = convert(value, from, to);
    }
  }
  return value;
}
/** Native std::round and signed64 clipping over defined finite integer/unit inputs. @param value - Signed64 value. @param base - Percent base. @param digits - Decimal digits. @param input - Source unit. @param output - Target unit. @returns Signed64 conversion. */
export function ConvertValue(
  value: bigint,
  base: bigint,
  digits: number,
  input: FieldUnit,
  output: FieldUnit,
): bigint {
  const result = ConvertDoubleValue(Number(value), base, digits, input, output);
  if (result <= -9223372036854775808) return -9223372036854775808n;
  if (result >= 9223372036854775808) return 9223372036854775807n;
  return BigInt(result < 0 ? -Math.round(-result) : Math.round(result));
}
/** Original suffix scan and English resource lookup. @param text - Full field text. @returns Native unit or NONE. */
export function GetTextMetricUnit(text: string): FieldUnit {
  let suffix = "";
  for (let index = text.length - 1; index >= 0; index--) {
    const char = text.charAt(index);
    if (
      char === "'" ||
      char === '"' ||
      char === "%" ||
      char === "′" ||
      char === "″" ||
      unicode.isAlpha(char.charCodeAt(0)) ||
      unicode.isControl(char.charCodeAt(0))
    )
      suffix = char + suffix;
    else if (suffix !== "") break;
  }
  suffix = suffix
    .replace(
      /[A-Z]/gu,
      /** Original ASCII lowercasing. @param char - ASCII letter. @returns Lowercase. */ (char) =>
        char.toLowerCase(),
    )
    .replaceAll(" ", "");
  for (const [name, unit] of SV_FUNIT_STRINGS) if (name === suffix) return unit;
  return FieldUnit.NONE;
}
/** Source ToScaledWholeAndDec non-currency path,including original negative mixed-fraction behavior. @param text - Field text. @param digits - Decimal count. @param decimal - Actual locale decimal separator. @param alternate - Actual locale alternate separator. @returns Scaled whole and remaining fractional digits,or empty failure. */
export function ToScaledWholeAndDec(
  text: string,
  digits: number,
  decimal: string,
  alternate: string,
): readonly [string, string] {
  let trimmed = "";
  for (const unit of trim(utf16(text))) trimmed += String.fromCharCode(unit);
  text = trimmed;
  if (text === "") return ["", ""];
  let decimalPos = text.indexOf(decimal);
  if (decimalPos < 0 && alternate !== "") decimalPos = text.indexOf(alternate);
  const slash = text.indexOf("/"),
    fraction = slash > 0;
  let whole = "",
    tail = "",
    numerator = "",
    denominator = "";
  if (fraction) {
    const space = text.lastIndexOf(" ", slash);
    if (space >= 0) {
      whole = text.slice(0, space);
      numerator = text.slice(space + 1, slash);
    } else numerator = text.slice(0, slash);
    denominator = text.slice(slash + 1);
  } else if (decimalPos >= 0) {
    whole = text.slice(0, decimalPos);
    tail = text.slice(decimalPos + 1);
  } else whole = text;
  const negative = whole.startsWith("-") || numerator.startsWith("-");
  whole = whole.replace(/[^0-9]/gu, "");
  if (fraction) {
    numerator = numerator.replace(/[^0-9]/gu, "");
    denominator = denominator.replace(/[^0-9]/gu, "");
  } else tail = tail.replace(/[^0-9]/gu, "");
  if (!fraction && whole === "" && tail === "") return ["", ""];
  if (fraction && whole === "" && (numerator === "" || denominator === "")) return ["", ""];
  if (whole === "") whole = "0";
  if (negative) whole = "-" + whole;
  if (fraction) {
    const divisor = nativeInt64(denominator);
    if (divisor === 0n) return ["", ""];
    const value = Number(nativeInt64(whole)) + Number(nativeInt64(numerator)) / Number(divisor);
    const formatted = doubleToString(value),
      point = formatted.indexOf(".");
    if (point >= 0) {
      whole = formatted.slice(0, point);
      tail = formatted.slice(point + 1);
    } else whole = formatted;
  }
  if (digits) {
    const moved = Math.min(digits, tail.length);
    whole += tail.slice(0, moved) + "0".repeat(digits - moved);
    tail = tail.slice(moved);
  }
  return [whole, tail];
}
/** Source TextToValue retains scaled floating parser output and suffix conversion. @param text - Field text. @param base - Percentage base. @param digits - Precision. @param decimal - Locale decimal. @param alternate - Locale alternate. @param unit - Destination unit. @returns Scaled value or parse failure. */
export function TextToValue(
  text: string,
  base: bigint,
  digits: number,
  decimal: string,
  alternate: string,
  unit: FieldUnit,
): number | undefined {
  const [whole, tail] = ToScaledWholeAndDec(text, digits, decimal, alternate);
  if (whole === "" && tail === "") return undefined;
  return ConvertDoubleValue(
    toDouble(utf16(whole + "." + tail)),
    base,
    digits,
    GetTextMetricUnit(text),
    unit,
  );
}

/** Native o3tl terminated/view integral responsibility through the existing signed64 owner. @param text - ASCII digit buffer. @returns Signed64 parse including overflow-to-zero. */
function nativeInt64(text: string): bigint {
  const buffer = utf16(text);
  return rtl_ustr_toInt64_WithLength(buffer, 10, buffer.length);
}

/** Preserves every UTF16 code unit at the native string-view boundary,including unpaired surrogates. @param text - Browser text. @returns Exact source view. */
function utf16(text: string): Uint16Array {
  return Uint16Array.from(
    { length: text.length },
    /** Reads a native code unit rather than a Unicode iterator scalar. @param unused - Array element. @param index - UTF16 offset. @returns Unit. */ (
      _,
      index,
    ) => text.charCodeAt(index),
  );
}
