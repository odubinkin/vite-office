/** @fileoverview Numeric formula-cell compile/lazy-result subset. Dependency listening, shared groups, iteration, formatting and serialization remain unsupported. */
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScCompiler } from "../../../inc/compiler";
import { ScInterpreter } from "../inc/interpre";
import { ScFormulaResult } from "../../../inc/formularesult";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
/** Formula content is stored as actual code/RPN tokens with the existing result owner. */
export class ScFormulaCell {
  private readonly pCode: ScTokenArray;
  private readonly aResult = new ScFormulaResult();
  private bDirty = true;
  readonly aPos: ScAddress;
  /** Compiles supported numeric source with no listeners; insertion owns later listening services when references are implemented. @param rDocument - Document. @param position - Position. @param formula - Formula source. @param grammar - ODFF grammar. @returns Cell. */
  constructor(
    private readonly rDocument: ScDocument,
    position: ScAddress,
    formula: OUStringConstReference,
    grammar: Grammar,
  ) {
    this.aPos = new ScAddress(position);
    const compiler = new ScCompiler(rDocument, this.aPos, grammar);
    this.pCode = compiler.CompileString(formula);
    compiler.CompileTokenArray();
  }
  /** Borrows the actual formula token owner. @returns Code. */
  GetCode(): ScTokenArray {
    return this.pCode;
  }
  /** Reports lazy calculation state. @returns Dirty. */
  GetDirty(): boolean {
    return this.bDirty;
  }
  /** Evaluates the supported nonrecursive numeric formula on demand. @returns Nothing. */
  private MaybeInterpret(): void {
    if (this.bDirty && this.rDocument.GetAutoCalc()) this.Interpret();
  }
  /** Runs the actual interpreter and stores its genuine result token; no display-side evaluation occurs. @returns Whether interpretation ran. */
  Interpret(): boolean {
    if (this.pCode.GetCodeError() === FormulaError.NONE) {
      const interpreter = new ScInterpreter(
        this,
        this.rDocument,
        this.rDocument.GetNonThreadedContext(),
        this.aPos,
        this.pCode,
      );
      interpreter.Interpret();
      this.aResult.SetToken(interpreter.GetResultToken());
    }
    this.bDirty = false;
    return true;
  }
  /** Reads native numeric/error classification after lazy interpretation. @returns Is numeric or error. */
  IsValue(): boolean {
    this.MaybeInterpret();
    return this.aResult.IsValue();
  }
  /** Returns zero for compiler/interpreter errors as native GetValue does. @returns Number. */
  GetValue(): number {
    this.MaybeInterpret();
    return this.pCode.GetCodeError() === FormulaError.NONE &&
      this.aResult.GetResultError() === FormulaError.NONE
      ? this.aResult.GetDouble()
      : 0;
  }
  /** Compiler errors take precedence over interpreter result errors. @returns Error. */
  GetErrCode(): FormulaError {
    this.MaybeInterpret();
    return this.pCode.GetCodeError() || this.aResult.GetResultError();
  }
}
