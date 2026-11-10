/** @fileoverview Original SwHTMLParser InsertTableSection/InsertTableContents bodies from htmltab.cxx. The explicit table argument borrows the original current-table field across the TypeScript responsibility split; it never creates a replacement current-table producer. */
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import { HTMLTableCnts } from "./htmltab.contents";
import { SwStartNode, SwTableNode } from "../../core/docnode/node";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import * as H from "../../../inc/hintids";
import { SetNodeNum } from "./htmlnumreader";
/** Original overload dispatch over actual owners. The pool overload advances the cursor for later sections; the predecessor overload leaves it untouched and initializes all three direct font heights to40twips. @param parser - Actual importer. @param current - Actual current outer table. @param selector - Native pool ID or predecessor section pointer. @returns Actual section or null with original Error publication. */
export function InsertTableSection(
  parser: SwHTMLParser,
  current: HTMLTable,
  selector: number | SwStartNode | null,
): SwStartNode | null {
  const pool = typeof selector === "number",
    css = parser.m_pCSS1Parser;
  const id = pool ? selector : P.COLL_TABLE;
  if (id === P.COLL_TABLE_HDLN) css.SetTHTagStyles();
  else if (id === P.COLL_TABLE) css.SetTDTagStyles();
  const coll = css.GetTextCollFromPool(id),
    point = parser.m_pPam.GetPoint(),
    node = point.GetNode(),
    nodes = parser.m_xDoc.GetNodes();
  let start: SwStartNode | null;
  if (current.m_bFirstCell) {
    if (!(node instanceof SwTextNode)) {
      if (!pool) throw new Error("assert(HTML first cell text)");
      parser.eState = S.Error;
      return null;
    }
    node.ChgFormatColl(coll);
    start = node.FindTableBoxStartNode();
    current.m_bFirstCell = false;
    if (!pool && !start) throw new Error("assert(HTML first cell section)");
  } else if (!pool) {
    if (!selector) {
      parser.eState = S.Error;
      return null;
    }
    const previous = selector instanceof SwTableNode ? selector : selector.EndOfSectionNode();
    start = nodes.MakeTextSection(
      previous.GetNodes().at(previous.GetIndex() + 1),
      K.SwTableBoxStartNode,
      coll,
    );
    current.IncBoxCount();
  } else {
    let table = node.FindTableNode();
    if (!table) {
      parser.eState = S.Error;
      return null;
    }
    if (table.GetTable().GetHTMLTableLayout()) {
      let outer: SwTableNode | null = table;
      do {
        table = outer;
        outer = outer.StartOfSectionNode().FindTableNode();
      } while (outer && table.GetTable().GetHTMLTableLayout());
    }
    start = nodes.MakeTextSection(table.EndOfSectionNode(), K.SwTableBoxStartNode, coll);
    point.Assign(nodes.at(start.GetIndex() + 1));
    current.IncBoxCount();
  }
  if (!pool) {
    if (!start) throw new Error("assert(HTML empty cell section)");
    const text = nodes.at(start.GetIndex() + 1);
    if (!(text instanceof SwTextNode)) throw new Error("assert(HTML empty cell text)");
    for (const which of [
      H.RES_CHRATR_FONTSIZE,
      H.RES_CHRATR_CJK_FONTSIZE,
      H.RES_CHRATR_CTL_FONTSIZE,
    ]) {
      const item = new SvxFontHeightItem(40, 100, which);
      try {
        text.SetAttr(item);
      } finally {
        item.Dispose();
      }
    }
  } else if (!start) parser.eState = S.Error;
  return start;
}
/** Original cell-contents construction and raw attribute-head rebase. Native numbering remains the original actual rule/paragraph operation, and previous attribute chains are not rebuilt. @param parser - Actual importer. @param current - Actual current outer table. @param header - Header collection selector. @returns Original new content owner, including source null-section Error domain. */
export function InsertTableContents(
  parser: SwHTMLParser,
  current: HTMLTable,
  header: boolean,
): HTMLTableCnts {
  const start = InsertTableSection(parser, current, header ? P.COLL_TABLE_HDLN : P.COLL_TABLE);
  if (parser.GetNumInfo().GetNumRule()) SetNodeNum(parser, parser.GetNumInfo().GetLevel());
  const point = parser.m_pPam.GetPoint();
  for (const head of Object.values(parser.m_xAttrTab)) {
    let attr = head[0];
    while (attr) {
      attr.SetStart(point);
      attr = attr.GetNext();
    }
  }
  return new HTMLTableCnts(start);
}

/** Original caption container is a normal section under EndOfExtras, independent of body/table contents. Its initial text collection is COLL_TEXT and the actual cursor enters its first paragraph. @param parser - Actual importer/document owner. @returns Native temporary caption section. */
export function InsertTempTableCaptionSection(parser: SwHTMLParser): SwStartNode {
  const nodes = parser.m_xDoc.GetNodes(),
    coll = parser.m_pCSS1Parser.GetTextCollFromPool(P.COLL_TEXT),
    start = nodes.MakeTextSection(nodes.GetEndOfExtras(), K.SwNormalStartNode, coll);
  parser.m_pPam.GetPoint().Assign(nodes.at(start.GetIndex() + 1));
  return start;
}
