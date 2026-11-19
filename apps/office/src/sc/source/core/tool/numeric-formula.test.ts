/** @fileoverview Numeric compiler/interpreter and block-event contract boundaries using real owners. */
import { expect, it } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScCompiler } from "../../../inc/compiler";
import { ScInterpreter } from "../inc/interpre";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import {
  FormulaDoubleToken,
  FormulaByteToken,
  FormulaStringToken,
  FormulaErrorToken,
  type FormulaToken,
  StackVar,
} from "../../../../formula/inc/token";
import { ScMatrixToken } from "../../../inc/token";
import { ScMatrix } from "../../../inc/scmatrix";
import { SharedString } from "../../../../svl/inc/sharedstring";
import { ScColumn } from "../../../inc/column";
import {
  CellStoreType,
  CellStoreTraits,
  CellStoreEvent,
  cell_store_event_value_ops,
  formula_block,
  element_type_cellnote,
  numeric_block,
} from "../../../inc/mtvelements";
import { default_element_block } from "../../../../external/mdds/include/mdds/multi_type_vector/types.ts";
import { multi_type_vector } from "../../../../external/mdds/include/mdds/multi_type_vector/soa/main.ts";
import { div, power } from "../../../inc/math";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;

it("replays LibreOffice SUMSQ and PRODUCT with inline arrays", /** Uses the inline array cases of testFuncSUMSQ and testFuncPRODUCT. @returns Nothing. */ () => {
  const doc = new ScDocument();
  const position = new ScAddress();
  doc.InsertTab(0, unicode("Test"));
  try {
    for (const [source, value] of [
      ["=SUMSQ({1;2;3})", 14],
      ["=SUMSQ({3;6;9})", 126],
      ["=SUMSQ({15;0})", 225],
      ["=SUMSQ({-3;3;1})", 19],
      ['=SUMSQ({"a";-4;-5})', 41],
      ["=SUMSQ({2;3};{4;5})", 54],
      ["=SUMSQ({-3;3;1};{-1})", 20],
      ["=SUMSQ({-4};{1;4;2};{-5;7};{9})", 192],
      ["=SUMSQ({-2;2};{1};{-1};{0;0;0;4})", 26],
      ["=PRODUCT({2;3;4})", 24],
      ["=PRODUCT({2;-2;2})", -8],
      ["=PRODUCT({8;0.125;-1})", -1],
      ["=PRODUCT({2;3};{4;5})", 120],
      ["=PRODUCT({10;-8};{3;-1};{15;30};{7})", 756000],
      ["=PRODUCT({10;-0.1;8};{0.125;4;0.25;2};{0.5};{1};{-1})", 1],
      ['=AVERAGE({1;"2";5};7)', 13 / 3],
      ['=SUM({1;"2";5};7)', 13],
    ] as const) {
      doc.SetFormula(position, unicode(source), FormulaGrammar.Grammar.GRAM_NATIVE);
      expect(doc.GetValue(position), source).toBe(value);
    }
  } finally {
    doc.Dispose();
  }
});

