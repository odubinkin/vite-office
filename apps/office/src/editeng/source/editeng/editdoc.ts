/** @fileoverview Original EditDoc paragraph ownership/text operations, font assembly and EditEngineItemPool over actual shared items. Native pool reference counting remains the existing GC boundary. */
import { InsertAttrib } from "./editdoc.attributes";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getItemInfoPackageEditEngine } from "./eerdll";
import { LineEnd } from "../../../tools/inc/lineend";
import type { OUString } from "../../../sal/inc/rtl/ustring";

/** Original concrete EditEngine pool,not a document or rendering service. */
export class EditEngineItemPool extends SfxItemPool {
  /** Original pool name and complete default-package registration. @returns Pool. */
  constructor() {
    const name = unicode("EditEngineItemPool");
    super(name);
    name.dispose();
    this.registerItemInfoPackage(getItemInfoPackageEditEngine());
  }
}

/** Original EditDoc::GetSepStr static responsibility,with C++ qualification erased by the ESM namespace. @param end - Native line-end selection. @returns Owned native string. */
export function GetSepStr(end: LineEnd): OUString {
  if (end === LineEnd.LINEEND_CR) return unicode("\r");
  if (end === LineEnd.LINEEND_LF) return unicode("\n");
  return unicode("\r\n");
}

import * as EE from "../../inc/eeitem";
import * as Attr from "../../inc/editattr";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** Original header GetAttrib pointer lookup within the source size_t index domain. @param attributes - Actual source owner vector. @param index - Original nonnegative size_t index. @returns Actual pointer or source null. */
export function GetAttrib(
  attributes: readonly Attr.EditCharAttrib[],
  index: number,
): Attr.EditCharAttrib | null {
  return index < attributes.length ? (attributes[index] as Attr.EditCharAttrib) : null;
}

