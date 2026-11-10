/** @fileoverview Original SAL ISO-2022-CN conversion over GB2312 and CNS 11643-1992. */
import { combineSurrogates, isHighSurrogate, isLowSurrogate } from "../inc/rtl/character";
import * as cvt from "../inc/rtl/textcvt.h";
import tables from "./cns116431992.tables.json" with { type: "json" };
import {
  BadInputConversionAction,
  handleBadInputTextToUnicodeConversion,
  handleBadInputUnicodeToTextConversion,
} from "./converter";
import { aGB2312DBCSHighTab, aGB2312UniLeadTab } from "./tcvtscn6.gb2312";
import type { ImplDBCSToUniLeadTab, ImplUniToDBCSHighTab } from "./tenchelp";

/** Original source descriptor over the GB2312 and CNS 11643-1992 arrays. */
export const aImplIso2022CnConvertData = {
  m_pGb2312ToUnicodeData: aGB2312UniLeadTab,
  m_pCns116431992ToUnicodeData: tables.aImplCns116431992ToUnicodeData,
  m_pCns116431992ToUnicodeRowOffsets: tables.aImplCns116431992ToUnicodeRowOffsets,
  m_pCns116431992ToUnicodePlaneOffsets: tables.aImplCns116431992ToUnicodePlaneOffsets,
  m_pUnicodeToGb2312Data: aGB2312DBCSHighTab,
  m_pUnicodeToCns116431992Data: tables.aImplUnicodeToCns116431992Data,
  m_pUnicodeToCns116431992PageOffsets: tables.aImplUnicodeToCns116431992PageOffsets,
  m_pUnicodeToCns116431992PlaneOffsets: tables.aImplUnicodeToCns116431992PlaneOffsets,
};

/** Original descriptor shape for the two mapping owners. */
type ImplIso2022CnConverterData = typeof aImplIso2022CnConvertData;

/** Original ISO-2022-CN decoder states in source order. */
enum State {
  ASCII,
  SO,
  SO_2,
  CNS_2,
  CNS_2_TRAIL,
  ESC,
  ESC_DOLLAR,
  ESC_DOLLAR_RPAREN,
  ESC_DOLLAR_ASTERISK,
}

/** Original SO designations in source order. */
enum Designator {
  NONE,
  GB2312,
  CNS_1,
}

/** Decoder shift, designation and pending row. */
export interface ImplIso2022CnToUnicodeContext {
  m_eState: State;
  m_nRow: number;
  m_bSo: boolean;
  m_b116431: boolean;
}

/** Encoder surrogate, designation and shift state. */
export interface ImplUnicodeToIso2022CnContext {
  m_nHighSurrogate: number;
  m_eSoDesignator: Designator;
  m_b116432Designator: boolean;
  m_bSo: boolean;
}

/** Creates the initial decoder context. @returns Initial source state. */
export function ImplCreateIso2022CnToUnicodeContext(): ImplIso2022CnToUnicodeContext {
  return { m_eState: State.ASCII, m_nRow: 0, m_bSo: false, m_b116431: false };
}

/** Resets the source decoder shift and designation. @param context - Optional decoder context. @returns Nothing. */
export function ImplResetIso2022CnToUnicodeContext(
  context: ImplIso2022CnToUnicodeContext | null,
): void {
  if (context) {
    context.m_eState = State.ASCII;
    context.m_bSo = false;
    context.m_b116431 = false;
  }
}

/** Creates the initial encoder context. @returns Initial source state. */
export function ImplCreateUnicodeToIso2022CnContext(): ImplUnicodeToIso2022CnContext {
  return {
    m_nHighSurrogate: 0,
    m_eSoDesignator: Designator.NONE,
    m_b116432Designator: false,
    m_bSo: false,
  };
}

/** Resets the source encoder context. @param context - Optional encoder context. @returns Nothing. */
export function ImplResetUnicodeToIso2022CnContext(
  context: ImplUnicodeToIso2022CnContext | null,
): void {
  if (context) Object.assign(context, ImplCreateUnicodeToIso2022CnContext());
}

