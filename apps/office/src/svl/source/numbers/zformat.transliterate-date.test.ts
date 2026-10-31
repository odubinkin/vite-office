/** @fileoverview Original formatter keyword/argument selection with actual locale, keyword, NatNum and native-number owners; does not certify pending mode12 service/bootstrap. */
import { expect, it, vi } from "vitest";
import { SvNumberFormatter } from "./zforlist";
import * as dateTransliteration from "./zformat.transliterate-date";
import { SvNumberNatNum } from "./zformat.natnum";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { impTransliterate, impTransliterateImpl } from "./zformat.transliterate";

it.each([
  ["cardinal", "cardinal"],
  ["", ""],
  ["YYYY=ordinal", "ordinal"],
  ["MMMM=article,YYYY=title ordinal,D=ordinal-number", "title ordinal"],
  ["YYYY= first ,YYYY=second", " first "],
  ["YYYY=", ""],
  ["YYYY=a=b", "a=b"],
  ["xYYYY=skip YYYY=keep", "keep"],
  ["xYYYY=skip,YYYY=keep", "keep"],
  ["xYYYY=skip, YYYY=keep", "keep"],
  ["YYYY=😀\u0000suffix, D=other", "😀\u0000suffix"],
  ["yyyy=wrong", null],
  ["YYYY =wrong", null],
  ["YYYY\t=wrong", null],
  ["xYYYY=wrong", null],
  ["\tYYYY=wrong", null],
  [";YYYY=wrong", null],
  ["\nYYYY=wrong", null],
  ["MMMM=other", null],
  ["a=b", null],
] as const)(
  "preserves source keyword selection for %s",
  /** Actual mode3 conversion makes service invocation observable independently of parameter recording. @param params - Original parameters. @param argument - Selected source argument or absent keyword. @returns Nothing. */ (
    params,
    argument,
  ) => {
    const formatter = new SvNumberFormatter(0x409),
      number = new SvNumberNatNum(),
      input = unicode("12"),
      parameter = unicode(params),
      native = formatter.GetNatNum(),
      original = native.getNativeNumberStringParams.bind(native),
      observed: { language: string; argument: string }[] = [],
      conversion = vi.spyOn(native, "getNativeNumberStringParams").mockImplementation(
        /** Copies borrowed arguments while live, then executes the actual conversion. @param value - Input. @param locale - Modifier locale. @param mode - Native mode. @param params - Selected argument. @returns Actual service result. */ (
          value,
          locale,
          mode,
          params,
        ) => {
          observed.push({ language: text(locale.Language), argument: text(params) });
          return original(value, locale, mode, params);
        },
      );
    try {
      number.SetNum(3, false);
      number.SetLang(0x411);
      number.SetParams(parameter);
      const output = dateTransliteration.impTransliterate(
        input,
        number,
        K.YYYY,
        native,
        formatter["m_aCurrentLanguage"],
      );
      try {
        expect(text(output)).toBe(argument === null ? "12" : "１２");
        expect(conversion).toHaveBeenCalledTimes(argument === null ? 0 : 1);
        if (argument !== null) {
          const call = conversion.mock.calls[0];
          expect(call?.[0]).toBe(input);
          expect(observed[0]?.language).toBe("ja");
          expect(call?.[2]).toBe(3);
          expect(observed[0]?.argument).toBe(argument);
        }
      } finally {
        output.dispose();
      }
    } finally {
      conversion.mockRestore();
      parameter.dispose();
      input.dispose();
      number.dispose();
      formatter.dispose();
    }
  },
);

it("uses current-language keywords and modifier-language conversion independently", /** German keyword JJJJ selects the Japanese native-number locale; literal YYYY is not normalized. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x407),
    number = new SvNumberNatNum(),
    input = unicode("2026");
  try {
    number.SetNum(3, false);
    number.SetLang(0x411);
    for (const [params, expected] of [
      ["YYYY=ordinal", "2026"],
      ["JJJJ=ordinal", "２０２６"],
    ]) {
      const parameter = unicode(params as string);
      try {
        number.SetParams(parameter);
        const output = dateTransliteration.impTransliterateImpl(
          input,
          number,
          K.YYYY,
          formatter.GetNatNum(),
          formatter["m_aCurrentLanguage"],
        );
        try {
          expect(text(output)).toBe(expected);
        } finally {
          output.dispose();
        }
      } finally {
        parameter.dispose();
      }
    }
  } finally {
    input.dispose();
    number.dispose();
    formatter.dispose();
  }
});

it("bypasses incomplete modifiers and preserves source buffers until conversion succeeds", /** Both actual buffer overloads borrow the existing storage and only publish successful service results. @returns Nothing. */ () => {
  const formatter = new SvNumberFormatter(0x411),
    number = new SvNumberNatNum(),
    input = unicode("12"),
    buffer = new OUStringBuffer(input),
    native = formatter.GetNatNum(),
    conversion = vi.spyOn(native, "getNativeNumberStringParams");
  try {
    const output = dateTransliteration.impTransliterate(
      input,
      number,
      K.YYYY,
      native,
      formatter["m_aCurrentLanguage"],
    );
    try {
      expect(text(output)).toBe("12");
      expect(conversion).not.toHaveBeenCalled();
    } finally {
      output.dispose();
    }
    impTransliterate(buffer, number, native);
    expect(conversion).not.toHaveBeenCalled();
    number.SetNum(3, false);
    number.SetLang(0x411);
    impTransliterateImpl(buffer, number, native);
    expect(text(OUString.unacquired(buffer))).toBe("１２");
    buffer.assign(input);
    const failure = new Error("native callback failure");
    conversion.mockImplementationOnce(
      /** Original boundary propagates this non-UNO failure. @returns Never. */ () => {
        throw failure;
      },
    );
    expect(
      /** Invokes the actual buffer boundary with the observed failure. @returns Nothing. */ () =>
        impTransliterateImpl(buffer, number, native),
    ).toThrow(failure);
    expect(text(OUString.unacquired(buffer))).toBe("12");
  } finally {
    conversion.mockRestore();
    buffer.dispose();
    input.dispose();
    number.dispose();
    formatter.dispose();
  }
});
