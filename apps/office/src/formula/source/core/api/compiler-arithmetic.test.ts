/** @fileoverview Source-backed scalar grammar tests over the actual shared code/RPN owner. */
import { expect, it } from "vitest";
import { FormulaCompiler } from "../../../inc/FormulaCompiler";
import { FormulaTokenArray } from "../../../inc/tokenarray";
import { FormulaByteToken, FormulaDoubleToken, StackVar } from "../../../inc/token";
import { ParamClass } from "../../../inc/paramclass";
import { FormulaToken } from "../../../inc/token";
import { FormulaError } from "../../../inc/errorcodes";
import { OpCode } from "../../../inc/opcode";

/** Supplies only the native consumer's first-error recording hook; all parsing runs in the real shared compiler. */
class RecordingCompiler extends FormulaCompiler {
  /** Records the first error as ScCompiler does. @param error - Compiler error. @returns Nothing. */
  protected override SetError(error: FormulaError): void {
    if (this.mpArr.GetCodeError() === FormulaError.NONE) this.mpArr.SetCodeError(error);
  }
}
/** Builds actual shared tokens without a substitute expression model. @param input - Source-order numeric values/opcode names. @returns Array. */
function tokens(input: readonly (number | keyof typeof OpCode)[]): FormulaTokenArray {
  const array = new FormulaTokenArray();
  for (const value of input)
    if (typeof value === "number") array.AddDouble(value);
    else array.AddToken(new FormulaByteToken(OpCode[value]));
  return array;
}
/** Reads emitted numeric values and opcode names. @param array - Actual compiled owner. @returns RPN. */
function rpn(array: FormulaTokenArray): (number | string)[] {
  return Array.from(
    array.RPNTokens(),
    /** Reads a real token payload. @param token - Token. @returns Payload. */ (token) =>
      token.GetType() === StackVar.svDouble
        ? (token as FormulaDoubleToken).GetDouble()
        : (Object.keys(OpCode).find(
            /** Resolves a non-alias opcode name in this test's bounded output. @param key - Name. @returns Match. */ (
              key,
            ) =>
              !key.startsWith("ocStart") &&
              OpCode[key as keyof typeof OpCode] === token.GetOpCode(),
          ) as string),
  );
}

it("preserves arithmetic precedence, left-associative power and unary-before-power", /** Uses hand-derived RPN witnesses from the pinned grammar, not JS operator precedence. @returns Nothing. */ () => {
  for (const [input, expected] of [
    [
      [1, "ocAdd", 2, "ocMul", 3, "ocSub", 4, "ocDiv", 2],
      [1, 2, 3, "ocMul", "ocAdd", 4, 2, "ocDiv", "ocSub"],
    ],
    [
      [2, "ocPow", 3, "ocPow", 2],
      [2, 3, "ocPow", 2, "ocPow"],
    ],
    [
      ["ocNegSub", 2, "ocPow", 2],
      [2, "ocNegSub", 2, "ocPow"],
    ],
    [
      ["ocOpen", 1, "ocAdd", 2, "ocClose", "ocMul", 3],
      [1, 2, "ocAdd", 3, "ocMul"],
    ],
    [
      ["ocAdd", "ocAdd", "ocNegSub", "ocNegSub", 5, "ocPercentSign", "ocPercentSign"],
      [5, "ocNegSub", "ocNegSub", "ocPercentSign", "ocPercentSign"],
    ],
    [
      ["ocSpaces", 1, "ocWhitespace", "ocAdd", "ocSpaces", 2],
      [1, 2, "ocAdd"],
    ],
  ] as const) {
    const array = tokens(input);
    expect(new RecordingCompiler(array).CompileTokenArray()).toBe(false);
    expect(array.GetCodeError()).toBe(FormulaError.NONE);
    expect(rpn(array)).toEqual(expected);
    for (const token of array.RPNTokens()) expect(Array.from(array.Tokens())).toContain(token);
  }
});

it("records native syntax errors and removes failed RPN", /** Exercises the actual virtual error boundary and default stop-on-error behavior. @returns Nothing. */ () => {
  for (const [input, error] of [
    [[1, 2], FormulaError.OperatorExpected],
    [[1, "ocOpen", 2, "ocClose"], FormulaError.OperatorExpected],
    [["ocOpen", 1], FormulaError.PairExpected],
    [["ocOpen", "ocClose"], FormulaError.ParameterExpected],
    [[1, "ocAdd"], FormulaError.UnknownToken],
    [["ocMul", 1], FormulaError.VariableExpected],
    [[1, "ocClose"], FormulaError.OperatorExpected],
    [[], FormulaError.UnknownToken],
    [[1, "ocAdd", "ocNegSub", "ocClose"], FormulaError.ParameterExpected],
  ] as const) {
    const array = tokens(input);
    array.SetHyperLink(true);
    new RecordingCompiler(array).CompileTokenArray();
    expect(array.GetCodeError()).toBe(error);
    expect(array.GetCode()).toBeNull();
    expect(array.IsHyperLink()).toBe(false);
  }
});

