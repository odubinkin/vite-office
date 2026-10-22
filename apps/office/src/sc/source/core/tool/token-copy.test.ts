/** @fileoverview Original token-copy invariance, RPN ownership and mixed-reference ordering vectors. */
import { expect, it } from "vitest";
import { ScAddress } from "../../../inc/address";
import { ScRange } from "../../../inc/address";
import { ScDocument } from "../../../inc/document";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { ScTokenArray } from "../../../inc/tokenarray";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScTableRefToken,
} from "../../../inc/token";
import { FormulaDoubleToken, FormulaIndexToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import { SharedString } from "../../../../svl/inc/sharedstring";

/** Builds a native mixed range whose relative endpoint crosses the fixed endpoint after relocation. @returns Range token. */
function mixedRange(): ScDoubleRefToken {
  const reference = new ScComplexRefData();
  reference.InitRange(0, 0, 0, 1, 1, 0);
  reference.Ref1.SetColRel(true);
  reference.Ref1.SetRowRel(true);
  reference.Ref1.SetRelCol(-2);
  reference.Ref1.SetRelRow(-2);
  return new ScDoubleRefToken(new ScSheetLimits(20, 30), reference);
}
/** Creates actual token storage over native sheet limits. @returns Token owner. */
function array(): ScTokenArray {
  return new ScTokenArray(new ScSheetLimits(20, 30));
}
/** Reads the independent mixed-reference post-copy expectation. @param token - Actual range token. @returns Endpoint and flag values. */
function state(token: ScDoubleRefToken): number[] {
  const reference = token.GetDoubleRef();
  return [
    reference.Ref1.Col(),
    reference.Ref1.Row(),
    Number(reference.Ref1.IsColRel()),
    Number(reference.Ref1.IsRowRel()),
    reference.Ref2.Col(),
    reference.Ref2.Row(),
    Number(reference.Ref2.IsColRel()),
    Number(reference.Ref2.IsRowRel()),
  ];
}

it("classifies every local/external reference family using row flags and treats indexes as variant", /** Invariance uses source-order tokens even when a different RPN exists. @returns Nothing. */ () => {
  expect(array().IsInvariant()).toBe(true);
  const name = new SharedString();
  for (const relative of [false, true]) {
    const single = new ScSingleRefData();
    single.InitAddress(1, 2, 0);
    single.SetColRel(true);
    single.SetRowRel(relative);
    for (const token of [
      new ScSingleRefToken(new ScSheetLimits(20, 30), single),
      new ScExternalSingleRefToken(0, name, single),
    ]) {
      const code = array();
      code.AddToken(token);
      expect(code.IsInvariant()).toBe(!relative);
    }
  }
  for (const first of [false, true])
    for (const second of [false, true]) {
      const range = new ScComplexRefData();
      range.InitRange(0, 1, 0, 2, 3, 0);
      range.Ref1.SetRowRel(first);
      range.Ref2.SetRowRel(second);
      for (const token of [
        new ScDoubleRefToken(new ScSheetLimits(20, 30), range),
        new ScExternalDoubleRefToken(0, name, range),
      ]) {
        const code = array();
        code.AddToken(token);
        expect(code.IsInvariant()).toBe(!first && !second);
      }
    }
  const indexed = array();
  indexed.AddToken(new FormulaIndexToken(OpCode.ocName, 1));
  expect(indexed.IsInvariant()).toBe(false);
  const numeric = array();
  numeric.AddDouble(2);
  numeric.CreateNewRPNArrayFromData([mixedRange()], 1);
  expect(numeric.IsInvariant()).toBe(true);
  name.dispose();
});

it("visits actual code/RPN aliases once and handles independently owned RPN ranges", /** Retained code identities are shared by the deep copy's RPN, while RPN-only values are independent. @returns Nothing. */ () => {
  const code = array(),
    source = code.AddToken(mixedRange()) as ScDoubleRefToken,
    extra = mixedRange();
  code.CreateNewRPNArrayFromData([source, extra], 2);
  const copy = code.CloneValue(),
    codeRange = copy.GetArray()?.[0] as ScDoubleRefToken,
    rpnRange = copy.GetCode()?.[1] as ScDoubleRefToken;
  expect(copy.GetCode()?.[0]).toBe(codeRange);
  expect(codeRange).not.toBe(source);
  expect(rpnRange).not.toBe(extra);
  copy.AdjustReferenceOnCopy(new ScAddress(5, 5, 0));
  expect(state(codeRange)).toEqual([1, 1, 0, 0, -2, -2, 1, 1]);
  expect(state(rpnRange)).toEqual([1, 1, 0, 0, -2, -2, 1, 1]);
  expect(state(source)).toEqual([-2, -2, 1, 1, 1, 1, 0, 0]);
  expect(state(extra)).toEqual(state(source));
  const repeated = array(),
    shared = mixedRange();
  repeated.CreateNewRPNArrayFromData([shared, shared], 2);
  repeated.AdjustReferenceOnCopy(new ScAddress(5, 5, 0));
  expect(state(shared)).toEqual(state(source));
});

it("projects a table's retained area only when RPN does not already own it", /** Original structured-reference traversal follows retained token identity instead of flattening a table into a copied range. @returns Nothing. */ () => {
  for (const shared of [false, true]) {
    const code = array(),
      table = code.AddToken(new ScTableRefToken(1, 0)) as ScTableRefToken,
      area = mixedRange();
    table.SetAreaRefRPN(area);
    code.CreateNewRPNArrayFromData(shared ? [area] : [table], 1);
    code.AdjustReferenceOnCopy(new ScAddress(5, 5, 0));
    expect(state(area)).toEqual(shared ? [-2, -2, 1, 1, 1, 1, 0, 0] : [1, 1, 0, 0, -2, -2, 1, 1]);
  }
  const noArea = array();
  noArea.AddToken(new ScTableRefToken(1, 0));
  noArea.AddToken(new FormulaIndexToken(OpCode.ocTableRef, 2));
  noArea.AddToken(new FormulaDoubleToken(1));
  noArea.AdjustReferenceOnCopy(new ScAddress(5, 5, 0));
  expect(noArea.GetLen()).toBe(3);
});

it("adjusts only absolute coordinates of references fully contained in the actual copied range", /** Eight independent flag vectors retain relative offsets and distinguish disabled,contained and outside-area policies. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    oldPosition = new ScAddress(2, 2, 0),
    newPosition = new ScAddress(5, 7, 1);
  doc.GetClipParam().maRanges.push_back(new ScRange(0, 0, 0, 10, 10, 0));
  for (const check of [false, true])
    for (let flags = 0; flags < 8; flags++) {
      const code = array(),
        reference = new ScSingleRefData();
      reference.InitAddress(1, 1, 0);
      if (flags & 1) {
        reference.SetColRel(true);
        reference.SetRelCol(-1);
      }
      if (flags & 2) {
        reference.SetRowRel(true);
        reference.SetRelRow(-1);
      }
      if (flags & 4) reference.SetTabRel(true);
      const single = code.AddSingleReference(reference) as ScSingleRefToken,
        rangeData = new ScComplexRefData();
      rangeData.Ref1.assign(reference);
      rangeData.Ref2.assign(reference);
      const range = code.AddDoubleReference(rangeData) as ScDoubleRefToken;
      code.AddDouble(2);
      code.CreateNewRPNArrayFromData([single, range], 2);
      code.AdjustAbsoluteRefs(doc, oldPosition, newPosition, check);
      const expected = [
        flags & 1 ? -1 : check ? 4 : 1,
        flags & 2 ? -1 : check ? 6 : 1,
        flags & 4 ? 0 : check ? 1 : 0,
      ];
      for (const data of [
        single.GetSingleRef(),
        range.GetDoubleRef().Ref1,
        range.GetDoubleRef().Ref2,
      ])
        expect([data.Col(), data.Row(), data.Tab()]).toEqual(expected);
    }
  const outside = array(),
    range = new ScComplexRefData();
  range.InitRange(1, 1, 0, 11, 11, 0);
  const token = outside.AddDoubleReference(range) as ScDoubleRefToken,
    single = new ScSingleRefData();
  single.InitAddress(12, 12, 0);
  const singleToken = outside.AddSingleReference(single) as ScSingleRefToken;
  outside.AdjustAbsoluteRefs(doc, oldPosition, newPosition, true);
  expect(token.GetDoubleRef().Ref2.Col()).toBe(11);
  expect(singleToken.GetSingleRef().Col()).toBe(12);
});

it("retains relative-name RPN-only references under absolute adjustment but includes them in copy ordering", /** Native relative-name skip belongs to the absolute-adjustment traversal only. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    code = array(),
    reference = new ScSingleRefData();
  doc.GetClipParam().maRanges.push_back(new ScRange(0, 0, 0, 10, 10, 0));
  reference.InitAddress(1, 1, 0);
  reference.SetRelName(true);
  const single = new ScSingleRefToken(doc.GetSheetLimits(), reference),
    range = mixedRange();
  range.GetDoubleRef().Ref1.SetRelName(true);
  code.CreateNewRPNArrayFromData([single, range, new FormulaDoubleToken(2)], 3);
  code.AdjustAbsoluteRefs(doc, new ScAddress(2, 2, 0), new ScAddress(5, 5, 0), true);
  expect(single.GetSingleRef().Col()).toBe(1);
  expect(state(range)).toEqual([-2, -2, 1, 1, 1, 1, 0, 0]);
  code.AdjustReferenceOnCopy(new ScAddress(5, 5, 0));
  expect(state(range)).toEqual([1, 1, 0, 0, -2, -2, 1, 1]);
  const secondNamed = mixedRange();
  secondNamed.GetDoubleRef().Ref2.SetRelName(true);
  code.CreateNewRPNArrayFromData([secondNamed], 1);
  code.AdjustAbsoluteRefs(doc, new ScAddress(2, 2, 0), new ScAddress(5, 5, 0), true);
  expect(state(secondNamed)).toEqual([-2, -2, 1, 1, 1, 1, 0, 0]);
});
