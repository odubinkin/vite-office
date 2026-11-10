/** @fileoverview Original SAL GB18030-2000 streaming conversion and source range dispatch. */
import * as cvt from "../inc/rtl/textcvt.h";
import {
  combineSurrogates,
  isHighSurrogate,
  isLowSurrogate,
  splitSurrogates,
} from "../inc/rtl/character";
import {
  BadInputConversionAction,
  handleBadInputTextToUnicodeConversion,
  handleBadInputUnicodeToTextConversion,
} from "./converter";
import type { ImplUnicodeToTextContext } from "./context";
import data from "./convertgb18030.tables.json" with { type: "json" };

/** Original static aggregate over the pinned GB18030 data and its two range tables. */
export const aImplGb18030ConvertData = {
  m_pGb18030ToUnicodeData: data.aImplGb180302000ToUnicodeData,
  m_pGb18030ToUnicodeRanges: data.aImplGb180302000ToUnicodeRanges,
  m_pUnicodeToGb18030Data: data.aImplUnicodeToGb180302000Data,
  m_pUnicodeToGb18030Ranges: data.aImplUnicodeToGb180302000Ranges,
};

/** Native byte-sequence states from initial byte through fourth byte. */
enum ImplGb18030ToUnicodeState {
  STATE_0,
  STATE_1,
  STATE_2,
  STATE_3,
}

/** Original decoder state and partial index. */
export interface ImplGb18030ToUnicodeContext {
  m_eState: ImplGb18030ToUnicodeState;
  m_nCode: number;
}

/** Initializes the original empty decoder state. @returns Independent context. */
export function ImplCreateGb18030ToUnicodeContext(): ImplGb18030ToUnicodeContext {
  return { m_eState: ImplGb18030ToUnicodeState.STATE_0, m_nCode: 0 };
}

/** Resets only the native state. @param context - Native context or null. @returns Nothing. */
export function ImplResetGb18030ToUnicodeContext(
  context: ImplGb18030ToUnicodeContext | null,
): void {
  if (context) context.m_eState = ImplGb18030ToUnicodeState.STATE_0;
}

/** Original BMP index lookup through the alternating source ranges and gap table. @param data - Actual descriptor. @param code - Native linear value. @returns UTF-16 unit or null for a terminal gap. */
function decodeRange(data: typeof aImplGb18030ConvertData, code: number): number | null {
  let firstNonRange = 0;
  for (const range of data.m_pGb18030ToUnicodeRanges) {
    if (range.m_nNonRangeDataIndex === -1) break;
    if (code < range.m_nFirstLinear)
      return data.m_pGb18030ToUnicodeData[
        range.m_nNonRangeDataIndex + code - firstNonRange
      ] as number;
    if (code < range.m_nPastLinear) return range.m_nFirstUnicode + code - range.m_nFirstLinear;
    firstNonRange = range.m_nPastLinear;
  }
  return null;
}

/** Original stateful GB18030 decoding with exact output and consumed-input boundaries. @param data - Actual source descriptor. @param context - Optional streaming state. @param source - Raw input. @param sourceBytes - Input byte count. @param destination - UTF-16 output. @param destinationChars - Output capacity. @param flags - Native conversion flags. @param info - Out status flags. @param sourceConverted - Out consumed byte count. @returns Number of written UTF-16 units. */
export function ImplConvertGb18030ToUnicode(
  data: typeof aImplGb18030ConvertData,
  context: ImplGb18030ToUnicodeContext | null,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  const { STATE_0, STATE_1, STATE_2, STATE_3 } = ImplGb18030ToUnicodeState;
  let state = context?.m_eState ?? STATE_0;
  let code = context?.m_nCode ?? 0;
  let converted = 0;
  const output: [number] = [0];
  let start = 0;
  const flush = (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) !== 0;
  info[0] = 0;

  for (; converted < sourceBytes; converted++) {
    const byte = (source[converted] as number) & 0xff;
    let unit: number | null = null;
    let badInput = false;
    let undefinedInput = true;
    let supplementary = false;
    switch (state) {
      case STATE_0:
        if (byte < 0x80) unit = byte;
        else if (byte === 0x80) badInput = true;
        else if (byte <= 0xfe) {
          code = byte - 0x81;
          state = STATE_1;
        } else {
          badInput = true;
          undefinedInput = false;
        }
        break;
      case STATE_1:
        if (byte >= 0x30 && byte <= 0x39) {
          code = (code * 10 + byte - 0x30) >>> 0;
          state = STATE_2;
        } else if ((byte >= 0x40 && byte <= 0x7e) || (byte >= 0x80 && byte <= 0xfe)) {
          code = (code * 190 + (byte <= 0x7e ? byte - 0x40 : byte - 0x80 + 63)) >>> 0;
          unit = data.m_pGb18030ToUnicodeData[code] as number;
        } else {
          badInput = true;
          undefinedInput = false;
        }
        break;
      case STATE_2:
        if (byte >= 0x81 && byte <= 0xfe) {
          code = (code * 126 + byte - 0x81) >>> 0;
          state = STATE_3;
        } else {
          badInput = true;
          undefinedInput = false;
        }
        break;
      case STATE_3:
        if (byte >= 0x30 && byte <= 0x39) {
          code = (code * 10 + byte - 0x30) >>> 0;
          if (code >= 189000 && code <= 1237575) {
            supplementary = true;
            unit = code - (189000 - 0x10000);
          } else {
            unit = decodeRange(data, code);
            badInput = unit === null;
          }
        } else {
          badInput = true;
          undefinedInput = false;
        }
        break;
    }

    if (badInput) {
      const action = handleBadInputTextToUnicodeConversion(
        undefinedInput,
        true,
        0,
        flags,
        destination,
        output,
        destinationChars,
        info,
      );
      if (action === BadInputConversionAction.NO_OUTPUT) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
        break;
      }
      state = STATE_0;
      if (action === BadInputConversionAction.STOP) {
        converted = flush ? start : converted + 1;
        break;
      }
      start = converted + 1;
    } else if (unit !== null) {
      const width = supplementary ? 2 : 1;
      if (destinationChars - output[0] < width) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
        break;
      }
      if (supplementary) {
        code = unit;
        output[0] += splitSurrogates(code, destination.subarray(output[0]));
      } else destination[output[0]++] = unit;
      start = converted + 1;
      state = STATE_0;
    }
  }

  if (
    state !== STATE_0 &&
    (info[0] &
      (cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL)) ===
      0
  ) {
    if (!flush) info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
    else {
      const action = handleBadInputTextToUnicodeConversion(
        false,
        true,
        0,
        flags,
        destination,
        output,
        destinationChars,
        info,
      );
      if (action === BadInputConversionAction.NO_OUTPUT)
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      else {
        if (action === BadInputConversionAction.STOP) converted = start;
        state = STATE_0;
      }
    }
  }

  if (context) {
    context.m_eState = state;
    context.m_nCode = code;
  }
  sourceConverted[0] = converted;
  return output[0];
}

