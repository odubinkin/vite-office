/** @fileoverview Complete original handleundefinedunicodetotextchar.cxx contract;offset cells bind borrowed pointer-to-pointer arguments without clamping source consumption or logical destination writes. */
import { isHighSurrogate, isLowSurrogate } from "../inc/rtl/character";
import * as cvt from "../inc/rtl/textcvt.h";
import { ImplIsControlOrFormat, ImplIsPrivateUse, ImplIsZeroWidth } from "./unichars.hxx";
import { RTL_TEXTCVT_BYTE_PRIVATE_START, RTL_TEXTCVT_BYTE_PRIVATE_END } from "./tenchelp";
/** Original ordered ignore predicate. @param character - Native UTF16 unit. @param flags - Native flags. @returns Whether the undefined unit is ignored. */
function ImplIsUnicodeIgnoreChar(character: number, flags: number): boolean {
  return (
    ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_NONSPACING_IGNORE) !== 0 && ImplIsZeroWidth(character)) ||
    ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_CONTROL_IGNORE) !== 0 &&
      ImplIsControlOrFormat(character)) ||
    ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_IGNORE) !== 0 && ImplIsPrivateUse(character))
  );
}
/** Original undefined ASCII fallback with destination check before flag selection. @param flags - Native flags. @param buffer - Borrowed byte storage. @param offset - Current output pointer. @param maxLength - Native remaining logical capacity. @returns Whether one byte was written. */
function ImplGetUndefinedAsciiMultiByte(
  flags: number,
  buffer: Uint8Array | Int8Array,
  offset: number,
  maxLength: number,
): boolean {
  if (maxLength === 0) return false;
  switch (flags & cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK) {
    case cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_0:
      buffer[offset] = 0;
      break;
    case cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_UNDERLINE:
      buffer[offset] = 0x5f;
      break;
    case cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_QUESTIONMARK:
    default:
      buffer[offset] = 0x3f;
      break;
  }
  return true;
}
/** Original invalid ASCII fallback with destination check before flag selection. @param flags - Native flags. @param buffer - Borrowed byte storage. @param offset - Current output pointer. @param maxLength - Native remaining logical capacity. @returns Whether one byte was written. */
function ImplGetInvalidAsciiMultiByte(
  flags: number,
  buffer: Uint8Array | Int8Array,
  offset: number,
  maxLength: number,
): boolean {
  if (maxLength === 0) return false;
  switch (flags & cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_MASK) {
    case cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_0:
      buffer[offset] = 0;
      break;
    case cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_UNDERLINE:
      buffer[offset] = 0x5f;
      break;
    case cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_QUESTIONMARK:
    default:
      buffer[offset] = 0x3f;
      break;
  }
  return true;
}
/** Handles one undefined original UTF16 unit,including the original early private write and partial surrogate consumption. @param source - Borrowed UTF16 storage. @param sourceOffset - Original source pointer cell. @param sourceEnd - Original end source pointer. @param destination - Borrowed byte storage. @param destinationOffset - Original destination pointer cell. @param destinationEnd - Original end destination pointer. @param flags - Native unsigned32 flags. @param info - Original accumulated status cell. @returns Whether the caller should continue. */
export function handleUndefinedUnicodeToTextChar(
  source: Uint16Array,
  sourceOffset: [number],
  sourceEnd: number,
  destination: Uint8Array | Int8Array,
  destinationOffset: [number],
  destinationEnd: number,
  flags: number,
  info: [number],
): boolean {
  let character = source[sourceOffset[0]] as number;
  if (character >= RTL_TEXTCVT_BYTE_PRIVATE_START && character <= RTL_TEXTCVT_BYTE_PRIVATE_END) {
    if ((flags & cvt.RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0) !== 0) {
      destination[destinationOffset[0]] = character - RTL_TEXTCVT_BYTE_PRIVATE_START;
      destinationOffset[0]++;
      sourceOffset[0]++;
      return true;
    }
  }
  if (ImplIsUnicodeIgnoreChar(character, flags)) {
    sourceOffset[0]++;
    return true;
  }
  if (isHighSurrogate(character)) {
    if (sourceOffset[0] + 1 === sourceEnd) {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL;
      return false;
    }
    character = source[sourceOffset[0] + 1] as number;
    if (isLowSurrogate(character)) sourceOffset[0]++;
    else {
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_INVALID;
      if (
        (flags & cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_MASK) ===
        cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR
      ) {
        info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR;
        return false;
      }
      if (
        (flags & cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_MASK) ===
        cvt.RTL_UNICODETOTEXT_FLAGS_INVALID_IGNORE
      ) {
        sourceOffset[0]++;
        return true;
      }
      if (
        ImplGetInvalidAsciiMultiByte(
          flags,
          destination,
          destinationOffset[0],
          destinationEnd - destinationOffset[0],
        )
      ) {
        sourceOffset[0]++;
        destinationOffset[0]++;
        return true;
      }
      info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
      return false;
    }
  }
  info[0] |= cvt.RTL_UNICODETOTEXT_INFO_UNDEFINED;
  if (
    (flags & cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK) ===
    cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR
  ) {
    info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR;
    return false;
  }
  if (
    (flags & cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK) ===
    cvt.RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE
  )
    sourceOffset[0]++;
  else if (
    ImplGetUndefinedAsciiMultiByte(
      flags,
      destination,
      destinationOffset[0],
      destinationEnd - destinationOffset[0],
    )
  ) {
    sourceOffset[0]++;
    destinationOffset[0]++;
  } else {
    info[0] |= cvt.RTL_UNICODETOTEXT_INFO_ERROR | cvt.RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL;
    return false;
  }
  return true;
}
