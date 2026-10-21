/** @fileoverview Original diacritic contracts with real OUString/Sequence values and source-derived UTF16 witnesses. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence, asNonConstRange } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { rtl_uString_iterateCodePoints } from "../../../sal/inc/rtl/ustring.h";
import { ignoreDiacritics_CTL } from "./ignoreDiacritics_CTL";
import cases from "./native-diacritics-cases.json";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Constructs actual UTF16 owner. @param text - Text. @returns Owner. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Observes and releases output. @param value - Owned string. @returns Text. */
function result(value: OUString): string {
  let text = "";
  for (let i = 0; i < value.getLength(); i++)
    text += String.fromCharCode(value.getStr()[i] as number);
  value.dispose();
  return text;
}
/** Observes byte-strided output. @param sequence - Offsets. @returns Values. */
function offsets(sequence: Sequence<[number]>): number[] {
  const values: number[] = [];
  for (let i = 0; i < sequence.getLength(); i++) values.push(sequence.operatorIndex(i)[0]);
  return values;
}
for (const [text, start, count, expected, positions] of cases.folding) {
  it(`preserves original diacritic folding ${JSON.stringify([text, start, count])}`, /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
    const owner = new ignoreDiacritics_CTL(),
      input = u(text as string),
      out = new Integers();
    try {
      expect(result(owner.folding(input, start as number, count as number, out))).toBe(expected);
      expect(offsets(out)).toEqual(positions);
      expect(result(owner.transliterate(input, start as number, count as number, out))).toBe(
        expected,
      );
      expect(offsets(out)).toEqual(positions);
    } finally {
      out.dispose();
      input.dispose();
      owner.dispose();
    }
  });
}
it("preserves scalar deletion, multiunit fallback, input units and whole-string composition", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const owner = new ignoreDiacritics_CTL();
  try {
    expect(result(owner.getName())).toBe("ignoreDiacritics_CTL");
    expect(result(owner.getImplementationName())).toBe(
      "com.sun.star.i18n.Transliteration.ignoreDiacritics_CTL",
    );
    expect(owner.transliterateChar2Char(0xe9)).toBe(101);
    expect(owner.transliterateChar2Char(0x301)).toBe(0xffff);
    expect(owner.transliterateChar2Char(0xfa6c)).toBe(0xfa6c);
    expect(owner.transliterateChar2Char(0xd800)).toBe(0xd800);
    expect(owner.transliterateChar2Char(0x100e9)).toBe(101);
    expect(result(owner.transliterateChar2String(0xfa6c))).toBe("𤋮");
    const jamo = u("가"),
      pair = u("x😀z");
    try {
      expect(result(owner.transliterateString2String(jamo, 0, 2))).toBe("가");
      expect(result(owner.transliterateString2String(pair, 1, 1))).toBe("\ud83d");
      expect(result(owner.transliterateString2String(pair, 2, 1))).toBe("\ude00");
      expect(result(owner.transliterateString2String(pair, 4, 0))).toBe("");
    } finally {
      pair.dispose();
      jamo.dispose();
    }
  } finally {
    owner.dispose();
  }
});
it("replaces the actual output sequence without mutating a shared previous sequence", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const owner = new ignoreDiacritics_CTL(),
    input = u("xé"),
    out = new Integers(1);
  asNonConstRange(out).operatorIndex(0, 4)[0] = 99;
  const shared = new Integers(out);
  try {
    expect(result(owner.folding(input, 1, 1, out))).toBe("e");
    expect(offsets(out)).toEqual([1]);
    expect(offsets(shared)).toEqual([99]);
  } finally {
    shared.dispose();
    out.dispose();
    input.dispose();
    owner.dispose();
  }
});
it("preserves original runtime range errors and inherited absolute equals counts", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const owner = new ignoreDiacritics_CTL(),
    input = u("xé"),
    other = u("e"),
    out = new Integers(),
    one: [number] = [9],
    two: [number] = [9];
  try {
    for (const [start, count] of [
      [-1, 1],
      [0, 3],
      [3, 0],
    ])
      expect(
        /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () =>
          owner.folding(input, start as number, count as number, out),
      ).toThrow(RuntimeException);
    expect(owner.equals(input, 1, 1, one, other, 0, 1, two)).toBe(true);
    expect([one[0], two[0]]).toEqual([2, 1]);
  } finally {
    out.dispose();
    other.dispose();
    input.dispose();
    owner.dispose();
  }
});
it("forwards codepoint stepping through the real OUString and rtl C declaration", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const source = u("a😀\ud800b\udc00"),
    index: [number] = [1];
  try {
    expect(source.iterateCodePoints(index)).toBe(0x1f600);
    expect(index[0]).toBe(3);
    expect(source.iterateCodePoints(index, 0)).toBe(0xd800);
    expect(index[0]).toBe(3);
    expect(source.iterateCodePoints(index, -1)).toBe(0x1f600);
    expect(index[0]).toBe(1);
    expect(rtl_uString_iterateCodePoints(source.pData, index, 2)).toBe(0x1f600);
    expect(index[0]).toBe(4);
    expect(
      /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () =>
        rtl_uString_iterateCodePoints(source.pData, [-1], 1),
    ).toThrow("assert(*indexUtf16 >= 0)");
    expect(
      /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () =>
        source.iterateCodePoints([source.getLength()]),
    ).toThrow();
  } finally {
    source.dispose();
  }
});

it("preserves malformed UTF16 and low-surrogate starts using literal code units", /** Verifies original module behavior with actual runtime values. @returns Assertion completion or browser observations. */ () => {
  const owner = new ignoreDiacritics_CTL(),
    offset = new Integers();
  try {
    for (const [text, start, count, expected, positions] of [
      ["x😀z", 2, 1, "\ude00", [2]],
      ["\ud800é\udc00", 0, 4, "\ud800e\udc00", [0, 1, 3]],
    ] as const) {
      const input = u(text);
      try {
        expect(result(owner.folding(input, start, count, offset))).toBe(expected);
        expect(offsets(offset)).toEqual(positions);
      } finally {
        input.dispose();
      }
    }
  } finally {
    offset.dispose();
    owner.dispose();
  }
});

it("retains ICU negative-length NUL termination in the no-offset overload", /** Original UnicodeString pointer/count construction scans every negative length. @returns Assertion completion. */ () => {
  const owner = new ignoreDiacritics_CTL(),
    input = u("xé\0â");
  try {
    expect(result(owner.transliterateString2String(input, 1, -1))).toBe("e");
    expect(result(owner.transliterateString2String(input, 1, -5))).toBe("e");
    expect(result(owner.transliterateString2String(input, 2, -1))).toBe("");
    expect(result(owner.transliterateString2String(input, 1, 3))).toBe("e\0a");
  } finally {
    input.dispose();
    owner.dispose();
  }
});
