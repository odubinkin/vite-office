/** @fileoverview Pinned source input-fragment division, including capacity and grouping boundaries. */
import { expect, it } from "vitest";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { SvNFLanguageData, SvNumberFormatter } from "./zforlist";
import { SvNumFormatType, SvNumInputOptions } from "../../inc/zforlist";
import { DateOrder, LongDateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import { ImpSvNumFor, SvNumberformat } from "./zformat";
import { NfSymbolType } from "../../inc/nfsymbol";
import { NativeNumberWrapper } from "../../../unotools/source/i18n/nativenumberwrapper";
import { TransformInput } from "./zforfind";

it("follows source TransformInput's non-ASCII digit gate and NATNUM0 locale gate", () => {
  const mapper = new NumberFormatCodeMapper(),
    nativeNumber = new NativeNumberWrapper(),
    japanese = new SvNFLanguageData(mapper, 0x0411),
    english = new SvNFLanguageData(mapper, 0x0409),
    local = unicode("１２３"),
    foreign = unicode("１２３"),
    ascii = unicode("123");
  try {
    TransformInput(nativeNumber, japanese, local);
    TransformInput(nativeNumber, english, foreign);
    TransformInput(nativeNumber, japanese, ascii);
    expect(text(local)).toBe("123");
    expect(text(foreign)).toBe("１２３");
    expect(text(ascii)).toBe("123");
  } finally {
    ascii.dispose(); foreign.dispose(); local.dispose(); english.dispose(); japanese.dispose(); mapper.dispose();
  }
});

it("uses source GetTimeRef duration, clock and leap-second boundaries", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      GetTimeRef(out: [number], first: number, count: number, options: number): boolean;
    },
    state = language.pStringScanner.fields;
  /** Assigns numeric fragments to the native scanner's existing slots. */
  function check(parts: string[], options: number = SvNumInputOptions.NONE): [boolean, number] {
    state.nDecPos = 0;
    state.nAmPm = 0;
    for (let index = 0; index < parts.length; index++) {
      const value = unicode(parts[index] as string);
      (state.sStrArray[index] as OUString).assign(value);
      value.dispose();
      state.nNums[index] = index;
    }
    const out: [number] = [0];
    return [scanner.GetTimeRef(out, 0, parts.length, options), out[0]];
  }
  try {
    expect(check(["1", "60"])[0]).toBe(false);
    expect(check(["0", "123"])).toEqual([true, (123 * 60) / 86400]);
    expect(check(["23", "59", "60"])).toEqual([true, 86400 / 86400]);
    expect(check(["1", "60"], SvNumInputOptions.LAX_TIME)[0]).toBe(true);
    check(["1", "30"]);
    state.nAmPm = -1;
    const out: [number] = [0];
    expect(scanner.GetTimeRef(out, 0, 2, SvNumInputOptions.NONE)).toBe(true);
    expect(out[0]).toBe((13 * 3600 + 30 * 60) / 86400);
  } finally { language.dispose(); mapper.dispose(); }
});

it("matches source literal tokens across subformats, then the remaining input suffix", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    code = unicode("General"),
    format = new SvNumberformat(code, language.GetFormatScanner(), [0], [0x0409]),
    sections = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor,
    scanner = language.pStringScanner as unknown as {
      ScanStringNumFor(input: OUString, position: number, token: number, suppress: boolean): boolean;
    },
    input = unicode("1AbC");
  const negative = sections[1] as ImpSvNumFor;
  negative.Enlarge(1);
  negative.Info().nTypeArray[0] = NfSymbolType.STRING;
  const literal = unicode("abc");
  try {
    (negative.Info().sStrArray[0] as OUString).assign(literal);
    language.pStringScanner.fields.mpFormat = format;
    expect(scanner.ScanStringNumFor(input, 1, 0, false)).toBe(true);
    expect(language.pStringScanner.fields.nStringScanNumFor).toBe(1);
    expect(language.pStringScanner.fields.nStringScanSign).toBe(-1);
  } finally {
    literal.dispose(); input.dispose(); format.dispose(); code.dispose(); language.dispose(); mapper.dispose();
  }
});

