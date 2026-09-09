/** @fileoverview Verifies immutable transaction history, cursor selection, undo, redo, branching, and invalid state rejection. */
import { describe, expect, it } from "vitest";
import {
  applyGroupedTransaction,
  applyTransaction,
  createTransactionHistory,
  DEFAULT_MAX_UNDO_ACTION_COUNT,
  getCurrentTransactionState,
  redoTransaction,
  undoTransaction,
} from "./docundomanager";

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

  it("groups compatible actions and bounds retained undo snapshots like SfxUndoManager" /**
   * Verifies source-compatible action merging, command boundaries, and the default twenty-action capacity.
   * @returns Nothing; assertions validate grouped and bounded histories.
   */, function groupsAndBoundsHistory(): void {
    const initial = createTransactionHistory("", { position: 0 });
    const first = applyGroupedTransaction(initial, "a", { position: 1 }, "typing:word");
    const grouped = applyGroupedTransaction(first, "ab", { position: 2 }, "typing:word");
    const restarted = applyGroupedTransaction(
      grouped,
      "Xab",
      { position: 1 },
      "typing:word",
      false,
    );
    const command = applyTransaction(restarted, "Xab!", { position: 4 });
    const resumed = applyGroupedTransaction(command, "Xab!c", { position: 5 }, "typing:word");
    expect(grouped).toMatchObject({ entries: ["", "ab"], index: 1 });
    expect(restarted.entries).toEqual(["", "ab", "Xab"]);
    expect(command.activeGroup).toBeUndefined();
    expect(resumed.entries).toEqual(["", "ab", "Xab", "Xab!", "Xab!c"]);

    let bounded = initial;
    for (let index = 1; index <= DEFAULT_MAX_UNDO_ACTION_COUNT + 5; index += 1)
      bounded = applyTransaction(bounded, `${index}`, { position: index });
    expect(bounded.entries).toHaveLength(DEFAULT_MAX_UNDO_ACTION_COUNT + 1);
    expect(bounded.entries[0]).toBe("5");
    expect(getCurrentTransactionState(bounded)).toBe("25");
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
    expect(
      /** Attempts an empty grouped action identity. @returns Invalid grouped history result. */ function emptyGroup(): unknown {
        return applyGroupedTransaction(
          createTransactionHistory("one", { position: 0 }),
          "two",
          { position: 1 },
          "",
        );
      },
    ).toThrowError();
  });
});
