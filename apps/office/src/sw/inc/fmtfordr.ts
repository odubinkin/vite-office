/** @fileoverview Original SwFillOrder and SwFormatFillOrder from fmtfordr.hxx and layout/atrfrm.cxx, using the actual native enum-item base. */
import { SfxEnumItem } from "../../svl/inc/eitem";
import type { SfxItemPool } from "../../svl/source/items/itempool";
import { RES_FILL_ORDER } from "./hintids";
/** Original fill-order enum aliases and ordinal values. */
export enum SwFillOrder {
  SW_FILL_ORDER_BEGIN,
  // Original ATT_TOP_DOWN aliases SW_FILL_ORDER_BEGIN.
  ATT_TOP_DOWN = 0,
  ATT_BOTTOM_UP,
  ATT_LEFT_TO_RIGHT,
  ATT_RIGHT_TO_LEFT,
  SW_FILL_ORDER_END,
}
/** Original table-line fill-order item retains the source TOP_DOWN default. */
export class SwFormatFillOrder extends SfxEnumItem<SwFillOrder> {
  /** Initializes the native WhichId and enum payload. @param value - Original default or authored fill order. @returns Item. */
  public constructor(value: SwFillOrder = SwFillOrder.ATT_TOP_DOWN) {
    super(RES_FILL_ORDER, value);
  }
  /** Original Clone constructs from the value, restoring the declared native WhichId. @param pool - Unused native pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SwFormatFillOrder {
    void pool;
    return new SwFormatFillOrder(this.GetValue());
  }
}