it("classifies source start fragments through sign, decimal, currency and month owners", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      ScanStartString(input: OUString): boolean;
    };
  /** Runs a prepared source start fragment. @param value - Fragment. @returns Result and source state. */
  function scan(value: string) {
    const input = unicode(value);
    try {
      scanner.Reset();
      const accepted = scanner.ScanStartString(input);
      const state = language.pStringScanner.fields;
      return { accepted, sign: state.nSign, decimal: state.nDecPos,
        type: state.eScannedType, month: state.nMonth };
    } finally { input.dispose(); }
  }
  try {
    expect(scan("-")).toMatchObject({ accepted: true, sign: -1 });
    expect(scan(".")).toMatchObject({ accepted: true, decimal: 1 });
    expect(scan("$")).toMatchObject({ accepted: true, type: SvNumFormatType.CURRENCY });
    expect(scan("JAN ")).toMatchObject({ accepted: true, type: SvNumFormatType.DATE, month: -1 });
  } finally { language.dispose(); mapper.dispose(); SvNumberFormatter.resetTheCurrencyTable(); }
});

it("classifies source end fragments through percent, currency, decimal and format fallback", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      ScanEndString(input: OUString): boolean;
    };
  /** Runs a prepared source end fragment. @param value - Fragment. @returns Result and source state. */
  function scan(value: string) {
    const input = unicode(value);
    try {
      scanner.Reset();
      const accepted = scanner.ScanEndString(input), state = language.pStringScanner.fields;
      return { accepted, decimal: state.nDecPos, type: state.eScannedType };
    } finally { input.dispose(); }
  }
  try {
    expect(scan("%")).toMatchObject({ accepted: true, type: SvNumFormatType.PERCENT });
    expect(scan("$")).toMatchObject({ accepted: true, type: SvNumFormatType.CURRENCY });
    expect(scan(".")).toMatchObject({ accepted: true, decimal: 3 });
    expect(scan("XYZ")).toMatchObject({ accepted: false });
  } finally { language.dispose(); mapper.dispose(); SvNumberFormatter.resetTheCurrencyTable(); }
});

it("classifies source middle fragments through decimal, exponent and time separators", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      ScanMidString(input: OUString, position: number, numericCount: number): boolean;
    };
  /** Runs an uppercased source middle fragment. @param value - Fragment. @returns Result and scan state. */
  function scan(value: string) {
    const input = unicode(value);
    try {
      scanner.Reset();
      const accepted = scanner.ScanMidString(input, 1, 1), state = language.pStringScanner.fields;
      return { accepted, decimal: state.nDecPos, type: state.eScannedType, time: state.nTimePos };
    } finally { input.dispose(); }
  }
  try {
    expect(scan(".")).toMatchObject({ accepted: true, decimal: 2 });
    expect(scan("E")).toMatchObject({ accepted: true, type: SvNumFormatType.SCIENTIFIC });
    expect(scan(":")).toMatchObject({ accepted: true, type: SvNumFormatType.TIME, time: 2 });
    expect(scan("XYZ")).toMatchObject({ accepted: false });
  } finally { language.dispose(); mapper.dispose(); }
});

it("dispatches source fragment counts and reconciles final input types", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      IsNumberFormatMain(input: OUString, format: null): boolean;
    };
  /** Runs already-uppercase source input through the original main classifier. @param value - Input. @returns Success and final type. */
  function classify(value: string) {
    const input = unicode(value);
    try {
      const accepted = scanner.IsNumberFormatMain(input, null);
      return { accepted, type: language.pStringScanner.fields.eScannedType };
    } finally { input.dispose(); }
  }
  try {
    expect(classify("123")).toEqual({ accepted: true, type: SvNumFormatType.NUMBER });
    expect(classify("1.25")).toEqual({ accepted: true, type: SvNumFormatType.NUMBER });
    expect(classify("1E3")).toEqual({ accepted: true, type: SvNumFormatType.SCIENTIFIC });
    expect(classify("TRUE")).toEqual({ accepted: true, type: SvNumFormatType.LOGICAL });
    expect(classify("TEXT").accepted).toBe(false);
    expect(classify("1\0A").accepted).toBe(false);
  } finally { language.dispose(); mapper.dispose(); }
});

