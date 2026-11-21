/** @fileoverview Writer annotation text edit source backed by the native EditEngine document. */
import * as EE from "../../../../editeng/inc/eeitem";
import * as Writer from "../../../inc/hintids";
import { EditPaM } from "../../../../editeng/inc/EditPaM";
import { EditEngine } from "../../../../editeng/source/editeng/editeng.lifecycle";
import { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { DocumentImpEditEngine } from "../../../../editeng/source/editeng/impedit2.document";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

/** Writer text edit source over the available EditEngine text-object owner. */
export class SwTextAPIEditSource extends EditEngine {
  private readonly engine = new DocumentImpEditEngine(this, EditEngine.CreatePool());

  /** Initializes annotation text without a layout device or a separate undo history. @returns Edit source. */
  constructor() {
    super();
    this.SetUpdateLayout(false);
    this.EnableUndo(false);
  }

  /** Returns the editor that owns the native content and attribute runs. @returns EditEngine implementation. */
  getImpl(): DocumentImpEditEngine {
    return this.engine;
  }

  /** Loads the source text with its original native formatting when supplied. @param value - Plain or formatted annotation text. @returns Nothing. */
  override SetText(value: OUStringConstReference | EditTextObject): void {
    if (value instanceof EditTextObject) this.engine.SetTextObject(value);
    else super.SetText(value);
  }

  /** Splits the paragraph at its native text position. @param paragraph - Native paragraph index. @param offset - UTF-16 offset. @returns Beginning of the new paragraph. */
  SplitContent(paragraph: number, offset: number): EditPaM {
    const node = this.engine.GetEditDoc().GetObject(paragraph);
    return this.engine.ImpInsertParaBreak(new EditPaM(node, offset));
  }

  /** Joins the native adjacent paragraphs and updates their corresponding portion list. @param left - First paragraph index. @returns Join position. */
  ConnectContents(left: number): EditPaM {
    const doc = this.engine.GetEditDoc();
    const first = doc.GetObject(left);
    const second = doc.GetObject(left + 1);
    if (!first || !second) throw new Error("Writer comment join is outside its editor.");
    const position = doc.ConnectParagraphs(first, second);
    this.engine.GetParaPortions().Remove(left + 1);
    return position;
  }

  /** Releases native paragraph and editor state. @returns Nothing. */
  Dispose(): void {
    this.engine.Dispose();
  }
}

/** Matching concrete EditEngine and Writer items whose value codecs are registered in SwAttrPool. */
const writerWhich = new Map<number, number>([
  [EE.EE_PARA_ULSPACE, Writer.RES_UL_SPACE],
  [EE.EE_PARA_SBL, Writer.RES_PARATR_LINESPACING],
  [EE.EE_PARA_JUST, Writer.RES_PARATR_ADJUST],
  [EE.EE_PARA_TABS, Writer.RES_PARATR_TABSTOP],
  [EE.EE_CHAR_COLOR, Writer.RES_CHRATR_COLOR],
  [EE.EE_CHAR_BKGCOLOR, Writer.RES_CHRATR_COLOR],
  [EE.EE_CHAR_FONTINFO, Writer.RES_CHRATR_FONT],
  [EE.EE_CHAR_FONTHEIGHT, Writer.RES_CHRATR_FONTSIZE],
  [EE.EE_CHAR_FONTWIDTH, Writer.RES_CHRATR_SCALEW],
  [EE.EE_CHAR_WEIGHT, Writer.RES_CHRATR_WEIGHT],
  [EE.EE_CHAR_UNDERLINE, Writer.RES_CHRATR_UNDERLINE],
  [EE.EE_CHAR_STRIKEOUT, Writer.RES_CHRATR_CROSSEDOUT],
  [EE.EE_CHAR_ITALIC, Writer.RES_CHRATR_POSTURE],
  [EE.EE_CHAR_OUTLINE, Writer.RES_CHRATR_CONTOUR],
  [EE.EE_CHAR_SHADOW, Writer.RES_CHRATR_SHADOWED],
  [EE.EE_CHAR_ESCAPEMENT, Writer.RES_CHRATR_ESCAPEMENT],
  [EE.EE_CHAR_PAIRKERNING, Writer.RES_CHRATR_AUTOKERN],
  [EE.EE_CHAR_KERNING, Writer.RES_CHRATR_KERNING],
  [EE.EE_CHAR_WLM, Writer.RES_CHRATR_WORDLINEMODE],
  [EE.EE_CHAR_LANGUAGE, Writer.RES_CHRATR_LANGUAGE],
  [EE.EE_CHAR_LANGUAGE_CJK, Writer.RES_CHRATR_CJK_LANGUAGE],
  [EE.EE_CHAR_LANGUAGE_CTL, Writer.RES_CHRATR_CTL_LANGUAGE],
  [EE.EE_CHAR_FONTINFO_CJK, Writer.RES_CHRATR_CJK_FONT],
  [EE.EE_CHAR_FONTINFO_CTL, Writer.RES_CHRATR_CTL_FONT],
  [EE.EE_CHAR_FONTHEIGHT_CJK, Writer.RES_CHRATR_CJK_FONTSIZE],
  [EE.EE_CHAR_FONTHEIGHT_CTL, Writer.RES_CHRATR_CTL_FONTSIZE],
  [EE.EE_CHAR_WEIGHT_CJK, Writer.RES_CHRATR_CJK_WEIGHT],
  [EE.EE_CHAR_WEIGHT_CTL, Writer.RES_CHRATR_CTL_WEIGHT],
  [EE.EE_CHAR_ITALIC_CJK, Writer.RES_CHRATR_CJK_POSTURE],
  [EE.EE_CHAR_ITALIC_CTL, Writer.RES_CHRATR_CTL_POSTURE],
  [EE.EE_CHAR_EMPHASISMARK, Writer.RES_CHRATR_EMPHASIS_MARK],
  [EE.EE_CHAR_RELIEF, Writer.RES_CHRATR_RELIEF],
  [EE.EE_CHAR_OVERLINE, Writer.RES_CHRATR_OVERLINE],
  [EE.EE_CHAR_CASEMAP, Writer.RES_CHRATR_CASEMAP],
]);

/** Resolves an equivalent Writer item for annotation values shared by both text objects. @param which - EditEngine WhichId. @returns Equivalent Writer WhichId when represented. */
export function getWriterAnnotationItemWhich(which: number): number | undefined {
  return writerWhich.get(which);
}
