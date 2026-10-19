/** @fileoverview Implements the existing measure targets from pinned sax/source/tools/converter.cxx. */

import { convertToHex } from "../../../o3tl/inc/numeric";
import { rtl_ustr_toInt64_WithLength } from "../../../sal/inc/rtl/ustring.h";
import {
  rtl_math_ConversionStatus,
  rtl_math_stringToDouble,
  rtl_math_uStringToDouble,
} from "../../../sal/inc/rtl/math.h";

/** Native core length targets implemented by Writer XML import. */
export type CoreMeasureUnit = "twip" | "mm100";

const measureRatios = {
  twip: { cm: 72000 / 127, in: 1440, mm: 7200 / 127, pt: 20, pc: 240 },
  mm100: { cm: 1000, in: 2540, mm: 100, pt: 635 / 18, pc: 1270 / 3, px: 635 / 24 },
};

/** Owns SAX scalar conversion without document or XML-context policy. */
export const Converter = {
  convertColor,
  convertBool,
  /** Native UTF16 signed32 number conversion through the original length-bounded signed64 parser,clamp and complete-consumption test. Byte-string overloads remain unported. @param output - Always initialized scalar output. @param input - UTF16 view. @param min - Signed32 lower bound. @param max - Signed32 upper bound. @returns Native success. */
  convertNumber(output: [number], input: string, min = -2147483648, max = 2147483647): boolean {
    output[0] = 0;
    let position = 0;
    while (position < input.length && input.charCodeAt(position) <= 32) position++;
    const start = position;
    if (position < input.length && input[position] === "-") position++;
    while (
      position < input.length &&
      input.charCodeAt(position) >= 48 &&
      input.charCodeAt(position) <= 57
    )
      position++;
    const units = new Uint16Array(position - start);
    for (let index = 0; index < units.length; index++)
      units[index] = input.charCodeAt(start + index);
    let value = rtl_ustr_toInt64_WithLength(units, 10, units.length);
    const lower = BigInt(min | 0),
      upper = BigInt(max | 0);
    if (value < lower) value = lower;
    else if (value > upper) value = upper;
    const valid = position === input.length && value >= lower && value <= upper;
    if (valid) output[0] = Number(value) | 0;
    return valid;
  },
  /** Reads the native UTF16/byte string-view overload; success depends on status, not complete consumption. @param output - Value slot, always written. @param input - Borrowed string view. @param rest - Optional unconsumed suffix slot. @returns Whether RTL reports Ok. */
  convertDouble(
    output: [number],
    input: string | Uint8Array,
    rest?: [string | Uint8Array],
  ): boolean {
    const status: [rtl_math_ConversionStatus] = [
      rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok,
    ];
    const end: [number] = [0];
    if (typeof input === "string") {
      const units = new Uint16Array(input.length);
      for (let i = 0; i < input.length; i++) units[i] = input.charCodeAt(i);
      output[0] = rtl_math_uStringToDouble(units, units.length, 46, 44, status, end);
      if (rest) rest[0] = input.slice(end[0]);
    } else {
      output[0] = rtl_math_stringToDouble(input, input.length, 46, 44, status, end);
      if (rest) rest[0] = input.subarray(end[0]);
    }
    return status[0] === rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok;
  },
  /** Serializes a core integer to centimetres with the pinned SAX precision. @param value - Core measure. @param source - Native core unit. @returns XML centimetre measure. */
  convertMeasureToXML(value: number, source: CoreMeasureUnit): string {
    const absolute = Math.abs(value);
    const scaled = source === "mm100" ? absolute : Math.trunc((absolute * 127 + 36) / 72);
    const remainder = scaled % 1000;
    const fraction =
      remainder === 0 ? "" : `.${String(remainder).padStart(3, "0").replace(/0+$/u, "")}`;
    return `${value < 0 ? "-" : ""}${Math.trunc(scaled / 1000)}${fraction}cm`;
  },
  /** Parses a native measure and rounds/clamps it to the selected core unit. Null corresponds to native false without an output value. @param value - Source measure. @param target - Core unit. @param min - Inclusive lower limit. @param max - Inclusive upper limit. @returns Converted integer or null on unsupported syntax/unit. */
  convertMeasure(
    value: string,
    target: CoreMeasureUnit = "mm100",
    min = -2147483648,
    max = 2147483647,
  ): number | null {
    let position = 0;
    // The pinned XML attribute view is UTF-8: signed non-ASCII char bytes also compare <= space.
    while (
      position < value.length &&
      (value.charCodeAt(position) <= 32 || value.charCodeAt(position) >= 128)
    )
      position++;
    const negative = value[position] === "-";
    if (negative) position++;
    let amount = 0;
    while (
      position < value.length &&
      value.charCodeAt(position) >= 48 &&
      value.charCodeAt(position) <= 57
    ) {
      amount = amount * 10 + value.charCodeAt(position) - 48;
      position++;
    }
    if (value[position] === ".") {
      position++;
      let divisor = 1;
      while (
        position < value.length &&
        value.charCodeAt(position) >= 48 &&
        value.charCodeAt(position) <= 57
      ) {
        divisor *= 10;
        amount += (value.charCodeAt(position) - 48) / divisor;
        position++;
      }
    }
    // The pinned XML attribute view is UTF-8: signed non-ASCII char bytes also compare <= space.
    while (
      position < value.length &&
      (value.charCodeAt(position) <= 32 || value.charCodeAt(position) >= 128)
    )
      position++;
    if (position < value.length) {
      const tail = value.slice(position);
      const ratios: Readonly<Record<string, number>> = measureRatios[target];
      const ratio = ratios[tail.slice(0, 2).toLowerCase()];
      if (ratio === undefined || (tail.length !== 2 && tail[2] !== " ")) return null;
      amount *= ratio;
    }
    amount += 0.5;
    if (negative) amount = -amount;
    if (amount <= min) return min;
    if (amount >= max) return max;
    return Math.trunc(amount) || 0;
  },
};

