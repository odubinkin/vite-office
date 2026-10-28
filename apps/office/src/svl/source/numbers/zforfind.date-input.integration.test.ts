/** @fileoverview Public date-input regressions use real compiled format, locale and calendar owners; independent Gregorian civil dates define expected spreadsheet serials. */
import { afterAll, beforeAll, expect, it, vi } from "vitest";
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NfEvalDateFormat as E, SvNumFormatType as T } from "../../inc/zforlist";
import { SvNumberformat } from "./zformat";

beforeAll(
  /** Fixes the original SYSTEM date for incomplete inputs. @returns Nothing. */ () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2024, 5, 15, 12));
  },
);
it.each([
  ["January", ""],
  ["31/12/2024", "DD/MM/YYYY"],
  ["2024/12", "YYYY/MM"],
  ["12/2024", "MM/YYYY"],
])(
  "preserves original input-admission gate for %s with ordinary date separator pattern %s",
  /** Original IsNumberFormatMain admits only logical strings without numeric particles; DATE admission at zforfind.cxx4017 requires an accepted locale pattern, ISO form or literal match. Ordinary DATESEP tokens are not GetNumForString literals. @param input - Input rejected by that source gate. @param pattern - Optional real compiled format. @returns Nothing. */ (
    input,
    pattern,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, 0x0409),
      value = unicode(input),
      code = unicode(pattern),
      scanner = language.GetFormatScanner();
    let format: SvNumberformat | null = null;
    try {
      if (pattern) {
        const check: [number] = [0];
        format = new SvNumberformat(
          code,
          scanner,
          language.pStringScanner,
          scanner.getColorCallback().GetNatNum(),
          check,
          [0x0409],
        );
        expect(check[0]).toBe(0);
      }
      language.SetEvalDateFormat(E.Format);
      const type: [number] = [T.DATE],
        output: [number] = [-1];
      expect(
        language.pStringScanner.IsNumberFormat(
          value,
          type,
          output,
          format,
          new NativeNumberWrapper(),
        ),
      ).toBe(false);
      expect([type[0], output[0]]).toEqual([T.TEXT, 0]);
    } finally {
      format?.dispose();
      code.dispose();
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);
afterAll(/** Restores the host clock. @returns Nothing. */ () => vi.useRealTimers());
const dates = [
  [0x0409, "January 10", "", E.International, 2024, 1, 10],
  [0x0409, "January 2024", "", E.International, 2024, 1, 1],
  [0x0407, "Januar 2024", "", E.International, 2024, 1, 1],
  [0x0407, "10 Januar", "", E.International, 2024, 1, 10],
  [0x0409, "January 10 2024", "", E.International, 2024, 1, 10],
  [0x0407, "10. Januar 2024", "", E.International, 2024, 1, 10],
  [0x0409, "12/31", "", E.International, 2024, 12, 31],
  [0x0407, "31.12.", "", E.International, 2024, 12, 31],
  [0x0409, "01/02/49", "", E.International, 2049, 1, 2],
  [0x0409, "01/02/50", "", E.International, 1950, 1, 2],
  [0x0409, "31/12/2024", 'DD"/"MM"/"YYYY', E.Format, 2024, 12, 31],
  [0x0409, "31/12/2024", 'DD"/"MM"/"YYYY', E.InternationalThenFormat, 2024, 12, 31],
  [0x0409, "12/31/2024", "DD/MM/YYYY", E.FormatThenInternational, 2024, 12, 31],
  [0x0409, "2024-12-31", "YYYY-MM-DD", E.Format, 2024, 12, 31],
  [0x0409, "12/31", "MM/DD", E.Format, 2024, 12, 31],
  [0x0409, "2024/12", 'YYYY"/"MM', E.Format, 2024, 12, 1],
  [0x0409, "12/2024", 'MM"/"YYYY', E.Format, 2024, 12, 1],
  [0x0409, "10/", 'DD"/"', E.Format, 2024, 6, 10],
  [0x0409, "2/", 'MM"/"', E.Format, 2024, 2, 1],
  [0x0409, "2025/", 'YYYY"/"', E.Format, 2025, 6, 1],
  [0x0409, "31/12/2024", 'DD"/"MM"/"YYYY', E.FormatThenInternational, 2024, 12, 31],
  [0x0409, "12/31/2024", 'DD"/"MM"/"YYYY', E.International, 2024, 12, 31],
  [0x0409, "12/31/2024", 'DD"/"MM"/"YYYY', E.InternationalThenFormat, 2024, 12, 31],
  [0x0411, "2024/12/31", "", E.International, 2024, 12, 31],
  [0x0411, "12/31", 'MM"/"DD', E.Format, 2024, 12, 31],
  [0x0407, "31. Dezember 2024", "", E.International, 2024, 12, 31],
  [0x0409, "December 31 2024", "", E.International, 2024, 12, 31],
  [0x0409, "Dec 31 2024", "", E.International, 2024, 12, 31],
  [0x0409, "31-Dec-2024", "", E.International, 2024, 12, 31],
  [0x0409, "2024-Dec-31", "", E.International, 2024, 12, 31],
  [0x0409, "02|29|2024", 'DD"|"MM"|"YYYY', E.FormatThenInternational, 2024, 2, 29],
  [0x0409, "2024 January 10", 'YYYY" January "DD', E.Format, 2024, 1, 10],
] as const;
it.each(dates)(
  "recognizes civil date with locale %i, input %s, compiled pattern %s and policy %i",
  /** Real constructor output supplies format order without manufactured tokens or scanner state. @param locale - Source locale. @param input - Date text. @param pattern - Optional complete format. @param policy - Original evaluation policy. @param year - Independent expected civil year. @param month - Expected month1..12. @param day - Expected day. @returns Nothing. */ (
    locale,
    input,
    pattern,
    policy,
    year,
    month,
    day,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, locale),
      value = unicode(input),
      code = unicode(pattern),
      check: [number] = [0];
    let format: SvNumberformat | null = null;
    try {
      if (pattern) {
        const scanner = language.GetFormatScanner();
        format = new SvNumberformat(
          code,
          scanner,
          language.pStringScanner,
          scanner.getColorCallback().GetNatNum(),
          check,
          [locale],
        );
        expect(check[0]).toBe(0);
        expect(format.GetType() & T.DATE).not.toBe(0);
      }
      language.SetEvalDateFormat(policy);
      language.pStringScanner.SetYear2000(1950);
      const type: [number] = [T.DATE],
        output: [number] = [-1];
      expect(
        language.pStringScanner.IsNumberFormat(
          value,
          type,
          output,
          format,
          new NativeNumberWrapper(),
        ),
      ).toBe(true);
      expect(type[0]).toBe(T.DATE);
      const serial = (Date.UTC(year, month - 1, day) - Date.UTC(1899, 11, 30)) / 86400000;
      expect(output[0]).toBe(serial);
    } finally {
      format?.dispose();
      code.dispose();
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);