/** Original transform label for the two CNS planes. @param data - Source descriptor. @param plane - Zero-based plane. @param row - ISO row byte. @param column - ISO trail byte. @returns UTF-16 units or an undefined mapping. */
function transform(
  data: ImplIso2022CnConverterData,
  plane: number,
  row: number,
  column: number,
): readonly number[] | null {
  const planeOffset = data.m_pCns116431992ToUnicodePlaneOffsets[plane] as number;
  if (planeOffset === -1) return null;
  const offset = data.m_pCns116431992ToUnicodeRowOffsets[planeOffset + row - 0x21] as number;
  if (offset === -1) return null;
  const values = data.m_pCns116431992ToUnicodeData;
  const firstLast = values[offset] as number;
  const first = firstLast & 0xff;
  const last = firstLast >> 8;
  column -= 0x20;
  if (column < first || column > last) return null;
  const unit = values[offset + 1 + column - first] as number;
  if (unit === 0xffff) return null;
  if (!isHighSurrogate(unit)) return [unit];
  const surrogateOffset = offset + 1 + last - first + 1;
  return [
    unit,
    values[surrogateOffset + 1 + column - (values[surrogateOffset] as number)] as number,
  ];
}

/** Original ISO-2022-CN decoder including escape, shift and malformed input state. @param data - Source descriptor. @param context - Optional decoder context. @param source - Raw bytes. @param sourceBytes - Input count. @param destination - UTF-16 output. @param destinationChars - Capacity. @param flags - Native flags. @param info - Out status. @param sourceConverted - Out consumed bytes. @returns Number of UTF-16 units written. */
export function ImplConvertIso2022CnToUnicode(
  data: ImplIso2022CnConverterData,
  context: ImplIso2022CnToUnicodeContext | null,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let state = context?.m_eState ?? State.ASCII;
  let row = context?.m_nRow ?? 0;
  let so = context?.m_bSo ?? false;
  let cns1 = context?.m_b116431 ?? false;
  const output: [number] = [0];
  const flush = (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) !== 0;
  let start = 0;
  let converted = 0;
  info[0] = 0;

  for (; converted < sourceBytes; converted++) {
    const byte = (source[converted] as number) & 0xff;
    const isGraphic = byte >= 0x21 && byte <= 0x7e;
    let units: readonly number[] | null = null;
    let undefinedInput = false;
    let next = state;
    switch (state) {
      case State.ASCII:
        if (byte === 0x0e) {
          so = true;
          state = State.SO;
          continue;
        }
        if (byte === 0x1b) {
          state = State.ESC;
          continue;
        }
        if (byte < 0x80) units = [byte];
        break;
      case State.SO:
        if (byte === 0x0f) {
          so = false;
          state = State.ASCII;
          continue;
        }
        if (byte === 0x1b) {
          state = State.ESC;
          continue;
        }
        if (isGraphic) {
          row = byte;
          state = State.SO_2;
          continue;
        }
        break;
      case State.SO_2:
        if (!isGraphic) break;
        undefinedInput = true;
        if (cns1) {
          units = transform(data, 0, row, byte);
          next = so ? State.SO : State.ASCII;
        } else {
          row = (row + 0x80) >>> 0;
          const lead = data.m_pGb2312ToUnicodeData[row] as ImplDBCSToUniLeadTab;
          const trail = byte + 0x80;
          if (trail >= lead.mnTrailStart && trail <= lead.mnTrailEnd) {
            const unit = (lead.mpToUniTrailTab as readonly number[])[
              trail - lead.mnTrailStart
            ] as number;
            if (unit !== 0) units = [unit];
          }
          next = State.SO;
        }
        break;
      case State.CNS_2:
        if (isGraphic) {
          row = byte;
          state = State.CNS_2_TRAIL;
          continue;
        }
        break;
      case State.CNS_2_TRAIL:
        if (isGraphic) {
          undefinedInput = true;
          units = transform(data, 1, row, byte);
          next = so ? State.SO : State.ASCII;
        }
        break;
      case State.ESC:
        if (byte === 0x24 || byte === 0x4e) {
          state = byte === 0x24 ? State.ESC_DOLLAR : State.CNS_2;
          continue;
        }
        break;
      case State.ESC_DOLLAR:
        if (byte === 0x29 || byte === 0x2a) {
          state = byte === 0x29 ? State.ESC_DOLLAR_RPAREN : State.ESC_DOLLAR_ASTERISK;
          continue;
        }
        break;
      case State.ESC_DOLLAR_RPAREN:
        if (byte === 0x41 || byte === 0x47) {
          cns1 = byte === 0x47;
          state = so ? State.SO : State.ASCII;
          continue;
        }
        break;
      case State.ESC_DOLLAR_ASTERISK:
        if (byte === 0x48) {
          state = so ? State.SO : State.ASCII;
          continue;
        }
        break;
    }

    if (units) {
      if (destinationChars - output[0] < units.length) {
        info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
        break;
      }
      for (const unit of units) destination[output[0]++] = unit;
      state = next;
    } else {
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
      state = State.ASCII;
      cns1 = false;
      if (action === BadInputConversionAction.STOP) {
        converted = flush ? start : converted + 1;
        break;
      }
    }
    start = converted + 1;
  }

  if (
    state > State.SO &&
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
        state = State.ASCII;
        cns1 = false;
      }
    }
  }

  if (context) {
    context.m_eState = state;
    context.m_nRow = row;
    context.m_bSo = so;
    context.m_b116431 = cns1;
  }
  sourceConverted[0] = converted;
  return output[0];
}

