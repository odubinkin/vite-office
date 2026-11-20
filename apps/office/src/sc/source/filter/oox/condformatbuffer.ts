/** @fileoverview SpreadsheetML conditional cells and formula rules entering the native Calc range owner. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import type { FragmentContext } from "../../../../oox/source/core/fragmenthandler";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRange, type ScAddress } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import {
  ScCondDateFormatEntry,
  ScCondFormatDateType,
  ScCondFormatEntry,
  ScConditionalFormat,
  ScConditionMode,
  ScFormatEntryType,
} from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { AddressConverter } from "./addressconverter";
import { styleIndex, type StylesBuffer } from "./stylesbuffer";
import { attribute, isSpreadsheetTag } from "./workbookfragment";
import {
  ScColorScaleEntry,
  ScColorScaleEntryType,
  ScColorScaleFormat,
} from "../../../inc/colorscale";
import { stringToDouble } from "../../../../sal/inc/rtl/math";
import { importOOXColor } from "./stylesbuffer.color";
import { ScTokenArray } from "../../../inc/tokenarray";
import { rtl_str_toBoolean } from "../../../../sal/inc/rtl/string.h";

const grammar = FormulaGrammar.Grammar.GRAM_OOXML;
const modes = new Map([
  ["equal", ScConditionMode.Equal],
  ["notEqual", ScConditionMode.NotEqual],
  ["lessThan", ScConditionMode.Less],
  ["greaterThan", ScConditionMode.Greater],
  ["lessThanOrEqual", ScConditionMode.EqLess],
  ["greaterThanOrEqual", ScConditionMode.EqGreater],
  ["between", ScConditionMode.Between],
  ["notBetween", ScConditionMode.NotBetween],
]);
const textModes = new Map([
  ["beginsWith", ScConditionMode.BeginsWith],
  ["endsWith", ScConditionMode.EndsWith],
  ["containsText", ScConditionMode.ContainsText],
  ["notContainsText", ScConditionMode.NotContainsText],
]);
/** Translates a conditional rule attribute to its Calc operation. @param type - OOXML rule type. @param operator - Cell comparison operator. @returns Native mode or absence. */
export function convertToInternalOperator(
  type: string,
  operator: string,
): ScConditionMode | undefined {
  if (type === "cellIs") return modes.get(operator);
  if (type === "expression") return ScConditionMode.Direct;
  return textModes.get(type);
}

