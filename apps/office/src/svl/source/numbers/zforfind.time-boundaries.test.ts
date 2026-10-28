/** @fileoverview Native time conversion overflow, AM/PM and minute-second format boundaries. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType, SvNumInputOptions } from "../../inc/zforlist";

import { ImpSvNumFor, SvNumberformat } from "./zformat";

it("retains converted output and source failure flags for invalid clock components", /** Checks actual stored numeric fragments, including signed32 overflow and noncanonical zero strings. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    GetTimeRef(output: [number], first: number, count: number, options: number): boolean;
  };
  const state = language.pStringScanner.fields;
  const cases: [string[], number, number, number, boolean, number][] = [
    [[], 0, 0, 0, false, 0],
    [["2147483648", "0"], 0, 0, 0, false, 0],
    [["1", "2147483648"], 0, 0, 0, false, 3600],
    [["1", "0", "2147483648"], 0, 0, 0, false, 3600],
    [["000", "0"], 0, 0, 0, false, 0],
    [["0", "000"], 0, 0, 0, false, 0],
    [["00", "00", "00"], 0, 0, 0, true, 0],
    [["1", "0", "61"], 0, 0, 0, false, 3661],
    [["1", "0", "61"], 0, 0, SvNumInputOptions.LAX_TIME, true, 3661],
    [["12", "30"], 1, 0, 0, true, 1800],
    [["12", "30"], -1, 0, 0, true, 45000],
    [["13", "0"], 1, 0, 0, false, 46800],
    [["30", "5"], 0, 2, 0, true, 30.5],
    [["12", "30", "25"], 0, 2, 0, true, 750.25],
  ];
  try {
    for (const [parts, amPm, decimal, options, accepted, seconds] of cases) {
      scanner.Reset();
      state.nAmPm = amPm;
      state.nDecPos = decimal;
      for (const [index, part] of parts.entries()) {
        const input = unicode(part);
        try {
          (state.sStrArray[index] as OUString).assign(input);
        } finally {
          input.dispose();
        }
        state.nNums[index] = index;
      }
      const output: [number] = [999];
      expect(
        scanner.GetTimeRef(output, 0, parts.length, options),
        JSON.stringify([parts, amPm, decimal]),
      ).toBe(accepted);
      expect(output[0], JSON.stringify(parts)).toBeCloseTo(seconds / 86400, 12);
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});

it("uses a native compiled minute-second format instead of treating its first number as hours", /** Checks original token recognition and time conversion on the same format/scanner owners. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(
    code,
    language.GetFormatScanner(),
    language.GetFormatScanner().GetCurrentLanguageData().pStringScanner,
    language.GetFormatScanner().getColorCallback().GetNatNum(),
    [0],
    [0x0409],
  );
  format.SetType(SvNumFormatType.TIME);
  const first = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  first.Enlarge(3);
  first.Info().nTypeArray.splice(0, 3, K.MI, S.TIMESEP, K.S);
  const scanner = language.pStringScanner as unknown as {
    GetTimeRef(output: [number], start: number, count: number, options: number): boolean;
  };
  const state = language.pStringScanner.fields;
  state.mpFormat = format;
  try {
    for (const [index, part] of ["12", "34"].entries()) {
      const input = unicode(part);
      try {
        (state.sStrArray[index] as OUString).assign(input);
      } finally {
        input.dispose();
      }
      state.nNums[index] = index;
    }
    const output: [number] = [0];
    expect(scanner.GetTimeRef(output, 0, 2, 0)).toBe(true);
    expect(output[0]).toBe(754 / 86400);
  } finally {
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});
