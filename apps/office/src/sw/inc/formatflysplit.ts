/** @fileoverview Native boolean attribute for splitting a fly containing a floating table. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { RES_FLY_SPLIT } from "./hintids";

/** Original default-false text-fly split item. */
export class SwFormatFlySplit extends SfxBoolItem {
  /** Creates the original boolean value. @param split - Whether the fly can split. @returns Item. */
  constructor(split = false) {
    super(RES_FLY_SPLIT, split);
  }

  /** Preserves the concrete native item. @returns Independent item copy. */
  override Clone(): SwFormatFlySplit {
    return new SwFormatFlySplit(this.GetValue());
  }
}
