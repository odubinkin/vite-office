/** @fileoverview Portable regressions against unchanged ICU78.3 public bundle API observations, including actual fallback, aliases and lifetime bookkeeping. */
import { expect, it } from "vitest";
import observations from "./uresbund.native-observations.json";
import { observeNativeBundle } from "../../../../test/icu-resource-observations";
it.each(observations.cases)(
  "matches native bundle query %s",
  /** Replays the actual reader with original resource corpus. @param query - Native operands. @param expected - Original library observation. @returns Nothing. */ (
    query,
    expected,
  ) => {
    expect(observeNativeBundle(query)).toBe(expected);
  },
);
