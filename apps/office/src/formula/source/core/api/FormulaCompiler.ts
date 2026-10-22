/** @fileoverview Shared FormulaCompiler arithmetic/aggregate argument RPN and ODFF output subsets. Reference operators,other functions and implicit intersection remain unsupported. */
import { OpCode } from "../../../inc/opcode";
import {
  FormulaToken,
  FormulaByteToken,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaSpaceToken,
  StackVar,
} from "../../../inc/token";
import { FormulaTokenArray } from "../../../inc/tokenarray";
import { ParamClass } from "../../../inc/paramclass";
import { FormulaError } from "../../../inc/errorcodes";

import { FormulaGrammar, type Grammar } from "../../../inc/grammar";
import { RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF } from "../../../inc/core_resource";
import { doubleToString } from "../../../../sal/rtl/strtmpl.math";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

const arithmetic = new Set<OpCode>([
  OpCode.ocPush,
  OpCode.ocStop,
  OpCode.ocOpen,
  OpCode.ocClose,
  OpCode.ocAdd,
  OpCode.ocSub,
  OpCode.ocMul,
  OpCode.ocDiv,
  OpCode.ocPow,
  OpCode.ocNegSub,
  OpCode.ocPercentSign,
  OpCode.ocSpaces,
  OpCode.ocWhitespace,
  OpCode.ocSep,
  OpCode.ocMissing,
  OpCode.ocRange,
  OpCode.ocSum,
  OpCode.ocSumSQ,
  OpCode.ocProduct,
  OpCode.ocAverage,
]);

