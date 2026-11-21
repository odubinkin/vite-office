/** @fileoverview Original conditional-format rule editor pages and native entry conversion. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { Color } from "../../../../tools/inc/color";
import type { ScAddress } from "../../../inc/address";
import {
  ScCondDateFormatEntry,
  ScCondFormatDateType,
  ScCondFormatEntry,
  ScConditionMode,
  ScFormatEntryType,
  type ScFormatEntry,
} from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import {
  ScColorScaleEntry,
  ScColorScaleEntryType,
  ScColorScaleFormat,
} from "../../core/data/colorscale";

const grammar = FormulaGrammar.Grammar.GRAM_NATIVE;
const Mode = ScConditionMode;
const Stop = ScColorScaleEntryType;

/** Source condition choices in their original sequence. */
export const conditionChoices = [
  [Mode.Equal, "equal to"],
  [Mode.Less, "less than"],
  [Mode.Greater, "greater than"],
  [Mode.EqLess, "less than or equal to"],
  [Mode.EqGreater, "greater than or equal to"],
  [Mode.NotEqual, "not equal to"],
  [Mode.Between, "between"],
  [Mode.NotBetween, "not between"],
  [Mode.Duplicate, "duplicate"],
  [Mode.NotDuplicate, "not duplicate"],
  [Mode.Top10, "top elements"],
  [Mode.Bottom10, "bottom elements"],
  [Mode.TopPercent, "top percent"],
  [Mode.BottomPercent, "bottom percent"],
  [Mode.AboveAverage, "above average"],
  [Mode.BelowAverage, "below average"],
  [Mode.AboveEqualAverage, "above or equal average"],
  [Mode.BelowEqualAverage, "below or equal average"],
  [Mode.Error, "error"],
  [Mode.NoError, "no error"],
  [Mode.BeginsWith, "begins with"],
  [Mode.EndsWith, "ends with"],
  [Mode.ContainsText, "contains"],
  [Mode.NotContainsText, "does not contain"],
] as const;

/** Order of the original date entries. */
export const dateChoices = [
  [ScCondFormatDateType.TODAY, "Today"],
  [ScCondFormatDateType.YESTERDAY, "Yesterday"],
  [ScCondFormatDateType.TOMORROW, "Tomorrow"],
  [ScCondFormatDateType.LAST7DAYS, "Last 7 days"],
  [ScCondFormatDateType.THISWEEK, "This week"],
  [ScCondFormatDateType.LASTWEEK, "Last week"],
  [ScCondFormatDateType.NEXTWEEK, "Next week"],
  [ScCondFormatDateType.THISMONTH, "This month"],
  [ScCondFormatDateType.LASTMONTH, "Last month"],
  [ScCondFormatDateType.NEXTMONTH, "Next month"],
  [ScCondFormatDateType.THISYEAR, "This year"],
  [ScCondFormatDateType.LASTYEAR, "Last year"],
  [ScCondFormatDateType.NEXTYEAR, "Next year"],
] as const;

/** Original editable thresholds for a color scale. */
export const scaleChoices = [
  [Stop.MIN, "Minimum"],
  [Stop.MAX, "Maximum"],
  [Stop.PERCENTILE, "Percentile"],
  [Stop.VALUE, "Value"],
  [Stop.PERCENT, "Percent"],
  [Stop.FORMULA, "Formula"],
] as const;

/** Rule pages backed by the existing native format entry families. */
export type ConditionalRuleKind = "condition" | "formula" | "date" | "scale2" | "scale3";

/** Browser values for one original color stop. */
export interface ConditionalScaleDraft {
  readonly type: ScColorScaleEntryType;
  readonly value: string;
  readonly color: string;
  readonly mode?: ScConditionMode;
}

/** Editable values for an original rule page. */
export interface ConditionalRuleDraft {
  readonly kind: ConditionalRuleKind;
  readonly mode: ScConditionMode;
  readonly first: string;
  readonly second: string;
  readonly style: string;
  readonly date: ScCondFormatDateType;
  readonly stops: readonly ConditionalScaleDraft[];
  readonly source?: ScAddress;
  readonly type?: ScFormatEntryType;
}

