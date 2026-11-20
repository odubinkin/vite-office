/** @fileoverview SpreadsheetML conditional cells and formula rules entering the native Calc range owner. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import type { FragmentContext } from "../../../../oox/source/core/fragmenthandler";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { ScCondFormatEntry, ScConditionalFormat, ScConditionMode } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { AddressConverter } from "./addressconverter";
import { styleIndex, type StylesBuffer } from "./stylesbuffer";
import { attribute, isSpreadsheetTag } from "./workbookfragment";

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

/** Collects the represented original cfRule records. */
class CondFormatRule implements FragmentContext {
  mode: ScConditionMode | undefined;
  dxfId = -1;
  priority = -1;
  readonly expressions: string[] = [];
  private inFormula = false;

  /** Opens an operand in the current native rule. @param tag - Child token. @returns This context or an ignored subtree. */
  createFastChildContext(tag: SaxesTagNS): CondFormatRule | null {
    return isSpreadsheetTag(tag) && tag.local === "formula" ? this : null;
  }
  /** Reads the original type, priority and style attributes. @param tag - Source element. @param attrs - SpreadsheetML attributes. @returns Nothing. */
  startFastElement(tag: SaxesTagNS, attrs: readonly SaxesAttributeNS[]): void {
    if (tag.local === "formula") {
      this.expressions.push("");
      this.inFormula = true;
      return;
    }
    const type = attribute(attrs, "type");
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
