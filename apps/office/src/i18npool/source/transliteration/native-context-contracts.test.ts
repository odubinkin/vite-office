/** @fileoverview Original contextual transliteration over actual values/offset sequences and exhaustive source-derived two-unit projections. */
import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Sequence, asNonConstRange } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { ignoreIandEfollowedByYa_ja_JP } from "./ignoreIandEfollowedByYa_ja_JP";
import { ignoreKiKuFollowedBySa_ja_JP } from "./ignoreKiKuFollowedBySa_ja_JP";
import { ignoreIterationMark_ja_JP } from "./ignoreIterationMark_ja_JP";
import { ignoreProlongedSoundMark_ja_JP } from "./ignoreProlongedSoundMark_ja_JP";
import witness from "./native-context-source-witnesses.json";
const Integers = Sequence.specialize<[number]>("sal_Int32", 4);
const owners = {
  ignoreIandEfollowedByYa_ja_JP,
  ignoreIterationMark_ja_JP,
  ignoreProlongedSoundMark_ja_JP,
};
/** Constructs actual native value. @param text - UTF16 text. @returns Owner. */
function u(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads and releases actual output. @param value - Owner. @returns Text. */
function result(value: OUString): string {
  let text = "";
  for (let i = 0; i < value.getLength(); i++)
    text += String.fromCharCode(value.getStr()[i] as number);
  value.dispose();
  return text;
}
/** Reads byte-strided offset cells. @param sequence - Actual output. @returns Positions. */
function offsets(sequence: Sequence<[number]>): number[] {
  const out: number[] = [];
  for (let i = 0; i < sequence.getLength(); i++) out.push(sequence.operatorIndex(i)[0]);
  return out;
}
for (const projection of witness.projections) {
  it(`retains complete BMP context projection ${projection.module} U+${projection.mark.toString(16)}`, /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
    const owner = new owners[projection.module as keyof typeof owners](),
      bytes = Buffer.alloc(65536 * 4);
    try {
      for (let unit = 0; unit <= 0xffff; unit++) {
        const input = new OUString(new Uint16Array([unit, projection.mark]), 2);
        let output: OUString | undefined;
        try {
          output = owner.transliterateString2String(input, 0, 2);
          if (output.getLength() !== 2)
            throw new Error("Unexpected contextual projection length at U+" + unit.toString(16));
          bytes.writeUInt16LE(output.getStr()[0] as number, unit * 4);
          bytes.writeUInt16LE(output.getStr()[1] as number, unit * 4 + 2);
        } finally {
          output?.dispose();
          input.dispose();
        }
      }
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(projection.sha256);
    } finally {
      owner.dispose();
    }
  });
}
it("preserves exact KiKu SA..ZO boundaries and consumed-pair stepping", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  const owner = new ignoreKiKuFollowedBySa_ja_JP(),
    offset = new Integers();
  try {
    for (let unit = 0x30b5; unit <= 0x30be; unit++) {
      const input = u("xク" + String.fromCharCode(unit) + "クサy");
      try {
        expect(result(owner.folding(input, 1, 4, offset))).toBe(
          "キ" + String.fromCharCode(unit) + "キサ",
        );
        expect(offsets(offset)).toEqual([1, 2, 3, 4]);
      } finally {
        input.dispose();
      }
    }
    for (const text of ["クゴ", "クタ", "キサ", "くサ", "ク"]) {
      const input = u(text);
      try {
        expect(result(owner.transliterateString2String(input, 0, text.length))).toBe(text);
      } finally {
        input.dispose();
      }
    }
    const overlap = u("ククサ");
    try {
      expect(result(owner.folding(overlap, 0, 3, offset))).toBe("クキサ");
    } finally {
      overlap.dispose();
    }
  } finally {
    offset.dispose();
    owner.dispose();
  }
});
it("retains contextual boundaries,chains,embedded zeros,empty and lone units", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  for (const [Owner, text, expected] of [
    [ignoreIandEfollowedByYa_ja_JP, "キヤギャカャヤ", "キアギアカャヤ"],
    [ignoreKiKuFollowedBySa_ja_JP, "クサクシク", "キサキシク"],
    [ignoreIterationMark_ja_JP, "かゞゝA々ヽ", "かががAAA"],
    [ignoreProlongedSoundMark_ja_JP, "ンーーﾝｰｰｰ", "ン\0ーﾝｰ\0ｰ"],
  ] as const) {
    const owner = new Owner(),
      input = u("x" + text + "z"),
      empty = u(""),
      offset = new Integers(text.length);
    for (let i = 0; i < text.length; i++) asNonConstRange(offset).operatorIndex(i, 4)[0] = 99;
    const shared = new Integers(offset);
    try {
      expect(result(owner.folding(input, 1, text.length, offset))).toBe(expected);
      expect(offsets(offset)).toEqual(
        Array.from(
          { length: text.length },
          /** Verifies source-defined context,locale or actual value contracts. @param _ - Original source input. @param i - Original source input. @returns Assertion completion or source observation. */ (
            _,
            i,
          ) => i + 1,
        ),
      );
      expect(shared.operatorIndex(0)[0]).toBe(99);
      expect(result(owner.transliterateString2String(input, 1, text.length))).toBe(expected);
      expect(result(owner.folding(empty, 0, 0, offset))).toBe("");
      expect(offset.getLength()).toBe(0);
      expect(result(owner.transliterateString2String(empty, 0, 0))).toBe("");
      const lone = u("\ud800");
      try {
        expect(result(owner.folding(lone, 0, 1, offset))).toBe("\ud800");
        expect(offsets(offset)).toEqual([0]);
      } finally {
        lone.dispose();
      }
      expect(owner.transliterateChar2Char(0x30fc)).toBe(0x30fc);
      expect(owner.transliterateChar2Char(0xffff)).toBe(0xffff);
    } finally {
      shared.dispose();
      offset.dispose();
      empty.dispose();
      input.dispose();
      owner.dispose();
    }
  }
});
it("uses only the requested source fragment as context and preserves explicit NUL values", /** Verifies source-defined context,locale or actual value contracts. @returns Assertion completion or source observation. */ () => {
  const iteration = new ignoreIterationMark_ja_JP(),
    prolonged = new ignoreProlongedSoundMark_ja_JP(),
    iande = new ignoreIandEfollowedByYa_ja_JP(),
    offset = new Integers();
  try {
    const source = u("かゝキヤンー");
    try {
      expect(result(iteration.folding(source, 1, 1, offset))).toBe("ゝ");
      expect(result(iande.folding(source, 3, 1, offset))).toBe("ヤ");
      expect(result(prolonged.folding(source, 5, 1, offset))).toBe("ー");
    } finally {
      source.dispose();
    }
    for (const [text, expected] of [
      ["\0々", "\0\0"],
      ["あー", "ああ"],
      ["Aｰ", "Aｰ"],
      ["ｰｰ", "ｰ\0"],
      ["ーー", "ーー"],
    ]) {
      const input = u(text as string);
      try {
        expect(
          result(
            (text as string).includes("々")
              ? iteration.folding(input, 0, 2, offset)
              : prolonged.folding(input, 0, 2, offset),
          ),
        ).toBe(expected);
      } finally {
        input.dispose();
      }
    }
  } finally {
    offset.dispose();
    iande.dispose();
    prolonged.dispose();
    iteration.dispose();
  }
});

