/** @fileoverview Native witnesses for LibreOffice's patched ICU78.3 Khmer engine. */
import { assert, expect, it } from "vitest";
import { KhmerBreakEngine } from "./dictbe.khmer";
import { openDictionaryMatcher } from "./dictionarydata";

const encoded =
  "IADaJxQAAAAAAAIARGljdAEAAAAAAAAAAAAAAAAAAAAgAAAAuAAAALgAAAC4AAAACAAAAIAXAAEAAAAAAAAAAAgXSRc8GFwaaB9sIhMAUh8ao1ASNh82on0UAVIYQhqkLBBXpXIUEzsfUh+jQRFAE3ECNjA9QEASHBdFmREbNkQSGkATpSwTH1IPOE8ATgF+E5gUFFIaEUEfoqoWABhSFjsHNqWGAwAyAZkYNlI+EAJxol8QAKNGFFIWOwc2o0YBASxSEhhCGj+iXxABo1oBNig3EARDEAR1";
const fixtures: readonly (readonly [string, number, number, string])[] = [
  ["", 0, 0, "0:0"],
  ["ភាសាខ្មែរ", 0, 9, "9:1,9"],
  ["ភាសាខ្មែរប្រទេសកម្ពុជា", 0, 22, "22:3,4,9,15"],
  ["សាលារៀនភាសាខ្មែរ", 0, 16, "16:3,4,7,11"],
  ["សាលារៀនសៀវភៅ", 0, 12, "12:2,4,7"],
  ["សាលារៀននិងមនុស្ស", 0, 16, "16:3,4,7,10"],
  ["ភាសាខ្មែរ។ប្រទេសកម្ពុជា", 0, 23, "23:3,4,10,16"],
  ["ភាសាខ្មែរៗប្រទេសកម្ពុជា", 0, 23, "23:3,4,10,16"],
  ["ភាសាខ្មែរ:ប្រទេសកម្ពុជា", 0, 23, "9:0"],
  ["ភាសាខ្មែរ⁠ប្រទេសកម្ពុជា", 0, 23, "23:1,16"],
  ["ភាសាខ្មែរ​ប្រទេសកម្ពុជា", 0, 23, "9:0"],
  ["ភាសាខ្មែរ‌ប្រទេសកម្ពុជា", 0, 23, "23:3,4,10,16"],
  ["ភាសាខ្មែរ‍ប្រទេសកម្ពុជា", 0, 23, "23:3,4,10,16"],
  ["ភាសាខ្មែរ⁠‍⁠ប្រទេសកម្ពុជា", 0, 25, "25:1,18"],
  ["ភាសាខ្មែរ​⁠ប្រទេសកម្ពុជា", 0, 24, "9:0"],
  ["កកកកកខខខខ", 0, 9, "9:3,2,4,6"],
  ["កខខខកកក", 0, 7, "7:2,2,4"],
  ["កកក្្គកខខ", 0, 9, "9:1,9"],
  ["ក្គក្គកកខខ", 0, 10, "10:1,10"],
  ["កកក្ខកកកខ", 0, 9, "9:4,2,4,5,7"],
  ["កកខក្", 0, 5, "5:1,5"],
  ["កក៌ខខខកកក", 0, 9, "9:3,1,3,6"],
  ["្កកខខ", 0, 5, "5:2,1,3"],
  ["ក", 0, 1, "1:0"],
  ["ក្", 0, 2, "2:1,2"],
  ["ក្គ", 0, 3, "3:1,3"],
  ["ក៏", 0, 2, "2:1,2"],
  ["។", 0, 1, "1:0"],
  ["៕", 0, 1, "1:0"],
  ["៖", 0, 1, "1:0"],
  ["⁠", 0, 1, "1:0"],
  ["​", 0, 1, "0:0"],
  ["ភាសាខ្មែរ።", 0, 10, "9:1,9"],
  ["ភាសាខ្មែរ😀", 0, 11, "9:1,9"],
  ["ភាសាខ្មែរ »", 0, 11, "9:0"],
  ["ភាសាខ្មែរ»x", 0, 11, "9:0"],
  ["ភាសាខ្មែរ\n", 0, 10, "9:0"],
  ["ភាសាខ្មែរ x", 0, 11, "9:0"],
  ["😀ភាសាខ្មែរប្រទេសកម្ពុជា!", 2, 21, "21:4,2,6,11,17"],
  ["xភាសាខ្មែរ⁠ប្រទេសកម្ពុជា»x", 1, 23, "23:1,17"],
  ["«ភាសាខ្មែរប្រទេសកម្ពុជា»", 1, 20, "20:3,5,10,16"],
  ["x​ភាសាខ្មែរប្រទេសកម្ពុជា", 2, 20, "20:1,17"],
  ["មនុស្សនិងសៀវភៅ", 3, 10, "10:2,3,10"],
  ["មនុស្សនិងសៀវភៅ", 0, 8, "8:1,8"],
  ["😀ភាសាខ្មែរ", 1, 9, "0:0"],
];

it("matches the patched native Khmer cursor and weighted word boundaries", /** Uses the original ICU gendict bytes and observed patched native results. @returns Nothing. */ () => {
  const bytes = Uint8Array.from(
    atob(encoded),
    /** Reads the original packed byte. @param character - Binary unit. @returns Byte. */ (
      character,
    ) => character.charCodeAt(0),
  );
  const matcher = openDictionaryMatcher(bytes);
  assert(matcher);
  const engine = new KhmerBreakEngine(matcher);
  for (const [text, start, end, expected] of fixtures) {
    const cursor: [number] = [0],
      breaks: number[] = [];
    const count = engine.findBreaks(text, cursor, start, end, breaks, false, [0]);
    expect([`${cursor[0]}:${count}`, ...breaks].join(","), JSON.stringify([text, start, end])).toBe(
      expected,
    );
  }
});
