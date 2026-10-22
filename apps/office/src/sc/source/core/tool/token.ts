/** @fileoverview Original Calc empty, hybrid, matrix result and reference tokens over genuine shared token, string and matrix owners; references use JS GC. */
import { FormulaTokenArray } from "../../../../formula/inc/tokenarray";
import { OpCode } from "../../../../formula/inc/opcode";
import { ScDirection } from "../../../inc/global";
import { ScRange, type ScAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import type { ScSingleRefData } from "../../../inc/refdata";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScTableRefToken,
} from "./token.references";
import type { ScDocument } from "../../../inc/document";
import { ScComplexRefData } from "../../../inc/refdata";
import { RangeMatrix } from "../../../inc/types";
import {
  FormulaToken,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaByteToken,
  StackVar,
} from "../../../../formula/inc/token";
import type { FormulaTokenConstReference } from "../../../../formula/inc/types";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import {
  OUString,
  OUStringHash,
  type OUStringConstReference,
} from "../../../../sal/inc/rtl/ustring";

/** Binds std::hash<double> to the observed libc++64 size_t profile,matching the existing OUStringHash64 target. Both signed zeros hash to zero;all other doubles retain their actual IEEE bits. This is a platform binding,not a claim about other standard libraries or32-bit ABIs. @param value - Native double value. @returns Unsigned64 hash. */
function hashDouble64(value: number): bigint {
  if (value === 0) return 0n;
  const storage = new DataView(new ArrayBuffer(8));
  storage.setFloat64(0, value, true);
  return storage.getBigUint64(0, true);
}
/** Original HashSingleRef deliberately hashes flags rather than coordinates so relocated group members can match. @param reference - Actual reference. @returns Original flag sum. */
function hashSingleRef(reference: ScSingleRefData): bigint {
  return BigInt(
    Number(reference.IsColRel()) +
      (Number(reference.IsRowRel()) << 1) +
      (Number(reference.IsTabRel()) << 2),
  );
}

/** Native active pointer range over the actual code/RPN buffer;inactive tails remain outside the logical range. */
interface TokenPointerRange {
  readonly tokens: readonly FormulaToken[];
  readonly length: number;
}
/** Original AdjustSingleRefData changes only absolute coordinates by the copy-position delta. @param reference - Actual mutable reference. @param oldPosition - Source position. @param newPosition - Destination position. @returns Nothing. */
function adjustSingleRefData(
  reference: ScSingleRefData,
  oldPosition: ScAddress,
  newPosition: ScAddress,
): void {
  if (!reference.IsColRel()) reference.IncCol(newPosition.Col() - oldPosition.Col());
  if (!reference.IsRowRel()) reference.IncRow(newPosition.Row() - oldPosition.Row());
  if (!reference.IsTabRel()) reference.IncTab(newPosition.Tab() - oldPosition.Tab());
}
/** Native TokenPointers traversal for deep owned token arrays (or discarded shared RPN). Actual active buffer entries and structured-reference fields determine membership;JS GC owns physical lifetime,no reference-count facade is introduced. External retained smart-pointer counts and invalid flat-copy callers are outside this consumed ownership contract. */
class TokenPointers {
  readonly maPointerRange: readonly [TokenPointerRange, TokenPointerRange];
  private readonly memberships = new Map<FormulaToken, number>();
  /** Borrows original buffers and counts their actual active owning entries plus table-area fields. @param code - Code buffer. @param length - Active code length. @param rpn - RPN buffer. @param rpnLength - Active RPN length. @param mbSkipRelName - Original relative-name skip policy. @returns Borrowed traversal. */
  constructor(
    code: readonly FormulaToken[] | null,
    length: number,
    rpn: readonly FormulaToken[] | null,
    rpnLength: number,
    private readonly mbSkipRelName: boolean,
  ) {
    this.maPointerRange = [
      { tokens: code ?? [], length },
      { tokens: rpn ?? [], length: rpnLength },
    ];
    const tableOwners = new Set<ScTableRefToken>();
    for (const range of this.maPointerRange)
      for (let index = 0; index < range.length; index++) {
        const token = range.tokens[index] as FormulaToken;
        this.memberships.set(token, (this.memberships.get(token) ?? 0) + 1);
        if (token instanceof ScTableRefToken) tableOwners.add(token);
      }
    for (const table of tableOwners) {
      const area = table.GetAreaRefRPN();
      if (area) this.memberships.set(area, (this.memberships.get(area) ?? 0) + 1);
    }
  }
  /** Original RPN-only/ref-sharing and relative-name decisions under the consumed actual ownership graph. @param range - Code0 or RPN1. @param index - Active position. @returns Skip this entry. */
  private skipToken(range: number, index: number): boolean {
    if (range === 1) {
      const token = this.maPointerRange[range].tokens[index] as FormulaToken;
      if ((this.memberships.get(token) as number) > 1) return true;
      if (this.mbSkipRelName) {
        switch (token.GetType()) {
          case StackVar.svSingleRef:
            return (token as ScSingleRefToken).GetSingleRef().IsRelName();
          case StackVar.svDoubleRef: {
            const reference = (token as ScDoubleRefToken).GetDoubleRef();
            return reference.Ref1.IsRelName() || reference.Ref2.IsRelName();
          }
          default:
            break;
        }
      }
    }
    return false;
  }
  /** Original structured-reference projection returns its inner area only when it is not handled in RPN. @param range - Code0 or RPN1. @param index - Active position. @returns Actual handled token or null. */
  getHandledToken(range: 0 | 1, index: number): FormulaToken | null {
    if (this.skipToken(range, index)) return null;
    const token = this.maPointerRange[range].tokens[index] as FormulaToken;
    if (token.GetOpCode() === OpCode.ocTableRef) {
      if (!(token instanceof ScTableRefToken)) return token;
      const area = token.GetAreaRefRPN();
      if (!area || (this.memberships.get(area) as number) > 1) return token;
      return area;
    }
    return token;
  }
}
/** Original empty-cell token retaining inherited and display-as-string flags. */
export class ScEmptyCellToken extends FormulaToken {
  private readonly bInherited: boolean;
  private readonly bDisplayedAsString: boolean;