/** Original boolean string-view parsing and buffer-append overloads. JS strings erase native byte/UTF16 view distinctions. @param output - Bool output or string buffer. @param input - Native selected input. @returns Success for parsing,or nothing for append. */
function convertBool(output: [boolean], input: string): boolean;
/** Original boolean buffer append overload. @param output - Existing buffer. @param input - Native bool. @returns Nothing. */
function convertBool(output: [string], input: boolean): void;
/** Implements the selected native lexical overload. @param output - Typed scalar or buffer. @param input - Selected native input. @returns Parsing success or nothing. */
function convertBool(output: [boolean] | [string], input: string | boolean): boolean | void {
  if (typeof input === "boolean") {
    (output as [string])[0] += input ? "true" : "false";
    return;
  }
  (output as [boolean])[0] = input === "true";
  return (output as [boolean])[0] || input === "false";
}

/** Original UTF16 color import overload. @param output - Destination retained on invalid shape. @param input - XML color. @returns Source success. */
function convertColor(output: [number], input: string): boolean;
/** Original color export overload; appends to the output buffer. @param output - Buffer. @param input - Signed32 color. @returns Nothing. */
function convertColor(output: [string], input: number): void;
/** Native shape-only validation and signed hex error propagation; original RGB byte export. @param output - Native output slot/buffer. @param input - XML text or color. @returns Import success or nothing for export. */
function convertColor(output: [number] | [string], input: string | number): boolean | void {
  if (typeof input === "number") {
    (output as [string])[0] += "#" + (input & 0xffffff).toString(16).padStart(6, "0");
    return;
  }
  if (input.length !== 7 || input[0] !== "#") return false;
  let color = convertToHex(input.charCodeAt(1), input.charCodeAt(2));
  color = (color << 8) | convertToHex(input.charCodeAt(3), input.charCodeAt(4));
  (output as [number])[0] = (color << 8) | convertToHex(input.charCodeAt(5), input.charCodeAt(6));
  return true;
}
