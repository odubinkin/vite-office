/** @fileoverview Native locale-format classification over explicit service-response fixtures. */
import { expect, it, vi } from "vitest";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import * as data from "../../../i18npool/source/localedata/localedata";
import { DateOrder, LocaleDataWrapper, LongDateOrder } from "./localedatawrapper";

/** Creates one original locale-service response row. @param formatCode - Source format. @param formatUsage - Service usage. @param formatType - Service length. @param isDefault - Default selection. @param formatIndex - Native ordinal. @returns Scalar row. */
function row(
  formatCode: string,
  formatUsage = "CURRENCY",
  formatType = "medium",
  isDefault = true,
  formatIndex = 0,
): data.LocaleFormatElement {
  return {
    formatCode,
    formatUsage,
    formatType,
    isDefault,
    formatIndex,
    formatName: "",
    formatKey: "",
  };
}

/** Feeds explicit response rows to the real wrapper while retaining all other native locale resources. @param rows - Service response fixtures. @param language - Locale language ID. @returns Currency and date orders. */
function classify(
  rows: data.LocaleFormatElement[],
  language = 0x0409,
): [number, number, DateOrder, LongDateOrder] {
  const response = vi.spyOn(data, "getLocaleFormatElements").mockReturnValue(rows);
  const locale = convertLanguageToLocale(language, false);
  const wrapper = new LocaleDataWrapper(locale);
  try {
    return [
      wrapper.getCurrPositiveFormat(),
      wrapper.getCurrNegativeFormat(),
      wrapper.getDateOrder(),
      wrapper.getLongDateOrder(),
    ];
  } finally {
    wrapper.dispose();
    locale.dispose();
    response.mockRestore();
  }
}

it("classifies all sixteen original negative currency placements", /** Checks native sign, parentheses, spaces and currency positions with explicit response fixtures. @returns Nothing. */ () => {
  const negative = [
    "([$€]0)",
    "-[$€]0",
    "[$€]-0",
    "[$€]0-",
    "(0[$€])",
    "-0[$€]",
    "0-[$€]",
    "0[$€]-",
    "-0 [$€]",
    "-[$€] 0",
    "0 [$€]-",
    "[$€] -0",
    "[$€] 0-",
    "0- [$€]",
    "([$€] 0)",
    "(0 [$€])",
  ];
  for (const [index, code] of negative.entries()) {
    expect(classify([row(`[$€]0;${code}`)]).slice(0, 2), code).toEqual([0, index]);
  }
});

it("classifies positive positions and ignores quoted or bracketed syntax during placement scans", /** Checks quote escapes, embedded semicolons and default-format selection rather than string substitution. @returns Nothing. */ () => {
  for (const [code, positive] of [
    ["[$€]0", 0],
    ["0[$€]", 1],
    ["[$€] 0", 2],
    ["0 [$€]", 3],
  ] as const) {
    expect(classify([row(code)]).slice(0, 2), code).toEqual([positive, 0]);
  }
  expect(classify([row('"ignored - 0 \\" "[$€]0;[RED]-[$€]0')]).slice(0, 2)).toEqual([0, 1]);
  // loadCurrencyFormats uses the first semicolon even when the scanner itself skips bracketed semicolons.
  expect(classify([row("[$€;foo]0;-[$€]0")]).slice(0, 2)).toEqual([0, 2]);
  expect(
    classify([
      row("0", "CURRENCY", "short", false),
      row("0 [$€];-0 [$€]", "CURRENCY", "medium", false),
    ]).slice(0, 2),
  ).toEqual([3, 8]);
});

it("retains native localized date letters and fallback selection when edit format 21 is absent", /** Checks all original date order reductions over explicit response rows. @returns Nothing. */ () => {
  const cases: [string, LongDateOrder][] = [
    ["D/M/Y", LongDateOrder.DMY],
    ["M/D/Y", LongDateOrder.MDY],
    ["Y/M/D", LongDateOrder.YMD],
    ["Y/D/M", LongDateOrder.YDM],
    ["P/K/V", LongDateOrder.DMY],
    ["T/M/J", LongDateOrder.DMY],
    ["J/M/A", LongDateOrder.DMY],
    ["G/M/A", LongDateOrder.DMY],
    ["D/M/A", LongDateOrder.DMY],
    ["D/M/J", LongDateOrder.DMY],
    ["M/Y", LongDateOrder.MDY],
    ["Y", LongDateOrder.YMD],
    ["literal", LongDateOrder.DMY],
    ["D/Y/M", LongDateOrder.DMY],
  ];
  for (const [code, long] of cases) {
    const short =
      long === LongDateOrder.YMD
        ? DateOrder.YMD
        : long === LongDateOrder.MDY
          ? DateOrder.MDY
          : DateOrder.DMY;
    expect(classify([row(code, "DATE", "long", false)]).slice(2), code).toEqual([short, long]);
  }
  expect(classify([])).toEqual([0, 0, DateOrder.DMY, LongDateOrder.DMY]);
});

it("uses native shell currency defaults for an empty currency service section", /** Checks absent service rows during initial load and locale refresh. @returns Nothing. */ () => {
  const response = vi.spyOn(data, "getLocaleCurrencies").mockReturnValue([]);
  const locale = convertLanguageToLocale(0x0409, false);
  const wrapper = new LocaleDataWrapper(locale);
  try {
    expect(text(wrapper.getCurrSymbol())).toBe("ShellsAndPebbles");
    expect(text(wrapper.getCurrBankSymbol())).toBe("ShellsAndPebbles");
    expect(wrapper.getCurrDigits()).toBe(2);
    wrapper.changeLocale(locale);
    expect(text(wrapper.getCurrSymbol())).toBe("ShellsAndPebbles");
    expect(wrapper.getCurrDigits()).toBe(2);
  } finally {
    wrapper.dispose();
    locale.dispose();
    response.mockRestore();
  }
});

it("scans unbracketed loaded currency symbols and ignores escaped quote delimiters", /** Checks the native German Euro symbol against explicit source-format fixtures. @returns Nothing. */ () => {
  expect(classify([row("€0;-€0")], 0x0407).slice(0, 2)).toEqual([0, 1]);
  expect(classify([row("0 €;-0 €")], 0x0407).slice(0, 2)).toEqual([3, 8]);
  expect(classify([row("€  0;-€  0")], 0x0407).slice(0, 2)).toEqual([2, 9]);
  expect(classify([row('\\"€0;--€0')], 0x0407).slice(0, 2)).toEqual([0, 1]);
  expect(classify([row("€0", "CURRENCY", "short", false)], 0x0407).slice(0, 2)).toEqual([0, 0]);
});

it("selects medium date rows or the first short row when defaults and long rows are absent", /** Checks original fallback priority before reducing date-order values. @returns Nothing. */ () => {
  expect(classify([row("Y/M/D", "DATE", "short", false)]).slice(2)).toEqual([
    DateOrder.YMD,
    LongDateOrder.YMD,
  ]);
  expect(
    classify([row("Y/M/D", "DATE", "short", false), row("M/D/Y", "DATE", "medium", false)]).slice(
      2,
    ),
  ).toEqual([DateOrder.MDY, LongDateOrder.MDY]);
});
