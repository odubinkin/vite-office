/** @fileoverview Native scalar formula scanning, qualified A1 references and compiled named expressions. */
import type { ScRangeNameMap } from "./rangenam";
import { ScParameterClassification } from "../inc/parclass";
import { FormulaCompiler, errorSymbols } from "../../../../formula/inc/FormulaCompiler";
import {
  FormulaByteToken,
  FormulaSpaceToken,
  FormulaMissingToken,
  FormulaErrorToken,
  FormulaExternalToken,
  FormulaIndexToken,
  StackVar,
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
import {
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF,
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_OOXML,
  RID_STRLIST_FUNCTION_NAMES_ENGLISH_PODF,
} from "../../../../formula/inc/core_resource";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScExternalDoubleRefToken,
  ScExternalSingleRefToken,
  ScMatrixToken,
  extendRangeReference,
} from "../../../inc/token";
import type { FormulaToken } from "../../../../formula/inc/token";
import type { ScMatrix } from "./scmatrix";
import { CreateStringFromMatrix } from "./compiler.matrix";
import { GetLabelString, GetRefColRowNames, ParseColRowName } from "./compiler.colrowname";
import { ANALYSIS_EDATE, EDATE } from "./odffmap";
import { QuoteTabName } from "./address.ooo";
import { CreateStringFromExternal, parseExternalReference } from "./compiler.external";

/** Selects lexical symbols from the native language resource. @param resource - Actual symbols. @returns Token lookup. */
function createSymbolMap(resource: ReadonlyMap<OpCode, string>): Readonly<Record<string, OpCode>> {
  return Object.fromEntries(
    Array.from(resource)
      .filter(
        /** Keeps lexical minus distinct from its unary compiler opcode. @param entry - Source entry. @returns Lexical membership. */ ([
          op,
        ]) => op !== OpCode.ocNegSub,
      )
      .map(
        /** Reuses the native symbol spelling for scanning. @param entry - Source entry. @returns Scanner entry. */ ([
          op,
          symbol,
        ]) => [symbol.toUpperCase(), op],
      ),
  );
}
const odffSymbols = createSymbolMap(RID_STRLIST_FUNCTION_NAMES_ENGLISH_ODFF);
const ooxmlSymbols = createSymbolMap(RID_STRLIST_FUNCTION_NAMES_ENGLISH_OOXML);
const podfSymbols = createSymbolMap(RID_STRLIST_FUNCTION_NAMES_ENGLISH_PODF);
const arraySeparators = new Set<OpCode>([OpCode.ocArrayRowSep, OpCode.ocArrayColSep]);
const emptyParameterPredecessors = new Set<OpCode>([
  OpCode.ocOpen,
  OpCode.ocSep,
  OpCode.ocArrayOpen,
  ...arraySeparators,
]);
const emptyParameterSuccessors = new Set<OpCode>([
  OpCode.ocClose,
  OpCode.ocSep,
  OpCode.ocArrayClose,
  ...arraySeparators,
]);
const sheetIdentifier = "(\\$?(?:'(?:[^']|'')+'|[\\p{L}\\p{N}_]+))";
const excelSheet = new RegExp("^" + sheetIdentifier + "!", "u");
const odfSheet = new RegExp("^" + sheetIdentifier + "\\.", "u");
const deletedOdfSheet = /^(\$?)#REF!\./u;
const a1Reference = /^\$?[A-Za-z]+\$?[1-9][0-9]*/u;
const a1RangeWithEndSheet = new RegExp(
  "^" + a1Reference.source.slice(1) + ":" + sheetIdentifier + "\\." + a1Reference.source.slice(1),
  "u",
);
const nameIdentifier = /^[\p{L}_][\p{L}\p{N}_.?]*/u;
const r1c1Offset = String.raw`(?:[0-9]+|\[[+-]?[0-9]+\])?`;
const r1c1Row = "R" + r1c1Offset,
  r1c1Column = "C" + r1c1Offset;
const r1c1Cell = r1c1Row + r1c1Column;
const referenceBoundary = String.raw`(?![\p{L}\p{N}_?\[])`;
const r1c1Reference = new RegExp(`^${r1c1Cell}${referenceBoundary}`, "iu");
const r1c1Range = new RegExp(
  `^(?:${r1c1Cell}:${r1c1Cell}|${r1c1Row}(?::${r1c1Row})?|${r1c1Column}(?::${r1c1Column})?)${referenceBoundary}`,
  "iu",
);
const a1Range =
  /^(?:\$?[A-Za-z]+\$?[1-9][0-9]*:\$?[A-Za-z]+\$?[1-9][0-9]*|\$?[A-Za-z]+:\$?[A-Za-z]+|\$?[1-9][0-9]*:\$?[1-9][0-9]*)/u;
