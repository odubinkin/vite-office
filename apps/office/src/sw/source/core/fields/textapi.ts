/** @fileoverview Writer annotation text edit source backed by the native EditEngine document. */
import * as EE from "../../../../editeng/inc/eeitem";
import * as Writer from "../../../inc/hintids";
import { EditPaM } from "../../../../editeng/inc/EditPaM";
import { EditEngine } from "../../../../editeng/source/editeng/editeng.lifecycle";
import { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { DocumentImpEditEngine } from "../../../../editeng/source/editeng/impedit2.document";
import type { OUString, OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { EPaM } from "../../../../editeng/inc/EPaM";
import { ESelection } from "../../../../editeng/inc/ESelection";
import * as M from "../../../../editeng/inc/memberids";
import { SvxColorItem } from "../../../../editeng/inc/colritem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  APPEND_PARAGRAPH,
  LINE_BREAK,
  PARAGRAPH_BREAK,
} from "../../../../offapi/com/sun/star/text/ControlCharacter";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { CONVERT_TWIPS } from "../../../../svl/inc/poolitem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxVoidItem } from "../../../../svl/source/items/voiditem";
import { illegal, invalid, noSuchElement, unknown } from "../unocore/unocrsrhelper";

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

/** The Annotation TextRange property exposes an independent EditEngine text and its cursors. */
export class SwTextAPIObject {
  private readonly source = new SwTextAPIEditSource();

  /** Returns the native editor shared by this text and its cursors. @returns Edit source. */
  GetEditSource(): SwTextAPIEditSource {
    return this.source;
  }

  /** Creates a collapsed cursor at the beginning of this text. @returns Text cursor. */
  createTextCursor(): SwTextAPICursor {
    return new SwTextAPICursor(this, new ESelection());
  }

  /** Creates an independent cursor at the same text location. @param range - Source range. @returns Text cursor. */
  createTextCursorByRange(range: SwTextAPICursor): SwTextAPICursor {
    if (range.getText() !== this) invalid("Annotation cursor belongs to another text");
    return new SwTextAPICursor(this, range.GetSelection());
  }

  /** Inserts plain text at a cursor without losing native tab and line-break items. @param range - Destination range. @param value - Inserted text. @param absorb - Replace the selected content. @returns Nothing. */
  insertString(range: SwTextAPICursor, value: OUStringConstReference, absorb: boolean): void {
    if (range.getText() !== this) invalid("Annotation cursor belongs to another text");
    if (!absorb) range.collapseToEnd();
    const chunks = text(value).split("\n");
    for (const [index, chunk] of chunks.entries()) {
      if (index > 0) this.insertControlCharacter(range, LINE_BREAK, false);
      const native = unicode(chunk);
      try {
        range.setString(native);
      } finally {
        native.dispose();
      }
    }
  }

  /** Inserts the represented XSimpleText control characters. @param range - Destination range. @param value - Native control identifier. @param absorb - Replace the selected content. @returns Nothing. */
  insertControlCharacter(range: SwTextAPICursor, value: number, absorb: boolean): void {
    if (range.getText() !== this) invalid("Annotation cursor belongs to another text");
    const engine = this.source.getImpl();
    if (!absorb) range.collapseToEnd();
    const selection = this.source.CreateSelection(range.GetSelection());
    if (value === LINE_BREAK) {
      range.SetPosition(
        engine.CreateEPaM(
          engine.ImpInsertFeature(selection, new SfxVoidItem(EE.EE_FEATURE_LINEBR)),
        ),
      );
    } else if (value === APPEND_PARAGRAPH || value === PARAGRAPH_BREAK) {
      const position = selection.HasRange()
        ? engine.ImpDeleteSelection(selection)
        : selection.Max();
      range.SetPosition(engine.CreateEPaM(engine.ImpInsertParaBreak(position)));
    } else illegal("Unsupported annotation control character");
  }

  /** Reports a text content type outside the annotation edit-text profile. @returns Never. */
  insertTextContent(): never {
    return illegal("Annotation text requires an EditEngine text field");
  }

  /** Releases the owned annotation source. @returns Nothing. */
  dispose(): void {
    this.source.Dispose();
  }
}

/** Annotation text range and cursor over native EditEngine paragraph and UTF-16 positions. */
class SwTextAPICursor {
  private readonly selection: ESelection;

  /** Copies a cursor or selected range in the supplied annotation. @param owner - Actual annotation text. @param selection - Borrowed range. @param paragraphProperties - Applies property writes to the paragraph item set. @returns Cursor. */
  constructor(
    private readonly owner: SwTextAPIObject,
    selection: ESelection,
    private readonly paragraphProperties = false,
  ) {
    this.selection = new ESelection(selection);
    this.selection.Adjust();
  }

  /** Returns the borrowed selection in native coordinates. @returns Current selection. */
  GetSelection(): ESelection {
    return this.selection;
  }

  /** Moves both endpoints to the given native position. @param position - Destination. @returns Nothing. */
  SetPosition(position: EPaM): void {
    this.selection.start = position;
    this.selection.end = position;
  }

  /** Gets the actual annotation text owner. @returns Text. */
  getText(): SwTextAPIObject {
    return this.owner;
  }

  /** Creates a range at the lower endpoint. @returns Start range. */
  getStart(): SwTextAPICursor {
    return new SwTextAPICursor(this.owner, new ESelection(this.selection.start));
  }

  /** Creates a range at the upper endpoint. @returns End range. */
  getEnd(): SwTextAPICursor {
    return new SwTextAPICursor(this.owner, new ESelection(this.selection.end));
  }

  /** Moves this cursor to another range in the same text. @param range - Target range. @param expand - Keep the current anchor. @returns Nothing. */
  gotoRange(range: SwTextAPICursor, expand: boolean): void {
    if (range.owner !== this.owner) invalid("Annotation cursor belongs to another text");
    if (!expand) this.selection.start = range.selection.start;
    this.selection.end = range.selection.end;
    this.selection.Adjust();
  }

  /** Moves to the start of this text. @param expand - Extend the selection back to the start. @returns Nothing. */
  gotoStart(expand: boolean): void {
    if (!expand) this.selection.end = new EPaM();
    this.selection.start = new EPaM();
  }

  /** Moves to the end of this text. @param expand - Extend the original selection. @returns Nothing. */
  gotoEnd(expand: boolean): void {
    const engine = this.owner.GetEditSource().getImpl();
    const end = engine.CreateEPaM(engine.GetEditDoc().GetEndPaM());
    this.selection.end = end;
    if (!expand) this.selection.start = end;
  }

  /** Moves left in paragraph/index coordinates. @param count - Number of positions. @param expand - Whether to keep the upper endpoint. @returns Whether every step was possible. */
  goLeft(count: number, expand: boolean): boolean {
    const doc = this.owner.GetEditSource().getImpl().GetEditDoc();
    const start = this.selection.start;
    let remaining = count;
    while (remaining > 0) {
      const within = Math.min(remaining, start.nIndex);
      remaining -= within;
      start.nIndex -= within;
      if (remaining === 0 || start.nPara === 0) break;
      start.nIndex = doc.GetObject(--start.nPara)?.Len() ?? 0;
      remaining--;
    }
    if (!expand) this.collapseToStart();
    return remaining === 0;
  }

  /** Collapses to the original lower endpoint. @returns Nothing. */
  collapseToStart(): void {
    this.selection.CollapseToStart();
  }

  /** Collapses to the original upper endpoint. @returns Nothing. */
  collapseToEnd(): void {
    this.selection.CollapseToEnd();
  }

  /** Reads the selected text with native feature expansion. @returns Owned string. */
  getString(): OUString {
    const doc = this.owner.GetEditSource().getImpl().GetEditDoc();
    const { start, end } = this.selection;
    const paragraphs: string[] = [];
    for (let index = start.nPara; index <= end.nPara; index++) {
      const node = doc.GetObject(index);
      if (!node) break;
      const value = node.GetExpandedText(
        index === start.nPara ? start.nIndex : 0,
        index === end.nPara ? end.nIndex : -1,
      );
      try {
        paragraphs.push(text(value));
      } finally {
        value.dispose();
      }
    }
    return unicode(paragraphs.join("\n"));
  }

  /** Replaces the selected text through the edit source. @param value - Replacement. @returns Nothing. */
  setString(value: OUStringConstReference): void {
    const source = this.owner.GetEditSource();
    const engine = source.getImpl();
    this.SetPosition(
      engine.CreateEPaM(engine.InsertText(source.CreateSelection(this.selection), value)),
    );
  }

  /** Enumerates selected annotation paragraph ranges. @returns Enumeration. */
  createEnumeration(): { hasMoreElements(): boolean; nextElement(): SwTextAPICursor } {
    let next = this.selection.start.nPara;
    const last = this.selection.end.nPara;
    const doc = this.owner.GetEditSource().getImpl().GetEditDoc();
    return {
      /** Checks the selected paragraph boundary. @returns Whether a paragraph remains. */
      hasMoreElements: () => next <= last,
      /** Creates the next paragraph range. @returns Paragraph text range. */
      nextElement: () => {
        if (next > last) return noSuchElement();
        const start = next === this.selection.start.nPara ? this.selection.start.nIndex : 0;
        const end = next === last ? this.selection.end.nIndex : (doc.GetObject(next)?.Len() ?? 0);
        const range = new SwTextAPICursor(this.owner, new ESelection(next, start, next, end));
        next++;
        return range;
      },
    };
  }

  /** Supplies the native paragraph property range over the same selection. @returns Paragraph property owner. */
  getParagraphPropertySet(): SwTextAPICursor {
    return new SwTextAPICursor(this.owner, this.selection, true);
  }

  /** Reads an annotation text property from the native item. @param name - UNO property name. @returns Owned property value. */
  getPropertyValue(name: OUStringConstReference): Any {
    const entry = textProperties.get(text(name));
    if (entry === undefined) return unknown(text(name));
    const value = new Any();
    (this.GetItem(entry[0]) as { QueryValue(output: Any, member: number): unknown }).QueryValue(
      value,
      entry[1],
    );
    return value;
  }

  /** Applies one native property to this range. @param name - UNO property name. @param value - Typed value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    this.setPropertyValues([name], [value]);
  }

  /** Applies composite UNO properties together to native EditEngine items. @param names - UNO names. @param values - Corresponding typed values. @returns Nothing. */
  setPropertyValues(names: readonly OUStringConstReference[], values: readonly Any[]): void {
    const source = this.owner.GetEditSource();
    const items = new SfxItemSet(source.GetEmptyItemSet());
    try {
      for (const [index, key] of names.entries()) {
        const name = text(key);
        const entry = textProperties.get(name);
        if (!entry) unknown(name);
        const [which, member] = entry;
        const item = (items.GetItemIfSet(which, false) ?? this.GetItem(which)).Clone();
        if (!item) illegal(name);
        let stored = false;
        try {
          if (!putTextProperty(item, values[index] as Any, member, name)) illegal(name);
          stored = true;
          items.Put(item, true);
        } finally {
          if (!stored) item.Dispose();
        }
      }
      if (this.paragraphProperties) {
        const doc = source.getImpl().GetEditDoc();
        for (let index = this.selection.start.nPara; index <= this.selection.end.nPara; index++) {
          const paragraph = doc.GetObject(index);
          if (!paragraph) break;
          const updated = new SfxItemSet(paragraph.GetContentAttribs().GetItems());
          try {
            for (const item of items.entries()) updated.Put(item);
            source.SetParaAttribsOnly(index, updated);
          } finally {
            updated.Dispose();
          }
        }
      } else source.QuickSetAttribs(items, this.selection);
    } finally {
      items.Dispose();
    }
  }

  /** Resolves the range's effective concrete item at its first endpoint. @param which - EditEngine WhichId. @returns Borrowed item. */
  private GetItem(which: number): SfxPoolItem {
    const doc = this.owner.GetEditSource().getImpl().GetEditDoc();
    const node = doc.GetObject(this.selection.start.nPara);
    const direct = this.paragraphProperties
      ? undefined
      : node?.GetCharAttribs().FindAttribRightOpen(which, this.selection.start.nIndex)?.GetItem();
    return (
      direct ??
      node?.GetContentAttribs().GetItems().Get(which) ??
      doc.GetItemPool().GetUserOrPoolDefaultItem(which)
    );
  }

  /** Position values require no explicit release. @returns Nothing. */
  dispose(): void {}
}

/** Native edit character script groups used by the annotation text property map. */
const characterScriptItems = [
  [
    "",
    EE.EE_CHAR_FONTINFO,
    EE.EE_CHAR_FONTHEIGHT,
    EE.EE_CHAR_WEIGHT,
    EE.EE_CHAR_ITALIC,
    EE.EE_CHAR_LANGUAGE,
  ],
  [
    "Asian",
    EE.EE_CHAR_FONTINFO_CJK,
    EE.EE_CHAR_FONTHEIGHT_CJK,
    EE.EE_CHAR_WEIGHT_CJK,
    EE.EE_CHAR_ITALIC_CJK,
    EE.EE_CHAR_LANGUAGE_CJK,
  ],
  [
    "Complex",
    EE.EE_CHAR_FONTINFO_CTL,
    EE.EE_CHAR_FONTHEIGHT_CTL,
    EE.EE_CHAR_WEIGHT_CTL,
    EE.EE_CHAR_ITALIC_CTL,
    EE.EE_CHAR_LANGUAGE_CTL,
  ],
] as const;

/** EditEngine WhichId and member pairs consumed by the annotation XText property set. */
const textProperties = new Map<string, readonly [number, number]>([
  ["CharColor", [EE.EE_CHAR_COLOR, 0]],
  ["CharTransparence", [EE.EE_CHAR_COLOR, M.MID_COLOR_ALPHA]],
  ["CharComplexColor", [EE.EE_CHAR_COLOR, M.MID_COMPLEX_COLOR]],
  ["CharBackColor", [EE.EE_CHAR_BKGCOLOR, 0]],
  ["CharBackTransparent", [EE.EE_CHAR_BKGCOLOR, M.MID_GRAPHIC_TRANSPARENT]],
  ["CharStrikeout", [EE.EE_CHAR_STRIKEOUT, M.MID_CROSS_OUT]],
  ["CharEmphasis", [EE.EE_CHAR_EMPHASISMARK, M.MID_EMPHASIS]],
  ["CharCaseMap", [EE.EE_CHAR_CASEMAP, 0]],
  ["CharEscapement", [EE.EE_CHAR_ESCAPEMENT, M.MID_ESC]],
  ["CharEscapementHeight", [EE.EE_CHAR_ESCAPEMENT, M.MID_ESC_HEIGHT]],
  ["CharUnderline", [EE.EE_CHAR_UNDERLINE, M.MID_TL_STYLE]],
  ["CharUnderlineColor", [EE.EE_CHAR_UNDERLINE, M.MID_TL_COLOR]],
  ["CharUnderlineHasColor", [EE.EE_CHAR_UNDERLINE, M.MID_TL_HASCOLOR]],
  ["CharOverline", [EE.EE_CHAR_OVERLINE, M.MID_TL_STYLE]],
  ["CharOverlineColor", [EE.EE_CHAR_OVERLINE, M.MID_TL_COLOR]],
  ["CharOverlineHasColor", [EE.EE_CHAR_OVERLINE, M.MID_TL_HASCOLOR]],
  ["CharWordMode", [EE.EE_CHAR_WLM, 0]],
  ["CharAutoKerning", [EE.EE_CHAR_PAIRKERNING, 0]],
  ["CharKerning", [EE.EE_CHAR_KERNING, CONVERT_TWIPS]],
  ["ParaAdjust", [EE.EE_PARA_JUST, M.MID_PARA_ADJUST]],
  ["ParaTopMargin", [EE.EE_PARA_ULSPACE, M.MID_UP_MARGIN | CONVERT_TWIPS]],
  ["ParaBottomMargin", [EE.EE_PARA_ULSPACE, M.MID_LO_MARGIN | CONVERT_TWIPS]],
  ["ParaContextMargin", [EE.EE_PARA_ULSPACE, 7]],
  ["ParaLineSpacing", [EE.EE_PARA_SBL, CONVERT_TWIPS]],
  ["ParaTabStops", [EE.EE_PARA_TABS, CONVERT_TWIPS]],
]);

for (const [suffix, font, size, weight, posture, locale] of characterScriptItems) {
  textProperties.set(`CharFontName${suffix}`, [font, 1]);
  textProperties.set(`CharFontStyleName${suffix}`, [font, 2]);
  textProperties.set(`CharFontFamily${suffix}`, [font, 3]);
  textProperties.set(`CharFontPitch${suffix}`, [font, 5]);
  textProperties.set(`CharFontCharSet${suffix}`, [font, 4]);
  textProperties.set(`CharHeight${suffix}`, [size, M.MID_FONTHEIGHT | CONVERT_TWIPS]);
  textProperties.set(`CharWeight${suffix}`, [weight, M.MID_WEIGHT]);
  textProperties.set(`CharPosture${suffix}`, [posture, M.MID_POSTURE]);
  textProperties.set(`CharLocale${suffix}`, [locale, M.MID_LANG_LOCALE]);
}

/** Uses the native item members, including the numeric upper/lower spacing bindings. @param item - Detached destination item. @param value - UNO value. @param member - Original item member. @param name - Property name. @returns Whether accepted. */
function putTextProperty(item: SfxPoolItem, value: Any, member: number, name: string): boolean {
  if (item instanceof SvxULSpaceItem) {
    if (name === "ParaContextMargin") {
      const context: [boolean] = [false];
      return value.extract(context, "bool") && item.PutValue(context[0], member);
    }
    const margin: [number] = [0];
    return value.extract(margin, "sal_Int32") && item.PutValue(margin[0], member);
  }
  return item.PutValue(value, member);
}

/** Projects native EditEngine character values into the common Writer text mapping. @param set - Output character-property set. @param items - Actual edit items. @returns Nothing. */
export function putAnnotationCharacterItems(set: SfxItemSet, items: readonly SfxPoolItem[]): void {
  for (const item of items) {
    const which = item.Which();
    if (which === EE.EE_CHAR_BKGCOLOR && item instanceof SvxColorItem) {
      set.Put(
        new SvxBrushItem(item.GetValue(), item.getComplexColor(), Writer.RES_CHRATR_BACKGROUND),
        true,
      );
    } else {
      const mapped = writerWhich.get(which);
      if (mapped !== undefined) set.PutAsTargetWhich(item, mapped);
    }
  }
}
