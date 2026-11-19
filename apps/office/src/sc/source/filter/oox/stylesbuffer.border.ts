/** @fileoverview Original SpreadsheetML border model and its native Calc item projection. */
import type { SaxesAttributeNS } from "saxes";
import {
  SvxBoxInfoItem,
  SvxBoxInfoItemLine,
  SvxBoxItem,
  SvxBoxItemLine,
} from "../../../../editeng/source/items/frmitems";
import { SvxLineItem } from "../../../../editeng/inc/lineitem";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Line,
} from "../../../../editeng/source/items/borderline";
import { BorderLine2 } from "../../../../offapi/com/sun/star/table/BorderLine2";
import { COL_BLACK } from "../../../../tools/inc/color";
import {
  ATTR_BORDER,
  ATTR_BORDER_INNER,
  ATTR_BORDER_TLBR,
  ATTR_BORDER_BLTR,
} from "../../../inc/scitems";
import { attribute } from "./workbookfragment";
import { ExcelGraphicHelper, XlsColor } from "./stylesbuffer.color";

const OOX_COLOR_WINDOWTEXT = 64;
const API_LINE_HAIR = 1;
const API_LINE_THIN = 15;
const API_LINE_MEDIUM = 35;
const API_LINE_THICK = 50;
const singleLines: ReadonlyMap<string, readonly [Line, number]> = new Map([
  ["dashDot", [Line.DASH_DOT, API_LINE_THIN]],
  ["dashDotDot", [Line.DASH_DOT_DOT, API_LINE_THIN]],
  ["dashed", [Line.FINE_DASHED, API_LINE_THIN]],
  ["dotted", [Line.DOTTED, API_LINE_THIN]],
  ["hair", [Line.SOLID, API_LINE_HAIR]],
  ["medium", [Line.SOLID, API_LINE_MEDIUM]],
  ["mediumDashDot", [Line.DASH_DOT, API_LINE_MEDIUM]],
  ["mediumDashDotDot", [Line.DASH_DOT_DOT, API_LINE_MEDIUM]],
  ["mediumDashed", [Line.DASHED, API_LINE_MEDIUM]],
  ["slantDashDot", [Line.FINE_DASHED, API_LINE_MEDIUM]],
  ["thick", [Line.SOLID, API_LINE_THICK]],
  ["thin", [Line.SOLID, API_LINE_THIN]],
]);

const edges = [
  ["left", SvxBoxItemLine.LEFT],
  ["right", SvxBoxItemLine.RIGHT],
  ["top", SvxBoxItemLine.TOP],
  ["bottom", SvxBoxItemLine.BOTTOM],
] as const;
const innerEdges = [
  ["vertical", SvxBoxInfoItemLine.VERT],
  ["horizontal", SvxBoxInfoItemLine.HORI],
] as const;
/** Native outer, inner and diagonal side keys after Strict side normalization. */
type BorderSide = (typeof edges)[number][0] | (typeof innerEdges)[number][0] | "diagonal";

/** Original normal border line defaults and BorderLine2 source widths. */
class BorderLineModel {
  color = new XlsColor();
  style = "none";

  /** Uses native system window text as the absent color. @returns Line model. */
  constructor() {
    this.color.setIndexed(OOX_COLOR_WINDOWTEXT);
  }

  /** Converts the original native UNO line first, then attaches the complex color to the represented item. @param helper - Workbook graphic helper. @param complex - Include the native side’s complex color. @returns Pooled line or absence. */
  convert(helper: ExcelGraphicHelper, complex: boolean): SvxBorderLine | undefined {
    const color = this.color.getColor(helper, COL_BLACK).toUInt32();
    const [style, width] = singleLines.get(this.style) ?? [Line.SOLID, 0];
    const api =
      this.style === "double"
        ? new BorderLine2(color, 10, 10, 15, Line.DOUBLE_THIN, 0)
        : new BorderLine2(color, 0, width, 0, style, 0);
    const line = new SvxBorderLine();
    if (!SvxBoxItem.LineToSvxLine(api, line, false, "BorderLine2")) return undefined;
    if (complex) line.setComplexColor(this.color.createComplexColor());
    return line;
  }
}

/** Workbook-indexed normal border imported from one original styles record. */
export class Border {
  private readonly sides = new Map<BorderSide, BorderLineModel>();
  private readonly diagTLtoBR: boolean;
  private readonly diagBLtoTR: boolean;

  /** Reads original diagonal flags and initializes all normal border side models. @param attributes - Border element attributes. @returns Indexed border. */
  constructor(attributes: readonly SaxesAttributeNS[]) {
    const down = attribute(attributes, "diagonalDown");
    const up = attribute(attributes, "diagonalUp");
    this.diagTLtoBR = down === "1" || down === "true";
    this.diagBLtoTR = up === "1" || up === "true";
    for (const [side] of [...edges, ...innerEdges]) this.sides.set(side, new BorderLineModel());
    this.sides.set("diagonal", new BorderLineModel());
  }

  /** Maps Strict start/end to the original left/right model members. @param name - Source side. @returns Original border side model. */
  private getBorderLine(name: string): BorderLineModel | undefined {
    return this.sides.get(
      (name === "start" ? "left" : name === "end" ? "right" : name) as BorderSide,
    );
  }

  /** Reads the original optional line style. @param name - Source side. @param attributes - Border side attributes. @returns Nothing. */
  importStyle(name: string, attributes: readonly SaxesAttributeNS[]): void {
    const side = this.getBorderLine(name);
    if (side) side.style = attribute(attributes, "style") || "none";
  }

  /** Reads the shared OOXML color into the original side owner. @param name - Source side. @param attributes - Color attributes. @returns Nothing. */
  importColor(name: string, attributes: readonly SaxesAttributeNS[]): void {
    const side = this.getBorderLine(name);
    if (side) side.color = XlsColor.importColor(attributes);
  }

  /** Builds the original inner and outer box items and independent diagonal items. @param helper - Workbook graphic helper. @returns Owned native item values. */
  createItems(
    helper: ExcelGraphicHelper,
  ): readonly [SvxBoxItem, SvxBoxInfoItem, SvxLineItem, SvxLineItem] {
    const outer = new SvxBoxItem(ATTR_BORDER);
    const inner = new SvxBoxInfoItem(ATTR_BORDER_INNER);
    const tlbr = new SvxLineItem(ATTR_BORDER_TLBR);
    const bltr = new SvxLineItem(ATTR_BORDER_BLTR);
    for (const [side, edge] of edges)
      outer.SetLine(this.sides.get(side)?.convert(helper, true), edge);
    for (const [side, edge] of innerEdges)
      inner.SetLine(this.sides.get(side)?.convert(helper, true), edge);
    const diagonal = this.sides.get("diagonal")?.convert(helper, false) ?? null;
    if (this.diagTLtoBR) tlbr.SetLine(diagonal);
    if (this.diagBLtoTR) bltr.SetLine(diagonal);
    return [outer, inner, tlbr, bltr];
  }
}
