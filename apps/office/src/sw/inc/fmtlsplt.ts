/** @fileoverview Implements the native Writer table layout split item from fmtlsplt.hxx and atrfrm.cxx. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { RES_LAYOUT_SPLIT } from "./hintids";

/** Controls whether a table may split across pages and columns. */
export class SwFormatLayoutSplit extends SfxBoolItem {
  /** Creates the native true default. @param split - Whether splitting is allowed. @returns Nothing. */
  public constructor(split = true) {
    super(RES_LAYOUT_SPLIT, split);
  }
  /** Copies the concrete item with its current identity and value. @returns Independent native item. */
  public override Clone(): SwFormatLayoutSplit {
    const copy = new SwFormatLayoutSplit(this.GetValue());
    copy.SetWhich(this.Which());
    return copy;
  }
}
