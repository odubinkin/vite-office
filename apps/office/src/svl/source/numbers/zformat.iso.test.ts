/** @fileoverview Checks pinned ImpIsIso8601 semantics through actual number-format compilation, without fabricated tokens. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumberFormatter } from "./zforlist";
import { SvNumberformat } from "./zformat";

/** Source state-machine expectations, including its explicitly accepted single-width and two-digit-year forms. */
const cases: readonly (readonly [string, boolean])[] = [
  ["YYYY-MM-DD", true],
  ["YY-M-D", true],
  ['YYYY"-"MM"-"DD', true],
  ["YYYY-MM-DD HH:MM:SS", true],
  ["YYYY-MM", false],
  ["YYYY/MM/DD", false],
  ["MM-DD-YYYY", false],
  ["DD-MM-YYYY", false],
  ["YYYY-DD-MM", false],
  ["YYYY-MM-YYYY-DD", false],
  ["YYYY-MM-MM-DD", false],
  ["YYYY-MM-DDDD", false],
  ['"-"YYYY-MM-DD', false],
  ['YYYY"--"MM"-"DD', false],
  ['YYYY"-""-"MM"-"DD', false],
  ["YYYY MMM DD", false],
  ["HH:MM:SS", false],
  ["0.00", false],
];

it.each(cases)(
  "recognizes the original ISO token sequence in %s",
  /** Actual formatter/scanner ownership establishes the token stream before querying the original recognizer. @param pattern - Format code. @param expected - Pinned source contract. @returns Nothing. */ (
    pattern,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
      code = unicode(pattern),
      check: [number] = [0];
    try {
      const format = new SvNumberformat(
        code,
        scanner,
        scanner.GetCurrentLanguageData().pStringScanner,
        formatter.GetNatNum(),
        check,
        [0x409],
      );
      try {
        expect(check[0]).toBe(0);
        expect(format.IsIso8601(0)).toBe(expected);
        expect(format.IsIso8601(4)).toBe(false);
        expect(format.IsIso8601(65535)).toBe(false);
        expect(format.IsIso8601(65536)).toBe(expected);
        expect(format.IsIso8601(3)).toBe(false);
      } finally {
        format.dispose();
      }
    } finally {
      code.dispose();
      formatter.dispose();
    }
  },
);
