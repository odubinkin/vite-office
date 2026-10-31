/** @fileoverview Original HTMLTableOptions fields, reverse option parsing and final border/column normalization from htmltab.cxx. */
import { HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { HTMLTableFrame as F, HTMLTableRules as R } from "../../../../svtools/inc/parhtml";
import type { HTMLOption } from "../../../../svtools/source/svhtml/parhtml.options";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { Color, COL_GRAY } from "../../../../tools/inc/color";
import { htmlAsciiLower } from "../../../../svtools/source/svhtml/htmlkywd";
import { aHTMLPAlignTable } from "./swhtml.options";

/** Original top means NONE, rather than the separate TOP orientation value. */
export const aHTMLTableVAlignTable: readonly (readonly [string, number])[] = [
  ["top", V.NONE],
  ["middle", V.CENTER],
  ["bottom", V.BOTTOM],
];
/** Original table-tag options own mutable source fields; no table geometry, document or DOM is fabricated at this parse boundary. */
export class HTMLTableOptions {
  nCols = 0;
  nWidth = 0;
  nHeight = 0;
  nCellPadding = 0xffff;
  nCellSpacing = 0xffff;
  nBorder = 0xffff;
  nHSpace = 0;
  nVSpace = 0;
  eAdjust: SvxAdjust;
  eVertOri: number = V.CENTER;
  eFrame = F.Void;
  eRules = R.NONE;
  bPercentWidth = false;
  bTableAdjust = false;
  bBGColor = false;
  aBorderColor = new Color(COL_GRAY);
  aBGColor = new Color();
  aBGImage = "";
  aStyle = "";
  aId = "";
  aClass = "";
  aDir = "";
  /** Original constructor consumes options in reverse order, with explicit frame/rules/color precedence and uint16 narrowing before percent checks. @param options - Actual native lexer options. @param parentAdjust - Source parent adjustment. @returns Native options. */
  constructor(options: readonly HTMLOption[], parentAdjust: SvxAdjust) {
    this.eAdjust = parentAdjust;
    let borderColor = false,
      hasFrame = false,
      hasRules = false;
    for (let index = options.length; index;) {
      const option = options[--index];
      if (!option) throw new Error("assert(native HTML option index)");
      switch (option.GetToken()) {
        case O.ID:
          this.aId = option.GetString();
          break;
        case O.COLS:
          this.nCols = option.GetNumber() & 0xffff;
          break;
        case O.WIDTH:
          this.nWidth = option.GetNumber() & 0xffff;
          this.bPercentWidth = option.GetString().includes("%");
          if (this.bPercentWidth && this.nWidth > 100) this.nWidth = 100;
          break;
        case O.HEIGHT:
          this.nHeight = option.GetNumber() & 0xffff;
          if (option.GetString().includes("%")) this.nHeight = 0;
          break;
        case O.CELLPADDING:
          this.nCellPadding = option.GetNumber() & 0xffff;
          break;
        case O.CELLSPACING:
          this.nCellSpacing = option.GetNumber() & 0xffff;
          break;
        case O.ALIGN: {
          const alignment: [SvxAdjust] = [this.eAdjust];
          if (option.GetEnum(alignment, aHTMLPAlignTable)) {
            this.eAdjust = alignment[0];
            this.bTableAdjust = true;
          }
          break;
        }
        case O.VALIGN:
          this.eVertOri = option.GetEnum(aHTMLTableVAlignTable, this.eVertOri);
          break;
        case O.BORDER: {
          const value = option.GetString();
          this.nBorder =
            value && htmlAsciiLower(value) !== "border" ? option.GetNumber() & 0xffff : 1;
          if (!hasFrame) this.eFrame = this.nBorder ? F.Box : F.Void;
          if (!hasRules) this.eRules = this.nBorder ? R.All : R.NONE;
          break;
        }
        case O.FRAME:
          this.eFrame = option.GetTableFrame();
          hasFrame = true;
          break;
        case O.RULES:
          this.eRules = option.GetTableRules();
          hasRules = true;
          break;
        case O.BGCOLOR:
          if (option.GetString()) {
            option.GetColor(this.aBGColor);
            this.bBGColor = true;
          }
          break;
        case O.BACKGROUND:
          this.aBGImage = option.GetString();
          break;
        case O.BORDERCOLOR:
          option.GetColor(this.aBorderColor);
          borderColor = true;
          break;
        case O.BORDERCOLORDARK:
          if (!borderColor) option.GetColor(this.aBorderColor);
          break;
        case O.STYLE:
          this.aStyle = option.GetString();
          break;
        case O.CLASS:
          this.aClass = option.GetString();
          break;
        case O.DIR:
          this.aDir = option.GetString();
          break;
        case O.HSPACE:
          this.nHSpace = option.GetNumber() & 0xffff;
          break;
        case O.VSPACE:
          this.nVSpace = option.GetNumber() & 0xffff;
          break;
      }
    }
    if (this.nCols && !this.nWidth) {
      this.nWidth = 100;
      this.bPercentWidth = true;
    }
    if (this.nBorder === 0 || this.nBorder === 0xffff) {
      this.eFrame = F.Void;
      this.eRules = R.NONE;
    }
  }
}