const dateTypes = [
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
const scaleTypes = new Map([
  ["min", ScColorScaleEntryType.MIN],
  ["max", ScColorScaleEntryType.MAX],
  ["percent", ScColorScaleEntryType.PERCENT],
  ["percentile", ScColorScaleEntryType.PERCENTILE],
]);

/** Collects OOXML threshold and color records in their independent source orders. */
class ColorScaleRule implements FragmentContext {
  private readonly thresholds: (readonly SaxesAttributeNS[])[] = [];
  private readonly colors: (readonly SaxesAttributeNS[])[] = [];

  /** Opens one original threshold or color. @param tag - Child token. @returns Context or ignored subtree. */
  createFastChildContext(tag: SaxesTagNS): ColorScaleRule | null {
    return isSpreadsheetTag(tag) && (tag.local === "cfvo" || tag.local === "color") ? this : null;
  }
  /** Preserves original attribute records until workbook theme and formulas are available. @param tag - Source token. @param attrs - Attributes. @returns Nothing. */
  startFastElement(tag: SaxesTagNS, attrs: readonly SaxesAttributeNS[]): void {
    if (tag.local === "cfvo") this.thresholds.push(attrs);
    else if (tag.local === "color") this.colors.push(attrs);
  }
  /** Completes the element. @returns Nothing. */
  endFastElement(): void {}
  /** Ignores scale whitespace. @returns Nothing. */
  characters(): void {}

  /** Converts the original paired entries to native threshold owners. @param document - Workbook. @param address - Formula base. @param styles - Theme resolver. @returns Owned rule. */
  AddEntries(document: ScDocument, address: ScAddress, styles: StylesBuffer): ScColorScaleFormat {
    const scale = new ScColorScaleFormat(document);
    try {
      for (let i = 0; i < Math.max(this.thresholds.length, this.colors.length); ++i) {
        const attrs = this.thresholds[i] ?? [];
        const type = attribute(attrs, "type");
        const raw = attribute(attrs, "val");
        const input = unicode(raw.trim());
        const end: [number] = [-1];
        let value: number;
        try {
          value = stringToDouble(input, 46, 44, null, end);
        } finally {
          input.dispose();
        }
        const formula = raw !== "" && raw !== '""' && (type === "formula" || end[0] < raw.length);
        const mode = attribute(attrs, "gte");
        const entry = new ScColorScaleEntry(
          formula ? 0 : value,
          importOOXColor(this.colors[i] ?? [], styles.graphicHelper),
          formula
            ? ScColorScaleEntryType.FORMULA
            : (scaleTypes.get(type) ?? ScColorScaleEntryType.VALUE),
          mode && !rtl_str_toBoolean(new TextEncoder().encode(mode))
            ? ScConditionMode.Greater
            : ScConditionMode.EqGreater,
        );
        scale.AddEntry(entry);
        if (formula) entry.SetFormula(raw, document, address, grammar);
      }
      return scale;
    } catch (error) {
      scale.Dispose();
      throw error;
    }
  }
}

/** Collects the represented original cfRule records. */
class CondFormatRule implements FragmentContext {
  mode: ScConditionMode | undefined;
  dateType: ScCondFormatDateType | undefined;
  literal: string | undefined;
  dxfId = -1;
  priority = -1;
  readonly expressions: string[] = [];
  colorScale: ColorScaleRule | undefined;
  private type = "";
  private inFormula = false;

  /** Opens an operand in the current native rule. @param tag - Child token. @returns This context or an ignored subtree. */
  createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (!isSpreadsheetTag(tag)) return null;
    if (tag.local === "formula") return this;
    if (tag.local === "colorScale" && this.type === "colorScale")
      return (this.colorScale ??= new ColorScaleRule());
    return null;
  }
  /** Reads the original type, priority and style attributes. @param tag - Source element. @param attrs - SpreadsheetML attributes. @returns Nothing. */
  startFastElement(tag: SaxesTagNS, attrs: readonly SaxesAttributeNS[]): void {
    if (tag.local === "formula") {
      this.expressions.push("");
      this.inFormula = true;
      return;
    }
    const type = (this.type = attribute(attrs, "type"));
    if (type === "containsErrors") this.mode = ScConditionMode.Error;
    else if (type === "notContainsErrors") this.mode = ScConditionMode.NoError;
    else this.mode = convertToInternalOperator(type, attribute(attrs, "operator"));
    if (type === "timePeriod") {
      const period = dateTypes.indexOf(attribute(attrs, "timePeriod"));
      this.dateType = period < 0 ? ScCondFormatDateType.TODAY : period;
    } else if (textModes.has(type)) this.literal = attribute(attrs, "text");
    this.priority = styleIndex(attribute(attrs, "priority"));
    this.dxfId = styleIndex(attribute(attrs, "dxfId"));
  }
  /** Closes the original rule or expression. @returns Nothing. */
  endFastElement(): void {
    this.inFormula = false;
  }
  /** Collects each operand even across SAX text fragments. @param value - Source text. @returns Nothing. */
  characters(value: string): void {
    const index = this.expressions.length - 1;
    if (this.inFormula) this.expressions[index] += value;
  }
}

/** A worksheet-extension rule after inline DXF and formula processing. */
export interface ExtCondFormatRuleModel {
  readonly mode: ScConditionMode;
  readonly expression: string;
  readonly priority: number;
  readonly style: string;
}

/** Parses original conditional range references. @param source - SpreadsheetML range expression. @param document - Workbook. @param tab - Worksheet. @returns Ordered range list. */
export function importCondFormatRanges(
  source: string,
  document: ScDocument,
  tab: number,
): ScRangeList {
  const ranges = new ScRangeList();
  for (const ref of source.trim().split(/\s+/u)) {
    const range = new ScRange();
    if (
      AddressConverter.convertToCellRangeUnchecked(range, ref, tab, document) &&
      document.ValidColRow(range.aStart.Col(), range.aStart.Row()) &&
      document.ValidColRow(range.aEnd.Col(), range.aEnd.Row())
    )
      ranges.push_back(range);
  }
  return ranges;
}

/** Collects the ranges and priority-indexed rules of one conditionalFormatting element. */
class CondFormat implements FragmentContext {
  private readonly rules: CondFormatRule[] = [];
  private ranges = new ScRangeList();
  private readonly extRules = new Map<number, ExtCondFormatRuleModel>();