/** Original complete item-ID dispatch. Invalid IDs reach the original diagnostic/null path; no generic fallback attribute is invented. @param pool - Actual pool. @param item - Actual source item. @param start - Source start. @param end - Source end. @returns Actual concrete owner or original null result. */
export function MakeCharAttrib(
  pool: SfxItemPool,
  item: SfxPoolItem,
  start: number,
  end: number,
): Attr.EditCharAttrib | null {
  switch (item.Which()) {
    case EE.EE_CHAR_LANGUAGE:
    case EE.EE_CHAR_LANGUAGE_CJK:
    case EE.EE_CHAR_LANGUAGE_CTL:
      return new Attr.EditCharAttribLanguage(pool, item, start, end);
    case EE.EE_CHAR_COLOR:
      return new Attr.EditCharAttribColor(pool, item, start, end);
    case EE.EE_CHAR_FONTINFO:
    case EE.EE_CHAR_FONTINFO_CJK:
    case EE.EE_CHAR_FONTINFO_CTL:
      return new Attr.EditCharAttribFont(pool, item, start, end);
    case EE.EE_CHAR_FONTHEIGHT:
    case EE.EE_CHAR_FONTHEIGHT_CJK:
    case EE.EE_CHAR_FONTHEIGHT_CTL:
      return new Attr.EditCharAttribFontHeight(pool, item, start, end);
    case EE.EE_CHAR_FONTWIDTH:
      return new Attr.EditCharAttribFontWidth(pool, item, start, end);
    case EE.EE_CHAR_WEIGHT:
    case EE.EE_CHAR_WEIGHT_CJK:
    case EE.EE_CHAR_WEIGHT_CTL:
      return new Attr.EditCharAttribWeight(pool, item, start, end);
    case EE.EE_CHAR_UNDERLINE:
      return new Attr.EditCharAttribUnderline(pool, item, start, end);
    case EE.EE_CHAR_OVERLINE:
      return new Attr.EditCharAttribOverline(pool, item, start, end);
    case EE.EE_CHAR_EMPHASISMARK:
      return new Attr.EditCharAttribEmphasisMark(pool, item, start, end);
    case EE.EE_CHAR_RELIEF:
      return new Attr.EditCharAttribRelief(pool, item, start, end);
    case EE.EE_CHAR_STRIKEOUT:
      return new Attr.EditCharAttribStrikeout(pool, item, start, end);
    case EE.EE_CHAR_ITALIC:
    case EE.EE_CHAR_ITALIC_CJK:
    case EE.EE_CHAR_ITALIC_CTL:
      return new Attr.EditCharAttribItalic(pool, item, start, end);
    case EE.EE_CHAR_OUTLINE:
      return new Attr.EditCharAttribOutline(pool, item, start, end);
    case EE.EE_CHAR_SHADOW:
      return new Attr.EditCharAttribShadow(pool, item, start, end);
    case EE.EE_CHAR_ESCAPEMENT:
      return new Attr.EditCharAttribEscapement(pool, item, start, end);
    case EE.EE_CHAR_PAIRKERNING:
      return new Attr.EditCharAttribPairKerning(pool, item, start, end);
    case EE.EE_CHAR_KERNING:
      return new Attr.EditCharAttribKerning(pool, item, start, end);
    case EE.EE_CHAR_WLM:
      return new Attr.EditCharAttribWordLineMode(pool, item, start, end);
    case EE.EE_CHAR_XMLATTRIBS:
      return new Attr.EditCharAttrib(pool, item, start, end);
    case EE.EE_CHAR_CASEMAP:
      return new Attr.EditCharAttribCaseMap(pool, item, start, end);
    case EE.EE_CHAR_GRABBAG:
      return new Attr.EditCharAttribGrabBag(pool, item, start, end);
    case EE.EE_FEATURE_TAB:
      return new Attr.EditCharAttribTab(pool, item, start);
    case EE.EE_FEATURE_LINEBR:
      return new Attr.EditCharAttribLineBreak(pool, item, start);
    case EE.EE_FEATURE_FIELD:
      return new Attr.EditCharAttribField(pool, item, start);
    case EE.EE_CHAR_BKGCOLOR:
      return new Attr.EditCharAttribBackgroundColor(pool, item, start, end);
    case EE.EE_CHAR_RUBY:
      return new Attr.EditCharAttribRuby(pool, item, start, end);
    case EE.EE_CHAR_SCRIPT_HINT:
      return new Attr.EditCharAttribScriptHint(pool, item, start, end);
    case EE.EE_CHAR_OPTICALSIZING:
      return new Attr.EditCharAttribOpticalSizing(pool, item, start, end);
    case EE.EE_CHAR_FONTVARIATIONS:
      return new Attr.EditCharAttribFontVariations(pool, item, start, end);
    default:
      return null;
  }
}

import { SvxFont, type ConstSvxFont } from "../../inc/svxfont";
import { Font } from "../../../vcl/source/font/font";
import { FontKerning } from "../../../vcl/inc/fntstyle";
import { TextAlign } from "../../../tools/inc/fontenum";
import { Size } from "../../../tools/inc/gen";
import { SvtScriptType } from "../../../svl/inc/languageoptions";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import { SvxFontItem } from "../../inc/fontitem";
import { SvxLanguageItem } from "../../inc/langitem";
import { SvxColorItem } from "../../inc/colritem";
import { SvxFontHeightItem } from "../../inc/fhgtitem";
import { SvxWeightItem } from "../../inc/wghtitem";
import { SvxUnderlineItem, SvxOverlineItem } from "../../inc/udlnitem";
import { SvxCrossedOutItem } from "../../inc/crossedoutitem";
import { SvxCaseMapItem } from "../../inc/cmapitem";
import { SvxPostureItem } from "../../inc/postitem";
import { SvxContourItem } from "../../inc/contouritem";
import { SvxShadowedItem } from "../../inc/shdditem";
import { SvxEscapementItem } from "../../inc/escapementitem";
import { SvxAutoKernItem } from "../../inc/autokernitem";
import { SvxKerningItem } from "../../inc/kernitem";
import { SvxWordLineModeItem } from "../../inc/wrlmitem";
import { SvxEmphasisMarkItem } from "../../inc/emphasismarkitem";
import { SvxCharReliefItem } from "../../inc/charreliefitem";
import { SvxOpticalSizingItem } from "../../inc/opticalsizingitem";
import { SvxFontVariationsItem } from "../../inc/fontvariationsitem";

