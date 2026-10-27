/** @fileoverview Native friend-level result admission rejects inconsistent classified numeric counts. */
import { expect, it } from "vitest";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { SvNFLanguageData } from "./zforlist";
import { CheckScannedNumber } from "./zforfind.scan-value";

it.each([
  [T.NUMBER, 1, 2, 0, 0, false, 0],
  [T.NUMBER, 1, 2, 3, 1, true, 0],
  [T.NUMBER, 2, 2, 0, 1, true, 0],
  [T.NUMBER, 2, 4, 0, 1, true, 3],
  [T.NUMBER, 2, 4, 0, 0, false, 0],
  [T.NUMBER, 0, 4, 0, 1, true, 3],
  [T.NUMBER, 0, 3, 0, 0, false, 0],
  [T.SCIENTIFIC, 1, 3, 0, 0, false, 0],
  [T.SCIENTIFIC, 1, 2, 0, 0, true, 0],
  [T.SCIENTIFIC, 2, 4, 0, 0, false, 0],
  [T.SCIENTIFIC, 2, 4, 1, 0, true, 1],
  [T.SCIENTIFIC, 0, 3, 0, 0, false, 0],
  [T.TIME, 0, 3, 0, 0, true, 0],
  [T.TIME, 0, 4, 0, 0, false, 0],
  [T.TIME, 2, 4, 0, 0, true, 0],
  [T.TIME, 2, 5, 0, 0, false, 0],
] as const)(
  "checks native type=%i decimal=%i count=%i groups=%i literals=%i",
  /** Verifies source part-count admission after classification and normalization for matched format literals. @param type - Native result category. @param decimal - Decimal position category. @param count - Numeric fragments. @param groups - Prior grouping fragments. @param matched - Compiled literal match mask. @param accepted - Source category admission. @param normalized - Remaining group count. @returns Nothing. */ (
    type,
    decimal,
    count,
    groups,
    matched,
    accepted,
    normalized,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, 0x0409),
      scanner = language.pStringScanner;
    try {
      Object.assign(scanner.fields, {
        eScannedType: type,
        nDecPos: decimal,
        nNumericsCnt: count,
        nThousand: groups,
        nMatchedAllStrings: matched,
      });
      expect(CheckScannedNumber.call(scanner)).toBe(accepted);
      expect(scanner.fields.nThousand).toBe(normalized);
    } finally {
      language.dispose();
      mapper.dispose();
    }
  },
);

it.each([
  [T.DATE, 0, 1, 2, true],
  [T.DATE, 0, 1, 3, false],
  [T.DATETIME, 0, 1, 5, true],
  [T.DATETIME, 0, 1, 6, false],
  [T.DATETIME, 2, 1, 6, true],
  [T.DATETIME, 2, 1, 7, false],
  [T.DATETIME, 0, 0, 7, false],
  [T.DATETIME, 2, 0, 8, false],
  [T.DATETIME, 0, -1, 5, true],
] as const)(
  "bounds calendar parts type=%i decimal=%i month=%i count=%i",
  /** Checks textual-month and full numeric calendar part limits before Calendar conversion. @param type - Category. @param decimal - Fractional seconds marker. @param month - Full/abbreviated/no textual month. @param count - Numeric fragments. @param accepted - Expected admission. @returns Nothing. */ (
    type,
    decimal,
    month,
    count,
    accepted,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, 0x0409),
      scanner = language.pStringScanner;
    try {
      Object.assign(scanner.fields, {
        eScannedType: type,
        nDecPos: decimal,
        nMonth: month,
        nDayOfWeek: -1,
        nNumericsCnt: count,
        nMatchedAllStrings: 1,
      });
      expect(CheckScannedNumber.call(scanner)).toBe(accepted);
      if (month < 0) {
        expect(scanner.fields.nMonth).toBe(0);
        expect(scanner.fields.nMonthPos).toBe(0);
      }
    } finally {
      language.dispose();
      mapper.dispose();
    }
  },
);
