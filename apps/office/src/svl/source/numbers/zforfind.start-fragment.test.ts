/** @fileoverview Native leading-fragment admission retains currency, decimal and calendar ambiguity rules. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNumFormatType as Type } from "../../inc/zforlist";
import { SvNumberFormatter } from "./zforlist";

it("rejects incomplete month prefixes and decimal blanks while retaining valid source fragments", /** Checks actual leading scanner stages with their numeric-fragment counts. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    ScanStartString(value: OUString): boolean;
  };
  const state = language.pStringScanner.fields;
  const cases: [string, number, number, boolean, number, number, number][] = [
    [". ", 2, 1, false, Type.UNDEFINED, 0, 0],
    ["$.", 2, 1, true, Type.CURRENCY, 1, 0],
    ["$. ", 2, 1, false, Type.UNDEFINED, 0, 0],
    ["$-.", 2, 1, true, Type.CURRENCY, 1, 0],
    ["JAN", 2, 1, false, Type.UNDEFINED, 0, 0],
    ["JAN", 4, 2, true, Type.DATE, 0, -1],
    ["JAN/", 2, 1, true, Type.DATE, 0, -1],
    ["JAN-", 2, 1, true, Type.DATE, 0, -1],
    ["MONDAY", 2, 1, true, Type.DATE, 0, 0],
    ["MON JAN", 2, 1, false, Type.DATE, 0, 0],
    ["MON JAN", 4, 2, true, Type.DATE, 0, -1],
    ["MONDAY JANUARY ", 2, 1, true, Type.DATE, 0, 1],
  ];
  try {
    for (const [source, strings, numerics, accepted, type, decimal, month] of cases) {
      scanner.Reset();
      state.nMatchedAllStrings = 0;
      state.nStringsCnt = strings;
      state.nNumericsCnt = numerics;
      const input = unicode(source);
      try {
        expect(scanner.ScanStartString(input), source).toBe(accepted);
        expect(state.eScannedType, source).toBe(type);
        expect(state.nDecPos, source).toBe(decimal);
        expect(state.nMonth, source).toBe(month);
      } finally {
        input.dispose();
      }
    }
    language.ChangeIntl(0x0410);
    scanner.Reset();
    state.nMatchedAllStrings = 0;
    state.nStringsCnt = 4;
    state.nNumericsCnt = 2;
    const ambiguous = unicode("MAR. GEN. ");
    try {
      expect(scanner.ScanStartString(ambiguous)).toBe(true);
      expect(state.nMonth).toBe(-1);
      expect(state.eScannedType).toBe(Type.DATE);
    } finally {
      ambiguous.dispose();
    }
  } finally {
    language.dispose();
    mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("leaves malformed thousands tails for the subsequent source scanner", /** Checks complete-group compaction, malformed digits and the original cursor rollback. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    SkipThousands(input: OUString, position: [number], symbol: OUString): boolean;
    StringPtrContainsImpl(needle: OUString, units: Uint16Array, position: number): boolean;
  };
  const cases: [string, boolean, string, number][] = [
    [",123X", true, "1123", 4],
    [",12X", false, "112", 3],
    [",12", false, "1", 0],
    [",123,45", true, "1123", 4],
    [",X", false, "1", 1],
  ];
  try {
    for (const [source, found, compacted, consumed] of cases) {
      const input = unicode(source);
      const symbol = unicode("1");
      const position: [number] = [0];
      try {
        expect(scanner.SkipThousands(input, position, symbol), source).toBe(found);
        expect(text(symbol), source).toBe(compacted);
        expect(position[0], source).toBe(consumed);
      } finally {
        input.dispose();
        symbol.dispose();
      }
    }
    const empty = unicode("");
    try {
      expect(scanner.StringPtrContainsImpl(empty, new Uint16Array([0]), 0)).toBe(false);
    } finally {
      empty.dispose();
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});
