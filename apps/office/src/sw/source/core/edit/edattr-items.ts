/** @fileoverview GetItemWithPaM's original node/automatic-hint traversal from edattr.cxx. Current layout has no original SwScriptInfo or character-format style service; no replacement service or effective-run normalization is supplied. */
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwFormatAutoFormat } from "../txtnode/txatbase";
import type { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SfxItemState } from "../../../../svl/inc/itemset";
import { WEAK } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { GetWhichOfScript } from "../attr/hints";
/** Borrowed original item and independent actual content-index range. */
export type SwItemWithPaM = readonly [SfxPoolItem | undefined, SwPaM];
/** Original layout-absent traversal over represented native node/automatic-hint owners. @param document - Actual document. @param cursor - Original ring. @param which - Character Which. @returns Source-ordered contributions, including original overlap/null/default behavior. */
export function getSwItemWithPaM(document: SwDoc, cursor: SwPaM, which: number): SwItemWithPaM[] {
  const result: SwItemWithPaM[] = [];
  /** Builds an independent native range without changing the actual selection ring. @param node - Native text owner. @param start - Start offset. @param end - End offset. @returns Original range. */
  function range(node: SwTextNode, start: number, end: number): SwPaM {
    const point = new SwPosition(node, start),
      mark = new SwPosition(node, end);
    try {
      return new SwPaM(point, mark);
    } finally {
      point.Dispose();
      mark.Dispose();
    }
  }
  for (const current of cursor.GetRingContainer()) {
    const start = current.Start(),
      end = current.End();
    for (let index = start.GetNodeIndex(); index <= end.GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (!(node instanceof SwTextNode)) continue;
      const first = index === start.GetNodeIndex() ? start.GetContentIndex() : 0,
        last = index === end.GetNodeIndex() ? end.GetContentIndex() : node.Len();
      which = GetWhichOfScript(which, WEAK);
      if (node.HasSwAttrSet()) {
        const set = node.GetSwAttrSet(),
          state = set.GetItemState(which);
        result.push([
          state >= SfxItemState.DEFAULT ? set.Get(which) : undefined,
          range(node, first, last),
        ]);
      }
      for (const hint of node.GetpSwpHints()?.entries() ?? []) {
        const format = hint.GetAttr();
        if (!(format instanceof SwFormatAutoFormat)) continue;
        const attrStart = hint.GetStart(),
          attrEnd = hint.GetEnd() as number;
        if (attrStart > last) break;
        if (attrEnd <= first) continue;
        which = GetWhichOfScript(which, WEAK);
        const set = format.GetStyleHandle();
        let item: SfxPoolItem | undefined;
        for (const candidate of set.entries()) {
          item = candidate;
          if (item.Which() === which) {
            result.push([item, range(node, Math.max(attrStart, first), Math.min(attrEnd, last))]);
            break;
          }
        }
        if (item === undefined && !node.HasSwAttrSet())
          result.push([
            set.GetPool().GetUserDefaultItem(which) ?? undefined,
            range(node, first, last),
          ]);
      }
    }
  }
  return result;
}
