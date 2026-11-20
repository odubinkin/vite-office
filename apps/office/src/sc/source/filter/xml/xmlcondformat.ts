/** @fileoverview ODF Calc extension contexts for condition formulas and the native conditional format list. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { Converter } from "../../../../sax/source/tools/converter";
import { Color } from "../../../../tools/inc/color";
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { ScAddress, ScRefFlags } from "../../../inc/address";
import {
  ScConditionMode as Mode,
  ScCondFormatEntry,
  ScConditionalFormat,
  ScConditionalFormatList,
} from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScTable } from "../../../inc/table";
import { ScRangeStringConverter } from "../../core/tool/rangeutl";
import { ScStyleNameConversion } from "../../core/tool/stylehelper";
import { ScXMLImportContext } from "./importcontext";
import type { ScXMLImport } from "./xmlimprt";
import {
  ScColorScaleEntry,
  ScColorScaleEntryType as ScaleType,
  ScColorScaleFormat,
} from "../../../inc/colorscale";

const odf = FormulaGrammar.AddressConvention.CONV_ODF;
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
const comparisons = [
  [Mode.EqLess, "<="],
  [Mode.EqGreater, ">="],
  [Mode.NotEqual, "!="],
  [Mode.Less, "<"],
  [Mode.Equal, "="],
  [Mode.Greater, ">"],
] as const;
const functions = [
  [Mode.Between, "between", 2],
  [Mode.NotBetween, "not-between", 2],
  [Mode.Direct, "formula-is", 1],
] as const;
const scaleTypes = [
  "auto-minimum",
  "minimum",
  "maximum",
  "percentile",
  "number",
  "percent",
  "formula",
] as const;

/** Original ODF color-scale context, retaining thresholds until sheet names are available. */
class ScXMLColorScaleFormatContext extends ScXMLImportContext {
  private readonly stops: FastAttributeList[] = [];

  /** Records one threshold element in source order. @param element - Child token. @param attributes - Threshold attributes. @returns Ignored child content. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.CALCEXT_COLOR_SCALE_ENTRY) this.stops.push(attributes);
    return new SvXMLIgnoreContext(true);
  }

  /** Creates the native scale and compiles its formulas at the sheet origin. @param document - Workbook. @param tab - Sheet. @returns Owned scale. */
  Finalize(document: ScDocument, tab: number): ScColorScaleFormat {
    const scale = new ScColorScaleFormat(document);
    try {
      for (const attrs of this.stops) {
        const kind = attrs.get(XMLToken.CALCEXT_TYPE);
        const index = scaleTypes.findIndex(
          /** Selects the original threshold spelling. @param name - Stored spelling. @returns Match. */ (
            name,
          ) => name === kind,
        );
        const type =
          kind === "auto-maximum"
            ? ScaleType.AUTO
            : index === -1
              ? ScaleType.VALUE
              : (index as ScaleType);
        const source = attrs.get(XMLToken.CALCEXT_VALUE) ?? "";
        const rgb: [number] = [0],
          value: [number] = [0];
        Converter.convertColor(rgb, attrs.get(XMLToken.CALCEXT_COLOR) ?? "");
        if (source) Converter.convertDouble(value, source);
        const entry = new ScColorScaleEntry(value[0], new Color(rgb[0]), type);
        scale.AddEntry(entry);
        if (type === ScaleType.FORMULA)
          entry.SetFormula(source, document, new ScAddress(0, 0, tab), grammar);
      }
      return scale;
    } catch (error) {
      scale.Dispose();
      throw error;
    }
  }
}

/** Finds the native operand delimiter outside nested expressions and quoted constants. @param source - Both operands. @returns Separator or -1. */
function findOperandSeparator(source: string): number {
  let quote = "";
  let depth = 0;
  for (let i = 0; i < source.length; ++i) {
    const char = source[i];
    if (quote) {
      if (char === quote) quote = "";
    } else if (char === '"' || char === "'") quote = char;
    else if (char === "(" || char === "[" || char === "{") ++depth;
    else if (char === ")" || char === "]" || char === "}") --depth;
    else if (char === "," && depth === 0) return i;
  }
  return -1;
}

