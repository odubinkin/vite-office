/**
 * @fileoverview Reimplements bounded SwFormat attribute ownership and derivation from pinned `sw/source/core/attr/format.cxx`.
 */

import type { SwFormatFlySplit } from "../../../inc/formatflysplit";
import type { SwFormatFollowTextFlow } from "../../../inc/fmtfollowtextflow";
import type { SwFormatWrapInfluenceOnObjPos } from "../../../inc/fmtwrapinfluenceonobjpos";
import {
  RES_FLY_SPLIT,
  RES_FOLLOW_TEXT_FLOW,
  RES_WRAP_INFLUENCE_ON_OBJPOS,
} from "../../../inc/hintids";
import type { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import type { SvxOpaqueItem } from "../../../../editeng/inc/opaqitem";
import type { SwFormatContent } from "../../../inc/fmtcntnt";
import type { SwFormatAnchor } from "../../../inc/fmtanchr";
import type { SwFormatSurround } from "../../../inc/fmtsrnd";
import type { SwFormatFillOrder } from "../../../inc/fmtfordr";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { cppu_detail_getUnoType_PropertyValue as propertyType } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import { SwModify, BroadcastingModify, ClientNotifyAttrChg } from "../../../inc/calbck";
import type { SfxItemSet, WhichRangesContainer } from "../../../../svl/source/items/itemset";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  AttrSetChangeHint,
  SwAttrSetChg,
  SwFormatChangeHint,
  type SwModelHint,
} from "../../../inc/hints";
import type { SwDoc } from "../doc/doc";
import { SwAttrSet, type SwAttrPool } from "./swatrset";
import type { SvxULSpaceItem, SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import type { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { RES_LR_SPACE, RES_HORI_ORIENT, RES_UL_SPACE, RES_PAGEDESC } from "../../../inc/hintids";

/** Base class for identity-bearing Writer styles and formats. */
export class SwFormat extends BroadcastingModify {
  /** Original inline fmtfordr.hxx effective item query. @param searchInParent - Native inheritance flag. @returns Borrowed fill-order item. */
  public GetFillOrder(searchInParent = true): SwFormatFillOrder {
    return this.attributeSet.GetFillOrder(searchInParent);
  }
  private readonly attributeSet: SwAttrSet;
  private autoFormat = true;
  private m_bAutoUpdateOnDirectFormat = false;
  private m_nPoolFormatId = SwPoolFormatId.UNKNOWN;
  private m_nPoolHelpId = 0xffff;
  private m_nPoolHlpFileId = 0xff;
  private m_bHidden = false;
  private m_bIsFavourite: boolean | undefined;
  private m_pGrabBagItem: SfxGrabBagItem | undefined;
  private formatInDTOR = false;

  /** Creates a Writer format and connects its attribute set to the derived-from parent. @param pool - Owning Writer pool. @param formatName - UI format name. @param ranges - Accepted WhichId ranges. @param derivedFrom - Optional parent format. @param formatWhich - Original required format identity. @returns Nothing. */
  public constructor(
    pool: SwAttrPool,
    private formatName: string,
    ranges: WhichRangesContainer,
    derivedFrom: SwFormat | undefined,
    private readonly formatWhich: number,
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

  /** Original SwFormat identity, distinct from pool attribute identities. @returns Native format WhichId. */
  public Which(): number {
    return this.formatWhich;
  }
  /** Reads the native common-format pool identity, initially UNKNOWN. @returns Identity. */
  public GetPoolFormatId(): SwPoolFormatId {
    return this.m_nPoolFormatId;
  }
  /** Stores the native unsigned16 pool identity without broadcasting. @param id - Native identity. @returns Nothing. */
  public SetPoolFormatId(id: number): void {
    this.m_nPoolFormatId = (id & 0xffff) as SwPoolFormatId;
    if (this.m_nPoolFormatId === SwPoolFormatId.UNKNOWN) this.m_bIsFavourite = true;
  }

  /** Native template help ID, initially USHRT_MAX despite its uint32 storage. @returns ID. */
  public GetPoolHelpId(): number {
    return this.m_nPoolHelpId;
  }
  /** Original unsigned32 assignment. @param id - Help ID. @returns Nothing. */
  public SetPoolHelpId(id: number): void {
    this.m_nPoolHelpId = id >>> 0;
  }
  /** Native document help-file index, initially UCHAR_MAX. @returns Index. */
  public GetPoolHlpFileId(): number {
    return this.m_nPoolHlpFileId;
  }
  /** Original unsigned8 assignment. @param id - File index. @returns Nothing. */
  public SetPoolHlpFileId(id: number): void {
    this.m_nPoolHlpFileId = id & 0xff;
  }
  /** Native absent optional means DOCX favourite status is unknown. @returns Original optional. */
  public IsFavourite(): boolean | undefined {
    return this.m_bIsFavourite;
  }
  /** Original optional assignment without notifications. @param value - Flag or nullopt. @returns Nothing. */
  public SetFavourite(value: boolean | undefined): void {
    this.m_bIsFavourite = value;
  }
  /** Native hidden flag, initially false. @returns Flag. */
  public IsHidden(): boolean {
    return this.m_bHidden;
  }
  /** Original silent flag assignment. @param value - Visibility flag. @returns Nothing. */
  public SetHidden(value: boolean): void {
    this.m_bHidden = value;
  }
  /** Original default-format test depends solely on its parent pointer. @returns Whether parentless. */
  public IsDefault(): boolean {
    return this.DerivedFrom() === undefined;
  }
  /** Original query creates an owning empty PropertyValue sequence when no bag exists. @param output - Actual output Any. @returns Nothing. */
  public GetGrabBagItem(output: Any): void {
    if (this.m_pGrabBagItem !== undefined) this.m_pGrabBagItem.QueryValue(output);
    else {
      const values = new (Sequence.specialize(propertyType, 48))();
      try {
        output.insert(values.getAddress(), ["Sequence", propertyType]);
      } finally {
        values.dispose();
      }
    }
  }
  /** Native setter ignores PutValue's Boolean result and always parses favourites. @param value - Actual input Any. @returns Nothing. */
  public SetGrabBagItem(value: Any): void {
    this.m_pGrabBagItem ??= new SfxGrabBagItem();
    this.m_pGrabBagItem.PutValue(value, 0);
    this.ParseFavourites();
  }
  /** Original qFormat extraction accepts long-compatible numeric values, leaves invalid existing keys unchanged and treats absent keys as false. @returns Nothing. */
  private ParseFavourites(): void {
    const value = (this.m_pGrabBagItem as SfxGrabBagItem).GetGrabBag().get("qFormat");
    if (value !== undefined) {
      const number: [number] = [0];
      if (value.extract(number, "sal_Int32")) this.SetFavourite(number[0] !== 0);
    } else this.SetFavourite(false);
  }

  /** Original document lookup belongs to every native format, through its actual attribute pool. @returns Document. */
  public GetDoc(): SwDoc {
    return this.attributeSet.GetDoc();
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

  /** Original independent auto-update flag query from format.hxx. @returns Flag. */
  IsAutoUpdateOnDirectFormat(): boolean {
    return this.m_bAutoUpdateOnDirectFormat;
  }
  /** Original flag setter, default true; this does not change IsAuto. @param value - Native new flag. @returns Nothing. */
  SetAutoUpdateOnDirectFormat(value = true): void {
    this.m_bAutoUpdateOnDirectFormat = value;
  }
  /** Original effective frame direction query. @param searchInParent - Native inheritance flag. @returns Borrowed direction item. */
  GetFrameDir(searchInParent = true): SvxFrameDirectionItem {
    return this.attributeSet.GetFrameDir(searchInParent);
  }
  /** Original generic opacity getter. @param searchInParent - Native inherited lookup. @returns Actual item. */
  GetOpaque(searchInParent = true): SvxOpaqueItem {
    return this.attributeSet.GetOpaque(searchInParent);
  }
  /** Reads the effective original fly split item. @param searchInParent - Whether inherited attributes participate. @returns Actual native split item. */
  GetFlySplit(searchInParent = true): SwFormatFlySplit {
    return this.attributeSet.Get(RES_FLY_SPLIT, searchInParent) as SwFormatFlySplit;
  }

  /** Reads the effective original fly containment item. @param searchInParent - Whether inherited attributes participate. @returns Actual native flow item. */
  GetFollowTextFlow(searchInParent = true): SwFormatFollowTextFlow {
    return this.attributeSet.Get(RES_FOLLOW_TEXT_FLOW, searchInParent) as SwFormatFollowTextFlow;
  }

  /** Reads the effective original wrap and overlap item. @param searchInParent - Whether inherited attributes participate. @returns Actual native wrap item. */
  GetWrapInfluenceOnObjPos(searchInParent = true): SwFormatWrapInfluenceOnObjPos {
    return this.attributeSet.Get(
      RES_WRAP_INFLUENCE_ON_OBJPOS,
      searchInParent,
    ) as SwFormatWrapInfluenceOnObjPos;
  }

  /** Original inline content getter inherited by frame formats. @param searchInParent - Native inherited lookup. @returns Actual content item. */
  GetContent(searchInParent = true): SwFormatContent {
    return this.attributeSet.GetContent(searchInParent);
  }
  /** Original inline generic format anchor getter inherited by frame formats. @param searchInParent - Native inherited lookup. @returns Actual typed item. */
  public GetAnchor(searchInParent = true): SwFormatAnchor {
    return this.attributeSet.GetAnchor(searchInParent);
  }
  /** Original inline generic format wrap getter inherited by frame formats. @param searchInParent - Native inherited lookup. @returns Actual typed item. */
  public GetSurround(searchInParent = true): SwFormatSurround {
    return this.attributeSet.GetSurround(searchInParent);
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
  /** Original DelDiffs intersects direct identities before a following SetFormatAttrSet, retaining source lock and broadcast behavior. @param set - Source identity set. @returns Nothing. */
  public DelDiffs(set: SfxItemSet): void {
    if (this.attributeSet.Count() === 0) return;
    if (this.IsModifyLocked()) {
      this.attributeSet.Intersect(set);
      return;
    }
    const oldSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges()),
      newSet = new SwAttrSet(this.attributeSet.GetPool(), this.attributeSet.GetRanges());
    if (this.attributeSet.Intersect_BC(set, oldSet, newSet) !== 0)
      ClientNotifyAttrChg(this, this.attributeSet, oldSet, newSet);
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
    this.m_pGrabBagItem?.Dispose();
    this.attributeSet.Dispose();
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