/** Original script-specific selection, mapping only exact ASIAN/COMPLEX flags. @param item - Original base ID. @param script - Original flag value. @returns Source selected ID. */
export function GetScriptItemId(item: number, script: SvtScriptType): number {
  let id = item;
  if (script === SvtScriptType.ASIAN || script === SvtScriptType.COMPLEX) {
    switch (item) {
      case EE.EE_CHAR_LANGUAGE:
        id = script === SvtScriptType.ASIAN ? EE.EE_CHAR_LANGUAGE_CJK : EE.EE_CHAR_LANGUAGE_CTL;
        break;
      case EE.EE_CHAR_FONTINFO:
        id = script === SvtScriptType.ASIAN ? EE.EE_CHAR_FONTINFO_CJK : EE.EE_CHAR_FONTINFO_CTL;
        break;
      case EE.EE_CHAR_FONTHEIGHT:
        id = script === SvtScriptType.ASIAN ? EE.EE_CHAR_FONTHEIGHT_CJK : EE.EE_CHAR_FONTHEIGHT_CTL;
        break;
      case EE.EE_CHAR_WEIGHT:
        id = script === SvtScriptType.ASIAN ? EE.EE_CHAR_WEIGHT_CJK : EE.EE_CHAR_WEIGHT_CTL;
        break;
      case EE.EE_CHAR_ITALIC:
        id = script === SvtScriptType.ASIAN ? EE.EE_CHAR_ITALIC_CJK : EE.EE_CHAR_ITALIC_CTL;
        break;
    }
  }
  return id;
}
/** Original complete paragraph font assembly from actual item values, including source guard order and base-font restoration. @param font - Mutable derived font. @param set - Actual paragraph/style set. @param searchParent - Original inherited/default lookup choice. @param script - Original script selector. @returns Nothing. */
export function CreateFont(
  font: SvxFont,
  set: SfxItemSet,
  searchParent = true,
  script = SvtScriptType.NONE,
): void {
  const previous = new Font(font);
  font.SetAlignment(TextAlign.ALIGN_BASELINE);
  const fontInfo = GetScriptItemId(EE.EE_CHAR_FONTINFO, script),
    language = GetScriptItemId(EE.EE_CHAR_LANGUAGE, script),
    height = GetScriptItemId(EE.EE_CHAR_FONTHEIGHT, script),
    weight = GetScriptItemId(EE.EE_CHAR_WEIGHT, script),
    italic = GetScriptItemId(EE.EE_CHAR_ITALIC, script);
  if (searchParent || set.GetItemState(fontInfo) === SfxItemState.SET) {
    const item = set.Get(fontInfo) as SvxFontItem;
    font.SetFamilyName(item.GetFamilyName());
    font.SetFamily(item.GetFamily());
    font.SetPitch(item.GetPitch());
    font.SetCharSet(item.GetCharSet());
  }
  if (searchParent || set.GetItemState(language) === SfxItemState.SET)
    font.SetLanguage((set.Get(language) as SvxLanguageItem).GetLanguage());
  if (searchParent || set.GetItemState(EE.EE_CHAR_COLOR) === SfxItemState.SET)
    font.SetColor((set.Get(EE.EE_CHAR_COLOR) as SvxColorItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_BKGCOLOR) === SfxItemState.SET) {
    const color = (set.Get(EE.EE_CHAR_BKGCOLOR) as SvxColorItem).GetValue();
    font.SetTransparent(color.IsTransparent());
    font.SetFillColor(color);
  }
  if (searchParent || set.GetItemState(height) === SfxItemState.SET)
    font.SetFontSize(
      new Size(font.GetFontSize().Width(), (set.Get(height) as SvxFontHeightItem).GetHeight()),
    );
  if (searchParent || set.GetItemState(weight) === SfxItemState.SET)
    font.SetWeight((set.Get(weight) as SvxWeightItem).GetWeight());
  if (searchParent || set.GetItemState(EE.EE_CHAR_UNDERLINE) === SfxItemState.SET)
    font.SetUnderline((set.Get(EE.EE_CHAR_UNDERLINE) as SvxUnderlineItem).GetLineStyle());
  if (searchParent || set.GetItemState(EE.EE_CHAR_OVERLINE) === SfxItemState.SET)
    font.SetOverline((set.Get(EE.EE_CHAR_OVERLINE) as SvxOverlineItem).GetLineStyle());
  if (searchParent || set.GetItemState(EE.EE_CHAR_STRIKEOUT) === SfxItemState.SET)
    font.SetStrikeout((set.Get(EE.EE_CHAR_STRIKEOUT) as SvxCrossedOutItem).GetStrikeout());
  if (searchParent || set.GetItemState(EE.EE_CHAR_CASEMAP) === SfxItemState.SET)
    font.SetCaseMap((set.Get(EE.EE_CHAR_CASEMAP) as SvxCaseMapItem).GetCaseMap());
  if (searchParent || set.GetItemState(italic) === SfxItemState.SET)
    font.SetItalic((set.Get(italic) as SvxPostureItem).GetPosture());
  if (searchParent || set.GetItemState(EE.EE_CHAR_OUTLINE) === SfxItemState.SET)
    font.SetOutline((set.Get(EE.EE_CHAR_OUTLINE) as SvxContourItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_SHADOW) === SfxItemState.SET)
    font.SetShadow((set.Get(EE.EE_CHAR_SHADOW) as SvxShadowedItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_ESCAPEMENT) === SfxItemState.SET) {
    const item = set.Get(EE.EE_CHAR_ESCAPEMENT) as SvxEscapementItem;
    font.SetPropr(item.GetProportionalHeight());
    font.SetNonAutoEscapement(item.GetEsc());
  }
  if (searchParent || set.GetItemState(EE.EE_CHAR_PAIRKERNING) === SfxItemState.SET)
    font.SetKerning(
      (set.Get(EE.EE_CHAR_PAIRKERNING) as SvxAutoKernItem).GetValue()
        ? FontKerning.FontSpecific
        : FontKerning.NONE,
    );
  if (searchParent || set.GetItemState(EE.EE_CHAR_KERNING) === SfxItemState.SET)
    font.SetFixKerning((set.Get(EE.EE_CHAR_KERNING) as SvxKerningItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_WLM) === SfxItemState.SET)
    font.SetWordLineMode((set.Get(EE.EE_CHAR_WLM) as SvxWordLineModeItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_EMPHASISMARK) === SfxItemState.SET)
    font.SetEmphasisMark(
      (set.Get(EE.EE_CHAR_EMPHASISMARK) as SvxEmphasisMarkItem).GetEmphasisMark(),
    );
  if (searchParent || set.GetItemState(EE.EE_CHAR_RELIEF) === SfxItemState.SET)
    font.SetRelief((set.Get(EE.EE_CHAR_RELIEF) as SvxCharReliefItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_OPTICALSIZING) === SfxItemState.SET)
    font.SetOpticalSizing((set.Get(EE.EE_CHAR_OPTICALSIZING) as SvxOpticalSizingItem).GetValue());
  if (searchParent || set.GetItemState(EE.EE_CHAR_FONTVARIATIONS) === SfxItemState.SET)
    font.SetVariations(
      (set.Get(EE.EE_CHAR_FONTVARIATIONS) as SvxFontVariationsItem).GetVariations(),
    );
  if (font.Equals(previous)) font.assign(previous, true);
}

