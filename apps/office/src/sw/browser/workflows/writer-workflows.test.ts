/** @fileoverview Verifies shared Writer browser-workflow state invariants. */

import { describe, expect, it, vi } from "vitest";

import { WriterOperationStateController } from "./writer-workflows";

describe("WriterOperationStateController", /** Registers operation-state tests. @returns Nothing. */ function defineOperationStateTests(): void {
  it("invalidates only when pending state changes", /** Verifies duplicate pending values do not publish. @returns Nothing. */ function avoidsDuplicatePendingInvalidation(): void {
    const invalidate = vi.fn();
    const state = new WriterOperationStateController(invalidate);
    state.SetPending(false);
    expect(invalidate).not.toHaveBeenCalled();
    state.SetPending(true);
    state.SetPending(true);
    expect(state.IsPending()).toBe(true);
    expect(invalidate).toHaveBeenCalledTimes(1);
  });
});
