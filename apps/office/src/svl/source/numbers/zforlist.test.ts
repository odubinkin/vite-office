/** @fileoverview Native selection/default policies over actual generated compound values and shared UNO COW. */
import { expect, it, vi } from "vitest";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import {
  NumberFormatCode,
  cppu_detail_getUnoType_NumberFormatCode,
  type NumberFormatCodeAddress,
} from "../../../offapi/com/sun/star/i18n/NumberFormatCode";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { ImpAdjustFormatCodeDefault, ImpGetFormatCodeIndex } from "./zforlist";
/** Actual generated specialization. */
const Codes = Sequence.specialize<NumberFormatCodeAddress>(
  cppu_detail_getUnoType_NumberFormatCode,
  40,
);
/** Builds real struct/Sequence owners,not a formatter service substitute. @param fields - Index,type,default observations. @returns Owned sequence. */
function codes(fields: [number, number, boolean][]) {
  const values = fields.map(
    /** Initializes actual fields. @param entry - Declared scalar fields. @returns Owned value. */ ([
      index,
      type,
      isDefault,
    ]) => {
      const code = new NumberFormatCode();
      code.Index = index;
      code.Type = type;
      code.Default = isDefault;
      return code;
    },
  );
  try {
    return new Codes(
      new Map(
        values.map(
          /** Addresses initialized compounds. @param value - Native struct. @param index - Position. @returns Byte address and value. */ (
            value,
            index,
          ) => [index * 40, value],
        ),
      ),
      values.length,
    );
  } finally {
    for (const value of values) value.dispose();
  }
}

it("selects exact index before default,currency decimals before integers,and final zero without modifying input", /** Native fallback ordering and const searches preserve actual handles. @returns Nothing. */ () => {
  const decimal = unicode(",");
  for (const [rows, offset, expected] of [
    [
      [
        [7, 1, true],
        [0, 2, false],
      ],
      0,
      1,
    ],
    [
      [
        [7, 1, false],
        [2, 3, true],
      ],
      14,
      1,
    ],
    [
      [
        [12, 1, false],
        [13, 2, false],
      ],
      14,
      1,
    ],
    [
      [
        [7, 1, false],
        [12, 1, false],
      ],
      17,
      1,
    ],
    [[[7, 1, false]], 15, 0],
    [
      [
        [13, 2, false],
        [12, 1, false],
      ],
      18,
      0,
    ],
    [
      [
        [7, 1, false],
        [13, 2, false],
      ],
      11,
      0,
    ],
  ] as [[number, number, boolean][], number, number][]) {
    const sequence = codes(rows),
      handle = sequence.get();
    try {
      expect(ImpGetFormatCodeIndex(sequence, offset, decimal)).toBe(expected);
      expect(sequence.get()).toBe(handle);
    } finally {
      sequence.dispose();
    }
  }
  decimal.dispose();
});

it("assigns the native empty fallback without changing another shared owner", /** Default struct scalars remain zero and the source separator may contain multiple UTF16 units. @returns Nothing. */ () => {
  const sequence = new Codes(),
    original = new Codes(sequence),
    decimal = unicode("\u066b\u200e");
  try {
    expect(ImpGetFormatCodeIndex(sequence, 0, decimal)).toBe(0);
    expect(original.getLength()).toBe(0);
    expect(sequence.getLength()).toBe(1);
    const code = NumberFormatCode.borrowed(sequence.operatorIndex(0));
    expect(text(code.Code)).toBe("0\u066b\u200e############");
    expect([
      code.Type,
      code.Usage,
      code.Index,
      code.Default,
      text(code.DefaultName),
      text(code.NameID),
    ]).toEqual([0, 0, 0, false, "", ""]);
  } finally {
    sequence.dispose();
    original.dispose();
    decimal.dispose();
  }
});