  /** Original explicit flag constructor and implicit copy constructor. @param args - Original flags or copied token. @returns Empty result token. */
  constructor(
    ...args: [source: ScEmptyCellToken] | [bInheritedP: boolean, bDisplayAsString: boolean]
  ) {
    const source = args[0];
    super(source instanceof ScEmptyCellToken ? source : StackVar.svEmptyCell);
    this.bInherited = source instanceof ScEmptyCellToken ? source.bInherited : source;
    this.bDisplayedAsString =
      source instanceof ScEmptyCellToken ? source.bDisplayedAsString : (args[1] as boolean);
  }
  /** Original inherited flag query. @returns Whether this result was inherited. */
  IsInherited(): boolean {
    return this.bInherited;
  }
  /** Original string-display flag query. @returns Whether empty is displayed as a string. */
  IsDisplayedAsString(): boolean {
    return this.bDisplayedAsString;
  }
  /** Original virtual equality includes both flags after the base discriminator/opcode. @param r - Original const token. @returns Whether fields match. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.bInherited === (r as ScEmptyCellToken).IsInherited() &&
      this.bDisplayedAsString === (r as ScEmptyCellToken).IsDisplayedAsString()
    );
  }
  /** Original copy clone preserves semantic flags independently. @returns Original copied token. */
  override Clone(): FormulaToken {
    return new ScEmptyCellToken(this);
  }
}

/** Original imported hybrid result, retaining a double, shared string and not-yet-compiled formula. */
export class ScHybridCellToken extends FormulaToken {
  private readonly mfDouble: number;
  private readonly maString: SharedString;
  private readonly maFormula: OUString;
  private readonly mbEmptyDisplayedAsString: boolean;

