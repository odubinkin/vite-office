/** @fileoverview Complete original matrix-result token stream: actual matrix identity, overload-specific aliases/clones, signed dimensions and numeric mutations. */
import { gunzipSync } from "node:zlib";
import { expect, it } from "vitest";
import {
  ScMatrixToken,
  ScMatrixCellResultToken,
  ScMatrixFormulaCellToken,
} from "../../../inc/token";
import { ScMatrix } from "../../../inc/scmatrix";
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaUnknownToken,
  FormulaErrorToken,
  StackVar,
} from "../../../../formula/inc/token";
import type { FormulaConstTokenRef } from "../../../../formula/inc/types";
import type { ScMatrixRef, ScConstMatrixRef } from "../../../inc/types";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { CreateDoubleError, FormulaError } from "../../../../formula/inc/errorcodes";
import fixture from "./native-matrix-token-cases.json";
it("matches original matrix result token reference and mutation stream", /** Replays complete original legal token operations with genuine matrix/string/token owners. @returns Nothing. */ () => {
  const lines: string[] = [],
    a = new ScMatrix(2, 3, 2.5),
    b = new ScMatrix(1, 1, 4.5),
    number = new FormulaDoubleToken(2.5),
    text = new OUString(new Uint16Array([65]), 1),
    shared = new SharedString(text),
    string = new FormulaStringToken(shared),
    unknown = new FormulaUnknownToken(OpCode.ocBad),
    error = new FormulaErrorToken(FormulaError.DivisionByZero);
  /** Encodes the original IEEE payload without formatting or canonicalization. @param value - Number. @returns Unsigned native bits. */
  function bits(value: number): string {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value, true);
    return view.getBigUint64(0, true).toString();
  }
  /** Records complete query state and identity observations, never raw addresses or counts. @param label - Stage. @param value - Matrix result token. @param expected - Expected original upper-left reference. @returns Nothing. */
  function state(
    label: string,
    value: ScMatrixCellResultToken,
    expected: FormulaConstTokenRef = null,
  ): void {
    const m = value.GetMatrix(),
      ul = value.GetUpperLeftToken();
    let line = `${label} ${value.GetType()} ${value.GetOpCode()} ${m === null ? 0 : m === a ? 1 : m === b ? 2 : 3}`;
    if (m) {
      const dims = { column: 0, row: 0 };
      m.GetDimensions(dims);
      line += ` ${dims.column} ${dims.row}`;
    }
    line += ` | ${value.GetUpperLeftType()} ${Number(ul === expected)}`;
    if (ul && ul.GetType() === StackVar.svDouble)
      line += ` ${bits((ul as FormulaDoubleToken).GetDouble())}`;
    if (value instanceof ScMatrixFormulaCellToken) {
      const dims = { column: 99, row: 99 };
      value.GetMatColsRows(dims);
      line += ` | ${value.GetMatCols()} ${value.GetMatRows()} ${dims.column} ${dims.row}`;
    }
    lines.push(line);
  }
  for (const m of [null, a, b] as ScMatrixRef[]) {
    const t = new ScMatrixToken(m),
      copy = new ScMatrixToken(t),
      clone = t.Clone();
    lines.push(
      `matrix ${t.GetType()} ${t.GetOpCode()} ${Number(t.GetMatrix() === m)} ${Number(copy.equals(t))} ${Number(t.equals(clone))} ${Number(t.IsMatrixRangeToken())} ${Number(t.equals(number))}`,
    );
  }
  const at = new ScMatrixToken(a),
    bt = new ScMatrixToken(b),
    nt = new ScMatrixToken(null);
  lines.push(`matrix_distinct ${Number(at.equals(bt))} ${Number(at.equals(nt))}`);
  for (const m of [null, a, b] as ScConstMatrixRef[])
    for (const ul of [null, number, string, unknown, error] as FormulaConstTokenRef[]) {
      const v = new ScMatrixCellResultToken(m, ul),
        copy = new ScMatrixCellResultToken(v),
        clone = v.Clone();
      state("result", v, ul);
      state("resultcopy", copy, ul);
      state("resultclone", clone, ul);
      const diff = new ScMatrixCellResultToken(m, ul ? null : number),
        diffmat = new ScMatrixCellResultToken(m ? null : a, null);
      lines.push(
        `result_equal ${Number(v.equals(copy))} ${Number(v.equals(clone))} ${Number(v.equals(diff))} ${Number(v.equals(diffmat))} ${Number(v.equals(number))}`,
      );
      copy.Assign(copy);
      state("resultself", copy, ul);
      copy.Assign(diff);
      state("resultassigned", copy, diff.GetUpperLeftToken());
    }
  for (const ul of [null, number, string, unknown, error] as FormulaConstTokenRef[]) {
    const v = new ScMatrixFormulaCellToken(2, 3, a, ul),
      copy = new ScMatrixFormulaCellToken(v),
      clone = v.Clone();
    state("formula", v, ul);
    state("formulacopy", copy, v.GetUpperLeftToken());
    state("formulaclone", clone, v.GetUpperLeftToken());
    const base = new ScMatrixCellResultToken(a, ul),
      dimension = new ScMatrixFormulaCellToken(copy);
    let line = `formula_equal ${Number(v.equals(copy))} ${Number(v.equals(clone))} ${Number(v.equals(number))} ${Number(v.equals(base))}`;
    dimension.SetMatColsRows(3, 3);
    line += ` ${Number(copy.equals(dimension))}`;
    dimension.SetMatColsRows(2, 4);
    line += ` ${Number(copy.equals(dimension))}`;
    lines.push(line);
    v.SetUpperLeftDouble(4.5);
    state("formula_changed", v, ul);
    state("copy_retained", copy, ul);
    v.ResetResult();
    state("reset", v);
    v.SetUpperLeftDouble(-0);
    state("reset_double", v);
  }
  const numeric = new ScMatrixCellResultToken(a, number),
    typed = new ScMatrixFormulaCellToken(7, 8),
    generic = new ScMatrixFormulaCellToken(7, 8);
  typed.Assign(numeric);
  generic.Assign(numeric, FormulaToken);
  state("typed", typed, number);
  state("generic", generic, number);
  generic.SetUpperLeftDouble(9.5);
  state("typed_after_alias", typed, number);
  state("source_after_alias", numeric, number);
  let old = typed.GetUpperLeftToken();
  typed.Assign(typed);
  state("typed_self", typed, old);
  old = generic.GetUpperLeftToken();
  generic.Assign(generic, FormulaToken);
  state("generic_self", generic, old);
  ScMatrixCellResultToken.prototype.Assign.call(typed, numeric);
  state("basequalified", typed, number);
  generic.Assign(at, FormulaToken);
  state("assign_matrix", generic);
  generic.Assign(string, FormulaToken);
  state("assign_string", generic, string);
  generic.Assign(number, FormulaToken);
  state("assign_number", generic, number);
  generic.Assign(unknown, FormulaToken);
  state("assign_unknown", generic, unknown);
  for (const c of [-65537, -32769, -1, 0, 1, 32767, 32768, 65536])
    for (const r of [-2147483649, -1, 0, 1, 2147483647, 2147483648]) {
      const v = new ScMatrixFormulaCellToken(c, r);
      state("dimension", v);
      v.SetMatColsRows(c + 1, r + 1);
      state("setdimension", v);
    }
  const numbers = Array<number | undefined>(5).fill(undefined);
  numbers[0] = 0;
  numbers[1] = -0;
  numbers[2] = 2.5;
  numbers[3] = Infinity;
  numbers[4] = CreateDoubleError(FormulaError.MatrixSize);
  for (const n of numbers) {
    const source = new FormulaDoubleToken(n as number),
      v = new ScMatrixFormulaCellToken(2, 3, a, source);
    state("payload", v, source);
    v.SetUpperLeftDouble(n as number);
    state("payloadset", v, source);
  }
  expect(lines.join("\n") + "\n").toBe(
    gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64")).toString("utf8"),
  );
  string.dispose();
  shared.dispose();
  text.dispose();
});