it("retains source medium/long/first fallback ordering,including duplicate medium flags", /** Native mutable pointer/count policy is exercised only on actual UNO storage. @returns Nothing. */ () => {
  for (const [types, expected] of [
    [[], []],
    [
      [
        [1, false],
        [3, false],
      ],
      [true, false],
    ],
    [
      [
        [1, true],
        [3, true],
      ],
      [false, true],
    ],
    [
      [
        [3, true],
        [1, true],
      ],
      [true, false],
    ],
    [
      [
        [2, true],
        [3, true],
      ],
      [true, false],
    ],
    [
      [
        [3, true],
        [2, true],
        [1, true],
      ],
      [false, true, false],
    ],
    [
      [
        [2, true],
        [2, true],
        [3, true],
      ],
      [true, true, false],
    ],
    [
      [
        [0, true],
        [1, true],
      ],
      [true, false],
    ],
  ] as [[number, boolean][], boolean[]][]) {
    const sequence = codes(
        types.map(
          /** Adds original index. @param entry - Fields. @param index - Position. @returns Constructor inputs. */ (
            [type, flag],
            index,
          ) => [index, type, flag],
        ),
      ),
      copy = new Codes(sequence);
    try {
      ImpAdjustFormatCodeDefault(sequence.getArray() as SequenceElements, sequence.getLength());
      expect(
        types.map(
          /** Observes adjusted actual fields. @param unused - Input fields. @param index - Position. @returns Default flag. */ (
            _,
            index,
          ) => NumberFormatCode.borrowed(sequence.operatorIndex(index)).Default,
        ),
      ).toEqual(expected);
      expect(
        types.map(
          /** Observes independently shared fields. @param unused - Input fields. @param index - Position. @returns Default flag. */ (
            _,
            index,
          ) => NumberFormatCode.borrowed(copy.operatorIndex(index)).Default,
        ),
      ).toEqual(
        types.map(
          /** Observes source expectation. @param entry - Input fields. @returns Original flag. */ ([
            ,
            flag,
          ]) => flag,
        ),
      );
    } finally {
      sequence.dispose();
      copy.dispose();
    }
  }
});

it("selects actual mapper General without replacing its compiled Sequence owner", /** Integration with the source locale catalog rather than a fake language-data provider. @returns Nothing. */ () => {
  const language = unicode("de"),
    country = unicode("DE"),
    empty = unicode(""),
    locale = new Locale(language, country, empty),
    mapper = new NumberFormatCodeMapper(),
    decimal = unicode(",");
  const sequence = mapper.getAllFormatCode(4, locale);
  try {
    ImpAdjustFormatCodeDefault(sequence.getArray() as SequenceElements, sequence.getLength());
    const index = ImpGetFormatCodeIndex(sequence, 0, decimal);
    expect(text(NumberFormatCode.borrowed(sequence.operatorIndex(index)).Code)).toBe("Standard");
  } finally {
    sequence.dispose();
    mapper.dispose();
    locale.dispose();
    language.dispose();
    country.dispose();
    empty.dispose();
    decimal.dispose();
  }
});

import { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import { NUMBERFORMAT_ENTRY_NOT_FOUND, SvNumFormatType } from "../../inc/zforlist";
import { SvNFFormatData, generateStandardNumberFormat } from "./zforlist";
import { SvNumberformat } from "./zformat";
import { ImpSvNumberformatScan, extractStandardGeneralName } from "./zforscan";

it("rejects an empty built-in Boolean code after the real scanner reports an empty format", /** Checks initialization cleanup through a service-code fixture while retaining the actual parser and format owners. @returns Nothing. */ () => {
  const values = tableValues();
  const empty = unicode("");
  const code = vi.spyOn(values.scanner, "GetBooleanString").mockReturnValue(empty);
  try {
    expect(
      /** Generates native builtins against the empty service code. @returns No complete table. */ () =>
        generateStandardNumberFormat(
          values.table,
          values.mapper,
          values.locale,
          values.scanner,
          values.language,
          values.decimal,
          0,
        ),
    ).toThrow("Built-in format scan failed");
    expect(values.table.GetEntry(0)).not.toBeNull();
  } finally {
    code.mockRestore();
    empty.dispose();
    values.dispose();
  }
});
/** Actual source-backed fields/owners used by native table operations;no service peer is fabricated. @returns Owned native values. */
function tableValues() {
  const languageText = unicode("de"),
    country = unicode("DE"),
    empty = unicode(""),
    locale = new Locale(languageText, country, empty),
    mapper = new NumberFormatCodeMapper(),
    code = mapper.getFormatCode(0, locale),
    name = extractStandardGeneralName(code.Code),
    localeData = new LocaleDataWrapper(locale),
    current = new SvNFLanguageData(mapper, 0x0407),
    scanner = new ImpSvNumberformatScan(current, mapper),
    decimal = unicode(","),
    table = new SvNFFormatData();
  return {
    locale,
    mapper,
    code,
    scanner,
    decimal,
    table,
    language: [0x0407] as [number],
    /** Releases actual owners in consumer-before-provider order. @returns Nothing. */
    dispose() {
      table.dispose();
      scanner.dispose();
      current.dispose();
      localeData.dispose();
      decimal.dispose();
      name.dispose();
      code.dispose();
      mapper.dispose();
      locale.dispose();
      languageText.dispose();
      country.dispose();
      empty.dispose();
    },
  };
}

it("generates actual standard NUMBER entry through the mapper,scanner and owning table", /** Real source General phase overwrites its shared nThousand field with builtin limit100. @returns Nothing. */ () => {
  const values = tableValues(),
    out = unicode(""),
    comment = unicode("source comment");
  try {
    expect(values.table.GetEntry(0)).toBeNull();
    expect(values.table.GetType(0)).toBe(SvNumFormatType.UNDEFINED);
    expect(values.table.ImpGetCLOffset(0x0407)).toBe(10000);
    generateStandardNumberFormat(
      values.table,
      values.mapper,
      values.locale,
      values.scanner,
      values.language,
      values.decimal,
      0,
    );
    const entry = values.table.GetEntry(0) as SvNumberformat;
    expect(values.table.GetFormatEntry(0x100000000)).toBe(entry);
    expect(entry.GetType()).toBe(16);
    expect(values.table.GetType(0)).toBe(16);
    expect(entry.IsStandard()).toBe(true);
    expect(text(entry.GetFormatstring())).toBe("Standard");
    expect(entry.GetLastInsertKey()).toBe(100);
    expect(values.table.ImpGetCLOffset(0x10407)).toBe(0);
    expect(values.table.ImpGetCLOffset(0x0409)).toBe(10000);
    expect(entry.GetOutputString(12.5, out, [null], 65535, 44)).toBe(false);
    expect(text(out)).toBe("12,5");
    entry.SetComment(comment);
    const copy = new SvNumberformat(entry);
    try {
      expect(text(copy.GetComment())).toBe("source comment");
      expect(copy.GetLastInsertKey()).toBe(100);
    } finally {
      copy.dispose();
    }
    entry.SetLastInsertKey(65537);
    expect(entry.GetLastInsertKey()).toBe(1);
    entry.SetType(1);
    expect(values.table.GetType(0)).toBe(1);
    entry.SetType(256);
    expect(values.table.GetType(0)).toBe(256);
    entry.SetType(16);
    generateStandardNumberFormat(
      values.table,
      values.mapper,
      values.locale,
      values.scanner,
      values.language,
      values.decimal,
      0,
    );
    expect(values.table.GetEntry(0)).toBe(entry);
    expect(entry.GetLastInsertKey()).toBe(1);
  } finally {
    out.dispose();
    comment.dispose();
    values.dispose();
  }
});

it("keeps insertion,duplicate,reserved-index and failure ownership contracts", /** Only actual generated struct values and scanner states are passed to the table. @returns Nothing. */ () => {
  const values = tableValues(),
    title = unicode("Named General"),
    empty = unicode(""),
    extra = new NumberFormatCode(values.code),
    emptyCode = new NumberFormatCode(values.code);
  try {
    values.code.Default = false;
    values.code.DefaultName = title;
    const entry = values.table.ImpInsertFormat(
      values.scanner,
      values.language,
      values.code,
      0,
    ) as SvNumberformat;
    expect(entry.IsStandard()).toBe(false);
    expect(text(entry.GetComment())).toBe("Named General");
    const refs = values.code.Code.pData.refCount;
    expect(
      values.table.ImpInsertFormat(values.scanner, values.language, values.code, 0),
    ).toBeNull();
    expect(values.code.Code.pData.refCount).toBe(refs);
    extra.Index = 62;
    expect(values.table.ImpInsertFormat(values.scanner, values.language, extra, 101)).toBeNull();
    emptyCode.Code = empty;
    expect(values.table.ImpInsertFormat(values.scanner, values.language, emptyCode, 5)).toBeNull();
    extra.Index = 51;
    expect(
      /** Original reserved-index assertion. @returns Insertion result. */ () =>
        values.table.ImpInsertFormat(values.scanner, values.language, extra, 5),
    ).toThrow(/reserved/);
    extra.Index = 12;
    extra.Usage = 8;
    expect(
      /** Explicit unported currency admission. @returns Insertion result. */ () =>
        values.table.ImpInsertFormat(values.scanner, values.language, extra, 5),
    ).toThrow(/currency/);
    extra.Index = 62;
    extra.Usage = 4;
    expect(
      values.table.ImpInsertFormat(values.scanner, values.language, extra, 10001),
    ).not.toBeNull();
    expect(values.table.ImpIsEntry(extra.Code, 10000, 0x0407)).toBe(NUMBERFORMAT_ENTRY_NOT_FOUND);
    expect(values.table.ImpInsertFormat(values.scanner, values.language, extra, -1)).not.toBeNull();
    expect(values.table.GetEntry(0xffffffff)).not.toBeNull();
  } finally {
    emptyCode.dispose();
    extra.dispose();
    title.dispose();
    empty.dispose();
    values.dispose();
  }
});

it("searches the exact start key in numeric order and stops at a different language", /** Source std::map traversal is independent of JavaScript insertion order and does not lower_bound a missing key. @returns Nothing. */ () => {
  const values = tableValues(),
    distinct = unicode("STANDARD"),
    missing = unicode("missing");
  try {
    const other = new NumberFormatCode(values.code);
    try {
      other.Code = distinct;
      expect(
        values.table.ImpInsertFormat(values.scanner, values.language, other, 2),
      ).not.toBeNull();
      expect(
        values.table.ImpInsertFormat(values.scanner, values.language, values.code, 0),
      ).not.toBeNull();
      expect(values.table.ImpIsEntry(distinct, 0, 0x0407)).toBe(2);
      expect(values.table.ImpIsEntry(missing, 0, 0x0407)).toBe(NUMBERFORMAT_ENTRY_NOT_FOUND);
      expect(values.table.ImpInsertFormat(values.scanner, [0x0409], values.code, 1)).not.toBeNull();
      expect(values.table.ImpIsEntry(distinct, 0, 0x0407)).toBe(NUMBERFORMAT_ENTRY_NOT_FOUND);
      expect(values.table.ImpIsEntry(distinct, 2, 0x10407)).toBe(2);
    } finally {
      other.dispose();
    }
  } finally {
    distinct.dispose();
    missing.dispose();
    values.dispose();
  }
});

import { NfEvalDateFormat } from "../../inc/zforlist";
import { SvNFLanguageData } from "./zforlist";

it("owns native language/cache/scanner state and preserves scanner/precision on ChangeIntl", /** Actual service and resources populate the real owner;no fake language data or mapper is used. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    current = new SvNFLanguageData(mapper, 0x0407),
    table = new SvNFFormatData(),
    input = unicode("general");
  try {
    const scanner = current.GetFormatScanner(),
      inputScanner = current.pStringScanner,
      charClass = current.GetCharClass(),
      decimal = current.GetNumDecimalSep(),
      localeData = current.GetLocaleData(),
      locale = current.fields.locale;
    expect(current.GetIniLanguage()).toBe(0x0407);
    expect(current.GetEvalDateFormat()).toBe(NfEvalDateFormat.International);
    expect([
      text(decimal),
      text(current.GetNumDecimalSepAlt()),
      text(current.GetNumThousandSep()),
      text(current.GetDateSep()),
    ]).toEqual([",", "", ".", "."]);
    expect(text(localeData.getNumDecimalSep())).toBe(",");
    expect(text(localeData.getNumThousandSep())).toBe(".");
    expect(current.GetStandardPrec()).toBe(2);
    expect(inputScanner.GetYear2000()).toBe(1950);
    expect(inputScanner.GetNumericsCount()).toBe(0);
    expect(inputScanner.GetDecPos()).toBe(0);
    expect(inputScanner.fields.nMatchedAllStrings).toBe(0x08);
    expect(inputScanner.fields.maNullDate.GetDate()).toBe(18991230);
    inputScanner.SetYear2000(1980);
    current.ChangeStandardPrec(65535);
    current.SetEvalDateFormat(NfEvalDateFormat.InternationalThenFormat);
    expect(current.GetEvalDateFormat()).toBe(2);
    current.ChangeIntl(0x10407);
    expect(current.fields.locale).toBe(locale);
    expect(scanner.ScanFormat(input)).toBe(0);
    expect(text(input)).toBe("Standard");
    current.ChangeIntl(0x0409);
    expect(current.GetIniLanguage()).toBe(0x0407);
    expect(current.GetFormatScanner()).toBe(scanner);
    expect(current.pStringScanner).toBe(inputScanner);
    expect(current.GetCharClass()).not.toBe(charClass);
    expect(text(charClass.getMyLocale().Language)).toBe("de");
    expect(text(current.GetCharClass().getMyLocale().Language)).toBe("en");
    expect(inputScanner.GetYear2000()).toBe(1980);
    expect(current.GetStandardPrec()).toBe(65535);
    expect(scanner.GetResultStringsCnt()).toBe(1);
    expect(current.GetNumDecimalSep()).toBe(decimal);
    expect(current.GetLocaleData()).toBe(localeData);
    expect(text(localeData.getNumDecimalSep())).toBe(".");
    expect(text(localeData.getNumThousandSep())).toBe(",");
    expect([
      text(decimal),
      text(current.GetNumDecimalSepAlt()),
      text(current.GetNumThousandSep()),
      text(current.GetDateSep()),
    ]).toEqual([".", "", ",", "/"]);
    generateStandardNumberFormat(
      table,
      mapper,
      current.fields.locale,
      scanner,
      current.fields.ActLnge,
      current.GetNumDecimalSep(),
      0,
    );
    const entry = table.GetEntry(0) as SvNumberformat,
      out = unicode("");
    try {
      entry.GetOutputString(
        1.25,
        out,
        [null],
        current.GetStandardPrec(),
        current.GetNumDecimalSep().getStr()[0] as number,
      );
      expect(text(out)).toBe("1.25");
    } finally {
      out.dispose();
    }
  } finally {
    table.dispose();
    current.dispose();
    input.dispose();
    mapper.dispose();
  }
});

import { Color } from "../../../tools/inc/color";
import { SvNFEngine, SvNumberFormatter } from "./zforlist";

it("uses the source input-line precision and restores General display precision", /** Checks uses the source input-line precision and restores General display precision. @returns Test completion or assertion result. */ () => {
  const formatter = new SvNumberFormatter(0x0407),
    output = unicode(""),
    color: [Color | null] = [null];
  try {
    formatter.GetOutputString(1.2345, 0, output, color);
    expect(text(output)).toBe("1,23");
    const input = formatter.GetInputLineString(1.2345, 0);
    try {
      expect(text(input)).toBe("1,2345");
    } finally {
      input.dispose();
    }
    expect(formatter.GetStandardPrec()).toBe(2);
    formatter.GetOutputString(1.2345, 0, output, color);
    expect(text(output)).toBe("1,23");
  } finally {
    output.dispose();
    formatter.dispose();
  }
});

it("generates and dispatches the source Boolean and Text standard formats", /** Checks generates and dispatches the source Boolean and Text standard formats. @returns Test completion or assertion result. */ () => {
  const formatter = new SvNumberFormatter(0x0407),
    output = unicode(""),
    literal = unicode("CSV text"),
    color: [Color | null] = [null];
  try {
    expect(text((formatter.GetEntry(99) as SvNumberformat).GetFormatstring())).toBe("LOGISCH");
    expect(text((formatter.GetEntry(100) as SvNumberformat).GetFormatstring())).toBe("@");
    expect(formatter.GetType(99)).toBe(SvNumFormatType.LOGICAL);
    expect(formatter.GetType(100)).toBe(SvNumFormatType.TEXT);
    formatter.GetOutputString(1, 99, output, color);
    expect(text(output)).toBe("WAHR");
    formatter.GetOutputString(0, 99, output, color);
    expect(text(output)).toBe("FALSCH");
    formatter.GetOutputString(1.2345, 100, output, color);
    expect(text(output)).toBe("1,23");
    formatter.ChangeStandardPrec(65535);
    formatter.GetOutputString(1e-10, 100, output, color);
    expect(text(output)).toBe("0,0000000001");
    formatter.ChangeStandardPrec(2);
    formatter.GetOutputString(literal, 100, output, color);
    expect(text(output)).toBe("CSV text");
    color[0] = new Color(0x123456);
    formatter.GetOutputString(literal, 404, output, color);
    expect(text(output)).toBe("CSV text");
    expect(color[0]).toBeNull();
    const input = formatter.GetInputLineString(1.2345, 100);
    try {
      expect(text(input)).toBe("1,23");
    } finally {
      input.dispose();
    }
  } finally {
    formatter.dispose();
    output.dispose();
    literal.dispose();
  }
});

it("composes actual formatter providers,language,parsed table,settings and numeric/string output", /** Real owned source graph is constructed rather than a fake formatter or parsed-state fixture. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x0407),
    fallback = new SvNumberFormatter(0x03ff),
    out = unicode("previous"),
    literal = unicode("actual text"),
    oldColor = new Color(0x123456),
    color: [Color | null] = [oldColor];
  try {
    const entry = formatter.GetEntry(0) as SvNumberformat;
    expect(text(entry.GetFormatstring())).toBe("Standard");
    expect(entry.GetLastInsertKey()).toBe(100);
    expect(formatter.GetType(0x100000000)).toBe(16);
    expect(formatter.GetStandardPrec()).toBe(2);
    formatter.GetOutputString(1.2345, 0, out, color);
    expect(text(out)).toBe("1,23");
    expect(color[0]).toBeNull();
    formatter.ChangeStandardPrec(65535);
    formatter.SetEvalDateFormat(NfEvalDateFormat.InternationalThenFormat);
    formatter.GetOutputString(1e-10, 0, out, color, true);
    expect(text(out)).toBe("1E-10");
    expect(formatter.GetNoZero()).toBe(false);
    formatter.SetNoZero(true);
    expect(formatter.GetNoZero()).toBe(true);
    color[0] = oldColor;
    formatter.GetOutputString(-0, 0, out, color);
    expect(text(out)).toBe("");
    expect(color[0]).toBe(oldColor);
    formatter.GetOutputString(1.25, 0, out, color);
    expect(text(out)).toBe("1,25");
    expect(color[0]).toBeNull();
    formatter.GetOutputString(literal, 0, out, color);
    expect(text(out)).toBe("actual text");
    formatter.GetOutputString(out, 0, out, color);
    expect(text(out)).toBe("actual text");
    expect(formatter.GetNullDate().GetDate()).toBe(18991230);
    const nullDate = formatter.GetNullDate();
    formatter.ChangeNullDate(32, 2, 1999);
    expect(formatter.GetNullDate()).toBe(nullDate);
    expect(nullDate.GetDate()).toBe(19990304);
    formatter.ChangeNullDate(1, 1, 2000);
    expect(nullDate.GetDate()).toBe(20000101);
    expect(formatter.GetYear2000()).toBe(1950);
    formatter.SetYear2000(65536 + 1980);
    expect(formatter.GetYear2000()).toBe(1980);
    expect(
      /** Original scanner assertion retains the prior valid field. @returns Nothing. */ () =>
        formatter.ChangeNullDate(0, 0, 0),
    ).toThrow(/valid null/);
    expect(formatter.GetNullDate().GetDate()).toBe(20000101);
    expect(formatter.GetEntry(1)).toBeNull();
    expect(formatter.GetType(1)).toBe(SvNumFormatType.UNDEFINED);
    fallback.ChangeStandardPrec(65535);
    fallback.GetOutputString(1.25, 0, out, color);
    expect(text(out)).toBe("1.25");
  } finally {
    fallback.dispose();
    formatter.dispose();
    out.dispose();
    literal.dispose();
  }
  expect(
    /** Real prefix admission failure executes native-owner cleanup. @returns Owned formatter. */ () =>
      new SvNumberFormatter(0x0455),
  ).toThrow(/not implemented/);
});

