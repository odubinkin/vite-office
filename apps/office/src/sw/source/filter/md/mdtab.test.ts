/** @fileoverview Verifies native Markdown table cursor ownership; grammar belongs to md4c. */
import { expect, it } from "vitest";
import { MDTable } from "./mdtab";
it("advances rows and restarts each row before column zero", /** Pins source -1 counters and row transition. @returns Nothing. */ () => {
  const state = new MDTable();
  expect(state.GetCurRow()).toBe(-1);
  expect(state.GetCurCol()).toBe(-1);
  state.IncCurRow();
  state.IncCurCol();
  expect([state.GetCurRow(), state.GetCurCol()]).toEqual([0, 0]);
  state.IncCurCol();
  state.IncCurRow();
  expect([state.GetCurRow(), state.GetCurCol()]).toEqual([1, -1]);
});
