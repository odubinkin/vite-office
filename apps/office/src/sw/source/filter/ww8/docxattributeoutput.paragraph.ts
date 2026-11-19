/** @fileoverview Native DOCX paragraph property serialization split from DocxAttributeOutput. */
import type { SvxAdjustItem } from "../../../../editeng/source/items/paraitem.adjust";
import type {
  SvxFormatSplitItem,
  SvxWidowsItem,
} from "../../../../editeng/source/items/paraitem.controls";
import type {
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/inc/lrspitem";
import type { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { ParaTabStop } from "./docxattributeoutput.tabs";
import { SvxParaVertAlignItem } from "../../../../editeng/inc/paravertalignitem";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import type { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { SvxLineSpacingItem } from "../../../../editeng/inc/lspcitem";
import {
  SvxAdjust,
  SvxBreak,
  SvxInterLineSpaceRule,
  SvxLineSpaceRule,
} from "../../../../editeng/inc/svxenum";
import { LATIN } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import type { SfxBoolItem } from "../../../../svl/inc/eitem";
import type { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS } from "../../../../sax/inc/fshelper";
import {
  RES_BREAK,
  RES_FRAMEDIR,
  RES_KEEP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_ADJUST,
  RES_PARATR_LINESPACING,
  RES_PARATR_NUMRULE,
  RES_PARATR_SPLIT,
  RES_PARATR_TABSTOP,
  RES_PARATR_VERTALIGN,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwPosition } from "../../core/crsr/pam";
import type { SwAttrSet } from "../../core/attr/swatrset";
import type { SwTextFormatColl } from "../../core/doc/fmtcol";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwNumRuleItem } from "../../core/para/paratr";
import { SectionProperties, type WW8SepInfo } from "./docxattributeoutput.section";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import { GetPseudoCharRuns } from "./writerwordglue";
import { ParaLineSpacing } from "./ww8atr";
import { KeepTableRowWithNext } from "./wrtw8nds";
import { GetParagraphMarkerProperties } from "./wrtw8nds.paragraph-marker";
import { OutputItem } from "./docxexport.text";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SvxPostureItem, SvxWeightItem } from "../../../../editeng/source/items/textitem";
import type { SvxCrossedOutItem } from "../../../../editeng/inc/crossedoutitem";
import type { SvxEscapementItem } from "../../../../editeng/inc/escapementitem";
import type { SvxAutoKernItem } from "../../../../editeng/inc/autokernitem";
import * as H from "../../../inc/hintids";

const w = token("w");
const val = FSNS(w, token("val"));

/** Maps native alignment to the default ECMA 376 first-edition Word tokens. @param item - Actual paragraph adjustment. @param rtl - Resolved paragraph direction. @returns Word alignment. */
function ParaAdjust(item: SvxAdjustItem, rtl: boolean): string | undefined {
  switch (item.GetAdjust()) {
    case SvxAdjust.ParaStart:
      return "left";
    case SvxAdjust.ParaEnd:
      return "right";
    case SvxAdjust.Left:
    case SvxAdjust.Right: {
      return (item.GetAdjust() === SvxAdjust.Left) !== rtl ? "left" : "right";
    }
    case SvxAdjust.BlockLine:
    case SvxAdjust.Block: {
      const min = item.GetPropWordSpacingMinimum();
      if (min === item.GetPropWordSpacingMaximum()) {
        if (min === 133) return "lowKashida";
        if (min === 200) return "mediumKashida";
        if (min === 300) return "highKashida";
      }
      return item.GetLastBlock() === SvxAdjust.Block ? "distribute" : "both";
    }
    case SvxAdjust.Center:
      return "center";
  }
}

/** Resolves the actual paragraph direction and the document fallback for environment direction. @param node - Native paragraph. @returns Whether the paragraph is RTL. */
function IsRightToLeft(node: SwTextNode): boolean {
  const direction = node.GetSwAttrSet().GetFrameDir().GetValue();
  if (direction !== SvxFrameDirection.Environment)
    return direction === SvxFrameDirection.Horizontal_RL_TB;
  const position = new SwPosition(node);
  try {
    return node.GetDoc().GetTextDirection(position) === SvxFrameDirection.Horizontal_RL_TB;
  } finally {
    position.Dispose();
  }
}

/** Writes the represented paragraph items in DocxAttributeOutput's schema order. @param output - Actual attribute writer. @param node - Source paragraph. @param section - Section at paragraph end. @returns Nothing. */
export function OutputParagraphProperties(
  output: DocxAttributeOutput,
  node: SwTextNode,
  section?: WW8SepInfo,
): void {
  const owner = output.GetExport(),
    styles = owner.m_pStyles;
  const slot = styles?.GetSlot(node.GetTextFormatColl()) ?? 0x0fff;
  const styleId = slot !== 0x0fff ? styles?.GetStyleId(slot) : undefined;
  const marker = GetParagraphMarkerProperties(node);
  try {
    WriteParagraphProperties(
      output,
      node.GetSwAttrSet(),
      node,
      undefined,
      styleId,
      section,
      marker,
    );
  } finally {
    marker.Dispose();
  }
}

/** Writes direct style properties through the same paragraph serializer as body properties. @param output - Actual attribute writer. @param style - Native paragraph style. @returns Nothing. */
export function OutputStyleParagraphProperties(
  output: DocxAttributeOutput,
  style: SwTextFormatColl,
): void {
  WriteParagraphProperties(output, style.GetAttrSet(), undefined, style, undefined);
}

/** Serializes paragraph and marker properties in schema order. @param output - Native writer. @param set - Native attributes. @param node - Body paragraph. @param style - Named style. @param styleId - Exported style ID. @param section - Section at paragraph end. @param marker - Paragraph-marker properties. @returns Nothing. */
function WriteParagraphProperties(
  output: DocxAttributeOutput,
  set: SwAttrSet,
  node: SwTextNode | undefined,
  style: SwTextFormatColl | undefined,
  styleId: string | undefined,
  section?: WW8SepInfo,
  marker?: SfxItemSet,
): void {
  const inherit = node !== undefined && styleId === undefined;
  const direct = node && styleId ? node.GetpSwAttrSet() : set;
  const keep = direct?.GetItemIfSet(RES_KEEP, inherit) as SfxBoolItem | undefined,
    split = direct?.GetItemIfSet(RES_PARATR_SPLIT, inherit) as SvxFormatSplitItem | undefined,
    pageBreak = (direct?.GetItemIfSet(RES_BREAK, inherit) as SfxInt16Item | undefined)?.GetValue(),
    tabs = direct?.GetItemIfSet(RES_PARATR_TABSTOP, inherit) as SvxTabStopItem | undefined,
    widows = direct?.GetItemIfSet(RES_PARATR_WIDOWS, inherit) as SvxWidowsItem | undefined,
    direction = direct?.GetItemIfSet(RES_FRAMEDIR, inherit) as SvxFrameDirectionItem | undefined,
    spacing = direct?.GetItemIfSet(RES_UL_SPACE, inherit) as SvxULSpaceItem | undefined,
    lineSpacing = direct?.GetItemIfSet(RES_PARATR_LINESPACING, inherit) as
      SvxLineSpacingItem | undefined,
    numbering = set.GetItemIfSet(RES_PARATR_NUMRULE, node !== undefined) as
      SwNumRuleItem | undefined,
    left = direct?.GetItemIfSet(RES_MARGIN_TEXTLEFT, inherit) as SvxTextLeftMarginItem | undefined,
    right = direct?.GetItemIfSet(RES_MARGIN_RIGHT, inherit) as SvxRightMarginItem | undefined,
    firstLine = direct?.GetItemIfSet(RES_MARGIN_FIRSTLINE, inherit) as
      SvxFirstLineIndentItem | undefined,
    adjust = direct?.GetItemIfSet(RES_PARATR_ADJUST, inherit) as SvxAdjustItem | undefined;
  const rtl =
    node !== undefined
      ? IsRightToLeft(node)
      : set.GetFrameDir().GetValue() === SvxFrameDirection.Horizontal_RL_TB;
  const alignment = adjust && ParaAdjust(adjust, rtl);

  const serializer = output.GetSerializer(),
    properties = token("pPr");
  serializer.startElementNS(w, properties);
  if (styleId) serializer.singleElementNS(w, token("pStyle"), val, styleId);
  const keepTableRow = node !== undefined && KeepTableRowWithNext(node);
  if (keepTableRow || keep)
    serializer.singleElementNS(w, token("keepNext"), val, String(keepTableRow || keep?.GetValue()));
  if (split) output.ParaSplit(split);
  if (pageBreak === SvxBreak.PageBefore) serializer.singleElementNS(w, token("pageBreakBefore"));
  if (widows) output.ParaWidows(widows);
  if (numbering) {
    const owner = output.GetExport();
    const previous = owner.m_pOutFormatNode;
    const previousSet = owner.m_pISet;
    owner.m_pOutFormatNode = node ?? style;
    owner.m_pISet = set;
    try {
      output.ParaNumRule(numbering);
    } finally {
      owner.m_pOutFormatNode = previous;
      owner.m_pISet = previousSet;
    }
  }
  if (tabs) {
    const parent = style?.DerivedFrom() ?? (styleId ? node?.GetTextFormatColl() : undefined);
    const inherited = parent?.GetAttrSet().GetItem(RES_PARATR_TABSTOP) as
      SvxTabStopItem | undefined;
    const offset = set.GetDoc().GetDocumentSettingManager().get("TABS_RELATIVE_TO_INDENT")
      ? (set.Get(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft()
      : 0;
    ParaTabStop(output, tabs, inherited, offset);
  }
  if (direction) serializer.singleElementNS(w, token("bidi"), val, rtl ? "1" : "0");
  if (spacing || lineSpacing) {
    const attributes: (string | number)[] = [];
    if (spacing)
      attributes.push(
        FSNS(w, token("before")),
        String(spacing.GetUpper()),
        FSNS(w, token("after")),
        String(spacing.GetLower()),
      );
    if (lineSpacing) {
      const measureLeading =
        lineSpacing.GetLineSpaceRule() === SvxLineSpaceRule.Auto &&
        lineSpacing.GetInterLineSpaceRule() === SvxInterLineSpaceRule.Fix;
      const script = (measureLeading && node && GetPseudoCharRuns(node)[0]?.mnScript) || LATIN;
      const [size, multi] = ParaLineSpacing(lineSpacing, set, script);
      const rule = size < 0 ? "exact" : size > 0 && multi ? "auto" : "atLeast";
      attributes.push(
        FSNS(w, token("lineRule")),
        rule,
        FSNS(w, token("line")),
        String(Math.abs(size)),
      );
    }
    serializer.singleElementNS(w, token("spacing"), ...attributes);
  }
  if (left || right || firstLine) {
    const attributes = [];
    if (left) attributes.push(FSNS(w, token("left")), String(left.ResolveTextLeft()));
    if (right) attributes.push(FSNS(w, token("right")), String(right.ResolveRight()));
    if (firstLine) {
      const value = firstLine.ResolveTextFirstLineOffset();
      attributes.push(FSNS(w, token(value > 0 ? "firstLine" : "hanging")), String(Math.abs(value)));
    }
    serializer.singleElementNS(w, token("ind"), ...attributes);
  }
  if (spacing?.GetContext()) serializer.singleElementNS(w, token("contextualSpacing"));
  else if (spacing) {
    const parent = node?.GetTextFormatColl() ?? style?.DerivedFrom();
    const inherited = parent?.GetAttrSet().Get(RES_UL_SPACE) as SvxULSpaceItem | undefined;
    if (inherited?.GetContext())
      serializer.singleElementNS(w, token("contextualSpacing"), val, "false");
  }
  if (alignment) serializer.singleElementNS(w, token("jc"), val, alignment);
  const verticalAlign = direct?.GetItemIfSet(RES_PARATR_VERTALIGN, inherit);
  if (verticalAlign instanceof SvxParaVertAlignItem) output.ParaVerticalAlign(verticalAlign);
  if (marker) {
    output.StartRunProperties();
    WriteParagraphMarkerProperties(output, marker);
    output.EndRunProperties();
  }
  if (section) SectionProperties(output, section);
  serializer.endElementNS(w, properties);
}

/** Emits the native marker set, visiting terminal automatic formatting separately. @param output - DOCX attributes. @param items - Selected marker set. @returns Nothing. */
function WriteParagraphMarkerProperties(output: DocxAttributeOutput, items: SfxItemSet): void {
  const owner = output.GetExport(),
    previous = owner.m_pISet;
  owner.m_pISet = items;
  try {
    for (const item of items.entries()) {
      switch (item.Which()) {
        case H.RES_CHRATR_CJK_FONT:
          output.CharFontCJK(item as SvxFontItem);
          break;
        case H.RES_CHRATR_CTL_FONT:
          output.CharFontCTL(item as SvxFontItem);
          break;
        case H.RES_CHRATR_CJK_FONTSIZE:
          if (!items.GetItemIfSet(H.RES_CHRATR_FONTSIZE, false))
            output.CharFontSize(item as SvxFontHeightItem);
          break;
        case H.RES_CHRATR_CTL_FONTSIZE:
          output.CharFontSize(item as SvxFontHeightItem);
          break;
        case H.RES_CHRATR_CJK_POSTURE:
          if (!items.GetItemIfSet(H.RES_CHRATR_POSTURE, false))
            output.CharPostureCJK(item as SvxPostureItem);
          break;
        case H.RES_CHRATR_CTL_POSTURE:
          output.CharPostureCTL(item as SvxPostureItem);
          break;
        case H.RES_CHRATR_CJK_WEIGHT:
          if (!items.GetItemIfSet(H.RES_CHRATR_WEIGHT, false))
            output.CharWeightCJK(item as SvxWeightItem);
          break;
        case H.RES_CHRATR_CTL_WEIGHT:
          output.CharWeightCTL(item as SvxWeightItem);
          break;
        case H.RES_CHRATR_CROSSEDOUT:
          output.CharCrossedOut(item as SvxCrossedOutItem);
          break;
        case H.RES_CHRATR_ESCAPEMENT:
          output.CharEscapement(item as SvxEscapementItem);
          break;
        case H.RES_CHRATR_AUTOKERN:
          output.CharAutoKern(item as SvxAutoKernItem);
          break;
        case H.RES_CHRATR_KERNING:
          OutputItem(output, item);
          break;
        case H.RES_TXTATR_AUTOFMT: {
          const style = (item as SwFormatAutoFormat<number>).GetStyleHandle();
          if (style) WriteParagraphMarkerProperties(output, style);
          break;
        }
        case H.RES_TXTATR_CHARFMT: {
          const format = (item as SwFormatCharFormat).GetCharFormat();
          const styles = owner.m_pStyles;
          const slot = format && styles ? styles.GetSlot(format) : 0x0fff;
          if (styles && slot !== 0x0fff)
            output
              .GetSerializer()
              .singleElementNS(w, token("rStyle"), val, styles.GetStyleId(slot));
          break;
        }
        default:
          OutputItem(output, item);
      }
    }
  } finally {
    owner.m_pISet = previous;
  }
}