/** Runs source-private division against the real current-language owner. @param source - Input. @returns Scanner fragments and counters. */
function divide(source: string) {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0407);
  const input = unicode(source);
  const scanner = language.pStringScanner as unknown as {
    Reset(): void;
    NumberStringDivision(value: OUString): void;
  };
  try {
    scanner.Reset();
    scanner.NumberStringDivision(input);
    const fields = language.pStringScanner.fields;
    return {
      count: fields.nStringsCnt,
      numericCount: fields.nNumericsCnt,
      thousandsPosition: fields.nPosThousandString,
      fragments: fields.sStrArray.slice(0, fields.nStringsCnt).map(text),
      numericSlots: fields.nNums.slice(0, fields.nNumericsCnt),
    };
  } finally {
    input.dispose();
    language.dispose();
  }
}

it("alternates contiguous ASCII digits and other UTF-16 characters", () => {
  expect(divide("A12.٣45B")).toEqual({
    count: 5,
    numericCount: 2,
    thousandsPosition: 0,
    fragments: ["A", "12", ".٣", "45", "B"],
    numericSlots: [1, 3],
  });
});

it("matches the source currency-table symbol and invalidates its cache after a locale switch", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as { GetCurrency(value: OUString, position: [number]): boolean };
  const dollar = unicode("$42"), euro = unicode("€42"), other = unicode("X42");
  try {
    const first: [number] = [0];
    expect(scanner.GetCurrency(dollar, first)).toBe(true);
    expect(first[0]).toBe(1);
    const absent: [number] = [0];
    expect(scanner.GetCurrency(other, absent)).toBe(false);
    expect(absent[0]).toBe(0);
    language.ChangeIntl(0x0407);
    const second: [number] = [0];
    expect(scanner.GetCurrency(euro, second)).toBe(true);
    expect(second[0]).toBe(1);
  } finally {
    other.dispose(); euro.dispose(); dollar.dispose(); language.dispose(); mapper.dispose();
    SvNumberFormatter.resetTheCurrencyTable();
  }
});

it("collapses only complete three-digit locale groups near the twenty-fragment limit", () => {
  const prefix = "1x".repeat(7);
  const grouped = divide(prefix + "123.456.789");
  expect(grouped.count).toBe(15);
  expect(grouped.numericCount).toBe(8);
  expect(grouped.thousandsPosition).toBe(14);
  expect(grouped.fragments[14]).toBe("123456789");
  const partial = divide(prefix + "123.45");
  expect(partial.count).toBe(17);
  expect(partial.thousandsPosition).toBe(0);
  expect(partial.fragments.slice(14)).toEqual(["123", ".", "45"]);
});

it("preserves upstream embedded-NUL capacity behavior", () => {
  const result = divide("1\0A");
  expect(result.count).toBe(20);
  expect(result.numericCount).toBe(1);
  expect(result.fragments[0]).toBe("1");
  expect(result.fragments.slice(1)).toEqual(Array(19).fill(""));
});

