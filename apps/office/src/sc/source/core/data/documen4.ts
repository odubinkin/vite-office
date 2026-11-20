/** @fileoverview Native conditional style lookup through the cell's ordered conditional format indices. */
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SfxStyleFamily } from "../../../../svl/inc/style-values";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import type { ScAddress } from "../../../inc/address";
import type { ScCondFormatItem } from "../../../inc/attrib";
import type { ScConditionalFormat } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";
import { ATTR_CONDITIONAL } from "../../../inc/scitems";

/** Hands an owned conditional format to its sheet. @param this - Native document. @param format - New format. @param tab - Destination sheet. @returns Assigned index or zero. */
export function AddCondFormat(this: ScDocument, format: ScConditionalFormat, tab: number): number {
  return this.FetchTable(tab)?.AddCondFormat(format) ?? 0;
}

/** Returns the first matching style in the cell's conditional format index order. @param this - Native document. @param position - Target cell. @returns Native style items or absence. */
export function GetCondResult(this: ScDocument, position: ScAddress): SfxItemSet | undefined {
  const indices = this.GetPattern(position)?.GetItem(ATTR_CONDITIONAL) as
    ScCondFormatItem | undefined;
  const keys = indices?.GetCondFormatData();
  if (!keys || keys.empty()) return undefined;
  const list = this.FetchTable(position.Tab())?.GetCondFormList();
  const pool = this.GetStyleSheetPool();
  if (!list || !pool) return undefined;
  const cell = this.GetRefCellValue(position);
  for (const key of keys) {
    const name = list.GetFormat(key)?.GetCellStyle(cell, position);
    if (!name) continue;
    const value = unicode(name);
    try {
      const style = pool.Find(value, SfxStyleFamily.Para);
      if (style) return style.GetItemSet();
    } finally {
      value.dispose();
    }
  }
  return undefined;
}
