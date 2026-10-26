/** @fileoverview Shared bad-input conversion action from sal/textenc/converter.cxx. */
import * as cvt from "../inc/rtl/textcvt.h";
import { RTL_TEXTCVT_BYTE_PRIVATE_START } from "./tenchelp";
import {
  ImplIsControlOrFormat,
  ImplIsPrivateUse,
  ImplIsZeroWidth,
  RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER,
} from "./unichars.hxx";

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

/** Applies the original Unicode-to-text replacement and optional prefix contract.
 * @param undefinedInput - Whether the scalar lacks an encoding mapping.
 * @param utf32 - Original scalar for undefined-character policy.
 * @param flags - Native conversion flags.
 * @param destination - Borrowed byte output storage.
 * @param destinationOffset - Mutable output pointer.
 * @param destinationBytes - Output capacity.
 * @param info - Mutable native status bits.
 * @param prefix - Optional bytes emitted before replacement.
 * @param prefixLength - Number of prefix bytes.
 * @param prefixWritten - Optional mutable prefix result.
 * @returns Original stop, continue, or no-output action.
 */
export function handleBadInputUnicodeToTextConversion(
  undefinedInput: boolean,
  utf32: number,
  flags: number,
  destination: Uint8Array,
  destinationOffset: [number],
  destinationBytes: number,
  info: [number],
  prefix: Uint8Array | null,
  prefixLength: number,
  prefixWritten: [boolean] | null,
): BadInputConversionAction {
  if (undefinedInput) {
    if (ImplIsControlOrFormat(utf32)) {
      if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_CONTROL_IGNORE) !== 0)
        flags = cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE;
    } else if (ImplIsPrivateUse(utf32)) {
      if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_IGNORE) !== 0)
        flags = cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE;
      else if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0) !== 0)
        flags = cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_0;
    } else if (
      ImplIsZeroWidth(utf32) &&
      (flags & cvt.RTL_UNICODETOTEXT_FLAGS_NONSPACING_IGNORE) !== 0
    )
      flags = cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE;
  }
  info[0] |= undefinedInput
    ? cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED
    : cvt.RTL_UNICODETOTEXT_INFO_INVALID;
  const action =
    flags &
    (undefinedInput
      ? cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK
      : cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_MASK);
  switch (action) {
    case cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR:
    case cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR:
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR;
      return BadInputConversionAction.STOP;
    case cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE:
    case cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_IGNORE:
      if (prefixWritten !== null) prefixWritten[0] = false;
      return BadInputConversionAction.CONTINUE;
  }
  let replacement = 0x3f;
  if (
    action === cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_0 ||
    action === cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_0
  )
    replacement = 0;
  else if (
    action === cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_UNDERLINE ||
    action === cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_UNDERLINE
  )
    replacement = 0x5f;
  if (destinationBytes - destinationOffset[0] <= prefixLength)
    return BadInputConversionAction.NO_OUTPUT;
  for (let i = 0; i < prefixLength; i++)
    destination[destinationOffset[0]++] = (prefix as Uint8Array)[i] as number;
  destination[destinationOffset[0]++] = replacement;
  if (prefixWritten !== null) prefixWritten[0] = true;
  return BadInputConversionAction.CONTINUE;
}
