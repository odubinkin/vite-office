/** @fileoverview Shared FormulaCompiler arithmetic/aggregate argument RPN and ODFF output subsets. Other functions,array/matrix compilation and unconsumed reference operators remain unsupported. */
import { OpCode } from "../../../inc/opcode";
import {
  FormulaToken,
  FormulaByteToken,
  FormulaJumpToken,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaStringOpToken,
  FormulaErrorToken,
  FormulaExternalToken,
  FormulaSpaceToken,
  StackVar,
} from "../../../inc/token";
import { FormulaTokenArray } from "../../../inc/tokenarray";
import { ParamClass } from "../../../inc/paramclass";
import { FormulaError } from "../../../inc/errorcodes";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";

import { FormulaGrammar, type Grammar } from "../../../inc/grammar";
import {
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF,
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_OOXML,
} from "../../../inc/core_resource";
import { doubleToString } from "../../../../sal/rtl/strtmpl.math";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

const arithmetic = new Set<OpCode>([
  OpCode.ocName,
  OpCode.ocColRowName,
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
  OpCode.ocEqual,
  OpCode.ocNotEqual,
  OpCode.ocLess,
  OpCode.ocGreater,
  OpCode.ocLessEqual,
  OpCode.ocGreaterEqual,
  OpCode.ocNotAvail,
  OpCode.ocMatRef,
  OpCode.ocSqrt,
  OpCode.ocIsError,
  OpCode.ocFrequency,
  OpCode.ocIf,
  OpCode.ocAnd,
  OpCode.ocOffset,
  OpCode.ocCountIf,
  OpCode.ocNot,
  OpCode.ocIsEmpty,
  OpCode.ocGetMonth,
  OpCode.ocGetActDate,
  OpCode.ocExternal,
  OpCode.ocRow,
  OpCode.ocColumn,
  OpCode.ocAddress,
  OpCode.ocIndirect,
  OpCode.ocPi,
  OpCode.ocTrue,
  OpCode.ocFalse,
  OpCode.ocSum,
  OpCode.ocSumSQ,
  OpCode.ocProduct,
  OpCode.ocAverage,
  OpCode.ocAverageIf,
  OpCode.ocMinIfs_MS,
  OpCode.ocMaxIfs_MS,
  OpCode.ocConcat,
  OpCode.ocVLookup,
  OpCode.ocHLookup,
  OpCode.ocAmpersand,
]);

/** Tests the contiguous native relational opcode range. @param opcode - Operand opcode. @returns Whether relational. */
export function isComparison(opcode: OpCode): boolean {
  return opcode >= OpCode.ocEqual && opcode <= OpCode.ocGreaterEqual;
}

/** Original external spellings of the scalar spreadsheet errors. */
export const errorSymbols = new Map<string, FormulaError>([
  ["#NULL!", FormulaError.NoCode],
  ["#DIV/0!", FormulaError.DivisionByZero],
  ["#VALUE!", FormulaError.NoValue],
  ["#REF!", FormulaError.NoRef],
  ["#NAME?", FormulaError.NoName],
  ["#NUM!", FormulaError.IllegalFPOperation],
  ["#N/A", FormulaError.NotAvailable],
  ["#SPILL!", FormulaError.Spill],
]);

/** Reads the nearest significant source opcode around a label. @param source - Lexical tokens. @param offset - Neighbor offset. @param direction - Source direction. @returns Opcode. */
function LabelNeighbor(
  source: readonly FormulaToken[] | null,
  offset: number,
  direction: number,
): OpCode {
  while (source && offset >= 0 && offset < source.length) {
    const code = source[offset]?.GetOpCode();
    if (code !== undefined && code !== OpCode.ocSpaces && code !== OpCode.ocWhitespace) return code;
    offset += direction;
  }
  return OpCode.ocAdd;
}

