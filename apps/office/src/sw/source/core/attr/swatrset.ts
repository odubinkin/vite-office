/**
 * @fileoverview Reimplements bounded SwAttrPool and SwAttrSet behavior from pinned `sw/source/core/attr/swatrset.cxx`.
 */

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SfxItemSet, type WhichRangesContainer } from "../../../../svl/source/items/itemset";
import { SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import {
  RES_PARATR_ADJUST,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import type { SwDoc } from "../doc/doc";
import { SwNumRuleItem } from "../para/paratr";

/** Writer-owned item pool with defaults for the currently implemented paragraph WhichIds. */
export class SwAttrPool extends SfxItemPool {
  /** Creates and registers Writer's bounded paragraph defaults. @param document - Owning Writer document. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {
    super();
    this.RegisterDefaultItem(
      new SvxAdjustItem(),
      /** Restores an adjustment item. @param value - Persisted enum value. @returns Concrete adjustment item. */
      function restoreAdjust(value): SvxAdjustItem {
        return new SvxAdjustItem(value as SvxAdjust);
      },
    );
    this.RegisterDefaultItem(
      new SwNumRuleItem(),
      /** Restores a numbering-rule item. @param value - Persisted rule name. @returns Concrete rule item. */
      function restoreNumRule(value): SwNumRuleItem {
        return new SwNumRuleItem(String(value));
      },
    );
    this.RegisterDefaultItem(
      new SfxStringItem(RES_PARATR_LIST_ID, ""),
      /** Restores a list-id item. @param value - Persisted list identity. @returns Concrete string item. */
      function restoreListId(value): SfxStringItem {
        return new SfxStringItem(RES_PARATR_LIST_ID, String(value));
      },
    );
    this.RegisterDefaultItem(
      new SfxInt16Item(RES_PARATR_LIST_LEVEL, 0),
      /** Restores a list-level item. @param value - Persisted list level. @returns Concrete integer item. */
      function restoreListLevel(value): SfxInt16Item {
        return new SfxInt16Item(RES_PARATR_LIST_LEVEL, Number(value));
      },
    );
  }

  /** Returns the document that owns this Writer attribute pool. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.document;
  }
}

/** Writer-specialized item set with typed paragraph accessors. */
export class SwAttrSet extends SfxItemSet {
  /** Creates a Writer attribute set. @param pool - Owning Writer pool. @param ranges - Accepted WhichId ranges. @param parent - Optional inherited set. @returns Nothing. */
  public constructor(pool: SwAttrPool, ranges: WhichRangesContainer, parent?: SfxItemSet) {
    super(pool, ranges, parent);
  }

  /** Returns the Writer pool. @returns Owning SwAttrPool. */
  public override GetPool(): SwAttrPool {
    return super.GetPool() as SwAttrPool;
  }

  /** Returns the Writer document through the pool. @returns Owning document. */
  public GetDoc(): SwDoc {
    return this.GetPool().GetDoc();
  }

  /** Returns the effective paragraph adjustment item. @param inParent - Whether style inheritance participates. @returns Adjustment item. */
  public GetAdjust(inParent = true): SvxAdjustItem {
    return this.Get(RES_PARATR_ADJUST, inParent) as SvxAdjustItem;
  }

  /** Returns the effective numbering-rule item. @param inParent - Whether style inheritance participates. @returns Numbering-rule item. */
  public GetNumRule(inParent = true): SwNumRuleItem {
    return this.Get(RES_PARATR_NUMRULE, inParent) as SwNumRuleItem;
  }

  /** Creates an independent Writer attribute set. @param includeItems - Whether direct deltas are copied. @returns Cloned Writer set. */
  public CloneAsValue(includeItems = true): SwAttrSet {
    const clone = new SwAttrSet(this.GetPool(), this.GetRanges(), this.GetParent());
    if (includeItems) clone.PutSet(this);
    return clone;
  }
}
