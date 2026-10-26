/** @fileoverview ISO-2022-KR text-to-Unicode converter from sal/textenc/convertiso2022kr.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import { BadInputConversionAction, handleBadInputTextToUnicodeConversion } from "./converter";
import { aKSC5601UniLeadTab } from "./tcvtkr6.ms949";

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