it("uses source ISO and named-month fragment shapes before date-format acceptance", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      MayBeIso8601(): boolean;
      MayBeMonthDate(): boolean;
    };
  /** Inspects only the pinned cached preclassification stage. @param source - Input. @returns Source statuses. */
  function shape(source: string) {
    const input = unicode(source);
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      return {
        iso: scanner.MayBeIso8601(),
        isoStatus: language.pStringScanner.fields.nMayBeIso8601,
        monthDate: scanner.MayBeMonthDate(),
        monthStatus: language.pStringScanner.fields.nMayBeMonthDate,
      };
    } finally {
      input.dispose();
    }
  }
  try {
    expect(shape("2024-12-31")).toEqual({
      iso: true,
      isoStatus: 4,
      monthDate: false,
      monthStatus: 1,
    });
    expect(shape("024-12-31").isoStatus).toBe(3);
    expect(shape("24-12-31").isoStatus).toBe(2);
    expect(shape("2024-13-31").isoStatus).toBe(1);
    expect(shape("12-JAN-2024").monthStatus).toBe(2);
    expect(shape("2024-JAN-12").monthStatus).toBe(3);
    expect(shape("12-JAN-13").monthStatus).toBe(2);
  } finally {
    language.dispose();
  }
});

it("uses source day and year fragment bounds and two-digit-year expansion", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      ImplGetDay(index: number): number;
      ImplGetYear(index: number): number;
      SetYear2000(year: number): void;
    };
  /** Runs one native numeric fragment. @param source - Digits. @returns Day and year. */
  function parts(source: string) {
    const input = unicode(source);
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      return { day: scanner.ImplGetDay(0), year: scanner.ImplGetYear(0) };
    } finally {
      input.dispose();
    }
  }
  try {
    scanner.SetYear2000(1930);
    expect(SvNumberFormatter.ExpandTwoDigitYear(29, 1930)).toBe(2029);
    expect(SvNumberFormatter.ExpandTwoDigitYear(30, 1930)).toBe(1930);
    const formatter = new SvNumberFormatter(0x0409);
    try {
      formatter.SetYear2000(1930);
      expect(formatter.ExpandTwoDigitYear(29)).toBe(2029);
      expect(formatter.ExpandTwoDigitYear(30)).toBe(1930);
      expect(formatter.ExpandTwoDigitYear(2024)).toBe(2024);
    } finally {
      formatter.dispose();
    }
    expect(parts("29")).toEqual({ day: 29, year: 2029 });
    expect(parts("31")).toEqual({ day: 31, year: 1931 });
    expect(parts("32")).toEqual({ day: 0, year: 1932 });
    expect(parts("029")).toEqual({ day: 0, year: 29 });
    expect(parts("1234567")).toEqual({ day: 0, year: 0 });
  } finally {
    language.dispose();
  }
});

it("uses calendar month bounds and the source invalid-month sentinel", () => {
  const language = new SvNFLanguageData(new NumberFormatCodeMapper(), 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      ImplGetMonth(index: number): number;
    };
  /** Parses one numeric fragment before source month conversion. @param source - Numeric input. @returns Zero-based month or invalid sentinel. */
  function month(source: string): number {
    const input = unicode(source);
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      return scanner.ImplGetMonth(0);
    } finally {
      input.dispose();
    }
  }
  try {
    expect(["1", "12", "0", "13", "001"].map(month)).toEqual([0, 11, 12, 12, 12]);
  } finally {
    language.dispose();
  }
});

it("selects the source long-date order for a middle month", () => {
  /** Runs the source fragment scanner and long-order selection. @param languageId - Locale language. @param source - Date input. @param dateOrder - Evaluated short order. @returns Native long date order. */
  function order(languageId: number, source: string, dateOrder: DateOrder): LongDateOrder {
    const language = new SvNFLanguageData(new NumberFormatCodeMapper(), languageId),
      scanner = language.pStringScanner as unknown as {
        Reset(): void;
        NumberStringDivision(value: OUString): void;
        GetMiddleMonthLongDateOrder(formatTurn: boolean, locale: ReturnType<SvNFLanguageData["GetLocaleData"]>, dateOrder: DateOrder): LongDateOrder;
      },
      input = unicode(source);
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      return scanner.GetMiddleMonthLongDateOrder(false, language.GetLocaleData(), dateOrder);
    } finally {
      input.dispose();
      language.dispose();
    }
  }
  expect(order(0x0409, "12-JAN-2024", DateOrder.MDY)).toBe(LongDateOrder.DMY);
  expect(order(0x0409, "2024-JAN-12", DateOrder.MDY)).toBe(LongDateOrder.YMD);
  expect(order(0x0409, "00 JAN 12", DateOrder.YMD)).toBe(LongDateOrder.YMD);
  expect(order(0x0407, "00 JAN 12", DateOrder.YMD)).toBe(LongDateOrder.YMD);
});

