/** @fileoverview Native General NUMBER notation,precision and locale separator boundaries over real SAL conversion and rounding. */
import { expect, it } from "vitest";
import { formatStandardNumber } from "./zformat";
import { INPUTSTRING_PRECISION, UNLIMITED_PRECISION } from "./zforlist.defaults";

it("reads the first source currency token and only its adjacent extension", () => {
  const section = new ImpSvNumFor(), symbol = unicode("old"), extension = unicode("old-ext"),
    curr = unicode("DM"), suffix = unicode("407");
  try {
    expect(section.GetNewCurrencySymbol(symbol, extension)).toBe(false);
    expect([text(symbol), text(extension)]).toEqual(["old", "old-ext"]);
    section.Enlarge(2);
    const info = section.Info();
    info.nTypeArray[0] = NfSymbolType.CURRENCY;
    info.nTypeArray[1] = NfSymbolType.CURREXT;
    (info.sStrArray[0] as typeof symbol).assign(curr);
    (info.sStrArray[1] as typeof symbol).assign(suffix);
    expect(section.HasNewCurrency()).toBe(true);
    expect(section.GetNewCurrencySymbol(symbol, extension)).toBe(true);
    expect([text(symbol), text(extension)]).toEqual(["DM", "407"]);
    info.nTypeArray[1] = NfSymbolType.STRING;
    expect(section.GetNewCurrencySymbol(symbol, extension)).toBe(true);
    expect(text(extension)).toBe("");
  } finally {
    section.dispose(); suffix.dispose(); curr.dispose(); extension.dispose(); symbol.dispose();
  }
});
/** Reads and releases the real returned OUString. @param value - Input value. @param precision - Actual standard precision. @param decimal - Locale decimal unit. @returns Displayed text. */
function formatted(value: number, precision = UNLIMITED_PRECISION, decimal = "."): string {
  const output = formatStandardNumber(value, precision, decimal.charCodeAt(0));
  try {
    return String.fromCharCode(...output.getStr().subarray(0, output.getLength()));
  } finally {
    output.dispose();
  }
}

it("preserves General's fixed/scientific choice including its nine-exponent and significant-digit checks", /** The original default differs from input-line Automatic notation. @returns Nothing. */ () => {
  for (const [value, expected] of [
    [0, "0"],
    [-0, "0"],
    [1, "1"],
    [-1, "-1"],
    [0.125, "0.125"],
    [-0.125, "-0.125"],
    [0.0001, "0.0001"],
    [1e-9, "0.000000001"],
    [-1e-9, "-0.000000001"],
    [1e-10, "1E-10"],
    [1.234567890123456e-7, "1.23456789012346E-07"],
    [1e20, "1E+020"],
    [Infinity, "INF"],
    [-Infinity, "-INF"],
    [NaN, "NaN"],
  ] as const)
    expect(formatted(value)).toBe(expected);
  expect(formatted(0.125, UNLIMITED_PRECISION, ",")).toBe("0,125");
  expect(formatted(0.125, UNLIMITED_PRECISION, "٫")).toBe("0٫125");
});

it("uses the native input-line precision sentinel and its zero handling", /** Input-line notation keeps RTL's original three-digit exponent. @returns Nothing. */ () => {
  expect(INPUTSTRING_PRECISION).toBe(65534);
  expect(formatted(-0, INPUTSTRING_PRECISION)).toBe("0");
  expect(formatted(1e-10, INPUTSTRING_PRECISION)).toBe("0.0000000001");
  expect(formatted(1e-15, INPUTSTRING_PRECISION)).toBe("1E-015");
  expect(formatted(-0.125, INPUTSTRING_PRECISION, ",")).toBe("-0,125");
});

it("preserves fixed precision,negative-zero suppression and the original magnitude/precision limits", /** These source boundaries must not be replaced with Intl or host toFixed. @returns Nothing. */ () => {
  expect(formatted(123.456, 2)).toBe("123.46");
  expect(formatted(-1, 2)).toBe("-1");
  expect(formatted(12, 2)).toBe("12");
  expect(formatted(-0.004, 2)).toBe("0");
  expect(formatted(0.001, 2)).toBe("0");
  expect(formatted(1e15, 2)).toBe("1000000000000000");
  expect(formatted(1e16, 5)).toBe("1E+16");
  expect(formatted(1.2345678901234568e22, 20)).toBe("1.23456789012346E+22");
  expect(formatted(1e-300, 400)).toBe("0." + "0".repeat(299) + "1");
  expect(formatted(123.4, 65536)).toBe("123");
});

