/** @fileoverview Consumed original ICU78.3 UText chunk/provider fields. Provider construction, cloning and general lifecycle remain outside this interface projection. */
/** Original callbacks consumed by native-index and forward codepoint operations. */
export interface UTextFuncs {
  /** Original provider access callback. @param text - Actual provider state. @param index - Native index. @param forward - Direction. @returns Whether access succeeds. */
  access(text: UText, index: number, forward: boolean): boolean;
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
  context: Uint16Array;
  providerProperties: number;
  a: number;
  pFuncs: UTextFuncs;
}
export { utext_getNativeIndex, utext_setNativeIndex, utext_next32 } from "../utext";
