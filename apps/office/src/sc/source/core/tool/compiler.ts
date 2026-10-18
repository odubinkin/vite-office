/** @fileoverview Numeric/local-A1 ODFF compilation. Names, cross-sheet/range references, functions, string literals and localized input formatting remain unsupported. */
import { FormulaCompiler } from "../../../../formula/inc/FormulaCompiler";
import { FormulaByteToken, FormulaSpaceToken } from "../../../../formula/inc/token";
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import {
  rtl_math_uStringToDouble,
  rtl_math_ConversionStatus,
} from "../../../../sal/inc/rtl/math.h";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import type { ScDocument } from "../../../inc/document";
import { ScSingleRefData } from "../../../inc/refdata";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScRefFlags, ScAddress } from "../../../inc/address";
import { ScTokenArray } from "../../../inc/tokenarray";
import { RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF } from "../../../../formula/inc/core_resource";
import { ScSingleRefToken } from "../../../inc/token";
import type { FormulaToken } from "../../../../formula/inc/token";

const symbols: Readonly<Record<string, OpCode>> = Object.fromEntries(
  Array.from(RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF)
    .filter(
      /** Keeps lexical minus distinct from its unary compiler opcode. @param entry - Source entry. @returns Lexical membership. */ ([
        op,
      ]) => op !== OpCode.ocNegSub,
    )
    .map(
      /** Reuses the native symbol spelling for scanning. @param entry - Source entry. @returns Scanner entry. */ ([
        op,
        symbol,
      ]) => [symbol, op],
    ),
);
/** Actual shared grammar with the Calc first-error hook and bounded numeric scanner. */
export class ScCompiler extends FormulaCompiler {
  readonly aPos: ScAddress;
  /** Native document/position/array-or-grammar constructor subset. @param rDoc - Document. @param position - Formula position. @param arrayOrGrammar - Existing array or scanning grammar. @param grammar - Existing-array grammar. @returns Compiler. */
  constructor(
    private readonly rDoc: ScDocument,
    position: ScAddress,
    arrayOrGrammar: ScTokenArray | Grammar,
    grammar?: Grammar,
  ) {
    super(arrayOrGrammar instanceof ScTokenArray ? arrayOrGrammar : new ScTokenArray(rDoc));
    this.aPos = new ScAddress(position);
    this.SetGrammar(arrayOrGrammar instanceof ScTokenArray ? (grammar as Grammar) : arrayOrGrammar);
  }
  /** Selects the implemented native Calc grammar and reference convention. @param grammar - Grammar. @returns Nothing. */
  SetGrammar(grammar: Grammar): void {
    if (!FormulaGrammar.isODFF(grammar))
      throw new Error("Only ODFF serialization grammar is implemented");
    this.meGrammar = grammar;
  }
  /** Emits native ODFF bracket/dot/absolute flags from the actual reference at the formula position. @param token - Single-reference token. @returns Reference text. */
  protected override CreateStringFromSingleRef(token: FormulaToken): string {
    const reference = (token as ScSingleRefToken).GetSingleRef();
    const address = reference.toAbs(this.rDoc, this.aPos);
    if (reference.IsDeleted() || !this.rDoc.GetSheetLimits().ValidAddress(address))
      return "[#REF!]";
    if (reference.IsFlag3D() || address.Tab() !== this.aPos.Tab())
      throw new Error("Sheet-qualified formula output is not implemented");
    let column = address.Col() + 1,
      letters = "";
    while (column > 0) {
      column--;
      letters = String.fromCharCode(65 + (column % 26)) + letters;
      column = Math.floor(column / 26);
    }
    return (
      "[." +
      (reference.IsColRel() ? "" : "$") +
      letters +
      (reference.IsRowRel() ? "" : "$") +
      (address.Row() + 1) +
      "]"
    );
  }
  /** Records the first actual code error. @param error - Error. @returns Nothing. */
  protected override SetError(error: FormulaError): void {
    if (this.mpArr.GetCodeError() === FormulaError.NONE) this.mpArr.SetCodeError(error);
  }
  /** Binds valid local A1 parse flags to genuine relative/absolute native reference data. @param name - Unwrapped address. @returns Recognized reference. */
  private ParseSingleReference(name: string): boolean {
    const address = new ScAddress(this.aPos),
      flags = address.Parse(unicode(name), this.rDoc, ScAddress.detailsOOOa1);
    if (!(flags & ScRefFlags.VALID)) throw new Error("Reference/name fallback is not implemented");
    const reference = new ScSingleRefData();
    reference.InitAddress(address);
    reference.SetColRel(!(flags & ScRefFlags.COL_ABS));
    reference.SetRowRel(!(flags & ScRefFlags.ROW_ABS));
    reference.SetTabRel(true);
    reference.SetAddress(this.rDoc.GetSheetLimits(), address, this.aPos);
    if (!(this.mpArr as ScTokenArray).AddSingleReference(reference))
      this.SetError(FormulaError.CodeOverflow);
    return true;
  }
  /** Scans the represented numeric ODFF subset into its actual Calc array, preserving native leading equals, forced recalc and default bracket completion. @param formula - Unicode formula. @returns Source-order token owner. */
  CompileString(formula: OUStringConstReference): ScTokenArray {
    const original = text(formula);
    let first = 0,
      end = original.length;
    while (first < end && original[first] === " ") first++;
    while (end > first && original[end - 1] === " ") end--;
    const source = original.slice(first, end),
      array = new ScTokenArray(this.rDoc);
    this.mpArr = array;
    let index = 0,
      forced = 0,
      brackets = 0,
      last: OpCode = OpCode.ocOpen;
    while (index < source.length && source[index] === "=" && forced < 2) {
      index++;
      forced++;
    }
    while (index < source.length) {
      const ch = source[index] as string;
      if (ch === " ") {
        let count = 0;
        while (source[index] === " " && count < 255) {
          index++;
          count++;
        }
        if (!array.AddToken(new FormulaByteToken(OpCode.ocSpaces, count))) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
        continue;
      }
      if (ch === "\t" || ch === "\n" || ch === "\r") {
        if (!array.AddToken(new FormulaSpaceToken(1, ch.charCodeAt(0)))) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
        index++;
        continue;
      }
      if (ch === "[") {
        const close = source.indexOf("]", index + 1);
        if (close < 0 || source[index + 1] !== ".")
          throw new Error("Only bracketed local ODF references are implemented");
        this.ParseSingleReference(source.slice(index + 2, close));
        last = OpCode.ocPush;
        index = close + 1;
        continue;
      }
      const numeric = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?/.exec(source.slice(index));
      if (numeric) {
        const input = Uint16Array.from(
          numeric[0],
          /** Borrows ASCII numeric code units. @param c - Character. @returns Unit. */ (c) =>
            c.charCodeAt(0),
        );
        const status: [rtl_math_ConversionStatus] = [
          rtl_math_ConversionStatus.rtl_math_ConversionStatus_Ok,
        ];
        const value = rtl_math_uStringToDouble(input, input.length, 46, 0, status);
        if (status[0] === rtl_math_ConversionStatus.rtl_math_ConversionStatus_OutOfRange)
          this.SetError(FormulaError.IllegalArgument);
        if (!array.AddDouble(value)) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
        last = OpCode.ocPush;
        index += input.length;
        continue;
      }
      let op = symbols[ch];
      if (op === undefined)
        throw new Error(
          "Formula names, references, functions, strings or symbols are not implemented",
        );
      if (
        op === OpCode.ocSub &&
        (last === OpCode.ocOpen ||
          last === OpCode.ocNegSub ||
          (last >= OpCode.ocStartBinaryOperators && last < OpCode.ocStopBinaryOperators))
      )
        op = OpCode.ocNegSub;
      if (op === OpCode.ocOpen) brackets++;
      if (op === OpCode.ocClose) {
        if (brackets === 0) this.SetError(FormulaError.PairExpected);
        else brackets--;
      }
      if (!array.AddOpCode(op)) {
        this.SetError(FormulaError.CodeOverflow);
        break;
      }
      last = op;
      index++;
    }
    while (brackets-- > 0)
      if (!array.AddOpCode(OpCode.ocClose)) {
        this.SetError(FormulaError.CodeOverflow);
        break;
      }
    if (forced >= 2) array.SetRecalcModeForced();
    return array;
  }
}
