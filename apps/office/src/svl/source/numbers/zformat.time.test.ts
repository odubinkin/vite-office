/** @fileoverview Original wall-clock, elapsed-time and fraction formatting through actual parsed entries and formatter owners. */
import { expect, it } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { Color } from "../../../tools/inc/color";
it.each([
  ["[NatNum1]HH:MM:SS.00", 0.5, "一二:〇〇:〇〇.00", 0x411],
  ["[NatNum3]HH:MM:SS.00", 0.5, "１２:００:００.00", 0x411],
  ["[NatNum4]HH:MM", 0.5, "十二:〇", 0x411],
  ["[NatNum3][HH]:MM", -1.5, "-３６:００", 0x411],
  ["HH:MM:SS", 1.5, "12:00:00"],
  ["HH:MM:SS", -0.25, "18:00:00"],
  ["HH:MM:SS", -0, "00:00:00"],
  ["H:M:S", 3661 / 86400, "1:1:1"],
  ["HH:MM", 59.99999 / 86400, "00:00"],
  ["HH:MM:SS.00", 59.99999 / 86400, "00:00:59.99"],
  ["SS.00", 0.9999 / 86400, "00.99"],
  ["[SS].00", 59.99999 / 86400, "60.00"],
  ["[HH]:MM:SS", 1.5, "36:00:00"],
  ["[HH]:MM:SS", -1.5, "-36:00:00"],
  ["[MM]:SS", -0.5, "-720:00"],
  ["[SS]", 1.5, "129600"],
  ["[HH]:MM:SS", -1e-10, "00:00:00"],
  ["[SS]", 0x100000000 / 86400, "#FMT"],
  ["HH:MM AM/PM", 0, "12:00 AM"],
  ["HH:MM AM/PM", 0.5, "12:00 PM"],
  ["HH:MM AM/PM", 0.75, "06:00 PM"],
  ["HH:MM A/P", 0.75, "06:00 p"],
  ["HH:MM:SS,00", 0.5 + 0.5 / 86400, "12:00:00,50", 0x407],
  ["HH:MM AM/PM", 0.75, "06:00 午後", 0x411],
  ["[HH]:MM AM/PM", 1.5, "24:00 PM"],
  ['HH:MM;"negative "HH:MM', -0.25, "negative 06:00"],
])(
  "uses original time tokens %s for %s",
  /** Actual public table insertion and output dispatch select the source time producer. @param pattern - Source pattern. @param value - Serial input. @param expected - Source-derived output. @param language - Actual language, English by default. @returns Nothing. */ (
    pattern,
    value,
    expected,
    language = 0x409,
  ) => {
    const formatter = new SvNumberFormatter(language),
      code = unicode(pattern),
      output = new OUString(),
      check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0],
      color: [Color | null] = [null];
    try {
      formatter["m_aFormatData"].PutEntry(
        formatter["m_aCurrentLanguage"],
        formatter.GetNatNum(),
        code,
        check,
        type,
        key,
        language,
      );
      expect(check[0]).toBe(0);
      formatter.GetOutputString(value, key[0], output, color);
      expect(text(output)).toBe(expected);
    } finally {
      output.dispose();
      code.dispose();
      formatter.dispose();
    }
  },
);

it.each([
  [1.123456 / 86400, "00:00:01.123456"],
  [1.1 / 86400, "00:00:01.10"],
])(
  "retains original fractional input-line precision for %s",
  /** Filtering keeps the actual display pattern while the source input-line API raises fractional precision to seven and retains its original minimum. @param value - Serial time. @param expected - Input string. @returns Nothing. */ (
    value,
    expected,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      code = unicode("HH:MM:SS.00"),
      check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0];
    try {
      formatter["m_aFormatData"].PutEntry(
        formatter["m_aCurrentLanguage"],
        formatter.GetNatNum(),
        code,
        check,
        type,
        key,
        0x409,
      );
      expect(check[0]).toBe(0);
      const output = formatter.GetInputLineString(value, key[0], true);
      try {
        expect(text(output)).toBe(expected);
      } finally {
        output.dispose();
      }
      expect(formatter.GetStandardPrec()).toBe(2);
    } finally {
      code.dispose();
      formatter.dispose();
    }
  },
);
