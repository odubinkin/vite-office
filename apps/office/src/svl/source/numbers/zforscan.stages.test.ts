/** @fileoverview Source-backed scanner stages are tested on the real language/locale/string owners. Native witness compares these observations with unchanged zforscan.cxx bodies. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";

import { KeywordLocalization as L } from "./zforscan";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";

it("retains native month/minute rewrites, brackets, fixed capacity and zero control positions", /** Each stage result is an unchanged-source native witness observation, not a public FinalScan claim. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0409),
    scanner = current.GetFormatScanner();
  try {
    for (const [pattern, lexical, typed, category, types] of [
      ["YYYY-MM-DD", 0, 0, 2, [22, -2, 7, -2, 18]],
      ["HH:MM:SS.000", 0, 0, 4, [12, -2, 5, -2, 14, -2, -2, -2, -2]],
      [
        'YYYY-MM-DD"T"HH:MM:SS.000',
        0,
        0,
        6,
        [22, -2, 7, -2, 18, -1, 12, -2, 5, -2, 14, -2, -2, -2, -2],
      ],
      ["[HH]:MM", 0, 0, 4, [-2, 12, -2, -2, 5]],
      ["[foo]", 0, 0, 2048, [-2, -1, -2]],
      ["0YYYY", 0, 1, 16, [-2, 22]],
      ["*x0*y", 5, -99, 2048, [-4, -2]],
      ["General0@", 0, 0, 256, [39, -2, -2]],
    ] as const) {
      const value = unicode(pattern);
      try {
        const result = scanner["Symbol_Division"](value);
        expect(result, pattern).toBe(lexical);
        expect(result === 0 ? scanner["ScanType"]() : -99, pattern).toBe(typed);
        expect(scanner.GetScannedType(), pattern).toBe(category);
        expect([...scanner["nTypeArray"].slice(0, scanner["nStringsCnt"])], pattern).toEqual(types);
      } finally {
        value.dispose();
      }
    }
    const sharpS = unicode("ß");
    try {
      expect(scanner["Symbol_Division"](sharpS)).toBe(0);
      expect(scanner["nTypeArray"][0]).toBe(S.STRING);
      expect(text(scanner["sStrArray"][0] as OUString)).toBe("ß");
    } finally {
      sharpS.dispose();
    }
    const long = unicode('"x"'.repeat(110));
    try {
      expect(scanner["Symbol_Division"](long)).toBe(0);
      expect(scanner["nStringsCnt"]).toBe(100);
    } finally {
      long.dispose();
    }
  } finally {
    current.dispose();
    mapper.dispose();
  }
});

it("invalidates lazy keyword/currency data without resetting parse state or precision", /** The actual same scanner follows native ChangeIntl across languages and localization policies. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0407),
    scanner = current.GetFormatScanner();
  try {
    expect(scanner["bKeywordsNeedInit"]).toBe(true);
    expect(text(scanner.GetKeywords()[K.YYYY] as OUString)).toBe("JJJJ");
    expect(text(scanner.GetKeywords()[K.HH] as OUString)).toBe("HH");
    expect(text(scanner.GetKeywords()[K.RED] as OUString)).toBe("ROT");
    expect(text(scanner.GetKeywords()[K.BOOLEAN] as OUString)).toBe("LOGISCH");
    scanner.ChangeStandardPrec(7);
    scanner["nStringsCnt"] = 9;
    scanner.ChangeIntl(L.EnglishOnly);
    expect(scanner["nStringsCnt"]).toBe(9);
    expect(scanner.GetStandardPrec()).toBe(7);
    expect(text(scanner.GetKeywords()[K.YYYY] as OUString)).toBe("YYYY");
    expect(text(scanner.GetKeywords()[K.GENERAL] as OUString)).toBe("STANDARD");
    current.ChangeIntl(0x040c);
    expect(current.GetFormatScanner()).toBe(scanner);
    expect(text(scanner.GetKeywords()[K.YYYY] as OUString)).toBe("AAAA");
    expect(text(scanner.GetKeywords()[K.DD] as OUString)).toBe("JJ");
    current.ChangeIntl(0x041e);
    expect(text(scanner.GetKeywords()[K.THAI_T] as OUString)).toBe("T");
    current.ChangeIntl(0x0409);
    expect(text(scanner.GetKeywords()[K.THAI_T] as OUString)).toBe("t");
    expect(scanner["meKeywordLocalization"]).toBe(L.EnglishOnly);
    const symbol = new OUString(),
      bank = new OUString();
    try {
      current.GetCompatibilityCurrency(symbol, bank);
      expect([text(symbol), text(bank)]).toEqual(["$", "USD"]);
    } finally {
      symbol.dispose();
      bank.dispose();
    }
  } finally {
    current.dispose();
    mapper.dispose();
  }
});

it("preserves slot identities and reads an aliased inserted value after the source shift", /** InsertSymbol aliases the string member itself; retaining a pre-shift text snapshot would change the result. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0409),
    scanner = current.GetFormatScanner(),
    values = [unicode("a"), unicode("b"), unicode("c"), unicode("insert")];
  try {
    const slots = scanner["sStrArray"].slice();
    scanner["nStringsCnt"] = 3;
    scanner["nResultStringsCnt"] = 3;
    for (let i = 0; i < 3; ++i) {
      (slots[i] as OUString).assign(values[i] as OUString);
      scanner["nTypeArray"][i] = S.STRING;
    }
    const position: [number] = [1];
    expect(scanner["InsertSymbol"](position, S.THSEP, slots[2] as OUString)).toBe(true);
    expect(
      scanner["sStrArray"].every(
        /** Confirms actual member addresses remain stable. @param slot - Current member. @param i - Native index. @returns Identity. */ (
          slot,
          i,
        ) => slot === slots[i],
      ),
    ).toBe(true);
    expect(slots.slice(0, 4).map(text)).toEqual(["a", "b", "b", "c"]);
    expect([position[0], scanner["nStringsCnt"], scanner["nResultStringsCnt"]]).toEqual([1, 4, 4]);
    scanner["nTypeArray"][1] = S.EMPTY;
    position[0] = 2;
    expect(scanner["InsertSymbol"](position, S.THSEP, values[3] as OUString)).toBe(true);
    expect([
      position[0],
      scanner["nStringsCnt"],
      scanner["nResultStringsCnt"],
      text(slots[1] as OUString),
    ]).toEqual([1, 4, 5, "insert"]);
    scanner["nStringsCnt"] = 99;
    position[0] = 0;
    expect(scanner["InsertSymbol"](position, S.THSEP, values[3] as OUString)).toBe(false);
    scanner["nTypeArray"][98] = S.EMPTY;
    position[0] = 99;
    expect(scanner["InsertSymbol"](position, S.THSEP, values[3] as OUString)).toBe(true);
    expect([position[0], scanner["nStringsCnt"]]).toEqual([98, 99]);
  } finally {
    for (const value of values) value.dispose();
    current.dispose();
    mapper.dispose();
  }
});