it("marks only substantive source format-string matches as returned", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as { MatchedReturn(): boolean },
    state = language.pStringScanner.fields;
  try {
    expect(state.nMatchedAllStrings).toBe(0x08);
    expect(scanner.MatchedReturn()).toBe(false);
    state.nMatchedAllStrings = 0x09;
    expect(scanner.MatchedReturn()).toBe(true);
    expect(state.nMatchedAllStrings).toBe(0x19);
  } finally {
    language.dispose();
  }
});

it("matches source calendar month and weekday names with original alternate ordering", () => {
  /** Queries one source name and mutable cursor. @param languageId - Locale language ID. @param source - Already uppercase scan input. @param kind - Month or weekday. @returns Signed calendar index and consumed length. */
  function scan(languageId: number, source: string, kind: "month" | "day") {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, languageId),
      scanner = language.pStringScanner as unknown as {
        GetMonth(value: OUString, position: [number]): number;
        GetDayOfWeek(value: OUString, position: [number]): number;
      },
      input = unicode(source),
      position: [number] = [0];
    try {
      const result =
        kind === "month"
          ? scanner.GetMonth(input, position)
          : scanner.GetDayOfWeek(input, position);
      return { result, position: position[0] };
    } finally {
      input.dispose();
      language.dispose();
    }
  }
  expect(scan(0x0409, "JANUARY 1", "month")).toEqual({ result: 1, position: 7 });
  expect(scan(0x0409, "JAN 1", "month")).toEqual({ result: -1, position: 3 });
  expect(scan(0x0409, "SEPT 1", "month")).toEqual({ result: -9, position: 4 });
  expect(scan(0x0409, "MONDAYX", "day")).toEqual({ result: 0, position: 0 });
  expect(scan(0x0409, "MONDAY 1", "day")).toEqual({ result: 2, position: 6 });
  expect(scan(0x0c07, "JANUAR 1", "month")).toEqual({ result: 1, position: 6 });
  expect(scan(0x0407, "JÄNNER 1", "month")).toEqual({ result: 1, position: 6 });
});

it("matches generated locale date patterns in source order and rejects implausible numeric parts", () => {
  /** Runs the source fragment division followed by the cached pattern matcher. @param languageId - Locale. @param source - Input. @returns Native match state. */
  function match(languageId: number, source: string) {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, languageId),
      scanner = language.pStringScanner as unknown as {
        Reset(): void;
        NumberStringDivision(value: OUString): void;
        IsAcceptedDatePattern(start: number): boolean;
        GetDatePatternNumbers(): number;
        IsDatePatternNumberOfType(number: number, type: string): boolean;
        GetDatePatternOrder(): number;
        GetDateOrder(fromFormatIfNoPattern?: boolean): DateOrder;
        IsAcceptableIso8601(): boolean;
        SkipDatePatternSeparator(particle: number, position: [number], signed: [boolean]): boolean;
      },
      input = unicode(source);
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      const matched = scanner.IsAcceptedDatePattern(0);
      const separatorPosition: [number] = [7],
        signedYear: [boolean] = [false];
      const separator = scanner.SkipDatePatternSeparator(1, separatorPosition, signedYear);
      return {
        matched,
        index: language.pStringScanner.fields.nAcceptedDatePattern,
        numbers: scanner.GetDatePatternNumbers(),
        order: scanner.GetDatePatternOrder(),
        dateOrder: scanner.GetDateOrder(),
        iso: scanner.IsAcceptableIso8601(),
        firstIsMonth: scanner.IsDatePatternNumberOfType(0, "M"),
        separator,
        separatorPosition: separatorPosition[0],
      };
    } finally {
      input.dispose();
      language.dispose();
    }
  }
  expect(match(0x0409, "12/31/2024")).toEqual({
    matched: true,
    index: 1,
    numbers: 3,
    order: 0x4d4459,
    dateOrder: DateOrder.MDY,
    iso: false,
    firstIsMonth: true,
    separator: true,
    separatorPosition: 1,
  });
  expect(match(0x0409, "12/31").numbers).toBe(2);
  expect(match(0x0409, "13/31/2024").matched).toBe(false);
  expect(match(0x0809, "31/12/2024").order).toBe(0x444d59);
  expect(match(0x0809, "31/12/2024").dateOrder).toBe(DateOrder.DMY);
  expect(match(0x0407, "31.12.2024").index).toBe(1);
  expect(match(0x0407, "1.234").matched).toBe(false);
  expect(match(0x0409, "2024-12-31").iso).toBe(true);
});

