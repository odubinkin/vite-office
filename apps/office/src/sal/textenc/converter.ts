/** @fileoverview Shared bad-input conversion action from sal/textenc/converter.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import { RTL_TEXTCVT_BYTE_PRIVATE_START } from "./tenchelp";
import { RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER } from "./unichars.hxx";

/** Original BadInputConversionAction values. */
export enum BadInputConversionAction {
  STOP,
  CONTINUE,
  NO_OUTPUT,
}

/** Applies the pinned text-to-Unicode error flags to one malformed byte sequence.
 * @param undefinedInput - Whether the source byte has no mapping.
 * @param multiByte - Whether the undefined source spans multiple bytes.
 * @param byte - Original byte for private-use mapping.
 * @param flags - Native conversion flags.
 * @param destination - Borrowed UTF-16 output storage.
 * @param destinationOffset - Mutable output pointer.
 * @param destinationChars - Output capacity.
 * @param info - Mutable native status bits.
 * @returns Original stop, continue, or no-output action.
 */
export function handleBadInputTextToUnicodeConversion(
  undefinedInput: boolean,
  multiByte: boolean,
  byte: number,
  flags: number,
  destination: Uint16Array,
  destinationOffset: [number],
  destinationChars: number,
  info: [number],
): BadInputConversionAction {
  info[0] |= undefinedInput
    ? multiByte
      ? cvt.RTL_TEXTTOUNICODE_INFO_MBUNDEFINED
      : cvt.RTL_TEXTTOUNICODE_INFO_UNDEFINED
    : cvt.RTL_TEXTTOUNICODE_INFO_INVALID;
  const mask = undefinedInput
    ? multiByte
      ? cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK
      : cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK
    : cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK;
  const action = flags & mask;
  if (
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR ||
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR ||
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR
  ) {
    info[0] |= cvt.RTL_TEXTTOUNICODE_INFO_ERROR;
    return BadInputConversionAction.STOP;
  }
  if (
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_IGNORE ||
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE ||
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE
  )
    return BadInputConversionAction.CONTINUE;
  if (destinationOffset[0] === destinationChars) return BadInputConversionAction.NO_OUTPUT;
  destination[destinationOffset[0]++] =
    action === cvt.RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE
      ? RTL_TEXTCVT_BYTE_PRIVATE_START | (byte & 0xff)
      : RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;
  return BadInputConversionAction.CONTINUE;
}