it("recompiles the same tokens, resets recalc bits and retains forced mode", /** Verifies public return semantics, stable token identities and preexisting error preservation. @returns Nothing. */ () => {
  const array = tokens([1, "ocAdd", 2]),
    compiler = new RecordingCompiler(array);
  array.SetRecalcModeForced();
  expect(compiler.CompileTokenArray()).toBe(false);
  const original = Array.from(array.RPNTokens());
  expect(array.IsRecalcModeForced()).toBe(true);
  expect(compiler.CompileTokenArray()).toBe(false);
  expect(Array.from(array.RPNTokens())).toEqual(original);
  array.SetCodeError(FormulaError.NoName);
  compiler.CompileTokenArray();
  expect(array.GetCodeError()).toBe(FormulaError.NoName);
  expect(Array.from(array.RPNTokens())).toEqual(original);
  const base = tokens([1, 2]);
  new FormulaCompiler(base).CompileTokenArray();
  expect(base.GetCodeError()).toBe(FormulaError.NONE);
  expect(rpn(base)).toEqual([1]);
});

it("rejects unsupported compilation before touching existing RPN", /** Leaves unsupported operations visible rather than emitting a successful placeholder. @returns Nothing. */ () => {
  const array = tokens([1]);
  new RecordingCompiler(array).CompileTokenArray();
  const original = array.GetCode();
  array.AddToken(new FormulaByteToken(OpCode.ocIf));
  expect(
    /** Rejects missing function compilation. @returns Native subtotal flag. */ () =>
      new RecordingCompiler(array).CompileTokenArray(),
  ).toThrow(/opcode/);
  expect(array.GetCode()).toBe(original);
  const matrix = new FormulaTokenArray();
  matrix.AddToken(new FormulaToken(StackVar.svMatrix));
  expect(
    /** Rejects the real base matrix-return classification before payload access. @returns Subtotal flag. */ () =>
      new FormulaCompiler(matrix).CompileTokenArray(),
  ).toThrow(/array context/);
  const flagged = new FormulaTokenArray(),
    op = new FormulaByteToken(OpCode.ocAdd);
  op.SetInForceArray(ParamClass.ForceArray);
  flagged.AddToken(op);
  expect(
    /** Rejects inherited array context until its actual propagation is implemented. @returns Subtotal flag. */ () =>
      new FormulaCompiler(flagged).CompileTokenArray(),
  ).toThrow(/array context/);
  expect(new FormulaCompiler(array, true)).toBeInstanceOf(FormulaCompiler);
  expect(
    /** Rejects missing matrix services. @returns Compiler. */ () =>
      new FormulaCompiler(array, false, true),
  ).toThrow(/matrix/);
});

it("preserves the native expression and token-recursion limits", /** Bounded source witnesses for nested groups and prefix plus. @returns Nothing. */ () => {
  for (const input of [
    [...Array<"ocOpen">(110).fill("ocOpen"), 1, ...Array<"ocClose">(110).fill("ocClose")],
    [...Array<"ocAdd">(110).fill("ocAdd"), 1],
    [...Array<"ocOpen">(99).fill("ocOpen"), 1, ...Array<"ocClose">(99).fill("ocClose")],
  ]) {
    const array = tokens(input);
    new RecordingCompiler(array).CompileTokenArray();
    expect(array.GetCodeError()).toBe(FormulaError.StackOverflow);
    expect(array.GetCode()).toBeNull();
  }
});

it("uses native variable-argument Factor arity and close/error boundaries", /** Exercises shared grammar independently of Calc scanner injection. @returns Nothing. */ () => {
  for (const op of ["ocSum", "ocSumSQ", "ocProduct", "ocAverage"] as const) {
    const array = tokens([op, "ocOpen", "ocClose"]);
    new RecordingCompiler(array).CompileTokenArray();
    expect(array.GetCodeError()).toBe(FormulaError.NONE);
    expect((Array.from(array.RPNTokens())[0] as FormulaByteToken).GetByte()).toBe(0);
  }
  for (const [input, error] of [
    [["ocSum", 1], FormulaError.OperatorExpected],
    [["ocSum", "ocOpen", 1, "ocAdd", "ocClose"], FormulaError.ParameterExpected],
    [["ocSum", "ocOpen", 1], FormulaError.PairExpected],
    [["ocSum", "ocOpen", 1, "ocSep", "ocMul", 2, "ocClose"], FormulaError.VariableExpected],
  ] as const) {
    const array = tokens(input);
    new RecordingCompiler(array).CompileTokenArray();
    expect(array.GetCodeError()).toBe(error);
    expect(array.GetCodeLen()).toBe(0);
  }
});

it("retains native range precedence and base nonmerging RPN contracts", /** The shared compiler emits a range operator when its actual virtual extension has no Calc range service. @returns Nothing. */ () => {
  for (const [input, expected] of [
    [
      [1, "ocRange", 2, "ocAdd", 3],
      [1, 2, "ocRange", 3, "ocAdd"],
    ],
    [
      [1, "ocRange", "ocSum", "ocOpen", 2, "ocClose"],
      [1, 2, "ocSum", "ocRange"],
    ],
    [
      ["ocNegSub", 1, "ocRange", 2],
      [1, 2, "ocRange", "ocNegSub"],
    ],
  ] as const) {
    const array = tokens(input);
    new RecordingCompiler(array).CompileTokenArray();
    expect(array.GetCodeError()).toBe(FormulaError.NONE);
    expect(rpn(array)).toEqual(expected);
  }
  const malformed = tokens(["ocRange", 1]);
  new RecordingCompiler(malformed).CompileTokenArray();
  expect(malformed.GetCodeError()).toBe(FormulaError.VariableExpected);
});
it("retains the original empty base II hooks when compute mode is enabled", /** Shared compilation accepts the original flag while Calc owns reference optimization. @returns Nothing. */ () => {
  const array = tokens([1, "ocAdd", 2]);
  expect(new FormulaCompiler(array, true).CompileTokenArray()).toBe(false);
  expect(rpn(array)).toEqual([1, 2, "ocAdd"]);
});