it("converts native time parts while preserving strict duration, AM/PM, fractional and leap-second rules", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      GetTimeRef(output: [number], first: number, count: number, options: number): boolean;
    };
  /** Scans the source fragments, then supplies the delimiter flags that ScanStart/Mid/End set before GetTimeRef. @param value - Input. @param decimalPosition - Source fractional-time mode. @param ampm - Source AM/PM marker. @param options - Input flags. @returns Conversion and output. */
  function convert(
    value: string,
    decimalPosition = 0,
    ampm = 0,
    options: number = SvNumInputOptions.NONE,
  ) {
    const input = unicode(value),
      result: [number] = [Number.NaN];
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      language.pStringScanner.fields.nDecPos = decimalPosition;
      language.pStringScanner.fields.nAmPm = ampm;
      const accepted = scanner.GetTimeRef(
        result,
        0,
        language.pStringScanner.fields.nNumericsCnt,
        options,
      );
      return { accepted, serial: result[0] };
    } finally {
      input.dispose();
    }
  }
  try {
    expect(convert("0:123")).toEqual({ accepted: true, serial: (123 * 60) / 86400 });
    expect(convert("1:60")).toEqual({ accepted: false, serial: 7200 / 86400 });
    expect(convert("1:60", 0, 0, SvNumInputOptions.LAX_TIME)).toEqual({
      accepted: true,
      serial: 7200 / 86400,
    });
    expect(convert("23:59:60")).toEqual({ accepted: true, serial: 86400 / 86400 });
    expect(convert("13:00PM", 0, -1).accepted).toBe(false);
    expect(convert("12:30AM", 0, 1)).toEqual({ accepted: true, serial: 1800 / 86400 });
    expect(convert("45.5", 2)).toEqual({ accepted: true, serial: 45.5 / 86400 });
    expect(convert("00:000").accepted).toBe(false);
  } finally {
    language.dispose();
  }
});

it("recognizes whole localized logical words through the source format-scanner cache", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0407),
    scanner = language.pStringScanner as unknown as { GetLogical(value: OUString): number };
  try {
    for (const [word, expected] of [
      ["WAHR", 1],
      ["FALSCH", -1],
      ["WAHRE", 0],
    ] as const) {
      const value = unicode(word);
      try {
        expect(scanner.GetLogical(value)).toBe(expected);
      } finally {
        value.dispose();
      }
    }
    language.ChangeIntl(0x0409);
    for (const [word, expected] of [
      ["TRUE", 1],
      ["FALSE", -1],
      ["WAHR", 0],
    ] as const) {
      const value = unicode(word);
      try {
        expect(scanner.GetLogical(value)).toBe(expected);
      } finally {
        value.dispose();
      }
    }
    language.ChangeIntl(0x041f);
    for (const [word, expected] of [
      ["DOĞRU", 1],
      ["YANLIŞ", -1],
      ["DOĞRU ", 0],
    ] as const) {
      const value = unicode(word);
      try {
        expect(scanner.GetLogical(value)).toBe(expected);
      } finally {
        value.dispose();
      }
    }
  } finally {
    language.dispose();
  }
});

