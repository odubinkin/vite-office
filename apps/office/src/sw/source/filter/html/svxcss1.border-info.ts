/** @fileoverview Original SvxCSS1BorderInfo value and SetBorderLine from svxcss1.cxx over actual editeng line and box owners. */
import { Color, COL_BLACK } from "../../../../tools/inc/color";
import {
  SvxBorderLine,
  SvxBorderLineStyle as L,
  SvxBorderLineWidth,
} from "../../../../editeng/source/items/borderline";
import { type SvxBoxItem, type SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
/** Original file-local CSS1BorderStyle numeric order. */
export enum CSS1BorderStyle {
  NONE,
  SINGLE,
  DOUBLE,
  DOTTED,
  DASHED,
  GROOVE,
  RIDGE,
  INSET,
  OUTSET,
}
/** Native border-info component masks. */
export const SVX_CSS1_BORDERINFO_WIDTH = 1,
  SVX_CSS1_BORDERINFO_COLOR = 2,
  SVX_CSS1_BORDERINFO_STYLE = 4;
const aBorderWidths = [
  SvxBorderLineWidth.Hairline,
  SvxBorderLineWidth.VeryThin,
  SvxBorderLineWidth.Thin,
];
const aStyles = [
  L.NONE,
  L.SOLID,
  L.DOUBLE,
  L.DOTTED,
  L.DASHED,
  L.ENGRAVED,
  L.EMBOSSED,
  L.INSET,
  L.OUTSET,
];
/** Original independent pending side value; copy construction owns its Color. */
export class SvxCSS1BorderInfo {
  readonly aColor = new Color(COL_BLACK);
  nAbsWidth = 0xffff;
  nNamedWidth = 0xffff;
  eStyle = CSS1BorderStyle.NONE;
  /** Copies the native value without sharing a mutable Color. @param source - Optional source. @returns Pending side. */
  constructor(source?: SvxCSS1BorderInfo) {
    if (source) {
      this.aColor.assign(source.aColor);
      this.nAbsWidth = source.nAbsWidth;
      this.nNamedWidth = source.nNamedWidth;
      this.eStyle = source.eStyle;
    }
  }
  /** Original pending-to-box conversion, including explicit no-line states and named widths. @param edge - Native edge. @param box - Actual mutable box. @returns Nothing. */
  SetBorderLine(edge: SvxBoxItemLine, box: SvxBoxItem): void {
    if (
      this.eStyle === CSS1BorderStyle.NONE ||
      this.nAbsWidth === 0 ||
      (this.nAbsWidth === 0xffff && this.nNamedWidth === 0xffff)
    ) {
      box.SetLine(undefined, edge);
      return;
    }
    const line = new SvxBorderLine(this.aColor);
    line.SetBorderLineStyle(aStyles[this.eStyle] ?? L.NONE);
    const width = this.nAbsWidth === 0xffff ? aBorderWidths[this.nNamedWidth] : this.nAbsWidth;
    if (width === undefined) throw new Error("assert(native named border width)");
    line.SetWidth(width);
    box.SetLine(line, edge);
  }
}
