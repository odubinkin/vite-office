/** @fileoverview Browser scalar input/display bindings. History captures the actual native ScCellValue owner;only transient user input uses a browser parsing union. */
import type { SharedStringConstReference } from "../../../svl/inc/sharedstring";
import { ScFormulaCell } from "../../inc/formulacell";
import { ScCellValue } from "../../inc/cellvalue";
import { FormulaError } from "../../../formula/inc/errorcodes";
import type { ScDocument } from "../../inc/document";
import type { ScAddress } from "../../inc/address";
import { CellType } from "../../inc/global";
import { ScStringUtil } from "../../inc/stringutil";
import { FormulaGrammar } from "../../../formula/inc/grammar";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { doubleToString } from "../../../sal/rtl/strtmpl.math";
/** Native English symbols used by ScGlobal::GetErrorString for reachable scalar errors. */
const errorSymbols = new Map<number, string>([
  [FormulaError.DivisionByZero, "#DIV/0!"],
  [FormulaError.NoValue, "#VALUE!"],
  [FormulaError.NoRef, "#REF!"],
  [FormulaError.NoCode, "#NULL!"],
  [FormulaError.NoName, "#NAME?"],
  [FormulaError.IllegalFPOperation, "#NUM!"],
]);
/** Projects source English error symbols or STR_ERROR_STR plus native code. @param error - Actual error. @returns Display text. */
function errorText(error: FormulaError): string {
  return errorSymbols.get(error) ?? `Err:${error}`;
}
/** Scalar action alternatives. */
type ScalarContent =
  | Readonly<{ kind: "empty" }>
  | Readonly<{ kind: "number"; value: number }>
  | Readonly<{ kind: "text"; value: string }>;
/** User input retains source text only until compilation. */
export type CalcCellInput = ScalarContent | Readonly<{ kind: "formula"; value: string }>;
/** Captures one actual native owning cell value for history;caller releases it through clear. @param doc - Source model. @param pos - Source position. @returns Detached owned value. */
export function captureCell(doc: ScDocument, pos: ScAddress): ScCellValue {
  const value = new ScCellValue();
  value.assign(doc, pos);
  return value;
}
/** Prepares an actual native value at the target position before grouped writes;this retains no alternate workbook state. @param doc - Actual model. @param pos - Actual target. @param content - Transient parsed input. @returns Owned native value. */
export function prepareCell(doc: ScDocument, pos: ScAddress, content: CalcCellInput): ScCellValue {
  if (content.kind === "empty") return new ScCellValue();
  if (content.kind === "number") return new ScCellValue(content.value);
  const value = unicode(content.value);
  try {
    if (content.kind === "formula") {
      const result = new ScCellValue();
      result.set(new ScFormulaCell(doc, pos, value, FormulaGrammar.Grammar.GRAM_NATIVE));
      return result;
    }
    const shared = doc.GetSharedStringPool().intern(value);
    try {
      return new ScCellValue(shared);
    } finally {
      shared.dispose();
    }
  } finally {
    value.dispose();
  }
}
/** Adopts transient parsed input through native value release and actual document setters. @param doc - Model. @param pos - Cell. @param content - Transient input. @returns Nothing. */
export function applyCell(doc: ScDocument, pos: ScAddress, content: CalcCellInput): void {
  const value = prepareCell(doc, pos, content);
  try {
    value.release(doc, pos);
  } finally {
    value.clear();
  }
}
/** Recognizes current plain scalar input with the source simple-number scanner. Date/currency/format services remain explicitly outside this plain-input binding. @param value - Input. @returns Typed input. @throws {Error} For unsupported multiline content. */
export function parseCellInput(value: string): CalcCellInput {
  if (/[\r\n]/.test(value))
    throw new Error("Multiline cells are not supported by the current Calc core.");
  if (!value) return { kind: "empty" };
  if (value.length > 1 && value[0] === "'") return { kind: "text", value: value.slice(1) };
  if (value.length > 1 && value[0] === "=") return { kind: "formula", value };
  const number: [number] = [0],
    input = unicode(value);
  try {
    if (ScStringUtil.parseSimpleNumber(input, 46, 44, 0, number))
      return { kind: "number", value: number[0] };
  } finally {
    input.dispose();
  }
  if (value.length > 1 && (value[0] === "+" || value[0] === "-")) return { kind: "formula", value };
  return { kind: "text", value };
}
/** Reads the actual source formula or scalar input,including native empty-code error display. @param doc - Model. @param pos - Cell. @returns Input-line text. */
export function cellInputText(doc: ScDocument, pos: ScAddress): string {
  const formula = doc.GetFormulaCell(pos);
  if (formula) {
    if (formula.GetCode().GetCodeError() && !formula.GetCode().GetLen())
      return errorText(formula.GetCode().GetCodeError());
    const value = formula.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE);
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }
  const content = doc.GetRefCellValue(pos);
  if (content.getType() === CellType.CELLTYPE_NONE) return "";
  if (content.getType() === CellType.CELLTYPE_VALUE) return doubleToString(content.getDouble());
  const value = text((content.getSharedString() as SharedStringConstReference).getString());
  return parseCellInput(value).kind !== "text" || value.startsWith("'") ? "'" + value : value;
}
/** Projects scalar/formula results without evaluating on the browser side. @param doc - Model. @param pos - Cell. @param showFormulas - Original formula-output mode. @returns Display value. */
export function cellPresentation(
  doc: ScDocument,
  pos: ScAddress,
  showFormulas = false,
): Readonly<{ text: string; alignment: "left" | "right" }> {
  if (showFormulas) {
    const formula = doc.GetFormulaCell(pos);
    if (formula) {
      const expression = formula.GetFormula(FormulaGrammar.Grammar.GRAM_NATIVE);
      try {
        return { text: text(expression), alignment: "left" };
      } finally {
        expression.dispose();
      }
    }
  }
  const error = doc.GetErrCode(pos);
  if (error) return { text: errorText(error), alignment: "right" };
  const ref = doc.GetRefCellValue(pos);
  if (ref.hasEmptyValue()) return { text: "", alignment: "left" };
  if (ref.hasString()) {
    const formula = ref.getFormula();
    if (formula) return { text: text(formula.GetString().getString()), alignment: "left" };
    const edit = ref.getEditText();
    if (edit) {
      const value = edit.GetText();
      try {
        return { text: text(value), alignment: "left" };
      } finally {
        value.dispose();
      }
    }
    const value = doc.GetSharedString(pos);
    try {
      return { text: text(value.getString()), alignment: "left" };
    } finally {
      value.dispose();
    }
  }
  return { text: doubleToString(doc.GetValue(pos)), alignment: "right" };
}