it("uses source date-word boundaries and the three native blank characters", () => {
  const mapper = new NumberFormatCodeMapper();
  const language = new SvNFLanguageData(mapper, 0x0407);
  const scanner = language.pStringScanner as unknown as {
    StringContainsWord(what: OUString, value: OUString, position: number): boolean;
    SkipChar(code: number, value: OUString, position: [number]): boolean;
    SkipBlanks(value: OUString, position: [number]): boolean;
    SkipString(what: OUString, value: OUString, position: [number]): boolean;
  };
  const word = unicode("MAR");
  const cases = ["MAR", "MAR ", "MARCH", "MARé", "MAR字", "MAR𝟠"].map(unicode);
  const blankInput = unicode(" \u00a0\u202fX");
  const prefix = unicode("AB");
  const input = unicode("AB-X");
  try {
    expect(cases.map((value) => scanner.StringContainsWord(word, value, 0))).toEqual([
      true,
      true,
      false,
      false,
      true,
      true,
    ]);
    const blankPosition: [number] = [0];
    expect(scanner.SkipBlanks(blankInput, blankPosition)).toBe(true);
    expect(blankPosition[0]).toBe(3);
    expect(scanner.SkipBlanks(blankInput, blankPosition)).toBe(false);
    const position: [number] = [0];
    expect(scanner.SkipString(prefix, input, position)).toBe(true);
    expect(scanner.SkipChar(45, input, position)).toBe(true);
    expect(position[0]).toBe(3);
    expect(scanner.SkipString(prefix, input, position)).toBe(false);
  } finally {
    input.dispose();
    prefix.dispose();
    blankInput.dispose();
    for (const value of cases) value.dispose();
    word.dispose();
    language.dispose();
  }
});

it("consumes the source locale decimal separator without treating grouping as decimal", () => {
  for (const [languageId, separator, grouping] of [
    [0x0407, ",", "."],
    [0x0409, ".", ","],
  ] as const) {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, languageId),
      scanner = language.pStringScanner as unknown as {
        GetDecSep(value: OUString, position: [number]): boolean;
      },
      value = unicode(`${separator}2`),
      other = unicode(grouping);
    try {
      const position: [number] = [0];
      expect(scanner.GetDecSep(value, position)).toBe(true);
      expect(position[0]).toBe(1);
      expect(scanner.GetDecSep(value, position)).toBe(false);
      expect(scanner.GetDecSep(other, [0])).toBe(false);
    } finally {
      other.dispose();
      value.dispose();
      language.dispose();
    }
  }
});

it("retains the source distinction between leading and exponent signs", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      GetSign(value: OUString, position: [number]): number;
      GetESign(value: OUString, position: [number]): number;
    };
  try {
    for (const [source, expected, negativeBracket] of [
      ["+1", 1, false],
      ["-1", -1, false],
      ["−1", -1, false],
      ["(1)", -1, true],
      ["1", 0, false],
    ] as const) {
      const input = unicode(source),
        position: [number] = [0];
      try {
        scanner.Reset();
        expect(scanner.GetSign(input, position)).toBe(expected);
        expect(position[0]).toBe(expected === 0 ? 0 : 1);
        expect(language.pStringScanner.fields.bNegCheck).toBe(negativeBracket);
        expect(scanner.GetESign(input, [0])).toBe(source === "+1" ? 1 : source === "-1" ? -1 : 0);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
  }
});

it("advances source numeric fragment counters only on numeric slots", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0409),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      GetNextNumber(index: [number], count: [number]): boolean;
    },
    input = unicode("A12.B3");
  try {
    scanner.Reset();
    scanner.NumberStringDivision(input);
    const index: [number] = [0],
      count: [number] = [0];
    expect(scanner.GetNextNumber(index, count)).toBe(false);
    expect([index[0], count[0]]).toEqual([0, 0]);
    index[0] = 1;
    expect(scanner.GetNextNumber(index, count)).toBe(true);
    expect([index[0], count[0]]).toEqual([2, 1]);
    expect(scanner.GetNextNumber(index, count)).toBe(false);
    expect([index[0], count[0]]).toEqual([2, 1]);
  } finally {
    input.dispose();
    language.dispose();
  }
});

