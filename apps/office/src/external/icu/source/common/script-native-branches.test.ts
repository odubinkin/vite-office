/** @fileoverview Replays original C++ trie-width/index and complete script-code switch observations. */
import { expect, it } from "vitest";
import fixture from "./native-script-branches.json";
import { ucptrie_get, _UCPTRIE_CP_INDEX } from "./ucptrie";
import { UCPTrieType, UCPTrieValueWidth, type UCPTrie } from "./unicode/ucptrie";
import { UScriptCode } from "./unicode/uscript";
import { unicode } from "../../../../i18nutil/source/utility/unicode";

it("matches original native frozen fields for FAST/SMALL,18-bit groups,all widths and bounds", /** Replays actual native getter results;the malformed width is an explicit raw-getter observation. @returns Nothing. */ () => {
  for (let i = 0; i < fixture.fixtures.length; ++i) {
    const input = fixture.fixtures[i] as (typeof fixture.fixtures)[number];
    const index = new Uint16Array(input.indexLength);
    for (const [offset, value] of input.indexEntries) index[offset as number] = value as number;
    const data =
      input.valueWidth === 1
        ? new Uint32Array(input.dataLength)
        : input.valueWidth === 2
          ? new Uint8Array(input.dataLength)
          : new Uint16Array(input.dataLength);
    for (const [offset, value] of input.dataEntries) data[offset as number] = value as number;
    const trie: UCPTrie = {
      index,
      data,
      indexLength: index.length,
      dataLength: data.length,
      highStart: input.highStart,
      shifted12HighStart: input.highStart >> 12,
      type: input.type,
      valueWidth: input.valueWidth,
      reserved32: 0,
      reserved16: 0,
      index3NullOffset: 0,
      dataNullOffset: 0,
      nullValue: 0,
    };
    for (const [owner, codePoint, expectedIndex, expectedValue] of fixture.trieRows)
      if (owner === i) {
        expect(
          _UCPTRIE_CP_INDEX(trie, input.type === 0 ? 0xffff : 0xfff, codePoint as number),
        ).toBe(expectedIndex);
        expect(ucptrie_get(trie, codePoint as number)).toBe(expectedValue);
      }
  }
});

it("matches the original utility switch for every declared numeric script and both boundaries", /** Covers composite scripts that primary Unicode properties never return. @returns Nothing. */ () => {
  for (const [code, expected] of fixture.scriptRows)
    expect(unicode.getScriptClassFromUScriptCode(code as UScriptCode)).toBe(expected);
  expect([
    UCPTrieType.UCPTRIE_TYPE_ANY,
    UCPTrieType.UCPTRIE_TYPE_FAST,
    UCPTrieType.UCPTRIE_TYPE_SMALL,
  ]).toEqual([-1, 0, 1]);
  expect([
    UCPTrieValueWidth.UCPTRIE_VALUE_BITS_ANY,
    UCPTrieValueWidth.UCPTRIE_VALUE_BITS_16,
    UCPTrieValueWidth.UCPTRIE_VALUE_BITS_32,
    UCPTrieValueWidth.UCPTRIE_VALUE_BITS_8,
  ]).toEqual([-1, 0, 1, 2]);
});
