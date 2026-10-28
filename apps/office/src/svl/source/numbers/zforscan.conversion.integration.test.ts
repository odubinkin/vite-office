/** @fileoverview Public scanner conversion regressions exercise original zforscan.cxx FinalScan date-order cases2944..3026 through genuine locale owners. */
import { expect, it } from "vitest";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { createNumberFormatLanguage } from "../../../test/number-format-language";

const conversions = [
  [0x0409, 0x0407, "MM/DD/YYYY", "TT.MM.JJJJ"],
  [0x0409, 0x0411, "MM/DD/YYYY", "YYYY/MM/DD"],
  [0x0407, 0x0409, "TT.MM.JJJJ", "MM/DD/YYYY"],
  [0x0407, 0x0411, "TT.MM.JJJJ", "YYYY/MM/DD"],
  [0x0411, 0x0409, "YYYY/MM/DD", "MM/DD/YYYY"],
  [0x0411, 0x0407, "YYYY/MM/DD", "TT.MM.JJJJ"],
  [0x0409, 0x0407, "MM/DD", "TT.MM"],
  [0x0407, 0x0409, "TT.MM", "MM/DD"],
  [0x0407, 0x0411, "TT.MM", "MM/DD"],
  [0x0411, 0x0407, "MM/DD", "TT.MM"],
  [0x0407, 0x0409, "TT.MM.", "MM/DD/"],
  [0x0409, 0x0407, "YYYY/MM/DD", "JJJJ.MM.TT"],
  [0x0407, 0x0409, "JJJJ.TT.MM", "YYYY/DD/MM"],
  [0x0409, 0x0407, "YYYY-MM-DD", "JJJJ-MM-TT"],
  [0x0409, 0x0411, "MM/DD", "MM/DD"],
  [0x0411, 0x0409, "MM/DD", "MM/DD"],
  [0x0407, 0x0411, 'TT"x"MM"y"JJJJ', 'DD"x"MM"y"YYYY'],
  [0x0409, 0x0411, 'MM"x"DD"y"YYYY', 'MM"x"DD"y"YYYY'],
  [0x0411, 0x0407, 'YYYY"x"MM"y"DD', 'JJJJ"x"MM"y"TT'],
  [0x0409, 0x0407, "0.00", "0,00"],
  [0x0407, 0x0409, "#.##0,00", "#,##0.00"],
  [0x0409, 0x0407, "HH:MM:SS.00", "HH:MM:SS,00"],
  [0x0407, 0x0409, "HH:MM:SS,00", "HH:MM:SS.00"],
] as const;
it.each(conversions)(
  "converts date order from %i to %i: %s -> %s",
  /** Original complete three-particle dates reorder to the actual destination locale and localize keywords/separators. @param from - Source language. @param to - Destination language. @param input - Source code. @param expected - Independently specified destination code. @returns Nothing. */ (
    from,
    to,
    input,
    expected,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      current = createNumberFormatLanguage(mapper, from),
      scanner = current.GetFormatScanner(),
      value = unicode(input);
    try {
      scanner.SetConvertMode(from, to, false, true);
      expect(scanner.ScanFormat(value)).toBe(0);
      expect(text(value)).toBe(expected);
      expect(current.GetFormatScanner()).toBe(scanner);
      expect(scanner.GetNewLnge()).toBe(to);
    } finally {
      value.dispose();
      current.dispose();
      mapper.dispose();
    }
  },
);
