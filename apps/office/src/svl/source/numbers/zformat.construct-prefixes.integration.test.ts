/** @fileoverview Original constructor prefix contracts using real formatter, input scanner and compiled subformat owners. */
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { SvNumFormatType as T } from "../../inc/zforlist";
import { SvNumberFormatter } from "./zforlist";
import { type ImpSvNumFor, SvNumberformat } from "./zformat";

/** Reads an existing compiled section without modifying its metadata. @param format - Actual owner. @param index - Native section index. @returns Existing section. */
function section(format: SvNumberformat, index: number): ImpSvNumFor {
  const result = format["NumFor"][index];
  if (!result) throw new Error("Missing original compiled section");
  return result;
}

/** Compiles through the actual normal constructor and releases its complete owner graph. @param source - Caller pattern. @param inspect - Assertions on original owners and result references. @param language - Original initial language. @param replaceBoolean - Actual constructor option. @param target - Optional actual scanner conversion target. @returns Nothing. */
function compiled(
  source: string,
  inspect: (format: SvNumberformat, check: number, code: string, language: number) => void,
  language = 0x409,
  replaceBoolean = true,
  target?: number,
): void {
  const formatter = new SvNumberFormatter(language),
    scanner = formatter["m_aCurrentLanguage"].GetFormatScanner(),
    code = unicode(source),
    check: [number] = [0],
    locale: [number] = [language];
  try {
    if (target !== undefined) scanner.SetConvertMode(language, target, false, false);
    const format = new SvNumberformat(
      code,
      scanner,
      scanner.GetCurrentLanguageData().pStringScanner,
      formatter.GetNatNum(),
      check,
      locale,
      replaceBoolean,
    );
    try {
      inspect(format, check[0], text(code), locale[0]);
    } finally {
      format.dispose();
    }
  } finally {
    code.dispose();
    formatter.dispose();
  }
}

it.each(
  Array.from(
    { length: 20 },
    /** Enumerates the original supported modifier inputs. @param _ - Unused source input. @param number - Source modifier number. @returns Supported modifier value. */ (
      _,
      number,
    ) => number,
  ),
)(
  "compiles explicit NatNum%i including zero and the default NatNum12 parameter",
  /** Native zformat.cxx defaults NatNum12 to cardinal; every other supported modifier has no parameters. @param number - Supported modifier. @returns Nothing. */ (
    number,
  ) => {
    compiled(
      `[natnum${number}]0`,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
        format,
        check,
        code,
      ) => {
        const modifier = section(format, 0).GetNatNum();
        expect(check).toBe(0);
        expect(modifier.IsComplete()).toBe(true);
        expect(modifier.GetNatNum()).toBe(number);
        expect(modifier.GetLang()).toBe(0x409);
        expect(text(modifier.GetParams())).toBe(number === 12 ? "cardinal" : "");
        expect(code).toBe(number === 12 ? "[NatNum12 cardinal]0" : `[NatNum${number}]0`);
        expect(format.GetType()).toBe(T.NUMBER);
      },
    );
  },
);

it.each(
  Array.from(
    { length: 9 },
    /** Enumerates the original supported modifier inputs. @param _ - Unused source input. @param index - Ordered input index. @returns Supported modifier value. */ (
      _,
      index,
    ) => index + 1,
  ),
)(
  "retains DBNum%i separately from the mapped native modifier",
  /** DBNum metadata is preserved even when a language has no numeric mapping. @param number - Supported DBNum. @returns Nothing. */ (
    number,
  ) => {
    compiled(
      `[dbnum${number}]0`,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
        format,
        check,
        code,
      ) => {
        const modifier = section(format, 0).GetNatNum();
        expect(check).toBe(0);
        expect(code).toBe(`[DBNum${number}]0`);
        expect(modifier.GetDBNum()).toBe(number);
        expect(modifier.GetNatNum()).toBe(0);
        expect(modifier.IsComplete()).toBe(true);
      },
    );
  },
);

