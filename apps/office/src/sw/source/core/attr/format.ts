/**
 * @fileoverview Reimplements bounded SwFormat attribute ownership and derivation from pinned `sw/source/core/attr/format.cxx`.
 */

import { SwModify, BroadcastingModify, ClientNotifyAttrChg } from "../../../inc/calbck";
import type { SfxItemSet, WhichRangesContainer } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { AttrSetChangeHint, SwAttrSetChg, type SwModelHint } from "../../../inc/hints";
import { SwAttrSet, type SwAttrPool } from "./swatrset";

/** Base class for identity-bearing Writer styles and formats. */
export class SwFormat extends BroadcastingModify {
  private readonly attributeSet: SwAttrSet;
  private derivedFrom: SwFormat | undefined;
  private autoFormat = true;

  /** Creates a Writer format and connects its attribute set to the derived-from parent. @param pool - Owning Writer pool. @param formatName - UI format name. @param ranges - Accepted WhichId ranges. @param derivedFrom - Optional parent format. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    private formatName: string,
    ranges: WhichRangesContainer,
    derivedFrom?: SwFormat,
  ) {
    super();
    this.attributeSet = new SwAttrSet(pool, ranges);
    this.SetDerivedFrom(derivedFrom);
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

  /** Returns the parent format. @returns Derived-from format, when present. */
  public DerivedFrom(): SwFormat | undefined {
    return this.derivedFrom;
  }

  /** Changes the parent format and attribute-set inheritance. @param derivedFrom - New parent format. @returns True when changed. */
  public SetDerivedFrom(derivedFrom?: SwFormat): boolean {
    if (derivedFrom === this) throw new Error("SwFormat cannot derive from itself.");
    if (
      derivedFrom !== undefined &&
      derivedFrom.GetAttrSet().GetPool() !== this.attributeSet.GetPool()
    )
      throw new Error("SwFormat parent belongs to another pool.");
    if (this.derivedFrom === derivedFrom) return false;
    this.derivedFrom = derivedFrom;
    if (derivedFrom !== undefined) this.RegisterToModify(derivedFrom);
    else this.EndListening();
    this.attributeSet.SetParent(derivedFrom?.GetAttrSet());
    this.NotifyFormatInheritance();
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

  /** Emits one format inheritance/name hint through the document broadcaster. @returns Nothing. */
  protected NotifyFormatInheritance(): void {
    this.attributeSet.GetDoc().NotifyModelChange({
      formatId: this.formatName,
      kind: "format-inheritance-changed",
    });
  }
}
