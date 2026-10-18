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
  StackVar,
} from "../../../../formula/inc/token";
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
      array.AddOpCode(OpCode.ocSum),
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
  function run(
    code: readonly (FormulaDoubleToken | FormulaByteToken | FormulaErrorToken)[],
  ): ScInterpreter {
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
  expect(
    /** Rejects missing opcode execution. @returns Interpreter. */ () =>
      run([new FormulaByteToken(OpCode.ocSum)]),
  ).toThrow(/not implemented/);
  const stringArray = new ScTokenArray(doc);
  stringArray.AddString(new SharedString());
  stringArray.CreateNewRPNArrayFromData([new FormulaStringToken(new SharedString())], 1);
  expect(
    /** Rejects absent string conversion. @returns Type. */ () =>
      new ScInterpreter(null, doc, doc.GetNonThreadedContext(), pos, stringArray).Interpret(),
  ).toThrow(/Nonnumeric/);
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
