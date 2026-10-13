/** @fileoverview Original public matrix construction, resizing, geometry and complete UInt8 tag classifier observations under explicit GC resource-policy adaptation. */
import { expect, it } from "vitest";
import { ScMatrix } from "../../../inc/scmatrix";
import { ScMatValType } from "../../../inc/types";
import { GetDoubleErrorValue, FormulaError } from "../../../../formula/inc/errorcodes";
import fixture from "./native-matrix-facade-cases.json";
it("matches original public matrix construction resize and classification stream", /** Replays unchanged original source observations; native live-pool and refcount timing are excluded. @returns Nothing. */ () => {
  const lines: string[] = [];
  const limit = 536870912;
  for (const [c, r] of [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
    [limit, 1],
    [limit + 1, 1],
    [1, limit],
    [1, limit + 1],
    [limit / 2, 2],
    [limit / 2 + 1, 2],
  ] as const)
    lines.push(`alloc ${c} ${r} ${Number(ScMatrix.IsSizeAllocatable(c, r))}`);
  for (let i = 0; i < 256; ++i) {
    const t = i as ScMatValType;
    lines.push(
      `tag ${i} ${Number(ScMatrix.IsValueType(t))} ${Number(ScMatrix.IsBooleanType(t))} ${Number(ScMatrix.IsNonValueType(t))} ${Number(ScMatrix.IsRealStringType(t))} ${Number(ScMatrix.IsEmptyType(t))} ${Number(ScMatrix.IsEmptyPathType(t))}`,
    );
  }
  /** Observes actual public delegates and initial typed storage through caller-only introspection. @param label - Stage. @param matrix - Original matrix. @returns Nothing. */
  function observe(label: string, matrix: ScMatrix): void {
    const shape = { column: 99, row: 99 };
    matrix.GetDimensions(shape);
    lines.push(`${label} ${shape.column} ${shape.row} ${matrix.GetElementCount()}`);
    const data = matrix["pImpl"]["maMat"];
    for (let c = 0; c < shape.column; ++c)
      for (let r = 0; r < shape.row; ++r) {
        const value = data.get_numeric(r, c),
          error = GetDoubleErrorValue(value);
        lines.push(
          `cell ${c} ${r} ${data.get_type(r, c)} ${error} ${error === FormulaError.NONE ? value : 0}`,
        );
      }
    for (let c = 0; c < 4; ++c)
      for (let r = 0; r < 4; ++r) {
        const a = { column: c, row: r },
          b = { column: c, row: r };
        const rep = matrix.ValidColRowReplicated(a),
          either = matrix.ValidColRowOrReplicated(b);
        lines.push(
          `coord ${c} ${r} ${Number(matrix.ValidColRow(c, r))} ${Number(rep)} ${a.column} ${a.row} ${Number(either)} ${b.column} ${b.row}`,
        );
      }
  }
  for (const [c, r] of [
    [0, 0],
    [0, 2],
    [2, 0],
    [1, 1],
    [1, 3],
    [3, 1],
    [2, 3],
    [limit + 1, 1],
  ] as const) {
    lines.push(`shape ${c} ${r}`);
    const values: number[] = [];
    if (c < 10 && r < 10) for (let i = 0; i < c * r; ++i) values.push(i + 0.5);
    observe("empty", new ScMatrix(c, r));
    observe("filled", new ScMatrix(c, r, 2.5));
    observe("vector", new ScMatrix(c, r, values));
  }
  for (let mode = 0; mode < 2; ++mode) {
    const matrix = new ScMatrix(0, 0);
    lines.push(`resize ${mode}`);
    for (const [c, r] of [
      [2, 2],
      [3, 1],
      [1, 3],
      [0, 0],
      [0, 2],
      [0, 0],
      [limit + 1, 1],
      [2, 2],
      [0, 0],
      [1, 1],
      [0, 2],
    ] as const) {
      if (mode) matrix.Resize(c, r, 4.5);
      else matrix.Resize(c, r);
      observe("resized", matrix);
    }
  }
  expect(lines.join("\n") + "\n").toBe(fixture.captures.storage);
});
