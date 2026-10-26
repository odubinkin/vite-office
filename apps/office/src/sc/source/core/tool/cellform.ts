/** @fileoverview Native ScCellFormat display dispatch for scalar/formula cells and input-line dispatch for scalar/edit/formula cells. English resources and nonthreaded interpreter paths use existing native owners;macro and other format families remain unported. */
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { Color } from "../../../../tools/inc/color";
import { CellType, ScGlobal } from "../../../inc/global";
import { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import type { ScInterpreterContext } from "../../../inc/interpretercontext";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import type { ScFormulaCell } from "../../../inc/formulacell";
import type { SharedStringConstReference } from "../../../../svl/inc/sharedstring";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
/** Original static-only ScCellFormat API;the namespace has no substitute document or cell state. */
export const ScCellFormat = {
  /** Original GetInputString dispatch for scalar, edit and formula cells. The current formatter admits General; numeric formatting stays owned by NFGetInputLineString. @param cell - Borrowed cell. @param format - Format key. @param context - Actual context or null. @param doc - Actual document. @param filtering - Source default false. @param forceSystemLocale - Source default false. @returns Owned input text. */
  GetInputString(
    cell: ScRefCellValue,
    format: number,
    context: ScInterpreterContext | null,
    doc: ScDocument,
    filtering = false,
    forceSystemLocale = false,
  ): OUString {
    const current = context ?? doc.GetNonThreadedContext();
    switch (cell.getType()) {
      case CellType.CELLTYPE_STRING:
        return new OUString((cell.getSharedString() as SharedStringConstReference).getString());
      case CellType.CELLTYPE_EDIT:
        return cell.getEditText()?.GetText() ?? new OUString();
      case CellType.CELLTYPE_VALUE:
        return current.NFGetInputLineString(cell.getDouble(), format, filtering, forceSystemLocale);
      case CellType.CELLTYPE_FORMULA: {
        const formula = cell.getFormula() as ScFormulaCell;
        let value: OUString | null = null;
        if (formula.IsEmptyDisplayedAsString()) {
          // Native optional remains disengaged.
        } else if (formula.IsValue())
          value = current.NFGetInputLineString(
            formula.GetValue(),
            format,
            filtering,
            forceSystemLocale,
          );
        else value = new OUString(formula.GetString().getString());
        if (formula.GetErrCode() !== FormulaError.NONE) {
          value?.dispose();
          return new OUString();
        }
        return value ?? new OUString();
      }
      default:
        return new OUString();
    }
  },
  /** Original first GetString overload preserves color reset,context selection and scalar/formula evaluation order. The admitted core has native macro level0;macro callbacks and their running-cell branch remain unported. @param cell - Actual borrowed cell. @param format - Native format key. @param color - Native output pointer. @param context - Actual context or native null. @param doc - Actual document. @param nullValues - Original defaulttrue display-zero flag. @param formula - Original defaultfalse formula-output flag. @param star - Original defaultfalse formatter flag. @returns Owned native output. */
  GetString(
    cell: ScRefCellValue,
    format: number,
    color: [Color | null],
    context: ScInterpreterContext | null,
    doc: ScDocument,
    nullValues = true,
    formula = false,
    star = false,
  ): OUString {
    color[0] = null;
    const current = context ?? doc.GetNonThreadedContext();
    /** Formats a native value through the actual interpreter context. @param value - Native scalar/string. @returns Owned formatted string. */
    function output(value: number | OUStringConstReference): OUString {
      const result = new OUString();
      try {
        current.NFGetOutputString(value, format, result, color, star);
        return result;
      } catch (error) {
        result.dispose();
        throw error;
      }
    }
    switch (cell.getType()) {
      case CellType.CELLTYPE_STRING:
        return output((cell.getSharedString() as SharedStringConstReference).getString());
      case CellType.CELLTYPE_VALUE:
        return !nullValues && cell.getDouble() === 0 ? new OUString() : output(cell.getDouble());
      case CellType.CELLTYPE_FORMULA: {
        const f = cell.getFormula() as ScFormulaCell;
        if (formula) return f.GetFormula(f.GetDocument().GetGrammar());
        if (f.GetDocument().IsInInterpreter()) return unicode("...");
        const error = f.GetErrCode();
        if (error !== FormulaError.NONE) return ScGlobal.GetErrorString(error);
        if (f.IsEmptyDisplayedAsString()) return new OUString();
        if (f.IsValue()) {
          const value = f.GetValue();
          return !nullValues && value === 0 ? new OUString() : output(value);
        }
        return output(f.GetString().getString());
      }
      default:
        return new OUString();
    }
  },
};