import { Color } from "../../../tools/inc/color";
import { ImpSvNumFor, SvNumberformat } from "./zformat";
import { ImpSvNumberformatScan, KeywordLocalization, extractStandardGeneralName } from "./zforscan";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { SvNumFormatType } from "../../inc/zforlist";
import { NfKeywordIndex } from "../../inc/nfkeytab";
import { NfSymbolType } from "../../inc/nfsymbol";

it("finds source literal/currency tokens in either direction and checks edge minus signs", () => {
  const mapper = new NumberFormatCodeMapper(),
    locale = new Locale(unicode("en"), unicode("US"), unicode("")),
    mapped = mapper.getFormatCode(0, locale),
    name = extractStandardGeneralName(mapped.Code),
    localeData = new LocaleDataWrapper(locale),
    scanner = new ImpSvNumberformatScan(locale, name, KeywordLocalization.AllowEnglish, localeData),
    code = unicode("General"),
    format = new SvNumberformat(code, scanner, [0], [0x0409]),
    section = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[1] as ImpSvNumFor,
    word = unicode(" - "), currency = unicode("USD"), interior = unicode("A-B");
  try {
    section.Enlarge(3);
    const info = section.Info();
    info.nTypeArray.splice(0, 3, NfSymbolType.DIGIT, NfSymbolType.STRING, NfSymbolType.CURRENCY);
    (info.sStrArray[1] as typeof word).assign(word);
    (info.sStrArray[2] as typeof currency).assign(currency);
    const first = format.GetNumForString(1, 0, true),
      last = format.GetNumForString(1, 0xffff, true);
    expect(first && text(first)).toBe(" - ");
    expect(last && text(last)).toBe("USD");
    expect(format.GetNumForString(2, 0, true)).toBeNull();
    expect(format.IsNumForStringElementCountEqual(1, 3, 1)).toBe(true);
    expect(format.IsNumForStringElementCountEqual(1, 2, 0)).toBe(true);
    expect(format.IsNumForStringElementCountEqual(1, 2, 1)).toBe(false);
    info.eScannedType = SvNumFormatType.CURRENCY;
    expect(format.GetNumForInfoScannedType(1)).toBe(SvNumFormatType.CURRENCY);
    expect(format.GetNumForInfoScannedType(4)).toBe(SvNumFormatType.UNDEFINED);
    expect(format.IsSecondSubformatRealNegative()).toBe(true);
    expect(format.IsNegativeWithoutSign()).toBe(false);
    expect(SvNumberformat.HasStringNegativeSign(interior)).toBe(false);
    expect(SvNumberformat.HasStringNegativeSign(word)).toBe(true);
  } finally {
    interior.dispose(); currency.dispose(); word.dispose(); format.dispose(); code.dispose();
    scanner.dispose(); localeData.dispose(); name.dispose(); mapped.dispose(); mapper.dispose(); locale.dispose();
  }
});
import { DateOrder, LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";

it("recognizes the source compiled minute-second token grammar", () => {
  const language = unicode("en"),
    country = unicode("US"),
    empty = unicode(""),
    locale = new Locale(language, country, empty),
    mapper = new NumberFormatCodeMapper(),
    mapped = mapper.getFormatCode(0, locale),
    name = extractStandardGeneralName(mapped.Code),
    localeData = new LocaleDataWrapper(locale),
    scanner = new ImpSvNumberformatScan(locale, name, KeywordLocalization.AllowEnglish, localeData),
    code = unicode("general"),
    entry = new SvNumberformat(code, scanner, [0], [0x0409]);
  const first = (entry as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  /** Loads actual compiled token slots, as the format scanner does before the source predicate is called. @param tokens - Native token types and text. @returns Nothing. */
  function load(tokens: readonly (readonly [number, string])[]): void {
    first.Enlarge(tokens.length);
    tokens.forEach(([type, value], index) => {
      first.Info().nTypeArray[index] = type;
      const string = unicode(value);
      try {
        (first.Info().sStrArray[index] as import("../../../sal/inc/rtl/ustring").OUString).assign(
          string,
        );
      } finally {
        string.dispose();
      }
    });
  }
  try {
    load([
      [NfKeywordIndex.MI, "MM"],
      [NfSymbolType.TIMESEP, ":"],
      [NfKeywordIndex.SS, "SS"],
    ]);
    expect(entry.IsMinuteSecondFormat()).toBe(false);
    entry.SetType(SvNumFormatType.TIME);
    expect(entry.IsMinuteSecondFormat()).toBe(true);
    load([
      [NfSymbolType.DEL, "["],
      [NfKeywordIndex.MMI, "MM"],
      [NfSymbolType.DEL, "]"],
      [NfSymbolType.TIMESEP, ":"],
      [NfKeywordIndex.S, "S"],
      [NfSymbolType.TIME100SECSEP, "."],
      [NfSymbolType.DIGIT, "0"],
    ]);
    expect(entry.IsMinuteSecondFormat()).toBe(true);
    load([
      [NfKeywordIndex.H, "H"],
      [NfSymbolType.TIMESEP, ":"],
      [NfKeywordIndex.MI, "M"],
      [NfSymbolType.TIMESEP, ":"],
      [NfKeywordIndex.S, "S"],
    ]);
    expect(entry.IsMinuteSecondFormat()).toBe(false);
  } finally {
    entry.dispose();
    code.dispose();
    scanner.dispose();
    localeData.dispose();
    name.dispose();
    mapped.dispose();
    mapper.dispose();
    locale.dispose();
    language.dispose();
    country.dispose();
    empty.dispose();
  }
});

it("derives original date order from compiled first-subformat tokens", () => {
  const language = unicode("en"),
    country = unicode("US"),
    empty = unicode("");
  const locale = new Locale(language, country, empty),
    mapper = new NumberFormatCodeMapper(),
    mapped = mapper.getFormatCode(0, locale),
    name = extractStandardGeneralName(mapped.Code),
    localeData = new LocaleDataWrapper(locale),
    scanner = new ImpSvNumberformatScan(locale, name, KeywordLocalization.AllowEnglish, localeData),
    code = unicode("general"),
    entry = new SvNumberformat(code, scanner, [0], [0x0409]);
  try {
    expect(entry.GetDateOrder()).toBe(DateOrder.MDY);
    expect(entry.GetExactDateOrder()).toBe(0);
    entry.SetType(SvNumFormatType.DATE);
    const first = (entry as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
    first.Enlarge(3);
    first.Info().nTypeArray.splice(0, 3, NfKeywordIndex.YYYY, NfKeywordIndex.MM, NfKeywordIndex.DD);
    expect(entry.GetDateOrder()).toBe(DateOrder.YMD);
    expect(entry.GetExactDateOrder()).toBe(0x594d44);
    first.Info().nTypeArray.splice(0, 3, NfKeywordIndex.DD, NfKeywordIndex.MM, NfKeywordIndex.YYYY);
    expect(entry.GetDateOrder()).toBe(DateOrder.DMY);
    expect(entry.GetExactDateOrder()).toBe(0x444d59);
  } finally {
    entry.dispose();
    code.dispose();
    scanner.dispose();
    localeData.dispose();
    name.dispose();
    mapped.dispose();
    mapper.dispose();
    locale.dispose();
    empty.dispose();
    country.dispose();
    language.dispose();
  }
});

it("owns compiled subformat tokens with original resize,copy and scalar defaults", /** Real OUString slots retain their prefix identity and independent copied lifetimes. @returns Nothing. */ () => {
  const source = new ImpSvNumFor(),
    copy = new ImpSvNumFor(),
    token = unicode("Standard");
  try {
    expect(source.GetCount()).toBe(0);
    expect(source.Info().eScannedType).toBe(SvNumFormatType.UNDEFINED);
    expect([
      source.Info().bThousand,
      source.Info().nThousand,
      source.Info().nCntPre,
      source.Info().nCntPost,
      source.Info().nCntExp,
    ]).toEqual([false, 0, 0, 0, 0]);
    source.Enlarge(2);
    const first = source.Info().sStrArray[0] as import("../../../sal/inc/rtl/ustring").OUString;
    first.assign(token);
    source.Info().nTypeArray[0] = 39;
    source.Enlarge(2);
    source.Enlarge(1);
    expect(source.Info().sStrArray[0]).toBe(first);
    source.Info().eScannedType = SvNumFormatType.NUMBER;
    source.Info().nThousand = 1000;
    source.Info().nCntPre = 2;
    source.Info().nCntPost = 3;
    source.Info().nCntExp = 4;
    source.Info().bThousand = true;
    copy.Copy(source);
    expect(copy.Info().sStrArray[0]).not.toBe(first);
    expect(text(copy.Info().sStrArray[0] as import("../../../sal/inc/rtl/ustring").OUString)).toBe(
      "Standard",
    );
    expect(copy.Info().nTypeArray).toEqual([39]);
    expect([
      copy.Info().eScannedType,
      copy.Info().bThousand,
      copy.Info().nThousand,
      copy.Info().nCntPre,
      copy.Info().nCntPost,
      copy.Info().nCntExp,
    ]).toEqual([16, true, 1000, 2, 3, 4]);
    source.Enlarge(0);
    expect(text(copy.Info().sStrArray[0] as import("../../../sal/inc/rtl/ustring").OUString)).toBe(
      "Standard",
    );
  } finally {
    copy.dispose();
    source.dispose();
    token.dispose();
  }
});

it("compiles the actual mapper General entry before standard NUMBER output and cross-scanner copies", /** The real source keyword,scan info,compiled entry and SAL output are connected;no parsed-state fixture is injected. @returns Nothing. */ () => {
  const language = unicode("de"),
    country = unicode("DE"),
    empty = unicode(""),
    locale = new Locale(language, country, empty),
    mapper = new NumberFormatCodeMapper(),
    mapped = mapper.getFormatCode(0, locale),
    name = extractStandardGeneralName(mapped.Code),
    localeData = new LocaleDataWrapper(locale),
    scanner = new ImpSvNumberformatScan(locale, name, KeywordLocalization.AllowEnglish, localeData),
    otherScanner = new ImpSvNumberformatScan(
      locale,
      name,
      KeywordLocalization.LocaleLegacy,
      localeData,
    ),
    code = unicode("general"),
    out = unicode("previous"),
    check: [number] = [-1];
  const entry = new SvNumberformat(code, scanner, check, [0x0407]);
  try {
    expect(check[0]).toBe(0);
    expect(text(code)).toBe("Standard");
    expect(text(entry.GetFormatstring())).toBe("Standard");
    expect(entry.GetLanguage()).toBe(0x0407);
    expect(entry.GetMaskedType()).toBe(16);
    expect(scanner.GetScannedType()).toBe(16);
    expect(scanner.GetStandardPrec()).toBe(2);
    scanner.ChangeStandardPrec(65535);
    expect(scanner.GetStandardPrec()).toBe(65535);
    expect(
      /** Calls actual unmarked entry. @returns Native return or explicit unported error. */ () =>
        entry.GetOutputString(1, out, [null], scanner.GetStandardPrec(), 44),
    ).toThrow(/nonstandard/);
    entry.SetStandard();
    const color: [Color | null] = [new Color(0x123456)];
    expect(entry.GetOutputString(0.125, out, color, scanner.GetStandardPrec(), 44)).toBe(false);
    expect(color[0]).toBeNull();
    expect(text(out)).toBe("0,125");
    const copy = new SvNumberformat(entry),
      exchanged = new SvNumberformat(entry, otherScanner);
    try {
      code.clear();
      scanner.Reset();
      for (const value of [copy, exchanged]) {
        expect(value.GetOutputString(1e-10, out, [null], 65535, 44)).toBe(false);
        expect(text(out)).toBe("1E-10");
        expect(text(value.GetFormatstring())).toBe("Standard");
      }
    } finally {
      exchanged.dispose();
      copy.dispose();
    }
    const invalid = new SvNumberformat(empty, scanner, check, [0x10407]);
    try {
      expect(check[0]).toBe(1);
      expect(invalid.GetMaskedType()).toBe(0);
      invalid.SetStandard();
      expect(
        /** Calls an empty invalid entry. @returns Native return or explicit unported error. */ () =>
          invalid.GetOutputString(1, out, [null], 65535, 44),
      ).toThrow(/nonstandard/);
    } finally {
      invalid.dispose();
    }
  } finally {
    entry.dispose();
    otherScanner.dispose();
    scanner.dispose();
    localeData.dispose();
    name.dispose();
    mapped.dispose();
    mapper.dispose();
    locale.dispose();
    language.dispose();
    country.dispose();
    empty.dispose();
    code.dispose();
    out.dispose();
  }
});