it.each([
  ["USD", true],
  ["USD cardinal", true],
  ["cardinal USD", true],
  ["cardinal USD ordinal", true],
  ["US", false],
  ["USDX", false],
  ["xUSD", false],
  ["USD=cardinal", false],
  ["NNN=cardinal", false],
  ["cardinal", false],
  ["usd", false],
] as const)(
  "classifies NatNum12 parameter %s by the original isolated bank-code rule",
  /** Native lcl_isNatNum12Currency explicitly excludes date assignments such as NNN=. @param params - Original spelling parameters. @param currency - Source classification. @returns Nothing. */ (
    params,
    currency,
  ) => {
    compiled(
      `[NatNum12 ${params}]0`,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @returns Nothing. */ (
        format,
        check,
      ) => {
        expect(check).toBe(0);
        expect(text(section(format, 0).GetNatNum().GetParams())).toBe(params);
        expect(format.GetType()).toBe(currency ? T.CURRENCY : T.NUMBER);
      },
    );
  },
);

it.each([
  ["[>]0", 0],
  ["[>bogus]0", 0],
  ["[>1e2]0", 100],
  ["[>-2.5]0", -2.5],
] as const)(
  "compiles condition %s with the original input scanner or zero fallback",
  /** Missing or nonnumeric condition values become zero before actual format scanning. @param source - Caller condition. @param limit - Native scalar limit. @returns Nothing. */ (
    source,
    limit,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @returns Nothing. */ (
        format,
        check,
      ) => {
        expect(check).toBe(0);
        expect(format["fLimit1"]).toBe(limit);
        expect(section(format, 0).Info().eScannedType).toBe(T.NUMBER);
        expect(section(format, 1).GetCount()).toBeGreaterThan(0);
      },
    );
  },
);

it.each(["[>1]", "[>1]0", "[>1]0;[<2]0"])(
  "materializes the implicit General fallback for %s",
  /** The source constructor fills the omitted conditional fallback with its real standard-name scan. @param source - Conditional pattern. @returns Nothing. */ (
    source,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
        format,
        check,
        code,
      ) => {
        expect(check).toBe(0);
        const index = source === "[>1]" ? 0 : source.includes(";") ? 2 : 1;
        expect(section(format, index).Info().nTypeArray[0]).toBe(K.GENERAL);
        expect(code.endsWith("General")).toBe(true);
      },
    );
  },
);

it.each([
  ["[$-F400]HH:MM", T.TIME, true],
  ["[$-F400]0", T.TIME, false],
  ["[$-F800]YYYY-MM-DD", T.DATE, true],
  ["[$-F800]0", T.DATE, false],
] as const)(
  "validates the actual substituted system format %s",
  /** F400 and F800 retain substitution metadata and require their respective compiled token type. @param source - Original substitution prefix. @param type - Required type. @param valid - Whether token types agree. @returns Nothing. */ (
    source,
    type,
    valid,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @returns Nothing. */ (
        format,
        check,
      ) => {
        expect(format.IsSubstituted()).toBe(true);
        expect(format.IsSystemTimeFormat()).toBe(type === T.TIME);
        expect(format.IsSystemLongDateFormat()).toBe(type === T.DATE);
        if (valid) {
          expect(check).toBe(0);
          expect(format.GetType()).toBe(type);
        } else expect(check).toBeGreaterThan(0);
      },
    );
  },
);

it("retains an unavailable locale code while continuing with actual installed locale data", /** An unavailable first prefix is metadata, whereas the original language and real scanner resources stay usable. @returns Nothing. */ () => {
  compiled(
    "[$-7777]0",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @param language - Original returned language. @returns Nothing. */ (
      format,
      check,
      code,
      language,
    ) => {
      expect(check).toBe(0);
      expect(language).toBe(0x409);
      expect(format.GetLanguage()).toBe(0x409);
      expect(code).toBe("[$-7777]0");
      expect(section(format, 0).GetNatNum().GetLang()).toBe(0x7777);
    },
  );
});

