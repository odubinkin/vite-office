/** @fileoverview ISO-2022-JP converters from sal/textenc/convertiso2022jp.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import {
  BadInputConversionAction,
  handleBadInputTextToUnicodeConversion,
  handleBadInputUnicodeToTextConversion,
} from "./converter";
import { isHighSurrogate, isLowSurrogate, combineSurrogates } from "../inc/rtl/character";
import { aJIS0208UniLeadTab } from "./tcvtjp6.eucjp";
import { aJIS0208DBCSHighTab } from "./tcvtjp6.eucjp";

/** Source state order determines whether an incomplete sequence needs handling. */
export enum ImplIso2022JpToUnicodeState {
  ASCII,
  JIS_ROMAN,
  JIS_0208,
  JIS_0208_2,
  ESC,
  ESC_LPAREN,
  ESC_DOLLAR,
}

/** Original streaming state and JIS row. */
export interface ImplIso2022JpToUnicodeContext {
  m_eState: ImplIso2022JpToUnicodeState;
  m_nRow: number;
}

/** Creates the native initial state. @returns Fresh context. */
export function ImplCreateIso2022JpToUnicodeContext(): ImplIso2022JpToUnicodeContext {
  return { m_eState: ImplIso2022JpToUnicodeState.ASCII, m_nRow: 0 };
}

/** Resets the native state; the row remains as in upstream. @param context - Mutable context. @returns Nothing. */
export function ImplResetIso2022JpToUnicodeContext(
  context: ImplIso2022JpToUnicodeContext | null,
): void {
  if (context) context.m_eState = ImplIso2022JpToUnicodeState.ASCII;
}

/** Releases a context under JavaScript ownership. @param _context - Context. @returns Nothing. */
export function ImplDestroyIso2022JpToUnicodeContext(
  _context: ImplIso2022JpToUnicodeContext | null,
): void {
  void _context;
}

/** Decodes the pinned ASCII, JIS Roman, ESC and JIS X 0208 transitions.
 * @param _data - Source-owned JIS converter aggregate, already bound here.
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
export function ImplConvertIso2022JpToUnicode(
  _data: unknown,
  context: ImplIso2022JpToUnicodeContext | null,
  source: Uint8Array | Int8Array,
  sourceBytes: number,
  destination: Uint16Array,
  destinationChars: number,
  flags: number,
  info: [number],
  sourceConverted: [number],
): number {
  let state = context?.m_eState ?? ImplIso2022JpToUnicodeState.ASCII;
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
      case ImplIso2022JpToUnicodeState.ASCII:
        if (character === 0x1b) state = ImplIso2022JpToUnicodeState.ESC;
        else if (character < 0x80) unit = character;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022JpToUnicodeState.JIS_ROMAN:
        if (character === 0x1b) state = ImplIso2022JpToUnicodeState.ESC;
        else if (character < 0x80)
          unit = character === 0x5c ? 0x00a5 : character === 0x7e ? 0x00af : character;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022JpToUnicodeState.JIS_0208:
        if (character === 0x1b) state = ImplIso2022JpToUnicodeState.ESC;
        else if (character >= 0x21 && character <= 0x7e) {
          row = character;
          state = ImplIso2022JpToUnicodeState.JIS_0208_2;
        } else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022JpToUnicodeState.JIS_0208_2:
        if (character >= 0x21 && character <= 0x7e) {
          const lead = aJIS0208UniLeadTab[row];
          // Every admitted trail range has a complete pinned table, as in the native pointer lookup.
          const mapped =
            lead && character >= lead.mnTrailStart && character <= lead.mnTrailEnd
              ? ((lead.mpToUniTrailTab as readonly number[])[
                  character - lead.mnTrailStart
                ] as number)
              : 0;
          if (mapped !== 0) {
            unit = mapped;
          } else badInput = true;
        } else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022JpToUnicodeState.ESC:
        if (character === 0x24) state = ImplIso2022JpToUnicodeState.ESC_DOLLAR;
        else if (character === 0x28) state = ImplIso2022JpToUnicodeState.ESC_LPAREN;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022JpToUnicodeState.ESC_LPAREN:
        if (character === 0x42) state = ImplIso2022JpToUnicodeState.ASCII;
        else if (character === 0x4a) state = ImplIso2022JpToUnicodeState.JIS_ROMAN;
        else {
          undefinedInput = false;
          badInput = true;
        }
        break;
      case ImplIso2022JpToUnicodeState.ESC_DOLLAR:
        if (character === 0x40 || character === 0x42) state = ImplIso2022JpToUnicodeState.JIS_0208;
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
        if (state === ImplIso2022JpToUnicodeState.JIS_0208_2)
          state = ImplIso2022JpToUnicodeState.JIS_0208;
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
        state = ImplIso2022JpToUnicodeState.ASCII;
        converted =
          (flags & cvt.RTL_TEXTTOUNICODE_FLAGS_FLUSH) === 0 ? converted + 1 : startOfCurrentChar;
        break;
      }
      if (action === BadInputConversionAction.CONTINUE) {
        state = ImplIso2022JpToUnicodeState.ASCII;
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
    state > ImplIso2022JpToUnicodeState.JIS_0208 &&
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
      if (action !== BadInputConversionAction.NO_OUTPUT) state = ImplIso2022JpToUnicodeState.ASCII;
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

/** Original reverse ISO-2022-JP pending surrogate and JIS designation state. */
export interface ImplUnicodeToIso2022JpContext {
  m_nHighSurrogate: number;
  m_b0208: boolean;
}
/** Creates original reverse state. @returns Fresh state. */
export function ImplCreateUnicodeToIso2022JpContext(): ImplUnicodeToIso2022JpContext {
  return { m_nHighSurrogate: 0, m_b0208: false };
}
/** Resets original reverse state. @param context - Optional state. @returns Nothing. */
export function ImplResetUnicodeToIso2022JpContext(
  context: ImplUnicodeToIso2022JpContext | null,
): void {
  if (context !== null) {
    context.m_nHighSurrogate = 0;
    context.m_b0208 = false;
  }
}
/** Releases reverse state through JavaScript ownership. @param context - Optional state. @returns Nothing. */
export function ImplDestroyUnicodeToIso2022JpContext(
  context: ImplUnicodeToIso2022JpContext | null,
): void {
  void context;
}

