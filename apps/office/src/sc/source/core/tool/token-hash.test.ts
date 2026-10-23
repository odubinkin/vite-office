/** @fileoverview Original GenHash source vectors and actual native libc++64 double observations;whole Calc native differential is not claimed. */
import { expect, it } from "vitest";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { FormulaByteToken, FormulaDoubleToken } from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import original from "./native-double-hash-cases.json";

/** Creates actual source-code storage. @returns Array. */
function array(): ScTokenArray {
  return new ScTokenArray(new ScSheetLimits(20, 30));
}
it("binds the double hash to real normal/instrumented libc++64 observations and retains modular rolling arithmetic", /** Only the actual standard-library primitive is native-observed;the fold follows original Calc source. @returns Nothing. */ () => {
  expect(original.profile).toBe("libcxx64");
  for (const row of original.cases) {
    const data = new DataView(new ArrayBuffer(8));
    data.setBigUint64(0, BigInt(row.bits), true);
    const code = array();
    code.AddDouble(data.getFloat64(0, true));
    code.GenHash();
    expect(code.GetHash()).toBe(BigInt.asUintN(64, (1n + BigInt(row.hash)) * 15n));
  }
  for (const [value, expected] of [
    [1, 13767504060871606287n],
    [-1, 4544132024016830479n],
    [3.5, 13885723551090081807n],
  ] as const) {
    const code = array();
    code.AddDouble(value);
    code.GenHash();
    expect(code.GetHash()).toBe(expected);
  }
});
it("hashes source-order byte,string,reference flags and opcode values while ignoring RPN and coordinates", /** Native source constants provide independent small-value witnesses for each payload family. @returns Nothing. */ () => {
  const byte = array();
  byte.AddToken(new FormulaByteToken(OpCode.ocPush, 7));
  byte.GenHash();
  expect(byte.GetHash()).toBe(120n);
  const string = array(),
    shared = new SharedString(unicode("A"));
  string.AddString(shared);
  shared.dispose();
  string.GenHash();
  expect(string.GetHash()).toBe(1545n);
  const reference = new ScSingleRefData();
  reference.InitAddress(1, 2, 0);
  reference.SetColRel(true);
  reference.SetRowRel(true);
  reference.SetTabRel(true);
  const single = array();
  single.AddSingleReference(reference);
  single.GenHash();
  expect(single.GetHash()).toBe(120n);
  reference.IncCol(8);
  const relocated = array();
  relocated.AddSingleReference(reference);
  relocated.CreateNewRPNArrayFromData([new FormulaDoubleToken(999)], 1);
  relocated.GenHash();
  expect(relocated.GetHash()).toBe(single.GetHash());
  expect(relocated.EqualTokens(single)).toBe(false);
  const range = new ScComplexRefData();
  range.InitRange(1, 2, 0, 3, 4, 0);
  range.Ref1.SetRowRel(true);
  range.Ref2.SetColRel(true);
  const doubled = array();
  doubled.AddDoubleReference(range);
  doubled.GenHash();
  expect(doubled.GetHash()).toBe(60n);
  const opcode = array();
  opcode.AddOpCode(OpCode.ocAdd);
  opcode.GenHash();
  expect(opcode.GetHash()).toBe(765n);
  const error = array();
  error.AddError(FormulaError.NoRef);
  error.GenHash();
  expect(error.GetHash()).toBe(15n);
});
it("retains cached hash through true copies,shallow copies and moves,and resets it only at source-defined operations", /** The20-token cutoff and original self-assignment behavior remain observable without fake token state. @returns Nothing. */ () => {
  const code = array();
  expect(code.GetHash()).toBe(0n);
  code.GenHash();
  expect(code.GetHash()).toBe(1n);
  for (let index = 0; index < 20; index++) code.AddDouble(0);
  code.GenHash();
  expect(code.GetHash()).toBe(4664335276710460609n);
  code.AddDouble(99);
  code.GenHash();
  expect(code.GetHash()).toBe(4664335276710460609n);
  const shallow = new ScTokenArray(code),
    deep = code.CloneValue();
  for (const copy of [shallow, deep]) {
    expect(copy.GetHash()).toBe(code.GetHash());
    expect(copy.EqualTokens(code)).toBe(true);
  }
  expect(shallow.GetArray()?.[0]).toBe(code.GetArray()?.[0]);
  expect(deep.GetArray()?.[0]).not.toBe(code.GetArray()?.[0]);
  const moved = ScTokenArray.move(code);
  expect(code.GetLen()).toBe(0);
  expect(code.GetHash()).toBe(moved.GetHash());
  expect(code.EqualTokens(moved)).toBe(false);
  const assigned = array(),
    limits = assigned.mxSheetLimits;
  assigned.copy_assign(moved);
  expect(assigned.GetHash()).toBe(moved.GetHash());
  expect(assigned.mxSheetLimits).toBe(limits);
  expect(assigned.EqualTokens(moved)).toBe(true);
  assigned.copy_assign(assigned);
  expect(assigned.GetLen()).toBe(0);
  expect(assigned.GetHash()).toBe(0n);
  assigned.move_assign(moved);
  expect(assigned.GetHash()).toBe(4664335276710460609n);
  expect(assigned.mxSheetLimits).toBe(moved.mxSheetLimits);
  expect(moved.GetLen()).toBe(0);
  assigned.move_assign(assigned);
  expect(assigned.GetLen()).toBe(0);
  expect(assigned.GetHash()).toBe(4664335276710460609n);
  assigned.Clear();
  expect(assigned.GetHash()).toBe(0n);
  expect(assigned.EqualTokens(array())).toBe(true);
});