it.each([
  "[RED][BLUE]0",
  "[NatNum1][NatNum2]0",
  "[DBNum1][DBNum2]0",
  "[NatNum1][DBNum1]0",
  "[DBNum1][NatNum1]0",
  "[NatNum1 cardinal]0",
  "0;[>1]0",
  "[>1][<2]0",
  "[>1]0;[<2]0;[=3]0",
  "[$-409][$-407]0",
  "[$-409",
  "[$-3FF]0",
  "[notacolor]0",
  "[>1",
  "[<<1]0",
  "]",
] as const)(
  "rejects incompatible or repeated prefix positions in %s",
  /** Conditions belong only to the first two sections and modifier families share one actual metadata owner. @param source - Invalid pattern. @returns Nothing. */ (
    source,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param _format - Actual compiled entry. @param check - Original error-position result. @returns Nothing. */ (
        _format,
        check,
      ) => {
        expect(check).toBeGreaterThan(0);
      },
    );
  },
);

it.each([
  ["[$-409]0", "0", 0x409],
  ["[$-407]0", "0", 0x407],
  ["[$-411]0", "0", 0x411],
] as const)(
  "consumes installed plain locale %s into the actual entry metadata",
  /** A plain installed prefix is removed after the scanner language switches. @param source - Locale-qualified pattern. @param normalized - Source normalized pattern. @param language - Stored language. @returns Nothing. */ (
    source,
    normalized,
    language,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @param resultLanguage - Original returned language. @returns Nothing. */ (
        format,
        check,
        code,
        resultLanguage,
      ) => {
        expect(check).toBe(0);
        expect(code).toBe(normalized);
        expect(resultLanguage).toBe(language);
        expect(format.GetLanguage()).toBe(language);
        expect(section(format, 0).GetNatNum().GetLang()).toBe(language);
      },
    );
  },
);

it.each([
  ["[$-030411]YYYY", 0x411, T.DATE],
  ["[$-07041E]YYYY", 0x41e, T.DATE],
  ["[$-0D00041E]0", 0x41e, T.NUMBER],
] as const)(
  "connects extended locale calendar and numeral insertion for %s",
  /** Source extended LCIDs select actual scanner resources before compiling inserted calendar or NatNum modifiers. @param source - Extended locale pattern. @param language - Source-selected installed language. @param type - Compiled token type. @returns Nothing. */ (
    source,
    language,
    type,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param _code - Normalized counted pattern. @param resultLanguage - Original returned language. @returns Nothing. */ (
        format,
        check,
        _code,
        resultLanguage,
      ) => {
        expect(check).toBe(0);
        expect(resultLanguage).toBe(language);
        expect(format.GetLanguage()).toBe(language);
        expect(format.GetType()).toBe(type);
        if (source === "[$-0D00041E]0") {
          expect(section(format, 0).GetNatNum().GetNatNum()).toBe(1);
          expect(section(format, 0).GetNatNum().GetLang()).toBe(language);
        }
      },
    );
  },
);

it("recognizes the actual Thai T modifier and adds native-number language metadata", /** Source scanner T shorthand becomes NatNum1 with Thai locale metadata in the normal constructor. @returns Nothing. */ () => {
  compiled(
    "T0",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
      format,
      check,
      code,
    ) => {
      expect(check).toBe(0);
      expect(format.GetType()).toBe(T.NUMBER);
      expect(section(format, 0).GetNatNum().GetNatNum()).toBe(1);
      expect(section(format, 0).GetNatNum().GetLang()).toBe(0x41e);
      expect(code).toBe("[$-41E][NatNum1]0");
    },
    0x41e,
  );
});

it("moves a final third text section to the actual fourth slot and clears its implicit condition", /** The original constructor places an inherited final text subformat at index3 regardless of its input position. @returns Nothing. */ () => {
  compiled(
    "0;0;@",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @returns Nothing. */ (
      format,
      check,
    ) => {
      expect(check).toBe(0);
      expect(format["eOp2"]).toBe(0);
      expect(section(format, 2).GetCount()).toBe(0);
      expect(section(format, 3).Info().eScannedType).toBe(T.TEXT);
      expect(format.HasTextFormat()).toBe(true);
    },
  );
});

