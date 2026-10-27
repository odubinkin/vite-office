/** @fileoverview ISO-2022-KR converters from sal/textenc/convertiso2022kr.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import {
  BadInputConversionAction,
  handleBadInputTextToUnicodeConversion,
  handleBadInputUnicodeToTextConversion,
} from "./converter";
import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "../inc/rtl/character";
import { aKSC5601UniLeadTab } from "./tcvtkr6.ms949";
import { aKSC5601DBCSHighTab } from "./tcvtkr6.ms949";

/** Source state order determines whether an incomplete sequence needs handling. */
export enum ImplIso2022KrToUnicodeState {
  ASCII,
  KSC_1001,
  KSC_1001_2,
  ESC,
  ESC_DOLLAR,
  ESC_DOLLAR_RPAREN,
}

/** Original streaming state and KS X 1001 row. */
export interface ImplIso2022KrToUnicodeContext {
  m_eState: ImplIso2022KrToUnicodeState;
  m_nRow: number;
}

/** Creates the native initial state. @returns Fresh context. */
export function ImplCreateIso2022KrToUnicodeContext(): ImplIso2022KrToUnicodeContext {
  return { m_eState: ImplIso2022KrToUnicodeState.ASCII, m_nRow: 0 };
}

/** Resets the native state; the row remains as in upstream. @param context - Mutable context. @returns Nothing. */
export function ImplResetIso2022KrToUnicodeContext(
  context: ImplIso2022KrToUnicodeContext | null,
): void {
  if (context) context.m_eState = ImplIso2022KrToUnicodeState.ASCII;
}

/** Releases a context under JavaScript ownership. @param _context - Context. @returns Nothing. */
export function ImplDestroyIso2022KrToUnicodeContext(
  _context: ImplIso2022KrToUnicodeContext | null,
): void {
  void _context;
}

/** Decodes the pinned ASCII, shift and KS X 1001 state transitions.
 * @param _data - Source-owned KS converter aggregate, already bound here.
 * @param context - Optional native streaming state.
 * @param source - Borrowed encoded bytes.
 * @param sourceBytes - Source byte count.
 * @param destination - Borrowed UTF-16 storage.
 * @param destinationChars - Output capacity.
 * @param flags - Native conversion flags.
 * @param info - Mutable native status bits.
 * @param sourceConverted - Mutable consumed-byte count.
 * @returns Number of written UTF-16 units.
 */
