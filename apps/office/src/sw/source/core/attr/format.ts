/**
 * @fileoverview Reimplements bounded SwFormat attribute ownership and derivation from pinned `sw/source/core/attr/format.cxx`.
 */

import { SwModify, BroadcastingModify, ClientNotifyAttrChg } from "../../../inc/calbck";
import type { SfxItemSet, WhichRangesContainer } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  AttrSetChangeHint,
  SwAttrSetChg,
  SwFormatChangeHint,
  type SwModelHint,
} from "../../../inc/hints";
import { SwAttrSet, type SwAttrPool } from "./swatrset";
import type { SvxULSpaceItem, SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import type { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { RES_LR_SPACE, RES_HORI_ORIENT, RES_UL_SPACE, RES_PAGEDESC } from "../../../inc/hintids";

/** Base class for identity-bearing Writer styles and formats. */
export class SwFormat extends BroadcastingModify {
  private readonly attributeSet: SwAttrSet;
  private autoFormat = true;
  private formatInDTOR = false;

  /** Creates a Writer format and connects its attribute set to the derived-from parent. @param pool - Owning Writer pool. @param formatName - UI format name. @param ranges - Accepted WhichId ranges. @param derivedFrom - Optional parent format. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    private formatName: string,
    ranges: WhichRangesContainer,
    derivedFrom?: SwFormat,
  ) {
    super();
    this.attributeSet = new SwAttrSet(pool, ranges);
    if (derivedFrom !== undefined) {
      if (derivedFrom.GetAttrSet().GetPool() !== pool)
        throw new Error("SwFormat parent belongs to another pool.");
      this.RegisterToModify(derivedFrom);
      this.attributeSet.SetParent(derivedFrom.GetAttrSet());
    }
  }

  /** Returns the UI format name. @returns Format name. */
  public GetName(): string {
    return this.formatName;
  }

  /** Changes the UI format name. @param name - Raw name. @param broadcast - Whether to notify clients. @returns Nothing. */
  public SetFormatName(name: string, broadcast = false): void {
    this.formatName = name;
    if (broadcast) this.NotifyFormatInheritance();
  }

  /** Returns the owned attribute set. @returns Format attributes. */
  public GetAttrSet(): SwAttrSet {
    return this.attributeSet;
  }

  /** Reads native upper/lower spacing from the original effective item set. @param searchInParent - Whether inherited items participate. @returns Borrowed owned, inherited or pooled item. */
  public GetULSpace(searchInParent = true): SvxULSpaceItem {
    return this.attributeSet.Get(RES_UL_SPACE, searchInParent) as SvxULSpaceItem;
  }

  /** Reads original effective frame LR spacing. @param searchInParent - Whether inherited items participate. @returns Borrowed original item. */
  public GetLRSpace(searchInParent = true): SvxLRSpaceItem {
    return this.attributeSet.Get(RES_LR_SPACE, searchInParent) as SvxLRSpaceItem;
  }

  /** Reads original effective horizontal orientation. @param searchInParent - Whether inherited items participate. @returns Borrowed original item. */
  public GetHoriOrient(searchInParent = true): SwFormatHoriOrient {
    return this.attributeSet.Get(RES_HORI_ORIENT, searchInParent) as SwFormatHoriOrient;
  }

  /** Returns the parent format. @returns Derived-from format, when present. */
  public DerivedFrom(): SwFormat | undefined {
    return this.GetRegisteredIn() as SwFormat | undefined;
  }

  /** Changes original parent registration and item inheritance, rejecting cycles. @param derivedFrom - New parent, or omitted to restore the current root. @returns True when changed. */
  public SetDerivedFrom(derivedFrom?: SwFormat): boolean {
    if (
      derivedFrom !== undefined &&
      derivedFrom.GetAttrSet().GetPool() !== this.attributeSet.GetPool()
    )
      throw new Error("SwFormat parent belongs to another pool.");
    let parent = derivedFrom;
    if (parent !== undefined) {
      for (
        let candidate: SwFormat | undefined = parent;
        candidate !== undefined;
        candidate = candidate.DerivedFrom()
      ) {
        if (candidate === this) return false;
      }
    } else {
      parent = this.DerivedFrom() ?? this;
      let ancestor = parent.DerivedFrom();
      while (ancestor !== undefined) {
        parent = ancestor;
        ancestor = parent.DerivedFrom();
      }
    }
    if (parent === this.DerivedFrom() || parent === this) return false;
    this.RegisterToModify(parent);
    this.attributeSet.SetParent(parent.GetAttrSet());
    this.SwClientNotify(this, new SwFormatChangeHint(this, this));
    return true;
  }

  /** Stores one direct item using native effective old/new deltas. @param item - Format item. @returns True when changed. */
  public SetFormatAttr(item: SfxPoolItem): boolean {
    if (this.IsModifyLocked()) return this.attributeSet.Put(item) !== undefined;
    const oldSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges()),
      newSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges());
    const changed = this.attributeSet.Put_BC(item, oldSet, newSet);
    if (changed) {
      ClientNotifyAttrChg(this, this.attributeSet, oldSet, newSet);
    }
    return changed;
  }
  /** Copies one complete native item-set delta. @param set - Source set. @returns True when changed. */
  public SetFormatAttrSet(set: SfxItemSet): boolean {
    if (set.Count() === 0) return false;
    const source = set.Clone();
    if (this.IsModifyLocked()) return this.attributeSet.PutSet(source);
    const oldSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges()),
      newSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges());
    const changed = this.attributeSet.Put_BC(source, oldSet, newSet);
    if (changed) {
      ClientNotifyAttrChg(this, this.attributeSet, oldSet, newSet);
    }
    return changed;
  }
  /** Resets one identity or an inclusive native range. @param which - First WhichId. @param last - Optional last WhichId. @returns Whether removed. */
  public ResetFormatAttr(which: number, last = 0): boolean {
    if (this.attributeSet.Count() === 0) return false;
    if (last === 0 || last < which) last = which;
    if (this.IsModifyLocked())
      return (
        (last === which
          ? this.attributeSet.ClearItem(which)
          : this.attributeSet.ClearItem_BC(which, last)) !== 0
      );
    const oldSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges()),
      newSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges());
    const changed = this.attributeSet.ClearItem_BC(which, last, oldSet, newSet) !== 0;
    if (changed) {
      ClientNotifyAttrChg(this, this.attributeSet, oldSet, newSet);
    }
    return changed;
  }
  /** Clears all native direct attributes and returns the collected effective new-item count. @returns Native count. */
  public ResetAllFormatAttr(): number {
    if (this.attributeSet.Count() === 0) return 0;
    if (this.IsModifyLocked()) return this.attributeSet.ClearItem();
    const oldSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges()),
      newSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges());
    if (this.attributeSet.ClearItem_BC(0, oldSet, newSet) !== 0) {
      ClientNotifyAttrChg(this, this.attributeSet, oldSet, newSet);
    }
    return newSet.Count();
  }
  /** Filters inherited native deltas by every locally-present WhichId. @param source - Original notifying parent. @param hint - Native change. @returns Nothing. */
  public override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "object-dying") {
      if (this.GetRegisteredIn() !== undefined && this.GetRegisteredIn() === hint.m_pDying) {
        const parent = hint.m_pDying.GetRegisteredIn() as SwFormat | undefined;
        if (parent !== undefined) {
          this.RegisterToModify(parent);
          this.attributeSet.SetParent(this.DerivedFrom()?.GetAttrSet());
        } else {
          this.EndListeningAll();
          this.attributeSet.SetParent(undefined);
        }
      }
      super.SwClientNotify(this, hint);
      return;
    }
    if (hint.kind === "format-change") {
      if (hint.m_pOldFormat !== this && hint.m_pNewFormat === this.GetRegisteredIn()) {
        this.attributeSet.SetParent(this.DerivedFrom()?.GetAttrSet());
      }
      super.SwClientNotify(this, hint);
      return;
    }
    if (hint.kind === "attr-set-change") {
      const old = hint.m_pOld,
        next = hint.m_pNew;
      if (old !== undefined && next !== undefined && old.GetTheChgdSet() !== this.attributeSet) {
        const filteredNew = new SwAttrSetChg(next);
        filteredNew.GetChgSet().Differentiate(this.attributeSet);
        if (filteredNew.Count() === 0) return;
        const filteredOld = new SwAttrSetChg(old);
        filteredOld.GetChgSet().Differentiate(this.attributeSet);
        super.SwClientNotify(source, new AttrSetChangeHint(filteredOld, filteredNew));
        return;
      }
    }
    super.SwClientNotify(source, hint);
  }

  /** Reports whether this is an automatic rather than named format. @returns Auto-format flag. */
  public IsAuto(): boolean {
    return this.autoFormat;
  }

  /** Changes the auto-format flag. @param autoFormat - New flag. @returns Nothing. */
  public SetAuto(autoFormat: boolean): void {
    this.autoFormat = autoFormat;
  }

  /** Reads the native dependent-client destruction flag. @returns Whether format death started with Writer clients. */
  public IsFormatInDTOR(): boolean {
    return this.formatInDTOR;
  }

  /** Runs native format destruction before inherited notifier and modify teardown. @returns Nothing. */
  public override DisposeModify(): void {
    this.Destr();
    super.DisposeModify();
  }

  /** Reparents original dependent clients, retaining native parentless page-descriptor cleanup. @returns Nothing. */
  private Destr(): void {
    if (!this.HasWriterListeners()) return;
    this.formatInDTOR = true;
    const parent = this.DerivedFrom();
    if (parent === undefined) {
      SwFormat.prototype.ResetFormatAttr.call(this, RES_PAGEDESC);
      return;
    }
    this.PrepareFormatDeath(new SwFormatChangeHint(this, parent));
  }

  /** Emits one format inheritance/name hint through the document broadcaster. @returns Nothing. */
  protected NotifyFormatInheritance(): void {
    this.attributeSet.GetDoc().NotifyModelChange({
      formatId: this.formatName,
      kind: "format-inheritance-changed",
    });
  }
}
