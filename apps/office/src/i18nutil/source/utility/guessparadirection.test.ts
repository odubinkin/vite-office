/** @fileoverview Native first-strong paragraph direction cases from test_guessparadirection.cxx. */
import { expect, it } from "vitest";
import { GuessParagraphDirection, ParagraphDirection as Direction } from "./guessparadirection";

it.each([
  ["", Direction.Ambiguous],
  ["..aاא..", Direction.LeftToRight],
  ["..אaا..", Direction.RightToLeft],
  ["..اaא..", Direction.RightToLeft],
  ["...\u2069.\u2067aaa\u2066אאא\u2069.\u2069..", Direction.Ambiguous],
  ["\u2068א\u2069a", Direction.RightToLeft],
])(
  "resolves the first strong paragraph direction of %j",
  /** Verifies native strong characters and isolate behavior. @param text - Source text. @param direction - Original result. @returns Nothing. */ (
    text,
    direction,
  ) => {
    expect(GuessParagraphDirection(text)).toBe(direction);
  },
);
