/** @fileoverview Native ICU78.3 Southeast Asian engine witnesses with compiled gendict dictionaries. */
import { assert, expect, it } from "vitest";
import { openDictionaryMatcher } from "./brkeng";
import { openEncodedDictionary } from "../../../../../../../scripts/icu-dictionary-observe";
import {
  type OpenUText,
  utext_close,
  utext_getNativeIndex,
  utext_openUChars,
} from "./unicode/utext";
import { UVector32 } from "./uvectr32.h";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ThaiBreakEngine, LaoBreakEngine, BurmeseBreakEngine } from "./dictbe";
import { UErrorCode } from "./unicode/utypes";

const engines = { th: ThaiBreakEngine, lo: LaoBreakEngine, my: BurmeseBreakEngine };
const fixtures: readonly (readonly [
  keyof typeof engines,
  string,
  readonly (readonly [string, string])[],
])[] = [
  [
    "th",
    "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAAVQAAAFUAAABVAAAAAAAAAAAOAAEAAAAAAAAAAAcIHQghGy4gREQRFyIhFCMwQBcoIBMgMikyIRIyKTIhASwCNAQ4ByEgAQIkByEgEAQhEAch",
    [
      ["", "0:0"],
      ["ก", "1:0"],
      ["กขค", "3:0"],
      ["กขคง", "4:0"],
      ["กขคงจ", "5:2,3,4"],
      ["กขงกขค", "6:2,2,3"],
      ["กขจงกขค", "7:3,2,3,4"],
      ["กขคกขคง", "7:2,3,6"],
      ["ภาษาไทย", "7:1,4"],
      ["ประเทศภาษาไทย", "13:1,10"],
      ["ภาษาไทยๆกข", "10:2,4,8"],
      ["ภาษาไทยฯๆกข", "11:2,4,9"],
      ["ภาษาไทยๆๆกข", "11:3,4,8,9"],
      ["กขั้คงจ", "7:3,1,4,6"],
      ["กขถผฬคงจ", "8:3,1,5,7"],
      ["กขคงจ xกขค", "5:2,3,4"],
      ["กขคงจ😀กขค", "5:2,3,4"],
      ["xภาษาไทย", "0:0"],
    ],
  ],
  [
    "lo",
    "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAAVAAAAFQAAABUAAAAAAAAAIAOAAEAAAAAAAAAAAcIHAghGy4eQiURMichEzBAFxQgEx4yKjIhEjIqMiEBLAI0BDgHISABAiQHISAQBCEQByE=",
    [
      ["", "0:0"],
      ["ກ", "1:0"],
      ["ກຂຄ", "3:0"],
      ["ກຂຄງ", "4:1,3"],
      ["ກຂຄງຈ", "5:2,3,4"],
      ["ກຂງກຂຄ", "6:2,2,3"],
      ["ກຂຈງກຂຄ", "7:3,2,3,4"],
      ["ກຂຄກຂຄງ", "7:2,3,6"],
      ["ພາສາລາວ", "7:1,4"],
      ["ປະເທດພາສາລາວ", "12:1,9"],
      ["ກຂັ່ຄງຈ", "7:3,1,4,6"],
      ["ກຂຖຜຮຄງຈ", "8:3,1,5,7"],
      ["ກຂຄງຈ xກຂຄ", "5:2,3,4"],
      ["ກຂຄງຈ😀ກຂຄ", "5:2,3,4"],
      ["xພາສາລາວ", "0:0"],
    ],
  ],
  [
    "my",
    "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAAVgAAAFYAAABWAAAAAAAAAAAQAAEAAAAAAAAAAAYEIQQhBTQUOBkUPBQ6GSwhIBAsIRQxFTwKOiAVGTwUOhksIQAsATQCEAQhIAEBJAQhIBACIQ==",
    [
      ["", "0:0"],
      ["က", "1:0"],
      ["ကခဂ", "3:0"],
      ["ကခဂင", "4:1,3"],
      ["ကခဂငစ", "5:2,3,4"],
      ["ကခငကခဂ", "6:2,2,3"],
      ["ကခစငကခဂ", "7:3,2,3,4"],
      ["ကခဂကခဂင", "7:2,3,6"],
      ["မြန်မာစာ", "8:1,6"],
      ["နေပြည်မြန်မာစာ", "14:1,12"],
      ["ကခိဲဂငစ", "7:3,1,4,6"],
      ["ကခဍဗရဂငစ", "8:3,1,5,7"],
      ["ကခဂငစ xကခဂ", "5:2,3,4"],
      ["ကခဂငစ😀ကခဂ", "5:2,3,4"],
      ["xမြန်မာစာ", "0:0"],
    ],
  ],
];

/** Opens the actual counted UTF-16 provider for a fixture. @param value - Input fixture. @returns Open provider. */
function openText(value: string) {
  const text = unicode(value);
  const provider = utext_openUChars(null, text.getStr(), text.getLength(), [0]);
  text.dispose();
  assert(provider);
  return provider as OpenUText;
}

/** Opens the actual gendict resource for a native engine. @param encoded - Original packed Dict bytes. @returns Native dictionary. */
function dictionary(encoded: string) {
  const result = openDictionaryMatcher(openEncodedDictionary(encoded));
  assert(result);
  return result;
}

for (const [language, encoded, examples] of fixtures)
  it(`matches ICU ${language} scan, cursor and breaks over native dictionary bytes`, /** Covers source short-run admission, lookahead, resynchronization, marks and suffixes. @returns Nothing. */ () => {
    const engine = new engines[language](dictionary(encoded), [0]);
    for (const [text, native] of examples) {
      const provider = openText(text);
      const breaks = new UVector32([0]);
      const count = engine.findBreaks(provider, 0, text.length, breaks, false, [0]);
      const result = [`${utext_getNativeIndex(provider)}:${count}`];
      for (let i = 0; i < breaks.size(); ++i) result.push(String(breaks.elementAti(i)));
      utext_close(provider);
      expect(result.join(","), text).toBe(native);
    }
    engine.dispose();
  });

it("starts at the requested native offset and preserves earlier stack entries and sticky errors", /** Checks a genuine Thai span inside mixed text. @returns Nothing. */ () => {
  const sample = fixtures[0];
  assert(sample);
  const engine = new ThaiBreakEngine(dictionary(sample[1]), [0]);
  expect(engine.handles(0x0e01, "en")).toBe(true);
  expect(engine.handles(0x20, "th")).toBe(false);
  const text = "😀ภาษาไทย x";
  const provider = openText(text);
  const breaks = new UVector32([0]);
  breaks.push(1, [0]);
  expect(engine.findBreaks(provider, 2, text.length, breaks, true, [0])).toBe(1);
  expect([breaks.elementAti(0), breaks.elementAti(1)]).toEqual([1, 6]);
  expect(utext_getNativeIndex(provider)).toBe(9);
  expect(
    engine.findBreaks(provider, 2, text.length, breaks, false, [UErrorCode.U_INVALID_STATE_ERROR]),
  ).toBe(0);
  expect(utext_getNativeIndex(provider)).toBe(9);
  expect([breaks.elementAti(0), breaks.elementAti(1)]).toEqual([1, 6]);
  utext_close(provider);
  engine.dispose();
});
