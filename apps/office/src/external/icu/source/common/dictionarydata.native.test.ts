/** @fileoverview Patched ICU78.3 dictionary matcher observations with native gendict fixtures. */
import { assert, expect, it } from "vitest";
import { PossibleWord } from "./dictbe";
import { openDictionaryMatcher } from "./dictionarydata";

/** Converts the original Dict bytes into the host's borrowed binary view. @param encoded - Native fixture. @returns Bytes. */
function bytes(encoded: string): Uint8Array {
  const raw = atob(encoded),
    data = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) data[i] = raw.charCodeAt(i);
  return data;
}

const cases: readonly (readonly [number, number, number, number, string, string])[] = [
  [0, 30, 20, 0, "", ""],
  [0, 30, 20, 0, "", "\u0e01\u0e02\u0e04"],
  [0, 2, 20, 0, "", "\u0e01\u0e02\u0e04"],
  [0, 30, 1, 0, "", "\u0e01\u0e02\u0e04"],
  [0, 30, 0, 0, "", "\u0e01\u0e02\u0e04"],
  [1, 30, 20, 0, "", "x\u0e01\u0e02\u0e04"],
  [0, 0, 20, 0, "", "\u0e01\u0e02\u0e04"],
  [0, 30, 20, 0, "", "\u0e01\u200d"],
  [0, 30, 20, 0, "", "\u0e01\u200c"],
  [0, 30, 20, 0, "", "\u0e01a"],
  [0, 30, 20, 0, "", "\u0e01\u0e02\u0e07"],
  [0, 30, 20, 0, "\u0e02", "\u0e01\u0e02\u0e04"],
  [0, 1, 20, 0, "\u0e01", "\u0e01\u0e02\u0e04"],
  [0, 2, 20, 3, "", "\u0e01\u0e02\u0e04"],
  [0, 1, 20, 2, "", "\u0e02\u0e01"],
  [0, 30, 20, 0, "", "\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22"],
  [0, 30, 20, 0, "", "\u4e2d\u6587\u8a9e"],
  [0, 2, 20, 0, "", "\u4e2d\u6587\u8a9e"],
  [0, 30, 1, 0, "", "\u4e2d\u6587\u8a9e"],
  [0, 30, 20, 0, "\u6587", "\u4e2d\u6587\u8a9e"],
  [0, 30, 20, 0, "", "\ud840\udc00\u4eba"],
  [0, 30, 20, 0, "\ud840\udc00", "\ud840\udc00\u4eba"],
  [2, 30, 20, 0, "", "\ud840\udc00\u4e2d\u6587"],
  [0, 30, 20, 0, "", "\u31f0\u30ab"],
  [0, 30, 20, 0, "", "\u4eba"],
  [0, 30, 20, 0, "", "\u56de\u6587"],
  [0, 30, 20, 0, "", "\u4e2d\u83ef"],
];

const fixtures: readonly (readonly [string, string, readonly string[]])[] = [
  [
    "bytes",
    "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAAUAAAAFAAAABQAAAACAAAAAAOAAEAAAAAAAAAAAgIDwijWgmjZAqjbgujeAyjggEwAkwEo0YHo1A0AwIwB3H+o5b/o4xIEARdhBAEmQ==",
    [
      "0:0",
      "3:3,1:1:10,2:2:20,3:3:30",
      "2:2,1:1:10,2:2:20",
      "3:3,1:1:10",
      "3:3",
      "4:3,1:1:10,2:2:20,3:3:30",
      "1:1,1:1:10",
      "2:2,1:1:10,2:2:140",
      "2:2,1:1:10,2:2:150",
      "2:2,1:1:10,2:2:140",
      "3:3,1:1:10,2:2:20",
      "3:3,1:1:10,3:3:30",
      "2:2,2:2:20",
      "3:3,3:3:30",
      "2:2",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
      "2:1",
      "3:2",
      "3:1",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
    ],
  ],
  [
    "uchars",
    "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAAfAAAAHwAAAB8AAAACQAAAAAAAAAAAAAAAAAAAAkA3lYRAN5WDADgVkiA/VZbgJ6KGIFA2DAAANxwF7pON4CwEYdlmoLwMQgAAE4MgC1OBwC6Tr6Ahk/0gTAAqzDGgkJAKKD9ViKBh2UCAO+DrYBwQEoInorqwQl0",
    [
      "0:0",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
      "2:1",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
      "1:1",
      "2:2",
      "1:1",
      "1:1",
      "1:1",
      "3:3,1:1:41000,2:2:2122,3:3:32142345",
      "2:2,1:1:41000,2:2:2122",
      "3:3,1:1:41000",
      "3:3,1:1:41000,3:3:32142345",
      "2:1",
      "3:2",
      "4:2,1:1:41000,2:2:2122",
      "2:2,2:2:710",
      "1:1,1:1:190",
      "2:2,1:1:69,2:2:666",
      "2:2,1:1:41000,2:2:173",
    ],
  ],
];

