/** @fileoverview Pinned RTL decimal parsing,numeric formatting and arithmetic C responsibilities. */
import {
  rtl_math_ConversionStatus as Status,
  type rtl_math_StringFormat,
  rtl_math_RoundingMode as RoundingMode,
} from "../inc/rtl/math-values";
import type { rtl_uStringSlot } from "../inc/rtl/ustring.h";
import { doubleToString } from "./strtmpl.math";

/** Consumed nonnegative n10s lookup uses correctly rounded decimal literals;the out-of-table path is libm pow. @param exponent - Nonnegative original integer exponent. @returns Binary64 power. */
function getN10Exp(exponent: number): number {
  return exponent <= 308 ? Number("1e" + exponent) : Math.pow(10, exponent);
}
/** Original representable-integer exception excludes binary64 integers at or above2^53. @param value - Nonnegative finite value. @returns Representable integer. */
function isRepresentableInteger(value: number): boolean {
  return value < 2 ** 53 && Number.isInteger(value);
}
/** Original fractional bit count reads the actual IEEE754 significand and exponent. @param value - Positive finite value. @returns Fractional bit count. */
function getBitsInFracPart(value: number): number {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value);
  const bits = view.getBigUint64(0),
    exponent = Number((bits >> 52n) & 0x7ffn) - 1023;
  if (exponent >= 52) return 0;
  let fraction = bits & 0xfffffffffffffn,
    least = 53;
  if (fraction !== 0n) {
    least = 1;
    while ((fraction & 1n) === 0n) {
      ++least;
      fraction >>= 1n;
    }
  }
  return Math.max(53 - least - exponent, 0);
}
/** Original fifteen-significant-digit approximation,including sign-sensitive early guard and overflow restoration. @param value - Binary64 input. @returns Native approximate value. */
export function rtl_math_approxValue(value: number): number {
  if (value === 0 || !Number.isFinite(value) || value > 2 ** 41) return value;
  const original = value,
    negative = value < 0;
  if (negative) value = -value;
  if (isRepresentableInteger(value) || getBitsInFracPart(value) <= 11) return original;
  const exponent = 14 - Math.floor(Math.log10(value)),
    factor = getN10Exp(Math.abs(exponent));
  // Values with magnitude>=2^41 have at most11 fractional bits and already returned.
  // Thus the remaining exponent is positive;the native negative-scale and final overflow guards are unreachable.
  value *= factor;
  if (!Number.isFinite(value)) return original;
  value = Math.round(value);
  value /= factor;
  return negative ? -value : value;
}
/** Original RTL rounding over all eight modes. JS has no floating-point environment,so HalfEven executes the native fallback. Proven impossible nDec<=0,positive decimal-power underflow and precision-clamped scaling overflow guards are erased in this typed binary64 domain. @param value - Binary64 input. @param places - Signed32 decimal places. @param mode - Original rounding selector. @returns Rounded binary64 with native sign and overflow restoration. */
export function rtl_math_round(value: number, places: number, mode: RoundingMode): number {
  if (!Number.isFinite(value) || value === 0) return value;
  places |= 0;
  const original = value,
    negative = value < 0;
  if (negative) value = -value;
  if (places >= 0 && (value >= 2 ** 52 || isRepresentableInteger(value))) return original;
  let factor = 0;
  if (places !== 0) {
    if (places > 0) {
      const view = new DataView(new ArrayBuffer(8));
      view.setFloat64(0, value);
      const decimals = 52 - (Number((view.getBigUint64(0) >> 52n) & 0x7ffn) - 1023);
      places = Math.min(places, decimals);
    }
    factor = getN10Exp(Math.abs(places));
    if (places < 0 && !Number.isFinite(factor)) return 0;
    if (!Number.isFinite(factor)) return original;
    value = places < 0 ? value / factor : value * factor;
  }
  if (value < 2 ** 52) {
    switch (mode) {
      case RoundingMode.rtl_math_RoundingMode_Corrected:
        value = Math.floor(rtl_math_approxValue(value + 0.5));
        break;
      case RoundingMode.rtl_math_RoundingMode_Down:
        value = Math.floor(rtl_math_approxValue(value));
        break;
      case RoundingMode.rtl_math_RoundingMode_Up:
        value = Math.ceil(rtl_math_approxValue(value));
        break;
      case RoundingMode.rtl_math_RoundingMode_Floor:
        value = negative
          ? Math.ceil(rtl_math_approxValue(value))
          : Math.floor(rtl_math_approxValue(value));
        break;
      case RoundingMode.rtl_math_RoundingMode_Ceiling:
        value = negative
          ? Math.floor(rtl_math_approxValue(value))
          : Math.ceil(rtl_math_approxValue(value));
        break;
      case RoundingMode.rtl_math_RoundingMode_HalfDown: {
        const integer = Math.floor(value);
        value = value - integer <= 0.5 ? integer : Math.ceil(value);
        break;
      }
      case RoundingMode.rtl_math_RoundingMode_HalfUp: {
        const integer = Math.floor(value);
        value = value - integer < 0.5 ? integer : Math.ceil(value);
        break;
      }
      case RoundingMode.rtl_math_RoundingMode_HalfEven: {
        const integer = Math.floor(value);
        value =
          value - integer !== 0.5
            ? Math.floor(value + 0.5)
            : integer / 2 === Math.floor(integer / 2)
              ? integer
              : integer + 1;
        break;
      }
      default:
        // Native OSL_ASSERT is diagnostic only;the release path leaves the scaled value unchanged.
        break;
    }
  }
  if (places !== 0) value = places < 0 ? value * factor : value / factor;
  if (!Number.isFinite(value)) return original;
  return negative ? -value : value;
}
import { newFromStr_WithLength, stringbuffer_insert } from "./strtmpl";

