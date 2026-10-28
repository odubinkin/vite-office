/** @fileoverview Public number-input scanner integration with the real LibreOffice calendar service and date/time result dispatch. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { SvNumFormatType as T } from "../../inc/zforlist";

it.each([
  [0x0409, "2024-02-29", true, T.DATE, 45351],
  [0x0409, "2023-02-29", false, T.TEXT, 0],
  [0x0409, "2024-04-31", false, T.TEXT, 0],
  [0x0409, "12/31/2024", true, T.DATE, 45657],
  [0x0419, "31.12.2024", true, T.DATE, 45657],
  [0x0409, "2024-02-29T12:30:45", true, T.DATETIME, 45351 + 45045 / 86400],
  [0x0409, "12:30:45", true, T.TIME, 45045 / 86400],
  [0x0409, "23:59:60", true, T.TIME, 1],
  [0x0409, "1E9999", true, T.TEXT, Number.MAX_VALUE],
  [0x0409, "not a date", false, T.TEXT, 0],
  [0x0409, "", false, T.TEXT, 0],
] as const)(
  "converts %s/%s through the source calendar and numeric-result switch",
  /** Checks the public call, category and exact serial result. @param locale - Language ID. @param input - Input. @param accepted - Source acceptance. @param category - Result category. @param serial - Expected serial. @returns Nothing. */ (
    locale,
    input,
    accepted,
    category,
    serial,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, locale),
      value = unicode(input),
      type: [number] = [T.NUMBER],
      output: [number] = [99];
    try {
      expect(
        language.pStringScanner.IsNumberFormat(
          value,
          type,
          output,
          null,
          new NativeNumberWrapper(),
        ),
      ).toBe(accepted);
      expect(type[0]).toBe(category);
      expect(output[0]).toBe(serial);
    } finally {
      value.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);
