/** @fileoverview Original strtmpl.hxx terminated boolean template and public byte C entry, including prefix admission and case boundaries. */
import { expect, it } from "vitest";
import { toBoolean } from "./strtmpl";
import { rtl_str_toBoolean } from "../inc/rtl/string.h";
it.each([
  ["", false],
  ["0", false],
  ["1", true],
  ["10", true],
  ["1false", true],
  ["true", true],
  ["TRUE", true],
  ["TrUe", true],
  ["trueish", true],
  [" true", false],
  ["false", false],
  ["t", false],
  ["tr", false],
  ["tru", false],
  ["txue", false],
  ["trxe", false],
  ["trux", false],
  ["tru\0e", false],
] as const)(
  "preserves native terminated boolean %j",
  /** Same template over declared byte and Unicode element widths. @param text - Actual test literal. @param expected - Source result. @returns Nothing. */ (
    text,
    expected,
  ) => {
    const bytes = Uint8Array.from(
      text + "\0",
      /** Actual ASCII input byte. @param c - Character. @returns Byte. */ (c) => c.charCodeAt(0),
    );
    expect(rtl_str_toBoolean(bytes)).toBe(expected);
    expect(toBoolean(Uint16Array.from(bytes))).toBe(expected);
  },
);
it("preserves the original nonnull precondition", /** No fake native provider or private field is used. @returns Nothing. */ () => {
  expect(
    /** Invalid native pointer assertion. @returns Never. */ () => rtl_str_toBoolean(null),
  ).toThrow("assert(pStr)");
});
