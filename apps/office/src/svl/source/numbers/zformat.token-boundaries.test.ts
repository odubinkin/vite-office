/** @fileoverview Native compiled-format token boundaries independent of the unported arbitrary format parser. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import type { OUString } from "../../../sal/inc/rtl/ustring";
import { DateOrder } from "../../../unotools/source/i18n/localedatawrapper";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { NfSymbolType as S } from "../../inc/nfsymbol";
import { SvNumFormatType as Type } from "../../inc/zforlist";

import { ImpSvNumFor, SvNumberformat } from "./zformat";

/** Assigns actual compiled token owners without adding a format-code parser. @param section - Native owner. @param tokens - Explicit token fixture. @returns Nothing. */
function tokens(section: ImpSvNumFor, tokens: readonly (readonly [number, string])[]): void {
  section.Enlarge(tokens.length);
  for (const [index, [type, content]] of tokens.entries()) {
    section.Info().nTypeArray[index] = type;
    const value = unicode(content);
    try {
      (section.Info().sStrArray[index] as OUString).assign(value);
    } finally {
      value.dispose();
    }
  }
}

it("accepts complete minute-second token sequences and rejects misplaced delimiters or digits", /** Checks original bracket and separator state using actual native compiled token storage. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(
    code,
    language.GetFormatScanner(),
    language.GetFormatScanner().GetCurrentLanguageData().pStringScanner,
    language.GetFormatScanner().getColorCallback().GetNatNum(),
    [0],
    [0x0409],
  );
  const first = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  const minute = [K.MI, "M"] as const,
    second = [K.S, "S"] as const,
    sep = [S.TIMESEP, ":"] as const;
  const left = [S.DEL, "["] as const,
    right = [S.DEL, "]"] as const;
  const cases: [(readonly [number, string])[], boolean][] = [
    [[], false],
    [[[S.DEL, "[]"]], false],
    [[[S.DEL, "?"]], false],
    [[right], false],
    [[minute, minute], false],
    [[second], false],
    [[sep], false],
    [[minute, [S.DIGIT, "0"]], false],
    [[minute, left], false],
    [[minute, sep, minute], false],
    [[minute, sep, second, sep], false],
    [[minute, sep, second, left], false],
    [[minute, sep, second, right], false],
    [[minute, sep, second, [S.DATESEP, "/"]], false],
    [[minute, [S.TIME100SECSEP, "."]], false],
    [[minute, sep, second, [S.TIME100SECSEP, "."], [S.DIGIT, "00"]], true],
    [[left, minute, right, sep, second], true],
    [[minute, sep, left, second, right], true],
    [[minute, sep, second, [S.STRING, " seconds"]], true],
  ];
  try {
    format.SetType(Type.TIME);
    for (const [sequence, expected] of cases) {
      tokens(first, sequence);
      expect(format.IsMinuteSecondFormat(), JSON.stringify(sequence)).toBe(expected);
    }
  } finally {
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});

it("retains every native date-token alias and ignores literal tokens in packed date order", /** Checks compiled aliases without translating them into a separate date engine. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(
    code,
    language.GetFormatScanner(),
    language.GetFormatScanner().GetCurrentLanguageData().pStringScanner,
    language.GetFormatScanner().getColorCallback().GetNatNum(),
    [0],
    [0x0409],
  );
  const first = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  try {
    format.SetType(Type.DATE);
    for (const [aliases, order, packed] of [
      [[K.D, K.DD], DateOrder.DMY, 68],
      [[K.M, K.MM, K.MMM, K.MMMM, K.MMMMM], DateOrder.MDY, 77],
      [[K.YY, K.YYYY, K.EC, K.EEC, K.R, K.RR], DateOrder.YMD, 89],
    ] as const) {
      for (const alias of aliases) {
        tokens(first, [
          [S.STRING, "literal"],
          [alias, "token"],
        ]);
        expect(format.GetDateOrder(), String(alias)).toBe(order);
        expect(format.GetExactDateOrder(), String(alias)).toBe(packed);
      }
    }
    tokens(first, [[S.STRING, "literal"]]);
    expect(format.GetDateOrder()).toBe(DateOrder.MDY);
    expect(format.GetExactDateOrder()).toBe(0);
  } finally {
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});

it("retains fourth-subformat text literals while ignoring star and blank modifiers", /** Checks original text rendering, absent text sections and non-text section admission. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(
    code,
    language.GetFormatScanner(),
    language.GetFormatScanner().GetCurrentLanguageData().pStringScanner,
    language.GetFormatScanner().getColorCallback().GetNatNum(),
    [0],
    [0x0409],
  );
  const section = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[3] as ImpSvNumFor;
  const input = unicode("Value"),
    output = unicode("unchanged");
  try {
    format.GetOutputString(input, output, [null]);
    expect(text(output)).toBe("unchanged");
    tokens(section, [
      [S.STRING, "prefix:"],
      [S.DEL, "@"],
      [S.STAR, "*"],
      [S.BLANK, "_"],
      [S.STRING, ":suffix"],
    ]);
    section.Info().eScannedType = Type.TEXT;
    format.GetOutputString(input, output, [null]);
    expect(text(output)).toBe("prefix:Value:suffix");
    section.Info().eScannedType = Type.NUMBER;
    format.GetOutputString(input, output, [null]);
    expect(text(output)).toBe("");
  } finally {
    input.dispose();
    output.dispose();
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});

it("rejects out-of-range literal sections and recognizes only edge negative signs", /** Checks native token-search failure and source edge-space handling. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper();
  const language = createNumberFormatLanguage(mapper, 0x0409);
  const code = unicode("General");
  const format = new SvNumberformat(
    code,
    language.GetFormatScanner(),
    language.GetFormatScanner().GetCurrentLanguageData().pStringScanner,
    language.GetFormatScanner().getColorCallback().GetNatNum(),
    [0],
    [0x0409],
  );
  const first = (format as unknown as { NumFor: ImpSvNumFor[] }).NumFor[0] as ImpSvNumFor;
  try {
    tokens(first, [[S.DIGIT, "0"]]);
    expect(format.GetNumForString(4, 0)).toBeNull();
    expect(format.GetNumForString(0, 0xffff, true)).toBeNull();
    expect(format.GetNumForString(0, 2)).toBeNull();
    expect(format.IsNumForStringElementCountEqual(4, 0, 0)).toBe(false);
    expect(format.IsNumForStringElementCountEqual(0, 2, 1)).toBe(false);
    for (const [source, negative] of [
      ["", false],
      ["   ", false],
      ["word- ", true],
      ["word - word", false],
    ] as const) {
      const value = unicode(source);
      try {
        expect(SvNumberformat.HasStringNegativeSign(value), source).toBe(negative);
      } finally {
        value.dispose();
      }
    }
  } finally {
    format.dispose();
    code.dispose();
    language.dispose();
    mapper.dispose();
  }
});
