/** @fileoverview Calc condition operand scanning with original nesting, delimiters and whitespace. */
import { expect, it } from "vitest";
import { ScXMLConditionHelper } from "./XMLConverter";

it.each([
  ["  (SUM(1,2)+3) , 4) trailing", ["(SUM(1,2)+3)", "4"], " trailing"],
  ['{1,(2+3)},"two,""parts""")', ["{1,(2+3)}", '"two,""parts"""'], ""],
  ["'Sheet, one'.A1, (2) )", ["'Sheet, one'.A1", "(2)"], ""],
  ["\u2000first\u2029,\u00a0second\u00a0)", ["first", "\u00a0second\u00a0"], ""],
] as const)(
  "reads source operands from %s",
  /** Verifies native quote and nesting traversal and the returned expression offset. @param source - Two operands and their delimiters. @param expected - Parsed operands. @param remaining - Text after the closing delimiter. @returns Nothing. */ (
    source,
    expected,
    remaining,
  ) => {
    const position: [number] = [0];
    expect(ScXMLConditionHelper.getExpression(source, position, ",")).toBe(expected[0]);
    expect(ScXMLConditionHelper.getExpression(source, position, ")")).toBe(expected[1]);
    expect(source.slice(position[0])).toBe(remaining);
  },
);

it.each(['"unterminated', "{1,2", "(1,2", " no delimiter "])(
  "exhausts the source on an unfinished operand %s",
  /** Checks the defined source result when no terminating delimiter is found. @param source - Unfinished operand. @returns Nothing. */ (
    source,
  ) => {
    const position: [number] = [0];
    expect(ScXMLConditionHelper.getExpression(source, position, ",")).toBe("");
    expect(position[0]).toBe(source.length);
  },
);
