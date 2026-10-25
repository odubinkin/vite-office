/** @fileoverview RTF paragraph and character item emission following sw/source/filter/ww8/rtfattributeoutput.cxx. */
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import { getWriterParagraphAlignment } from "../../core/txtnode/ndtxt-hints";
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxTabAdjust, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import {
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_UL_SPACE,
  RES_KEEP,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_TABSTOP,
} from "../../../inc/hintids";

/** Emits represented native paragraph and character items into one RTF stream. */
export class RtfAttributeOutput {
  /** Binds document-scoped font and color table indices. @param fontIndex - Font table lookup. @param colorIndex - Color table lookup. */
  public constructor(
    private readonly fontIndex: (family: string) => number,
    private readonly colorIndex: (color: string) => number,
  ) {}

  /** Emits paragraph adjustment and margin items. @param paragraph - Native paragraph. @returns RTF controls. */
  public WriteParagraphProperties(paragraph: SwTextNode): string {
    return this.WriteParagraphValues(
      paragraph.GetParagraphAlignment(),
      paragraph.GetParagraphTextLeftMargin(),
      paragraph.GetParagraphRightMargin(),
      (
        paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset(),
      paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem,
      paragraph.GetAttr(RES_KEEP) as SfxBoolItem,
      paragraph.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem,
      paragraph.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item,
      paragraph.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem,
      paragraph.GetDoc().GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")
        ? paragraph.GetParagraphTextLeftMargin()
        : 0,
    );
  }

  /** Emits effective paragraph values for one named Writer style definition. */
  public WriteStyleParagraphProperties(style: SwTextFormatColl): string {
    const items = style.GetAttrSet();
    return this.WriteParagraphValues(
      getWriterParagraphAlignment((items.Get(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()),
      (items.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft(),
      (items.Get(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight(),
      (items.Get(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).ResolveTextFirstLineOffset(),
      items.Get(RES_UL_SPACE) as SvxULSpaceItem,
      items.Get(RES_KEEP) as SfxBoolItem,
      items.Get(RES_PARATR_SPLIT) as SfxBoolItem,
      items.Get(RES_PARATR_WIDOWS) as SfxInt16Item,
      items.Get(RES_PARATR_TABSTOP) as SvxTabStopItem,
      items.GetDoc().GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")
        ? (items.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()
        : 0,
    );
  }

  /** Emits adjustment and margins shared by paragraph and stylesheet paths. */
  private WriteParagraphValues(
    alignment: "left" | "center" | "right" | "justify",
    left: number,
    right: number,
    firstLine: number,
    spacing: SvxULSpaceItem,
    keep: SfxBoolItem,
    split: SfxBoolItem,
    widows: SfxInt16Item,
    tabs: SvxTabStopItem,
    tabOffset: number,
  ): string {
    let output =
      alignment === "center"
        ? "\\qc"
        : alignment === "right"
          ? "\\qr"
          : alignment === "justify"
            ? "\\qj"
            : "\\ql";
    if (left !== 0) output += `\\li${left}`;
    if (right !== 0) output += `\\ri${right}`;
    if (firstLine !== 0) output += `\\fi${firstLine}`;
    output += `\\sb${spacing.GetUpper()}\\sa${spacing.GetLower()}`;
    if (spacing.GetContext()) output += "\\contextualspace";
    if (keep.GetValue()) output += "\\keepn";
    if (!split.GetValue()) output += "\\keep";
    output += widows.GetValue() ? "\\widctlpar" : "\\nowidctlpar";
    for (let index = 0; index < tabs.Count(); index++) {
      const tab = tabs.At(index);
      if (tab.GetAdjustment() === SvxTabAdjust.Default) continue;
      const fill = tab.GetFill();
      if (fill === ".") output += "\\tldot";
      else if (fill === "_") output += "\\tlul";
      else if (fill === "-") output += "\\tlth";
      else if (fill === "=") output += "\\tleq";
      const adjust = tab.GetAdjustment();
      if (adjust === SvxTabAdjust.Right) output += "\\tqr";
      else if (adjust === SvxTabAdjust.Center) output += "\\tqc";
      else if (adjust === SvxTabAdjust.Decimal) output += "\\tqdec";
      output += `\\tx${tab.GetTabPos() + tabOffset}`;
    }
    return output;
  }

  /** Emits represented direct character controls. @param attributes - Native run values. @returns RTF controls. */
  public WriteCharacter(attributes: WriterCharacterAttributes): string {
    let result = "";
    if (attributes.bold) result += "\\b";
    if (attributes.italic) result += "\\i";
    if (attributes.underline) result += "\\ul";
    if (attributes.strikeout === FontStrikeout.STRIKEOUT_NONE) result += "\\strike0";
    else if (attributes.strikeout === FontStrikeout.STRIKEOUT_DOUBLE) result += "\\striked1";
    else if (attributes.strikeout !== undefined) result += "\\strike";
    if (attributes.fontFamily !== undefined)
      result += `\\f${this.fontIndex(attributes.fontFamily)}`;
    if (attributes.fontSizeTwips !== undefined)
      result += `\\fs${Math.round(attributes.fontSizeTwips / 10)}`;
    if (attributes.escapement !== undefined) result += this.WriteEscapement(attributes);
    if (attributes.color !== undefined && attributes.color !== "auto")
      result += `\\cf${this.colorIndex(attributes.color)}`;
    if (attributes.highlight !== undefined && attributes.highlight !== "transparent")
      result += `\\highlight${this.colorIndex(attributes.highlight)}`;
    return result;
  }

  /** Emits source super/subscript or proportional up/down controls. @param attributes - Effective run values. @returns RTF controls. */
  private WriteEscapement(attributes: WriterCharacterAttributes): string {
    const value = attributes.escapement;
    if (value === undefined) return "";
    const { offset, height } = value;
    if (height === DFLT_ESC_PROP || height < 1 || height > 100) {
      if (offset === DFLT_ESC_SUB || offset === DFLT_ESC_AUTO_SUB) return "\\sub";
      if (offset === DFLT_ESC_SUPER || offset === DFLT_ESC_AUTO_SUPER) return "\\super";
      return "";
    }
    let effectiveOffset = offset;
    const automatic = offset === DFLT_ESC_AUTO_SUPER || offset === DFLT_ESC_AUTO_SUB;
    if (offset === DFLT_ESC_AUTO_SUPER) effectiveOffset = Math.trunc(0.8 * (100 - height));
    else if (offset === DFLT_ESC_AUTO_SUB) effectiveOffset = Math.trunc(-0.2 * (100 - height));
    if (effectiveOffset === 0) return "";
    const fontHeight = attributes.fontSizeTwips ?? 240;
    const halfPoints = Math.round((fontHeight * Math.abs(effectiveOffset)) / 1000);
    return `{\\*\\updnprop${height * 100 + (automatic ? 1 : 0)}}\\${effectiveOffset > 0 ? "up" : "dn"}${halfPoints}`;
  }
}