/** Original GB2312 lookup for SO designation. @param data - Source descriptor. @param value - Unicode scalar. @returns Packed 7-bit pair or zero. */
function ImplIso2022CnTranslateTo2312(data: ImplIso2022CnConverterData, value: number): number {
  const high = value >> 8;
  if (high >= 0x100) return 0;
  const low = value & 0xff;
  const page = data.m_pUnicodeToGb2312Data[high] as ImplUniToDBCSHighTab;
  return low >= page.mnLowStart && low <= page.mnLowEnd
    ? ((page.mpToUniTrailTab as readonly number[])[low - page.mnLowStart] as number) & 0x7f7f
    : 0;
}

/** Gets the original CNS reverse mapping for the requested plane. @param data - Source descriptor. @param value - Unicode scalar. @param plane - One-based CNS plane. @returns Packed 7-bit pair or zero. */
function translateCns(data: ImplIso2022CnConverterData, value: number, plane: number): number {
  const planeOffset = data.m_pUnicodeToCns116431992PlaneOffsets[value >> 16] as number;
  if (planeOffset === -1) return 0;
  const offset = data.m_pUnicodeToCns116431992PageOffsets[
    planeOffset + ((value & 0xff00) >> 8)
  ] as number;
  if (offset === -1) return 0;
  const values = data.m_pUnicodeToCns116431992Data;
  const first = values[offset] as number;
  const last = values[offset + 1] as number;
  const low = value & 0xff;
  if (low < first || low > last) return 0;
  const entry = offset + 2 + 3 * (low - first);
  if (values[entry] !== plane) return 0;
  return ((0x20 + (values[entry + 1] as number)) << 8) | (0x20 + (values[entry + 2] as number));
}

