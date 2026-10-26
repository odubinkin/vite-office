/** @fileoverview Native ISO clock and dotted day/month-name admission across locale separators. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { NfKeywordIndex } from "../../inc/nfkeytab";
import { SvNumFormatType as Type } from "../../inc/zforlist";
import { SvNFLanguageData } from "./zforlist";
import { ImpSvNumFor, SvNumberformat } from "./zformat";

it("admits ISO colons independently of the Finnish locale clock separator", /** Checks complete native classification including fractional seconds and signed years. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x040b);
  const scanner = language.pStringScanner as unknown as {
    IsNumberFormatMain(value: OUString, format: null): boolean;
  };
  try {
    for (const source of [
      "2024-12-31T12:34",
      "2024-12-31T12:34:56",
      "-2024-12-31T12:34:56",
      "2024-12-31T12:34:56.7",
      "2024-12-31T12:34:56,7",
    ]) {
      const input = unicode(source);
      try {
        expect(scanner.IsNumberFormatMain(input, null), source).toBe(true);
        expect(language.pStringScanner.fields.eScannedType, source).toBe(Type.DATETIME);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});

it("uses a compiled day-month-year order to admit a dotted day before a month name", /** Checks original compiled tokens and separator rollback after decimal scanning, without an alternate format parser. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(code, language.GetFormatScanner(), [0], [0x0409]);
  const first = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  first.Enlarge(3);
  for (const [index, kind] of [NfKeywordIndex.D, NfKeywordIndex.MMM, NfKeywordIndex.YYYY].entries())
    first.Info().nTypeArray[index] = kind;
  format.SetType(Type.DATE);
  first.Info().eScannedType = Type.DATE;
  const scanner = language.pStringScanner as unknown as {
    IsNumberFormatMain(value: OUString, format: SvNumberformat): boolean;
  };
  try {
    for (const [source, accepted] of [
      ["14. JAN 2024", true],
      ["14. JAN JAN 2024", false],
    ] as const) {
      const input = unicode(source);
      try {
        expect(scanner.IsNumberFormatMain(input, format), source).toBe(accepted);
        if (accepted) expect(language.pStringScanner.fields.eScannedType).toBe(Type.DATE);
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