it("keeps mixed numeric/date sections as a defined composite and enforces a fourth text section", /** Section token types differ while the enclosing entry preserves the source DEFINED classification. @returns Nothing. */ () => {
  compiled(
    "0;YYYY;0;0",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @returns Nothing. */ (
      format,
      check,
    ) => {
      expect(check).toBe(0);
      expect(format.GetType()).toBe(T.DEFINED);
      expect(section(format, 1).Info().eScannedType).toBe(T.DATE);
      expect(section(format, 3).Info().eScannedType).toBe(T.TEXT);
    },
  );
});

it("preserves the original empty-section treatment of an unterminated color-only prefix", /** ImpNextSymbol stops at EOF with its COLOR classification; the constructor accepts the real palette item then consumes an empty format. @returns Nothing. */ () => {
  compiled(
    "[RED",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
      format,
      check,
      code,
    ) => {
      expect(check).toBe(0);
      expect(code).toBe("[RED");
      expect(section(format, 0).GetColor()).not.toBeNull();
      expect(section(format, 0).Info().eScannedType).toBe(T.EMPTY);
      expect(section(format, 0).GetCount()).toBe(0);
    },
  );
});

it("compiles with the original Boolean replacement option explicitly disabled", /** Public construction must honor false while preserving ordinary numeric token compilation. @returns Nothing. */ () => {
  compiled(
    "0.00",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
      format,
      check,
      code,
    ) => {
      expect(check).toBe(0);
      expect(code).toBe("0.00");
      expect(format.GetType()).toBe(T.NUMBER);
    },
    0x409,
    false,
  );
});

it.each([
  [0x407, 0x409, "[>1,5]0;[<2,5]0"],
  [0x409, 0x809, "[>1.5]0;[<2.5]0"],
] as const)(
  "converts both actual condition values from language %i to %i",
  /** Repeated conditions reuse the actual target decimal separator, including an unchanged separator between English locales. @param from - Source language. @param to - Target language. @param source - Source code. @returns Nothing. */ (
    from,
    to,
    source,
  ) => {
    compiled(
      source,
      /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @param language - Original returned language. @returns Nothing. */ (
        format,
        check,
        code,
        language,
      ) => {
        expect(check).toBe(0);
        expect(language).toBe(to);
        expect([format["fLimit1"], format["fLimit2"]]).toEqual([1.5, 2.5]);
        expect(code).toBe("[>1.5]0;[<2.5]0;General");
      },
      from,
      true,
      to,
    );
  },
);

it("normalizes the real French nonbreaking grouping separator through the constructor", /** Pinned locale resources use U+00A0, which the constructor scans as space and restores from actual locale data. @returns Nothing. */ () => {
  compiled(
    "#\u00a0##0",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
      format,
      check,
      code,
    ) => {
      expect(check).toBe(0);
      expect(format.GetType()).toBe(T.NUMBER);
      expect(code).toBe("#\u00a0##0");
    },
    0x40c,
  );
});

it("preserves explicit empty numeric and text sections after two numeric sections", /** Source trailing-semicolon handling marks the final text slot even when it has no tokens. @returns Nothing. */ () => {
  compiled(
    "0;0;;",
    /** Checks the original compiled entry and caller-visible results. @param format - Actual compiled entry. @param check - Original error-position result. @param code - Normalized counted pattern. @returns Nothing. */ (
      format,
      check,
      code,
    ) => {
      expect(check).toBe(0);
      expect(code).toBe("0;0;;");
      expect(section(format, 2).Info().eScannedType).toBe(T.EMPTY);
      expect(section(format, 3).Info().eScannedType).toBe(T.TEXT);
    },
  );
});

it.each([
  ["0E+", 3],
  ["# ?/000000000", 14],
  ["*x0*y", 5],
] as const)(
  "propagates the original scanner error position when constructing %s",
  /** Expected positions are the unchanged compiled F observations in format-scan.native-observations.json for en_US with AllowEnglish; constructor starts this token at offset0. This does not claim a native full-constructor witness. @param source - Independently observed malformed token. @param position - Original scanner position. @returns Nothing. */ (
    source,
    position,
  ) => {
    compiled(
      source,
      /** Checks propagation through the actual constructor. @param _format - Actual compiled owner. @param check - Constructor error reference. @returns Nothing. */ (
        _format,
        check,
      ) => {
        expect(check).toBe(position);
      },
    );
  },
);
