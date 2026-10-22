/** @fileoverview Numeric/string/local-A1 native and ODFF compilation with consumed aggregate symbols. Names,cross-sheet references,other functions and localized input formatting remain unsupported. */
import { FormulaCompiler } from "../../../../formula/inc/FormulaCompiler";
import {
  FormulaByteToken,
  FormulaSpaceToken,
  FormulaMissingToken,
} from "../../../../formula/inc/token";
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
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScRefFlags, ScAddress, ScRange } from "../../../inc/address";
import { ScTokenArray } from "../../../inc/tokenarray";
import { RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF } from "../../../../formula/inc/core_resource";
import { ScSingleRefToken, ScDoubleRefToken, extendRangeReference } from "../../../inc/token";
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
  /** Original scalar implicit-intersection branch for the consumed local-sheet reference convention. 3D cases remain unported. @param range - Non-singleton native range. @param address - Selected address output. @param position - Formula position. @returns Unique source position. */
  static DoubleRefToPosSingleRefScalarCase(
    range: ScRange,
    address: ScAddress,
    position: ScAddress,
  ): boolean {
    if (range.aStart.Tab() !== range.aEnd.Tab() || range.aStart.Tab() !== position.Tab())
      throw new Error("3D implicit intersection is not implemented");
    if (range.aStart.Col() <= position.Col() && position.Col() <= range.aEnd.Col()) {
      if (range.aStart.Row() === range.aEnd.Row()) {
        address.Set(position.Col(), range.aStart.Row(), range.aStart.Tab());
        return true;
      }
    } else if (range.aStart.Row() <= position.Row() && position.Row() <= range.aEnd.Row()) {
      if (range.aStart.Col() === range.aEnd.Col()) {
        address.Set(range.aStart.Col(), position.Row(), range.aStart.Tab());
        return true;
      }
    }
    return false;
  }
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
    if (
      grammar !== FormulaGrammar.Grammar.GRAM_ODFF &&
      grammar !== FormulaGrammar.Grammar.GRAM_ODFF_A1 &&
      grammar !== FormulaGrammar.Grammar.GRAM_NATIVE &&
      grammar !== FormulaGrammar.Grammar.GRAM_ENGLISH
    )
      throw new Error("Formula language or reference convention is not implemented");
    this.meGrammar = grammar;
  }
  /** Original local native/ODF one-reference convention operation. @param reference - Actual reference data. @param odf - ODF convention. @param singleton - Native none/column/row display. @returns Reference fragment. */
  private MakeOneRefStrImpl(
    reference: ScSingleRefData,
    odf: boolean,
    singleton: 0 | 1 | 2,
  ): string {
    const address = reference.toAbs(this.rDoc, this.aPos);
    if (reference.IsFlag3D() || address.Tab() !== this.aPos.Tab())
      throw new Error("Sheet-qualified formula output is not implemented");
    let column = address.Col() + 1,
      letters = "";
    while (column > 0) {
      column--;
      letters = String.fromCharCode(65 + (column % 26)) + letters;
      column = Math.floor(column / 26);
    }
    let output = odf ? "." : "";
    if (singleton !== 2)
      output +=
        (reference.IsColRel() ? "" : "$") +
        (reference.IsColDeleted() || !this.rDoc.ValidCol(address.Col()) ? "#REF!" : letters);
    if (singleton !== 1)
      output +=
        (reference.IsRowRel() ? "" : "$") +
        (reference.IsRowDeleted() || !this.rDoc.ValidRow(address.Row())
          ? "#REF!"
          : address.Row() + 1);
    return output;
  }
  /** Emits the actual single-reference convention and native ODFF invalid-reference wrapper. @param token - Source token. @returns Reference text. */
  protected override CreateStringFromSingleRef(token: FormulaToken): string {
    const reference = (token as ScSingleRefToken).GetSingleRef(),
      address = reference.toAbs(this.rDoc, this.aPos),
      odf =
        FormulaGrammar.extractRefConvention(this.meGrammar) ===
        FormulaGrammar.AddressConvention.CONV_ODF;
    if (odf && (reference.IsDeleted() || !this.rDoc.GetSheetLimits().ValidAddress(address)))
      return "[#REF!]";
    const value = this.MakeOneRefStrImpl(reference, odf, 0);
    return odf ? "[" + value + "]" : value;
  }
  /** Emits original two-endpoint range text and entire-axis display with retained relative/absolute flags. @param token - Actual range token. @returns Range source. */
  protected override CreateStringFromDoubleRef(token: FormulaToken): string {
    const reference = (token as ScDoubleRefToken).GetDoubleRef(),
      a = reference.Ref1.toAbs(this.rDoc, this.aPos),
      b = reference.Ref2.toAbs(this.rDoc, this.aPos),
      limits = this.rDoc.GetSheetLimits(),
      odf =
        FormulaGrammar.extractRefConvention(this.meGrammar) ===
        FormulaGrammar.AddressConvention.CONV_ODF;
    if (odf && (reference.IsDeleted() || !limits.ValidAddress(a) || !limits.ValidAddress(b)))
      return "[#REF!]";
    let singleton: 0 | 1 | 2 = 0;
    if (
      limits.ValidColRow(a.Col(), a.Row()) &&
      limits.ValidColRow(b.Col(), b.Row()) &&
      !reference.IsDeleted()
    ) {
      const named = this.mpArr.IsFromRangeName();
      if (
        reference.IsEntireCol(limits) ||
        (!named &&
          a.Row() === 0 &&
          b.Row() === this.rDoc.MaxRow() &&
          reference.Ref1.IsRowRel() &&
          reference.Ref2.IsRowRel())
      )
        singleton = 1;
      else if (
        reference.IsEntireRow(limits) ||
        (!named &&
          a.Col() === 0 &&
          b.Col() === this.rDoc.MaxCol() &&
          reference.Ref1.IsColRel() &&
          reference.Ref2.IsColRel())
      )
        singleton = 2;
    }
    const value =
      this.MakeOneRefStrImpl(reference.Ref1, odf, singleton) +
      ":" +
      this.MakeOneRefStrImpl(reference.Ref2, odf, singleton);
    return odf ? "[" + value + "]" : value;
  }
  /** Original virtual range merge delegates to existing native token extension. @param left - Left token. @param right - Right token. @returns Extended token or null. */
  protected override ExtendRangeReference(
    left: FormulaToken,
    right: FormulaToken,
  ): FormulaToken | null {
    return extendRangeReference(this.rDoc.GetSheetLimits(), left, right, this.aPos, true);
  }
  /** Binds the actual local range parser flags to native complex reference data. @param name - Unwrapped range source. @returns Parsed range. */
  private ParseDoubleReference(name: string): boolean {
    const range = new ScRange(this.aPos, this.aPos),
      input = unicode(name);
    let flags: ScRefFlags;
    try {
      flags = range.Parse(input, this.rDoc, ScAddress.detailsOOOa1);
    } finally {
      input.dispose();
    }
    if (!(flags & ScRefFlags.VALID)) throw new Error("Range/name fallback is not implemented");
    const reference = new ScComplexRefData();
    reference.InitRange(range);
    reference.Ref1.SetColRel(!(flags & ScRefFlags.COL_ABS));
    reference.Ref1.SetRowRel(!(flags & ScRefFlags.ROW_ABS));
    reference.Ref1.SetTabRel(!(flags & ScRefFlags.TAB_ABS));
    reference.Ref2.SetColRel(!(flags & ScRefFlags.COL2_ABS));
    reference.Ref2.SetRowRel(!(flags & ScRefFlags.ROW2_ABS));
    reference.Ref2.SetTabRel(!(flags & ScRefFlags.TAB2_ABS));
    reference.SetRange(this.rDoc.GetSheetLimits(), range, this.aPos);
    if (!(this.mpArr as ScTokenArray).AddDoubleReference(reference))
      this.SetError(FormulaError.CodeOverflow);
    return true;
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
      if (ch === '"') {
        index++;
        let value = "",
          closed = false;
        while (index < source.length) {
          const character = source[index++] as string;
          if (character === '"') {
            if (source[index] === '"') index++;
            else {
              closed = true;
              break;
            }
          }
          if (value.length < 1022) value += character;
          else this.SetError(FormulaError.StringOverflow);
        }
        if (!closed) throw new Error("Unterminated string/name fallback is not implemented");
        const native = unicode(value);
        try {
          const shared = this.rDoc.GetSharedStringPool().intern(native);
          try {
            if (!array.AddString(shared)) {
              this.SetError(FormulaError.CodeOverflow);
              break;
            }
          } finally {
            shared.dispose();
          }
        } finally {
          native.dispose();
        }
        last = OpCode.ocPush;
        continue;
      }
      const identifier = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(source.slice(index));
      if (identifier && /^[ \t\r\n]*\(/.test(source.slice(index + identifier[0].length))) {
        const functionCode = symbols[identifier[0].toUpperCase()];
        if (functionCode === undefined)
          throw new Error("Formula function/name lookup is not implemented");
        if (!array.AddOpCode(functionCode)) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
        index += identifier[0].length;
        last = functionCode;
        continue;
      }
      const odf =
        FormulaGrammar.extractRefConvention(this.meGrammar) ===
        FormulaGrammar.AddressConvention.CONV_ODF;
      if (!odf) {
        const range =
          /^(?:\$?[A-Za-z]+\$?[1-9][0-9]*:\$?[A-Za-z]+\$?[1-9][0-9]*|\$?[A-Za-z]+:\$?[A-Za-z]+|\$?[1-9][0-9]*:\$?[1-9][0-9]*)/.exec(
            source.slice(index),
          );
        if (range) {
          this.ParseDoubleReference(range[0]);
          last = OpCode.ocPush;
          index += range[0].length;
          continue;
        }
        const reference = /^\$?[A-Za-z]+\$?[1-9][0-9]*/.exec(source.slice(index));
        if (reference) {
          this.ParseSingleReference(reference[0]);
          last = OpCode.ocPush;
          index += reference[0].length;
          continue;
        }
      }
      if (ch === "[" && odf) {
        const close = source.indexOf("]", index + 1);
        if (close < 0 || source[index + 1] !== ".")
          throw new Error("Only bracketed local ODF references are implemented");
        const name = source.slice(index + 2, close);
        if (name.includes(":")) this.ParseDoubleReference(name.replace(":.", ":"));
        else this.ParseSingleReference(name);
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
          last === OpCode.ocSep ||
          last === OpCode.ocNegSub ||
          (last >= OpCode.ocStartBinaryOperators && last < OpCode.ocStopBinaryOperators))
      )
        op = OpCode.ocNegSub;
      if (
        (last !== OpCode.ocOpen || op !== OpCode.ocClose) &&
        (last === OpCode.ocOpen || last === OpCode.ocSep) &&
        (op === OpCode.ocSep || op === OpCode.ocClose)
      ) {
        if (!array.AddToken(new FormulaMissingToken())) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
      }
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
    array.GenHash();
    return array;
  }
}
