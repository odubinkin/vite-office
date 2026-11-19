/** @fileoverview Native one-entry lookup queries over referenced Calc cells. */
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { approxEqual } from "../../../../sal/inc/rtl/math";
import type { ScAddress } from "../../../inc/address";
import type { ScRefCellValue } from "../../../inc/cellvalue";
import type { ScDocument } from "../../../inc/document";
import { ScGlobal } from "../../../inc/global";
import { ScCellFormat } from "../tool/cellform";
import { GetCollator, type ScQueryEntry } from "../tool/queryentry";

/** Original numeric/text comparisons for equality and less-or-equal lookup queries. */
export class ScQueryEvaluator {
  /** Captures the searched document and criteria. @param document - Actual document. @param entry - One active query criterion. @returns Evaluator. */
  constructor(
    private readonly document: ScDocument,
    private readonly entry: ScQueryEntry,
  ) {}

  /** Evaluates one cell with native input-string formatting and number matching. @param cell - Borrowed candidate. @param address - Candidate position. @param ordered - Whether to test the ordered relation as well as exact equality. @returns Exact result and ordered comparison when defined. */
  evaluate(
    cell: ScRefCellValue,
    address: ScAddress,
    ordered: boolean,
  ): {
    equal: boolean;
    order?: number;
  } {
    const key = this.entry.item;
    const formula = cell.getFormula();
    const error = formula?.GetErrCode() ?? FormulaError.NONE;
    if (typeof key === "number") {
      if (error !== FormulaError.NONE || !cell.hasNumeric()) return { equal: false };
      const value = formula ? formula.GetValue() : cell.getDouble();
      const equal = approxEqual(value, key);
      return { equal, order: equal ? 0 : value < key ? -1 : 1 };
    }
    const context = this.document.GetNonThreadedContext();
    const format = this.document.GetPattern(address)?.GetNumberFormat(context) ?? 0;
    const candidate =
      error !== FormulaError.NONE
        ? ScGlobal.GetErrorString(error)
        : ScCellFormat.GetInputString(cell, format, context, this.document, true);
    const shared = this.document.GetSharedStringPool().intern(candidate);
    try {
      const equal = this.entry.matchesText(candidate, text(shared.getIgnoreCaseString()));
      if (!ordered || (error === FormulaError.NONE && cell.hasNumeric())) return { equal };
      return { equal, order: GetCollator().compare(text(candidate), key.text) };
    } finally {
      shared.dispose();
      candidate.dispose();
    }
  }
}