/** Decodes the represented original condition grammar. @param value - Value attribute. @returns Operation and formulas. */
function GetConditionData(value: string): readonly [Mode, string[]] | undefined {
  for (const [mode, operator] of comparisons)
    if (value.startsWith(operator)) return [mode, [value.slice(operator.length)]];
  for (const [mode, name, count] of functions) {
    if (!value.startsWith(name + "(") || !value.endsWith(")")) continue;
    const body = value.slice(name.length + 1, -1);
    if (count === 1) return [mode, [body]];
    const separator = findOperandSeparator(body);
    if (separator >= 0) return [mode, [body.slice(0, separator), body.slice(separator + 1)]];
  }
  return undefined;
}

/** Stores original XML until sheet names and formula name tokens are available. */
interface Condition {
  readonly mode: Mode;
  readonly formulas: string[];
  readonly source: string;
  readonly style: string;
}

/** Original conditional-formats context and deferred range binding. */
export class ScXMLConditionalFormatsContext extends ScXMLImportContext {
  private readonly formats: ScXMLConditionalFormatContext[] = [];
  /** Binds the current sheet. @param owner - Importer. @param tab - Sheet. @returns Context. */
  constructor(
    owner: ScXMLImport,
    private readonly tab: number,
  ) {
    super(owner);
  }
  /** Opens one original conditional format. @param element - Child token. @param attributes - Range attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element !== XMLToken.CALCEXT_CONDITIONAL_FORMAT) return new SvXMLIgnoreContext(true);
    const format = new ScXMLConditionalFormatContext(this.GetScImport(), attributes);
    this.formats.push(format);
    return format;
  }
  /** Queues the native rules behind sheet and name creation. @returns Nothing. */
  override endFastElement(): void {
    this.GetScImport().AddConditionalFormats(this);
  }
  /** Replaces the original sheet list and applies its indices. @returns Nothing. */
  Finalize(): void {
    const document = this.GetScImport().GetDocument();
    const table = document.FetchTable(this.tab);
    if (!table) return;
    table.SetCondFormList(new ScConditionalFormatList());
    for (const source of this.formats) source.Finalize(document, this.tab);
  }
}

/** Collects original XML rules in document order. */
class ScXMLConditionalFormatContext extends ScXMLImportContext {
  private readonly ranges: string;
  private readonly conditions: (Condition | ScXMLColorScaleFormatContext)[] = [];
  /** Adopts the XML range record. @param owner - Importer. @param attributes - Original attributes. @returns Context. */
  constructor(owner: ScXMLImport, attributes: FastAttributeList) {
    super(owner);
    this.ranges = attributes.get(XMLToken.CALCEXT_TARGET_RANGE_ADDRESS) ?? "";
  }
  /** Reads an original condition from its element attributes. @param element - Child token. @param attributes - Original attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (element === XMLToken.CALCEXT_COLOR_SCALE) {
      const scale = new ScXMLColorScaleFormatContext(this.GetScImport());
      this.conditions.push(scale);
      return scale;
    }
    if (element === XMLToken.CALCEXT_CONDITION) {
      const condition = GetConditionData(attributes.get(XMLToken.CALCEXT_VALUE) ?? "");
      if (condition)
        this.conditions.push({
          mode: condition[0],
          formulas: condition[1],
          source: attributes.get(XMLToken.CALCEXT_BASE_CELL_ADDRESS) ?? "",
          style: attributes.get(XMLToken.CALCEXT_APPLY_STYLE_NAME) ?? "",
        });
    }
    return new SvXMLIgnoreContext(true);
  }
  /** Installs the real range owner and associated conditions. @param document - Workbook. @param tab - Sheet. @returns Nothing. */
  Finalize(document: ScDocument, tab: number): void {
    if (!this.conditions.length) return;
    const ranges = new ScRangeList();
    ScRangeStringConverter.GetRangeListFromString(ranges, this.ranges, document, odf);
    if (ranges.empty()) return;
    const format = new ScConditionalFormat(0, document);
    format.SetRange(ranges);
    try {
      for (const condition of this.conditions) {
        if (condition instanceof ScXMLColorScaleFormatContext) {
          format.AddEntry(condition.Finalize(document, tab));
          continue;
        }
        const { mode, formulas, source, style } = condition;
        const address = ranges.GetTopLeftCorner();
        if (source)
          ScRangeStringConverter.GetAddressFromString(address, source, document, odf, [0]);
        const name = unicode(style);
        const display = ScStyleNameConversion.ProgrammaticToDisplayName(name, SfxStyleFamily.Para);
        try {
          format.AddEntry(
            new ScCondFormatEntry(mode, formulas, document, address, grammar, text(display)),
          );
        } finally {
          display.dispose();
          name.dispose();
        }
      }
      const key = document.AddCondFormat(format, tab);
      if (key) document.AddCondFormatData(ranges, tab, key);
    } finally {
      if (!format.GetKey()) format.Dispose();
    }
  }
}

