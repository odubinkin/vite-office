/** @fileoverview Original scalar Calc text search and code-point position functions. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { FormulaByteToken, type FormulaToken } from "../../../../formula/inc/token";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { approxFloor } from "../../../../sal/inc/rtl/math";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SAL_MAX_INT32 } from "../../../../sal/inc/types";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { SearchParam, TextSearch } from "../../../../unotools/source/i18n/textsearch";
import { ScGlobal } from "../../../inc/global";
import type { ScInterpreter } from "./interpr4";
import { DetectSearchType } from "./queryentry";

/** Native maximum Calc formula string length, in UTF-16 code units. */
export const kScInterpreterMaxStrLen = Math.trunc(SAL_MAX_INT32 / 8);

/** Rounds down and checks the native signed string-position argument. @param interpreter - Active interpreter. @returns Position or minus one on error. */
function GetStringPositionArgument(interpreter: ScInterpreter): number {
  const value = approxFloor(interpreter["GetDouble"]());
  if (!Number.isFinite(value) || value < 0 || value > SAL_MAX_INT32) {
    interpreter.SetError(FormulaError.IllegalArgument);
    return -1;
  }
  return value;
}

/** Counts original code points until the given UTF-16 position. @param value - Source string. @param end - Exclusive bound. @returns Code-point count. */
function CountCodePoints(value: OUStringConstReference, end: number): number {
  const offset: [number] = [0];
  let count = 0;
  while (offset[0] < end) {
    value.iterateCodePoints(offset);
    ++count;
  }
  return count;
}

/** Advances at most the given code-point count without crossing the original string end. @param value - Source string. @param start - UTF-16 start. @param count - Number of code points. @returns UTF-16 offset. */
function AdvanceCodePoints(value: OUStringConstReference, start: number, count: number): number {
  const offset: [number] = [start];
  while (offset[0] < value.getLength() && count-- > 0) value.iterateCodePoints(offset);
  return offset[0];
}

/** Evaluates the original FIND exact search. @param this - Active interpreter. @param count - Arguments. */
function ScFind(this: ScInterpreter, count: number): void {
  const start = count === 3 ? Math.trunc(this["GetDouble"]()) : 1;
  const value = unicode(this["GetString"]());
  try {
    if (start < 1 || start > value.getLength() || !Number.isFinite(start)) {
      this.SetError(FormulaError.NoValue);
      return;
    }
    const key = unicode(this["GetString"]());
    try {
      const offset = value.indexOf(key, start - 1);
      if (offset < 0) this.SetError(FormulaError.NoValue);
      else this["PushDouble"](CountCodePoints(value, offset) + 1);
    } finally {
      key.dispose();
    }
  } finally {
    value.dispose();
  }
}

/** Evaluates the original case-insensitive SEARCH with document-specific patterns. @param this - Active interpreter. @param count - Arguments. */
function ScSearch(this: ScInterpreter, count: number): void {
  const start = count === 3 ? GetStringPositionArgument(this) : 1;
  if (start < 1) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  const value = unicode(this["GetString"]());
  const spelling = this["GetString"]();
  const key = unicode(spelling);
  const mode = DetectSearchType(spelling, this.mrDoc.GetDocOptions());
  const parameters = new SearchParam(key, mode, false, 126, false);
  try {
    const offset: [number] = [start - 1];
    const end: [number] = [value.getLength()];
    if (offset[0] >= end[0]) {
      this.SetError(FormulaError.NoValue);
      return;
    }
    const search = new TextSearch(
      parameters,
      ScGlobal.getCharClass(),
      this.mrDoc.regexMatcherFactory,
    );
    if (!search.SearchForward(value, offset, end)) this.SetError(FormulaError.NoValue);
    else this["PushDouble"](CountCodePoints(value, offset[0]) + 1);
  } finally {
    parameters.dispose();
    key.dispose();
    value.dispose();
  }
}

