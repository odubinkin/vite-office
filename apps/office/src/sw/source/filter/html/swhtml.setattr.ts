/** @fileoverview Native SetAttr_ body-range/item application from swhtml.cxx over actual SwPaM and deferred HTMLAttr owners. */
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwDoc } from "../../core/doc/doc";
import { SwPaM, GoPreviousPos } from "../../core/crsr/pam";
import { SwNodes } from "../../core/docnode/nodes";
import { SwContentNode } from "../../core/docnode/node";
import type { HTMLAttr, SwHTMLAttributeState } from "./swhtml.attr";
import type { SwHTMLNumRuleInfo } from "./htmlnum";
import * as H from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
/** Borrowed original parser members needed by the native pending-list consumer. */
export interface SwHTMLSetAttrState extends SwHTMLAttributeState {
  readonly m_xDoc: SwDoc;
  GetNumInfo(): SwHTMLNumRuleInfo;
}
/** Native represented end-bearing text attributes precede the six no-end identities. @param which - Native Which. @returns End-bearing attribute. */
function withEnd(which: number): boolean {
  return which >= H.RES_TXTATR_BEGIN && which < H.RES_TXTATR_END - 6;
}
/** Native no-end range from hintids.hxx. @param which - Native Which. @returns No-end attribute. */
function noEnd(which: number): boolean {
  return which >= H.RES_TXTATR_END - 6 && which < H.RES_TXTATR_END;
}
/** Applies native pending attributes in reverse deque order; fields/annotation producers are outside this document slice. @param parser - Original parser owner. @param checkEnd - Original early-end policy. @param beforeTable - Native table boundary. @returns Nothing. */
export function SetAttr_(parser: SwHTMLSetAttrState, checkEnd: boolean, beforeTable = false): void {
  const end = parser.m_pPam.GetPoint(),
    count = end.GetContentIndex(),
    range = new SwPaM(end);
  try {
    for (let index = parser.m_aSetAttrTab.length; index;) {
      const root = parser.m_aSetAttrTab[--index];
      if (!root) continue;
      const which = root.GetItem().Which(),
        endNode = root.GetEndParagraphIdx();
      const character = H.RES_CHRATR_BEGIN <= which && which < H.RES_CHRATR_END;
      const apply = checkEnd
        ? (endNode < end.GetNodeIndex() &&
            ((which !== H.RES_MARGIN_FIRSTLINE && which !== H.RES_MARGIN_TEXTLEFT) ||
              !parser.GetNumInfo().GetNumRule())) ||
          (!root.IsLikePara() &&
            endNode === end.GetNodeIndex() &&
            root.GetEndContent() < count &&
            (character || withEnd(which))) ||
          (beforeTable && endNode === end.GetNodeIndex() && root.GetEndContent() === 0)
        : endNode < end.GetNodeIndex() ||
          end.GetNodeIndex() > parser.m_xDoc.GetNodes().GetEndOfExtras().GetIndex() ||
          endNode <= parser.m_xDoc.GetNodes().GetEndOfExtras().GetIndex();
      if (!apply) continue;
      parser.m_aParaAttrs.length = 0;
      parser.m_aSetAttrTab.splice(index, 1);
      let attr: HTMLAttr | null = root;
      while (attr) {
        const previous: HTMLAttr | null = attr.GetPrev();
        try {
          if (!attr.m_bValid) continue;
          const startNode = attr.m_nStartPara.GetNode();
          let content: SwContentNode;
          if (startNode instanceof SwContentNode) content = startNode;
          else {
            if (attr.GetStartParagraphIdx() === attr.GetEndParagraphIdx() && !noEnd(which))
              continue;
            const next = SwNodes.GoNext(attr.m_nStartPara);
            if (!next) continue;
            content = next;
            attr.m_nStartContent = 0;
          }
          attr.m_nStartContent = Math.min(attr.m_nStartContent, content.Len());
          range.GetPoint().Assign(content, attr.m_nStartContent);
          range.SetMark();
          if (attr.GetStartParagraphIdx() !== attr.GetEndParagraphIdx() && !noEnd(which)) {
            const last = attr.m_nEndPara.GetNode();
            if (last instanceof SwContentNode) content = last;
            else {
              const previousNode = SwNodes.GoPrevious(attr.m_nEndPara);
              if (!previousNode) continue;
              content = previousNode;
              attr.m_nEndContent = content.Len();
            }
          } else if (attr.IsLikePara()) attr.m_nEndContent = content.Len();
          attr.m_nEndContent = Math.min(attr.m_nEndContent, content.Len());
          range.GetPoint().Assign(content, attr.m_nEndContent);
          if (
            beforeTable &&
            range.GetPoint().GetNodeIndex() === end.GetNodeIndex() &&
            which !== H.RES_BREAK &&
            which !== H.RES_PAGEDESC &&
            !noEnd(which)
          ) {
            if (range.GetMark().GetNodeIndex() === end.GetNodeIndex()) continue;
            const before = GoPreviousPos(range.GetPoint(), true);
            if (!before) continue;
            range.GetPoint().SetContent(before.Len());
          }
          if (which === H.RES_FLTR_BOOKMARK) {
            const item = attr.GetItem();
            if (!(item instanceof SfxStringItem)) throw new Error("assert(bookmark string item)");
            const marks = parser.m_xDoc.GetIDocumentMarkAccess(),
              existing = marks.FindMark(item.GetValue());
            if (existing?.GetMarkPos().compare(range.GetPoint()) === 0) continue;
            range.DeleteMark();
            const node = range.GetPoint().GetNode();
            if (!(node instanceof SwTextNode)) throw new Error("assert(bookmark content node)");
            marks.MakeMark(node, range.GetPoint().GetContentIndex(), item.GetValue());
            continue;
          }
          if (
            (which === H.RES_MARGIN_FIRSTLINE ||
              which === H.RES_MARGIN_TEXTLEFT ||
              which === H.RES_MARGIN_RIGHT) &&
            range.GetPoint().GetNodeIndex() === range.GetMark().GetNodeIndex()
          )
            content.SetAttr(attr.GetItem());
          else parser.m_xDoc.InsertPoolItem(range, attr.GetItem(), SetAttrMode.DONTREPLACE);
        } finally {
          range.DeleteMark();
          attr.SourceDispose();
          attr = previous;
        }
      }
    }
  } finally {
    range.Dispose();
  }
}
