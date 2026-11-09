/** @fileoverview Shared native dictionary replay driver over actual matcher and UText owners. */
import { openDictionaryMatcher } from "../apps/office/src/external/icu/source/common/brkeng";
import { DictionaryData } from "../apps/office/src/external/icu/source/common/dictionarydata";
import {
  UDataMemory,
  UDataMemory_init,
  UDataMemory_setData,
} from "../apps/office/src/external/icu/source/common/udatamem.h";
import {
  type OpenUText,
  utext_close,
  utext_getNativeIndex,
  utext_openUChars,
  utext_setNativeIndex,
} from "../apps/office/src/external/icu/source/common/unicode/utext";

/** Portable description of a source matcher operation. */
export interface DictionaryCase {
  name: string;
  text: string;
  start: number;
  max: number;
  limit: number;
  mask: number;
}

/** Builds a test dictionary image containing the trie serialized by the original ICU builder. @param kind - Original trie type. @param units - Native serialized units. @returns Actual data handle. */
export function makeDictionaryFixture(kind: number, units: readonly number[]): UDataMemory {
  const width = kind === DictionaryData.TRIE_TYPE_UCHARS ? 2 : 1;
  const bytes = new Uint8Array(24 + 32 + units.length * width);
  bytes.set([24, 0, 0xda, 0x27, 20, 0, 0, 0, 0, 0, 2, 0, 68, 105, 99, 116, 1, 0, 0, 0]);
  const indexes = new Int32Array(bytes.buffer, 24, DictionaryData.IX_COUNT);
  indexes[DictionaryData.IX_STRING_TRIE_OFFSET] = 32;
  indexes[DictionaryData.IX_TOTAL_SIZE] = bytes.length - 24;
  indexes[DictionaryData.IX_TRIE_TYPE] = kind | DictionaryData.TRIE_HAS_VALUES;
  indexes[DictionaryData.IX_TRANSFORM] = DictionaryData.TRANSFORM_TYPE_OFFSET | 0x0e00;
  if (width === 1) bytes.set(units, 56);
  else new Uint16Array(bytes.buffer, 56).set(units);
  const file = new UDataMemory();
  UDataMemory_init(file);
  file.heapAllocated = true;
  UDataMemory_setData(file, bytes);
  return file;
}

/** Observes every output, including untouched sentinel slots and the consumed UText position. @param file - Open dictionary. @param input - Case description. @returns Native-comparable row. */
export function observeDictionary(file: UDataMemory, input: DictionaryCase): number[] {
  const matcher = openDictionaryMatcher(file);
  if (matcher === null) throw new Error("Native dictionary did not yield a matcher");
  const chars = new Uint16Array(input.text.length);
  for (let i = 0; i < chars.length; ++i) chars[i] = input.text.charCodeAt(i);
  const text = utext_openUChars(null, chars, chars.length, [0]) as OpenUText;
  utext_setNativeIndex(text, input.start);
  const lengths = new Int32Array(4).fill(8777);
  const cpLengths = new Int32Array(4).fill(8777);
  const values = new Int32Array(4).fill(8777);
  const prefix: [number] = [7888];
  try {
    const count = matcher.matches(
      text,
      input.max,
      input.limit,
      input.mask & 1 ? lengths : null,
      input.mask & 2 ? cpLengths : null,
      input.mask & 4 ? values : null,
      input.mask & 8 ? prefix : null,
    );
    return [
      matcher.getType(),
      count,
      prefix[0],
      utext_getNativeIndex(text),
      ...lengths,
      ...cpLengths,
      ...values,
    ];
  } finally {
    matcher.dispose();
    utext_close(text);
  }
}
