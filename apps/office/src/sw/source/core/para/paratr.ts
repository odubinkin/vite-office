/**
 * @fileoverview Reimplements the bounded Writer paragraph pool items from pinned `sw/source/core/para/paratr.cxx`.
 */

import {
  SfxStringItem,
  type SfxPoolItem,
  type SfxPoolItemSnapshot,
} from "../../../../svl/source/items/poolitem";
import { RES_PARATR_NUMRULE } from "../../../inc/hintids";

/** Stores the name of the SwNumRule applied to a paragraph. */
export class SwNumRuleItem extends SfxStringItem {
  /** Creates a numbering-rule item. @param ruleName - Writer numbering-rule name. @returns Nothing. */
  public constructor(ruleName = "") {
    super(RES_PARATR_NUMRULE, ruleName);
  }

  /** Creates an independent numbering-rule item. @returns Cloned item. */
  public override Clone(): SwNumRuleItem {
    return new SwNumRuleItem(this.GetValue());
  }

  /** Compares numbering-rule identity and value. @param other - Candidate item. @returns True for an equal SwNumRuleItem. */
  public override equals(other: SfxPoolItem): boolean {
    return other instanceof SwNumRuleItem && other.GetValue() === this.GetValue();
  }

  /** Creates a persisted numbering-rule item record. @returns Item snapshot. */
  public override toSnapshot(): SfxPoolItemSnapshot {
    return { type: "SwNumRuleItem", value: this.GetValue(), which: this.Which() };
  }
}
