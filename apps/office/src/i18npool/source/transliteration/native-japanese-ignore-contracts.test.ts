/** @fileoverview Exact Japanese ignore tables, native deletions and pair source-position contracts. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ignoreSeZe_ja_JP } from "./ignoreSeZe_ja_JP";
import { ignoreTiJi_ja_JP } from "./ignoreTiJi_ja_JP";
import { ignoreZiZu_ja_JP } from "./ignoreZiZu_ja_JP";
import { ignoreMiddleDot_ja_JP } from "./ignoreMiddleDot_ja_JP";
import { ignoreMinusSign_ja_JP } from "./ignoreMinusSign_ja_JP";
import { ignoreSeparator_ja_JP } from "./ignoreSeparator_ja_JP";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Constructs source value. @param text - Text. @returns Owned value. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads and releases output value. @param value - Owner. @returns Text. */
function result(value: OUString): string {
  let text = "";
  for (let i = 0; i < value.getLength(); i++)
    text += String.fromCharCode(value.getStr()[i] as number);
  value.dispose();
  return text;
}
for (const [Owner, rows] of [
  [
    ignoreSeZe_ja_JP,
    [
      ["シェ", "セ"],
      ["しぇ", "せ"],
      ["ジェ", "ゼ"],
      ["じぇ", "ぜ"],
    ],
  ],
  [
    ignoreTiJi_ja_JP,
    [
      ["ツィ", "チ"],
      ["ティ", "チ"],
      ["つぃ", "ち"],
      ["てぃ", "ち"],
      ["ディ", "ジ"],
      ["でぃ", "じ"],
    ],
  ],
] as const) {
  it(`preserves every ${Owner.name} pair and consumes the second unit's source offset`, /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
    const owner = new Owner(),
      offset = new Integers();
    try {
      for (const [pair, mapped] of rows) {
        const source = u("x" + pair + "y");
        try {
          expect(result(owner.folding(source, 1, 2, offset))).toBe(mapped);
          expect(offset.getLength()).toBe(1);
          expect(offset.operatorIndex(0)[0]).toBe(2);
          expect(result(owner.transliterateString2String(source, 1, 2))).toBe(mapped);
          expect(owner.transliterateChar2Char(pair.charCodeAt(0))).toBe(pair.charCodeAt(0));
        } finally {
          source.dispose();
        }
      }
      const unmatched = u("abc"),
        empty = u("");
      try {
        expect(result(owner.folding(unmatched, 0, 3, offset))).toBe("abc");
        expect(result(owner.folding(empty, 0, 0, offset))).toBe("");
      } finally {
        empty.dispose();
        unmatched.dispose();
      }
    } finally {
      offset.dispose();
      owner.dispose();
    }
  });
}
it("preserves all source ZiZu and minus mappings plus identities", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const zizu = new ignoreZiZu_ja_JP(),
    minus = new ignoreMinusSign_ja_JP();
  try {
    for (const [input, expected] of [
      [0x30c2, 0x30b8],
      [0x3062, 0x3058],
      [0x30c5, 0x30ba],
      [0x3065, 0x305a],
      [97, 97],
    ])
      expect(zizu.transliterateChar2Char(input as number)).toBe(expected);
    for (const unit of [
      0x2212, 0x2d, 0x2010, 0x2011, 0x2012, 0x2013, 0x2014, 0x2015, 0xff0d, 0xff70,
    ])
      expect(minus.transliterateChar2Char(unit)).toBe(0x30fc);
    for (const unit of [97, 0x30fc, 0xfe63, 0x2043])
      expect(minus.transliterateChar2Char(unit)).toBe(unit);
  } finally {
    minus.dispose();
    zizu.dispose();
  }
});
it("preserves the exact separator membership including intentional punctuation omissions", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const owner = new ignoreSeparator_ja_JP(),
    dot = new ignoreMiddleDot_ja_JP(),
    offset = new Integers();
  const members = [
    0x21, 0x23, 0x24, 0x25, 0x26, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e,
    0x5c, 0x5f, 0x7b, 0x7c, 0x7d, 0x7e, 0xa5, 0x3001, 0x3002, 0x3008, 0x3009, 0x300a, 0x300b,
    0x300c, 0x300d, 0x300e, 0x300f, 0x3010, 0x3011, 0x3014, 0x3015, 0x3016, 0x3017, 0x3018, 0x3019,
    0x301a, 0x301b, 0x301c, 0x301d, 0x301e, 0x301f, 0x3030, 0x30fb, 0x30fc, 0xff01, 0xff03, 0xff04,
    0xff05, 0xff06, 0xff0a, 0xff0b, 0xff0c, 0xff0d, 0xff0e, 0xff0f, 0xff1a, 0xff1b, 0xff1c, 0xff1d,
    0xff1e, 0xff3c, 0xff3f, 0xff5b, 0xff5c, 0xff5d, 0xff5e, 0xffe5,
  ];
  try {
    for (const unit of members) expect(owner.transliterateChar2Char(unit)).toBe(0xffff);
    for (const unit of [
      0, 0x20, 0x22, 0x27, 0x28, 0x29, 0x3f, 0x40, 0x5b, 0x5d, 0x60, 0xb7, 0xff02, 0xff08, 0xff09,
      0xff1f, 0xff65,
    ])
      expect(owner.transliterateChar2Char(unit)).toBe(unit);
    expect(dot.transliterateChar2Char(0x30fb)).toBe(0xffff);
    expect(dot.transliterateChar2Char(0xff65)).toBe(0xffff);
    expect(dot.transliterateChar2Char(0xb7)).toBe(0xb7);
    const source = u("x・a･b\uffffy");
    try {
      expect(result(dot.folding(source, 1, 5, offset))).toBe("ab");
      expect([offset.operatorIndex(0)[0], offset.operatorIndex(1)[0]]).toEqual([2, 4]);
    } finally {
      source.dispose();
    }
  } finally {
    offset.dispose();
    dot.dispose();
    owner.dispose();
  }
});
