/** @fileoverview Ports the pinned Unicode escape QA and checks the native code-point boundary. */
import { expect, it } from "vitest";
import { processUnicodeEscapes } from "./unicodeescape";

it.each([
  [String.raw`\u0041`, "A"],
  [String.raw`\u0041\u0042\u0043`, "ABC"],
  [String.raw`Hello \u0041 World`, "Hello A World"],
  [String.raw`\U00000041`, "A"],
  [String.raw`\\u0041`, String.raw`\u0041`],
  [String.raw`\uXYZW`, String.raw`\uXYZW`],
  [String.raw`\u004`, String.raw`\u004`],
  [String.raw`\u000A`, "\n"],
  [String.raw`\u0009`, "\t"],
  [String.raw`\u000D`, "\r"],
  [String.raw`\u0000`, String.raw`\u0000`],
  [String.raw`\\uXYZW`, String.raw`\uXYZW`],
  [String.raw`\U0001F600`, "😀"],
  [String.raw`\uD800\U0000DC00`, "\uD800\uDC00"],
  [String.raw`\U00110000`, String.raw`\U00110000`],
  [String.raw`\UFFFFFFFF`, String.raw`\UFFFFFFFF`],
  [String.raw`\u00412`, "A2"],
])(
  "preserves the Unicode escape behavior for %s",
  /** Replays source QA using real Unicode string values. @param source - Native escaped input. @param expected - Expected UTF-16. @returns Nothing. */
  (source, expected) => {
    const input = Uint16Array.from(
      { length: source.length },
      /** Copies one UTF-16 unit. @param unused - Input slot. @param index - Code-unit index. @returns Raw unit. */
      (_unused, index) => source.charCodeAt(index),
    );
    const actual = processUnicodeEscapes(input);
    try {
      expect(String.fromCharCode(...actual.getStr().subarray(0, actual.getLength()))).toBe(
        expected,
      );
    } finally {
      actual.dispose();
    }
  },
);
