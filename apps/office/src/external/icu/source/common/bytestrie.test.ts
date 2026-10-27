/** @fileoverview Regression cases from actual ICU78.3 serialized reader contracts; exhaustive original native-builder/resource comparisons live in icu-bytestrie-native-probe.mjs. */
import { describe, expect, it } from "vitest";
import { BytesTrie } from "./unicode/bytestrie";
import {
  UStringTrieResult as Result,
  USTRINGTRIE_MATCHES,
  USTRINGTRIE_HAS_VALUE,
  USTRINGTRIE_HAS_NEXT,
} from "./unicode/ustringtrie";

describe("original ICU byte-serialized trie", /** Exercises the original source contract. @returns Nothing. */ () => {
  it("preserves result predicates and numeric continuation bit", /** Exercises the original source contract. @returns Nothing. */ () => {
    for (const r of [0, 1, 2, 3]) {
      expect(USTRINGTRIE_MATCHES(r)).toBe(r !== 0);
      expect(USTRINGTRIE_HAS_VALUE(r)).toBe(r >= 2);
      expect(USTRINGTRIE_HAS_NEXT(r)).toBe(r & 1);
    }
  });
  it("retains linear state, shallow copies, borrowed storage identity and uint64 positions", /** Exercises the original source contract. @returns Nothing. */ () => {
    const data = Uint8Array.of(0x11, 97, 98, 0x23),
      trie = new BytesTrie(data);
    expect(trie.next(97)).toBe(Result.USTRINGTRIE_NO_VALUE);
    const state = new BytesTrie.State(),
      bits = trie.getState64(),
      copy = new BytesTrie(trie);
    trie.saveState(state);
    expect(bits).toBe((2n << 59n) | 2n);
    expect(trie.next(98)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
    expect(trie.getValue()).toBe(1);
    expect(copy.next(99)).toBe(Result.USTRINGTRIE_NO_MATCH);
    expect(trie.next(99)).toBe(Result.USTRINGTRIE_NO_MATCH);
    expect(trie.resetToState64(bits).next(98)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
    expect(new BytesTrie(data.subarray(0)).resetToState(state).next(98)).toBe(
      Result.USTRINGTRIE_FINAL_VALUE,
    );
    const different = new BytesTrie(data.slice());
    different.resetToState(state);
    expect(different.next(98)).toBe(Result.USTRINGTRIE_NO_MATCH);
    expect(copy.resetToState(state).next(98)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
  });
  it("preserves signed char promotion in the string overload rather than normalizing it like next(byte)", /** Exercises the original source contract. @returns Nothing. */ () => {
    const trie = new BytesTrie(Uint8Array.of(0x10, 255, 0x23));
    expect(trie.next(-1)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
    expect(trie.getValue()).toBe(1);
    expect(trie.reset().next(Uint8Array.of(255), 1)).toBe(Result.USTRINGTRIE_NO_MATCH);
    expect(trie.first(255)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
    expect(trie.reset().next(Uint8Array.of(0, 255, 0), -1)).toBe(Result.USTRINGTRIE_NO_VALUE);
    expect(trie.next(null, 0)).toBe(Result.USTRINGTRIE_NO_VALUE);
    expect(trie.first(-257)).toBe(Result.USTRINGTRIE_NO_MATCH);
  });
  it("preserves the original branch unique-value result even when subtrees differ (CALC-332)", /** Exercises the original source contract. @returns Nothing. */ () => {
    // Bytes from unchanged native BytesTrieBuilder: keys 0..7 =>11, keys 8..15 =>22.
    const trie = new BytesTrie(
      Uint8Array.from([
        0x0f, 0x08, 0x12, 0x0c, 0x08, 0x0c, 0x4d, 0x0d, 0x4d, 0x0e, 0x4d, 0x0f, 0x4d, 0x08, 0x4d,
        0x09, 0x4d, 0x0a, 0x4d, 0x0b, 0x4d, 0x04, 0x08, 0x04, 0x37, 0x05, 0x37, 0x06, 0x37, 0x07,
        0x37, 0x00, 0x37, 0x01, 0x37, 0x02, 0x37, 0x03, 0x37,
      ]),
    );
    const value: [number] = [999];
    expect(trie.hasUniqueValue(value)).toBe(true);
    expect(value[0]).toBe(22);
    expect(trie.first(0)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
    expect(trie.getValue()).toBe(11);
    expect(trie.first(15)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
    expect(trie.getValue()).toBe(22);
    let next = "";
    expect(
      trie.reset().getNextBytes({
        /** Owns the observed native continuation order. @param s - Byte span. @returns Nothing. */
        Append(s) {
          next += s;
        },
      }),
    ).toBe(16);
    expect(
      Array.from(
        next,
        /** Projects narrow units. @param c - Unit. @returns Byte. */ (c) => c.charCodeAt(0),
      ),
    ).toEqual(
      Array.from(
        { length: 16 },
        /** Enumerates source branch alphabet. @param unused - Unused. @param i - Index. @returns Byte. */ (
          _,
          i,
        ) => i,
      ),
    );
    expect(trie.current()).toBe(Result.USTRINGTRIE_NO_VALUE);
  });
  it("retains stopped states and ignores empty saved-state objects", /** Exercises the original source contract. @returns Nothing. */ () => {
    const trie = new BytesTrie(Uint8Array.of(0x10, 97, 0x23));
    expect(trie.next(98)).toBe(Result.USTRINGTRIE_NO_MATCH);
    const saved = new BytesTrie.State();
    trie.saveState(saved);
    trie.reset().resetToState(saved);
    expect(trie.next(null, 0)).toBe(Result.USTRINGTRIE_NO_MATCH);
    const unique: [number] = [123];
    expect(trie.hasUniqueValue(unique)).toBe(false);
    expect(unique[0]).toBe(123);
    trie.resetToState(new BytesTrie.State());
    expect(trie.current()).toBe(Result.USTRINGTRIE_NO_MATCH);
    expect(trie.first(97)).toBe(Result.USTRINGTRIE_FINAL_VALUE);
  });
});
