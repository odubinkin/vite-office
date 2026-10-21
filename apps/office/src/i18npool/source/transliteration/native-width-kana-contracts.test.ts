/** @fileoverview Native width/kana/size/traditional module contracts,independent source-table BMP fingerprints and original scalar/range quirks. */
import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { MultipleCharsOutputException } from "../../../offapi/com/sun/star/i18n/MultipleCharsOutputException";
import { hiraganaToKatakana } from "./hiraganaToKatakana";
import { katakanaToHiragana } from "./katakanaToHiragana";
import {
  fullwidthToHalfwidth,
  FULLWIDTHKATAKANA_HALFWIDTHKATAKANA,
  FULLWIDTH_HALFWIDTH_LIKE_ASC,
} from "./fullwidthToHalfwidth";
import {
  halfwidthToFullwidth,
  HALFWIDTHKATAKANA_FULLWIDTHKATAKANA,
  HALFWIDTH_FULLWIDTH_LIKE_JIS,
} from "./halfwidthToFullwidth";
import { smallToLarge_ja_JP } from "./smallToLarge_ja_JP";
import { largeToSmall_ja_JP } from "./largeToSmall_ja_JP";
import { ignoreKana } from "./ignoreKana";
import { ignoreWidth } from "./ignoreWidth";
import { ignoreSize_ja_JP } from "./ignoreSize_ja_JP";
import { ignoreTraditionalKana_ja_JP } from "./ignoreTraditionalKana_ja_JP";
import { ignoreTraditionalKanji_ja_JP } from "./ignoreTraditionalKanji_ja_JP";
import witnesses from "./native-width-kana-source-witnesses.json";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Constructs actual source value. @param text - Text. @returns Owner. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Observes result and releases its value. @param value - Owner. @returns Text. */
function result(value: OUString): string {
  let text = "";
  for (let i = 0; i < value.getLength(); i++)
    text += String.fromCharCode(value.getStr()[i] as number);
  value.dispose();
  return text;
}
/** Reads actual source offsets. @param sequence - Offsets. @returns Positions. */
function positions(sequence: Sequence<[number]>): number[] {
  const out: number[] = [];
  for (let i = 0; i < sequence.getLength(); i++) out.push(sequence.operatorIndex(i)[0]);
  return out;
}
/** Reads and releases an actual range sequence. @param sequence - Range owner. @returns Text values. */
function strings(sequence: Sequence<ReturnType<OUString["getDataAddress"]>>): string[] {
  const out: string[] = [];
  try {
    for (let i = 0; i < sequence.getLength(); i++) {
      const value = OUString.unacquired(sequence.operatorIndex(i));
      let text = "";
      for (let j = 0; j < value.getLength(); j++)
        text += String.fromCharCode(value.getStr()[j] as number);
      out.push(text);
    }
    return out;
  } finally {
    sequence.dispose();
  }
}
it("retains both complete kana ranges and all original gap boundaries", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const katakana = new hiraganaToKatakana(),
    hiragana = new katakanaToHiragana(),
    offset = new Integers();
  try {
    for (const [owner, start, end, extraStart, extraEnd, delta] of [
      [katakana, 0x3041, 0x3096, 0x309d, 0x309f, 96],
      [hiragana, 0x30a1, 0x30f6, 0x30fd, 0x30ff, -96],
    ] as const) {
      for (let unit = start; unit <= end; unit++)
        expect(owner.transliterateChar2Char(unit)).toBe(unit + delta);
      for (let unit = extraStart; unit <= extraEnd; unit++)
        expect(owner.transliterateChar2Char(unit)).toBe(unit + delta);
      for (const unit of [start - 1, end + 1, extraStart - 1, extraEnd + 1, 0xd800, 0xffff])
        expect(owner.transliterateChar2Char(unit)).toBe(unit);
      const input = u("xあアz");
      try {
        expect(result(owner.transliterate(input, 1, 2, offset))).toBe(delta > 0 ? "アア" : "ああ");
        expect(positions(offset)).toEqual([1, 2]);
      } finally {
        input.dispose();
      }
    }
  } finally {
    offset.dispose();
    hiragana.dispose();
    katakana.dispose();
  }
});
it("retains all small/large/traditional source rows and their complete BMP projections", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  for (const Owner of [smallToLarge_ja_JP, largeToSmall_ja_JP, ignoreTraditionalKanji_ja_JP]) {
    const owner = new Owner(),
      again = new Owner(),
      bytes = Buffer.alloc(65536 * 2);
    try {
      for (let unit = 0; unit <= 0xffff; unit++)
        bytes.writeUInt16LE(owner.transliterateChar2Char(unit), unit * 2);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(
        witnesses[Owner.name as keyof typeof witnesses].bmpOutputSha256,
      );
      expect(again.transliterateChar2Char(0x3041)).toBe(owner.transliterateChar2Char(0x3041));
    } finally {
      again.dispose();
      owner.dispose();
    }
  }
  const large = new largeToSmall_ja_JP(),
    traditional = new ignoreTraditionalKanji_ja_JP(),
    kana = new ignoreTraditionalKana_ja_JP();
  try {
    expect(large.transliterateChar2Char(0x3041)).toBe(0x3042);
    expect(large.transliterateChar2Char(0x3042)).toBe(0x3042);
    expect(traditional.transliterateChar2Char(0xfeff)).toBe(0x4e9c);
    expect(traditional.transliterateChar2Char(0x5b9d)).toBe(0x5b9d);
    expect(traditional.transliterateChar2Char(0x5bf3)).toBe(0x5b9d);
    for (const [a, b] of [
      [0x3090, 0x3044],
      [0x3091, 0x3048],
      [0x30f0, 0x30a4],
      [0x30f1, 0x30a8],
      [97, 97],
    ])
      expect(kana.transliterateChar2Char(a as number)).toBe(b);
  } finally {
    kana.dispose();
    traditional.dispose();
    large.dispose();
  }
});
it("preserves all six width variant contracts and source-relative widening offsets", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const offset = new Integers();
  try {
    for (const [Owner, input, expected] of [
      [fullwidthToHalfwidth, "Ａガあ", "Aｶﾞあ"],
      [FULLWIDTHKATAKANA_HALFWIDTHKATAKANA, "Ａガあ", "Ａｶﾞあ"],
      [FULLWIDTH_HALFWIDTH_LIKE_ASC, "Ａガあ", "Aｶﾞあ"],
    ] as const) {
      const owner = new Owner(),
        source = u("x" + input + "z");
      try {
        expect(result(owner.transliterate(source, 1, 3, offset))).toBe(expected);
        expect(positions(offset)).toEqual([1, 2, 2, 3]);
        expect(result(owner.transliterateString2String(source, 1, 3))).toBe(expected);
        expect(owner.transliterateChar2Char(0xff21)).toBe(
          Owner === FULLWIDTHKATAKANA_HALFWIDTHKATAKANA ? 0xff21 : 65,
        );
        expect(
          /** Calls the original module operation to observe its native result or exception. @returns Native operation result. */ () =>
            owner.transliterateChar2Char(0x30ac),
        ).toThrow(MultipleCharsOutputException);
        expect(
          /** Calls the original module operation to observe its native result or exception. @returns Native operation result. */ () =>
            owner.transliterateChar2Char(0xffff),
        ).toThrow(MultipleCharsOutputException);
      } finally {
        source.dispose();
        owner.dispose();
      }
    }
    for (const [Owner, expected] of [
      [halfwidthToFullwidth, "Ａガヴ"],
      [HALFWIDTHKATAKANA_FULLWIDTHKATAKANA, "Aガヴ"],
      [HALFWIDTH_FULLWIDTH_LIKE_JIS, "Ａガウ゛"],
    ] as const) {
      const owner = new Owner(),
        source = u("xxAｶﾞｳﾞy");
      try {
        expect(result(owner.transliterate(source, 2, 5, offset))).toBe(expected);
        expect(positions(offset)).toEqual(
          Owner === HALFWIDTH_FULLWIDTH_LIKE_JIS ? [0, 2, 3, 4] : [0, 2, 4],
        );
        expect(result(owner.transliterateString2String(source, 2, 5))).toBe(expected);
        expect(owner.transliterateChar2Char(0xff76)).toBe(0x30ab);
      } finally {
        source.dispose();
        owner.dispose();
      }
    }
  } finally {
    offset.dispose();
  }
});
it("delegates all ignore family scalar,string and range operations to their original directional modules", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const offset = new Integers();
  try {
    for (const [Owner, input, expected, range] of [
      [ignoreKana, "あア", "アア", ["ア", "ン", "あ", "ん"]],
      [ignoreWidth, "Ａガ", "Aｶﾞ", ["A", "Z", "Ａ", "Ｚ"]],
      [ignoreSize_ja_JP, "ぁあ", "ああ", ["あ", "い"]],
    ] as const) {
      const owner = new Owner(),
        source = u(input),
        first = u(Owner === ignoreKana ? "あ" : Owner === ignoreWidth ? "A" : "ぁ"),
        last = u(Owner === ignoreKana ? "ん" : Owner === ignoreWidth ? "Z" : "ぃ"),
        empty = u("");
      try {
        expect(result(owner.folding(source, 0, source.getLength(), offset))).toBe(expected);
        expect(result(owner.transliterateString2String(source, 0, source.getLength()))).toBe(
          expected,
        );
        expect(owner.transliterateChar2Char(first.getStr()[0] as number)).toBe(
          range[0].charCodeAt(0),
        );
        expect(strings(owner.transliterateRange(first, last))).toEqual(range);
        expect(
          /** Calls the original module operation to observe its native result or exception. @returns Native operation result. */ () =>
            owner.transliterateRange(empty, last),
        ).toThrow(RuntimeException);
        expect(
          /** Calls the original module operation to observe its native result or exception. @returns Native operation result. */ () =>
            owner.transliterateRange(first, empty),
        ).toThrow(RuntimeException);
      } finally {
        empty.dispose();
        last.dispose();
        first.dispose();
        source.dispose();
        owner.dispose();
      }
    }
  } finally {
    offset.dispose();
  }
});

