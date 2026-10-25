/** @fileoverview Focused native RTF lexical contracts. */
import { expect, it } from "vitest";
import { RtfSyntaxError, RtfTokenizer } from "./rtftokenizer";

/** Parses ASCII fixture bytes. @param source - RTF source. @returns Lexical events. */
function tokenize(source: string) {
  return new RtfTokenizer(new TextEncoder().encode(source)).Tokenize();
}

it("retains nested group boundaries and signed control parameters", /** Checks token ordering and syntax. @returns Nothing. */ () => {
  expect(JSON.stringify(tokenize("{\\rtf1 A{\\b Bold}\\li-240 B}"))).toBe(
    JSON.stringify([
      { kind: "group-start" },
      { kind: "control", name: "rtf", parameter: 1 },
      { kind: "ansi-bytes", value: Uint8Array.of(65) },
      { kind: "group-start" },
      { kind: "control", name: "b" },
      { kind: "ansi-bytes", value: new TextEncoder().encode("Bold") },
      { kind: "group-end" },
      { kind: "control", name: "li", parameter: -240 },
      { kind: "ansi-bytes", value: Uint8Array.of(66) },
      { kind: "group-end" },
    ]),
  );
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

it("leaves ANSI hex bytes for document-state decoding", () => {
  expect(tokenize("{\\rtf1\\ansicpg1251\\'c6}")).toContainEqual({
    kind: "ansi-bytes",
    value: Uint8Array.of(0xc6),
  });
});

it("keeps control words while a Unicode fallback character remains pending", () => {
  expect(tokenize(String.raw`{\rtf1 A\u233\par?B}`)).toEqual([
    { kind: "group-start" },
    { kind: "control", name: "rtf", parameter: 1 },
    { kind: "ansi-bytes", value: Uint8Array.of(65) },
    { kind: "text", value: "é" },
    { kind: "control", name: "par" },
    { kind: "ansi-bytes", value: Uint8Array.of(66) },
    { kind: "group-end" },
  ]);
});

it("restores the parent Unicode fallback count after an RTF group", () => {
  const text = tokenize(String.raw`{\rtf1\uc2\u233{??}??X}`)
    .filter((token) => token.kind === "text" || token.kind === "ansi-bytes")
    .map((token) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)))
    .join("");
  expect(text).toBe("éX");
});

it("retains the pinned signed Unicode fallback width and bare uc default", () => {
  expect(
    tokenize(String.raw`{\rtf1\uc-1\u233ABC}`)
      .filter((token) => token.kind === "text" || token.kind === "ansi-bytes")
      .map((token) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)))
      .join(""),
  ).toBe("é");
  expect(
    tokenize(String.raw`{\rtf1\uc0\uc\u233?X}`)
      .filter((token) => token.kind === "text" || token.kind === "ansi-bytes")
      .map((token) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)))
      .join(""),
  ).toBe("éX");
  expect(
    tokenize(String.raw`{\rtf1\u65536?X}`)
      .filter((token) => token.kind === "text" || token.kind === "ansi-bytes")
      .map((token) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)))
      .join(""),
  ).toBe("?X");
});

it("keeps each escaped hex CR and LF for destination-aware paragraph dispatch", () => {
  expect(tokenize(String.raw`{\rtf1 A\'0d\'0aB}`)).toEqual([
    { kind: "group-start" },
    { kind: "control", name: "rtf", parameter: 1 },
    { kind: "ansi-bytes", value: Uint8Array.of(65) },
    { kind: "hex-break", value: "\r" },
    { kind: "hex-break", value: "\n" },
    { kind: "ansi-bytes", value: Uint8Array.of(66) },
    { kind: "group-end" },
  ]);
  expect(tokenize(String.raw`{\rtf1\u233\'0dX}`)).toContainEqual({
    kind: "ansi-bytes",
    value: Uint8Array.of(88),
  });
});

it("consumes binary payload without treating braces as groups", /** Checks native bin run lexical ownership. @returns Nothing. */ () => {
  expect(tokenize("{\\rtf1 A\\bin3{}\\B}")).toContainEqual({
    kind: "ansi-bytes",
    value: Uint8Array.of(66),
  });
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