for (const [type, encoded, observations] of fixtures)
  it(`matches patched ICU ${type} candidates, statuses and cursor movement`, /** Compares both real gendict trie formats and the patched continuation order. @returns Nothing. */ () => {
    const matcher = openDictionaryMatcher(bytes(encoded));
    assert(matcher);
    for (const [index, [start, extent, capacity, minimum, ignored, text]] of cases.entries()) {
      const position: [number] = [start],
        prefix: [number] = [-1];
      const lengths: number[] = [],
        scalarLengths: number[] = [],
        values: number[] = [];
      const ignore = ignored
        ? {
            /** Admits the exact test UnicodeSet string member. @param code - Source scalar. @returns Whether ignored. */
            contains(code: number): boolean {
              return ignored === String.fromCodePoint(code);
            },
          }
        : null;
      const count = matcher.matches(
        text,
        position,
        extent,
        capacity,
        lengths,
        scalarLengths,
        values,
        prefix,
        ignore,
        minimum,
      );
      const trace = [`${position[0]}:${prefix[0]}`];
      for (let i = 0; i < count; ++i) trace.push(`${lengths[i]}:${scalarLengths[i]}:${values[i]}`);
      expect(trace.join(","), JSON.stringify(cases[index])).toBe(observations[index]);
    }
  });

it("reuses the original offset cache while choosing and backing up marked words", /** Exercises native PossibleWord semantics over a genuine byte dictionary. @returns Nothing. */ () => {
  const matcher = openDictionaryMatcher(bytes(fixtures[0]?.[1] ?? ""));
  assert(matcher);
  const word = new PossibleWord(),
    position: [number] = [0],
    text = "กขคง";
  expect(word.candidates(text, position, matcher, text.length)).toBe(3);
  expect(position[0]).toBe(3);
  expect(word.longestPrefix()).toBe(3);
  expect(word.backUp(position)).toBe(true);
  expect(position[0]).toBe(2);
  word.markCurrent();
  expect(word.backUp(position)).toBe(true);
  expect(word.backUp(position)).toBe(false);
  expect(word.markedCPLength()).toBe(2);
  expect(word.acceptMarked(position)).toBe(2);
  expect(position[0]).toBe(2);
  position[0] = 0;
  expect(word.candidates(text, position, matcher, 1)).toBe(3);
  expect(position[0]).toBe(3);
  position[0] = 3;
  expect(word.candidates(text, position, matcher, text.length)).toBe(1);
  expect(position[0]).toBe(4);
});

it("restores the original position when a trie prefix yields no candidate", /** A range can be consumed speculatively even when no word is accepted. @returns Nothing. */ () => {
  const matcher = openDictionaryMatcher(bytes(fixtures[1]?.[1] ?? ""));
  assert(matcher);
  const word = new PossibleWord(),
    position: [number] = [0];
  expect(word.candidates("ㇰx", position, matcher, 2)).toBe(0);
  expect(position[0]).toBe(0);
  expect(word.longestPrefix()).toBe(2);
});
