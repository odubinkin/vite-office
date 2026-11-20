/** @fileoverview Original worksheet conditional rule export over native Calc ranges. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import { ScCondFormatEntry, ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import type { ScTable } from "../../../inc/table";
import { XclXmlUtils } from "./xestream";
import type { XclExpDxfs } from "./xestyle.dxf";

const cellIsOperators: ReadonlyMap<ScConditionMode, string> = new Map([
  [ScConditionMode.Equal, "equal"],
  [ScConditionMode.NotEqual, "notEqual"],
  [ScConditionMode.Less, "lessThan"],
  [ScConditionMode.Greater, "greaterThan"],
  [ScConditionMode.EqLess, "lessThanOrEqual"],
  [ScConditionMode.EqGreater, "greaterThanOrEqual"],
  [ScConditionMode.Between, "between"],
  [ScConditionMode.NotBetween, "notBetween"],
]);

/** Saves represented condition groups and original per-sheet priority. @param output - Active worksheet serializer. @param document - Native workbook. @param table - Actual worksheet. @param dxfs - Exported differential styles. @returns Nothing. */
export function SaveXmlConditionalFormats(
  output: FastSerializerHelper,
  document: ScDocument,
  table: ScTable,
  dxfs: XclExpDxfs,
): void {
  let priority = 2;
  for (const format of table.GetCondFormList()) {
    let opened = false;
    const ranges = format.GetRange();
    if (ranges.empty()) continue;
    for (let i = 0; i < format.size(); ++i) {
      const entry = format.GetEntry(i);
      if (!(entry instanceof ScCondFormatEntry)) continue;
      const direct = entry.GetOperation() === ScConditionMode.Direct;
      const operator = cellIsOperators.get(entry.GetOperation());
      if (!direct && !operator) continue;
      if (!opened) {
        output.startElement(
          token("conditionalFormatting"),
          token("sqref"),
          XclXmlUtils.ToOString(document, ranges),
        );
        opened = true;
      }
      output.startElement(
        token("cfRule"),
        token("type"),
        direct ? "expression" : "cellIs",
        token("priority"),
        String(priority++),
        token("operator"),
        operator ?? null,
        token("dxfId"),
        dxfs.GetDxfId(entry.GetStyleName()),
      );
      for (let n = 0; n < entry.GetExpressionCount(); ++n) {
        output.startElement(token("formula"));
        output.writeEscaped(
          entry.GetExpression(entry.GetValidSrcPos(), n, FormulaGrammar.Grammar.GRAM_OOXML),
        );
        output.endElement(token("formula"));
      }
      output.endElement(token("cfRule"));
    }
    if (opened) output.endElement(token("conditionalFormatting"));
  }
}
