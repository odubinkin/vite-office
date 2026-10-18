/** @fileoverview Native ScTokenArray deep-clone identity and metadata contracts. */
import { expect, it } from "vitest";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScDocument } from "../../../inc/document";
import { FormulaDoubleToken, type FormulaToken } from "../../../../formula/inc/token";
import { FormulaError } from "../../../../formula/inc/errorcodes";
it("deep-copies code and reuses the first matching cloned code token in RPN", /** Original Clone preserves code/RPN aliases without sharing source token identities. @returns Nothing. */ () => {
  const array = new ScTokenArray(new ScDocument()),
    shared = array.AddDouble(4) as FormulaToken,
    extra = new FormulaDoubleToken(9);
  array.AddDouble(4);
  array.ReplaceToken(1, shared, ScTokenArray.ReplaceMode.CODE_ONLY);
  array.CreateNewRPNArrayFromData([shared, extra, shared, extra], 4);
  array.SetCodeError(FormulaError.NoName);
  array.SetHyperLink(true);
  array.SetFromRangeName(true);
  array.SetShareable(false);
  array.SetDynamicArrayFunction(true);
  array.SetRecalcModeForced();
  array.Finalize();
  const copy = array.Clone(),
    code = copy.GetArray() as readonly FormulaToken[],
    rpn = copy.GetCode() as readonly FormulaToken[];
  expect(code[0]).not.toBe(shared);
  expect(code[1]).not.toBe(code[0]);
  expect(rpn[0]).toBe(code[0]);
  expect(rpn[2]).toBe(code[0]);
  expect(rpn[1]).not.toBe(extra);
  expect(rpn[1]).not.toBe(rpn[3]);
  expect([
    copy.GetLen(),
    copy.GetCodeLen(),
    copy.GetCodeError(),
    copy.IsHyperLink(),
    copy.IsFromRangeName(),
    copy.IsShareable(),
    copy.HasDynamicArrayFunction(),
    copy.IsRecalcModeForced(),
  ]).toEqual([2, 4, FormulaError.NoName, true, true, false, true, true]);
  copy.AddDouble(5);
  expect(array.GetLen()).toBe(2);
  expect(copy.GetLen()).toBe(3);
});
it("retains empty,code-only and RPN-only source storage shapes", /** No dummy tokens or simulated reference counts are introduced. @returns Nothing. */ () => {
  const empty = new ScTokenArray(new ScDocument());
  expect(empty.Clone().GetArray()).toBeNull();
  expect(empty.Clone().GetCode()).toBeNull();
  empty.CreateNewRPNArrayFromData([new FormulaDoubleToken(5)], 1);
  const copy = empty.Clone();
  expect(copy.GetArray()).toBeNull();
  expect(copy.GetCode()?.[0]).not.toBe(empty.GetCode()?.[0]);
  const code = new ScTokenArray(new ScDocument());
  code.AddDouble(8);
  expect(code.Clone().GetCode()).toBeNull();
});