  /** Binds the actual worksheet. @param document - Native workbook. @param tab - Source sheet. @returns Format context. */
  constructor(
    private readonly document: ScDocument,
    private readonly tab: number,
  ) {}
  /** Opens an original cfRule. @param tag - Child element. @returns Rule or ignored context. */
  createFastChildContext(tag: SaxesTagNS): CondFormatRule | null {
    if (!isSpreadsheetTag(tag) || tag.local !== "cfRule") return null;
    const rule = new CondFormatRule();
    this.rules.push(rule);
    return rule;
  }
  /** Parses the original ranges using the worksheet address converter. @param _tag - Conditional format element. @param attrs - SpreadsheetML attributes. @returns Nothing. */
  startFastElement(_tag: SaxesTagNS, attrs: readonly SaxesAttributeNS[]): void {
    this.ranges = importCondFormatRanges(attribute(attrs, "sqref"), this.document, this.tab);
  }
  /** Reads the original ordered range set. @returns Borrowed ranges. */
  GetRanges(): ScRangeList {
    return this.ranges;
  }
  /** Combines represented extension and standard rules at their original priorities. @param rule - Extension rule. @param priority - Effective priority. @returns Nothing. */
  AddExtRule(rule: ExtCondFormatRuleModel, priority: number): void {
    if (priority > 0) this.extRules.set(priority, rule);
  }
  /** Completes the originally parsed range group. @returns Nothing. */
  endFastElement(): void {}
  /** Skips whitespace between individual rules. @returns Nothing. */
  characters(): void {}

  /** Returns the first valid priority used for native group order. @returns Ordering key. */
  GetPriority(): number {
    let min = Number.MAX_SAFE_INTEGER;
    for (const rule of this.rules) if (rule.priority > 0) min = Math.min(min, rule.priority);
    for (const priority of this.extRules.keys()) min = Math.min(min, priority);
    return min;
  }

  /** Inserts the actual Calc owner and binds its index into the affected cell ranges. @param styles - Workbook dxf buffer. @returns Nothing. */
  finalizeImport(styles: StylesBuffer): void {
    if (this.ranges.empty()) return;
    const format = new ScConditionalFormat(0, this.document);
    format.SetRange(this.ranges);
    const ordered = new Map<number, CondFormatRule>();
    for (const rule of this.rules) if (rule.priority > 0) ordered.set(rule.priority, rule);
    const source = this.ranges.GetTopLeftCorner();
    try {
      for (const priority of [...new Set([...ordered.keys(), ...this.extRules.keys()])].sort(
        /** Orders original rule priorities. @param a - First priority. @param b - Second priority. @returns Sort order. */ (
          a,
          b,
        ) => a - b,
      )) {
        const extended = this.extRules.get(priority);
        if (extended) {
          AddExtEntry(format, this.document, source, extended);
          continue;
        }
        const rule = ordered.get(priority) as CondFormatRule;
        if (rule.colorScale) {
          format.AddEntry(rule.colorScale.AddEntries(this.document, source, styles));
          continue;
        }
        if (rule.dateType !== undefined) {
          const entry = new ScCondDateFormatEntry(this.document);
          const name = unicode(styles.createDxfStyle(this.document, rule.dxfId));
          try {
            entry.SetDateType(rule.dateType);
            entry.SetStyleName(name);
            format.AddEntry(entry);
          } finally {
            name.dispose();
          }
          continue;
        }
        if (rule.mode === undefined) continue;
        const count =
          rule.mode === ScConditionMode.Error || rule.mode === ScConditionMode.NoError
            ? 0
            : rule.mode === ScConditionMode.Between || rule.mode === ScConditionMode.NotBetween
              ? 2
              : 1;
        if (rule.literal === undefined && rule.expressions.length < count) continue;
        const expressions = rule.expressions
          .slice(0, count)
          .map(
            /** Removes source XML whitespace. @param value - Formula. @returns Formula text. */ (
              value,
            ) => value.trim(),
          );
        if (rule.literal === undefined && expressions.includes("")) continue;
        const style = styles.createDxfStyle(this.document, rule.dxfId);
        try {
          if (rule.literal === undefined) {
            format.AddEntry(
              new ScCondFormatEntry(rule.mode, expressions, this.document, source, grammar, style),
            );
          } else {
            const tokens = new ScTokenArray(this.document);
            const value = unicode(rule.literal);
            const shared = this.document.GetSharedStringPool().intern(value);
            try {
              tokens.AddString(shared);
              format.AddEntry(
                new ScCondFormatEntry(rule.mode, [tokens], this.document, source, grammar, style),
              );
            } finally {
              tokens.Clear();
              shared.dispose();
              value.dispose();
            }
          }
        } catch (error) {
          if (!(error instanceof Error) || !error.message.includes("not implemented")) throw error;
        }
      }
      if (format.IsEmpty()) return;
      const key = this.document.AddCondFormat(format, this.tab);
      if (key) this.document.AddCondFormatData(this.ranges, this.tab, key);
    } finally {
      if (format.GetKey() === 0) format.Dispose();
    }
  }
}

