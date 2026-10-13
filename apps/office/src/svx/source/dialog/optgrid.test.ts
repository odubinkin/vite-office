/** @fileoverview Full original shared grid option value/default/unsigned boundary/copy stream; original checkout/compiler not needed at runtime. */
import { expect, it } from "vitest";
import { SvxOptionsGrid } from "../../inc/optgrid";
import fixture from "./native-grid-options-cases.json";
it("matches complete original shared grid option defaults and value-copy histories", /** Replays actual original public value operations with no GUI/configuration peers. @returns Nothing. */ () => {
  const lines: string[] = [];
  /** Records every original getter, preserving UInt32 and bool values. @param label - Stage. @param a - Actual option owner. @returns Nothing. */
  function state(label: string, a: SvxOptionsGrid): void {
    lines.push(
      `${label} ${a.GetFieldDrawX()} ${a.GetFieldDivisionX()} ${a.GetFieldDrawY()} ${a.GetFieldDivisionY()} ${Number(a.GetUseGridSnap())} ${Number(a.GetSynchronize())} ${Number(a.GetGridVisible())}`,
    );
  }
  const defaults = new SvxOptionsGrid();
  state("defaults", defaults);
  for (const n of [
    -4294967297, -65537, -1, 0, 1, 100, 1000, 1270, 2147483647, 2147483648, 4294967295, 4294967296,
    4294967297,
  ])
    for (let bits = 0; bits < 8; ++bits) {
      const a = new SvxOptionsGrid();
      a.SetFieldDrawX(n);
      a.SetFieldDivisionX(n + 1);
      a.SetFieldDrawY(n + 2);
      a.SetFieldDivisionY(n + 3);
      a.SetUseGridSnap((bits & 1) !== 0);
      a.SetSynchronize((bits & 2) !== 0);
      a.SetGridVisible((bits & 4) !== 0);
      const copy = new SvxOptionsGrid(a),
        assigned = new SvxOptionsGrid();
      assigned.copy_assign(copy);
      assigned.copy_assign(assigned);
      state("value", a);
      state("copy", copy);
      state("assigned", assigned);
      a.SetFieldDrawX(3);
      a.SetFieldDivisionX(4);
      a.SetFieldDrawY(5);
      a.SetFieldDivisionY(6);
      a.SetUseGridSnap((bits & 1) === 0);
      a.SetSynchronize((bits & 2) === 0);
      a.SetGridVisible((bits & 4) === 0);
      state("changed", a);
      state("retained", copy);
      assigned.copy_assign(a);
      state("reassigned", assigned);
    }
  expect(lines.join("\n") + "\n").toBe(fixture.captures.state);
});
