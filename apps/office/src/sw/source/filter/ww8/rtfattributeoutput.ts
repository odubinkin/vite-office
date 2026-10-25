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
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import { SvxFirstLineIndentItem } from "../../../../editeng/inc/lrspitem";
import { RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";

/** Emits represented native paragraph and character items into one RTF stream. */
export class RtfAttributeOutput {
  /** Binds document-scoped font and color table indices. @param fontIndex - Font table lookup. @param colorIndex - Color table lookup. */
  public constructor(
    private readonly fontIndex: (family: string) => number,
    private readonly colorIndex: (color: string) => number,
  ) {}

  /** Emits paragraph adjustment and margin items. @param paragraph - Native paragraph. @returns RTF controls. */
  public WriteParagraphProperties(paragraph: SwTextNode): string {
    const alignment = paragraph.GetParagraphAlignment();
    let output =
      alignment === "center"
        ? "\\qc"
        : alignment === "right"
          ? "\\qr"
          : alignment === "justify"
            ? "\\qj"
            : "\\ql";
    const left = paragraph.GetParagraphTextLeftMargin(),
      right = paragraph.GetParagraphRightMargin(),
      firstLine = (
        paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset();
    if (left !== 0) output += `\\li${left}`;
    if (right !== 0) output += `\\ri${right}`;
    if (firstLine !== 0) output += `\\fi${firstLine}`;
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
