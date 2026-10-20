/** @fileoverview Original frozen ICU78.3 Unicode17 property vectors and block trie; shared typed-array offsets retain native storage. */
import data from "./uchar_props_data.json";
import type { UTrie2 } from "./utrie2.h";
import type { UCPTrie } from "./unicode/ucptrie";
export const propsVectorsTrie_index = new Uint16Array(data.propsVectorsTrie_index);
export const propsVectorsTrie: UTrie2 = {
  index: propsVectorsTrie_index,
  data16: propsVectorsTrie_index.subarray(5924),
  data32: null,
  indexLength: 5924,
  dataLength: 37208,
  index2NullOffset: 0xa40,
  dataNullOffset: 0x17a4,
  initialValue: 0,
  errorValue: 0,
  highStart: 0x110000,
  highValueIndex: 0xa878,
  memory: null,
  length: 0,
  isMemoryOwned: false,
  padding1: false,
  padding2: 0,
  newTrie: null,
};
export const propsVectors = new Uint32Array(data.propsVectors);
export const propsVectorsColumns = 3;
export const scriptExtensions = new Uint16Array(data.scriptExtensions);
export const block_trie: UCPTrie = {
  index: new Uint16Array(data.block_trieIndex),
  data: new Uint16Array(data.block_trieData),
  indexLength: 834,
  dataLength: 3098,
  highStart: 0x11000,
  shifted12HighStart: 0x11,
  type: 1,
  valueWidth: 0,
  reserved32: 0,
  reserved16: 0,
  index3NullOffset: 0x270,
  dataNullOffset: 0x7f4,
  nullValue: 0,
};

/** Original frozen main properties trie,including native shared index/data offsets. */
export const propsTrie_index = new Uint16Array(data.propsTrie_index);
export const propsTrie: UTrie2 = {
  index: propsTrie_index,
  data16: propsTrie_index.subarray(4628),
  data32: null,
  indexLength: 4628,
  dataLength: 19480,
  index2NullOffset: 0xa40,
  dataNullOffset: 0x1294,
  initialValue: 0,
  errorValue: 0,
  highStart: 0x110000,
  highValueIndex: 0x5e28,
  memory: null,
  length: 0,
  isMemoryOwned: false,
  padding1: false,
  padding2: 0,
  newTrie: null,
};