it("retains ordinary text and original inherited scalar/range contracts", /** The contextual modules keep null generic scalar pointers and the base endpoint-only range. @returns Assertion completion. */ () => {
  const first = u("キヤ"),
    second = u("クサ"),
    plain = u("ab"),
    offset = new Integers();
  try {
    for (const Owner of [
      ignoreIandEfollowedByYa_ja_JP,
      ignoreKiKuFollowedBySa_ja_JP,
      ignoreIterationMark_ja_JP,
      ignoreProlongedSoundMark_ja_JP,
    ]) {
      const owner = new Owner();
      try {
        expect(result(owner.folding(plain, 0, 2, offset))).toBe("ab");
        expect(owner.getType()).toBe(4);
        expect(result(owner.getName())).toBe(Owner.name);
        const range = owner.transliterateRange(first, second),
          values: string[] = [];
        try {
          for (let i = 0; i < range.getLength(); i++) {
            const value = OUString.unacquired(range.operatorIndex(i));
            let text = "";
            for (let j = 0; j < value.getLength(); j++)
              text += String.fromCharCode(value.getStr()[j] as number);
            values.push(text);
          }
          expect(values).toEqual(["キ", "ク"]);
        } finally {
          range.dispose();
        }
      } finally {
        owner.dispose();
      }
    }
  } finally {
    offset.dispose();
    plain.dispose();
    second.dispose();
    first.dispose();
  }
});
