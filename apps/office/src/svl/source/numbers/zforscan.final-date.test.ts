/** @fileoverview Original FinalScan temporal branches execute on actual scanner/language/token owners before the remaining common/numeric source stages are connected. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

import { FinalScanState } from "./zforscan.final-state";
import { FinalScanDateOrText } from "./zforscan.final-date";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { OUString } from "../../../sal/inc/rtl/ustring";
it("preserves the distinct TIME and DATETIME fractional-second bounds and early control position", /** The source TIME branch lacks the twenty-place bound present in DATETIME. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0409),
    scanner = current.GetFormatScanner();
  try {
    for (const [pattern, expected, places] of [
      ["HH:MM:SS." + "0".repeat(21), undefined, 21],
      ["YYYY-MM-DD HH:MM:SS." + "0".repeat(21), 40, 0],
    ] as const) {
      const value = unicode(pattern);
      try {
        expect(scanner["Symbol_Division"](value)).toBe(0);
        expect(scanner["ScanType"]()).toBe(0);
        const state = new FinalScanState(scanner);
        try {
          expect(FinalScanDateOrText.call(scanner, state)).toBe(expected);
          expect(scanner["nCntPost"]).toBe(places);
          expect(state.nCounter).toBe(expected === undefined ? 21 : 20);
        } finally {
          state.dispose();
        }
      } finally {
        value.dispose();
      }
    }
  } finally {
    current.dispose();
    mapper.dispose();
  }
});
it("changes the actual language service after saving old date fields and records source date-particle positions", /** FinalScan source conversion changes existing owners; final date reorder remains a later common stage. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0409),
    scanner = current.GetFormatScanner(),
    value = unicode("MM/DD/YYYY");
  try {
    expect(scanner["Symbol_Division"](value)).toBe(0);
    expect(scanner["ScanType"]()).toBe(0);
    scanner.SetConvertMode(0x0409, 0x0407, false, true);
    const state = new FinalScanState(scanner);
    try {
      expect([
        text(state.sOldDateSep),
        text(current.GetDateSep()),
        state.eOldDateOrder,
        state.bNewDateOrder,
      ]).toEqual(["/", ".", 0, true]);
      expect(FinalScanDateOrText.call(scanner, state)).toBeUndefined();
      expect([state.nMonthPos, state.nDayPos, state.nYearPos]).toEqual([0, 2, 4]);
      expect(text(scanner["sStrArray"][4] as OUString)).toBe("JJJJ");
      expect(scanner["nTypeArray"][1]).toBe(S.DATESEP);
      expect(text(scanner["sStrArray"][1] as OUString)).toBe(".");
      expect(current.GetFormatScanner()).toBe(scanner);
    } finally {
      state.dispose();
    }
  } finally {
    value.dispose();
    current.dispose();
    mapper.dispose();
  }
});
it("merges calendar tokens in DATE and keeps duration brackets and AM/PM metadata in TIME", /** Genuine lexical/type stages supply tokens rather than synthetic compiled entries. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = createNumberFormatLanguage(mapper, 0x0409),
    scanner = current.GetFormatScanner();
  try {
    for (const pattern of ["[~jewish]YYYY-MM-DD", "[HH]:MM:SS AM/PM"]) {
      const value = unicode(pattern);
      try {
        expect(scanner["Symbol_Division"](value)).toBe(0);
        expect(scanner["ScanType"]()).toBe(0);
        const state = new FinalScanState(scanner);
        try {
          expect(FinalScanDateOrText.call(scanner, state)).toBeUndefined();
          if (pattern.startsWith("[~")) {
            expect(text(scanner["sStrArray"][2] as OUString)).toBe("jewish");
            expect(scanner["nTypeArray"][2]).toBe(S.CALENDAR);
          } else {
            expect(scanner["bThousand"]).toBe(true);
            expect(scanner["nThousand"]).toBe(1);
            expect(scanner["nCntExp"]).toBe(1);
          }
        } finally {
          state.dispose();
        }
      } finally {
        value.dispose();
      }
    }
  } finally {
    current.dispose();
    mapper.dispose();
  }
});