/** Shared source-shaped grammar over actual code/RPN arrays, using GC token identities. */
export class FormulaCompiler {
  private mnNumFmt: SvNumFormatType = SvNumFormatType.UNDEFINED;
  /** Original current return-format type,initialized UNDEFINED before compilation. @returns Native format flags. */
  GetNumFormatType(): SvNumFormatType {
    return this.mnNumFmt;
  }
  protected meGrammar: Grammar = FormulaGrammar.Grammar.GRAM_UNSPECIFIED;
  /** Serializes source-order tokens rather than RPN, preserving the native forced-recalc prefix and output replacement. @param output - Actual mutable Unicode output owner. @returns Nothing. */
  CreateStringFromTokenArray(output: OUString): void {
    if (
      this.mpArr.GetLen() &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ODFF &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ODFF_A1 &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_NATIVE &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_NATIVE_XL_R1C1 &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ENGLISH_XL_R1C1 &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_ENGLISH &&
      this.meGrammar !== FormulaGrammar.Grammar.GRAM_OOXML
    )
      throw new Error("Scalar formula symbols must be selected before serialization");
    let result = this.mpArr.GetLen() && this.mpArr.IsRecalcModeForced() ? "=" : "";
    for (let index = 0; index < this.mpArr.GetLen(); ++index) {
      const token = this.mpArr.TokenAt(index) as FormulaToken;
      result += this.CreateStringFromToken(token);
      if (
        this.meGrammar !== FormulaGrammar.Grammar.GRAM_OOXML ||
        token.GetOpCode() !== OpCode.ocOffset ||
        token.GetType() !== StackVar.svByte
      )
        continue;
      const opening = this.mpArr.TokenAt(index + 1);
      const reference = this.mpArr.TokenAt(index + 2);
      if (
        opening?.GetOpCode() === OpCode.ocOpen &&
        opening.GetType() === StackVar.svSep &&
        reference?.GetOpCode() === OpCode.ocPush &&
        (reference.GetType() === StackVar.svDouble || reference.GetType() === StackVar.svString)
      ) {
        result += this.CreateStringFromToken(opening) + "#REF!";
        index += 2;
      }
    }
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
    if (op === OpCode.ocPush || op === OpCode.ocMatRef) {
      if (token.GetType() === StackVar.svDouble)
        return doubleToString((token as FormulaDoubleToken).GetDouble());
      if (token.GetType() === StackVar.svString)
        return this.AppendString((token as FormulaStringToken).GetString().getString());
      if (token instanceof FormulaErrorToken) {
        for (const [symbol, error] of errorSymbols) if (error === token.GetError()) return symbol;
        return "#VALUE!";
      }
      if (token.GetType() === StackVar.svSingleRef) return this.CreateStringFromSingleRef(token);
      if (token.GetType() === StackVar.svDoubleRef) return this.CreateStringFromDoubleRef(token);
      throw new Error("Formula output token family is not implemented");
    }
    if (op === OpCode.ocBad && token instanceof FormulaStringOpToken) {
      const value = token.GetString().getString();
      const units = value.getStr();
      let result = "";
      for (let i = 0; i < value.getLength(); i++) result += String.fromCharCode(units[i] as number);
      return result;
    }
    if (op === OpCode.ocMissing) return "";
    const symbols =
      this.meGrammar === FormulaGrammar.Grammar.GRAM_OOXML
        ? RID_STRLIST_FUNCTION_NAMES_ENGLISH_OOXML
        : RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF;
    const symbol = symbols.get(op);
    if (symbol === undefined) throw new Error("Formula output opcode is not implemented");
    return symbol;
  }
  /** Emits native quoted text, doubling quotes while retaining exact UTF16 units. @param value - String owner. @returns Text fragment. */
  protected AppendString(value: OUStringConstReference): string {
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
  protected mpCode: FormulaToken[] = [];
  private readonly nameFrames: { tokens: FormulaToken[]; index: number }[] = [];
  protected readonly mbComputeII: boolean;
  protected readonly mbMatrixFlag: boolean;
  /** Original virtual II hook. A native FormulaToken** borrows one actual code buffer plus its offset;no copied operand vector or pointer manager is introduced. @param token - Operation. @param parameters - Borrowed slot locations or null. @param count - Native argument count. @returns Nothing. */
  protected HandleIIOpCode(
    token: FormulaToken,
    parameters: readonly (readonly [FormulaToken[], number])[] | null,
    count: number,
  ): void {
    void token;
    void parameters;
    void count;
  }
  /** Original empty final-code virtual hook. @returns Nothing. */
  protected PostProcessCode(): void {}
  /** Resolves a native name token in the derived Calc document. @param token - Name token. @returns Expanded tokens or none. */
  protected HandleRange(token: FormulaToken): Iterable<FormulaToken> | undefined {
    void token;
    return undefined;
  }

  /** Resolves a row or column label in Calc's formula position. @param token - Label token. @param previous - Left opcode. @param next - Right opcode. @returns Expanded operand. */
  protected HandleColRowName(
    token: FormulaToken,
    previous: OpCode,
    next: OpCode,
  ): FormulaToken | undefined {
    void token;
    void previous;
    void next;
    return undefined;
  }

  /** Identifies a derived compiler's concrete matrix literal operand. @param token - Source token. @returns Whether the derived compiler owns the operand. */
  protected IsMatrixOperand(token: FormulaToken): boolean {
    void token;
    return false;
  }

  /** Binds the original code owner and suppresses implicit intersection for matrix formulas. @param array - Token owner. @param computeII - Implicit intersection mode. @param matrixFlag - Matrix mode. @returns Compiler. */
  constructor(array: FormulaTokenArray, computeII = false, matrixFlag = false) {
    this.mbComputeII = computeII && !matrixFlag;
    this.mbMatrixFlag = matrixFlag;
    this.mpArr = array;
  }
  /** Preserves the original empty virtual base operation; Calc records the first error in its override. @param error - Compiler error. @returns Nothing. */
  protected SetError(error: FormulaError): void {
    void error;
  }
  /** Compiles the supported default scalar grammar; the native boolean reports subtotal presence, not success. @returns False for this non-subtotal subset. */
  CompileTokenArray(): boolean {
    for (const token of this.mpArr.Tokens()) {
      if (token.GetOpCode() === OpCode.ocBad && this.mpArr.GetCodeError() !== FormulaError.NONE)
        continue;
      if (
        !arithmetic.has(token.GetOpCode()) ||
        (token.GetOpCode() === OpCode.ocIf && !(token instanceof FormulaJumpToken)) ||
        (token.GetInForceArray() !== ParamClass.Unknown && !this.IsMatrixOperand(token))
      )
        throw new Error("Formula opcode or array context is not implemented by scalar compilation");
    }
    if (this.mpArr.GetCodeError() !== FormulaError.NONE) {
      if (this.mnNumFmt === SvNumFormatType.UNDEFINED) this.mnNumFmt = SvNumFormatType.NUMBER;
      return false;
    }
    this.mpArr.DelRPN();
    const forced = this.mpArr.IsRecalcModeForced();
    this.mpArr.ClearRecalcMode();
    this.index = 0;
    this.nameFrames.length = 0;
    this.mpCode = [];
    this.meLastOp = OpCode.ocOpen;
    this.NextToken();
    if (this.Expression() !== OpCode.ocStop) this.SetError(FormulaError.OperatorExpected);
    this.PostProcessCode();
    this.nameFrames.length = 0;
    if (this.mpCode.length) this.mpArr.CreateNewRPNArrayFromData(this.mpCode, this.mpCode.length);
    if (
      this.mpArr.HasOpCodeRPN(OpCode.ocIndirect) ||
      this.mpArr.HasOpCodeRPN(OpCode.ocOffset) ||
      this.mpArr.HasOpCodeRPN(OpCode.ocGetActDate)
    )
      this.mpArr.SetExclusiveRecalcModeAlways();
    if (this.mpArr.GetCodeError() !== FormulaError.NONE) {
      this.mpArr.DelRPN();
      this.mpArr.SetHyperLink(false);
    }
    if (forced) this.mpArr.SetRecalcModeForced();
    if (this.mnNumFmt === SvNumFormatType.UNDEFINED) this.mnNumFmt = SvNumFormatType.NUMBER;
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
        let token = this.ReadSourceToken();
        while (
          token &&
          (token.GetOpCode() === OpCode.ocSpaces || token.GetOpCode() === OpCode.ocWhitespace)
        )
          token = this.ReadSourceToken();
        if (token) {
          if (token.GetOpCode() === OpCode.ocName) {
            if (this.nameFrames.length >= 100) {
              this.SetError(FormulaError.StackOverflow);
              return false;
            }
            const array = this.HandleRange(token);
            if (!array) {
              this.SetError(FormulaError.NoName);
              return false;
            }
            const contents = [...array];
            if (!this.IsNameExpressionEnclosed()) {
              contents.unshift(new FormulaByteToken(OpCode.ocOpen));
              contents.push(new FormulaByteToken(OpCode.ocClose));
            }
            this.nameFrames.push({
              tokens: contents,
              index: 0,
            });
            return this.GetToken();
          }
          if (token.GetOpCode() === OpCode.ocColRowName) {
            const frame = this.nameFrames.at(-1);
            const source = frame?.tokens ?? this.mpArr.GetArray();
            const offset = frame?.index ?? this.index;
            token = this.HandleColRowName(
              token,
              LabelNeighbor(source, offset - 2, -1),
              LabelNeighbor(source, offset, 1),
            );
            if (!token) return false;
          }
          this.mpToken = token;
          if (token.GetOpCode() === OpCode.ocPush && this.mbComputeII)
            this.HandleIIOpCode(token, null, 0);
          return true;
        }
      }
      this.mpToken = new FormulaByteToken(OpCode.ocStop);
      return false;
    } finally {
      --this.mnRecursion;
    }
  }
  /** Reads the current named-formula frame before resuming its caller. @returns Next token. */
  private ReadSourceToken(): FormulaToken | undefined {
    const frame = this.nameFrames.at(-1);
    if (!frame) return this.mpArr.TokenAt(this.index++) ?? undefined;
    const token = frame.tokens[frame.index++];
    if (token) return token;
    this.nameFrames.pop();
    return this.ReadSourceToken();
  }
  /** Checks the original field/argument borders on either side of an expanded name. @returns Whether the expression already has enclosing separators. */
  private IsNameExpressionEnclosed(): boolean {
    const frame = this.nameFrames.at(-1);
    const index = frame?.index ?? this.index;
    const adjacent =
      /** Resolves the first non-space opcode in the indicated direction. @param offset - Start position. @param direction - Scan step. @returns Opcode or the source boundary. */
      (offset: number, direction: number): OpCode => {
        for (let pos = index + offset; pos >= 0; pos += direction) {
          const op = (frame ? frame.tokens[pos] : this.mpArr.TokenAt(pos))?.GetOpCode();
          if (op !== OpCode.ocSpaces && op !== OpCode.ocWhitespace) return op ?? OpCode.ocSep;
        }
        return OpCode.ocSep;
      };
    const previous = adjacent(-2, -1),
      next = adjacent(0, 1);
    return (
      (previous === OpCode.ocOpen || previous === OpCode.ocSep) &&
      (next === OpCode.ocClose || next === OpCode.ocSep)
    );
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
      if (
        op >= OpCode.ocStartBinaryOperators &&
        op < OpCode.ocStopBinaryOperators &&
        op !== OpCode.ocAnd &&
        needsOperand
      )
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
    const logical = op === OpCode.ocTrue || op === OpCode.ocFalse;
    const logicalResult = logical || op === OpCode.ocNot || op === OpCode.ocIsEmpty;
    // Native lcl_GetRetFormat classifies nullary logical constants separately from numbers.
    if (op !== OpCode.ocOpen && this.mnNumFmt === SvNumFormatType.UNDEFINED)
      this.mnNumFmt = logicalResult
        ? SvNumFormatType.LOGICAL
        : op === OpCode.ocGetActDate
          ? SvNumFormatType.DATE
          : op === OpCode.ocPercentSign
            ? SvNumFormatType.PERCENT
            : SvNumFormatType.NUMBER;
    if (op === OpCode.ocPush || op === OpCode.ocMatRef) {
      this.PutCode(this.mpToken);
      if (this.NextToken() === OpCode.ocOpen) this.SetError(FormulaError.OperatorExpected);
    } else if (op === OpCode.ocMissing) {
      this.PutCode(this.mpToken);
      this.NextToken();
    } else if (op === OpCode.ocIf) {
      this.CompileIf(this.mpToken as FormulaJumpToken);
    } else if (
      logical ||
      op === OpCode.ocPi ||
      op === OpCode.ocNotAvail ||
      op === OpCode.ocGetActDate
    ) {
      const factor = this.mpToken;
      if (this.NextToken() !== OpCode.ocOpen) {
        this.SetError(FormulaError.PairExpected);
        this.PutCode(factor);
      } else {
        if (this.NextToken() !== OpCode.ocClose) this.SetError(FormulaError.PairExpected);
        this.PutCode(factor);
        this.NextToken();
      }
    } else if (
      op === OpCode.ocSqrt ||
      op === OpCode.ocIsError ||
      op === OpCode.ocFrequency ||
      op === OpCode.ocAnd ||
      op === OpCode.ocNot ||
      op === OpCode.ocIsEmpty ||
      op === OpCode.ocGetMonth ||
      op === OpCode.ocOffset ||
      op === OpCode.ocCountIf ||
      op === OpCode.ocExternal ||
      op === OpCode.ocRow ||
      op === OpCode.ocColumn ||
      op === OpCode.ocAddress ||
      op === OpCode.ocIndirect ||
      op === OpCode.ocSum ||
      op === OpCode.ocSumSQ ||
      op === OpCode.ocProduct ||
      op === OpCode.ocAverage ||
      op === OpCode.ocAverageIf ||
      op === OpCode.ocMinIfs_MS ||
      op === OpCode.ocMaxIfs_MS ||
      op === OpCode.ocConcat ||
      op === OpCode.ocVLookup ||
      op === OpCode.ocHLookup
    ) {
      const functionToken = this.mpToken as FormulaByteToken | FormulaExternalToken;
      let terminal = this.NextToken(),
        noParameters = false;
      if (terminal === OpCode.ocOpen) {
        terminal = this.NextToken();
        if (terminal === OpCode.ocClose) noParameters = true;
        else terminal = this.Expression();
      } else this.SetError(FormulaError.PairExpected);
      let parameterCount = 0;
      const locations: (readonly [FormulaToken[], number])[] = [];
      if (!noParameters) {
        parameterCount++;
        if (this.mbComputeII) locations.push([this.mpCode, this.mpCode.length - 1]);
        while (terminal === OpCode.ocSep && this.mpArr.GetCodeError() === FormulaError.NONE) {
          this.NextToken();
          parameterCount++;
          if (parameterCount > 255) this.SetError(FormulaError.CodeOverflow);
          terminal = this.Expression();
          if (this.mbComputeII && parameterCount <= 8)
            locations.push([this.mpCode, this.mpCode.length - 1]);
        }
        if (this.mbComputeII)
          this.HandleIIOpCode(functionToken, locations, Math.min(parameterCount, 8));
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
  /** Emits the scalar IF jump table and branch terminators in native RPN order. @param token - Original jump token. @returns Nothing. */
  private CompileIf(token: FormulaJumpToken): void {
    if (this.NextToken() !== OpCode.ocOpen) {
      this.SetError(FormulaError.PairExpected);
      return;
    }
    this.NextToken();
    let terminal = this.Expression();
    const branch = token.Clone() as FormulaJumpToken;
    const jumps = branch.GetJump();
    this.PutCode(branch);
    let count = 1;
    while (terminal === OpCode.ocSep && count < 3) {
      jumps[count++] = this.mpCode.length - 1;
      this.NextToken();
      terminal = this.Expression();
      this.PutCode(this.mpToken);
    }
    if (terminal !== OpCode.ocClose) {
      this.SetError(
        terminal === OpCode.ocSep ? FormulaError.IllegalParameter : FormulaError.PairExpected,
      );
      return;
    }
    jumps[count] = this.mpCode.length - 1;
    jumps[0] = count;
    this.NextToken();
  }
  /** Prefix negation binds before postfix percent and power. Prefix plus is already elided by NextToken. @returns Nothing. */
  private UnaryLine(): void {
    if (this.mpToken.GetOpCode() === OpCode.ocNegSub) {
      const token = this.mpToken;
      this.NextToken();
      this.UnaryLine();
      if (this.mbComputeII) this.HandleIIOpCode(token, [[this.mpCode, this.mpCode.length - 1]], 1);
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
      if (this.mbComputeII)
        this.HandleIIOpCode(this.mpToken, [[this.mpCode, this.mpCode.length - 1]], 1);
      this.PutCode(this.mpToken);
      this.NextToken();
    }
  }
  /** Emits the source's left-associative power chain. @returns Nothing. */
  private PowLine(): void {
    this.PostOpLine();
    while (this.mpToken.GetOpCode() === OpCode.ocPow) {
      const token = this.mpToken,
        first: readonly [FormulaToken[], number] = [this.mpCode, this.mpCode.length - 1];
      this.NextToken();
      this.PostOpLine();
      if (this.mbComputeII)
        this.HandleIIOpCode(token, [first, [this.mpCode, this.mpCode.length - 1]], 2);
      this.PutCode(token);
    }
  }
  /** Emits multiplication and division after their operands. @returns Nothing. */
  private MulDivLine(): void {
    this.PowLine();
    while (this.mpToken.GetOpCode() === OpCode.ocMul || this.mpToken.GetOpCode() === OpCode.ocDiv) {
      const token = this.mpToken,
        first: readonly [FormulaToken[], number] = [this.mpCode, this.mpCode.length - 1];
      this.NextToken();
      this.PowLine();
      if (this.mbComputeII)
        this.HandleIIOpCode(token, [first, [this.mpCode, this.mpCode.length - 1]], 2);
      this.PutCode(token);
    }
  }
  /** Emits addition and subtraction after their operands. @returns Nothing. */
  private AddSubLine(): void {
    this.MulDivLine();
    while (this.mpToken.GetOpCode() === OpCode.ocAdd || this.mpToken.GetOpCode() === OpCode.ocSub) {
      const token = this.mpToken,
        first: readonly [FormulaToken[], number] = [this.mpCode, this.mpCode.length - 1];
      this.NextToken();
      this.MulDivLine();
      if (this.mbComputeII)
        this.HandleIIOpCode(token, [first, [this.mpCode, this.mpCode.length - 1]], 2);
      this.PutCode(token);
    }
  }
  /** Emits the original concatenation operator below addition in precedence. @returns Nothing. */
  private ConcatLine(): void {
    this.AddSubLine();
    while (this.mpToken.GetOpCode() === OpCode.ocAmpersand) {
      const token = this.mpToken,
        first: readonly [FormulaToken[], number] = [this.mpCode, this.mpCode.length - 1];
      this.NextToken();
      this.AddSubLine();
      if (this.mbComputeII)
        this.HandleIIOpCode(token, [first, [this.mpCode, this.mpCode.length - 1]], 2);
      this.PutCode(token);
    }
  }
  /** Emits the native comparison layer below concatenation in precedence. @returns Nothing. */
  private CompareLine(): void {
    this.ConcatLine();
    while (isComparison(this.mpToken.GetOpCode())) {
      const token = this.mpToken;
      const first = this.mpCode.length - 1;
      this.NextToken();
      this.ConcatLine();
      if (this.mbComputeII)
        this.HandleIIOpCode(
          token,
          [
            [this.mpCode, first],
            [this.mpCode, this.mpCode.length - 1],
          ],
          2,
        );
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
      this.CompareLine();
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