it("keeps real engine fallback and separately represented input/format null-date fields", /** Invalid/default table states are real native owners,not formatter service test doubles. @returns Nothing. */ () => {
  const values = tableValues(),
    current = new SvNFLanguageData(values.mapper, 0x0407),
    out = unicode(""),
    textValue = unicode("literal"),
    color: [Color | null] = [null];
  try {
    expect(
      /** An absent required format0 is an invalid source state. @returns Nothing. */ () =>
        SvNFEngine.GetOutputString(current, values.table, 1, 0, out, color),
    ).toThrow(/absent/);
    expect(
      /** Rejects missing text-format fallback before producing output. @returns Nothing. */ () =>
        SvNFEngine.GetOutputString(current, values.table, textValue, 404, out, color),
    ).toThrow("Required native standard text format is absent");
    expect(
      /** Rejects missing numeric fallback in input-line conversion. @returns No owned output. */ () =>
        SvNFEngine.GetInputLineString(current, values.table, 1, 404),
    ).toThrow("Required native standard format0 is absent");
    generateStandardNumberFormat(
      values.table,
      values.mapper,
      values.locale,
      values.scanner,
      values.language,
      values.decimal,
      0,
    );
    SvNFEngine.GetOutputString(current, values.table, 1.2345, 404, out, color);
    expect(text(out)).toBe("1,23");
    const entry = values.table.GetEntry(0) as SvNumberformat;
    entry.SetType(2);
    SvNFEngine.GetOutputString(current, values.table, textValue, 0, out, color);
    expect(text(out)).toBe("literal");
    const precision = current.GetStandardPrec();
    expect(
      /** Exercises temporary output cleanup on an unrepresented numeric type. @returns No owned output. */ () =>
        SvNFEngine.GetInputLineString(current, values.table, 1.2345, 0),
    ).toThrow("SvNumberformat nonstandard output is not implemented");
    expect(current.GetStandardPrec()).toBe(precision);
    entry.SetType(16);
    SvNFEngine.ChangeNullDate(current, 32, 2, 1999);
    expect(current.GetNullDate().GetDate()).toBe(19990304);
    expect(current.pStringScanner.fields.maNullDate.GetDate()).toBe(19990232);
  } finally {
    current.dispose();
    out.dispose();
    textValue.dispose();
    values.dispose();
  }
});