  /** Original value constructor, by-value formula category and implicit copy constructor. @param args - Original values or copied token; OUString.move restores the erased rvalue category. @returns Hybrid result token. */
  constructor(
    ...args:
      | [source: ScHybridCellToken]
      | [
          f: number,
          rStr: SharedStringConstReference,
          aFormula: OUStringConstReference,
          bEmptyDisplayedAsString: boolean,
        ]
      | [
          f: number,
          rStr: SharedStringConstReference,
          aFormula: OUString,
          bEmptyDisplayedAsString: boolean,
          category: typeof OUString.move,
        ]
  ) {
    const source = args[0];
    super(source instanceof ScHybridCellToken ? source : StackVar.svHybridCell);
    if (source instanceof ScHybridCellToken) {
      this.mfDouble = source.mfDouble;
      this.maString = new SharedString(source.maString);
      this.maFormula = new OUString(source.maFormula);
      this.mbEmptyDisplayedAsString = source.mbEmptyDisplayedAsString;
    } else {
      const temporary =
        args[4] === OUString.move
          ? OUString.move(args[2] as OUString)
          : new OUString(args[2] as OUStringConstReference);
      this.mfDouble = source;
      this.maString = new SharedString(args[1] as SharedStringConstReference);
      this.maFormula = OUString.move(temporary);
      this.mbEmptyDisplayedAsString = args[3] as boolean;
      temporary.dispose();
    }
  }
  /** Original implicit destructor releases formula then shared string before base. @returns Nothing. */
  override dispose(): void {
    this.maFormula.dispose();
    this.maString.dispose();
    super.dispose();
  }
  /** Original formula const-reference query. @returns Owned formula query view. */
  GetFormula(): OUStringConstReference {
    return this.maFormula;
  }
  /** Original empty display flag query. @returns Whether empty is displayed as a string. */
  IsEmptyDisplayedAsString(): boolean {
    return this.mbEmptyDisplayedAsString;
  }
  /** Original double query. @returns Numeric result. */
  GetDouble(): number {
    return this.mfDouble;
  }
  /** Original shared string const-reference query. @returns Owned shared string query view. */
  GetString(): SharedStringConstReference {
    return this.maString;
  }
  /** Original equality omits the empty-display flag and retains IEEE number equality. @param r - Original const token. @returns Whether original compared fields match. */
  override equals(r: FormulaTokenConstReference): boolean {
    if (!super.equals(r)) return false;
    const rhs = r as ScHybridCellToken;
    return (
      this.mfDouble === rhs.GetDouble() &&
      this.maString.equals(rhs.GetString()) &&
      this.maFormula.equals(rhs.GetFormula())
    );
  }
  /** Original virtual copy clone. @returns Copied token with reset count/policy. */
  override Clone(): FormulaToken {
    return new ScHybridCellToken(this);
  }
}

import type { ScMatrixRef, ScConstMatrixRef } from "../../../inc/types";
import type { FormulaConstTokenRef } from "../../../../formula/inc/types";
import type { MatrixCoordinates } from "../../../inc/scmatrix";

/** Original matrix token keeps the actual mutable matrix identity. */
export class ScMatrixToken extends FormulaToken {
  private readonly pMatrix: ScMatrixRef;
  /** Original value and defaulted copy constructors. @param source - Matrix or copied token. @returns Matrix token. */
  constructor(source: ScMatrixRef | ScMatrixToken) {
    super(source instanceof ScMatrixToken ? source : StackVar.svMatrix);
    this.pMatrix = source instanceof ScMatrixToken ? source.pMatrix : source;
  }
  /** Original const/nonconst pointer getters share the same actual object. @returns Matrix or null. */
  GetMatrix(): ScMatrixRef {
    return this.pMatrix;
  }
  /** Original inline copy clone shares the matrix. @returns Copied token. */
  override Clone(): ScMatrixToken {
    return new ScMatrixToken(this);
  }
  /** Original matrix-reference identity equality after base tags/opcode. @param r - Compared token. @returns Equality. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r) && this.pMatrix === (r as ScMatrixToken).GetMatrix();
  }
  /** Original base matrix token is not a matrix-range token. @returns False. */
  IsMatrixRangeToken(): boolean {
    return false;
  }
}

/** Original matrix-range result token shares matrix identity and owns copied range data. */
export class ScMatrixRangeToken extends ScMatrixToken {
  private readonly maRef: ScComplexRefData;
  /** Original RangeMatrix/copy constructor retains matrix and initializes native narrowed coordinates. @param source - Range matrix or copied token. @returns Token. */
  constructor(source: RangeMatrix | ScMatrixRangeToken) {
    super(source instanceof ScMatrixRangeToken ? source : source.mpMat);
    this.maRef = new ScComplexRefData();
    if (source instanceof ScMatrixRangeToken) this.maRef.assign(source.maRef);
    else
      this.maRef.InitRange(
        source.mnCol1,
        source.mnRow1,
        source.mnTab1,
        source.mnCol2,
        source.mnRow2,
        source.mnTab2,
      );
  }
  /** Original borrowed const range member. @returns Owned range view. */
  GetDoubleRef(): Readonly<ScComplexRefData> {
    return this.maRef;
  }
  /** Original implicit-copy clone shares matrix and copies range values. @returns Copied token. */
  override Clone(): ScMatrixRangeToken {
    return new ScMatrixRangeToken(this);
  }
  /** Original range-matrix classification. @returns True. */
  override IsMatrixRangeToken(): boolean {
    return true;
  }
}

