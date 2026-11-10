/** @fileoverview Consumed MSWordExportBase::OutputTextNode paragraph-marker selection and RtfAttributeOutput::ApplyCharFormatItems responsibilities. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwFormatAutoFormat } from "../../core/txtnode/txatbase";
import { SwFormatCharFormat } from "../../core/txtnode/fmtatr2";
import * as H from "../../../inc/hintids";
/** Selects native list auto-style, terminal zero-length hint and paragraph-direct fallback in source order. @param node - Native paragraph. @returns Caller-owned native item set. */
export function GetParagraphMarkerProperties(node: SwTextNode): SfxItemSet {
  const set = new SfxItemSet(node.GetDoc().GetAttrPool(), [[H.RES_CHRATR_BEGIN, H.RES_TXTATR_END]]);
  let charFormatOnly = true;
  const automatic = node.GetAttr(H.RES_PARATR_LIST_AUTOFMT);
  const handle = automatic instanceof SwFormatAutoFormat ? automatic.GetStyleHandle() : undefined;
  if (handle) {
    set.PutSet(handle);
    charFormatOnly = false;
  } else {
    for (const hint of node.GetpSwpHints()?.entries() ?? []) {
      const end = hint.GetEnd();
      if (end === undefined || hint.GetStart() !== end || end !== node.Len()) continue;
      const which = hint.Which();
      if ((which === H.RES_TXTATR_AUTOFMT && charFormatOnly) || which === H.RES_TXTATR_CHARFMT)
        set.Put(hint.GetAttr());
      if (which !== H.RES_TXTATR_CHARFMT) charFormatOnly = false;
    }
  }
  const paragraph = node.GetpSwAttrSet();
  if (paragraph && charFormatOnly) set.PutSet(paragraph);
  return set;
}
/** Native ApplyCharFormatItems recursion writes named, automatic, then direct character items into the existing string writer's owned buffer binding. @param items - Actual source set. @returns Owned flattened native character buffer. */
export function CollectCharFormatItems(items: SfxItemSet): SfxItemSet {
  const result = new SfxItemSet(items.GetPool(), H.WRITER_CHARACTER_WHICH_RANGES);
  /** Source recursion visits real style sets and does not invent inherited/default values. @param source - Native set. @returns Nothing. */
  function apply(source: SfxItemSet): void {
    const named = source.GetItemIfSet(H.RES_TXTATR_CHARFMT, true);
    if (named instanceof SwFormatCharFormat) {
      const style = named.GetCharFormat();
      if (style) apply(style.GetAttrSet());
    }
    const automatic = source.GetItemIfSet(H.RES_TXTATR_AUTOFMT, true);
    if (automatic instanceof SwFormatAutoFormat) {
      const handle = automatic.GetStyleHandle();
      if (handle) apply(handle);
    }
    for (const [first, last] of H.WRITER_CHARACTER_WHICH_RANGES)
      for (let which: number = first; which <= last; ++which) {
        const item = source.GetItemIfSet(which, true);
        if (item) result.Put(item);
      }
  }
  try {
    apply(items);
    return result;
  } catch (error) {
    result.Dispose();
    throw error;
  }
}
