/** @fileoverview Differential witnesses from unchanged ICU78.3 handleNext on native LibreOffice dictionary rules. */
import { assert, expect, it } from "vitest";
import {
  type OpenUText,
  utext_close,
  utext_openUChars,
} from "../../../external/icu/source/common/unicode/utext";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ucptrie_openFromBinary } from "../../../external/icu/source/common/ucptrie";
import { UErrorCode } from "../../../external/icu/source/common/unicode/utypes";
import { openRule, registerOpenOfficeRules } from "./breakiterator_unicode.rules";

const names = ["dict_word", "dict_word_hu", "dict_word_prepostdash"];

// Each native witness records boundary:largest-status:dictionary-count before dictionary refinement.
const native: readonly (readonly [string, string, string, string])[] = [
  ["", "", "", ""],
  ["a b", "1:200:0,2:0:0,3:200:0", "1:200:0,2:0:0,3:200:0", "1:200:0,2:0:0,3:200:0"],
  ["a-b", "3:200:0", "3:200:0", "3:200:0"],
  ["-a-", "1:0:0,2:200:0,3:0:0", "3:200:0", "1:0:0,2:200:0,3:0:0"],
  ["a--b", "1:200:0,2:0:0,3:0:0,4:200:0", "4:200:0", "1:200:0,2:0:0,3:0:0,4:200:0"],
  ["a:b", "1:200:0,2:0:0,3:200:0", "1:200:0,2:0:0,3:200:0", "1:200:0,2:0:0,3:200:0"],
  ["a.b", "3:200:0", "3:200:0", "3:200:0"],
  [
    "A.B.C. Mr. Smith",
    "6:200:0,7:0:0,10:0:0,11:0:0,16:200:0",
    "6:200:0,7:0:0,10:0:0,11:0:0,16:200:0",
    "6:200:0,7:0:0,10:0:0,11:0:0,16:200:0",
  ],
  ["ab. cd", "3:0:0,4:0:0,6:200:0", "3:0:0,4:0:0,6:200:0", "3:0:0,4:0:0,6:200:0"],
  [
    "42.5 2,000 7:20",
    "4:100:0,5:0:0,10:100:0,11:0:0,12:100:0,13:0:0,15:100:0",
    "4:100:0,5:0:0,10:100:0,11:0:0,12:100:0,13:0:0,15:100:0",
    "4:100:0,5:0:0,10:100:0,11:0:0,12:100:0,13:0:0,15:100:0",
  ],
  [
    "123-456 x123 x_2",
    "3:100:0,4:0:0,7:100:0,8:0:0,12:100:0,13:0:0,16:100:0",
    "7:100:0,8:0:0,12:100:0,13:0:0,16:100:0",
    "3:100:0,4:0:0,7:100:0,8:0:0,12:100:0,13:0:0,16:100:0",
  ],
  [
    "don't we\u2019ll",
    "5:200:0,6:0:0,11:200:0",
    "5:200:0,6:0:0,11:200:0",
    "5:200:0,6:0:0,11:200:0",
  ],
  [
    "\u05d0\u05d1\u05f3\u05d2 \u05d0\u05d1\u05f4\u05d2 \u05d0\u05d1'\u05d2",
    "4:200:0,5:0:0,9:200:0,10:0:0,14:200:0",
    "4:200:0,5:0:0,9:200:0,10:0:0,14:200:0",
    "4:200:0,5:0:0,9:200:0,10:0:0,14:200:0",
  ],
  ["a\u0301e\u200c\u0301b", "6:200:0", "6:200:0", "6:200:0"],
  ["\u0301\u0308a", "2:0:0,3:200:0", "2:0:0,3:200:0", "2:0:0,3:200:0"],
  [
    "a\r\nb\nc\r\td",
    "1:200:0,3:0:0,4:200:0,5:0:0,6:200:0,7:0:0,8:0:0,9:200:0",
    "1:200:0,3:0:0,4:200:0,5:0:0,6:200:0,7:0:0,8:0:0,9:200:0",
    "1:200:0,3:0:0,4:200:0,5:0:0,6:200:0,7:0:0,8:0:0,9:200:0",
  ],
  [
    "a\u00a0b\u200bb",
    "1:200:0,2:0:0,3:200:0,4:0:0,5:200:0",
    "1:200:0,2:0:0,3:200:0,4:0:0,5:200:0",
    "1:200:0,2:0:0,3:200:0,4:0:0,5:200:0",
  ],
  [
    "a\u2028b\u2029c",
    "1:200:0,2:0:0,3:200:0,4:0:0,5:200:0",
    "1:200:0,2:0:0,3:200:0,4:0:0,5:200:0",
    "1:200:0,2:0:0,3:200:0,4:0:0,5:200:0",
  ],
  [
    "foo\u2014bar foo\u2013bar foo\u2212bar",
    "3:200:0,4:0:0,7:200:0,8:0:0,11:200:0,12:0:0,15:200:0,16:0:0,19:200:0,20:0:0,23:200:0",
    "7:200:0,8:0:0,15:200:0,16:0:0,19:200:0,20:0:0,23:200:0",
    "3:200:0,4:0:0,7:200:0,8:0:0,11:200:0,12:0:0,15:200:0,16:0:0,19:200:0,20:0:0,23:200:0",
  ],
  [
    "ma-gyar -alma alma- a\u00adb",
    "7:200:0,8:0:0,9:0:0,13:200:0,14:0:0,18:200:0,19:0:0,20:0:0,23:200:0",
    "7:200:0,8:0:0,13:200:0,14:0:0,19:200:0,20:0:0,23:200:0",
    "7:200:0,8:0:0,13:200:0,14:0:0,19:0:0,20:0:0,23:200:0",
  ],
  ["\u4e2d\u6587", "2:400:2", "2:400:2", "2:400:2"],
  [
    "a\u4e2d\u6587b",
    "1:200:1,3:400:2,4:200:0",
    "1:200:1,3:400:2,4:200:0",
    "1:200:1,3:400:2,4:200:0",
  ],
  [
    "\u3042\u3044\u3046\u30a8\u30a8\uff21\uff22\uff23",
    "5:400:5,8:200:0",
    "5:400:5,8:200:0",
    "5:400:5,8:200:0",
  ],
  [
    "\ud55c\uae00 \uc6cc\ub4dc",
    "2:200:2,3:0:1,5:200:2",
    "2:200:2,3:0:1,5:200:2",
    "2:200:2,3:0:1,5:200:2",
  ],
  [
    "\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22\u0e20\u0e32\u0e29\u0e32",
    "11:200:11",
    "11:200:11",
    "11:200:11",
  ],
  ["\u1019\u103c\u1014\u103a\u1019\u102c\u1005\u102c", "8:200:8", "8:200:8", "8:200:8"],
  ["\u1797\u17b6\u179f\u17b6\u1781\u17d2\u1798\u17c2\u179a", "9:200:9", "9:200:9", "9:200:9"],
  [
    "\ud83c\uddfa\ud83c\uddf8\ud83c\udde8\ud83c\udde6\ud83c\udde9",
    "4:0:0,8:0:0,10:0:0",
    "4:0:0,8:0:0,10:0:0",
    "4:0:0,8:0:0,10:0:0",
  ],
  [
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc66a\ud83d\ude00",
    "8:0:0,9:200:0,11:0:0",
    "8:0:0,9:200:0,11:0:0",
    "8:0:0,9:200:0,11:0:0",
  ],
  ["\ud840\udc00a", "2:400:1,3:200:0", "2:400:1,3:200:0", "2:400:1,3:200:0"],
  ["\ud800a\udc00", "1:0:0,2:200:0,3:0:0", "1:0:0,2:200:0,3:0:0", "1:0:0,2:200:0,3:0:0"],
  ["a\u0000b", "1:200:0,2:0:0,3:200:0", "1:200:0,2:0:0,3:200:0", "1:200:0,2:0:0,3:200:0"],
  ["\uffff a", "1:0:0,2:0:0,3:200:0", "1:0:0,2:0:0,3:200:0", "1:0:0,2:0:0,3:200:0"],
  [
    "\u0915\u0930\u094d\u092e \u0939\u093f\u0928\u094d\u0926\u0940 \u0915\u094d\u200d\u0937",
    "4:200:0,5:0:0,11:200:0,12:0:0,16:200:0",
    "4:200:0,5:0:0,11:200:0,12:0:0,16:200:0",
    "4:200:0,5:0:0,11:200:0,12:0:0,16:200:0",
  ],
  [
    "r\u00e9\u00e9crire\u2014d\u00e9j\u00e0",
    "8:200:0,9:0:0,13:200:0",
    "13:200:0",
    "8:200:0,9:0:0,13:200:0",
  ],
];

