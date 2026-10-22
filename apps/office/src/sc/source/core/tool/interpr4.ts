/** @fileoverview Numeric/local-reference RPN execution and ordinary scalar aggregate branches from interpr4/interpr6 over actual tokens and cell views. Ranges,matrix and locale-conversion services remain unsupported. */
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaErrorToken,
  FormulaStringToken,
  FormulaByteToken,
  StackVar,
} from "../../../../formula/inc/token";
import { ScRefCellValue } from "../../../inc/cellvalue";
import { ScSingleRefToken, ScEmptyCellToken } from "../../../inc/token";
import { CellType } from "../../../inc/global";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { FormulaConstTokenRef } from "../../../../formula/inc/types";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { approxAdd, approxSub } from "../../../../sal/inc/rtl/math";
import { div, power } from "../../../inc/math";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ScDocument } from "../../../inc/document";
import { ScAddress } from "../../../inc/address";
import type { ScTokenArray } from "../../../inc/tokenarray";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { KahanSum } from "../../../inc/kahan";
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
  GetResultToken(): FormulaConstTokenRef {
    return this.xResult;
  }
  /** Reads the final result's actual discriminator. @returns Type. */
  GetResultType(): StackVar {
    return (this.xResult as FormulaToken).GetType();
  }
  /** Reads the actual numeric result after successful interpretation. @returns Number. */
  GetNumResult(): number {
    return (this.xResult as FormulaDoubleToken).GetDouble();
  }
  /** Pops a represented numeric value or reference, preserving source cell reads even after an earlier error. Missing operands retain native stack errors. @returns Double. */
  private GetDouble(): number {
    const token = this.pStack[this.pStack.length - 1];
    if (!token) {
      this.SetError(FormulaError.UnknownStackVariable);
      return 0;
    }
    if (token.GetType() === StackVar.svSingleRef) {
      const address = this.PopSingleRef();
      return this.GetCellValue(address, new ScRefCellValue(this.mrDoc, address));
    }
    if (token.GetType() === StackVar.svError) {
      this.PopError();
      return 0;
    }
    this.pStack.pop();
    if (token.GetType() === StackVar.svMissing || token.GetType() === StackVar.svEmptyCell)
      return 0;
    if (token.GetType() === StackVar.svString)
      throw new Error("Locale string-to-number conversion is not implemented");
    return (token as FormulaDoubleToken).GetDouble();
  }
  /** Drops the actual top token,assigning its error exactly as native PopError. @returns Nothing. */
  private PopError(): void {
    const token = this.pStack.pop();
    if (!token) this.SetError(FormulaError.UnknownStackVariable);
    else if (token.GetType() === StackVar.svError)
      this.nGlobalError = (token as FormulaErrorToken).GetError();
  }
  /** Executes ordinary non-subtotal SUM/SUMSQ/PRODUCT/AVERAGE parameter iteration from interpr6. Matrix,range and reference-list branches require their native owners. @param op - Aggregate opcode. @param parameterCount - Native byte arity. @returns Nothing. */
  private IterateParameters(op: OpCode, parameterCount: number): void {
    const result = new KahanSum(op === OpCode.ocProduct ? 1 : 0);
    let count = 0;
    while (parameterCount-- > 0) {
      const token = this.pStack[this.pStack.length - 1];
      if (!token) {
        this.SetError(FormulaError.UnknownStackVariable);
        break;
      }
      let value: number;
      switch (token.GetType()) {
        case StackVar.svString:
          this.pStack.pop();
          while (parameterCount-- > 0) this.PopError();
          this.SetError(FormulaError.NoValue);
          continue;
        case StackVar.svDouble:
        case StackVar.svMissing:
        case StackVar.svEmptyCell:
          value = this.GetDouble();
          break;
        case StackVar.svSingleRef: {
          const address = this.PopSingleRef();
          if (this.nGlobalError === FormulaError.NoRef) {
            this.PushDouble(0);
            return;
          }
          const cell = new ScRefCellValue(this.mrDoc, address);
          if (!cell.hasNumeric()) continue;
          value = this.GetCellValue(address, cell);
          if (this.nGlobalError !== FormulaError.NONE) continue;
          break;
        }
        case StackVar.svError:
          this.PopError();
          continue;
        default:
          throw new Error("Aggregate range/matrix/reference-list operands are not implemented");
      }
      count++;
      if (op === OpCode.ocProduct) result.multiply_assign(value);
      else result.add(op === OpCode.ocSumSQ ? value * value : value);
    }
    let value = result.get();
    if (op === OpCode.ocAverage) value = div(value, count);
    else if (op === OpCode.ocProduct && count === 0) value = 0;
    this.PushDouble(value);
  }
  /** Resolves actual initialized reference data through its original owner. @returns Absolute address. */
  private PopSingleRef(): ScAddress {
    const reference = (this.pStack.pop() as ScSingleRefToken).GetSingleRef();
    if (reference.IsDeleted()) {
      this.SetError(FormulaError.NoRef);
      return new ScAddress();
    }
    const address = reference.toAbs(this.mrDoc, this.aPos);
    if (!this.mrDoc.GetSheetLimits().ValidCol(address.Col())) {
      this.SetError(FormulaError.NoRef);
      address.SetCol(0);
    }
    if (!this.mrDoc.ValidRow(address.Row())) {
      this.SetError(FormulaError.NoRef);
      address.SetRow(0);
    }
    if (address.Tab() < 0 || address.Tab() >= this.mrDoc.GetTableCount()) {
      this.SetError(FormulaError.NoRef);
      address.SetTab(0);
    }
    return address;
  }
  /** Preserves a previous error while reading the actual referenced numeric cell. Locale string coercion remains unsupported. @param address - Position. @param cell - Actual view. @returns Double. */
  private GetCellValue(address: ScAddress, cell: ScRefCellValue): number {
    const previous = this.nGlobalError;
    this.nGlobalError = FormulaError.NONE;
    const result = this.GetCellValueOrZero(address, cell);
    if (previous !== FormulaError.NONE) this.nGlobalError = previous;
    return result;
  }
  /** Reads represented values with native empty/error semantics and no formatter substitute. @param address - Position. @param cell - Actual view. @returns Value. */
  private GetCellValueOrZero(address: ScAddress, cell: ScRefCellValue): number {
    void address;
    if (cell.getType() === CellType.CELLTYPE_FORMULA) {
      const formula = cell.getFormula() as ScFormulaCell,
        error = formula.GetErrCode();
      if (error !== FormulaError.NONE) {
        this.SetError(error);
        return 0;
      }
      if (formula.IsValue()) return formula.GetValue();
      throw new Error("Locale string-to-number conversion is not implemented");
    }
    if (cell.getType() === CellType.CELLTYPE_VALUE) return cell.getDouble();
    if (cell.getType() === CellType.CELLTYPE_STRING)
      throw new Error("Locale string-to-number conversion is not implemented");
    return 0;
  }
  /** Creates native final numeric/empty/text results from a real referenced cell. @param address - Absolute reference. @returns Nothing. */
  private PushCellResultToken(address: ScAddress): void {
    const cell = new ScRefCellValue(this.mrDoc, address);
    if (cell.hasEmptyValue()) {
      this.PushWithoutError(
        new ScEmptyCellToken(cell.getType() === CellType.CELLTYPE_FORMULA, false),
      );
      return;
    }
    if (cell.getType() === CellType.CELLTYPE_FORMULA) {
      const error = (cell.getFormula() as ScFormulaCell).GetErrCode();
      if (error !== FormulaError.NONE) {
        this.SetError(error);
        return;
      }
    }
    if (cell.hasString()) {
      const string =
        cell.getType() === CellType.CELLTYPE_FORMULA
          ? (cell.getFormula() as ScFormulaCell).GetString()
          : (cell.getSharedString() as SharedStringConstReference);
      this.PushWithoutError(new FormulaStringToken(string));
      return;
    }
    this.PushDouble(this.GetCellValue(address, cell));
  }
  /** Pushes an actual token with the source stack limit; no token lifetime engine is introduced. @param token - Token. @returns Nothing. */
  private PushWithoutError(token: FormulaToken): void {
    if (this.pStack.length >= 512) {
      this.SetError(FormulaError.StackOverflow);
      return;
    }
    this.pStack.push(token);
  }
  /** Borrows the native final text result after a string interpretation. @returns Shared string. */
  GetStringResult(): SharedStringConstReference {
    return (this.xResult as FormulaStringToken).GetString();
  }
  /** Projects nonfinite binary64/error values through the actual shared error encoding. @param value - Value. @returns Nothing. */
  private PushDouble(value: number): void {
    if (!Number.isFinite(value)) this.SetError(GetDoubleErrorValue(value));
    this.PushWithoutError(
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
        else this.PushWithoutError(token);
      } else if (op === OpCode.ocMissing) this.PushWithoutError(token);
      else if (
        op === OpCode.ocSum ||
        op === OpCode.ocSumSQ ||
        op === OpCode.ocProduct ||
        op === OpCode.ocAverage
      )
        this.IterateParameters(op, (token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocAdd || op === OpCode.ocSub)
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
    if (
      this.pStack.length === 1 &&
      (this.pStack[0] as FormulaToken).GetType() === StackVar.svSingleRef
    ) {
      const address = this.PopSingleRef();
      if (this.nGlobalError === FormulaError.NONE) this.PushCellResultToken(address);
    }
    if (this.pStack.length !== 1)
      this.SetError(this.pStack.length > 1 ? FormulaError.OperatorExpected : FormulaError.NoCode);
    else if ((this.pStack[0] as FormulaToken).GetType() === StackVar.svError)
      this.nGlobalError = (this.pStack[0] as FormulaErrorToken).GetError();
    this.xResult =
      this.nGlobalError !== FormulaError.NONE
        ? new FormulaErrorToken(this.nGlobalError)
        : (this.pStack.pop() as FormulaToken);
    this.pStack = [];
    return this.GetResultType();
  }
}
