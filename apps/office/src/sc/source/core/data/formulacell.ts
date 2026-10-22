/** @fileoverview Scalar/local-reference formula cells with native single-cell subscriptions and logical tracking. Groups, iterative cycles and localized formatting remain unsupported. */
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScSingleRefToken, ScDoubleRefToken } from "../../../inc/token";
import { StackVar } from "../../../../formula/inc/token";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScCompiler } from "../../../inc/compiler";
import { ScInterpreter } from "../inc/interpre";
import { ScFormulaResult, type FormulaResultNumber } from "../../../inc/formularesult";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Formula content is stored as actual code/RPN tokens with the existing result owner. */
export class ScFormulaCell extends SvtListener<SfxHint> {
  private pPrevious: ScFormulaCell | null = null;
  private pNext: ScFormulaCell | null = null;
  private pPreviousTrack: ScFormulaCell | null = null;
  private pNextTrack: ScFormulaCell | null = null;
  private bRunning = false;
  private readonly pCode: ScTokenArray;
  private readonly aResult: ScFormulaResult;
  private readonly rDocument: ScDocument;
  private readonly eTempGrammar: Grammar;
  private bDirty = true;
  readonly aPos: ScAddress;
  /** Compiles numeric/local-reference source. @param rDocument - Document. @param position - Cell. @param formula - Source or owned tokens. @param grammar - Source grammar. @returns Cell. */
  constructor(
    rDocument: ScDocument,
    position: ScAddress,
    formula: OUStringConstReference | ScTokenArray,
    grammar: Grammar,
  );
  /** Original same-document,same-position copy-constructor subset used by Clone;relocation/foreign document reference services remain unsupported. @param source - Copied cell. @param rDocument - Original document. @param position - Original position. @returns Cell. */
  constructor(source: ScFormulaCell, rDocument: ScDocument, position: ScAddress);
  /** Binds native ordinary/copy constructor families for the current local-reference slice. @param documentOrCell - Document or source cell. @param positionOrDocument - Position or original document. @param formulaOrPosition - Formula or copied position. @param grammar - Ordinary input grammar. @returns Cell. */
  constructor(
    documentOrCell: ScDocument | ScFormulaCell,
    positionOrDocument: ScAddress | ScDocument,
    formulaOrPosition: OUStringConstReference | ScTokenArray | ScAddress,
    grammar?: Grammar,
  ) {
    super();
    if (documentOrCell instanceof ScFormulaCell) {
      const source = documentOrCell,
        doc = positionOrDocument as ScDocument,
        pos = formulaOrPosition as ScAddress;
      if (doc !== source.rDocument || !pos.equals(source.aPos))
        throw new Error(
          "Formula copy relocation and foreign-document services are not implemented",
        );
      this.rDocument = doc;
      this.aPos = new ScAddress(pos);
      this.eTempGrammar = source.eTempGrammar;
      this.pCode = source.pCode.Clone();
      this.aResult = new ScFormulaResult(source.aResult);
      this.bDirty = source.bDirty;
      if (this.pCode.GetCodeError() !== FormulaError.NONE && this.pCode.GetLen()) {
        this.pCode.SetCodeError(FormulaError.NONE);
        new ScCompiler(doc, this.aPos, this.pCode, this.eTempGrammar).CompileTokenArray();
      }
    } else {
      this.rDocument = documentOrCell;
      this.aPos = new ScAddress(positionOrDocument as ScAddress);
      this.eTempGrammar = grammar as Grammar;
      this.aResult = new ScFormulaResult();
      const formula = formulaOrPosition as OUStringConstReference | ScTokenArray;
      const compiler = new ScCompiler(
        this.rDocument,
        this.aPos,
        formula instanceof ScTokenArray ? formula : this.eTempGrammar,
        this.eTempGrammar,
      );
      this.pCode = formula instanceof ScTokenArray ? formula : compiler.CompileString(formula);
      compiler.CompileTokenArray();
    }
  }
  /** Original same-position Clone delegates to the native copy constructor without starting listeners. @returns Owned formula copy. */
  Clone(): ScFormulaCell {
    return new ScFormulaCell(this, this.rDocument, this.aPos);
  }
  /** Serializes real source-order tokens without evaluating the cell or caching a second formula model. @param grammar - Explicit serialization grammar. @returns Formula with native leading equals. */
  GetFormula(grammar: Grammar): OUString {
    if (this.pCode.GetCodeError() !== FormulaError.NONE && !this.pCode.GetLen())
      throw new Error("Localized empty-code error strings are not implemented");
    const output = new OUString();
    try {
      new ScCompiler(this.rDocument, this.aPos, this.pCode, grammar).CreateStringFromTokenArray(
        output,
      );
      return unicode("=" + text(output));
    } finally {
      output.dispose();
    }
  }
  /** Borrows the actual formula token owner. @returns Code. */
  GetCode(): ScTokenArray {
    return this.pCode;
  }
  /** Reports lazy calculation state. @returns Dirty. */
  GetDirty(): boolean {
    return this.bDirty;
  }
  /** Evaluates supported scalar formulas on demand with normal noniterative cycle detection. @returns Nothing. */
  private MaybeInterpret(): void {
    if (this.bDirty && this.rDocument.GetAutoCalc()) this.Interpret();
  }
  /** Runs the actual interpreter and stores its genuine result token; no display-side evaluation occurs. @returns Whether interpretation ran. */
  Interpret(): boolean {
    if (this.bRunning) {
      this.aResult.SetResultError(FormulaError.CircularReference);
      return false;
    }
    this.bRunning = true;
    try {
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
      if (!this.pCode.IsRecalcModeAlways()) this.rDocument.RemoveFromFormulaTree(this);
      return true;
    } finally {
      this.bRunning = false;
    }
  }
  /** Reads native empty-result state after lazy interpretation. @returns Empty. */
  IsEmpty(): boolean {
    this.MaybeInterpret();
    return this.aResult.GetCellResultType() === StackVar.svEmptyCell;
  }
  /** Returns actual string results through the native separate formula API. @returns Borrowed shared value. */
  GetString(): SharedStringConstReference {
    this.MaybeInterpret();
    return this.GetRawString();
  }
  /** Returns empty text on compiler/interpreter errors. @returns Borrowed string. */
  GetRawString(): SharedStringConstReference {
    return this.pCode.GetCodeError() === FormulaError.NONE &&
      this.aResult.GetResultError() === FormulaError.NONE
      ? this.aResult.GetString()
      : SharedString.getEmptyString();
  }
  /** Binds actual single/double-reference RPN listeners. Other reference families are not represented. @param doc - Document. @returns Nothing. */
  StartListeningTo(doc: ScDocument): void {
    for (const token of this.pCode.RPNTokens())
      if (token.GetType() === StackVar.svSingleRef) {
        const address = (token as ScSingleRefToken).GetSingleRef().toAbs(this.rDocument, this.aPos);
        if (address.IsValid()) doc.StartListeningCell(address, this);
      } else if (token.GetType() === StackVar.svDoubleRef) {
        const range = (token as ScDoubleRefToken).GetDoubleRef().toAbs(this.rDocument, this.aPos);
        if (range.IsValid()) doc.StartListeningArea(range, false, this);
      }
  }
  /** Ends the actual source subscriptions and allows empty broadcaster cleanup. @param doc - Document. @returns Nothing. */
  EndListeningTo(doc: ScDocument): void {
    for (const token of this.pCode.RPNTokens())
      if (token.GetType() === StackVar.svSingleRef) {
        const address = (token as ScSingleRefToken).GetSingleRef().toAbs(this.rDocument, this.aPos);
        if (address.IsValid()) doc.EndListeningCell(address, this);
      } else if (token.GetType() === StackVar.svDoubleRef) {
        const range = (token as ScDoubleRefToken).GetDoubleRef().toAbs(this.rDocument, this.aPos);
        if (range.IsValid()) doc.EndListeningArea(range, false, this);
      }
  }
  /** Receives native data-change IDs; unrelated and existing browser-lifecycle hints do not dirty formulas. @param hint - Shared opaque hint. @returns Nothing. */
  override Notify(hint: SfxHint | SvtDyingHint): void {
    if (!(hint instanceof SfxHint) || hint.GetId() !== SfxHintId.ScDataChanged) return;
    const force = !this.bDirty;
    this.SetDirtyVar();
    if (
      (force || !this.rDocument.IsInFormulaTree(this) || this.pCode.IsRecalcModeAlways()) &&
      !this.rDocument.IsInFormulaTrack(this)
    )
      this.rDocument.AppendToFormulaTrack(this);
  }
  /** Marks native scalar dirty state without group services. @returns Nothing. */
  SetDirtyVar(): void {
    this.bDirty = true;
  }
  /** Marks and tracks a normal source formula write. Import/undo modes remain unsupported. @param dirty - Native flag. @returns Nothing. */
  SetDirty(dirty = true): void {
    if (!this.bDirty || !this.rDocument.IsInFormulaTree(this)) {
      if (dirty) this.SetDirtyVar();
      this.rDocument.AppendToFormulaTrack(this);
      this.rDocument.TrackFormulas();
    }
  }
  /** Reads previous native calculation link. @returns Cell or null. */
  GetPrevious(): ScFormulaCell | null {
    return this.pPrevious;
  }
  /** Reads next native calculation link. @returns Cell or null. */
  GetNext(): ScFormulaCell | null {
    return this.pNext;
  }
  /** Assigns previous logical calculation link; GC still owns lifetime. @param cell - Cell or null. @returns Nothing. */
  SetPrevious(cell: ScFormulaCell | null): void {
    this.pPrevious = cell;
  }
  /** Assigns next logical calculation link. @param cell - Cell or null. @returns Nothing. */
  SetNext(cell: ScFormulaCell | null): void {
    this.pNext = cell;
  }
  /** Reads previous tracking link. @returns Cell or null. */
  GetPreviousTrack(): ScFormulaCell | null {
    return this.pPreviousTrack;
  }
  /** Reads next tracking link. @returns Cell or null. */
  GetNextTrack(): ScFormulaCell | null {
    return this.pNextTrack;
  }
  /** Assigns previous tracking link. @param cell - Cell or null. @returns Nothing. */
  SetPreviousTrack(cell: ScFormulaCell | null): void {
    this.pPreviousTrack = cell;
  }
  /** Assigns next tracking link. @param cell - Cell or null. @returns Nothing. */
  SetNextTrack(cell: ScFormulaCell | null): void {
    this.pNextTrack = cell;
  }
  /** Ends native observable resources at cell removal, without freeing JS memory. @returns Nothing. */
  override Dispose(): void {
    this.EndListeningTo(this.rDocument);
    this.rDocument.RemoveFromFormulaTrack(this);
    this.rDocument.RemoveFromFormulaTree(this);
    super.Dispose();
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
  /** Original value/error classification with native untouched value output on errors or text. @param output - Grouped native error/value references. @returns Has error or numeric value. */
  GetErrorOrValue(output: FormulaResultNumber): boolean {
    this.MaybeInterpret();
    output.error = this.pCode.GetCodeError();
    if (output.error !== FormulaError.NONE) return true;
    return this.aResult.GetErrorOrDouble(output);
  }
}
