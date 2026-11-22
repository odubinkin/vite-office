/** @fileoverview Consumed Calc border property map, export ContextFilter and import finished merge from xmlstyle.cxx/xmlstyli.cxx; actual box/line items and shared XML handlers own values. */
import type { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { exportComplexColor } from "../../../../xmloff/source/text/XMLComplexColorContext";
import { ATTR_BORDER, ATTR_MARGIN, ATTR_SHADOW } from "../../../inc/scitems";
import { SvxMarginItem } from "../../../../svx/source/items/algitem";
import { SvxShadowItem } from "../../../../editeng/source/items/frmitems.shadow";
import {
  ShadowFormat,
  cppu_detail_getUnoType_ShadowFormat as shadowType,
} from "../../../../offapi/com/sun/star/table/ShadowFormat";
import { XMLShadowPropHdl } from "../../../../xmloff/source/style/shadwhdl";
import { SvXMLUnitConverter } from "../../../../xmloff/source/core/xmluconv";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2 as lineType,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { XMLBorderHdl, XMLBorderWidthHdl } from "../../../../xmloff/source/style/bordrhdl";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import type { FastAttributeList } from "../../../../xmloff/source/core/xmlimp";
import { SfxItemState } from "../../../../svl/source/items/itemset";
import type { ScPatternAttr } from "../../../inc/patattr";
/** Native four side context order LEFT,RIGHT,TOP,BOTTOM and original box member ids. */
const sides = [
  [
    "left",
    XMLToken.FO_BORDER_LEFT,
    XMLToken.STYLE_BORDER_LINE_WIDTH_LEFT,
    2,
    1,
    XMLToken.LOEXT_BORDER_LEFT_COMPLEX_COLOR,
  ],
  [
    "right",
    XMLToken.FO_BORDER_RIGHT,
    XMLToken.STYLE_BORDER_LINE_WIDTH_RIGHT,
    3,
    2,
    XMLToken.LOEXT_BORDER_RIGHT_COMPLEX_COLOR,
  ],
  [
    "top",
    XMLToken.FO_BORDER_TOP,
    XMLToken.STYLE_BORDER_LINE_WIDTH_TOP,
    0,
    3,
    XMLToken.LOEXT_BORDER_TOP_COMPLEX_COLOR,
  ],
  [
    "bottom",
    XMLToken.FO_BORDER_BOTTOM,
    XMLToken.STYLE_BORDER_LINE_WIDTH_BOTTOM,
    1,
    4,
    XMLToken.LOEXT_BORDER_BOTTOM_COMPLEX_COLOR,
  ],
] as const;
/** Original independent diagonal property, deprecated width spelling and current widths spelling. */
const diagonals = [
  [
    "tl-br",
    XMLToken.STYLE_DIAGONAL_TL_BR,
    XMLToken.STYLE_DIAGONAL_TL_BR_WIDTH,
    XMLToken.STYLE_DIAGONAL_TL_BR_WIDTHS,
    141,
  ],
  [
    "bl-tr",
    XMLToken.STYLE_DIAGONAL_BL_TR,
    XMLToken.STYLE_DIAGONAL_BL_TR_WIDTH,
    XMLToken.STYLE_DIAGONAL_BL_TR_WIDTHS,
    142,
  ],
] as const;
/** Calc's padding is stored separately from the four border lines. */
const paddingSides = [
  [XMLToken.FO_PADDING_LEFT, "left", "GetLeftMargin", "SetLeftMargin"],
  [XMLToken.FO_PADDING_TOP, "top", "GetTopMargin", "SetTopMargin"],
  [XMLToken.FO_PADDING_RIGHT, "right", "GetRightMargin", "SetRightMargin"],
  [XMLToken.FO_PADDING_BOTTOM, "bottom", "GetBottomMargin", "SetBottomMargin"],
] as const;
const paddingUnits = new SvXMLUnitConverter("twip");
const shadowHandler = new XMLShadowPropHdl();

/** Native border, padding and shadow tokens consumed by this map. */
export const cellBorderTokens = [
  XMLToken.FO_PADDING,
  XMLToken.STYLE_SHADOW,
  ...paddingSides.map(
    /** Reads the native padding token. @param edge - Mapping. @returns Token. */
    ([token]) => token,
  ),
  XMLToken.FO_BORDER,
  XMLToken.STYLE_BORDER_LINE_WIDTH,
  ...sides.flatMap(
    /** Selects real shorthand/width token pair. @param side - Native map entry. @returns Pair. */ (
      side,
    ) => [side[1], side[2]],
  ),
  ...diagonals.flatMap(
    /** Selects real diagonal spellings. @param diagonal - Native map entry. @returns Tokens. */ (
      diagonal,
    ) => [diagonal[1], diagonal[2], diagonal[3]],
  ),
];
/** Original stateless shared property handlers. */
const border = new XMLBorderHdl(),
  width = new XMLBorderWidthHdl();
/** Parses one property independently before native finished merges. Invalid properties do not replace earlier/default values. @param text - Attribute or absence. @param compound - Width property. @param unsupported - Actual diagnostics. @returns Actual UNO line or absent property. */
function parse(
  text: string | null,
  compound: boolean,
  unsupported: (name: string) => void,
): BorderLine2 | undefined {
  if (text === null) return undefined;
  const target = { value: new BorderLine2() };
  if ((compound ? width : border).importXML(text, target)) return target.value;
  unsupported(compound ? "invalid cell border widths" : "invalid cell border");
  return undefined;
}
/** Original finished copies only three compound fields, retaining shorthand line style and total width. @param value - Shorthand. @param compound - Selected width property. @returns Merged actual value. */
function merge(value: BorderLine2, compound: BorderLine2 | undefined): BorderLine2 {
  const result = new BorderLine2(value);
  if (compound) {
    result.InnerLineWidth = compound.InnerLineWidth;
    result.OuterLineWidth = compound.OuterLineWidth;
    result.LineDistance = compound.LineDistance;
  }
  return result;
}
/** Native general-border fallback and per-side precedence are independent of SAX attribute order. Outer width-only properties are consumed;unmerged diagonal widths retain the original property application path. @param pattern - Actual destination. @param attributes - Actual SAX properties. @param unsupported - Existing diagnostic sink. @returns Nothing. */
export function importCellBorderProperties(
  pattern: ScPatternAttr,
  attributes: FastAttributeList,
  unsupported: (name: string) => void,
): void {
  const commonPadding = attributes.get(XMLToken.FO_PADDING);
  const margin = (pattern.GetItem(ATTR_MARGIN) as SvxMarginItem).Clone();
  let changedPadding = false;
  for (const [token, , , setter] of paddingSides) {
    const source = attributes.get(token) ?? commonPadding;
    if (source === null) continue;
    const amount = paddingUnits.convertMeasureToCore(source);
    if (amount === null) unsupported("invalid cell padding");
    else {
      margin[setter](amount);
      changedPadding = true;
    }
  }
  if (changedPadding) pattern.ItemSetPut(margin);
  margin.Dispose();
  const shadowSource = attributes.get(XMLToken.STYLE_SHADOW);
  if (shadowSource !== null) {
    const native = shadowHandler.importXML(shadowSource);
    if (native) {
      const value = new Any(),
        shadow = new SvxShadowItem(ATTR_SHADOW);
      try {
        value.insert(native, shadowType);
        if (shadow.PutValue(value, 0x80)) pattern.ItemSetPut(shadow);
      } finally {
        value.dispose();
        shadow.Dispose();
      }
    } else unsupported("invalid cell shadow");
  }
  const all = parse(attributes.get(XMLToken.FO_BORDER), false, unsupported),
    allWidth = parse(attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH), true, unsupported),
    box = (pattern.GetItem(ATTR_BORDER) as SvxBoxItem).Clone();
  let changed = false;
  for (const [, token, widthToken, , member] of sides) {
    const value = parse(attributes.get(token), false, unsupported) ?? all,
      compound = parse(attributes.get(widthToken), true, unsupported) ?? allWidth;
    if (value) {
      box.PutValue(merge(value, compound), member | 0x80);
      changed = true;
    }
  }
  if (changed) pattern.ItemSetPut(box);
  for (const [, token, oldWidthToken, widthToken, which] of diagonals) {
    const value = parse(attributes.get(token), false, unsupported),
      oldWidth = parse(attributes.get(oldWidthToken), true, unsupported),
      newWidth = parse(attributes.get(widthToken), true, unsupported);
    let selected = value ? merge(value, newWidth ?? oldWidth) : undefined;
    if (!value)
      for (const [attribute] of attributes) {
        if (attribute === oldWidthToken && oldWidth) selected = oldWidth;
        if (attribute === widthToken && newWidth) selected = newWidth;
      }
    if (!selected) continue;
    const item = (pattern.GetItem(which) as SvxLineItem).Clone(),
      any = new Any();
    try {
      any.insert(selected, lineType);
      item.PutValue(any, 0x80);
      pattern.ItemSetPut(item);
    } finally {
      any.dispose();
    }
  }
}
/** Emits original shorthand/compound attributes; native double widths are separate and absent for single lines. @param name - Native attribute name. @param widthName - Native width name. @param line - Published MM100 value. @returns XML attributes. */
function emit(name: string, widthName: string, line: BorderLine2): string {
  const compound = width.exportXML(line);
  return ` ${name}="${border.exportXML(line)}"${compound === undefined ? "" : ` ${widthName}="${compound}"`}`;
}
/** Applies the original shared cell and page border state coalescing. @param box - Native box. @returns Border and compound width attributes. */
function exportBoxLineProperties(box: SvxBoxItem): string {
  let result = "";
  const lines = sides.map(
      /** Reads real native UNO edge value. @param side - Original map entry. @returns Published line. */ (
        side,
      ) => SvxBoxItem.SvxLineToLine(box.GetLine(side[3]), true),
    ),
    first = lines[0] as BorderLine2,
    same = lines.every(
      /** Compares all original BorderLine2 fields. @param line - Side. @returns Equal. */ (line) =>
        first.equals(line),
    ),
    sameWidths = lines.every(
      /** ContextFilter compares components and total width independently of style/color. @param line - Side. @returns Equal widths. */ (
        line,
      ) =>
        line.InnerLineWidth === first.InnerLineWidth &&
        line.OuterLineWidth === first.OuterLineWidth &&
        line.LineDistance === first.LineDistance &&
        line.LineWidth === first.LineWidth,
    );
  if (same) result += ` fo:border="${border.exportXML(first)}"`;
  else
    for (const [index, side] of sides.entries())
      result += ` fo:border-${side[0]}="${border.exportXML(lines[index] as BorderLine2)}"`;
  if (sameWidths) {
    const compound = width.exportXML(first);
    if (compound !== undefined) result += ` style:border-line-width="${compound}"`;
  } else
    for (const [index, side] of sides.entries()) {
      const compound = width.exportXML(lines[index] as BorderLine2);
      if (compound !== undefined) result += ` style:border-line-width-${side[0]}="${compound}"`;
    }
  return result;
}

