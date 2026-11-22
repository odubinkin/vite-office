/**
 * @fileoverview Reimplements the bounded Writer paragraph pool items from pinned `sw/source/core/para/paratr.cxx`.
 */

import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import {
  RES_PARATR_CONNECT_BORDER,
  RES_PARATR_NUMRULE,
  RES_PARATR_REGISTER,
} from "../../../inc/hintids";

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

/** Native paragraph participation in page line-spacing. */
export class SwRegisterItem extends SfxBoolItem {
  /** Creates the original register item for its paragraph or Page Style slot. @param active - Participation in page line-spacing. @param which - Paragraph WhichId or page dialog slot. @returns Item. */
  public constructor(active = false, which: number = RES_PARATR_REGISTER) {
    super(which, active);
  }

  /** Creates the native pool default. @returns Item with participation disabled. */
  public static override CreateDefault(): SwRegisterItem {
    return new SwRegisterItem();
  }

  /** Copies the original typed item. @returns Independent item. */
  public override Clone(): SwRegisterItem {
    return new SwRegisterItem(this.GetValue(), this.Which());
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
