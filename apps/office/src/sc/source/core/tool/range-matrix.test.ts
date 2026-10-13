/** @fileoverview Full original initialized range-matrix/cell-state/token stream with real matrix/data/base owners; no physical memory observations. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import { RangeMatrix, MultiDataCellState } from "../../../inc/types";
import { ScMatrix } from "../../../inc/scmatrix";
import { ScMatrixRangeToken, ScMatrixToken } from "../../../inc/token";
import { FormulaDoubleToken } from "../../../../formula/inc/token";
import fixture from "./native-range-matrix-cases.json";
it("matches original range matrix, column cell state and range-token value stream", /** Replays complete initialized original public value/move/width/member operations. @returns Nothing. */ () => {
  const lines: string[] = [],
    x = new ScMatrix(2, 3, 2.5),
    y = new ScMatrix(1, 1, 4.5),
    number = new FormulaDoubleToken(2.5);
  /** Records the actual range/cell-state fields and predicate. @param label - Stage. @param a - Initialized owner. @returns Nothing. */
  function state(label: string, a: RangeMatrix | MultiDataCellState): void {
    if (a instanceof RangeMatrix)
      lines.push(
        `${label} ${a.mpMat ? (a.mpMat === x ? 1 : a.mpMat === y ? 2 : 3) : 0} ${a.mnCol1} ${a.mnRow1} ${a.mnTab1} ${a.mnCol2} ${a.mnRow2} ${a.mnTab2} ${Number(a.isRangeValid())}`,
      );
    else lines.push(`${label} ${a.mnRow1} ${a.mnCol1} ${a.meState}`);
  }
  /** Records genuine matrix identity/dimensions and raw narrowed endpoint data. @param label - Stage. @param a - Token. @returns Nothing. */
  function token(label: string, a: ScMatrixRangeToken): void {
    const m = a.GetMatrix(),
      r = a.GetDoubleRef();
    let line = `${label} ${a.GetType()} ${a.GetOpCode()} ${Number(a.IsMatrixRangeToken())} ${m ? (m === x ? 1 : m === y ? 2 : 3) : 0}`;
    if (m) {
      const dims = { column: 0, row: 0 };
      m.GetDimensions(dims);
      line += ` ${dims.column} ${dims.row}`;
    }
    line += ` | ${r.Ref1.Col()} ${r.Ref1.Row()} ${r.Ref1.Tab()} ${r.Ref1.FlagValue()} ${r.Ref2.Col()} ${r.Ref2.Row()} ${r.Ref2.Tab()} ${r.Ref2.FlagValue()} ${Number(r.bTrimToData)}`;
    lines.push(line);
  }
  const defaults = new RangeMatrix();
  state("default", defaults);
  const defaultCell = new MultiDataCellState();
  state("defaultcell", defaultCell);
  for (const m of [null, x, y]) {
    const a = new RangeMatrix();
    a.mpMat = m;
    a.mnCol1 = 1;
    a.mnRow1 = 2;
    a.mnTab1 = 3;
    a.mnCol2 = 4;
    a.mnRow2 = 5;
    a.mnTab2 = 6;
    const copy = new RangeMatrix(a),
      assigned = new RangeMatrix();
    assigned.copy_assign(copy);
    assigned.copy_assign(assigned);
    const moved = RangeMatrix.move(a);
    state("valuecopy", copy);
    state("valueassigned", assigned);
    state("valuemoved", moved);
    state("valuesource", a);
    const target = new RangeMatrix();
    target.mpMat = y;
    target.move_assign(copy);
    state("valuemoveassigned", target);
    state("valueassignsource", copy);
    target.move_assign(target);
    state("valueselfmove", target);
    const t = new ScMatrixRangeToken(moved),
      tc = new ScMatrixRangeToken(t),
      cl = t.Clone();
    token("token", t);
    token("tokencopy", tc);
    token("tokenclone", cl);
    const ref = t.GetDoubleRef();
    moved.mpMat = y;
    moved.mnCol1 = 8;
    token("tokenretained", t);
    lines.push(
      `tokenidentity ${Number(ref === t.GetDoubleRef())} ${Number(ref !== tc.GetDoubleRef())} ${Number(ref !== cl.GetDoubleRef())} ${Number(t.equals(tc))} ${Number(t.equals(cl))} ${Number(t.equals(number))}`,
    );
    const diff = new RangeMatrix(assigned);
    diff.mnCol1 = 0;
    diff.mnRow2 = 25;
    const dt = new ScMatrixRangeToken(diff),
      base = new ScMatrixToken(m),
      other = new ScMatrixRangeToken(defaults);
    lines.push(
      `rangeequal ${Number(t.equals(dt))} ${Number(t.TextEqual(dt))} ${Number(t.equals(base))} ${Number(t.equals(other))}`,
    );
  }
  const fields = ["mnCol1", "mnRow1", "mnTab1", "mnCol2", "mnRow2", "mnTab2"] as const;
  for (const field of fields)
    for (const n of [
      -2147483649, -65537, -1, 0, 1, 32767, 32768, 65535, 65536, 2147483647, 2147483648,
    ]) {
      const a = new RangeMatrix();
      a.mpMat = x;
      a.mnCol1 = 0;
      a.mnRow1 = 0;
      a.mnTab1 = 0;
      a.mnCol2 = 10;
      a.mnRow2 = 10;
      a.mnTab2 = 10;
      a[field] = n;
      state("width", a);
      const t = new ScMatrixRangeToken(a);
      token("narrowtoken", t);
    }
  for (let bits = 0; bits < 512; ++bits) {
    const a = new RangeMatrix();
    a.mnCol1 = bits & 1 ? -1 : 0;
    a.mnRow1 = bits & 2 ? -1 : 0;
    a.mnTab1 = bits & 4 ? -1 : 0;
    a.mnCol2 = bits & 8 ? -1 : bits & 64 ? -2 : 1;
    a.mnRow2 = bits & 16 ? -1 : bits & 128 ? -2 : 1;
    a.mnTab2 = bits & 32 ? -1 : bits & 256 ? -2 : 1;
    state("validity", a);
  }
  for (const stateValue of [-257, -1, 0, 1, 2, 3, 4, 255, 256, 257])
    for (const row of [-2147483649, -1, 0, 2147483647, 2147483648])
      for (const col of [-65537, -32769, -1, 0, 32767, 32768, 65536]) {
        const a = new MultiDataCellState(stateValue);
        a.mnRow1 = row;
        a.mnCol1 = col;
        const copy = new MultiDataCellState(a),
          assigned = new MultiDataCellState();
        assigned.copy_assign(copy);
        assigned.copy_assign(assigned);
        state("cell", a);
        state("cellcopy", copy);
        state("cellassigned", assigned);
        a.mnRow1 = 5;
        a.mnCol1 = 6;
        a.meState = MultiDataCellState.StateType.HasMultipleCells;
        state("cellchanged", a);
        state("cellretained", copy);
      }
  expect(lines.join("\n") + "\n").toBe(
    gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64")).toString("utf8"),
  );
});
