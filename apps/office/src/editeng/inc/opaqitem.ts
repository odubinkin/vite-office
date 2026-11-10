/** @fileoverview Native SvxOpaqueItem true/default/copy/Clone bool payload from include/editeng/opaqitem.hxx and frmitems.cxx; localized presentation is not ported here. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import type { SfxItemPool } from "../../svl/source/items/itempool";
/** Original opacity bool item, with caller-supplied Which and true default. */
export class SvxOpaqueItem extends SfxBoolItem {
  /** Original regular and implicit copy construction. @param source - Which identity or actual source. @param opaque - Original default true payload. @returns Item. */
  constructor(source: number | SvxOpaqueItem, opaque = true) {
    super(source, opaque);
  }
  /** Original copy clone retains caller Which and dynamic item type. @param pool - Unused source pool. @returns Actual copied item. */
  override Clone(pool?: SfxItemPool): SvxOpaqueItem {
    void pool;
    return new SvxOpaqueItem(this);
  }
}
