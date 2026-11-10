/** @fileoverview Native CJK and Korean boundary witnesses for compiled ICU78.3 dictionary data. */
import { assert, expect, it } from "vitest";
import { CjkBreakEngine, CjkLanguageType } from "./dictbe.cjk";
import { openDictionaryMatcher } from "./dictionarydata";
import { normalizeCjkInput } from "./normalizer2impl.cjk";

const bytes =
  "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAA6gAAAOoAAADqAAAACQAAAAAAAAAAAAAAAAAAABMAZlsxAAGsFwABrB6Aba0IAACuCoBc1QcAQNgwAADcBYAwALTFKIDBB22tAgAArhSAMAm0xWSAZlsIAOVlCQBxZwwAXnlQgACsD4AwAB91eIBwCixnMAWeihSAMACsTnEZJ1lmW/SBrDAaAKwwCgCzMAsAyDCQgS1OCwAnWTAAZltugDAcqzBngHBAkAHIMG6AwQf9VhSAh2WwBZ6KSohLMA0AZzAOAGowHoBrMAqAqzAwAL8w8SWrMMowvoBwBWowQYAwAFkwKIA=";
const fixtures: readonly (readonly [
  "cj" | "ko",
  readonly (readonly [string, number, number, string, string])[],
])[] = [
  [
    "cj",
    [
      ["", 0, 0, "0:0", "0:0"],
      ["中文語日本語", 0, 6, "6:2,2,3", "6:2,2,3"],
      ["東京大学", 0, 4, "4:1,2", "4:1,2"],
      ["東京大学学生", 0, 6, "6:2,2,4", "6:2,2,4"],
      ["ｶﾞｶ", 0, 3, "3:0", "3:0"],
      ["ガカカタカナ", 0, 6, "6:1,2", "6:0"],
      ["カタカナカタカナカタカナカタカナカタカナ", 0, 20, "20:4,4,8,12,16", "20:0"],
      ["カタカナカタカナカタカナカタカナカタカ", 0, 19, "19:5,4,8,12,16,18", "19:0"],
      ["ﾊﾟｶﾞ", 0, 4, "4:1,2", "4:0"],
      ["ヿ神コト", 0, 4, "4:2,1,2", "4:2,1,2"],
      ["𠀀中文𠀀", 0, 6, "6:2,2,4", "6:2,2,4"],
      ["「中文日本語」", 0, 7, "0:0", "0:0"],
      ["中文日本語42", 0, 7, "5:1,2", "5:2,2,5"],
      ["中文日本語!", 0, 6, "5:1,2", "5:1,2"],
      ["日本語かなです", 0, 7, "7:3,3,4,5", "7:0"],
      ["日本語かなに", 0, 6, "6:3,3,4,5", "6:0"],
      ["日本語𖿰中国", 0, 7, "7:2,3,5", "7:2,3,5"],
      ["😀中文日本語", 0, 7, "0:0", "0:0"],
      ["カタカナ。ひらがな", 0, 9, "4:0", "4:0"],
      ["」東京大学42", 1, 5, "5:1,3", "5:3,1,3,5"],
      ["😀東京大学日本語!", 2, 10, "9:2,4,6", "9:2,4,6"],
      ["「ｶﾞヿ中文語」", 1, 7, "7:3,3,4,6", "7:2,4,6"],
    ],
  ],
  [
    "ko",
    [
      ["", 0, 0, "0:0", "0:0"],
      ["한글", 0, 2, "2:0", "2:0"],
      ["한글한국어", 0, 5, "5:2,2,3", "5:2,2,3"],
      ["가각가각", 0, 4, "4:3,1,2,3", "4:3,1,2,3"],
      ["가각😀한글", 0, 6, "2:1,1", "2:1,1"],
      ["한글을입력", 0, 5, "5:0", "5:0"],
      ["국어한국어", 0, 5, "5:2,2,3", "5:2,2,3"],
      ["한국어!", 0, 4, "3:1,1", "3:1,1"],
      ["한국어42", 0, 5, "3:1,1", "3:2,1,3"],
      ["한글」", 0, 3, "2:0", "2:0"],
      ["한국어中文", 0, 5, "3:1,1", "3:2,1,3"],
      ["」한글42", 1, 3, "3:0", "3:2,1,3"],
      ["😀한글한국어", 2, 7, "7:2,4,5", "7:2,4,5"],
    ],
  ],
];

for (const [language, cases] of fixtures)
  it(`matches native ${language} word and phrase segmentation`, /** Uses actual gendict bytes and compares native UTF16 position, count and boundaries. @returns Nothing. */ () => {
    const dictionary = openDictionaryMatcher(
      Uint8Array.from(
        atob(bytes),
        /** Reads the packed ICU byte. @param unit - Binary character. @returns Unsigned byte. */ (
          unit,
        ) => unit.charCodeAt(0),
      ),
    );
    assert(dictionary);
    const engine = new CjkBreakEngine(
      dictionary,
      language === "ko" ? CjkLanguageType.kKorean : CjkLanguageType.kChineseJapanese,
    );
    for (const [text, start, end, word, phrase] of cases) {
      for (const flag of [false, true]) {
        const cursor: [number] = [0],
          boundaries: number[] = [];
        const count = engine.findBreaks(text, cursor, start, end, boundaries, flag, [0]);
        expect(
          [`${cursor[0]}:${count}`, ...boundaries].join(","),
          JSON.stringify([text, start, end, flag]),
        ).toBe(flag ? phrase : word);
      }
    }
  });

it("preserves source UTF16 chunk starts after compatibility composition and expansion", /** Compares NFKC narrowing, expansion and supplementary codepoint positions. @returns Nothing. */ () => {
  expect(normalizeCjkInput("xｶﾞ神ヿ𠀀y", 1, 7)).toEqual({
    text: "ガ神コト𠀀",
    sourceOffsets: [1, 3, 4, 4, 5, 7],
  });
  expect(normalizeCjkInput("東京𠀀", 0, 4)).toEqual({ text: "東京𠀀" });
});
