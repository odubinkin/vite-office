/** @fileoverview Portable replay of native trie builders, matching results and adopted dictionary ownership. */
import { expect, it } from "vitest";
import {
  makeDictionaryFixture,
  observeDictionary,
} from "../../../../../../../scripts/icu-dictionary-observe";
import native from "./dictionarydata.native-observations.json" with { type: "json" };
import { UCharsTrie } from "./unicode/ucharstrie";
import { openDictionaryMatcher } from "./brkeng";

it("matches the original UCharsTrie codepoint and stopped transitions", /** Replays the actual native builder's UTF-16 trie. @returns Nothing. */ () => {
  const trie = new UCharsTrie(new Uint16Array(native.u));
  expect([
    trie.current(),
    trie.getValue(),
    trie.firstForCodePoint(0x1f600),
    trie.getValue(),
    trie.nextForCodePoint(120),
    trie.getValue(),
    trie.next(121),
    trie.current(),
    trie.reset().current(),
    trie.getValue(),
    trie.first(0x1f600),
  ]).toEqual(native.traversal);
});

for (const [name, type, units] of [
  ["U", 1, native.u],
  ["B", 0, native.b],
] as const) {
  it(`matches original dictionary outputs and cursor for kind ${name}`, /** Uses actual file adoption and the native builder data. @returns Nothing. */ () => {
    for (const c of native.cases) {
      if (c.name !== name) continue;
      const file = makeDictionaryFixture(type, units);
      expect(observeDictionary(file, c), JSON.stringify(c)).toEqual(c.expected);
      expect(file.pHeader).toBeNull();
    }
  });
}

it("closes a dictionary handle whose trie kind has no owner", /** Exercises the original factory's invalid-type cleanup. @returns Nothing. */ () => {
  const file = makeDictionaryFixture(7, []);
  expect(openDictionaryMatcher(file)).toBeNull();
  expect(file.pHeader).toBeNull();
});
