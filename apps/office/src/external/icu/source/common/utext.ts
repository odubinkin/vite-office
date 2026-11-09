/** @fileoverview Original ICU78.3 UText navigation and UChars provider opening, cloning and closing. */
import {
  UTEXT_MAGIC,
  UTextStorage,
  type OpenUText,
  type UText,
  type UTextFuncs,
} from "./unicode/utext";
import { UErrorCode as E, U_FAILURE, U_SUCCESS } from "./unicode/utypes";
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

const UTEXT_HEAP_ALLOCATED = 1;
const UTEXT_EXTRA_HEAP_ALLOCATED = 2;
const UTEXT_OPEN = 4;
const UTEXT_PROVIDER_LENGTH_IS_EXPENSIVE = 1;
const UTEXT_PROVIDER_STABLE_CHUNKS = 2;
const UTEXT_PROVIDER_WRITABLE = 3;
const UTEXT_PROVIDER_OWNS_TEXT = 5;
const gEmptyUString = new Uint16Array(1);

/** Original codepoint access by native index, including index normalization and cursor side effects. @param text - Actual provider. @param index - Native index. @returns Codepoint or sentinel. */
export function utext_char32At(text: UText, index: number): number {
  if (index >= text.chunkNativeStart && index < text.chunkNativeStart + text.nativeIndexingLimit) {
    text.chunkOffset = index - text.chunkNativeStart;
    const c = text.chunkContents[text.chunkOffset] as number;
    if ((c & 0xf800) !== 0xd800) return c;
  }
  utext_setNativeIndex(text, index);
  if (index < text.chunkNativeStart || text.chunkOffset >= text.chunkLength) return -1;
  const c = text.chunkContents[text.chunkOffset] as number;
  return (c & 0xf800) === 0xd800 ? utext_current32(text) : c;
}

/** Original preparation of caller or framework-owned text storage. @param text - Existing initialized storage or null. @param extraSpace - Provider extra storage size. @param status - Sticky status. @returns Prepared storage or original destination on failure. */
export function utext_setup(
  text: UTextStorage | null,
  extraSpace: number,
  status: [number],
): UTextStorage | null {
  if (U_FAILURE(status[0])) return text;
  if (text === null) {
    text = new UTextStorage();
    text.flags = UTEXT_HEAP_ALLOCATED;
    text.extraSize = extraSpace;
    text.pExtra = new Uint8Array(extraSpace);
  } else {
    if (text.magic !== UTEXT_MAGIC) {
      status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
      return text;
    }
    if (text.flags & UTEXT_OPEN) text.pFuncs?.close?.(text as OpenUText);
    text.flags &= ~UTEXT_OPEN;
    if (extraSpace > text.extraSize) {
      text.pExtra = new Uint8Array(extraSpace);
      text.extraSize = extraSpace;
      text.flags |= UTEXT_EXTRA_HEAP_ALLOCATED;
    }
  }
  text.flags |= UTEXT_OPEN;
  text.context = null;
  text.chunkContents = null;
  text.a = 0;
  text.chunkOffset = text.chunkLength = text.chunkNativeStart = text.chunkNativeLimit = 0;
  text.nativeIndexingLimit = text.providerProperties = 0;
  if (text.extraSize > 0) text.pExtra?.fill(0);
  return text;
}

/** Original provider close followed by managed framework storage release. @param text - Current storage or null. @returns Retained caller storage or null. */
export function utext_close(text: UTextStorage | null): UTextStorage | null {
  if (text === null || text.magic !== UTEXT_MAGIC || !(text.flags & UTEXT_OPEN)) return text;
  text.pFuncs?.close?.(text as OpenUText);
  text.flags &= ~UTEXT_OPEN;
  if (text.flags & UTEXT_EXTRA_HEAP_ALLOCATED) {
    text.pExtra = null;
    text.flags &= ~UTEXT_EXTRA_HEAP_ALLOCATED;
    text.extraSize = 0;
  }
  text.pFuncs = null;
  if (text.flags & UTEXT_HEAP_ALLOCATED) {
    text.magic = 0;
    return null;
  }
  return text;
}

/** Original provider writability bit clear. @param text - Actual provider storage. @returns Nothing. */
export function utext_freeze(text: UTextStorage): void {
  text.providerProperties &= ~(1 << UTEXT_PROVIDER_WRITABLE);
}

