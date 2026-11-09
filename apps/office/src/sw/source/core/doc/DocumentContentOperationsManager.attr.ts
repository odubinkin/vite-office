/** @fileoverview Consumed native InsertItemSet/lcl_InsAttr no-undo paragraph item-set paths from DocumentContentOperationsManager.cxx, used by HTML target-attribute restoration. */
import type { SwDoc } from "./doc";
import { getTextFormatCollNodes } from "./docfmt";
import type { SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwRegHistory } from "../undo/rolbck";
import { SetAttrMode } from "../../../inc/swtypes";
import * as H from "../../../inc/hintids";
import { XATTR_FILL_FIRST, XATTR_FILL_LAST } from "../../../../svx/inc/xdef";
import { SwFormatAutoFormat } from "../txtnode/fmtatr2";
import { releaseStyleHandle } from "../../../../svl/source/items/stylepool";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
/** Original filter-consumed branch. Unsupported general editing/word-interior inputs are rejected before mutation; no word/undo/layout service is simulated. @param doc - Actual document. @param range - Native filter selection. @param set - Actual attribute set. @param mode - Native flags. @returns Nothing. */
export function InsertItemSet(doc: SwDoc, range: SwPaM, set: SfxItemSet, mode: SetAttrMode): void {
  if (doc.GetUndoManager().DoesUndo() || range.IsInFrontOfLabel())
    throw new Error(
      "InsertItemSet filter path requires disabled undo and an ordinary paragraph range",
    );
  if (range.HasMark()) {
    const items = set.entries();
    if (
      items.length !== set.Count() ||
      items.some(
        /** Admits the drawing fill subset of the native paragraph OtherSet. @param item - Actual set entry. @returns Whether outside the represented range. */
        (item) => item.Which() < XATTR_FILL_FIRST || item.Which() > XATTR_FILL_LAST,
      )
    )
      throw new Error("InsertItemSet selected filter range requires only drawing fill items");
    if (!items.length) return;
    const nodes = getTextFormatCollNodes(doc, range);
    let changed = false;
    for (const node of nodes) changed = node.SetAttr(set) || changed;
    if (
      changed ||
      nodes.length > 1 ||
      (nodes[0] &&
        range.Start().GetContentIndex() === 0 &&
        range.End().GetContentIndex() === nodes[0].Len())
    )
      doc.NotifyModelChange({ kind: "document-modified", modified: true });
    return;
  }
  const point = range.GetPoint(),
    node = point.GetNode(),
    offset = point.GetContentIndex();
  if (
    !(node instanceof SwTextNode) ||
    node.GetDoc() !== doc ||
    (offset !== 0 && offset !== node.Len())
  )
    throw new Error("InsertItemSet filter path requires an actual paragraph boundary");
  const allowed = new SfxItemSet(doc.GetAttrPool(), [
    [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
    [H.RES_PARATR_BEGIN, H.RES_PARATR_NUMRULE - 1],
    [H.RES_PARATR_NUMRULE + 1, H.RES_PARATR_CONNECT_BORDER],
    [H.RES_LR_SPACE, H.RES_UL_SPACE],
    [XATTR_FILL_FIRST, XATTR_FILL_LAST],
  ]);
  const characters = new SfxItemSet(doc.GetAttrPool(), [
      [H.RES_CHRATR_BEGIN, H.RES_CHRATR_END - 1],
    ]),
    other = new SfxItemSet(doc.GetAttrPool(), [
      [H.RES_PARATR_BEGIN, H.RES_GRFATR_END - 1],
      [H.RES_UNKNOWNATR_BEGIN, H.RES_UNKNOWNATR_END - 1],
      [XATTR_FILL_FIRST, XATTR_FILL_LAST],
    ]);
  try {
    allowed.PutSet(set);
    if (allowed.Count() !== set.Count())
      throw new Error("InsertItemSet filter path requires native HTML target-attribute ranges");
    characters.PutSet(set);
    other.PutSet(set);
    let changed = false;
    if (characters.Count()) {
      if (
        !(mode & SetAttrMode.DONTREPLACE) &&
        node.GetpSwpHints()?.Count() &&
        offset === 0 &&
        offset === node.Len()
      )
        node.RstTextAttr(0, node.Len(), 0, characters);
      const history = new SwRegHistory(node, node);
      try {
        changed = history.InsertItems(characters, offset, offset, mode);
      } finally {
        history.Dispose();
      }
      const marker = node.GetSwAttrSet().GetItemIfSet(H.RES_PARATR_LIST_AUTOFMT, true);
      if (changed && offset === node.Len() && marker instanceof SwFormatAutoFormat) {
        const old = marker.GetStyleHandle();
        if (!old) throw new Error("assert(paragraph marker automatic style)");
        const copy = old.Clone();
        try {
          copy.PutSet(characters);
          const handle = doc
            .GetIStyleAccess()
            .getAutomaticStyle(copy, SwAutoStyleFamily.AUTO_STYLE_CHAR);
          const item = new SwFormatAutoFormat(handle, H.RES_PARATR_LIST_AUTOFMT);
          releaseStyleHandle(handle);
          try {
            node.SetAttr(item);
          } finally {
            item.Dispose();
          }
        } finally {
          copy.Dispose();
        }
      }
    }
    if (other.Count()) changed = node.SetAttr(other) || changed;
    if (changed) doc.NotifyModelChange({ kind: "document-modified", modified: true });
  } finally {
    allowed.Dispose();
    characters.Dispose();
    other.Dispose();
  }
}
