/** @fileoverview Original ICU78.3 native-index, current/forward/backward codepoint and length operations plus UChars access/length over prepared UText fields. No substitute UText factory is supplied. */
import type { UText } from "./unicode/utext";
/** Original native-length forwarding. @param text - Prepared provider. @returns Native length. */
export function utext_nativeLength(text: UText): number {
  return text.pFuncs.nativeLength(text);
}
/** Original UChars deferred-length query preserves the current cursor. @param text - Prepared UChars fields. @returns Native UTF16 length. */
export function ucstrTextLength(text: UText): number {
  if (text.a < 0) {
    while (text.context[text.chunkNativeLimit] !== 0) ++text.chunkNativeLimit;
    text.a = text.chunkNativeLimit;
    text.chunkLength = text.chunkNativeLimit;
    text.nativeIndexingLimit = text.chunkLength;
    text.providerProperties &= ~2;
  }
  return text.a;
}
/** Original backward codepoint query, including provider transitions and lone surrogates. @param text - Prepared provider. @returns Codepoint or U_SENTINEL. */
export function utext_previous32(text: UText): number {
  if (text.chunkOffset <= 0 && !text.pFuncs.access(text, text.chunkNativeStart, false)) return -1;
  const c = text.chunkContents[--text.chunkOffset] as number;
  if ((c & 0xfc00) !== 0xdc00) return c;
  if (text.chunkOffset <= 0 && !text.pFuncs.access(text, text.chunkNativeStart, false)) return c;
  const lead = text.chunkContents[text.chunkOffset - 1] as number;
  if ((lead & 0xfc00) !== 0xd800) return c;
  --text.chunkOffset;
  return ((lead - 0xd800) << 10) + (c - 0xdc00) + 0x10000;
}
/** Original previous-native-index query retains transient provider/cursor operations. @param text - Prepared provider. @returns Previous native index or zero. */
export function utext_getPreviousNativeIndex(text: UText): number {
  const i = text.chunkOffset - 1;
  if (i >= 0 && ((text.chunkContents[i] as number) & 0xfc00) !== 0xdc00) {
    if (i <= text.nativeIndexingLimit) return text.chunkNativeStart + i;
    text.chunkOffset = i;
    const result = (
      text.pFuncs.mapOffsetToNative as NonNullable<typeof text.pFuncs.mapOffsetToNative>
    )(text);
    ++text.chunkOffset;
    return result;
  }
  if (text.chunkOffset === 0 && text.chunkNativeStart === 0) return 0;
  utext_previous32(text);
  const result = utext_getNativeIndex(text);
  utext_next32(text);
  return result;
}
/** Original current-codepoint query restores the preceding chunk after inspecting a possible cross-chunk surrogate. @param text - Prepared provider. @returns Current scalar/lone surrogate or U_SENTINEL. */
export function utext_current32(text: UText): number {
  if (
    text.chunkOffset === text.chunkLength &&
    !text.pFuncs.access(text, text.chunkNativeLimit, true)
  )
    return -1;
  const c = text.chunkContents[text.chunkOffset] as number;
  if ((c & 0xfc00) !== 0xd800) return c;
  let trail = 0;
  if (text.chunkOffset + 1 < text.chunkLength)
    trail = text.chunkContents[text.chunkOffset + 1] as number;
  else {
    const position = text.chunkNativeLimit;
    if (text.pFuncs.access(text, position, true))
      trail = text.chunkContents[text.chunkOffset] as number;
    const restored = text.pFuncs.access(text, position, false);
    text.chunkOffset = text.chunkLength - 1;
    if (!restored) return -1;
  }
  return (trail & 0xfc00) === 0xdc00 ? ((c - 0xd800) << 10) + (trail - 0xdc00) + 0x10000 : c;
}
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
