/** @fileoverview Ports pinned ndtxt.cxx direct list attribute pre/post handlers for the registered Writer items. */
import { SvxNumType, SwNumRule } from "../doc/number";

import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SfxStringItem } from "../../../../svl/source/items/stritem";
import type { SfxInt16Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import {
  RES_PARATR_NUMRULE,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_LIST_ISCOUNTED,
  RES_PARATR_OUTLINELEVEL,
} from "../../../inc/hintids";
import type { SwNumRuleItem } from "../para/paratr";
import type { SwTextNode } from "./ndtxt";

/** Retains independent native set flags across raw item mutation. */
export class HandleSetAttrAtTextNode {
  private add = false;
  private level = false;
  private restart = false;
  private count = false;
  private outline = false;
  /** Executes source pre-mutation ordering. @param node - Mutated paragraph. @param items - Single item or direct batch. @returns Handler. */
  public constructor(
    private readonly node: SwTextNode,
    items: SfxPoolItem | SfxItemSet,
  ) {
    if (!(items instanceof SfxItemSet)) this.init(items);
    else
      for (const which of [
        RES_PARATR_NUMRULE,
        RES_PARATR_LIST_ID,
        RES_PARATR_LIST_LEVEL,
        RES_PARATR_LIST_ISRESTART,
        RES_PARATR_LIST_RESTARTVALUE,
        RES_PARATR_LIST_ISCOUNTED,
        RES_PARATR_OUTLINELEVEL,
      ]) {
        const item = items.GetItemIfSet(which, false);
        if (item !== undefined) this.init(item);
      }
  }
  /** Records one native set branch in source order. @param item - Direct item. @returns Nothing. */
  private init(item: SfxPoolItem): void {
    const n = this.node;
    switch (item.Which()) {
      case RES_PARATR_NUMRULE:
        n.RemoveFromList();
        if ((item as SwNumRuleItem).GetValue().length !== 0) {
          this.add = true;
          n.ResetEmptyListStyleDueToResetOutlineLevelAttr();
        }
        break;
      case RES_PARATR_LIST_ID:
        if ((item as SfxStringItem).GetValue() !== n.GetListId()) {
          this.add = true;
          if (n.IsInList()) n.RemoveFromList();
        }
        break;
      case RES_PARATR_LIST_LEVEL:
        this.level = (item as SfxInt16Item).GetValue() !== n.GetAttrListLevel();
        break;
      case RES_PARATR_LIST_ISRESTART:
        this.restart = (item as SfxBoolItem).GetValue() !== n.IsListRestart();
        break;
      case RES_PARATR_LIST_RESTARTVALUE:
        this.restart ||=
          !n.HasAttrListRestartValue() ||
          (item as SfxInt16Item).GetValue() !== n.GetAttrListRestartValue();
        break;
      case RES_PARATR_LIST_ISCOUNTED:
        this.count = (item as SfxBoolItem).GetValue() !== n.IsCountedInList();
        break;
      case RES_PARATR_OUTLINELEVEL:
        this.outline = (item as SfxUInt16Item).GetValue() !== n.GetAttrOutlineLevel();
        break;
    }
  }
  /** Executes the native destructor after restoring the caller's mutation guard. @returns Nothing. */
  public finish(): void {
    const n = this.node;
    if (this.add) {
      if (n.GetNumRule() !== undefined) n.AddToList();
    } else {
      if (this.level && n.IsInList())
        n.DoNum(
          /** Reparents the shown record. @param record - Owned record. @returns Nothing. */
          (record) => record.SetLevelInListTree(n.GetAttrListLevel(), n.GetDoc()),
        );
      if (this.restart && n.IsInList())
        n.DoNum(
          /** Invalidates and notifies the affected native prefix. @param record - Owned record. @returns Nothing. */
          (record) => {
            record.InvalidateMe();
            record.NotifyInvalidSiblings(n.GetDoc());
          },
        );
      if (this.count && n.IsInList() && HasNumberingWhichNeedsLayoutUpdate(n))
        n.DoNum(
          /** Refreshes the complete enumeration tree. @param record - Owned record. @returns Nothing. */
          (record) => record.InvalidateAndNotifyTree(n.GetDoc()),
        );
    }
    if (!this.outline) return;
    n.GetNodes().UpdateOutlineNode(n);
    if (n.GetAttrOutlineLevel() === 0) n.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    else if (n.GetSwAttrSet().GetItemState(RES_PARATR_NUMRULE) !== SfxItemState.SET)
      n.SetEmptyListStyleDueToSetOutlineLevelAttr();
  }
}

/** Retains source reset flags and removal decisions across raw item clearing. */
export class HandleResetAttrAtTextNode {
  private styleOrId = false;
  private level = false;
  private restart = false;
  private count = false;
  private remove = false;
  /** Executes range/vector/all pre-reset ordering. @param node - Mutated paragraph. @param which - Absent for all, range start or ordered vector. @param end - Inclusive range end. @returns Handler. */
  public constructor(
    private readonly node: SwTextNode,
    which?: number | readonly number[],
    end = 0,
  ) {
    if (which === undefined) {
      this.styleOrId = true;
      if (node.IsInList()) node.RemoveFromList();
      node.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    } else {
      if (typeof which === "number")
        for (let id = which; id <= Math.max(which, end); id++) this.init(id);
      else for (const id of which) this.init(id);
      if (this.remove && node.IsInList()) node.RemoveFromList();
    }
  }
  /** Executes one native reset dependency branch. @param which - Reset WhichId. @returns Nothing. */
  private init(which: number): void {
    const n = this.node;
    if (which === RES_PARATR_NUMRULE) {
      this.remove ||= n.GetNumRule() !== undefined;
      this.styleOrId = true;
    } else if (which === RES_PARATR_LIST_ID) {
      this.remove ||=
        n.GetpSwAttrSet()?.GetItemState(RES_PARATR_LIST_ID, false) === SfxItemState.SET;
      this.styleOrId = true;
    } else if (which === RES_PARATR_OUTLINELEVEL) n.ResetEmptyListStyleDueToResetOutlineLevelAttr();
    // RES_BACKGROUND/fill attributes are outside the registered item profile.
    if (!this.remove) {
      this.level ||= which === RES_PARATR_LIST_LEVEL && n.HasAttrListLevel();
      this.restart ||=
        (which === RES_PARATR_LIST_ISRESTART && n.IsListRestart()) ||
        (which === RES_PARATR_LIST_RESTARTVALUE && n.HasAttrListRestartValue());
      this.count ||= which === RES_PARATR_LIST_ISCOUNTED && !n.IsCountedInList();
    }
  }
  /** Executes source reset destructor decisions after restoring the guard. @returns Nothing. */
  public finish(): void {
    const n = this.node;
    if (this.styleOrId && !n.IsInList()) {
      if (n.GetNumRule() !== undefined && n.GetListId().length !== 0) {
        const style = n.GetTextFormatColl();
        if (
          !n.HasAttrListLevel() &&
          n.GetNumRule()?.GetName() === SwNumRule.GetOutlineRuleName() &&
          style.IsAssignedToListLevelOfOutlineStyle()
        ) {
          const level = style.GetAssignedOutlineStyleLevel();
          if (level >= 0 && level < 10) n.SetAttrListLevel(level);
        }
        n.AddToList();
      } else if (
        n.GetpSwAttrSet() !== undefined &&
        (n.GetAttr(RES_PARATR_OUTLINELEVEL, false) as SfxUInt16Item).GetValue() > 0
      )
        n.SetEmptyListStyleDueToSetOutlineLevelAttr();
    }
    if (!n.IsInList()) return;
    if (this.level)
      n.DoNum(
        /** Restores the effective native depth. @param record - Owned record. @returns Nothing. */
        (record) => record.SetLevelInListTree(n.GetAttrListLevel(), n.GetDoc()),
      );
    if (this.restart)
      n.DoNum(
        /** Refreshes the affected native prefix. @param record - Owned record. @returns Nothing. */
        (record) => {
          record.InvalidateMe();
          record.NotifyInvalidSiblings(n.GetDoc());
        },
      );
    if (this.count)
      n.DoNum(
        /** Restores counting throughout the native tree. @param record - Owned record. @returns Nothing. */
        (record) => record.InvalidateAndNotifyTree(n.GetDoc()),
      );
  }
}

/** Reads source enumeration repaint policy for the existing Arabic/bullet formats. @param node - Paragraph. @returns Whether counting changes need tree notification. */
export function HasNumberingWhichNeedsLayoutUpdate(node: SwTextNode): boolean {
  const rule = node.GetNum()?.GetNumRule();
  return (
    rule !== undefined &&
    rule.Get(node.GetAttrListLevel()).GetNumberingType() === SvxNumType.SVX_NUM_ARABIC
  );
}

/** Reads the native normal-document outline policy. @param node - Paragraph. @returns Outline membership state. */
export function IsOutlineAtTextNode(node: SwTextNode): boolean {
  const index = node.GetNodes().indexOfOrUndefined(node);
  const end = node.GetNodes().GetEndOfRedlines();
  const inRedlines =
    index !== undefined && index >= end.StartOfSectionNode().GetIndex() && index <= end.GetIndex();
  return (
    (node.GetAttrOutlineLevel() > 0 || node.GetNum()?.GetNumRule()?.IsOutlineRule() === true) &&
    !inRedlines
  );
}
