/** @fileoverview Original SvxScriptSetItem from textitem.cxx, retaining script masks, item states, pool mapping and original-pool cloning. */
import { SfxSetItem } from "../../../svl/source/items/sitem";
import { SfxItemSet, SfxItemState } from "../../../svl/source/items/itemset";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import type { SfxPoolItem } from "../../../svl/source/items/poolitem";
import { SvtScriptType as Script } from "../../../svl/inc/languageoptions";

/** Original concrete nested item-set owner; native reference-output triples are represented by tuples. */
export class SvxScriptSetItem extends SfxSetItem {
  /** Creates the original font-slot range and expands all mapped script Which ranges. @param slot - Original Latin slot. @param pool - Actual native item pool. @returns Script set item. */
  constructor(slot: number, pool: SfxItemPool) {
    super(slot, new SfxItemSet(pool, [[10007, 10007]]));
    const [latin, asian, complex] = this.GetWhichIds();
    this.GetItemSet().MergeRange(latin, latin);
    this.GetItemSet().MergeRange(asian, asian);
    this.GetItemSet().MergeRange(complex, complex);
  }

  /** Native Clone ignores its pool argument and copies direct states into the original pool. @param pool - Unused native parameter. @returns Independent clone. */
  override Clone(pool?: SfxItemPool): SvxScriptSetItem {
    void pool;
    const result = new SvxScriptSetItem(this.Which(), this.GetItemSet().GetPool());
    result.GetItemSet().PutSet(this.GetItemSet(), false);
    return result;
  }

  /** Native SET/DEFAULT resolution ignores parent state during the state query. @param set - Source set. @param which - Native identity. @returns Selected value or undefined for other states. */
  static GetItemOfScriptSet(set: SfxItemSet, which: number): SfxPoolItem | undefined {
    const state = set.GetItemState(which, false);
    if (state === SfxItemState.SET) return set.GetItemIfSet(which, false);
    return state === SfxItemState.DEFAULT ? set.Get(which) : undefined;
  }

  /** Original script-mask dispatch compares payload equality across exactly the requested scripts; other masks fall back to Latin. @param slot - Latin slot. @param set - Source set. @param script - Original flags. @returns Uniform item or undefined. */
  static GetItemOfScript(slot: number, set: SfxItemSet, script: Script): SfxPoolItem | undefined {
    const [latin, asian, complex] = SvxScriptSetItem.GetWhichIds(slot, set);
    let ids: readonly number[];
    switch (script) {
      case Script.ASIAN:
        ids = [asian];
        break;
      case Script.COMPLEX:
        ids = [complex];
        break;
      case Script.LATIN | Script.ASIAN:
        ids = [latin, asian];
        break;
      case Script.LATIN | Script.COMPLEX:
        ids = [latin, complex];
        break;
      case Script.ASIAN | Script.COMPLEX:
        ids = [asian, complex];
        break;
      case Script.LATIN | Script.ASIAN | Script.COMPLEX:
        ids = [latin, asian, complex];
        break;
      default:
        ids = [latin];
        break;
    }
    const first = SvxScriptSetItem.GetItemOfScriptSet(set, ids[0] as number);
    if (first === undefined) return undefined;
    const values: SfxPoolItem[] = [];
    for (const which of ids.slice(1)) {
      const item = SvxScriptSetItem.GetItemOfScriptSet(set, which);
      if (item === undefined) return undefined;
      values.push(item);
    }
    return values.every(
      /** Native multi-script comparison happens after all requested values resolve. @param item - Borrowed script value. @returns Payload equality. */
      (item) => first.equals(item),
    )
      ? first
      : undefined;
  }

  /** Original instance script lookup. @param script - Requested mask. @returns Uniform value or undefined. */
  GetItemOfScript(script: Script): SfxPoolItem | undefined {
    return SvxScriptSetItem.GetItemOfScript(this.Which(), this.GetItemSet(), script);
  }

  /** Copies the supplied payload with each selected script's actual Which identity. @param script - Native mask. @param item - Borrowed source value. @returns Nothing. */
  PutItemForScriptType(script: Script, item: SfxPoolItem): void {
    const ids = this.GetWhichIds();
    for (const [index, flag] of [Script.LATIN, Script.ASIAN, Script.COMPLEX].entries())
      if ((script & flag) !== 0) {
        const copy = item.Clone() as SfxPoolItem;
        copy.SetWhich(ids[index] as number);
        this.GetItemSet().Put(copy);
      }
  }

  /** Maps native slot triples through the actual primary/secondary item-pool graph. @param slot - Latin slot. @param set - Source pool owner. @returns Latin,Asian,complex Which identities. */
  static GetWhichIds(slot: number, set: SfxItemSet): [number, number, number] {
    return SvxScriptSetItem.GetSlotIds(slot).map(
      /** Resolves one source slot. @param id - Slot identity. @returns Actual Which. */
      (id) => set.GetPool().GetWhichIDFromSlotID(id),
    ) as [number, number, number];
  }

  /** Original instance Which triple. @returns Latin,Asian,complex identities. */
  GetWhichIds(): [number, number, number] {
    return SvxScriptSetItem.GetWhichIds(this.Which(), this.GetItemSet());
  }

  /** Original seven slot cases; unsupported slots retain the source font fallback. @param slot - Source slot. @returns Latin,Asian,complex slot identities. */
  static GetSlotIds(slot: number): [number, number, number] {
    switch (slot) {
      case 10015:
        return [10015, 10888, 10893];
      case 10009:
        return [10009, 10891, 10896];
      case 10008:
        return [10008, 10890, 10895];
      case 10020:
        return [10020, 10889, 10894];
      case 10010:
        return [10010, 10010, 10010];
      case 10013:
        return [10013, 10013, 10013];
      default:
        return [10007, 10887, 10892];
    }
  }
}
