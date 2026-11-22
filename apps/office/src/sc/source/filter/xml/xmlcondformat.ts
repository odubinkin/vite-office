/** @fileoverview ODF Calc extension contexts for condition formulas and the native conditional format list. */
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { rtl_math_uStringToDouble } from "../../../../sal/inc/rtl/math.h";
import { rtl_str_toBoolean } from "../../../../sal/inc/rtl/string.h";
import { getCellStyleXMLName } from "./xmlstyle";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import { Converter } from "../../../../sax/source/tools/converter";
import { COL_LIGHTRED, Color, ColorTransparency } from "../../../../tools/inc/color";
import {
  SvXMLIgnoreContext,
  type FastAttributeList,
  type SvXMLImportContext,
} from "../../../../xmloff/source/core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../../../../xmloff/source/core/xmltoken";
import { escapeXml } from "../../../../xmloff/source/text/txtparae";
import { ScAddress, ScRefFlags } from "../../../inc/address";
import {
  ScCondDateFormatEntry,
  ScCondFormatDateType,
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
import { ScXMLConditionHelper } from "./XMLConverter";
import {
  ScColorScaleEntry,
  ScColorScaleEntryType as ScaleType,
  ScColorScaleFormat,
  ScAxisPosition,
  ScDataBarFormat,
  ScIconSetFormat,
} from "../../../inc/colorscale";

const odf = FormulaGrammar.AddressConvention.CONV_ODF;
const grammar = FormulaGrammar.Grammar.GRAM_ODFF;
const dateTypes: readonly string[] = [
  "today",
  "yesterday",
  "tomorrow",
  "last-7-days",
  "this-week",
  "last-week",
  "next-week",
  "this-month",
  "last-month",
  "next-month",
  "last-year",
  "this-year",
  "next-year",
];
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
  [Mode.Top10, "top-elements", 1],
  [Mode.Bottom10, "bottom-elements", 1],
  [Mode.TopPercent, "top-percent", 1],
  [Mode.BottomPercent, "bottom-percent", 1],
  [Mode.BeginsWith, "begins-with", 1],
  [Mode.EndsWith, "ends-with", 1],
  [Mode.ContainsText, "contains-text", 1],
  [Mode.NotContainsText, "not-contains-text", 1],
] as const;
const predicates = [
  [Mode.NotDuplicate, "unique"],
  [Mode.Duplicate, "duplicate"],
  [Mode.AboveAverage, "above-average"],
  [Mode.BelowAverage, "below-average"],
  [Mode.AboveEqualAverage, "above-equal-average"],
  [Mode.BelowEqualAverage, "below-equal-average"],
  [Mode.Error, "is-error"],
  [Mode.NoError, "is-no-error"],
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

/** Reads the native threshold value and builds a formula at the containing sheet's origin. @param attrs - Source attributes. @param document - Workbook. @param tab - Containing sheet. @param color - Threshold color. @param mode - Native threshold comparison. @returns Owned threshold. */
function readScaleEntry(
  attrs: FastAttributeList,
  document: ScDocument,
  tab: number,
  color: Color,
  mode = Mode.EqGreater,
): ScColorScaleEntry {
  const kind = attrs.get(XMLToken.CALCEXT_TYPE);
  const index = scaleTypes.findIndex(
    /** Resolves a native threshold spelling. @param name - Type name. @returns Match. */
    (name) => name === kind,
  );
  const type = kind === "auto-maximum" ? ScaleType.AUTO : index === -1 ? ScaleType.VALUE : index;
  const source = attrs.get(XMLToken.CALCEXT_VALUE) ?? "";
  const value: [number] = [0];
  if (source) Converter.convertDouble(value, source);
  const entry = new ScColorScaleEntry(value[0], color, type, mode);
  if (type === ScaleType.FORMULA)
    entry.SetFormula(source, document, new ScAddress(0, 0, tab), grammar);
  return entry;
}

/** Reads the original formatting entry shared by data bars and icon sets. @param attributes - XML threshold. @param document - Workbook. @param tab - Containing sheet. @returns Owned threshold. */
function readFormattingEntry(
  attributes: FastAttributeList,
  document: ScDocument,
  tab: number,
): ScColorScaleEntry {
  const equal = attributes.get(XMLToken.CALCEXT_GREATER_EQUAL);
  const mode =
    equal === null || rtl_str_toBoolean(new TextEncoder().encode(equal + "\0"))
      ? Mode.EqGreater
      : Mode.Greater;
  return readScaleEntry(attributes, document, tab, new Color(), mode);
}

/** Reads a native RGB attribute with the initial default color. @param source - XML color. @returns Color. */
function readColor(source: string): Color {
  const rgb: [number] = [0];
  Converter.convertColor(rgb, source);
  return new Color(ColorTransparency, rgb[0], "ColorTransparencyTag");
}

/** Reads the original OUString::toDouble length with no grouping separator. @param source - XML length. @returns Native value. */
function readLength(source: string): number {
  const value = unicode(source);
  try {
    return rtl_math_uStringToDouble(value.getStr(), value.getLength(), 46, 0);
  } finally {
    value.dispose();
  }
}

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
      for (const attrs of this.stops)
        scale.AddEntry(
          readScaleEntry(attrs, document, tab, readColor(attrs.get(XMLToken.CALCEXT_COLOR) ?? "")),
        );
      return scale;
    } catch (error) {
      scale.Dispose();
      throw error;
    }
  }
}