for (const [index, rule] of names.entries())
  it(`matches native ICU forward candidates and statuses for ${rule}`, /** Compares the actual compiled table and category trie to the original ICU loop. @returns Nothing. */ () => {
    const status: [number] = [0];
    registerOpenOfficeRules(status);
    const iterator = openRule(rule, status);
    assert(iterator);
    for (const entry of native) {
      const value = unicode(entry[0]);
      const provider = utext_openUChars(null, value.getStr(), value.getLength(), status);
      assert(provider);
      iterator.setText(provider as OpenUText, status);
      const actual: string[] = [];
      for (let position = iterator.handleNext(); position !== -1; position = iterator.handleNext())
        actual.push(`${position}:${iterator.getRuleStatus()}:${iterator.fDictionaryCharCount}`);
      utext_close(provider);
      value.dispose();
      expect(actual.join(","), JSON.stringify(entry[0])).toBe(entry[index + 1]);
    }
    iterator.dispose();
  });

it("preserves native Tri3 sticky errors and leaves the length output untouched on rejection", /** Uses the original binary loader's status boundary. @returns Nothing. */ () => {
  const length: [number] = [123],
    status: [number] = [UErrorCode.U_ZERO_ERROR];
  expect(ucptrie_openFromBinary(0, -1, new Uint8Array(16), 16, length, status)).toBeNull();
  expect(status[0]).toBe(UErrorCode.U_INVALID_FORMAT_ERROR);
  expect(length[0]).toBe(123);
  expect(ucptrie_openFromBinary(0, -1, new Uint8Array(0), 0, length, status)).toBeNull();
  expect(status[0]).toBe(UErrorCode.U_INVALID_FORMAT_ERROR);
});
