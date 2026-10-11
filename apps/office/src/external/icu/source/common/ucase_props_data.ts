/** @fileoverview Original generated ICU78.3 Unicode17 case data; literal singleton fields and shared index/data16 storage are retained. */
import data from "./ucase_props_data.json";
import type { UCaseProps } from "./ucase.h";

export const ucase_props_dataVersion = new Uint8Array(data.dataVersion);
export const ucase_props_indexes = new Int32Array(data.indexes);
export const ucase_props_trieIndex = new Uint16Array(data.trieIndex);
export const ucase_props_exceptions = new Uint16Array(data.exceptions);
export const ucase_props_unfold = new Uint16Array(data.unfold);
export const ucase_props_singleton: UCaseProps = {
  mem: null,
  indexes: ucase_props_indexes,
  exceptions: ucase_props_exceptions,
  unfold: ucase_props_unfold,
  trie: {
    index: ucase_props_trieIndex,
    data16: ucase_props_trieIndex.subarray(data.trie.data16Offset),
    data32: null,
    indexLength: data.trie.indexLength,
    dataLength: data.trie.dataLength,
    index2NullOffset: data.trie.index2NullOffset,
    dataNullOffset: data.trie.dataNullOffset,
    initialValue: data.trie.initialValue,
    errorValue: data.trie.errorValue,
    highStart: data.trie.highStart,
    highValueIndex: data.trie.highValueIndex,
    memory: null,
    length: data.trie.length,
    isMemoryOwned: data.trie.isMemoryOwned,
    padding1: data.trie.padding1,
    padding2: data.trie.padding2,
    newTrie: null,
  },
  formatVersion: new Uint8Array(data.formatVersion),
};
