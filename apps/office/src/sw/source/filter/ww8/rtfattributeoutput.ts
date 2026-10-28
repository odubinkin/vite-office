/** @fileoverview RTF paragraph and character item emission following sw/source/filter/ww8/rtfattributeoutput.cxx. */
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import type { wwFont } from "./wrtw8sty";
import { RES_CHRATR_FONT } from "../../../inc/hintids";
import type { RtfExport } from "./rtfexport";
import { OutHex, OutString } from "../../../../filter/source/msfilter/rtfutil";
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { RTL_TEXTENCODING_DONTKNOW } from "../../../../sal/inc/rtl/textenc";
import { rtl_getTextEncodingFromWindowsCharset } from "../../../../sal/textenc/tencinfo";
import { FontMapExport, rtl_TextEncodingToWinCharsetRTF } from "./writerwordglue";
import { SvxFontItem } from "../../../../editeng/inc/fontitem";
import { RtfAssociatedProperties, GetCharacterPropertiesMode } from "./rtfattributeoutput.assoc";
export { GetCharacterPropertiesMode } from "./rtfattributeoutput.assoc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxUnderlineItem } from "../../../../editeng/source/items/textitem";
import { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
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
  RES_CHRATR_AUTOKERN,
  WRITER_CHARACTER_WHICH_RANGES,
  RES_CHRATR_UNDERLINE,
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
import { projectWriterCharacterAttributes } from "../../core/txtnode/txatbase";
import type { WriterCharacterAttributes } from "../../core/txtnode/txatbase";

/** Emits represented native paragraph and character items into one RTF stream. */
export class RtfAttributeOutput {
  private readonly associated: RtfAssociatedProperties;
  /** Binds document-scoped font and color table indices. @param fontIndex - Font table lookup. @param colorIndex - Color table lookup. @param exporter - Original document encoding owner.  @returns Constructed instance. */
  public constructor(
    private readonly fontIndex: (font: SvxFontItem | wwFont) => number,
    private readonly colorIndex: (color: string) => number,
    private readonly exporter: Pick<
      RtfExport,
      | "GetCurrentEncoding"
      | "SetCurrentEncoding"
      | "GetDefaultEncoding"
      | "Strm"
      | "OutColorTable"
      | "InsStyle"
    >,
  ) {
    this.associated = new RtfAssociatedProperties(
      /** Borrows the original attribute output sink. @param font - Native item. @param assoc - Associated flag. @returns Controls. */
      (font, assoc) => this.OutputCharFontAssoc(font, assoc),
    );
  }

  private m_aStylesheet = "";
  private m_rStyleName = "";
  private m_nStyleId = 0;
  /** Original styles start writes color-table opening and retains stylesheet text until EndStyles. @returns Nothing. */
  StartStyles(): void {
    this.exporter.Strm().WriteOString("\n{\\colortbl");
    this.exporter.OutColorTable();
    if (this.m_aStylesheet !== "") throw new Error("assert(stylesheet empty)");
    this.m_aStylesheet = "\n{\\stylesheet";
  }
  /** Original end flushes the complete stylesheet after closing the color destination. @param count - Ignored native count. @returns Nothing. */
  EndStyles(count: number): void {
    void count;
    this.exporter.Strm().WriteChar("}").WriteOString(this.m_aStylesheet);
    this.m_aStylesheet = "";
    this.exporter.Strm().WriteChar("}");
  }
  /** Original default-style output is empty in RTF. @returns Nothing. */
  DefaultStyle(): void {}
  /** Original style header retains native paragraph/character controls and sentinels. @param name - Word name. @param type - Native style type. @param base - Parent slot. @param next - Next slot. @param link - Ignored native link. @param wwId - Ignored builtin ID. @param slot - Native slot. @param autoUpdate - Native update flag. @returns Nothing. */
  StartStyle(
    name: string,
    type: StyleType,
    base: number,
    next: number,
    link: number,
    wwId: number,
    slot: number,
    autoUpdate: boolean,
  ): void {
    void link;
    void wwId;
    this.m_aStylesheet += `{${type === StyleType.STYLE_TYPE_PARA ? "\\s" : "\\*\\cs"}${slot}`;
    if (base !== 0x0fff) this.m_aStylesheet += `\\sbasedon${base}`;
    this.m_aStylesheet += `\\snext${next}`;
    if (autoUpdate) this.m_aStylesheet += "\\sautoupd";
    this.m_rStyleName = name;
    this.m_nStyleId = slot;
  }
  /** Original end caches property controls separately from the wrapper/name. The argument binds this port's existing string property sink instead of inventing a second buffer. @param properties - Drained StyleDefinition controls. @returns Nothing. */
  EndStyle(properties: string): void {
    this.exporter.InsStyle(this.m_nStyleId, properties);
    this.m_aStylesheet +=
      properties + " " + OutString(this.m_rStyleName, this.exporter.GetCurrentEncoding()) + ";}\n";
  }
  private m_nListId = 0;
  /** Original concrete numbering instance. @param id - One-based abstract ID. @param rule - Unused in RTF. @returns Nothing. */
  NumberingDefinition(id: number, rule: SwNumRule): void {
    void rule;
    this.exporter.Strm().WriteOString(`{\\listoverride\\listid${id}\\listoverridecount0\\ls${id}}`);
  }
  /** Original abstract list opening. @param id - One-based ID. @returns Nothing. */
  StartAbstractNumbering(id: number): void {
    this.m_nListId = id;
    this.exporter.Strm().WriteOString(`{\\list\\listtemplateid${id}`);
  }
  /** Original abstract list terminator. @returns Nothing. */
  EndAbstractNumbering(): void {
    this.exporter.Strm().WriteOString(`\\listid${this.m_nListId}}\n`);
  }
  /** Original level serializer, with native scalar widths supplied by the common Word writer. The current core has no picture brush owner. @param level - Level. @param start - Start value. @param type - Numbering type. @param adjust - Alignment. @param positions - One-based placeholder positions. @param follow - Follow policy. @param font - Optional bullet font. @param items - Optional character items. @param indent - Text indent. @param firstLine - First line offset. @param listTab - Ignored by RTF. @param text - Native placeholder string. @param legal - Legal numbering flag. @returns Nothing. */
  NumberingLevel(
    level: number,
    start: number,
    type: SvxNumType,
    adjust: SvxAdjust,
    positions: Uint8Array,
    follow: number,
    font: wwFont | undefined,
    items: SfxItemSet | undefined,
    indent: number,
    firstLine: number,
    listTab: number,
    text: string,
    legal: boolean,
  ): void {
    void listTab;
    let output = "\n";
    if (level > 8) output += "\\*\\soutlvl";
    output += `{\\listlevel\\levelnfc${toRtfNfc(type, items)}\\leveljc${adjust === SvxAdjust.Center ? 1 : adjust === SvxAdjust.Right ? 2 : 0}\\levelstartat${start}`;
    if (legal) output += "\\levellegal";
    output += `\\levelfollow${follow}{\\leveltext `;
    if (type === SvxNumType.SVX_NUM_CHAR_SPECIAL || type === SvxNumType.SVX_NUM_BITMAP)
      output += `\\'01\\u${(text.charCodeAt(0) << 16) >> 16} ?`;
    else
      output += `\\'${OutHex(text.length, 2)}${OutString(text, this.exporter.GetDefaultEncoding(), false)}`;
    output += ";}{\\levelnumbers";
    for (let index = 0; index <= level && positions[index]; ++index)
      output += `\\'${OutHex(positions[index] as number, 2)}`;
    output += ";}";
    if (items !== undefined) {
      if (font !== undefined) output += `\\f${this.fontIndex(font)}`;
      output += this.WriteNativeCharacter(items, GetCharacterPropertiesMode.StyleDefinition);
    }
    output += `\\fi${firstLine}\\li${indent}}`;
    if (level > 8) output += "}";
    this.exporter.Strm().WriteOString(output);
  }
  /** Original non-associated font output changes the document encoding; associated output only emits its slot. @param font - Native font item. @param assoc - Original association flag. @returns RTF controls. */
  public OutputCharFontAssoc(font: SvxFontItem, assoc: boolean): string {
    const result = `\\${assoc ? "af" : "f"}${this.fontIndex(font)}`;
    if (assoc) return result;
    const mapped = new FontMapExport(font.GetFamilyName());
    const charset = rtl_TextEncodingToWinCharsetRTF(
      mapped.msPrimary,
      mapped.msSecondary,
      font.GetCharSet(),
    );
    this.exporter.SetCurrentEncoding(rtl_getTextEncodingFromWindowsCharset(charset));
    if (this.exporter.GetCurrentEncoding() === RTL_TEXTENCODING_DONTKNOW)
      this.exporter.SetCurrentEncoding(this.exporter.GetDefaultEncoding());
    return result;
  }

  /** Original font name is hex-encoded without Unicode fallback. @param name - Mapped family name. @returns Nothing. */
  public StartFont(name: string): void {
    this.exporter.Strm().WriteOString(OutString(name, this.exporter.GetCurrentEncoding(), false));
  }
  /** Original font terminator restores default encoding. @returns Nothing. */
  public EndFont(): void {
    this.exporter.Strm().WriteOString(";}");
    this.exporter.SetCurrentEncoding(this.exporter.GetDefaultEncoding());
  }
  /** Original optional alternate family group uses the current font encoding without Unicode. @param name - Mapped alternate name. @returns Nothing. */
  public FontAlternateName(name: string): void {
    this.exporter
      .Strm()
      .WriteOString("{\\*\\falt ")
      .WriteOString(OutString(name, this.exporter.GetCurrentEncoding(), false))
      .WriteChar("}");
  }
  /** Original byte charset control also changes the export encoding without the run-font fallback. @param charset - Windows charset byte. @returns Nothing. */
  public FontCharset(charset: number): void {
    charset &= 0xff;
    this.exporter.Strm().WriteOString("\\fcharset").WriteNumberAsString(charset).WriteChar(" ");
    this.exporter.SetCurrentEncoding(rtl_getTextEncodingFromWindowsCharset(charset));
  }
  /** Original family group uses the complete FFN font identity. @param family - Native family enum. @param font - Actual registered font. @returns Nothing. */
  public FontFamilyType(family: FontFamily, font: wwFont): void {
    let keyword = "\\fnil";
    switch (family) {
      case FontFamily.FAMILY_ROMAN:
        keyword = "\\froman";
        break;
      case FontFamily.FAMILY_SWISS:
        keyword = "\\fswiss";
        break;
      case FontFamily.FAMILY_MODERN:
        keyword = "\\fmodern";
        break;
      case FontFamily.FAMILY_SCRIPT:
        keyword = "\\fscript";
        break;
      case FontFamily.FAMILY_DECORATIVE:
        keyword = "\\fdecor";
        break;
    }
    this.exporter
      .Strm()
      .WriteOString("{\\f")
      .WriteNumberAsString(this.fontIndex(font))
      .WriteOString(keyword);
  }
  /** Original pitch control maps fixed/variable/other to 1/2/0. @param pitch - Native font pitch. @returns Nothing. */
  public FontPitchType(pitch: FontPitch): void {
    this.exporter
      .Strm()
      .WriteOString("\\fprq")
      .WriteNumberAsString(
        pitch === FontPitch.PITCH_FIXED ? 1 : pitch === FontPitch.PITCH_VARIABLE ? 2 : 0,
      );
  }

  /** Original RawText serializes through the native RTF utility. @param text - Logical UTF16 view. @param encoding - Native destination encoding. @returns Encoded run fragment in the string-buffer binding. */
  public RawText(text: string, encoding: rtl_TextEncoding): string {
    return OutString(text, encoding);
  }

  /** Original RunText uses current export encoding and deliberately ignores the supplied character encoding and symbol font. @param text - Logical run text. @param encoding - Ignored source parameter. @param symbolFont - Ignored source parameter. @returns Encoded run fragment. */
  public RunText(text: string, encoding: rtl_TextEncoding, symbolFont: string): string {
    void encoding;
    void symbolFont;
    return this.RawText(text, this.exporter.GetCurrentEncoding());
  }

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

  /** Emits represented direct character controls. @param attributes - Native run values. @param fontAttributes - Include projected font properties for legacy callers. @returns RTF controls. */
  public WriteCharacter(attributes: WriterCharacterAttributes, fontAttributes = true): string {
    let result = "";
    if (fontAttributes && attributes.bold) result += "\\b";
    if (fontAttributes && attributes.italic) result += "\\i";
    if (attributes.underline || attributes.underlineStyle !== undefined)
      result += this.WriteUnderlineValue(
        attributes.underlineStyle ??
          (attributes.underline ? FontLineStyle.LINESTYLE_SINGLE : FontLineStyle.LINESTYLE_NONE),
        attributes.underlineWordMode ?? false,
        attributes.underlineColor,
        false,
      );
    if (attributes.strikeout === FontStrikeout.STRIKEOUT_NONE) result += "\\strike0";
    else if (attributes.strikeout === FontStrikeout.STRIKEOUT_DOUBLE) result += "\\striked1";
    else if (attributes.strikeout !== undefined) result += "\\strike";
    if (fontAttributes && attributes.fontFamily !== undefined)
      result += `\\f${this.fontIndex(new SvxFontItem(FontFamily.FAMILY_DONTKNOW, attributes.fontFamily, "", FontPitch.PITCH_DONTKNOW, RTL_TEXTENCODING_DONTKNOW, RES_CHRATR_FONT))}`;
    if (fontAttributes && attributes.fontSizeTwips !== undefined)
      result += `\\fs${Math.round(attributes.fontSizeTwips / 10)}`;
    if (attributes.escapement !== undefined)
      result += this.WriteEscapement(attributes.escapement, attributes.fontSizeTwips);
    if (attributes.color !== undefined)
      result += `\\cf${attributes.color === "auto" ? 0 : this.colorIndex(attributes.color)}`;
    if (attributes.highlight !== undefined)
      result += `\\highlight${TransColToIco(writerColorFromPrimitive(attributes.highlight, "transparent"))}`;
    return result;
  }

  /** Original native run-state producer. @param isRTL - Bidi direction. @param script - Original script. @returns Nothing. */
  public RTLAndCJKState(isRTL: boolean, script: number): void {
    this.associated.RTLAndCJKState(isRTL, script);
  }

  /** Collects actual inherited character items before source associated-group emission; the borrowed caller set is never cleared. @param items - Effective native items. @param mode - Original mode, style by default for existing style writers. @returns Source RTF controls. */
  public WriteNativeCharacter(
    items: SfxItemSet,
    mode = GetCharacterPropertiesMode.StyleDefinition,
  ): string {
    const local = new SfxItemSet(items.GetPool(), WRITER_CHARACTER_WHICH_RANGES);
    try {
      for (const [first, last] of WRITER_CHARACTER_WHICH_RANGES)
        for (let which: number = first; which <= last; ++which) {
          const item = items.GetItemIfSet(which, true);
          if (item !== undefined) local.Put(item);
        }
      const projected = projectWriterCharacterAttributes(local);
      const general = { ...projected, underline: false };
      Reflect.deleteProperty(general, "underlineStyle");
      let result = this.WriteCharacter(general, false);
      const underline = local.GetItemIfSet(RES_CHRATR_UNDERLINE, false);
      if (underline instanceof SvxUnderlineItem)
        result += this.WriteUnderlineValue(
          underline.GetLineStyle(),
          projected.underlineWordMode ?? false,
          projected.underlineColor,
          true,
        );
      const kern = local.GetItemIfSet(RES_CHRATR_AUTOKERN, false) as SvxAutoKernItem | undefined;
      if (kern !== undefined) result += `\\kerning${kern.GetValue() ? 1 : 0}`;
      return result + this.associated.MoveProperties(local, mode);
    } finally {
      local.Dispose();
    }
  }

  /** Source non-associated underline selection: four basic styles defer their keyword to associated groups but retain the shared color. @param underlineStyle - Actual line style. @param wordMode - Ancillary native word mode. @param color - Existing color-table value binding. @param deferBasic - Whether associated groups emit basic keywords. @returns Native underline/color controls. */
  private WriteUnderlineValue(
    underlineStyle: FontLineStyle,
    wordMode: boolean,
    color: string | undefined,
    deferBasic: boolean,
  ): string {
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
      underlineStyle === FontLineStyle.LINESTYLE_SINGLE && wordMode
        ? "ulw"
        : underlineControl[underlineStyle];
    if (underline === undefined) return "";
    const basic =
      underlineStyle === FontLineStyle.LINESTYLE_SINGLE ||
      underlineStyle === FontLineStyle.LINESTYLE_DOUBLE ||
      underlineStyle === FontLineStyle.LINESTYLE_NONE ||
      underlineStyle === FontLineStyle.LINESTYLE_DOTTED;
    return (
      (deferBasic && basic ? "" : "\\" + underline) +
      `\\ulc${color === undefined || color === "auto" ? 0 : this.colorIndex(color)}`
    );
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

/** Maps native number families and borrowed CJK language to the source RTF NFC. @param type - Number family. @param items - Optional native character items. @returns RTF NFC. */
function toRtfNfc(type: SvxNumType, items: SfxItemSet | undefined): number {
  switch (type) {
    case SvxNumType.SVX_NUM_ROMAN_UPPER:
      return 1;
    case SvxNumType.SVX_NUM_ROMAN_LOWER:
      return 2;
    case SvxNumType.SVX_NUM_CHARS_UPPER_LETTER:
    case SvxNumType.SVX_NUM_CHARS_UPPER_LETTER_N:
      return 3;
    case SvxNumType.SVX_NUM_CHARS_LOWER_LETTER:
    case SvxNumType.SVX_NUM_CHARS_LOWER_LETTER_N:
      return 4;
    case SvxNumType.SVX_NUM_FULL_WIDTH_ARABIC:
      return 14;
    case SvxNumType.SVX_NUM_CIRCLE_NUMBER:
      return 18;
    case SvxNumType.SVX_NUM_NUMBER_LOWER_ZH:
      return (items?.Get(RES_CHRATR_CJK_LANGUAGE) as SvxLanguageItem | undefined)?.GetLanguage() ===
        LANGUAGE_CHINESE_SIMPLIFIED
        ? 39
        : 35;
    case SvxNumType.SVX_NUM_NUMBER_UPPER_ZH:
      return 38;
    case SvxNumType.SVX_NUM_NUMBER_UPPER_ZH_TW:
      return 34;
    case SvxNumType.SVX_NUM_TIAN_GAN_ZH:
      return 30;
    case SvxNumType.SVX_NUM_DI_ZI_ZH:
      return 31;
    case SvxNumType.SVX_NUM_NUMBER_TRADITIONAL_JA:
      return 16;
    case SvxNumType.SVX_NUM_AIU_FULLWIDTH_JA:
      return 20;
    case SvxNumType.SVX_NUM_AIU_HALFWIDTH_JA:
      return 12;
    case SvxNumType.SVX_NUM_IROHA_FULLWIDTH_JA:
      return 21;
    case SvxNumType.SVX_NUM_IROHA_HALFWIDTH_JA:
      return 13;
    case SvxNumType.SVX_NUM_HANGUL_SYLLABLE_KO:
    case SvxNumType.SVX_NUM_HANGUL_CIRCLED_SYLLABLE_KO:
      return 24;
    case SvxNumType.SVX_NUM_HANGUL_JAMO_KO:
    case SvxNumType.SVX_NUM_HANGUL_CIRCLED_JAMO_KO:
      return 25;
    case SvxNumType.SVX_NUM_NUMBER_HANGUL_KO:
      return 42;
    case NumberingType.NUMBER_DIGITAL_KO as SvxNumType:
      return 41;
    case NumberingType.NUMBER_DIGITAL2_KO as SvxNumType:
      return 44;
    case NumberingType.NUMBER_LEGAL_KO as SvxNumType:
      return 43;
    case SvxNumType.SVX_NUM_CHAR_SPECIAL:
    case SvxNumType.SVX_NUM_BITMAP:
      return 23;
    case SvxNumType.SVX_NUM_NUMBER_NONE:
      return 255;
    case SvxNumType.SVX_NUM_ARABIC_ZERO:
      return 22;
    default:
      return 0;
  }
}

import { SvxNumType } from "../../../../editeng/inc/svxenum";
import * as NumberingType from "../../../../offapi/com/sun/star/style/NumberingType";
import type { SwNumRule } from "../../core/doc/number";
import { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { RES_CHRATR_CJK_LANGUAGE } from "../../../inc/hintids";
import { LANGUAGE_CHINESE_SIMPLIFIED } from "../../../../i18nlangtag/inc/lang";

import { StyleType } from "./attributeoutputbase";