it("retains empty width strings,literalFFFF string identity and expanding width ranges", /** Uses original public operations rather than scalar substitution for ranges. @returns Assertion completion. */ () => {
  const empty = u(""),
    noncharacter = u("\uffff"),
    first = u("ガ"),
    last = u("パ"),
    offset = new Integers(),
    ignore = new ignoreWidth();
  try {
    for (const Owner of [
      fullwidthToHalfwidth,
      FULLWIDTHKATAKANA_HALFWIDTHKATAKANA,
      FULLWIDTH_HALFWIDTH_LIKE_ASC,
      halfwidthToFullwidth,
      HALFWIDTHKATAKANA_FULLWIDTHKATAKANA,
      HALFWIDTH_FULLWIDTH_LIKE_JIS,
    ]) {
      const owner = new Owner();
      try {
        expect(result(owner.transliterate(empty, 0, 0, offset))).toBe("");
        expect(offset.getLength()).toBe(0);
        expect(result(owner.transliterateString2String(noncharacter, 0, 1))).toBe("\uffff");
      } finally {
        owner.dispose();
      }
    }
    expect(strings(ignore.transliterateRange(first, last))).toEqual(["ｶﾞ", "ﾊﾟ", "ガ", "パ"]);
  } finally {
    ignore.dispose();
    offset.dispose();
    last.dispose();
    first.dispose();
    noncharacter.dispose();
    empty.dispose();
  }
});
