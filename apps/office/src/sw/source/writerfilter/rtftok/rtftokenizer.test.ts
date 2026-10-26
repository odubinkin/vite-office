/** @fileoverview Focused native RTF lexical contracts. */
import { expect, it } from "vitest";
import { RtfSyntaxError, RtfTokenizer, type RtfToken } from "./rtftokenizer";

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

it("leaves ANSI hex bytes for document-state decoding", /** Checks leaves ANSI hex bytes for document-state decoding. @returns Test completion or assertion result. */ () => {
  expect(tokenize("{\\rtf1\\ansicpg1251\\'c6}")).toContainEqual({
    kind: "ansi-bytes",
    value: Uint8Array.of(0xc6),
  });
});

it("keeps control words while a Unicode fallback character remains pending", /** Checks keeps control words while a Unicode fallback character remains pending. @returns Test completion or assertion result. */ () => {
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

it("restores the parent Unicode fallback count after an RTF group", /** Checks restores the parent Unicode fallback count after an RTF group. @returns Test completion or assertion result. */ () => {
  const text = tokenize(String.raw`{\rtf1\uc2\u233{??}??X}`)
    .filter(
      /** Checks restores the parent Unicode fallback count after an RTF group. @param token - Token. @returns Test completion or assertion result. */ (
        token,
      ) => token.kind === "text" || token.kind === "ansi-bytes",
    )
    .map(
      /** Checks restores the parent Unicode fallback count after an RTF group. @param token - Token. @returns Test completion or assertion result. */ (
        token,
      ) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)),
    )
    .join("");
  expect(text).toBe("éX");
});

it("retains the pinned signed Unicode fallback width and bare uc default", /** Checks retains the pinned signed Unicode fallback width and bare uc default. @returns Test completion or assertion result. */ () => {
  expect(
    tokenize(String.raw`{\rtf1\uc-1\u233ABC}`)
      .filter(
        /** Checks é. @param token - Token. @returns Test completion or assertion result. */ (
          token,
        ) => token.kind === "text" || token.kind === "ansi-bytes",
      )
      .map(
        /** Checks é. @param token - Token. @returns Test completion or assertion result. */ (
          token,
        ) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)),
      )
      .join(""),
  ).toBe("é");
  expect(
    tokenize(String.raw`{\rtf1\uc0\uc\u233?X}`)
      .filter(
        /** Checks éX. @param token - Token. @returns Test completion or assertion result. */ (
          token,
        ) => token.kind === "text" || token.kind === "ansi-bytes",
      )
      .map(
        /** Checks éX. @param token - Token. @returns Test completion or assertion result. */ (
          token,
        ) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)),
      )
      .join(""),
  ).toBe("éX");
  expect(
    tokenize(String.raw`{\rtf1\u65536?X}`)
      .filter(
        /** Checks ?X. @param token - Token. @returns Test completion or assertion result. */ (
          token,
        ) => token.kind === "text" || token.kind === "ansi-bytes",
      )
      .map(
        /** Checks ?X. @param token - Token. @returns Test completion or assertion result. */ (
          token,
        ) => (token.kind === "text" ? token.value : new TextDecoder().decode(token.value)),
      )
      .join(""),
  ).toBe("?X");
});

it("keeps each escaped hex CR and LF for destination-aware paragraph dispatch", /** Checks keeps each escaped hex CR and LF for destination-aware paragraph dispatch. @returns Test completion or assertion result. */ () => {
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
    else
      expect(
        /** Checks rejects invalid syntax %s. @returns Test completion or assertion result. */ () =>
          tokenize(source),
      ).toThrow(RtfSyntaxError);
  },
);

it.each([
  ["{\\rtf1" + "{".repeat(1024), "RTF group nesting is too deep"],
  ["{\\rtf1}}", "Unexpected RTF group end"],
  ["{\\rtf1}X", "RTF document has trailing content"],
  ["{\\rtf1\\", "Incomplete RTF control"],
  ["{\\rtf1\\'", "Incomplete RTF hex byte"],
  ["{\\rtf1\\'a", "Incomplete RTF hex byte"],
  ["{\\rtf1\\bin-1 }", "Invalid RTF binary run length"],
  ["{\\rtf1\\bin }", "Invalid RTF binary run length"],
  ["{\\rtf1\\bin99 A}", "Invalid RTF binary run length"],
] as const)(
  "rejects malformed stream with specific boundary error: %s",
  /** Checks lexical boundary errors before native document mutation. @param source - Malformed bytes. @param message - Specific admission failure. @returns Nothing. */ (
    source,
    message,
  ) => {
    expect(
      /** Tokenizes the malformed transport. @returns No token stream. */ () => tokenize(source),
    ).toThrow(message);
  },
);

it("consumes an escaped nonletter as the Unicode fallback unit", /** Checks lexical fallback ownership without emitting a spurious formatting control. @returns Nothing. */ () => {
  expect(tokenize(String.raw`{\rtf1\uc1\u233\~X}`)).toEqual([
    { kind: "group-start" },
    { kind: "control", name: "rtf", parameter: 1 },
    { kind: "text", value: "é" },
    { kind: "ansi-bytes", value: Uint8Array.of(88) },
    { kind: "group-end" },
  ]);
});

it("rejects a truncated Shift-JIS lead at the end of an unclosed stream", /** Checks the parser's declared codepage callback without consuming nonexistent bytes. @returns Nothing. */ () => {
  const prefix = new TextEncoder().encode("{\\rtf1 ");
  const tokenizer = new RtfTokenizer(Uint8Array.from([...prefix, 0x82]));
  const events: RtfToken[] = [];
  expect(
    /** Parses the truncated encoded transport. @returns No complete document. */ () =>
      tokenizer.Parse(
        /** Captures the actual lexical events. @param token - Source token. @returns Nothing. */ (
          token,
        ) => {
          events.push(token);
        },
        /** Reports the active source encoding. @returns MS-932 codepage. */ () => 932,
      ),
  ).toThrow("Unclosed RTF group");
  expect(events).toContainEqual({ kind: "ansi-bytes", value: Uint8Array.of(0x82) });
});

it.each([32768, -32769])(
  "keeps the current Unicode fallback count for out-of-short-range uc%i",
  /** Checks original signed-short admission before changing lexical state. @param width - Invalid width. @returns Nothing. */ (
    width,
  ) => {
    const source = "{\\rtf1\\uc" + width + "\\u233?X}";
    expect(tokenize(source)).toContainEqual({ kind: "text", value: "é" });
    expect(tokenize(source)).toContainEqual({ kind: "ansi-bytes", value: Uint8Array.of(88) });
  },
);

it("uses zero for a Unicode control without a numeric argument", /** Checks the lexical default while preserving following input. @returns Nothing. */ () => {
  expect(tokenize(String.raw`{\rtf1\u?X}`)).toContainEqual({ kind: "text", value: "\0" });
  expect(tokenize(String.raw`{\rtf1\u?X}`)).toContainEqual({
    kind: "ansi-bytes",
    value: Uint8Array.of(88),
  });
});