/** Native ContextFilter collapses equal side values and equal width values independently. @param pattern - Actual cell pattern. @returns Original cell-property attributes. */
export function exportCellBorderProperties(pattern: ScPatternAttr): string {
  let result = "";
  const items = pattern.GetItemSet();
  if (items.GetItemState(ATTR_MARGIN, false) === SfxItemState.SET) {
    const margin = pattern.GetItem(ATTR_MARGIN) as SvxMarginItem;
    const common = margin.GetLeftMargin();
    const uniform = paddingSides.every(
      /** Tests whether the four sides use one native padding value. @param mapping - Source padding side. @returns Whether equal. */
      ([, , getter]) => margin[getter]() === common,
    );
    if (uniform) result += ` fo:padding="${paddingUnits.convertMeasureToXML(common)}"`;
    else
      for (const [, name, getter] of paddingSides)
        result += ` fo:padding-${name}="${paddingUnits.convertMeasureToXML(margin[getter]())}"`;
  }
  if (items.GetItemState(ATTR_SHADOW, false) === SfxItemState.SET) {
    const value = new Any();
    try {
      (pattern.GetItem(ATTR_SHADOW) as SvxShadowItem).QueryValue(value, 0x80);
      const native = new ShadowFormat();
      if (value.extract(native, shadowType))
        result += ` style:shadow="${shadowHandler.exportXML(native)}"`;
    } finally {
      value.dispose();
    }
  }
  if (pattern.GetItemSet().GetItemState(ATTR_BORDER, false) === SfxItemState.SET) {
    const box = pattern.GetItem(ATTR_BORDER) as SvxBoxItem,
      lines = sides.map(
        /** Reads real native UNO edge value. @param side - Original map entry. @returns Published line. */ (
          side,
        ) => SvxBoxItem.SvxLineToLine(box.GetLine(side[3]), true),
      ),
      first = lines[0] as BorderLine2,
      same = lines.every(
        /** Compares all original BorderLine2 fields. @param line - Side. @returns Equal. */ (
          line,
        ) => first.equals(line),
      ),
      sameWidths = lines.every(
        /** ContextFilter compares components and total width independently of style/color. @param line - Side. @returns Equal widths. */ (
          line,
        ) =>
          line.InnerLineWidth === first.InnerLineWidth &&
          line.OuterLineWidth === first.OuterLineWidth &&
          line.LineDistance === first.LineDistance &&
          line.LineWidth === first.LineWidth,
      );
    if (same) result += ` fo:border="${border.exportXML(first)}"`;
    else
      for (const [index, side] of sides.entries())
        result += ` fo:border-${side[0]}="${border.exportXML(lines[index] as BorderLine2)}"`;
    if (sameWidths) {
      const compound = width.exportXML(first);
      if (compound !== undefined) result += ` style:border-line-width="${compound}"`;
    } else
      for (const [index, side] of sides.entries()) {
        const compound = width.exportXML(lines[index] as BorderLine2);
        if (compound !== undefined) result += ` style:border-line-width-${side[0]}="${compound}"`;
      }
  }
  for (const [suffix, , , , which] of diagonals) {
    if (pattern.GetItemSet().GetItemState(which, false) !== SfxItemState.SET) continue;
    const item = pattern.GetItem(which) as SvxLineItem,
      any = new Any(),
      line = new BorderLine2();
    try {
      item.QueryValue(any, 0x80);
      any.extract(line, lineType);
      result += emit(`style:diagonal-${suffix}`, `style:diagonal-${suffix}-widths`, line);
    } finally {
      any.dispose();
    }
  }
  return result;
}