it("retains native token classes, limits, copy identity and compiler boundaries", /** Scans into the actual owner and exercises public syntax/storage limits. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    position = new ScAddress(0, 0, 0),
    limits = doc.GetSheetLimits();
  const array = new ScTokenArray(limits);
  array.AddDouble(1);
  const copy = new ScTokenArray(array);
  expect(copy.mxSheetLimits).toBe(limits);
  expect(copy.FirstToken()).toBe(array.FirstToken());
  expect(array.AddOpCode(OpCode.ocOpen)?.GetType()).toBe(StackVar.svSep);
  expect(array.AddOpCode(OpCode.ocClose)?.GetType()).toBe(StackVar.svSep);
  expect(
    /** Rejects absent opcode families. @returns Token or null. */ () =>
      array.AddOpCode(OpCode.ocIf),
  ).toThrow(/not implemented/);
  const compiler = new ScCompiler(doc, position, copy, grammar);
  expect(compiler.aPos).not.toBe(position);
  expect(compiler.aPos.Col()).toBe(position.Col());
  expect(compiler.CompileTokenArray()).toBe(false);
  const forced = compiler.CompileString(unicode("==1"));
  expect(forced.IsRecalcModeForced()).toBe(true);
  expect(compiler.CompileString(unicode("=1")).IsRecalcModeForced()).toBe(false);
  compiler.CompileString(unicode("=1" + " ".repeat(260) + "+2"));
  compiler.CompileTokenArray();
  expect(compiler.CompileString(unicode("=" + "1+".repeat(5000))).GetCodeError()).toBe(
    FormulaError.CodeOverflow,
  );
  for (const source of [
    "=" + "(".repeat(9000),
    "=" + " ".repeat(255 * 8192) + "1",
    "=" + "\t".repeat(8193),
  ])
    expect(compiler.CompileString(unicode(source)).GetCodeError()).toBe(FormulaError.CodeOverflow);
  expect(compiler.CompileString(unicode("=+" + "1+".repeat(4095) + "1")).GetCodeError()).toBe(
    FormulaError.CodeOverflow,
  );
  const parenthesis = compiler.CompileString(unicode("=" + "(".repeat(8190) + "1"));
  expect(parenthesis.GetCodeError()).toBe(FormulaError.CodeOverflow);
});

it("executes actual RPN result/error/stack boundaries", /** No private-field access or replacement interpreter participates. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    pos = new ScAddress(0, 0, 0);
  /** Interprets a caller-supplied initialized RPN token stream. @param code - Real tokens. @returns Interpreter. */
  function run(code: readonly FormulaToken[]): ScInterpreter {
    const array = new ScTokenArray(doc);
    array.CreateNewRPNArrayFromData(code, code.length);
    const interpreter = new ScInterpreter(null, doc, doc.GetNonThreadedContext(), pos, array);
    interpreter.Interpret();
    return interpreter;
  }
  const ok = run([new FormulaDoubleToken(3)]);
  expect(ok.GetNumResult()).toBe(3);
  expect(ok.GetResultType()).toBe(StackVar.svDouble);
  expect(run([]).GetError()).toBe(FormulaError.NoCode);
  expect(run([new FormulaDoubleToken(1), new FormulaDoubleToken(2)]).GetError()).toBe(
    FormulaError.OperatorExpected,
  );
  expect(run([new FormulaByteToken(OpCode.ocAdd)]).GetError()).toBe(
    FormulaError.UnknownStackVariable,
  );
  expect(
    run(
      Array.from(
        { length: 513 },
        /** Creates real numeric operands. @returns Token. */ () => new FormulaDoubleToken(1),
      ),
    ).GetError(),
  ).toBe(FormulaError.StackOverflow);
  expect(run([new FormulaErrorToken(FormulaError.NoName)]).GetError()).toBe(FormulaError.NoName);
  expect(run([new FormulaDoubleToken(Infinity)]).GetError()).toBe(FormulaError.IllegalFPOperation);
  const matrix = new ScMatrix(1, 1);
  matrix.PutError(FormulaError.DivisionByZero, 0, 0);
  for (const [operand, error] of [
    [null, FormulaError.UnknownVariable],
    [matrix, FormulaError.DivisionByZero],
    [new ScMatrix(1, 1), FormulaError.DivisionByZero],
  ] as const) {
    const interpreter = run([
      new ScMatrixToken(operand),
      new FormulaByteToken(OpCode.ocAverage, 1),
    ]);
    try {
      expect(interpreter.GetError()).toBe(error);
    } finally {
      interpreter.Dispose();
    }
  }
  expect(
    /** Rejects missing opcode execution. @returns Interpreter. */ () =>
      run([new FormulaByteToken(OpCode.ocIf)]),
  ).toThrow(/not implemented/);
  const stringArray = new ScTokenArray(doc);
  stringArray.AddString(new SharedString());
  stringArray.CreateNewRPNArrayFromData(
    [new FormulaStringToken(new SharedString()), new FormulaByteToken(OpCode.ocNegSub)],
    2,
  );
  const emptyStringInterpreter = new ScInterpreter(
    null,
    doc,
    doc.GetNonThreadedContext(),
    pos,
    stringArray,
  );
  try {
    emptyStringInterpreter.Interpret();
    expect(emptyStringInterpreter.GetError()).toBe(FormulaError.NoValue);
  } finally {
    emptyStringInterpreter.Dispose();
  }
  ok.SetError(FormulaError.NONE);
  expect(ok.GetError()).toBe(FormulaError.NONE);
});

