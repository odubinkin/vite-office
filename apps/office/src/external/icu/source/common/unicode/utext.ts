/** @fileoverview ICU78.3 UText provider contracts, initializer fields and public UTF-16 provider lifecycle. */
import type { UnicodeString } from "../unistr";

/** Original callbacks consumed by native-index and forward codepoint operations. */
export interface UTextFuncs {
  /** Original provider length callback. @param text - Actual provider state. @returns Native length. */
  nativeLength(text: UText): number;
  /** Original provider access callback. @param text - Actual provider state. @param index - Native index. @param forward - Direction. @returns Whether access succeeds. */
  access(text: UText, index: number, forward: boolean): boolean;
  clone?: (
    dest: UTextStorage | null,
    src: OpenUText,
    deep: boolean,
    status: [number],
  ) => UTextStorage | null;
  close?: (text: OpenUText) => void;
  mapOffsetToNative: ((text: UText) => number) | null;
  mapNativeIndexToUTF16: ((text: UText, index: number) => number) | null;
}
/** Original prepared UText fields; UTF16 arrays borrow actual provider storage. */
export interface UText {
  chunkNativeStart: number;
  chunkNativeLimit: number;
  chunkOffset: number;
  chunkLength: number;
  nativeIndexingLimit: number;
  chunkContents: Uint16Array;
  context: Uint16Array | UnicodeString;
  providerProperties: number;
  a: number;
  pFuncs: UTextFuncs;
}
export const UTEXT_MAGIC = 0x345ad82c;

/** Original UText initializer. Nullable fields model the real unopened and closed states. */
export class UTextStorage {
  magic = UTEXT_MAGIC;
  flags = 0;
  chunkNativeStart = 0;
  chunkNativeLimit = 0;
  chunkOffset = 0;
  chunkLength = 0;
  nativeIndexingLimit = 0;
  chunkContents: Uint16Array | null = null;
  context: Uint16Array | UnicodeString | null = null;
  providerProperties = 0;
  a = 0;
  pFuncs: UTextFuncs | null = null;
  extraSize = 0;
  pExtra: Uint8Array | null = null;
}

/** Provider views become readable after a successful open. */
export type OpenUText = UTextStorage & UText;

export {
  utext_getNativeIndex,
  utext_moveIndex32,
  utext_setNativeIndex,
  utext_next32,
  utext_previous32,
  utext_current32,
  utext_getPreviousNativeIndex,
  utext_nativeLength,
  utext_char32At,
  utext_setup,
  utext_close,
  utext_openUChars,
  utext_openUnicodeString,
  utext_openConstUnicodeString,
  UTEXT_PROVIDER_STABLE_CHUNKS,
  utext_clone,
  utext_freeze,
} from "../utext";
