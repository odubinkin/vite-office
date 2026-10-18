/** @fileoverview Browser scalar input/display bindings. Action payloads borrow native token values through actual ScTokenArray copies;this is not a second workbook or a full number formatter. */
import { ScFormulaCell } from "../../inc/formulacell";
import { ScTokenArray } from "../../inc/tokenarray";
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
/** Immutable history payload:source array structure is copied while native const token identities are shared. */
export type CalcCellContent = ScalarContent | Readonly<{ kind: "formula"; code: ScTokenArray }>;
/** User input retains source text only until compilation. */
export type CalcCellInput = ScalarContent | Readonly<{ kind: "formula"; value: string }>;
/** Captures real core content for one action,including code errors and forced-recalc flags. @param doc - Model. @param pos - Cell. @returns Native-valued payload. */
export function captureCell(doc: ScDocument, pos: ScAddress): CalcCellContent {
  const type = doc.GetCellType(pos);
  if (type === CellType.CELLTYPE_FORMULA)
    return {
      kind: "formula",
      code: new ScTokenArray((doc.GetFormulaCell(pos) as ScFormulaCell).GetCode()),
    };
  if (type === CellType.CELLTYPE_VALUE) return { kind: "number", value: doc.GetValue(pos) };
  if (type === CellType.CELLTYPE_STRING) {
    const value = doc.GetSharedString(pos);
    try {
      return { kind: "text", value: text(value.getString()) };
    } finally {
      value.dispose();
    }
  }
  return { kind: "empty" };
}
/** Adopts typed values through actual document setters. Formula history reuses native code,not serialized text. @param doc - Model. @param pos - Cell. @param content - Input or history content. @returns Nothing. */
export function applyCell(
  doc: ScDocument,
  pos: ScAddress,
  content: CalcCellContent | CalcCellInput,
): void {
  if (content.kind === "empty") {
    doc.SetEmptyCell(pos);
    return;
  }
  if (content.kind === "number") {
    doc.SetValue(pos, content.value);
    return;
  }
  if (content.kind === "formula" && "code" in content) {
    doc.SetFormulaCell(
      pos,
      new ScFormulaCell(
        doc,
        pos,
        new ScTokenArray(content.code),
        FormulaGrammar.Grammar.GRAM_NATIVE,
      ),
    );
    return;
  }
  const value = unicode(content.value);
  try {
    if (content.kind === "text") doc.SetTextCell(pos, value);
    else doc.SetFormula(pos, value, FormulaGrammar.Grammar.GRAM_NATIVE);
  } finally {
    value.dispose();
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
  const content = captureCell(doc, pos);
  if (content.kind === "empty") return "";
  if (content.kind === "number") return doubleToString(content.value);
  const value = (content as Readonly<{ kind: "text"; value: string }>).value;
  return parseCellInput(value).kind !== "text" || value.startsWith("'") ? "'" + value : value;
}
/** Projects scalar/formula results without evaluating on the browser side. @param doc - Model. @param pos - Cell. @returns Display value. */
export function cellPresentation(
  doc: ScDocument,
  pos: ScAddress,
): Readonly<{ text: string; alignment: "left" | "right" }> {
  const error = doc.GetErrCode(pos);
  if (error) return { text: errorText(error), alignment: "right" };
  const ref = doc.GetRefCellValue(pos);
  if (ref.hasEmptyValue()) return { text: "", alignment: "left" };
  if (ref.hasString()) {
    const formula = ref.getFormula();
    if (formula) return { text: text(formula.GetString().getString()), alignment: "left" };
    const value = doc.GetSharedString(pos);
    try {
      return { text: text(value.getString()), alignment: "left" };
    } finally {
      value.dispose();
    }
  }
  return { text: doubleToString(doc.GetValue(pos)), alignment: "right" };
}