/** Appends one represented original ExtCondition. @param format - Destination. @param document - Workbook. @param source - Reference base. @param rule - Imported rule. @returns Nothing. */
function AddExtEntry(
  format: ScConditionalFormat,
  document: ScDocument,
  source: ScAddress,
  rule: ExtCondFormatRuleModel,
): void {
  try {
    format.AddEntry(
      new ScCondFormatEntry(
        rule.mode,
        [rule.expression],
        document,
        source,
        grammar,
        rule.style,
        ScFormatEntryType.ExtCondition,
      ),
    );
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("not implemented")) throw error;
  }
}

/** Keys ordered ranges by their original addresses on this sheet. @param ranges - Native range list. @returns Exact worksheet range identity. */
function rangeKey(ranges: ScRangeList): string {
  let key = "";
  for (const { aStart, aEnd } of ranges)
    key += `${aStart.Col()},${aStart.Row()}:${aEnd.Col()},${aEnd.Row()};`;
  return key;
}

/** Owns original per-sheet conditional formats and realizes their ordered list. */
export class CondFormatBuffer {
  private readonly formats: CondFormat[] = [];
  private readonly extFormats: {
    ranges: ScRangeList;
    rules: readonly ExtCondFormatRuleModel[];
    priorities: readonly number[];
  }[] = [];

  /** Binds the original per-sheet format buffer. @param document - Native workbook. @param tab - Destination sheet. @returns Conditional format buffer. */
  constructor(
    private readonly document: ScDocument,
    private readonly tab: number,
  ) {}

  /** Retains one extension range record for native priority merging. @param ranges - Ordered ranges. @param rules - Represented rules. @param priorities - Original priority vector before model sorting. @returns Nothing. */
  importExtCondFormat(
    ranges: ScRangeList,
    rules: readonly ExtCondFormatRuleModel[],
    priorities: readonly number[],
  ): void {
    this.extFormats.push({ ranges, rules, priorities });
  }

  /** Opens the native range record. @returns SAX context. */
  importConditionalFormatting(): FragmentContext {
    const format = new CondFormat(this.document, this.tab);
    this.formats.push(format);
    return format;
  }
  /** Finalizes represented condition rules in the original priority order. @param styles - Workbook style owner. @returns Nothing. */
  finalizeImport(styles: StylesBuffer): void {
    const ordinary = new Map<string, CondFormat>();
    for (const format of this.formats) {
      const key = rangeKey(format.GetRanges());
      if (!ordinary.has(key)) ordinary.set(key, format);
    }
    let nextPriority = 1048576;
    const separate = [];
    for (const ext of this.extFormats) {
      const base = ordinary.get(rangeKey(ext.ranges));
      if (base) {
        for (const [index, rule] of ext.rules.entries()) {
          const priority = ext.priorities[index] ?? -1;
          base.AddExtRule(rule, priority === -1 ? nextPriority++ : priority);
        }
      } else separate.push(ext);
    }
    this.formats.sort(
      /** Orders by the first rule of each group. @param a - First group. @param b - Second group. @returns Sort order. */ (
        a,
        b,
      ) => a.GetPriority() - b.GetPriority(),
    );
    for (const format of this.formats) format.finalizeImport(styles);
    if (separate.length === 0) return;
    const document = this.document;
    const tab = this.tab;
    const installed = new Map<string, ScConditionalFormat>();
    for (const existing of document.FetchTable(tab)?.GetCondFormList() ?? []) {
      const key = rangeKey(existing.GetRange());
      if (!installed.has(key)) installed.set(key, existing);
    }
    for (const { ranges, rules } of separate) {
      const identity = rangeKey(ranges);
      let format = installed.get(identity);
      const source = ranges.GetTopLeftCorner();
      if (format) {
        for (const rule of rules) AddExtEntry(format, document, source, rule);
        continue;
      }
      format = new ScConditionalFormat(0, document);
      format.SetRange(ranges);
      try {
        for (const rule of rules) AddExtEntry(format, document, source, rule);
        if (format.IsEmpty()) continue;
        const key = document.AddCondFormat(format, tab);
        if (key) {
          document.AddCondFormatData(ranges, tab, key);
          installed.set(identity, format);
        }
      } finally {
        if (!format.GetKey()) format.Dispose();
      }
    }
  }
}
