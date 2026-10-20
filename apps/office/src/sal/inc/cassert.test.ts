/** @fileoverview Checked compiler assertion diagnostics and single-evaluation contract; no process-abort or NDEBUG parity claim. */
import { expect, it } from "vitest";
import { assert } from "./cassert";
it("preserves single predicate evaluation and distinguishes checked assertions from UNO errors", /** The caller evaluates its original condition once before the intrinsic receives it. @returns Nothing. */ () => {
  let evaluations = 0;
  assert(++evaluations === 1, "first condition");
  expect(evaluations).toBe(1);
  expect(
    /** Failing native invariant uses the established browser Error binding. @returns Nothing. */ () =>
      assert(++evaluations === 1, "second condition"),
  ).toThrowError(new Error("assert(second condition)"));
  expect(evaluations).toBe(2);
});
