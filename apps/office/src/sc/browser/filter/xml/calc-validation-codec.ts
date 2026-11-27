/** @fileoverview Browser graph codec for document-owned Calc validation entries. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScConditionMode } from "../../../source/core/data/conditio.entry";
import {
  ScValidErrorStyle,
  ScValidationData,
  ScValidationMode,
  TableValidationVisibility,
} from "../../../source/core/data/validat";

/** Cloneable validation definition with its cell-pattern key. */
export interface CalcValidationRecord {
  readonly key: number;
  readonly position: readonly [number, number, number];
  readonly mode: ScValidationMode;
  readonly comparison: ScConditionMode;
  readonly operands: readonly string[];
  readonly ignoreBlank: boolean;
  readonly caseSensitive: boolean;
  readonly listType: TableValidationVisibility;
  readonly input: readonly [boolean, string, string];
  readonly error: readonly [boolean, string, string, ScValidErrorStyle];
}

/** Encodes the original condition, position and messages without transporting pointers. @param document - Workbook. @returns Validation definitions. */
export function encodeCalcValidations(document: ScDocument): CalcValidationRecord[] {
  return Array.from(
    document.GetValidationList() ?? [],
    /** Encodes a native rule. @param rule - Original rule. @returns Worker record. */ (rule) => {
      const base = rule.GetSrcPos();
      const operands: string[] = [];
      for (let index = 0; index < rule.GetExpressionCount(); index++)
        operands.push(rule.GetExpression(base, index, FormulaGrammar.Grammar.GRAM_ODFF));
      return {
        key: rule.GetKey(),
        position: base.GetVars(),
        mode: rule.GetDataMode(),
        comparison: rule.GetOperation(),
        operands,
        ignoreBlank: rule.IsIgnoreBlank(),
        caseSensitive: rule.IsCaseSensitive(),
        listType: rule.GetListType(),
        input: rule.GetInput(),
        error: rule.GetErrMsg(),
      };
    },
  );
}

/** Restores the native list in the original allocation order. @param document - Destination workbook with sheets and names. @param records - Stored definitions. @returns Nothing. */
export function decodeCalcValidations(
  document: ScDocument,
  records: readonly CalcValidationRecord[],
): void {
  for (const record of records) {
    const [column, row, tab] = record.position;
    const [showInput, inputTitle, inputMessage] = record.input;
    const [showError, errorTitle, errorMessage, errorStyle] = record.error;
    if (
      !document.ValidColRow(column, row) ||
      !document.FetchTable(tab) ||
      !Number.isInteger(record.mode) ||
      record.mode < ScValidationMode.Any ||
      record.mode > ScValidationMode.Custom ||
      !Number.isInteger(record.comparison) ||
      record.comparison < ScConditionMode.Equal ||
      record.comparison > ScConditionMode.NONE ||
      !Number.isInteger(record.listType) ||
      record.listType < TableValidationVisibility.Invisible ||
      record.listType > TableValidationVisibility.SortedAscending ||
      !Number.isInteger(errorStyle) ||
      errorStyle < ScValidErrorStyle.Stop ||
      errorStyle > ScValidErrorStyle.None ||
      typeof record.ignoreBlank !== "boolean" ||
      typeof record.caseSensitive !== "boolean" ||
      typeof showInput !== "boolean" ||
      typeof inputTitle !== "string" ||
      typeof inputMessage !== "string" ||
      typeof showError !== "boolean" ||
      typeof errorTitle !== "string" ||
      typeof errorMessage !== "string"
    )
      throw new Error("Calc worker validation is invalid.");
    const rule = new ScValidationData(
      record.mode,
      record.comparison,
      record.operands,
      document,
      new ScAddress(column, row, tab),
      FormulaGrammar.Grammar.GRAM_ODFF,
    );
    try {
      rule.SetIgnoreBlank(record.ignoreBlank);
      rule.SetCaseSensitive(record.caseSensitive);
      rule.SetListType(record.listType);
      rule.SetInput(inputTitle, inputMessage);
      if (!showInput) rule.ResetInput();
      rule.SetError(errorTitle, errorMessage, errorStyle);
      if (!showError) rule.ResetError();
      const key = document.AddValidationEntry(rule);
      if (key === 0 || key !== record.key)
        throw new Error("Calc worker validation key is invalid.");
    } finally {
      rule.Dispose();
    }
  }
}
