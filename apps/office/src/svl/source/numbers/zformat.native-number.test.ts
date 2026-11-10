/** @fileoverview Original native-number placement in numeric/fraction/scientific/Standard output through genuine compiled entries, metadata and service owners. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import type { SvNumberformat } from "./zformat";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { INPUTSTRING_PRECISION, UNLIMITED_PRECISION } from "./zforlist.defaults";
/** Inserts an actual entry through original scanner/table owners. @param owner - Real formatter. @param pattern - Source code. @param language - Language. @returns Actual key. */
function insert(owner: SvNumberFormatter, pattern: string, language = 0x411): number {
  const code = unicode(pattern),
    check: [number] = [0],
    type: [number] = [0],
    key: [number] = [0];
  try {
    owner["m_aFormatData"].PutEntry(
      owner["m_aCurrentLanguage"],
      owner.GetNatNum(),
      code,
      check,
      type,
      key,
      language,
    );
    expect(check[0]).toBe(0);
    return key[0];
  } finally {
    code.dispose();
  }
}
it.each([
  ["[NatNum1]0.00", 12.5, "一二・五〇"],
  ["[NatNum3]0.00", -12.5, "－１２．５０"],
  ["[NatNum3]0.00", -0.004, "０．００"],
  ["[NatNum3]#,##0.00", 1234.5, "１，２３４．５０"],
  ["[NatNum3]0.00%", 0.125, "１２．５０%"],
  ['[NatNum3]"Item1:"0', 12, "Item１:１２"],
  ["[NatNum3]0.00E+00", 12345, "1.23E+04"],
  ["[NatNum1]000.00E+00", 12345, "012.35E+03"],
  ["[NatNum3]# ?/?", 1.5, "１ １/２"],
  ["[NatNum3]# ?/?", -1.5, "-１ １/２"],
  ["[NatNum3]0 00/00", 1.5, "１ 0１/0２"],
  ["[NatNum4]# ??/??", 1.5, "一  一/二 "],
  ["[NatNum3]Standard", 12.5, "１２．５"],
  ['[NatNum3]"x1="Standard', 12.5, "x１=１２．５"],
  ["[NatNum3]@", 12.5, "１２．５"],
] as const)(
  "keeps original conversion in %s for %s",
  /** The actual selected entry and native service execute the source producer and fill path; scientific output deliberately has no invented final conversion. @param pattern - Format. @param value - Source double. @param expected - Source-derived result. @returns Nothing. */ (
    pattern,
    value,
    expected,
  ) => {
    const owner = new SvNumberFormatter(0x411),
      output = new OUString();
    try {
      const key = insert(owner, pattern);
      owner.GetOutputString(value, key, output, [null]);
      expect(text(output)).toBe(expected);
    } finally {
      output.dispose();
      owner.dispose();
    }
  },
);
it.each([
  [false, 2, 12.5, "１２．５"],
  [true, 2, 12.5, "１２．５"],
  [false, UNLIMITED_PRECISION, 12.5, "１２．５"],
  [true, UNLIMITED_PRECISION, 12.5, "12.5"],
  [true, INPUTSTRING_PRECISION, 12.5, "12.5"],
  [true, 2, 1.234e16, "1.23E+16"],
  [false, 2, 1.234e16, "１．２３E+１６"],
  [true, 2, -0.0001, "０"],
] as const)(
  "preserves standard=%s precision=%i source branch for %s",
  /** Original standard flag and precision policy select separate Standard/unlimited/input-line paths; no final global transliteration is applied. @param standard - Actual entry flag. @param precision - Original precision. @param value - Double. @param expected - Source output. @returns Nothing. */ (
    standard,
    precision,
    value,
    expected,
  ) => {
    const owner = new SvNumberFormatter(0x411),
      output = new OUString();
    try {
      const key = standard ? owner.GetStandardIndex(0x411) : insert(owner, "[NatNum3]Standard"),
        entry = owner.GetEntry(key) as SvNumberformat;
      if (standard) {
        entry["NumFor"][0]?.SetNatNumNum(3, false);
        entry["NumFor"][0]?.SetNatNumLang(0x411);
        expect(entry.IsStandard()).toBe(true);
      }
      owner.ChangeStandardPrec(precision);
      owner.GetOutputString(value, key, output, [null]);
      expect(text(output)).toBe(expected);
    } finally {
      output.dispose();
      owner.dispose();
    }
  },
);
it("retains first-section metadata during Standard inside another selected section", /** Source ImpGetOutputStandard uses NumFor0 while the final ordinary-number conversion uses the selected section; native Thai digits must not be replaced by inferred current-locale digits. @returns Nothing. */ () => {
  const owner = new SvNumberFormatter(0x411),
    output = new OUString();
  try {
    const key = insert(owner, "[NatNum3]0;[NatNum3]Standard"),
      entry = owner.GetEntry(key) as SvNumberformat;
    entry["NumFor"][0]?.SetNatNumNum(1, false);
    entry["NumFor"][0]?.SetNatNumLang(0x41e);
    owner.GetOutputString(-12, key, output, [null]);
    expect(text(output)).toBe("๑๒");
  } finally {
    output.dispose();
    owner.dispose();
  }
});
it("keeps native modifiers out of the original text overload", /** An actual TEXT entry formats a numeric value through Standard, while its original borrowed-string overload returns the string tokens without numeric conversion. @returns Nothing. */ () => {
  const owner = new SvNumberFormatter(0x411),
    output = new OUString(),
    input = unicode("12.5");
  try {
    const key = insert(owner, "[NatNum3]@"),
      entry = owner.GetEntry(key) as SvNumberformat;
    owner.GetOutputString(12.5, key, output, [null]);
    expect(text(output)).toBe("１２．５");
    entry.GetOutputString(input, output, [null]);
    expect(text(output)).toBe("12.5");
  } finally {
    input.dispose();
    output.dispose();
    owner.dispose();
  }
});

