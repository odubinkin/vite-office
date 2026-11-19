/** @fileoverview Original fixed-width date and space-token attribute contracts over actual intrusive attribute/token owners and generated DateTime fields. */
import { afterEach, expect, it } from "vitest";
import { own, releaseDomScope } from "../../../test/native-dom";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { FastAttributeList } from "../../../sax/source/tools/fastattribs";
import { FastTokenHandler } from "../core/fasttokenhandler";
import { getTokenFromUtf8 as token, XML_TOKEN_INVALID } from "../token/tokenmap";
import { AttributeList } from "./attributelist";
afterEach(releaseDomScope);
/** Supplies actual native list ownership rather than a decoded-value provider. @param value - Present literal or missing attribute. @returns Owning helper. */
function attributes(value?: string): AttributeList {
  const handler = own(new Reference(new FastTokenHandler())),
    raw = new FastAttributeList(handler.operatorStar()),
    owner = own(new Reference(raw));
  if (value !== undefined) raw.add(1, value);
  return own(new AttributeList(owner));
}
it.each(["2024-02-29T01:02:03", "2024-02-29T01:02:03Z"])(
  "reads %s without inferring UTC or fractions",
  /** Original source assigns only six fields. @param text - Attribute literal. @returns Nothing. */ (
    text,
  ) => {
    const value = attributes(text).getDateTime(1);
    expect(value).toBeInstanceOf(DateTime);
    expect(value?.equals(new DateTime(0, 3, 2, 1, 29, 2, 2024, false))).toBe(true);
  },
);
it.each([
  undefined,
  "",
  "2024-02-29",
  "2024-02-29T01:02:03z",
  "2024-02-29T01:02:03+00:00",
  "2024-02-29T01:02:03.1",
  "2024/02-29T01:02:03",
  "2024-02/29T01:02:03",
  "2024-02-29 01:02:03",
  "2024-02-29T01-02:03",
  "2024-02-29T01:02-03",
])(
  "declines invalid fixed-width syntax %s and copies fallback",
  /** Original validity predicate does not normalize alternate forms. @param text - Attribute. @returns Nothing. */ (
    text,
  ) => {
    const list = attributes(text),
      fallback = new DateTime(123, 4, 5, 6, 7, 8, 2001, true);
    expect(list.getDateTime(1)).toBeUndefined();
    const copied = list.getDateTime(1, fallback);
    expect(copied).not.toBe(fallback);
    expect(copied.equals(fallback)).toBe(true);
    copied.Year = 2025;
    expect(fallback.Year).toBe(2001);
  },
);
it.each([
  ["2024-99-00T77:88:99", [2024, 99, 0, 77, 88, 99]],
  ["abcd-xx-yyTzz:qq:rr", [0, 0, 0, 0, 0, 0]],
  ["12xx-1x-2xT3x:4x:5x", [12, 1, 2, 3, 4, 5]],
  ["-001--1--2T-3:-4:-5", [-1, 65535, 65534, 65533, 65532, 65531]],
] as const)(
  "retains source numeric parsing and declared field narrowing %s",
  /** No host Date/calendar or ISO validator repairs the original source. @param text - Attribute. @param fields - Original field values. @returns Nothing. */ (
    text,
    fields,
  ) => {
    const value = attributes(text).getDateTime(1) as DateTime;
    expect([value.Year, value.Month, value.Day, value.Hours, value.Minutes, value.Seconds]).toEqual(
      fields,
    );
    expect(value.IsUTC).toBe(false);
  },
);
it("copies a valid date rather than selecting or aliasing the supplied fallback", /** Original value_or evaluates the parsed native value independently. @returns Nothing. */ () => {
  const fallback = new DateTime(7, 8, 9, 10, 11, 12, 2000, true),
    list = attributes("2024-01-02T03:04:05Z"),
    first = list.getDateTime(1, fallback),
    second = list.getDateTime(1);
  expect(first.equals(new DateTime(0, 5, 4, 3, 2, 1, 2024, false))).toBe(true);
  first.Month = 8;
  expect(second?.Month).toBe(1);
  expect(fallback.IsUTC).toBe(true);
});
it.each([
  [undefined, []],
  ["", []],
  ["true", [token("true")]],
  [
    " true  false ",
    [XML_TOKEN_INVALID, token("true"), XML_TOKEN_INVALID, token("false"), XML_TOKEN_INVALID],
  ],
  [" ", [XML_TOKEN_INVALID, XML_TOKEN_INVALID]],
  ["true\tfalse", [XML_TOKEN_INVALID]],
  ["true\nfalse", [XML_TOKEN_INVALID]],
  [
    "true not-an-oox-token Ω false true",
    [token("true"), XML_TOKEN_INVALID, XML_TOKEN_INVALID, token("false"), token("true")],
  ],
] as const)(
  "retains exact space-delimited tokens %s",
  /** Empty/unknown tokens retain invalid identity and repeated values retain order. @param text - Attribute. @param expected - Native identities. @returns Nothing. */ (
    text,
    expected,
  ) => {
    const list = attributes(text),
      result = list.getTokenList(1);
    expect(result).toEqual(expected);
    result.push(123);
    expect(list.getTokenList(1)).toEqual(expected);
  },
);