/** Returns the number of source operand entries for one condition. @param mode - Original operation. @returns Operand count. */
export function ConditionOperands(mode: ScConditionMode): number {
  if (mode === Mode.Between || mode === Mode.NotBetween) return 2;
  if (
    (mode >= Mode.AboveAverage && mode <= Mode.NoError) ||
    mode === Mode.Duplicate ||
    mode === Mode.NotDuplicate
  )
    return 0;
  return 1;
}

/** Initializes original rule type, style, and scale defaults. @param kind - Source page. @param style - First actual style option. @returns Rule values. */
export function NewConditionalRule(kind: ConditionalRuleKind, style: string): ConditionalRuleDraft {
  const two = kind === "scale2";
  const low = { type: Stop.MIN, value: "", color: two ? "#ffff6d" : "#ff0000" };
  const high = { type: Stop.MAX, value: "", color: two ? "#77bc65" : "#00a933" };
  return {
    kind,
    mode: Mode.Equal,
    first: "",
    second: "",
    style,
    date: ScCondFormatDateType.TODAY,
    stops: two
      ? [low, high]
      : [low, { type: Stop.PERCENTILE, value: "50", color: "#ffff00" }, high],
  };
}

/** Reads rule editor values using the original formula origin when editing. @param entry - Existing rule. @returns Rule values. */
export function ReadConditionalRule(entry: ScFormatEntry): ConditionalRuleDraft {
  if (entry instanceof ScCondDateFormatEntry)
    return { ...NewConditionalRule("date", text(entry.GetStyleName())), date: entry.GetDateType() };
  if (entry instanceof ScColorScaleFormat) {
    const stops = Array.from(entry, (stop) => ({
      type: stop.GetType(),
      mode: stop.GetMode(),
      value: stop.GetType() === Stop.FORMULA ? stop.GetFormula(grammar) : String(stop.GetValue()),
      color: "#" + (stop.GetColor().toUInt32() & 0xffffff).toString(16).padStart(6, "0"),
    }));
    return { ...NewConditionalRule(stops.length === 2 ? "scale2" : "scale3", ""), stops };
  }
  if (!(entry instanceof ScCondFormatEntry))
    throw new Error("Unsupported conditional-format entry");
  const mode = entry.GetOperation();
  const source = entry.GetSrcPos();
  return {
    ...NewConditionalRule(mode === Mode.Direct ? "formula" : "condition", entry.GetStyleName()),
    mode,
    first: entry.GetExpression(source, 0, grammar),
    second: entry.GetExpression(source, 1, grammar),
    source,
    type: entry.GetType(),
  };
}

/** Builds an owned native rule. @param draft - Entered values. @param doc - Workbook. @param origin - Original or accepted rule range origin. @returns Native entry. */
export function CreateConditionalRule(
  draft: ConditionalRuleDraft,
  doc: ScDocument,
  origin: ScAddress,
): ScFormatEntry {
  if (draft.kind === "date") {
    const entry = new ScCondDateFormatEntry(doc);
    const style = unicode(draft.style);
    try {
      entry.SetDateType(draft.date);
      entry.SetStyleName(style);
      return entry;
    } finally {
      style.dispose();
    }
  }
  if (draft.kind === "scale2" || draft.kind === "scale3") {
    const entry = new ScColorScaleFormat(doc);
    for (const stop of draft.stops) {
      const threshold = new ScColorScaleEntry(
        Number(stop.value) || 0,
        new Color(Number.parseInt(stop.color.slice(1), 16)),
        stop.type,
        stop.mode,
      );
      if (stop.type === Stop.FORMULA) threshold.SetFormula(stop.value, doc, origin, grammar);
      entry.AddEntry(threshold);
    }
    return entry;
  }
  const mode = draft.kind === "formula" ? Mode.Direct : draft.mode;
  return new ScCondFormatEntry(
    mode,
    [draft.first, draft.second].slice(0, ConditionOperands(mode)),
    doc,
    draft.source ?? origin,
    grammar,
    draft.style,
    draft.type,
  );
}