/** Emits original conditional formulas in the native ODF grammar. @param entry - Condition and named style. @returns Serialized condition. */
function WriteCondition(entry: ScCondFormatEntry): string {
  const mode = entry.GetOperation();
  const source = entry.GetSrcPos();
  for (const [candidate, operator] of comparisons)
    if (candidate === mode) return operator + entry.GetExpression(source, 0, grammar);
  for (const [candidate, name, count] of functions) {
    if (candidate !== mode) continue;
    const first = entry.GetExpression(source, 0, grammar);
    const operands = count === 2 ? first + "," + entry.GetExpression(source, 1, grammar) : first;
    return name + "(" + operands + ")";
  }
  return "";
}

/** Emits the original Calc extension thresholds with their ODF formula grammar. @param scale - Scale rule. @returns XML fragment. */
function WriteColorScale(scale: ScColorScaleFormat): string {
  let stops = "";
  for (const entry of scale) {
    const type = entry.GetType();
    const value = type === ScaleType.FORMULA ? entry.GetFormula(grammar) : String(entry.GetValue());
    const color: [string] = [""];
    Converter.convertColor(color, entry.GetColor().toUInt32());
    stops += `<calcext:color-scale-entry calcext:value="${escapeXml(value)}" calcext:type="${scaleTypes[type]}" calcext:color="${color[0]}"/>`;
  }
  return `<calcext:color-scale>${stops}</calcext:color-scale>`;
}

/** Writes the original Calc extension from the sheet's native conditional ranges. @param document - Workbook. @param table - Sheet. @param standalone - Declare the namespace for worker XML. @returns Conditional-format XML. */
export function ExportConditionalFormat(
  document: ScDocument,
  table: ScTable,
  standalone = false,
): string {
  let groups = "";
  for (const format of table.GetCondFormList()) {
    let rules = "";
    for (let i = 0; i < format.size(); ++i) {
      const entry = format.GetEntry(i);
      if (entry instanceof ScColorScaleFormat) {
        rules += WriteColorScale(entry);
        continue;
      }
      if (!(entry instanceof ScCondFormatEntry)) continue;
      const value = WriteCondition(entry);
      if (!value) continue;
      const address = entry
        .GetSrcPos()
        .Format(ScRefFlags.VALID | ScRefFlags.TAB_3D, document, new ScAddress.Details(odf));
      const name = unicode(entry.GetStyleName());
      const programmatic = ScStyleNameConversion.DisplayToProgrammaticName(
        name,
        SfxStyleFamily.Para,
      );
      try {
        rules += `<calcext:condition calcext:apply-style-name="${escapeXml(text(programmatic))}" calcext:value="${escapeXml(value)}" calcext:base-cell-address="${escapeXml(text(address))}"/>`;
      } finally {
        programmatic.dispose();
        name.dispose();
        address.dispose();
      }
    }
    if (!rules) continue;
    const ranges = ScRangeStringConverter.GetStringFromRangeList(
      format.GetRange(),
      document,
      FormulaGrammar.AddressConvention.CONV_OOO,
    );
    groups += `<calcext:conditional-format calcext:target-range-address="${escapeXml(ranges)}">${rules}</calcext:conditional-format>`;
  }
  if (!groups) return "";
  const namespace = standalone ? ` xmlns:calcext="${ODF_NAMESPACES.calcext}"` : "";
  return `<calcext:conditional-formats${namespace}>${groups}</calcext:conditional-formats>`;
}