/** Original interpreter result transports the matrix and upper-left token by reference. */
export class ScMatrixCellResultToken extends FormulaToken {
  protected xMatrix: ScConstMatrixRef;
  protected xUpperLeft: FormulaConstTokenRef;
  /** Original value and defaulted copy constructors. @param args - Matrix/result or copied token. @returns Result token. */
  constructor(
    ...args:
      | [source: ScMatrixCellResultToken]
      | [matrix: ScConstMatrixRef, upperLeft: FormulaConstTokenRef]
  ) {
    const source = args[0];
    super(source instanceof ScMatrixCellResultToken ? source : StackVar.svMatrixCell);
    this.xMatrix = source instanceof ScMatrixCellResultToken ? source.xMatrix : source;
    this.xUpperLeft =
      source instanceof ScMatrixCellResultToken
        ? source.xUpperLeft
        : (args[1] as FormulaConstTokenRef);
  }
  /** Original matrix pointer query. @returns Same const matrix identity. */
  GetMatrix(): ScConstMatrixRef {
    return this.xMatrix;
  }
  /** Original nullable upper-left type query. @returns Result type or unknown. */
  GetUpperLeftType(): StackVar {
    return this.xUpperLeft ? this.xUpperLeft.GetType() : StackVar.svUnknown;
  }
  /** Original borrowed upper-left reference query. @returns Same token identity. */
  GetUpperLeftToken(): FormulaConstTokenRef {
    return this.xUpperLeft;
  }
  /** Original shallow copy clone. @returns Copied transport token. */
  override Clone(): ScMatrixCellResultToken {
    return new ScMatrixCellResultToken(this);
  }
  /** Original equality compares both reference identities after base tags. @param r - Compared token. @returns Equality. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.xUpperLeft === (r as ScMatrixCellResultToken).xUpperLeft &&
      this.xMatrix === (r as ScMatrixCellResultToken).xMatrix
    );
  }
  /** Original Assign copies references without base fields or numeric cloning. @param r - Result transport. @returns Nothing. */
  Assign(r: ScMatrixCellResultToken): void {
    this.xMatrix = r.xMatrix;
    this.xUpperLeft = r.xUpperLeft;
  }
}

