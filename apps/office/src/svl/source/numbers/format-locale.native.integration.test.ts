/** @fileoverview Original locale metadata/parser and independent calendar/numeral axes replay compiled native values; full constructor/ABI parity remains outside this witness. */
import { afterAll, beforeAll, expect, it } from "vitest";
import observations from "./format-locale.native-observations.json";
import { observeFormatLocale } from "../../../test/format-locale-observer";
import { LocaleType } from "./zformat.locale";
import { ImpObtainCalendarAndNumerals } from "./zformat.locale-calendar";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import {
  getConfiguredSystemLocale,
  getConfiguredSystemLanguage,
  setConfiguredSystemLanguage,
} from "../../../i18nlangtag/source/isolang/mslangid";

const previousLocale = getConfiguredSystemLocale(),
  previousLanguage = previousLocale === null ? 0 : getConfiguredSystemLanguage();
beforeAll(
  /** Applies the actual configured-language input supplied to the native witness. @returns Nothing. */ () => {
    setConfiguredSystemLanguage(Number(observations.configuredLanguages.split(" ")[0]));
  },
);
afterAll(
  /** Restores the original configured/host-resolved state and actual locale lifetime. @returns Nothing. */ () => {
    setConfiguredSystemLanguage(previousLanguage);
    previousLocale?.dispose();
  },
);
const groups = [
  ...new Set(
    observations.cases.map(
      /** Groups independent value/parser commands and each actual current-language input. @param row - Native observation. @returns Group identity. */
      (row) => {
        const parts = (row[0] as string).split(" ");
        return parts[0] === "C" ? `C ${parts[1]}` : (parts[0] as string);
      },
    ),
  ),
];
it.each(groups)(
  "matches original locale metadata/calendar/numeral observations for %s",
  /** All expectations are unchanged compiled original output; no locale selection or numeral algorithm is duplicated in the test. @param group - Native input family. @returns Nothing. */
  (group) => {
    const rows = observations.cases.filter(
      /** Selects the complete original group. @param row - Native input/output. @returns Whether selected. */
      (row) => (row[0] as string).startsWith(group + " "),
    );
    expect(rows.length).toBeGreaterThan(10);
    for (const [query, expected] of rows)
      expect(observeFormatLocale(query as string), query).toBe(expected);
  },
);
it("propagates the original checked insertion-position failure without consuming the caller buffer", /** Source sal/rtl/strtmpl.hxx stringbuffer_insert asserts0<=offset<=length. The existing TS binding throws Error for that checked precondition; this is not a claim that native assertion failure throws a C++ exception. The original calendar temporary is allocated before the genuine insertion failure. @returns Nothing. */ () => {
  const code = unicode("0"),
    buffer = new OUStringBuffer(code),
    locale = new LocaleType(0x0409),
    target = new LocaleType(0x02030409),
    language: [number] = [0x0409];
  try {
    expect(
      /** Calls actual owners with an invalid caller offset; no method or allocator is replaced. @returns Original owned calendar value if insertion unexpectedly succeeds. */ () =>
        ImpObtainCalendarAndNumerals(locale, buffer, 2, language, target),
    ).toThrow("assert(offset >= 0 && offset <= (*ppThis)->length)");
    const retained = buffer.toString();
    try {
      expect(text(retained)).toBe("0");
    } finally {
      retained.dispose();
    }
    expect(text(code)).toBe("0");
  } finally {
    buffer.dispose();
    code.dispose();
  }
});
