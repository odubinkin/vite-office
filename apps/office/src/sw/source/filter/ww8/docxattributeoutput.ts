/** @fileoverview Native DocxAttributeOutput untracked text, language, underline and color emission. The actual DocxExport owns this attribute output; redlines, fields, drawings, font embedding and paragraph orchestration are not yet admitted. */
import type {
  SvxFormatSplitItem,
  SvxWidowsItem,
  SvxParaGridItem,
  SvxParaVertAlignItem,
} from "../../../../editeng/source/items/paraitem.controls";
import type { SfxBoolItem } from "../../../../svl/inc/eitem";
import type { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SvxColorItem } from "../../../../editeng/inc/colritem";
import type { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { ComplexColor as OwnedComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import type { SvxUnderlineItem } from "../../../../editeng/inc/udlnitem";
import type { SvxLanguageItem } from "../../../../editeng/inc/langitem";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { ThemeColorType, ThemeColorUsage } from "../../../../docmodel/inc/theme/ThemeColorType";
import type { ComplexColor } from "../../../../docmodel/inc/color/ComplexColor";
import { TransformationType as T } from "../../../../docmodel/inc/color/Transformation";
import { ConvertColorOU } from "../../../../filter/source/msfilter/util";
import type { DocxExport } from "./docxexport";
import { OutputParagraphProperties } from "./docxattributeoutput.paragraph";
import { Reference as RtlReference } from "../../../../sal/inc/rtl/ref";
/** Original file-local move helper empties its source without acquiring the body. @param source - Actual intrusive handle. @returns Owned previous value. */
function detachFrom(source: RtlReference<FastAttributeList>): RtlReference<FastAttributeList> {
  return RtlReference.move(source);
}
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { FastSerializerHelper, FSNS, MergeMarks } from "../../../../sax/inc/fshelper";
import type { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import type { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import type { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxContourItem } from "../../../../editeng/inc/contouritem";
import type { SvxShadowedItem } from "../../../../editeng/inc/shdditem";
import type { SvxCaseMapItem } from "../../../../editeng/inc/cmapitem";
import type { SvxCharReliefItem } from "../../../../editeng/inc/charreliefitem";
import type { SvxEmphasisMarkItem } from "../../../../editeng/inc/emphasismarkitem";
import type { SvxCharScaleWidthItem } from "../../../../editeng/inc/charscaleitem";
import type { SvxCharRotateItem } from "../../../../editeng/inc/charrotateitem";
import type { SvxTwoLinesItem } from "../../../../editeng/inc/twolinesitem";
import type { SvxBlinkItem } from "../../../../editeng/inc/blinkitem";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SvxCaseMap } from "../../../../editeng/inc/svxenum";
import { FontRelief } from "../../../../vcl/inc/fntstyle";
import { FontEmphasisMark } from "../../../../tools/inc/fontenum";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { LINE_BREAK } from "../../../../offapi/com/sun/star/text/ControlCharacter";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { FontItalic, FontWeight, FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_LANGUAGE,
  RES_CHRATR_CJK_LANGUAGE,
  RES_CHRATR_CTL_LANGUAGE,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
} from "../../../inc/hintids";
const w = token("w"),
  val = FSNS(w, token("val"));
/** Original theme/scheme token selection including text and background usage overrides. @param color - Actual complex color. @param theme - Word theme versus DrawingML scheme spelling. @returns Native token text. */
function lclGetThemeOrSchemeType(color: Readonly<ComplexColor>, theme = true): string {
  const names = [
    ["dark1", "dk1"],
    ["light1", "lt1"],
    ["dark2", "dk2"],
    ["light2", "lt2"],
    ["accent1", "accent1"],
    ["accent2", "accent2"],
    ["accent3", "accent3"],
    ["accent4", "accent4"],
    ["accent5", "accent5"],
    ["accent6", "accent6"],
    ["hyperlink", "hlink"],
    ["followedHyperlink", "folHlink"],
  ];
  const type = color.getThemeColorType(),
    usage = color.getThemeColorUsage();
  let name = (names[type] as string[])[theme ? 0 : 1] as string;
  if (usage === ThemeColorUsage.Text) {
    if (type === ThemeColorType.Dark1) name = theme ? "text1" : "tx1";
    else if (type === ThemeColorType.Dark2) name = theme ? "text2" : "tx2";
  } else if (usage === ThemeColorUsage.Background) {
    if (type === ThemeColorType.Light1) name = theme ? "background1" : "bg1";
    else if (type === ThemeColorType.Light2) name = theme ? "background2" : "bg2";
  }
  return name;
}
/** Original theme attributes, last transform wins and luminance takes precedence over tint/shade. @param attributes - Actual intrusive list. @param color - Actual complex color. @param theme - Theme attribute token. @param tint - Tint attribute token. @param shade - Shade attribute token. @returns Nothing. */
function lclAddThemeValuesToCustomAttributes(
  attributes: RtlReference<FastAttributeList>,
  color: Readonly<ComplexColor>,
  theme: number,
  tint: number,
  shade: number,
): void {
  if (!color.isValidThemeType()) return;
  DocxAttributeOutput.AddToAttrList(attributes, FSNS(w, theme), lclGetThemeOrSchemeType(color));
  let modulation = 10000,
    offset = 0,
    tintValue = 0,
    shadeValue = 0;
  for (const transform of color.getTransformations()) {
    const value = (transform.mnValue << 16) >> 16;
    if (transform.meType === T.LumMod) modulation = value;
    if (transform.meType === T.LumOff) offset = value;
    if (transform.meType === T.Tint) tintValue = value;
    if (transform.meType === T.Shade) shadeValue = value;
  }
  let attribute: number | undefined,
    amount = 0;
  if (modulation === 10000 && offset === 0) {
    if (tintValue !== 0) {
      attribute = tint;
      amount = tintValue;
    } else if (shadeValue !== 0) {
      attribute = shade;
      amount = shadeValue;
    }
  } else {
    const percentage = offset > 0 ? offset / 100 : (-10000 + modulation) / 100;
    amount = Math.abs(percentage) * 100;
    if (percentage > 0) attribute = tint;
    else if (percentage < 0) attribute = shade;
  }
  if (attribute !== undefined) {
    const number = 255 - (amount / 10000) * 255;
    const rounded = Math.sign(number) * Math.floor(Math.abs(number) + 0.5);
    DocxAttributeOutput.AddToAttrList(
      attributes,
      FSNS(w, attribute),
      ((rounded << 16) >> 16).toString(16),
    );
  }
}
/** Original color-specific attribute IDs. @param attributes - Actual list. @param color - Actual complex color. @returns Nothing. */
function lclAddThemeColorAttributes(
  attributes: RtlReference<FastAttributeList>,
  color: Readonly<ComplexColor>,
): void {
  lclAddThemeValuesToCustomAttributes(
    attributes,
    color,
    token("themeColor"),
    token("themeTint"),
    token("themeShade"),
  );
}
/** Native owner for the admitted untracked text and collected character properties. */
export class DocxAttributeOutput extends AttributeOutputBase {
  private readonly m_pFontsAttrList = new RtlReference<FastAttributeList>();
  private readonly m_pColorAttrList = new RtlReference<FastAttributeList>();
  private readonly m_aComplexColor = new OwnedComplexColor();
  private m_nCharTransparence = 0;
  private readonly m_pCharLangAttrList = new RtlReference<FastAttributeList>();
  private readonly m_pEastAsianLayoutAttrList = new RtlReference<FastAttributeList>();
  private m_oFontSize: number | undefined;
  private m_bCharPostureWritten = false;
  private m_bOpenedParaPr = false;
  private m_sRawText = "";
  /** Consumed native constructor binds the real exporter and serializer. DrawingML/base/table-style owners remain unported. @param m_rExport - Actual exporter. @param m_pSerializer - Actual fragment serializer. @returns Attribute output. */
  constructor(
    private readonly m_rExport: DocxExport,
    private m_pSerializer: FastSerializerHelper,
  ) {
    super();
  }
  /** Original empty destructor body followed by destruction of the currently ported intrusive members. Other original drawing/table owners remain unported. @returns Nothing. */
  dispose(): void {
    this.m_pCharLangAttrList.dispose();
    this.m_pColorAttrList.dispose();
    this.m_pEastAsianLayoutAttrList.dispose();
    this.m_pFontsAttrList.dispose();
  }
  /** Original header template creates the intrusive owner once and forwards source arguments. @param attributes - Actual mutable handle. @param args - Original add overload arguments. @returns Nothing. */
  static readonly AddToAttrList = AddToAttrList;
  /** Original exporter getter. @returns Actual exporter. */
  GetExport(): DocxExport {
    return this.m_rExport;
  }
  /** Original serializer getter. @returns Actual serializer. */
  GetSerializer(): FastSerializerHelper {
    return this.m_pSerializer;
  }
  /** Original serializer switch for the admitted output owner; table-style forwarding remains pending its native owner. @param serializer - Actual target. @returns Nothing. */
  SetSerializer(serializer: FastSerializerHelper): void {
    this.m_pSerializer = serializer;
  }
  /** Writes native paragraph properties before the paragraph runs. @param node - Native text node. @param section - Section at paragraph end. @returns Nothing. */
  OutputParagraphProperties(node: SwTextNode, section?: WW8SepInfo): void {
    OutputParagraphProperties(this, node, section);
  }
  /** Original inverted split-to-keepLines serialization. @param item - Actual split item. @returns Nothing. */
  ParaSplit(item: SvxFormatSplitItem): void {
    if (item.GetValue()) this.m_pSerializer.singleElementNS(w, token("keepLines"), val, "false");
    else this.m_pSerializer.singleElementNS(w, token("keepLines"));
  }
  /** Original any nonzero line count enables one OOXML boolean. @param item - Actual widow item. @returns Nothing. */
  ParaWidows(item: SvxWidowsItem): void {
    if (item.GetValue()) this.m_pSerializer.singleElementNS(w, token("widowControl"));
    else this.m_pSerializer.singleElementNS(w, token("widowControl"), val, "false");
  }
  /** Original script-space flag uses original OString boolean spelling. @param item - Actual flag. @returns Nothing. */
  ParaScriptSpace(item: SfxBoolItem): void {
    this.m_pSerializer.singleElementNS(
      w,
      token("autoSpaceDE"),
      val,
      item.GetValue() ? "true" : "false",
    );
  }
  /** Original hanging-punctuation flag. @param item - Actual flag. @returns Nothing. */
  ParaHangingPunctuation(item: SfxBoolItem): void {
    this.m_pSerializer.singleElementNS(
      w,
      token("overflowPunct"),
      val,
      item.GetValue() ? "true" : "false",
    );
  }
  /** Original forbidden-character flag. @param item - Actual flag. @returns Nothing. */
  ParaForbiddenRules(item: SfxBoolItem): void {
    this.m_pSerializer.singleElementNS(
      w,
      token("kinsoku"),
      val,
      item.GetValue() ? "true" : "false",
    );
  }
  /** Original paragraph text alignment with no output for unsupported values. @param item - Actual alignment item. @returns Nothing. */
  ParaVerticalAlign(item: SvxParaVertAlignItem): void {
    let text: string;
    switch (item.GetValue()) {
      case 1:
        text = "baseline";
        break;
      case 2:
        text = "top";
        break;
      case 3:
        text = "center";
        break;
      case 4:
        text = "bottom";
        break;
      case 0:
        text = "auto";
        break;
      default:
        return;
    }
    this.m_pSerializer.singleElementNS(w, token("textAlignment"), val, text);
  }
  /** Original grid flag. @param item - Actual grid item. @returns Nothing. */
  ParaSnapToGrid(item: SvxParaGridItem): void {
    this.m_pSerializer.singleElementNS(
      w,
      token("snapToGrid"),
      val,
      item.GetValue() ? "true" : "false",
    );
  }
  /** Original body9 and clamped heading-level mapping. @param item - Actual outline item. @returns Nothing. */
  ParaOutlineLevel(item: SfxUInt16Item): void {
    let level = Math.min(item.GetValue(), 9);
    level = level ? level - 1 : 9;
    this.m_pSerializer.singleElementNS(w, token("outlineLvl"), val, String(level));
  }
  /** Original explicit break-before true/false representation. @param value - Break flag. @returns Nothing. */
  PageBreakBefore(value: boolean): void {
    if (value) this.m_pSerializer.singleElementNS(w, token("pageBreakBefore"));
    else this.m_pSerializer.singleElementNS(w, token("pageBreakBefore"), val, "false");
  }
  /** Native font registration precedes empty-name and duplicate guards. @param font - Actual shared font item. @returns Nothing. */
  CharFont(font: SvxFontItem): void {
    this.GetExport().GetId(font);
    const name = font.GetFamilyName();
    if (!name) return;
    if (
      this.m_pFontsAttrList.is() &&
      (this.m_pFontsAttrList.operatorArrow().hasAttribute(FSNS(w, token("ascii"))) ||
        this.m_pFontsAttrList.operatorArrow().hasAttribute(FSNS(w, token("hAnsi"))))
    )
      return;
    DocxAttributeOutput.AddToAttrList(this.m_pFontsAttrList, FSNS(w, token("ascii")), name);
    DocxAttributeOutput.AddToAttrList(this.m_pFontsAttrList, FSNS(w, token("hAnsi")), name);
  }
  /** Restores native theme font attributes and Word text effects. @param item - Character interoperability bag. @returns Nothing. */
  CharGrabBag(item: SfxGrabBagItem): void {
    ExportThemeFonts(this.m_pFontsAttrList, item, DocxAttributeOutput.AddToAttrList);
    CharGrabBag(this.m_pSerializer, item);
  }
  /** Original font element open. @param name - Native family name. @returns Nothing. */
  StartFont(name: string): void {
    this.m_pSerializer.startElementNS(w, token("font"), FSNS(w, token("name")), name);
  }
  /** Original font element close. @returns Nothing. */
  EndFont(): void {
    this.m_pSerializer.endElementNS(w, token("font"));
  }
  /** Original alternate name. @param name - Native alternate. @returns Nothing. */
  FontAlternateName(name: string): void {
    this.m_pSerializer.singleElementNS(w, token("altName"), val, name);
  }
  /** Original lowercase two-digit charset output. @param charset - Native byte. @returns Nothing. */
  FontCharset(charset: number): void {
    this.m_pSerializer.singleElementNS(
      w,
      token("charset"),
      val,
      (charset & 255).toString(16).padStart(2, "0"),
    );
  }
  /** Original family switch. @param family - Native enum. @returns Nothing. */
  FontFamilyType(family: FontFamily): void {
    let name: string;
    switch (family) {
      case FontFamily.FAMILY_ROMAN:
        name = "roman";
        break;
      case FontFamily.FAMILY_SWISS:
        name = "swiss";
        break;
      case FontFamily.FAMILY_MODERN:
        name = "modern";
        break;
      case FontFamily.FAMILY_SCRIPT:
        name = "script";
        break;
      case FontFamily.FAMILY_DECORATIVE:
        name = "decorative";
        break;
      default:
        name = "auto";
        break;
    }
    this.m_pSerializer.singleElementNS(w, token("family"), val, name);
  }
  /** Original pitch switch. @param pitch - Native enum. @returns Nothing. */
  FontPitchType(pitch: FontPitch): void {
    let name: string;
    switch (pitch) {
      case FontPitch.PITCH_VARIABLE:
        name = "variable";
        break;
      case FontPitch.PITCH_FIXED:
        name = "fixed";
        break;
      default:
        name = "default";
        break;
    }
    this.m_pSerializer.singleElementNS(w, token("pitch"), val, name);
  }

  /** Original color collection and duplicate-value guard. Text-fill grab bags remain outside the admitted untracked property path. @param item - Actual color item. @returns Nothing. */
  CharColor(item: SvxColorItem): void {
    const color = item.getColor(),
      text = ConvertColorOU(color);
    try {
      if (this.m_pColorAttrList.is() && this.m_pColorAttrList.operatorArrow().hasAttribute(val))
        return;
      lclAddThemeColorAttributes(this.m_pColorAttrList, item.getComplexColor());
      DocxAttributeOutput.AddToAttrList(this.m_pColorAttrList, val, text);
      this.m_nCharTransparence = 255 - color.GetAlpha();
      this.m_aComplexColor.assign(item.getComplexColor());
    } finally {
      text.dispose();
    }
  }
  /** Original page numbering sink. @param type - Native numbering type. @param restart - Optional restart, including0. @returns Nothing. */
  SectionPageNumbering(type: number, restart: number | undefined): void {
    SectionPageNumbering(this, type, restart);
  }
  /** Original section-break sink. @param code - Native unsigned8 break code. @returns Nothing. */
  SectionType(code: number): void {
    SectionType(this, code);
  }
  /** Original DOCX numbering properties omit numbering inherited from an outline-assigned paragraph style. @param node - Actual paragraph or native null. @param level - Clamped Word level. @param id - One-based instance ID. @returns Nothing. */
  ParaNumRule_Impl(node: SwTextNode | undefined, level: number, id: number): void {
    if (id === 0xffff) return;
    const table = this.m_rExport.m_pUsedNumTable,
      rule = id > 0 && id <= (table?.length ?? 0) ? table?.[id - 1] : undefined,
      style = node?.GetTextFormatColl();
    if (
      style?.IsAssignedToListLevelOfOutlineStyle() &&
      level === style.GetAssignedOutlineStyleLevel() &&
      rule?.IsOutlineRule()
    )
      return;
    this.m_pSerializer.startElementNS(w, token("numPr"));
    this.m_pSerializer.singleElementNS(w, token("ilvl"), val, String(level));
    this.m_pSerializer.singleElementNS(w, token("numId"), val, String(id));
    this.m_pSerializer.endElementNS(w, token("numPr"));
  }
  /** Original palette token conversion. @param index - Native palette index. @returns Token or empty text. */
  TransHighlightColor(index: number): string {
    return TransHighlightColor(index);
  }
  /** Original fixed pct15 shading or actual source brush color; no theme inference. @param brush - Actual native brush. @returns Nothing. */
  CharBackground(brush: SvxBrushItem): void {
    if (brush.GetShadingValue() === ShadingPattern.PCT15) {
      this.m_pSerializer.singleElementNS(
        w,
        token("shd"),
        val,
        "pct15",
        FSNS(w, token("color")),
        "auto",
        FSNS(w, token("fill")),
        "FFFFFF",
      );
    } else {
      const color = ConvertColorOU(brush.GetColor());
      try {
        this.m_pSerializer.singleElementNS(
          w,
          token("shd"),
          FSNS(w, token("fill")),
          color,
          val,
          "clear",
        );
      } finally {
        color.dispose();
      }
    }
  }
  /** Original highlight uses the actual Word palette utility. @param brush - Actual highlight. @returns Nothing. */
  CharHighlight(brush: SvxBrushItem): void {
    const color = this.TransHighlightColor(TransColToIco(brush.GetColor()));
    if (color !== "") this.m_pSerializer.singleElementNS(w, token("highlight"), val, color);
  }
  /** Original hidden flag and inline-heading reset; the positive paragraph-property orchestration remains unbound. @param hidden - Actual hidden item. @returns Nothing. */
  CharHidden(hidden: SvxCharHiddenItem): void {
    if (hidden.GetValue()) {
      this.m_pSerializer.singleElementNS(w, token("vanish"));
      if (this.m_bOpenedParaPr && this.m_rExport.m_bParaInlineHeading) {
        this.m_pSerializer.singleElementNS(w, token("specVanish"));
        this.m_rExport.m_bParaInlineHeading = false;
      }
    } else this.m_pSerializer.singleElementNS(w, token("vanish"), val, "false");
  }
  /** Original font-script hint collection; other modes leave prior attributes unchanged. @param hint - Actual script hint. @returns Nothing. */
  CharScriptHint(hint: SvxScriptHintItem): void {
    switch (hint.GetValue()) {
      case ScriptHintType.Asian:
        DocxAttributeOutput.AddToAttrList(
          this.m_pFontsAttrList,
          FSNS(w, token("hint")),
          "eastAsia",
        );
        break;
      case ScriptHintType.Complex:
        DocxAttributeOutput.AddToAttrList(this.m_pFontsAttrList, FSNS(w, token("hint")), "cs");
        break;
    }
  }
  /** Original Word has no optical-sizing equivalent. @param item - Actual original item. @returns Nothing. */
  CharOpticalSizing(item: SvxOpticalSizingItem): void {
    void item;
  }
  /** Original Word has no font-variation equivalent. @param item - Actual original item. @returns Nothing. */
  CharFontVariations(item: SvxFontVariationsItem): void {
    void item;
  }
  /** Original escapement simplification, signed-short arithmetic and binary32 font-height position/size calculations. @param item - Actual native escapement. @returns Nothing. */
  CharEscapement(item: SvxEscapementItem): void {
    let mode = "",
      escape = item.GetEsc(),
      proportion = item.GetProportionalHeight();
    const paragraphStyle =
      this.m_rExport.m_bStyDef && this.m_rExport.m_pCurrentStyle?.Which() === RES_TXTFMTCOLL;
    if (this.m_rExport.m_bStyDef && escape !== 0 && !(paragraphStyle && escape < 0)) {
      proportion = DFLT_ESC_PROP;
      escape = escape > 0 ? DFLT_ESC_AUTO_SUPER : DFLT_ESC_AUTO_SUB;
    }
    if (escape === 0) {
      mode = "baseline";
      escape = 0;
      proportion = 100;
    } else if (proportion === DFLT_ESC_PROP || proportion < 1 || proportion > 100) {
      if (escape === DFLT_ESC_SUB || escape === DFLT_ESC_AUTO_SUB) mode = "subscript";
      else if (escape === DFLT_ESC_SUPER || escape === DFLT_ESC_AUTO_SUPER) mode = "superscript";
    } else if (escape === DFLT_ESC_AUTO_SUPER) escape = Math.trunc(0.8 * (100 - proportion));
    else if (escape === DFLT_ESC_AUTO_SUB) escape = Math.trunc(0.2 * -(100 - proportion));
    if (mode !== "") this.m_pSerializer.singleElementNS(w, token("vertAlign"), val, mode);
    if (mode !== "" && mode !== "baseline") return;
    const height = Math.fround(
      (this.m_rExport.GetItem(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight(),
    );
    const position = Math.fround(Math.fround(height * escape) / 1000);
    this.m_pSerializer.singleElementNS(
      w,
      token("position"),
      val,
      String(Math.sign(position) * Math.floor(Math.abs(position) + 0.5)),
    );
    if ((proportion !== 100 || mode === "baseline") && this.m_oFontSize === undefined) {
      const size = Math.fround(Math.fround(height * proportion) / 1000);
      this.m_oFontSize = Math.sign(size) * Math.floor(Math.abs(size) + 0.5);
    }
  }
  /** Original three-script language collection uses the shared MS BCP47 conversion. @param language - Actual pooled language. @returns Nothing. */
  CharLanguage(language: SvxLanguageItem): void {
    const code = new LanguageTag(language.GetLanguage()).getBcp47MS();
    try {
      switch (language.Which()) {
        case RES_CHRATR_LANGUAGE:
          DocxAttributeOutput.AddToAttrList(this.m_pCharLangAttrList, val, code);
          break;
        case RES_CHRATR_CJK_LANGUAGE:
          DocxAttributeOutput.AddToAttrList(
            this.m_pCharLangAttrList,
            FSNS(w, token("eastAsia")),
            code,
          );
          break;
        case RES_CHRATR_CTL_LANGUAGE:
          DocxAttributeOutput.AddToAttrList(this.m_pCharLangAttrList, FSNS(w, token("bidi")), code);
          break;
      }
    } finally {
      code.dispose();
    }
  }
  /** Original underline mapping, including shared long-dash spelling and native transparent-color omission. @param underline - Actual underline value. @returns Nothing. */
  CharUnderline(underline: SvxUnderlineItem): void {
    const styles = new Map([
      [FontLineStyle.LINESTYLE_SINGLE, "single"],
      [FontLineStyle.LINESTYLE_BOLD, "thick"],
      [FontLineStyle.LINESTYLE_DOUBLE, "double"],
      [FontLineStyle.LINESTYLE_DOTTED, "dotted"],
      [FontLineStyle.LINESTYLE_DASH, "dash"],
      [FontLineStyle.LINESTYLE_DASHDOT, "dotDash"],
      [FontLineStyle.LINESTYLE_DASHDOTDOT, "dotDotDash"],
      [FontLineStyle.LINESTYLE_WAVE, "wave"],
      [FontLineStyle.LINESTYLE_BOLDDOTTED, "dottedHeavy"],
      [FontLineStyle.LINESTYLE_BOLDDASH, "dashedHeavy"],
      [FontLineStyle.LINESTYLE_LONGDASH, "dashLongHeavy"],
      [FontLineStyle.LINESTYLE_BOLDLONGDASH, "dashLongHeavy"],
      [FontLineStyle.LINESTYLE_BOLDDASHDOT, "dashDotHeavy"],
      [FontLineStyle.LINESTYLE_BOLDDASHDOTDOT, "dashDotDotHeavy"],
      [FontLineStyle.LINESTYLE_BOLDWAVE, "wavyHeavy"],
      [FontLineStyle.LINESTYLE_DOUBLEWAVE, "wavyDouble"],
    ]);
    const style = styles.get(underline.GetLineStyle()) ?? "none",
      color = underline.GetColor();
    if (!color.IsTransparent()) {
      const attributes = FastSerializerHelper.createAttrList(),
        text = ConvertColorOU(color);
      try {
        attributes.operatorArrow().add(val, style);
        attributes.operatorArrow().add(FSNS(w, token("color")), text);
        lclAddThemeColorAttributes(attributes, underline.getComplexColor());
        this.m_pSerializer.singleElementNS(w, token("u"), attributes);
      } finally {
        text.dispose();
        attributes.dispose();
      }
    } else this.m_pSerializer.singleElementNS(w, token("u"), val, style);
  }

  /** Native deferred run marks for untracked text without fields/SDTs. @param redline - Only native null is admitted. @param position - Original position. @param singleEmptyRun - Original flag. @returns Nothing. */
  StartRun(redline: null, position: number, singleEmptyRun = false): void {
    void redline;
    void position;
    void singleEmptyRun;
    this.m_pSerializer.mark(6);
    this.m_pSerializer.mark(7);
    this.m_pSerializer.mark(8);
  }
  /** Native property mark encloses a schema-sorted collection. @returns Nothing. */
  StartRunProperties(): void {
    this.m_pSerializer.mark(10);
    this.m_pSerializer.startElementNS(w, token("rPr"));
    this.InitCollectedRunProperties();
  }
  /** Original per-run resets and schema order. @returns Nothing. */
  InitCollectedRunProperties(): void {
    this.m_pFontsAttrList.clear();
    this.m_pEastAsianLayoutAttrList.clear();
    this.m_pCharLangAttrList.clear();
    this.m_oFontSize = undefined;
    this.m_bCharPostureWritten = false;
    this.m_pSerializer.mark(11, runOrder);
  }
  /** Original collected font/height and East Asian layout flush with detach/reset ownership; color retains its list through text-fill emission; language uses the native detached list. @returns Nothing. */
  WriteCollectedRunProperties(): void {
    if (this.m_pFontsAttrList.is()) {
      const fonts = detachFrom(this.m_pFontsAttrList);
      try {
        this.m_pSerializer.singleElementNS(w, token("rFonts"), fonts);
      } finally {
        fonts.dispose();
      }
    }
    if (this.m_oFontSize !== undefined) {
      this.m_pSerializer.singleElementNS(w, token("sz"), val, String(this.m_oFontSize));
      this.m_oFontSize = undefined;
    }
    if (this.m_pColorAttrList.is())
      this.m_pSerializer.singleElementNS(w, token("color"), this.m_pColorAttrList);
    if (this.m_pEastAsianLayoutAttrList.is()) {
      const layout = detachFrom(this.m_pEastAsianLayoutAttrList);
      try {
        this.m_pSerializer.singleElementNS(w, token("eastAsianLayout"), layout);
      } finally {
        layout.dispose();
      }
    }
    if (this.m_pCharLangAttrList.is()) {
      const languages = detachFrom(this.m_pCharLangAttrList);
      try {
        this.m_pSerializer.singleElementNS(w, token("lang"), languages);
      } finally {
        languages.dispose();
      }
    }
    const transforms = this.m_aComplexColor.getTransformations();
    if (
      (this.m_nCharTransparence !== 0 ||
        transforms.some(
          /** Tests the original non-tint/shade predicate. @param value - Actual transformation. @returns Whether solid-fill output is needed. */ (
            value,
          ) => value.meType !== T.Shade && value.meType !== T.Tint,
        )) &&
      this.m_pColorAttrList.is()
    ) {
      const value: [Uint8Array] = [new Uint8Array()];
      this.m_pColorAttrList.operatorArrow().getAsView(val, value);
      const color = value[0];
      if (
        color.length !== 0 &&
        !(
          color.length === 4 &&
          color[0] === 97 &&
          color[1] === 117 &&
          color[2] === 116 &&
          color[3] === 111
        )
      ) {
        const namespace = token("w14"),
          theme = this.m_aComplexColor.isValidThemeType(),
          kind = token(theme ? "schemeClr" : "srgbClr");
        this.m_pSerializer.startElementNS(namespace, token("textFill"));
        this.m_pSerializer.startElementNS(namespace, token("solidFill"));
        this.m_pSerializer.startElementNS(
          namespace,
          kind,
          FSNS(namespace, token("val")),
          theme ? lclGetThemeOrSchemeType(this.m_aComplexColor, false) : color,
        );
        if (this.m_nCharTransparence !== 0)
          this.m_pSerializer.singleElementNS(
            namespace,
            token("alpha"),
            FSNS(namespace, token("val")),
            String(Math.round((this.m_nCharTransparence / 255) * 100) * 1000),
          );
        const tokens = new Map([
          [T.Tint, "tint"],
          [T.Shade, "shade"],
          [T.Sat, "sat"],
          [T.SatOff, "satOff"],
          [T.SatMod, "satMod"],
          [T.Lum, "lum"],
          [T.LumOff, "lumOff"],
          [T.LumMod, "lumMod"],
        ]);
        for (const transform of transforms) {
          const name = tokens.get(transform.meType);
          if (name !== undefined)
            this.m_pSerializer.singleElementNS(
              namespace,
              token(name),
              FSNS(namespace, token("val")),
              String((transform.mnValue * 1000) | 0),
            );
        }
        this.m_pSerializer.endElementNS(namespace, kind);
        this.m_pSerializer.endElementNS(namespace, token("solidFill"));
        this.m_pSerializer.endElementNS(namespace, token("textFill"));
        this.m_nCharTransparence = 0;
      }
    }
    this.m_pColorAttrList.clear();
  }
  /** Native untracked-property completion prepends properties before pending text. @returns Nothing. */
  EndRunProperties(): void {
    this.WriteCollectedRunProperties();
    this.m_pSerializer.mergeTopMarks(11);
    this.m_pSerializer.endElementNS(w, token("rPr"));
    this.m_pSerializer.mergeTopMarks(10, MergeMarks.PREPEND);
  }
  /** Original deferred run start and raw text emission in the admitted no-field path. @param node - Original text node. @param position - Original run position. @param length - Original run length. @param lastRun - Original flag. @returns Nothing. */
  EndRun(node: SwTextNode | null, position: number, length: number, lastRun = false): void {
    void node;
    void position;
    void length;
    void lastRun;
    this.m_pSerializer.mergeTopMarks(8);
    this.m_pSerializer.mark(9);
    this.m_pSerializer.startElementNS(w, token("r"));
    this.m_pSerializer.mergeTopMarks(9, MergeMarks.PREPEND);
    if (this.m_sRawText) {
      this.RunText(this.m_sRawText);
      this.m_sRawText = "";
    }
    this.m_pSerializer.mergeTopMarks(7);
    this.m_pSerializer.endElementNS(w, token("r"));
    this.m_pSerializer.mergeTopMarks(6);
  }
  /** Original RawText replaces the pending string rather than emitting immediately. @param text - UTF16 text. @param encoding - Original ignored encoding. @returns Nothing. */
  RawText(text: string, encoding: rtl_TextEncoding): void {
    void encoding;
    this.m_sRawText = text;
  }
  /** Original control splitting over UTF16 code units; symbol font is passed only to the final segment. @param text - UTF16 text. @param encoding - Original ignored text encoding. @param symbolFont - Symbol family. @returns Nothing. */
  RunText(text: string, encoding: rtl_TextEncoding = RTL_TEXTENCODING_UTF8, symbolFont = ""): void {
    void encoding;
    const begin: [number] = [0],
      textToken = token("t");
    let previous = text.charCodeAt(0);
    for (let index = 0; index < text.length; ++index) {
      const code = text.charCodeAt(index);
      switch (code) {
        case 9:
          impl_WriteRunText(this.m_pSerializer, textToken, text, begin, index);
          this.m_pSerializer.singleElementNS(w, token("tab"));
          previous = code;
          break;
        case 11:
        case LINE_BREAK:
          /* istanbul ignore else -- B8TCAE-W04: an empty segment starts at a control delimiter; its predecessor is a control too, so this condition is always true for the actual immutable run. */
          if (
            impl_WriteRunText(this.m_pSerializer, textToken, text, begin, index) ||
            previous < 32
          ) {
            this.m_pSerializer.singleElementNS(w, token("br"));
            previous = code;
          }
          break;
        case 30:
          impl_WriteRunText(this.m_pSerializer, textToken, text, begin, index);
          this.m_pSerializer.singleElementNS(w, token("noBreakHyphen"));
          previous = code;
          break;
        case 31:
          impl_WriteRunText(this.m_pSerializer, textToken, text, begin, index);
          this.m_pSerializer.singleElementNS(w, token("softHyphen"));
          previous = code;
          break;
        default:
          if (code < 32) impl_WriteRunText(this.m_pSerializer, textToken, text, begin, index);
          previous = code;
          break;
      }
    }
    impl_WriteRunText(this.m_pSerializer, textToken, text, begin, text.length, false, symbolFont);
  }
  /** Original half-point rounding and script dispatch. @param item - Actual shared item. @returns Nothing. */
  CharFontSize(item: SvxFontHeightItem): void {
    const size = Math.trunc(((item.GetHeight() + 5) >>> 0) / 10);
    switch (item.Which()) {
      case RES_CHRATR_FONTSIZE:
      case RES_CHRATR_CJK_FONTSIZE:
        this.m_oFontSize = size;
        break;
      case RES_CHRATR_CTL_FONTSIZE:
        this.m_pSerializer.singleElementNS(w, token("szCs"), val, String(size));
        break;
    }
  }
  /** Original first western/CJK posture wins. @param item - Actual shared item. @returns Nothing. */
  CharPosture(item: SvxPostureItem): void {
    if (this.m_bCharPostureWritten) return;
    this.m_bCharPostureWritten = true;
    if (item.GetPosture() !== FontItalic.ITALIC_NONE)
      this.m_pSerializer.singleElementNS(w, token("i"));
    else this.m_pSerializer.singleElementNS(w, token("i"), val, "false");
  }
  /** Original CJK posture shares western guard. @param item - Actual shared item. @returns Nothing. */
  CharPostureCJK(item: SvxPostureItem): void {
    if (this.m_bCharPostureWritten) return;
    this.m_bCharPostureWritten = true;
    if (item.GetPosture() !== FontItalic.ITALIC_NONE)
      this.m_pSerializer.singleElementNS(w, token("i"));
    else this.m_pSerializer.singleElementNS(w, token("i"), val, "false");
  }
  /** Original CTL posture is independent. @param item - Actual shared item. @returns Nothing. */
  CharPostureCTL(item: SvxPostureItem): void {
    if (item.GetPosture() !== FontItalic.ITALIC_NONE)
      this.m_pSerializer.singleElementNS(w, token("iCs"));
    else this.m_pSerializer.singleElementNS(w, token("iCs"), val, "false");
  }
  /** Original exact BOLD comparison. @param item - Actual shared item. @returns Nothing. */
  CharWeight(item: SvxWeightItem): void {
    if (item.GetWeight() === FontWeight.WEIGHT_BOLD)
      this.m_pSerializer.singleElementNS(w, token("b"));
    else this.m_pSerializer.singleElementNS(w, token("b"), val, "false");
  }
  /** Original exact BOLD comparison. @param item - Actual shared item. @returns Nothing. */
  CharWeightCJK(item: SvxWeightItem): void {
    if (item.GetWeight() === FontWeight.WEIGHT_BOLD)
      this.m_pSerializer.singleElementNS(w, token("b"));
    else this.m_pSerializer.singleElementNS(w, token("b"), val, "false");
  }
  /** Original exact BOLD comparison. @param item - Actual shared item. @returns Nothing. */
  CharWeightCTL(item: SvxWeightItem): void {
    if (item.GetWeight() === FontWeight.WEIGHT_BOLD)
      this.m_pSerializer.singleElementNS(w, token("bCs"));
    else this.m_pSerializer.singleElementNS(w, token("bCs"), val, "false");
  }
  /** Original duplicate font attribute guard; empty names are retained. @param item - Actual shared font. @returns Nothing. */
  CharFontCJK(item: SvxFontItem): void {
    const attribute = FSNS(w, token("eastAsia"));
    if (this.m_pFontsAttrList.is() && this.m_pFontsAttrList.operatorArrow().hasAttribute(attribute))
      return;
    DocxAttributeOutput.AddToAttrList(this.m_pFontsAttrList, attribute, item.GetFamilyName());
  }
  /** Original duplicate font attribute guard; empty names are retained. @param item - Actual shared font. @returns Nothing. */
  CharFontCTL(item: SvxFontItem): void {
    const attribute = FSNS(w, token("cs"));
    if (this.m_pFontsAttrList.is() && this.m_pFontsAttrList.operatorArrow().hasAttribute(attribute))
      return;
    DocxAttributeOutput.AddToAttrList(this.m_pFontsAttrList, attribute, item.GetFamilyName());
  }
  /** Original Word minimum kerning size conversion. @param item - Actual shared flag. @returns Nothing. */
  CharAutoKern(item: SvxAutoKernItem): void {
    this.m_pSerializer.singleElementNS(w, token("kern"), val, String(Number(item.GetValue()) * 2));
  }
  /** Original signed character spacing. @param item - Actual shared item. @returns Nothing. */
  CharKerning(item: SvxKerningItem): void {
    this.m_pSerializer.singleElementNS(w, token("spacing"), val, String(item.GetValue()));
  }
  /** Original double/none/default strike routing. @param item - Actual shared item. @returns Nothing. */
  CharCrossedOut(item: SvxCrossedOutItem): void {
    switch (item.GetStrikeout()) {
      case FontStrikeout.STRIKEOUT_DOUBLE:
        this.m_pSerializer.singleElementNS(w, token("dstrike"));
        break;
      case FontStrikeout.STRIKEOUT_NONE:
        this.m_pSerializer.singleElementNS(w, token("dstrike"), val, "false");
        this.m_pSerializer.singleElementNS(w, token("strike"), val, "false");
        break;
      default:
        this.m_pSerializer.singleElementNS(w, token("strike"));
        break;
    }
  }
  /** Original caps/smallCaps mapping; unsupported modes explicitly clear both Word flags. @param item - Actual case item. @returns Nothing. */
  CharCaseMap(item: SvxCaseMapItem): void {
    switch (item.GetValue()) {
      case SvxCaseMap.SmallCaps:
        this.m_pSerializer.singleElementNS(w, token("smallCaps"));
        break;
      case SvxCaseMap.Uppercase:
        this.m_pSerializer.singleElementNS(w, token("caps"));
        break;
      default:
        this.m_pSerializer.singleElementNS(w, token("smallCaps"), val, "false");
        this.m_pSerializer.singleElementNS(w, token("caps"), val, "false");
    }
  }
  /** Original outline flag and explicit false spelling. @param item - Actual contour item. @returns Nothing. */
  CharContour(item: SvxContourItem): void {
    if (item.GetValue()) this.m_pSerializer.singleElementNS(w, token("outline"));
    else this.m_pSerializer.singleElementNS(w, token("outline"), val, "false");
  }
  /** Original shadow flag and explicit false spelling. @param item - Actual shadowed item. @returns Nothing. */
  CharShadow(item: SvxShadowedItem): void {
    if (item.GetValue()) this.m_pSerializer.singleElementNS(w, token("shadow"));
    else this.m_pSerializer.singleElementNS(w, token("shadow"), val, "false");
  }
  /** Original blink flag selects Word background animation or none. @param item - Actual blink item. @returns Nothing. */
  CharAnimatedText(item: SvxBlinkItem): void {
    this.m_pSerializer.singleElementNS(
      w,
      token("effect"),
      val,
      item.GetValue() ? "blinkBackground" : "none",
    );
  }
  /** Original bidi item hook intentionally emits no XML. @param item - Unused item. @returns Nothing. */
  CharBidiRTL(item: SfxPoolItem): void {
    void item;
  }
  /** Original nonzero rotation contributes collected vertical flags without selecting a rotation angle. @param item - Actual rotation item. @returns Nothing. */
  CharRotate(item: SvxCharRotateItem): void {
    if (!item.GetValue()) return;
    DocxAttributeOutput.AddToAttrList(
      this.m_pEastAsianLayoutAttrList,
      FSNS(w, token("vert")),
      "true",
    );
    if (item.IsFitToLine())
      DocxAttributeOutput.AddToAttrList(
        this.m_pEastAsianLayoutAttrList,
        FSNS(w, token("vertCompress")),
        "true",
      );
  }
  /** Original exact emphasis flag combinations, with all remaining values mapped to none. @param item - Actual emphasis item. @returns Nothing. */
  CharEmphasisMark(item: SvxEmphasisMarkItem): void {
    const value = item.GetEmphasisMark(),
      m = FontEmphasisMark;
    let emphasis: string;
    if (value === (m.Dot | m.PosAbove)) emphasis = "dot";
    else if (value === (m.Accent | m.PosAbove)) emphasis = "comma";
    else if (value === (m.Circle | m.PosAbove)) emphasis = "circle";
    else if (value === (m.Dot | m.PosBelow)) emphasis = "underDot";
    else emphasis = "none";
    this.m_pSerializer.singleElementNS(w, token("em"), val, emphasis);
  }
  /** Original two-line enable and bracket priority; disabled input does not clear previously collected flags. @param item - Actual two-line item. @returns Nothing. */
  CharTwoLines(item: SvxTwoLinesItem): void {
    if (!item.GetValue()) return;
    DocxAttributeOutput.AddToAttrList(
      this.m_pEastAsianLayoutAttrList,
      FSNS(w, token("combine")),
      "true",
    );
    const start = item.GetStartBracket(),
      end = item.GetEndBracket();
    if (!start && !end) return;
    let bracket: string;
    if (start === 123 || end === 125) bracket = "curly";
    else if (start === 60 || end === 62) bracket = "angle";
    else if (start === 91 || end === 93) bracket = "square";
    else bracket = "round";
    DocxAttributeOutput.AddToAttrList(
      this.m_pEastAsianLayoutAttrList,
      FSNS(w, token("combineBrackets")),
      bracket,
    );
  }
  /** Original explicit signed16 min/max template arguments precede OOXML width clamping. @param item - Actual unsigned16 width item. @returns Nothing. */
  CharScaleWidth(item: SvxCharScaleWidthItem): void {
    const width = Math.max(1, Math.min((item.GetValue() << 16) >> 16, 600));
    this.m_pSerializer.singleElementNS(w, token("w"), val, String(width));
  }
  /** Original embossed/engraved mapping, with all remaining values explicitly clearing both flags. @param item - Actual relief item. @returns Nothing. */
  CharRelief(item: SvxCharReliefItem): void {
    switch (item.GetValue()) {
      case FontRelief.Embossed:
        this.m_pSerializer.singleElementNS(w, token("emboss"));
        break;
      case FontRelief.Engraved:
        this.m_pSerializer.singleElementNS(w, token("imprint"));
        break;
      default:
        this.m_pSerializer.singleElementNS(w, token("emboss"), val, "false");
        this.m_pSerializer.singleElementNS(w, token("imprint"), val, "false");
    }
  }
}
import { AttributeOutputBase } from "./attributeoutputbase";
import { SectionPageNumbering, SectionType } from "./docxattributeoutput.numbering";
import type { WW8SepInfo } from "./docxattributeoutput.section";
import {
  AddToAttrList,
  CharGrabBag,
  ExportThemeFonts,
  runOrder,
  impl_WriteRunText,
} from "./docxattributeoutput.run";
export { impl_WriteRunText } from "./docxattributeoutput.run";
import type { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import {
  DFLT_ESC_PROP,
  DFLT_ESC_SUB,
  DFLT_ESC_SUPER,
  DFLT_ESC_AUTO_SUB,
  DFLT_ESC_AUTO_SUPER,
} from "../../../../editeng/inc/escapementitem";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import type { SvxCharHiddenItem } from "../../../../editeng/inc/charhiddenitem";
import type { SvxScriptHintItem } from "../../../../editeng/inc/scripthintitem";
import type { SvxOpticalSizingItem } from "../../../../editeng/inc/opticalsizingitem";
import type { SvxFontVariationsItem } from "../../../../editeng/inc/fontvariationsitem";
import { ScriptHintType } from "../../../../i18nutil/inc/scriptchangescanner";
import { ShadingPattern } from "../../../../offapi/com/sun/star/drawing/ShadingPattern";
import { RES_TXTFMTCOLL } from "../../../inc/hintids";
import { TransColToIco } from "../../../../filter/source/msfilter/util";
import { TransHighlightColor } from "./docxattributeoutput.run";