it("merges calendar IDs into the original string slot and swaps date slots without changing their addresses", /** This is the source final-calendar helper, not complete FinalScan integration. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0409),
    scanner = current.GetFormatScanner(),
    source = unicode("[~jewish]YYYY");
  try {
    expect(scanner["Symbol_Division"](source)).toBe(0);
    expect(scanner["ScanType"]()).toBe(0);
    const strings = scanner["sStrArray"],
      calendarSlot = strings[2] as OUString,
      yearSlot = strings[8] as OUString,
      position: [number] = [0],
      index: [number] = [0],
      count: [number] = [scanner["nStringsCnt"]];
    expect(scanner["FinalScanGetCalendar"](position, index, count)).toBe(1);
    expect([position[0], index[0], count[0]]).toEqual([9, 8, 4]);
    expect(strings[2]).toBe(calendarSlot);
    expect(text(calendarSlot)).toBe("jewish");
    expect(scanner["nTypeArray"][2]).toBe(S.CALENDAR);
    expect(text(strings[0] as OUString)).toBe("[~");
    const calendarData = calendarSlot.pData,
      yearData = yearSlot.pData;
    scanner["SwapArrayElements"](2, 8);
    expect(strings[2]).toBe(calendarSlot);
    expect(strings[8]).toBe(yearSlot);
    expect(calendarSlot.pData).toBe(yearData);
    expect(yearSlot.pData).toBe(calendarData);
    scanner["SwapArrayElements"](2, 2);
    expect(calendarSlot.pData).toBe(yearData);
    scanner["nTypeArray"][3] = S.DATESEP;
    expect(scanner["IsDateFragment"](2, 4)).toBe(true);
    expect(scanner["IsDateFragment"](4, 2)).toBe(false);
  } finally {
    source.dispose();
    current.dispose();
    mapper.dispose();
  }
});
