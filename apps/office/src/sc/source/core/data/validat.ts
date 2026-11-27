/** @fileoverview Native Calc validation data and indexed rule collection from validat.cxx. */
import { FormulaGrammar, type Grammar } from "../../../../formula/inc/grammar";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import type { ScAddress } from "../../../inc/address";
import type { ScTokenArray } from "../../../inc/tokenarray";
import { ScConditionEntry, ScConditionMode } from "./conditio.entry";
import type { ScDocument } from "./document";

/** Original Calc validation modes. */
export enum ScValidationMode {
  Any,
  Whole,
  Decimal,
  Date,
  Time,
  TextLength,
  List,
  Custom,
}

/** Native validation alert mode. */
export enum ScValidErrorStyle {
  Stop,
  Warning,
  Info,
  Macro,
  None,
}

/** Original stored list visibility. */
export enum TableValidationVisibility {
  Invisible,
  Unsorted,
  SortedAscending,
}

/** One Calc validation condition and the attributes associated with the condition. */
export class ScValidationData extends ScConditionEntry {
  private key = 0;
  private listType = TableValidationVisibility.Unsorted;
  private inputTitle = "";
  private inputMessage = "";
  private showInput = false;
  private errorTitle = "";
  private errorMessage = "";
  private showError = false;
  private errorStyle = ScValidErrorStyle.Stop;

  /** Binds native condition operands and rule properties to one workbook. @param dataMode - Validation type. @param operation - Original comparison. @param expressions - Source or tokenized operands. @param document - Owning document. @param position - Formula origin. @param grammar - Formula grammar of string operands. @returns Validation rule. */
  public constructor(
    private readonly dataMode: ScValidationMode,
    operation: ScConditionMode,
    expressions: readonly (string | ScTokenArray)[],
    document: ScDocument,
    position: ScAddress,
    grammar: Grammar,
  ) {
    super(operation, expressions, document, position, grammar);
  }

  /** Reads the key held by the cell pattern. @returns Validation identity. */
  public GetKey(): number {
    return this.key;
  }

  /** Assigns the document-allocated key. @param key - Native rule identity. @returns Nothing. */
  public SetKey(key: number): void {
    this.key = key;
  }

  /** Returns the represented native validation type. @returns Validation mode. */
  public GetDataMode(): ScValidationMode {
    return this.dataMode;
  }

  /** Borrows the raw native list visibility. @returns List visibility. */
  public GetListType(): TableValidationVisibility {
    return this.listType;
  }

  /** Updates the raw native list visibility. @param value - List visibility. @returns Nothing. */
  public SetListType(value: TableValidationVisibility): void {
    this.listType = value;
  }

  /** Reads the saved input prompt even when display is disabled. @returns Input visibility and strings. */
  public GetInput(): readonly [boolean, string, string] {
    return [this.showInput, this.inputTitle, this.inputMessage];
  }

  /** Sets and enables the saved input prompt. @param title - Prompt title. @param message - Prompt body. @returns Nothing. */
  public SetInput(title: string, message: string): void {
    this.showInput = true;
    this.inputTitle = title;
    this.inputMessage = message;
  }

  /** Disables the input prompt while retaining its strings. @returns Nothing. */
  public ResetInput(): void {
    this.showInput = false;
  }

  /** Reads the saved error prompt even when display is disabled. @returns Error visibility, strings and alert mode. */
  public GetErrMsg(): readonly [boolean, string, string, ScValidErrorStyle] {
    return [this.showError, this.errorTitle, this.errorMessage, this.errorStyle];
  }

  /** Sets and enables the saved error prompt. @param title - Alert title. @param message - Alert body. @param style - Alert mode. @returns Nothing. */
  public SetError(title: string, message: string, style: ScValidErrorStyle): void {
    this.showError = true;
    this.errorTitle = title;
    this.errorMessage = message;
    this.errorStyle = style;
  }

  /** Disables the error prompt while retaining its strings. @returns Nothing. */
  public ResetError(): void {
    this.showError = false;
  }

  /** Compares the complete validation definition without its attribute key. @param other - Candidate rule. @returns Whether the native entries are equivalent. */
  public EqualEntries(other: ScValidationData): boolean {
    const literal = this.GetCode().every(
      /** Identifies operands held as values by the source condition entry. @param code - Operand tokens. @returns Whether the operand is a scalar literal or empty. */
      (code) =>
        code.GetLen() === 0 ||
        (code.GetLen() === 1 &&
          (code.TokenAt(0) instanceof FormulaDoubleToken ||
            code.TokenAt(0) instanceof FormulaStringToken)),
    );
    return (
      this.dataMode === other.dataMode &&
      this.listType === other.listType &&
      this.showInput === other.showInput &&
      this.inputTitle === other.inputTitle &&
      this.inputMessage === other.inputMessage &&
      this.showError === other.showError &&
      this.errorTitle === other.errorTitle &&
      this.errorMessage === other.errorMessage &&
      this.errorStyle === other.errorStyle &&
      super.IsEqual(other, literal)
    );
  }

  /** Returns whether this is the original default rule represented by key zero. @returns Whether the entry is empty. */
  public IsEmpty(): boolean {
    return (
      this.dataMode === ScValidationMode.Any &&
      this.GetOperation() === ScConditionMode.Equal &&
      this.IsIgnoreBlank() &&
      !this.IsCaseSensitive() &&
      this.listType === TableValidationVisibility.Unsorted &&
      !this.showInput &&
      !this.inputTitle &&
      !this.inputMessage &&
      !this.showError &&
      !this.errorTitle &&
      !this.errorMessage &&
      this.errorStyle === ScValidErrorStyle.Stop &&
      this.GetCode().every(
        /** Finds an absent condition operand. @param code - Operand tokens. @returns Whether empty. */
        (code) => code.GetLen() === 0,
      )
    );
  }

  /** Creates an independent document-owned validation entry. @param document - Destination document. @returns Clone of the complete rule. */
  public override Clone(document: ScDocument): ScValidationData {
    const copy = new ScValidationData(
      this.dataMode,
      this.GetOperation(),
      this.GetCode(),
      document,
      this.GetSrcPos(),
      FormulaGrammar.Grammar.GRAM_ODFF,
    );
    copy.key = this.key;
    copy.nOptions = this.nOptions;
    copy.listType = this.listType;
    copy.inputTitle = this.inputTitle;
    copy.inputMessage = this.inputMessage;
    copy.showInput = this.showInput;
    copy.errorTitle = this.errorTitle;
    copy.errorMessage = this.errorMessage;
    copy.showError = this.showError;
    copy.errorStyle = this.errorStyle;
    return copy;
  }
}
