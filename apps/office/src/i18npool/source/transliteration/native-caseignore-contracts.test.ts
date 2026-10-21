/** @fileoverview Source-derived case-ignore comparison, range, accumulated flags and terminal expansion contracts over actual module/iterator owners. */
import { expect, it } from "vitest";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { Sequence, asNonConstRange } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { TransliterationModules as Modules } from "../../../offapi/com/sun/star/i18n/TransliterationModules";
import { IGNORE } from "../../../offapi/com/sun/star/i18n/TransliterationType";
import { Transliteration_caseignore, transliterateCaseFolding } from "./transliteration_caseignore";
import { ignoreKashida_CTL } from "./ignoreKashida_CTL";
/** Actual native input. @param value - Exact text. @returns Owner. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads actual native units. @param value - Borrowed value. @returns Text. */
function text(value: Pick<OUString, "getStr" | "getLength">): string {
  let out = "";
  for (let i = 0; i < value.getLength(); i++)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Reads and destroys returned native strings. @param value - Owned result. @returns Text. */
function result(value: OUString): string {
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}
/** Reads a typed native string sequence. @param value - Owned sequence. @returns Text values. */
function strings(value: Sequence<ReturnType<OUString["getDataAddress"]>>): string[] {
  try {
    const out: string[] = [];
    for (let i = 0; i < value.getLength(); i++)
      out.push(text(OUString.unacquired(value.operatorIndex(i))));
    return out;
  } finally {
    value.dispose();
  }
}
it("retains default folding independently from comparison flags and accumulated case/kana/width loads", /** Module construction alone has moduleLoaded NONE; loadModule accumulates actual masks. @returns Nothing. */ () => {
  const module = new Transliteration_caseignore(),
    locale = new Locale();
  try {
    expect(module.getType()).toBe(IGNORE);
    expect(result(module.getName())).toBe("case ignore (generic)");
    expect(result(module.getImplementationName())).toBe(
      "com.sun.star.i18n.Transliteration.IGNORE_CASE",
    );
    expect(result(module.transliterateString2String(u("Aß"), 0, 2))).toBe("ass");
    expect(module.compareString(u("A"), u("a"))).toBe(-1);
    module.loadModule(Modules.IGNORE_KANA, locale);
    expect(module.compareString(u("か"), u("カ"))).toBe(0);
    module.loadModule(Modules.IGNORE_CASE, locale);
    expect(module.compareString(u("A"), u("a"))).toBe(0);
    expect(module.compareString(u("か"), u("カ"))).toBe(0);
    module.loadModule(Modules.IGNORE_WIDTH, locale);
    expect(module.compareString(u("Ａ"), u("a"))).toBe(0);
  } finally {
    locale.dispose();
    module.dispose();
  }
});
it.each([
  ["", "", 0, [0, 0]],
  ["", "a", -1, [0, 0]],
  ["a", "", 1, [0, 0]],
  ["abc", "ABC", 0, [3, 3]],
  ["a", "b", -1, [0, 0]],
  ["z", "a", 1, [0, 0]],
  ["ab", "ax", -1, [1, 1]],
  ["a", "ab", -1, [1, 1]],
  ["ab", "a", 1, [1, 1]],
  ["ßx", "ssx", 0, [2, 3]],
  ["ß", "ss", -1, [0, 1]],
  ["ss", "ß", 1, [1, 0]],
  ["ß", "ß", 0, [1, 1]],
])(
  "preserves iterator comparison case %#",
  /** Expected signs/matches follow the original loop, including terminal expansion behavior. @param first - First input. @param second - Second input. @param wanted - Native comparison. @param matches - Native relative matched counts. @returns Nothing. */ (
    first,
    second,
    wanted,
    matches,
  ) => {
    const module = new Transliteration_caseignore(),
      locale = new Locale(),
      left: [number] = [9],
      right: [number] = [9],
      a = u(first),
      b = u(second);
    try {
      module.loadModule(Modules.IGNORE_CASE, locale);
      expect(module.compareString(a, b)).toBe(wanted);
      expect(module.equals(a, 0, a.getLength(), left, b, 0, b.getLength(), right)).toBe(
        wanted === 0,
      );
      expect([left[0], right[0]]).toEqual(matches);
    } finally {
      b.dispose();
      a.dispose();
      locale.dispose();
      module.dispose();
    }
  },
);
it("retains relative substring counts and actual full-fold source offsets", /** String folding can expand a final sharp-s even where the compare iterator loses the pending unit. @returns Nothing. */ () => {
  const module = new Transliteration_caseignore(),
    locale = new Locale(),
    left: [number] = [0],
    right: [number] = [0];
  try {
    module.loadModule(Modules.IGNORE_CASE, locale);
    expect(module.compareSubstring(u("xab"), 1, 2, u("ABx"), 0, 2)).toBe(0);
    expect(module.equals(u("xab"), 1, 2, left, u("AB"), 0, 2, right)).toBe(true);
    expect(left).toEqual([2]);
    expect(right).toEqual([2]);
    const folded = transliterateCaseFolding(u("xß"), 1, 1, locale);
    try {
      expect(text(folded.text)).toBe("ss");
      expect(folded.offsets).toEqual([1, 1]);
    } finally {
      folded.text.dispose();
    }
  } finally {
    locale.dispose();
    module.dispose();
  }
});
it("retains original range outputs and lazy static module reuse", /** Range works on exactly one input code unit in each endpoint. @returns Nothing. */ () => {
  const module = new Transliteration_caseignore();
  try {
    expect(strings(module.transliterateRange(u("a"), u("z")))).toEqual(["a", "z", "A", "Z"]);
    expect(strings(module.transliterateRange(u("1"), u("2")))).toEqual(["1", "2"]);
    expect(strings(module.transliterateRange(u("1"), u("a")))).toEqual(["1", "a", "1", "A"]);
    expect(
      /** Invalid first endpoint. @returns Range if accepted. */ () =>
        module.transliterateRange(u(""), u("a")),
    ).toThrow(RuntimeException);
    expect(
      /** Invalid second endpoint. @returns Range if accepted. */ () =>
        module.transliterateRange(u("a"), u("ab")),
    ).toThrow(RuntimeException);
  } finally {
    module.dispose();
  }
});
it("keeps ignore output writes detached from shared input Sequence owners", /** Native getArray after realloc performs COW even when the count stays unchanged. @returns Nothing. */ () => {
  const Integers = Sequence.specialize<[number]>("sal_Int32", 4),
    output = new Integers(2),
    range = asNonConstRange(output);
  range.operatorIndex(0, 4)[0] = 77;
  range.operatorIndex(1, 4)[0] = 88;
  const shared = new Integers(output),
    module = new ignoreKashida_CTL();
  try {
    expect(result(module.transliterate(u("ab"), 0, 2, output))).toBe("ab");
    expect([shared.operatorIndex(0)[0], shared.operatorIndex(1)[0]]).toEqual([77, 88]);
    expect([output.operatorIndex(0)[0], output.operatorIndex(1)[0]]).toEqual([0, 1]);
  } finally {
    module.dispose();
    shared.dispose();
    output.dispose();
  }
});