export function ImplConvertIso2022KrToUnicode(
  _data: unknown,
  context: ImplIso2022KrToUnicodeContext | null,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let state = context?.m_eState ?? ImplIso2022KrToUnicodeState.ASCII;
  let row = context?.m_nRow ?? 0;
  let converted = 0;
  let output = 0;
  let startOfCurrentChar = 0;
  info[0] = 0;

  for (; converted < sourceBytes; converted++) {
    const character = (source[converted] as number) & 0xff;
    let undefinedInput = true;
    let badInput = false;
    let noOutput = false;
    let unit: number | undefined;
    switch (state) {
      case ImplIso2022KrToUnicodeState.ASCII:
        if (character === 0x0e) state = ImplIso2022KrToUnicodeState.KSC_1001;
        else if (character === 0x1b) state = ImplIso2022KrToUnicodeState.ESC;
        else if (character < 0x80) unit = character;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022KrToUnicodeState.KSC_1001:
        if (character === 0x0f) state = ImplIso2022KrToUnicodeState.ASCII;
        else if (character >= 0x21 && character <= 0x7e) {
          row = character + 0x80;
          state = ImplIso2022KrToUnicodeState.KSC_1001_2;
        } else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022KrToUnicodeState.KSC_1001_2:
        if (character >= 0x21 && character <= 0x7e) {
          const lead = aKSC5601UniLeadTab[row];
          const trail = character + 0x80;
          // Every admitted trail range has a complete pinned table, as in the native pointer lookup.
          const mapped =
            lead && trail >= lead.mnTrailStart && trail <= lead.mnTrailEnd
              ? ((lead.mpToUniTrailTab as readonly number[])[trail - lead.mnTrailStart] as number)
              : 0;
          if (mapped !== 0) unit = mapped;
          else badInput = true;
        } else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022KrToUnicodeState.ESC:
        if (character === 0x24) state = ImplIso2022KrToUnicodeState.ESC_DOLLAR;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022KrToUnicodeState.ESC_DOLLAR:
        if (character === 0x29) state = ImplIso2022KrToUnicodeState.ESC_DOLLAR_RPAREN;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022KrToUnicodeState.ESC_DOLLAR_RPAREN:
        if (character === 0x43) state = ImplIso2022KrToUnicodeState.ASCII;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
    }

    if (unit !== undefined) {
      if (output === destinationChars) noOutput = true;
      else {
        destination[output++] = unit;
        if (state === ImplIso2022KrToUnicodeState.KSC_1001_2)
          state = ImplIso2022KrToUnicodeState.KSC_1001;
        startOfCurrentChar = converted + 1;
      }
    }
    if (badInput) {
      const pointer: [number] = [output];
      const action = handleBadInputTextToUnicodeConversion(
        undefinedInput,
        true,
        0,
        flags,
        destination,
        pointer,
        destinationChars,
        info,
      );
      output = pointer[0];
      if (action === BadInputConversionAction.STOP) {
        state = ImplIso2022KrToUnicodeState.ASCII;
        converted =
          (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0 ? converted + 1 : startOfCurrentChar;
        break;
      }
      if (action === BadInputConversionAction.CONTINUE) {
        state = ImplIso2022KrToUnicodeState.ASCII;
        startOfCurrentChar = converted + 1;
        continue;
      }
      noOutput = true;
    }
    if (noOutput) {
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
      break;
    }
  }

  if (
    state > ImplIso2022KrToUnicodeState.KSC_1001 &&
    (info[0] &
      (cvt.RTL_TEXTTOUNICODE_INFO_ERROR | cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL)) ===
      0
  ) {
    if ((flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0)
      info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL;
    else {
      const pointer: [number] = [output];
      const action = handleBadInputTextToUnicodeConversion(
        false,
        true,
        0,
        flags,
        destination,
        pointer,
        destinationChars,
        info,
      );
      output = pointer[0];
      if (action === BadInputConversionAction.STOP) converted = startOfCurrentChar;
      if (action !== BadInputConversionAction.NO_OUTPUT) state = ImplIso2022KrToUnicodeState.ASCII;
      else info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL;
    }
  }

  if (context) {
    context.m_eState = state;
    context.m_nRow = row;
  }
  sourceConverted[0] = converted;
  return output;
}

/** Original reverse designation/shift state order. */
export enum ImplUnicodeToIso2022KrSet {
  NONE,
  ASCII,
  KSC_1001,
}
/** Original pending surrogate and designation/shift state. */
export interface ImplUnicodeToIso2022KrContext {
  m_nHighSurrogate: number;
  m_eSet: ImplUnicodeToIso2022KrSet;
}
/** Creates original reverse state. @returns Fresh state. */
export function ImplCreateUnicodeToIso2022KrContext(): ImplUnicodeToIso2022KrContext {
  return { m_nHighSurrogate: 0, m_eSet: ImplUnicodeToIso2022KrSet.NONE };
}
/** Resets original reverse state. @param context - Optional state. @returns Nothing. */
export function ImplResetUnicodeToIso2022KrContext(
  context: ImplUnicodeToIso2022KrContext | null,
): void {
  if (context !== null) {
    context.m_nHighSurrogate = 0;
    context.m_eSet = ImplUnicodeToIso2022KrSet.NONE;
  }
}
/** Releases reverse state through JavaScript ownership. @param context - Optional state. @returns Nothing. */
export function ImplDestroyUnicodeToIso2022KrContext(
  context: ImplUnicodeToIso2022KrContext | null,
): void {
  void context;
}

/** Original reverse KS state machine with initial designation, partial shifts, error prefix and final flush.
 * @param _data - Source KS aggregate bound by this module.
 * @param context - Optional streaming state.
 * @param source - UTF-16 units.
 * @param sourceChars - Input size.
 * @param destination - Output bytes.
 * @param destinationBytes - Capacity.
 * @param flags - Native flags.
 * @param info - Optional status pointer.
 * @param sourceConverted - Optional consumed pointer.
 * @returns Bytes written.
 */
export function ImplConvertUnicodeToIso2022Kr(
  _data: unknown,
  context: ImplUnicodeToIso2022KrContext | null,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  flags: number,
  info: [number] | null,
  sourceConverted: [number] | null,
): number {
  let high = context?.m_nHighSurrogate ?? 0;
  let set = context?.m_eSet ?? ImplUnicodeToIso2022KrSet.NONE;
  const status: [number] = [0],
    output: [number] = [0],
    written: [boolean] = [false];
  const asciiPrefix = Uint8Array.of(0x0f);
  let converted = 0;
  if (set === ImplUnicodeToIso2022KrSet.NONE) {
    if (destinationBytes - output[0] >= 4) {
      destination[output[0]++] = 0x1b;
      destination[output[0]++] = 0x24;
      destination[output[0]++] = 0x29;
      destination[output[0]++] = 0x43;
      set = ImplUnicodeToIso2022KrSet.ASCII;
    } else status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
  }
  if ((status[0] & cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL) === 0)
    for (; converted < sourceChars; converted++) {
      let character = source[converted] as number;
      let undefinedInput = true,
        bad = false,
        noOutput = false;
      if (high === 0) {
        if (isHighSurrogate(character)) {
          high = character;
          continue;
        } else if (isLowSurrogate(character)) {
          undefinedInput = false;
          bad = true;
        }
      } else if (isLowSurrogate(character)) character = combineSurrogates(high, character);
      else {
        undefinedInput = false;
        bad = true;
      }
      if (!bad) {
        if (character === 0x0a || character === 0x0d) {
          if (set === ImplUnicodeToIso2022KrSet.KSC_1001) {
            if (output[0] !== destinationBytes) {
              destination[output[0]++] = 0x0f;
              set = ImplUnicodeToIso2022KrSet.ASCII;
            } else noOutput = true;
          }
          if (!noOutput) {
            if (output[0] !== destinationBytes) destination[output[0]++] = character;
            else noOutput = true;
          }
        } else if (character === 0x0e || character === 0x0f || character === 0x1b) bad = true;
        else if (character < 0x80) {
          if (set === ImplUnicodeToIso2022KrSet.KSC_1001) {
            if (output[0] !== destinationBytes) {
              destination[output[0]++] = 0x0f;
              set = ImplUnicodeToIso2022KrSet.ASCII;
            } else noOutput = true;
          }
          if (!noOutput) {
            if (output[0] !== destinationBytes) destination[output[0]++] = character;
            else noOutput = true;
          }
        } else {
          let bytes = 0;
          const page = character >>> 8;
          if (page < 0x100) {
            const low = character & 0xff,
              entry = aKSC5601DBCSHighTab[page] as (typeof aKSC5601DBCSHighTab)[number];
            if (low >= entry.mnLowStart && low <= entry.mnLowEnd)
              bytes = (entry.mpToUniTrailTab as readonly number[])[
                low - entry.mnLowStart
              ] as number;
          }
          if (bytes !== 0) {
            if (set === ImplUnicodeToIso2022KrSet.ASCII) {
              if (output[0] !== destinationBytes) {
                destination[output[0]++] = 0x0e;
                set = ImplUnicodeToIso2022KrSet.KSC_1001;
              } else noOutput = true;
            }
            if (!noOutput) {
              if (destinationBytes - output[0] >= 2) {
                destination[output[0]++] = (bytes >>> 8) & 0x7f;
                destination[output[0]++] = bytes & 0x7f;
              } else noOutput = true;
            }
          } else bad = true;
        }
      }
      if (noOutput) {
        status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        break;
      }
      if (bad) {
        const action = handleBadInputUnicodeToTextConversion(
          undefinedInput,
          character,
          flags,
          destination,
          output,
          destinationBytes,
          status,
          asciiPrefix,
          set === ImplUnicodeToIso2022KrSet.ASCII ? 0 : 1,
          written,
        );
        if (action === BadInputConversionAction.NO_OUTPUT)
          status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
        else high = 0;
        if (action === BadInputConversionAction.CONTINUE) {
          if (written[0]) set = ImplUnicodeToIso2022KrSet.ASCII;
          continue;
        }
        break;
      }
      high = 0;
    }
  if (
    (status[0] &
      (cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL)) ===
    0
  ) {
    let flush = true;
    if (high !== 0) {
      if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH) !== 0)
        status[0] |= cvt.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL;
      else {
        const action = handleBadInputUnicodeToTextConversion(
          false,
          0,
          flags,
          destination,
          output,
          destinationBytes,
          status,
          asciiPrefix,
          set === ImplUnicodeToIso2022KrSet.ASCII ? 0 : 1,
          written,
        );
        if (action === BadInputConversionAction.STOP) {
          high = 0;
          flush = false;
        } else if (action === BadInputConversionAction.CONTINUE) {
          if (written[0]) set = ImplUnicodeToIso2022KrSet.ASCII;
          high = 0;
        } else status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      }
    }
    if (
      flush &&
      set === ImplUnicodeToIso2022KrSet.KSC_1001 &&
      (flags & cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH) !== 0
    ) {
      if (output[0] !== destinationBytes) {
        destination[output[0]++] = 0x0f;
        set = ImplUnicodeToIso2022KrSet.ASCII;
      } else status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
    }
  }
  if (context !== null) {
    context.m_nHighSurrogate = high;
    context.m_eSet = set;
  }
  if (info !== null) info[0] = status[0];
  if (sourceConverted !== null) sourceConverted[0] = converted;
  return output[0];
}