it("accepts only source grouping widths and the merged near-capacity slot", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x0407),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      GetThousandSep(value: OUString, position: [number], fragment: number): boolean;
    };
  try {
    for (const [source, accepted] of [
      ["1.234", true],
      ["1.23", false],
      ["1,234", false],
    ] as const) {
      const input = unicode(source);
      try {
        scanner.Reset();
        scanner.NumberStringDivision(input);
        const fragment = language.pStringScanner.fields.sStrArray[1] as OUString,
          position: [number] = [0];
        expect(scanner.GetThousandSep(fragment, position, 1)).toBe(accepted);
        expect(position[0]).toBe(accepted ? 1 : 0);
      } finally {
        input.dispose();
      }
    }
    const input = unicode("1.23");
    try {
      scanner.Reset();
      scanner.NumberStringDivision(input);
      language.pStringScanner.fields.nPosThousandString = 2;
      expect(
        scanner.GetThousandSep(language.pStringScanner.fields.sStrArray[1] as OUString, [0], 1),
      ).toBe(true);
    } finally {
      input.dispose();
    }
  } finally {
    language.dispose();
  }
});

it("retains both source group widths for the Indian digit-grouping sequence", () => {
  const mapper = new NumberFormatCodeMapper(),
    language = new SvNFLanguageData(mapper, 0x4009),
    scanner = language.pStringScanner as unknown as {
      Reset(): void;
      NumberStringDivision(value: OUString): void;
      GetThousandSep(value: OUString, position: [number], fragment: number): boolean;
    };
  try {
    for (const source of ["1,23", "1,234"]) {
      const input = unicode(source);
      try {
        scanner.Reset();
        scanner.NumberStringDivision(input);
        const position: [number] = [0];
        expect(
          scanner.GetThousandSep(
            language.pStringScanner.fields.sStrArray[1] as OUString,
            position,
            1,
          ),
        ).toBe(true);
        expect(position[0]).toBe(1);
      } finally {
        input.dispose();
      }
    }
  } finally {
    language.dispose();
  }
});

it("uses generated locale AM/PM and fractional-second fields during input scanning", () => {
  for (const [languageId, amText, pmText, fractional, other] of [
    [0x0409, "AM", "PM", ".", ","],
    [0x0407, "VORM.", "NACHM.", ",", "."],
  ] as const) {
    const mapper = new NumberFormatCodeMapper(),
      language = new SvNFLanguageData(mapper, languageId),
      scanner = language.pStringScanner as unknown as {
        Reset(): void;
        GetTimeAmPm(value: OUString, position: [number]): boolean;
        GetTime100SecSep(value: OUString, position: [number]): boolean;
      },
      am = unicode(amText),
      pm = unicode(pmText),
      fraction = unicode(fractional + "5"),
      alternate = unicode(other + "5");
    try {
      scanner.Reset();
      const amPosition: [number] = [0];
      expect(scanner.GetTimeAmPm(am, amPosition)).toBe(true);
      expect([amPosition[0], language.pStringScanner.fields.nAmPm]).toEqual([amText.length, 1]);
      scanner.Reset();
      const pmPosition: [number] = [0];
      expect(scanner.GetTimeAmPm(pm, pmPosition)).toBe(true);
      expect([pmPosition[0], language.pStringScanner.fields.nAmPm]).toEqual([pmText.length, -1]);
      expect(scanner.GetTime100SecSep(fraction, [0])).toBe(true);
      expect(scanner.GetTime100SecSep(alternate, [0])).toBe(false);
      language.pStringScanner.fields.bIso8601Tsep = true;
      expect(scanner.GetTime100SecSep(alternate, [0])).toBe(true);
    } finally {
      alternate.dispose();
      fraction.dispose();
      pm.dispose();
      am.dispose();
      language.dispose();
    }
  }
});
