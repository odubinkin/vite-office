/** @fileoverview RTF paragraph and character item emission following sw/source/filter/ww8/rtfattributeoutput.cxx. */
import { SvxAdjustItem } from "../../../../editeng/inc/adjustitem";
import {
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
} from "../../../../editeng/inc/escapementitem";
import {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxAdjust,
  SvxInterLineSpaceRule,
  SvxLineSpaceRule,
} from "../../../../editeng/inc/svxenum";
import { SvxTabAdjust, SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import {
  ConvertBorderWidthToWord,
  type SvxBorderLine,
} from "../../../../editeng/source/items/borderline";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { BorderLineStyle } from "../../../../offapi/com/sun/star/table/BorderLineStyle";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { TransColToIco } from "../../../../filter/source/msfilter/util";
import { GetScriptClass } from "../../../../i18nutil/source/utility/scriptclass";
import { LATIN } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { FontLineStyle, FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  RES_BREAK,
  RES_BOX,
  RES_KEEP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import type { SwAttrSet } from "../../core/attr/swatrset";
import { writerColorFromPrimitive } from "../../core/attr/swatrset";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { AttrSetToLineHeight } from "../../core/txtnode/swfont";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";

/** Emits represented native paragraph and character items into one RTF stream. */
export class RtfAttributeOutput {
  /** Binds document-scoped font and color table indices. @param fontIndex - Font table lookup. @param colorIndex - Color table lookup.  @returns Constructed instance. */
  public constructor(
    private readonly fontIndex: (family: string) => number,
    private readonly colorIndex: (color: string) => number,
  ) {}

  /** Emits paragraph adjustment and margin items. @param paragraph - Native paragraph. @returns RTF controls. */
  public WriteParagraphProperties(paragraph: SwTextNode): string {
    const text = paragraph.GetText();
    return (
      this.WriteParagraphValues(
        paragraph.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem,
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
          text.length === 0 ? LATIN : GetScriptClass(text.codePointAt(0) as number),
        ),
      ) +
      this.WriteFormatBox(
        paragraph.GetSwAttrSet().GetItemIfSet(RES_BOX, true) as SvxBoxItem | undefined,
      )
    );
  }

  /** Emits effective paragraph values for one named Writer style definition.  @param style - Style. @returns The string result. */
  public WriteStyleParagraphProperties(style: SwTextFormatColl): string {
    const items = style.GetAttrSet();
    return (
      this.WriteParagraphValues(
        items.Get(RES_PARATR_ADJUST) as SvxAdjustItem,
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
        this.WriteLineSpacing(
          items.Get(RES_PARATR_LINESPACING) as SvxLineSpacingItem,
          items,
          LATIN,
        ),
      ) + this.WriteFormatBox(items.GetItemIfSet(RES_BOX, true) as SvxBoxItem | undefined)
    );
  }

  /** Emits adjustment and margins shared by paragraph and stylesheet paths.  @param adjust - Adjust. @param left - Left. @param right - Right. @param firstLine - First Line. @param spacing - Spacing. @param keep - Keep. @param split - Split. @param widows - Widows. @param tabs - Tabs. @param tabOffset - Tab Offset. @param breakValue - Break Value. @param styleDefinition - Style Definition. @param lineSpacing - Line Spacing. @returns The string result. */
  private WriteParagraphValues(
    adjust: SvxAdjustItem,
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
    let output = "";
    switch (adjust.GetAdjust()) {
      case SvxAdjust.Left:
        output = "\\ql";
        break;
      case SvxAdjust.Right:
        output = "\\qr";
        break;
      case SvxAdjust.Block:
      case SvxAdjust.BlockLine:
        output = adjust.GetLastBlock() === SvxAdjust.Block ? "\\qd" : "\\qj";
        break;
      case SvxAdjust.Center:
        output = "\\qc";
        break;
    }
    if (left !== 0) output += `\\li${left}\\lin${left}`;
    if (right !== 0) output += `\\ri${right}\\rin${right}`;
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

  /** Converts the native line rule through the shared Word formula and RTF sl/slmult controls.  @param item - Item. @param set - Set. @param script - Script. @returns The string result. */
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

  /** Source OutTBLBorderLine shared by cell and paragraph border emission. @param control - Border selector. @param line - Native line. @returns RTF controls. */
  public OutTBLBorderLine(control: string, line: SvxBorderLine | undefined): string {
    if (line === undefined || line.isEmpty()) return `\\${control}\\brdrnone`;
    const style = line.GetBorderLineStyle();
    const width = line.GetWidth();
    const converted = Math.trunc(ConvertBorderWidthToWord(style, width));
    const size =
      width <= 255 ? `\\brdrw${converted}` : `\\brdrth\\brdrw${Math.trunc(converted / 2)}`;
    const color = `#${(line.GetColor().toUInt32() & 0xffffff).toString(16).padStart(6, "0")}`;
    return `\\${control}\\${rtfBorderStyle(style as Exclude<BorderLineStyle, BorderLineStyle.NONE>, width)}${size}\\brdrcf${this.colorIndex(color)}`;
  }

  /** Source OutBorderLine adds distance only for an existing line. @param control - Border selector. @param line - Native line. @param distance - Native twips. @returns RTF controls. */
  public OutBorderLine(control: string, line: SvxBorderLine | undefined, distance: number): string {
    return (
      this.OutTBLBorderLine(control, line) +
      (line === undefined ? "" : `\\brsp${distance & 0xffff}`)
    );
  }

  /** Mirrors FormatBox for paragraph/styled borders; frame shadows have no current Writer owner. @param box - Authored or inherited item. @returns RTF controls. */
  private WriteFormatBox(box: SvxBoxItem | undefined): string {
    if (box === undefined) return "";
    const sides = [
      SvxBoxItemLine.TOP,
      SvxBoxItemLine.LEFT,
      SvxBoxItemLine.BOTTOM,
      SvxBoxItemLine.RIGHT,
    ] as const;
    const first = box.GetTop();
    if (
      first !== undefined &&
      sides.every(
        /** Checks the source uniform-box condition. @param edge - Native edge. @returns Whether line and distance equal the top edge. */
        (edge) =>
          box.GetLine(edge)?.equals(first) &&
          box.GetDistance(edge) === box.GetDistance(SvxBoxItemLine.TOP),
      )
    )
      return this.OutBorderLine("box", first, box.GetSmallestDistance());
    return sides
      .map(
        /** Emits one source-ordered paragraph border. @param edge - Native edge. @param index - Source selector index. @returns RTF controls. */ (
          edge,
          index,
        ) =>
          this.OutBorderLine(
            ["brdrt", "brdrl", "brdrb", "brdrr"][index] as string,
            box.GetLine(edge),
            box.GetDistance(edge),
          ),
      )
      .join("");
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
      result += `\\${underline}\\ulc${attributes.underlineColor === undefined || attributes.underlineColor === "auto" ? 0 : this.colorIndex(attributes.underlineColor)}`;
    if (attributes.strikeout === FontStrikeout.STRIKEOUT_NONE) result += "\\strike0";
    else if (attributes.strikeout === FontStrikeout.STRIKEOUT_DOUBLE) result += "\\striked1";
    else if (attributes.strikeout !== undefined) result += "\\strike";
    if (attributes.fontFamily !== undefined)
      result += `\\f${this.fontIndex(attributes.fontFamily)}`;
    if (attributes.fontSizeTwips !== undefined)
      result += `\\fs${Math.round(attributes.fontSizeTwips / 10)}`;
    if (attributes.escapement !== undefined)
      result += this.WriteEscapement(attributes.escapement, attributes.fontSizeTwips);
    if (attributes.color !== undefined)
      result += `\\cf${attributes.color === "auto" ? 0 : this.colorIndex(attributes.color)}`;
    if (attributes.highlight !== undefined)
      result += `\\highlight${TransColToIco(writerColorFromPrimitive(attributes.highlight, "transparent"))}`;
    return result;
  }

  /** Emits source super/subscript or proportional up/down controls. @param value - Admitted escapement value. @param fontSizeTwips - Font height or native default. @returns RTF controls. */
  private WriteEscapement(
    value: NonNullable<WriterCharacterAttributes["escapement"]>,
    fontSizeTwips: number | undefined,
  ): string {
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
    const fontHeight = fontSizeTwips ?? 240;
    const halfPoints = Math.round((fontHeight * Math.abs(effectiveOffset)) / 1000);
    return `{\\*\\updnprop${height * 100 + (automatic ? 1 : 0)}}\\${effectiveOffset > 0 ? "up" : "dn"}${halfPoints}`;
  }
}

/** Maps native cell-line styles exactly as OutTBLBorderLine.  @param style - Style. @param width - Width. @returns The string result. */
function rtfBorderStyle(
  style: Exclude<BorderLineStyle, BorderLineStyle.NONE>,
  width: number,
): string {
  switch (style) {
    case BorderLineStyle.SOLID:
      return width === 1 ? "brdrhair" : "brdrs";
    case BorderLineStyle.DOTTED:
      return "brdrdot";
    case BorderLineStyle.DASHED:
      return "brdrdash";
    case BorderLineStyle.DOUBLE:
    case BorderLineStyle.DOUBLE_THIN:
      return "brdrdb";
    case BorderLineStyle.THINTHICK_SMALLGAP:
      return "brdrtnthsg";
    case BorderLineStyle.THINTHICK_MEDIUMGAP:
      return "brdrtnthmg";
    case BorderLineStyle.THINTHICK_LARGEGAP:
      return "brdrtnthlg";
    case BorderLineStyle.THICKTHIN_SMALLGAP:
      return "brdrthtnsg";
    case BorderLineStyle.THICKTHIN_MEDIUMGAP:
      return "brdrthtnmg";
    case BorderLineStyle.THICKTHIN_LARGEGAP:
      return "brdrthtnlg";
    case BorderLineStyle.EMBOSSED:
      return "brdremboss";
    case BorderLineStyle.ENGRAVED:
      return "brdrengrave";
    case BorderLineStyle.OUTSET:
      return "brdroutset";
    case BorderLineStyle.INSET:
      return "brdrinset";
    case BorderLineStyle.FINE_DASHED:
      return "brdrdashsm";
    case BorderLineStyle.DASH_DOT:
      return "brdrdashd";
    case BorderLineStyle.DASH_DOT_DOT:
      return "brdrdashdd";
  }
}
