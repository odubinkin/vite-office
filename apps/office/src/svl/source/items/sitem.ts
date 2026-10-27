/** @fileoverview Original SfxSetItem value ownership from sitem.cxx. Both native initial-set overloads copy their named input. */
import { SfxPoolItem, SfxItemPresentation } from "../../inc/poolitem";
import { SfxItemSet } from "./itemset";
import type { SfxItemPool } from "./itempool";
import type { MapUnit } from "../../../tools/inc/mapunit";
import type { OUString } from "../../../sal/inc/rtl/ustring";
/** Original abstract item containing a base SfxItemSet by value, with ordinary JS ownership. */
export abstract class SfxSetItem extends SfxPoolItem {
  private readonly maSet: SfxItemSet;
  /** Original initial-set and pool-targeted copy constructors. Native rvalue input also copies, so no JS move marker or source reset exists. @param args - Which/base-set source or set-item/pool copy source. @returns Set item. */
  constructor(
    ...args:
      | [which: number, set: SfxItemSet]
      | [source: Readonly<SfxSetItem>, pool?: SfxItemPool | undefined]
  ) {
    const source = args[0];
    super(typeof source === "number" ? source : source.Which());
    this.maSet =
      typeof source === "number"
        ? new SfxItemSet(args[1] as SfxItemSet)
        : source.GetItemSet().CloneAsValue(true, args[1] as SfxItemPool | undefined);
    this.setIsSetItem();
  }
  /** Original access to the actual contained set. @returns Owned mutable set, shared by const/nonconst source overloads. */
  public GetItemSet(): SfxItemSet {
    return this.maSet;
  }
  /** Native contained-set destructor. @returns Nothing. */
  public override Dispose(): void {
    this.maSet.Dispose();
  }
  /** Original concrete-type equality delegates to nested operator==, comparing pool and parent identities. Which itself does not participate. @param other - Candidate item. @returns Native payload equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SfxSetItem &&
      other.constructor === this.constructor &&
      this.maSet.Equals(other.maSet, true)
    );
  }
  /** Original pure virtual pool-targeted cloning contract. @param pool - Optional target pool. @returns Concrete independent set item. */
  public abstract override Clone(pool?: SfxItemPool): SfxSetItem;
  /** Original unsupported base presentation leaves text unchanged. IntlWrapper is an erased unused argument, without a fabricated service. @param presentation - Ignored degree. @param coreMetric - Ignored unit. @param presentationMetric - Ignored unit. @param text - Unchanged real OUString. @param intl - Unused original service argument. @returns False. */
  public GetPresentation(
    presentation: SfxItemPresentation,
    coreMetric: MapUnit,
    presentationMetric: MapUnit,
    text: OUString,
    intl: unknown,
  ): boolean {
    void presentation;
    void coreMetric;
    void presentationMetric;
    void text;
    void intl;
    return false;
  }
}
