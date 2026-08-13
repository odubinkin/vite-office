/** @fileoverview Verifies immutable transaction history, cursor selection, undo, redo, branching, and invalid state rejection. */
import { describe, expect, it } from "vitest";
import {
  applyTransaction,
  createTransactionHistory,
  getCurrentTransactionState,
  redoTransaction,
  undoTransaction,
} from "./history";

describe("transaction history" /**
 * Groups pure history transition tests.
 * @returns Nothing; Vitest registers cases.
 */, function defineHistoryTests(): void {
  it("applies, undoes, redoes, and truncates redo branches immutably" /**
   * Verifies chronological state and selection transitions.
   * @returns Nothing; assertions validate transitions.
   */, function transitionsHistory(): void {
    const initial = createTransactionHistory("one", { position: 0 });
    const two = applyTransaction(initial, "two", { position: 2 });
    const three = applyTransaction(two, "three", { position: 3 });
    const undone = undoTransaction(three, { position: 2 });
    const branched = applyTransaction(undone, "four", { position: 4 });
    expect(initial).toEqual({ entries: ["one"], index: 0, selection: { position: 0 } });
    expect(getCurrentTransactionState(undone)).toBe("two");
    expect(redoTransaction(undone, { position: 3 })).toMatchObject({
      index: 2,
      selection: { position: 3 },
    });
    expect(branched).toEqual({
      entries: ["one", "two", "four"],
      index: 2,
      selection: { position: 4 },
    });
    expect(undoTransaction(initial, { position: 0 })).toBe(initial);
    expect(redoTransaction(branched, { position: 4 })).toBe(branched);
  });

  it("rejects invalid selection and malformed history bounds" /**
   * Verifies invalid inputs never produce partial transitions.
   * @returns Nothing; assertions validate errors.
   */, function rejectsInvalidHistory(): void {
    expect(
      /** Attempts negative selection creation. @returns Invalid history creation result. */ function negative(): unknown {
        return createTransactionHistory("one", { position: -1 });
      },
    ).toThrowError();
    expect(
      /** Attempts fractional selection creation. @returns Invalid history creation result. */ function fractional(): unknown {
        return createTransactionHistory("one", { position: 0.5 });
      },
    ).toThrowError();
    expect(
      /** Attempts malformed current-state access. @returns Invalid current-state result. */ function malformed(): unknown {
        return getCurrentTransactionState({ entries: [], index: 0, selection: { position: 0 } });
      },
    ).toThrowError();
  });
});
