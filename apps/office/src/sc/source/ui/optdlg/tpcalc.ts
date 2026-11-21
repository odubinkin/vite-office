/** @fileoverview The source Calc Calculate tab exchanges a ScTpCalcItem with the options dialog. */
import { UNLIMITED_PRECISION } from "../../../../svl/source/numbers/zforlist.defaults";
import { ScDocOptions, ScTpCalcItem, type ScDocOptionsConstReference } from "../../../inc/docoptio";

/** Source Which ID for ScTpCalcItem. */
export const SID_SCDOCOPTIONS = 26040;
/** Original dates for the three Calculate page radio buttons. */
export const calcNullDates = [
  { day: 30, month: 12, year: 1899, label: "1899-12-30 (default)" },
  { day: 1, month: 1, year: 1900, label: "1900-01-01 (StarCalc 1.0)" },
  { day: 1, month: 1, year: 1904, label: "1904-01-01" },
] as const;

/** Original mutually exclusive formula criteria modes. */
export type FormulaCriteriaMode = "wildcards" | "regexp" | "literal";

/** Owns the live page draft separately from the source item. */
export class ScTpCalcOptions {
  readonly values: ScDocOptions;
  private readonly oldOptions: ScDocOptions;
  steps = "";
  minimumChange = "";
  decimalPlaces = "";
  limitDecimals = false;

  /** Reads the incoming calculation item without modifying the document. @param initial - Source calculation options. @returns Draft. */
  constructor(initial: ScDocOptionsConstReference) {
    this.oldOptions = new ScDocOptions(initial);
    this.values = new ScDocOptions(initial);
    this.Reset();
  }

  /** Reloads the source item into the controls. @returns Nothing. */
  Reset(): void {
    this.values.assign(this.oldOptions);
    this.steps = String(this.values.GetIterCount());
    this.minimumChange = String(this.values.GetIterEps());
    this.limitDecimals = this.values.GetStdPrecision() !== UNLIMITED_PRECISION;
    this.decimalPlaces = this.limitDecimals ? String(this.values.GetStdPrecision()) : "0";
  }

  /** Stages the iteration limit from the spin control. @param value - Draft step count. @returns Nothing. */
  SetSteps(value: string): void {
    this.steps = value;
  }

  /** Stages the minimum increment from the numeric field. @param value - Draft increment. @returns Nothing. */
  SetMinimumChange(value: string): void {
    this.minimumChange = value;
  }

  /** Toggles the source general-format limit. @param limit - Whether the limit applies. @returns Nothing. */
  SetLimitDecimals(limit: boolean): void {
    this.limitDecimals = limit;
  }

  /** Stages the precision spin control. @param value - Draft precision. @returns Nothing. */
  SetDecimalPlaces(value: string): void {
    this.decimalPlaces = value;
  }

  /** Reads the normalized criteria mode represented by the source radio group. @returns Mode. */
  GetCriteriaMode(): FormulaCriteriaMode {
    if (this.values.IsFormulaWildcardsEnabled()) return "wildcards";
    return this.values.IsFormulaRegexEnabled() ? "regexp" : "literal";
  }

  /** Updates both native mode flags in the original order. @param mode - Source selection. @returns Nothing. */
  SetCriteriaMode(mode: FormulaCriteriaMode): void {
    this.values.SetFormulaWildcardsEnabled(mode === "wildcards");
    this.values.SetFormulaRegexEnabled(mode === "regexp");
  }

  /** Validates the source minimum change field before leaving the page. @returns Validation error or empty string. */
  Validate(): string {
    const epsilon = this.minimumChange.trim();
    if (!epsilon || !Number.isFinite(Number(epsilon)) || Number(epsilon) <= 0)
      return "Invalid increment";
    return "";
  }

  /** Copies the validated widgets into their original item. @returns A changed option item. */
  FillItemSet(): ScTpCalcItem | undefined {
    const options = new ScDocOptions(this.values);
    options.SetIterCount(Math.max(1, Math.min(32767, Math.trunc(Number(this.steps)) || 1)));
    options.SetIterEps(Number(this.minimumChange));
    options.SetStdPrecision(
      this.limitDecimals
        ? Math.max(0, Math.min(20, Math.trunc(Number(this.decimalPlaces)) || 0))
        : UNLIMITED_PRECISION,
    );
    // Criterion queries keep the original cached search mode normalized.
    options.GetFormulaSearchType();
    this.oldOptions.GetFormulaSearchType();
    return options.notEquals(this.oldOptions)
      ? new ScTpCalcItem(SID_SCDOCOPTIONS, options)
      : undefined;
  }
}