/** Tests the original ASCII digit range, including an exhausted input. @param c - Unit. @returns Digit membership. */
function digit(c: number): boolean {
  return c >= 48 && c <= 57;
}

/** Owns the native char/sal_Unicode template responsibility; input views replace pointer ranges. @param data - Borrowed units. @param end - Logical end offset. @param decimal - Decimal separator unit. @param group - Group separator unit. @param status - Optional native output slot. @param parsedEnd - Optional original input offset slot. @returns Parsed binary64 including signed zero. */
function stringToDouble(
  data: Uint8Array | Uint16Array,
  end: number,
  decimal: number,
  group: number,
  status?: [Status] | null,
  parsedEnd?: [number] | null,
): number {
  let value = 0;
  let conversion = Status.rtl_math_ConversionStatus_Ok;
  let start = 0;
  while (start !== end && ((data[start] as number) === 32 || (data[start] as number) === 9))
    start++;
  let negative = false;
  let explicitSign = false;
  if (start !== end && (data[start] as number) === 45) {
    negative = true;
    explicitSign = true;
    start++;
  } else if (start !== end && (data[start] as number) === 43) {
    explicitSign = true;
    start++;
  }
  let position = start;
  let done = false;
  if (end - position >= 3) {
    if (
      !explicitSign &&
      (data[position] as number) === 78 &&
      (data[position + 1] as number) === 97 &&
      (data[position + 2] as number) === 78
    ) {
      position += 3;
      value = Number.NaN;
      done = true;
    } else if (
      (data[position] as number) === 73 &&
      (data[position + 1] as number) === 78 &&
      (data[position + 2] as number) === 70
    ) {
      position += 3;
      value = Infinity;
      conversion = Status.rtl_math_ConversionStatus_OutOfRange;
      done = true;
    }
  }
  if (!done) {
    let normalized = "";
    const map: number[] = [];
    /** Records normalized text and the corresponding original unit. @param c - ASCII text. @returns Nothing. */
    const insert =
      /** Records a normalized unit at its original offset. @param c - ASCII unit. @returns Nothing. */ (
        c: string,
      ): void => {
        normalized += c;
        map.push(position);
      };
    if (position !== end && (data[position] as number) === 48) {
      insert("0");
      position++;
    }
    while (
      position !== end &&
      ((data[position] as number) === 48 ||
        ((data[position] as number) === group &&
          start < position &&
          position + 1 < end &&
          digit(data[position + 1] as number)))
    )
      position++;
    for (; position !== end; position++) {
      const c = data[position] as number;
      if (digit(c)) insert(String.fromCharCode(c));
      else if (c !== group) break;
      else if (position === start || position + 1 === end || !digit(data[position + 1] as number))
        break;
    }
    if (position !== end && (data[position] as number) === decimal) {
      insert(".");
      position++;
      for (; position !== end && digit(data[position] as number); position++)
        insert(String.fromCharCode(data[position] as number));
    }
    if (
      position !== start &&
      position !== end &&
      ((data[position] as number) === 69 || (data[position] as number) === 101)
    ) {
      insert("E");
      position++;
      if (position !== end && (data[position] as number) === 45) {
        insert("-");
        position++;
      } else if (position !== end && (data[position] as number) === 43) position++;
      for (; position !== end && digit(data[position] as number); position++)
        insert(String.fromCharCode(data[position] as number));
    } else if (
      position - start === 2 &&
      position !== end &&
      (data[position] as number) === 35 &&
      (data[position - 1] as number) === decimal &&
      (data[position - 2] as number) === 49
    ) {
      if (
        end - position >= 4 &&
        (data[position + 1] as number) === 73 &&
        (data[position + 2] as number) === 78 &&
        (data[position + 3] as number) === 70
      ) {
        position += 4;
        value = Infinity;
        conversion = Status.rtl_math_ConversionStatus_OutOfRange;
        while (position !== end && digit(data[position] as number)) position++;
        done = true;
      } else if (
        end - position >= 4 &&
        (data[position + 1] as number) === 78 &&
        (data[position + 2] as number) === 65 &&
        (data[position + 3] as number) === 78
      ) {
        position += 4;
        value = negative ? -Number.NaN : Number.NaN;
        negative = false;
        while (position !== end && digit(data[position] as number)) position++;
        done = true;
      }
    }
    if (!done) {
      map.push(position);
      // Only a decimal prefix reaches Number: JS whitespace/hex/Infinity grammar is never used.
      const token = /^(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:E-?[0-9]+)?/u.exec(normalized);
      const consumed = token === null ? 0 : token[0].length;
      if (token !== null) {
        value = Number(token[0]);
        const mantissa = token[0].split("E")[0] as string;
        if (!Number.isFinite(value) || (value === 0 && /[1-9]/u.test(mantissa))) {
          if (token[0] === "1.79769313486232E308") value = Number.MAX_VALUE;
          else conversion = Status.rtl_math_ConversionStatus_OutOfRange;
        }
      }
      position = map[consumed] as number;
    }
  }
  if (status) status[0] = conversion;
  if (parsedEnd) parsedEnd[0] = position === start ? 0 : position;
  return negative ? -value : value;
}

