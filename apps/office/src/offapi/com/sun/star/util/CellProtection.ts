/** @fileoverview Published CellProtection IDL scalar value responsibility; generated UNO type-description/Any binding remains unported. */

/** Original four boolean fields; IDL value defaults differ from Calc's protected-cell attribute defaults. */
export class CellProtection {
  public IsLocked: boolean;
  public IsFormulaHidden: boolean;
  public IsHidden: boolean;
  public IsPrintHidden: boolean;
  /** Original zero-valued default, field-value and implicit scalar copy construction. @param lockedOrSource - Lock flag or actual copy source. @param formulaHidden - Formula visibility flag. @param hidden - Cell visibility flag. @param printHidden - Print visibility flag. @returns Value. */
  constructor(
    lockedOrSource: boolean | Readonly<CellProtection> = false,
    formulaHidden = false,
    hidden = false,
    printHidden = false,
  ) {
    if (typeof lockedOrSource === "boolean") {
      this.IsLocked = lockedOrSource;
      this.IsFormulaHidden = formulaHidden;
      this.IsHidden = hidden;
      this.IsPrintHidden = printHidden;
    } else {
      this.IsLocked = lockedOrSource.IsLocked;
      this.IsFormulaHidden = lockedOrSource.IsFormulaHidden;
      this.IsHidden = lockedOrSource.IsHidden;
      this.IsPrintHidden = lockedOrSource.IsPrintHidden;
    }
  }
  /** Original memberwise scalar assignment. @param source - Actual const source. @returns Recipient. */
  public assign(source: Readonly<CellProtection>): this {
    this.IsLocked = source.IsLocked;
    this.IsFormulaHidden = source.IsFormulaHidden;
    this.IsHidden = source.IsHidden;
    this.IsPrintHidden = source.IsPrintHidden;
    return this;
  }
  /** Original generated field-value equality in IDL order. @param other - Actual const value. @returns Whether equal. */
  public equals(other: Readonly<CellProtection>): boolean {
    return (
      this.IsLocked === other.IsLocked &&
      this.IsFormulaHidden === other.IsFormulaHidden &&
      this.IsHidden === other.IsHidden &&
      this.IsPrintHidden === other.IsPrintHidden
    );
  }
  /** Original generated inequality. @param other - Actual const value. @returns Whether unequal. */
  public notEquals(other: Readonly<CellProtection>): boolean {
    return !this.equals(other);
  }
}
