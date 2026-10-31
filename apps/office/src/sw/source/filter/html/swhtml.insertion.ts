/** @fileoverview Native SwHTMLParser CallParser/Continue existing-document split, target-attribute snapshot and final boundary joins from swhtml.cxx. */
import type { SwHTMLParser } from "./swhtml";
import { SwNodeIndex, GoNextPos, GoPreviousPos } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import * as H from "../../../inc/hintids";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../../../svx/inc/xdef";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { setTextFormatCollAtNode } from "../../core/doc/docfmt";
/** Original insertion setup isolates a real empty paragraph between the target prefix/suffix and snapshots source paragraph items before changing collection. @param parser - Actual native importer. @returns Nothing. */
export function PrepareHTMLInsertion(parser: SwHTMLParser): void {
  const doc = parser.m_xDoc,
    point = parser.m_pPam.GetPoint(),
    nodes = doc.GetNodes();
  parser.m_pSttNdIdx = new SwNodeIndex(nodes, 0);
  if (parser.IsNewDoc()) return;
  const ops = doc.GetDocumentContentOperationsManager();
  ops.SplitNode(point);
  parser.m_pSttNdIdx.Assign(nodes.at(point.GetNodeIndex() - 1));
  ops.SplitNode(point);
  if (!GoPreviousPos(point, true)) throw new Error("assert(HTML insertion paragraph)");
  const node = point.GetNode();
  if (!(node instanceof SwTextNode)) throw new Error("assert(HTML text node)");
  const set = new SfxItemSet(doc.GetAttrPool(), [
    [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
    [H.RES_PARATR_BEGIN, H.RES_PARATR_NUMRULE - 1],
    [H.RES_PARATR_NUMRULE + 1, H.RES_PARATR_CONNECT_BORDER],
    [H.RES_LR_SPACE, H.RES_UL_SPACE],
    [XATTR_FILL_FIRST, XATTR_FILL_LAST],
  ]);
  if (node.GetParaAttr(set, 0, 0, false, false)) parser.m_pTargetCharAttrs = set;
  else set.Dispose();
  setTextFormatCollAtNode(node, parser.m_pCSS1Parser.GetTextCollFromPool(P.COLL_STANDARD), false);
}
/** Original start-boundary repair precedes tail cleanup and can run after a terminal parse error. @param parser - Actual native importer. @returns Nothing. */
export function JoinHTMLInsertionStart(parser: SwHTMLParser): void {
  const start = parser.m_pSttNdIdx;
  if (parser.IsNewDoc() || !start?.GetIndex()) return;
  const node = start.GetNode(),
    nextIndex = new SwNodeIndex(node);
  if (!(node instanceof SwTextNode) || !node.CanJoinNext(nextIndex)) return;
  const next = nextIndex.GetNode();
  if (!(next instanceof SwTextNode)) throw new Error("assert(HTML following text)");
  const offset = node.Len(),
    point = parser.m_pPam.GetPoint();
  if (point.GetNode() === next) point.Assign(node, offset);
  if (offset) next.FormatToTextAttr(node);
  else node.ChgFormatColl(next.GetTextFormatColl());
  node.JoinNext();
}
/** Original HasCurrentParaBookmarks native stack-last-bookmark rule and actual document mark lookup for represented collapsed bookmarks. @param parser - Actual importer. @param ignoreStack - Original stack bypass. @returns Whether the current paragraph contains a mark. */
export function HasCurrentParaBookmarks(parser: SwHTMLParser, ignoreStack = false): boolean {
  const node = parser.m_pPam.GetPoint().GetNode();
  if (!ignoreStack)
    for (let i = parser.m_aSetAttrTab.length; i;) {
      const attr = parser.m_aSetAttrTab[--i];
      if (attr?.GetItem().Which() === H.RES_FLTR_BOOKMARK) {
        if (attr.GetStartParagraphIdx() === node.GetIndex()) return true;
        break;
      }
    }
  for (const mark of parser.m_xDoc.GetIDocumentMarkAccess().GetAllMarks()) {
    const index = mark.GetMarkPos().GetNodeIndex();
    if (index === node.GetIndex()) return true;
    if (index > node.GetIndex()) break;
  }
  return false;
}
/** Original accepted tail cleanup and second split cancellation retain the native suffix owner and paragraph/character conversion order. @param parser - Actual native importer. @param strippedLF - New-document LF suppression. @returns Nothing. */
export function FinishHTMLInsertion(parser: SwHTMLParser, strippedLF: boolean): void {
  const pam = parser.m_pPam,
    point = pam.GetPoint(),
    doc = parser.m_xDoc,
    nodes = doc.GetNodes();
  const current = point.GetNode();
  if (!point.GetContentIndex() && !strippedLF) {
    if (HasCurrentParaBookmarks(parser, true)) return;
    if (parser.IsNewDoc()) {
      if (
        current instanceof SwTextNode &&
        parser.CanRemoveNode(current.GetIndex()) &&
        current.StartOfSectionNode().GetIndex() + 2 <
          current.StartOfSectionNode().EndOfSectionNode().GetIndex()
      ) {
        point.Assign(nodes.at(current.GetIndex() + 1));
        if (pam.HasMark()) pam.GetMark().Assign(nodes.at(current.GetIndex() + 1));
        nodes.removeTextNode(current);
      }
    } else if (current instanceof SwTextNode) {
      if (current.CanJoinNext(point)) {
        const next = point.GetNode();
        if (!(next instanceof SwTextNode)) throw new Error("assert(HTML suffix)");
        pam.SetMark();
        pam.DeleteMark();
        next.JoinPrev();
      } else if (!current.Len()) {
        pam.SetMark();
        pam.DeleteMark();
        const following = nodes.at(current.GetIndex() + 1);
        point.Assign(following);
        nodes.removeTextNode(current);
        const previous = GoPreviousPos(point, true);
        if (previous) point.SetContent(previous.Len());
      }
    }
  } else if (!parser.IsNewDoc()) {
    if (point.GetContentIndex() && !GoNextPos(point, true)) return;
    const node = point.GetNode(),
      previousIndex = new SwNodeIndex(node),
      start = parser.m_pSttNdIdx;
    if (
      !(node instanceof SwTextNode) ||
      !node.CanJoinPrev(previousIndex) ||
      !start ||
      start.GetIndex() > previousIndex.GetIndex()
    )
      return;
    const previous = previousIndex.GetNode();
    if (!(previous instanceof SwTextNode)) throw new Error("assert(HTML preceding text)");
    node.ChgFormatColl(previous.GetTextFormatColl());
    node.FormatToTextAttr(previous);
    node.ResetAllAttr();
    const set = previous.GetpSwAttrSet();
    if (set) node.SetAttr(set);
    if (point.GetNode() === previous) point.Assign(node, 0);
    if (pam.GetMark().GetNode() === previous) pam.GetMark().Assign(node, 0);
    node.JoinPrev();
  }
}
