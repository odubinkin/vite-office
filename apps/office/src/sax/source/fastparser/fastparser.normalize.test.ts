/** @fileoverview Source FastParser namespace alias/index contracts over real native RTL values; no host namespace parser or replacement registry is used. */
import { afterEach, expect, it } from "vitest";
import { NormalizeURI, NormalizeOasisURN, NormalizeW3URI } from "./fastparser.normalize";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
afterEach(releaseDomScope);
it.each([
  ["http://www.w3.org/2000/svg", "urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0"],
  [
    "http://www.w3.org/1999/XSL/Format",
    "urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0",
  ],
  ["http://www.w3.org/2001/SMIL20/", "urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"],
  ["http://www.w3.org/2001/SMIL20", "urn:oasis:names:tc:opendocument:xmlns:smil-compatible:1.0"],
  ["urn:oasis:names:tc:legacy:xmlns:text:1.3", "urn:oasis:names:tc:opendocument:xmlns:text:1.0"],
  ["urn:oasis:names:tc::xmlns::1.x", "urn:oasis:names:tc:opendocument:xmlns::1.0"],
  ["urn:oasis:names:tc:字😀:xmlns:text:1.future", "urn:oasis:names:tc:opendocument:xmlns:text:1.0"],
])(
  "retains source OASIS alias %s",
  /** Each native operand is rewritten without changing a shared input copy. @param input - Source URI. @param expected - Source output. @returns Nothing. */ (
    input,
    expected,
  ) => {
    const value = u(input),
      copy = own(new OUString(value));
    expect(NormalizeOasisURN(value)).toBe(true);
    expect(text(value)).toBe(expected);
    expect(text(copy)).toBe(input);
    const dispatched = u(input);
    NormalizeURI(dispatched);
    expect(text(dispatched)).toBe(expected);
  },
);
it.each([
  "",
  "urn:other",
  "urn:oasis:names:tc",
  "urn:oasis:names:tcX",
  "urn:oasis:names:tc:legacy",
  "urn:oasis:names:tc:legacy:other:text:1.0",
  "urn:oasis:names:tc:legacy:xmlns",
  "urn:oasis:names:tc:legacy:xmlnsX:text:1.0",
  "urn:oasis:names:tc:legacy:xmlns:text",
  "urn:oasis:names:tc:legacy:xmlns:text:1",
  "urn:oasis:names:tc:legacy:xmlns:text:1.",
  "urn:oasis:names:tc:legacy:xmlns:text:1.0:extra",
  "urn:oasis:names:tc:legacy:xmlns:text:2.0",
  "urn:oasis:names:tc:legacy:xmlns:text:1-0",
])(
  "retains the original non-alias %s unchanged",
  /** Source early-return/index boundaries are observable through unchanged native storage. @param input - Source URI. @returns Nothing. */ (
    input,
  ) => {
    const value = u(input),
      pointer = value.pData;
    expect(NormalizeOasisURN(value)).toBe(false);
    expect(value.pData).toBe(pointer);
    NormalizeURI(value);
    expect(text(value)).toBe(input);
  },
);
it.each([
  ["http://www.w3.org/2001/xforms", true],
  ["http://www.w3.org/not-a-year/xforms", true],
  ["http://www.w3.org/nested/path/xforms", true],
  ["http://www.w3.org/xforms", true],
  ["http://www.w3.org/2001/xforms/", false],
  ["https://www.w3.org/2001/xforms", false],
])(
  "retains the W3 prefix/suffix rule for %s",
  /** The source does not parse or validate a year component. @param input - Source URI. @param rewritten - Native result. @returns Nothing. */ (
    input,
    rewritten,
  ) => {
    const value = u(input);
    expect(NormalizeW3URI(value)).toBe(rewritten);
    expect(text(value)).toBe(rewritten ? "http://www.w3.org/2002/xforms" : input);
    const dispatched = u(input);
    NormalizeURI(dispatched);
    expect(text(dispatched)).toBe(text(value));
  },
);
