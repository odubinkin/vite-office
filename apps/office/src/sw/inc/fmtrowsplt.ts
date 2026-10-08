/** @fileoverview Implements the native Writer table row split item from fmtrowsplt.hxx and atrfrm.cxx. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { RES_ROW_SPLIT } from "./hintids";

/** Controls whether a table row may split across pages and columns. */
export class SwFormatRowSplit extends SfxBoolItem {
  /** Creates the native true default. @param split - Whether splitting is allowed. @returns Nothing. */
  public constructor(split = true) {
    super(RES_ROW_SPLIT, split);
  }
  /** Copies the concrete item with its current identity and value. @returns Independent native item. */
  public override Clone(): SwFormatRowSplit {
    const copy = new SwFormatRowSplit(this.GetValue());
    copy.SetWhich(this.Which());
    return copy;
  }
}
