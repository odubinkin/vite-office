/** @fileoverview Native LibreOffice dictionary boundary witnesses using original ICU packaged rules. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import {
  ICULanguageBreakFactory,
  type WordDictionaryName,
} from "../../../external/icu/source/common/brkeng";
import { LanguageTag } from "../../../i18nlangtag/source/languagetag/languagetag.value";
import { DICTIONARY_WORD } from "../../../offapi/com/sun/star/i18n/WordType";
import { getLocaleDataBreakIteratorRules } from "../localedata/localedata";
import { BreakIteratorImpl } from "./breakiteratorImpl";

/** Loads a genuine shipped ICU dictionary. @param name - Resource identity. @returns Native bytes. */
function load(name: WordDictionaryName): Uint8Array {
  return readFileSync(`src/external/icu/source/data/brkitr/${name}.dict`);
}

const cases = [
  "",
  "  \ud83d\ude00/\u2014\u200b",
  "-alma- a-b a--b",
  "A.B. mail:x",
  "\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22\u4e2d\u6587",
  "\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a\u2060\u1794\u17d2\u179a\u1791\u17c1\u179f\u1780\u1798\u17d2\u1796\u17bb\u1787\u17b6",
  "\ud840\udc00a\ud83d\ude00b\ud800",
  "a\u00a0b\u200bc\t.",
];
const fixtures: readonly (readonly [string, readonly string[]])[] = [
  [
    "en-US",
    [
      "0:0,0:0,0:0,0:0,0:0,0:0",
      "0:0,0:0,0:0,0:0,1:1,1:1,2:2,2:2,3:3,3:3,4:4,4:4,5:5,5:5,6:6,6:6,7:7,7:7,7:7,7:7",
      "0:0,0:0,0:0,1:5,0:0,1:5,1:5,1:5,1:5,1:5,1:5,1:5,1:5,1:5,1:5,7:10,7:10,7:10,7:10,7:10,7:10,7:10,7:10,7:10,11:12,11:12,11:12,11:12,11:12,14:15,14:15,14:15,14:15,15:15,15:15,15:15",
      "0:0,0:0,0:0,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,10:11,10:11,10:11,11:11,11:11,11:11",
      "0:0,0:0,0:0,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,4:7,4:7,4:7,4:7,4:7,4:7,7:9,7:9,7:9,7:9,9:9,9:9,9:9",
      "0:0,0:0,0:0,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,23:23,0:23,23:23,23:23,23:23",
      "0:0,0:0,0:0,0:2,2:2,2:2,0:2,2:3,2:3,2:3,2:3,5:6,5:6,5:6,5:6,7:7,5:6,7:7,7:7,7:7",
      "0:0,0:0,0:0,0:1,0:1,0:1,2:3,2:3,2:3,2:3,4:5,4:5,4:5,4:5,6:7,6:7,6:7,7:7,7:7,7:7",
    ],
  ],
  [
    "hu-HU",
    [
      "0:0,0:0,0:0,0:0,0:0,0:0",
      "0:0,0:0,0:0,0:0,1:1,1:1,2:2,2:2,3:3,3:3,4:4,4:4,5:5,5:5,6:6,6:6,7:7,7:7,7:7,7:7",
      "0:0,0:0,0:0,0:6,0:0,0:6,0:6,0:6,0:6,0:6,0:6,0:6,0:6,0:6,0:6,7:10,7:10,7:10,7:10,7:10,7:10,7:10,7:10,7:10,11:15,11:15,11:15,11:15,11:15,11:15,11:15,11:15,11:15,15:15,15:15,15:15",
      "0:0,0:0,0:0,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,10:11,10:11,10:11,11:11,11:11,11:11",
      "0:0,0:0,0:0,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,4:7,4:7,4:7,4:7,4:7,4:7,7:9,7:9,7:9,7:9,9:9,9:9,9:9",
      "0:0,0:0,0:0,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,23:23,0:23,23:23,23:23,23:23",
      "0:0,0:0,0:0,0:2,2:2,2:2,0:2,2:3,2:3,2:3,2:3,5:6,5:6,5:6,5:6,7:7,5:6,7:7,7:7,7:7",
      "0:0,0:0,0:0,0:1,0:1,0:1,2:3,2:3,2:3,2:3,4:5,4:5,4:5,4:5,6:7,6:7,6:7,7:7,7:7,7:7",
    ],
  ],
  [
    "de-AT",
    [
      "0:0,0:0,0:0,0:0,0:0,0:0",
      "0:0,0:0,0:0,0:0,1:1,1:1,2:2,2:2,3:3,3:3,4:4,4:4,5:5,5:5,6:6,6:6,7:7,7:7,7:7,7:7",
      "0:0,0:0,0:0,0:6,0:0,0:6,0:6,0:6,0:6,0:6,0:6,0:6,0:6,0:6,0:6,7:10,7:10,7:10,7:10,7:10,7:10,7:10,7:10,7:10,11:12,11:12,11:12,11:12,11:12,14:15,14:15,14:15,14:15,15:15,15:15,15:15",
      "0:0,0:0,0:0,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,5:9,10:11,10:11,10:11,11:11,11:11,11:11",
      "0:0,0:0,0:0,0:4,0:4,0:4,0:4,0:4,0:4,0:4,0:4,4:7,4:7,4:7,4:7,4:7,4:7,7:9,7:9,7:9,7:9,9:9,9:9,9:9",
      "0:0,0:0,0:0,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,0:23,23:23,0:23,23:23,23:23,23:23",
      "0:0,0:0,0:0,0:2,2:2,2:2,0:2,2:3,2:3,2:3,2:3,5:6,5:6,5:6,5:6,7:7,5:6,7:7,7:7,7:7",
      "0:0,0:0,0:0,0:1,0:1,0:1,2:3,2:3,2:3,2:3,4:5,4:5,4:5,4:5,6:7,6:7,6:7,7:7,7:7,7:7",
    ],
  ],
];

