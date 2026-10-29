/** @fileoverview Original scanner ASCII-blank helper distinguishes empty logical strings and non-ASCII whitespace. */
import { expect, it } from "vitest";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { lcl_isBlanks } from "./zforfind.context";
it.each([
  ["", false],
  [" ", true],
  ["   ", true],
  ["\t", false],
  ["\u00a0", false],
  [" \0", false],
] as const)(
  "classifies logical blank fragment %j",
  /** Empty strings and Unicode whitespace do not count as source ASCII spaces. @param text - Logical UTF16 input. @param expected - Source ASCII-space contract. @returns Nothing. */ (
    text,
    expected,
  ) => {
    const value = unicode(text);
    try {
      expect(lcl_isBlanks(value)).toBe(expected);
    } finally {
      value.dispose();
    }
  },
);
