/** @fileoverview Native DocxAttributeOutput untracked text/run-property emission. The actual DocxExport owns this attribute output; redlines, fields, drawings, font embedding and paragraph orchestration are not yet admitted. */
import type { DocxExport } from "./docxexport";
import { FontFamily, FontPitch } from "../../../../tools/inc/fontenum";
import { FastSerializerHelper, FSNS, MergeMarks } from "../../../../sax/inc/fshelper";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import type { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import type { SvxKerningItem } from "../../../../editeng/inc/kernitem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { LINE_BREAK } from "../../../../offapi/com/sun/star/text/ControlCharacter";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import type { rtl_TextEncoding } from "../../../../sal/inc/rtl/textenc";
import { FontItalic, FontWeight, FontStrikeout } from "../../../../tools/inc/fontenum";
import {
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONTSIZE,
} from "../../../inc/hintids";
const w = token("w"),
  val = FSNS(w, token("val"));
const runOrder = [
  FSNS(token("w"), token("del")),
  FSNS(token("w"), token("ins")),
  FSNS(token("w"), token("moveFrom")),
  FSNS(token("w"), token("moveTo")),
  FSNS(token("w"), token("rStyle")),
  FSNS(token("w"), token("rFonts")),
  FSNS(token("w"), token("b")),
  FSNS(token("w"), token("bCs")),
  FSNS(token("w"), token("i")),
  FSNS(token("w"), token("iCs")),
  FSNS(token("w"), token("caps")),
  FSNS(token("w"), token("smallCaps")),
  FSNS(token("w"), token("strike")),
  FSNS(token("w"), token("dstrike")),
  FSNS(token("w"), token("outline")),
  FSNS(token("w"), token("shadow")),
  FSNS(token("w"), token("emboss")),
  FSNS(token("w"), token("imprint")),
  FSNS(token("w"), token("noProof")),
  FSNS(token("w"), token("snapToGrid")),
  FSNS(token("w"), token("vanish")),
  FSNS(token("w"), token("webHidden")),
  FSNS(token("w"), token("color")),
  FSNS(token("w"), token("spacing")),
  FSNS(token("w"), token("w")),
  FSNS(token("w"), token("kern")),
  FSNS(token("w"), token("position")),
  FSNS(token("w"), token("sz")),
  FSNS(token("w"), token("szCs")),
  FSNS(token("w"), token("highlight")),
  FSNS(token("w"), token("u")),
  FSNS(token("w"), token("effect")),
  FSNS(token("w"), token("bdr")),
  FSNS(token("w"), token("shd")),
  FSNS(token("w"), token("fitText")),
  FSNS(token("w"), token("vertAlign")),
  FSNS(token("w"), token("rtl")),
  FSNS(token("w"), token("cs")),
  FSNS(token("w"), token("em")),
  FSNS(token("w"), token("lang")),
  FSNS(token("w"), token("eastAsianLayout")),
  FSNS(token("w"), token("specVanish")),
  FSNS(token("w"), token("oMath")),
  FSNS(token("w"), token("rPrChange")),
  FSNS(token("w14"), token("glow")),
  FSNS(token("w14"), token("shadow")),
  FSNS(token("w14"), token("reflection")),
  FSNS(token("w14"), token("textOutline")),
  FSNS(token("w14"), token("textFill")),
  FSNS(token("w14"), token("scene3d")),
  FSNS(token("w14"), token("props3d")),
  FSNS(token("w14"), token("ligatures")),
  FSNS(token("w14"), token("numForm")),
  FSNS(token("w14"), token("numSpacing")),
  FSNS(token("w14"), token("stylisticSets")),
  FSNS(token("w14"), token("cntxtAlts")),
];
/** Native file-local UTF16 segment writer; begin is the erased pointer-reference binding. @param serializer - Actual serializer. @param textToken - Native text token. @param text - UTF16 buffer. @param begin - Mutable pointer index. @param end - End pointer index. @param move - Advance past delimiter. @param symbolFont - Original final-segment symbol font. @returns Whether a nonempty segment was written. */
export function impl_WriteRunText(
  serializer: FastSerializerHelper,
  textToken: number,
  text: string,
  begin: [number],
  end: number,
  move = true,
  symbolFont = "",
): boolean {
  const start = begin[0];
  if (move) begin[0] = end + 1;
  if (start >= end) return false;
  if (symbolFont) {
    for (let index = start; index < end; ++index)
      serializer.singleElementNS(
        w,
        token("sym"),
        FSNS(w, token("font")),
        symbolFont,
        FSNS(w, token("char")),
        text.charCodeAt(index).toString(16).padStart(4, "0"),
      );
  } else {
    if (text.charCodeAt(start) === 32 || text.charCodeAt(end - 1) === 32)
      serializer.startElementNS(w, textToken, FSNS(token("xml"), token("space")), "preserve");
    else serializer.startElementNS(w, textToken);
    serializer.writeEscaped(text.slice(start, end));
    serializer.endElementNS(w, textToken);
  }
  return true;
}
/** Native owner for the admitted untracked text and collected character properties. */
export class DocxAttributeOutput {
  private m_pFontsAttrList: FastAttributeList | null = null;
  private m_oFontSize: number | undefined;
  private m_bCharPostureWritten = false;
  private m_sRawText = "";
  /** Consumed native constructor binds the real exporter and serializer. DrawingML/base/table-style owners remain unported. @param m_rExport - Actual exporter. @param m_pSerializer - Actual fragment serializer. @returns Attribute output. */
  constructor(
    private readonly m_rExport: DocxExport,
    private m_pSerializer: FastSerializerHelper,
  ) {}
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
  /** Native font registration precedes empty-name and duplicate guards. @param font - Actual shared font item. @returns Nothing. */
  CharFont(font: SvxFontItem): void {
    this.GetExport().GetId(font);
    const name = font.GetFamilyName();
    if (!name) return;
    if (
      this.m_pFontsAttrList &&
      (this.m_pFontsAttrList.hasAttribute(FSNS(w, token("ascii"))) ||
        this.m_pFontsAttrList.hasAttribute(FSNS(w, token("hAnsi"))))
    )
      return;
    this.m_pFontsAttrList ??= FastSerializerHelper.createAttrList();
    this.m_pFontsAttrList.addNS(w, token("ascii"), name);
    this.m_pFontsAttrList.addNS(w, token("hAnsi"), name);
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
    this.m_pFontsAttrList = null;
    this.m_oFontSize = undefined;
    this.m_bCharPostureWritten = false;
    this.m_pSerializer.mark(11, runOrder);
  }
  /** Original collected fonts detach and optional font height, including zero. @returns Nothing. */
  WriteCollectedRunProperties(): void {
    if (this.m_pFontsAttrList) {
      const fonts = this.m_pFontsAttrList;
      this.m_pFontsAttrList = null;
      this.m_pSerializer.singleElementNS(w, token("rFonts"), fonts);
    }
    if (this.m_oFontSize !== undefined) {
      this.m_pSerializer.singleElementNS(w, token("sz"), val, String(this.m_oFontSize));
      this.m_oFontSize = undefined;
    }
  }
  /** Native untracked-property completion prepends properties before pending text. @returns Nothing. */
  EndRunProperties(): void {
    this.WriteCollectedRunProperties();
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
    if (this.m_pFontsAttrList?.hasAttribute(attribute)) return;
    this.m_pFontsAttrList ??= FastSerializerHelper.createAttrList();
    this.m_pFontsAttrList.add(attribute, item.GetFamilyName());
  }
  /** Original duplicate font attribute guard; empty names are retained. @param item - Actual shared font. @returns Nothing. */
  CharFontCTL(item: SvxFontItem): void {
    const attribute = FSNS(w, token("cs"));
    if (this.m_pFontsAttrList?.hasAttribute(attribute)) return;
    this.m_pFontsAttrList ??= FastSerializerHelper.createAttrList();
    this.m_pFontsAttrList.add(attribute, item.GetFamilyName());
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
}
