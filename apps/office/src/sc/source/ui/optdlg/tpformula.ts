/** @fileoverview The source Calc Formula page's grammar and calculation settings. */
import {
  FormulaGrammar,
  type AddressConvention,
  type Grammar,
} from "../../../../formula/inc/grammar";
import { ScCalcConfig } from "../../core/tool/calcconfig";

const { AddressConvention: C, Grammar: G } = FormulaGrammar;
/** Source Formula syntax selector order. */
export const calcFormulaSyntaxes = [
  { label: "Calc A1", convention: C.CONV_OOO, native: G.GRAM_NATIVE, english: G.GRAM_ENGLISH },
  {
    label: "Excel A1",
    convention: C.CONV_XL_A1,
    native: G.GRAM_NATIVE_XL_A1,
    english: G.GRAM_ENGLISH_XL_A1,
  },
  {
    label: "Excel R1C1",
    convention: C.CONV_XL_R1C1,
    native: G.GRAM_NATIVE_XL_R1C1,
    english: G.GRAM_ENGLISH_XL_R1C1,
  },
] as const;

/** Holds the supported source Formula controls until the options dialog accepts them. */
export class ScTpFormulaOptions {
  readonly config: ScCalcConfig;
  private readonly original: ScCalcConfig;
  syntax = 0;
  english = false;
  custom = false;
  writeConfig = true;

  /** Reads the current source grammar and calculator configuration. @param grammar - Live formula grammar. @param initial - Live calculation config. @param originalWriteConfig - Whether changes apply to new documents. @returns Draft. */
  constructor(
    private readonly grammar: Grammar,
    initial: ScCalcConfig,
    private readonly originalWriteConfig: boolean,
  ) {
    this.original = new ScCalcConfig(initial);
    this.config = new ScCalcConfig(initial);
    this.Reset();
  }

  /** Restores the source control values. @returns Nothing. */
  Reset(): void {
    const convention = FormulaGrammar.extractRefConvention(this.grammar);
    this.syntax = Math.max(
      0,
      calcFormulaSyntaxes.findIndex((mode) => mode.convention === convention),
    );
    this.english = FormulaGrammar.isEnglish(this.grammar);
    this.config.copy_assign(this.original);
    this.writeConfig = this.originalWriteConfig;
    const defaults = new ScCalcConfig();
    this.custom = this.original.notEquals(defaults);
    defaults.dispose();
  }

  /** Changes the formula syntax selection. @param syntax - Selector index. @returns Nothing. */
  SetSyntax(syntax: number): void {
    this.syntax = syntax;
  }

  /** Changes the English function names selection. @param english - Whether to use English names. @returns Nothing. */
  SetEnglish(english: boolean): void {
    this.english = english;
  }

  /** Chooses the source custom or default config. @param custom - Whether to keep custom settings. @returns Nothing. */
  SetCustom(custom: boolean): void {
    this.custom = custom;
  }

  /** Stores the accepted Details values in the page draft. @param conversion - Text conversion mode. @param empty - Explicit empty string preference. @param syntax - String reference convention. @param onlyDocument - Applies only to the current document. @returns Nothing. */
  SetDetailedSettings(
    conversion: number,
    empty: boolean,
    syntax: AddressConvention,
    onlyDocument: boolean,
  ): void {
    const { ILLEGAL, ZERO } = ScCalcConfig.StringConversion;
    this.config.meStringConversion = conversion;
    this.config.mbEmptyStringAsZero = conversion === ZERO || (conversion !== ILLEGAL && empty);
    if (syntax !== this.config.meStringRefAddressSyntax) this.config.SetStringRefSyntax(syntax);
    this.writeConfig = !onlyDocument;
  }

  /** Returns the selected browser-admitted source grammar if it changed. @returns New grammar. */
  GetChangedGrammar(): Grammar | undefined {
    const selected = calcFormulaSyntaxes[this.syntax] ?? calcFormulaSyntaxes[0];
    const originalSyntax = FormulaGrammar.extractRefConvention(this.grammar);
    if (
      originalSyntax === selected.convention &&
      FormulaGrammar.isEnglish(this.grammar) === this.english
    )
      return undefined;
    return this.english ? selected.english : selected.native;
  }

  /** Returns an updated config based on original default/custom behavior. @returns Changed config if selected. */
  GetChangedConfig(): ScCalcConfig | undefined {
    if (!this.custom) this.config.reset();
    return this.config.notEquals(this.original) ? this.config : undefined;
  }

  /** Returns a changed write scope. @returns New write scope if changed. */
  GetChangedWriteConfig(): boolean | undefined {
    return this.writeConfig === this.originalWriteConfig ? undefined : this.writeConfig;
  }

  /** Releases the owned calculation copies. @returns Nothing. */
  Dispose(): void {
    this.config.dispose();
    this.original.dispose();
  }
}
