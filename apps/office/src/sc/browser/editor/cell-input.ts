/** @fileoverview Browser projection of native Calc input-line strings and grid display. */
import type { ScProtectionAttr } from "../../inc/attrib";
import { ATTR_PROTECTION } from "../../inc/scitems";
import type { Color } from "../../../tools/inc/color";
import { FormulaError } from "../../../formula/inc/errorcodes";
import type { ScDocument } from "../../inc/document";
import type { ScAddress } from "../../inc/address";
import { CellType } from "../../inc/global";
import { ScCellFormat } from "../../source/core/tool/cellform";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
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
/** Reads the direct or conditional visibility flags for a protected sheet. @param doc - Workbook. @param pos - Cell address. @param display - Whether the output uses conditional attributes. @returns Original protection item. */
function sheetCellProtection(
  doc: ScDocument,
  pos: ScAddress,
  display = false,
): ScProtectionAttr | undefined {
  if (!doc.IsTabProtected(pos.Tab())) return undefined;
  return doc.GetPattern(pos)?.GetItem(ATTR_PROTECTION, display ? doc.GetCondResult(pos) : null) as
    ScProtectionAttr | undefined;
}
/** Reads the actual source formula, scalar or edit text,including native empty-code error display. @param doc - Model. @param pos - Cell. @returns Input-line text. */
export function cellInputText(doc: ScDocument, pos: ScAddress): string {
  const protection = sheetCellProtection(doc, pos);
  if (protection?.GetHideCell()) return "";
  const formula = doc.GetFormulaCell(pos);
  if (formula) {
    if (protection?.GetHideFormula()) return "";
    if (formula.GetCode().GetCodeError() && !formula.GetCode().GetLen())
      return errorText(formula.GetCode().GetCodeError());
    const value = formula.GetFormula(doc.GetGrammar());
    try {
      return text(value);
    } finally {
      value.dispose();
    }
  }
  const content = doc.GetRefCellValue(pos);
  const type = content.getType();
  const context = doc.GetNonThreadedContext();
  const format = doc.GetNumberFormat(pos.Col(), pos.Row(), pos.Tab());
  const input =
    type === CellType.CELLTYPE_EDIT
      ? ScCellFormat.GetOutputString(doc, pos, content)
      : ScCellFormat.GetInputString(content, format, context, doc);
  try {
    const value = text(input);
    if (
      type === CellType.CELLTYPE_VALUE ||
      type === CellType.CELLTYPE_NONE ||
      /[\r\n]/u.test(value) ||
      context.NFIsTextFormat(format)
    )
      return value;
    return /^[=+'-]/u.test(value) || context.NFIsNumberFormat(input, [format], [0])
      ? "'" + value
      : value;
  } finally {
    input.dispose();
  }
}
/** Projects grid display text through the native cell formatter. @param doc - Model. @param pos - Cell. @param showFormulas - Original formula-output mode. @param showZeros - Original display-zero mode. @returns Display value. */
export function cellPresentation(
  doc: ScDocument,
  pos: ScAddress,
  showFormulas = false,
  showZeros = true,
): Readonly<{ text: string; alignment: "left" | "right"; color?: Color | null }> {
  const protection = sheetCellProtection(doc, pos, true);
  if (protection?.GetHideCell()) return { text: "", alignment: "left" };
  if (showFormulas) {
    const formula = doc.GetFormulaCell(pos);
    if (formula) {
      if (protection?.GetHideFormula()) return { text: "", alignment: "left" };
      const expression = formula.GetFormula(doc.GetGrammar());
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
  const color: [Color | null] = [null];
  const output = ScCellFormat.GetOutputString(doc, pos, ref, showZeros, color);
  try {
    return {
      text: text(output),
      alignment: ref.hasString() ? "left" : "right",
      ...(color[0] ? { color: color[0] } : {}),
    };
  } finally {
    output.dispose();
  }
}
