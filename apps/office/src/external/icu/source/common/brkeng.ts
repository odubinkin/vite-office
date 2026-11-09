/** @fileoverview ICU break-engine factory dispatch from opened dictionary data to the original matcher owners. */
import {
  BytesDictionaryMatcher,
  DictionaryData,
  type DictionaryMatcher,
  UCharsDictionaryMatcher,
} from "./dictionarydata";
import { udata_close, udata_getMemory } from "./unicode/udata";
import type { UDataMemory } from "./udatamem.h";

/** Original binary matcher dispatch within ICULanguageBreakFactory::loadDictionaryMatcherFor. @param file - Actual opened dictionary data. @returns Owning matcher or null after closing the handle. */
export function openDictionaryMatcher(file: UDataMemory): DictionaryMatcher | null {
  const data = udata_getMemory(file) as Uint8Array;
  const layout = DictionaryData;
  const indexes = new Int32Array(data.buffer, data.byteOffset, layout.IX_COUNT);
  const offset = indexes[layout.IX_STRING_TRIE_OFFSET] as number;
  const trieType = (indexes[layout.IX_TRIE_TYPE] as number) & layout.TRIE_TYPE_MASK;
  if (trieType === layout.TRIE_TYPE_BYTES) {
    return new BytesDictionaryMatcher(
      data.subarray(offset),
      indexes[layout.IX_TRANSFORM] as number,
      file,
    );
  }
  if (trieType === layout.TRIE_TYPE_UCHARS) {
    const characters = new Uint16Array(
      data.buffer,
      data.byteOffset + offset,
      Math.trunc((data.byteLength - offset) / 2),
    );
    return new UCharsDictionaryMatcher(characters, file);
  }
  udata_close(file);
  return null;
}
