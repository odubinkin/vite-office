/** @fileoverview Consumed Calc border property map, export ContextFilter and import finished merge from xmlstyle.cxx/xmlstyli.cxx; actual box/line items and shared XML handlers own values. */
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
  ["left", XMLToken.FO_BORDER_LEFT, XMLToken.STYLE_BORDER_LINE_WIDTH_LEFT, 2, 1],
  ["right", XMLToken.FO_BORDER_RIGHT, XMLToken.STYLE_BORDER_LINE_WIDTH_RIGHT, 3, 2],
  ["top", XMLToken.FO_BORDER_TOP, XMLToken.STYLE_BORDER_LINE_WIDTH_TOP, 0, 3],
  ["bottom", XMLToken.FO_BORDER_BOTTOM, XMLToken.STYLE_BORDER_LINE_WIDTH_BOTTOM, 1, 4],
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
/** Only consumed native border tokens are admitted; complex color/padding scopes remain explicitly unported. */
export const cellBorderTokens = [
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
  const all = parse(attributes.get(XMLToken.FO_BORDER), false, unsupported),
    allWidth = parse(attributes.get(XMLToken.STYLE_BORDER_LINE_WIDTH), true, unsupported),
    box = (pattern.GetItem(150) as SvxBoxItem).Clone();
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
/** Native ContextFilter collapses equal side values and equal width values independently. @param pattern - Actual cell pattern. @returns Original cell-property attributes. */
export function exportCellBorderProperties(pattern: ScPatternAttr): string {
  let result = "";
  if (pattern.GetItemSet().GetItemState(150, false) === SfxItemState.SET) {
    const box = pattern.GetItem(150) as SvxBoxItem,
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
