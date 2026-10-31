/** @fileoverview Native SDNUM/SDVAL static helper consumes actual compiled formatter entries, locales and scanners. */
import { assert, expect, it } from "vitest";
import { GetTableDataOptionsValNum } from "./sfxhtml";
import { SvNumberFormatter } from "../../../svl/source/numbers/zforlist";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_SYSTEM } from "../../../i18nlangtag/inc/lang";
it.each([
  ["12.5", "1033;1033;0.00", 12.5, 1033, "0.00"],
  ["12,5", "1031;1033;0.000", 12.5, 1033, "0.000"],
  ["12.5", '1033;1033;0.00;[RED]-0.00;"zero"', 12.5, 1033, '0.00;[RED]-0.00;"zero"'],
  ["12.5", "1033;1031;0,00", 12.5, 1031, "0,00"],
  ["bad value", "1033;1033;0.00", 0, 1033, "0.00"],
] as const)(
  "preserves native parsing %s / %s",
  /** Parse locale and display locale are independent; format suffix semicolons are not discarded. @param input - Actual SDVAL. @param options - Actual SDNUM. @param expected - Source numeric result. @param locale - Display language. @param code - Compiled format suffix. @returns Nothing. */ (
    input,
    options,
    expected,
    locale,
    code,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      format: [number] = [99999],
      language: [number] = [9999];
    try {
      expect(GetTableDataOptionsValNum(format, language, input, options, formatter)).toBe(expected);
      expect(language[0]).toBe(locale);
      const parsed = formatter.GetEntry(format[0]);
      assert(parsed);
      expect(text(parsed.GetFormatstring())).toBe(code);
      expect(formatter.GetEntry(format[0])?.GetLanguage()).toBe(locale);
    } finally {
      formatter.dispose();
    }
  },
);
it.each(["1033", "1033;1031", "1033;", "", "65536"])(
  "uses source SYSTEM fallback for short SDNUM %s",
  /** Missing format-code token returns the original SYSTEM General key even if a second locale was supplied. @param options - Original options. @returns Nothing. */ (
    options,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      format: [number] = [999],
      language: [number] = [999];
    try {
      GetTableDataOptionsValNum(format, language, "12.5", options, formatter);
      expect(language[0]).toBe(LANGUAGE_SYSTEM);
      expect(format[0]).toBe(formatter.GetFormatForLanguageIfBuiltIn(0, LANGUAGE_SYSTEM));
    } finally {
      formatter.dispose();
    }
  },
);
it("converts explicit SYSTEM formats and retains empty-format failure without an invented key", /** Source ignores the format insertion return/error position; malformed empty suffix reaches original PutEntry key0. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    format: [number] = [999],
    language: [number] = [999];
  try {
    expect(GetTableDataOptionsValNum(format, language, "12.5", "1033;0;0.00", formatter)).toBe(
      12.5,
    );
    expect(language[0]).toBe(LANGUAGE_SYSTEM);
    expect(formatter.GetEntry(format[0])).not.toBeNull();
    expect(GetTableDataOptionsValNum(format, language, "12.5", "1033;1033;", formatter)).toBe(12.5);
    expect(format[0]).toBe(0);
    expect(language[0]).toBe(1033);
  } finally {
    formatter.dispose();
  }
});