/** Connects the four original element-valued ODF properties to the existing pooled side lines. @param pattern - Destination cell style. @returns Native element handlers. */
export function cellBorderColorHandlers(
  pattern: ScPatternAttr,
): Map<XMLToken, (color: ComplexColor) => void> {
  const handlers = new Map<XMLToken, (color: ComplexColor) => void>();
  for (const [, , , edge, , token] of sides) {
    handlers.set(
      token,
      /** Applies the actual side color without replacing dimensions or RGB. @param color - Imported color metadata. @returns Nothing. */
      (color) => {
        const box = (pattern.GetItem(ATTR_BORDER) as SvxBoxItem).Clone();
        const line = box.GetLine(edge);
        if (!line) return;
        line.setComplexColor(color);
        pattern.ItemSetPut(box);
      },
    );
  }
  return handlers;
}

/** Emits native border color metadata next to the resolved ODF shorthand properties. @param pattern - Actual cell style. @returns ODF property children. */
export function exportCellBorderColors(pattern: ScPatternAttr): string {
  const box = pattern.GetItemSet().GetItemIfSet(ATTR_BORDER, false) as SvxBoxItem | undefined;
  if (!box) return "";
  let xml = "";
  for (const [side, , , edge] of sides) {
    const line = box.GetLine(edge);
    if (line) xml += exportComplexColor(line.getComplexColor(), `border-${side}-complex-color`);
  }
  return xml;
}

