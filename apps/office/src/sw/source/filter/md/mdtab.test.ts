/** @fileoverview Verifies native Markdown table cursor ownership; grammar belongs to md4c. */
import { expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
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

it("retains the original nullable borrowed table pointer", /** The source getter returns null before installation and after an explicit null assignment. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("MD"),
    state = new MDTable();
  expect(state.GetTable()).toBeNull();
  state.SetTable(table);
  expect(state.GetTable()).toBe(table);
  state.SetTable(null);
  expect(state.GetTable()).toBeNull();
  doc.Dispose();
});
