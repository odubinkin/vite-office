/** @fileoverview Original VML scalar, pair, angle and geometry measure conversions. */
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import { implIsWhitespace } from "../../../o3tl/inc/string_view";
import { stringToDouble } from "../../../sal/inc/rtl/math";
import { rtl_math_ConversionStatus as Status } from "../../../sal/inc/rtl/math-values";
import { SAL_MAX_INT32, SAL_MAX_INT64, SAL_MIN_INT32, SAL_MIN_INT64 } from "../../../sal/inc/types";
import type { GraphicHelper } from "../helper/graphichelper";

const measureUnits = new Map([
  ["in", Length.in],
  ["cm", Length.cm],
  ["mm", Length.mm],
  ["pt", Length.pt],
  ["pc", Length.pc],
]);

/** Trims exactly the space and control characters recognized by o3tl::trim. @param text - Original token. @returns Trimmed token. */
function trim(text: string): string {
  let first = 0;
  let last = text.length;
  while (first < last && implIsWhitespace(text.charCodeAt(first))) first++;
  while (first < last && implIsWhitespace(text.charCodeAt(last - 1))) last--;
  return text.slice(first, last);
}

/** Splits at the first delimiter and trims the two fields. @param value - VML pair. @param separator - Native delimiter. @returns Original fields, including empty ones. */
export function separatePair(value: string, separator: string): readonly [string, string] {
  const boundary = value.indexOf(separator);
  return boundary === -1
    ? [trim(value), ""]
    : [trim(value.slice(0, boundary)), trim(value.slice(boundary + 1))];
}

/** Decodes the two true spellings recognized by VML. @param value - Attribute text. @returns VML boolean. */
export function decodeBool(value: string): boolean {
  return value === "t" || value === "true";
}

/** Uses the RTL parser, retaining its parsed-end position for measuring suffixes. @param raw - Untrimmed lexical value. @returns Parsed number and unit, or failure. */
function extractDouble(raw: string): { value: number; unit: string } | undefined {
  const view = new Uint16Array(raw.length);
  for (let i = 0; i < view.length; i++) view[i] = raw.charCodeAt(i);
  const status: [Status] = [Status.rtl_math_ConversionStatus_Ok];
  const end: [number] = [0];
  const value = stringToDouble(view, 46, 0, status, end);
  if (status[0] !== Status.rtl_math_ConversionStatus_Ok) return undefined;
  return { value, unit: raw.slice(end[0]) };
}

/** Decodes fractions, percent and the original 16.16 fixed units. @param raw - VML scalar. @param fallback - Original default argument. @returns Normalized fraction. */
export function decodePercent(raw: string, fallback: number): number {
  if (!raw) return fallback;
  const parsed = extractDouble(raw);
  if (!parsed) return fallback;
  switch (parsed.unit) {
    case "":
      return parsed.value;
    case "%":
      return parsed.value / 100;
    case "f":
      return parsed.value / 65536;
    default:
      return fallback;
  }
}

/** Returns the inverted angle in hundredths of a degree, normalized to 0 through 35999. @param raw - VML angle. @returns Native Degree100 value. */
export function decodeRotation(raw: string): number {
  if (!raw) return 0;
  const parsed = extractDouble(raw);
  if (!parsed) return 0;
  const { value, unit } = parsed;
  if (unit !== "" && unit !== "fd") return 0;
  const angle = (((unit === "fd" ? value / 65536 : value) * -100) | 0) % 36000;
  return (angle + 36000) % 36000;
}

/** Decodes a native VML length and retains the signed64 integer domain. @param graphic - Graphic conversion owner. @param raw - VML length. @param reference - Reference length in EMU. @param pixelX - Selects the X device scale. @param defaultAsPixel - Unitless source numbers use pixels. @returns Signed EMU length. */
export function decodeMeasureToEmu(
  graphic: GraphicHelper,
  raw: string,
  reference: number,
  pixelX: boolean,
  defaultAsPixel: boolean,
): bigint {
  if (!raw) return 0n;
  if (raw === "auto") return BigInt(reference);
  const parsed = extractDouble(raw);
  if (!parsed || parsed.value === 0) return 0n;
  let { value, unit } = parsed;
  if (!unit && defaultAsPixel) unit = "px";
  if (unit === "px") {
    const hmm = pixelX
      ? graphic.convertScreenPixelXToHmm(value)
      : graphic.convertScreenPixelYToHmm(value);
    value = convert(hmm, Length.mm100, Length.emu);
  } else if (unit.length === 2) {
    const length = measureUnits.get(unit);
    if (length !== undefined) value = convert(value, length, Length.emu);
  } else if (unit === "%") value *= reference / 100;
  else if (unit) value = reference;

  value += 0.5;
  if (!(value > Number(SAL_MIN_INT64))) return SAL_MIN_INT64;
  if (value >= Number(SAL_MAX_INT64)) return SAL_MAX_INT64;
  return BigInt(Math.trunc(value));
}

/** Converts the signed64 native measure to DrawingML's saturated hundredths of a millimeter. @param graphic - Graphic conversion owner. @param raw - VML length. @param reference - Reference length in EMU. @param pixelX - Selects the X device scale. @param defaultAsPixel - Unitless source numbers use pixels. @returns Signed32 length. */
export function decodeMeasureToHmm(
  graphic: GraphicHelper,
  raw: string,
  reference: number,
  pixelX: boolean,
  defaultAsPixel: boolean,
): number {
  const emu = decodeMeasureToEmu(graphic, raw, reference, pixelX, defaultAsPixel);
  const min = convert(BigInt(SAL_MIN_INT32), Length.mm100, Length.emu);
  const max = convert(BigInt(SAL_MAX_INT32), Length.mm100, Length.emu);
  if (emu < min) return SAL_MIN_INT32;
  if (emu > max) return SAL_MAX_INT32;
  return Number(convert(emu, Length.emu, Length.mm100));
}
