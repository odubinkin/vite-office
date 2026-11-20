/** @fileoverview Numeric and local-reference RPN execution, including ordinary aggregates over native ranges and constant matrices. */
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaErrorToken,
  FormulaStringToken,
  FormulaByteToken,
  FormulaJumpToken,
  StackVar,
} from "../../../../formula/inc/token";
import { ScCalcConfig } from "../../../inc/calcconfig";
import { ScGlobal } from "../../../inc/global";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { ScRefCellValue } from "../../../inc/cellvalue";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScEmptyCellToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScMatrixToken,
  ScMatrixFormulaCellToken,
} from "../../../inc/token";
import { ScMatrix } from "./scmatrix";
import type { ScSingleRefData } from "../../../inc/refdata";
import { RangeColumnSpanSet } from "../../../inc/columnspanset";
import { ScValueIterator } from "../../../inc/dociter";
import { FuncSum, IterateMatrix, type MatrixAggregate } from "./interpr6";
import { ScCompiler } from "../../../inc/compiler";
import { CellType } from "../../../inc/global";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { FormulaConstTokenRef } from "../../../../formula/inc/types";
import { FormulaError, GetDoubleErrorValue } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import { approxAdd, approxCeil, approxFloor, approxSub } from "../../../../sal/inc/rtl/math";
import { div, power } from "../../../inc/math";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScTokenArray } from "../../../inc/tokenarray";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { KahanSum } from "../../../inc/kahan";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SAL_MAX_INT32, SAL_MIN_INT32 } from "../../../../sal/inc/types";
import { GetString as GetEditString } from "./editutil";
import { ScMatValType } from "../../../inc/types";
import type { ScExternalCacheToken } from "../../ui/docshell/externalrefmgr";
import { CalculateMatrixLookup, InterpretReferenceOpcode, ScAnd } from "./interpr1";
import { InterpretConditionalAggregate } from "./interpr1.conditional";
import { CompareScalar } from "./compare";
import { InterpretDateOpcode, ScRangeFunc } from "./interpr2";
import { ScFrequency, ScMatRef } from "./interpr5";
import { InterpretAnalysisAddIn } from "./addincol.analysis";
import { ScIsEmpty, ScIsError, ScNot, ScOffset } from "./interpr1.reference";
import { isComparison } from "../../../../formula/inc/FormulaCompiler";
import { ScQueryEntry, type ScQueryItem } from "./queryentry";
import { ScQueryCellIteratorDirect } from "../data/queryiter";
import { SearchParam } from "../../../../unotools/source/i18n/textsearch";

