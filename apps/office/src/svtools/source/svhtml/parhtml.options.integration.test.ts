/** @fileoverview Validates native HTML attribute-cache mutation, escaped values, script newline policy and Netscape color grammar. */
import { expect, it } from "vitest";
import { GetOptions, HTMLOption, UnescapeToken } from "./parhtml.options";
import { HtmlOptionId as O } from "../../inc/htmltokn";
import { Color } from "../../../tools/inc/color";

it.each([
  ['title="a\r\nb"', "ab"],
  ['title="a\\"b"', 'a"b'],
  ["title='a\"b'", 'a"b'],
  ["title=a\\ b", "a b"],
  ["title=a\\\\b", "a\\b"],
  ["title=", ""],
  ["title= \t\r\n", ""],
  ["title", ""],
  ["title='unterminated", "unterminated"],
  ["title=plain\t", "plain"],
  ["title=plain\u0001", "plain"],
  ["title=\u0001plain", "plain"],
  ["title\u0001 = plain", "plain"],
] as const)(
  "retains native attribute value for %j",
  /** Direct token-view inputs correspond to the scanner-owned option cache, without DOM unescaping. @param token - Actual token storage. @param expected - Native value. @returns Nothing. */ (
    token,
    expected,
  ) => {
    const context = { aToken: token, maOptions: [] as HTMLOption[] },
      values = GetOptions(context);
    expect(values).toHaveLength(1);
    expect(values[0]?.GetToken()).toBe(O.TITLE);
    expect(values[0]?.GetString()).toBe(expected);
    expect(GetOptions(context)).toBe(values);
  },
);

it("preserves explicit and native script newline exceptions while retaining original option spelling", /** The no-convert argument and script-token domain independently suppress CR/LF stripping. @returns Nothing. */ () => {
  const title = GetOptions({ aToken: 'TiTlE="a\r\nb"', maOptions: [] }, O.TITLE);
  expect(title[0]?.GetTokenString()).toBe("TiTlE");
  expect(title[0]?.GetString()).toBe("a\r\nb");
  const script = GetOptions({ aToken: 'OnClick="a\r\nb"', maOptions: [] });
  expect(script[0]?.GetString()).toBe("a\r\nb");
});

it("decodes native escape markers without consuming doubled literal backslashes", /** Checks the original mutable token contract and end-of-token escape. @returns Nothing. */ () => {
  for (const [input, expected] of [
    ["a\\\\b\\ c", "a\\b c"],
    ["\\", ""],
    ["", ""],
    ["plain", "plain"],
  ]) {
    const context = { aToken: input as string };
    UnescapeToken(context);
    expect(context.aToken).toBe(expected);
  }
});

it("retains case-insensitive option enums, defaults and native numeral-list boundaries", /** Native enums use table fallback while numbers clear caller-owned output and retain unsigned narrowing. @returns Nothing. */ () => {
  const center = new HTMLOption(O.ALIGN, "align", "CeNtEr");
  expect(
    center.GetEnum(
      [
        ["left", 1],
        ["center", 2],
      ],
      9,
    ),
  ).toBe(2);
  expect(center.GetEnum([["left", 1]], 9)).toBe(9);
  expect(center.GetEnum([])).toBe(0);
  const output = [99];
  new HTMLOption(O.COORDS, "coords", "1,2,").GetNumbers(output);
  expect(output).toEqual([1, 2]);
  new HTMLOption(O.COORDS, "coords", "none").GetNumbers(output);
  expect(output).toEqual([]);
});

it.each([
  ["red", 0xff0000],
  ["", 0],
  ["#", 0],
  ["##", 0],
  ["###", 0],
  ["#abcdef", 0xabcdef],
  ["ABCDEF", 0xabcdef],
  ["aBcDeF", 0xabcdef],
  ["###abcdef", 0x0abcde],
  ["aG0001", 0xa00001],
] as const)(
  "uses native Netscape option color %j",
  /** Literal expected channels distinguish the legacy grammar from CSS color parsing. @param source - Original value. @param expected - Packed RGB. @returns Nothing. */ (
    source,
    expected,
  ) => {
    const color = new Color();
    new HTMLOption(O.COLOR, "color", source).GetColor(color);
    expect(color.toUInt32()).toBe(expected);
  },
);