/** Original stored matrix formula result adds signed row/column dimensions and selective numeric result copies. */
export class ScMatrixFormulaCellToken extends ScMatrixCellResultToken {
  private nRows: number;
  private nCols: number;
  /** Original dimension/value/copy constructors. @param args - Dimensions, optional result pair, or copied formula result. @returns Matrix formula token. */
  constructor(
    ...args:
      | [source: ScMatrixFormulaCellToken]
      | [column: number, row: number]
      | [column: number, row: number, matrix: ScConstMatrixRef, upperLeft: FormulaConstTokenRef]
  ) {
    const source = args[0];
    if (source instanceof ScMatrixFormulaCellToken) {
      super(source);
      this.nRows = source.nRows;
      this.nCols = source.nCols;
      this.CloneUpperLeftIfNecessary();
    } else {
      super(
        args.length === 4 ? (args[2] as ScConstMatrixRef) : null,
        args.length === 4 ? (args[3] as FormulaConstTokenRef) : null,
      );
      this.nRows = (args[1] as number) | 0;
      this.nCols = (source << 16) >> 16;
      if (args.length === 4) this.CloneUpperLeftIfNecessary();
    }
  }
  /** Original mutable numeric upper-left boundary always clones doubles and shares other token families. @returns Nothing. */
  private CloneUpperLeftIfNecessary(): void {
    if (this.xUpperLeft && this.xUpperLeft.GetType() === StackVar.svDouble)
      this.xUpperLeft = this.xUpperLeft.Clone();
  }
  /** Original inline dimensions assignment applies native signed field widths. @param column - Columns. @param row - Rows. @returns Nothing. */
  SetMatColsRows(column: number, row: number): void {
    this.nRows = row | 0;
    this.nCols = (column << 16) >> 16;
  }
  /** Original two scalar out references grouped as existing matrix coordinates. @param dimensions - Caller-owned out values. @returns Nothing. */
  GetMatColsRows(dimensions: MatrixCoordinates): void {
    dimensions.row = this.nRows;
    dimensions.column = this.nCols;
  }
  /** Original column query. @returns Column count. */
  GetMatCols(): number {
    return this.nCols;
  }
  /** Original row query. @returns Row count. */
  GetMatRows(): number {
    return this.nRows;
  }
  /** Original stored result copy clone. @returns Independent numeric upper-left result. */
  override Clone(): ScMatrixFormulaCellToken {
    return new ScMatrixFormulaCellToken(this);
  }
  /** Original equality requires the actual derived family, reference equality and dimensions. @param r - Compared token. @returns Equality. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      r instanceof ScMatrixFormulaCellToken &&
      super.equals(r) &&
      this.nCols === r.nCols &&
      this.nRows === r.nRows
    );
  }
  /** Original statically typed result overload clones numeric upper-left. @param r - Result transport. @returns Nothing. */
  override Assign(r: ScMatrixCellResultToken): void;
  /** Original generic token overload uses an explicit native type witness to preserve overload selection. @param r - Any result token. @param category - FormulaToken overload witness. @returns Nothing. */
  override Assign(r: FormulaTokenConstReference, category: typeof FormulaToken): void;
  /** Original two Assign bodies keep dimensions and preserve their distinct alias behavior. @param r - Result token. @param category - Optional static generic overload witness. @returns Nothing. */
  override Assign(r: FormulaTokenConstReference, category?: typeof FormulaToken): void {
    if (category === undefined) {
      super.Assign(r as ScMatrixCellResultToken);
      this.CloneUpperLeftIfNecessary();
      return;
    }
    if (this === r) return;
    if (r instanceof ScMatrixCellResultToken) super.Assign(r);
    else if (r.GetType() === StackVar.svMatrix) {
      this.xUpperLeft = null;
      this.xMatrix = (r as ScMatrixToken).GetMatrix();
    } else {
      this.xUpperLeft = r;
      this.xMatrix = null;
      this.CloneUpperLeftIfNecessary();
    }
  }
  /** Original numeric update replaces string/null results; unsupported result families remain unchanged. @param value - New double. @returns Nothing. */
  SetUpperLeftDouble(value: number): void {
    switch (this.GetUpperLeftType()) {
      case StackVar.svDouble:
        (this.xUpperLeft as FormulaDoubleToken).SetDouble(value);
        break;
      case StackVar.svString:
        this.xUpperLeft = new FormulaDoubleToken(value);
        break;
      case StackVar.svUnknown:
        if (!this.xUpperLeft) this.xUpperLeft = new FormulaDoubleToken(value);
        break;
      default:
        break;
    }
  }
  /** Original result reset preserves matrix formula dimensions. @returns Nothing. */
  ResetResult(): void {
    this.xMatrix = null;
    this.xUpperLeft = null;
  }
}

export {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScRefListToken,
  ScTableRefToken,
  ScExternalToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
  ScExternalNameToken,
} from "./token.references";

export { extendRangeReference } from "./token.ranges";

