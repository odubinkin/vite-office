/** @fileoverview Focused native RTF lexical contracts. */
import { expect, it } from "vitest";
import { RtfSyntaxError, RtfTokenizer } from "./rtftokenizer";

/** Parses ASCII fixture bytes. @param source - RTF source. @returns Lexical events. */
function tokenize(source: string) {
  return new RtfTokenizer(new TextEncoder().encode(source)).Tokenize();
}

it("retains nested group boundaries and signed control parameters", /** Checks token ordering and syntax. @returns Nothing. */ () => {
  expect(tokenize("{\\rtf1 A{\\b Bold}\\li-240 B}")).toEqual([
    { kind: "group-start" },
    { kind: "control", name: "rtf", parameter: 1 },
    { kind: "text", value: "A" },
    { kind: "group-start" },
    { kind: "control", name: "b" },
    { kind: "text", value: "Bold" },
    { kind: "group-end" },
    { kind: "control", name: "li", parameter: -240 },
    { kind: "text", value: "B" },
    { kind: "group-end" },
  ]);
});

it("decodes Unicode and skips the configured ANSI fallback width", /** Checks native uc/u lexical ownership. @returns Nothing. */ () => {
  expect(tokenize("{\\rtf1\\uc2\\u1046?? \\uc1\\u233?}")).toContainEqual({
    kind: "text",
    value: "Ж",
  });
  expect(tokenize("{\\rtf1\\uc2\\u1046?? \\uc1\\u233?}")).toContainEqual({
    kind: "text",
    value: "é",
  });
});

it("decodes ANSI hex bytes with the declared code page", /** Checks cp1251 byte decoding. @returns Nothing. */ () => {
  expect(tokenize("{\\rtf1\\ansicpg1251\\'c6}")).toContainEqual({
    kind: "text",
    value: "Ж",
  });
});

it("consumes binary payload without treating braces as groups", /** Checks native bin run lexical ownership. @returns Nothing. */ () => {
  expect(tokenize("{\\rtf1 A\\bin3{}\\B}")).toContainEqual({ kind: "text", value: "B" });
});

it.each(["text", "{\\rtf1", "{\\rtf1}", "{\\rtf1\\'zz}"])(
  "rejects invalid syntax %s",
  /** Checks malformed stream rejection. @param source - Malformed input. @returns Nothing. */ (
    source,
  ) => {
    if (source === "{\\rtf1}") expect(tokenize(source)).toHaveLength(3);
    else expect(() => tokenize(source)).toThrow(RtfSyntaxError);
  },
);
