/** @fileoverview Original widthfolding string algorithms with real value/offset owners and all frozen initialized Japanese composition rows. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence, asNonConstRange } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { widthfolding, WIDTHFOLDING_DONT_USE_COMBINED_VU } from "../../inc/widthfolding";
import data from "./widthfolding_data.json";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
/** Makes actual UTF16 value. @param text - Text. @returns Owner. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads and releases a result. @param value - Owned value. @returns Text. */
function result(value: OUString): string {
  let text = "";
  for (let i = 0; i < value.getLength(); i++)
    text += String.fromCharCode(value.getStr()[i] as number);
  value.dispose();
  return text;
}
/** Reads actual offset cells. @param value - Sequence. @returns Positions. */
function offsets(value: Sequence<[number]>): number[] {
  const out: number[] = [];
  for (let i = 0; i < value.getLength(); i++) out.push(value.operatorIndex(i)[0]);
  return out;
}
it("decomposes every initialized Katakana row with repeated absolute source positions", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const offset = new Integers();
  try {
    for (let i = 0x60; i < data.decomposition_table.length; i++) {
      const row = data.decomposition_table[i] as number[],
        source = u("x" + String.fromCharCode(0x3040 + i) + "z");
      try {
        const expected = row[0]
          ? String.fromCharCode(row[0], row[1] as number)
          : String.fromCharCode(0x3040 + i);
        expect(result(widthfolding.decompose_ja_voiced_sound_marks(source, 1, 1, offset))).toBe(
          expected,
        );
        expect(offsets(offset)).toEqual(row[0] ? [1, 1] : [1]);
        expect(result(widthfolding.decompose_ja_voiced_sound_marks(source, 1, 1, null))).toBe(
          expected,
        );
      } finally {
        source.dispose();
      }
    }
  } finally {
    offset.dispose();
  }
});
it("composes every initialized kana row for combining and spacing voiced/semi-voiced marks", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const offset = new Integers();
  try {
    for (let i = 0; i < data.composition_table.length; i++)
      for (let j = 0; j < 2; j++) {
        const mapped = (data.composition_table[i] as number[])[j] as number;
        if (!mapped) continue;
        for (const mark of [0x3099 + j, 0x309b + j]) {
          const source = u("x" + String.fromCharCode(0x3040 + i, mark) + "z");
          try {
            expect(result(widthfolding.compose_ja_voiced_sound_marks(source, 1, 2, offset))).toBe(
              String.fromCharCode(mapped),
            );
            expect(offsets(offset)).toEqual([2]);
            expect(result(widthfolding.compose_ja_voiced_sound_marks(source, 1, 2, null))).toBe(
              String.fromCharCode(mapped),
            );
          } finally {
            source.dispose();
          }
        }
      }
  } finally {
    offset.dispose();
  }
});
it("retains empty/lone/identity runs,JIS VU flag and mutable output COW", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const empty = u(""),
    plain = u("a\ud800あ\udc00"),
    noPair = u("A゙あ゚\u303f゙\u3100゙"),
    vu = u("ヴx"),
    offset = new Integers(5);
  asNonConstRange(offset).operatorIndex(0, 4)[0] = 99;
  const shared = new Integers(offset);
  try {
    expect(
      result(widthfolding.decompose_ja_voiced_sound_marks(plain, 0, plain.getLength(), offset)),
    ).toBe("a\ud800あ\udc00");
    expect(offsets(offset)).toEqual([0, 1, 2, 3]);
    expect(shared.operatorIndex(0)[0]).toBe(99);
    expect(
      result(
        widthfolding.compose_ja_voiced_sound_marks(
          vu,
          0,
          3,
          offset,
          WIDTHFOLDING_DONT_USE_COMBINED_VU,
        ),
      ),
    ).toBe("ヴx");
    expect(offsets(offset)).toEqual([0, 1, 2]);
    expect(
      result(
        widthfolding.compose_ja_voiced_sound_marks(
          vu,
          0,
          3,
          null,
          WIDTHFOLDING_DONT_USE_COMBINED_VU,
        ),
      ),
    ).toBe("ヴx");
    expect(
      result(widthfolding.compose_ja_voiced_sound_marks(noPair, 0, noPair.getLength(), offset)),
    ).toBe("A゙あ゚\u303f゙\u3100゙");
    expect(
      result(widthfolding.compose_ja_voiced_sound_marks(plain, 0, plain.getLength(), null)),
    ).toBe("a\ud800あ\udc00");
    expect(result(widthfolding.compose_ja_voiced_sound_marks(plain, 0, 1, offset))).toBe("a");
    expect(offsets(offset)).toEqual([0]);
    for (const out of [offset, null]) {
      expect(result(widthfolding.decompose_ja_voiced_sound_marks(empty, 0, 0, out))).toBe("");
      expect(result(widthfolding.compose_ja_voiced_sound_marks(empty, 0, 0, out))).toBe("");
    }
    expect(offset.getLength()).toBe(0);
  } finally {
    shared.dispose();
    offset.dispose();
    vu.dispose();
    noPair.dispose();
    plain.dispose();
    empty.dispose();
  }
});
it("detaches same-length composition offsets while leaving a borrowed shared copy unchanged", /** Verifies source-defined width, kana and actual offset/value contracts. @returns Assertion completion. */ () => {
  const source = u("xxabc"),
    offset = new Integers(3);
  for (let i = 0; i < 3; i++) asNonConstRange(offset).operatorIndex(i, 4)[0] = 99;
  const shared = new Integers(offset);
  try {
    expect(result(widthfolding.compose_ja_voiced_sound_marks(source, 2, 3, offset))).toBe("abc");
    expect(offsets(offset)).toEqual([2, 3, 4]);
    expect(offsets(shared)).toEqual([99, 99, 99]);
  } finally {
    shared.dispose();
    offset.dispose();
    source.dispose();
  }
});
