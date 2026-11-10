/** @fileoverview Original ICU78.3 serialized UCPTrie loader against native-built bytes, descriptor fields, full scalar hashes and native rejection/status observations. */
import { assert, expect, it } from "vitest";
import observations from "./ucptrie.binary.native-observations.json" with { type: "json" };
import { ucptrie_openFromBinary, ucptrie_get } from "./unicode/ucptrie";

it.each(observations.fixtures)(
  "opens actual type$type width$width bytes with native state and all codepoint values",
  /** Binary bytes come from the original mutable builder/serializer, rather than a hand-built trie. @param fixture - Native observation. @returns Nothing. */ (
    fixture,
  ) => {
    const bytes = new Uint8Array(Buffer.from(fixture.binary, "base64")),
      status: [number] = [0],
      length: [number] = [777],
      trie = ucptrie_openFromBinary(-1, -1, bytes, bytes.length, length, status);
    assert(trie);
    expect(status[0]).toBe(0);
    let hash = 2166136261;
    for (let c = -1; c <= 0x110000; ++c)
      hash = Math.imul(hash ^ ucptrie_get(trie, c), 16777619) >>> 0;
    expect([
      length[0],
      trie.indexLength,
      trie.dataLength,
      trie.highStart,
      trie.shifted12HighStart,
      trie.type,
      trie.valueWidth,
      trie.reserved32,
      trie.reserved16,
      trie.index3NullOffset,
      trie.dataNullOffset,
      trie.nullValue,
      hash,
    ]).toEqual(fixture.state);
    expect(trie.index.buffer).toBe(bytes.buffer);
    expect(trie.data.buffer).toBe(bytes.buffer);
    const original = trie.data[65];
    trie.data[65] = 29;
    expect(ucptrie_get(trie, 65)).toBe(29);
    trie.data[65] = original as number;
    const padded = new Uint8Array(bytes.length + 4);
    padded.set(bytes, 4);
    const shifted = ucptrie_openFromBinary(
      fixture.type,
      fixture.width,
      padded.subarray(4),
      bytes.length,
      null,
      status,
    );
    assert(shifted);
    expect(shifted.index.buffer).toBe(padded.buffer);
    expect(shifted.nullValue).toBe(trie.nullValue);
  },
);

it.each(observations.fixtures)(
  "retains original error/status precedence for type$type width$width",
  /** Replays exactly the native witness's readable allocations and argument/header mutations. @param fixture - Native error observations. @returns Nothing. */ (
    fixture,
  ) => {
    for (const [variant, error, actual, success] of fixture.errors) {
      let bytes = new Uint8Array(Buffer.from(fixture.binary, "base64")),
        length = bytes.length,
        type = -1,
        width = -1;
      const status: [number] = [0],
        result: [number] = [777];
      if (variant === 0) status[0] = 1;
      if (variant === 1) status[0] = -127;
      if (variant === 2) length = 0;
      if (variant === 3) length = 15;
      if (variant === 4) length--;
      if (variant === 5) bytes[0] = (bytes[0] as number) ^ 1;
      if (variant === 6) {
        const header = new Uint16Array(bytes.buffer);
        header[2] = (header[2] as number) | 8;
      }
      if (variant === 7) type = 1 - fixture.type;
      if (variant === 8) width = (fixture.width + 1) % 3;
      if (variant === 9) type = 2;
      if (variant === 10) width = 3;
      if (variant === 11) bytes = bytes.subarray(1);
      const trie = ucptrie_openFromBinary(type, width, bytes, length, result, status);
      expect([status[0], result[0], Number(trie !== null)]).toEqual([error, actual, success]);
    }
  },
);
