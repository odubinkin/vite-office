/** @fileoverview Original Calc empty and hybrid result tokens from token.hxx/token.cxx over the genuine shared token and string owners. */
import { FormulaToken, StackVar } from "../../../../formula/inc/token";
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