/** Imports page-edge border and padding properties via the same native handlers. @param box - Actual page box. @param properties - ODF page attributes. @param measure - Native twip length converter. @returns Whether any value changed. */
export function importPageBoxProperties(
  box: SvxBoxItem,
  properties: ReadonlyMap<XMLToken, string>,
  measure: (value: string) => number | null,
): boolean {
  const paddings = [
    XMLToken.FO_PADDING_LEFT,
    XMLToken.FO_PADDING_RIGHT,
    XMLToken.FO_PADDING_TOP,
    XMLToken.FO_PADDING_BOTTOM,
  ];
  const commonLine = properties.get(XMLToken.FO_BORDER);
  const commonWidths = properties.get(XMLToken.STYLE_BORDER_LINE_WIDTH);
  const commonPadding = properties.get(XMLToken.FO_PADDING);
  let changed = false;
  for (const [index, [, token, widthToken, edge, member]] of sides.entries()) {
    const line = properties.get(token) ?? commonLine;
    const widths = properties.get(widthToken) ?? commonWidths;
    const value = { value: new BorderLine2() };
    if (line !== undefined && border.importXML(line, value)) {
      if (widths !== undefined) width.importXML(widths, value);
      box.PutValue(value.value, member | 0x80);
      changed = true;
    }
    const distance = properties.get(paddings[index] as XMLToken) ?? commonPadding;
    const amount = distance === undefined ? null : measure(distance);
    if (amount !== null) {
      box.SetDistance(amount, edge);
      changed = true;
    }
  }
  return changed;
}

/** Writes the four page-edge border and padding properties. @param box - Actual style box. @param measure - Native ODF length converter. @returns XML properties. */
export function exportPageBoxProperties(
  box: SvxBoxItem,
  measure: (value: number) => string,
): string {
  let result = exportBoxLineProperties(box);
  const first = box.GetDistance(sides[0][3], true);
  const equal = sides.every(
    /** Compares all four native distance properties independently of the lines. @param side - Box side. @returns Whether the distances match. */
    (side) => box.GetDistance(side[3], true) === first,
  );
  if (equal) result += ` fo:padding="${measure(first)}"`;
  else
    for (const [name, , , edge] of sides)
      result += ` fo:padding-${name}="${measure(box.GetDistance(edge, true))}"`;
  return result;
}