it("preserves division and bounded native power behavior", /** Includes negative odd roots and explicit unproven subnormal classification. @returns Nothing. */ () => {
  expect(div(6, 2)).toBe(3);
  expect(GetDoubleErrorValue(div(1, 0))).toBe(FormulaError.DivisionByZero);
  expect(power(-8, 1 / 3)).toBe(-2);
  expect(power(-8, -1 / 3)).toBe(-0.5);
  expect(power(-2, 0)).toBe(1);
  expect(power(-2, 2)).toBe(4);
  expect(power(2, 3)).toBe(8);
  expect(power(0, 2)).toBe(0);
  expect(GetDoubleErrorValue(power(-2, 0.5))).toBe(FormulaError.IllegalFPOperation);
  expect(GetDoubleErrorValue(power(-2, 1e-300))).toBe(FormulaError.IllegalFPOperation);
  expect(GetDoubleErrorValue(power(2, 1024))).toBe(FormulaError.IllegalFPOperation);
  expect(GetDoubleErrorValue(power(2, -2000))).toBe(FormulaError.IllegalFPOperation);
  expect(
    /** Rejects native fenv-only underflow ambiguity. @returns Number. */ () => power(2, -1074),
  ).toThrow(/Subnormal/);
});

it("uses actual logical block events and GC-owned noncopyable formula references", /** Count callbacks and handler moves do not retain or delete formula-cell objects. @returns Nothing. */ () => {
  const doc = new ScDocument(),
    left = new ScColumn(doc),
    right = new ScColumn(doc),
    event = new CellStoreEvent(left),
    other = new CellStoreEvent(right);
  const note = default_element_block(
    element_type_cellnote,
    0,
    /** Retains a type-only event witness payload. @param value - Scalar. @returns Scalar. */ (
      value,
    ) => value,
  );
  const block = new note(0),
    numeric = new numeric_block(0);
  event.element_block_acquired(block);
  expect(left.mnBlkCountCellNotes).toBe(1);
  event.element_block_released(block);
  expect(left.mnBlkCountCellNotes).toBe(0);
  event.element_block_acquired(numeric);
  event.element_block_released(numeric);
  expect(cell_store_event_value_ops.move(event).getColumn()).toBe(left);
  cell_store_event_value_ops.swap(event, other);
  expect(event.getColumn()).toBe(right);
  event.stop();
  event.element_block_acquired(null);
  event.element_block_released(null);
  expect(event.getColumn()).toBeNull();
  const moved = multi_type_vector.from_moved_event(
    CellStoreTraits,
    cell_store_event_value_ops,
    other,
  );
  moved.resize(1);
  moved.dispose();
  const empty = new CellStoreType(1);
  empty.dispose();
  const formulas = new formula_block(0);
  expect(
    /** Keeps native noncopyable semantics. @returns Never. */ () =>
      formula_block.copy_block(formulas),
  ).toThrow(/noncopyable/);
  expect(
    /** Keeps native unsupported cloning. @returns Block. */ () =>
      formula_block.clone_block(formulas),
  ).toThrow(/cloning/);
  expect(
    /** Does not substitute identity equality for missing semantic comparison. @returns Never. */ () =>
      formula_block.equal_block(),
  ).toThrow(/semantic equality/);
});
