/** @fileoverview Original parameter-classification source vectors with real token opcodes,repeat boundaries and explicit cache lifecycle. */
import { expect, it } from "vitest";
import { ScParameterClassification } from "../inc/parclass";
import { FormulaByteToken, FormulaExternalToken } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import { ParamClass as P } from "../../../../formula/inc/paramclass";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";

it("retains original arithmetic,reference-return,array and fixed-arity source classes", /** Init is explicit and precedes all queries as required by parclass.hxx. @returns Nothing. */ () => {
  ScParameterClassification.Init();
  ScParameterClassification.Init();
  for (const op of [OpCode.ocAdd, OpCode.ocSub, OpCode.ocMul, OpCode.ocDiv, OpCode.ocPow]) {
    const token = new FormulaByteToken(op);
    expect(ScParameterClassification.GetParameterType(token, 0)).toBe(P.Array);
    expect(ScParameterClassification.GetParameterType(token, 1)).toBe(P.Array);
    for (const parameter of [2, 6, 7, 65534])
      expect(ScParameterClassification.GetParameterType(token, parameter)).toBe(P.Bounds);
    expect(ScParameterClassification.GetParameterType(token, 65535)).toBe(P.Value);
    expect(ScParameterClassification.HasForceArray(op)).toBe(false);
  }
  for (const op of [OpCode.ocNegSub, OpCode.ocPercentSign]) {
    const token = new FormulaByteToken(op);
    expect(ScParameterClassification.GetParameterType(token, 0)).toBe(P.Array);
    expect(ScParameterClassification.GetParameterType(token, 1)).toBe(P.Bounds);
  }
  const union = new FormulaByteToken(OpCode.ocUnion);
  expect(ScParameterClassification.GetParameterType(union, 0)).toBe(P.Reference);
  expect(ScParameterClassification.GetParameterType(union, 1)).toBe(P.Reference);
  expect(ScParameterClassification.GetParameterType(union, 65535)).toBe(P.Reference);
  const filter = new FormulaByteToken(OpCode.ocFilter);
  expect(
    [0, 1, 2, 3, 65535].map(
      /** Reads explicit original positions. @param parameter - Native index. @returns Class. */ (
        parameter,
      ) => ScParameterClassification.GetParameterType(filter, parameter),
    ),
  ).toEqual([P.ReferenceOrRefArray, P.ForceArray, P.Value, P.Bounds, P.ForceArrayReturn]);
  expect(ScParameterClassification.HasForceArray(OpCode.ocFilter)).toBe(true);
  expect(ScParameterClassification.HasForceArray(OpCode.ocVLookup)).toBe(true);
  expect(ScParameterClassification.HasForceArray(OpCode.ocAverage)).toBe(false);
  ScParameterClassification.Exit();
  ScParameterClassification.Init();
  expect(ScParameterClassification.GetParameterType(union, 65535)).toBe(P.Reference);
});
it("retains native one- and two-parameter repeats beyond the seven-element runtime prefix", /** Independently stated source expectations exercise repeated tails and UInt16 narrowing. @returns Nothing. */ () => {
  ScParameterClassification.Init();
  for (const op of [OpCode.ocSum, OpCode.ocSumSQ, OpCode.ocProduct, OpCode.ocAverage]) {
    const token = new FormulaByteToken(op);
    for (const parameter of [0, 1, 6, 7, 8, 255, 65534, 65536])
      expect(ScParameterClassification.GetParameterType(token, parameter)).toBe(
        P.ReferenceOrRefArray,
      );
    expect(ScParameterClassification.GetParameterType(token, 65535)).toBe(P.Value);
  }
  const countifs = new FormulaByteToken(OpCode.ocCountIfs),
    sumifs = new FormulaByteToken(OpCode.ocSumIfs);
  for (const parameter of [0, 2, 4, 6, 8, 10, 254, 65534])
    expect(ScParameterClassification.GetParameterType(countifs, parameter)).toBe(
      P.ReferenceOrRefArray,
    );
  for (const parameter of [1, 3, 5, 7, 9, 255, 65533])
    expect(ScParameterClassification.GetParameterType(countifs, parameter)).toBe(P.Value);
  expect(ScParameterClassification.GetParameterType(sumifs, 0)).toBe(P.ReferenceOrRefArray);
  for (const parameter of [1, 3, 5, 7, 9, 255, 65533])
    expect(ScParameterClassification.GetParameterType(sumifs, parameter)).toBe(
      P.ReferenceOrRefArray,
    );
  for (const parameter of [2, 4, 6, 8, 10, 254, 65534])
    expect(ScParameterClassification.GetParameterType(sumifs, parameter)).toBe(P.Value);
});
it("keeps Unknown fallback,macro rules,signed opcode bounds and unported AddIn services distinct", /** The seven-slot default has the original Bounds result above its stored prefix. @returns Nothing. */ () => {
  ScParameterClassification.Init();
  const absent = new FormulaByteToken(OpCode.ocAbs),
    macro = new FormulaByteToken(OpCode.ocMacro);
  for (const parameter of [0, 1, 6, 65535])
    expect(ScParameterClassification.GetParameterType(absent, parameter)).toBe(P.Value);
  expect(ScParameterClassification.GetParameterType(absent, 7)).toBe(P.Bounds);
  expect(ScParameterClassification.GetParameterType(macro, 0)).toBe(P.Reference);
  expect(ScParameterClassification.GetParameterType(macro, 65535)).toBe(P.Value);
  for (const op of [OpCode.ocNone, 32768 as OpCode, 521 as OpCode]) {
    const token = new FormulaByteToken(op);
    expect(ScParameterClassification.GetParameterType(token, 0)).toBe(P.Unknown);
    expect(ScParameterClassification.HasForceArray(op)).toBe(false);
  }
  for (const op of [OpCode.ocExternal, OpCode.ocUDExternal]) {
    const token = new FormulaExternalToken(op, unicode("unported"));
    expect(ScParameterClassification.GetParameterType(token, 65535)).toBe(P.Unknown);
    expect(
      /** No replacement registry pretends to resolve native AddIns. @returns Class or throws. */ () =>
        ScParameterClassification.GetParameterType(token, 0),
    ).toThrow("External AddIn parameter collections");
  }
});
