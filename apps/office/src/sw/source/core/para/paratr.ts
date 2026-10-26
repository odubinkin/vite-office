/**
 * @fileoverview Reimplements the bounded Writer paragraph pool items from pinned `sw/source/core/para/paratr.cxx`.
 */

import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { RES_PARATR_CONNECT_BORDER, RES_PARATR_NUMRULE } from "../../../inc/hintids";

/** Native paragraph-border connection item, whose pooled default is true. */
export class SwParaConnectBorderItem extends SfxBoolItem {
  /** Creates the source boolean item. @param connect - Connect adjacent paragraph borders.  @returns Constructed instance. */
  public constructor(connect = true) {
    super(RES_PARATR_CONNECT_BORDER, connect);
  }

  /** Preserves the native concrete item type. @returns Independent item. */
  public override Clone(): SwParaConnectBorderItem {
    return new SwParaConnectBorderItem(this.GetValue());
  }
}

/** Native sw::ListLevelIndents flags from sw/inc/paratr.hxx. */
export enum ListLevelIndents {
  No = 0,
  FirstLine = 1,
  LeftMargin = 2,
}

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
}
