/** @fileoverview Ports registered body-text join flags and preparation from pinned sw/source/core/doc/docedt.cxx. */
import type { SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_BREAK, RES_PAGEDESC } from "../../../inc/hintids";

/** Normalizes native deletion direction and selects the surviving boundary. @param range - Actual selection. @returns Join and previous-survivor flags. */
export function sw_GetJoinFlags(range: SwPaM): { joinText: boolean; joinPrev: boolean } {
  if (range.GetPoint().GetNode() === range.GetMark().GetNode())
    return { joinText: false, joinPrev: false };
  const start = range.Start(),
    end = range.End(),
    first = start.GetNode(),
    last = end.GetNode();
  if (!(first instanceof SwTextNode) || !(last instanceof SwTextNode))
    return { joinText: false, joinPrev: false };
  let exchange = start === range.GetPoint();
  if (start.GetContentIndex() === 0 && last.Len() !== end.GetContentIndex()) exchange = !exchange;
  if (exchange) range.Exchange();
  return { joinText: true, joinPrev: range.GetPoint() === start };
}

/** Joins the next registered body text node using native survivor and direct-property preparation. Actual CutImpl/InsertHint ownership and nontext graph families remain unverified. @param range - Corrected point at the first boundary. @param joinPrev - Whether the trailing node survives. @returns Whether text nodes joined. */
export function sw_JoinText(range: SwPaM, joinPrev: boolean): boolean {
  const first = range.GetPoint().GetNode();
  if (!(first instanceof SwTextNode)) return false;
  const nodes = first.GetNodes(),
    last = nodes.at(first.GetIndex() + 1);
  if (!(last instanceof SwTextNode)) return false;
  if (!joinPrev) {
    first.GetDoc().GetDocumentContentOperationsManager().JoinTextNodes(first, last);
    return true;
  }
  last.ResetAttr([RES_BREAK, RES_PAGEDESC]);
  const direct = first.GetpSwAttrSet();
  if (direct !== undefined) {
    const breaks = new SfxItemSet(first.GetDoc().GetAttrPool(), [[RES_PAGEDESC, RES_BREAK]]);
    breaks.PutSet(direct);
    if (breaks.Count() !== 0) last.SetAttr(breaks);
  }
  first.FormatToTextAttr(last);
  // JoinPrev is selected only when the first paragraph became empty. The existing
  // portable zero-length CopyAttr boundary is explicit until native CutImpl is ported.
  last.ReplaceRange(0, 0, first.CaptureTextFragment(0, 0));
  first.MoveAllContentIndicesTo(last);
  nodes.removeTextNode(first);
  return true;
}
