/** @fileoverview Native compiled-format literal matching retains sign reconciliation and remaining-suffix rules. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { NfSymbolType } from "../../inc/nfsymbol";
import { SvNumFormatType as Type } from "../../inc/zforlist";
import { SvNFLanguageData, SvNumberFormatter } from "./zforlist";
import { ImpSvNumFor, SvNumberformat } from "./zformat";

it("reconciles negative subformat literals with already scanned signs", /** Checks the original compiled token owner and source-private matching stage without creating another formatter. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(code, language.GetFormatScanner(), [0], [0x0409]);
  const negative = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[1] as ImpSvNumFor;
  negative.Enlarge(1);
  negative.Info().nTypeArray[0] = NfSymbolType.STRING;
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    ScanStringNumFor(value: OUString, position: number, token: number, suppress: boolean): boolean;
  };
  const state = language.pStringScanner.fields;
  const cases: [string, string, number, number, number, number, boolean, boolean, number][] = [
    ["NEG", "NEG", 0, 0, 0, 0, false, true, -1],
    ["NEG", "NEG", 0, -1, -1, 0, false, true, 1],
    ["NEG", "NEG", 0, -1, -1, 1, false, true, -1],
    ["NEG", "NEG", 0, -1, 1, 0, false, true, -1],
    ["NEG", "NEG", 0, -1, 0, 0, false, true, -1],
    ["-", "X-", 1, -1, 0, 0, false, true, -1],
    ["-", "-", 0, -1, 0, 0, false, true, 0],
    ["NEG", "NEG", 0, -1, 0, 0, true, true, 0],
    ["NEG", "X - ", 1, -1, 0, 0, false, true, -1],
    ["NEG", "X - - ", 1, -1, 0, 0, false, false, 0],
    ["NEG", "X - ", 1, -1, 0, 0, true, false, 0],
    ["NEG", "X - ", 1, 1, 0, 0, false, false, 0],
    ["NEG", "-", 0, -1, 0, 0, false, false, 0],
    ["NEG", "NEG", 0, 1, 0, 2, false, false, 0],
  ];
  try {
    for (const [
      literal,
      value,
      position,
      sign,
      oldStringSign,
      subformat,
      suppress,
      accepted,
      stringSign,
    ] of cases) {
      scanner.Reset();
      state.mpFormat = format;
      state.nSign = sign;
      state.nStringScanSign = oldStringSign;
      state.nStringScanNumFor = subformat;
      const token = unicode(literal),
        input = unicode(value);
      try {
        (negative.Info().sStrArray[0] as OUString).assign(token);
        expect(
          scanner.ScanStringNumFor(input, position, 0, suppress),
          JSON.stringify([literal, value, sign, oldStringSign, subformat]),
        ).toBe(accepted);
        expect(state.nStringScanSign).toBe(stringSign);
      } finally {
        token.dispose();
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

it("matches leading, middle and trailing literals through complete compiled-format dispatch", /** Checks original compiled token owners directly because arbitrary pattern parsing is not yet ported. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    IsNumberFormatMain(value: OUString, format: SvNumberformat): boolean;
  };
  const cases: [(string | number)[], string, boolean, number][] = [
    [["TAG", 0], "TAG123", true, Type.NUMBER],
    [[0, "TAIL"], "123TAIL", true, Type.NUMBER],
    [[0, "MID", 0], "12MID34", true, Type.NUMBER],
    [["A", 0, "B", 0, "C"], "A12B34C", true, Type.NUMBER],
    [["A", 0, "B", 0, "C", 0, "D"], "A12B34C56D", true, Type.NUMBER],
    [["A", 0, "B", 0, "C", 0, "D", 0, "E"], "A12B34C56D78E", true, Type.NUMBER],
    [["TAG", 0], "TAG123WRONG", false, Type.UNDEFINED],
    [[0, "MID", 0], "12WRONG34", false, Type.UNDEFINED],
    [[0, "TAIL"], "123WRONG", false, Type.UNDEFINED],
    [[0, "TAIL"], "123", true, Type.NUMBER],
  ];
  try {
    for (const [tokens, source, accepted, type] of cases) {
      const code = unicode("General");
      const input = unicode(source);
      const error: [number] = [0];
      const format = new SvNumberformat(code, language.GetFormatScanner(), error, [0x0409]);
      try {
        expect(error[0]).toBe(0);
        const section = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
        section.Enlarge(tokens.length);
        section.Info().eScannedType = Type.NUMBER;
        for (const [index, token] of tokens.entries()) {
          section.Info().nTypeArray[index] =
            typeof token === "number" ? NfSymbolType.DIGIT : NfSymbolType.STRING;
          const value = unicode(String(token));
          try {
            (section.Info().sStrArray[index] as OUString).assign(value);
          } finally {
            value.dispose();
          }
        }
        language.pStringScanner.fields.eSetType = Type.UNDEFINED;
        expect(scanner.IsNumberFormatMain(input, format), source).toBe(accepted);
        if (accepted) expect(language.pStringScanner.fields.eScannedType, source).toBe(type);
      } finally {
        format.dispose();
        input.dispose();
        code.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("falls back from the locale currency to the explicit compiled currency symbol", /** Checks native currency tokens and symbol-length admission against the current source owner. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(code, language.GetFormatScanner(), [0], [0x0409]);
  const first = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  first.Enlarge(1);
  first.Info().nTypeArray[0] = NfSymbolType.CURRENCY;
  const symbol = unicode("ZZZ");
  (first.Info().sStrArray[0] as OUString).assign(symbol);
  const scanner = language.pStringScanner as unknown as {
    GetCurrency(value: OUString, position: [number]): boolean;
  };
  language.pStringScanner.fields.mpFormat = format;
  try {
    for (const [value, matched, consumed] of [
      ["ZZZ1", true, 3],
      ["ZZ", false, 0],
      ["QQQ", false, 0],
    ] as const) {
      const input = unicode(value),
        position: [number] = [0];
      try {
        expect(scanner.GetCurrency(input, position)).toBe(matched);
        expect(position[0]).toBe(consumed);
      } finally {
        input.dispose();
      }
    }
  } finally {
    symbol.dispose();
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});