/** Shared source-shaped grammar over actual code/RPN arrays, using GC token identities. */
export class FormulaCompiler {
  protected meGrammar: Grammar = FormulaGrammar.Grammar.GRAM_UNSPECIFIED;
  /** Serializes source-order tokens rather than RPN, preserving the native forced-recalc prefix and output replacement. @param output - Actual mutable Unicode output owner. @returns Nothing. */
  CreateStringFromTokenArray(output: OUString): void {
    if (
      this.mpArr.GetLen() &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ODFF &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ODFF_A1 &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_NATIVE &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ENGLISH
    )
      throw new Error("Scalar formula symbols must be selected before serialization");
    let result = this.mpArr.GetLen() && this.mpArr.IsRecalcModeForced() ? "=" : "";
    for (const token of this.mpArr.Tokens()) result += this.CreateStringFromToken(token);
    const value = new OUString(
      Uint16Array.from(
        { length: result.length },
        /** Preserves exact UTF16 code units, including embedded zero and surrogates. @param unused - Unused value. @param index - Unit index. @returns Unit. */ (
          _,
          index,
        ) => result.charCodeAt(index),
      ),
      result.length,
    );
    try {
      output.assign(value);
    } finally {
      value.dispose();
    }
  }
  /** Emits only source-backed scalar token families; no name/function/array rewrite is fabricated. @param token - Actual source token. @returns Text fragment replacing the native buffer append. */
  protected CreateStringFromToken(token: FormulaToken): string {
    const op = token.GetOpCode();
    if (op === OpCode.ocSpaces || op === OpCode.ocWhitespace) {
      const byte = (token as FormulaByteToken | FormulaSpaceToken).GetByte();
      return (
        op === OpCode.ocSpaces ? " " : String.fromCharCode((token as FormulaSpaceToken).GetChar())
      ).repeat(byte);
    }
    if (op === OpCode.ocPush) {
      if (token.GetType() === StackVar.svDouble)
        return doubleToString((token as FormulaDoubleToken).GetDouble());
      if (token.GetType() === StackVar.svString)
        return this.AppendString((token as FormulaStringToken).GetString().getString());
      if (token.GetType() === StackVar.svSingleRef) return this.CreateStringFromSingleRef(token);
      if (token.GetType() === StackVar.svDoubleRef) return this.CreateStringFromDoubleRef(token);
      throw new Error("Formula output token family is not implemented");
    }
    if (op === OpCode.ocMissing) return "";
    const symbol = RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF.get(op);
    if (symbol === undefined) throw new Error("Formula output opcode is not implemented");
    return symbol;
  }
  /** Emits native quoted text, doubling quotes while retaining exact UTF16 units. @param value - String owner. @returns Text fragment. */
  private AppendString(value: OUStringConstReference): string {
    let result = '"';
    const units = value.getStr();
    for (let i = 0; i < value.getLength(); i++) {
      const character = String.fromCharCode(units[i] as number);
      result += character === '"' ? '""' : character;
    }
    return result + '"';
  }
  /** Preserves the original empty virtual base operation; Calc supplies its reference convention. @param token - Reference token. @returns Empty base fragment. */
  protected CreateStringFromSingleRef(token: FormulaToken): string {
    void token;
    return "";
  }
  /** Original empty base double-reference output hook. @param token - Reference token. @returns Empty base fragment. */
  protected CreateStringFromDoubleRef(token: FormulaToken): string {
    void token;
    return "";
  }
  /** Original empty base range-extension hook. @param left - Left operand. @param right - Right operand. @returns No base extension. */
  protected ExtendRangeReference(left: FormulaToken, right: FormulaToken): FormulaToken | null {
    void left;
    void right;
    return null;
  }
  protected mpArr: FormulaTokenArray;
  private mpToken: FormulaToken = new FormulaByteToken(OpCode.ocStop);
  private meLastOp: OpCode = OpCode.ocPush;
  private mnRecursion = 0;
  private index = 0;
  private mpCode: FormulaToken[] = [];
  /** Binds the actual array for default scalar compilation; other modes require their missing real services. @param array - Token owner. @param computeII - Implicit intersection mode. @param matrixFlag - Matrix mode. @returns Compiler. */
  constructor(array: FormulaTokenArray, computeII = false, matrixFlag = false) {
    if (computeII || matrixFlag)
      throw new Error("Implicit-intersection and matrix compilation are not implemented");
    this.mpArr = array;
  }
  /** Preserves the original empty virtual base operation; Calc records the first error in its override. @param error - Compiler error. @returns Nothing. */
  protected SetError(error: FormulaError): void {
    void error;
  }
  /** Compiles the supported default scalar grammar; the native boolean reports subtotal presence, not success. @returns False for this non-subtotal subset. */
  CompileTokenArray(): boolean {
    for (const token of this.mpArr.Tokens())
      if (!arithmetic.has(token.GetOpCode()) || token.GetInForceArray() !== ParamClass.Unknown)
        throw new Error("Formula opcode or array context is not implemented by scalar compilation");
    if (this.mpArr.GetCodeError() !== FormulaError.NONE) return false;
    this.mpArr.DelRPN();
    const forced = this.mpArr.IsRecalcModeForced();
    this.mpArr.ClearRecalcMode();
    this.index = 0;
    this.mpCode = [];
    this.meLastOp = OpCode.ocOpen;
    this.NextToken();
    if (this.Expression() !== OpCode.ocStop) this.SetError(FormulaError.OperatorExpected);
    if (this.mpCode.length) this.mpArr.CreateNewRPNArrayFromData(this.mpCode, this.mpCode.length);
    if (this.mpArr.GetCodeError() !== FormulaError.NONE) {
      this.mpArr.DelRPN();
      this.mpArr.SetHyperLink(false);
    }
    if (forced) this.mpArr.SetRecalcModeForced();
    return false;
  }
  /** Reads the next active token, skipping insignificant whitespace for this scalar subset. @returns Whether a token exists. */
  private GetToken(): boolean {
    if (++this.mnRecursion > 100) {
      this.SetError(FormulaError.StackOverflow);
      this.mpToken = new FormulaByteToken(OpCode.ocStop);
      --this.mnRecursion;
      return false;
    }
    try {
      if (this.mpArr.GetCodeError() === FormulaError.NONE) {
        let token = this.mpArr.TokenAt(this.index++);
        while (
          token &&
          (token.GetOpCode() === OpCode.ocSpaces || token.GetOpCode() === OpCode.ocWhitespace)
        )
          token = this.mpArr.TokenAt(this.index++);
        if (token) {
          this.mpToken = token;
          return true;
        }
      }
      this.mpToken = new FormulaByteToken(OpCode.ocStop);
      return false;
    } finally {
      --this.mnRecursion;
    }
  }
  /** Applies native adjacent-operand/operator checks and elides prefix plus. @returns Current opcode. */
  private NextToken(): OpCode {
    if (!this.GetToken()) return OpCode.ocStop;
    let op = this.mpToken.GetOpCode();
    const needsOperand =
      this.meLastOp === OpCode.ocOpen ||
      this.meLastOp === OpCode.ocSep ||
      (this.meLastOp >= OpCode.ocStartBinaryOperators &&
        this.meLastOp < OpCode.ocStopUnaryOperators);
    if (op === OpCode.ocPush && !needsOperand) this.SetError(FormulaError.OperatorExpected);
    if (op === OpCode.ocAdd && needsOperand) {
      ++this.mnRecursion;
      try {
        op = this.NextToken();
      } finally {
        --this.mnRecursion;
      }
    } else {
      if (op >= OpCode.ocStartBinaryOperators && op < OpCode.ocStopBinaryOperators && needsOperand)
        this.SetError(FormulaError.VariableExpected);
      this.meLastOp = op;
    }
    return op;
  }
  /** Writes the original token identity; error output is suppressed by default jump-reorder mode. Supported code cannot exceed the existing 8192-token owner limit. @param token - Borrowed token. @returns Nothing. */
  private PutCode(token: FormulaToken): void {
    if (this.mpArr.GetCodeError() === FormulaError.NONE) this.mpCode.push(token);
  }
  /** Emits scalar operands,missing arguments,nested expressions and the consumed native variable-argument function branch. Reference operators remain unsupported. @returns Nothing. */
  private Factor(): void {
    if (this.mpArr.GetCodeError() !== FormulaError.NONE) return;
    const op = this.mpToken.GetOpCode();
    if (op === OpCode.ocPush) {
      this.PutCode(this.mpToken);
      if (this.NextToken() === OpCode.ocOpen) this.SetError(FormulaError.OperatorExpected);
    } else if (op === OpCode.ocMissing) {
      this.PutCode(this.mpToken);
      this.NextToken();
    } else if (
      op === OpCode.ocSum ||
      op === OpCode.ocSumSQ ||
      op === OpCode.ocProduct ||
      op === OpCode.ocAverage
    ) {
      const functionToken = this.mpToken as FormulaByteToken;
      let terminal = this.NextToken(),
        noParameters = false;
      if (terminal === OpCode.ocOpen) {
        terminal = this.NextToken();
        if (terminal === OpCode.ocClose) noParameters = true;
        else terminal = this.Expression();
      } else this.SetError(FormulaError.PairExpected);
      let parameterCount = 0;
      if (!noParameters) {
        parameterCount++;
        while (terminal === OpCode.ocSep && this.mpArr.GetCodeError() === FormulaError.NONE) {
          this.NextToken();
          parameterCount++;
          if (parameterCount > 255) this.SetError(FormulaError.CodeOverflow);
          terminal = this.Expression();
        }
      }
      if (terminal !== OpCode.ocClose) this.SetError(FormulaError.PairExpected);
      else this.NextToken();
      functionToken.SetByte(parameterCount);
      this.PutCode(functionToken);
    } else if (op === OpCode.ocOpen) {
      this.NextToken();
      if (this.Expression() !== OpCode.ocClose) this.SetError(FormulaError.PairExpected);
      else this.NextToken();
    } else
      this.SetError(
        op === OpCode.ocClose ? FormulaError.ParameterExpected : FormulaError.UnknownToken,
      );
  }
  /** Prefix negation binds before postfix percent and power. Prefix plus is already elided by NextToken. @returns Nothing. */
  private UnaryLine(): void {
    if (this.mpToken.GetOpCode() === OpCode.ocNegSub) {
      const token = this.mpToken;
      this.NextToken();
      this.UnaryLine();
      this.PutCode(token);
    } else this.RangeLine();
  }
  /** Original range precedence and adjacent-RPN merge over actual token identities. @returns Nothing. */
  private RangeLine(): void {
    this.Factor();
    while (this.mpToken.GetOpCode() === OpCode.ocRange) {
      const left = this.mpCode.length - 1,
        operator = this.mpToken;
      this.NextToken();
      this.Factor();
      const right = this.mpCode.length - 1;
      let merged = false;
      if (this.mpCode.length >= 2 && right - left === 1) {
        const token = this.ExtendRangeReference(
          this.mpCode[left] as FormulaToken,
          this.mpCode[right] as FormulaToken,
        );
        if (token) {
          this.mpCode[left] = token;
          this.mpCode.pop();
          merged = true;
        }
      }
      if (!merged) this.PutCode(operator);
    }
  }
  /** Emits repeated postfix percent operators. @returns Nothing. */
  private PostOpLine(): void {
    this.UnaryLine();
    while (this.mpToken.GetOpCode() === OpCode.ocPercentSign) {
      this.PutCode(this.mpToken);
      this.NextToken();
    }
  }
  /** Emits the source's left-associative power chain. @returns Nothing. */
  private PowLine(): void {
    this.PostOpLine();
    while (this.mpToken.GetOpCode() === OpCode.ocPow) {
      const token = this.mpToken;
      this.NextToken();
      this.PostOpLine();
      this.PutCode(token);
    }
  }
  /** Emits multiplication and division after their operands. @returns Nothing. */
  private MulDivLine(): void {
    this.PowLine();
    while (this.mpToken.GetOpCode() === OpCode.ocMul || this.mpToken.GetOpCode() === OpCode.ocDiv) {
      const token = this.mpToken;
      this.NextToken();
      this.PowLine();
      this.PutCode(token);
    }
  }
  /** Emits addition and subtraction after their operands. @returns Nothing. */
  private AddSubLine(): void {
    this.MulDivLine();
    while (this.mpToken.GetOpCode() === OpCode.ocAdd || this.mpToken.GetOpCode() === OpCode.ocSub) {
      const token = this.mpToken;
      this.NextToken();
      this.MulDivLine();
      this.PutCode(token);
    }
  }
  /** Preserves the native nested-expression recursion bound. @returns Current terminal opcode. */
  private Expression(): OpCode {
    if (++this.mnRecursion > 100) {
      this.SetError(FormulaError.StackOverflow);
      --this.mnRecursion;
      return OpCode.ocStop;
    }
    try {
      this.AddSubLine();
      return this.mpToken.GetOpCode();
    } finally {
      --this.mnRecursion;
    }
  }
  /** Original jump command switch. @param eOp - Original opcode. @returns Whether this is a jump command. */
  static IsOpCodeJumpCommand(eOp: OpCode): boolean {
    switch (eOp & 0xffff) {
      case OpCode.ocIf:
      case OpCode.ocIfError:
      case OpCode.ocIfNA:
      case OpCode.ocChoose:
      case OpCode.ocLet:
        return true;
      default:
        return false;
    }
  }
}
