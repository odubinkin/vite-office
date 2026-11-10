/** @fileoverview Original Unicode convertLineEnd outcomes including opposite pairs, unchanged sharing and source trailing-CR behavior. */
import { expect, it } from "vitest";
import { convertLineEnd, LineEnd } from "../../inc/lineend";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

it.each([
  ["", ["", "", ""]],
  ["A", ["A", "A", "A"]],
  ["\r", ["\r", "\n", "\r"]],
  ["\n", ["\r", "\n", "\r\n"]],
  ["\r\n", ["\r", "\n", "\r\n"]],
  ["\n\r", ["\r", "\n", "\r\n"]],
  ["\r\r", ["\r\r", "\n\n", "\r\n\r\n"]],
  ["\n\n", ["\r\r", "\n\n", "\r\n\r\n"]],
  ["\r\n\r", ["\r\r", "\n\n", "\r\n\r"]],
  ["\n\r\n", ["\r\r", "\n\n", "\r\n\r\n"]],
  ["A\r", ["A\r", "A\n", "A\r"]],
  ["A\rB", ["A\rB", "A\nB", "A\r\nB"]],
  ["A\n\rB\r", ["A\rB\r", "A\nB\n", "A\r\nB\r\n"]],
  [
    "\u0000\ud800\rA\n\udfff",
    ["\u0000\ud800\rA\r\udfff", "\u0000\ud800\nA\n\udfff", "\u0000\ud800\r\nA\r\n\udfff"],
  ],
] as const)(
  "retains source conversion of %j",
  /** Expected values are explicit pinned source cases, not an alternate normalization algorithm. @param value - Raw input. @param expected - CR/LF/CRLF outputs in original enum order. @returns Nothing. */ (
    value,
    expected,
  ) => {
    const input = unicode(value);
    try {
      for (const target of [LineEnd.LINEEND_CR, LineEnd.LINEEND_LF, LineEnd.LINEEND_CRLF]) {
        const result = convertLineEnd(input, target);
        try {
          expect(text(result)).toBe(expected[target]);
          expect(text(input)).toBe(value);
        } finally {
          result.dispose();
        }
      }
    } finally {
      input.dispose();
    }
  },
);

it("shares unchanged native data but returns a separate owned handle", /** A trailing bare CR remains unchanged for CRLF only when the original first pass did not trigger conversion elsewhere. @returns Nothing. */ () => {
  const input = unicode("A\r\nB\r"),
    result = convertLineEnd(input, LineEnd.LINEEND_CRLF);
  try {
    expect(result).not.toBe(input);
    expect(result.pData).toBe(input.pData);
    input.clear();
    expect(text(result)).toBe("A\r\nB\r");
  } finally {
    result.dispose();
    input.dispose();
  }
});
