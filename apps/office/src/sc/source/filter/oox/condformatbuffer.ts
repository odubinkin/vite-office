/** @fileoverview SpreadsheetML conditional cells and formula rules entering the native Calc range owner. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import type { FragmentContext } from "../../../../oox/source/core/fragmenthandler";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRange, type ScAddress } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScCondFormatEntry, ScConditionalFormat, ScConditionMode } from "../../../inc/conditio";
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
          mode && mode !== "true" && mode !== "1"
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
    if (type === "cellIs") this.mode = modes.get(attribute(attrs, "operator"));
    else if (type === "expression") this.mode = ScConditionMode.Direct;
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

/** Collects the ranges and priority-indexed rules of one conditionalFormatting element. */
class CondFormat implements FragmentContext {
  private readonly rules: CondFormatRule[] = [];
  private readonly ranges = new ScRangeList();

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
    for (const source of attribute(attrs, "sqref").trim().split(/\s+/u)) {
      const range = new ScRange();
      if (
        AddressConverter.convertToCellRangeUnchecked(range, source, this.tab, this.document) &&
        this.document.ValidColRow(range.aStart.Col(), range.aStart.Row()) &&
        this.document.ValidColRow(range.aEnd.Col(), range.aEnd.Row())
      )
        this.ranges.push_back(range);
    }
  }
  /** Completes the originally parsed range group. @returns Nothing. */
  endFastElement(): void {}
  /** Skips whitespace between individual rules. @returns Nothing. */
  characters(): void {}

  /** Returns the first valid priority used for native group order. @returns Ordering key. */
  GetPriority(): number {
    let min = Number.MAX_SAFE_INTEGER;
    for (const rule of this.rules) if (rule.priority > 0) min = Math.min(min, rule.priority);
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
      for (const priority of [...ordered.keys()].sort(
        /** Orders original rule priorities. @param a - First priority. @param b - Second priority. @returns Sort order. */ (
          a,
          b,
        ) => a - b,
      )) {
        const rule = ordered.get(priority) as CondFormatRule;
        if (rule.colorScale) {
          format.AddEntry(rule.colorScale.AddEntries(this.document, source, styles));
          continue;
        }
        if (rule.mode === undefined) continue;
        const count =
          rule.mode === ScConditionMode.Between || rule.mode === ScConditionMode.NotBetween ? 2 : 1;
        if (rule.expressions.length < count) continue;
        const expressions = rule.expressions
          .slice(0, count)
          .map(
            /** Removes source XML whitespace. @param value - Formula. @returns Formula text. */ (
              value,
            ) => value.trim(),
          );
        if (expressions.includes("")) continue;
        const defaultStyle = this.document.GetStyleSheetPool()?.GetDefaultStyle();
        const style =
          styles.dxfs[rule.dxfId]?.CreateStyle(this.document, rule.dxfId) ??
          (defaultStyle ? text(defaultStyle.GetName()) : "");
        try {
          format.AddEntry(
            new ScCondFormatEntry(rule.mode, expressions, this.document, source, grammar, style),
          );
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

/** Owns original per-sheet conditional formats and realizes their ordered list. */
export class CondFormatBuffer {
  private readonly formats: CondFormat[] = [];

  /** Opens the native range record. @param document - Workbook. @param tab - Sheet. @returns SAX context. */
  importConditionalFormatting(document: ScDocument, tab: number): FragmentContext {
    const format = new CondFormat(document, tab);
    this.formats.push(format);
    return format;
  }
  /** Finalizes represented condition rules in the original priority order. @param styles - Workbook style owner. @returns Nothing. */
  finalizeImport(styles: StylesBuffer): void {
    this.formats.sort(
      /** Orders by the first rule of each group. @param a - First group. @param b - Second group. @returns Sort order. */ (
        a,
        b,
      ) => a.GetPriority() - b.GetPriority(),
    );
    for (const format of this.formats) format.finalizeImport(styles);
  }
}