/** Original byte C entry point; the borrowed view represents pBegin and length represents pEnd. @param data - Borrowed char bytes. @param length - Native pointer-range length. @param decimal - Native char separator. @param group - Native char separator. @param status - Optional output. @param parsedEnd - Optional offset output. @returns Binary64 value. */
export function rtl_math_stringToDouble(
  data: Uint8Array,
  length: number,
  decimal: number,
  group: number,
  status?: [Status] | null,
  parsedEnd?: [number] | null,
): number {
  return stringToDouble(data, length, decimal & 255, group & 255, status, parsedEnd);
}
/** Original Unicode C entry point with a borrowed logical UTF16 range. @param data - Borrowed units. @param length - Native pointer-range length. @param decimal - Native sal_Unicode separator. @param group - Native sal_Unicode separator. @param status - Optional output. @param parsedEnd - Optional offset output. @returns Binary64 value. */
export function rtl_math_uStringToDouble(
  data: Uint16Array,
  length: number,
  decimal: number,
  group: number,
  status?: [Status] | null,
  parsedEnd?: [number] | null,
): number {
  return stringToDouble(data, length, decimal & 65535, group & 65535, status, parsedEnd);
}

/** Native binary64 approximate equality, including the representable-integer exception. Decimal powers use correctly rounded decimal conversion like the source constant table. @param a - First value. @param b - Second value. @returns Approximate equality. */
export function rtl_math_approxEqual(a: number, b: number): boolean {
  if (a === b) return true;
  if (a === 0 || b === 0 || a < 0 !== b < 0) return false;
  const difference = Math.abs(a - b);
  if (!Number.isFinite(difference)) return false;
  a = Math.abs(a);
  b = Math.abs(b);
  const minimum = Math.min(a, b);
  const threshold = Math.max(
    minimum * 2 ** -48,
    Number("1e" + Math.floor(Math.log10(minimum))) * 5e-15,
  );
  if (difference >= threshold) return false;
  if (a < 2 ** 53 && Number.isInteger(a) && b < 2 ** 53 && Number.isInteger(b)) return false;
  return true;
}

/** Original Unicode C formatting facade; the native template's append branch uses actual shared string allocation or buffer insertion. @param result - Actual owning string slot. @param capacity - Null for replacement or actual mutable buffer capacity. @param offset - Insertion offset,ignored for replacement. @param value - Binary64. @param format - Original selector. @param places - Original signed decimal count/significance. @param decimal - sal_Unicode decimal unit. @param groups - Null or positive zero-terminated group sizes. @param group - sal_Unicode grouping unit. @param erase - Erase fractional zeroes. @returns Nothing. */
export function rtl_math_doubleToUString(
  result: rtl_uStringSlot | null,
  capacity: [number] | null,
  offset: number,
  value: number,
  format: rtl_math_StringFormat,
  places: number,
  decimal: number,
  groups: readonly number[] | null,
  group: number,
  erase: boolean,
): void {
  const text = doubleToString(
    value,
    format,
    places | 0,
    decimal & 0xffff,
    groups,
    group & 0xffff,
    erase,
  );
  const units = new Uint16Array(text.length);
  for (let index = 0; index < text.length; index++) units[index] = text.charCodeAt(index);
  if (capacity === null) newFromStr_WithLength(result, units, units.length);
  else stringbuffer_insert(result, capacity, offset | 0, units, units.length);
}
