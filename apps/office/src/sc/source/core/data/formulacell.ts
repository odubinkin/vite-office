/** @fileoverview Scalar/local-reference formula cells with native shared-code ownership, reference subscriptions and logical tracking. Iterative cycles and localized formatting remain unsupported. */
import {
  SvtListener,
  type SvtDyingHint,
  type SvtQueryBase,
} from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { ScSingleRefToken, ScDoubleRefToken, ScTableRefToken } from "../../../inc/token";
import {
  StackVar,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaIndexToken,
  FormulaByteToken,
  FormulaExternalToken,
  FormulaErrorToken,
  type FormulaToken,
} from "../../../../formula/inc/token";
import { approxEqual } from "../../../../sal/inc/rtl/math";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Grammar } from "../../../../formula/inc/grammar";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { ScCompiler } from "../../../inc/compiler";
import { ScInterpreter } from "../inc/interpre";
import { ScFormulaResult, type FormulaResultNumber } from "../../../inc/formularesult";
import { ScTokenArray } from "../../../inc/tokenarray";
import { ScAddress, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import type { ScDocument } from "../../../inc/document";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { ScFormulaCellGroup } from "./formulacellgroup";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { OpCode } from "../../../../formula/inc/opcode";
import { SC_LISTENER_QUERY_FORMULA_GROUP_POS } from "../../../inc/listenerqueryids";
import { RefQueryFormulaGroup } from "../../../inc/listenerquery";

/** Original formula-cell matrix discriminator;precompiled metadata is represented while matrix computation remains unported. */
export enum ScMatrixMode {
  NONE = 0,
  Formula = 1,
  Reference = 2,
}

/** Original ScFormulaCell::CompareState discriminator. */
export enum CompareState {
  NotEqual,
  EqualInvariant,
  EqualRelativeRef,
}

/** Formula content is stored as actual code/RPN tokens with the existing result owner. */
export class ScFormulaCell extends SvtListener<SfxHint> {
  static readonly NotEqual = CompareState.NotEqual;
  static readonly EqualInvariant = CompareState.EqualInvariant;
  static readonly EqualRelativeRef = CompareState.EqualRelativeRef;
  private mxGroup: ScFormulaCellGroup | null = null;
  private pPrevious: ScFormulaCell | null = null;
  private pNext: ScFormulaCell | null = null;
  private pPreviousTrack: ScFormulaCell | null = null;
  private pNextTrack: ScFormulaCell | null = null;
  private bRunning = false;
  private pCode: ScTokenArray;
  private readonly aResult: ScFormulaResult;
  private readonly rDocument: ScDocument;
  private readonly eTempGrammar: Grammar;
  private cMatrixFlag: ScMatrixMode = ScMatrixMode.NONE;
  private bDirty = true;
  private bNeedListening = false;
  private nFormatType: SvNumFormatType = SvNumFormatType.NUMBER;
  readonly aPos: ScAddress;
  /** Compiles numeric/local-reference source. @param rDocument - Document. @param position - Cell. @param formula - Source or owned tokens. @param grammar - Source grammar. @returns Cell. */
  constructor(
    rDocument: ScDocument,
    position: ScAddress,
    formula: OUStringConstReference | ScTokenArray | ScFormulaCellGroup,
    grammar: Grammar,
  );
  /** Original explicit matrix-mode value for source/precompiled token constructors;matrix evaluation/compilation services remain unported. @param rDocument - Document. @param position - Position. @param formula - Source or owned code. @param grammar - Source grammar. @param matrixMode - Native mode. @returns Cell. */
  constructor(
    rDocument: ScDocument,
    position: ScAddress,
    formula: OUStringConstReference | ScTokenArray,
    grammar: Grammar,
    matrixMode: ScMatrixMode,
  );
  /** Original copy-constructor local-reference slice used by Clone;foreign pools,named/external/3D services remain unsupported. @param source - Copied cell. @param rDocument - Original document. @param position - Original position. @returns Cell. */
  constructor(source: ScFormulaCell, rDocument: ScDocument, position: ScAddress);
  /** Binds native ordinary/copy constructor families for the current local-reference slice. @param documentOrCell - Document or source cell. @param positionOrDocument - Position or original document. @param formulaOrPosition - Formula or copied position. @param grammar - Ordinary input grammar. @param matrixMode - Original mode for non-group constructors. @returns Cell. */
  constructor(
    documentOrCell: ScDocument | ScFormulaCell,
    positionOrDocument: ScAddress | ScDocument,
    formulaOrPosition: OUStringConstReference | ScTokenArray | ScFormulaCellGroup | ScAddress,
    grammar?: Grammar,
    matrixMode: ScMatrixMode = ScMatrixMode.NONE,
  ) {
    super();
    if (documentOrCell instanceof ScFormulaCell) {
      const source = documentOrCell,
        doc = positionOrDocument as ScDocument,
        pos = formulaOrPosition as ScAddress;
      if (doc.GetPool() !== source.rDocument.GetPool())
        throw new Error("Formula foreign-document pool conversion is not implemented");
      this.rDocument = doc;
      this.cMatrixFlag = source.cMatrixFlag;
      this.aPos = new ScAddress(pos);
      this.eTempGrammar = source.eTempGrammar;
      this.nFormatType = source.nFormatType;
      this.pCode = source.pCode.Clone();
      this.aResult = new ScFormulaResult(source.aResult);
      this.bDirty = source.bDirty;
      const compile = this.pCode.GetCodeError() !== FormulaError.NONE && this.pCode.GetLen() !== 0;
      if (compile) this.pCode.SetCodeError(FormulaError.NONE);
      this.pCode.AdjustAbsoluteRefs(source.rDocument, source.aPos, this.aPos, false);
      // Same-pool copies do not enter foreign-pool/external/name conversion.
      // Source clipboard/undo and clone-flag branches are added with their actual mode owners separately.
      this.pCode.AdjustReferenceOnCopy(this.aPos);
      if (compile) {
        const compiler = new ScCompiler(doc, this.aPos, this.pCode, this.eTempGrammar);
        compiler.CompileTokenArray();
        if (this.pCode.GetCodeError() === FormulaError.NONE)
          this.nFormatType = compiler.GetNumFormatType();
      }
    } else {
      this.rDocument = documentOrCell;
      this.aPos = new ScAddress(positionOrDocument as ScAddress);
      this.eTempGrammar = grammar as Grammar;
      this.aResult = new ScFormulaResult();
      if (formulaOrPosition instanceof ScFormulaCellGroup) {
        if (formulaOrPosition.mbSubTotal)
          throw new Error("Subtotal-cell document registration is not implemented");
        this.mxGroup = formulaOrPosition;
        this.nFormatType = formulaOrPosition.mnFormatType;
        this.pCode = formulaOrPosition.mpCode ?? new ScTokenArray(this.rDocument);
        return;
      }
      this.cMatrixFlag = matrixMode;
      const formula = formulaOrPosition as OUStringConstReference | ScTokenArray;
      if (formula instanceof ScTokenArray) {
        this.pCode = formula;
        this.pCode.Finalize();
        if (
          this.pCode.GetLen() &&
          this.pCode.GetCodeError() === FormulaError.NONE &&
          !this.pCode.GetCodeLen()
        ) {
          const compiler = new ScCompiler(
            this.rDocument,
            this.aPos,
            this.pCode,
            this.eTempGrammar,
            true,
            this.cMatrixFlag !== ScMatrixMode.NONE,
          );
          compiler.CompileTokenArray();
          this.nFormatType = compiler.GetNumFormatType();
        } else if (
          this.pCode.HasOpCodeRPN(OpCode.ocSubTotal) ||
          this.pCode.HasOpCodeRPN(OpCode.ocAggregate)
        )
          throw new Error("Subtotal-cell document registration is not implemented");
        this.pCode.GenHash();
      } else {
        const scanner = new ScCompiler(this.rDocument, this.aPos, this.eTempGrammar);
        this.pCode = scanner.CompileString(formula);
        const compiler = new ScCompiler(
          this.rDocument,
          this.aPos,
          this.pCode,
          this.eTempGrammar,
          true,
          this.cMatrixFlag !== ScMatrixMode.NONE,
        );
        compiler.CompileTokenArray();
        if (this.pCode.GetCodeError() === FormulaError.NONE)
          this.nFormatType = compiler.GetNumFormatType();
      }
    }
  }
  /** Original default and relocated Clone delegate to the native copy constructor without starting listeners. @param position - Optional original relocated-clone argument. @returns Owned formula copy. */
  Clone(position: ScAddress = this.aPos): ScFormulaCell {
    return new ScFormulaCell(this, this.rDocument, position);
  }
  /** Serializes real source-order tokens without evaluating the cell or caching a second formula model. @param grammar - Explicit serialization grammar. @returns Formula with native leading equals. */
  GetFormula(grammar: Grammar): OUString {
    if (this.pCode.GetCodeError() !== FormulaError.NONE && !this.pCode.GetLen())
      throw new Error("Localized empty-code error strings are not implemented");
    const output = new OUString();
    try {
      let emit = true;
      if (this.cMatrixFlag === ScMatrixMode.Reference) {
        const reference = Array.from(this.pCode.RPNTokens()).find(
          /** The represented matrix-reference code uses its real local single reference. @param token - RPN token. @returns Reference. */ (
            token,
          ) => token.GetType() === StackVar.svSingleRef,
        );
        if (reference) {
          const position = (reference as ScSingleRefToken)
            .GetSingleRef()
            .toAbs(this.rDocument, this.aPos);
          const origin = position.IsValid() ? this.rDocument.GetFormulaCell(position) : null;
          if (origin) return origin.GetFormula(grammar);
        } else emit = false;
      }
      if (emit)
        new ScCompiler(this.rDocument, this.aPos, this.pCode, grammar).CreateStringFromTokenArray(
          output,
        );
      const formula = "=" + text(output);
      return unicode(this.cMatrixFlag === ScMatrixMode.NONE ? formula : "{" + formula + "}");
    } finally {
      output.dispose();
    }
  }
  /** Borrows the actual formula token owner. @returns Code. */
  GetCode(): ScTokenArray {
    return this.pCode;
  }
  /** Original hash query delegates to the actual borrowed code owner. @returns Native64-bit hash. */
  GetHash(): bigint {
    return this.pCode.GetHash();
  }
  /** Original native format metadata is separate from displayed cell formatting. @returns Format flags. */
  GetFormatType(): SvNumFormatType {
    return this.nFormatType;
  }
  /** Original matrix-mode query reads the actual cell member. @returns Mode. */
  GetMatrixFlag(): ScMatrixMode {
    return this.cMatrixFlag;
  }
  /** Original borrowed owning document. @returns Actual document. */
  GetDocument(): ScDocument {
    return this.rDocument;
  }
  /** Original group creation moves the token-array value into the group and redirects the borrowed cell code pointer. @param length - Group length. @param invariant - Original caller's invariance result. @returns Actual group or null when already shared. */
  CreateCellGroup(length: number, invariant: boolean): ScFormulaCellGroup | null {
    if (this.mxGroup) return null;
    this.mxGroup = new ScFormulaCellGroup();
    this.mxGroup.mpTopCell = this;
    this.mxGroup.mbInvariant = invariant;
    this.mxGroup.mnLength = length;
    this.mxGroup.mpCode = ScTokenArray.move(this.pCode);
    this.pCode = this.mxGroup.mpCode;
    return this.mxGroup;
  }
  /** Original sharing/unsharing redirects real code ownership;leaving a group deep-copies its shared token array. @param group - New group or null. @returns Nothing. */
  SetCellGroup(group: ScFormulaCellGroup | null): void {
    if (!group) {
      if (this.mxGroup) this.pCode = (this.mxGroup.mpCode as ScTokenArray).Clone();
      this.mxGroup = group;
      return;
    }
    this.mxGroup = group;
    this.pCode = group.mpCode as ScTokenArray;
    group.mnWeight = 0;
  }
  /** Original borrowed group reference. @returns Group or null. */
  GetCellGroup(): ScFormulaCellGroup | null {
    return this.mxGroup;
  }
  /** Original group membership query. @returns Shared. */
  IsShared(): boolean {
    return this.mxGroup !== null;
  }
  /** Original top-cell identity query. @returns Shared top. */
  IsSharedTop(): boolean {
    return this.mxGroup !== null && this.mxGroup.mpTopCell === this;
  }
  /** Original group top row assumes an initialized top for a live shared group. @returns Row or minus one for a singleton. */
  GetSharedTopRow(): number {
    return this.mxGroup ? (this.mxGroup.mpTopCell as ScFormulaCell).aPos.Row() : -1;
  }
  /** Original logical group length query. @returns Length or zero. */
  GetSharedLength(): number {
    return this.mxGroup?.mnLength ?? 0;
  }
  /** Original borrowed shared code query. @returns Code or null. */
  GetSharedCode(): ScTokenArray | null {
    return this.mxGroup?.mpCode ?? null;
  }
  /** Original pointer synchronization after the group replaces its code value. @returns Nothing. */
  SyncSharedCode(): void {
    if (this.mxGroup) this.pCode = this.mxGroup.mpCode as ScTokenArray;
  }
  /** Original grouping comparison checks RPN first and lexical references/names second. The original matrix-mode and matrix/external RPN rejections are retained. @param other - Actual neighboring cell. @returns Native comparison classification. */
  CompareByTokenArray(other: ScFormulaCell): CompareState {
    if (this.GetMatrixFlag() !== ScMatrixMode.NONE) return CompareState.NotEqual;
    if (this.GetHash() !== other.GetHash()) return CompareState.NotEqual;
    if (!this.pCode.IsShareable() || !other.pCode.IsShareable()) return CompareState.NotEqual;
    let left = this.pCode.GetCode(),
      right = other.pCode.GetCode(),
      length = this.pCode.GetCodeLen(),
      otherLength = other.pCode.GetCodeLen();
    if (!left || !right) return CompareState.NotEqual;
    if (length !== otherLength) return CompareState.NotEqual;
    if (this.pCode.GetCodeError() !== other.pCode.GetCodeError()) return CompareState.NotEqual;
    let invariant = true;
    for (let index = 0; index < length; index++) {
      const a = left[index] as FormulaToken,
        b = right[index] as FormulaToken;
      if (
        a.GetType() !== b.GetType() ||
        a.GetOpCode() !== b.GetOpCode() ||
        a.GetParamCount() !== b.GetParamCount()
      )
        return CompareState.NotEqual;
      switch (a.GetType()) {
        case StackVar.svMatrix:
        case StackVar.svExternalSingleRef:
        case StackVar.svExternalDoubleRef:
          return CompareState.NotEqual;
        case StackVar.svSingleRef: {
          const reference = (a as ScSingleRefToken).GetSingleRef();
          if (!reference.equals((b as ScSingleRefToken).GetSingleRef()))
            return CompareState.NotEqual;
          if (reference.IsRowRel()) invariant = false;
          break;
        }
        case StackVar.svDoubleRef: {
          const first = (a as ScDoubleRefToken).GetSingleRef(),
            second = (a as ScDoubleRefToken).GetSingleRef2();
          if (!first.equals((b as ScDoubleRefToken).GetSingleRef())) return CompareState.NotEqual;
          if (!second.equals((b as ScDoubleRefToken).GetSingleRef2())) return CompareState.NotEqual;
          if (first.IsRowRel()) invariant = false;
          if (second.IsRowRel()) invariant = false;
          break;
        }
        case StackVar.svDouble:
          if (
            !approxEqual(
              (a as FormulaDoubleToken).GetDouble(),
              (b as FormulaDoubleToken).GetDouble(),
            )
          )
            return CompareState.NotEqual;
          break;
        case StackVar.svString:
          if (!(a as FormulaStringToken).GetString().equals((b as FormulaStringToken).GetString()))
            return CompareState.NotEqual;
          break;
        case StackVar.svIndex:
          if (a.GetOpCode() === OpCode.ocName || a.GetOpCode() === OpCode.ocDBArea) {
            const first = a as FormulaIndexToken,
              second = b as FormulaIndexToken;
            if (first.GetIndex() !== second.GetIndex() || first.GetSheet() !== second.GetSheet())
              return CompareState.NotEqual;
          } else if ((a as ScTableRefToken).GetIndex() !== (b as ScTableRefToken).GetIndex())
            return CompareState.NotEqual;
          break;
        case StackVar.svByte:
          if ((a as FormulaByteToken).GetByte() !== (b as FormulaByteToken).GetByte())
            return CompareState.NotEqual;
          break;
        case StackVar.svExternal:
          if (
            !(a as FormulaExternalToken)
              .GetExternal()
              .equals((b as FormulaExternalToken).GetExternal())
          )
            return CompareState.NotEqual;
          if ((a as FormulaExternalToken).GetByte() !== (b as FormulaExternalToken).GetByte())
            return CompareState.NotEqual;
          break;
        case StackVar.svError:
          if ((a as FormulaErrorToken).GetError() !== (b as FormulaErrorToken).GetError())
            return CompareState.NotEqual;
          break;
        default:
          break;
      }
    }
    left = this.pCode.GetArray();
    right = other.pCode.GetArray();
    length = this.pCode.GetLen();
    otherLength = other.pCode.GetLen();
    if (!left || !right) return CompareState.NotEqual;
    if (length !== otherLength) return CompareState.NotEqual;
    for (let index = 0; index < length; index++) {
      const a = left[index] as FormulaToken,
        b = right[index] as FormulaToken;
      if (
        a.GetType() !== b.GetType() ||
        a.GetOpCode() !== b.GetOpCode() ||
        a.GetParamCount() !== b.GetParamCount()
      )
        return CompareState.NotEqual;
      switch (a.GetType()) {
        case StackVar.svSingleRef: {
          const reference = (a as ScSingleRefToken).GetSingleRef();
          if (!reference.equals((b as ScSingleRefToken).GetSingleRef()))
            return CompareState.NotEqual;
          if (reference.IsRowRel()) invariant = false;
          break;
        }
        case StackVar.svDoubleRef: {
          const first = (a as ScDoubleRefToken).GetSingleRef(),
            second = (a as ScDoubleRefToken).GetSingleRef2();
          if (!first.equals((b as ScDoubleRefToken).GetSingleRef())) return CompareState.NotEqual;
          if (!second.equals((b as ScDoubleRefToken).GetSingleRef2())) return CompareState.NotEqual;
          if (first.IsRowRel()) invariant = false;
          if (second.IsRowRel()) invariant = false;
          break;
        }
        case StackVar.svIndex:
          if (a.GetOpCode() === OpCode.ocTableRef) {
            if ((a as ScTableRefToken).GetIndex() !== (b as ScTableRefToken).GetIndex())
              return CompareState.NotEqual;
          } else {
            const first = a as FormulaIndexToken,
              second = b as FormulaIndexToken;
            if (first.GetIndex() !== second.GetIndex() || first.GetSheet() !== second.GetSheet())
              return CompareState.NotEqual;
          }
          break;
        default:
          break;
      }
    }
    return invariant ? CompareState.EqualInvariant : CompareState.EqualRelativeRef;
  }
  /** Reports lazy calculation state. @returns Dirty. */
  GetDirty(): boolean {
    return this.bDirty;
  }
  /** Evaluates supported scalar formulas on demand with normal noniterative cycle detection. @returns Nothing. */
  private MaybeInterpret(): void {
    if (this.bDirty && (this.rDocument.GetAutoCalc() || this.cMatrixFlag !== ScMatrixMode.NONE))
      this.Interpret();
  }
  /** Runs the actual interpreter and stores its genuine result token; no display-side evaluation occurs. @returns Whether interpretation ran. */
  Interpret(): boolean {
    if (this.cMatrixFlag !== ScMatrixMode.NONE)
      throw new Error("Matrix formula evaluation is not implemented");
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
  /** Original deferred-listening flag. @returns Pending. */
  NeedsListening(): boolean {
    return this.bNeedListening;
  }
  /** Original deferred-listening flag setter. @param needed - Pending flag. @returns Nothing. */
  SetNeedsListening(needed: boolean): void {
    this.bNeedListening = needed;
  }
  /** Original ordinary/context subscriptions for the current normal-document local-reference profile. @param target - Actual document or shared cursor context. @returns Nothing. */
  StartListeningTo(target: ScDocument | StartListeningContext): void {
    const context = target instanceof StartListeningContext ? target : null;
    const doc = context ? context.getDoc() : (target as ScDocument);
    this.mxGroup?.endAllGroupListening(doc);
    doc.SetDetectiveDirty(true);
    if (this.pCode.IsRecalcModeAlways()) {
      doc.StartListeningArea(BCA_LISTEN_ALWAYS(), false, this);
      this.SetNeedsListening(false);
      return;
    }
    for (const token of this.pCode.RPNTokens())
      if (token.GetType() === StackVar.svSingleRef) {
        const address = (token as ScSingleRefToken).GetSingleRef().toAbs(this.rDocument, this.aPos);
        if (address.IsValid()) {
          if (context) doc.StartListeningCell(context, address, this);
          else doc.StartListeningCell(address, this);
        }
      } else if (token.GetType() === StackVar.svDoubleRef) {
        const range = (token as ScDoubleRefToken).GetDoubleRef().toAbs(doc, this.aPos);
        if (range.IsValid()) doc.StartListeningArea(range, false, this);
      }
    this.SetNeedsListening(false);
  }
  /** Original ordinary/context removal uses previous code and position where supplied. Context purging remains an explicit caller operation. @param target - Actual document or end context. @param oldCode - Ordinary overload's optional previous code. @param oldPosition - Position corresponding to previous code. @returns Nothing. */
  EndListeningTo(
    target: ScDocument | EndListeningContext,
    oldCode: ScTokenArray | null = null,
    oldPosition: ScAddress = this.aPos,
  ): void {
    const context = target instanceof EndListeningContext ? target : null;
    const doc = context ? context.getDoc() : (target as ScDocument);
    this.mxGroup?.endAllGroupListening(doc);
    if (!this.HasBroadcaster()) return;
    doc.SetDetectiveDirty(true);
    const code = context ? (context.getOldCode() ?? this.pCode) : (oldCode ?? this.pCode);
    const position = context
      ? context.getOldPosition(this.aPos)
      : oldCode
        ? oldPosition
        : this.aPos;
    // The document overload checks current code, whereas the context overload checks old code.
    if ((context ? code : this.pCode).IsRecalcModeAlways()) {
      doc.EndListeningArea(BCA_LISTEN_ALWAYS(), false, this);
      return;
    }
    for (const token of code.RPNTokens())
      if (token.GetType() === StackVar.svSingleRef) {
        const address = (token as ScSingleRefToken).GetSingleRef().toAbs(this.rDocument, position);
        if (address.IsValid()) {
          if (context) doc.EndListeningCell(context, address, this);
          else doc.EndListeningCell(address, this);
        }
      } else if (token.GetType() === StackVar.svDoubleRef) {
        const range = (token as ScDoubleRefToken).GetDoubleRef().toAbs(doc, position);
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
    if (this.mxGroup?.mpTopCell === this) this.mxGroup.mpTopCell = null;
    this.mxGroup = null;
    super.Dispose();
  }
  /** Original shared-formula position query adds only actual group members. @param query - Native result owner. @returns Nothing. */
  override Query(query: SvtQueryBase): void {
    switch (query.getId()) {
      case SC_LISTENER_QUERY_FORMULA_GROUP_POS:
        if (this.IsShared()) (query as RefQueryFormulaGroup).add(this.aPos);
        break;
      default:
        break;
    }
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
