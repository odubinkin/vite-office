/** @fileoverview Ports MakeTextAttr construction for the registered ranged hint types from pinned sw/source/core/txtnode/thints.cxx. */
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_CHRATR_BEGIN, RES_CHRATR_END } from "../../../inc/hintids";
import { SwAutoStyleFamily } from "../../../inc/istyleaccess";
import type { SwDoc } from "../doc/doc";
import { SwFormatINetFormat } from "./fmtatr2";
import { SwTextINetFormat } from "./txtatr2";
import { SwFormatAutoFormat, SwTextAttrEnd } from "./txatbase";

/** Builds a fresh ranged attribute, interning set/character inputs and converting foreign automatic handles into the destination pool. @param doc - Destination document. @param attr - Document-pool concrete set or supported pool item. @param start - Inclusive offset. @param end - Exclusive offset. @returns Fresh automatic or internet hint with native constructor flags. */
export function MakeTextAttr(
  doc: SwDoc,
  attr: SfxItemSet | SfxPoolItem,
  start: number,
  end: number,
): SwTextAttrEnd<SwFormatAutoFormat | SwFormatINetFormat> {
  if (attr instanceof SfxItemSet) {
    const handle = doc.GetIStyleAccess().getAutomaticStyle(attr, SwAutoStyleFamily.AUTO_STYLE_CHAR);
    return MakeTextAttr(doc, new SwFormatAutoFormat(handle), start, end);
  }
  if (attr.Which() >= RES_CHRATR_BEGIN && attr.Which() < RES_CHRATR_END) {
    const set = new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_BEGIN, RES_CHRATR_END]]);
    set.Put(attr);
    return MakeTextAttr(doc, set, start, end);
  }
  if (attr instanceof SwFormatAutoFormat && attr.GetStyleHandle().GetPool() !== doc.GetAttrPool())
    return MakeTextAttr(doc, attr.GetStyleHandle().Clone(true, doc.GetAttrPool()), start, end);
  if (attr instanceof SwFormatINetFormat) return new SwTextINetFormat(attr.Clone(), start, end);
  if (attr instanceof SwFormatAutoFormat) return new SwTextAttrEnd(attr.Clone(), start, end);
  throw new Error("MakeTextAttr hint type is not implemented.");
}