/** Original four-byte index decomposition. @param index - Source linear value. @param first - First-byte base. @returns Packed output bytes. */
function linearCode(index: number, first: number): number {
  return (
    (((Math.trunc(index / 12600) + first) << 24) |
      (((Math.trunc(index / 1260) % 10) + 0x30) << 16) |
      (((Math.trunc(index / 10) % 126) + 0x81) << 8) |
      ((index % 10) + 0x30)) >>>
    0
  );
}

/** Original BMP reverse range and non-range lookup. @param data - Actual descriptor. @param value - Valid BMP unit. @returns Packed source bytes. */
function encodeRange(data: typeof aImplGb18030ConvertData, value: number): number {
  let firstNonRange = 0x80;
  for (const range of data.m_pUnicodeToGb18030Ranges) {
    if (value < range.m_nFirstUnicode)
      return data.m_pUnicodeToGb18030Data[
        range.m_nNonRangeDataIndex + value - firstNonRange
      ] as number;
    if (value <= range.m_nLastUnicode)
      return linearCode(range.m_nFirstLinear + value - range.m_nFirstUnicode, 0x81);
    firstNonRange = (range.m_nLastUnicode + 1) & 0xffff;
  }
  throw new Error("GB18030 source range assertion");
}

/** Original Unicode-to-GB18030 streaming conversion with native surrogate and capacity semantics. @param data - Actual source descriptor. @param context - Optional shared Unicode context. @param source - UTF-16 input. @param sourceChars - Input unit count. @param destination - Raw output. @param destinationBytes - Output capacity. @param flags - Native conversion flags. @param info - Out status flags. @param sourceConverted - Out consumed unit count. @returns Number of output bytes. */
export function ImplConvertUnicodeToGb18030(
  data: typeof aImplGb18030ConvertData,
  context: ImplUnicodeToTextContext | null,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let high = context?.m_nHighSurrogate ?? 0;
  const output: [number] = [0];
  let converted = 0;
  info[0] = 0;
  for (; converted < sourceChars; converted++) {
    let unit = source[converted] as number;
    let invalid = false;
    if (high === 0) {
      if (isHighSurrogate(unit)) {
        high = unit;
        continue;
      }
      invalid = isLowSurrogate(unit);
    } else if (isLowSurrogate(unit)) unit = combineSurrogates(high, unit);
    else invalid = true;
    if (invalid) {
      const action = handleBadInputUnicodeToTextConversion(
        false,
        unit,
        flags,
        destination,
        output,
        destinationBytes,
        info,
        null,
        0,
        null,
      );
      if (action === BadInputConversionAction.NO_OUTPUT) {
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        break;
      }
      high = 0;
      if (action === BadInputConversionAction.STOP) break;
      continue;
    }
    const code =
      unit < 0x80
        ? unit
        : unit < 0x10000
          ? encodeRange(data, unit)
          : linearCode(unit - 0x10000, 0x90);
    const count = unit < 0x80 ? 1 : code <= 0xffff ? 2 : 4;
    if (destinationBytes - output[0] < count) {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      break;
    }
    for (let index = count - 1; index >= 0; index--)
      destination[output[0]++] = code >>> (8 * index);
    high = 0;
  }

  if (
    high !== 0 &&
    (info[0] &
      (cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL)) ===
      0
  ) {
    if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH) !== 0)
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL;
    else {
      const action = handleBadInputUnicodeToTextConversion(
        false,
        0,
        flags,
        destination,
        output,
        destinationBytes,
        info,
        null,
        0,
        null,
      );
      if (action === BadInputConversionAction.NO_OUTPUT)
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      else high = 0;
    }
  }
  if (context) context.m_nHighSurrogate = high;
  sourceConverted[0] = converted;
  return output[0];
}
