/** @fileoverview Native URI pointer, scalar, escape and lexical-boundary contracts required by the Writer link path. */
import { expect, it } from "vitest";
import { EncodeMechanism as E, EscapeType as X, FSysStyle, Part as P } from "../../inc/urlobj";
import {
  RTL_TEXTENCODING_UTF8 as UTF8,
  RTL_TEXTENCODING_ASCII_US as ASCII,
  RTL_TEXTENCODING_ISO_8859_1 as LATIN1,
} from "../../../sal/inc/rtl/textenc";
import {
  appendUCS4,
  appendUCS4Escape,
  getUTF32,
  guessFSysStyleByCounting,
  mustEncode,
  parseScheme,
  scanDomain,
  scanIPv6reference,
  type UriCursor,
} from "./urlobj";
/** Constructs the source pointer range. @param text - Native buffer. @returns Cursor. */
function range(text: string): UriCursor {
  return { text, index: 0, end: text.length };
}

it.each([
  ["%41", E.All, UTF8, 37, X.NONE, 1],
  ["%41", E.WasEncoded, UTF8, 65, X.Utf32, 3],
  ["%41", E.NotCanonical, UTF8, 65, X.Octet, 3],
  ["%E9", E.WasEncoded, ASCII, 233, X.Octet, 3],
  ["%E9", E.WasEncoded, LATIN1, 233, X.Utf32, 3],
  ["%E9", E.WasEncoded, UTF8, 233, X.Octet, 3],
  ["%E9", E.WasEncoded, 0, 233, X.Octet, 3],
  ["%G0", E.WasEncoded, UTF8, 37, X.NONE, 1],
  ["%1", E.WasEncoded, UTF8, 37, X.NONE, 1],
  ["%C2%A2", E.WasEncoded, UTF8, 162, X.Utf32, 6],
  ["%E2%82%AC", E.WasEncoded, UTF8, 8364, X.Utf32, 9],
  ["%F4%8F%BF%BF", E.WasEncoded, UTF8, 0x10ffff, X.Utf32, 12],
  ["%C0%80", E.WasEncoded, UTF8, 192, X.Octet, 3],
  ["%ED%A0%80", E.WasEncoded, UTF8, 237, X.Octet, 3],
  ["%F4%90%80%80", E.WasEncoded, UTF8, 244, X.Octet, 3],
  ["%E2%82x", E.WasEncoded, UTF8, 226, X.Octet, 3],
  ["%E2\u0082%AC", E.WasEncoded, UTF8, 226, X.Octet, 3],
  ["😀", E.WasEncoded, UTF8, 0x1f600, X.NONE, 2],
  ["\ud800A", E.WasEncoded, UTF8, 0xd800, X.NONE, 1],
  ["\udc00", E.WasEncoded, UTF8, 0xdc00, X.NONE, 1],
])(
  "scans %j with source escape mechanism %i and charset %i",
  /** Verifies native boundary behavior. @param text - Source-derived case value. @param mechanism - Source-derived case value. @param charset - Source-derived case value. @param value - Source-derived case value. @param escape - Source-derived case value. @param end - Source-derived case value. @returns Nothing. */
  (text, mechanism, charset, value, escape, end) => {
    const cursor = range(text);
    expect(getUTF32(cursor, mechanism, charset)).toEqual({ value, escape });
    expect(cursor.index).toBe(end);
  },
);
it("honors the end pointer when a valid continuation exists beyond the range" /** Verifies native boundary behavior. @returns Nothing. */, () => {
  const cursor = { text: "%E2%82%AC", index: 0, end: 6 };
  expect(getUTF32(cursor, E.WasEncoded, UTF8)).toEqual({ value: 0xe2, escape: X.Octet });
  expect(cursor.index).toBe(3);
  const surrogate = { text: "😀", index: 0, end: 1 };
  expect(getUTF32(surrogate, E.All, UTF8).value).toBe(0xd83d);
});
it.each([
  [0x7f, "%7F"],
  [0x80, "%C2%80"],
  [0x7ff, "%DF%BF"],
  [0x800, "%E0%A0%80"],
  [0xd800, "%ED%A0%80"],
  [0xffff, "%EF%BF%BF"],
  [0x10000, "%F0%90%80%80"],
  [0x1fffff, "%F7%BF%BF%BF"],
  [0x200000, "%F8%88%80%80%80"],
  [0x3ffffff, "%FB%BF%BF%BF%BF"],
  [0x4000000, "%FC%84%80%80%80%80"],
  [0x7fffffff, "%FD%BF%BF%BF%BF%BF"],
])(
  "preserves native UCS4 escape branches for %i" /** Verifies native boundary behavior. @param value - Source-derived case value. @param output - Source-derived case value. @returns Nothing. */,
  (value, output) => {
    expect(appendUCS4Escape(value)).toBe(output);
  },
);
it("keeps raw Unicode UTF8 escaping distinct from decoded input charset" /** Verifies native boundary behavior. @returns Nothing. */, () => {
  expect(appendUCS4({ value: 233, escape: X.NONE }, P.PART_HTTP_PATH, LATIN1, true)).toBe("%C3%A9");
  expect(appendUCS4({ value: 233, escape: X.Utf32 }, P.PART_HTTP_PATH, LATIN1, true)).toBe("%E9");
  expect(appendUCS4({ value: 65, escape: X.Octet }, P.PART_HTTP_PATH, UTF8, false)).toBe("%41");
  expect(appendUCS4({ value: 65, escape: X.Utf32 }, P.PART_HTTP_PATH, UTF8, true)).toBe("%41");
  expect(appendUCS4({ value: 65, escape: X.Utf32 }, P.PART_HTTP_PATH, UTF8, false)).toBe("A");
  expect(appendUCS4({ value: 32, escape: X.Utf32 }, P.PART_UNAMBIGUOUS, UTF8, true)).toBe(" ");
});
it("preserves different admission for native path, query and unambiguous text" /** Verifies native boundary behavior. @returns Nothing. */, () => {
  expect(mustEncode(126, P.PART_HTTP_QUERY)).toBe(true);
  expect(mustEncode(126, P.PART_HTTP_PATH)).toBe(false);
  expect(mustEncode(47, P.PART_UNAMBIGUOUS)).toBe(true);
  expect(mustEncode(92, P.PART_UNAMBIGUOUS)).toBe(false);
  expect(mustEncode(32, P.PART_UNAMBIGUOUS)).toBe(false);
  expect(mustEncode(0x80, P.PART_UNAMBIGUOUS)).toBe(true);
});
it.each([
  ["Ab+1.X:payload", "ab+1.x", 7],
  ["a:payload", "", 0],
  ["xx:", "", 0],
  ["xx:#fragment", "", 0],
  ["xx:?query", "xx", 3],
  ["1x:data", "", 0],
  ["C:\\file", "", 0],
  ["xx::", "xx", 3],
])(
  "scans generic scheme %j" /** Verifies native boundary behavior. @param text - Source-derived case value. @param scheme - Source-derived case value. @param index - Source-derived case value. @returns Nothing. */,
  (text, scheme, index) => {
    const cursor = range(text);
    expect(parseScheme(cursor, 35)).toBe(scheme);
    expect(cursor.index).toBe(index);
  },
);
it("uses range bounds and the active fragment delimiter during scheme scanning" /** Verifies native boundary behavior. @returns Nothing. */, () => {
  const cursor = { text: "xx:payload", index: 0, end: 3 };
  expect(parseScheme(cursor, 35)).toBe("");
  cursor.end = 10;
  expect(parseScheme(cursor, 112)).toBe("");
  expect(cursor.index).toBe(0);
});
it.each([
  ["_a_.b_/path", false, 2, 6],
  ["host./", false, 1, 4],
  ["host./", true, 0, 0],
  ["host--/", false, 1, 4],
  ["host--/", true, 0, 0],
  ["a-b.example:80", true, 2, 11],
  [".bad", false, 0, 0],
  ["a..b", false, 1, 1],
  ["a..b", true, 0, 0],
])(
  "preserves domain state and rollback for %j eager=%j" /** Verifies native boundary behavior. @param text - Source-derived case value. @param eager - Source-derived case value. @param labels - Source-derived case value. @param index - Source-derived case value. @returns Nothing. */,
  (text, eager, labels, index) => {
    const cursor = range(text);
    expect(scanDomain(cursor, eager)).toBe(labels);
    expect(cursor.index).toBe(index);
  },
);
it.each([
  ["[]/", true, 2],
  ["[:]/", true, 3],
  ["[abcd::1]:80", true, 9],
  ["[xyz]", false, 0],
  ["[::1", false, 0],
])(
  "lexes IPv6 reference %j without replacing host validation" /** Verifies native boundary behavior. @param text - Source-derived case value. @param result - Source-derived case value. @param index - Source-derived case value. @returns Nothing. */,
  (text, result, index) => {
    const cursor = range(text);
    expect(scanIPv6reference(cursor)).toBe(result);
    expect(cursor.index).toBe(index);
  },
);
it("votes filesystem delimiters with native tie and disabled-style behavior" /** Verifies native boundary behavior. @returns Nothing. */, () => {
  expect(guessFSysStyleByCounting("a/b\\c", FSysStyle.Detect)).toBe(FSysStyle.Unix);
  expect(guessFSysStyleByCounting("a\\b\\c/d", FSysStyle.Detect)).toBe(FSysStyle.Dos);
  expect(guessFSysStyleByCounting("a\\b", FSysStyle.Unix)).toBe(FSysStyle.Unix);
  expect(guessFSysStyleByCounting("a/b", FSysStyle.Dos)).toBe(FSysStyle.Dos);
});
