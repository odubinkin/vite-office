/** @fileoverview Native boolean item for dynamic header/footer spacing. */
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { RES_HEADER_FOOTER_EAT_SPACING } from "./hintids";

/** Whether the header/footer can consume part of its body distance dynamically. */
export class SwHeaderAndFooterEatSpacingItem extends SfxBoolItem {
  /** Creates the original item, defaulting to false. @param which - Native WhichId. @param value - Spacing flag. @returns Item. */
  constructor(which: number = RES_HEADER_FOOTER_EAT_SPACING, value = false) {
    super(which, value);
  }

  /** Clones the original concrete type and WhichId. @returns Independent item. */
  override Clone(): SwHeaderAndFooterEatSpacingItem {
    return new SwHeaderAndFooterEatSpacingItem(this.Which(), this.GetValue());
  }
}
