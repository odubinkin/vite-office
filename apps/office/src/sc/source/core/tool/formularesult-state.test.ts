/** @fileoverview Complete original ScFormulaResult legal state/copy/import/query stream over genuine token/matrix/value owners, without private-state or native lifetime forcing. */
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { ScFormulaResult } from "../../../inc/formularesult";
import { ScMatrix } from "../../../inc/scmatrix";
import {
  ScEmptyCellToken,
  ScHybridCellToken,
  ScMatrixCellResultToken,
  ScMatrixFormulaCellToken,
  ScMatrixToken,
} from "../../../inc/token";
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaUnknownToken,
  FormulaMissingToken,
  FormulaErrorToken,
  StackVar,
} from "../../../../formula/inc/token";
import type { FormulaConstTokenRef } from "../../../../formula/inc/types";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { FormulaError, CreateDoubleError } from "../../../../formula/inc/errorcodes";
import fixture from "./native-formula-result-cases.json";
it("matches complete original formula result state and hybrid import stream", /** Replays original initialized public state histories and genuine token aliases. @returns Nothing. */ () => {
  const lines: string[] = [],
    ma = new ScMatrix(2, 3, 2.5),
    mb = new ScMatrix(1, 1, 4.5),
    ta = new OUString(new Uint16Array([65, 0, 937]), 3),
    tl = new OUString(new Uint16Array([65, 10, 66]), 3),
    tr = new OUString(new Uint16Array([65, 13, 66]), 3),
    formula = new OUString(new Uint16Array([61, 65, 49]), 3),
    sa = new SharedString(ta),
    sl = new SharedString(tl),
    sr = new SharedString(tr),
    empty = SharedString.getEmptyString();
  const inputs: FormulaToken[] = [
    new FormulaDoubleToken(2.5),
    new FormulaDoubleToken(-0),
    new FormulaDoubleToken(CreateDoubleError(FormulaError.MatrixSize)),
    new FormulaErrorToken(FormulaError.NONE),
    new FormulaErrorToken(FormulaError.DivisionByZero),
    new ScEmptyCellToken(false, false),
    new ScEmptyCellToken(true, true),
    new FormulaStringToken(sa),
    new FormulaStringToken(sl),
    new FormulaStringToken(sr),
    new FormulaUnknownToken(OpCode.ocBad),
    new FormulaMissingToken(),
    new ScHybridCellToken(2.5, sa, formula, false),
    new ScHybridCellToken(0, empty, formula, true),
  ];
  inputs.push(
    new ScMatrixFormulaCellToken(7, 8, mb, inputs[0] as FormulaToken),
    new ScMatrixToken(ma),
    new FormulaToken(StackVar.svMatrixCell),
    new ScMatrixCellResultToken(mb, inputs[0] as FormulaToken),
  );
  /** Records identity against genuine source owners, omitting actual addresses/counts. @param token - Borrowed token. @returns Stable source identity. */
  function tokenid(token: FormulaConstTokenRef): number {
    if (!token) return -1;
    const index = inputs.indexOf(token as FormulaToken);
    return index === -1 ? 999 : index;
  }
  /** Renders original initialized Unicode units, including embedded NUL. @param value - String view. @returns Native length/units. */
  function text(value: OUStringConstReference): string {
    let result = String(value.getLength());
    for (let i = 0; i < value.getLength(); ++i) result += `,${value.getStr()[i]}`;
    return result;
  }
  /** Renders actual shared value validity and contents. @param value - Shared view. @returns Native value. */
  function string(value: SharedStringConstReference): string {
    return `${Number(value.isValid())},${text(value.getString())}`;
  }
  /** Reads IEEE payload without number formatting/canonicalization. @param value - Numeric value. @returns UInt64 bits. */
  function bits(value: number): string {
    const view = new DataView(new ArrayBuffer(8));
    view.setFloat64(0, value, true);
    return view.getBigUint64(0, true).toString();
  }
  /** Observes full original result state; query cache effects and caller out-reference preservation are part of the stream. @param label - Stage. @param value - Actual owner. @returns Nothing. */
  function state(label: string, value: ScFormulaResult): void {
    const result = value.GetResult(),
      matrix = value.GetMatrix(),
      stored = value.GetMatrixFormulaCellToken();
    let line = `${label} ${value.GetType()} ${value.GetCellResultType()} ${Number(value.IsEmptyDisplayedAsString())} ${Number(value.IsValue())} ${Number(value.IsValueNoError())} ${Number(value.IsMultiline())} ${value.GetResultError()} ${bits(value.GetDouble())} ${tokenid(value.GetToken())} ${tokenid(value.GetCellResultToken())} ${matrix === null ? 0 : matrix === ma ? 1 : matrix === mb ? 2 : 3} | ${string(value.GetString())} | `;
    const hybridFormula = value.GetHybridFormula();
    line += text(hybridFormula);
    hybridFormula.dispose();
    line += ` | ${stored ? `${stored.GetMatCols()},${stored.GetMatRows()},${stored.GetUpperLeftType()}` : "-"} | ${result.meType},${result.mnError},${bits(result.mfValue)},${Number(result.mbMultiLine)},${string(result.maString)}`;
    for (const seed of [FormulaError.NONE, FormulaError.DivisionByZero]) {
      const out = { error: seed, value: -13.5 },
        ok = value.GetErrorOrDouble(out);
      line += ` | ${Number(ok)},${out.error},${bits(out.value)}`;
    }
    lines.push(line);
    result.dispose();
  }
  const initial = new ScFormulaResult();
  state("default", initial);
  const initialcopy = new ScFormulaResult(initial);
  state("defaultcopy", initialcopy);
  const nullValue = new ScFormulaResult(null);
  state("null", nullValue);
  initial.HandleStuffAfterParallelCalculation();
  state("parallel", initial);
  for (let i = 0; i < 16; ++i)
    for (const err of [FormulaError.NONE, FormulaError.IllegalArgument]) {
      lines.push(`input ${i} ${err}`);
      const value = new ScFormulaResult(inputs[i] as FormulaToken);
      value.SetResultError(err);
      state("source", value);
      const copy = new ScFormulaResult(value);
      state("copy", copy);
      lines.push(`copy_identity ${Number(value.GetToken() === copy.GetToken())}`);
      copy.Assign(copy);
      state("self", copy);
      for (let target = 0; target < 5; ++target) {
        const d = new ScFormulaResult();
        if (target === 1) d.SetDouble(4.5);
        if (target === 2) d.SetToken(inputs[7] as FormulaToken);
        if (target >= 3) d.SetMatrix(target === 3 ? 2 : 0, 3, ma, null);
        expect(d.assign(value)).toBe(d);
        state("assigned", d);
        d.SetResultError(FormulaError.NONE);
        state("clearerror", d);
        d.SetDouble(-3.5);
        state("setdouble", d);
        d.SetToken(null);
        state("setnull", d);
      }
    }
  for (const [column, row] of [
    [2, 3],
    [0, 3],
    [2, 0],
  ] as [number, number][]) {
    const value = new ScFormulaResult();
    value.SetMatrix(column, row, ma, null);
    for (let i = 0; i < 18; ++i)
      if ([14, 16, 17, 0, 4, 6, 7, 8, 11, 15].includes(i)) {
        lines.push(`matrix_input ${column} ${row} ${i}`);
        value.SetToken(inputs[i] as FormulaToken);
        state("matrix_updated", value);
        value.SetResultError(FormulaError.DivisionByZero);
        state("matrix_error", value);
        value.SetResultError(FormulaError.NONE);
        state("matrix_clear", value);
      }
    value.SetToken(null);
    state("matrix_null", value);
    value.SetHybridDouble(9.5);
    state("matrix_hybrid_double", value);
  }
  for (let kind = 0; kind < 4; ++kind) {
    lines.push(`hybrid ${kind}`);
    const value = new ScFormulaResult();
    if (kind === 1) value.SetDouble(4.5);
    if (kind === 2) value.SetToken(inputs[7] as FormulaToken);
    if (kind === 3) value.SetToken(inputs[12] as FormulaToken);
    value.SetHybridDouble(2.5);
    state("hybrid_double", value);
    value.SetHybridString(sl);
    state("hybrid_string", value);
    value.SetHybridFormula(formula);
    state("hybrid_formula", value);
    value.SetHybridDouble(-0);
    state("hybrid_again", value);
    value.SetHybridString(empty);
    value.SetHybridEmptyDisplayedAsString();
    state("hybrid_empty", value);
    value.HandleStuffAfterParallelCalculation();
    state("hybrid_parallel", value);
  }
  const cached = new ScFormulaResult(inputs[7] as FormulaToken);
  state("cache_before", cached);
  (inputs[7] as FormulaStringToken).SetString(sl);
  state("cache_after_mutation", cached);
  cached.SetToken(inputs[7] as FormulaToken);
  state("cache_reset", cached);
  (inputs[7] as FormulaStringToken).SetString(sa);
  const matrixcopy = new ScFormulaResult();
  matrixcopy.SetMatrix(2, 3, ma, inputs[0] as FormulaToken);
  const other = new ScFormulaResult(matrixcopy);
  const storedMatrix = other.GetMatrixFormulaCellTokenNonConst();
  expect(storedMatrix).toBeInstanceOf(ScMatrixFormulaCellToken);
  (storedMatrix as ScMatrixFormulaCellToken).SetMatColsRows(5, 6);
  other.SetDouble(9.5);
  state("copy_matrix_source", matrixcopy);
  state("copy_matrix_target", other);
  for (const i of [3, 4, 5, 6]) {
    const value = new ScFormulaResult();
    value.SetMatrix(2, 3, ma, inputs[i] as FormulaToken);
    state("upper_special", value);
  }
  const bytes = gunzipSync(Buffer.from(fixture.captures.results.gzipBase64, "base64"));
  expect(bytes.length).toBe(fixture.captures.results.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(fixture.captures.results.sha256);
  expect(lines.join("\n") + "\n").toBe(bytes.toString("utf8"));
  for (const input of inputs)
    if (input instanceof FormulaStringToken || input instanceof ScHybridCellToken) input.dispose();
  sa.dispose();
  sl.dispose();
  sr.dispose();
  ta.dispose();
  tl.dispose();
  tr.dispose();
  formula.dispose();
});