/** Original reverse JIS state machine with source mapping, partial escapes, error prefixes and final flush.
 * @param _data - Source JIS aggregate bound by this module.
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
export function ImplConvertUnicodeToIso2022Jp(
  _data: unknown,
  context: ImplUnicodeToIso2022JpContext | null,
  source: Uint16Array,
  sourceChars: number,
  destination: Uint8Array,
  destinationBytes: number,
  flags: number,
  info: [number] | null,
  sourceConverted: [number] | null,
): number {
  let high = context?.m_nHighSurrogate ?? 0;
  let jis = context?.m_b0208 ?? false;
  const status: [number] = [0],
    output: [number] = [0],
    written: [boolean] = [false];
  const asciiPrefix = Uint8Array.of(0x1b, 0x28, 0x42);
  let converted = 0;
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
        if (jis) {
          if (destinationBytes - output[0] >= 3) {
            destination.set(asciiPrefix, output[0]);
            output[0] += 3;
            jis = false;
          } else noOutput = true;
        }
        if (!noOutput) {
          if (output[0] !== destinationBytes) destination[output[0]++] = character;
          else noOutput = true;
        }
      } else if (character === 0x1b) bad = true;
      else if (character < 0x80) {
        if (jis) {
          if (destinationBytes - output[0] >= 3) {
            destination.set(asciiPrefix, output[0]);
            output[0] += 3;
            jis = false;
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
            entry = aJIS0208DBCSHighTab[page] as (typeof aJIS0208DBCSHighTab)[number];
          if (low >= entry.mnLowStart && low <= entry.mnLowEnd) {
            bytes = (entry.mpToUniTrailTab as readonly number[])[low - entry.mnLowStart] as number;
            if (bytes === 0) {
              // These corrections occur only inside the native table's advertised range.
              if (character === 0xa5) bytes = 0x216f;
              else if (character === 0xaf) bytes = 0x2131;
            }
          }
        }
        if (bytes !== 0) {
          if (!jis) {
            if (destinationBytes - output[0] >= 3) {
              destination[output[0]++] = 0x1b;
              destination[output[0]++] = 0x24;
              destination[output[0]++] = 0x42;
              jis = true;
            } else noOutput = true;
          }
          if (!noOutput) {
            if (destinationBytes - output[0] >= 2) {
              destination[output[0]++] = bytes >>> 8;
              destination[output[0]++] = bytes & 0xff;
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
        jis ? 3 : 0,
        written,
      );
      if (action === BadInputConversionAction.NO_OUTPUT)
        status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      else high = 0;
      if (action === BadInputConversionAction.CONTINUE) {
        if (written[0]) jis = false;
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
          jis ? 3 : 0,
          written,
        );
        if (action === BadInputConversionAction.STOP) {
          high = 0;
          flush = false;
        } else if (action === BadInputConversionAction.CONTINUE) {
          if (written[0]) jis = false;
          high = 0;
        } else status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      }
    }
    if (flush && jis && (flags & cvt.RTL_UNICODETOTEXT_FLAGS_FLUSH) !== 0) {
      if (destinationBytes - output[0] >= 3) {
        destination.set(asciiPrefix, output[0]);
        output[0] += 3;
        jis = false;
      } else status[0] |= cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
    }
  }
  if (context !== null) {
    context.m_nHighSurrogate = high;
    context.m_b0208 = jis;
  }
  if (info !== null) info[0] = status[0];
  if (sourceConverted !== null) sourceConverted[0] = converted;
  return output[0];
}
