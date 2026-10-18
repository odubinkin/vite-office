/** @fileoverview Original paper-bin values/defaults from frmitems.cxx; localized EditResId presentation remains a separate dependency. */
import { SfxByteItem } from "../../../svl/inc/intitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
/** Original unsigned8 sentinel selecting printer settings. */
export const PAPERBIN_PRINTER_SETTINGS = 0xff;
/** Original paper-tray item borrowing shared byte storage and UNO behavior. */
export class SvxPaperBinItem extends SfxByteItem {
  /** Original Which/tray and implicit-copy forms. @param source - Item identity or const source. @param tray - Native unsigned8 tray, default printer settings. @returns Item. */
  constructor(source: number | Readonly<SvxPaperBinItem>, tray = PAPERBIN_PRINTER_SETTINGS) {
    if (typeof source === "number") super(source, tray);
    else super(source);
  }
  /** Original factory uses Which0 and printer settings. @returns Default paper-tray item. */
  public static override CreateDefault(): SvxPaperBinItem {
    return new SvxPaperBinItem(0);
  }
  /** Original concrete copy clone, retaining Which and tray. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxPaperBinItem {
    void pool;
    return new SvxPaperBinItem(this);
  }
}
