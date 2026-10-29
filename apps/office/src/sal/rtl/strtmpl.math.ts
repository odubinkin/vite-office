/** @fileoverview SAL strtmpl.hxx numeric presentation; host shortest decimal replaces Dragonbox and BigInt preserves source integer rounding. Uses managed strings instead of native alloca (https://gerrit.libreoffice.org/c/core/+/213227). */
import { RTL_STR_MAX_VALUEOFFLOAT } from "../inc/rtl/string.h";
import {
  rtl_math_StringFormat as Format,
  rtl_math_DecimalPlaces as Places,
} from "../inc/rtl/math-values";

/** Formats the native doubleToString responsibility, including original precision and grouping rules. Defaults retain the existing Automatic/Max scalar binding. @param value - Binary64. @param format - Original format selector. @param places - Signed decimal count or G significance. @param decimal - Unicode decimal unit. @param groups - Null or valid zero-terminated positive grouping sizes. @param group - Unicode group unit. @param erase - Whether to erase fractional zeroes. @returns Original formatted Unicode text. */
export function doubleToString(
  value: number,
  format: Format = Format.rtl_math_StringFormat_Automatic,
  places: number = Places.rtl_math_DecimalPlaces_Max,
  decimal = 46,
  groups: readonly number[] | null = null,
  group = 0,
  erase = true,
): string {
  if (Number.isNaN(value)) return "NaN";
  const negative = value < 0 || Object.is(value, -0);
  if (!Number.isFinite(value)) return negative ? "-INF" : "INF";
  value = Math.abs(value);
  // Host shortest-decimal text supplies the Dragonbox decomposition; rounding below is integer-only.
  const [mantissa, power = "0"] = value.toString().split("e");
  const raw = (mantissa as string).replace(".", "");
  const point = (mantissa as string).indexOf(".");
  const first = value === 0 ? raw.length - 1 : raw.search(/[1-9]/);
  const text = raw.slice(first).replace(/0+$/, "") || "0";
  let partExponent = Number(power) + (point < 0 ? raw.length : point) - first - text.length;
  let significand = BigInt(text);
  // Dragonbox trailing_zero::ignore retains its chosen decimal scale. The host
  // shortest text removes those zeroes; restore the original coarse/fine scale
  // from binary64 fields and Dragonbox's exact integer log constants.
  if (value !== 0) {
    const bits = new DataView(new ArrayBuffer(8));
    bits.setFloat64(0, value);
    const high = bits.getUint32(0);
    const binaryExponent = (high >>> 20) & 0x7ff;
    const exponent = binaryExponent === 0 ? -1074 : binaryExponent - 1023 - 52;
    const shorter = binaryExponent !== 0 && (high & 0xfffff) === 0 && bits.getUint32(4) === 0;
    const coarse = (shorter ? (exponent * 631305 - 261663) >> 21 : (exponent * 315653) >> 20) + 1;
    const selected = partExponent >= coarse ? coarse : coarse - 1;
    significand *= 10n ** BigInt(partExponent - selected);
    partExponent = selected;
  }
  let originalDigits = significand.toString().length;
  let exponent = originalDigits + partExponent - 1;
  let roundDigits = 15;
  if (value >= 1.797693134862315e308 && format !== Format.rtl_math_StringFormat_F) {
    format = Format.rtl_math_StringFormat_E;
    places = Math.min(16, Math.max(0, places));
    roundDigits = 17;
  }
  if (
    (format === Format.rtl_math_StringFormat_Automatic ||
      format === Format.rtl_math_StringFormat_F) &&
    partExponent >= 0 &&
    value < 2 ** 53
  ) {
    format = Format.rtl_math_StringFormat_F;
    places = places === Places.rtl_math_DecimalPlaces_Max ? 0 : Math.min(15, Math.max(-15, places));
    if (erase && places > 0) places = 0;
    roundDigits = originalDigits;
  }
  switch (format) {
    case Format.rtl_math_StringFormat_Automatic:
      if (exponent <= -15 || exponent >= 15) {
        if (places === Places.rtl_math_DecimalPlaces_Max) places = 14;
        format = Format.rtl_math_StringFormat_E;
      } else {
        if (places === Places.rtl_math_DecimalPlaces_Max)
          places = exponent < 14 ? 15 - exponent - 1 : 15;
        format = Format.rtl_math_StringFormat_F;
      }
      break;
    case Format.rtl_math_StringFormat_G:
    case Format.rtl_math_StringFormat_G1:
    case Format.rtl_math_StringFormat_G2:
      if (places === Places.rtl_math_DecimalPlaces_DefaultSignificance) places = 6;
      if (exponent < -4 || exponent >= places) {
        places = Math.max(1, places - 1);
        format =
          format === Format.rtl_math_StringFormat_G
            ? Format.rtl_math_StringFormat_E
            : format === Format.rtl_math_StringFormat_G2
              ? Format.rtl_math_StringFormat_E2
              : Format.rtl_math_StringFormat_E1;
      } else {
        if (originalDigits <= places && partExponent >= 0 && value < 2 ** 53)
          roundDigits = originalDigits;
        places = Math.max(0, places - exponent - 1);
        format = Format.rtl_math_StringFormat_F;
      }
      break;
  }
  places = Math.min(309, Math.max(-309, places));
  let digits = places + 1;
  if (format === Format.rtl_math_StringFormat_F) digits += exponent;
  roundDigits = Math.min(digits, roundDigits);
  if (digits >= 0 && originalDigits > roundDigits) {
    const divisor = 10n ** BigInt(originalDigits - roundDigits);
    significand = ((significand + divisor / 2n) / divisor) * divisor;
    if (significand === 10n ** BigInt(originalDigits)) {
      originalDigits++;
      exponent++;
      if (format === Format.rtl_math_StringFormat_F) digits++;
    }
  }
  let result = negative ? "-" : "";
  const decimalCharacter = String.fromCharCode(decimal);
  const groupCharacter = String.fromCharCode(group);
  let hasDecimal = false;
  let decimalPosition = 1;
  if (format === Format.rtl_math_StringFormat_F) {
    if (exponent < 0) {
      result += "0";
      if (places > 0) {
        result += decimalCharacter;
        hasDecimal = true;
      }
      let count = digits <= 0 ? places : -exponent - 1;
      while (count-- > 0) result += "0";
      decimalPosition = 0;
    } else if (digits <= 0) {
      // Upstream zero-rounding fix: https://gerrit.libreoffice.org/c/core/+/213228
      // No significant digit remains, so do not emit grouping or padded zeroes.
      result += "0";
      decimalPosition = 0;
    } else decimalPosition = exponent + 1;
  }
  let grouping = 0;
  let selector = 0;
  let exceed = 0;
  if (decimalPosition > 1 && groups && groups[0] && group) {
    while (grouping + (groups[selector] as number) < decimalPosition) {
      grouping += groups[selector] as number;
      if (groups[selector + 1]) {
        if (grouping + (groups[selector + 1] as number) >= decimalPosition) break;
        selector++;
      } else if (!exceed) exceed = grouping;
    }
  }
  if (digits > 0) {
    let currentExponent = originalDigits - 1;
    for (;;) {
      let digit: bigint;
      if (significand > 0n && currentExponent > 0) {
        const divisor = 10n ** BigInt(currentExponent--);
        digit = significand / divisor;
        significand %= divisor;
      } else {
        digit = significand;
        significand = 0n;
      }
      result += String.fromCharCode(Number(digit) + 48);
      if (!--digits) break;
      if (decimalPosition) {
        if (!--decimalPosition) {
          result += decimalCharacter;
          hasDecimal = true;
        } else if (decimalPosition === grouping) {
          result += groupCharacter;
          grouping -= (groups as readonly number[])[selector] as number;
          if (selector && grouping < exceed) selector--;
        }
      }
    }
  }
  if (!hasDecimal && format === Format.rtl_math_StringFormat_F) {
    while (--decimalPosition > 0) {
      if (decimalPosition === grouping) {
        result += groupCharacter;
        grouping -= (groups as readonly number[])[selector] as number;
        if (selector && grouping < exceed) selector--;
      }
      result += "0";
    }
  }
  if (erase && hasDecimal) {
    while (result.endsWith("0")) result = result.slice(0, -1);
    if (result.endsWith(decimalCharacter)) result = result.slice(0, -1);
  }
  if (
    format === Format.rtl_math_StringFormat_E ||
    format === Format.rtl_math_StringFormat_E1 ||
    format === Format.rtl_math_StringFormat_E2
  ) {
    if (result.length === 0) result += "1";
    result += "E" + (exponent < 0 ? "-" : "+");
    let unsignedExponent = Math.abs(exponent);
    if (format === Format.rtl_math_StringFormat_E || unsignedExponent >= 100)
      result += Math.floor(unsignedExponent / 100);
    unsignedExponent %= 100;
    if (
      format === Format.rtl_math_StringFormat_E ||
      format === Format.rtl_math_StringFormat_E2 ||
      unsignedExponent >= 10
    )
      result += Math.floor(unsignedExponent / 10);
    result += unsignedExponent % 10;
  }
  return result;
}

/** Original valueOfFP Unicode/float/maxLen15 specialization with the original null guard,terminator and untouched trailing caller storage. @param data - Actual sufficiently sized borrowed output storage. @param value - Native binary32 parameter. @returns Original written count. */
export function valueOfFP(data: Uint16Array | null, value: number): number {
  if (data === null) throw new Error("assert(pStr)");
  const text = doubleToString(
    value,
    Format.rtl_math_StringFormat_G,
    RTL_STR_MAX_VALUEOFFLOAT - "-x.E-xxx".length,
  );
  for (let index = 0; index < text.length; index++) data[index] = text.charCodeAt(index);
  data[text.length] = 0;
  return text.length;
}
