/** @fileoverview First-cell table context and native table/fly insertion from SwHTMLParser::BuildTableCell. */
import { SvxAdjust as A, SvxBreak } from "../../../../editeng/inc/svxenum";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { HoriOrientation as Hori } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as Vert } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { WrapTextMode } from "../../../../offapi/com/sun/star/text/WrapTextMode";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwFormatSurround } from "../../../inc/fmtsrnd";
import * as H from "../../../inc/hintids";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { MINLAY } from "../../../inc/swtypes";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwNodeIndex } from "../../core/crsr/pam";
import { MakeFlySection } from "../../core/doc/doclay";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import { HTMLTableContext } from "./htmltab.context";
import { SwHTMLAppendMode as M } from "./htmlctxt";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";

/** Queues the source small-font, zero-spacing paragraph attributes before an appended table. @param parser - Actual importer. @returns Nothing. */
function prepareEmptyAnchor(parser: SwHTMLParser): void {
  const text = parser.m_pPam.GetPoint().GetNode().GetTextNode();
  if (!text) throw new Error("assert(HTML table anchor paragraph)");
  text.ChgFormatColl(parser.m_pCSS1Parser.GetTextCollFromPool(P.COLL_STANDARD));
  for (const which of [H.RES_CHRATR_FONTSIZE, H.RES_CHRATR_CJK_FONTSIZE, H.RES_CHRATR_CTL_FONTSIZE])
    parser.InsertAttr(new SvxFontHeightItem(40, 100, which), false);
  parser.InsertAttr(new SvxULSpaceItem(0, 0, H.RES_UL_SPACE), true);
}

/** Original HTML floating table owns a real fly section and inherits the native anchor and wrapping items. @param parser - Actual importer. @param table - Actual intermediate table. @param context - Actual first-cell context. @returns The fly section's bootstrap paragraph. */
function InsertTableFly(
  parser: SwHTMLParser,
  table: HTMLTable,
  context: HTMLTableContext,
): SwTextNode {
  const doc = parser.m_xDoc;
  const point = parser.m_pPam.GetPoint();
  const items = new SfxItemSet(doc.GetAttrPool(), [[H.RES_FRMATR_BEGIN, H.RES_FRMATR_END - 1]]);
  try {
    const adjust = table.GetTableAdjust(true);
    const horizontal =
      adjust === A.Right ? Hori.RIGHT : adjust === A.Center ? Hori.CENTER : Hori.LEFT;
    const wrap =
      adjust === A.Right
        ? WrapTextMode.LEFT
        : adjust === A.Left
          ? WrapTextMode.RIGHT
          : WrapTextMode.NONE;
    parser.SetAnchorAndAdjustment(Vert.NONE, horizontal, items, true);
    items.Put(new SwFormatSurround(wrap));
    const size = new SwFormatFrameSize(SwFrameSize.Variable, 5669, MINLAY);
    size.SetWidthPercent(100);
    items.Put(size);
    if (table.GetHSpace()) {
      const margins = new SvxLRSpaceItem(H.RES_LR_SPACE);
      margins.SetLeft(SvxIndentValue.twips(table.GetHSpace()));
      margins.SetRight(SvxIndentValue.twips(table.GetHSpace()));
      items.Put(margins);
    }
    if (table.GetVSpace())
      items.Put(new SvxULSpaceItem(table.GetVSpace(), table.GetVSpace(), H.RES_UL_SPACE));
    const anchor = items.Get(H.RES_ANCHOR);
    if (!(anchor instanceof SwFormatAnchor)) throw new Error("assert(HTML table fly anchor)");
    const format = MakeFlySection(doc, anchor.GetAnchorId(), point, items);
    context.SetFrameFormat(format);
    const start = format.GetContent().GetContentIdx();
    const text =
      start &&
      doc
        .GetNodes()
        .at(start.GetIndex() + 1)
        .GetTextNode();
    if (!text) throw new Error("assert(HTML table fly text)");
    point.Assign(text);
    return text;
  } finally {
    items.Dispose();
  }
}

