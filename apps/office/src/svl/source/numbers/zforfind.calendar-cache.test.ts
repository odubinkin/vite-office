/** @fileoverview Native calendar-name scanning across grammatical cases and locale cache changes. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNFLanguageData } from "./zforlist";

it("refreshes native month caches and accepts grammatical and regional alternatives", /** Checks real generated calendars through one language owner, including disposal and rebuilding of its previous caches. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0409);
  const scanner = language.pStringScanner as unknown as {
    GetMonth(value: OUString, position: [number]): number;
  };
  const cases: [number, string, number, number][] = [
    [0x0409, "JANUARY 1", 1, 7],
    [0x0419, "ЯНВАРЯ 1", 1, 6],
    [0x0419, "ЯНВАРЬ 1", 1, 6],
    [0x040b, "TAMMIKUUN 1", 1, 9],
    [0x040b, "TAMMIKUUTA 1", 1, 10],
    [0x040b, "TAMMIKUU 1", 1, 8],
    [0x0407, "MRZ 1", -3, 3],
    [0x0c07, "JAN 1", -1, 3],
    [0x0407, "JÄN 1", -1, 3],
    [0x0418, "SEP 1", -9, 3],
    [0x0409, "SEPT 1", -9, 4],
    [0x0409, "JANUARYX", 0, 0],
    [0x0409, "", 0, 0],
  ];
  try {
    for (const [locale, source, month, consumed] of cases) {
      language.ChangeIntl(locale);
      const input = unicode(source);
      const position: [number] = [0];
      try {
        expect(scanner.GetMonth(input, position), source).toBe(month);
        expect(position[0], source).toBe(consumed);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
    mapper.dispose();
  }
});