const kScInterpreterMaxStrLen = Math.trunc(SAL_MAX_INT32 / 8);
/** Actual initialized numeric interpreter state, with token references owned by JS GC. */
export class ScInterpreter {
  private static mpGlobalConfig: ScCalcConfig | null = null;
  /** Original lazy process configuration owner. @returns Actual shared global value. */
  private static GetOrCreateGlobalConfig(): ScCalcConfig {
    return (this.mpGlobalConfig ??= new ScCalcConfig());
  }
  /** Original assignment preserves the existing global value owner. @param config - Source value. @returns Nothing. */
  static SetGlobalConfig(config: ScCalcConfig): void {
    this.GetOrCreateGlobalConfig().copy_assign(config);
  }
  /** Original borrowed global settings. @returns Actual configuration. */
  static GetGlobalConfig(): ScCalcConfig {
    return this.GetOrCreateGlobalConfig();
  }
  private readonly maCalcConfig = new ScCalcConfig();
  private nCurFmtType: number = SvNumFormatType.ALL;
  private nRetFmtType: SvNumFormatType = SvNumFormatType.NUMBER;
  private mnStringNoValueError: FormulaError = FormulaError.NoValue;
  /** Original implicit calculation-value teardown. @returns Nothing. */
  Dispose(): void {
    this.maCalcConfig.dispose();
  }
  /** Original global settings followed by the document-specific merge. @returns Nothing. */
  private MergeCalcConfig(): void {
    this.maCalcConfig.copy_assign(ScInterpreter.GetGlobalConfig());
    this.maCalcConfig.MergeDocumentSpecific(this.mrDoc.GetCalcConfig());
  }
  /** Original conversion updates the current format type and first-error state. @param value - Native string. @returns Numeric conversion. */
  private ConvertStringToValue(value: OUStringConstReference): number {
    const error: [FormulaError] = [FormulaError.NONE],
      type: [number] = [this.nCurFmtType];
    const result = ScGlobal.ConvertStringToValue(
      value,
      this.maCalcConfig,
      error,
      this.mnStringNoValueError,
      this.mrContext,
      type,
    );
    this.nCurFmtType = type[0];
    if (error[0] !== FormulaError.NONE) this.SetError(error[0]);
    return result;
  }
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
    this.MergeCalcConfig();
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
    if (token.GetType() === StackVar.svDoubleRef) {
      const range = this.PopDoubleRef(),
        address = new ScAddress();
      if (this.nGlobalError === FormulaError.NONE && this.DoubleRefToPosSingleRef(range, address))
        return this.GetCellValue(address, new ScRefCellValue(this.mrDoc, address));
      return 0;
    }
    if (token instanceof ScExternalSingleRefToken) {
      const value = this.PopExternalSingleRef();
      if (value instanceof FormulaDoubleToken) return value.GetDouble();
      if (value instanceof FormulaStringToken)
        return this.ConvertStringToValue(value.GetString().getString());
      return 0;
    }
    if (token instanceof ScExternalDoubleRefToken) {
      const matrix = this.PopExternalDoubleRef();
      if (!matrix) return 0;
      const value = matrix.Get(0, 0);
      try {
        if (value.nType === ScMatValType.String)
          return this.ConvertStringToValue(value.GetString().getString());
        this.SetError(value.GetError());
        return this.nGlobalError === FormulaError.NONE ? value.fVal : 0;
      } finally {
        value.dispose();
      }
    }
    if (token.GetType() === StackVar.svError) {
      this.PopError();
      return 0;
    }
    this.pStack.pop();
    if (token.GetType() === StackVar.svMissing || token.GetType() === StackVar.svEmptyCell)
      return 0;
    if (token.GetType() === StackVar.svString)
      return this.ConvertStringToValue((token as FormulaStringToken).GetString().getString());
    return (token as FormulaDoubleToken).GetDouble();
  }
  /** Converts the native scalar with approximate truncation and signed32 bounds. @returns Integer or error fallback. */
  GetInt32(): number {
    const value = this.GetDouble();
    const rounded = value < 0 ? approxCeil(value) : approxFloor(value);
    if (rounded < SAL_MIN_INT32 || rounded > SAL_MAX_INT32) {
      this.SetError(FormulaError.IllegalArgument);
      return SAL_MAX_INT32;
    }
    return rounded;
  }
  /** Drops the actual top token,assigning its error exactly as native PopError. @returns Nothing. */
  private PopError(): void {
    const token = this.pStack.pop();
    if (!token) this.SetError(FormulaError.UnknownStackVariable);
    else if (token.GetType() === StackVar.svError)
      this.nGlobalError = (token as FormulaErrorToken).GetError();
  }
  /** Gets a scalar's input-line spelling in the original general number format. @param value - Numeric operand. @returns Text value. */
  private GetStringFromDouble(value: number): string {
    const key = this.mrContext
      .GetFormatTable()
      .GetStandardFormat(SvNumFormatType.NUMBER, ScGlobal.eLnge);
    const spelling = this.mrContext.NFGetInputLineString(value, key);
    try {
      return text(spelling);
    } finally {
      spelling.dispose();
    }
  }
  /** Reads the native text coercion of a referenced cell and propagates formula errors. @param cell - Actual cell. @returns Text value. */
  private GetCellString(cell: ScRefCellValue): string {
    if (this.nGlobalError !== FormulaError.NONE) return "";
    const formula = cell.getFormula();
    if (formula) {
      this.SetError(formula.GetErrCode());
      return formula.IsValue()
        ? this.GetStringFromDouble(formula.GetValue())
        : text(formula.GetString().getString());
    }
    if (cell.getType() === CellType.CELLTYPE_VALUE)
      return this.GetStringFromDouble(cell.getDouble());
    const shared = cell.getSharedString();
    const edit = cell.getEditText();
    const multiline = edit ? GetEditString(edit, this.mrDoc) : undefined;
    try {
      const spelling = shared ? text(shared.getString()) : multiline ? text(multiline) : "";
      return this.mrDoc.GetDocOptions().IsIgnoreLineBreaks()
        ? spelling.replace(/[\r\n]/gu, "")
        : spelling;
    } finally {
      multiline?.dispose();
    }
  }
  /** Pops a represented string operand using native empty, reference, and error rules. @returns Text value. */
  private GetString(): string {
    const token = this.pStack.at(-1);
    switch (token?.GetType()) {
      case StackVar.svSingleRef: {
        const address = this.PopSingleRef();
        return this.GetCellString(new ScRefCellValue(this.mrDoc, address));
      }
      case StackVar.svDoubleRef: {
        const range = this.PopDoubleRef(),
          address = new ScAddress();
        return this.nGlobalError === FormulaError.NONE &&
          this.DoubleRefToPosSingleRef(range, address)
          ? this.GetCellString(new ScRefCellValue(this.mrDoc, address))
          : "";
      }
      case StackVar.svExternalSingleRef: {
        const value = this.PopExternalSingleRef();
        if (value instanceof FormulaDoubleToken) return this.GetStringFromDouble(value.GetDouble());
        if (value instanceof FormulaStringToken) return text(value.GetString().getString());
        return "";
      }
      case StackVar.svExternalDoubleRef: {
        const matrix = this.PopExternalDoubleRef();
        if (!matrix) return "";
        const value = matrix.Get(0, 0);
        try {
          if (value.nType === ScMatValType.String) return text(value.GetString().getString());
          this.SetError(value.GetError());
          return "";
        } finally {
          value.dispose();
        }
      }
      case StackVar.svDouble:
        return this.GetStringFromDouble(this.GetDouble());
      case StackVar.svString:
        this.pStack.pop();
        return text((token as FormulaStringToken).GetString().getString());
      case StackVar.svError:
      case StackVar.svMissing:
      case StackVar.svEmptyCell:
        this.PopError();
        return "";
      default:
        this.PopError();
        this.SetError(FormulaError.IllegalArgument);
        return "";
    }
  }
  /** Pushes the interned native text result or the existing interpreter error. @param value - Result text. @returns Nothing. */
  private PushString(value: string): void {
    if (this.nGlobalError !== FormulaError.NONE) {
      this.PushWithoutError(new FormulaErrorToken(this.nGlobalError));
      return;
    }
    const source = unicode(value);
    try {
      const shared = this.mrDoc.GetSharedStringPool().intern(source);
      this.PushWithoutError(new FormulaStringToken(shared, SharedString.move));
    } finally {
      source.dispose();
    }
  }
  /** Original string-result size check. @param length - Current UTF16 length. @param increase - Appended UTF16 length. @returns Whether the result fits. */
  private CheckStringResultLen(length: number, increase: number): boolean {
    if (increase <= kScInterpreterMaxStrLen - length) return true;
    this.SetError(FormulaError.StringOverflow);
    return false;
  }
  /** Native CONCATENATE visits arguments in source order. @param count - Number of source arguments. @returns Nothing. */
  private ScConcat(count: number): void {
    const start = this.pStack.length - count;
    if (start < 0) {
      this.SetError(FormulaError.UnknownStackVariable);
      return;
    }
    this.pStack.push(...this.pStack.splice(start).reverse());
    let result = "";
    while (count-- > 0) {
      const part = this.GetString();
      if (!this.CheckStringResultLen(result.length, part.length)) break;
      result += part;
    }
    this.PushString(result);
  }
  /** Original scalar ampersand reads its right operand first. @returns Nothing. */
  private ScAmpersand(): void {
    const right = this.GetString(),
      left = this.GetString();
    this.PushString(this.CheckStringResultLen(left.length, right.length) ? left + right : "");
  }
  /** Executes ordinary non-subtotal SUM/SUMSQ/PRODUCT/AVERAGE parameter iteration from interpr6. @param op - Aggregate opcode. @param parameterCount - Native byte arity. @returns Nothing. */
  private IterateParameters(op: MatrixAggregate, parameterCount: number): void {
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
        case StackVar.svExternalSingleRef: {
          const cached = this.PopExternalSingleRef();
          if (!(cached instanceof FormulaDoubleToken)) continue;
          value = cached.GetDouble();
          break;
        }
        case StackVar.svExternalDoubleRef: {
          const matrix = this.PopExternalDoubleRef();
          if (matrix) count += IterateMatrix(matrix, op, result);
          continue;
        }
        case StackVar.svError:
          this.PopError();
          continue;
        case StackVar.svMatrix: {
          this.pStack.pop();
          const matrix = (token as ScMatrixToken).GetMatrix();
          if (matrix === null) this.SetError(FormulaError.UnknownVariable);
          else count += IterateMatrix(matrix, op, result);
          continue;
        }
        case StackVar.svDoubleRef: {
          const range = this.PopDoubleRef();
          if (this.nGlobalError === FormulaError.NoRef) {
            this.PushDouble(0);
            return;
          }
          if (op === OpCode.ocSum) {
            const action = new FuncSum(this.mrContext);
            new RangeColumnSpanSet(range).executeColumnAction(this.mrDoc, action);
            const error = action.getError();
            if (error !== FormulaError.NONE) {
              this.SetError(error);
              this.PushDouble(0);
              return;
            }
            result.add(action.getSum());
          } else {
            const iterator = new ScValueIterator(this.mrContext, range),
              output = { error: FormulaError.NONE, value: 0 };
            if (iterator.GetFirst(output)) {
              do {
                this.SetError(output.error);
                if (op === OpCode.ocProduct) result.multiply_assign(output.value);
                else result.add(op === OpCode.ocSumSQ ? output.value * output.value : output.value);
                count++;
              } while (iterator.GetNext(output));
              this.SetError(output.error);
            }
          }
          continue;
        }
        default:
          throw new Error("Aggregate operand type is not implemented");
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
    return this.SingleRefToVars(reference);
  }
  /** Original absolute coordinate resolution and per-axis error/clamp branches. @param reference - Actual single reference data. @returns Absolute native address. */
  private SingleRefToVars(reference: ScSingleRefData): ScAddress {
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
  /** Original ordinary PopDoubleRef/DoubleRefToRange branch with real endpoint resolution and ordering. Reference lists and table operations remain unsupported. @returns Native range. */
  private PopDoubleRef(): ScRange {
    const reference = (this.pStack.pop() as ScDoubleRefToken).GetDoubleRef();
    if (reference.IsDeleted()) {
      this.SetError(FormulaError.NoRef);
      return new ScRange();
    }
    return new ScRange(this.SingleRefToVars(reference.Ref1), this.SingleRefToVars(reference.Ref2));
  }
  /** Original non-matrix singleton/implicit-intersection choice for a scalar range result. @param range - Actual range. @param address - Address output. @returns Selected unique cell. */
  private DoubleRefToPosSingleRef(range: ScRange, address: ScAddress): boolean {
    if (range.aStart.equals(range.aEnd)) {
      address.assign(range.aStart);
      return true;
    }
    const result = ScCompiler.DoubleRefToPosSingleRefScalarCase(range, address, this.aPos);
    if (!result) this.SetError(FormulaError.NoValue);
    return result;
  }
  /** Preserves a previous error while reading the actual referenced numeric cell. String coercion uses the actual calculation policy. @param address - Position. @param cell - Actual view. @returns Double. */
  private GetCellValue(address: ScAddress, cell: ScRefCellValue): number {
    const previous = this.nGlobalError;
    this.nGlobalError = FormulaError.NONE;
    const result = this.GetCellValueOrZero(address, cell);
    if (previous !== FormulaError.NONE || this.GetError() === FormulaError.CellNoValue)
      this.nGlobalError = previous;
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
      return this.ConvertStringToValue(formula.GetString().getString());
    }
    if (cell.getType() === CellType.CELLTYPE_VALUE) return cell.getDouble();
    if (cell.getType() === CellType.CELLTYPE_STRING)
      return this.ConvertStringToValue(
        (cell.getSharedString() as SharedStringConstReference).getString(),
      );
    if (cell.getType() === CellType.CELLTYPE_EDIT)
      throw new Error("ScEditUtil::GetString is not implemented");
    return 0;
  }
  /** Pops the external scalar reference and resolves its absolute source cell through the document manager. @returns Cached value or absence following an error. */
  private PopExternalSingleRef(): ScExternalCacheToken | ScEmptyCellToken | undefined {
    const token = this.pStack.pop() as ScExternalSingleRefToken;
    if (this.nGlobalError !== FormulaError.NONE) return undefined;
    const manager = this.mrDoc.GetExternalRefManager();
    const file = token.GetFileId(),
      ref = token.GetSingleRef();
    if (manager.getExternalFileName(file) === undefined) this.SetError(FormulaError.NoName);
    else if (ref.IsTabRel()) this.SetError(FormulaError.NoRef);
    else {
      const value = manager.getSingleRefToken(
        file,
        text(token.GetTableName().getString()),
        ref.toAbs(this.mrDoc, this.aPos),
        this.aPos,
      );
      if (value instanceof FormulaErrorToken) this.SetError(value.GetError());
      else return value;
    }
    return undefined;
  }
  /** Pops an external range and resolves its native one-sheet matrix. @returns Cached matrix or absence following an error. */
  private PopExternalDoubleRef(): ScMatrix | undefined {
    const token = this.pStack.pop() as ScExternalDoubleRefToken;
    if (this.nGlobalError !== FormulaError.NONE) return undefined;
    const manager = this.mrDoc.GetExternalRefManager();
    const file = token.GetFileId(),
      ref = token.GetDoubleRef();
    if (manager.getExternalFileName(file) === undefined) {
      this.SetError(FormulaError.NoName);
      return undefined;
    }
    const range = ref.toAbs(this.mrDoc, this.aPos);
    if (
      ref.Ref1.IsTabRel() ||
      ref.Ref2.IsTabRel() ||
      !this.mrDoc.ValidColRow(range.aStart.Col(), range.aStart.Row()) ||
      !this.mrDoc.ValidColRow(range.aEnd.Col(), range.aEnd.Row())
    ) {
      this.SetError(FormulaError.NoRef);
      return undefined;
    }
    const value = manager.getDoubleRefTokens(
      file,
      text(token.GetTableName().getString()),
      range,
      this.aPos,
    );
    if (!(value instanceof FormulaErrorToken)) return value;
    this.SetError(value.GetError());
    return undefined;
  }

  /** Resolves the original matrix operand types consumed by the matrix lookup path. @returns Matrix or argument error. */
  private GetLookupMatrix(): ScMatrix | undefined {
    const token = this.pStack.at(-1);
    if (token instanceof ScExternalDoubleRefToken) return this.PopExternalDoubleRef();
    if (token instanceof ScExternalSingleRefToken) {
      const value = this.PopExternalSingleRef();
      if (!value) return undefined;
      const matrix = new ScMatrix(1, 1);
      if (value instanceof FormulaDoubleToken) matrix.PutDouble(value.GetDouble(), 0, 0);
      else if (value instanceof FormulaStringToken) matrix.PutString(value.GetString(), 0, 0);
      return matrix;
    }
    if (token instanceof ScMatrixToken) {
      this.pStack.pop();
      const matrix = token.GetMatrix();
      if (matrix) return matrix;
    }
    this.SetError(FormulaError.IllegalParameter);
    return undefined;
  }

  /** Reads a query key with native cell and matrix type selection. @param emptyAsZero - Conditional aggregate policy for empty cell references. @returns Query key or absence following an error. */
  private FillLookupEntry(emptyAsZero = false): ScQueryItem | undefined {
    let key: number | string;
    const token = this.pStack.at(-1);
    if (token instanceof FormulaDoubleToken) return this.GetDouble();
    if (token instanceof FormulaStringToken) key = this.GetString();
    else if (token instanceof ScSingleRefToken || token instanceof ScDoubleRefToken) {
      let address: ScAddress;
      if (token instanceof ScSingleRefToken) address = this.PopSingleRef();
      else {
        const range = this.PopDoubleRef();
        address = new ScAddress();
        if (
          this.nGlobalError !== FormulaError.NONE ||
          !this.DoubleRefToPosSingleRef(range, address)
        )
          return undefined;
      }
      const cell = new ScRefCellValue(this.mrDoc, address);
      if (emptyAsZero && cell.isEmpty()) return 0;
      if (cell.hasNumeric()) return this.GetCellValue(address, cell);
      key = this.GetCellString(cell);
    } else {
      const matrix = this.GetLookupMatrix();
      if (!matrix) return undefined;
      const value = matrix.Get(0, 0);
      try {
        if (ScMatrix.IsValueType(value.nType)) {
          this.SetError(value.GetError());
          return value.fVal;
        }
        key = text(value.GetString().getString());
      } finally {
        value.dispose();
      }
    }
    return this.ComparisonString(key);
  }

  /** Gets the original and pooled caseless forms. @param key - Native text content. @returns Comparison operands. */
  private ComparisonString(key: string): Exclude<ScQueryItem, number> {
    const native = unicode(key);
    const interned = this.mrDoc.GetSharedStringPool().intern(native);
    try {
      return { text: key, ignoreCase: text(interned.getIgnoreCaseString()) };
    } finally {
      interned.dispose();
      native.dispose();
    }
  }

  /** Pops one normal comparison operand without coercing text into numbers. @returns Comparable cell or empty. */
  private PopComparisonValue(): ScQueryItem | null {
    const token = this.pStack.at(-1);
    if (token instanceof FormulaDoubleToken || token?.GetType() === StackVar.svMissing)
      return this.GetDouble();
    if (token instanceof FormulaStringToken) return this.ComparisonString(this.GetString());
    if (token instanceof ScSingleRefToken || token instanceof ScDoubleRefToken) {
      const address = token instanceof ScSingleRefToken ? this.PopSingleRef() : new ScAddress();
      if (token instanceof ScDoubleRefToken) {
        const range = this.PopDoubleRef();
        if (!this.DoubleRefToPosSingleRef(range, address)) return null;
      }
      if (this.nGlobalError !== FormulaError.NONE) return null;
      const cell = new ScRefCellValue(this.mrDoc, address);
      if (cell.hasEmptyValue()) return null;
      return cell.hasString()
        ? this.ComparisonString(this.GetCellString(cell))
        : this.GetCellValue(address, cell);
    }
    if (token instanceof ScExternalSingleRefToken) return this.FillLookupEntry() ?? null;
    this.PopError();
    if (token?.GetType() !== StackVar.svEmptyCell) this.SetError(FormulaError.IllegalParameter);
    return null;
  }

  /** Runs the common native lookup stack and source-specific result rules. @param count - Token argument count. @param horizontal - Whether to search across the first row. @returns Nothing. */
  private CalculateLookup(count: number, horizontal: boolean): void {
    if (count < 3 || count > 4) {
      this.SetError(count < 3 ? FormulaError.ParameterExpected : FormulaError.IllegalParameter);
      return;
    }
    const sorted = count === 3 || this.GetDouble() !== 0;
    const index = approxFloor(this.GetDouble()) - 1;
    if (this.nGlobalError !== FormulaError.NONE) return;
    const source = this.pStack.at(-1);
    let range: ScRange | undefined;
    let matrix: ScMatrix | undefined;
    if (source instanceof ScDoubleRefToken) range = this.PopDoubleRef();
    else if (source instanceof ScSingleRefToken) {
      const address = this.PopSingleRef();
      range = new ScRange(address, address);
    } else matrix = this.GetLookupMatrix();
    if (this.nGlobalError !== FormulaError.NONE) return;
    const dimensions = { column: 0, row: 0 };
    if (range) {
      if (range.aStart.Tab() !== range.aEnd.Tab()) {
        this.SetError(FormulaError.IllegalParameter);
        return;
      }
      dimensions.column = range.aEnd.Col() - range.aStart.Col() + 1;
      dimensions.row = range.aEnd.Row() - range.aStart.Row() + 1;
    } else matrix?.GetDimensions(dimensions);
    if (index < 0 || index >= (horizontal ? dimensions.row : dimensions.column)) {
      this.SetError(FormulaError.IllegalArgument);
      return;
    }
    const key = this.FillLookupEntry();
    if (key === undefined || this.nGlobalError !== FormulaError.NONE) return;
    if (range) {
      const entry = new ScQueryEntry(key, this.mrDoc.GetDocOptions());
      if (entry.searchType === SearchParam.SearchType.Regexp) {
        this.SetError(FormulaError.NoValue);
        return;
      }
      const iterator = new ScQueryCellIteratorDirect(this.mrDoc, range, horizontal, entry);
      const found = sorted ? iterator.FindEqualOrSortedLastInRange() : iterator.GetFirst();
      if (!found) this.SetError(FormulaError.NotAvailable);
      else {
        if (horizontal) found.SetRow(range.aStart.Row() + index);
        else found.SetCol(range.aStart.Col() + index);
        this.PushCellResultToken(found, true);
      }
      return;
    }
    if (!matrix) return;
    const found = CalculateMatrixLookup(
      matrix,
      horizontal ? dimensions.column : dimensions.row,
      index,
      horizontal,
      sorted,
      key,
    );
    if (!found) {
      this.SetError(FormulaError.NotAvailable);
      return;
    }
    try {
      if (ScMatrix.IsValueType(found.nType)) this.PushDouble(found.fVal);
      else this.PushString(text(found.GetString().getString()));
    } finally {
      found.dispose();
    }
  }

  /** Creates native numeric/empty/text results from a real referenced cell. @param address - Absolute reference. @param displayEmptyAsString - Native caller flag for blank display. @returns Nothing. */
  private PushCellResultToken(address: ScAddress, displayEmptyAsString = false): void {
    const cell = new ScRefCellValue(this.mrDoc, address);
    if (cell.hasEmptyValue()) {
      this.PushWithoutError(
        new ScEmptyCellToken(cell.getType() === CellType.CELLTYPE_FORMULA, displayEmptyAsString),
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
      this.PushString(this.GetCellString(cell));
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
  /** Materializes the range returned by a matrix formula. @param range - Native referenced area. @returns Matrix result. */
  private MatrixFromRange(range: ScRange): ScMatrix {
    const { aStart: start, aEnd: end } = range;
    const matrix = new ScMatrix(end.Col() - start.Col() + 1, end.Row() - start.Row() + 1);
    if (!matrix.ValidColRow(end.Col() - start.Col(), end.Row() - start.Row())) return matrix;
    for (let col = start.Col(); col <= end.Col(); col++)
      for (let row = start.Row(); row <= end.Row(); row++) {
        const cell = new ScRefCellValue(this.mrDoc, new ScAddress(col, row, start.Tab()));
        const c = col - start.Col(),
          r = row - start.Row();
        const formula = cell.getFormula();
        const error = formula?.GetErrCode() ?? FormulaError.NONE;
        if (error !== FormulaError.NONE) matrix.PutError(error, c, r);
        else if (cell.hasEmptyValue()) matrix.PutEmpty(c, r);
        else if (formula) {
          if (formula.IsValue()) matrix.PutDouble(formula.GetValue(), c, r);
          else matrix.PutString(formula.GetString(), c, r);
        } else if (cell.getType() === CellType.CELLTYPE_STRING)
          matrix.PutString(cell.getSharedString() as SharedStringConstReference, c, r);
        else if (cell.getType() === CellType.CELLTYPE_EDIT) {
          const value = unicode(this.GetCellString(cell));
          const shared = this.mrDoc.GetSharedStringPool().intern(value);
          try {
            matrix.PutString(shared, c, r);
          } finally {
            shared.dispose();
            value.dispose();
          }
        } else matrix.PutDouble(cell.getDouble(), c, r);
      }
    return matrix;
  }
  /** Produces the original matrix result and its scalar upper-left projection. @param matrix - Matrix result. @returns Nothing. */
  private QueryMatrixType(matrix: ScMatrix | null): void {
    if (!matrix) {
      this.SetError(FormulaError.UnknownStackVariable);
      return;
    }
    const size = { row: 0, column: 0 };
    matrix.GetDimensions(size);
    const value = matrix.Get(0, 0);
    try {
      let upperLeft: FormulaToken;
      if (ScMatrix.IsNonValueType(value.nType)) {
        if (matrix.IsEmptyPath(0, 0)) {
          upperLeft = new FormulaDoubleToken(0);
          this.nRetFmtType = SvNumFormatType.LOGICAL;
        } else if (matrix.IsEmpty(0, 0)) {
          upperLeft = new ScEmptyCellToken(matrix.IsEmptyResult(0, 0), true);
        } else {
          upperLeft = new FormulaStringToken(value.GetString());
          this.nRetFmtType = SvNumFormatType.TEXT;
        }
      } else {
        const error = value.GetError();
        upperLeft =
          error === FormulaError.NONE
            ? new FormulaDoubleToken(value.fVal)
            : new FormulaErrorToken(error);
        if (this.nRetFmtType !== SvNumFormatType.LOGICAL) this.nRetFmtType = SvNumFormatType.NUMBER;
      }
      this.PushWithoutError(new ScMatrixFormulaCellToken(size.column, size.row, matrix, upperLeft));
    } finally {
      value.dispose();
    }
  }
  /** Executes the represented arithmetic token stream, preserving native result/error cardinality. @returns Final type. */
  Interpret(): StackVar {
    this.nRetFmtType = SvNumFormatType.NUMBER;
    const code = [...this.pArr.RPNTokens()];
    const branchEnds: number[] = [];
    for (let pc = 0; pc < code.length; ++pc) {
      const token = code[pc] as FormulaToken;
      const op = token.GetOpCode();
      if (token instanceof FormulaJumpToken && op === OpCode.ocIf) {
        const jump = token.GetJump();
        const count = jump[0] as number;
        const condition = this.GetDouble() !== 0;
        if (this.nGlobalError !== FormulaError.NONE) break;
        if (condition ? count >= 2 : count === 3) {
          branchEnds.push(jump[count] as number);
          pc = jump[condition ? 1 : 2] as number;
        } else {
          this.nRetFmtType = SvNumFormatType.LOGICAL;
          this.PushDouble(Number(condition));
          pc = jump[count] as number;
        }
        continue;
      }
      if ((op === OpCode.ocSep || op === OpCode.ocClose) && branchEnds.length) {
        if (this.pStack.at(-1)?.GetType() === StackVar.svMissing) {
          this.pStack.pop();
          this.PushDouble(0);
        }
        pc = branchEnds.pop() as number;
        continue;
      }
      const logical = op === OpCode.ocTrue || op === OpCode.ocFalse;
      if (op !== OpCode.ocPush && op !== OpCode.ocMissing)
        this.nRetFmtType = logical ? SvNumFormatType.LOGICAL : SvNumFormatType.NUMBER;
      if (op === OpCode.ocPush) {
        if (token.GetType() === StackVar.svDouble)
          this.PushDouble((token as FormulaDoubleToken).GetDouble());
        else this.PushWithoutError(token);
      } else if (op === OpCode.ocMatRef && token instanceof ScSingleRefToken)
        ScMatRef.call(this, token);
      else if (op === OpCode.ocMissing) this.PushWithoutError(token);
      else if (op === OpCode.ocPi) this.PushDouble(Math.PI);
      else if (op === OpCode.ocNotAvail) this.SetError(FormulaError.NotAvailable);
      else if (op === OpCode.ocFrequency)
        ScFrequency.call(this, (token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocSqrt) {
        const number = this.GetDouble();
        if (number < 0) this.SetError(FormulaError.IllegalArgument);
        else this.PushDouble(Math.sqrt(number));
      } else if (op === OpCode.ocIsError) ScIsError.call(this);
      else if (op === OpCode.ocAnd) ScAnd.call(this, (token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocNot) ScNot.call(this, (token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocIsEmpty) ScIsEmpty.call(this, (token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocOffset) ScOffset.call(this, (token as FormulaByteToken).GetByte());
      else if (isComparison(op)) {
        const right = this.PopComparisonValue();
        const left = this.PopComparisonValue();
        this.nRetFmtType = SvNumFormatType.LOGICAL;
        this.PushDouble(
          Number(CompareScalar(left, right, op, this.mrDoc.GetDocOptions().IsIgnoreCase())),
        );
      } else if (logical) this.PushDouble(Number(op === OpCode.ocTrue));
      else if (
        op === OpCode.ocSum ||
        op === OpCode.ocSumSQ ||
        op === OpCode.ocProduct ||
        op === OpCode.ocAverage
      )
        this.IterateParameters(op, (token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocConcat) this.ScConcat((token as FormulaByteToken).GetByte());
      else if (op === OpCode.ocVLookup || op === OpCode.ocHLookup)
        this.CalculateLookup((token as FormulaByteToken).GetByte(), op === OpCode.ocHLookup);
      else if (op === OpCode.ocAmpersand) this.ScAmpersand();
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
      } else if (op === OpCode.ocRange) ScRangeFunc.call(this);
      else if (
        !InterpretConditionalAggregate.call(this, token) &&
        !InterpretReferenceOpcode.call(this, token) &&
        !InterpretDateOpcode.call(this, token) &&
        !InterpretAnalysisAddIn.call(this, token)
      )
        throw new Error("Interpreter opcode is not implemented");
      if (this.nGlobalError !== FormulaError.NONE) break;
    }
    if (
      this.pStack.length === 1 &&
      (this.pStack[0] as FormulaToken).GetType() === StackVar.svSingleRef
    ) {
      const address = this.PopSingleRef();
      if (this.nGlobalError === FormulaError.NONE) this.PushCellResultToken(address);
    }
    if (
      this.pStack.length === 1 &&
      (this.pStack[0] as FormulaToken).GetType() === StackVar.svDoubleRef
    ) {
      const range = this.PopDoubleRef(),
        address = new ScAddress();
      if (this.nGlobalError === FormulaError.NONE) {
        if (this.pMyFormulaCell?.GetMatColsRows()) {
          if (range.aStart.Tab() === range.aEnd.Tab())
            this.QueryMatrixType(this.MatrixFromRange(range));
          else this.SetError(FormulaError.NoRef);
        } else if (this.DoubleRefToPosSingleRef(range, address)) this.PushCellResultToken(address);
      }
    }
    const result = this.pStack[0];
    if (this.pStack.length === 1 && result instanceof ScExternalSingleRefToken) {
      const value = this.PopExternalSingleRef();
      if (value instanceof FormulaDoubleToken) this.PushDouble(value.GetDouble());
      else if (value) this.PushWithoutError(value.Clone());
    }
    if (this.pStack.length === 1 && result instanceof ScExternalDoubleRefToken) {
      const matrix = this.PopExternalDoubleRef();
      if (matrix) this.QueryMatrixType(matrix);
    }
    if (
      this.pStack.length === 1 &&
      result instanceof ScMatrixToken &&
      !result.IsMatrixRangeToken()
    ) {
      this.pStack.pop();
      this.QueryMatrixType(result.GetMatrix());
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

  /** Returns the outer expression's represented result format. @returns Native format flags. */
  GetRetFormatType(): SvNumFormatType {
    return this.nRetFmtType;
  }
}
