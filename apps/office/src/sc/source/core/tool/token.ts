/** @fileoverview Original Calc empty, hybrid, matrix result and reference tokens over genuine shared token, string and matrix owners; references use JS GC. */
import { FormulaToken, FormulaDoubleToken, StackVar } from "../../../../formula/inc/token";
import type { FormulaTokenConstReference } from "../../../../formula/inc/types";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

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
} from "./token.references";