/** Original ISO-2022-CN encoder including partial designation writes and shift flushing. @param data - Source descriptor. @param context - Optional encoder context. @param source - UTF-16 units. @param sourceChars - Input count. @param destination - Output bytes. @param destinationBytes - Capacity. @param flags - Native flags. @param info - Out status. @param sourceConverted - Out consumed units. @returns Number of bytes written. */
export function ImplConvertUnicodeToIso2022Cn(
  data: ImplIso2022CnConverterData,
  context: ImplUnicodeToIso2022CnContext | null,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let high = context?.m_nHighSurrogate ?? 0;
  let designator = context?.m_eSoDesignator ?? Designator.NONE;
  let cns2 = context?.m_b116432Designator ?? false;
  let so = context?.m_bSo ?? false;
  const output: [number] = [0];
  const written: [boolean] = [false];
  const shiftIn = Uint8Array.of(0x0f);
  const flush = (flags & cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH) !== 0;
  let converted = 0;
  info[0] = 0;

  conversion: for (; converted < sourceChars; converted++) {
    let value = source[converted] as number;
    let undefinedInput = true;
    let badInput = false;
    if (high === 0) {
      if (isHighSurrogate(value)) {
        high = value;
        continue;
      }
      if (isLowSurrogate(value)) {
        undefinedInput = false;
        badInput = true;
      }
    } else if (isLowSurrogate(value)) value = combineSurrogates(high, value);
    else {
      undefinedInput = false;
      badInput = true;
    }

    // This block shares the original no_output continuation.
    write: {
      if (!badInput) {
        if (value === 0x0e || value === 0x0f || value === 0x1b) badInput = true;
        else if (value < 0x80) {
          if (so) {
            if (output[0] === destinationBytes) break write;
            destination[output[0]++] = 0x0f;
            so = false;
            if (value === 0x0a || value === 0x0d) {
              designator = Designator.NONE;
              cns2 = false;
            }
          }
          if (output[0] === destinationBytes) break write;
          destination[output[0]++] = value;
        } else {
          let target = designator === Designator.CNS_1 ? Designator.CNS_1 : Designator.GB2312;
          let bytes =
            target === Designator.CNS_1
              ? translateCns(data, value, 1)
              : ImplIso2022CnTranslateTo2312(data, value);
          if (bytes === 0) {
            target = target === Designator.CNS_1 ? Designator.GB2312 : Designator.CNS_1;
            bytes =
              target === Designator.CNS_1
                ? translateCns(data, value, 1)
                : ImplIso2022CnTranslateTo2312(data, value);
          }

          if (bytes !== 0) {
            if (target !== designator) {
              if (so) {
                if (output[0] === destinationBytes) break write;
                destination[output[0]++] = 0x0f;
                so = false;
              }
              if (destinationBytes - output[0] < 4) break write;
              destination[output[0]++] = 0x1b;
              destination[output[0]++] = 0x24;
              destination[output[0]++] = 0x29;
              destination[output[0]++] = target === Designator.GB2312 ? 0x41 : 0x47;
              designator = target;
            }
            if (!so) {
              if (output[0] === destinationBytes) break write;
              destination[output[0]++] = 0x0e;
              so = true;
            }
            if (destinationBytes - output[0] < 4) break write;
            destination[output[0]++] = bytes >> 8;
            destination[output[0]++] = bytes & 0xff;
          } else {
            bytes = translateCns(data, value, 2);
            if (bytes === 0) badInput = true;
            else {
              if (!cns2) {
                if (destinationBytes - output[0] < 4) break write;
                destination[output[0]++] = 0x1b;
                destination[output[0]++] = 0x24;
                destination[output[0]++] = 0x2a;
                destination[output[0]++] = 0x48;
                cns2 = true;
              }
              if (destinationBytes - output[0] < 4) break write;
              destination[output[0]++] = 0x1b;
              destination[output[0]++] = 0x4e;
              destination[output[0]++] = bytes >> 8;
              destination[output[0]++] = bytes & 0xff;
            }
          }
        }
      }
      if (badInput) {
        const action = handleBadInputUnicodeToTextConversion(
          undefinedInput,
          value,
          flags,
          destination,
          output,
          destinationBytes,
          info,
          shiftIn,
          so ? 1 : 0,
          written,
        );
        if (action === BadInputConversionAction.NO_OUTPUT) break write;
        high = 0;
        if (action === BadInputConversionAction.STOP) break conversion;
        if (written[0]) so = false;
      }
      high = 0;
      continue;
    }

    info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
    break;
  }

  if (
    (info[0] &
      (cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL)) ===
    0
  ) {
    if (high !== 0) {
      if (flush) info[0] |= cvt.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL;
      else {
        const action = handleBadInputUnicodeToTextConversion(
          false,
          0,
          flags,
          destination,
          output,
          destinationBytes,
          info,
          shiftIn,
          so ? 1 : 0,
          written,
        );
        if (action === BadInputConversionAction.NO_OUTPUT)
          info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        else {
          high = 0;
          if (action === BadInputConversionAction.CONTINUE && written[0]) so = false;
        }
      }
    }
    if (so && flush) {
      if (output[0] === destinationBytes) info[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      else {
        destination[output[0]++] = 0x0f;
        so = false;
      }
    }
  }

  if (context) {
    context.m_nHighSurrogate = high;
    context.m_eSoDesignator = designator;
    context.m_b116432Designator = cns2;
    context.m_bSo = so;
  }
  sourceConverted[0] = converted;
  return output[0];
}