import { ContentNode, ContentAttribs } from "../../inc/ContentNode";
import { EditPaM } from "../../inc/EditPaM";
import { EE_PARA_MAX } from "../../inc/EPaM";
import { TextRotation } from "../../inc/editobj";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxStyleSheet } from "../../../svl/inc/style";

/** Original default tab distance in the EditEngine document's unit. */
export const DEFTAB = 720;
/** Actual original paragraph owner and text-editing member group. Rendering, views, undo and collaboration are separate owners. */
export class EditDoc {
  private readonly mnLastCache: [number] = [0];
  private readonly maContents: ContentNode[] = [];
  private mpItemPool: SfxItemPool;
  private maModifyHdl: ((argument: null) => void) | null = null;
  private readonly maDefFont = new SvxFont();
  private mnDefTab = DEFTAB;
  private mbIsVertical = false;
  private mnRotation = TextRotation.NONE;
  private mbIsFixedCellHeight = false;
  private mbModified = false;
  /** Original constructor deliberately does not create a paragraph; the engine calls Clear. @param pool - Actual shared pool or original null selection. @returns Document. */
  constructor(pool: SfxItemPool | null = null) {
    this.mpItemPool = pool ?? new EditEngineItemPool();
  }
  /** Original paragraph owner destruction; native shared pool lifetime remains the existing GC binding. @returns Nothing. */
  dispose(): void {
    this.destroyContents();
  }
  /** Original vector clear destroys every actual paragraph owner. @returns Nothing. */
  private destroyContents(): void {
    for (const node of this.maContents) node.dispose();
    this.maContents.length = 0;
  }
  /** Original borrowed item pool. @returns Actual pool. */
  GetItemPool(): SfxItemPool {
    return this.mpItemPool;
  }
  /** Original pool-reference assignment. @param pool - Actual pool. @returns Nothing. */
  SetItemPool(pool: SfxItemPool): void {
    this.mpItemPool = pool;
  }
  /** Original signed count with source overflow saturation. @returns Paragraph count. */
  Count(): number {
    return Math.min(this.maContents.length, 0x7fffffff);
  }
  /** Original bounds-checked node pointer. @param position - Source index. @returns Actual borrowed node or null. */
  GetObject(position: number): ContentNode | null {
    return position >= 0 && position < this.maContents.length
      ? (this.maContents[position] as ContentNode)
      : null;
  }
  /** Original cached reverse lookup, with its exact near-cache window then complete scan. @param node - Source nonowning pointer. @returns Index or EE_PARA_MAX. */
  GetPos(node: ContentNode | null): number {
    return FastGetPos(this.maContents, node, this.mnLastCache);
  }
  /** Original unique-owner insertion; source overflow rejection destroys the transferred node. @param position - Defined insertion position. @param node - Transferred owner. @returns Nothing. */
  Insert(position: number, node: ContentNode): void {
    if (position < 0 || position === 0x7fffffff) {
      node.dispose();
      return;
    }
    this.maContents.splice(position, 0, node);
  }
  /** Original erase and destruction, preserving out-of-range no-op. @param position - Source position. @returns Nothing. */
  Remove(position: number): void {
    if (position < 0 || position >= this.maContents.length) return;
    (this.maContents.splice(position, 1)[0] as ContentNode).dispose();
  }
  /** Original unique-owner release, preserving invalid null. @param position - Source position. @returns Actual transferred owner or null. */
  Release(position: number): ContentNode | null {
    if (position < 0 || position >= this.maContents.length) return null;
    return this.maContents.splice(position, 1)[0] as ContentNode;
  }
  /** Original modified bit. @returns Source flag. */
  IsModified(): boolean {
    return this.mbModified;
  }
  /** Binds the original Link invocation to its JavaScript callable, without a default callback/provider. @param handler - Selected callable or absent Link. @returns Nothing. */
  SetModifyHdl(handler: ((argument: null) => void) | null): void {
    this.maModifyHdl = handler;
  }
  /** Original every-true-call notification, even if already modified. @param modified - Source flag. @returns Nothing. */
  SetModified(modified: boolean): void {
    this.mbModified = modified;
    if (modified) this.maModifyHdl?.(null);
  }
  /** Original default-tab assignment, selecting DEFTAB for zero. @param value - Source uint16. @returns Nothing. */
  SetDefTab(value: number): void {
    this.mnDefTab = value & 0xffff || DEFTAB;
  }
  /** Original default tab getter. @returns Stored distance. */
  GetDefTab(): number {
    return this.mnDefTab;
  }
  /** Original raw vertical flag. @param vertical - Source flag. @returns Nothing. */
  SetVertical(vertical: boolean): void {
    this.mbIsVertical = vertical;
  }
  /** Original raw vertical query. @returns Source flag. */
  GetVertical(): boolean {
    return this.mbIsVertical;
  }
  /** Original raw rotation assignment. @param rotation - Source rotation. @returns Nothing. */
  SetRotation(rotation: TextRotation): void {
    this.mnRotation = rotation;
  }
  /** Original rotation query. @returns Source rotation. */
  GetRotation(): TextRotation {
    return this.mnRotation;
  }
  /** Original effective-vertical truth table. @returns Source predicate. */
  IsEffectivelyVertical(): boolean {
    return (
      (this.mbIsVertical && this.mnRotation === TextRotation.NONE) ||
      (!this.mbIsVertical && this.mnRotation !== TextRotation.NONE)
    );
  }
  /** Original top-to-bottom truth table. @returns Source predicate. */
  IsTopToBottom(): boolean {
    return (
      (this.mbIsVertical && this.mnRotation === TextRotation.NONE) ||
      (!this.mbIsVertical && this.mnRotation === TextRotation.TOPTOBOTTOM)
    );
  }
  /** Original fixed-height flag assignment. @param value - Source flag. @returns Nothing. */
  SetFixedCellHeight(value: boolean): void {
    this.mbIsFixedCellHeight = value;
  }
  /** Original fixed-height query. @returns Source flag. */
  IsFixedCellHeight(): boolean {
    return this.mbIsFixedCellHeight;
  }
  /** Original borrowed cached default font. @returns Actual value. */
  GetDefFont(): ConstSvxFont {
    return this.maDefFont;
  }
  /** Original document default font, orientation and optional paragraph style recalculation. @param useStyles - Original recalc selection. @returns Nothing. */
  CreateDefFont(useStyles: boolean): void {
    const set = new SfxItemSet(this.mpItemPool, [[EE.EE_PARA_START, EE.EE_CHAR_END]]);
    try {
      CreateFont(this.maDefFont, set);
    } finally {
      set.Dispose();
    }
    this.maDefFont.SetVertical(this.IsEffectivelyVertical());
    this.maDefFont.SetOrientation(
      this.IsEffectivelyVertical() ? (this.IsTopToBottom() ? 2700 : 900) : 0,
    );
    for (const node of this.maContents) {
      node.GetCharAttribs().GetDefFont().assign(this.maDefFont);
      if (useStyles) node.CreateDefFont();
    }
  }
  /** Original reset to one empty paragraph and unmodified state. @returns Borrowed start position value. */
  Clear(): EditPaM {
    this.destroyContents();
    const node = new ContentNode(this.mpItemPool);
    this.Insert(0, node);
    this.CreateDefFont(false);
    this.SetModified(false);
    return new EditPaM(node, 0);
  }
  /** Original text removal preserves first-paragraph style, hard set and base font, while marking modified. @returns New start. */
  RemoveText(): EditPaM {
    const previous = this.GetObject(0) as ContentNode,
      style = previous.GetStyleSheet(),
      set = new SfxItemSet(previous.GetContentAttribs().GetItems()),
      font = new Font(previous.GetCharAttribs().GetDefFont());
    try {
      this.destroyContents();
      const node = new ContentNode(this.mpItemPool);
      this.Insert(0, node);
      node.SetStyleSheet(style, false);
      node.GetContentAttribs().GetItems().Set(set);
      node.GetCharAttribs().GetDefFont().assign(font, true);
      this.SetModified(true);
      return new EditPaM(node, 0);
    } finally {
      set.Dispose();
    }
  }
  /** Original raw insertion and separate attribute/wrong-list update. Position argument is passed by value. @param position - Source position value. @param value - Original paragraph text without tab/CR/LF. @returns Advanced position copy. */
  InsertText(position: EditPaM, value: OUStringConstReference): EditPaM {
    const result = new EditPaM(position),
      node = result.GetNode() as ContentNode;
    node.Insert(value, result.GetIndex());
    node.ExpandAttribs(result.GetIndex(), value.getLength());
    result.SetIndex(result.GetIndex() + value.getLength());
    this.SetModified(true);
    return result;
  }
  /** Original paragraph split including bullet visibility, AUTOWRITINGDIR reset, style follow and attribute transfer. @param position - Source position value. @param keepEnding - Original end-range policy. @returns Start of the inserted paragraph. */
  InsertParaBreak(position: EditPaM, keepEnding: boolean): EditPaM {
    const result = new EditPaM(position),
      current = result.GetNode() as ContentNode,
      index = this.GetPos(current),
      value = current.Copy(result.GetIndex());
    current.Erase(result.GetIndex());
    const attributes = new ContentAttribs(current.GetContentAttribs()),
      bullet = new SfxBoolItem(EE.EE_PARA_BULLETSTATE, true);
    try {
      attributes.GetItems().Put(bullet);
      attributes.GetItems().ClearItem(EE.EE_PARA_AUTOWRITINGDIR);
      const node = new ContentNode(value, attributes);
      node.GetCharAttribs().GetDefFont().assign(current.GetCharAttribs().GetDefFont());
      const style = current.GetStyleSheet();
      if (style) {
        const follow = style.GetFollow();
        if (!follow.isEmpty() && !follow.equals(style.GetName()))
          node.SetStyleSheet(
            style.GetPool().Find(follow, style.GetFamily()) as SfxStyleSheet | null,
          );
      }
      node.CopyAndCutAttribs(current, this.mpItemPool, keepEnding);
      this.Insert(index + 1, node);
      this.SetModified(true);
      result.SetNode(node);
      result.SetIndex(0);
      return result;
    } finally {
      bullet.Dispose();
      attributes.dispose();
      value.dispose();
    }
  }
  /** Original marker insertion before one-unit feature construction. @param position - Source position value. @param item - Original feature item. @returns Advanced position copy. */
  InsertFeature(position: EditPaM, item: SfxPoolItem): EditPaM {
    const result = new EditPaM(position),
      node = result.GetNode() as ContentNode,
      marker = unicode("\u0001");
    try {
      node.Insert(marker, result.GetIndex());
    } finally {
      marker.dispose();
    }
    node.ExpandAttribs(result.GetIndex(), 1);
    node
      .GetCharAttribs()
      .InsertAttrib(
        MakeCharAttrib(
          this.mpItemPool,
          item,
          result.GetIndex(),
          result.GetIndex() + 1,
        ) as Attr.EditCharAttrib,
      );
    this.SetModified(true);
    result.SetIndex(result.GetIndex() + 1);
    return result;
  }
  /** Original selection/caret character-attribute insertion. @param node - Actual paragraph. @param start - Native start. @param end - Native end. @param item - Borrowed source item. @returns Nothing. */
  InsertAttrib(node: ContentNode, start: number, end: number, item: SfxPoolItem): void {
    InsertAttrib(this, node, start, end, item);
  }
  /** Original join order: attributes first, text second, then right owner removal. @param left - Actual left paragraph. @param right - Actual right paragraph. @returns Original left-end position. */
  ConnectParagraphs(left: ContentNode, right: ContentNode): EditPaM {
    const result = new EditPaM(left, left.Len());
    left.AppendAttribs(right);
    left.Append(right.GetString().subView(0));
    this.Remove(this.GetPos(right));
    this.SetModified(true);
    return result;
  }
  /** Original text erase before range collapse and modification callback. @param position - Source raw position. @param count - Source length. @returns Nothing. */
  RemoveChars(position: EditPaM, count: number): void {
    const node = position.GetNode() as ContentNode;
    node.Erase(position.GetIndex(), count);
    node.CollapseAttribs(position.GetIndex(), count);
    this.SetModified(true);
  }
  /** Original clear every paragraph's spelling list. @returns Nothing. */
  ClearSpellErrors(): void {
    for (const node of this.maContents) node.DestroyWrongList();
  }
  /** Original first-node position, possibly null before Clear. @returns Position value. */
  GetStartPaM(): EditPaM {
    return new EditPaM(this.GetObject(0), 0);
  }
  /** Original last-node end; requires the original nonempty document precondition. @returns Position value. */
  GetEndPaM(): EditPaM {
    const node = this.GetObject(this.Count() - 1) as ContentNode;
    return new EditPaM(node, node.Len());
  }
  /** Original sum of expanded lengths, excluding paragraph separators. @returns UTF16 count. */
  GetTextLen(): number {
    let length = 0;
    for (const node of this.maContents) length += node.GetExpandedLen();
    return length;
  }
  /** Original paragraph text expansion. @param node - Source paragraph index. @returns Owned string. */
  GetParaAsString(node: number): OUString {
    return EditDoc.GetParaAsString(this.GetObject(node) as ContentNode);
  }
  /** Original static raw-span paragraph expansion. @param node - Actual paragraph. @param start - Raw start. @param end - Raw end or original end sentinel. @returns Owned expanded text. */
  static GetParaAsString(node: ContentNode, start = 0, end = -1): OUString {
    return node.GetExpandedText(start, end);
  }
  /** Original static separator selection. @param end - Native line-end selection. @returns Owned separator. */
  static GetSepStr(end: LineEnd): OUString {
    return GetSepStr(end);
  }
  /** Original separator-aware complete expanded text assembly. @param end - Selected line end. @returns Owned text. */
  GetText(end: LineEnd): OUString {
    if (!this.Count()) return unicode("");
    const separator = GetSepStr(end),
      size = separator.getLength(),
      buffer = new OUStringBuffer(this.GetTextLen() + (this.Count() - 1) * size + 16);
    try {
      for (let index = 0; index < this.Count(); index++) {
        if (size && index > 0) buffer.append(separator);
        const paragraph = this.GetParaAsString(index);
        try {
          buffer.append(paragraph);
        } finally {
          paragraph.dispose();
        }
      }
      return buffer.makeStringAndClear();
    } finally {
      buffer.dispose();
      separator.dispose();
    }
  }
}

/** Original shared anonymous-namespace FastGetPos template; exported only between source-file responsibility groups after splitting the original translation unit. @param values - Actual owner vector. @param value - Borrowed pointer. @param last - Original mutable lookup cache. @returns Source index or not-found marker. */
export function FastGetPos<Value>(
  values: readonly Value[],
  value: Value | null,
  last: [number],
): number {
  const length = values.length;
  if (last[0] > 16 && length > 16) {
    const end = last[0] > length - 2 ? length : last[0] + 2;
    for (let index = last[0] - 2; index < end; index++)
      if (values[index] === value) return (last[0] = index);
  }
  for (let index = 0; index < length; index++)
    if (values[index] === value) return (last[0] = index);
  return EE_PARA_MAX;
}
