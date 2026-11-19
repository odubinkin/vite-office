/** @fileoverview Original SAL URI QA over actual native string/converter owners; no browser URI implementation. */
import { expect, it } from "vitest";
import { OUString } from "../inc/rtl/ustring";
import { Uri, createUriCharClass } from "../inc/rtl/uri";
import {
  rtl_UriCharClass as C,
  rtl_UriEncodeMechanism as E,
  rtl_UriDecodeMechanism as D,
  rtl_uriConvertRelToAbs,
  rtl_getUriCharClass,
} from "../inc/rtl/uri.h";
import * as enc from "../inc/rtl/textenc";
import { MalformedUriException } from "../inc/rtl/malformeduriexception";
import qa from "./uri-relative.qa.json";
/** Owns exact UTF16 including embedded zero and isolated surrogates. @param value - Test input. @returns Native owner. */
function native(value: string): OUString {
  const units = Uint16Array.from(
    value.split(""),
    /** Converts a literal character to its code unit without normalization. @param c - Character from the literal. @returns Character code unit. */ (
      c,
    ) => c.charCodeAt(0),
  );
  return new OUString(units, units.length);
}
/** Reads initialized units only. @param value - Native result. @returns Assertion string. */
function text(value: OUString): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
/** Invokes original encoder with real owned operands. @param value - Input. @param mechanism - Policy. @param charset - Encoding. @param charClass - Original class. @returns Result text. */
function encode(
  value: string,
  mechanism: E,
  charset = enc.RTL_TEXTENCODING_UTF8,
  charClass = C.rtl_UriCharClassUric,
): string {
  const input = native(value);
  try {
    const result = Uri.encode(input, charClass, mechanism, charset);
    try {
      return text(result);
    } finally {
      result.dispose();
    }
  } finally {
    input.dispose();
  }
}
/** Invokes original decoder with real owned operands. @param value - Input. @param mechanism - Policy. @param charset - Encoding. @returns Result text. */
function decode(value: string, mechanism: D, charset = enc.RTL_TEXTENCODING_UTF8): string {
  const input = native(value);
  try {
    const result = Uri.decode(input, mechanism, charset);
    try {
      return text(result);
    } finally {
      result.dispose();
    }
  } finally {
    input.dispose();
  }
}
for (const [index, row] of qa.rows.entries())
  it(`matches original SAL relative-resolution row ${index}`, /** Checks that `matches original SAL relative-resolution row ${index}`. @returns Nothing. */ () => {
    const [baseText, relativeText, expected] = row;
    const base = native(baseText as string),
      relative = native(relativeText as string);
    try {
      let result: OUString;
      try {
        result = Uri.convertRelToAbs(base, relative);
      } catch (error) {
        expect(expected).toBeNull();
        expect(error).toBeInstanceOf(MalformedUriException);
        const exception = error as MalformedUriException;
        try {
          expect(exception.getMessage().getLength()).toBeGreaterThan(0);
        } finally {
          exception.dispose();
        }
        return;
      }
      try {
        expect(text(result)).toBe(expected);
      } finally {
        result.dispose();
      }
    } finally {
      relative.dispose();
      base.dispose();
    }
  });
