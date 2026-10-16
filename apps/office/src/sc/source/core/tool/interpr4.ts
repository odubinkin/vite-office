/** @fileoverview Numeric ScInterpreter RPN execution over the actual token array. Reference/function/matrix and number-format services remain unsupported. */
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaErrorToken,
  StackVar,
} from "../../../../formula/inc/token";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { approxAdd, approxSub } from "../../../../sal/inc/rtl/math";
import { div, power } from "../../../inc/math";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import type { ScTokenArray } from "../../../inc/tokenarray";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
/** Actual initialized numeric interpreter state, with token references owned by JS GC. */
export class ScInterpreter {
  readonly aPos: ScAddress;
  private pStack: FormulaToken[] = [];
  private nGlobalError = FormulaError.NONE;
  private xResult: FormulaToken | null = null;
  /** Binds the native cell/document/context/position/code responsibilities consumed by this specialization. @param pMyFormulaCell - Formula cell. @param mrDoc - Document. @param mrContext - Per-document context. @param position - Position. @param pArr - Compiled array. @returns Interpreter. */
  constructor(
    readonly pMyFormulaCell: ScFormulaCell | null,
    readonly mrDoc: ScDocument,
    readonly mrContext: ScInterpreterContext,
    position: ScAddress,
    private readonly pArr: ScTokenArray,
  ) {
    this.aPos = new ScAddress(position);
  }
  /** Preserves the first nonzero error. @param error - Error. @returns Nothing. */
  SetError(error: FormulaError): void {
    if (error !== FormulaError.NONE && this.nGlobalError === FormulaError.NONE)
      this.nGlobalError = error;
  }
  /** Reads the current interpreter error. @returns Error. */
  GetError(): FormulaError {
    return this.nGlobalError;
  }
  /** Borrows the actual final result token after Interpret. @returns Token. */
  GetResultToken(): FormulaToken {
    return this.xResult as FormulaToken;
  }
  /** Reads the final result's actual discriminator. @returns Type. */
  GetResultType(): StackVar {
    return this.GetResultToken().GetType();
  }
  /** Reads the actual numeric result after successful interpretation. @returns Number. */
  GetNumResult(): number {
    return (this.xResult as FormulaDoubleToken).GetDouble();
  }
  /** Pops a represented numeric value; this subset stops on the first error before another pop. Missing operands retain native stack errors. @returns Double. */
  private GetDouble(): number {
    const token = this.pStack.pop();
    if (!token) {
      this.SetError(FormulaError.UnknownStackVariable);
      return 0;
    }
    return (token as FormulaDoubleToken).GetDouble();
  }
  /** Projects nonfinite binary64/error values through the actual shared error encoding. @param value - Value. @returns Nothing. */
  private PushDouble(value: number): void {
    if (!Number.isFinite(value)) this.SetError(GetDoubleErrorValue(value));
    if (this.pStack.length >= 512) {
      this.SetError(FormulaError.StackOverflow);
      return;
    }
    this.pStack.push(
      this.nGlobalError === FormulaError.NONE
        ? new FormulaDoubleToken(value)
        : new FormulaErrorToken(this.nGlobalError),
    );
  }
  /** Runs the native numeric add/sub branch with common RTL cancellation behavior. @param subtract - Subtraction. @returns Nothing. */
  private CalculateAddSub(subtract: boolean): void {
    const right = this.GetDouble(),
      left = this.GetDouble();
    this.PushDouble(subtract ? approxSub(left, right) : approxAdd(left, right));
  }
  /** Executes the represented arithmetic token stream, preserving native result/error cardinality. @returns Final type. */
  Interpret(): StackVar {
    for (const token of this.pArr.RPNTokens()) {
      const op = token.GetOpCode();
      if (op === OpCode.ocPush) {
        if (token.GetType() === StackVar.svDouble)
          this.PushDouble((token as FormulaDoubleToken).GetDouble());
        else if (token.GetType() === StackVar.svError)
          this.SetError((token as FormulaErrorToken).GetError());
        else throw new Error("Nonnumeric interpreter operands are not implemented");
      } else if (op === OpCode.ocAdd || op === OpCode.ocSub)
        this.CalculateAddSub(op === OpCode.ocSub);
      else if (op === OpCode.ocNegSub) this.PushDouble(-this.GetDouble());
      else if (op === OpCode.ocPercentSign) this.PushDouble(div(this.GetDouble(), 100));
      else if (op === OpCode.ocMul || op === OpCode.ocDiv || op === OpCode.ocPow) {
        const right = this.GetDouble(),
          left = this.GetDouble();
        this.PushDouble(
          op === OpCode.ocMul
            ? left * right
            : op === OpCode.ocDiv
              ? div(left, right)
              : power(left, right),
        );
      } else throw new Error("Interpreter opcode is not implemented");
      if (this.nGlobalError !== FormulaError.NONE) break;
    }
    if (this.pStack.length !== 1)
      this.SetError(this.pStack.length > 1 ? FormulaError.OperatorExpected : FormulaError.NoCode);
    this.xResult =
      this.nGlobalError !== FormulaError.NONE
        ? new FormulaErrorToken(this.nGlobalError)
        : (this.pStack.pop() as FormulaToken);
    this.pStack = [];
    return this.GetResultType();
  }
}
