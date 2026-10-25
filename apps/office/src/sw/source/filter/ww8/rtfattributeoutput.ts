/** @fileoverview RTF paragraph and character item emission following sw/source/filter/ww8/rtfattributeoutput.cxx. */
import { FontLineStyle, FontStrikeout } from "../../../../tools/inc/fontenum";
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
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import { SvxInterLineSpaceRule, SvxLineSpaceRule } from "../../../../editeng/inc/svxenum";
import { GetScriptClass } from "../../../../i18nutil/source/utility/scriptclass";
import { LATIN } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import type { SwAttrSet } from "../../core/attr/swatrset";
import { AttrSetToLineHeight } from "../../core/txtnode/swfont";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import {
  RES_BREAK,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_UL_SPACE,
  RES_KEEP,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_PARATR_TABSTOP,
  RES_PARATR_LINESPACING,
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
      (paragraph.GetAttr(RES_BREAK) as SfxInt16Item).GetValue(),
      false,
      this.WriteLineSpacing(
        paragraph.GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem,
        paragraph.GetSwAttrSet(),
        paragraph.GetText().length === 0
          ? LATIN
          : GetScriptClass(paragraph.GetText().codePointAt(0) ?? 0),
      ),
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
      (items.Get(RES_BREAK) as SfxInt16Item).GetValue(),
      true,
      this.WriteLineSpacing(items.Get(RES_PARATR_LINESPACING) as SvxLineSpacingItem, items, LATIN),
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
    breakValue: number,
    styleDefinition: boolean,
    lineSpacing: string,
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
    if (breakValue === 4 || (styleDefinition && breakValue === 6)) output += "\\pagebb";
    output += lineSpacing;
    return output;
  }

  /** Converts the native line rule through the shared Word formula and RTF sl/slmult controls. */
  private WriteLineSpacing(item: SvxLineSpacingItem, set: SwAttrSet, script: number): string {
    let space = 240;
    let multi = 0;
    switch (item.GetLineSpaceRule()) {
      case SvxLineSpaceRule.Fix:
        space = -((item.GetLineHeight() << 16) >> 16);
        break;
      case SvxLineSpaceRule.Min:
        space = item.GetLineHeight();
        break;
      case SvxLineSpaceRule.Auto:
        if (item.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Fix)
          space =
            item.GetInterLineSpace() +
            AttrSetToLineHeight(set, script, set.GetDoc().GetDefaultFontDevice());
        else {
          if (item.GetInterLineSpaceRule() !== SvxInterLineSpaceRule.Off)
            space = Math.round((240 * item.GetPropLineSpace()) / 100);
          multi = 1;
        }
        break;
    }
    return `\\sl${(space << 16) >> 16}\\slmult${multi}`;
  }

  /** Emits represented direct character controls. @param attributes - Native run values. @returns RTF controls. */
  public WriteCharacter(attributes: WriterCharacterAttributes): string {
    let result = "";
    if (attributes.bold) result += "\\b";
    if (attributes.italic) result += "\\i";
    const underlineStyle =
      attributes.underlineStyle ??
      (attributes.underline ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE);
    const underlineControl: Partial<Record<FontLineStyle, string>> = {
      [FontLineStyle.LINESTYLE_SINGLE]: "ul",
      [FontLineStyle.LINESTYLE_DOUBLE]: "uldb",
      [FontLineStyle.LINESTYLE_NONE]: "ulnone",
      [FontLineStyle.LINESTYLE_DOTTED]: "uld",
      [FontLineStyle.LINESTYLE_DASH]: "uldash",
      [FontLineStyle.LINESTYLE_DASHDOT]: "uldashd",
      [FontLineStyle.LINESTYLE_DASHDOTDOT]: "uldashdd",
      [FontLineStyle.LINESTYLE_BOLD]: "ulth",
      [FontLineStyle.LINESTYLE_WAVE]: "ulwave",
      [FontLineStyle.LINESTYLE_BOLDDOTTED]: "ulthd",
      [FontLineStyle.LINESTYLE_BOLDDASH]: "ulthdash",
      [FontLineStyle.LINESTYLE_LONGDASH]: "ulldash",
      [FontLineStyle.LINESTYLE_BOLDLONGDASH]: "ulthldash",
      [FontLineStyle.LINESTYLE_BOLDDASHDOT]: "ulthdashd",
      [FontLineStyle.LINESTYLE_BOLDDASHDOTDOT]: "ulthdashdd",
      [FontLineStyle.LINESTYLE_BOLDWAVE]: "ulhwave",
      [FontLineStyle.LINESTYLE_DOUBLEWAVE]: "ululdbwave",
    };
    const underline =
      underlineStyle === FontLineStyle.LINESTYLE_SINGLE && attributes.underlineWordMode
        ? "ulw"
        : underlineControl[underlineStyle];
    if (
      underline !== undefined &&
      (attributes.underline || attributes.underlineStyle !== undefined)
    )
      result += `\\${underline}`;
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