/** Original provider clone and optional read-only freeze. @param dest - Caller storage/null. @param src - Open source provider. @param deep - Request copied text. @param readOnly - Freeze the result. @param status - Sticky status. @returns Cloned or original destination storage. */
export function utext_clone(
  dest: UTextStorage | null,
  src: OpenUText,
  deep: boolean,
  readOnly: boolean,
  status: [number],
): UTextStorage | null {
  if (U_FAILURE(status[0])) return dest;
  const clone = src.pFuncs.clone as NonNullable<UTextFuncs["clone"]>;
  const result = clone(dest, src, deep, status);
  if (U_FAILURE(status[0])) return result;
  if (result === null) status[0] = E.U_MEMORY_ALLOCATION_ERROR;
  else if (readOnly) utext_freeze(result);
  return result;
}

/** Original shallow copy over UChars fields and destination-owned storage. @param dest - Caller storage/null. @param src - Open source. @param status - Sticky status. @returns Cloned storage. */
function shallowTextClone(
  dest: UTextStorage | null,
  src: OpenUText,
  status: [number],
): UTextStorage | null {
  if (U_FAILURE(status[0])) return null;
  const result = utext_setup(dest, src.extraSize, status);
  if (U_FAILURE(status[0]) || result === null) return result;
  const { flags, pExtra } = result;
  Object.assign(result, src);
  result.flags = flags;
  result.pExtra = pExtra;
  if (src.extraSize > 0 && src.pExtra !== null) pExtra?.set(src.pExtra.subarray(0, src.extraSize));
  result.providerProperties &= ~(1 << UTEXT_PROVIDER_OWNS_TEXT);
  return result;
}

/** Original UChars clone. A deep clone changes context, with the existing chunk pointer preserved by the source. @param dest - Caller storage/null. @param src - Open UChars provider. @param deep - Request copied text. @param status - Sticky status. @returns Cloned storage. */
function ucstrTextClone(
  dest: UTextStorage | null,
  src: OpenUText,
  deep: boolean,
  status: [number],
): UTextStorage | null {
  const result = shallowTextClone(dest, src, status);
  if (deep && U_SUCCESS(status[0]) && result !== null) {
    const length = utext_nativeLength(result as OpenUText);
    const copy = new Uint16Array(length + 1);
    copy.set(src.context.subarray(0, length));
    result.context = copy;
    result.providerProperties |= 1 << UTEXT_PROVIDER_OWNS_TEXT;
  }
  return result;
}

/** Original UChars close drops the source pointer only for an owning provider. @param text - Open UChars provider. @returns Nothing. */
function ucstrTextClose(text: OpenUText): void {
  if (text.providerProperties & (1 << UTEXT_PROVIDER_OWNS_TEXT))
    (text as UTextStorage).context = null;
}

const ucstrFuncs: UTextFuncs = {
  nativeLength: ucstrTextLength,
  access: ucstrTextAccess,
  clone: ucstrTextClone,
  close: ucstrTextClose,
  mapOffsetToNative: null,
  mapNativeIndexToUTF16: null,
};

/** Original UChars open accepts counted and NUL-terminated text. @param text - Caller storage/null. @param chars - Actual UTF16 pointer/null. @param length - Count or -1. @param status - Sticky status. @returns Open provider, or source failure result. */
export function utext_openUChars(
  text: UTextStorage | null,
  chars: Uint16Array | null,
  length: number,
  status: [number],
): UTextStorage | null {
  if (U_FAILURE(status[0])) return null;
  if (chars === null && length === 0) chars = gEmptyUString;
  if (chars === null || length < -1 || length > 0x7fffffff) {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    return null;
  }
  const result = utext_setup(text, 0, status);
  if (U_SUCCESS(status[0]) && result !== null) {
    result.pFuncs = ucstrFuncs;
    result.context = result.chunkContents = chars;
    result.providerProperties = 1 << UTEXT_PROVIDER_STABLE_CHUNKS;
    if (length === -1) result.providerProperties |= 1 << UTEXT_PROVIDER_LENGTH_IS_EXPENSIVE;
    result.a = length;
    result.chunkNativeLimit = result.chunkLength = result.nativeIndexingLimit = Math.max(0, length);
  }
  return result;
}