const operators = new Set<OpCode>([
  OpCode.ocAdd,
  OpCode.ocSub,
  OpCode.ocMul,
  OpCode.ocDiv,
  OpCode.ocPow,
  OpCode.ocNegSub,
  OpCode.ocPercentSign,
  OpCode.ocStop,
  OpCode.ocSum,
  OpCode.ocSumSQ,
  OpCode.ocProduct,
  OpCode.ocAverage,
  OpCode.ocRange,
]);
/** Calc array retains document-independent sheet limits with ordinary JS references. */
export class ScTokenArray extends FormulaTokenArray {
  mxSheetLimits: ScSheetLimits;
  private mnHashValue = 0n;
  /** Constructs the represented numeric state or a native shallow token copy. @param source - Document, limits or copied array. @returns Owner. */
  constructor(source: ScDocument | ScSheetLimits | ScTokenArray) {
    super(source instanceof ScTokenArray ? source : undefined);
    this.mxSheetLimits =
      source instanceof ScTokenArray
        ? source.mxSheetLimits
        : source instanceof ScSheetLimits
          ? source
          : source.GetSheetLimits();
    if (source instanceof ScTokenArray) this.mnHashValue = source.mnHashValue;
  }
  /** Original move construction transfers the real buffers and preserves scalar hash state in the moved-from owner. @param source - Moved token array. @returns New token-array owner. */
  static override move(source: ScTokenArray): ScTokenArray {
    const result = new ScTokenArray(source.mxSheetLimits);
    result.mnHashValue = source.mnHashValue;
    result.Move(source);
    return result;
  }
  /** Original copy assignment clears before Assign,including source self-assignment,and preserves the receiving limits owner. @param source - Copied array. @returns Recipient. */
  override copy_assign(source: ScTokenArray): this {
    this.Clear();
    this.Assign(source);
    this.mnHashValue = source.mnHashValue;
    return this;
  }
  /** Original move assignment transfers represented limits,hash and buffers without clearing the copied scalar hash on self-move. Physical shared_ptr moved-from lifetime is erased under GC. @param source - Moved array. @returns Recipient. */
  override move_assign(source: ScTokenArray): this {
    this.mxSheetLimits = source.mxSheetLimits;
    this.mnHashValue = source.mnHashValue;
    this.Move(source);
    return this;
  }
  /** Original source-order token equality ignores RPN and accepts identical pointers before comparing values. @param other - Actual array. @returns Equal code tokens. */
  EqualTokens(other: ScTokenArray): boolean {
    if (other.nLen !== this.nLen) return false;
    for (let index = 0; index < this.nLen; index++) {
      const left = (this.pCode as FormulaToken[])[index] as FormulaToken,
        right = (other.pCode as FormulaToken[])[index] as FormulaToken;
      if (left !== right && !left.equals(right)) return false;
    }
    return true;
  }
  /** Original Clear resets the hash before clearing the actual token arrays. Vector scheduling flags remain outside this consumed slice. @returns Nothing. */
  override Clear(): void {
    this.mnHashValue = 0n;
    super.Clear();
  }
  /** Original borrowed size_t hash value on the represented64-bit target. @returns Unsigned64 hash. */
  GetHash(): bigint {
    return this.mnHashValue;
  }
  /** Original first20-source-token rolling hash with the existing native string hash and observed libc++64 double binding. RPN and reference coordinates do not participate. @returns Nothing. */
  GenHash(): void {
    const hasher = new OUStringHash();
    let hash = 1n;
    const count = Math.min(this.nLen, 20);
    for (let index = 0; index < count; index++) {
      const token = (this.pCode as FormulaToken[])[index] as FormulaToken,
        opcode = token.GetOpCode();
      if (opcode === OpCode.ocPush)
        switch (token.GetType()) {
          case StackVar.svByte:
            hash += BigInt((token as FormulaByteToken).GetByte());
            break;
          case StackVar.svDouble:
            hash += hashDouble64((token as FormulaDoubleToken).GetDouble());
            break;
          case StackVar.svString:
            hash += hasher.call((token as FormulaStringToken).GetString().getString());
            break;
          case StackVar.svSingleRef:
            hash += hashSingleRef((token as ScSingleRefToken).GetSingleRef());
            break;
          case StackVar.svDoubleRef: {
            const reference = (token as ScDoubleRefToken).GetDoubleRef();
            hash += hashSingleRef(reference.Ref1);
            hash += hashSingleRef(reference.Ref2);
            break;
          }
          default:
            hash += BigInt(opcode);
        }
      else hash += BigInt(opcode);
      hash = BigInt.asUintN(64, (hash << 4n) - hash);
    }
    this.mnHashValue = hash;
  }
  /** Original deep Clone:independent code tokens;RPN entries reuse the first matching cloned code entry or receive their own clone. Native refcounts are represented by actual JS identity. @returns Deep token-array owner. */
  Clone(): ScTokenArray {
    const p = new ScTokenArray(this.mxSheetLimits);
    p.nLen = this.nLen;
    p.nRPN = this.nRPN;
    p.nMode = this.nMode;
    p.nError = this.nError;
    p.bHyperLink = this.bHyperLink;
    p.mnHashValue = this.mnHashValue;
    p.mbFromRangeName = this.mbFromRangeName;
    p.mbShareable = this.mbShareable;
    p.mbDynamicArrayFunction = this.mbDynamicArrayFunction;
    if (this.nLen) {
      p.pCode = [];
      for (let i = 0; i < this.nLen; i++)
        p.pCode.push(((this.pCode as FormulaToken[])[i] as FormulaToken).Clone());
    }
    if (this.nRPN) {
      p.pRPN = [];
      for (let i = 0; i < this.nRPN; i++) {
        const token = (this.pRPN as FormulaToken[])[i] as FormulaToken;
        let index = -1;
        for (let j = 0; j < this.nLen; j++)
          if ((this.pCode as FormulaToken[])[j] === token) {
            index = j;
            break;
          }
        p.pRPN.push(
          index < 0 ? token.Clone() : ((p.pCode as FormulaToken[])[index] as FormulaToken),
        );
      }
    }
    return p;
  }
  /** Original by-value true copy;the C++ unique_ptr/by-value allocation-category distinction is erased under JS GC,while the same deep code/RPN identity algorithm is retained. @returns Independent token array. */
  CloneValue(): ScTokenArray {
    return this.Clone();
  }
  /** Original vertical-group invariance scans source-order references,including actual external reference values and index tokens. @returns No relative row dependency. */
  IsInvariant(): boolean {
    for (let index = 0; index < this.nLen; index++) {
      const token = (this.pCode as FormulaToken[])[index] as FormulaToken;
      switch (token.GetType()) {
        case StackVar.svSingleRef:
          if ((token as ScSingleRefToken).GetSingleRef().IsRowRel()) return false;
          break;
        case StackVar.svExternalSingleRef:
          if ((token as ScExternalSingleRefToken).GetSingleRef().IsRowRel()) return false;
          break;
        case StackVar.svDoubleRef: {
          const reference = (token as ScDoubleRefToken).GetDoubleRef();
          if (reference.Ref1.IsRowRel() || reference.Ref2.IsRowRel()) return false;
          break;
        }
        case StackVar.svExternalDoubleRef: {
          const reference = (token as ScExternalDoubleRefToken).GetDoubleRef();
          if (reference.Ref1.IsRowRel() || reference.Ref2.IsRowRel()) return false;
          break;
        }
        case StackVar.svIndex:
          return false;
        default:
          break;
      }
    }
    return true;
  }
  /** Original copy-position ordering visits actual code and RPN-only double references through TokenPointers. No formula text is parsed and no cell model is copied. @param position - New formula position. @returns Nothing. */
  AdjustReferenceOnCopy(position: ScAddress): void {
    const pointers = new TokenPointers(this.pCode, this.nLen, this.pRPN, this.nRPN, false);
    for (const range of [0, 1] as const)
      for (let index = 0; index < pointers.maPointerRange[range].length; index++) {
        const token = pointers.getHandledToken(range, index);
        if (!token) continue;
        switch (token.GetType()) {
          case StackVar.svDoubleRef:
            (token as ScDoubleRefToken).GetDoubleRef().PutInOrder(position);
            break;
          default:
            break;
        }
      }
  }
  /** Original absolute-reference copy adjustment over actual token ownership. In this loop SkipReference's bRangeName is false and its token kinds are already local references,so its extraction always succeeds;the remaining decision is actual clipboard-range containment. @param oldDocument - Original document owning copy ranges. @param oldPosition - Original formula position. @param newPosition - New formula position. @param checkCopyRange - Original copied-area policy. @returns Nothing. */
  AdjustAbsoluteRefs(
    oldDocument: ScDocument,
    oldPosition: ScAddress,
    newPosition: ScAddress,
    checkCopyRange: boolean,
  ): void {
    const pointers = new TokenPointers(this.pCode, this.nLen, this.pRPN, this.nRPN, true);
    for (const range of [0, 1] as const)
      for (let index = 0; index < pointers.maPointerRange[range].length; index++) {
        const token = pointers.getHandledToken(range, index);
        if (!token) continue;
        switch (token.GetType()) {
          case StackVar.svSingleRef: {
            const reference = (token as ScSingleRefToken).GetSingleRef(),
              address = reference.toAbs(oldDocument, oldPosition);
            if (
              !checkCopyRange ||
              !oldDocument.GetClipParam().maRanges.Contains(new ScRange(address))
            )
              continue;
            adjustSingleRefData(reference, oldPosition, newPosition);
            break;
          }
          case StackVar.svDoubleRef: {
            const reference = (token as ScDoubleRefToken).GetDoubleRef();
            if (
              !checkCopyRange ||
              !oldDocument
                .GetClipParam()
                .maRanges.Contains(reference.toAbs(oldDocument, oldPosition))
            )
              continue;
            adjustSingleRefData(reference.Ref1, oldPosition, newPosition);
            adjustSingleRefData(reference.Ref2, oldPosition, newPosition);
            break;
          }
          default:
            break;
        }
      }
  }
  /** Original adjacent outer-function parameter inspection over genuine RPN references;axis adjacency intentionally ignores the other axis and sheet as upstream. @param extend - Native output extent,untouched on an early boundary. @param position - Formula position. @param direction - Original scan direction. @returns Adjacent reference found. */
  GetAdjacentExtendOfOuterFuncRefs(
    extend: [number],
    position: ScAddress,
    direction: ScDirection,
  ): boolean {
    let col = 0,
      row = 0;
    switch (direction) {
      case ScDirection.DIR_BOTTOM:
        if (position.Row() >= this.mxSheetLimits.mnMaxRow) return false;
        extend[0] = position.Row();
        row = extend[0] + 1;
        break;
      case ScDirection.DIR_RIGHT:
        if (position.Col() >= this.mxSheetLimits.mnMaxCol) return false;
        extend[0] = position.Col();
        col = extend[0] + 1;
        break;
      case ScDirection.DIR_TOP:
        if (position.Row() <= 0) return false;
        extend[0] = position.Row();
        row = extend[0] - 1;
        break;
      case ScDirection.DIR_LEFT:
        if (position.Col() <= 0) return false;
        extend[0] = position.Col();
        col = extend[0] - 1;
        break;
      default:
        return false;
    }
    if (this.pRPN && this.nRPN) {
      const outer = this.pRPN[this.nRPN - 1] as FormulaToken;
      if (outer.GetType() === StackVar.svByte) {
        const count = (outer as FormulaByteToken).GetByte();
        if (count && this.nRPN > count) {
          let found = false;
          for (let index = this.nRPN - count - 1; index < this.nRPN - 1; index++) {
            const token = this.pRPN[index] as FormulaToken;
            switch (token.GetType()) {
              case StackVar.svSingleRef: {
                const absolute = (token as ScSingleRefToken)
                  .GetSingleRef()
                  .toAbs(this.mxSheetLimits, position);
                switch (direction) {
                  case ScDirection.DIR_BOTTOM:
                    if (absolute.Row() === row && absolute.Row() > extend[0]) {
                      extend[0] = absolute.Row();
                      found = true;
                    }
                    break;
                  case ScDirection.DIR_RIGHT:
                    if (absolute.Col() === col && absolute.Col() > extend[0]) {
                      extend[0] = absolute.Col();
                      found = true;
                    }
                    break;
                  case ScDirection.DIR_TOP:
                    if (absolute.Row() === row && absolute.Row() < extend[0]) {
                      extend[0] = absolute.Row();
                      found = true;
                    }
                    break;
                  case ScDirection.DIR_LEFT:
                    if (absolute.Col() === col && absolute.Col() < extend[0]) {
                      extend[0] = absolute.Col();
                      found = true;
                    }
                    break;
                }
                break;
              }
              case StackVar.svDoubleRef: {
                const absolute = (token as ScDoubleRefToken)
                  .GetDoubleRef()
                  .toAbs(this.mxSheetLimits, position);
                switch (direction) {
                  case ScDirection.DIR_BOTTOM:
                    if (absolute.aStart.Row() === row && absolute.aEnd.Row() > extend[0]) {
                      extend[0] = absolute.aEnd.Row();
                      found = true;
                    }
                    break;
                  case ScDirection.DIR_RIGHT:
                    if (absolute.aStart.Col() === col && absolute.aEnd.Col() > extend[0]) {
                      extend[0] = absolute.aEnd.Col();
                      found = true;
                    }
                    break;
                  case ScDirection.DIR_TOP:
                    if (absolute.aEnd.Row() === row && absolute.aStart.Row() < extend[0]) {
                      extend[0] = absolute.aStart.Row();
                      found = true;
                    }
                    break;
                  case ScDirection.DIR_LEFT:
                    if (absolute.aEnd.Col() === col && absolute.aStart.Col() < extend[0]) {
                      extend[0] = absolute.aStart.Col();
                      found = true;
                    }
                    break;
                }
                break;
              }
              default:
                break;
            }
          }
          return found;
        }
      }
    }
    return false;
  }
  /** Appends the actual native single-reference token with the retained limits owner. @param reference - Initialized reference data. @returns Added token or null. */
  AddSingleReference(reference: ScSingleRefData): FormulaToken | null {
    return this.Add(new ScSingleRefToken(this.mxSheetLimits, reference));
  }
  /** Original double-reference token append with retained sheet limits. @param reference - Actual complex reference. @returns Token or null. */
  AddDoubleReference(reference: ScComplexRefData): FormulaToken | null {
    return this.Add(new ScDoubleRefToken(this.mxSheetLimits, reference));
  }
  /** Appends actual native separator/byte token classes for supported arithmetic opcodes. @param code - Opcode. @returns Appended token or null. */
  AddOpCode(code: OpCode): FormulaToken | null {
    if (code === OpCode.ocOpen || code === OpCode.ocClose || code === OpCode.ocSep)
      return this.Add(new FormulaToken(StackVar.svSep, code));
    if (!operators.has(code)) throw new Error("Calc opcode construction is not implemented");
    return this.Add(new FormulaByteToken(code));
  }
}
