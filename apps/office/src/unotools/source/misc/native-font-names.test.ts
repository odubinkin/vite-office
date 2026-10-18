/** @fileoverview Ports direct native fontdefs QA and verifies complete dictionary, UTF16 classification and shared value/token contracts. */
import { expect, it } from "vitest";
import names from "./font-name-dictionary.json" with { type: "json" };
import {
  GetEnglishSearchFontName,
  StripScriptFromName,
  AddTokenFontName,
  IsOpenSymbol,
} from "../../inc/fontdefs";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Creates a logical UTF16 view, retaining surrogate and nul units. @param value - Text. @returns View. */
function units(value: string): Uint16Array {
  const result = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) result[i] = value.charCodeAt(i);
  return result;
}
/** Creates the existing shared value. @param value - Text. @returns Original value. */
function unicode(value: string): OUString {
  return new OUString(units(value), value.length);
}
/** Reads logical native units. @param value - Value. @returns Text. */
function text(value: OUString): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}

it.each([
  ["SYMBOL", "symbol"],
  ["Symbol    ", "symbol"],
  ["Symbol(SIP)", "symbol(sip)"],
  ["CM Roman CE", "cmromance"],
  ["sy;mb?=ol129", "sy;mbol129"],
  ["ipa明朝", "ipamincho"],
  ["ipaゴシック", "ipagothic"],
  ["ヒラギノ角ゴシック", "hiraginosans"],
  ["ヒラギノ明朝pron", "hiraginominchopron"],
  ["ヒラギノ丸ゴpron", "hiraginomarugothicpron"],
])(
  "ports native testSingleElement %s",
  /** Preserves the direct native QA expectations unchanged. @param input - Original input. @param want - Native expectation. @returns Nothing. */ (
    input,
    want,
  ) => {
    expect(text(GetEnglishSearchFontName(units(input)))).toBe(want);
  },
);

it("preserves all155 dictionary rows and sequential unique aliases, including source conflicts", /** Verifies complete localized mapping without discarding duplicate source evidence. @returns Nothing. */ () => {
  const expected = new Map<string, string>();
  for (const [name, value] of names as [string, string][])
    if (!expected.has(name)) expected.set(name, value);
  expect(names).toHaveLength(155);
  expect(expected.size).toBe(153);
  for (const name of expected.keys()) {
    // Native normalization precedes lookup; two literal hyphenated keys are unreachable (CALC-145).
    const normalized = name.replace(/[^a-z0-9;()\u0080-\uffff]/g, "");
    expect(text(GetEnglishSearchFontName(units(name))), name).toBe(
      expected.get(normalized) ?? normalized,
    );
  }
  expect(text(GetEnglishSearchFontName(units("hg正楷書体-pro")))).toBe("hg正楷書体pro");
  expect(text(GetEnglishSearchFontName(units("hg丸ｺﾞｼｯｸ-pro")))).toBe("hg丸ｺﾞｼｯｸpro");
  expect(text(GetEnglishSearchFontName(units("IPAex明朝")))).toBe("ipaexmimcho");
  expect(text(GetEnglishSearchFontName(units("方正黑体")))).toBe("fzhei");
  expect(text(GetEnglishSearchFontName(units("方正楷体")))).toBe("fzkai");
});

it("classifies every UTF16 unit with ASCII-only/fullwidth rules and keeps unmapped Unicode", /** Exhausts all65536 unit values against independent ASCII character-class expectations. @returns Nothing. */ () => {
  const differences: number[] = [];
  for (let unit = 0; unit <= 0xffff; unit++) {
    const input = Uint16Array.of(unit),
      actual = GetEnglishSearchFontName(input);
    const half = unit >= 0xff00 && unit <= 0xff5e ? unit - 0xfee0 : unit;
    let want = String.fromCharCode(half);
    if (half < 128) {
      want = want.replace(
        /[A-Z]/g,
        /** Native ASCII lower expectation. @param letter - Uppercase. @returns Lowercase ASCII. */ (
          letter,
        ) => letter.toLowerCase(),
      );
      if (!/^[a-z0-9;()]$/.test(want)) want = "";
    }
    if (unit === 26725) want = "hei";
    if (unit === 27489) want = "kai";
    if (text(actual) !== want) differences.push(unit);
    actual.dispose();
  }
  expect(differences).toEqual([]);
  expect(text(GetEnglishSearchFontName(units("ＡＢＣ１２３；（） ！\0\t")))).toBe("abc123;()");
  expect(text(GetEnglishSearchFontName(units("Éß🙂\ud800\u00a0")))).toBe("Éß🙂\ud800\u00a0");
  expect(text(GetEnglishSearchFontName(units("")))).toBe("");
});

it("strips only original suffixes repeatedly while keeping unchanged shared identity", /** Covers all original suffixes and original case/value copying. @returns Nothing. */ () => {
  for (const suffix of [
    " baltic",
    " ce",
    " cyr",
    " greek",
    " tur",
    " (arabic)",
    " (hebrew)",
    " (thai)",
    " (vietnamese)",
  ])
    expect(text(StripScriptFromName(unicode("Times" + suffix.toUpperCase())))).toBe("Times");
  const source = unicode("Times CYR Greek (Thai) CE");
  expect(text(StripScriptFromName(source))).toBe("Times");
  expect(text(source)).toBe("Times CYR Greek (Thai) CE");
  for (const name of ["", "Times CE ", "TimesCE", "Times (SIP)", "É🙂"]) {
    const original = unicode(name),
      copy = StripScriptFromName(original);
    expect(text(copy)).toBe(name);
    expect(copy.pData).toBe(original.pData);
  }
});

it("appends raw distinct tokens with native empty/case/space/comma and alias behavior", /** Exercises real mutable Unicode values with independent copies and borrowed aliases. @returns Nothing. */ () => {
  for (const [initial, added, want] of [
    ["", "", ""],
    ["", "A", "A"],
    ["A", "A", "A"],
    ["A", "a", "A;a"],
    ["A,b", "b", "A,b"],
    ["A", "", "A;"],
    ["A;", "", "A;"],
    ["A", " A", "A; A"],
    ["A\0🙂", "A\0🙂", "A\0🙂"],
    ["A", "B", "A;B"],
  ]) {
    const name = unicode(initial as string),
      copy = new OUString(name),
      identity = name.pData;
    AddTokenFontName(name, units(added as string));
    expect(text(name)).toBe(want);
    expect(text(copy)).toBe(initial);
    if (initial === want) expect(name.pData).toBe(identity);
  }
  const source = unicode("A;B");
  AddTokenFontName(source, source.getStr().subarray(0, source.getLength()));
  expect(text(source)).toBe("A;B;A;B");
});

it.each([
  ["StarSymbol", true],
  ["OPENSYMBOL,Other", true],
  ["starsymbol;Other", true],
  ["Other;OpenSymbol", false],
  [" OpenSymbol", false],
  ["OpenSymbol ", false],
  ["", false],
  ["ſtarsymbol", false],
  ["ＯpenSymbol", false],
])(
  "recognizes only the first raw ASCII symbol token %s",
  /** Checks the actual original first-token predicate. @param value - List. @param want - Native result. @returns Nothing. */ (
    value,
    want,
  ) => {
    expect(IsOpenSymbol(units(value as string))).toBe(want);
  },
);