/** Builds the source first-cell context and 1x1 core bootstrap before opening cell-local attributes. @param parser - Actual importer. @param table - Actual intermediate table. @returns Nothing. */
export function BeginTableCellContext(parser: SwHTMLParser, table: HTMLTable): void {
  const doc = parser.m_xDoc;
  const pam = parser.m_pPam;
  const point = pam.GetPoint();
  const top = parser.m_xTable === table;
  const items = new SfxItemSet(doc.GetAttrPool(), [
    [H.RES_PARATR_SPLIT, H.RES_PARATR_SPLIT],
    [H.RES_PAGEDESC, H.RES_PAGEDESC],
    [H.RES_BREAK, H.RES_BREAK],
    [H.RES_BACKGROUND, H.RES_BACKGROUND],
    [H.RES_KEEP, H.RES_KEEP],
    [H.RES_LAYOUT_SPLIT, H.RES_LAYOUT_SPLIT],
    [H.RES_FRAMEDIR, H.RES_FRAMEDIR],
  ]);
  let context: HTMLTableContext | undefined;
  try {
    const info = new SvxCSS1PropertyInfo();
    const styled = parser.ParseStyleOptions(
      table.GetStyle(),
      table.GetId(),
      table.GetClass(),
      items,
      info,
      "",
      table.GetDirection(),
    );
    if (styled) {
      const brush = items.GetItemIfSet(H.RES_BACKGROUND, false);
      if (brush instanceof SvxBrushItem) {
        table.SetBGBrush(brush);
        items.ClearItem(H.RES_BACKGROUND);
      }
      const split = items.GetItemIfSet(H.RES_PARATR_SPLIT, false);
      if (split instanceof SfxBoolItem) {
        items.Put(new SwFormatLayoutSplit(split.GetValue()));
        items.ClearItem(H.RES_PARATR_SPLIT);
      }
    }
    const left: [number] = [0],
      right: [number] = [0],
      indent: [number] = [0];
    parser.GetMarginsFromContextWithNumberBullet(left, right, indent);
    const adjust = table.GetTableAdjust(false);
    const force = top && (adjust === A.Left || adjust === A.Right || table.HasToFly());
    let appended = false;
    let parentLF = false;
    if (top) {
      const append = force
        ? parser.HasCurrentParaFlys(true)
        : Boolean(point.GetContentIndex()) ||
          parser.HasCurrentParaFlys() ||
          parser.HasCurrentParaBookmarks();
      if (append) {
        if (!point.GetContentIndex()) prepareEmptyAnchor(parser);
        parser.AppendTextNode(M.AM_NOSPACE);
        appended = true;
      } else {
        if (!force) for (const attr of parser.m_aParaAttrs) attr.Invalidate();
        parser.m_aParaAttrs.length = 0;
      }
    } else if (table.HasParentSection()) {
      parentLF = parser.StripTrailingLF() > 0;
      parser.m_nOpenParaToken = T.NONE;
      parser.m_nFontStHeadStart = parser.m_nFontStMin;
      parser.m_aParaAttrs.length = 0;
    }
    const saved = top ? point.clone() : null;
    context = new HTMLTableContext(saved, parser.m_nContextStMin, parser.m_nContextStAttrMin);
    if (!force && (top || table.HasParentSection())) {
      parser.SplitAttrTab(context.m_xAttrTab, top);
      parser.SetAttr(top, top);
    } else {
      parser.SaveAttrTab(context.m_xAttrTab);
      if (top && !appended) parser.SetAttr(true, true);
    }
    parser.m_bNoParSpace = false;
    context.SetNumInfo(parser.GetNumInfo());
    parser.GetNumInfo().Clear();
    context.SavePREListingXMP(parser);
    if (top) {
      const flyParagraph = force ? InsertTableFly(parser, table, context) : null;
      const actual = doc.InsertTable(
        { mnInsMode: SwInsertTableFlags.HeadlineNoBorder, mnRowsToRepeat: 1 },
        point,
        1,
        1,
        Hori.LEFT,
      );
      const text = actual?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
      if (!actual || !text) throw new Error("assert(HTML table first paragraph)");
      if (flyParagraph !== null) {
        point.Assign(text);
        const index = new SwNodeIndex(flyParagraph);
        try {
          doc.GetNodes().DelNodes(index);
        } finally {
          index.Dispose();
        }
      } else {
        if (styled) {
          parser.m_pCSS1Parser.SetFormatBreak(items, info);
          actual.GetFrameFormat().SetFormatAttrSet(items);
        }
        point.Assign(text);
      }
      const old = !appended && !force ? saved?.GetNode().GetTextNode() : null;
      if (old) {
        const format = actual.GetFrameFormat();
        const page = old.GetSwAttrSet().GetItemIfSet(H.RES_PAGEDESC, false);
        if (page instanceof SwFormatPageDesc && page.GetPageDescName()) {
          format.SetFormatAttr(page);
          old.ResetAttr(H.RES_PAGEDESC);
        }
        const item = old.GetSwAttrSet().GetItemIfSet(H.RES_BREAK);
        if (
          item instanceof SfxInt16Item &&
          (item.GetValue() === SvxBreak.PageBefore ||
            item.GetValue() === SvxBreak.PageAfter ||
            item.GetValue() === SvxBreak.PageBoth)
        ) {
          format.SetFormatAttr(item);
          old.ResetAttr(H.RES_BREAK);
        }
      }
      context.SetTableNode(actual.GetTableNode());
      table.SetTable(actual.GetTableNode(), context, left[0], right[0], actual, force);
    } else {
      if (table.HasParentSection() && !parentLF) parser.StripTrailingPara(parser.m_xTable);
      const node = point.GetNode();
      const previous = parser.m_xTable?.m_bFirstCell
        ? node.FindTableNode()
        : node.FindTableBoxStartNode();
      table.SetTable(previous, context, left[0], right[0]);
    }
    context = undefined;
    parser.m_nContextStMin = parser.m_aContexts.length;
    parser.m_nContextStAttrMin = parser.m_nContextStMin;
  } finally {
    items.Dispose();
    context?.SourceDispose();
  }
}
