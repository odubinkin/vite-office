/** @fileoverview Complete original matrix coordinate value/flag/type stream over actual shared string and mdds owners. */
import { expect, it } from "vitest";
import { ScMatrix } from "../../../inc/scmatrix";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import {
  uint16_element_callbacks,
  boolean_element_callbacks,
} from "../../../../external/mdds/include/mdds/multi_type_vector/standard_element_blocks";
import fixture from "./native-matrix-values-cases.json";
it("matches original coordinate matrix value flag and predicate stream", /** Replays unchanged production-mode source observations, preserving owned returned values and original flag transitions. @returns Nothing. */ () => {
  const lines: string[] = [],
    text = new OUString(new Uint16Array([65, 0, 937]), 3),
    string = new SharedString(text);
  /** Observes only actual public value and predicate operations. @param label - Stage. @param matrix - Original matrix owner. @returns Nothing. */
  function observe(label: string, matrix: ScMatrix): void {
    const shape = { column: 99, row: 99 };
    matrix.GetDimensions(shape);
    lines.push(`${label} ${shape.column} ${shape.row} ${Number(matrix.IsNumeric())}`);
    for (let c = 0; c < 4; ++c)
      for (let r = 0; r < 4; ++r) {
        const value = matrix.Get(c, r),
          error = value.GetError(),
          data = value.GetString().getData();
        let line = `value ${c} ${r} ${value.nType} ${error} ${error === FormulaError.NONE ? value.fVal : 0} ${value.GetString().getLength()}`;
        if (data) for (let i = 0; i < data.length; ++i) line += ` ${data.buffer[i]}`;
        line += ` | ${Number(matrix.IsStringOrEmpty(c, r))} ${Number(matrix.IsEmpty(c, r))} ${Number(matrix.IsEmptyCell(c, r))} ${Number(matrix.IsEmptyResult(c, r))} ${Number(matrix.IsEmptyPath(c, r))} ${Number(matrix.IsValue(c, r))} ${Number(matrix.IsValueOrEmpty(c, r))} ${Number(matrix.IsBoolean(c, r))}`;
        lines.push(line);
        value.dispose();
      }
  }
  for (const [c, r] of [
    [0, 0],
    [1, 1],
    [1, 3],
    [3, 1],
    [2, 3],
  ] as const) {
    const matrix = new ScMatrix(c, r);
    lines.push(`shape ${c} ${r}`);
    observe("initial", matrix);
    matrix.PutDouble(2.5, 0, 0);
    observe("number", matrix);
    matrix.PutString(string, 0, 0);
    observe("string", matrix);
    matrix.PutBoolean(false, 0, 0);
    observe("false", matrix);
    matrix.PutBoolean(true, 0, 0);
    observe("true", matrix);
    matrix.PutEmptyPath(0, 0);
    observe("path", matrix);
    matrix.PutDouble(3.5, 0, 0);
    observe("numberafterpath", matrix);
    matrix.PutString(string, 0, 0);
    observe("stringafterpath", matrix);
    matrix.PutEmptyResultVector(1, 0, 0);
    observe("result", matrix);
    matrix.PutEmpty(0, 0);
    observe("empty", matrix);
    matrix.PutEmptyResultVector(0, 0, 0);
    matrix.PutEmptyResultVector(1, 5, 0);
    matrix.PutEmptyResultVector(5, 0, 0);
    matrix.PutDouble(99, 5, 5);
    matrix.PutString(string, 5, 5);
    matrix.PutBoolean(true, 5, 5);
    matrix.PutEmptyPath(5, 5);
    matrix.PutEmpty(5, 5);
    observe("invalidwrites", matrix);
    if (c && r) {
      matrix.PutError(FormulaError.MatrixSize, 0, 0);
      observe("error", matrix);
      matrix.PutEmpty(0, 0);
      const held = matrix.Get(0, 0);
      matrix.PutString(string, 0, 0);
      const copied = matrix.Get(0, 0);
      held.assign(copied);
      copied.dispose();
      matrix.PutEmpty(0, 0);
      lines.push(`held ${held.GetString().getLength()} ${held.GetString().getData()?.buffer[0]}`);
      held.dispose();
    }
    matrix["pImpl"].Clear();
  }
  const internal = new ScMatrix(2, 2);
  internal["pImpl"]["maMat"].set(0, 0, 7, uint16_element_callbacks);
  internal["pImpl"]["maMatFlag"].set(1, 0, true, boolean_element_callbacks);
  observe("internaltypes", internal);
  internal.PutEmptyResultVector(2, 1, 0);
  observe("resultvector", internal);
  const bounded = new ScMatrix(2, 2);
  bounded.PutError(FormulaError.StackOverflow, 0, 3);
  observe("uncheckederror", bounded);
  try {
    bounded.PutError(FormulaError.StackOverflow, 9, 0);
    lines.push("errorwrite accepted");
  } catch (error) {
    lines.push(`errorwrite ${(error as Error).message}`);
  }
  expect(lines.join("\n") + "\n").toBe(fixture.captures.storage);
  internal["pImpl"].Clear();
  bounded["pImpl"].Clear();
  string.dispose();
  text.dispose();
});
