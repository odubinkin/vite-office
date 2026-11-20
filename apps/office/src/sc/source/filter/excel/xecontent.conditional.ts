/** @fileoverview Original worksheet conditional rule export over native Calc ranges. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { FastSerializerHelper } from "../../../../sax/inc/fshelper";
import {
  ScCondDateFormatEntry,
  ScCondFormatEntry,
  ScConditionMode,
  ScFormatEntryType,
} from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import type { ScTable } from "../../../inc/table";
import { GetFixedFormula, type XclExpExtCondFormat } from "./xeextlst";
import { XclXmlUtils } from "./xestream";
import type { XclExpDxfs } from "./xestyle.dxf";
import { ScColorScaleEntryType as ScaleType, ScColorScaleFormat } from "../../../inc/colorscale";
import { Color } from "../../../../tools/inc/color";
import { ScRange } from "../../../inc/address";

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
const scaleTypes = ["min", "min", "max", "percentile", "num", "percent", "formula"] as const;
const dateTypes: readonly string[] = [
  "today",
  "yesterday",
  "tomorrow",
  "last7Days",
  "thisWeek",
  "lastWeek",
  "nextWeek",
  "thisMonth",
  "lastMonth",
  "nextMonth",
];
const textTypes = new Map([
  [ScConditionMode.BeginsWith, "beginsWith"],
  [ScConditionMode.EndsWith, "endsWith"],
  [ScConditionMode.ContainsText, "containsText"],
  [ScConditionMode.NotContainsText, "notContainsText"],
]);

/** Gets the native text-rule literal from the first formula token. @param entry - Text rule. @returns Unquoted operand. */
function GetText(entry: ScCondFormatEntry): string {
  const tokens = entry.CreateFlatCopiedTokenArray(0);
  try {
    const first = tokens?.TokenAt(0);
    if (first instanceof FormulaStringToken) return text(first.GetString().getString());
    if (first instanceof FormulaDoubleToken) {
      const number = OUString.numberDouble(first.GetDouble());
      try {
        return text(number);
      } finally {
        number.dispose();
      }
    }
    return "";
  } finally {
    tokens?.Clear();
  }
}

/** Writes the original list of color thresholds followed by the RGB values. @param output - Worksheet serializer. @param entry - Native color scale. @param priority - XLSX priority. @returns Nothing. */
function SaveColorScale(
  output: FastSerializerHelper,
  entry: ScColorScaleFormat,
  priority: number,
): void {
  output.startElement(
    token("cfRule"),
    token("type"),
    "colorScale",
    token("priority"),
    String(priority),
  );
  output.startElement(token("colorScale"));
  for (const stop of entry) {
    const type = stop.GetType();
    const value =
      type === ScaleType.FORMULA
        ? stop.GetFormula(FormulaGrammar.Grammar.GRAM_OOXML).replace(/^=/u, "")
        : String(stop.GetValue());
    output.startElement(
      token("cfvo"),
      token("type"),
      scaleTypes[type],
      token("val"),
      value,
      token("gte"),
      stop.GetMode() === ScConditionMode.EqGreater ? null : "0",
    );
    output.endElement(token("cfvo"));
  }
  for (const stop of entry) {
    output.startElement(
      token("color"),
      token("rgb"),
      XclXmlUtils.ToOString(new Color(stop.GetColor())),
    );
    output.endElement(token("color"));
  }
  output.endElement(token("colorScale"));
  output.endElement(token("cfRule"));
}

/** Saves represented condition groups and original per-sheet priority. @param output - Active worksheet serializer. @param document - Native workbook. @param table - Actual worksheet. @param dxfs - Exported differential styles. @param extended - Worksheet extension owner. @returns Nothing. */
export function SaveXmlConditionalFormats(
  output: FastSerializerHelper,
  document: ScDocument,
  table: ScTable,
  dxfs: XclExpDxfs,
  extended: XclExpExtCondFormat,
): void {
  let priority = 2;
  for (const format of table.GetCondFormList()) {
    let opened = false;
    const extensionRules = [];
    const ranges = format.GetRange();
    if (ranges.empty()) continue;
    for (let i = 0; i < format.size(); ++i) {
      const entry = format.GetEntry(i);
      const scale = entry instanceof ScColorScaleFormat;
      const timePeriod =
        entry instanceof ScCondDateFormatEntry ? dateTypes[entry.GetDateType()] : undefined;
      const condition = entry instanceof ScCondFormatEntry ? entry : undefined;
      const mode = condition?.GetOperation() ?? ScConditionMode.NONE;
      const direct = mode === ScConditionMode.Direct;
      const kind = textTypes.get(mode);
      const operator =
        mode === ScConditionMode.NotContainsText
          ? "notContains"
          : (kind ?? cellIsOperators.get(mode));
      if (!scale && !direct && !operator && timePeriod === undefined) continue;
      if (condition?.GetType() === ScFormatEntryType.ExtCondition) {
        extensionRules.push({
          entry: condition,
          type: kind ?? (direct ? "expression" : "cellIs"),
          operator: operator ?? null,
          priority: priority++,
        });
        continue;
      }
      if (!opened) {
        output.startElement(
          token("conditionalFormatting"),
          token("sqref"),
          XclXmlUtils.ToOString(document, ranges),
        );
        opened = true;
      }
      if (scale) {
        SaveColorScale(output, entry, priority++);
        continue;
      }
      if (entry instanceof ScCondDateFormatEntry && timePeriod !== undefined) {
        output.startElement(
          token("cfRule"),
          token("type"),
          "timePeriod",
          token("priority"),
          String(priority++),
          token("timePeriod"),
          timePeriod,
          token("dxfId"),
          dxfs.GetDxfId(text(entry.GetStyleName())),
        );
        output.endElement(token("cfRule"));
        continue;
      }
      if (!condition) continue;
      const value = kind === undefined ? null : GetText(condition);
      output.startElement(
        token("cfRule"),
        token("type"),
        kind ?? (direct ? "expression" : "cellIs"),
        token("priority"),
        String(priority++),
        token("operator"),
        operator ?? null,
        token("text"),
        value,
        token("dxfId"),
        dxfs.GetDxfId(condition.GetStyleName()),
      );
      if (value !== null) {
        const address = ranges.Combine().aStart;
        const origin = new TextDecoder().decode(
          XclXmlUtils.ToOString(document, new ScRange(address, address)),
        );
        output.startElement(token("formula"));
        output.writeEscaped(GetFixedFormula(mode, origin, `"${value.replaceAll('"', '""')}"`));
        output.endElement(token("formula"));
      } else
        for (let n = 0; n < condition.GetExpressionCount(); ++n) {
          output.startElement(token("formula"));
          output.writeEscaped(
            condition.GetExpression(
              condition.GetValidSrcPos(),
              n,
              FormulaGrammar.Grammar.GRAM_OOXML,
            ),
          );
          output.endElement(token("formula"));
        }
      output.endElement(token("cfRule"));
    }
    if (opened) output.endElement(token("conditionalFormatting"));
    extended.AddRecord(ranges, extensionRules);
  }
}
