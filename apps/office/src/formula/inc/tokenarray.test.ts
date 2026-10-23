/** @fileoverview Whole original initialized code/RPN/recalc streams; protected operations are exposed by a legal caller subclass, not a missing Calc peer substitute. */
import { unicode, text as toText } from "../../i18nlangtag/source/isolang/isolang.tables";
import { gunzipSync } from "node:zlib";
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { FormulaTokenArray, ScRecalcMode } from "./tokenarray";
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaByteToken,
  FormulaStringOpToken,
  FormulaIndexToken,
  StackVar,
} from "./token";
import { FormulaError } from "./errorcodes";
import { OpCode } from "./opcode";
import { SharedString } from "../../svl/inc/sharedstring";
import { OUString } from "../../sal/inc/rtl/ustring";
import fixture from "./native-token-array-cases.json";
/** Legal original subclass access to protected operations and state for the native caller comparison. */
class Exposed extends FormulaTokenArray {
  /** Original protected append access. @param token - Genuine token. @returns Original result. */
  add(token: FormulaToken): FormulaToken | null {
    return this.Add(token);
  }
  /** Original optimized XML assignment access. @param count - Initialized count. @param tokens - XML tokens. @returns Nothing. */
  xml(count: number, tokens: readonly FormulaToken[]): void {
    this.Assign(count, tokens);
  }
  /** Original protected finalized field observation. @returns Flag. */
  finalized(): boolean {
    return this.mbFinalized;
  }
  /** Original move construction on the same actual base owner. @param source - Source. @returns Exposed owner. */
  static moveOwner(source: FormulaTokenArray): Exposed {
    const result = new Exposed();
    result.Move(source);
    return result;
  }
}
/** Decodes complete original output and verifies its identity. @param name - Stream. @returns Whole stream. */
function original(name: keyof typeof fixture.captures): string {
  const capture = fixture.captures[name],
    bytes = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
  expect(bytes.length).toBe(capture.byteLength);
  expect(createHash("sha256").update(bytes).digest("hex")).toBe(capture.sha256);
  return bytes.toString();
}
/** Original initialized numeric payload. @param value - Number. @returns UInt64. */
function bits(value: number): string {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value, true);
  return view.getBigUint64(0, true).toString();
}
/** Original token fields with no native count/address output. @param token - Token. @returns Whole fields. */
function tok(token: FormulaToken | null): string {
  return token
    ? `${token.GetType()},${token.GetOpCode()}${token instanceof FormulaDoubleToken ? `,${bits(token.GetDouble())}` : ""}`
    : "-";
}
/** Original recalc predicates and masks. @param label - Stage. @param value - Owner. @returns Whole state. */
function mode(label: string, value: FormulaTokenArray): string {
  return `${label} ${value.GetRecalcMode()} ${value.GetCombinedBitsRecalcMode()} ${Number(value.IsRecalcModeNormal())} ${Number(value.IsRecalcModeAlways())} ${Number(value.IsRecalcModeForced())} ${Number(value.IsRecalcModeOnRefMove())} ${Number(value.IsRecalcModeMustAfterImport())}`;
}
it("matches every original recalc byte and exclusive priority history", /** Replays full original bit/priority combinations and convenience setters. @returns Nothing. */ () => {
  const lines: string[] = [];
  for (const initial of [0, 1, 2, 4, 8, 16, 32, 64, 127, 128, 255])
    for (let bit = 0; bit < 256; ++bit) {
      const value = new Exposed();
      value.SetMaskedRecalcMode(initial);
      value.SetCombinedBitsRecalcMode(bit);
      lines.push(mode("combined", value));
      value.SetMaskedRecalcMode(initial);
      value.AddRecalcMode(bit);
      lines.push(mode("added", value));
      value.ClearRecalcModeMustAfterImport();
      lines.push(mode("clearimport", value));
      value.SetExclusiveRecalcModeAlways();
      lines.push(mode("always", value));
      value.SetRecalcModeForced();
      value.SetRecalcModeOnRefMove();
      lines.push(mode("extra", value));
      value.SetExclusiveRecalcModeNormal();
      lines.push(mode("normal", value));
      value.ClearRecalcMode();
      lines.push(mode("clear", value));
    }
  expect(lines.join("\n") + "\n").toBe(original("recalc"));
  expect(ScRecalcMode).toEqual({
    ALWAYS: 1,
    ONLOAD_MUST: 2,
    ONLOAD_ONCE: 4,
    ONLOAD_LENIENT: 8,
    NORMAL: 16,
    FORCED: 32,
    ONREFMOVE: 64,
    EMask: 31,
  });
});
it("matches complete original initialized code and RPN ownership edit stream", /** Replays legal value/ref histories over genuine token owners, preserving active ranges and original index traversal. @returns Nothing. */ () => {
  const lines: string[] = [];
  /** Original complete active code/RPN and query observations. @param label - Stage. @param value - Owner. @returns Nothing. */
  function state(label: string, value: Exposed): void {
    let line = `${label} ${value.GetLen()} ${value.GetCodeLen()} ${value.GetCodeError()} ${Number(value.IsHyperLink())} ${Number(value.IsFromRangeName())} ${Number(value.IsShareable())} ${Number(value.HasDynamicArrayFunction())} ${Number(value.finalized())} ${Number(value.GetArray() !== null)} ${Number(value.GetCode() !== null)} |`;
    for (const token of value.Tokens()) line += ` ${tok(token)}`;
    line += " |";
    for (const token of value.RPNTokens()) {
      let index = -1;
      for (let i = 0; i < value.GetLen(); ++i)
        if (value.TokenAt(i) === token) {
          index = i;
          break;
        }
      line += ` ${tok(token)}:${index}`;
    }
    line += ` | ${tok(value.FirstToken())} ${tok(value.FirstRPNToken())} ${tok(value.LastRPNToken())} ${value.GetOuterFuncOpCode()} | ${Number(value.HasReferences())} ${Number(value.HasExternalRef())} ${Number(value.HasNameOrColRowName())} ${Number(value.HasOpCodes(new Set([OpCode.ocSum, OpCode.ocName])))} ${Number(value.HasOpCodes(new Set([OpCode.ocCos])))}`;
    lines.push(line);
    for (const i of [0, 1, 2, 65535, 65536]) {
      const position = { value: i },
        previous = value.PeekPrev(position);
      lines.push(
        `query ${i} ${value.OpCodeBefore(i)} ${position.value} ${tok(previous)} ${tok(value.TokenAt(i))}`,
      );
    }
    lines.push(
      `ops ${Number(value.HasOpCode(OpCode.ocSum))} ${Number(value.HasOpCode(OpCode.ocCos))} ${Number(value.HasOpCodeRPN(OpCode.ocSum))} ${Number(value.HasOpCodeRPN(OpCode.ocCos))}`,
    );
  }
  /** Genuine compiler pointer-data transfer. @param value - Owner. @param tokens - Initialized tokens. @returns Nothing. */
  function rpn(value: FormulaTokenArray, tokens: FormulaToken[]): void {
    value.CreateNewRPNArrayFromData(tokens, tokens.length);
  }
  const value = new Exposed();
  state("default", value);
  value.Finalize();
  state("emptyfinal", value);
  value.SetCodeError(FormulaError.DivisionByZero);
  value.SetHyperLink(true);
  value.SetFromRangeName(true);
  value.SetShareable(false);
  value.SetDynamicArrayFunction(true);
  lines.push(mode("meta", value));
  value.AddDouble(-0);
  value.AddError(FormulaError.DivisionByZero);
  const text = new OUString(new Uint16Array([65]), 1),
    shared = new SharedString(text);
  value.AddString(shared);
  value.AddToken(new FormulaByteToken(OpCode.ocSum, 2));
  state("added", value);
  rpn(value, [
    value.TokenAt(0) as FormulaToken,
    value.TokenAt(3) as FormulaToken,
    value.TokenAt(0) as FormulaToken,
  ]);
  value.CheckAllRPNTokens();
  state("rpn", value);
  value.Finalize();
  state("originalfinal", value);
  const copy = new Exposed(value);
  state("copy", copy);
  lines.push(`same_tokens ${Number(copy.TokenAt(0) === value.TokenAt(0))}`);
  copy.Finalize();
  state("copyfinal", copy);
  lines.push(`finaladd ${Number(copy.AddDouble(9.5) === null)}`);
  const moved = Exposed.moveOwner(copy);
  state("moved", moved);
  state("movesource", copy);
  lines.push(`movesourceadd ${Number(copy.AddDouble(9.5) === null)}`);
  const target = new Exposed();
  expect(target.copy_assign(value)).toBe(target);
  state("assigned", target);
  target.copy_assign(target);
  state("selfcopy", target);
  target.move_assign(target);
  state("selfmove", target);
  const transfer = new Exposed();
  expect(transfer.move_assign(moved)).toBe(transfer);
  state("moveassigned", transfer);
  state("moveassignedsource", moved);
  transfer.DelRPN();
  state("delrpn", transfer);
  transfer.Clear();
  state("clear", transfer);
  rpn(transfer, []);
  transfer.DelRPN();
  state("zero_rpn", transfer);
  const zeroCopy = new Exposed(transfer);
  state("zero_copy", zeroCopy);
  transfer.Clear();
  const sep = new FormulaToken(StackVar.svSep, OpCode.ocArrayClose);
  lines.push(`merge ${Number(transfer.add(sep) === null)}`);
  state("merged", transfer);
  const xml = new Exposed(),
    placeholder = new FormulaStringOpToken(OpCode.ocStringXML, shared);
  xml.xml(1, [placeholder]);
  state("xml", xml);
  const xmlzero = new Exposed();
  xmlzero.xml(0, [placeholder]);
  state("xmlzero", xmlzero);
  const ref = new FormulaToken(StackVar.svSingleRef),
    external = new FormulaToken(StackVar.svExternalDoubleRef),
    index = new FormulaIndexToken(OpCode.ocName, 4),
    colname = new FormulaByteToken(OpCode.ocColRowName);
  for (const token of [ref, external, index, colname]) {
    const q = new Exposed();
    q.add(token);
    state("predicate", q);
  }
  const qrpn = new Exposed();
  rpn(qrpn, [ref]);
  state("rpnref", qrpn);
  for (let replacement = 0; replacement < 2; ++replacement) {
    const q = new Exposed();
    q.AddDouble(1);
    q.AddDouble(2);
    rpn(q, [
      q.TokenAt(0) as FormulaToken,
      q.TokenAt(0) as FormulaToken,
      q.TokenAt(1) as FormulaToken,
    ]);
    const oldRange = q.Tokens(),
      next = new FormulaDoubleToken(7);
    lines.push(`replace ${Number(q.ReplaceToken(0, next, replacement) === next)}`);
    lines.push(`live_range ${tok(oldRange[Symbol.iterator]().next().value as FormulaToken)}`);
    state("replaced", q);
    lines.push(
      `rpnreplace ${Number(q.ReplaceRPNToken(1, next) === next)} ${Number(q.ReplaceRPNToken(99, next) === null)} ${Number(q.ReplaceToken(99, next, FormulaTokenArray.ReplaceMode.CODE_ONLY) === null)}`,
    );
    state("rpnreplaced", q);
  }
  for (let adjacency = 0; adjacency < 3; ++adjacency) {
    const q = new Exposed(),
      x = new FormulaDoubleToken(1),
      y = new FormulaDoubleToken(2);
    q.add(x);
    q.add(y);
    rpn(q, adjacency === 0 ? [x, x, x, y] : adjacency === 1 ? [x, y, x] : [y]);
    lines.push(`removed ${q.RemoveToken(0, 1)}`);
    state("removedstate", q);
    lines.push(`invalidremove ${q.RemoveToken(99, 1)} ${q.RemoveToken(0, 0)}`);
    state("zeroremove", q);
    lines.push(`clampremove ${q.RemoveToken(0, 3)}`);
    state("clamped", q);
  }
  const limit = new Exposed();
  for (let i = 0; i < 8191; ++i) limit.AddDouble(i);
  let line = `limit ${limit.GetLen()} ${Number(limit.AddDouble(9) === null)} ${limit.GetLen()} ${tok(limit.TokenAt(8191))}`;
  line += ` ${Number(limit.AddDouble(10) === null)} ${limit.GetLen()}`;
  lines.push(line);
  expect(lines.join("\n") + "\n").toBe(original("arrays"));
  const movedBase = FormulaTokenArray.move(new Exposed());
  expect(movedBase.GetLen()).toBe(0);
  placeholder.dispose();
  shared.dispose();
  text.dispose();
});

it("appends the original non-interned bad-source token through the shared array owner", /** Native AddBad retains its actual opcode and string payload after input release. @returns Nothing. */ () => {
  const array = new FormulaTokenArray(),
    input = unicode("bad😀"),
    added = array.AddBad(input);
  input.dispose();
  expect(added?.GetOpCode()).toBe(OpCode.ocBad);
  expect(added?.GetType()).toBe(StackVar.svString);
  if (!(added instanceof FormulaStringOpToken))
    throw new Error("AddBad must return its original string-op token");
  expect(toText(added.GetString().getString())).toBe("bad😀");
  expect(array.GetLen()).toBe(1);
  array.Finalize();
  const another = unicode("later");
  expect(array.AddBad(another)).toBeNull();
  another.dispose();
  array.Clear();
});