/** Native data-bar context with the current and legacy threshold element spellings. */
class ScXMLDataBarFormatContext extends ScXMLImportContext {
  private readonly limits: FastAttributeList[] = [];

  /** Retains the ODF attributes until formula compilation has a complete document. @param owner - Importer. @param attributes - Native rule attributes. */
  constructor(
    owner: ScXMLImport,
    private readonly attributes: FastAttributeList,
  ) {
    super(owner);
  }

  /** Collects the lower and upper thresholds in source order. @param token - Child element. @param attributes - Native threshold attributes. @returns Ignored child content. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (
      (token === XMLToken.CALCEXT_FORMATTING_ENTRY || token === XMLToken.CALCEXT_DATA_BAR_ENTRY) &&
      this.limits.length < 2
    )
      this.limits.push(attributes);
    return new SvXMLIgnoreContext(true);
  }

  /** Creates an owned data-bar rule from the native settings and limits. @param document - Workbook. @param tab - Containing sheet. @returns Owned data bar. */
  Finalize(document: ScDocument, tab: number): ScDataBarFormat {
    const rule = new ScDataBarFormat(document);
    const data = rule.GetDataBarData();
    const attributes = this.attributes;
    const negative = attributes.get(XMLToken.CALCEXT_NEGATIVE_COLOR);
    const gradient = attributes.get(XMLToken.CALCEXT_GRADIENT);
    const showValue = attributes.get(XMLToken.CALCEXT_SHOW_VALUE);
    const axis = attributes.get(XMLToken.CALCEXT_AXIS_POSITION);
    data.maPositiveColor = readColor(attributes.get(XMLToken.CALCEXT_POSITIVE_COLOR) ?? "");
    data.maAxisColor = readColor(attributes.get(XMLToken.CALCEXT_AXIS_COLOR) ?? "");
    data.mbNeg = Boolean(negative);
    if (negative) data.mxNegativeColor = readColor(negative);
    if (gradient) data.mbGradient = gradient === "true";
    if (showValue) data.mbOnlyBar = showValue !== "true";
    if (axis === "middle") data.meAxisPosition = ScAxisPosition.MIDDLE;
    else if (axis === "none") data.meAxisPosition = ScAxisPosition.NONE;
    data.mnMinLength = readLength(attributes.get(XMLToken.CALCEXT_MIN_LENGTH) ?? "");
    const max = readLength(attributes.get(XMLToken.CALCEXT_MAX_LENGTH) ?? "");
    data.mnMaxLength = max === 0 ? 100 : max;
    try {
      const [lower, upper] = this.limits;
      if (lower) data.mpLowerLimit = readFormattingEntry(lower, document, tab);
      if (upper) data.mpUpperLimit = readFormattingEntry(upper, document, tab);
      return rule;
    } catch (error) {
      rule.Dispose();
      throw error;
    }
  }
}

/** Native icon-set context with its ordered formatting entries. */
class ScXMLIconSetFormatContext extends ScXMLImportContext {
  private readonly entries: FastAttributeList[] = [];
  /** Retains icon-set attributes until threshold formulas can be compiled. @param owner - Importer. @param attributes - Rule attributes. */
  constructor(
    owner: ScXMLImport,
    private readonly attributes: FastAttributeList,
  ) {
    super(owner);
  }

  /** Reads the original icon-set threshold children. @param token - Child. @param attributes - Threshold attributes. @returns Child context. */
  override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext {
    if (token === XMLToken.CALCEXT_FORMATTING_ENTRY) this.entries.push(attributes);
    return new SvXMLIgnoreContext(true);
  }

