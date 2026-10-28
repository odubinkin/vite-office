/** @fileoverview Original bracket-prefix state machine over actual scanner, locale and SAL owners. */
import { createNumberFormatLanguage } from "../../../test/number-format-language";
import { expect, it } from "vitest";
import { NumberFormatCodeMapper } from "../../../i18npool/inc/numberformatcode";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { matchIgnoreAsciiCase } from "../../../o3tl/inc/string_view";
import { rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength } from "../../../sal/inc/rtl/ustring.h";

import {
  ImpNextSymbol,
  ImpGetNumber,
  IsCombiningSymbol,
  lcl_SvNumberformat_IsBracketedPrefix,
} from "./zformat.prefix";
it.each([
  ["[NatNum0]General", -14, "NatNum0", 9],
  ["[natnum1]General", -15, "natnum1", 9],
  ["[NatNum19 ordinal-number]0", -33, "NatNum19 ordinal-number", 25],
  ["[NatNum20]0", -2, "NatNum20", 10],
  ["[NatNumfoo]0", -14, "NatNumfoo", 11],
  ["[DBNum1]0", -4, "DBNum1", 8],
  ["[DBNum9]0", -12, "DBNum9", 8],
  ["[DBNum10]0", -2, "DBNum10", 9],
  ["[$-409]0", -13, "$-409", 7],
  ["[RED]0", -2, "RED", 5],
  ["[HH]:MM;@", -1, "[HH]:MM", 8],
  ["[~gregorian]YYYY;@", -1, "[~gregorian]YYYY", 17],
  ["[<=12]0", 4, "<=", 3],
  ["[<>12]0", 2, "<>", 3],
  ["[>=12]0", 6, ">=", 3],
  ["[<<12]0", -3, "<", 3],
  ["]0", -3, "", 1],
  [";@", -1, "", 1],
  ['"a;b"0;@', -1, '"a;b"0', 7],
  [String.raw`0\;x;@`, -1, String.raw`0\;x`, 5],
  [String.raw`0\\;@`, -1, String.raw`0\\`, 4],
] as const)(
  "retains source prefix token, cursor and payload for %s",
  /** Checks the unmodified state-machine rules. @param source - Input format. @param expectedType - Native token. @param expectedText - Native payload. @param expectedPosition - Native cursor. @returns Nothing. */ (
    source,
    expectedType,
    expectedText,
    expectedPosition,
  ) => {
    const mapper = new NumberFormatCodeMapper(),
      language = createNumberFormatLanguage(mapper, 0x0409),
      input = unicode(source),
      buffer = new OUStringBuffer(input),
      symbol = new OUString(),
      position: [number] = [0];
    try {
      expect(ImpNextSymbol(language.GetFormatScanner(), buffer, position, symbol)).toBe(
        expectedType,
      );
      expect(text(symbol)).toBe(expectedText);
      expect(position[0]).toBe(expectedPosition);
      expect(lcl_SvNumberformat_IsBracketedPrefix(expectedType)).toBe(
        expectedType > 0 || (expectedType <= -2 && expectedType !== -3),
      );
    } finally {
      symbol.dispose();
      buffer.dispose();
      input.dispose();
      language.dispose();
      mapper.dispose();
    }
  },
);
it("removes only original prefix and condition ASCII spaces and preserves the closing-bracket cursor", /** Mutations apply to the actual buffer rather than a detached parsed string. @returns Nothing. */ () => {
  const mapper = new NumberFormatCodeMapper(),
    language = createNumberFormatLanguage(mapper, 0x0409),
    input = unicode("  [ < =  1 2 ]0"),
    buffer = new OUStringBuffer(input),
    symbol = new OUString(),
    position: [number] = [0];
  try {
    expect(ImpNextSymbol(language.GetFormatScanner(), buffer, position, symbol)).toBe(4);
    expect(text(symbol)).toBe("<=");
    expect(position[0]).toBe(3);
    expect(ImpGetNumber(buffer, position, symbol)).toBe(2);
    expect(text(symbol)).toBe("12");
    expect(position[0]).toBe(5);
    expect(buffer.charAt(position[0])).toBe(93);
    const result = buffer.toString();
    try {
      expect(text(result)).toBe("[<=12]0");
    } finally {
      result.dispose();
    }
  } finally {
    symbol.dispose();
    buffer.dispose();
    input.dispose();
    language.dispose();
    mapper.dispose();
  }
});
it("keeps original combining-unit parity and exact ASCII-only comparator differences", /** No Unicode case folding or JavaScript numeric parser is involved. @returns Nothing. */ () => {
  for (let count = 0; count < 8; ++count) {
    const input = unicode("0" + "\\*_".repeat(count)),
      buffer = new OUStringBuffer(input);
    try {
      expect(IsCombiningSymbol(buffer, buffer.getLength() - 1)).toBe(Boolean(count % 2));
    } finally {
      buffer.dispose();
      input.dispose();
    }
  }
  const first = unicode("NaTnUm19"),
    second = unicode("NATNUM");
  try {
    expect(matchIgnoreAsciiCase(first.subView(0), second.subView(0))).toBe(true);
    expect(
      rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength(
        Uint16Array.of(65),
        1,
        Uint16Array.of(90),
        1,
        1,
      ),
    ).toBe(-25);
    expect(
      rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength(
        Uint16Array.of(0, 65),
        2,
        Uint16Array.of(0, 97),
        2,
        2,
      ),
    ).toBe(0);
    expect(
      rtl_ustr_shortenedCompareIgnoreAsciiCase_WithLength(
        Uint16Array.of(0x00c4),
        1,
        Uint16Array.of(0x00e4),
        1,
        1,
      ),
    ).toBe(-32);
  } finally {
    second.dispose();
    first.dispose();
  }
});
