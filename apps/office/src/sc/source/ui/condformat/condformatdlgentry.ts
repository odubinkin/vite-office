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
  ScDataBarFormat,
  ScDataBarFormatData,
  ScIconSetFormat,
  ScIconSetType,
} from "../../../inc/colorscale";

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

/** Native data-bar limit choices, including automatic extrema. */
export const dataBarChoices = [[Stop.AUTO, "Automatic"], ...scaleChoices] as const;

/** Icon-set threshold kinds in the original editor order. */
export const iconSetChoices = [
  [Stop.VALUE, "Value"],
  [Stop.PERCENT, "Percent"],
  [Stop.PERCENTILE, "Percentile"],
  [Stop.FORMULA, "Formula"],
] as const;

/** Rule pages backed by the existing native format entry families. */
export type ConditionalRuleKind =
  "condition" | "formula" | "date" | "scale2" | "scale3" | "databar" | "iconset";

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
  readonly dataBar?: Readonly<ScDataBarFormatData>;
  readonly iconSetType?: ScIconSetType;
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
    stops:
      kind === "iconset"
        ? NewIconSetStops(ScIconSetType.IconSet_3Arrows)
        : kind === "databar"
          ? [
              { type: Stop.AUTO, value: "", color: "#000000" },
              { type: Stop.AUTO, value: "", color: "#000000" },
            ]
          : two
            ? [low, high]
            : [low, { type: Stop.PERCENTILE, value: "50", color: "#ffff00" }, high],
  };
}

/** Recreates the native empty percent rows when the icon set changes. @param type - Icon set identity. @returns Editable thresholds. */
export function NewIconSetStops(type: ScIconSetType): ConditionalScaleDraft[] {
  return Array.from(
    { length: ScIconSetFormat.getIconSetElements(type) },
    /** Initializes the native percent row. @returns Editable threshold. */ () => ({
      type: Stop.PERCENT,
      value: "",
      color: "#000000",
      mode: Mode.Equal,
    }),
  );
}

/** Reads one native threshold in the editor's formula grammar. @param stop - Native threshold. @returns Editable values. */
function readStop(stop: ScColorScaleEntry): ConditionalScaleDraft {
  return {
    type: stop.GetType(),
    mode: stop.GetMode(),
    value: stop.GetType() === Stop.FORMULA ? stop.GetFormula(grammar) : String(stop.GetValue()),
    color: "#" + (stop.GetColor().toUInt32() & 0xffffff).toString(16).padStart(6, "0"),
  };
}

/** Reads rule editor values using the original formula origin when editing. @param entry - Existing rule. @param document - Workbook number formatter owner. @returns Rule values. */
export function ReadConditionalRule(
  entry: ScFormatEntry,
  document: ScDocument,
): ConditionalRuleDraft {
  if (entry instanceof ScCondDateFormatEntry)
    return { ...NewConditionalRule("date", text(entry.GetStyleName())), date: entry.GetDateType() };
  if (entry instanceof ScColorScaleFormat) {
    const stops = Array.from(entry, readStop);
    return { ...NewConditionalRule(stops.length === 2 ? "scale2" : "scale3", ""), stops };
  }
  if (entry instanceof ScDataBarFormat) {
    const dataBar = entry.GetDataBarData();
    return {
      ...NewConditionalRule("databar", ""),
      dataBar,
      stops: [readStop(dataBar.mpLowerLimit), readStop(dataBar.mpUpperLimit)],
    };
  }
  if (entry instanceof ScIconSetFormat)
    return {
      ...NewConditionalRule("iconset", ""),
      iconSetType: entry.GetIconSetData().eIconSetType,
      stops: Array.from(
        entry,
        /** Formats numeric entries for the native input line. @param threshold - Existing threshold. @returns Editable threshold. */ (
          threshold,
        ) => {
          const stop = readStop(threshold);
          if (stop.type === Stop.FORMULA) return stop;
          const formatted = document.GetFormatTable().GetInputLineString(threshold.GetValue(), 0);
          try {
            return { ...stop, value: text(formatted) };
          } finally {
            formatted.dispose();
          }
        },
      ),
    };
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

/** Rebuilds one edited native conditional threshold. @param stop - Editable threshold. @param doc - Workbook. @param origin - Formula context. @param value - Numeric value carried by the threshold. @returns Owned threshold. */
function createStop(
  stop: ConditionalScaleDraft,
  doc: ScDocument,
  origin: ScAddress,
  value = Number(stop.value) || 0,
): ScColorScaleEntry {
  const entry = new ScColorScaleEntry(
    value,
    new Color(Number.parseInt(stop.color.slice(1), 16)),
    stop.type,
    stop.mode,
  );
  if (stop.type === Stop.FORMULA) entry.SetFormula(stop.value, doc, origin, grammar);
  return entry;
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
    for (const stop of draft.stops) entry.AddEntry(createStop(stop, doc, origin));
    return entry;
  }
  if (draft.kind === "databar") {
    const [lower, upper] = draft.stops;
    if (!lower || !upper) throw new Error("A data bar needs two thresholds.");
    const data = draft.dataBar?.Clone(doc) ?? new ScDataBarFormatData();
    if (!draft.dataBar) data.maPositiveColor = new Color(0x2a6099);
    try {
      data.mpLowerLimit.Dispose();
      data.mpLowerLimit = createStop(lower, doc, origin);
      data.mpUpperLimit.Dispose();
      data.mpUpperLimit = createStop(upper, doc, origin);
      const entry = new ScDataBarFormat(doc);
      entry.SetDataBarData(data);
      return entry;
    } catch (error) {
      data.Dispose();
      throw error;
    }
  }
  if (draft.kind === "iconset") {
    const entry = new ScIconSetFormat(doc);
    const data = entry.GetIconSetData();
    data.eIconSetType = draft.iconSetType ?? ScIconSetType.IconSet_3Arrows;
    try {
      for (const stop of draft.stops) {
        const value: [number] = [0];
        const input = unicode(stop.value);
        try {
          doc.GetFormatTable().IsNumberFormat(input, [0], value);
        } finally {
          input.dispose();
        }
        data.m_Entries.push(createStop(stop, doc, origin, value[0]));
      }
      return entry;
    } catch (error) {
      entry.Dispose();
      throw error;
    }
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
