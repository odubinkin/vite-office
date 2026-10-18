/** @fileoverview Pinned RTL decimal lexer and parsed-end mapping with native JS binary64 rounding. */
import { rtl_math_ConversionStatus as Status } from "../inc/rtl/math-values";

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
