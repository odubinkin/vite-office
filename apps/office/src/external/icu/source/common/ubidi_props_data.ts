/** @fileoverview Frozen ICU78.3 Unicode17 bidi trie and mirror words copied from ubidi_props_data.h; only data consumed by the default bidi resolver is exposed. */
// Copyright Unicode, Inc. and others. Unicode License V3: https://www.unicode.org/license.txt
import data from "./ubidi_props_data.json" with { type: "json" };
import type { UTrie2 } from "./utrie2.h";
const index = new Uint16Array(data.ubidi_props_trieIndex);
export const ubidi_props_trie: UTrie2 = {
  index,
  data16: index.subarray(3668),
  data32: null,
  indexLength: 3668,
  dataLength: 9720,
  index2NullOffset: 0x1a0,
  dataNullOffset: 0xed4,
  initialValue: 0,
  errorValue: 0,
  highStart: 0x110000,
  highValueIndex: 0x3448,
  memory: null,
  length: 0,
  isMemoryOwned: false,
  padding1: false,
  padding2: 0,
  newTrie: null,
};
export const ubidi_props_mirrors = new Uint32Array(data.ubidi_props_mirrors);
