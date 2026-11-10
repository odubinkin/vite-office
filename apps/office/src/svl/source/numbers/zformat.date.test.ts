/** @fileoverview Original DATE/DATETIME output through actual parsed patterns, calendar services and input-line selection. */
import { expect, it } from "vitest";
import type { SvNumberformat } from "./zformat";
import { SvNumberFormatter } from "./zforlist";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { Date } from "../../../tools/source/datetime/tdate";
/** Actual date serial relative to the original document null date. @param day - Day. @param month - Month. @param year - Original signed16 nonzero year. @returns Serial. */
function serial(day: number, month: number, year: number): number {
  return (
    new Date(day, month, year).GetAsNormalizedDays() - new Date(30, 12, 1899).GetAsNormalizedDays()
  );
}
it.each([
  ["[NatNum1]YYYY-MM-DD", serial(1, 1, 2024), "二〇二四-一-一", 0x411],
  ["[NatNum3]YYYY-MM-DD", serial(1, 1, 2024), "２０２４-０１-０１", 0x411],
  ["[NatNum3]YYYY-MM-DD", serial(1, 1, 1), "０００１-０１-０３", 0x411],
  ["[NatNum4]YYYY-MM-DD", serial(1, 1, 1), "〇1-01-03", 0x411],
  ["[NatNum4]YYYY-MM-DD", serial(1, 1, 2024), "2024-01-01", 0x411],
  [
    "[NatNum1]YYYY-MM-DD HH:MM:SS.00",
    serial(1, 1, 2024) + 0.5,
    "二〇二四-一-一 一二:〇〇:〇〇.〇〇",
    0x411,
  ],
  ["[NatNum1][~gengou]G EE-MM-DD", serial(1, 5, 2019), "R 元-五-一", 0x411],
  ["[NatNum3]YYYY-MM-DD", serial(1, 1, 2024), "2024-01-01", 0x409],
  ["[NatNum1]YYYY-MM-DD", serial(1, 1, 2024), "๒๐๒๔-๐๑-๐๑", 0x41e],
  ["[NatNum2]WW", 2, "א׳", 0x40d],
  ["YYYY-MM-DD", 0, "1899-12-30", 0x409],
  ["YYYY-MM-DD", -1, "1899-12-29", 0x409],
  ["YYYY-MM-DD", 60, "1900-02-28", 0x409],
  ["YYYY-MM-DD", 61, "1900-03-01", 0x409],
  ["YYYY-MM-DD", serial(29, 2, 2024), "2024-02-29", 0x409],
  ["YYYY-MM-DD", serial(1, 1, 1), "0001-01-03", 0x409],
  ["YY-M-D", serial(1, 1, 1), "1-1-3", 0x409],
  ["YYYY-MM-DD", serial(1, 1, -1), "-0001-01-03", 0x409],
  ["YYYY G", serial(1, 1, -1), "1 CE", 0x409],
  ["YYYY-MM-DD", 20000000, "#FMT", 0x409],
  ["YYYY-MM-DD", NaN, "#FMT", 0x409],
  ["YYYY-MM-DD", Infinity, "#FMT", 0x409],
  ["YYYY-MM-DD HH:MM:SS", -Infinity, "#FMT", 0x409],
  ["DDD, MMM D, YYYY", 2, "Mon, Jan 1, 1900", 0x409],
  ["DDDD MMMM D", 2, "Monday January 1", 0x409],
  ["Q QQ", 2, "Q1 1st quarter", 0x409],
  ["WW", 2, "1", 0x409],
  ["YYYY-MM-DD HH:MM:SS", 2.5, "1900-01-01 12:00:00", 0x409],
  ["YYYY-MM-DD HH:MM:SS", -0.25, "1899-12-29 18:00:00", 0x409],
  ["YYYY-MM-DD HH:MM AM/PM", 2.75, "1900-01-01 06:00 PM", 0x409],
  ["YYYY-MM-DD HH:MM:SS.00", 2 + 59.99999 / 86400, "1900-01-01 00:00:59.99", 0x409],
  ["YYYY-MM-DD [HH]:MM:SS", 2.5, "1900-01-01 [12]:00:00", 0x409],
  ["YYYY-MM-DD", 2.999999999, "1900-01-02", 0x409],
  ["YYYY-MM-DD HH:MM:SS.00", 2.999999999, "1900-01-02 23:59:59.99", 0x409],
  ["MMMM", 2, "Январь", 0x419],
  ["D MMMM", 2, "1 января", 0x419],
  ['MMMM"! "D', 2, "Январь! 1", 0x419],
  ["[~gengou]G EE-MM-DD", serial(1, 5, 2019), "R 01-05-01", 0x411],
  ["[~gengou]EE-MM-DD", serial(1, 1, 1800), "1800-01-01", 0x411],
  ["[~buddhist]YYYY-MM-DD", serial(1, 1, 2024), "2567-01-01", 0x41e],
])(
  "renders original date pattern %s for %s",
  /** Public insertion/output use actual scanner, format table and calendar owners. @param pattern - Format code. @param value - Serial. @param expected - Source-derived text. @param language - Original language ID. @returns Nothing. */ (
    pattern,
    value,
    expected,
    language,
  ) => {
    const formatter = new SvNumberFormatter(language),
      code = unicode(pattern),
      output = new OUString(),
      check: [number] = [0],
      type: [number] = [0],
      key: [number] = [0];
    try {
      formatter["m_aFormatData"].PutEntry(
        formatter["m_aCurrentLanguage"],
        formatter.GetNatNum(),
        code,
        check,
        type,
        key,
        language,
      );
      expect(check[0]).toBe(0);
      const calendar = formatter["m_aCurrentLanguage"].GetCalendar(),
        before = calendar.getUniqueID();
      try {
        formatter.GetOutputString(value, key[0], output, [null]);
        expect(text(output)).toBe(expected);
        const after = calendar.getUniqueID();
        try {
          expect(text(after)).toBe(text(before));
        } finally {
          after.dispose();
        }
      } finally {
        before.dispose();
      }
    } finally {
      output.dispose();
      code.dispose();
      formatter.dispose();
    }
  },
);
it("uses original DATE editing selection instead of keeping a custom display pattern", /** Real input-line policy chooses the original locale date edit format and preserves standard precision. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x409),
    code = unicode("YYYY/MM/DD"),
    check: [number] = [0],
    type: [number] = [0],
    key: [number] = [0];
  try {
    formatter["m_aFormatData"].PutEntry(
      formatter["m_aCurrentLanguage"],
      formatter.GetNatNum(),
      code,
      check,
      type,
      key,
      0x409,
    );
    expect(check[0]).toBe(0);
    const result = formatter.GetInputLineString(2, key[0]);
    try {
      expect(text(result)).toBe("01/01/1900");
    } finally {
      result.dispose();
    }
    expect(formatter.GetStandardPrec()).toBe(2);
  } finally {
    code.dispose();
    formatter.dispose();
  }
});

it("uses original metadata locale for year padding independently of the calendar locale", /** Original calendar fields use current language while impTransliterate obtains the modifier language. Changing the genuine compiled metadata tests this ownership distinction without replacing either service. @returns Nothing. */ () => {
  const owner = new SvNumberFormatter(0x411),
    code = unicode("[NatNum1]YYYY-MM-DD"),
    out = new OUString(),
    check: [number] = [0],
    type: [number] = [0],
    key: [number] = [0];
  try {
    owner["m_aFormatData"].PutEntry(
      owner["m_aCurrentLanguage"],
      owner.GetNatNum(),
      code,
      check,
      type,
      key,
      0x411,
    );
    expect(check[0]).toBe(0);
    const entry = owner.GetEntry(key[0]) as SvNumberformat;
    entry["NumFor"][0]?.SetNatNumLang(0x41e);
    owner.GetOutputString(serial(1, 1, 1), key[0], out, [null]);
    expect(text(out)).toBe("๐๐๐一-一-三");
  } finally {
    out.dispose();
    code.dispose();
    owner.dispose();
  }
});