// Existing per-realm compiler symbol bootstrap binds the classification part of
// native ScGlobal::Init after symbols,without a replacement global service.
ScParameterClassification.Init();
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
  /** Original document/source-scanning constructor family. @param doc - Actual document. @param position - Formula origin. @param grammar - Native grammar or unspecified. @param computeII - Original implicit-intersection switch. @param matrixFlag - Original matrix context. @returns Compiler. */
  constructor(
    doc: ScDocument,
    position: ScAddress,
    grammar?: Grammar,
    computeII?: boolean,
    matrixFlag?: boolean,
  );
  /** Original existing-token-array constructor family. @param doc - Actual document. @param position - Origin. @param array - Actual code owner. @param grammar - Native grammar or unspecified. @param computeII - II switch. @param matrixFlag - Matrix context. @returns Compiler. */
  constructor(
    doc: ScDocument,
    position: ScAddress,
    array: ScTokenArray,
    grammar?: Grammar,
    computeII?: boolean,
    matrixFlag?: boolean,
  );
  /** Binds the original overload values and unspecified-grammar resolution before SetGrammar. @param rDoc - Actual document. @param position - Origin. @param arrayOrGrammar - Existing array or grammar. @param grammarOrCompute - Array grammar or scanning II flag. @param computeOrMatrix - Array II flag or scanning matrix flag. @param matrixFlag - Array matrix context. @returns Compiler. */
  constructor(
    private readonly rDoc: ScDocument,
    position: ScAddress,
    arrayOrGrammar: ScTokenArray | Grammar = FormulaGrammar.Grammar.GRAM_UNSPECIFIED,
    grammarOrCompute: Grammar | boolean = FormulaGrammar.Grammar.GRAM_UNSPECIFIED,
    computeOrMatrix = false,
    matrixFlag = false,
  ) {
    const existing = arrayOrGrammar instanceof ScTokenArray;
    super(
      existing ? arrayOrGrammar : new ScTokenArray(rDoc),
      existing ? computeOrMatrix : typeof grammarOrCompute === "boolean" ? grammarOrCompute : false,
      existing ? matrixFlag : computeOrMatrix,
    );
    this.aPos = new ScAddress(position);
    const grammar = existing ? (grammarOrCompute as Grammar) : arrayOrGrammar;
    this.SetGrammar(
      grammar === FormulaGrammar.Grammar.GRAM_UNSPECIFIED ? rDoc.GetGrammar() : grammar,
    );
  }
  private readonly mPendingImplicitIntersectionOptimizations: {
    parameterLocation: readonly [FormulaToken[], number];
    parameter: FormulaToken;
    operation: FormulaToken;
  }[] = [];
  private readonly mUnhandledPossibleImplicitIntersections = new Set<FormulaToken>();
  /** Original II hook for the admitted scalar grammar. Every shared-parser call is already gated by mbComputeII;native array/function exclusions remain at admission. @param token - Operation. @param parameters - Borrowed actual RPN slot locations. @param count - Argument count. @returns Nothing. */
  protected override HandleIIOpCode(
    token: FormulaToken,
    parameters: readonly (readonly [FormulaToken[], number])[] | null,
    count: number,
  ): void {
    this.HandleIIOpCodeInternal(token, parameters, count);
  }
  /** Original pointer validation,candidate scheduling and aggregate reference bookkeeping for the accepted opcode slice. @param token - Operation. @param parameters - Actual RPN locations. @param count - Native count. @returns Handled. */
  private HandleIIOpCodeInternal(
    token: FormulaToken,
    parameters: readonly (readonly [FormulaToken[], number])[] | null,
    count: number,
  ): boolean {
    for (let index = 0; index < count; index++) {
      const location = parameters?.[index];
      if (!location || !location[0][location[1]]) return false;
    }
    const opcode = token.GetOpCode();
    if (opcode === OpCode.ocPush) {
      if (token.GetType() === StackVar.svDoubleRef)
        this.mUnhandledPossibleImplicitIntersections.add(token);
      return true;
    }
    if (
      opcode >= OpCode.ocStartBinaryOperators &&
      opcode < OpCode.ocStopBinaryOperators &&
      opcode !== OpCode.ocAnd &&
      opcode !== OpCode.ocOr
    ) {
      // The admitted binary grammar supplies exactly two scalar/array-value parameters.
      // Array contexts and matrix operands are rejected before parsing.
      const locations = parameters as readonly (readonly [FormulaToken[], number])[],
        first = locations[0] as readonly [FormulaToken[], number],
        second = locations[1] as readonly [FormulaToken[], number];
      if ((first[0][first[1]] as FormulaToken).GetType() === StackVar.svDoubleRef)
        this.addPendingIntersection(first, token);
      if ((second[0][second[1]] as FormulaToken).GetType() === StackVar.svDoubleRef)
        this.addPendingIntersection(second, token);
      return true;
    }
    if (
      (opcode >= OpCode.ocStartUnaryOperators && opcode < OpCode.ocStopUnaryOperators) ||
      opcode === OpCode.ocPercentSign
    ) {
      // Unary negation and percent have one scalar/array-value parameter in native data.
      const location = (
        parameters as readonly (readonly [FormulaToken[], number])[]
      )[0] as readonly [FormulaToken[], number];
      if ((location[0][location[1]] as FormulaToken).GetType() === StackVar.svDoubleRef)
        this.addPendingIntersection(location, token);
      return true;
    }
    // The admitted SUM,SUMSQ,PRODUCT,AVERAGE parameters are all reference-like.
    // Other native function families remain outside scalar admission.
    for (let index = 0; index < count; index++) {
      const location = (parameters as readonly (readonly [FormulaToken[], number])[])[
        index
      ] as readonly [FormulaToken[], number];
      this.mUnhandledPossibleImplicitIntersections.delete(location[0][location[1]] as FormulaToken);
    }
    return true;
  }

  /** Original PendingImplicitIntersectionOptimization member capture;the location borrows the real code buffer. @param location - Actual slot. @param operation - Operation. @returns Nothing. */
  private addPendingIntersection(
    location: readonly [FormulaToken[], number],
    operation: FormulaToken,
  ): void {
    this.mPendingImplicitIntersectionOptimizations.push({
      parameterLocation: location,
      parameter: location[0][location[1]] as FormulaToken,
      operation,
    });
  }
  /** Original delayed optimization runs after the admitted scalar code buffer is complete. @returns Nothing. */
  protected override PostProcessCode(): void {
    // Bad expressions can capture one slot twice;retain the native identity
    // check after the first replacement. A surviving non-null slot is in this
    // same dense code buffer,so the native pointer-end check is implied.
    // Admission forbids forced-array context propagation and matrix functions.
    for (const item of this.mPendingImplicitIntersectionOptimizations) {
      const [buffer, offset] = item.parameterLocation;
      if (buffer[offset] !== item.parameter) continue;
      this.ReplaceDoubleRefII(item.parameterLocation);
    }
    this.mPendingImplicitIntersectionOptimizations.length = 0;
  }
  /** Original local-sheet double-to-single optimization preserves lexical tokens and skips fully absolute rows,trivial ranges and ambiguous intersections. @param location - Actual RPN slot. @returns Nothing. */
  private ReplaceDoubleRefII(location: readonly [FormulaToken[], number]): void {
    const token = location[0][location[1]] as ScDoubleRefToken,
      range = token.GetDoubleRef();
    if (!range.Ref1.IsRowRel() && !range.Ref2.IsRowRel()) return;
    const absolute = range.toAbs(this.rDoc, this.aPos);
    if (absolute.aStart.equals(absolute.aEnd)) return;
    const address = new ScAddress();
    if (!ScCompiler.DoubleRefToPosSingleRefScalarCase(absolute, address, this.aPos)) return;
    const reference = new ScSingleRefData();
    reference.InitFlags();
    reference.SetColRel(range.Ref1.IsColRel());
    reference.SetRowRel(true);
    reference.SetTabRel(range.Ref1.IsTabRel());
    reference.SetAddress(this.rDoc.GetSheetLimits(), address, this.aPos);
    location[0][location[1]] = new ScSingleRefToken(this.rDoc.GetSheetLimits(), reference);
  }
  /** Selects the implemented native Calc grammar and reference convention. @param grammar - Grammar. @returns Nothing. */
  SetGrammar(grammar: Grammar): void {
    // Original SetGrammarAndRefConvention uses the document convention for initial UI grammar.
    // Full symbol-map selection and later unspecified-convention transitions remain unported.
    if (
      grammar === FormulaGrammar.Grammar.GRAM_NATIVE_UI &&
      this.meGrammar === FormulaGrammar.Grammar.GRAM_UNSPECIFIED
    )
      grammar = FormulaGrammar.mergeToGrammar(grammar, this.rDoc.GetAddressConvention());
    if (
      grammar !== FormulaGrammar.Grammar.GRAM_ODFF &&
      grammar !== FormulaGrammar.Grammar.GRAM_ODFF_A1 &&
      grammar !== FormulaGrammar.Grammar.GRAM_PODF &&
      grammar !== FormulaGrammar.Grammar.GRAM_NATIVE &&
      grammar !== FormulaGrammar.Grammar.GRAM_ENGLISH &&
      grammar !== FormulaGrammar.Grammar.GRAM_OOXML &&
      grammar !== FormulaGrammar.Grammar.GRAM_NATIVE_XL_A1 &&
      grammar !== FormulaGrammar.Grammar.GRAM_ENGLISH_XL_A1 &&
      grammar !== FormulaGrammar.Grammar.GRAM_NATIVE_XL_R1C1 &&
      grammar !== FormulaGrammar.Grammar.GRAM_ENGLISH_XL_R1C1
    )
      throw new Error("Formula language or reference convention is not implemented");
    this.meGrammar = grammar;
  }
  /** Reads the active Excel reference convention. @returns Whether to use R1C1. */
  private IsR1C1(): boolean {
    const convention = FormulaGrammar.extractRefConvention(this.meGrammar);
    return convention === FormulaGrammar.AddressConvention.CONV_XL_R1C1;
  }
  /** Supplies the actual relative origin for R1C1 reference parsing. @returns Reference details. */
  private ReferenceDetails() {
    const C = FormulaGrammar.AddressConvention;
    const convention = FormulaGrammar.extractRefConvention(this.meGrammar);
    return convention === C.CONV_XL_R1C1 || convention === C.CONV_XL_A1
      ? new ScAddress.Details(convention, this.aPos)
      : ScAddress.detailsOOOa1;
  }
  /** Original local native/ODF one-reference convention operation. @param reference - Actual reference data. @param odf - ODF convention. @param singleton - Native none/column/row display. @param omitSheet - Whether the other range endpoint already supplies the sheet. @returns Reference fragment. */
  private MakeOneRefStrImpl(
    reference: ScSingleRefData,
    odf: boolean,
    singleton: 0 | 1 | 2,
    omitSheet = false,
  ): string {
    const address = reference.toAbs(this.rDoc, this.aPos);
    if (this.IsR1C1()) {
      if (reference.IsDeleted() || !this.rDoc.GetSheetLimits().ValidAddress(address))
        return "#REF!";
      const flags =
        (singleton === 1 ? 0 : ScRefFlags.ROW_VALID) |
        (singleton === 2 ? 0 : ScRefFlags.COL_VALID) |
        (reference.IsColRel() ? 0 : ScRefFlags.COL_ABS) |
        (reference.IsRowRel() ? 0 : ScRefFlags.ROW_ABS);
      const value = address.Format(flags, null, this.ReferenceDetails());
      try {
        const prefix =
          !omitSheet && (reference.IsFlag3D() || address.Tab() !== this.aPos.Tab())
            ? this.FormatSheet(address.Tab(), true)
            : "";
        return prefix + text(value);
      } finally {
        value.dispose();
      }
    }
    let column = address.Col() + 1,
      letters = "";
    while (column > 0) {
      column--;
      letters = String.fromCharCode(65 + (column % 26)) + letters;
      column = Math.floor(column / 26);
    }
    let output = odf ? "." : "";
    if (!omitSheet && (reference.IsFlag3D() || address.Tab() !== this.aPos.Tab()))
      output = this.FormatSheet(address.Tab(), !reference.IsTabRel());
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
  /** Formats one qualified sheet using the original formula convention. @param tab - Native sheet. @param absolute - Absolute sheet flag. @returns Prefix including delimiter. */
  private FormatSheet(tab: number, absolute: boolean): string {
    const source = this.rDoc.FetchTable(tab)?.GetName();
    if (!source) return "#REF!";
    const quoted = QuoteTabName(text(source));
    if (this.IsExcelReference()) return quoted + "!";
    return (absolute ? "$" : "") + quoted + ".";
  }
  /** Reads the separator used by the current sheet-qualified syntax. @returns Whether it uses an Excel separator. */
  private IsExcelReference(): boolean {
    const convention = FormulaGrammar.extractRefConvention(this.meGrammar);
    return (
      convention >= FormulaGrammar.AddressConvention.CONV_XL_A1 &&
      convention <= FormulaGrammar.AddressConvention.CONV_XL_OOX
    );
  }
  /** Admits the inline matrix operand owned by the Calc token array. @param token - Source token. @returns Whether this is a populated literal matrix. */
  protected override IsMatrixOperand(token: FormulaToken): boolean {
    return (
      token instanceof ScMatrixToken && !token.IsMatrixRangeToken() && token.GetMatrix() !== null
    );
  }

  private rangeNames?: ScRangeNameMap;
  private rangeNameUpdate?: ScRangeNameMap;

  /** Uses a draft scope map during name compilation. @param names - Staged native collections. @returns Compiler. */
  SetRangeNameMap(names: ScRangeNameMap | undefined): this {
    if (names) this.rangeNames = names;
    return this;
  }

  /** Supplies new names by original scope/index during hybrid preprocessing. @param names - Replacement collections. @returns Compiler. */
  SetRangeNameUpdate(names: ScRangeNameMap): this {
    this.rangeNameUpdate = names;
    return this;
  }

  /** Resolves live or draft names consistently. @param scope - Scope index. @returns Native list. */
  private GetRangeNames(scope: number) {
    return this.rangeNames ? this.rangeNames.get(scope) : this.rDoc.GetRangeName(scope);
  }

  /** Writes symbolic names and typed inline matrices from the actual lexical tokens. @param token - Source token. @returns Formula spelling. */
  protected override CreateStringFromToken(token: FormulaToken): string {
    if (token instanceof FormulaExternalToken && text(token.GetExternal()) === ANALYSIS_EDATE)
      return EDATE;
    if (token instanceof ScExternalSingleRefToken || token instanceof ScExternalDoubleRefToken)
      return CreateStringFromExternal(this.rDoc, this.meGrammar, token, (ref) =>
        this.MakeOneRefStrImpl(ref, false, 0, true),
      );
    if (token instanceof ScMatrixToken)
      return CreateStringFromMatrix(
        token.GetMatrix() as ScMatrix,
        this.meGrammar === FormulaGrammar.Grammar.GRAM_OOXML,
        (value) => this.AppendString(value),
        (error) => super.CreateStringFromToken(new FormulaErrorToken(error)),
      );
    if (token instanceof ScSingleRefToken && token.GetOpCode() === OpCode.ocColRowName)
      return this.CreateStringFromLabel(token);
    if (token instanceof FormulaIndexToken && token.GetOpCode() === OpCode.ocDBArea)
      return (
        this.rDoc.GetDBCollection().getNamedDBs().findByIndex(token.GetIndex())?.GetName() ?? ""
      );
    if (!(token instanceof FormulaIndexToken) || token.GetOpCode() !== OpCode.ocName)
      return super.CreateStringFromToken(token);
    const tab = token.GetSheet();
    const range = this.GetRangeNames(tab)?.findByIndex(token.GetIndex());
    const replacement = this.rangeNameUpdate?.get(tab)?.findByIndex(token.GetIndex());
    if (!range) return "#NAME?";
    return (
      (tab !== -1 && tab !== this.aPos.Tab() ? this.FormatSheet(tab, false) : "") +
      (replacement?.name ?? range.name)
    );
  }
  /** Spells the label or emits its equivalent Excel reference. @param token - Label token. @returns Formula text. */
  private CreateStringFromLabel(token: ScSingleRefToken): string {
    if (this.meGrammar === FormulaGrammar.Grammar.GRAM_OOXML) {
      const expanded = GetRefColRowNames(
        this.rDoc,
        this.aPos,
        token,
        OpCode.ocOpen,
        OpCode.ocClose,
      );
      return typeof expanded === "number" ? "#REF!" : this.CreateStringFromToken(expanded);
    }
    const label = GetLabelString(this.rDoc, token.GetSingleRef().toAbs(this.rDoc, this.aPos));
    return label === undefined ? "#NAME?" : "'" + label.replaceAll("'", "''") + "'";
  }

  /** Expands an explicit row or column label in the source operand position. @param token - Label. @param previous - Left opcode. @param next - Right opcode. @returns RPN operand or absence. */
  protected override HandleColRowName(token: FormulaToken, previous: OpCode, next: OpCode) {
    const expanded = GetRefColRowNames(
      this.rDoc,
      this.aPos,
      token as ScSingleRefToken,
      previous,
      next,
    );
    if (typeof expanded !== "number") return expanded;
    this.SetError(expanded);
    return undefined;
  }

  /** Expands a global database name to its absolute native range. @param token - Source name index. @returns Range reference. */
  protected override HandleDbData(token: FormulaToken): FormulaToken | undefined {
    if (!(token instanceof FormulaIndexToken)) return undefined;
    const data = this.rDoc.GetDBCollection().getNamedDBs().findByIndex(token.GetIndex());
    if (!data) {
      this.SetError(FormulaError.NoName);
      return undefined;
    }
    const reference = new ScComplexRefData();
    reference.InitFlags();
    reference.SetRange(this.rDoc.GetSheetLimits(), data.GetArea(), this.aPos);
    return new ScDoubleRefToken(this.rDoc.GetSheetLimits(), reference);
  }

  /** Expands the actual name at RPN compilation time, preserving source order. @param token - Compiled name index. @returns Name expansion. */
  protected override HandleRange(token: FormulaToken): Iterable<FormulaToken> | undefined {
    if (!(token instanceof FormulaIndexToken)) return undefined;
    const code = this.GetRangeNames(token.GetSheet())?.findByIndex(token.GetIndex())?.GetCode();
    if (!code) return undefined;
    if (code.GetCodeError() !== FormulaError.NONE) {
      this.SetError(code.GetCodeError());
      return undefined;
    }
    const expanded = code.Clone();
    const scope = token.GetSheet();
    for (const part of expanded.Tokens()) {
      const references =
        part instanceof ScSingleRefToken
          ? [part.GetSingleRef()]
          : part instanceof ScDoubleRefToken
            ? [part.GetDoubleRef().Ref1, part.GetDoubleRef().Ref2]
            : [];
      for (const reference of references) {
        if (reference.IsTabRel() && scope >= 0) reference.IncTab(scope - this.aPos.Tab());
        reference.SetRelName(reference.IsTabRel() || reference.IsColRel() || reference.IsRowRel());
      }
    }
    return expanded.Tokens();
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
    if (this.meGrammar === FormulaGrammar.Grammar.GRAM_OOXML && reference.IsDeleted())
      return "#REF!";
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
    if (this.meGrammar === FormulaGrammar.Grammar.GRAM_OOXML && reference.IsDeleted())
      return "#REF!";
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
      this.MakeOneRefStrImpl(reference.Ref2, odf, singleton, a.Tab() === b.Tab());
    return odf ? "[" + value + "]" : value;
  }
  /** Original virtual range merge delegates to existing native token extension. @param left - Left token. @param right - Right token. @returns Extended token or null. */
  protected override ExtendRangeReference(
    left: FormulaToken,
    right: FormulaToken,
  ): FormulaToken | null {
    return extendRangeReference(this.rDoc.GetSheetLimits(), left, right, this.aPos, true);
  }
  /** Binds the actual local range parser flags to native complex reference data. @param name - Unwrapped range source. @param tab - Resolved sheet index. @param qualified - Whether the range includes a sheet qualifier. @param absolute - Whether the sheet qualifier is absolute. @param deletedTab - Whether the reference points to a deleted sheet. @returns Parsed range. */
  private ParseDoubleReference(
    name: string,
    tab = this.aPos.Tab(),
    qualified = false,
    absolute = false,
    deletedTab = false,
  ): boolean {
    const origin = new ScAddress(this.aPos);
    origin.SetTab(tab);
    const range = new ScRange(origin, origin),
      input = unicode(name);
    let flags: ScRefFlags;
    try {
      flags = range.Parse(input, this.rDoc, this.ReferenceDetails());
    } finally {
      input.dispose();
    }
    if (!(flags & ScRefFlags.VALID)) throw new Error("Range/name fallback is not implemented");
    range.aStart.SetTab(tab);
    const qualifiedEnd = Boolean(flags & ScRefFlags.TAB2_3D);
    if (!qualifiedEnd) range.aEnd.SetTab(tab);
    const reference = new ScComplexRefData();
    reference.InitRange(range);
    reference.Ref1.SetColRel(!(flags & ScRefFlags.COL_ABS));
    reference.Ref1.SetRowRel(!(flags & ScRefFlags.ROW_ABS));
    reference.Ref1.SetTabRel(!absolute);
    reference.Ref1.SetFlag3D(qualified);
    reference.Ref2.SetColRel(!(flags & ScRefFlags.COL2_ABS));
    reference.Ref2.SetRowRel(!(flags & ScRefFlags.ROW2_ABS));
    reference.Ref2.SetTabRel(qualifiedEnd ? !(flags & ScRefFlags.TAB2_ABS) : !absolute);
    reference.Ref2.SetFlag3D(qualifiedEnd);
    reference.SetRange(this.rDoc.GetSheetLimits(), range, this.aPos);
    if (deletedTab) {
      reference.Ref1.SetTabDeleted(true);
      reference.Ref2.SetTabDeleted(true);
    }
    if (!(this.mpArr as ScTokenArray).AddDoubleReference(reference))
      this.SetError(FormulaError.CodeOverflow);
    return true;
  }
  /** Records the first actual code error. @param error - Error. @returns Nothing. */
  protected override SetError(error: FormulaError): void {
    if (this.mpArr.GetCodeError() === FormulaError.NONE) this.mpArr.SetCodeError(error);
  }
  /** Binds local A1 parse flags, including deleted cell axes, to native reference data. @param name - Unwrapped address or reference error. @param tab - Resolved sheet index. @param qualified - Whether the address includes a sheet qualifier. @param absolute - Whether the sheet qualifier is absolute. @param deletedTab - Whether the reference points to a deleted sheet. @returns Recognized reference. */
  private ParseSingleReference(
    name: string,
    tab = this.aPos.Tab(),
    qualified = false,
    absolute = false,
    deletedTab = false,
  ): boolean {
    const address = new ScAddress(this.aPos);
    const deletedCell = name === "#REF!";
    let flags = ScRefFlags.ZERO;
    if (!deletedCell) {
      const input = unicode(name);
      try {
        flags = address.Parse(input, this.rDoc, this.ReferenceDetails());
      } finally {
        input.dispose();
      }
      if (!(flags & ScRefFlags.VALID))
        throw new Error("Reference/name fallback is not implemented");
    }
    address.SetTab(tab);
    const reference = new ScSingleRefData();
    reference.InitAddress(address);
    reference.SetColRel(!deletedCell && !(flags & ScRefFlags.COL_ABS));
    reference.SetRowRel(!deletedCell && !(flags & ScRefFlags.ROW_ABS));
    reference.SetTabRel(!absolute);
    reference.SetFlag3D(qualified);
    reference.SetAddress(this.rDoc.GetSheetLimits(), address, this.aPos);
    if (deletedCell) {
      reference.SetColDeleted(true);
      reference.SetRowDeleted(true);
    }
    if (deletedTab) reference.SetTabDeleted(true);
    if (!(this.mpArr as ScTokenArray).AddSingleReference(reference))
      this.SetError(FormulaError.CodeOverflow);
    return true;
  }
  /** Recognizes the deleted sheet prefix in pre-5.1.4 ODFF references. @param source - Formula text at the current position. @param bracketed - Whether the whole enclosed reference must match. @returns Consumed source length, or zero. */
  private ParsePredetectedErrRefReference(source: string, bracketed = false): number {
    const qualifier = deletedOdfSheet.exec(source);
    if (!qualifier) return 0;
    const address = source.slice(qualifier[0].length);
    const range = a1Range.exec(address);
    const match = range ?? a1Reference.exec(address);
    if (!match || (bracketed && match[0].length !== address.length)) return 0;
    if (range) this.ParseDoubleReference(match[0], this.aPos.Tab(), true, !!qualifier[1], true);
    else this.ParseSingleReference(match[0], this.aPos.Tab(), true, !!qualifier[1], true);
    return qualifier[0].length + match[0].length;
  }
  /** Resolves a qualified sheet before passing the A1 part to the original address parser. @param sheet - Qualifier spelling. @returns Native sheet index. */
  private FindSheet(sheet: string): number | undefined {
    const raw = sheet.replace(/^\$/u, "");
    const name = unicode(raw.startsWith("'") ? raw.slice(1, -1).replaceAll("''", "'") : raw);
    const tab: [number] = [-1];
    try {
      return this.rDoc.GetTable(name, tab) ? tab[0] : undefined;
    } finally {
      name.dispose();
    }
  }
  /** Scans the represented numeric ODFF subset into its actual Calc array, preserving native leading equals, forced recalc and default bracket completion. @param formula - Unicode formula. @returns Source-order token owner. */
  CompileString(formula: OUStringConstReference): ScTokenArray {
    const ooxml = this.meGrammar === FormulaGrammar.Grammar.GRAM_OOXML;
    const symbols = ooxml
      ? ooxmlSymbols
      : this.meGrammar === FormulaGrammar.Grammar.GRAM_PODF
        ? podfSymbols
        : odffSymbols;
    const excel = this.IsExcelReference();
    const cellPattern = this.IsR1C1() ? r1c1Reference : a1Reference;
    const rangePattern = this.IsR1C1() ? r1c1Range : a1Range;
    const oooRange = excel ? undefined : a1RangeWithEndSheet;
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
    let inArray = false;
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
      const remaining = source.slice(index);
      const identifier = nameIdentifier.exec(remaining);
      if (identifier && /^[ \t\r\n]*\(/.test(source.slice(index + identifier[0].length))) {
        const functionName = identifier[0].toUpperCase();
        if (functionName === EDATE || functionName === ANALYSIS_EDATE.toUpperCase()) {
          const external = unicode(ANALYSIS_EDATE);
          try {
            if (!array.AddToken(new FormulaExternalToken(OpCode.ocExternal, external))) {
              this.SetError(FormulaError.CodeOverflow);
              break;
            }
          } finally {
            external.dispose();
          }
          index += identifier[0].length;
          last = OpCode.ocExternal;
          continue;
        }
        const functionCode = symbols[functionName];
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
      if (inArray && identifier) {
        const logical = symbols[identifier[0].toUpperCase()];
        if (logical === OpCode.ocTrue || logical === OpCode.ocFalse) {
          if (!array.AddOpCode(logical)) {
            this.SetError(FormulaError.CodeOverflow);
            break;
          }
          index += identifier[0].length;
          last = logical;
          continue;
        }
      }
      const odf =
        FormulaGrammar.extractRefConvention(this.meGrammar) ===
        FormulaGrammar.AddressConvention.CONV_ODF;
      const deleted = odf ? this.ParsePredetectedErrRefReference(remaining) : 0;
      if (deleted) {
        index += deleted;
        last = OpCode.ocPush;
        continue;
      }
      const external = parseExternalReference(remaining, this.meGrammar, this.rDoc, this.aPos);
      if (external) {
        if (!array.AddToken(external[1])) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
        index += external[0];
        last = OpCode.ocPush;
        continue;
      }
      const qualifier = (excel ? excelSheet : odfSheet).exec(remaining);
      if (qualifier) {
        const spelling = qualifier[1] as string;
        const address = remaining.slice(qualifier[0].length);
        const tab = this.FindSheet(spelling);
        if (tab !== undefined) {
          const qualifiedName = nameIdentifier.exec(address)?.[0];
          const defined =
            qualifiedName && this.GetRangeNames(tab)?.findByUpperName(qualifiedName.toUpperCase());
          const range = odf ? null : (oooRange?.exec(address) ?? rangePattern.exec(address));
          const cell = range ?? (odf ? null : cellPattern.exec(address));
          if (defined) {
            if (!array.AddToken(new FormulaIndexToken(OpCode.ocName, defined.GetIndex(), tab))) {
              this.SetError(FormulaError.CodeOverflow);
              break;
            }
            index += qualifier[0].length + qualifiedName.length;
            last = OpCode.ocPush;
            continue;
          }
          const match = cell?.[0] ?? (ooxml && address.startsWith("#REF!") ? "#REF!" : "");
          if (match) {
            const absolute = excel || spelling.startsWith("$");
            if (range) this.ParseDoubleReference(match, tab, true, absolute);
            else this.ParseSingleReference(match, tab, true, absolute);
            index += qualifier[0].length + match.length;
            last = OpCode.ocPush;
            continue;
          }
        }
      }
      if (identifier) {
        const key = identifier[0].toUpperCase();
        const local = this.GetRangeNames(this.aPos.Tab())?.findByUpperName(key);
        const range = local ?? this.GetRangeNames(-1)?.findByUpperName(key);
        if (range) {
          if (
            !array.AddToken(
              new FormulaIndexToken(OpCode.ocName, range.GetIndex(), local ? this.aPos.Tab() : -1),
            )
          ) {
            this.SetError(FormulaError.CodeOverflow);
            break;
          }
          index += identifier[0].length;
          last = OpCode.ocPush;
          continue;
        }
        const database = this.rDoc.GetDBCollection().getNamedDBs().findByUpperName(key);
        if (database) {
          if (!array.AddToken(new FormulaIndexToken(OpCode.ocDBArea, database.GetIndex(), -1))) {
            this.SetError(FormulaError.CodeOverflow);
            break;
          }
          index += identifier[0].length;
          last = OpCode.ocPush;
          continue;
        }
      }
      if (!odf) {
        const range = oooRange?.exec(remaining) ?? rangePattern.exec(remaining);
        if (range) {
          this.ParseDoubleReference(range[0]);
          last = OpCode.ocPush;
          index += range[0].length;
          continue;
        }
        const reference = cellPattern.exec(remaining);
        if (reference) {
          this.ParseSingleReference(reference[0]);
          last = OpCode.ocPush;
          index += reference[0].length;
          continue;
        }
      }
      if (ch === "[" && odf) {
        const close = source.indexOf("]", index + 1);
        if (close < 0) throw new Error("Expected a closing bracket for an ODF reference");
        const body = source.slice(index + 1, close);
        const error = errorSymbols.get(body);
        if (error !== undefined) {
          if (!array.AddToken(new FormulaErrorToken(error)))
            this.SetError(FormulaError.CodeOverflow);
        } else if (!this.ParsePredetectedErrRefReference(body, true)) {
          const qualifier = odfSheet.exec(body);
          const sheet = qualifier?.[1] ?? "";
          if (!qualifier && !body.startsWith("."))
            throw new Error("Only internal ODF references are implemented");
          const name = body.slice(qualifier?.[0].length ?? 1).replace(":.", ":");
          const tab = qualifier ? this.FindSheet(sheet) : this.aPos.Tab();
          if (tab === undefined) throw new Error("Unknown formula sheet");
          if (name.includes(":"))
            this.ParseDoubleReference(name, tab, !!qualifier, sheet.startsWith("$"));
          else this.ParseSingleReference(name, tab, !!qualifier, sheet.startsWith("$"));
        }
        last = OpCode.ocPush;
        index = close + 1;
        continue;
      }
      const quoted = /^'((?:[^']|'')+)'/u.exec(remaining);
      const labelName = quoted ? (quoted[1] ?? "").replaceAll("''", "'") : identifier?.[0];
      if (labelName) {
        const label = ParseColRowName(this.rDoc, this.aPos, labelName);
        if (label || quoted) {
          if (label && !array.AddToken(label)) {
            this.SetError(FormulaError.CodeOverflow);
            break;
          }
          if (!label) {
            const invalid = unicode(quoted?.[0] ?? labelName);
            try {
              array.AddBad(invalid);
            } finally {
              invalid.dispose();
            }
            this.SetError(FormulaError.NoName);
          }
          index += (quoted?.[0] ?? labelName).length;
          last = OpCode.ocPush;
          continue;
        }
      }
      const errorLiteral = ch === "#" ? /^#[A-Z0-9/?]+!?/u.exec(remaining)?.[0] : undefined;
      const error = errorLiteral && errorSymbols.get(errorLiteral);
      if (errorLiteral && error) {
        if (!array.AddToken(new FormulaErrorToken(error))) {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
        index += errorLiteral.length;
        last = OpCode.ocPush;
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
      const combined = /^[<>][=>]/u.exec(remaining)?.[0];
      const comparison = combined ? symbols[combined] : undefined;
      let op = comparison ?? symbols[ch];
      if (inArray && ch === (ooxml ? "," : ";")) op = OpCode.ocArrayColSep;
      if (op === undefined)
        throw new Error(
          "Formula names, references, functions, strings or symbols are not implemented",
        );
      if (
        op === OpCode.ocSub &&
        (last === OpCode.ocOpen ||
          last === OpCode.ocSep ||
          last === OpCode.ocArrayOpen ||
          arraySeparators.has(last) ||
          last === OpCode.ocNegSub ||
          (last >= OpCode.ocStartBinaryOperators && last < OpCode.ocStopBinaryOperators))
      )
        op = OpCode.ocNegSub;
      if (
        (last !== OpCode.ocOpen || op !== OpCode.ocClose) &&
        emptyParameterPredecessors.has(last) &&
        emptyParameterSuccessors.has(op)
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
      if (op === OpCode.ocArrayOpen) {
        if (inArray) this.SetError(FormulaError.NestedArray);
        inArray = true;
      } else if (op === OpCode.ocArrayClose) {
        if (!inArray) this.SetError(FormulaError.PairExpected);
        inArray = false;
      }
      if (!array.AddOpCode(op)) {
        if (op === OpCode.ocArrayClose && array.OpCodeBefore(array.GetLen()) === op)
          this.SetError(FormulaError.BadArrayContent);
        else {
          this.SetError(FormulaError.CodeOverflow);
          break;
        }
      }
      last = op;
      index += comparison === undefined ? 1 : 2;
    }
    if (inArray && !array.AddOpCode(OpCode.ocArrayClose)) this.SetError(FormulaError.CodeOverflow);
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