it("replays original rtl_testuri failures 1 through 10 for every character class", /** Checks that replays original rtl_testuri failures 1 through 10 for every character class. @returns Nothing. */ () => {
  const ascii = String.fromCharCode(
      ...Array.from(
        { length: 128 },
        /** Builds consecutive code units for the fixture. @param _ - Unused array element. @param i - Zero-based fixture index. @returns Index used as the code unit. */ (
          _,
          i,
        ) => i,
      ),
    ),
    latin = String.fromCharCode(
      ...Array.from(
        { length: 256 },
        /** Builds consecutive code units for the fixture. @param _ - Unused array element. @param i - Zero-based fixture index. @returns Index used as the code unit. */ (
          _,
          i,
        ) => i,
      ),
    );
  for (
    let charClass = C.rtl_UriCharClassNone;
    charClass <= C.rtl_UriCharClassUnoParamValue;
    charClass++
  ) {
    for (const mechanism of [E.rtl_UriEncodeKeepEscapes, E.rtl_UriEncodeCheckEscapes]) {
      const encoded = encode(ascii, mechanism, enc.RTL_TEXTENCODING_ISO_8859_1, charClass);
      for (const charset of [
        enc.RTL_TEXTENCODING_ASCII_US,
        enc.RTL_TEXTENCODING_ISO_8859_1,
        enc.RTL_TEXTENCODING_UTF8,
      ])
        expect(decode(encoded, D.rtl_UriDecodeWithCharset, charset)).toBe(ascii);
      for (const charset of [enc.RTL_TEXTENCODING_ISO_8859_1, enc.RTL_TEXTENCODING_UTF8])
        expect(
          decode(encode(latin, mechanism, charset, charClass), D.rtl_UriDecodeWithCharset, charset),
        ).toBe(latin);
    }
  }
});
it("replays original surrogate, malformed UTF8, IURI and parameter-class failures 11 through 19", /** Checks that replays original surrogate, malformed UTF8, IURI and parameter-class failures 11 through 19. @returns Nothing. */ () => {
  for (const mechanism of [
    E.rtl_UriEncodeIgnoreEscapes,
    E.rtl_UriEncodeKeepEscapes,
    E.rtl_UriEncodeCheckEscapes,
  ])
    expect(encode("\ud800\u{103ff}\udfffA", mechanism)).toBe("%ED%A0%80%F0%90%8F%BF%ED%BF%BFA");
  for (const mechanism of [D.rtl_UriDecodeToIuri, D.rtl_UriDecodeWithCharset])
    expect(decode("%ed%a0%80%f0%90%8f%bf%ed%bf%bfA", mechanism)).toBe(
      "%ED%A0%80\u{103ff}%ED%BF%BFA",
    );
  for (const value of ["%E0%83%BF", "%EF%BF%BF"])
    expect(encode(value, E.rtl_UriEncodeCheckEscapes)).toBe(value);
  expect(decode("%30%C3%BF", D.rtl_UriDecodeToIuri)).toBe("%30\u00ff");
  expect(
    encode(
      "[]%5B%5D",
      E.rtl_UriEncodeCheckEscapes,
      enc.RTL_TEXTENCODING_ASCII_US,
      C.rtl_UriCharClassUnoParamValue,
    ),
  ).toBe("%5B%5D%5B%5D");
});
it("replays original unusual charset and strict failures 20 through 30, including enabled zh QA", /** Checks that replays original unusual charset and strict failures 20 through 30, including enabled zh QA. @returns Nothing. */ () => {
  for (const [input, expected] of [
    [" !\u0401\u045f", "%20!%A1%FF"],
    [" !\u0401\u0700\u045f", "%20!%A1\u0700%FF"],
  ]) {
    expect(
      encode(input as string, E.rtl_UriEncodeIgnoreEscapes, enc.RTL_TEXTENCODING_ISO_8859_5),
    ).toBe(expected);
    expect(
      decode(expected as string, D.rtl_UriDecodeWithCharset, enc.RTL_TEXTENCODING_ISO_8859_5),
    ).toBe(input);
  }
  expect(
    encode(" !\u028a\u{22513}", E.rtl_UriEncodeIgnoreEscapes, enc.RTL_TEXTENCODING_GB_18030),
  ).toBe("%20!%81%30%B1%33%95%39%C5%37");
  expect(
    decode(
      "%20!%81%30%B1%33%95%39%C5%37",
      D.rtl_UriDecodeWithCharset,
      enc.RTL_TEXTENCODING_GB_18030,
    ),
  ).toBe(" !\u028a\u{22513}");
  for (const mechanism of [E.rtl_UriEncodeStrict, E.rtl_UriEncodeStrictKeepEscapes])
    expect(encode(" !\u0401\u0700\u045f", mechanism, enc.RTL_TEXTENCODING_ISO_8859_5)).toBe("");
  expect(decode("%20%C4%80%FF", D.rtl_UriDecodeStrict)).toBe("");
  for (const input of ["%81 ", "%81%20"])
    expect(decode(input, D.rtl_UriDecodeStrict, enc.RTL_TEXTENCODING_GB_18030)).toBe("");
  for (const input of ["%81%30%B1%33", "%810%B13"])
    expect(decode(input, D.rtl_UriDecodeStrict, enc.RTL_TEXTENCODING_GB_18030)).toBe("\u028a");
  expect(encode("%%ea%c3%aa", E.rtl_UriEncodeStrictKeepEscapes)).toBe("%25%EA%C3%AA");
  expect(encode("\u00ea", E.rtl_UriEncodeStrictKeepEscapes)).toBe("%C3%AA");
  for (const value of ["%80", "%FE"])
    for (const charset of [
      enc.RTL_TEXTENCODING_ASCII_US,
      enc.RTL_TEXTENCODING_ISO_8859_1,
      enc.RTL_TEXTENCODING_UTF8,
      enc.RTL_TEXTENCODING_SHIFT_JIS,
    ])
      expect(encode(value, E.rtl_UriEncodeStrictKeepEscapes, charset)).toBe(value);
});
it("replays rtl_Uri.cxx UTF8 round trip", /** Checks that replays rtl_Uri.cxx UTF8 round trip. @returns Nothing. */ () => {
  const decoded = decode("h%C3%A4llo", D.rtl_UriDecodeToIuri);
  expect(decoded).toBe("hällo");
  expect(
    encode(
      decoded,
      E.rtl_UriEncodeKeepEscapes,
      enc.RTL_TEXTENCODING_UTF8,
      C.rtl_UriCharClassUnoParamValue,
    ),
  ).toBe("h%C3%A4llo");
});
it("preserves source exception value assignment and result/message ownership", /** Checks that preserves source exception value assignment and result/message ownership. @returns Nothing. */ () => {
  const base = native("bad"),
    relative = native("x"),
    result = native("untouched"),
    message = native("prior");
  try {
    expect(
      rtl_uriConvertRelToAbs(
        base.pData,
        relative.pData,
        result.getDataAddress(),
        message.getDataAddress(),
      ),
    ).toBe(false);
    expect(text(result)).toBe("untouched");
    expect(text(message)).toBe("<bad> does not start with a scheme component");
    const first = new MalformedUriException(result),
      second = new MalformedUriException(message);
    try {
      const assigned = first.assign(second);
      try {
        expect(assigned).not.toBe(first);
        expect(assigned.getMessage().pData).toBe(second.getMessage().pData);
        const self = first.assign(first);
        try {
          expect(self.getMessage().pData).toBe(first.getMessage().pData);
        } finally {
          self.dispose();
        }
      } finally {
        assigned.dispose();
      }
    } finally {
      first.dispose();
      second.dispose();
    }
  } finally {
    message.dispose();
    result.dispose();
    relative.dispose();
    base.dispose();
  }
});
it("preserves strict UTF8 non-scalar asymmetry and original decode-none acquire", /** Checks that preserves strict UTF8 non-scalar asymmetry and original decode-none acquire. @returns Nothing. */ () => {
  expect(encode("\ud800", E.rtl_UriEncodeStrict)).toBe("%ED%A0%80");
  expect(decode("%ED%A0%80", D.rtl_UriDecodeStrict)).toBe("");
  const input = native("%41\u0000x"),
    output = Uri.decode(input, D.rtl_UriDecodeNone, enc.RTL_TEXTENCODING_UTF8);
  try {
    expect(output.pData).toBe(input.pData);
    expect(text(output)).toBe("%41\u0000x");
  } finally {
    output.dispose();
    input.dispose();
  }
  expect(
    /** Checks that preserves strict UTF8 non-scalar asymmetry and original decode-none acquire. @returns Result of the operation under assertion. */ () =>
      rtl_getUriCharClass(-1 as C),
  ).toThrow();
  expect(
    /** Checks that preserves strict UTF8 non-scalar asymmetry and original decode-none acquire. @returns Result of the operation under assertion. */ () =>
      createUriCharClass(Uint8Array.of(65, 65)),
  ).toThrow();
});
