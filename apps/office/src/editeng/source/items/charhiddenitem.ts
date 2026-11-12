/** @fileoverview Native hidden-character constructor/copy/Clone from charhiddenitem.cxx; localized GetPresentation remains unported. */
import { SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
/** Original hidden-character bool item, distinct from other bool item types. */
export class SvxCharHiddenItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Native constructor selection. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxCharHiddenItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original independent concrete copy. @param pool - Unused pool. @returns Item. */
  override Clone(pool?: SfxItemPool): SvxCharHiddenItem {
    void pool;
    return new SvxCharHiddenItem(this);
  }
}
