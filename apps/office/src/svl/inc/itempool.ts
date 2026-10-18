/** @fileoverview Canonical itempool.hxx boundary borrowing the existing shared pool and native item-info owners. */
export {
  SfxItemPool,
  ItemInfo,
  ItemInfoStatic,
  ItemInfoDynamic,
  ItemInfoUser,
  ItemInfoPackage,
  SFX_ITEMINFOFLAG_NONE,
  SFX_ITEMINFOFLAG_SUPPORT_SURROGATE,
} from "../source/items/itempool";
export type { SfxPoolItemFactory } from "../source/items/itempool";
