/** @fileoverview Original Data UTF16 path grammar, partial output and template-name cases using actual string owners. */
import { expect, it } from "vitest";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Data } from "./data";

/** Materializes literal UTF16 including NUL/surrogates. @param value - Exact value. @returns Actual owner. */
function u(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads exact units without a JS spread argument limit. @param value - Actual owner. @returns JS UTF16 string. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}

it("escapes only named template elements and roundtrips actual UTF16 including large names", /** Native temporary capacity is not a logical name limit. @returns Nothing. */ () => {
  const value = u("a/'\"&<>\0\ud800");
  const simple = Data.createSegment(u(""), value);
  expect(simple).not.toBe(value);
  expect(text(simple)).toBe("a/'\"&<>\0\ud800");
  simple.assign(u("caller mutation"));
  expect(text(value)).toBe("a/'\"&<>\0\ud800");
  expect(text(Data.createSegment(u("C:T"), value))).toBe("C:T['a/&apos;&quot;&amp;<>\0\ud800']");
  for (const literal of ["", "a/'\"&<>\0\ud800", "A".repeat(70000) + "\0\ud800"]) {
    const encoded = Data.createSegment(u("T"), u(literal));
    const name = u("old"),
      template = u("old-template");
    const set: [boolean] = [false];
    expect(Data.parseSegment(encoded, 0, name, set, template)).toBe(encoded.getLength());
    expect([text(name), set[0], text(template)]).toEqual([literal, true, "T"]);
  }
});

it("preserves original simple wildcard bare quoted partial-failure and null-template output rules", /** Expected outputs include state written before a parse error. @returns Nothing. */ () => {
  const cases: readonly [string, number, number, string, boolean, string][] = [
    ["", 0, 0, "", false, "old-template"],
    ["/", 0, 0, "", false, "old-template"],
    ["alpha/beta", 0, 5, "alpha", false, "old-template"],
    ["alpha", 5, 5, "", false, "old-template"],
    ["prefix/T['a']tail", 7, 13, "a", true, "T"],
    ["T['n']", 0, 6, "n", true, "T"],
    ['T["n"]', 0, 6, "n", true, "T"],
    ["*['n']", 0, 6, "n", true, ""],
    ["['n']", 0, 5, "n", false, ""],
    ["T['']", 0, 5, "", true, "T"],
    ["T['&amp;&quot;&apos;']", 0, 22, "&\"'", true, "T"],
    ["T[", 0, -1, "old-name", true, "T"],
    ["T[x]", 0, -1, "old-name", true, "T"],
    ["T['n", 0, -1, "old-name", true, "T"],
    ["T['n'", 0, -1, "old-name", true, "T"],
    ["T['n'x", 0, -1, "old-name", true, "T"],
    ["T['&lt;']", 0, -1, "old-name", true, "T"],
    ["*['bad", 0, -1, "old-name", true, ""],
  ];
  for (const [encoded, index, end, expectedName, expectedSet, expectedTemplate] of cases) {
    const name = u("old-name"),
      template = u("old-template");
    const set: [boolean] = [true];
    expect(Data.parseSegment(u(encoded), index, name, set, template), encoded).toBe(end);
    expect([text(name), set[0], text(template)], encoded).toEqual([
      expectedName,
      expectedSet,
      expectedTemplate,
    ]);
  }
  for (const encoded of ["T['n']", "*['n']", "['n']", "simple"]) {
    const name = u("old"),
      set: [boolean] = [false];
    expect(Data.parseSegment(u(encoded), 0, name, set, null)).toBe(encoded.length);
    expect(text(name)).toBe(encoded === "simple" ? "simple" : "n");
  }
});

it("constructs full template names and retains original short versus full comparisons and colon errors", /** Does not invent validation for empty component/name views. @returns Nothing. */ () => {
  expect(text(Data.fullTemplateName(u("C"), u("T")))).toBe("C:T");
  expect(text(Data.fullTemplateName(u(""), u("")))).toBe(":");
  for (const [short, long, expected] of [
    ["T", "C:T", true],
    ["T", "C:X", false],
    ["C:T", "C:T", true],
    ["D:T", "C:T", false],
    ["", "C:", true],
  ] as const)
    expect(Data.equalTemplateNames(u(short), u(long))).toBe(expected);
  for (const [component, name] of [
    ["C:X", "T"],
    ["C", "T:X"],
  ]) {
    let caught: unknown;
    try {
      Data.fullTemplateName(u(component as string), u(name as string));
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(RuntimeException);
    expect(text((caught as RuntimeException).Message)).toBe(
      "bad component/name pair containing colon " + component + "/" + name,
    );
  }
});