for (const [language, expected] of fixtures)
  it(`matches native ${language} dictionary ranges in both directions`, /** Includes suffix skipping, surrogate offsets and whitespace-only ranges. @returns Nothing. */ () => {
    const service = new BreakIteratorImpl();
    service.BindWordDictionaryFactory(
      new ICULanguageBreakFactory({
        thaidict: load("thaidict"),
        laodict: load("laodict"),
        burmesedict: load("burmesedict"),
        khmerdict: load("khmerdict"),
        cjdict: load("cjdict"),
      }),
    );
    const locale = new LanguageTag(language).getLocale();
    for (const [index, text] of cases.entries()) {
      const result: string[] = [];
      for (let offset = -1; offset <= text.length + 1; ++offset)
        for (const forward of [false, true]) {
          const { startPos, endPos } = service.getWordBoundary(
            text,
            offset,
            locale,
            DICTIONARY_WORD,
            forward,
          );
          result.push(`${startPos}:${endPos}`);
        }
      expect(result.join(","), JSON.stringify(text)).toBe(expected[index]);
    }
  });

it("reads actual inherited locale rule arrays with the original fallback", /** Verifies locale resource ownership independent of ICU segmentation. @returns Nothing. */ () => {
  expect(getLocaleDataBreakIteratorRules(new LanguageTag("de-AT").getLocale())[1]).toBe(
    "dict_word_prepostdash",
  );
  expect(getLocaleDataBreakIteratorRules(new LanguageTag("nl-BE").getLocale())[1]).toBe(
    "dict_word_prepostdash",
  );
  expect(getLocaleDataBreakIteratorRules(new LanguageTag("sv-FI").getLocale())[1]).toBe(
    "dict_word_prepostdash",
  );
  expect(getLocaleDataBreakIteratorRules(new LanguageTag("en-US").getLocale())).toEqual([
    "",
    "",
    "",
    "",
    "",
  ]);
});