it.each([
  [2, "00.קכ״"],
  [INPUTSTRING_PRECISION, "00.קכ״ה"],
] as const)(
  "preserves source fractional-second converted-length policy at precision%i",
  /** Source normal display retains the requested decimal counter, while its input-line minimum branch resets the counter after native conversion. Hebrew125 has four UTF16 units with gershayim. @param precision - Source policy. @param expected - Source output. @returns Nothing. */ (
    precision,
    expected,
  ) => {
    const owner = new SvNumberFormatter(0x40d),
      output = new OUString();
    try {
      const key = insert(owner, "[NatNum2]SS.000", 0x40d);
      owner.ChangeStandardPrec(precision);
      owner.GetOutputString(0.125 / 86400, key, output, [null]);
      expect(text(output)).toBe(expected);
    } finally {
      output.dispose();
      owner.dispose();
    }
  },
);

it("uses the genuine Myanmar builtin NatNum1 Standard entry without changing its metadata", /** Original my_MM formatindex0 declares NatNum1; actual builtin generation supplies NUMBER/standard flags and the native modifier. This verifies the existing initializer-to-output dependency rather than a constructed substitute entry. @returns Nothing. */ () => {
  const owner = new SvNumberFormatter(0x455),
    output = new OUString();
  try {
    const key = owner.GetStandardIndex(0x455),
      entry = owner.GetEntry(key) as SvNumberformat;
    expect(entry.IsStandard()).toBe(true);
    expect(entry["NumFor"][0]?.GetNatNum().GetNatNum()).toBe(1);
    owner.GetOutputString(12.5, key, output, [null]);
    expect(text(output)).toBe("၁၂.၅");
    owner.ChangeStandardPrec(UNLIMITED_PRECISION);
    owner.GetOutputString(12.5, key, output, [null]);
    expect(text(output)).toBe("12.5");
  } finally {
    output.dispose();
    owner.dispose();
  }
});
