/** @fileoverview Native scanner fragment admission preserves previous decimal, date, currency and time state. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNumFormatType as Type } from "../../inc/zforlist";
import { SvNFLanguageData, SvNumberFormatter } from "./zforlist";

it("rejects middle separators that contradict an already classified fragment", /** Checks native state transitions, including repeated decimals and incompatible exponent or clock suffixes. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    ScanMidString(value: OUString, position: number, numericCount: number): boolean;
  };
  const state = language.pStringScanner.fields;
  const cases: [string, Partial<typeof state>, boolean, number?][] = [
    [".", { nDecPos: 1 }, false],
    [".", { nDecPos: 3 }, false],
    [".", { nDecPos: 2, bDecSepInDateSeps: false }, false],
    [".", { nDecPos: 2, bDecSepInDateSeps: true }, true, Type.DATE],
    [".", { nDecPos: 2, bDecSepInDateSeps: true, eScannedType: Type.DATE }, true, Type.DATE],
    [
      ".",
      { nDecPos: 2, bDecSepInDateSeps: true, eScannedType: Type.DATETIME },
      true,
      Type.DATETIME,
    ],
    [".", { nDecPos: 2, bDecSepInDateSeps: true, eScannedType: Type.NUMBER }, false],
    ["/", { eScannedType: Type.TIME }, false],
    ["/", { eScannedType: Type.CURRENCY }, false],
    ["E", { eScannedType: Type.SCIENTIFIC }, false],
    ["E", { eScannedType: Type.DATE }, false],
    ["E-", {}, true, Type.SCIENTIFIC],
    ["e+", {}, true, Type.SCIENTIFIC],
    [":", { nDecPos: 2, bDecSepInDateSeps: false }, false],
    [":", { nDecPos: 2, bDecSepInDateSeps: true, eScannedType: Type.NUMBER }, false],
    [
      ":",
      { nDecPos: 2, bDecSepInDateSeps: true, eScannedType: Type.DATE, nNumericsCnt: 5 },
      true,
      Type.DATETIME,
    ],
    [":", { eScannedType: Type.DATE, nNumericsCnt: 5 }, true, Type.DATETIME],
    [":", { eScannedType: Type.DATETIME, nNumericsCnt: 5 }, true, Type.DATETIME],
    [":", { eScannedType: Type.DATE, nNumericsCnt: 3 }, false],
    [":", { eScannedType: Type.NUMBER }, false],
    [":", { eScannedType: Type.TIME, nTimePos: 2 }, true, Type.TIME],
    [" JAN ", { nMonth: 1 }, false],
    [" JAN ", { eScannedType: Type.TIME }, false],
    [" JAN ", {}, true, Type.DATE],
  ];
  try {
    for (const [value, initial, accepted, type] of cases) {
      scanner.Reset();
      state.nMatchedAllStrings = 0;
      state.bDecSepInDateSeps = false;
      Object.assign(state, initial);
      const input = unicode(value);
      try {
        expect(scanner.ScanMidString(input, 1, 1), `${value} ${JSON.stringify(initial)}`).toBe(
          accepted,
        );
        if (type !== undefined) expect(state.eScannedType).toBe(type);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("admits trailing signs, currency and clock markers only in compatible native state", /** Checks native trailing-fragment transitions and source early exits. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    ScanEndString(value: OUString): boolean;
  };
  const state = language.pStringScanner.fields;
  const cases: [string, Partial<typeof state>, boolean, number?][] = [
    [".", { nDecPos: 1 }, false],
    [".", { nDecPos: 3 }, false],
    [".", { nDecPos: 2, bDecSepInDateSeps: false }, false],
    [".", { nDecPos: 2, bDecSepInDateSeps: true }, true, Type.DATE],
    [".", { nDecPos: 2, bDecSepInDateSeps: true, eScannedType: Type.NUMBER }, false],
    ["-", {}, true],
    ["+", {}, true],
    ["-", { bNegCheck: true }, false],
    ["$-", {}, true, Type.CURRENCY],
    ["$+", {}, true, Type.CURRENCY],
    ["$", { eScannedType: Type.CURRENCY }, false],
    ["%", { eScannedType: Type.TIME }, false],
    [":", { nDecPos: 2 }, false],
    [":", { eScannedType: Type.DATE, nNumericsCnt: 3 }, true, Type.DATETIME],
    [":", { eScannedType: Type.DATE, nNumericsCnt: 2 }, false],
    [":", { eScannedType: Type.TIME, nTimePos: 2 }, true, Type.TIME],
    [":", { eScannedType: Type.CURRENCY }, false],
    [" JAN", { nMonth: 1 }, false],
    [" JAN", { eScannedType: Type.TIME }, false],
    [" JAN.", {}, true, Type.DATE],
    [" PM", { eScannedType: Type.DATE }, false],
    [" PM", { eScannedType: Type.DATETIME }, true, Type.DATETIME],
    [" PM", { nDecPos: 2, nNumericsCnt: 2 }, false],
  ];
  try {
    for (const [value, initial, accepted, type] of cases) {
      scanner.Reset();
      state.nMatchedAllStrings = 0;
      state.bDecSepInDateSeps = false;
      Object.assign(state, initial);
      const input = unicode(value);
      try {
        expect(scanner.ScanEndString(input), `${value} ${JSON.stringify(initial)}`).toBe(accepted);
        if (type !== undefined) expect(state.eScannedType).toBe(type);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});
