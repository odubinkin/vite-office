/** @fileoverview Original ICU78.3 native-index/forward codepoint operations and complete ucstrTextAccess over prepared original UText fields. No substitute UText factory is supplied. */
import type { UText } from "./unicode/utext";
/** Original native-index query. @param text - Actual prepared provider state. @returns Native index. */
export function utext_getNativeIndex(text: UText): number {
  return text.chunkOffset <= text.nativeIndexingLimit
    ? text.chunkNativeStart + text.chunkOffset
    : (text.pFuncs.mapOffsetToNative as NonNullable<typeof text.pFuncs.mapOffsetToNative>)(text);
}
/** Original index pinning and surrogate-boundary adjustment. @param text - Prepared provider state. @param index - Native index. @returns Nothing. */
export function utext_setNativeIndex(text: UText, index: number): void {
  if (index < text.chunkNativeStart || index >= text.chunkNativeLimit)
    text.pFuncs.access(text, index, true);
  else if (index - text.chunkNativeStart <= text.nativeIndexingLimit)
    text.chunkOffset = index - text.chunkNativeStart;
  else
    text.chunkOffset = (
      text.pFuncs.mapNativeIndexToUTF16 as NonNullable<typeof text.pFuncs.mapNativeIndexToUTF16>
    )(text, index);
  if (text.chunkOffset < text.chunkLength) {
    const c = text.chunkContents[text.chunkOffset] as number;
    if ((c & 0xfc00) === 0xdc00) {
      if (text.chunkOffset === 0) text.pFuncs.access(text, text.chunkNativeStart, false);
      if (
        text.chunkOffset > 0 &&
        ((text.chunkContents[text.chunkOffset - 1] as number) & 0xfc00) === 0xd800
      )
        --text.chunkOffset;
    }
  }
}
/** Original forward codepoint operation, retaining lone surrogates and provider transition order. @param text - Prepared provider state. @returns Codepoint or U_SENTINEL. */
export function utext_next32(text: UText): number {
  if (
    text.chunkOffset >= text.chunkLength &&
    !text.pFuncs.access(text, text.chunkNativeLimit, true)
  )
    return -1;
  const c = text.chunkContents[text.chunkOffset++] as number;
  if ((c & 0xfc00) !== 0xd800) return c;
  if (
    text.chunkOffset >= text.chunkLength &&
    !text.pFuncs.access(text, text.chunkNativeLimit, true)
  )
    return c;
  const trail = text.chunkContents[text.chunkOffset] as number;
  if ((trail & 0xfc00) !== 0xdc00) return c;
  ++text.chunkOffset;
  return ((c - 0xd800) << 10) + (trail - 0xdc00) + 0x10000;
}
/** Original UTF16 provider access, including deferred NUL-length scanning and codepoint-aligned chunks. @param text - Original prepared UChars provider fields. @param index - Native requested offset. @param forward - Direction. @returns Whether a character exists in the requested direction. */
export function ucstrTextAccess(text: UText, index: number, forward: boolean): boolean {
  const str = text.context;
  if (index < 0) index = 0;
  else if (index < text.chunkNativeLimit) {
    if (
      ((str[index] as number) & 0xfc00) === 0xdc00 &&
      index > 0 &&
      ((str[index - 1] as number) & 0xfc00) === 0xd800
    )
      --index;
  } else if (text.a >= 0) index = text.a;
  else {
    let scanLimit = index + 32;
    if (index + 32 > 0x7fffffff || index + 32 < 0) scanLimit = 0x7fffffff;
    let chunkLimit = text.chunkNativeLimit;
    for (; chunkLimit < scanLimit; ++chunkLimit) {
      if (str[chunkLimit] === 0) {
        text.a = text.chunkLength = text.nativeIndexingLimit = chunkLimit;
        if (index >= chunkLimit) index = chunkLimit;
        else if (
          ((str[index] as number) & 0xfc00) === 0xdc00 &&
          index > 0 &&
          ((str[index - 1] as number) & 0xfc00) === 0xd800
        )
          --index;
        text.chunkNativeLimit = chunkLimit;
        text.providerProperties &= ~2;
        text.chunkOffset = index;
        return (forward && index < text.chunkNativeLimit) || (!forward && index > 0);
      }
    }
    if (
      ((str[index] as number) & 0xfc00) === 0xdc00 &&
      index > 0 &&
      ((str[index - 1] as number) & 0xfc00) === 0xd800
    )
      --index;
    if (chunkLimit === 0x7fffffff) {
      text.a = text.chunkLength = text.nativeIndexingLimit = chunkLimit;
      if (index > chunkLimit) index = chunkLimit;
      text.chunkNativeLimit = chunkLimit;
      text.providerProperties &= ~2;
    } else {
      if (((str[chunkLimit - 1] as number) & 0xfc00) === 0xd800) --chunkLimit;
      text.chunkNativeLimit = text.nativeIndexingLimit = text.chunkLength = chunkLimit;
    }
  }
  text.chunkOffset = index;
  return (forward && index < text.chunkNativeLimit) || (!forward && index > 0);
}
