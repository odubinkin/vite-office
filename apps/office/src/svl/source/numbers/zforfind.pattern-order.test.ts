/** @fileoverview Native date acceptance patterns and their original packed order interpretation. */
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NfEvalDateFormat } from "../../inc/zforlist";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { DateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import { SvNFLanguageData } from "./zforlist";
import { SvNumberformat } from "./zformat";

it("evaluates full, partial and unusual source date orders after actual pattern matching", /** Checks D/M/Y ordinal extraction and source fallback without a host date parser. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    NumberStringDivision(value: OUString): void;
    IsAcceptedDatePattern(start: number): boolean;
    GetDateOrder(): DateOrder;
    GetDatePatternNumbers(): number;
    IsDatePatternNumberOfType(number: number, type: string): boolean;
    SkipDatePatternSeparator(particle: number, position: [number], signed: [boolean]): boolean;
  };
  const state = language.pStringScanner.fields;
  const cases: [string, string, DateOrder][] = [
    ["Y/M/D", "2024/12/31", DateOrder.YMD],
    ["D/M/Y", "31/12/2024", DateOrder.DMY],
    ["M/D/Y", "12/31/2024", DateOrder.MDY],
    ["Y/M", "2024/12", DateOrder.YMD],
    ["M/Y", "12/2024", DateOrder.DMY],
    ["M/D", "12/31", DateOrder.MDY],
    ["D/Y", "31/2024", DateOrder.MDY],
    ["D/M", "31/12", DateOrder.DMY],
    ["Y", "2024", DateOrder.YMD],
    ["M", "12", DateOrder.MDY],
    ["D", "31", DateOrder.DMY],
    ["Y/D/M", "2024/31/12", DateOrder.MDY],
    ["M/Y/D", "12/2024/31", DateOrder.MDY],
    ["D/Y/M", "31/2024/12", DateOrder.MDY],
    ["Y/D", "2024/31", DateOrder.MDY],
    ["Y/M/D/Y", "2024/12/31/2025", DateOrder.YMD],
    ["M/M", "12/11", DateOrder.MDY],
    ["D/D", "31/30", DateOrder.MDY],
    ["Y/Y", "2024/2025", DateOrder.MDY],
  ];
  try {
    for (const [pattern, value, order] of cases) {
      scanner.Reset();
      for (const previous of state.sDateAcceptancePatterns) previous.dispose();
      state.sDateAcceptancePatterns = [unicode(pattern)];
      const input = unicode(value);
      try {
        scanner.NumberStringDivision(input);
        expect(scanner.IsAcceptedDatePattern(0), pattern).toBe(true);
        expect(scanner.GetDateOrder(), pattern).toBe(order);
        const tokens = [...pattern].filter(
          /** Selects date particles. @param token - Pattern character. @returns Whether numeric. */ (
            token,
          ) => "DMY".includes(token),
        );
        expect(scanner.GetDatePatternNumbers()).toBe(tokens.length);
        for (const [index, token] of tokens.entries()) {
          expect(scanner.IsDatePatternNumberOfType(index, token)).toBe(true);
          expect(scanner.IsDatePatternNumberOfType(index, "X")).toBe(false);
        }
        expect(scanner.IsDatePatternNumberOfType(tokens.length, "Y")).toBe(false);
        expect(scanner.SkipDatePatternSeparator(-1, [0], [false])).toBe(false);
        expect(scanner.SkipDatePatternSeparator(state.nStringsCnt, [0], [false])).toBe(false);
        expect(scanner.SkipDatePatternSeparator(0, [0], [false])).toBe(false);
        if (tokens.length > 1) {
          const position: [number] = [0],
            signed: [boolean] = [false];
          expect(scanner.SkipDatePatternSeparator(1, position, signed)).toBe(true);
          expect(position[0]).toBe(1);
          expect(signed[0]).toBe(false);
        }
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});

it("orders initial and format-language date patterns according to the native evaluation mode", /** Checks locale switching and restoration on the actual language-owned scanner. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const initial = language.GetLocaleData().getDateAcceptancePatterns().map(text);
  language.ChangeIntl(0x0407);
  const current = language.GetLocaleData().getDateAcceptancePatterns().map(text);
  const code = unicode("Standard");
  const format = new SvNumberformat(code, language.GetFormatScanner(), [0], [0x0407]);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    NumberStringDivision(value: OUString): void;
    IsAcceptedDatePattern(start: number): boolean;
  };
  const state = language.pStringScanner.fields;
  try {
    for (const [mode, expected] of [
      [NfEvalDateFormat.International, initial],
      [NfEvalDateFormat.Format, current],
      [NfEvalDateFormat.InternationalThenFormat, [...initial, ...current]],
      [NfEvalDateFormat.FormatThenInternational, [...current, ...initial]],
    ] as const) {
      scanner.Reset();
      for (const previous of state.sDateAcceptancePatterns) previous.dispose();
      state.sDateAcceptancePatterns = [];
      state.mpFormat = format;
      language.SetEvalDateFormat(mode);
      const input = unicode("12/31/2024");
      try {
        scanner.NumberStringDivision(input);
        expect(scanner.IsAcceptedDatePattern(0)).toBe(mode !== NfEvalDateFormat.Format);
        expect(state.sDateAcceptancePatterns.map(text)).toEqual(expected);
        expect(language.GetLocaleData().getDateAcceptancePatterns().map(text)).toEqual(current);
      } finally {
        input.dispose();
      }
    }
  } finally {
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});

it("checks source month and day ranges, signed years and multi-character separators", /** Checks actual fragment recognition and separator cursor updates. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    NumberStringDivision(value: OUString): void;
    IsAcceptedDatePattern(start: number): boolean;
    GetDatePatternOrder(): number;
    SkipDatePatternSeparator(particle: number, position: [number], signed: [boolean]): boolean;
  };
  const state = language.pStringScanner.fields;
  try {
    for (const [pattern, value, accepted] of [
      ["D/M/Y", "31/12/-2024", true],
      ["D/M/Y", "32/12/2024", false],
      ["D/M/Y", "0/12/2024", false],
      ["D/M/Y", "1/13/2024", false],
      ["D/M/Y", "1/0/2024", false],
      ["D/M/Y", "001/12/2024", false],
      ["D/M/Y", "1/A/2024", false],
      ["D/M/Y", "1-12-2024", false],
      ["D/M/Y", "1/12/", false],
      ["D/M/Y", "1/12/2024 ", true],
      ["D. M. Y", "1. 12. 2024", true],
      ["D. M. Y", "1. 12. -2024", true],
      ["D/M/Y", "", false],
    ] as const) {
      scanner.Reset();
      for (const previous of state.sDateAcceptancePatterns) previous.dispose();
      state.sDateAcceptancePatterns = [unicode(pattern)];
      const input = unicode(value);
      try {
        scanner.NumberStringDivision(input);
        expect(scanner.IsAcceptedDatePattern(0), value).toBe(accepted);
        if (accepted) {
          expect(scanner.GetDatePatternOrder()).toBe(0x444d59);
          if (value.includes("-2024")) {
            const position: [number] = [0],
              signed: [boolean] = [false];
            expect(scanner.SkipDatePatternSeparator(3, position, signed)).toBe(true);
            expect(position[0]).toBe(value.includes(". ") ? 3 : 2);
            expect(signed[0]).toBe(true);
          }
        } else expect(scanner.GetDatePatternOrder()).toBe(0);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});