  /** Adopts the native icon-set settings and bound thresholds. @param document - Workbook. @param tab - Containing sheet. @returns Owned rule. */
  Finalize(document: ScDocument, tab: number): ScIconSetFormat {
    const rule = new ScIconSetFormat(document);
    const data = rule.GetIconSetData();
    data.eIconSetType = ScIconSetFormat.getIconSetType(
      this.attributes.get(XMLToken.CALCEXT_ICON_SET_TYPE) ?? "",
    );
    const showValue = this.attributes.get(XMLToken.CALCEXT_SHOW_VALUE);
    if (showValue) {
      const visible: [boolean] = [true];
      Converter.convertBool(visible, showValue);
      data.mbShowValue = !visible[0];
    }
    try {
      for (const entry of this.entries)
        data.m_Entries.push(readFormattingEntry(entry, document, tab));
      return rule;
    } catch (error) {
      rule.Dispose();
      throw error;
    }
  }
}

/** Decodes the represented original condition grammar. @param value - Value attribute. @returns Operation and formulas. */
function GetConditionData(value: string): readonly [Mode, string[]] | undefined {
  for (const [mode, operator] of comparisons)
    if (value.startsWith(operator)) return [mode, [value.slice(operator.length)]];
  for (const [mode, name] of predicates) if (value.startsWith(name)) return [mode, []];
  for (const [mode, name, count] of functions) {
    if (!value.startsWith(name)) continue;
    const position: [number] = [name.length + 1];
    const first = ScXMLConditionHelper.getExpression(value, position, count === 1 ? ")" : ",");
    if (count === 1) return [mode, [first]];
    return [mode, [first, ScXMLConditionHelper.getExpression(value, position, ")")]];
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

/** Native date condition attributes before sheet insertion. */
interface DateCondition {
  readonly date: ScCondFormatDateType;
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
    owner.SetNewCondFormatData(tab);
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
  private readonly conditions: (
    | Condition
    | DateCondition
    | ScXMLColorScaleFormatContext
    | ScXMLDataBarFormatContext
    | ScXMLIconSetFormatContext
  )[] = [];
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
    if (element === XMLToken.CALCEXT_DATA_BAR) {
      const bar = new ScXMLDataBarFormatContext(this.GetScImport(), attributes);
      this.conditions.push(bar);
      return bar;
    }
    if (element === XMLToken.CALCEXT_ICON_SET) {
      const icons = new ScXMLIconSetFormatContext(this.GetScImport(), attributes);
      this.conditions.push(icons);
      return icons;
    }
    if (element === XMLToken.CALCEXT_DATE_IS) {
      const value = dateTypes.indexOf(attributes.get(XMLToken.CALCEXT_DATE) ?? "");
      this.conditions.push({
        date: value < 0 ? ScCondFormatDateType.TODAY : value,
        style: attributes.get(XMLToken.CALCEXT_STYLE) ?? "",
      });
    } else if (element === XMLToken.CALCEXT_CONDITION) {
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
        if (
          condition instanceof ScXMLColorScaleFormatContext ||
          condition instanceof ScXMLDataBarFormatContext ||
          condition instanceof ScXMLIconSetFormatContext
        ) {
          format.AddEntry(condition.Finalize(document, tab));
          continue;
        }
        const name = unicode(condition.style);
        const named = this.GetScImport().GetNamedCellStyle(condition.style);
        const display = named
          ? new OUString(named.GetName())
          : ScStyleNameConversion.ProgrammaticToDisplayName(name, SfxStyleFamily.Para);
        try {
          if ("date" in condition) {
            const entry = new ScCondDateFormatEntry(document);
            entry.SetStyleName(display);
            entry.SetDateType(condition.date);
            format.AddEntry(entry);
          } else {
            const { mode, formulas, source } = condition;
            const address = ranges.GetTopLeftCorner();
            if (source)
              ScRangeStringConverter.GetAddressFromString(address, source, document, odf, [0]);
            format.AddEntry(
              new ScCondFormatEntry(mode, formulas, document, address, grammar, text(display)),
            );
          }
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
  for (const [candidate, name] of predicates) if (candidate === mode) return name;
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
  for (const entry of scale)
    stops += `<calcext:color-scale-entry${writeScaleEntry(entry)} calcext:color="${writeColor(entry.GetColor())}"/>`;
  return `<calcext:color-scale>${stops}</calcext:color-scale>`;
}

/** Formats a native numeric attribute with the OUString double overload. @param number - Native value. @returns XML number. */
function writeNumber(number: number): string {
  const value = OUString.numberDouble(number);
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Serializes a native threshold, including the upper automatic spelling. @param entry - Threshold. @param first - Whether this is the lower endpoint. @param writeComparison - Whether this rule emits the mode. @returns Threshold attributes. */
function writeScaleEntry(entry: ScColorScaleEntry, first = true, writeComparison = false): string {
  const type = entry.GetType();
  const value =
    type === ScaleType.FORMULA ? entry.GetFormula(grammar) : writeNumber(entry.GetValue());
  const kind = type === ScaleType.AUTO && !first ? "auto-maximum" : scaleTypes[type];
  const equal =
    writeComparison && entry.GetMode() !== Mode.EqGreater ? ' calcext:greater_equal="false"' : "";
  return ` calcext:value="${escapeXml(value)}"${equal} calcext:type="${kind}"`;
}

/** Formats an XML RGB attribute using the native color converter. @param color - Color. @returns XML color. */
function writeColor(color: Readonly<Color>): string {
  const result: [string] = [""];
  Converter.convertColor(result, color.toUInt32());
  return result[0];
}

/** Writes the data-bar settings with the native defaults and the two ordered formatting entries. @param bar - Rule. @returns XML fragment. */
function WriteDataBar(bar: ScDataBarFormat): string {
  const data = bar.GetDataBarData();
  let attributes = "";
  if (!data.mbGradient) attributes += ' calcext:gradient="false"';
  if (data.mbOnlyBar) attributes += ' calcext:show-value="false"';
  if (data.mnMinLength !== 0)
    attributes += ` calcext:min-length="${writeNumber(data.mnMinLength)}"`;
  if (data.mnMaxLength !== 0)
    attributes += ` calcext:max-length="${writeNumber(data.mnMaxLength)}"`;
  if (data.mbNeg)
    attributes += ` calcext:negative-color="${writeColor(data.mxNegativeColor ?? COL_LIGHTRED)}"`;
  if (data.meAxisPosition !== ScAxisPosition.AUTOMATIC)
    attributes += ` calcext:axis-position="${data.meAxisPosition === ScAxisPosition.NONE ? "none" : "middle"}"`;
  attributes += ` calcext:positive-color="${writeColor(data.maPositiveColor)}" calcext:axis-color="${writeColor(data.maAxisColor)}"`;
  return `<calcext:data-bar${attributes}><calcext:formatting-entry${writeScaleEntry(data.mpLowerLimit)}/><calcext:formatting-entry${writeScaleEntry(data.mpUpperLimit, false)}/></calcext:data-bar>`;
}

/** Writes native icon-set XML with the original nested visibility attribute placement. @param icons - Rule. @returns XML fragment. */
function WriteIconSet(icons: ScIconSetFormat): string {
  const data = icons.GetIconSetData();
  const name = ScIconSetFormat.getIconSetName(data.eIconSetType);
  const custom = data.mbCustom ? ' calcext:custom="true"' : "";
  let children = "";
  if (data.mbCustom)
    for (const [type, index] of data.maCustomVector)
      children += `<calcext:custom-iconset calcext:custom-iconset-name="${ScIconSetFormat.getIconSetName(type)}" calcext:custom-iconset-index="${index}"/>`;
  let visibility = data.mbShowValue ? "" : ' calcext:show-value="false"';
  for (const entry of icons) {
    children += `<calcext:formatting-entry${visibility}${writeScaleEntry(entry, true, true)}/>`;
    visibility = "";
  }
  return `<calcext:icon-set calcext:icon-set-type="${name}"${custom}>${children}</calcext:icon-set>`;
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
      if (entry instanceof ScDataBarFormat) {
        rules += WriteDataBar(entry);
        continue;
      }
      if (entry instanceof ScIconSetFormat) {
        rules += WriteIconSet(entry);
        continue;
      }
      if (entry instanceof ScCondDateFormatEntry) {
        const name = getCellStyleXMLName(entry.GetStyleName());
        rules += `<calcext:date-is calcext:style="${escapeXml(name)}" calcext:date="${dateTypes[entry.GetDateType()] ?? ""}"/>`;
        continue;
      }
      if (!(entry instanceof ScCondFormatEntry)) continue;
      const value = WriteCondition(entry);
      if (!value) continue;
      const address = entry
        .GetSrcPos()
        .Format(ScRefFlags.VALID | ScRefFlags.TAB_3D, document, new ScAddress.Details(odf));
      const name = unicode(entry.GetStyleName());
      try {
        const styleName = getCellStyleXMLName(name);
        rules += `<calcext:condition calcext:apply-style-name="${escapeXml(styleName)}" calcext:value="${escapeXml(value)}" calcext:base-cell-address="${escapeXml(text(address))}"/>`;
      } finally {
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