/** Implements original LEFT and RIGHT character slicing. @param this - Active interpreter. @param count - Arguments. @param fromRight - Whether to start from the right edge. */
function ScLeftRight(this: ScInterpreter, count: number, fromRight: boolean): void {
  let length = count === 2 ? GetStringPositionArgument(this) : 1;
  if (length < 0) return;
  const source = this["GetString"]();
  if (length >= source.length) {
    this["PushString"](source);
    return;
  }
  const value = unicode(source);
  try {
    if (fromRight) {
      const offset: [number] = [value.getLength()];
      while (offset[0] > 0 && length-- > 0) value.iterateCodePoints(offset, -1);
      this["PushString"](source.slice(offset[0]));
    } else {
      this["PushString"](source.slice(0, AdvanceCodePoints(value, 0, length)));
    }
  } finally {
    value.dispose();
  }
}

/** Implements original MID and REPLACE forward code-point spans. @param this - Active interpreter. @param replace - Whether to substitute a string. */
function ScMidReplace(this: ScInterpreter, replace: boolean): void {
  const replacement = replace ? this["GetString"]() : "";
  const count = GetStringPositionArgument(this);
  const start = GetStringPositionArgument(this);
  const source = this["GetString"]();
  if (start < 1 || count < 0) {
    this.SetError(FormulaError.IllegalArgument);
    return;
  }
  if (!replace && (start > kScInterpreterMaxStrLen || count > kScInterpreterMaxStrLen)) {
    this.SetError(FormulaError.StringOverflow);
    return;
  }
  const value = unicode(source);
  try {
    const first = AdvanceCodePoints(value, 0, start - 1);
    const last = AdvanceCodePoints(value, first, count);
    if (replace) {
      const fits = this["CheckStringResultLen"](
        value.getLength(),
        replacement.length - (last - first),
      );
      this["PushString"](fits ? source.slice(0, first) + replacement + source.slice(last) : "");
    } else this["PushString"](source.slice(first, last));
  } finally {
    value.dispose();
  }
}

/** Accepted byte arities for the native scalar text functions. */
const argumentsByOpcode = new Map<OpCode, readonly [min: number, max: number]>([
  [OpCode.ocFind, [2, 3]],
  [OpCode.ocSearch, [2, 3]],
  [OpCode.ocLen, [1, 1]],
  [OpCode.ocExact, [2, 2]],
  [OpCode.ocLeft, [1, 2]],
  [OpCode.ocRight, [1, 2]],
  [OpCode.ocMid, [3, 3]],
  [OpCode.ocReplace, [4, 4]],
]);

/** Dispatches native positional text formulas. @param this - Active interpreter. @param token - Compiled formula token. @returns Whether handled. */
export function InterpretTextOpcode(this: ScInterpreter, token: FormulaToken): boolean {
  const opcode = token.GetOpCode();
  const bounds = argumentsByOpcode.get(opcode);
  if (!bounds) return false;
  const count = (token as FormulaByteToken).GetByte();
  const [min, max] = bounds;
  if (count < min || count > max) {
    this.SetError(count < min ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
    return true;
  }
  switch (opcode) {
    case OpCode.ocFind:
      ScFind.call(this, count);
      break;
    case OpCode.ocSearch:
      ScSearch.call(this, count);
      break;
    case OpCode.ocLeft:
    case OpCode.ocRight:
      ScLeftRight.call(this, count, opcode === OpCode.ocRight);
      break;
    case OpCode.ocMid:
    case OpCode.ocReplace:
      ScMidReplace.call(this, opcode === OpCode.ocReplace);
      break;
    case OpCode.ocExact: {
      this["nRetFmtType"] = SvNumFormatType.LOGICAL;
      const right = this["GetString"]();
      this["PushDouble"](Number(right === this["GetString"]()));
      break;
    }
    case OpCode.ocLen: {
      const value = unicode(this["GetString"]());
      try {
        this["PushDouble"](CountCodePoints(value, value.getLength()));
      } finally {
        value.dispose();
      }
      break;
    }
  }
  return true;
}
