/** @fileoverview Original ScItemPoolCache single-item/set transformations over actual canonical pattern holders;native allocator/refcount machinery stays erased under GC. */
import { CellAttributeHolder, ScPatternAttr, CellAttributeHelper } from "../../../inc/patattr";
import { SfxPoolItem } from "../../../../svl/inc/poolitem";
import { SfxItemSet, SfxPoolItemHolder, SfxItemState } from "../../../../svl/inc/itemset";
import { SvxBoxItem, SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { ATTR_BORDER } from "../../../inc/scitems";
/** Original cached transformation retains both source and modified canonical owners. */
interface SfxItemModifyImpl {
  readonly aOriginal: CellAttributeHolder;
  readonly aModified: CellAttributeHolder;
}
/** Original short-lived attribute transform cache. */
export class ScItemPoolCache {
  private readonly m_aCache: SfxItemModifyImpl[] = [];
  private readonly aItemToPut: SfxPoolItemHolder;
  private readonly pSetToPut: SfxItemSet | undefined;
  /** Original item or borrowed-set constructors. @param rHelper - Actual attribute helper. @param put - Source native item or set. @returns Cache. */
  constructor(
    private readonly rHelper: CellAttributeHelper,
    put: SfxPoolItem | SfxItemSet,
  ) {
    this.aItemToPut =
      put instanceof SfxPoolItem
        ? new SfxPoolItemHolder(rHelper.GetPool(), put)
        : new SfxPoolItemHolder();
    this.pSetToPut = put instanceof SfxItemSet ? put : undefined;
  }
  /** Original null/identity-cache lookup and native pattern merge. @param original - Actual canonical pattern holder. @returns Borrowed cached transformation. */
  ApplyTo(original: CellAttributeHolder): CellAttributeHolder {
    void this.rHelper;
    const pattern = original.getScPatternAttr();
    if (pattern === null) return original;
    for (const entry of this.m_aCache)
      if (entry.aOriginal.getScPatternAttr() === pattern) return entry.aModified;
    const next = new ScPatternAttr(pattern),
      item = this.aItemToPut.getItem();
    if (item !== null) next.ItemSetPut(item);
    else {
      const set = this.pSetToPut as SfxItemSet;
      if (set.GetItemState(ATTR_BORDER, false) === SfxItemState.SET) {
        const old = pattern.GetItemSet().GetItemIfSet(ATTR_BORDER) as SvxBoxItem | undefined;
        if (old !== undefined) {
          const box = new SvxBoxItem(set.Get(ATTR_BORDER) as SvxBoxItem);
          for (const edge of [
            SvxBoxItemLine.TOP,
            SvxBoxItemLine.BOTTOM,
            SvxBoxItemLine.LEFT,
            SvxBoxItemLine.RIGHT,
          ])
            if (!box.GetLine(edge)) box.SetLine(old.GetLine(edge), edge);
          if (!box.GetDistance(SvxBoxItemLine.RIGHT))
            box.SetAllDistances(old.GetDistance(SvxBoxItemLine.RIGHT));
          next.GetItemSetWritable().Put(box);
          const remaining = new SfxItemSet(set);
          try {
            remaining.ClearItem(ATTR_BORDER);
            next.GetItemSetWritable().PutSet(remaining);
          } finally {
            remaining.ClearItem();
          }
        } else next.GetItemSetWritable().PutSet(set);
      } else next.GetItemSetWritable().PutSet(set);
    }
    const entry = {
      aOriginal: new CellAttributeHolder(original),
      aModified: new CellAttributeHolder(next, true),
    };
    this.m_aCache.push(entry);
    return entry.aModified;
  }
  /** Releases actual logical pattern registrations owned by the native cache entries. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.m_aCache) {
      entry.aOriginal.Dispose();
      entry.aModified.Dispose();
    }
    this.m_aCache.length = 0;
  }
}
