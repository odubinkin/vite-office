/** @fileoverview Original ScCalcConfig document value settings; shared containers and strings retain their actual owners. */
import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { FormulaGrammar, type AddressConvention } from "../../../../formula/inc/grammar";
import { OpCode } from "../../../../formula/inc/opcode";

/** Original registry-compatible recalculation choices. */
export const ScRecalcOptions = { RECALC_ALWAYS: 0, RECALC_NEVER: 1, RECALC_ASK: 2 } as const;
/** Original forced calculation choices, without a browser environment substitute. */
export const ForceCalculationType = {
  ForceCalculationNone: 0,
  ForceCalculationCore: 1,
  ForceCalculationOpenCL: 2,
  ForceCalculationThreads: 3,
} as const;

/** Original document calculation value owner; process/configuration service methods remain separate pending responsibilities. */
export class ScCalcConfig {
  static readonly StringConversion = { ILLEGAL: 0, ZERO: 1, UNAMBIGUOUS: 2, LOCALE: 3 } as const;
  private static readonly pDefaultOpenCLSubsetOpCodes = ScCalcConfig.makeDefaultSubset();
  meStringRefAddressSyntax: AddressConvention = FormulaGrammar.AddressConvention.CONV_UNSPECIFIED;
  meStringConversion: number = ScCalcConfig.StringConversion.LOCALE;
  mbEmptyStringAsZero = false;
  mbHasStringRefSyntax = false;
  mbOpenCLSubsetOnly = true;
  mbOpenCLAutoSelect = true;
  readonly maOpenCLDevice = new OUString();
  mnOpenCLMinimumFormulaGroupSize = 100;
  mpOpenCLSubsetOpCodes: SortedVector<number> = ScCalcConfig.pDefaultOpenCLSubsetOpCodes;

  /** Original default or implicit memberwise copy construction. @param source - Optional copied configuration. @returns Value owner. */
  constructor(source?: ScCalcConfig) {
    if (source) this.copy_assign(source);
    else this.setOpenCLConfigToDefault();
  }
  /** Original static shared default set, using the existing shared ordered container. @returns Default opcode owner. */
  private static makeDefaultSubset(): SortedVector<number> {
    const result = new SortedVector<number>(
      /** Original strict numeric opcode ordering. @param left - First opcode. @param right - Second opcode. @returns Less flag. */ (
        left,
        right,
      ) => left < right,
    );
    for (const opcode of [
      OpCode.ocAdd,
      OpCode.ocSub,
      OpCode.ocNegSub,
      OpCode.ocMul,
      OpCode.ocDiv,
      OpCode.ocPow,
      OpCode.ocRandom,
      OpCode.ocSin,
      OpCode.ocCos,
      OpCode.ocTan,
      OpCode.ocArcTan,
      OpCode.ocExp,
      OpCode.ocLn,
      OpCode.ocSqrt,
      OpCode.ocStdNormDist,
      OpCode.ocSNormInv,
      OpCode.ocRound,
      OpCode.ocPower,
      OpCode.ocSumProduct,
      OpCode.ocMin,
      OpCode.ocMax,
      OpCode.ocSum,
      OpCode.ocProduct,
      OpCode.ocAverage,
      OpCode.ocCount,
      OpCode.ocVar,
      OpCode.ocNormDist,
      OpCode.ocVLookup,
      OpCode.ocCorrel,
      OpCode.ocCovar,
      OpCode.ocPearson,
      OpCode.ocSlope,
      OpCode.ocSumIfs,
    ])
      result.insert(opcode);
    return result;
  }
  /** Original implicit copy assignment copies string values and shares the opcode-set owner. @param source - Source. @returns This owner. */
  copy_assign(source: ScCalcConfig): this {
    this.MergeDocumentSpecific(source);
    this.mbOpenCLSubsetOnly = source.mbOpenCLSubsetOnly;
    this.mbOpenCLAutoSelect = source.mbOpenCLAutoSelect;
    this.maOpenCLDevice.assign(source.maOpenCLDevice);
    this.mnOpenCLMinimumFormulaGroupSize = source.mnOpenCLMinimumFormulaGroupSize;
    this.mpOpenCLSubsetOpCodes = source.mpOpenCLSubsetOpCodes;
    return this;
  }
  /** Original OpenCL defaults do not clear the device or document-specific settings. @returns Nothing. */
  setOpenCLConfigToDefault(): void {
    this.mbOpenCLSubsetOnly = true;
    this.mbOpenCLAutoSelect = true;
    this.mnOpenCLMinimumFormulaGroupSize = 100;
    this.mpOpenCLSubsetOpCodes = ScCalcConfig.pDefaultOpenCLSubsetOpCodes;
  }
  /** Original reset assigns a default-constructed configuration. @returns Nothing. */
  reset(): void {
    const fresh = new ScCalcConfig();
    this.copy_assign(fresh);
    fresh.maOpenCLDevice.dispose();
  }
  /** Original four document-specific fields merge without replacing OpenCL settings. @param source - Document configuration. @returns Nothing. */
  MergeDocumentSpecific(source: ScCalcConfig): void {
    this.meStringConversion = source.meStringConversion;
    this.mbEmptyStringAsZero = source.mbEmptyStringAsZero;
    this.meStringRefAddressSyntax = source.meStringRefAddressSyntax;
    this.mbHasStringRefSyntax = source.mbHasStringRefSyntax;
  }
  /** Original syntax setter marks the explicit imported/document choice. @param convention - Original address convention. @returns Nothing. */
  SetStringRefSyntax(convention: AddressConvention): void {
    this.meStringRefAddressSyntax = convention;
    this.mbHasStringRefSyntax = true;
  }
  /** Original value equality includes ordered opcode contents, independent of set identity. @param other - Compared owner. @returns Equal flag. */
  equals(other: ScCalcConfig): boolean {
    return (
      this.meStringRefAddressSyntax === other.meStringRefAddressSyntax &&
      this.meStringConversion === other.meStringConversion &&
      this.mbEmptyStringAsZero === other.mbEmptyStringAsZero &&
      this.mbHasStringRefSyntax === other.mbHasStringRefSyntax &&
      this.mbOpenCLSubsetOnly === other.mbOpenCLSubsetOnly &&
      this.mbOpenCLAutoSelect === other.mbOpenCLAutoSelect &&
      this.maOpenCLDevice.equals(other.maOpenCLDevice) &&
      this.mnOpenCLMinimumFormulaGroupSize === other.mnOpenCLMinimumFormulaGroupSize &&
      this.mpOpenCLSubsetOpCodes.size() === other.mpOpenCLSubsetOpCodes.size() &&
      [...this.mpOpenCLSubsetOpCodes].every(
        /** Original ordered-vector value equality. @param value - Opcode. @param index - Position. @returns Equal flag. */ (
          value,
          index,
        ) => value === other.mpOpenCLSubsetOpCodes.at(index),
      )
    );
  }
  /** Original inequality delegates to value equality. @param other - Compared owner. @returns Different flag. */
  notEquals(other: ScCalcConfig): boolean {
    return !this.equals(other);
  }
}
